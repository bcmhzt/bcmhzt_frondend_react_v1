import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
// import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
// import { buildStorageUrl } from '../../utility/GetUseImage';
// import { convertUtcToTimeZone } from '../../utility/GetCommonFunctions';
import type { MatchUser, MatchListResponse } from '../../types/match';
import { generateChatRoomId } from '../../utility/Chat';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  // addDoc,
  // updateDoc,
  serverTimestamp,
  // Timestamp,
} from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import MessageRoom2 from './MessageRoom2';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/messages/MessageList2.tsx:xx] debug:', debug);
}

const fetchMatchedUsers = async ({
  pageParam,
  token,
}: {
  pageParam?: unknown;
  token: string;
}) => {
  const page = typeof pageParam === 'number' ? pageParam : 1;
  const res = await axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/v1/get/matched?page=${page}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log('[src/components/messages/MessageList2.tsx:44] page:', page);
  console.log(
    '[src/components/messages/MessageList2.tsx:45] response:',
    res.data
  );
  return res.data as MatchListResponse;
};

interface ChatRoomDisplayData {
  user: MatchUser;
  chatRoomId: string;
  latestMessage: any;
  updatedAt: number;
}

const MessageList2: React.FC = () => {
  const { token, currentUserProfile } = useAuth();
  const [chatDataList, setChatDataList] = useState<ChatRoomDisplayData[]>([]);
  const now = new Date(); // クライアント時刻を取得
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<MatchListResponse, Error>({
    queryKey: ['matchedUsers', token],
    queryFn: ({ pageParam }) => {
      if (!token) return Promise.reject(new Error('Token is missing'));
      return fetchMatchedUsers({ pageParam, token });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    enabled: !!token,
  });

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUserProfile?.user_profile?.uid || !data) return;

      const uid = currentUserProfile.user_profile.uid;
      const nickname = currentUserProfile.user_profile.nickname;
      const allUsers: MatchUser[] = data.pages.flatMap((p) => p.data.data);
      const results: ChatRoomDisplayData[] = [];

      /** ChatRoomの作成、なければ作成・あればスキップ */
      for (const user of allUsers) {
        if (!user.uid) continue;

        const chatRoomId = await generateChatRoomId([uid, user.uid]);
        const chatDocRef = doc(firestore, 'chats', chatRoomId);
        let chatSnap = await getDoc(chatDocRef);

        if (!chatSnap.exists()) {
          await setDoc(chatDocRef, {
            members: [uid, user.uid].sort(),
            type: 'private',
            is_closed: false,
            typing: null,
            display_names: {
              [uid]: user.nickname,
              [user.uid]: nickname,
            },
            created_at: serverTimestamp(),
            // updated_at: serverTimestamp(),
            updated_at: now, // クライアント時刻を使用
          });
          chatSnap = await getDoc(chatDocRef); // 再取得
        }

        /* Chat Roomリストに表示する最新メッセージを取得 */
        const msgQuery = query(
          collection(chatDocRef, 'messages'),
          orderBy('created_at', 'desc'),
          limit(1)
        );
        const msgSnap = await getDocs(msgQuery);
        const latestMessage = msgSnap.docs[0]?.data() ?? null;

        /* Chat Roomを最新順で並べ替え */
        results.push({
          user,
          chatRoomId,
          latestMessage,
          updatedAt: chatSnap.data()?.updated_at?.toMillis?.() || 0,
        });
      }

      results.sort((a, b) => b.updatedAt - a.updatedAt);
      setChatDataList(results);
    };

    fetchChats();
  }, [data, currentUserProfile]);

  useEffect(() => {
    if (!data) return;

    console.log(
      '[src/components/messages/MessageList2.tsx:152] ▼▼▼ useInfiniteQuery data ▼▼▼'
    );
    console.log(JSON.stringify(data, null, 2));
    console.log(
      '[src/components/messages/MessageList2.tsx:152] ▲▲▲ useInfiniteQuery data ▲▲▲'
    );

    data.pages.forEach((page, i) => {
      console.log(`[Page ${i + 1}]`, page);
    });
  }, [data]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node) return;
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  if (!token || !currentUserProfile?.user_profile?.uid) {
    return <div>ユーザー情報を取得中...</div>;
  }

  if (isLoading) return <div>読み込み中...</div>;
  if (isError) return <div>エラー: {error.message}</div>;

  return (
    <ul className="chat-room-list">
      {chatDataList.map((data, i) => {
        const { user, chatRoomId, latestMessage } = data;
        const isLast = i === chatDataList.length - 1;

        return (
          <li
            key={user.uid}
            ref={isLast ? lastItemRef : null}
            className="chat-room-item"
          >
            {/* <pre>{JSON.stringify(chatDataList, null, 2)}</pre> */}

            <MessageRoom2
              item={user}
              chatRoomId={chatRoomId}
              latestMessage={latestMessage}
              onClose={() => {
                setChatDataList((prev) =>
                  prev.filter((chat) => chat.chatRoomId !== chatRoomId)
                );
              }}
            />
          </li>
        );
      })}
      {isFetchingNextPage && <li className="loading">さらに読み込み中…</li>}
    </ul>
  );
};

export default MessageList2;

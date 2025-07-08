/** 0c8e4e89: NewMatchedChatListComponent.tsx */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
// import { Link } from 'react-router-dom';
// import { buildStorageUrl } from '../../utility/GetUseImage';
import { firestore } from '../../firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useInfiniteQuery } from '@tanstack/react-query';
import { generateChatRoomId } from '../../utility/Chat';
import type { MatchUser, MatchListResponse } from '../../types/match';
import ChatRoomCard from './ChatRoomCard';
// import { ThreeDotsVertical, X, SendFill, Image } from 'react-bootstrap-icons';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/messages/NewMatchedChatListComponent.tsx:xx] debug:',
    debug
  );
}

/**
 * 今後の展望（任意）
 * matchedUsers が増えてくると、generateChatRoomId → Firestore getDoc → getDocs(messages) のループが重くなるため、一括バッチ化・先読み最適化も検討対象です。
 * 例えば Promise.allSettled() で並列取得したり、事前に既存チャットルームのUIDをキャッシュする方式に切り替えるとパフォーマンス向上が期待できます。
 *
 */

const fetchMatchedUsers = async ({
  pageParam = 1,
  token,
}: {
  pageParam?: number;
  token: string;
}) => {
  const res = await axios.post<MatchListResponse>(
    `${process.env.REACT_APP_API_ENDPOINT}/v1/get/matched?page=${pageParam}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(
    '[src/components/messages/NewMatchedChatListComponent.tsx:48] res.data:',
    res.data
  );
  return res.data;
};

const NewMatchedChatListComponent: React.FC = () => {
  const { token, currentUserProfile } = useAuth();
  const [newChatRooms, setNewChatRooms] = useState<
    { user: MatchUser; chatRoomId: string; createdAt: number }[]
  >([]);
  // const [showToolModal, setShowToolModal] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<
      MatchListResponse,
      Error,
      MatchListResponse,
      [string, string | undefined],
      number
    >({
      queryKey: ['matchedUsers', token ?? undefined],
      queryFn: ({ pageParam = 1 }) => {
        if (!token) throw new Error('Token is missing');
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
    if (debug && data) {
      console.log(
        '[src/components/messages/NewMatchedChatListComponent.tsx:84] data.pages:',
        (data as any).pages
      );
    }
  }, [data]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!token || !currentUserProfile?.user_profile?.uid || !data) return;

      const uid = currentUserProfile.user_profile.uid;
      const nickname = currentUserProfile.user_profile.nickname;
      const matchedUsers =
        'pages' in data && Array.isArray((data as any).pages)
          ? (data as any).pages.flatMap((p: MatchListResponse) => p.data.data)
          : [];

      const results: {
        user: MatchUser;
        chatRoomId: string;
        createdAt: number;
      }[] = [];

      for (const user of matchedUsers) {
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
            updated_at: serverTimestamp(),
          });
          chatSnap = await getDoc(chatDocRef);
        }

        const msgQuery = query(
          collection(chatDocRef, 'messages'),
          orderBy('created_at', 'desc'),
          limit(1)
        );
        const msgSnap = await getDocs(msgQuery);
        const hasMessages = msgSnap.size > 0;

        if (!hasMessages) {
          const createdAt = chatSnap.data()?.created_at?.toMillis?.() ?? 0;
          results.push({ user, chatRoomId, createdAt });
        }
      }

      results.sort((a, b) => b.createdAt - a.createdAt);
      setNewChatRooms(results);
    };

    fetchChats();
  }, [token, currentUserProfile, data]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node || !hasNextPage || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  if (!token || !currentUserProfile?.user_profile?.uid) {
    return <div>ユーザー情報を取得中...</div>;
  }

  return (
    <ul className="chat-room-list">
      {/* <li className="chat-room-item">
        <div className="message-room">
          <div className="d-flex flex-row">
            <div className="avatar-area">
              <Link to="/member/a8c-6207400e">
                <img
                  src="/assets/images/dummy/dummy_avatar.png"
                  className="avatar-36"
                />
              </Link>
            </div>
            <div className="nickname-area">
              バクムーツ管理人（local)
              <span className="bcuid"> @ a8c-6207400e</span>
            </div>
            <div className="tool-area" style={{ marginLeft: 'auto' }}>
              <ThreeDotsVertical
                style={{
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'rgb(51, 51, 51)',
                }}
              />
            </div>
          </div>
          <div className="chat-preview">
            <span>no mesage yet ...</span>
          </div>
        </div>
      </li> */}
      {newChatRooms.map(({ user, chatRoomId }, index) => {
        const isLast = index === newChatRooms.length - 1;
        return (
          <>
            <li
              id={`chat-room-${index}`}
              key={user.uid}
              className="chat-room-item"
              ref={isLast ? lastItemRef : null}
            >
              <ChatRoomCard user={user} chatRoomId={chatRoomId} />
              {/* <div className="message-room">
                <div className="d-flex flex-row">
                  <div className="avatar-area">
                    <Link to={`/member/${user.bcuid}`}>
                      <img
                        src={
                          user.profile_images
                            ? buildStorageUrl(
                                process.env
                                  .REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '',
                                user.profile_images,
                                '_small'
                              )
                            : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                        }
                        className="avatar-36"
                      />
                    </Link>
                  </div>
                  <div className="nickname-area">
                    {user.nickname || 'Unknown User'}
                    <span className="bcuid"> @ {user.bcuid}</span>
                  </div>
                  <div className="tool-area" style={{ marginLeft: 'auto' }}>
                    <ThreeDotsVertical
                      style={{
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: 'rgb(51, 51, 51)',
                      }}
                      onClick={() => setShowToolModal(true)}
                    />
                  </div>
                </div>
                <div className="chat-preview">
                  <span>no mesage yet ...</span>
                </div>
              </div> */}
            </li>
            {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
            {/* <li
              id={`chat-room-${index}`}
              key={user.uid}
              className="chat-room-item"
              ref={isLast ? lastItemRef : null}
              style={{ height: '200px', display: 'flex', alignItems: 'center' }}
            >
              <div style={{ flexGrow: 1 }}></div>
              <ChatRoomCard user={user} chatRoomId={chatRoomId} />
            </li> */}
          </>
        );
      })}
      {isFetchingNextPage && <li className="loading">さらに読み込み中...</li>}
    </ul>
  );
};

export default NewMatchedChatListComponent;

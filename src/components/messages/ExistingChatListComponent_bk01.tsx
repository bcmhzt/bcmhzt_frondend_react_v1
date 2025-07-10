/** fca76db0 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import ChatRoomCard from './ChatRoomCard';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/messages/ExistingChatListComponent.tsx:xx] ‼️debug:',
    debug
  );
}

const ExistingChatListComponent: React.FC = () => {
  const { currentUserProfile, token } = useAuth();
  const [chatRooms, setChatRooms] = useState<DocumentData[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [hasMore, setHasMore] = useState(true);
  const [opponentProfiles, setOpponentProfiles] = useState<Record<string, any>>(
    {}
  );
  const loadingRef = useRef<HTMLLIElement | null>(null);
  const loadingInProgress = useRef(false);

  /**
   * Firestoreからチャットルームを取得
   * collection: chats
   *
   * - ログインユーザーを取得: currentUserProfile.user_profile.uid
   * - チャットルームのメンバーにログインユーザーのUIDが含まれるものを取得
   * - 更新日時で降順にソート
   */
  const fetchChatRooms = useCallback(async () => {
    if (
      !currentUserProfile?.user_profile?.uid ||
      !hasMore ||
      loadingInProgress.current
    )
      return;

    loadingInProgress.current = true;
    const uid = currentUserProfile.user_profile.uid;

    let q;
    if (lastVisible) {
      const lastUpdatedAt = lastVisible?.get('updated_at');
      const lastId = lastVisible?.id;

      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:66] ▶️ lastUpdatedAt:',
        lastUpdatedAt
      );
      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:69] 🚩 ページネーション用 updated_at:',
        lastUpdatedAt?.toDate()
      );
      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:70] 🚩 ページネーション用 id:',
        lastId
      );
      // console.log(
      //   '[src/components/messages/ExistingChatListComponent.tsx:50 💬] 🔁 追加取得 startAfter:',
      //   lastVisible.id
      // );
      q = query(
        collection(firestore, 'chats'),
        where('members', 'array-contains', uid),
        orderBy('updated_at', 'asc'),
        orderBy('__name__'),
        // startAfter(lastVisible),
        startAfter(lastUpdatedAt, lastId),
        limit(10)
      );
    } else {
      // console.log(
      //   '[src/components/messages/ExistingChatListComponent.tsx:60 💬] 🔐 初回取得'
      // );
      q = query(
        collection(firestore, 'chats'),
        where('members', 'array-contains', uid),
        orderBy('updated_at', 'asc'),
        orderBy('__name__'),
        limit(10)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    if (docs.length < 10) setHasMore(false);
    if (docs.length > 0) setLastVisible(docs[docs.length - 1]);

    setChatRooms((prev) => {
      const existingIds = new Set(prev.map((doc) => doc.id));
      const newUniqueDocs = docs.filter((doc) => !existingIds.has(doc.id));

      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:98] 前回のchatRooms:',
        prev.map((d) => d.id)
      );
      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:102] 今回の取得:',
        docs.map((d) => d.id)
      );
      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:106] 新規としてフィルタされた:',
        newUniqueDocs.map((d) => d.id)
      );

      if (newUniqueDocs.length > 0) {
        console.log(
          '[src/components/messages/ExistingChatListComponent.tsx:112] ⚠️新規チャット追加:',
          newUniqueDocs.map((d) => d.id)
        );
      }

      // 🔄 すでにあるチャットルーム + 新しいものを結合
      const combined = [...prev, ...newUniqueDocs];

      // ✅ IDで重複排除（順序維持）
      const uniqueMap = new Map<string, QueryDocumentSnapshot<DocumentData>>();
      for (const doc of combined) {
        if (doc instanceof QueryDocumentSnapshot) {
          uniqueMap.set(doc.id, doc); // 最後に出現したdocが残る
        }
      }

      return Array.from(uniqueMap.values());
    });

    loadingInProgress.current = false;
  }, [currentUserProfile, lastVisible, hasMore]);

  useEffect(() => {
    // fetchChatRooms();
    if (chatRooms.length === 10) {
      fetchChatRooms();
    }
  }, [fetchChatRooms]);

  useEffect(() => {
    if (!loadingRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchChatRooms();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loadingRef.current);

    return () => observer.disconnect();
  }, [loadingRef, hasMore, fetchChatRooms]);

  /**
   * チャットルームから相手のuidを取得し、
   * そのuidに対応するプロフィールをAPIから取得してopponentProfilesに追加
   */
  useEffect(() => {
    const uid = currentUserProfile?.user_profile?.uid;
    // console.log(
    //   '[src/components/messages/ExistingChatListComponent.tsx:122] 👤 my uid:',
    //   uid
    // );
    if (!uid) return;

    /* チャットルームから相手のuidを取得 */
    const uidsToFetch = chatRooms
      .map((doc) => {
        const members = doc.data().members;
        return members.find((memberUid: string) => memberUid !== uid);
      })
      .filter((uid): uid is string => !!uid && !opponentProfiles[uid]);

    /* 相手のuidからプルフィールの詳細を取得 */
    const fetchProfiles = async () => {
      // console.log(
      //   '[src/components/messages/ExistingChatListComponent.tsx:128] 👤 取得対象UID一覧:',
      //   uidsToFetch
      // );
      // console.log(
      //   '[src/components/messages/ExistingChatListComponent.tsx:132] 👤 process.env.REACT_APP_API_ENDPOINT:',
      //   process.env.REACT_APP_API_ENDPOINT
      // );
      const promises = uidsToFetch.map((uid) =>
        axios
          .post(
            `${process.env.REACT_APP_API_ENDPOINT}/v1/get/member/uid/${uid}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            // console.log(
            //   `[src/components/messages/ExistingChatListComponent.tsx:139 📥] ${uid} のプロフィール取得成功:`,
            //   res
            // );
            return { uid, ...res.data };
          })
          .catch((e) => {
            console.error(
              '[src/components/messages/ExistingChatListComponent.tsx:146] ❌ Error fetching profile for uid:',
              uid,
              e
            );
            return null;
          })
      );

      const results = await Promise.all(promises);
      // console.log(
      //   '[src/components/messages/ExistingChatListComponent.tsx:156] 📦 Fetching results:',
      //   results
      // );
      const newProfiles = results.reduce(
        (acc, profile) => {
          if (profile && profile.uid) {
            acc[profile.uid] = profile;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      // console.log(
      //   '[src/components/messages/ExistingChatListComponent.tsx:159 📁] 追加するプロフィール一覧:',
      //   newProfiles
      // );
      setOpponentProfiles((prev) => ({ ...prev, ...newProfiles }));
    };

    if (uidsToFetch.length > 0) fetchProfiles();

    // opponentProfilesを依存配列に入れると無限ループになるため除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRooms, currentUserProfile, token]);

  return (
    <ul className="chat-room-list">
      {chatRooms.map((doc) => {
        const chat = doc.data();
        const chatRoomId = doc.id;
        const opponentUid = chat.members.find(
          (uid: string) => uid !== currentUserProfile?.user_profile?.uid
        );
        const opponent = opponentUid ? opponentProfiles[opponentUid] : null;

        return (
          <>
            {/* <pre>{JSON.stringify(opponent?.data?.member, null, 2)}</pre> */}
            <li key={doc.id} className="chat-room-item">
              {opponent?.data?.member ? (
                <li key={chatRoomId} className="chat-room-item">
                  <ChatRoomCard
                    user={opponent.data.member}
                    chatRoomId={chatRoomId}
                  />
                </li>
              ) : null}
            </li>
          </>
        );
      })}
      {hasMore && (
        <li ref={loadingRef} className="loading">
          さらに読み込み中...
        </li>
      )}
    </ul>
  );
};

export default ExistingChatListComponent;

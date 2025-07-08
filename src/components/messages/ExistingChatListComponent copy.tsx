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
      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:50 💬] 🔁 追加取得 startAfter:',
        lastVisible.id
      );
      q = query(
        collection(firestore, 'chats'),
        where('members', 'array-contains', uid),
        orderBy('updated_at', 'desc'),
        orderBy('__name__'),
        startAfter(lastVisible),
        limit(10)
      );
    } else {
      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:60 💬] 🔐 初回取得'
      );
      q = query(
        collection(firestore, 'chats'),
        where('members', 'array-contains', uid),
        orderBy('updated_at', 'desc'),
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
      const newDocs = docs.filter((doc) => !existingIds.has(doc.id));
      return [...prev, ...newDocs];
    });

    loadingInProgress.current = false;
  }, [currentUserProfile, lastVisible, hasMore]);

  useEffect(() => {
    fetchChatRooms();
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

  useEffect(() => {
    const uid = currentUserProfile?.user_profile?.uid;
    console.log(
      '[src/components/messages/ExistingChatListComponent.tsx:122] 👤 my uid:',
      uid
    );
    if (!uid) return;

    const uidsToFetch = chatRooms
      .map((doc) => {
        const members = doc.data().members;
        return members.find((memberUid: string) => memberUid !== uid);
      })
      .filter((uid): uid is string => !!uid && !opponentProfiles[uid]);

    const fetchProfiles = async () => {
      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:128] 👤 取得対象UID一覧:',
        uidsToFetch
      );
      const promises = uidsToFetch.map((uid) =>
        axios
          .post(
            `${process.env.REACT_APP_API_ENDPOINT}/v1/get/member/uid/${uid}`,
            { token: token }
          )
          .then((res) => {
            console.log(
              `[src/components/messages/ExistingChatListComponent.tsx:139 📥] ${uid} のプロフィール取得成功:`,
              res.data
            );
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
      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:156] 📦 Fetching results:',
        results
      );
      const newProfiles = results.reduce(
        (acc, profile) => {
          if (profile && profile.uid) {
            acc[profile.uid] = profile;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      console.log(
        '[src/components/messages/ExistingChatListComponent.tsx:159 📁] 追加するプロフィール一覧:',
        newProfiles
      );
      setOpponentProfiles((prev) => ({ ...prev, ...newProfiles }));
    };

    if (uidsToFetch.length > 0) fetchProfiles();
  }, [chatRooms, currentUserProfile]);

  return (
    <ul className="chat-room-list">
      {chatRooms.map((doc) => {
        const chat = doc.data();
        const opponentUid = chat.members.find(
          (uid: string) => uid !== currentUserProfile?.user_profile?.uid
        );
        const opponent = opponentUid ? opponentProfiles[opponentUid] : null;

        return (
          <li key={doc.id} className="chat-room-item">
            <pre>{JSON.stringify(opponent, null, 2)}</pre>
            <div className="message-room">
              <div className="d-flex flex-row">
                <div className="avatar-area">
                  <img
                    src={
                      opponent?.profile_image ||
                      '/assets/images/dummy/dummy_avatar.png'
                    }
                    className="avatar-36"
                    alt="avatar"
                  />
                </div>
                <div className="nickname-area">
                  {opponent?.nickname || '読み込み中...'}
                  <span className="bcuid"> @ {doc.id}</span>
                </div>
              </div>
              <div className="chat-preview">
                <span>
                  updated:{' '}
                  {chat.updated_at?.toDate?.().toLocaleString?.() ?? 'N/A'}
                </span>
              </div>
            </div>
          </li>
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

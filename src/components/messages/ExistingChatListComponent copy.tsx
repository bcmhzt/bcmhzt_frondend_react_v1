/** fca76db0 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const { currentUserProfile } = useAuth();
  const [chatRooms, setChatRooms] = useState<DocumentData[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<HTMLLIElement | null>(null);

  const fetchChatRooms = useCallback(async () => {
    if (!currentUserProfile?.user_profile?.uid || !hasMore) return;

    const uid = currentUserProfile.user_profile.uid;
    let q = query(
      collection(firestore, 'chats'),
      where('members', 'array-contains', uid),
      orderBy('updated_at', 'desc'),
      limit(10)
    );

    if (lastVisible) {
      q = query(
        collection(firestore, 'chats'),
        where('members', 'array-contains', uid),
        orderBy('updated_at', 'desc'),
        startAfter(lastVisible),
        limit(10)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    if (docs.length < 10) setHasMore(false);
    if (docs.length > 0) setLastVisible(docs[docs.length - 1]);
    setChatRooms((prev) => [...prev, ...docs]);
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

  return (
    <ul className="chat-room-list">
      {chatRooms.map((doc, index) => {
        const chat = doc.data();
        return (
          <li key={doc.id} className="chat-room-item">
            <div className="message-room">
              <div className="d-flex flex-row">
                <div className="avatar-area">
                  <img
                    src={`${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`}
                    className="avatar-36"
                    alt="foobar"
                  />
                </div>
                <div className="nickname-area">
                  Chat Room
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

/** fca76db0 */
import React, { useEffect, useState } from 'react';
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
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [chatRoomsLength, setChatRoomsLength] = useState<number>(0);
  const [chatRoomsAllLength, setChatRoomsAllLength] = useState<number>(0);
  const { currentUserProfile, token } = useAuth();
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const PAGE_SIZE = 10;
  const [hasMore, setHasMore] = useState(true);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, any>>(
    {}
  );

  const fetchChatRooms = async (initial = false) => {
    const uid = currentUserProfile.user_profile.uid;

    let chatRef;

    if (initial || !lastDoc) {
      chatRef = query(
        collection(firestore, 'chats'),
        where('members', 'array-contains', uid),
        orderBy('updated_at', 'desc'),
        orderBy('__name__'),
        limit(PAGE_SIZE)
      );
    } else {
      const lastUpdatedAt = lastDoc.data().updated_at;
      chatRef = query(
        collection(firestore, 'chats'),
        where('members', 'array-contains', uid),
        orderBy('updated_at', 'desc'),
        orderBy('__name__'),
        startAfter(lastUpdatedAt, lastDoc.id),
        limit(PAGE_SIZE)
      );
    }

    const snapshot = await getDocs(chatRef);
    const newRooms = snapshot.docs.map((doc) => {
      const data = doc.data();
      const partner_uid = data.members.find((u: string) => u !== uid);
      fetchPartnerProfile(partner_uid);
      return {
        id: doc.id,
        ...data,
        partner_uid,
      };
    });

    if (initial) {
      setChatRooms(newRooms);
      setChatRoomsLength(newRooms.length);
    } else {
      setChatRooms((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const filtered = newRooms.filter((r) => !existingIds.has(r.id));
        return [...prev, ...filtered];
      });
      setChatRoomsLength((prev) => prev + newRooms.length);
    }

    if (snapshot.docs.length > 0) {
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    }

    setHasMore(snapshot.docs.length === PAGE_SIZE);
  };

  useEffect(() => {
    fetchChatRooms(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** chatroomの総数取得 */
  useEffect(() => {
    const fetchChatRoomCount = async () => {
      const uid = currentUserProfile.user_profile.uid;
      const chatRef = query(
        collection(firestore, 'chats'),
        where('members', 'array-contains', uid)
      );

      const snapshot = await getDocs(chatRef);
      setChatRoomsAllLength(snapshot.size);
    };

    fetchChatRoomCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPartnerProfile(uid: string) {
    if (partnerProfiles[uid]) {
      if (debug === 'true') {
        console.log(`🟡 すでにプロフィール取得済: ${uid}`);
      }
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/v1/get/member/uid/${uid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profile = res.data;

      setPartnerProfiles((prev) => ({
        ...prev,
        [uid]: profile,
      }));

      if (debug === 'true') {
        console.log(`🟢 プロフィール取得成功: ${uid}`, profile);
      }
    } catch (error) {
      console.error(`❌ プロフィール取得失敗: ${uid}`, error);
    }
  }

  return (
    <>
      <div className="chat-room-parameter d-flex justify-content-end mr10">
        <p>
          message Rooms: {chatRoomsLength} / {chatRoomsAllLength}
        </p>
      </div>

      <ul className="chat-room-list">
        {chatRooms.map((room) => {
          const profile = partnerProfiles[room.partner_uid];
          const chatRoomId = room.id;
          return (
            <li key={chatRoomId} className="chat-room-item">
              <ChatRoomCard
                user={profile?.data?.member}
                chatRoomId={chatRoomId}
              />
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="chatrooms-more-read mb80">
          <div onClick={() => fetchChatRooms(false)}>more read</div>
        </div>
      )}
    </>
  );
};

export default ExistingChatListComponent;

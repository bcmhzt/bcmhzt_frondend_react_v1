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
  // DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
// import ChatRoomCard from './ChatRoomCard';
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
  const { currentUserProfile, token } = useAuth();
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  /* ページ数をセット（ページネーション） */
  const PAGE_SIZE = 10;
  const [hasMore, setHasMore] = useState(true);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, any>>(
    {}
  );

  /* 最初のアクセスで取得するChatRooms */
  function fetchChatRooms() {
    const uid = currentUserProfile.user_profile.uid;
    const chatRef = query(
      collection(firestore, 'chats'),
      orderBy('updated_at', 'desc'),
      where('members', 'array-contains', uid),
      limit(PAGE_SIZE)
    );

    getDocs(chatRef).then((snapshot) => {
      const chatRooms = snapshot.docs.map((doc) => {
        const data = doc.data();
        /* 自分ではない相手のuidを取り出す */
        const partner_uid = data.members.find(
          (uid: string) => uid !== currentUserProfile.user_profile.uid
        );

        // ✅ ログ出力関数の即時実行
        fetchPartnerProfile(partner_uid);

        return {
          id: doc.id,
          ...data,
          partner_uid,
        };
      });

      if (debug === 'true') {
        console.log(
          '[src/components/messages/ExistingChatListComponent.tsx:41] 🔍 全チャットルーム:',
          chatRooms
        );
      }
      setChatRooms(chatRooms);
      setChatRoomsLength(chatRooms.length);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    });
  }
  /* 2回目以降のアクセスで取得するChatRooms */
  const fetchMoreChatRooms = async () => {
    if (!lastVisible) return; // 2回目以降にのみ実行

    const uid = currentUserProfile.user_profile.uid;

    const nextQuery = query(
      collection(firestore, 'chats'),
      where('members', 'array-contains', uid),
      orderBy('updated_at', 'desc'),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(nextQuery);
    const newRooms = snapshot.docs.map((doc) => {
      const data = doc.data();
      /* 自分ではない相手のuidを取り出す */
      const partner_uid = data.members.find(
        (uid: string) => uid !== currentUserProfile.user_profile.uid
      );

      // ✅ ログ出力関数の即時実行
      fetchPartnerProfile(partner_uid);

      return {
        id: doc.id,
        ...data,
        partner_uid,
      };
    });

    setChatRooms((prev) => [...prev, ...newRooms]);
    setChatRoomsLength((prev) => prev + newRooms.length);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === PAGE_SIZE);
  };

  /**
   * Firestoreからチャットルームを取得
   * collection: chats
   * FirestoreのルールでLoginユーザーで、
   * 且つmembersに自身のuidが含まれる場合のみ読み書き可（ルールの設定参照）
   *
   * - ログインユーザーを取得: currentUserProfile.user_profile.uid
   * - チャットルームのメンバーにログインユーザーのUIDが含まれるものを取得
   * - 更新日時で降順にソート
   */
  useEffect(() => {
    fetchChatRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPartnerProfile(uid: string) {
    if (partnerProfiles[uid]) {
      // すでに取得済みならスキップ
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
      <ul className="chat-room-list">
        {chatRooms.map((room) => {
          const profile = partnerProfiles[room.partner_uid];
          // const chat = room;
          const chatRoomId = room.id;
          // const profile = partnerProfiles[room.partner_uid];
          return (
            <>
              {/* <pre>{JSON.stringify(room, null, 2)}</pre> */}
              {/* <pre>{JSON.stringify(profile?.data?.member, null, 2)}</pre> */}
              <li key={chatRoomId} className="chat-room-item">
                <ChatRoomCard
                  user={profile?.data?.member}
                  chatRoomId={chatRoomId}
                />
              </li>
            </>
          );
        })}
      </ul>
      <h2>Existing Chat Rooms</h2>
      <p>Total Chat Rooms: {chatRoomsLength}</p>
      <h3>ExistingChatListComponent</h3>
      {/* <pre>{JSON.stringify(chatRooms, null, 2)}</pre>
      <h4>Partner Profiles</h4>
      <pre>{JSON.stringify(partnerProfiles, null, 2)}</pre> */}

      {hasMore && <button onClick={fetchMoreChatRooms}>もっと見る</button>}
    </>
  );
};

export default ExistingChatListComponent;

import { firestore } from '../firebaseConfig';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc,    // 追加
} from 'firebase/firestore';
import { ChatRoom, MatchedUser } from '../types/chat';

/**
 * チャットルームIDをUIDペアからSHA-256で生成
 */
async function generateChatRoomId(uids: string[]): Promise<string> {
  const sorted = [...uids].sort();
  const joined = sorted.join("_");

  const encoder = new TextEncoder();
  const data = encoder.encode(joined);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
/**
 * チャットルームを作成
 */
async function createChatRoom(
  docId: string,
  name: string,
  currentUid: string,
  matchedUid: string
): Promise<void> {
  const now = Timestamp.now();
  const roomData: ChatRoom = {
    name,
    type: 'private',
    is_closed: false,
    created_at: now,
    updated_at: now,
    members: [currentUid, matchedUid],
  };

  await setDoc(doc(firestore, 'chats', docId), roomData);
}

/**
 * Firestore上のチャットルームを照合・同期
 */
export async function syncChatRooms({
  currentUid,
  matchedList,
}: {
  currentUid: string;
  matchedList: MatchedUser[];
}): Promise<void> {
  try {
    // 既存のチャットルーム取得
    const chatsRef = collection(firestore, 'chats');
    const q = query(chatsRef, where('members', 'array-contains', currentUid));
    const snapshot = await getDocs(q);

    const existingRooms = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ChatRoom, 'id'>),
    }));

    const roomMap = new Map(existingRooms.map((r) => [r.id, r]));
    const neededRoomIds: string[] = [];

    // 必要なチャットルームの作成/更新
    for (const matched of matchedList) {
      const { matched_uid, nickname, bcuid } = matched;
      const docId = await generateChatRoomId([currentUid, matched_uid]);
      neededRoomIds.push(docId);

      const displayName = `${nickname}@${bcuid}`;
      const existingRoom = roomMap.get(docId);

      if (!existingRoom) {
        // 新規作成
        await createChatRoom(docId, displayName, currentUid, matched_uid);
      } else if (existingRoom.is_closed) {
        // クローズ済みの場合は再オープン
        await updateDoc(doc(firestore, 'chats', docId), {
          is_closed: false,
          updated_at: Timestamp.now(),
        });
      }
    }

    // 不要なチャットルームをクローズ
    const neededSet = new Set(neededRoomIds);
    for (const room of existingRooms) {
      if (!neededSet.has(room.id) && !room.is_closed) {
        await updateDoc(doc(firestore, 'chats', room.id), {
          is_closed: true,
          updated_at: Timestamp.now(),
        });
      }
    }
  } catch (error) {
    console.error('[syncChatRooms] error:', error);
    throw error;
  }
}

/**
 * チャットルームの未読メッセージ数を取得
 */
async function getUnreadCount(
  roomId: string,
  currentUid: string
): Promise<number> {
  const messagesRef = collection(firestore, 'chats', roomId, 'messages');
  const snapshot = await getDocs(messagesRef);
  
  return snapshot.docs.reduce((count, doc) => {
    const data = doc.data();
    const readBy = data.read_by || [];
    return !readBy.includes(currentUid) ? count + 1 : count;
  }, 0);
}

/**
 * チャットルーム一覧を取得（未読カウント付き）
 */
export async function fetchChatRooms(
  currentUid: string,
  matchedMap: Map<string, MatchedUser>
) {
  try {
    const chatsRef = collection(firestore, 'chats');
    const q = query(
      chatsRef,
      where('members', 'array-contains', currentUid),
      where('is_closed', '==', false)
    );
    const snapshot = await getDocs(q);

    const rooms = await Promise.all(
      snapshot.docs.map(async (d) => {
        const roomData = d.data() as ChatRoom;
        const unreadCount = await getUnreadCount(d.id, currentUid);
        const otherUid = roomData.members.find(uid => uid !== currentUid) ?? null;
        
        return {
          id: d.id,
          ...roomData,
          unreadCount,
          otherUid,
          userInfo: otherUid ? matchedMap.get(otherUid) ?? null : null
        };
      })
    );

    // 更新日時でソート
    return rooms.sort((a, b) => {
      const aTime = a.updated_at?.seconds ?? 0;
      const bTime = b.updated_at?.seconds ?? 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('[fetchChatRooms] error:', error);
    throw error;
  }
}

export async function sendMessage(
  roomId: string,
  senderId: string,
  text: string,
  imageUrls: string[] = []
) {
  try {
    const messagesRef = collection(firestore, 'chats', roomId, 'messages');
    const message = {
      sender_id: senderId,
      text,
      image_url: imageUrls,
      read_by: [senderId],
      is_deleted: false,
      created_at: Timestamp.now(),
    };

    await addDoc(messagesRef, message);

    // チャットルームの更新日時を更新
    await updateDoc(doc(firestore, 'chats', roomId), {
      updated_at: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
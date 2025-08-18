/**
 * 🐘bb4fb448
 * src/utility/Chat.ts
 */
// import { Firestore, doc as firestoreDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
// import { firestore } from '../firebaseConfig';

export async function generateChatRoomId(uids: string[]): Promise<string> {
  const sorted = [...uids].sort();
  const joined = sorted.join('_');
  const encoder = new TextEncoder();
  const data = encoder.encode(joined);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * チャットルームを確保する
 * - チャットルームが存在しない場合は新規作成する
 * - 既存のチャットルームがある場合はそのチャットルームを使用する
 * @param chatRoomId 
 * @param members 
 */
export async function ensureChatRoom(chatRoomId: string) {
  console.log('[src/utility/Chat.ts:28] ensureChatRoom', chatRoomId);
}



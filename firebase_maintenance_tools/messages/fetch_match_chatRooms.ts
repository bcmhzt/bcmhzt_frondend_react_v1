/** 本人（ログインuid）を引数にマッチリストとChatRoomIdを取得する */
import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';

console.log("==========================================================================");
console.log("☀️ hello! firebase_maintenance_tools/messages/fetch_match_chatRooms.ts !!");
console.log("==========================================================================");

const firestore = new Firestore({
  projectId: 'bcmhzt-b25e9',
  keyFilename: path.resolve(__dirname, '../bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId: 'bacmhzt-prod-firestore-messages',
});

/**
 * % npx ts-node messages/fetch_match_chatRooms.ts Ptp2VzffuSOklLbFADqeSEvgbXW2
 * 
 * 引数にログインユーザーのuid
 * chatsコレクションからchatRoomsを取得して、membersにuidが含まれるドキュメントを取得（マッチ済チャットルーム）
 * ChatRoomの件数をコンソールに出力
 * Document IDとmembersをコンソールに出力
 * 
 */
const loginUid = process.argv[2];
console.log("Login member uid:", loginUid);

async function fetchMatchedChatRooms() {
try {
  const snapshot = await firestore
    .collection('chats')
    .where('members', 'array-contains', loginUid)
    .orderBy('updated_at', 'desc')
    // .limit(10)
    .get();

    if (snapshot.empty) {
      console.log("⚠️ chats collection empty.");
    } else {
      console.log(`✅ chats collection retrieved successfully (${snapshot.size} items):`);
      console.log(`✳️ ChatRoomsId count: ${snapshot.size}`);

      snapshot.forEach(doc => {
        const data = doc.data();
        // updated_at を人間が読める形式に変換
        let updatedAtStr = '';
        if (data.updated_at && typeof data.updated_at.toDate === 'function') {
          updatedAtStr = data.updated_at.toDate().toISOString();
        }
        // console.log(`Number of members in docID ${doc.id}:`, data.members.length);
        console.log(`docID - ${doc.id}`);
        console.log("members -", data.members);
        // console.log(`- ${doc.id}:`, {
        //   ...data,
        //   updated_at: updatedAtStr || data.updated_at,
        // });
      });
    }
  } catch (error) {
    console.error("❌ Firestore access error:", error);
  }
}

fetchMatchedChatRooms();

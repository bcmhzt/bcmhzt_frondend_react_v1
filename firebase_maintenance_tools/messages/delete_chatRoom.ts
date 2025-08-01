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
 * Document IDとmembersをコンソールに出力
 * 
 * -dのフラグを付けて、chatRoomIdを指定して削除
 * % npx ts-node messages/delete_chatRoom.ts -d acc2481e2409807e80ddf99cf1a83792ef2342adaaca34228f0cea690896ab27
 * 
 */
const flag = process.argv[2]; // --delete or --show
const chatRoomId = process.argv[3];
console.log("Delete ChatRoomId:", chatRoomId);
console.log("Delete Flag:", flag);

async function deleteChatRooms() {
  

  if (flag === '--delete' || flag === '-d') {
    console.log("Deleting chat room with ID:", chatRoomId);
    try {
      const chatRoomRef = firestore.collection('chats').doc(chatRoomId);
      const doc = await chatRoomRef.get();

      if (!doc.exists) {
        console.log(`⚠️ Chat room with ID ${chatRoomId} does not exist.`);
      } else {
        await chatRoomRef.delete();
        console.log(`✅ Chat room with ID ${chatRoomId} has been deleted successfully.`);
      }
    } catch (error) {
      console.error("❌ Error deleting chat room:", error);
    }
  } else {
    console.log("Fetching chat room with ID:", chatRoomId);
    try {
      const chatRoomRef = firestore.collection('chats').doc(chatRoomId);
      const doc = await chatRoomRef.get();

      if (!doc.exists) {
      console.log(`⚠️ Chat room with ID ${chatRoomId} does not exist.`);
      } else {
      const data = doc.data();
      console.log(`✅ Chat room with ID ${chatRoomId} found:`);
      console.log("Data:", data);
      }
    } catch (error) {
      console.error("❌ Error fetching chat room:", error);
    }
  }
}

deleteChatRooms();

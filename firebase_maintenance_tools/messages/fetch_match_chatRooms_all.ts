/** 引数なしですべてのChatRoomIdを取得する */
import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';

console.log("==========================================================================");
console.log("☀️ hello! fetch_match_chatRooms_all.ts !!");
console.log("==========================================================================");

const firestore = new Firestore({
  projectId: 'bcmhzt-b25e9',
  keyFilename: path.resolve(__dirname, '../bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId: 'bacmhzt-prod-firestore-messages',
});

async function fetchMatchedChatRoomAlls() {
  try {
    const snapshot = await firestore.collection('chats').get();
    const chatRoomIds = snapshot.docs.map((doc) => doc.id);
    console.log("✅ 取得したChatRoomId Count:", chatRoomIds.length);
    console.log("✅ 取得したChatRoomId:");
    chatRoomIds.forEach((id, index) => {
      console.log(`${index + 1}: ${id}`);
    });
  } catch (error) {
    console.error("❌ Firestore access error:", error);
  }

}
fetchMatchedChatRoomAlls()
  .catch(console.error)
  .finally(() => process.exit());
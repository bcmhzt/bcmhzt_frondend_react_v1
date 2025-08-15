/** 本人（ログインuid）を引数にマッチリストとChatRoomIdを取得する */
import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';

console.log("==========================================================================");
console.log("☀️ hello! firebase_maintenance_tools/messages/delete_chatRooms.ts !!");
console.log("==========================================================================");

const firestore = new Firestore({
  projectId: 'bcmhzt-b25e9',
  keyFilename: path.resolve(__dirname, '../bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId: 'bacmhzt-prod-firestore-messages',
});

/**
 * % npx ts-node messages/delete_chatRooms.ts 3db330cf57f4bd412bda3aa6853f93906c309d411c8208b8cb5c752d64a2e6ad
 * 
 * 引数にchatRoomId
 * chatsコレクションからchatRoomsを取得して、そのchatRoomを物理削除する
 * 削除したchatRoomId（DocumentId）を出力
 * 配下のサブコレクション(messages)も物理削除する
 */

const chatRoomId = process.argv[2];
if (!chatRoomId) {
  console.error("❌ chatRoomId を引数に指定してください。");
  process.exit(1);
}
console.log("📌 chatRoomId (doc id):", chatRoomId);



/**
 * サブコレクションを再帰削除
 */
async function deleteSubcollectionRecursively(
  collectionRef: FirebaseFirestore.CollectionReference,
  batchSize: number = 100
) {
  const snapshot = await collectionRef.limit(batchSize).get();
  if (snapshot.empty) {
    return;
  }

  const batch = firestore.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  console.log(`   🗑️ ${snapshot.size} docs deleted from ${collectionRef.path}`);

  // まだ残っている可能性があるため再帰
  await deleteSubcollectionRecursively(collectionRef, batchSize);
}

/**
 * メインチャットルーム削除処理
 */
async function deleteChatRoomWithMessages(chatRoomId: string) {
  const chatRoomRef = firestore.collection('chats').doc(chatRoomId);

  // 存在確認
  const chatRoomSnap = await chatRoomRef.get();
  if (!chatRoomSnap.exists) {
    console.error(`⚠️ ChatRoomId ${chatRoomId} は存在しません。`);
    return;
  }

  console.log(`✅ ChatRoom ${chatRoomId} found. Deleting messages...`);

  // messages サブコレクションを再帰削除
  const messagesRef = chatRoomRef.collection('messages');
  await deleteSubcollectionRecursively(messagesRef);

  // メインドキュメント削除
  await chatRoomRef.delete();
  console.log(`🎯 ChatRoom ${chatRoomId} document deleted.`);
}

deleteChatRoomWithMessages(chatRoomId)
  .then(() => {
    console.log("🎉 All done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error deleting chat room:", err);
    process.exit(1);
  });


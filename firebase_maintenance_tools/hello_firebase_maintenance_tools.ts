// hello_firestore_gcp.ts
import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';

console.log("===================================================");
console.log("☀️ hello! firestore via @google-cloud/firestore !!");
console.log("===================================================");
console.log("This is Firestore's test connection and its Hello World.");

// GCP用 Firestore クライアントを初期化（明示的にDBを指定）
const firestore = new Firestore({
  projectId: 'bcmhzt-b25e9',
  keyFilename: path.resolve(__dirname, 'bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId: 'bacmhzt-prod-firestore-messages',
});

async function accessChatsCollection() {
  try {
    const snapshot = await firestore
      .collection('chats')
      .orderBy('updated_at', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log("⚠️ chats collection empty.");
    } else {
      console.log(`✅ chats collection retrieved successfully (${snapshot.size} items):`);
      snapshot.forEach(doc => {
        const data = doc.data();
        // updated_at を人間が読める形式に変換
        let updatedAtStr = '';
        if (data.updated_at && typeof data.updated_at.toDate === 'function') {
          updatedAtStr = data.updated_at.toDate().toISOString();
        }
        console.log(`- ${doc.id}:`, {
          ...data,
          updated_at: updatedAtStr || data.updated_at,
        });
      });
    }
  } catch (err) {
    console.error("❌ Firestore access error:", err);
  }
}

console.log("=======================================");
console.log("☀️ Firestore hello !!");
console.log("=======================================");
accessChatsCollection();

console.log("=======================================");
console.log("☀️ Fire Storage hello !!");
console.log("=======================================");

console.log("=======================================");
console.log("☀️ Firebase Authentication hello !!");
console.log("=======================================");

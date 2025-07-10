import * as admin from 'firebase-admin';

const serviceAccount = require("./bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Firebaseの初期化とインスタンス取得
 * Firestore, Storage, Authのインスタンスを取得
 */
const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

/**
 * Firestoreは、chatsから最新のドキュメントを取得し、コンソールに出力する
 */
// const getLatestChat = async () => {
//   const snapshot = await db.collection("chats").orderBy("createdAt", "desc").limit(1).get();
//   snapshot.forEach((doc) => {
//     console.log(doc.id, "=>", doc.data());
//   });
// };

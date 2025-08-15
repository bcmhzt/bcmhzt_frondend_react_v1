// posts/fetch_upload_images.ts
import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';

console.log("===================================================");
console.log("☀️ hello! firestore via @google-cloud/firestore !!");
console.log("===================================================");
console.log("This is Firebase's posts/fetch_upload_images.ts");

/**
 * 特定のuidの投稿画像を取得する
 * % npx ts-node posts/fetch_upload_images.ts [uid]
 */

const firestore = new Firestore({
  projectId: 'bcmhzt-b25e9',
  keyFilename: path.resolve(__dirname, 'bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId: 'bacmhzt-prod-firestore-messages',
});

console.log("This is Firebase's posts/fetch_upload_images.ts2");
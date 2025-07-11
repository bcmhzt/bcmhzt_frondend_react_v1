// firebase_maintenance_tools/openTalks/hello_opentalks.ts
import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';

/**
 * % npx ts-node openTalks/hello_opentalks.ts
 */

console.log("==========================");
console.log("✳️ hello! openTalks !!");
console.log("==========================");
console.log("This is test connection Firestore's openTalks collection and its Hello World.");

const projectId = 'bcmhzt-b25e9';
const databaseId = 'bacmhzt-prod-firestore-messages';
const collectionName = 'openTalks';

const firestore = new Firestore({
  projectId: projectId,
  keyFilename: path.resolve(__dirname, '../bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId: databaseId,
});

async function accessOpenTalksCollection() {
  try {
    const snapshot = await firestore
      .collection(collectionName)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log("⚠️ openTalks collection empty.");
    } else {
      console.log(`✅ openTalks collection retrieved successfully (${snapshot.size} items):`);
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

accessOpenTalksCollection();
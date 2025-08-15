// firebase_maintenance_tools/openTalks/hello_opentalks.ts
import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';

/**
 * % npx ts-node openTalks/hello_opentalks.ts
 */

console.log("=======================================");
console.log("✳️ hello! fetch_opentalk_messages.ts !!");
console.log("=======================================");
console.log("This is test connection Firestore's openTalks collection and fetch_opentalk_messages.ts");

const projectId = 'bcmhzt-b25e9';
const databaseId = 'bacmhzt-prod-firestore-messages';
const collectionName = 'openTalks';

const firestore = new Firestore({
  projectId: projectId,
  keyFilename: path.resolve(__dirname, '../bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId: databaseId,
});

// ---- 引数チェック ----
const uid = process.argv[2];
if (!uid) {
  console.error("❌ 引数に uid を指定してください。");
  console.error("   例) npx ts-node openTalks/fetch_opentalk_mesages.ts p2AxdCDvUMcaPtvEopErEMWPkcj2");
  process.exit(1);
}
console.log(`📌 対象 uid: ${uid}`);

async function main() {
  try {
    // openTalks コレクションで uid 一致のドキュメントを取得
    // createdAt がある想定なので、見やすさのため降順で並べます（不要なら orderBy を外してOK）
    const col = firestore.collection('openTalks');
    const query = col.where('uid', '==', uid).orderBy('createdAt', 'desc');

    const snap = await query.get();
    if (snap.empty) {
      console.log("⚠️ 該当するドキュメントはありません。");
      console.log("件数: 0");
      return;
    }

    console.log(`✅ 該当ドキュメント数: ${snap.size}`);
    console.log("—— ドキュメントID一覧 ——————————————");

    let idx = 0;
    snap.forEach((doc) => {
      idx += 1;
      const data = doc.data() as {
        createdAt?: any;
        text?: string;
        nickname?: string;
      };

      // createdAt の表示（存在し、Timestamp型なら toDate で整形）
      let createdAtStr = '';
      if (data?.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString();
      }

      // 必要に応じてサマリを表示（短く）
      console.log(
        `#${idx} ${doc.id}` +
        (createdAtStr ? ` | createdAt: ${createdAtStr}` : '')
      );
    });

    console.log("———————————————————————————————");
    console.log(`📦 合計件数: ${snap.size}`);
  } catch (err) {
    console.error("❌ 取得中にエラーが発生しました:", err);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
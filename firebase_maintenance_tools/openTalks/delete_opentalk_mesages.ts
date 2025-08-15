// firebase_maintenance_tools/openTalks/delete_opentalk_mesages.ts
// 使い方:
// % npx ts-node openTalks/delete_opentalk_mesages.ts p2AxdCDvUMcaPtvEopErEMWPkcj2

import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';
import * as readline from 'readline';

console.log("=================================================");
console.log("✳️ hello! delete_opentalk_mesages.ts (物理削除) !!");
console.log("=================================================");
console.log("This will fetch and optionally DELETE openTalks docs by uid.");

// ---- Firestore 接続設定 ----
const projectId = 'bcmhzt-b25e9';
const databaseId = 'bacmhzt-prod-firestore-messages';
const collectionName = 'openTalks';

const firestore = new Firestore({
  projectId,
  keyFilename: path.resolve(__dirname, '../bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId,
});

// ---- 引数チェック ----
const uid = process.argv[2];
if (!uid) {
  console.error("❌ 引数に uid を指定してください。");
  console.error("   例) npx ts-node openTalks/delete_opentalk_mesages.ts p2AxdCDvUMcaPtvEopErEMWPkcj2");
  process.exit(1);
}
console.log(`📌 対象 uid: ${uid}`);

// 確認プロンプト
function askYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} (Y/n): `, (answer) => {
      rl.close();
      const a = (answer || '').trim().toLowerCase();
      if (a === '' || a === 'y' || a === 'yes') return resolve(true);
      return resolve(false);
    });
  });
}

// バッチ削除（500件上限に合わせて分割）
async function deleteByDocIds(docIds: string[]) {
  const deleted: string[] = [];
  const chunkSize = 400; // 余裕を持って 400 に設定
  for (let i = 0; i < docIds.length; i += chunkSize) {
    const chunk = docIds.slice(i, i + chunkSize);
    const batch = firestore.batch();
    for (const id of chunk) {
      const ref = firestore.collection(collectionName).doc(id);
      batch.delete(ref);
    }
    await batch.commit();
    deleted.push(...chunk);
    console.log(`🗑️ Deleted ${deleted.length}/${docIds.length} ...`);
  }
  return deleted;
}

async function main() {
  try {
    // uid 一致のドキュメントを取得（createdAt 降順は表示のため）
    const col = firestore.collection(collectionName);
    const query = col.where('uid', '==', uid).orderBy('createdAt', 'desc');
    const snap = await query.get();

    if (snap.empty) {
      console.log("⚠️ 該当するドキュメントはありません。");
      console.log("件数: 0");
      return;
    }

    console.log(`✅ 該当ドキュメント数: ${snap.size}`);
    console.log("—— ドキュメントID一覧 ——————————————");
    const docIds: string[] = [];
    let idx = 0;
    snap.forEach((doc) => {
      idx += 1;
      const data = doc.data() as { createdAt?: any };
      let createdAtStr = '';
      if (data?.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString();
      }
      console.log(`#${idx} ${doc.id}${createdAtStr ? ` | createdAt: ${createdAtStr}` : ''}`);
      docIds.push(doc.id);
    });
    console.log("———————————————————————————————");
    console.log(`📦 合計件数: ${snap.size}`);

    // 確認
    const ok = await askYesNo(`上記 ${docIds.length} 件を削除しますか？`);
    if (!ok) {
      console.log("🚫 キャンセルしました。削除は行われませんでした。");
      return;
    }

    // 削除実行
    console.log("🔧 削除を開始します…");
    const deletedIds = await deleteByDocIds(docIds);

    // 結果表示
    console.log("✅ 削除完了");
    console.log("—— 削除したドキュメントID一覧 ————");
    deletedIds.forEach((id, i) => console.log(`#${i + 1} ${id}`));
    console.log("———————————————————————————");
    console.log(`🧹 uid=${uid} の削除件数: ${deletedIds.length}`);
  } catch (err) {
    console.error("❌ エラー:", err);
    process.exit(1);
  }
}

main().then(() => process.exit(0));

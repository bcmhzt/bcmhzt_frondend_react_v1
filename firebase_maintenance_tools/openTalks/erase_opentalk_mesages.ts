// firebase_maintenance_tools/openTalks/erase_opentalk_mesages.ts
// 使い方:
// % npx ts-node openTalks/erase_opentalk_mesages.ts p2AxdCDvUMcaPtvEopErEMWPkcj2

import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';
import * as readline from 'readline';

console.log("=================================================");
console.log("✳️ hello! erase_opentalk_mesages.ts (論理削除) !!");
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
  console.error("   例) npx ts-node openTalks/erase_opentalk_mesages.ts p2AxdCDvUMcaPtvEopErEMWPkcj2");
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
      resolve(a === '' || a === 'y' || a === 'yes');
    });
  });
}

// バッチ更新（500操作上限に配慮）
async function softDeleteByDocIds(docIds: string[]) {
  const updated: string[] = [];
  const chunkSize = 400; // 余裕を持って400件単位
  for (let i = 0; i < docIds.length; i += chunkSize) {
    const chunk = docIds.slice(i, i + chunkSize);
    const batch = firestore.batch();
    for (const id of chunk) {
      const ref = firestore.collection(collectionName).doc(id);
      batch.update(ref, {
        deleted: true,
        // deletedAt: Firestore.Timestamp.now(), // ← 削除時刻も残したい場合は有効化
      });
    }
    await batch.commit();
    updated.push(...chunk);
    console.log(`📝 Updated (deleted=true): ${updated.length}/${docIds.length}`);
  }
  return updated;
}

async function main() {
  try {
    const col = firestore.collection(collectionName);
    // 表示のため createdAt 降順（インデックスが無ければ orderBy を外してください）
    const query = col.where('uid', '==', uid).orderBy('createdAt', 'desc');
    const snap = await query.get();

    if (snap.empty) {
      console.log("⚠️ 該当するドキュメントはありません。");
      console.log("件数: 0");
      return;
    }

    console.log(`✅ 該当ドキュメント数: ${snap.size}`);
    console.log("—— ドキュメントID一覧（現在のdeleted値） ————");

    const allDocIds: string[] = [];
    const toUpdateIds: string[] = [];

    let idx = 0;
    snap.forEach((doc) => {
      idx += 1;
      const data = doc.data() as { createdAt?: any; deleted?: boolean };
      let createdAtStr = '';
      if (data?.createdAt && typeof (data as any).createdAt.toDate === 'function') {
        createdAtStr = (data as any).createdAt.toDate().toISOString();
      }
      const delFlag = data?.deleted === true;
      console.log(`#${idx} ${doc.id}${createdAtStr ? ` | createdAt: ${createdAtStr}` : ''} | deleted: ${delFlag}`);
      allDocIds.push(doc.id);
      if (!delFlag) toUpdateIds.push(doc.id); // 既にtrueのものはスキップ
    });

    console.log("———————————————————————————————");
    console.log(`📦 合計件数: ${snap.size}`);
    console.log(`🧮 更新対象（deleted=false または未定義）: ${toUpdateIds.length}`);

    if (toUpdateIds.length === 0) {
      console.log("✅ すべての対象ドキュメントは既に deleted=true です。処理は不要です。");
      return;
    }

    const ok = await askYesNo(`上記のうち ${toUpdateIds.length} 件の deleted を true に更新しますか？`);
    if (!ok) {
      console.log("🚫 キャンセルしました。更新は行われませんでした。");
      return;
    }

    console.log("🔧 論理削除（deleted=true）を開始します…");
    const updatedIds = await softDeleteByDocIds(toUpdateIds);

    console.log("✅ 論理削除完了");
    console.log("—— 更新したドキュメントID一覧 ————");
    updatedIds.forEach((id, i) => console.log(`#${i + 1} ${id}`));
    console.log("———————————————————————————");
    console.log(`🧹 uid=${uid} の論理削除件数: ${updatedIds.length}`);
  } catch (err) {
    console.error("❌ エラー:", err);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
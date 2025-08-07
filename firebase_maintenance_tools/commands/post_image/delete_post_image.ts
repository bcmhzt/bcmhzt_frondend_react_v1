import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';
import { Storage } from '@google-cloud/storage';
import * as readline from 'readline';

console.log("================================================================");
console.log("☀️ hello! firestore post_image via @google-cloud/firestore !!");
console.log("================================================================");
console.log("post_image/delete_post_image.ts");

// GCP用 Firestore クライアントを初期化（明示的にDBを指定）
const firestore = new Firestore({
  projectId: 'bcmhzt-b25e9',
  keyFilename: path.resolve(__dirname, '../../bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
  databaseId: 'bacmhzt-prod-firestore-messages',
});

// GCP用 Storage クライアントを初期化
const storage = new Storage({
  projectId: 'bcmhzt-b25e9',
  keyFilename: path.resolve(__dirname, '../../bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json'),
});

console.log("=======================================");
console.log("☀️ Fire Storage hello !!");
console.log("=======================================");

// 引数の処理
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("❌ 引数が必要です。例えば、node hello_profile_image.js <storage dir name>");
  process.exit(1);
}

const storage_dir = args[0];

async function checkStorageDirectory(storageDir: string) {
  const bucketName = 'bcmhzt-b25e9.appspot.com';
  const bucket = storage.bucket(bucketName);
  const prefix = `uploads/${storageDir}/`;

  try {
    const [files] = await bucket.getFiles({ prefix });
    if (files.length > 0) {
      console.log(`✅ 指定されたストレージディレクトリがありました: ${prefix}`);
      return true; // ディレクトリが存在する場合はtrueを返す
    } else {
      console.log(`❌ 指定されたストレージディレクトリは存在しません: ${prefix}`);
      return false; // ディレクトリが存在しない場合はfalseを返す
    }
  } catch (error) {
    // TypeScriptの型安全性のために error を適切に処理
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ エラーが発生しました: ${errorMessage}`);
    return false;
  }
}

async function promptAndDelete(storageDir: string) {
  const bucketName = 'bcmhzt-b25e9.appspot.com';
  const bucket = storage.bucket(bucketName);
  const prefix = `uploads/${storageDir}/`;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<void>((resolve) => {
    rl.question(`指定されたディレクトリ ${prefix} を削除しますか？ (Y/n): `, async (answer) => {
      const normalizedAnswer = answer.trim().toLowerCase();
      if (normalizedAnswer === 'y') {
        try {
          const [files] = await bucket.getFiles({ prefix });
          for (const file of files) {
            await file.delete();
            console.log(`✅ ファイルを削除しました: ${file.name}`);
          }
          console.log(`✅ ディレクトリ ${prefix} の削除が完了しました。`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`❌ エラーが発生しました: ${errorMessage}`);
        }
      } else {
        console.log(`❌ 削除をキャンセルしました。`);
      }
      rl.close();
      resolve();
    });
  });
}

// メイン実行関数
async function main() {
  const directoryExists = await checkStorageDirectory(storage_dir);
  
  if (directoryExists) {
    await promptAndDelete(storage_dir);
  }
  
  console.log(`終了: ${storage_dir}`);
}

// メイン関数を実行
main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`❌ 実行エラー: ${errorMessage}`);
  process.exit(1);
});
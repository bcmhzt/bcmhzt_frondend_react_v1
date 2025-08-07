import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';
import { Storage } from '@google-cloud/storage';
import * as readline from 'readline';

console.log("================================================================");
console.log("☀️ hello! firestore profile_image via @google-cloud/firestore !!");
console.log("================================================================");
console.log("profile_image/hello_profile_image.ts");

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
console.log(`✅ 指定されたストレージディレクトリ: ${storage_dir}`);

// ユーザー入力を受け取るためのreadlineインターフェース
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Y/N選択を待つ関数
function askForConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const normalizedAnswer = answer.toLowerCase().trim();
      resolve(normalizedAnswer === 'y' || normalizedAnswer === 'yes');
    });
  });
}

// ディレクトリを削除する関数
async function deleteFolder(uid: string) {
  const bucketName = 'bcmhzt-b25e9.appspot.com';
  const prefix = `profiles/${uid}/`;

  try {
    const [files] = await storage.bucket(bucketName).getFiles({ prefix });

    if (files.length === 0) {
      console.log(`❌ UID "${uid}" のフォルダーは存在しません。`);
      return;
    }

    console.log(`⚠️ 以下のファイルが削除されます:`);
    files.forEach(file => console.log(`- ${file.name}`));

    const shouldDelete = await askForConfirmation('\n本当に削除しますか？ (Y/n): ');

    if (shouldDelete) {
      console.log('🗑️ ファイルを削除中...');
      
      // 並列でファイルを削除
      await Promise.all(files.map(file => file.delete()));
      
      console.log(`✅ UID "${uid}" のフォルダーを削除しました。`);
    } else {
      console.log('❌ 削除がキャンセルされました。');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ エラーが発生しました: ${errorMessage}`);
  } finally {
    rl.close();
  }
}

async function searchFolder(uid: string) {
  const bucketName = 'bcmhzt-b25e9.appspot.com';
  const prefix = `profiles/${uid}/`;

  try {
    const [files] = await storage.bucket(bucketName).getFiles({ prefix });

    if (files.length > 0) {
      console.log(`✅ UID "${uid}" のフォルダーが見つかりました:`);
      files.forEach(file => console.log(file.name));
      
      // ディレクトリ削除の確認
      await deleteFolder(uid);
    } else {
      console.log(`❌ UID "${uid}" のフォルダーは見つかりませんでした。`);
      rl.close();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ エラーが発生しました: ${errorMessage}`);
    rl.close();
  }
}

// UIDを検索
searchFolder(storage_dir);
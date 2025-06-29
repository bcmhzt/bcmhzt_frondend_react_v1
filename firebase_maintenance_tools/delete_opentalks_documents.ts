const admin = require("firebase-admin");
const path = require("path");

// credentialのパスを設定
const serviceAccount = require("./bcmhzt-b25e9-firebase-adminsdk-oywau-d9a2d47d80.json");

// Firebase初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestoreインスタンスを取得
const db = admin.firestore();

/**
 * meetingsコレクションのデータ削除
 *
 * @param {exec} dateArg - YYYY-M形式の文字列
 * @returns
 */
async function main(dateArg) {
  console.log("args: " + dateArg);
  // console.log("コマンドライン引数の内容:");
  // console.log("Node.jsパス:", process.argv[0]);
  // console.log("スクリプトパス:", process.argv[1]);
  // console.log("ユーザー指定の引数:", process.argv[2]);

  if (!dateArg) {
    throw new Error("dateArg is required");
  }

  const openTalks = db.collection("openTalks").doc();
  const querySnapshot = await openTalks.get();

  querySnapshot.forEach((doc) => {
    const item = doc.data();
    console.log(`[${item.No}] ${item.meetingType}`);
    console.log(`  ドキュメントID: ${doc.id}`);

  });
  
  // const yearDoc = db.collection("openTalks").doc(formattedYear);
  // const monthCollection = yearDoc.collection(formattedMonth);
  // const querySnapshot = await monthCollection.get();

//   const [year, month] = dateArg.split("-");
//   if (!year || !month || !/^\d{4}$/.test(year)) {
//     throw new Error(
//       "Invalid dateArg format. Expected format: YYYY-MM with a 4-digit year."
//     );
//   }
//   const formattedYear = year;
//   const formattedMonth = month.startsWith("0") ? month.slice(1) : month;

//   console.log("Year:", formattedYear);
//   console.log("Month:", formattedMonth);

//   console.log(
//     `\n=== ${formattedYear}年${formattedMonth}月のデータを確認します ===`
//   );

//   const yearDoc = db.collection("meetings").doc(formattedYear);
//   const monthCollection = yearDoc.collection(formattedMonth);
//   const querySnapshot = await monthCollection.get();

//   if (querySnapshot.empty) {
//     console.log(`${formattedYear}年${formattedMonth}月のデータは存在しません`);
//     return;
//   }

//   // 取得したデータの内容を表示
//   console.log(`\n合計 ${querySnapshot.size} 件のデータが見つかりました：\n`);
//   querySnapshot.forEach((doc) => {
//     const data = doc.data();
//     console.log(`[${data.No}] ${data.meetingType}`);
//     console.log(`  ドキュメントID: ${doc.id}`);
//     console.log(`  日時: ${data.detail3}`);
//     console.log(`  エリア: ${data.eria}`);
//     console.log(`  都道府県: ${data.prefecture}\n`);
//   });

//   // 削除の確認プロンプト
//   const readline = require("readline").createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

//   const answer = await new Promise((resolve) => {
//     readline.question(
//       `\n${querySnapshot.size}件のデータを削除しますか？ (Y/n): `,
//       (ans) => {
//         readline.close();
//         resolve(ans.toLowerCase());
//       }
//     );
//   });

//   // キャンセルの場合
//   if (answer !== "y" && answer !== "") {
//     console.log("削除をキャンセルしました");
//     return `${formattedYear}年${formattedMonth}月のデータ削除をキャンセルしました`;
//   }

//   // 削除を実行
//   const batch = db.batch();
//   querySnapshot.forEach((doc) => {
//     batch.delete(doc.ref);
//   });

//   await batch.commit();
//   console.log(`${querySnapshot.size}件のデータを削除しました`);
//   return `${formattedYear}年${formattedMonth}月のデータ削除が完了しました`;

return "hogehoge";
}

// モジュールとしてエクスポート
module.exports = main;

// スクリプトが直接実行された場合の処理
if (require.main === module) {
  const dateArg = process.argv[2]; // コマンドライン引数を取得
  main(dateArg)
    .then((result) => console.log(result))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

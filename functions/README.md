# Cloud Functions

ちょっとよくわからないけど、同じものです。概してCloud Functionsと呼ぶようにします。
- [CGP Cloud Run](https://console.cloud.google.com/run?deploymentType=function&inv=1&invt=AbwJ9Q&hl=ja&project=bcmhzt-b25e9)
- [Firebase Functions](https://console.firebase.google.com/project/bcmhzt-b25e9/functions?hl=ja&fb_gclid=Cj0KCQjw2ou2BhCCARIsANAwM2E-u1aQj-YY-Hw21ZlOarifFmeN9zczOYEhq0a3gvmK61m5gzpjb6MaAsrTEALw_wcB)

## Document

- [Google Drive Cloud Functions](https://drive.google.com/drive/folders/1hqlQ7cSYIERtL7sNzuCUT1widESvlxYp)
- [Site map & system integration / cloud functions](https://docs.google.com/spreadsheets/d/1g5iI_PD07VCNZYxnPiR9V2wMCPV4yxpQPDdEkNeJipE/edit?gid=1546238573#gid=1546238573)


## Develop

### Login
```
% firebase login
Already logged in as bcmhzt@gmail.com
```

### Type Script
関数はType Scriptで書かれています。Functionsの開発ディレクトリ, npmのインストール、ビルドの手順は以下。ビルドされたものはlib内に格納される。これでエラーがないか確認する。
```
% cd functions
% npm install
...
% npm run build
> build
> tsc
```

### Deploy
開発したものを本番環境に上げます。  
すべてをデプロイする場合（結構時間がかかる）:
すべての関数でエラーがない状態じゃないとデプロイは失敗します。
```
% firebase deploy --only functions
```

関数を部分的にデプロイする場合:
```
% firebase deploy --only functions:関数名
```
デプロイした関数の確認
```
% firebase functions:list
```

### Realtime watch
リアルタイムでコンパイルしながら開発する。エラーが出たりするとリアルタイムでログが見れる。
```
% npm run build:watch
[2:00:25] Starting compilation in watch mode...
[2:00:26] Found 0 errors. Watching for file changes.
```

### Emurator
エミュレーターの起動。ローカルで開発するときは本番環境を擬似したエミュレータが使える。
メモリは開発する関数によって適用に割り当てる。（ここでは、functions,storageのみのエミュレータを起動しているが、後から追加できる）
```
% export NODE_OPTIONS="--max-old-space-size=4096"
% npx firebase emulators:start --only functions,storage
```
エミュレーターはブラウザで [http://127.0.0.1:4000/](http://127.0.0.1:4000/)でアクセスする。

#### Storage
[Firebase Emulator Suite Storage](http://127.0.0.1:4000/storage )
- 画像やファイルはメモリ上に残るだけで（仮想的に残るだけで）リロードすると消える。（ローカルに保存することもできるが不要）
- 画像のアップロードや削除のアクションをトリガーにするときに利用する。

#### Functions
[Firebase Emulator Suite Functions](http://127.0.0.1:4000/functions )
- ログの出力など

### Logging
ログの種類は全部で３つ

#### エミュレータのLogsで見る1
```
logger.info('✅ [logger.info] Hello world!');
```

#### エミュレターのLogsで見る2
```
res.send('☀️ [res.send] Hello world!');
```

#### httpリクエストの返り値
console.log()は殆ど使う用途なし。（出るは出るけど）
```
console.log('☹️ [console.log] Hello world!');
```

## make Archtype
関数を作成するときの雛形の作成方法です。ここでは例としてarchtypes()関数を作成。
```
% cd functions
% touch src/archtypes/archtypes.ts
```
src/archtypes/archtypes.tsに以下を書く
```
// functions/src/archtypes/archtype.ts
import { onRequest } from 'firebase-functions/v2/https';
import { logger }    from 'firebase-functions';

export const archtype = onRequest((req, res) => {
  logger.log('✅ archtype function was triggered!');
  res.send('Hello from Firebase Functions archtype (TypeScript)!');
});
```

functions/src/index.tsにExportする
```
...
export * from './archtypes/archtype';  /** Functions archtype for develop */
```
Logでエラーが無ければ完了。

### トリガーを設定する
関数を実行するためには、httpリクエストか、Storageへの画像のアップロードなどトリガーを設定して実行します。（TypeScript＋Firebase v2 SDK ）

#### 1. HTTP（onRequest）トリガー
(例) curl http://localhost:5001/bcmhzt-b25e9/us-central1/hello
```
curl http://localhost:5001/[FirebaseのプロジェクトID]/[リージョン]/[関数名]
```
httpリクエストはすべてindex.tsに向けて投げます。なので、src以下にある関数もindex.tsにエクスポートされているので、単純に関数名を指定します。（なので、関数名が重複しないようにする）
```
// functions/src/archtypes/archtype.ts
import { onRequest } from 'firebase-functions/v2/https'; //これがトリガー
import { logger }    from 'firebase-functions';

export const archtype = onRequest((req, res) => {
  logger.log('✅ archtype function was triggered!!!'); // エミュレーターのLogで出力する
  res.send('Hello from Firebase Functions archtype (TypeScript)!'); // トリガーの実行結果
});
```

#### 2. Storage（onObjectFinalized）トリガー
エミュレーターのStorageを使ってトリガーを引けます。
```
// functions/src/archtypes/archtype.ts
import { onRequest } from 'firebase-functions/v2/https';
import { onObjectFinalized } from 'firebase-functions/v2/storage'; // uploadトリガー
import { logger }    from 'firebase-functions';

export const archtype = onRequest((req, res) => {
  logger.log('✅ archtype function was triggered!!!');
  res.send('Hello from Firebase Functions archtype (TypeScript)!');
});

export const archtype2 = onObjectFinalized(
  { region: 'us-central1', memory: '1GiB', timeoutSeconds: 120 },
  async (event) => {
    // upload時に実行
    logger.log('✅ archtype2 function was triggered!!!');
  }
);
```

#### 3. Firestore（onDocumentCreate／onDocumentWrite）トリガー
研究中


## Cloud Functionsの認証
`functions/src/firebase_admin.ts`で一括して認証するようにする。  
認証情報は、自動的に
- ~/.config/firebase
- ~/.config/gcloud
あたりの認証情報を使っているらしい。

.env.local (開発・本番環境ではCircleCIのymlファイルで設定&書き込みを実行)をつかって指定する。

// functions/src/firebase_admin.ts
import { initializeApp, applicationDefault, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage }   from 'firebase-admin/storage';
import { getAuth }      from 'firebase-admin/auth';

const storageBucket =
  process.env.STORAGE_BUCKET || 'bcmhzt-b25e9.appspot.com';

// すでに初期化済みなら再利用（シングルトン）
const app = getApps().length ? getApp() : initializeApp({
  credential: applicationDefault(),         // Cloud Functions ではデフォルト資格情報で OK
  storageBucket, 
});

export const fireStore      = getFirestore(app);
export const fireStorage  = getStorage(app).bucket();
export const auth    = getAuth(app);
export default app;

// 参考: https://firebase.google.com/docs/functions/typescript
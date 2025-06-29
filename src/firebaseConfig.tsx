import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
// import { setLogLevel as firebaseSetLogLevel } from "firebase/firestore";

/* Firebase configuration */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// ★ ここでログレベルをDEBUGにする
// setLogLevel("debug");

/* Initialize Firebase */
const app = initializeApp(firebaseConfig);
// console.log("[src/firebaseConfig.tsx:21] Firebase App initialized", app);

initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

const auth = getAuth(app);
// console.log("[src/firebaseConfig.tsx:32] Firebase getAuth: ", auth);

const storage = getStorage(app);
// console.log("[src/firebaseConfig.tsx:34] Firebase storage: ", storage);
/** daabae nameを明示的に指示する必要がある */
const database = process.env.REACT_APP_FIRESTORE_DATABASE ?? '';
// console.log("[src/firebaseConfig.tsx:37] Firebase database: ", database);
const firestore = getFirestore(app, database);
// console.log("[src/firebaseConfig.tsx:39] Firebase firestore: ", firestore);

export { app, auth, storage, firestore };

// function setLogLevel(level: "debug" | "error" | "silent" | "warn") {
//   firebaseSetLogLevel(level);
// }

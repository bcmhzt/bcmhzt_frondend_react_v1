import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, initializeFirestore } from "firebase/firestore";
// import { setLogLevel as firebaseSetLogLevel } from "firebase/firestore";

/* Firebase configuration */
const firebaseConfig = {
  apiKey: "AIzaSyAu4X0CixAMWZDhyIszmhnI0qxBgoXo8ic",
  authDomain: "bcmhzt-b25e9.firebaseapp.com",
  projectId: "bcmhzt-b25e9",
  storageBucket: "bcmhzt-b25e9.appspot.com",
  messagingSenderId: "951352274443",
  appId: "1:951352274443:web:525c5feb1c732f0383e10e",
  measurementId: "G-34DXL9VYR0"
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
const database = process.env.REACT_APP_FIRESTORE_DATABASE ?? "";
// console.log("[src/firebaseConfig.tsx:37] Firebase database: ", database);
const firestore = getFirestore(app, database);
// console.log("[src/firebaseConfig.tsx:39] Firebase firestore: ", firestore);

export { app, auth, storage, firestore };

// function setLogLevel(level: "debug" | "error" | "silent" | "warn") {
//   firebaseSetLogLevel(level);
// }


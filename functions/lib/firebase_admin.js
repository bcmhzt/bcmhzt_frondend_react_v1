"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.fireStorage = exports.fireStore = void 0;
// functions/src/firebase_admin.ts
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const auth_1 = require("firebase-admin/auth");
const storageBucket = process.env.STORAGE_BUCKET || 'bcmhzt-b25e9.appspot.com';
// すでに初期化済みなら再利用（シングルトン）
const app = (0, app_1.getApps)().length ? (0, app_1.getApp)() : (0, app_1.initializeApp)({
    credential: (0, app_1.applicationDefault)(),
    storageBucket,
});
exports.fireStore = (0, firestore_1.getFirestore)(app);
exports.fireStorage = (0, storage_1.getStorage)(app).bucket();
exports.auth = (0, auth_1.getAuth)(app);
exports.default = app;
// 参考: https://firebase.google.com/docs/functions/typescript

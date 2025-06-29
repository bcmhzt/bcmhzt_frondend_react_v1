"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logUpload = void 0;
const storage_1 = require("firebase-functions/v2/storage");
const firebase_functions_1 = require("firebase-functions");
/**
 * アップロード完了時にファイル情報をログ出力するだけの関数
 * テスト用
 */
exports.logUpload = (0, storage_1.onObjectFinalized)({ region: 'us-central1' }, // ← 他の関数と同じリージョンに揃える
(event) => {
    const { name, contentType, size } = event.data;
    firebase_functions_1.logger.info('[logUpload] file:', { name, contentType, size });
});

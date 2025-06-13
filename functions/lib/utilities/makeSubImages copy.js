"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSubImages = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const firebase_admin_1 = require("../firebase_admin");
const sharp_1 = __importDefault(require("sharp"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const targets = [
    { suffix: '_original' },
    { suffix: '_large', width: 1280 },
    { suffix: '_medium', width: 640 },
    { suffix: '_small', width: 320 },
    { suffix: '_thumbnail', width: 100 },
];
// 手動指定したUID配列（初期運用）
const defaultUids = [
    '58kCsmKYkiPO5MXs50d9dfGZTl33',
    'StJtiHq69qUr1sSCQHNM6V2n94l1',
    '0RIaflqb1DXhcyhNOb8MHolEtPg1',
    'eMskuHQcjmb2knuPFt9QemlkAMf2',
];
/**
 * サブ画像が存在しないプロフィール画像のサブ画像を生成するCloud Function
 * @param req HTTPリクエスト (クエリパラメータ uids=uid1,uid2,... で特定のユーザーのみ処理可能)
 * @param res HTTPレスポンス
 */
exports.makeSubImages = (0, https_1.onRequest)({ region: 'us-central1', timeoutSeconds: 300, memory: '2GiB' }, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    firebase_functions_1.logger.log('✅ makeSubImages function triggered');
    try {
        // クエリパラメータからUIDを取得、なければデフォルト値を使用
        const uids = req.query.uids
            ? String(req.query.uids).split(',')
            : defaultUids;
        firebase_functions_1.logger.log(`📋 Processing ${uids.length} users`);
        // 進捗追跡用の変数
        const totalUids = uids.length;
        let processedUids = 0;
        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;
        const bucket = firebase_admin_1.fireStorage;
        // バッチサイズ（同時に処理するUIDの数）
        const batchSize = 5;
        // バッチ処理による並列化
        for (let i = 0; i < uids.length; i += batchSize) {
            const batch = uids.slice(i, i + batchSize);
            yield Promise.all(batch.map((uid) => __awaiter(void 0, void 0, void 0, function* () {
                let tmpFiles = [];
                try {
                    const prefix = `profiles/${uid}/`;
                    const [files] = yield bucket.getFiles({ prefix });
                    // サブ画像のパターンに一致しないファイルを探す（オリジナル画像）
                    const originalFiles = files.filter(file => {
                        const fileName = path.basename(file.name);
                        return !targets.some(({ suffix }) => fileName.includes(suffix + '.'));
                    });
                    if (originalFiles.length === 0) {
                        firebase_functions_1.logger.log(`❌ No original image found for UID: ${uid}`);
                        skippedCount++;
                        return;
                    }
                    // 最初のオリジナル画像を使用
                    const originalFile = originalFiles[0];
                    const filePath = originalFile.name;
                    const { dir: fileDir, name: baseName, ext } = path.parse(filePath);
                    // 一時ファイルパス
                    const tmpOrig = path.join(os.tmpdir(), `${baseName}${ext}`);
                    tmpFiles.push(tmpOrig);
                    // オリジナル画像をダウンロード
                    yield originalFile.download({ destination: tmpOrig });
                    // 画像フォーマット検証
                    try {
                        yield (0, sharp_1.default)(tmpOrig).metadata();
                    }
                    catch (err) {
                        firebase_functions_1.logger.error(`❌ Invalid image file for UID ${uid}: ${filePath}`, err);
                        errorCount++;
                        return;
                    }
                    // 各サイズのサブ画像を処理
                    for (const { suffix, width } of targets) {
                        const dstName = `${baseName}${suffix}.jpg`;
                        const dstPath = path.join(fileDir, dstName);
                        // 既に存在するかチェック
                        const exists = files.some(f => f.name === dstPath);
                        if (exists) {
                            firebase_functions_1.logger.log(`🟡 Already exists: ${dstPath}`);
                            continue;
                        }
                        // 一時出力ファイルパス
                        const tmpOut = path.join(os.tmpdir(), dstName);
                        tmpFiles.push(tmpOut);
                        // 画像処理
                        let transformer = (0, sharp_1.default)(tmpOrig);
                        if (width) {
                            transformer = transformer.resize(width);
                        }
                        yield transformer
                            .jpeg({ quality: 70, progressive: true, mozjpeg: true })
                            .toFile(tmpOut);
                        // アップロード
                        yield bucket.upload(tmpOut, {
                            destination: dstPath,
                            metadata: {
                                contentType: 'image/jpeg',
                                cacheControl: 'public,max-age=31536000',
                            },
                        });
                        firebase_functions_1.logger.log(`✅ Created: ${dstPath}`);
                    }
                    firebase_functions_1.logger.log(`🎉 Sub-images generated for UID: ${uid}`);
                    successCount++;
                }
                catch (err) {
                    firebase_functions_1.logger.error(`❌ Error processing UID ${uid}:`, err);
                    errorCount++;
                }
                finally {
                    // 一時ファイルの確実な削除
                    for (const tmpFile of tmpFiles) {
                        if (fs.existsSync(tmpFile)) {
                            try {
                                fs.unlinkSync(tmpFile);
                            }
                            catch (e) {
                                firebase_functions_1.logger.warn(`Failed to delete temp file: ${tmpFile}`, e);
                            }
                        }
                    }
                    // メモリ解放を明示的に促す（オプション）
                    if (global.gc) {
                        global.gc();
                    }
                }
            })));
            // バッチ処理後の進捗更新
            processedUids += batch.length;
            firebase_functions_1.logger.log(`📊 Progress: ${processedUids}/${totalUids} (${Math.round(processedUids / totalUids * 100)}%), Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`);
        }
        // 最終結果
        const result = {
            message: 'Sub-image generation completed',
            stats: {
                total: totalUids,
                success: successCount,
                error: errorCount,
                skipped: skippedCount
            }
        };
        firebase_functions_1.logger.log(`✅ Complete: ${JSON.stringify(result)}`);
        res.status(200).send(result);
    }
    catch (err) {
        firebase_functions_1.logger.error('❌ Fatal error:', err);
        res.status(500).send({
            error: 'An error occurred during sub-image generation',
            message: err.message
        });
    }
}));

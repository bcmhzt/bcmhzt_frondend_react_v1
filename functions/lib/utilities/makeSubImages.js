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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
/**
 * _original, _large, _medium, _small, _thumbnailがない画像を検索して、
 * ない場合は画像を生成する。
 * その前にタスクの軽量化のため無駄なFirebase Authenticationのアカウントを削除する。
 *
 * Trigger:
 * curl http://localhost:5001/bcmhzt-b25e9/us-central1/makeSubImages
 * curl https://us-central1-bcmhzt-b25e9.cloudfunctions.net/makeSubImages

 *
 */
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
    'Ptp2VzffuSOklLbFADqeSEvgbXW2',
    '58kCsmKYkiPO5MXs50d9dfGZTl33',
    'zrTgTgyLfnbVmy0CJyc1poyf0Wu2',
    'eMskuHQcjmb2knuPFt9QemlkAMf2',
    '0RIaflqb1DXhcyhNOb8MHolEtPg1',
    'tICbfo6CUzgfqytgezsKnoT4Jux1',
    'StJtiHq69qUr1sSCQHNM6V2n94l1',
    'rLgA6ZP4hPVegLhddIQON85xdP13',
    'ozDDFGt6zDYMOc8sBtjcySJbCtj1',
    'JI7AIoBJSEgVhU4Qk9ZUkPiqhMG2',
    '8t8dI3lWA7TrPZQR90hZkm5oLHl2',
    'ASLy3TW54Scxvv6H840owOYKXmG3',
    '9O9zH8h897SfvyyIGOtN0aXBiak2',
    'nXcpcAbHoMcv68kvvb1jjxwtoaP2',
    'rwrjnOEHDHSUPzwbqlPC7pMDaAv2',
    'A1wGlLH02HatqNaqdz7feanzLzg2',
    'm7g2nwW8UHQkHEmrjZ3l4soTrqD3',
    'pTS0i6bDqWPxdfslfXRlsCCtRcz2',
    'gHAMZOge6BPVa7hmFFqOqW82vHC3',
    'p2AxdCDvUMcaPtvEopErEMWPkcj2',
    'Mm1fNNoNcZdauMEIN55jB3jnhqN2',
    'EFKEtNqEvsNOCGFZRupRCuw7Xjf2',
    'cIDQIh8rvoUFrk3KAbEQby3opXS2',
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
                const tmpFiles = [];
                try {
                    const prefix = `profiles/${uid}/`;
                    firebase_functions_1.logger.log(`🔍 Looking for files in: ${prefix}`);
                    const [files] = yield bucket.getFiles({ prefix });
                    firebase_functions_1.logger.log(`📁 Found ${files.length} files for UID: ${uid}`);
                    // 元のプロフィール画像を検索
                    // profiles/{uid}/{uid}.jpg または profiles/{uid}/{uid}.png などを探す
                    const originalFiles = files.filter(file => {
                        const fileName = path.basename(file.name);
                        // {uid}.jpg または {uid}.png などのパターンを検索
                        return fileName.startsWith(uid) &&
                            !fileName.includes('_original') &&
                            !fileName.includes('_large') &&
                            !fileName.includes('_medium') &&
                            !fileName.includes('_small') &&
                            !fileName.includes('_thumbnail');
                    });
                    firebase_functions_1.logger.log(`🖼️ Original files found: ${originalFiles.length} for UID: ${uid}`);
                    originalFiles.forEach(file => {
                        firebase_functions_1.logger.log(`   - ${file.name}`);
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
                    firebase_functions_1.logger.log(`🔄 Processing original image: ${filePath}`);
                    firebase_functions_1.logger.log(`   - Directory: ${fileDir}`);
                    firebase_functions_1.logger.log(`   - Base name: ${baseName}`);
                    firebase_functions_1.logger.log(`   - Extension: ${ext}`);
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
                        firebase_functions_1.logger.log(`🔨 Creating: ${dstPath}`);
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
            message: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}));

"use strict";
// functions/src/uploads/resizeImage.ts
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
exports.resizeImage = void 0;
const storage_1 = require("firebase-functions/v2/storage");
const firebase_functions_1 = require("firebase-functions");
// import { initializeApp }     from 'firebase-admin/app';
// import { getStorage }        from 'firebase-admin/storage';
const firebase_admin_1 = require("../firebase_admin");
const sharp_1 = __importDefault(require("sharp"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// オリジナルは width を指定せず、リサイズスキップ
const targets = [
    { suffix: '_original' }, // 元サイズをそのまま JPEG 化
    { suffix: '_large', width: 1280 },
    { suffix: '_medium', width: 640 },
    { suffix: '_small', width: 320 },
    { suffix: '_thumbnail', width: 100 },
];
exports.resizeImage = (0, storage_1.onObjectFinalized)({ region: 'us-central1', memory: '1GiB', timeoutSeconds: 120 }, (event) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = event.data.name;
    const contentType = event.data.contentType || '';
    if (!contentType.startsWith('image/'))
        return;
    const skipSuffixes = targets.map(t => t.suffix);
    if (skipSuffixes.some(suffix => filePath.includes(`${suffix}.jpg`))) {
        firebase_functions_1.logger.info(`Skipping already processed file: ${filePath}`);
        return;
    }
    if (!contentType.startsWith('image/'))
        return;
    // const bucket   = getStorage().bucket(event.data.bucket);
    const bucket = firebase_admin_1.fireStorage;
    const dir = path.dirname(filePath);
    const { name, ext } = path.parse(path.basename(filePath));
    // 一時ダウンロード
    const tmpOrig = path.join(os.tmpdir(), `${name}${ext}`);
    yield bucket.file(filePath).download({ destination: tmpOrig });
    // 各ターゲットを JPEG 化
    for (const { suffix, width } of targets) {
        const outName = `${name}${suffix}.jpg`;
        const tmpOut = path.join(os.tmpdir(), outName);
        const dstPath = path.join(dir, outName);
        // Transformer を組み立て
        let transformer = (0, sharp_1.default)(tmpOrig);
        if (width) {
            transformer = transformer.resize(width); // width だけ指定 ⇒ 高さは自動
        }
        // JPEG 出力 with 中程度圧縮
        yield transformer
            .jpeg({ quality: 70, progressive: true, mozjpeg: true })
            .toFile(tmpOut);
        // Storage へアップロード
        yield bucket.upload(tmpOut, {
            destination: dstPath,
            metadata: {
                contentType: 'image/jpeg',
                cacheControl: 'public,max-age=31536000',
            },
        });
        fs.unlinkSync(tmpOut);
    }
    fs.unlinkSync(tmpOrig);
    firebase_functions_1.logger.info(`All images converted to JPEG for ${filePath}`);
}));

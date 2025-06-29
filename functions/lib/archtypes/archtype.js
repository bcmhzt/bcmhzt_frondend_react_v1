"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFiles = void 0;
// functions/src/archtypes/archtype.ts
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const firebase_admin_1 = require("../firebase_admin");
exports.listFiles = (0, https_1.onRequest)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // クエリ param ?dir=path/to/folder/
    // curl "https://us‑central1-bcmhzt-b25e9.cloudfunctions.net/listFiles?dir=profiles/0RIaflqb1DXhcyhNOb8MHolEtPg1/"
    var _a;
    const dir = (_a = req.query.dir) !== null && _a !== void 0 ? _a : '';
    const prefix = dir.replace(/^\/+/, ''); // 先頭 '/' を除去
    try {
        // 指定 prefix 配下のオブジェクトを列挙
        const [files] = yield firebase_admin_1.fireStorage.getFiles({ prefix });
        const paths = files.map(f => f.name);
        firebase_functions_1.logger.info('Listed files', { prefix, count: paths.length });
        res.json({ ok: true, path: prefix, files: paths });
    }
    catch (err) {
        firebase_functions_1.logger.error('Failed to list files', { prefix, err });
        res.status(500).json({ ok: false, error: err.message });
    }
}));

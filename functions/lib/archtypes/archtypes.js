"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = void 0;
// functions/src/index.ts
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
exports.helloWorld = (0, https_1.onRequest)((req, res) => {
    firebase_functions_1.logger.log('✅ Hello world function was triggered!');
    res.send('Hello from Firebase Functions (TypeScript)!');
});

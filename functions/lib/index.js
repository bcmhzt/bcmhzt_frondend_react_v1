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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = void 0;
// 9b8f1859
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
/**
 * HTTP Trigger: curl http://localhost:5001/bcmhzt-b25e9/us-central1/hello
 */
exports.hello = (0, https_1.onRequest)({
    region: 'us-central1',
    invoker: 'public',
}, (_req, res) => {
    const name = 'World';
    firebase_functions_1.logger.info('✅ [logger.info] Hello world, cloud function http triggered !', [name]);
    res.send('☀️ [res.send] Hello world, cloud function http triggered !\n');
    console.log('☹️ [console.log] Hello world, cloud function http triggered !\n');
});
/** for test */
__exportStar(require("./uploads/logUpload"), exports);
/** upload image resize */
__exportStar(require("./uploads/resizeImage"), exports);
/** Functions archtype for develop */
__exportStar(require("./archtypes/archtype"), exports);
/** Functions archtype for develop */
__exportStar(require("./utilities/makeSubImages"), exports);

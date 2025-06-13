// functions/src/uploads/resizeImage.ts

import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { logger }            from 'firebase-functions';
// import { initializeApp }     from 'firebase-admin/app';
// import { getStorage }        from 'firebase-admin/storage';
import { fireStorage } from '../firebase_admin';
import sharp                 from 'sharp';
import * as os               from 'os';
import * as path             from 'path';
import * as fs               from 'fs';

// initializeApp();

// width を optional に変更
interface ResizeTarget {
  suffix: string;
  width?: number;  // number か undefined
}

// オリジナルは width を指定せず、リサイズスキップ
const targets: ResizeTarget[] = [
  { suffix: '_original'    },  // 元サイズをそのまま JPEG 化
  { suffix: '_large',     width: 1280 },
  { suffix: '_medium',    width: 640  },
  { suffix: '_small',     width: 320  },
  { suffix: '_thumbnail', width: 100  },
];

export const resizeImage = onObjectFinalized(
  { region: 'us-central1', memory: '1GiB', timeoutSeconds: 120 },
  async (event) => {
    const filePath    = event.data.name!;
    const contentType = event.data.contentType || '';
    if (!contentType.startsWith('image/')) return;

    const skipSuffixes = targets.map(t => t.suffix);
    if (skipSuffixes.some(suffix => filePath.includes(`${suffix}.jpg`))) {
      logger.info(`Skipping already processed file: ${filePath}`);
      return;
    }
    if (!contentType.startsWith('image/')) return;

    // const bucket   = getStorage().bucket(event.data.bucket);
    const bucket   = fireStorage;
    const dir      = path.dirname(filePath);
    const { name, ext } = path.parse(path.basename(filePath));

    // 一時ダウンロード
    const tmpOrig = path.join(os.tmpdir(), `${name}${ext}`);
    await bucket.file(filePath).download({ destination: tmpOrig });

    // 各ターゲットを JPEG 化
    for (const { suffix, width } of targets) {
      const outName = `${name}${suffix}.jpg`;
      const tmpOut  = path.join(os.tmpdir(), outName);
      const dstPath = path.join(dir, outName);

      // Transformer を組み立て
      let transformer = sharp(tmpOrig);
      if (width) {
        transformer = transformer.resize(width);  // width だけ指定 ⇒ 高さは自動
      }

      // JPEG 出力 with 中程度圧縮
      await transformer
        .jpeg({ quality: 70, progressive: true, mozjpeg: true })
        .toFile(tmpOut);

      // Storage へアップロード
      await bucket.upload(tmpOut, {
        destination: dstPath,
        metadata: {
          contentType: 'image/jpeg',
          cacheControl: 'public,max-age=31536000',
        },
      });

      fs.unlinkSync(tmpOut);
    }

    fs.unlinkSync(tmpOrig);
    logger.info(`All images converted to JPEG for ${filePath}`);
  }
);

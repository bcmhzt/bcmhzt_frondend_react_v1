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
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { fireStorage } from '../firebase_admin';
import sharp from 'sharp';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

interface ResizeTarget {
  suffix: string;
  width?: number;
}

const targets: ResizeTarget[] = [
  { suffix: '_original' },
  { suffix: '_large', width: 1280 },
  { suffix: '_medium', width: 640 },
  { suffix: '_small', width: 320 },
  { suffix: '_thumbnail', width: 100 },
];

// 手動指定したUID配列（初期運用）
const defaultUids = [
  '58kCsmKYkiPO5MXs50d9dfGZTl33',//膝つき緊縛 開発用ユーザー@309-cea6fc1b
  'StJtiHq69qUr1sSCQHNM6V2n94l1',//デビルマン 森利散@b60-22070ec4
  '0RIaflqb1DXhcyhNOb8MHolEtPg1',//ミロのビーナス roughlangx+b@0d0-7a20f08e
  'eMskuHQcjmb2knuPFt9QemlkAMf2',//戦国武将が猫の散歩しているやつ osamu@061-7013c6d5
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
export const makeSubImages = onRequest(
  { region: 'us-central1', timeoutSeconds: 300, memory: '2GiB' },
  async (req, res) => {
    logger.log('✅ makeSubImages function triggered');
    
    try {
      // クエリパラメータからUIDを取得、なければデフォルト値を使用
      const uids = req.query.uids 
        ? String(req.query.uids).split(',') 
        : defaultUids;
      
      logger.log(`📋 Processing ${uids.length} users`);
      
      // 進捗追跡用の変数
      const totalUids = uids.length;
      let processedUids = 0;
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      
      const bucket = fireStorage;
      
      // バッチサイズ（同時に処理するUIDの数）
      const batchSize = 5;
      
      // バッチ処理による並列化
      for (let i = 0; i < uids.length; i += batchSize) {
        const batch = uids.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (uid) => {
            const tmpFiles: string[] = [];
            
            try {
              const prefix = `profiles/${uid}/`;
              logger.log(`🔍 Looking for files in: ${prefix}`);
              const [files] = await bucket.getFiles({ prefix });
              
              logger.log(`📁 Found ${files.length} files for UID: ${uid}`);
              
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
              
              logger.log(`🖼️ Original files found: ${originalFiles.length} for UID: ${uid}`);
              originalFiles.forEach(file => {
                logger.log(`   - ${file.name}`);
              });
              
              if (originalFiles.length === 0) {
                logger.log(`❌ No original image found for UID: ${uid}`);
                skippedCount++;
                return;
              }
              
              // 最初のオリジナル画像を使用
              const originalFile = originalFiles[0];
              const filePath = originalFile.name;
              const { dir: fileDir, name: baseName, ext } = path.parse(filePath);
              
              logger.log(`🔄 Processing original image: ${filePath}`);
              logger.log(`   - Directory: ${fileDir}`);
              logger.log(`   - Base name: ${baseName}`);
              logger.log(`   - Extension: ${ext}`);
              
              // 一時ファイルパス
              const tmpOrig = path.join(os.tmpdir(), `${baseName}${ext}`);
              tmpFiles.push(tmpOrig);
              
              // オリジナル画像をダウンロード
              await originalFile.download({ destination: tmpOrig });
              
              // 画像フォーマット検証
              try {
                await sharp(tmpOrig).metadata();
              } catch (err) {
                logger.error(`❌ Invalid image file for UID ${uid}: ${filePath}`, err);
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
                  logger.log(`🟡 Already exists: ${dstPath}`);
                  continue;
                }
                
                logger.log(`🔨 Creating: ${dstPath}`);
                
                // 一時出力ファイルパス
                const tmpOut = path.join(os.tmpdir(), dstName);
                tmpFiles.push(tmpOut);
                
                // 画像処理
                let transformer = sharp(tmpOrig);
                if (width) {
                  transformer = transformer.resize(width);
                }
                
                await transformer
                  .jpeg({ quality: 70, progressive: true, mozjpeg: true })
                  .toFile(tmpOut);
                
                // アップロード
                await bucket.upload(tmpOut, {
                  destination: dstPath,
                  metadata: {
                    contentType: 'image/jpeg',
                    cacheControl: 'public,max-age=31536000',
                  },
                });
                
                logger.log(`✅ Created: ${dstPath}`);
              }
              
              logger.log(`🎉 Sub-images generated for UID: ${uid}`);
              successCount++;
            } catch (err) {
              logger.error(`❌ Error processing UID ${uid}:`, err);
              errorCount++;
            } finally {
              // 一時ファイルの確実な削除
              for (const tmpFile of tmpFiles) {
                if (fs.existsSync(tmpFile)) {
                  try {
                    fs.unlinkSync(tmpFile);
                  } catch (e) {
                    logger.warn(`Failed to delete temp file: ${tmpFile}`, e);
                  }
                }
              }
              
              // メモリ解放を明示的に促す（オプション）
              if (global.gc) {
                global.gc();
              }
            }
          })
        );
        
        // バッチ処理後の進捗更新
        processedUids += batch.length;
        logger.log(`📊 Progress: ${processedUids}/${totalUids} (${Math.round(processedUids/totalUids*100)}%), Success: ${successCount}, Errors: ${errorCount}, Skipped: ${skippedCount}`);
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
      
      logger.log(`✅ Complete: ${JSON.stringify(result)}`);
      res.status(200).send(result);
    } catch (err) {
      logger.error('❌ Fatal error:', err);
      res.status(500).send({
        error: 'An error occurred during sub-image generation',
        message: err.message
      });
    }
  }
);
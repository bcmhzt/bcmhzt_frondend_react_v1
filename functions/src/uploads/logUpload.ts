import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { logger }            from 'firebase-functions';

/**
 * アップロード完了時にファイル情報をログ出力するだけの関数
 * テスト用
 */
export const logUpload = onObjectFinalized(
  { region: 'us-central1' },   // ← 他の関数と同じリージョンに揃える
  (event) => {
    const { name, contentType, size } = event.data;
    logger.info('[logUpload] file:', { name, contentType, size });
  }
);

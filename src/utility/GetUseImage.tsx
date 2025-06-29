/**
 * 4e2692d6
 *
 * 画像URLのファイル名部分にsuffixを付与して返す
 * @param originalUrl オリジナル画像のURL
 * @param suffix 例: "_thumbnail", "_small"
 * @returns suffix付き画像URL
 */

export function getImageWithSuffix(
  originalUrl: string,
  suffix: string
): string {
  if (!originalUrl) return '';
  return originalUrl.replace(
    /([^/%]+)(\.[a-zA-Z0-9]+)(\?[^?]*)?$/,
    (match, filename, ext, query) => `${filename}${suffix}.jpg${query || ''}`
  );
}

/**
 * Avatar画像の表示
 * @param url ストレージのベースURL
 * @param path 画像パス
 * @param suffix サフィックス (_thumbnail など)
 * @param validateUrl 画像の存在確認を行うかどうか (デフォルト: false)
 * @returns Promise<string> 画像URL
 */
export const buildStorageUrl = (url: string, path: string, suffix?: string) => {
  // デフォルト画像パス
  const defaultImage = '/assets/images/dummy/dummy_avatar.png';
  if (!url || !path) return defaultImage;
  const path_suffix = path.replace(
    /([^/%]+)(\.[a-zA-Z0-9]+)(\?[^?]*)?$/,
    (match, filename, ext, query) => `${filename}${suffix}.jpg${query || ''}`
  );
  return `${url}${path_suffix}?alt=media`;
};

// export const buildStorageUrl = (url: string, path: string, suffix?: string) => {
//   // デフォルト画像パス
//   const defaultImage = '/assets/images/dummy/dummy_avatar.png';
//   if (!url || !path) return defaultImage;

//   try {
//     const path_suffix = path.replace(
//       /([^/%]+)(\.[a-zA-Z0-9]+)(\?[^?]*)?$/,
//       (match, filename, ext, query) => `${filename}${suffix}.jpg${query || ''}`
//     );
//     const fullUrl = `${url}${path_suffix}?alt=media`;

//     // 画像読み込みエラー時のフォールバック処理
//     if (typeof window !== 'undefined') {
//       const img = new Image();
//       img.onerror = () => {
//         img.src = defaultImage;
//         return defaultImage;
//       };
//       img.src = fullUrl;
//     }

//     return fullUrl;
//   } catch (error) {
//     console.error('[buildStorageUrl] Error:', error);
//     return defaultImage;
//   }
// };

/**
 * 投稿(POST)画像のURLにsuffixを付与して返す
 * @param originalUrl オリジナル画像のURL
 * @param suffix 例: "_thumbnail", "_small"
 * @returns suffix付き画像URL
 */
export const buildStoragePostImageUrl = (
  originalUrl: string,
  suffix: string
): string => {
  if (!originalUrl) return '';
  try {
    // URL とクエリを分離
    const [basePath, query = ''] = originalUrl.split('?');

    // パス末尾のファイル名 + 拡張子を置換
    const convertedPath = basePath.replace(
      /([^/]+?)(\.[a-zA-Z0-9]+)$/, // グループ1: ファイル名, グループ2: 拡張子
      (_, fileName /* ext は捨てる */) => `${fileName}${suffix}.jpg`
    );

    // クエリを付け直して返却
    return query ? `${convertedPath}?${query}` : convertedPath;
  } catch (e) {
    // 万一パース失敗しても元 URL を返す
    console.error('[buildStoragePostImageUrl] invalid url:', originalUrl, e);
    return originalUrl;
  }
};

/**
 * 画像URLの存在確認
 * @param url 確認するURL
 * @returns Promise<boolean>
 */
// const checkImageExists = async (url: string): Promise<boolean> => {
//   try {
//     const response = await fetch(url, { method: 'HEAD' });
//     return response.ok;
//   } catch {
//     return false;
//   }
// };

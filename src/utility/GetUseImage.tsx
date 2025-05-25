/**
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
    (match, filename, ext, query) => `${filename}${suffix}${ext}${query || ''}`
  );
}

/**
 * Avatar画像の表示
 * @param url
 * @param path
 * @param suffix
 * @returns
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

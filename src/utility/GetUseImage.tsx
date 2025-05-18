/**
 * 画像URLのファイル名部分にsuffixを付与して返す
 * @param originalUrl オリジナル画像のURL
 * @param suffix 例: "_thumbnail", "_small"
 * @returns suffix付き画像URL
 */

export function getImageWithSuffix(originalUrl: string, suffix: string): string {
  if (!originalUrl) return "";
  return originalUrl.replace(
    /([^/%]+)(\.[a-zA-Z0-9]+)(\?[^?]*)?$/,
    (match, filename, ext, query) => `${filename}${suffix}${ext}${query || ''}`
  );
}
/**
 * ラッコツール参照
 * pc-small
 * smartphone-small
 *
 * @param url
 * @param title
 * @param description
 * @param image
 * @returns
 */

export function UseOgpFrameWidth100(
  url: string,
  title: string,
  description: string,
  image: string
): string {
  return `
  <div class="ogp-item d-flex flex-row align-items-start justify-content-start">
      <div class="image me-3">
        <img src="${image}" alt="${title}" />
      </div>
      <div class="text">
        <div class="title"><a href="${url}">${title}</a></div>
        <div class="description">${description}</div>
      </div>
  </div>
  `;
}

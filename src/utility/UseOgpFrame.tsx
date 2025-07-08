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
  const ReactDOMServer = require('react-dom/server');
  // const truncatedTitle =
  //   title.length > 33 ? title.substring(0, 33) + '...' : title;
  return ReactDOMServer.renderToStaticMarkup(
    <div className="ogp-item d-flex flex-row align-items-start justify-content-start">
      <div className="image mr10">
        <img src={image} alt={title} />
      </div>
      <div className="text">
        <div className="title">
          <a href={url}>{title}</a>
        </div>
        <div className="description">{description}</div>
      </div>
    </div>
  );
}

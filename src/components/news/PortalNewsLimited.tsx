import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
/** ff9072e3 */

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/news/PortalNewsLimited.tsx:xx] debug:', debug);
}

/**
 * ff9072e3
 * [src/pages/Archtect.tsx:xx]
 *
 * type: page | component | hook | context ...
 *
 * [Order]
 * - Granada - Portal Wordpress:: https://portal.bcmhzt.net
 * - News/お知らせを読み込むコンポーネント
 */

const PortalNewsLimited = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          'https://portal.bcmhzt.net/wp-json/wp/v2/news'
        );
        console.log(
          '[src/components/news/PortalNewsLimited.tsx:34] response.data:',
          response.data
        );
        setNews(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.log(
          '[src/components/news/PortalNewsLimited.tsx:41] err.message:',
          err.message
        );
        setError(err.message || 'Error fetching news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="news">
        <h2 className="title mb30">
          <span className="title1">お</span>
          <span className="title2">知</span>
          <span className="title3">ら</span>
          <span className="title4">せ</span>
          <span className="subtitle">news</span>
        </h2>
        <div className="top-news">
          {error && <div className="error">{error}</div>}
          {!error && news.length === 0 && (
            <div className="no-news">No news available</div>
          )}
          {news.map((item, index) => (
            <div className="news-item" key={index} id={`news-${item.id}`}>
              <div className="news-date">
                {(() => {
                  const dateObj = new Date(item.date);
                  const dateStr = dateObj
                    .toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      weekday: 'short',
                    })
                    .replace(/\//g, '-')
                    .replace(
                      /(\d{4})-(\d{2})-(\d{2})\((.+)\)/,
                      '$1-$2-$3 ($4)'
                    );
                  const timeStr = dateObj.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                  return `${dateStr} ${timeStr}`;
                })()}
              </div>
              <div className="news-title mb10">
                {item?.title?.rendered || 'No Title'}
              </div>
              <span className="news-description">
                <span
                  dangerouslySetInnerHTML={{ __html: item?.content?.rendered }}
                />
                <Link
                  to={item?.link}
                  className="read-more-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ...read more
                </Link>
              </span>
              {/* <pre>{JSON.stringify(item?.title?.rendered, null, 2)}</pre> */}
            </div>
          ))}

          {/* <pre>{JSON.stringify(news, null, 2)}</pre> */}
        </div>
      </div>
    </>
  );
};
export default PortalNewsLimited;

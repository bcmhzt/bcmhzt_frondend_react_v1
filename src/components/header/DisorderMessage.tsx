/** 21c61f78 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DisorderMessageProps {}

interface NewsItem {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  categories: number[];
  tags: number[];
}

/**
 * カテゴリー:10 (お知らせ)
 * タグ:20 (緊急), 19 (障害情報)
 * の記事だけヘッダーに表示するコンポーネント
 *
 * "categories": [10],"tags": [20,19],
 *
 * @returns
 */
const DisorderMessage: React.FC<DisorderMessageProps> = () => {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          'https://portal.bcmhzt.net/wp-json/wp/v2/news'
        );

        // カテゴリー10、タグ19,20を持つ記事をフィルタリング
        const filteredNews = response.data.filter(
          (item: NewsItem) =>
            item.categories.includes(10) &&
            item.tags.includes(19) &&
            item.tags.includes(20)
        );

        // 日付でソートして最新の記事を取得
        const latestNews =
          filteredNews.sort(
            (a: NewsItem, b: NewsItem) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0] || null;

        setNews(latestNews as NewsItem | null);
      } catch (err: any) {
        console.error('Error fetching news:', err.message);
        setError(err.message || 'Error fetching news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // 記事が存在しない場合は何も表示しない
  if (!news || loading) return null;

  return (
    <>
      {error ? (
        <>Error</>
      ) : (
        <div className="disorder-message mb10">
          {/* <pre>{JSON.stringify(news, null, 2)}</pre> */}
          <div className="container">
            <div className="row">
              <div className="col mb10">
                <span>障害情報 :: </span> {news?.title.rendered}
                <br />
                <span
                  className="text-muted"
                  dangerouslySetInnerHTML={{ __html: news?.content.rendered }}
                ></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisorderMessage;

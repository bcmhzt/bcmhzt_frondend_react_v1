/** 0423bb2b */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from 'microcms-js-sdk';
import { Modal } from 'react-bootstrap';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/NewsLimited.js:8] debug:', debug);
}

/**
 * 0423bb2b
 * [src/components/NewsLimited.js:XX]
 * news limited	news_limited	newsLimited	NewsLimited	news/limited
 * type: page | component
 * [Order]
 * NewsLimitedはmicrocmsのニュースから最新5件を取得し表示する
 *
 */

const NewsLimited = () => {
  const [messages, setMessages] = useState<Messages | null>(null);
  const mcmcServiceDomain = process.env.REACT_APP_MICROCMS_SERVICE_DOMAIN;
  const mcmcApikey = process.env.REACT_APP_MICROCMS_APIKEY;

  if (!mcmcServiceDomain || !mcmcApikey) {
    throw new Error(
      'MICROCMS_SERVICE_DOMAIN and MICROCMS_APIKEY must be defined in environment variables.'
    );
  }
  const client = useRef(
    createClient({
      serviceDomain: mcmcServiceDomain as string,
      apiKey: mcmcApikey as string,
    })
  ).current;

  /* MicroCMS */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await client.get({
          endpoint: 'new',
          queries: { limit: 5 },
        });
        setMessages(data);
        if (debug === 'true') {
          console.log('[src/pages/Top.js:48] API response:', data);
        }
      } catch (error) {
        console.error(
          '[src/pages/Top.js:53] Error fetching API response:',
          error
        );
      }
    };
    fetchData();
  }, [client]);

  /* news article more read... */
  interface NewsContent {
    id: string;
    createdAt: string;
    updatedAt: string;
    revisedAt: string;
    title: string;
    message: string;
    [key: string]: any;
  }

  interface Messages {
    contents: NewsContent[];
    [key: string]: any;
  }

  const [modalContent, setModalContent] = useState<NewsContent | null>(null);
  const [showFullModal, setShowFullModal] = useState<boolean>(false);

  const handleShowFullModal = (content: NewsContent) => {
    setModalContent(content);
    setShowFullModal(true);
  };

  /**
   * componentではbootstrapのgridは全幅のcontainerで囲む
   * Gridはページ側で設定する
   *
   */
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
          {messages && messages.contents ? (
            messages.contents.map((value, idx) => (
              <React.Fragment key={value.id || idx}>
                <div className="news-item">
                  <div id={value.id.toString()}>
                    {/* {value.createdAt.toString()} */}
                    {/* {value.updatedAt.toString()} */}
                    {/* {value.revisedAt.toString()} */}
                    <span className="news-title">
                      {value.title.toString()}:{' '}
                    </span>
                    <span>
                      {value.message.replace(/<\/?[^>]+(>|$)/g, '').length > 250
                        ? value.message
                            .replace(/<\/?[^>]+(>|$)/g, '')
                            .slice(0, 250) + ' ... '
                        : value.message.replace(/<\/?[^>]+(>|$)/g, '')}
                    </span>
                    {value.message.replace(/<\/?[^>]+(>|$)/g, '').length >
                      250 && (
                      <button
                        type="button"
                        className="read-more-link btn btn-link p-0"
                        onClick={() => handleShowFullModal(value)}
                      >
                        read more
                      </button>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      <div className="list-link text-end">
        <Link
          className="read-more-link"
          to="/news"
          style={{ textDecoration: 'none', color: '#457B9D' }}
        >
          お知らせ一覧
        </Link>
      </div>

      {/* Full message modal */}
      <Modal
        size="lg"
        show={showFullModal}
        onHide={() => setShowFullModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalContent?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            dangerouslySetInnerHTML={{ __html: modalContent?.message ?? '' }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};
export default NewsLimited;

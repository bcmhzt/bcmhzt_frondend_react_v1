/** d722bfa8 */
import React, { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import NoticeList from '../../components/notice/NoticeList';
import { useBadge } from '../../contexts/BadgeContext';

const Notice = () => {
  const { clearBadge } = useBadge();
  useEffect(() => {
    // ページ初回マウント時に members のバッジをクリア
    clearBadge('notice');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            <NoticeList />
          </div>
          <div className="d-none d-md-block col-md-6 bc-right">
            <div
              style={{ background: '#f1f1f1', height: '100%', padding: '20px' }}
            >
              広告エリア / サブエリア
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Notice;

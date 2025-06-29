/** 201c651f */
import React, { useEffect } from 'react';
/* header */
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/* tools */
// import PostBoard from '../../components/PostBoard';
// import FooterTool from '../../components/FooterTool';
import MemberList from '../..//components/members/Memberlist';
// import Imagelist from '../../components/v1/member/Imagelist';
import { useBadge } from '../../contexts/BadgeContext';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/member/Members.tsx:xx] debug:', debug);
}

/**
 * 201c651f (hash)
 * [src/pages/member/Members.tsx:xx]
 *
 * type: page
 *
 * [Order]
 * - 各Componentの雛形
 */

/* ユーザーリスト */
const Members = () => {
  const { clearBadge } = useBadge();
  useEffect(() => {
    // ページ初回マウント時に members のバッジをクリア
    clearBadge('members');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="app-body">
      <Header />

      {/* <PostBoard />
      <FooterTool /> */}

      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            <h2 className="page-title mb20">Members</h2>
            <MemberList />
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
export default Members;

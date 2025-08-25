/**
 * 9827f3b4
 * f4ad7440 (いいね)
 */
import React, { useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PostList from '../../components/posts/PostList';
import PostIndexHeader from './PostIndexHeader';
import { useBadge } from '../../contexts/BadgeContext';

const Posts = () => {
  const { clearBadge } = useBadge();
  useEffect(() => {
    // ページ初回マウント時に members のバッジをクリア
    clearBadge('posts');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div
            className="col-12 col-md-6 bc-left"
            style={{ position: 'relative' }}
          >
            <h2 className="page-title mb20">Posts</h2>
            <PostIndexHeader page={window.location.pathname} />
            <PostList />
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
export default Posts;

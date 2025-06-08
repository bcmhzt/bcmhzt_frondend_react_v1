/** 673c9953 */
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PostIndexHeader from './PostIndexHeader';

const PostsReplyList = () => {
  return (
    <>
      <div className="app-body">
        <Header />
        <div className="container bc-app">
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              <PostIndexHeader page={window.location.pathname} />
              投稿の返信リスト PostsReplyList
            </div>
            <div className="d-none d-md-block col-md-6 bc-right">
              <div
                style={{
                  background: '#f1f1f1',
                  height: '100%',
                  padding: '20px',
                }}
              >
                広告エリア / サブエリア
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};
export default PostsReplyList;

/** 673c9953 */
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PostIndexHeader from './PostIndexHeader';
import PostsReplyList from '../../components/posts/PostsReplyList';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { useInfiniteQuery } from '@tanstack/react-query';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/posts/PostsReply.tsx] debug:', debug);
}

const PostsReply = () => {
  const { currentUserProfile, token } = useAuth();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT as string;

  return (
    <>
      <div className="app-body">
        <Header />
        <div className="container bc-app">
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              <PostIndexHeader page={window.location.pathname} />
              <PostsReplyList />
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
export default PostsReply;

import { Link } from 'react-router-dom';
import React from 'react';

type PostIndexHeaderProps = {
  page: string;
};

const PostIndexHeader: React.FC<PostIndexHeaderProps> = ({ page }) => {
  console.log(
    '[src/pages/posts/PostIndexHeader.tsx:7] PostIndexHeaderProps:',
    page
  );
  return (
    <>
      <div className="post-index-header d-flex justify-content-around mb20">
        <div className={`pih-posts pih${page === '/posts' ? ' active' : ''}`}>
          <Link to="/posts">投稿</Link>
        </div>
        <div
          className={`pih-posts pih${page === '/posts_like' ? ' active' : ''}`}
        >
          <Link to="/posts_like">いいね</Link>
        </div>
        <div
          className={`pih-posts pih${page === '/posts_reply' ? ' active' : ''}`}
        >
          <Link to="/posts_reply">返信</Link>
        </div>
        <div
          className={`pih-posts pih${page === '/posts_bookmark' ? ' active' : ''}`}
        >
          <Link to="/posts_bookmark">ブックマーク</Link>
        </div>
        <div
          className={`pih-posts pih${page === '/posts_media' ? ' active' : ''}`}
        >
          <Link to="/posts_media">メディア</Link>
        </div>
      </div>
    </>
  );
};
export default PostIndexHeader;

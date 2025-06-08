/** 36343bf4 */
import React, { useEffect, useState } from 'react';
import { Bookmark, BookmarkFill } from 'react-bootstrap-icons';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
// import { PostData } from './PostList';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/posts/PostBookmark.tsx:xx] debug:', debug);
}

interface PostBookmarkProps {
  item: {
    post_id: number;
    uid: string;
    likes_count?: number;
    [key: string]: any;
  };
}

const PostBookmark: React.FC<PostBookmarkProps> = ({ item }) => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { currentUser, token } = useAuth();
  const [bookmarkStatus, setBookmarkStatus] = useState<boolean>(false);
  const [bookmarkCount, setBookmarkCount] = useState<number>(
    item.bookmark_count ?? 0
  );

  useEffect(() => {
    const fetchPostBookmarkStatus = async () => {
      if (!currentUser || !token) return;
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/get/post_bookmark_status/${item.post_id}`,
          {
            post_id: item.post_id,
            uid: currentUser.uid,
            target_uid: item.uid,
            reason: 'like test from frontend',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        //response
        if (debug === 'true') {
          console.log(
            '[src/components/posts/PostBookmark.tsx:47] response:',
            response
          );
        }
        setBookmarkStatus(response.data.data.status === true);
        setBookmarkCount(response.data.data.bookmark_count ?? 0); // ← 追加
      } catch (error) {
        if (debug === 'true') {
          console.log(
            '[src/components/posts/PostBookmark.tsx:46] error:',
            error
          );
        }
      }
    };
    fetchPostBookmarkStatus();
  }, [
    currentUser,
    apiEndpoint,
    token,
    item.post_id,
    item.uid,
    item.likes_count,
  ]);

  const handleOpen = async () => {
    if (!currentUser || !token) return;
    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/toggle/post_bookmark`,
        {
          post_id: item.post_id,
          uid: currentUser.uid,
          target_uid: item.uid,
          reason: 'Bookmark test from frontend',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') {
        console.log(
          '[src/components/posts/PostBookmark.tsx:86] response:',
          response
        );
      }
      const action = response.data.data.action;
      if (action === 'created') {
        setBookmarkStatus(true);
        setBookmarkCount(
          response.data.data.bookmark_count ?? ((prev) => prev + 1)
        );
      } else if (action === 'deleted') {
        setBookmarkStatus(false);
        setBookmarkCount(
          response.data.data.bookmark_count ??
            ((prev) => (prev > 0 ? prev - 1 : 0))
        );
      }
      if (debug === 'true') {
        console.log(
          '[src/components/posts/PostBookmark.tsx:94] bookmarkCount:',
          bookmarkCount
        );
      }
    } catch (error) {}
    console.log(
      '[src/components/posts/PostBookmark.tsx:xx] Bookmark clicked for post:',
      item.post_id
    );
  };

  return (
    <>
      <div className="bookmark-button">
        {bookmarkStatus ? (
          <BookmarkFill
            style={{
              fontSize: '20px',
              color: '#000099',
              verticalAlign: 'middle',
            }}
            onClick={handleOpen}
          />
        ) : (
          <Bookmark
            style={{
              fontSize: '20px',
              color: '#c1c1c1c1',
              verticalAlign: 'middle',
            }}
            onClick={handleOpen}
          />
        )}
        <span className="badge bg-secondary ms-1">{bookmarkCount}</span>
      </div>
    </>
  );
};
export default PostBookmark;

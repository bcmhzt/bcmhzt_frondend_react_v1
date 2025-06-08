/** 522cbc68 */
import React, { useEffect, useState } from 'react';
import { Heart, HeartFill } from 'react-bootstrap-icons';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/posts/PostLike.tsx] debug:', debug);
}

export interface PostLikeProps {
  item: {
    post_id: number;
    uid: string;
    likes_count?: number;
    [key: string]: any;
  };
}

const PostLike: React.FC<PostLikeProps> = ({ item }) => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { currentUser, token } = useAuth();
  const [likeStatus, setLikeStatus] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(item.likes_count ?? 0);

  useEffect(() => {
    const fetchPostLikeStatus = async () => {
      if (!currentUser || !token) return;
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/get/post_like_status/${item.post_id}`,
          {
            post_id: item.post_id,
            uid: currentUser.uid,
            target_uid: item.uid,
            reason: 'like test from frontend',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikeStatus(response.data.data.status === true);
      } catch (error) {
        if (debug === 'true') {
          console.log('[src/components/posts/PostLike.tsx] error:', error);
        }
      }
    };
    fetchPostLikeStatus();
    setLikesCount(item.likes_count ?? 0); // itemが変わった時もlikesCountを初期化
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
        `${apiEndpoint}/v1/toggle/postlike`,
        {
          post_id: item.post_id,
          uid: currentUser.uid,
          target_uid: item.uid,
          reason: 'like test from frontend',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const action = response.data.data.action;
      if (action === 'created') {
        setLikeStatus(true);
        setLikesCount((prev) => prev + 1);
      } else if (action === 'deleted') {
        setLikeStatus(false);
        setLikesCount((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } catch (error) {
      if (debug === 'true') {
        console.log('[src/components/posts/PostLike.tsx] error:', error);
      }
    }
  };

  return (
    <div className="like-button">
      {likeStatus ? (
        <HeartFill
          style={{ fontSize: '20px', color: '#880000', cursor: 'pointer' }}
          onClick={handleOpen}
        />
      ) : (
        <Heart
          style={{ fontSize: '20px', color: '#888', cursor: 'pointer' }}
          onClick={handleOpen}
        />
      )}
      <span className="badge bg-secondary ms-1">{likesCount}</span>
    </div>
  );
};

export default PostLike;

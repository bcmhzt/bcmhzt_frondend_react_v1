/** ec43e5e1 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  buildStorageUrl,
  buildStoragePostImageUrl,
} from '../../utility/GetUseImage';
import GetGenderIcon from '../commons/GetGenderIcon';
import { UseOgpFrameWidth100 } from '../../utility/UseOgpFrame';
import { OGPData } from '../../types/post';
import SkeletonImage from './SkeletonImage';
import { convertUtcToTimeZone } from '../../utility/GetCommonFunctions';
import PostLike from './PostLike';
import PostBookmark from './PostBookmark';
import { ThreeDotsVertical, ChatRightDotsFill } from 'react-bootstrap-icons';
import PostReplyList from './PostReplyList';
import PostTools from '../../components/posts/PostTools';

interface PostDetailCardProps {
  id: string | undefined;
}

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/posts/PostDetailCard.tsx:xx] debug:', debug);
}

const PostImageWithLoader: React.FC<{
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}> = ({ src, alt, className, width = 120, height = 120 }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <SkeletonImage width={width} height={height} />}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          display: loaded ? 'block' : 'none',
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          borderRadius: 3,
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </>
  );
};

const PostDetailCard: React.FC<PostDetailCardProps> = ({ id }) => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT as string;
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [post, setPost] = useState<any>(null);

  let images: string[] = [];
  try {
    const parsed = JSON.parse(post?.post_images ?? '[]');
    images = Array.isArray(parsed) ? parsed : [];
  } catch {
    images = [];
  }

  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/get/post`,
          { post_id: id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (debug === 'true') {
          console.log(
            '[src/components/posts/PostDetailCard.tsx:36] response.data.data.post:',
            response.data.data.post
          );
        }
        setPost(response.data.data.post);
      } catch (error) {
        console.log(
          '[src/components/posts/PostDetailCard.tsx:42] error:',
          error
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id, apiEndpoint, token]);

  if (loading) {
    return <div className="loading-spinner-container">...</div>;
  }

  if (!post) {
    return <div>投稿が見つかりません</div>;
  }

  return (
    <>
      {/* <pre>{JSON.stringify(loading, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(post, null, 2)}</pre> */}

      <div className="post-thread">
        <div className="back-button">
          <button
            className="btn btn btn-light"
            onClick={() => window.history.back()}
          >
            前のページへ戻る
          </button>
        </div>
        <div className="post-thread-header d-flex align-items-center mt10">
          {/* プロフィール画像 */}
          <div className="avatar-section">
            <Link to={`/member/${post.bcuid}`}>
              <img
                className="avatar-64"
                src={
                  buildStorageUrl(
                    process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL || '',
                    post.profile_images ?? '',
                    '_thumbnail'
                  ) || '/assets/images/dummy/dummy_avatar.png'
                }
                alt={post?.bcuid}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    '/assets/images/dummy/dummy_avatar.png';
                }}
              />
            </Link>
          </div>
          <div className="nickname-section">
            <div className="nickname">
              {post.nickname}
              <span className="bcuid">@{post.bcuid}</span>
            </div>
            <div className="gender">
              <GetGenderIcon genderId={post.gender ?? ''} />　
              {post.location || '不明'}
            </div>
          </div>
        </div>
        <div className="post-thread-body">
          {/* 投稿テキスト */}
          <p
            dangerouslySetInnerHTML={{
              __html: (post?.post ?? '').replace(/\n/g, '<br />'),
            }}
          />
          {/* OGP */}
          <div className="ogps">
            {post.ogps &&
              Array.isArray(post.ogps) &&
              post.ogps.length > 0 &&
              post.ogps
                .filter(
                  (ogp: OGPData, idx: number, arr: OGPData[]) =>
                    arr.findIndex(
                      (o: OGPData) =>
                        o.url === ogp.url &&
                        o.title === ogp.title &&
                        o.description === ogp.description &&
                        o.image === ogp.image
                    ) === idx
                )
                .map((ogp: OGPData, i: number) => (
                  <div
                    className="ogp"
                    dangerouslySetInnerHTML={{
                      __html: UseOgpFrameWidth100(
                        ogp.url ?? '',
                        ogp.title ?? 'No Title',
                        ogp.description ?? 'No Description',
                        ogp.image ?? ''
                      ),
                    }}
                    key={i}
                  />
                ))}
          </div>
          {/* 投稿画像 */}
          {images.length > 0 && (
            <div>
              {images.map((img, i) => (
                <>
                  <PostImageWithLoader
                    src={buildStoragePostImageUrl(img, '_medium')}
                    alt="tekitou"
                    className="img-fluid"
                  />
                </>
              ))}
            </div>
          )}
          {/* 日付・post ID */}
          <div className="date-link d-flex justify-content-end">
            {post.post_updated_at
              ? convertUtcToTimeZone(post.post_updated_at, 'JST')
              : ''}
          </div>
        </div>

        <div className="post-thread-footer d-flex align-items-center justify-content-around mt20">
          {/* いいね */}
          <PostLike key={post.post_id} item={post} />
          {/* 返信 */}
          <div className="replay-button">
            <Link to={`/post/${post.post_id}`}>
              <ChatRightDotsFill
                style={{
                  fontSize: '23px',
                  color: (post.replies_count ?? 0) > 0 ? '#666' : '#c1c1c1c1',
                  verticalAlign: 'middle',
                }}
              />
            </Link>
            <span className="badge bg-secondary ms-1">
              {post.replies_count ?? 0}
            </span>
          </div>
          {/* ブックマーク */}
          <div className="me-2">
            <PostBookmark key={post.post_id} item={post} />
          </div>
          <div className="post-tooles-button">
            {/* <ThreeDotsVertical style={{ fontSize: '20px' }} />
             */}
            <PostTools postId={post.post_id} />
          </div>
        </div>
      </div>

      {/* 返信一覧 */}
      <PostReplyList id={post.post_id} />
    </>
  );
};

export default PostDetailCard;

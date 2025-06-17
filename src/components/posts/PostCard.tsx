/** 494a8974 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatRightDotsFill } from 'react-bootstrap-icons';
import { PostData } from '../../types/post';
import GetGenderIcon from '../commons/GetGenderIcon';
import {
  buildStorageUrl,
  buildStoragePostImageUrl,
} from '../../utility/GetUseImage';
import { UseOgpFrameWidth100 } from '../../utility/UseOgpFrame';
import { convertUtcToTimeZone } from '../../utility/GetCommonFunctions';
import PostLike from './PostLike';
import PostBookmark from './PostBookmark';
import SkeletonImage from './SkeletonImage';
import PostTools from '../../components/posts/PostTools';

interface PostCardProps {
  post: PostData;
  isLastItem: boolean;
  lastItemRef: (node: HTMLDivElement | null) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  isLastItem,
  lastItemRef,
}) => {
  // 画像の処理
  let images: string[] = [];
  try {
    const parsed = JSON.parse(post.post_images ?? '[]');
    images = Array.isArray(parsed) ? parsed : [];
  } catch {
    images = [];
  }

  const PostImageWithLoader: React.FC<{
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
  }> = ({ src, alt, className, width = 120, height = 120 }) => {
    const [loaded, setLoaded] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
      setLoaded(false);
      setRetry(0);
    }, [src]);

    return (
      <>
        {!loaded && <SkeletonImage width={width} height={height} />}
        <img
          key={retry}
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
          onError={() => {
            if (retry < 3) {
              setTimeout(() => {
                setRetry((r) => r + 1);
              }, 1000);
            }
          }}
        />
      </>
    );
  };

  return (
    <div
      key={post.post_id}
      className="post-thread"
      ref={isLastItem ? lastItemRef : null}
    >
      <div className="post-thread-header d-flex align-items-center">
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
              alt={post.bcuid}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/assets/images/dummy/dummy_avatar.png';
              }}
            />
          </Link>
        </div>
        <div className="nickname-section">
          {/* メンバー情報 */}
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
            __html: ((post?.post ?? '').length > 300
              ? (post?.post ?? '').slice(0, 300) + '...'
              : (post?.post ?? '')
            ).replace(/\n/g, '<br />'),
          }}
        />
        <Link to={`/post/${post.post_id}`} className="post-link">
          ...すべての投稿を見る
        </Link>
        {/* OGP */}
        <div className="ogps mt10">
          {post.ogps &&
            Array.isArray(post.ogps) &&
            post.ogps.length > 0 &&
            post.ogps
              // 重複排除（全プロパティが同じもののみユニーク化）
              .filter(
                (ogp, idx, arr) =>
                  arr.findIndex(
                    (o) =>
                      o.url === ogp.url &&
                      o.title === ogp.title &&
                      o.description === ogp.description &&
                      o.image === ogp.image
                  ) === idx
              )
              .map((ogp, i) => (
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
          <div className="">
            {images.length > 0 && (
              <div className="">
                {images.map((img, i) => (
                  <Link to="" key={i}>
                    <PostImageWithLoader
                      src={buildStoragePostImageUrl(img, '_medium')}
                      alt={`img-${i}`}
                      className="img-fluid"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {/* 日付・post ID */}
        <div className="date-link">
          {post.post_updated_at
            ? convertUtcToTimeZone(post.post_updated_at, 'JST')
            : ''}
          　
          <Link to={`/post/${post.post_id}`} className="post-link">
            No.{post.post_id}
          </Link>
        </div>
      </div>

      <div className="post-thread-footer">
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
        <div className="post-tools-button">
          <PostTools />
        </div>
      </div>
    </div>
  );
};

export default PostCard;

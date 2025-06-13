/** 494a8974 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThreeDotsVertical, ChatRightDotsFill } from 'react-bootstrap-icons';
import { PostData } from '../../types/post';
// import GetGenderIcon from '../commons/GetGenderIcon';
import { buildStoragePostImageUrl } from '../../utility/GetUseImage';
import { UseOgpFrameWidth100 } from '../../utility/UseOgpFrame';
import { convertUtcToTimeZone } from '../../utility/GetCommonFunctions';
import PostLike from './PostLike';
import PostBookmark from './PostBookmark';
import SkeletonImage from './SkeletonImage';

interface MemberPostCardProps {
  post: PostData;
  isLastItem: boolean;
  lastItemRef: (node: HTMLDivElement | null) => void;
}

const MemberPostCard: React.FC<MemberPostCardProps> = ({
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
        <div className="post-tooles-button">
          <ThreeDotsVertical style={{ fontSize: '20px' }} />
        </div>
      </div>
    </div>
  );
};

export default MemberPostCard;

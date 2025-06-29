/** 24e462cd */
import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search } from 'react-bootstrap-icons';
// import GetGenderIcon from '../commons/GetGenderIcon';
// import {
//   buildStorageUrl,
//   buildStoragePostImageUrl,
// } from '../../utility/GetUseImage';
// import { UseOgpFrameWidth100 } from '../../utility/UseOgpFrame';
// import { convertUtcToTimeZone } from '../../utility/GetCommonFunctions';
// import PostLike from '../../components/posts/PostLike';
// import PostBookmark from './PostBookmark';
import PostCreateForm from '../../components/posts/PostCreateForm';
import { useQueryClient } from '@tanstack/react-query';
// import { ThreeDotsVertical, ChatRightDotsFill } from 'react-bootstrap-icons';
// import SkeletonImage from './SkeletonImage';
//src/components/posts/PostCard.tsx
import PostCard from '../../components/posts/PostCard';
import { PostData } from '../../types/post';
// import { useMessage } from '../../contexts/MessageContext';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/posts/PostList.tsx:xx] debug:', debug);
}

interface PostsPage {
  current_page: number;
  last_page: number;
  total?: number;
  data: PostData[];
}

export interface PostListResponse {
  success: boolean;
  status: number;
  message: string;
  data: PostsPage;
  errors: any;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;

const fetchPosts = async (
  page: number,
  token: string,
  keyword: string
): Promise<PostListResponse> => {
  const body = keyword ? { keywords: keyword } : {};
  const res = await axios.post(
    `${apiEndpoint}/v1/get/postspub?page=${page}`,
    body,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (debug === 'true') {
    console.log('[src/components/posts/PostList.tsx:71] res.data:', res.data);
  }
  return res.data as PostListResponse;
};

// const PostImageWithLoader: React.FC<{
//   src: string;
//   alt: string;
//   className?: string;
//   width?: number;
//   height?: number;
// }> = ({ src, alt, className, width = 120, height = 120 }) => {
//   const [loaded, setLoaded] = useState(false);
//   const [retry, setRetry] = useState(0);

//   useEffect(() => {
//     setLoaded(false);
//     setRetry(0);
//   }, [src]);

//   return (
//     <>
//       {!loaded && <SkeletonImage width={width} height={height} />}
//       <img
//         key={retry}
//         src={src}
//         alt={alt}
//         className={className}
//         style={{
//           display: loaded ? 'block' : 'none',
//           width: '100%',
//           height: 'auto',
//           objectFit: 'cover',
//           borderRadius: 3,
//         }}
//         onLoad={() => setLoaded(true)}
//         onError={() => {
//           if (retry < 3) {
//             setTimeout(() => {
//               setRetry((r) => r + 1);
//             }, 1000);
//           }
//         }}
//       />
//     </>
//   );
// };

/**
 * 24e462cd
 * [src/components/members/Memberlist.tsx:xx]
 *
 * type: component
 *
 * [Order]
 * - /postsで全投稿記事を表示（ページネーションの無限スクロール）
 * - 投稿記事のサムネイル画像を表示
 * - メンバー表示をページネーションを使って無限スクロール
 */

const PostList: React.FC = () => {
  const { token } = useAuth();
  // const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '';
  const [inputKeyword, setInputKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const queryClient = useQueryClient();
  // const { showMessage } = useMessage();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PostListResponse, Error>({
    queryKey: ['posts', token, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchPosts(pageParam as number, token!, searchKeyword),
    initialPageParam: 1,
    retry: 1,
    enabled: !!token,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  /** 平坦化された投稿配列 */
  const posts: PostData[] =
    data?.pages.flatMap((p) =>
      Array.isArray(p.data.data) ? p.data.data : []
    ) ?? [];

  /** IntersectionObserver で最下部を監視 */
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  /** 検索系ハンドラ */
  const handleSearch = () => setSearchKeyword(inputKeyword);
  const handleClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
  };

  /** ロード & エラー */
  if (isLoading) return null; // グローバルローディングに任せる

  if (isError) {
    return (
      <div className="alert alert-secondary" role="alert">
        データが取得できませんでした。リロードしてください。（{error.message}）
      </div>
    );
  }

  function handlePostSuccess(newPost: any): void {
    const now = new Date().toISOString();
    // サーバー返却と同じ型に合わせる
    const optimisticPost = {
      post_updated_at: now,
      replies_count: 0,
      ...newPost,
      post_images: Array.isArray(newPost.post_images)
        ? JSON.stringify(newPost.post_images)
        : newPost.post_images,
    };
    queryClient.setQueryData(['posts', token, searchKeyword], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        pages: [
          {
            ...old.pages[0],
            data: {
              ...old.pages[0].data,
              data: [optimisticPost, ...old.pages[0].data.data],
            },
          },
          ...old.pages.slice(1),
        ],
      };
    });
  }

  return (
    <>
      <PostCreateForm onPostSuccess={handlePostSuccess} />
      <div className="col-12">
        <div className="input-group mb20">
          <input
            type="text"
            className="form-control search-input"
            placeholder="キーワードを入力してください"
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
          />
          {inputKeyword && (
            <button
              className="btn clear-button"
              type="button"
              onClick={handleClear}
            >
              ×
            </button>
          )}
          <button
            className="btn btn-primary bcmhzt-btn"
            type="button"
            onClick={handleSearch}
          >
            <Search className="search-icon" />
          </button>
        </div>
      </div>

      {/* <pre>{JSON.stringify(res.data, null, 2)}</pre> */}

      {/* ─── 投稿一覧 ──────────────────────────────────────────── */}
      <div className="posts mb100">
        {posts.map((p, idx) => {
          // let images: string[] = [];
          // try {
          // const parsed = JSON.parse(p.post_images ?? '[]');
          // images = Array.isArray(parsed) ? parsed : [];
          // } catch {
          //   // images = [];
          // }

          return (
            <>
              {/* <pre>{JSON.stringify(p, null, 2)}</pre> */}
              <PostCard
                key={p.post_id}
                post={p}
                isLastItem={idx === posts.length - 1}
                lastItemRef={lastItemRef}
              />
            </>
          );
        })}

        {/* 末尾 */}
        {!hasNextPage && (
          <div className="alert alert-secondary text-center mt20">
            これ以上ポストはありません
          </div>
        )}
      </div>
    </>
  );
};
export default PostList;

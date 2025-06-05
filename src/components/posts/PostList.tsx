/** 24e462cd */
import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

import { Search, Heart, Bookmark } from 'react-bootstrap-icons';
// import ReplyBoard from '../ReplyBoard';
// import PostUserMenu from '../PostUserMenu';
// import DOMPurify from 'dompurify';
import GetGenderIcon from '../commons/GetGenderIcon';
import { buildStorageUrl } from '../../utility/GetUseImage';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/posts/PostList.tsx:xx] debug:', debug);
}

interface OGPData {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
}

export interface PostData {
  post_id: number;
  uid: string;
  bcuid: string;
  nickname: string | null;
  gender: string | null;
  location: string | null;
  profile_images: string | null;
  post: string;
  post_images: string | null;
  created_at: string;
  reply_count?: number;
  ogp?: OGPData | null;
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
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '';
  const [inputKeyword, setInputKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

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

  /** 本文中 URL のリンク化 */
  // const renderWithLinks = (text: string) => {
  //   const urlRegex = /(https?:\/\/[^\s]+)/g;
  //   return text.split(urlRegex).map((part, i) =>
  //     urlRegex.test(part) ? (
  //       <a
  //         key={i}
  //         href={part}
  //         target="_blank"
  //         rel="noopener noreferrer"
  //         style={{ color: '#457B9D', textDecoration: 'underline' }}
  //       >
  //         {part.length > 30 ? `${part.slice(0, 30)}…` : part}
  //       </a>
  //     ) : (
  //       <span key={i}>{part}</span>
  //     )
  //   );
  // };

  /** ロード & エラー */
  if (isLoading) return null; // グローバルローディングに任せる

  if (isError) {
    return (
      <div className="alert alert-secondary" role="alert">
        データが取得できませんでした。リロードしてください。（{error.message}）
      </div>
    );
  }

  return (
    <>
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
      <div className="post mb100">
        {posts.map((p, idx) => {
          let images: string[] = [];
          try {
            const parsed = JSON.parse(p.post_images ?? '[]');
            images = Array.isArray(parsed) ? parsed : [];
          } catch {
            images = [];
          }

          return (
            <div
              key={p.post_id}
              className="post-thread"
              ref={idx === posts.length - 1 ? lastItemRef : null}
            >
              {/* ─── ユーザーアバター ─── */}
              <Link to={`/member/${p.uid}`}>
                <img
                  className="post-master-avatar"
                  src={
                    buildStorageUrl(
                      storageUrl,
                      p.profile_images ?? '',
                      '_small'
                    ) || '/assets/dummy-user.png'
                  }
                  alt={p.bcuid}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/assets/dummy-user.png';
                  }}
                />
              </Link>

              {/* ─── 投稿本文 ─── */}
              <div className="post-thread-body">
                <p className="nick-name">
                  {p.nickname}
                  <span className="bcuid"> @ {p.bcuid}</span>
                  <GetGenderIcon genderId={p.gender ?? ''} />
                  <span className="location"> [{p.location || '不明'}]</span>
                </p>
                <p className="post-meta">
                  <span className="post-meta-detail">
                    {p.created_at}{' '}
                    <Link to={`/post/${p.post_id}`} className="post-link">
                      No.{p.post_id}
                    </Link>
                  </span>
                </p>

                {/* 画像 */}
                {images.length > 0 && (
                  <div className="pt10 pb10">
                    {images.length > 0 && (
                      <div className="pt10 pb10">
                        {images.map((img, i) => (
                          <Link to="" key={i}>
                            <img
                              src={img}
                              alt={`img-${i}`}
                              className="img-fluid"
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* テキスト */}
                {/* <p className="bctext mt10">
                  {DOMPurify.sanitize(p.post)
                    .split('\n')
                    .map((line, i) => (
                      <React.Fragment key={i}>
                        {renderWithLinks(line)}
                        <br />
                      </React.Fragment>
                    ))}
                </p> */}
                <p className="post-read-more">
                  <Link to={`/post/${p.post_id}`}>...続きを読む</Link>
                </p>

                {/* OGP */}
                {p.ogp && (
                  <div className="opg-info">
                    <a
                      href={p.ogp.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="opg-image-block">
                        <img
                          src={p.ogp.image || '/assets/dummy/1200x630.png'}
                          alt={p.ogp.title ?? ''}
                          className="opg-image"
                        />
                      </div>
                      <div className="opg-details-block">
                        <div className="opg-title">{p.ogp.title}</div>
                        <div className="opg-description">
                          {p.ogp.description}
                        </div>
                      </div>
                    </a>
                  </div>
                )}

                {/* フッターツール */}
                <div className="footer-tools mt10">
                  <div className="ftool heart">
                    <Heart style={{ fontSize: '18px' }} />{' '}
                    <span className="bcsum">9999</span>
                  </div>
                  <div className="ftool bookmark">
                    <Bookmark style={{ fontSize: '18px' }} />{' '}
                    <span className="bcsum">9999</span>
                  </div>
                  {/* <div className="ftool reply">
                    <ReplyBoard postId={p.post_id} />{' '}
                    <span className="bcsum">{p.reply_count ?? 0}</span>
                  </div>
                  <div className="ftool">
                    <PostUserMenu post_id={p.post_id} bcuid={p.bcuid} />
                  </div> */}
                </div>
              </div>
            </div>
          );
        })}

        {/* 次ページ取得インジケーター */}
        {/* {isFetchingNextPage && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <img
              src="/assets/icons/loading-posts.gif"
              alt="Loading..."
              style={{ width: 50, height: 50 }}
            />
          </div>
        )} */}

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

/** 2040c02a */
import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import PostBookmark from './PostBookmark';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[BookmarkList] debug:', debug);
}

interface BookmarkData {
  id: number;
  post_id: number;
  uid: string;
  target_uid: string;
  reason: string;
  created_at: string;
  updated_at: string;
  bcuid: string;
  email: string;
  nickname: string;
  description: string;
  profile_images: string | null;
  status: number;
  post: string | null;
  post_images: string | null;
  delete_flg: number;
  post_status: number;
  bookmark_created_at?: string;
}

interface BookmarkListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    bookmarkList: {
      current_page: number;
      data: BookmarkData[];
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      links: {
        url: string | null;
        label: string;
        active: boolean;
      }[];
      next_page_url: string | null;
      path: string;
      per_page: number;
      prev_page_url: string | null;
      to: number;
      total: number;
    };
    bookmarkListCount: number;
  };
  errors: any;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

async function fetchBookmarkList(
  page: number,
  token: string,
  keyword: string
): Promise<BookmarkListResponse> {
  const body = keyword ? { keywords: keyword } : {};
  const res = await axios.post(
    `${apiEndpoint}/v1/get/post_bookmark_list?page=${page}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (debug === 'true') console.log('[BookmarkList] res:', res.data);
  return res.data;
}

const BookmarkList: React.FC = () => {
  const auth = useAuth();
  const token = auth?.token;
  const [inputKeyword, setInputKeyword] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;

  // useInfiniteQueryでページネーション（無限スクロール）
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<BookmarkListResponse, Error>({
    queryKey: ['bookmarkList', token, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchBookmarkList(pageParam as number, token!, searchKeyword),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // 次ページがあればそのページ番号を返す
      const nextPageUrl = lastPage?.data?.bookmarkList?.next_page_url;
      if (nextPageUrl) {
        const match = nextPageUrl.match(/page=(\d+)/);
        if (match) {
          return Number(match[1]);
        }
      }
      return undefined;
    },
    retry: 1,
  });

  // Intersection Observerで無限スクロール
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node) return;
      observerRef.current?.disconnect();
      observerRef.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // 検索
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputKeyword(e.target.value);
  };
  const handleSearch = () => setSearchKeyword(inputKeyword);
  const handleClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
  };

  // ローディング・エラー
  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary" role="alert">
        データが取得できませんでした。リロードしてください。 ({error?.message})
      </div>
    );
  }

  // bookmarkListを平坦化
  const bookmarks: BookmarkData[] =
    data?.pages.flatMap((p) => p.data.bookmarkList.data ?? []) ?? [];
  const totalCount = data?.pages[0]?.data.bookmarkList.total ?? 0;

  return (
    <>
      {/* 検索ボックス */}
      <div className="member-search mb20">
        <div className="input-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="ブックマーク検索"
            value={inputKeyword}
            onChange={handleInputChange}
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
            検索
          </button>
        </div>
      </div>
      {/* 全件数 */}
      <p style={{ textAlign: 'right', color: '#888' }}>
        Total bookmarks: <span className="total-bookmarks">{totalCount}</span>
      </p>
      {/* ブックマークリスト */}
      <div className="bookmarks">
        <ul className="bookmark-list">
          {bookmarks.map((b, i) => {
            // 画像配列の取得ロジックを外に出す
            let images: string[] = [];
            if (b.post_images) {
              try {
                images = JSON.parse(b.post_images);
                if (!Array.isArray(images)) images = [];
              } catch {
                images = b.post_images
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
              images = images.filter((img) => !!img && img !== 'null');
            }
            return (
              <li
                key={
                  b.id + '-' + b.post_id + '-' + (b.bookmark_created_at ?? '')
                }
                className="bookmark-item mb20"
                ref={i === bookmarks.length - 1 ? lastItemRef : null}
              >
                <div className="d-flex justify-content-between align-items-center px-3">
                  <div className="avatar">
                    <Link to={`/member/${b.bcuid}`}>
                      <img
                        src={
                          buildStorageUrl(
                            storageUrl ?? '',
                            b.profile_images ?? '',
                            '_small'
                          ) ||
                          `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                        }
                        alt="User Avatar"
                        className="avatar-36"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          (e.currentTarget as HTMLImageElement).src =
                            `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`;
                        }}
                      />
                    </Link>
                  </div>
                  <div className="bookmark-summary">
                    <div className="bookmark-text mt-2">
                      {images[0] && (
                        <img
                          src={images[0]}
                          className="bookmark-list-image"
                          alt="Post"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      {/* <img
                        src="/assets/dummy-user.png"
                        className="bookmark-list-image"
                      /> */}

                      {(b.post ?? '(no text)').replace(/\r?\n/g, '').length >
                      100
                        ? `${(b.post ?? '(no text)').replace(/\r?\n/g, '').slice(0, 100)}...`
                        : (b.post ?? '(no text)').replace(/\r?\n/g, '')}
                      <span>
                        <Link to={`/post/${b.post_id}`}>
                          ... No. {b.post_id}
                        </Link>
                      </span>
                    </div>
                  </div>
                  <div className="bookmark-switch">
                    <PostBookmark key={b.post_id} item={b} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {/* 次ページ取得中のインジケーター */}
        {isFetchingNextPage && (
          <div className="text-center my-3">Loading more…</div>
        )}
      </div>
    </>
  );
};

export default BookmarkList;

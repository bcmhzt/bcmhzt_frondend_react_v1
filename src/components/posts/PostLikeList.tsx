/** 2040c03b */
import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import PostLike from './PostLike';

let debug = process.env.REACT_APP_DEBUG === 'true';

interface LikeData {
  id: number;
  post_id: number;
  uid: string;
  target_uid: string;
  reason: string;
  created_at: string;
  updated_at: string;
  post: string | null;
  post_images: string | null;
  delete_flg: number;
  post_status: number;
}

interface LikeListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    current_page: number;
    data: LikeData[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  errors: any;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

async function fetchLikeList(
  page: number,
  token: string,
  keyword: string
): Promise<LikeListResponse> {
  const body = keyword ? { keywords: keyword } : {};
  const res = await axios.post(
    `${apiEndpoint}/v1/get/post_like_list?page=${page}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (debug) console.log('[LikeList] res:', res.data);
  return res.data;
}

const PostLikeList: React.FC = () => {
  const auth = useAuth();
  const token = auth?.token;
  const [inputKeyword, setInputKeyword] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<LikeListResponse, Error>({
    queryKey: ['likeList', token, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchLikeList(pageParam as number, token!, searchKeyword),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const nextPageUrl = lastPage.data.next_page_url;
      if (nextPageUrl) {
        const match = nextPageUrl.match(/page=(\d+)/);
        if (match) return Number(match[1]);
      }
      return undefined;
    },
    retry: 1,
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputKeyword(e.target.value);
  };
  const handleSearch = () => setSearchKeyword(inputKeyword);
  const handleClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
  };

  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary" role="alert">
        データが取得できませんでした。リロードしてください。 ({error?.message})
      </div>
    );
  }

  const likes: LikeData[] = data?.pages.flatMap((p) => p.data.data ?? []) ?? [];
  const totalCount = data?.pages[0]?.data.total ?? 0;

  return (
    <>
      <div className="member-search mb20">
        <div className="input-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="いいね検索"
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
      <p style={{ textAlign: 'right', color: '#888' }}>
        Total likes: <span className="total-likes">{totalCount}</span>
      </p>
      <div className="likes">
        <ul className="like-list">
          {likes.map((l, i) => {
            let images: string[] = [];
            if (l.post_images) {
              try {
                images = JSON.parse(l.post_images);
                if (!Array.isArray(images)) images = [];
              } catch {
                images = l.post_images
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
              images = images.filter((img) => !!img && img !== 'null');
            }
            return (
              <li
                key={l.id + '-' + l.post_id + '-' + l.created_at}
                className="like-item mb20"
                ref={i === likes.length - 1 ? lastItemRef : null}
              >
                <div className="d-flex justify-content-between align-items-start px-3">
                  <div className="avatar">
                    <Link to={`/member/${l.target_uid}`}>
                      <img
                        src={
                          buildStorageUrl(storageUrl ?? '', '', '_small') ||
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
                      {(l.post ?? '(no text)').replace(/\r?\n/g, '').length >
                      100
                        ? `${(l.post ?? '(no text)').replace(/\r?\n/g, '').slice(0, 100)}...`
                        : (l.post ?? '(no text)').replace(/\r?\n/g, '')}
                      <span>
                        <Link to={`/post/${l.post_id}`}>
                          ... No. {l.post_id}
                        </Link>
                      </span>
                    </div>
                  </div>
                  <div className="bookmark-switch">
                    <PostLike key={l.post_id} item={l} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {isFetchingNextPage && (
          <div className="text-center my-3">Loading more…</div>
        )}
      </div>
    </>
  );
};

export default PostLikeList;

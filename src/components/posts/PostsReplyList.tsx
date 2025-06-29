/** b34004f5 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
// import PostBookmark from './PostBookmark';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/posts/PostsReplyList.tsx:12] debug:', debug);
}

interface ReplyData {
  reply_id: number;
  post_id: number;
  uid: string;
  post: string;
  post_images: string | null;
  delete_flg: number;
  created_at: string;
  updated_at: string;
  reply_post: string;
  user_profiles_uid: string;
  user_profiles_bcuid: string;
  user_profiles_nickname: string;
  user_profiles_image: string;
}

interface replyListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    reply_list: {
      current_page: number;
      data: ReplyData[];
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
    replyListCount: number;
  };
  errors: any;
}
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

async function fetchreplyList(
  page: number,
  token: string,
  keyword: string
): Promise<replyListResponse> {
  const body = keyword ? { keywords: keyword } : {};
  const res = await axios.post(
    `${apiEndpoint}/v1/get/my_replies?page=${page}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (debug === 'true')
    console.log('[src/components/posts/PostsReplyList.tsx:67] res:', res.data);
  return res.data;
}

const PostsReplyList = () => {
  const auth = useAuth();
  const token = auth?.token;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState<string>('');
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
  } = useInfiniteQuery<replyListResponse, Error>({
    queryKey: ['bookmarkList', token, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchreplyList(pageParam as number, token!, searchKeyword),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // 次ページがあればそのページ番号を返す
      const nextPageUrl = lastPage?.data?.reply_list?.next_page_url;
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

  useEffect(() => {
    if (debug === 'true' && data) {
      try {
        console.log(
          '[src/components/posts/PostsReplyList.tsx:136] useInfiniteQueryのdata:',
          data
        );
        console.log(
          '[src/components/posts/PostsReplyList.tsx:136] 全ページのリプライ一覧:',
          data.pages.map((p) => p?.data?.reply_list?.data ?? [])
        );
      } catch (e) {
        console.error(
          '[src/components/posts/PostsReplyList.tsx:136] data解析中にエラー:',
          e
        );
      }
    }
  }, [data]);

  // ローディング・エラー
  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary" role="alert">
        データが取得できませんでした。リロードしてください。 ({error?.message})
      </div>
    );
  }

  // replayListを平坦化
  const replays: ReplyData[] =
    data?.pages?.flatMap((p) => p?.data?.reply_list?.data ?? []) ?? [];
  const totalCount = data?.pages?.[0]?.data?.reply_list?.total ?? 0;

  if (isLoading || !data?.pages) {
    return <div className="text-center my-3">読み込み中...</div>;
  }

  return (
    <>
      <div className="member-search mb20">
        <div className="input-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Replyの検索"
            value=""
            onChange={handleInputChange}
          />
          <button
            className="btn clear-button"
            type="button"
            onClick={handleClear}
          >
            ×
          </button>

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
        Total bookmarks: <span className="total-bookmarks">{totalCount}</span>
      </p>
      <div className="replies">
        <ul className="reply-list">
          {replays.map((b, i) => {
            return (
              <>
                {/* <pre>{JSON.stringify(b, null, 2)}</pre> */}
                <li
                  key={
                    b.reply_id + '-' + b.post_id + '-' + (b.created_at ?? '')
                  }
                  className="reply-item mb20"
                  ref={i === replays.length - 1 ? lastItemRef : null}
                >
                  <div className="d-flex justify-content-between align-items-start px-3">
                    <div className="avatar">
                      <Link to={`/member/${b.user_profiles_bcuid}`}>
                        <img
                          src={
                            buildStorageUrl(
                              storageUrl ?? '',
                              b.user_profiles_image ?? '',
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
                    <div className="reply-summary">
                      <div className="reply-text mt-2">
                        {(b.reply_post ?? '(no text)').replace(/\r?\n/g, '')
                          .length > 100
                          ? `${(b.reply_post ?? '(no text)').replace(/\r?\n/g, '').slice(0, 100)}...`
                          : (b.reply_post ?? '(no text)').replace(/\r?\n/g, '')}
                        <span>
                          <Link to={`/post/${b.post_id}`}>
                            ... No. {b.post_id}
                          </Link>
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              </>
            );
          })}

          {/* <li className="reply-item mb20">
            <div className="d-flex justify-content-between align-items-start px-3">
              <div className="avatar">
                <Link to="/">
                  <img
                    src="/assets/images/dummy/dummy_avatar.png"
                    alt="foo"
                    className="avatar-36"
                  />
                </Link>
              </div>
              <div className="reply-summary">
                <div className="reply-text mt-2">
                  <img
                    src="/assets/dummy/dummy.jpg"
                    className="bookmark-list-image"
                  />
                  日本の北部地方に位置する楠町（くすのきちょう）は、人口約一万人ほどの静かな山あいの町である。周囲を緩やかな山々に囲まれ、四季折々の自然に恵まれたこの町は、昔ながらの風景と温かみのある人々の暮らしが共存している。古くから農業と林業を中心とした産業で成り立っており、現代に至ってもその伝統が色濃く残っている。
                  <span>
                    <Link to="/">... No. 999</Link>
                  </span>
                </div>
              </div>
              <div className="reply-switch">
                削除ボタン
              </div>
            </div>
          </li> */}
        </ul>
        {/* 次ページ取得中のインジケーター */}
        {isFetchingNextPage && (
          <div className="text-center my-3">Loading more…</div>
        )}
      </div>
    </>
  );
};
export default PostsReplyList;

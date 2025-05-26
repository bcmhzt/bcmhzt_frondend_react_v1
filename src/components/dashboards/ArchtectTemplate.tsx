/**
 * works/archtect/2025-05-24_APIページの作成.md
 * ① ファイル＆雛形作成
 * ② 必要な import
 * ③ 型定義
 * ④ static 定義
 * ⑤ fetch 関数実装
 * ⑥ 検索フォーム制御
 * ⑦ 認証情報の設定（Token）
 */
/** ② 必要な import */
import React, { useState, useRef, useCallback } from 'react';
import { X, Search } from 'react-bootstrap-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getBcmhzt } from '../../utility/GetCommonFunctions';

/**
 * ③ 型定義
 * ApiResponse -> APIのレスポンス形式
 * ApiPage -> ページネーションされたデータの形式
 * ApiData -> 各メンバーのデータ形式
 */
interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    listDatas: ApiPage;
  };
  errors: any;
}
interface ApiPage {
  current_page: number;
  last_page: number;
  data: ApiData[];
}
interface ApiData {
  id: number;
  name: string;
  uid: string;
  email: string | null;
  created_at: string | null;
}

/**
 *  ④ static 定義
 * APIエンドポイント
 *
 */
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;
// const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;

/**
 * ⑤ fetch 関数実装
 */
async function fetchApiData(
  page: number,
  token: string,
  keyword: string
): Promise<ApiResponse> {
  const body = keyword ? { keywords: keyword } : {};
  const res = await axios.post(
    `${apiEndpoint}/v1/get/pagenate_mock?page=${page}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

/**
 * ① ファイル＆雛形作成
 *
 */
const ArchtectTemplate: React.FC = () => {
  /** ⑦ 認証情報の設定（Token） */
  const auth = useAuth();
  const token = auth?.token!;

  /** ⑥ 検索フォーム制御 */
  const [inputKeyword, setInputKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputKeyword(e.target.value);
  const handleSearch = () => setSearchKeyword(inputKeyword);
  const handleClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
  };

  /** ⑧　useInfiniteQueryの設定 */
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ApiResponse, Error>({
    queryKey: ['memberList', token, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchApiData(pageParam as number, token, searchKeyword),
    retry: 1,
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.data.listDatas;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  /** ⑩　IntersectionObserverの設定 */
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node) return;
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { rootMargin: '200px' }
      );
      observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  /** ⑪ Loading とエラー制御 */
  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary">
        データ取得失敗 ({error.message})
      </div>
    );
  }

  /** ⑫ メンバー配列 */
  const listDatas: ApiData[] =
    data?.pages.flatMap((p) => p.data.listDatas.data) ?? [];

  return (
    <>
      {/* ⑨ 検索窓の設置 */}
      <div className="member-search mb20">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="メンバー検索"
            value={inputKeyword}
            onChange={handleInputChange}
          />
          {inputKeyword && (
            <button className="btn clear-button" onClick={handleClear}>
              <X size={16} />
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
      {/* ⑬　APIのデータ表示 */}
      success: {data?.pages[0].success.toString()}
      <h2>MemberList (all: {listDatas.length})</h2>
      <h3>{getBcmhzt()}</h3>
      <ul className="members-list">
        {listDatas.map((m, i) => (
          <li
            key={m.id}
            ref={i === listDatas.length - 1 ? lastItemRef : null}
            className="member"
          >
            <pre>{JSON.stringify(m, null, 2)}</pre>
            <h4>{m.name}</h4>
            <div>{m.id}</div>
            <div>{m.uid}</div>
            <div>{m.email}</div>
            <div>{m.created_at}</div>
          </li>
        ))}
      </ul>
      {isFetchingNextPage && (
        <div className="text-center my-3">Loading more…</div>
      )}
    </>
  );
};

export default ArchtectTemplate;

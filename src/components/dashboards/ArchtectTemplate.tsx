import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, Search } from 'react-bootstrap-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import {
  getBcmhzt,
  convertFormattedText,
} from '../../utility/GetCommonFunctions';
import GetGenderIcon from '../../components/commons/GetGenderIcon';
import MemberTools from '../../components/members/MemberTools';

// --- 型定義 ---
interface UserDetails {
  gender?: string;
  // 必要に応じて他のプロパティも追加
}
interface Member {
  id: number;
  bcuid: string;
  nickname: string | null;
  profile_images: string | null;
  description: string | null;
  user_details?: UserDetails[];
}
interface MembersPage {
  current_page: number;
  last_page: number;
  data: Member[];
}
interface MemberListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    members: MembersPage;
  };
  errors: any;
}

// --- APIエンドポイント ---
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;
const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;

// --- データ取得関数 ---
async function fetchMembers(
  page: number,
  token: string,
  keyword: string
): Promise<MemberListResponse> {
  const body = keyword ? { keywords: keyword } : {};
  const res = await axios.post(
    `${apiEndpoint}/v1/get/members?page=${page}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

const ArchtectTemplate: React.FC = () => {
  const auth = useAuth();
  const token = auth?.token!;

  // 検索フォーム
  const [inputKeyword, setInputKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputKeyword(e.target.value);
  const handleSearch = () => setSearchKeyword(inputKeyword);
  const handleClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
  };

  // useInfiniteQueryを先に定義
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<MemberListResponse, Error>({
    queryKey: ['memberList', token, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchMembers(pageParam as number, token, searchKeyword),
    retry: 1,
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.data.members;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  // IntersectionObserver
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

  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary">
        データ取得失敗 ({error.message})
      </div>
    );
  }

  // メンバー配列
  const members: Member[] =
    data?.pages.flatMap((p) => p.data.members.data) ?? [];

  return (
    <>
      {/* 検索フォーム */}
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
      {/* ステータス表示 */}
      success: {data?.pages[0].success.toString()}
      <h2>MemberList (all: {members.length})</h2>
      <p>{getBcmhzt()}</p>
      {/* メンバー一覧 */}
      <ul className="members-list">
        {members.map((m, i) => (
          <li
            key={m.id}
            ref={i === members.length - 1 ? lastItemRef : null}
            className="member"
          >
            <MemberTools targetBcuid={m.bcuid} />
            <Link to={`/member/${m.bcuid}`}>
              <img
                src={buildStorageUrl(
                  storageUrl,
                  m.profile_images ?? '',
                  '_thumbnail'
                )}
                alt="User Avatar"
                className="avatar-80"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/dummy/dummy_avatar.png';
                }}
              />
            </Link>
            <div className="nickname">
              {m.nickname ?? '(no nickname)'} <span>@{m.bcuid}</span>
              <GetGenderIcon genderId={m.user_details?.[0]?.gender ?? ''} />
            </div>
            <p className="description">
              {convertFormattedText(m.description ?? '') ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: convertFormattedText(m.description ?? ''),
                  }}
                />
              ) : (
                '(no description)'
              )}
            </p>
          </li>
        ))}
      </ul>
      {/* 次ページ取得中インジケーター */}
      {isFetchingNextPage && (
        <div className="text-center my-3">Loading more…</div>
      )}
    </>
  );
};

export default ArchtectTemplate;

/** 7b0ecf65 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  // PersonStanding,
  // PersonStandingDress,
  // PersonArmsUp,
  // PersonWalking,
  X,
  // CardText,
  // CardImage,
  Search,
} from 'react-bootstrap-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { getBcmhzt } from '../../utility/GetCommonFunctions';
import GetGenderIcon from '../../components/commons/GetGenderIcon';
//src/utility/GetCommonFunctions.tsx
// src/components/commons/GetGenderIcon.tsx

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/members/Memberlist.tsx:xx] debug:', debug);
}

/**
 * 7b0ecf65 (hash)
 * [src/components/members/Memberlist.tsx:xx]
 *
 * type: component
 *
 * [Order]
 * - '/v1/get/members'APIからメンバーリストを取得（現在は降順）
 * - メンバー表示をページネーションを使って無限スクロール
 * - 検索 (検索結果はスクロールするか？）
 */

interface MemberListData {
  id: number;
  uid: string;
  bcuid: string;
  email: string;
  nickname: string | null;
  description: string | null;
  profile_images: string | null;
  user_details_location?: string | null;
  user_details_gender?: string | null;
}

interface MembersPage {
  current_page: number;
  last_page: number; // 追加: 総ページ数
  data: MemberListData[];
  // ページネーション情報なども必要なら追加
}

/** response data interface */
export interface MemberListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    members: MembersPage;
  };
  errors: any; // null かオブジェクトが返るので any か適宜型を定義
}

/** データ取得関数 */
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
async function fetchMembers(
  page: number,
  token: string,
  keyword: string
): Promise<MemberListResponse> {
  // テスト用遅延: await new Promise(r => setTimeout(r, 1500));
  const body = keyword ? { keywords: keyword } : {};
  const res = await axios.post(
    `${apiEndpoint}/v1/get/members?page=${page}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (debug === 'true') console.log('[Memberlist] res:', res.data);
  return res.data;
}

const MemberList: React.FC = () => {
  // const [page, setPage] = useState(1);
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
  } = useInfiniteQuery<MemberListResponse, Error>({
    queryKey: ['memberList', token, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchMembers(pageParam as number, token!, searchKeyword),
    retry: 1,
    initialPageParam: 1,
    getNextPageParam: (lastPage: MemberListResponse) => {
      const { current_page, last_page } = lastPage.data.members;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  // Intersection Observer を保持する ref
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  // 最後のアイテムに付与するコールバック ref
  const lastItemRef = React.useCallback(
    (node: HTMLLIElement | null) => {
      if (!node) return;
      // 既存のオブザーバーがあれば切断
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

  // デバッグ用
  React.useEffect(() => {
    if (data) {
      console.log(
        '[src/components/members/Memberlist.tsx:67] useQuery data:',
        data
      );
    }
  }, [data]);

  // グローバルオーバーレイに任せるので、ロード中は何も返さない
  if (isLoading) {
    return null;
  }

  // エラー時はページ内にメッセージ
  if (isError) {
    return (
      <div className="alert alert-secondary" role="alert">
        データが取得できませんでした。リロードしてください。 ({error?.message})
      </div>
    );
  }

  // 取得したメンバー配列
  const members: MemberListData[] =
    data?.pages.flatMap((p) => p.data.members.data) ?? [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(
      '[src/components/members/Memberlist.tsx:126] e.target.value:',
      e.target.value
    );
    setInputKeyword(e.target.value);
  };

  const handleSearch = () => {
    // setPage(1);
    setSearchKeyword(inputKeyword);
    console.log(
      '[src/components/members/Memberlist.tsx:145] e.target.value:',
      inputKeyword
    );
  };

  const handleClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
    // setPage(1);
  };

  // const buildStorageUrl = (url: string, path: string, suffix?: string) => {
  //   // デフォルト画像パス
  //   const defaultImage = '/assets/images/dummy/dummy_avatar.png';
  //   if (!url || !path) return defaultImage;
  //   const path_suffix = path.replace(
  //     /([^/%]+)(\.[a-zA-Z0-9]+)(\?[^?]*)?$/,
  //     (match, filename, ext, query) =>
  //       `${filename}${suffix}${ext}${query || ''}`
  //   );
  //   return `${url}${path_suffix}?alt=media`;
  // };

  return (
    <>
      {/* 検索ボックス */}
      <div className="member-search mb20">
        <div className="input-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="メンバー検索"
            value={inputKeyword}
            onChange={handleInputChange}
          />
          {inputKeyword && (
            <button
              className="btn clear-button"
              type="button"
              onClick={handleClear}
            >
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
      {/* 成功ステータス */}
      success: {data?.pages[0].success.toString() ?? 'loading…'}
      {/* 全件数 */}
      <h2>MemberList (all: {members.length})</h2>
      <p>{getBcmhzt()}</p>
      {/* メンバー一覧 */}
      <div className="members">
        <ul className="members-list">
          {members.map((m, i) => (
            <li
              key={m.id}
              className="member"
              ref={i === members.length - 1 ? lastItemRef : null}
            >
              <div className="card">
                <div className="profile-header d-flex flex-row">
                  <div className="avatar">
                    <Link to="/member/bcuid">
                      <img
                        src={
                          buildStorageUrl(
                            storageUrl ?? '',
                            m.profile_images ?? '',
                            '_thumbnail'
                          ) || '/assets/images/dummy/dummy_avatar.png'
                        }
                        alt="User Avatar"
                        className="avatar-80"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            '/assets/images/dummy/dummy_avatar.png';
                        }}
                      />
                    </Link>
                  </div>
                  <div className="nickname">
                    {m.nickname ?? '(no nickname)'}
                    <span className="bcuid">@{m.bcuid ?? 'no bcuid?'}</span>
                    <div className="location">
                      {m.user_details_location ?? 'no location'}
                      <GetGenderIcon genderId={m.user_details_gender ?? ''} />
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p>
                    url:{' '}
                    {buildStorageUrl(
                      storageUrl ?? '',
                      m.profile_images ?? '',
                      '_small'
                    )}
                  </p>
                  <p>
                    {m.profile_images ??
                      '/assets/images/dummy/dummy_avatar.png'}
                  </p>
                  <p className="description">
                    {m.description ?? '(no description)'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {/* 次ページ取得中のインジケーター */}
        {isFetchingNextPage && (
          <div className="text-center my-3">Loading more…</div>
        )}
      </div>
      {/* デバッグ出力 */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

export default MemberList;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { X, Search } from 'react-bootstrap-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  // getAgeRangeJp,
  // getBcmhzt,
  getDateOnly,
  chageAgeRange,
} from '../../utility/GetCommonFunctions';
import { buildStorageUrl } from '../../utility/GetUseImage';
import GetGenderIcon from '../../components/commons/GetGenderIcon';
import { CircleFill, X, Search } from 'react-bootstrap-icons';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * 型定義
 * @returns
 */
interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: ApiPage;
  badges?: {
    total_count: number;
    latest_created_at: string | null;
  };
  errors: any;
}
interface ApiPage {
  current_page: number;
  data: ApiData[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}
interface ApiData {
  id: number;
  uid: string;
  target_uid: string;
  reason: string;
  level: number;
  created_at: string;
  updated_at: string;
  bcuid: string;
  email: string;
  nickname: string | null;
  description: string | null;
  profile_images: string | null;
  status: number | null;
  gender: string | null;
  gender_detail: string | null;
  age: number | null;
  location: string | null;
  occupation_type: string | null;
  bheight: number | null;
  bweight: number | null;
  blood_type: string | null;
  academic_background: string | null;
  marital_status: string | null;
  hobbies_lifestyle: string | null;
  alcohol: string | null;
  tobacco: string | null;
  pet: string | null;
  holidays: string | null;
  favorite_food: string | null;
  character: string | null;
  religion: string | null;
  belief: string | null;
  conditions_ideal_partner: string | null;
  age_range: string | null;
  target_area: string | null;
  marriage_aspiration: string | null;
  self_introductory_statement: string | null;
  others_options: string | null;
  profile_video: string | null;
  member_like_created_at: string;
  user_profile_created_at: string;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;
const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;

async function fetchApiData(
  page: number,
  token: string,
  keyword: string
): Promise<ApiResponse> {
  const body = keyword ? { keywords: keyword } : {};
  const res = await axios.post(
    `${apiEndpoint}/v1/get/liked?page=${page}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

const LikedMember = () => {
  const auth = useAuth();
  const token = auth?.token!;

  const [inputKeyword, setInputKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputKeyword(e.target.value);
  const handleSearch = () => setSearchKeyword(inputKeyword);
  const handleClear = () => {
    setInputKeyword('');
    setSearchKeyword('');
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<ApiResponse, Error>({
    queryKey: ['memberList', token, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchApiData(pageParam as number, token, searchKeyword),
    retry: 1,
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.data;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

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

  useEffect(() => {
    if (
      isError &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof auth.refreshToken === 'function'
    ) {
      (async () => {
        await auth.refreshToken();
        refetch();
      })();
    }
  }, [isError, error, auth, refetch]);

  /** ⑪ Loading とエラー制御 */
  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary">
        データ取得失敗 ({error.message})
      </div>
    );
  }

  const listDatas: ApiData[] = data?.pages.flatMap((p) => p.data.data) ?? [];

  const isNew = (createdAt: string): boolean => {
    const today = new Date();
    const createdDate = new Date(createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    return createdDate.getTime() >= oneWeekAgo.getTime();
  };

  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
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
            {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(data?.pages, null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(data?.pages[0], null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(data?.pages[0]?.success, null, 2)}</pre> */}
            {/* <pre>
              {JSON.stringify(data?.pages[0]?.badges?.total_count, null, 2)}
            </pre> */}
            <h2 className="section-title-h2 mb30">
              あなたにナイススケベをした人
              <span className="conut">
                {data?.pages[0]?.badges?.total_count}
              </span>
            </h2>
            <ul className="members-list mt10">
              {listDatas
                .filter((m) => m && m.bcuid)
                .map((m, i) => (
                  <li
                    key={m.id}
                    ref={i === listDatas.length - 1 ? lastItemRef : null}
                    className="member"
                  >
                    <div className="member-flex d-flex justify-content-start">
                      <div className="member-avator-area">
                        {isNew(m.member_like_created_at) && (
                          <CircleFill className="new-mark" />
                        )}
                        <Link to={`/v1/member/${m.bcuid}`}>
                          <img
                            className="member-avator"
                            alt={`member_${m.bcuid}`}
                            src={
                              buildStorageUrl(
                                storageUrl ?? '',
                                m.profile_images ?? '',
                                '_thumbnail'
                              ) ||
                              `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                            }
                          />
                        </Link>
                      </div>
                      <div className="nickname-area">
                        <div className="nick-name">
                          {`${m?.nickname}`}
                          <span className="bcuid">@f56-52c7d2d0</span>
                        </div>
                        <span className="member-property">
                          {chageAgeRange(m?.age)}
                          <GetGenderIcon genderId={m?.gender ?? ''} />@
                          {m?.location || 'no location'}
                        </span>
                        <div className="created_at">
                          {getDateOnly(m.created_at)}より利用
                        </div>
                      </div>
                    </div>
                    {/* {JSON.stringify(m, null, 2)} */}
                  </li>
                ))}
            </ul>
          </div>
          <div className="d-none d-md-block col-md-6 bc-right">
            <div
              style={{ background: '#f1f1f1', height: '100%', padding: '20px' }}
            >
              広告エリア / サブエリア
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default LikedMember;

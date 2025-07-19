/** 69837228 */
import React, { useRef, useCallback, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PersonStanding } from 'react-bootstrap-icons';
import { buildStorageUrl } from '../../utility/GetUseImage';

//

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/members/Blocks.tsx:xx] ‼️debug:', debug);
}

interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    blockList: BlockedMembersPage; // ← これでOK！
  };
  badges?: {
    total_count: number;
    latest_created_at: string | null;
  };
  errors: any;
}

export interface BlockedMembersPage {
  current_page: number;
  data: BlockedMember;
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
}

export interface BlockedMember {
  id: number;
  uid: string;
  target_uid: string;
  reason: string;
  created_at: string;
  updated_at: string;
  bcuid: string;
  email: string;
  nickname: string | null;
  description: string | null;
  profile_images: string | null;
  status: number;
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
  member_block_created_at: string;
  user_profile_created_at: string;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;
const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;

async function fetchApiData(page: number, token: string): Promise<ApiResponse> {
  const res = await axios.post(
    `${apiEndpoint}/v1/get/blocked_members?page=${page}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

/**
 * @request: API: POST /api/members/blocks
 * @returns API: { blocks: Array<Member> }
 * refer to: src/pages/likematch/MatchedCard.tsx
 */
const Blocks = () => {
  const auth = useAuth();
  const token = auth?.token!;

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
    queryKey: ['memberList', token],
    queryFn: ({ pageParam = 1 }) =>
      fetchApiData(pageParam as number, token as string),
    retry: 1,
    initialPageParam: 1,
    enabled: !!token, // ← これでtokenがnullのときは実行されない
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.data.blockList;
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

  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary">
        データ取得失敗 ({error.message})
      </div>
    );
  }

  const listDatas: BlockedMember[] =
    data?.pages.flatMap((p) => p.data.blockList.data) ?? [];
  const totalCount = data?.pages[0]?.data?.blockList?.total ?? 0;

  async function handleReleaseBlock(id: number, bcuid: string) {
    console.log('[src/pages/members/Blocks.tsx:xx] bcuid:', bcuid);
    if (!window.confirm('本当にブロックを解除しますか？')) {
      return;
    }

    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/release/block/${bcuid}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('ブロックを解除しました。');
        refetch(); // Refresh the list after successful unblock
      } else {
        alert(`ブロック解除に失敗しました: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error releasing block:', error);
      alert('ブロック解除中にエラーが発生しました。');
    }
  }
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            {/* <pre>{JSON.stringify(totalCount, null, 2)}</pre> */}
            <h2 className="section-title-h2 mb30">
              ブロックした人
              {totalCount && (
                <>
                  <span className="conut">{totalCount}</span>
                </>
              )}
              {/* <span className="conut">999</span> */}
            </h2>
            {/* <pre>{JSON.stringify(listDatas, null, 2)}</pre> */}
            {listDatas.length === 0 && (
              <>
                <div className="alert alert-light" role="alert">
                  現在、ブロックしたユーザーはいません。
                </div>
              </>
            )}
            <ul className="members-list mt10">
              {listDatas.map((member, index) => (
                <>
                  {/* <pre>{JSON.stringify(member.profile_images, null, 2)}</pre> */}
                  <li
                    key={member.id}
                    className="member"
                    ref={index === listDatas.length - 1 ? lastItemRef : null}
                  >
                    <div className="member-flex d-flex justify-content-start">
                      <div className="member-avator-area">
                        <Link to={`/member/${member.bcuid}`}>
                          <img
                            className="member-avator"
                            alt={`member_${member.bcuid}`}
                            src={
                              member.profile_images
                                ? buildStorageUrl(
                                    storageUrl ?? '',
                                    member.profile_images ?? '',
                                    '_thumbnail'
                                  )
                                : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                            }
                            onError={(e) => {
                              e.currentTarget.src = `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`;
                            }}
                          />
                        </Link>
                      </div>
                      <div className="nickname-area">
                        <div className="nick-name">
                          {member.nickname || 'No Name'}
                          <span className="bcuid">@{member.bcuid}</span>
                        </div>
                        <span className="member-property">
                          {member.age ? `${member.age}代` : '年齢不明'}
                          <PersonStanding />
                          {member.occupation_type || '職業不明'}
                        </span>
                      </div>
                      <div className="member-property">
                        <button
                          type="button"
                          className="btn btn-light btn-sm"
                          style={{ width: '120px' }}
                          onClick={() => {
                            handleReleaseBlock(member.id, member.bcuid);
                          }}
                        >
                          ブロック解除
                        </button>
                      </div>
                    </div>
                  </li>
                </>
              ))}

              {/* <li key="" className="member">
                <div className="member-flex d-flex justify-content-start">
                  <div className="member-avator-area">
                    <Link to="/">
                      <img
                        className="member-avator"
                        alt="foo"
                        src="/assets/images/dummy/dummy_avatar.png"
                      />
                    </Link>
                  </div>
                  <div className="nickname-area">
                    <div className="nick-name">
                      Foobar<span className="bcuid">@xxxxxxxx</span>
                    </div>
                    <span className="member-property">
                      30代前半
                      <PersonStanding />
                      foobar
                    </span>
                  </div>
                  <div className="member-property">
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      style={{ width: '120px' }}
                    >
                      ブロック解除
                    </button>
                  </div>
                </div>
              </li> */}
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
export default Blocks;

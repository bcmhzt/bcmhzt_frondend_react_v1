/** 7b0ecf65 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  // PersonStanding,
  // PersonStandingDress,
  // PersonArmsUp,
  // PersonWalking,
  X,
  CardText,
  // CardImage,
  Search,
} from 'react-bootstrap-icons';
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
// src/components/members/MemberTools.tsx
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

interface UserDetails {
  id?: number;
  uid?: string;
  gender?: string | null;
  gender_detail?: string | null;
  age?: number | null;
  occupation_type?: string | null;
  bheight?: number | null;
  bweight?: number | null;
  blood_type?: string | null;
  academic_background?: string | null;
  marital_status?: string | null;
  hobbies_lifestyle?: string | null;
  alcohol?: string | null;
  tobacco?: string | null;
  pet?: string | null;
  holidays?: string | null;
  favorite_food?: string | null;
  character?: string | null;
  religion?: string | null;
  belief?: string | null;
  conditions_ideal_partner?: string | null;
  age_range?: string | null;
  target_area?: string | null;
  marriage_aspiration?: string | null;
  self_introductory_statement?: string | null;
  others_options?: string | null;
  profile_video?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  location?: string | null;
}

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
  propensities?: any; // 追加: propensitiesプロパティ（型は適宜修正）
  status?: string | null; // 追加: statusプロパティ
  created_at?: string | null; // 追加: created_atプロパティ
  updated_at?: string | null; // 追加: updated_atプロパティ
  user_detail_id?: string | null; // 追加: user_detail_idプロパティ
  user_details_uid?: string | null; // 追加: user_details_uidプロパティ
  user_details_gender_detail?: string | null;
  user_details_age?: number | null;
  user_details_occupation_type?: string | null;
  user_details_bheight?: number | null;
  user_details_bweight?: number | null;
  user_details_blood_type?: string | null;
  user_details_academic_background?: string | null;
  user_details_marital_status?: string | null;
  user_details_hobbies_lifestyle?: string | null;
  user_details_alcohol?: string | null;
  user_details_tobacco?: string | null;
  user_details_pet?: string | null;
  user_details_holidays?: string | null;
  user_details_favorite_food?: string | null;
  user_details_character?: string | null;
  user_details_religion?: string | null;
  user_details_belief?: string | null;
  user_details_conditions_ideal_partner?: string | null;
  user_details_age_range?: string | null;
  user_details_target_area?: string | null;
  user_details_marriage_aspiration?: string | null;
  user_details_self_introductory_statement?: string | null;
  user_details_others_options?: string | null;
  user_details_profile_video?: string | null;
  user_details_created_at?: string | null;
  user_details_updated_at?: string | null;
  user_details?: UserDetails[]; // ← これを追加
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

/**
 * 関数本体
 *
 *
 *
 *
 * */
const MemberList: React.FC = () => {
  // const [page, setPage] = useState(1);
  const auth = useAuth();
  const token = auth?.token;
  const [inputKeyword, setInputKeyword] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;
  const [isPullDownOpen, setIsPullDownOpen] = useState<{
    [id: number]: boolean;
  }>({});

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
      if (!lastPage?.data?.members) return undefined;
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

  const togglePullDown = (id: number) => {
    setIsPullDownOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    if (debug === 'true') {
      console.log(
        '[src/components/members/Memberlist.tsx:147] togglePullDown',
        [isPullDownOpen]
      );
    }
  };

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
    data?.pages.flatMap((p) =>
      p?.data?.members?.data ? p.data.members.data : []
    ) ?? [];

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
      {/* success: {data?.pages[0].success.toString() ?? 'loading…'} */}
      {/* 全件数 */}
      <h2>MemberList (all: {members.length})</h2>
      {/* <p>{getBcmhzt()}</p> */}
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
                <MemberTools targetBcuid={m.bcuid} />
                <div className="profile-header d-flex flex-row">
                  <div className="avatar">
                    <Link to={`/member/${m.bcuid}`}>
                      <img
                        src={
                          buildStorageUrl(
                            storageUrl ?? '',
                            m.profile_images ?? '',
                            '_small'
                          ) ||
                          `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                        }
                        alt="User Avatar"
                        className="avatar-80"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          (e.currentTarget as HTMLImageElement).src =
                            `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`;
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
                    <div className="post-count mt5">
                      <Link to="/">
                        <CardText
                          className="mr5"
                          style={{ fontSize: '23px' }}
                        />
                        投稿(999)
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <p className="description">
                    {/* 関数でHTMLを生成する場合はdangerouslySetInnerHTMLを使う */}
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

                  <div className="propensities">
                    {/* <pre>{JSON.stringify(m.propensities, null, 2)}</pre> */}
                    {Array.isArray(m.propensities) ? (
                      m.propensities.length > 0 ? (
                        m.propensities.map((prop: any, idx: number) => (
                          <span key={idx} className="propensity-tag">
                            {typeof prop === 'object' && <>{prop.name_ja}</>}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="propensity-tag">スケベタグなし</span>
                        </>
                      )
                    ) : (
                      <>スケベタグなし</>
                    )}
                  </div>

                  <div
                    className="member-toggle"
                    style={{
                      cursor: 'pointer',
                      color: '#007bff',
                      marginTop: '8px',
                    }}
                    onClick={() => togglePullDown(m.id)}
                  >
                    {typeof isPullDownOpen === 'object' &&
                    isPullDownOpen[m.id] ? (
                      <>close</>
                    ) : (
                      <>more read ...</>
                    )}
                  </div>
                  {typeof isPullDownOpen === 'object' &&
                    isPullDownOpen[m.id] && (
                      <div className="member-pulldown">
                        <div className="member-detail mt20">
                          {/* <pre>{JSON.stringify(m, null, 2)}</pre> */}
                          詳細情報
                          <table className="table table-bordered table-sm table-striped">
                            <tbody>
                              <tr>
                                <td className="item-name">ID</td>
                                <td>{m.id}</td>
                              </tr>
                              {debug === 'true' && (
                                <tr>
                                  <td>UID</td>
                                  <td>{m.uid}</td>
                                </tr>
                              )}

                              <tr>
                                <td>BCUID</td>
                                <td>{m.bcuid}</td>
                              </tr>
                              {/* <tr>
                                <td>メールアドレス</td>
                                <td>{m.email}</td>
                              </tr> */}
                              <tr>
                                <td>ニックネーム</td>
                                <td>{m.nickname}</td>
                              </tr>
                              {/* <tr>
                                <td>説明</td>
                                <td>{m.description ?? '(no description)'}</td>
                              </tr> */}
                              {/* <tr>
                                <td>プロフィール画像</td>
                                <td>
                                  {m.profile_images ? (
                                    <img
                                      src={buildStorageUrl(
                                        storageUrl ?? '',
                                        m.profile_images,
                                        '_thumbnail'
                                      )}
                                      alt="プロフィール画像"
                                      style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: 'cover',
                                      }}
                                      onError={(e) => {
                                        (
                                          e.currentTarget as HTMLImageElement
                                        ).src =
                                          '/assets/images/dummy/dummy_avatar.png';
                                      }}
                                    />
                                  ) : (
                                    'なし'
                                  )}
                                </td>
                              </tr> */}
                              <tr>
                                <td>ステータス</td>
                                <td>{m.status ?? ''}</td>
                              </tr>
                              <tr>
                                <td>作成日</td>
                                <td>{m.created_at ?? ''}</td>
                              </tr>
                              <tr>
                                <td>更新日</td>
                                <td>{m.updated_at ?? ''}</td>
                              </tr>
                              <tr>
                                <td>詳細ID</td>
                                <td>
                                  {Array.isArray(m.user_details)
                                    ? (m.user_details[0]?.id ?? '')
                                    : ''}
                                </td>
                              </tr>
                              <tr>
                                <td>詳細UID</td>
                                <td>{m.user_details_uid ?? ''}</td>
                              </tr>
                              <tr>
                                <td>性別</td>
                                <td>{m.user_details_gender ?? ''}</td>
                              </tr>
                              <tr>
                                <td>性別詳細</td>
                                <td>{m.user_details_gender_detail ?? ''}</td>
                              </tr>
                              <tr>
                                <td>年齢</td>
                                <td>{m.user_details_age ?? ''}</td>
                              </tr>
                              <tr>
                                <td>都道府県</td>
                                <td>{m.user_details_location ?? ''}</td>
                              </tr>
                              <tr>
                                <td>職業</td>
                                <td>{m.user_details_occupation_type ?? ''}</td>
                              </tr>
                              <tr>
                                <td>身長</td>
                                <td>{m.user_details_bheight ?? ''}</td>
                              </tr>
                              <tr>
                                <td>体重</td>
                                <td>{m.user_details_bweight ?? ''}</td>
                              </tr>
                              <tr>
                                <td>血液型</td>
                                <td>{m.user_details_blood_type ?? ''}</td>
                              </tr>
                              <tr>
                                <td>学歴</td>
                                <td>
                                  {m.user_details_academic_background ?? ''}
                                </td>
                              </tr>
                              <tr>
                                <td>婚姻状況</td>
                                <td>{m.user_details_marital_status ?? ''}</td>
                              </tr>
                              <tr>
                                <td>趣味・ライフスタイル</td>
                                <td>
                                  {m.user_details_hobbies_lifestyle ?? ''}
                                </td>
                              </tr>
                              <tr>
                                <td>お酒</td>
                                <td>{m.user_details_alcohol ?? ''}</td>
                              </tr>
                              <tr>
                                <td>タバコ</td>
                                <td>{m.user_details_tobacco ?? ''}</td>
                              </tr>
                              <tr>
                                <td>ペット</td>
                                <td>{m.user_details_pet ?? ''}</td>
                              </tr>
                              <tr>
                                <td>休日</td>
                                <td>{m.user_details_holidays ?? ''}</td>
                              </tr>
                              <tr>
                                <td>好きな食べ物</td>
                                <td>{m.user_details_favorite_food ?? ''}</td>
                              </tr>
                              <tr>
                                <td>性格</td>
                                <td>{m.user_details_character ?? ''}</td>
                              </tr>
                              <tr>
                                <td>宗教</td>
                                <td>{m.user_details_religion ?? ''}</td>
                              </tr>
                              <tr>
                                <td>信条</td>
                                <td>{m.user_details_belief ?? ''}</td>
                              </tr>
                              <tr>
                                <td>理想の相手条件</td>
                                <td>
                                  {m.user_details_conditions_ideal_partner ??
                                    ''}
                                </td>
                              </tr>
                              <tr>
                                <td>希望年齢層</td>
                                <td>{m.user_details_age_range ?? ''}</td>
                              </tr>
                              <tr>
                                <td>希望エリア</td>
                                <td>{m.user_details_target_area ?? ''}</td>
                              </tr>
                              <tr>
                                <td>結婚願望</td>
                                <td>
                                  {m.user_details_marriage_aspiration ?? ''}
                                </td>
                              </tr>
                              <tr>
                                <td>自己紹介文</td>
                                <td>
                                  {m.user_details_self_introductory_statement ??
                                    ''}
                                </td>
                              </tr>
                              <tr>
                                <td>その他オプション</td>
                                <td>{m.user_details_others_options ?? ''}</td>
                              </tr>
                              <tr>
                                <td>プロフィール動画</td>
                                <td>{m.user_details_profile_video ?? ''}</td>
                              </tr>
                              <tr>
                                <td>詳細作成日</td>
                                <td>{m.user_details_created_at ?? ''}</td>
                              </tr>
                              <tr>
                                <td>詳細更新日</td>
                                <td>{m.user_details_updated_at ?? ''}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>
                {/* <div className="card-footer">
                  {m.profile_images ?? ''}
                </div> */}
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
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </>
  );
};

export default MemberList;

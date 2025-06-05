/** ae5b9d3a */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  // getAgeRangeJp,
  // getBcmhzt,
  getDateOnly,
  chageAgeRange,
} from '../../utility/GetCommonFunctions';
import GetGenderIcon from '../commons/GetGenderIcon';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { CircleFill } from 'react-bootstrap-icons';
//

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/dashboards/ILikedCardLimit.tsx:xx] debug:',
    debug
  );
}

/**
 * ae5b9d3a
 * [src/components/dashboards/ILikedCardLimit:xx]
 *
 * type: component
 *
 * [Order]
 * - あなたがナイススケベをした人（10件）ページネーションの1ページ目のみ取得
 * ① ファイル＆雛形作成
 * ② 必要な import
 * ③ 型定義
 * ④ static 定義
 * ⑤ fetch 関数実装
 * ⑥ 検索フォーム制御
 * ⑦ 認証情報の設定（Token）
 */

/** APIの返り値のinterface */
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

/** ④ static 定義 */
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;
const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;

async function fetchApiData(page: number, token: string): Promise<ApiResponse> {
  try {
    const res = await axios.post(
      `${apiEndpoint}/v1/get/i_liked_list?page=1`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (debug === 'true') {
      console.log(
        '[src/components/dashboards/ILikedCardLimit.tsx:119] res.data:',
        res.data
      );
    }

    return res.data;
  } catch (error) {
    console.error(
      '[src/components/dashboards/ILikedCardLimit.tsx:126] API error:',
      error
    );
    throw error;
  }
}

const ILikedCardLimit = () => {
  const auth = useAuth();
  const token = auth?.token!;

  /** APIデータはdataで取得 */
  const { data, isLoading, isError, error, refetch } = useQuery<
    ApiResponse,
    Error
  >({
    queryKey: ['ilikedMemberList', token],
    queryFn: () => fetchApiData(1, token),
    retry: 1,
    enabled: !!token,
  });

  useEffect(() => {
    console.log(
      '[src/components/dashboards/ILikedCardLimit.tsx:162] ILikedCardLimit data:',
      data
    );
  }, [data]);

  /** 401エラーのときはTokenの再発行をする */
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

  /** それ以外のエラーは例外処理 */
  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary">
        データ取得失敗 ({error.message})
      </div>
    );
  }

  console.log(
    '[src/components/dashboards/ILikedCardLimit.tsx:163] data?.data.total:',
    data?.data.total
  );
  // setTotalCount(data?.data.total ?? 0);

  const listData: ApiData[] = data?.data?.data ?? [];

  /**
   * 1. listDataの配列の1つ目の要素を取得
   * 2. その要素から、member_like_created_atの値(a)を取得する
   * 3. ローカルストレージのLikedMember(key)に日付が格納されているか確認する
   * 4. 日付が格納されていたら(b)、その日付(b)と(a)を比較する。（必ず(a)の方が新しい）
   * 5. listDataの配列で、(b)より新しいレコードを抽出して、件数をカウントする。
   * 6. listDataの配列で、(b)より新しいレコードを抽出して、そのレコードにフラグを立てる(新しい配列の要素を加える)
   * 7. フラグのあるレコードには新しい何等かのマークを追加する。
   */

  const isNew = (createdAt: string): boolean => {
    const today = new Date();
    const createdDate = new Date(createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    return createdDate.getTime() >= oneWeekAgo.getTime();
  };

  return (
    <>
      {/* <pre>{JSON.stringify(listData, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(data?.data.total, null, 2)}</pre> */}
      {/* success: {data?.success?.toString()} */}
      {/* success: {data?.total?.toString()} */}
      <h2 className="section-title-h2">
        あなたがナイススケベをした人
        <span className="conut">{data?.data.total}</span>
      </h2>
      <ul className="members-list mt10">
        {data?.data?.total !== undefined && data.data.total > 10 && (
          <p className="more-read">
            <Link to="/i_liked">もっとみる...</Link>
          </p>
        )}

        {listData.length === 0 ? (
          <div className="alert alert-secondary" role="alert">
            まだ、あなたがナイスすけべをした人はいません。
          </div>
        ) : (
          listData.map((m) => (
            <li key={m.id} className="member">
              {/* <pre>{JSON.stringify(m, null, 2)}</pre> */}
              <div className="member-flex d-flex justify-content-start">
                <div className="member-avator-area">
                  {isNew(m.member_like_created_at) && (
                    <CircleFill className="new-mark" />
                  )}
                  <Link to={`/member/${m.bcuid}`}>
                    {/* <pre>
                    {JSON.stringify(m?.member_like_created_at, null, 2)}
                  </pre> */}
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
                    <span className="bcuid">@{m.bcuid}</span>
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
            </li>
          ))
        )}
      </ul>
    </>
  );
};
export default ILikedCardLimit;

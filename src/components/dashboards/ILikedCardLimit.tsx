/** cd309e89 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getDateOnly, chageAgeRange } from '../../utility/GetCommonFunctions';
import GetGenderIcon from '../commons/GetGenderIcon';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { CircleFill } from 'react-bootstrap-icons';

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
  member_like_uid: string;
  member_like_target_uid: string;
  match_score: number;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;
const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;
const debug = process.env.REACT_APP_DEBUG === 'true';

async function fetchApiData(page: number, token: string): Promise<ApiResponse> {
  try {
    const res = await axios.post(
      `${apiEndpoint}/v1/get/i_liked_list?page=${page}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (debug) {
      console.log('✅ API Response:', res.data);
    }
    return res.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

const ILikedCardLimit = () => {
  const auth = useAuth();
  const token = auth?.token;

  const { data, isLoading, isError, error, refetch } = useQuery<
    ApiResponse,
    Error
  >({
    queryKey: ['memberList', token],
    queryFn: () => fetchApiData(1, token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (
      isError &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof auth?.refreshToken === 'function'
    ) {
      (async () => {
        await auth.refreshToken();
        refetch();
      })();
    }
  }, [isError, error, refetch, auth]);

  const listData: ApiData[] = data?.data?.data ?? [];

  const isNew = (createdAt: string): boolean => {
    const today = new Date();
    const createdDate = new Date(createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    return createdDate.getTime() >= oneWeekAgo.getTime();
  };

  if (isLoading) return null;
  if (isError)
    return (
      <div className="alert alert-secondary">
        データ取得失敗 ({error.message})
      </div>
    );

  return (
    <>
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
              <div className="member-flex d-flex justify-content-start">
                <div className="member-avator-area">
                  {isNew(m.member_like_created_at) && (
                    <CircleFill className="new-mark" />
                  )}
                  <Link to={`/member/${m.bcuid}`}>
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
                    {m?.nickname}
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

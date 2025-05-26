/** 6b836863 */
import React, { useState, useRef, useCallback } from 'react';
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
// src/components/commons/GetGenderIcon.tsx

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/dashboards/LikedMemberLimit.tsx:xx] debug:',
    debug
  );
}

/**
 * 6b836863
 * [src/components/dashboards/LikedMemberLimit:xx]
 *
 * type: component
 *
 * [Order]
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

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;
const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;

async function fetchApiData(page: number, token: string): Promise<ApiResponse> {
  try {
    const res = await axios.post(
      `${apiEndpoint}/v1/get/liked?page=1`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (debug === 'true') {
      console.log(
        '[src/components/dashboards/LikedMemberLimit.tsx:119] res.data:',
        res.data
      );
    }

    return res.data;
  } catch (error) {
    console.error(
      '[src/components/dashboards/LikedMemberLimit.tsx:126] API error:',
      error
    );
    throw error;
  }
}

const LikedMemberLimit = () => {
  const auth = useAuth();
  const token = auth?.token!;

  const { data, isLoading, isError, error } = useQuery<ApiResponse, Error>({
    queryKey: ['likedMemberList', token],
    queryFn: () => fetchApiData(1, token),
    retry: 1,
    enabled: !!token,
  });

  if (isLoading) return null;
  if (isError) {
    return (
      <div className="alert alert-secondary">
        データ取得失敗 ({error.message})
      </div>
    );
  }

  const listData: ApiData[] = data?.data?.data ?? [];

  return (
    <>
      {/* <pre>{JSON.stringify(listDatas, null, 2)}</pre> */}
      {/* success: {data?.success?.toString()} */}
      <h2>あなたにナイススケベをした人 {/*(all: {listData.length})*/}</h2>

      <ul className="members-list mt10">
        <p className="more-read">
          <Link to="/">もっとみる...</Link>
        </p>
        {listData.map((m) => (
          <li key={m.id} className="member">
            {/* <pre>{JSON.stringify(m, null, 2)}</pre> */}
            <div className="member-flex d-flex justify-content-start">
              <div className="member-avator-area">
                <Link to={`/v1/member/${m.bcuid}`}>
                  <img
                    className="member-avator"
                    alt={`member_${m.bcuid}`}
                    src="https://firebasestorage.googleapis.com/v0/b/bcmhzt-b25e9.appspot.com/o/profiles%2FrLgA6ZP4hPVegLhddIQON85xdP13%2FrLgA6ZP4hPVegLhddIQON85xdP13_thumbnail.jpg?alt=media"
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
          </li>
        ))}
      </ul>
    </>
  );
};
export default LikedMemberLimit;

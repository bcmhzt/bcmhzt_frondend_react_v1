/** 7b0ecf65 */
import React, { useState } from 'react';
import {
  PersonStanding,
  PersonStandingDress,
  PersonArmsUp,
  PersonWalking,
  X,
  CardText,
  CardImage,
  Search
} from 'react-bootstrap-icons';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log("[src/components/members/Memberlist.tsx:xx] debug:", debug);
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
  title: string;
  description: string;
}

/** データ取得関数 */
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

async function fetchArchtectData(page: number, token: string): Promise<MemberListData> {
  // await new Promise<void>(r => setTimeout(r, 1500));   // テスト用遅延

  const res = await axios.post(
    `${apiEndpoint}/v1/get/members?page=${page}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (debug === 'true') console.log("[Memberlist] res:", res.data);
  return res.data;
}

const MemberList: React.FC = () => {
  const [page, setPage] = useState(1);
  const auth = useAuth();
  const token = auth?.token;

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<MemberListData, Error>({
    queryKey: ["architectData", page, token],
    queryFn: () => fetchArchtectData(page, token!),
    retry: 1,
  });
  // const currentUserProfile = auth?.currentUserProfile;
  // const myProfileImage = auth?.myProfileImage;
  // const isLogin = auth?.isLogin;
  

  console.log("[src/components/members/Memberlist.tsx:80] token:", token);

  // デバッグ用
  React.useEffect(() => {
    if (data) {
      console.log("[src/components/members/Memberlist.tsx:67] useQuery data:", data);
    }
  }, [data]);

  return (
    <>
    {isError && <div style={{color: 'red'}}>Error: {error?.message}</div>}
    <pre>{JSON.stringify(error, null, 2)}</pre>
      {/* 検索ボックス */}
      <div className="member-search mb20">
        <div className="input-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="メンバー検索"
            // value={keywords}
            // onChange={(e) => setKeywords(e.target.value)}
          />
          {/* {keywords && ( */}
            <button
              className="btn clear-button"
              type="button"
              onClick={() => {
                // setKeywords("");
                window.location.reload();
              }}
            >
              <X size={16} />
            </button>
          {/* )} */}
          <button
            className="btn btn-primary bcmhzt-btn"
            type="button"
            // onClick={handleSearch}
          >
            <Search className="search-icon" />
          </button>
        </div>
      </div>
      MemberList

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};
export default MemberList;
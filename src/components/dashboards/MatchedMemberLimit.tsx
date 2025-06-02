/** 4609aed3 */
import React, { useState, useEffect } from 'react';
import {
  PersonStanding,
  PersonStandingDress,
  PersonArmsUp,
  PersonWalking,
  // X,
  // CardText,
  // CardImage,
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { buildStorageUrl } from '../../utility/GetUseImage';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug) {
  console.log(
    '[src/components/v1/dashboard/MatchedMemberLimit.js:16] debug mode is on'
  );
}

/**
 * 4609aed3
 * [src/components/dashboards/MatchedMemberLimit.tsx:xx]
 *
 * type: component
 *
 * [Order]
 * - あなたとスケベマッチした人（10件）ページネーションの1ページ目のみ取得
 */

const MatchedMemberLimit = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { token } = useAuth();
  interface MatchedMember {
    bcuid: string;
    nickname: string;
    gender: number | null;
    location?: string;
    member_like_created_at: string;
    profile_images?: any;
  }
  const [matchedMembers, setMatchedMembers] = useState<MatchedMember[]>([]);
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;

  /**
   * Dashboardではpagenationの1page目だけを取得する
   * 全量は別ページで取得する（無限スクロール）
   */
  useEffect(() => {
    const fetchMatchedMembers = async () => {
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/get/matched?page=1`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(
          '[src/components/v1/dashboard/LikedMemberLimit.js:33] response:',
          response.data
        );
        setMatchedMembers(response.data.data.data);
      } catch (error) {
        console.error('src/components/v1/dashboard/LikedMemberLimit.js', error);
      }
    };
    fetchMatchedMembers();
  }, [token, apiEndpoint]);

  interface MatchedMember {
    bcuid: string;
    nickname: string;
    gender: number | null;
    location?: string;
    member_like_created_at: string;
    profile_images?: any;
  }

  const isNew = (createdAt: string): boolean => {
    const today = new Date();
    const createdDate = new Date(createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    return createdDate.getTime() >= oneWeekAgo.getTime();
  };

  return (
    <>
      {/* <pre>{JSON.stringify(matchedMembers, null, 2)}</pre> */}
      <div className="matched-member-limit">
        <div className="matched-member-limit-title">
          <h2 className="">あなたとスケベマッチした人</h2>
          {matchedMembers?.length > 0 && (
            <div className="more-read">
              <a href="/v1/matched_member">もっと見る</a>
            </div>
          )}
        </div>

        <ul className="matched-member-list">
          {matchedMembers && matchedMembers.length > 0 ? (
            matchedMembers.map((member, index) => (
              <li key={index} className="matched-member-item">
                {/* <pre>{JSON.stringify(member, null, 2)}</pre> */}
                <div className="matched-member d-flex justify-content-start">
                  <div className="member-avator-area">
                    {isNew(member.member_like_created_at) && (
                      <div className="new">new</div>
                    )}
                    <a href={`/v1/member/${member.bcuid}`}>
                      <img
                        className="member-avator"
                        src={
                          member?.profile_images
                            ? buildStorageUrl(
                                storageUrl ?? '',
                                member.profile_images,
                                '_thumbnail'
                              )
                            : `${process.env.PUBLIC_URL}/assets/dummy-user.png`
                        }
                        alt={`member_@${member?.bcuid || 'unknown'}`}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          (e.currentTarget as HTMLImageElement).src =
                            `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`;
                        }}
                      />
                    </a>
                  </div>
                  <div>
                    <div className="nick-name">
                      {member.nickname}
                      <span className="bcuid">@{member.bcuid}</span>
                    </div>
                    {member.gender === null ? (
                      <PersonWalking
                        style={{ fontSize: '20px', color: '#888' }}
                      />
                    ) : Number(member.gender) === 1 ? (
                      <PersonStanding
                        style={{ fontSize: '20px', color: '#0000ff' }}
                      />
                    ) : Number(member.gender) === 2 ? (
                      <PersonStandingDress
                        style={{ fontSize: '20px', color: '#880000' }}
                      />
                    ) : (
                      <PersonArmsUp
                        style={{ fontSize: '20px', color: '#006400' }}
                      />
                    )}
                    <span className="location">{member.location || ''}</span>
                    <div className="created_at mt10">
                      {member.member_like_created_at}
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <div className="no-data mb10">まだいません</div>
          )}
        </ul>
      </div>
    </>
  );
};
export default MatchedMemberLimit;

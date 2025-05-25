import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { useInfiniteQuery } from '@tanstack/react-query';
// import { useIReceivedLikeContext } from '../../../contexts/LikeMatch/IRecievedLikeContext';

const debug = process.env.REACT_APP_DEBUG === 'true';
if (debug) {
  console.log(
    '[src/components/v1/dashboard/LikedMemberLimit.js] debug mode is on'
  );
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const LikedMemberLimit = () => {
  const { token } = useAuth();
  const [likedMembers, setLikedMembers] = useState<LikedMember[]>([]);
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;
  // const { unreadDelta } = useIReceivedLikeContext();

  /**
   * Dashboardではpagenationの1page目だけを取得する
   * 全量は別ページで取得する（無限スクロール）
   */
  useEffect(() => {
    const fetchLikedMembers = async () => {
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/get/liked`,
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
        setLikedMembers(response.data.data.data);
      } catch (error) {
        console.error('src/components/v1/dashboard/LikedMemberLimit.js', error);
      }
    };
    fetchLikedMembers();
  }, [token, apiEndpoint]);

  interface LikedMember {
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
    /** ナイスすけべをして一週間以内（7日以内）だったらnew */
    oneWeekAgo.setDate(today.getDate() - 7);

    return createdDate.getTime() >= oneWeekAgo.getTime();
  };

  return (
    <>
      <div className="liked-member-limit">
        <div className="liked-member-limit-title">
          <h2 className="">
            あなたにナイススケベをした人
            {/* {unreadDelta > 0 && (
              <span className="badge bg-primary bg-bcmhzt">{unreadDelta}</span>
            )} */}
          </h2>
          {likedMembers?.length > 0 && (
            <div className="more-read">
              {/* <a href="/v1/liked_member">もっと見る</a> */}
              <Link to="/v1/liked_member">もっと見る</Link>
            </div>
          )}
        </div>

        {/* <pre>{JSON.stringify(likedMembers, null, 2)}</pre> */}
        <ul className="liked-member-list">
          {likedMembers && likedMembers.length > 0 ? (
            likedMembers.map((member, index) => (
              <li>
                {/* <pre>{JSON.stringify(member, null, 2)}</pre> */}
                <div className="liked-member d-flex justify-content-start">
                  <div className="member-avator-area">
                    {/*
                  member_like_created_atの日付を見て、1週間以内だったらnew
                  今日の日付を取得して比較
                  共通の関数にしておきたい。
                  */}
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
            <>
              <div className="no-data mb10">まだいません</div>
            </>
          )}

          {/* <li>
          <div className="liked-member d-flex justify-content-start">
            <div className="member-avator-area">
              <div className="new">new</div>
              <a href="/v1/member/@a8c-6207400e">
                <img className="member-avator" src="/assets/dummy/150x150.png" alt="member_@a8c-6207400e" />
              </a>
            </div>
            <div>
              <div className="nick-name">roughlangx+admin<span className="bcuid">@a8c-6207400e</span></div>
              <PersonArmsUp style={{ fontSize: '20px', color: '#006400' }} />
              <span className="location">東京都</span>
            </div>
          </div>
        </li> */}
        </ul>
      </div>
    </>
  );
};
export default LikedMemberLimit;

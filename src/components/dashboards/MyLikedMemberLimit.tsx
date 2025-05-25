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
// import { useISendedLikeContext } from '../../../contexts/LikeMatch/ISendedLikeContext';

const debug = process.env.REACT_APP_DEBUG === 'true';
if (debug) {
  console.log(
    '[src/components/v1/dashboard/MyLikedMemberLimit.js:13] debug mode is on'
  );
}

const MyLikedMemberLimit = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { token } = useAuth();
  interface ILikedMember {
    bcuid: string;
    nickname: string;
    gender: number | null;
    profile_images?: string;
    member_like_created_at: string;
  }
  const [iLikedMembers, setILikedMembers] = useState<ILikedMember[]>([]);
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;
  // const { unreadDelta } = useISendedLikeContext();

  useEffect(() => {
    const fetchLikedMembers = async () => {
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/get/i_liked_list?page=1`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(
          '[src/components/v1/dashboard/MyLikedMemberLimit.js:13] debug response:',
          [response]
        );
        setILikedMembers(response.data.data.data);
      } catch (error) {
        console.error(
          'src/components/v1/dashboard/MyLikedMemberLimit.js',
          error
        );
      }
    };
    fetchLikedMembers();
  }, [token, apiEndpoint]); // Removed iLikedMembers to prevent infinite loop

  interface ILikedMember {
    bcuid: string;
    nickname: string;
    gender: number | null;
    profile_images?: string;
    member_like_created_at: string;
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
      <div className="liked-member-limit">
        <div className="liked-member-limit-title">
          <h2 className="">
            あなたがナイススケベをした人々
            {/* {unreadDelta > 0 && (
              <span className="badge bg-primary bg-bcmhzt">{unreadDelta}</span>
            )} */}
          </h2>
          {/* {iLikedMembers?.length === 0 && (
            <>0の場合に表示</>
          )} */}
          {iLikedMembers?.length > 0 && (
            <div className="more-read">
              <a href="/v1/my_liked_member">もっと見る</a>
            </div>
          )}
        </div>
        {/* <pre>{JSON.stringify(iLikedMembers, null, 2)}</pre> */}
        <ul className="liked-member-list">
          {iLikedMembers && iLikedMembers.length > 0 ? (
            iLikedMembers.map((member, index) => (
              <li key={index}>
                <div className="liked-member d-flex justify-content-start">
                  <div className="member-avator-area">
                    {isNew(member.member_like_created_at) && (
                      <div className="new">new</div>
                    )}
                    <a href={`/v1/member/${member?.bcuid || 'unknown'}`}>
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
                    <span className="location">東京都</span>
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
export default MyLikedMemberLimit;

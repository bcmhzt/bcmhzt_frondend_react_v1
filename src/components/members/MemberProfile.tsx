/** 4f085205 */
import React, { Fragment, useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import GetGenderIcon from '../../components/commons/GetGenderIcon';
import { buildStorageUrl } from '../../utility/GetUseImage';
import {
  chageAgeRange,
  getAgeRangeJp,
  convertFormattedText,
} from '../../utility/GetCommonFunctions';
import { X, CardText } from 'react-bootstrap-icons';
import MemberTools from './MemberTools';
import { Link } from 'react-router-dom';

/**
 * props
 */
interface MemberProfileProps {
  /** URL パラメータで渡ってくる bcuid */
  bcuid: string;
}

/** 性癖タグ */
interface Propensity {
  id: number;
  name_ja: string;
  status: number; // 1: 表示対象
}

/** API で取得するメンバー情報 */
interface MemberData {
  member: {
    id: number | string;
    bcuid: string;
    uid: string;
    nickname: string | null;
    description: string | null;
    profile_images: string | null;
    gender: string | null;
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
    favorite_food: string | null;
    character: string | null;
    religion: string | null;
    conditions_ideal_partner: string | null;
    age_range: string | null;
    target_area: string | null;
    marriage_aspiration: string | null;
    self_introductory_statement: string | null;
  };
  propensities: Propensity[];
}

/**
 * メンバープロフィール Component (TSX)
 */
const MemberProfile: React.FC<MemberProfileProps> = ({ bcuid }) => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT as string;
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;
  const debug = process.env.REACT_APP_DEBUG === 'true';

  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [member, setMember] = useState<MemberData | null>(null);
  const [showModal, setShowModal] = useState(false);

  /** メンバー情報取得 */
  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      setLoading(true);
      try {
        const response: AxiosResponse<{ data: MemberData }> = await axios.post(
          `${apiEndpoint}/v1/get/member/${bcuid}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (debug) {
          console.log(
            '[src/components/members/MemberProfile.tsx:95] response.data:',
            response.data
          );
          console.log(
            '[src/components/members/MemberProfile.tsx:96] response.data.data:',
            response.data.data
          );
        }

        setMember(response.data.data ?? null);
      } catch (error) {
        console.error('[MemberProfile] fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, token, bcuid]);

  if (!member) {
    return null;
  }

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div
          className="spinner-border"
          style={{ color: '#333' }} // 黒
          role="status"
        >
          <span className="sr-only"></span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="member-profile member-profile-detail"
        id={`member-${bcuid}`}
      >
        <MemberTools targetBcuid={bcuid} />
        <div className="member-header d-flex align-items-center">
          <div className="member-header-avatar">
            {/* {member?.member?.profile_images} */}
            <img
              src={
                buildStorageUrl(
                  storageUrl ?? '',
                  member?.member?.profile_images ?? '',
                  '_small'
                ) ||
                `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
              }
              alt="User Avatar"
              className="member-avator"
              onClick={() => setShowModal(true)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                (e.currentTarget as HTMLImageElement).src =
                  `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`;
              }}
            />
          </div>
          <div className="member-header-text ml20">
            <div className="nickname">{member?.member?.nickname ?? 'NaN'}</div>
            <div className="bcuid mt10">@{member?.member?.bcuid}</div>
            <div className="location">
              <GetGenderIcon genderId={member?.member?.gender ?? ''} />　
              {member?.member?.location}
            </div>
            <div className="post-count mt5">
              <Link to={`/member/post/${member.member.bcuid}`}>
                <CardText className="mr5" style={{ fontSize: '23px' }} />
                投稿を見る
              </Link>
            </div>
          </div>
        </div>

        <div
          className={`modal fade${showModal ? ' show' : ''}`}
          tabIndex={-1}
          role="dialog"
          style={{
            display: showModal ? 'block' : 'none',
            background: showModal ? 'rgba(0,0,0,0.5)' : 'transparent',
          }}
          aria-modal={showModal ? 'true' : undefined}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-body text-center">
                <img
                  src={
                    buildStorageUrl(
                      storageUrl ?? '',
                      member?.member?.profile_images ?? '',
                      '_medium'
                    ) ||
                    `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                  }
                  alt="User Avatar"
                  className="member-avator-large"
                  onClick={() => setShowModal(true)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    (e.currentTarget as HTMLImageElement).src =
                      `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`;
                  }}
                />
              </div>
              <div className="modal-footer">
                <X
                  style={{ fontSize: '30px', cursor: 'pointer', color: '#333' }}
                  onClick={() => setShowModal(false)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="profile-detail mt20">
          <div className="mp-description">
            <span
              dangerouslySetInnerHTML={{
                __html: convertFormattedText(member?.member?.description ?? ''),
              }}
            />
            {/* {member?.member?.description} */}
          </div>
          <div className="mp-propensities mt30">
            {member.propensities.length > 0 ? (
              <>
                <ul className="propensities-list">
                  {member.propensities.map((propensity) => (
                    <li key={propensity.id}>
                      <span className="propensity-name">
                        {propensity.name_ja}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="alert alert-secondary" role="alert">
                性癖がありません
              </div>
            )}
            {/* <pre>{JSON.stringify(member.propensities, null, 2)}</pre> */}
          </div>
          <table className="table table-bordered table-striped  mt20">
            <tbody>
              {/* <tr>
                <th style={{ width: '120px' }}>性別</th>
                <th>hgoe</th>
              </tr> */}
              <tr>
                <td style={{ width: '120px' }}>年齢</td>
                <td>
                  {member.member.age != null
                    ? chageAgeRange(member.member.age)
                    : '-'}
                </td>
              </tr>
              <tr>
                <td>職業</td>
                <td>{member.member.occupation_type ?? '-'}</td>
              </tr>
              <tr>
                <td>身長</td>
                <td>
                  {member.member.bheight != null
                    ? `${member.member.bheight} cm`
                    : '-'}
                </td>
              </tr>
              <tr>
                <td>体重</td>
                <td>
                  {member.member.bweight != null
                    ? `${member.member.bweight} kg`
                    : '-'}
                </td>
              </tr>
              <tr>
                <td>血液型</td>
                <td>{member.member.blood_type || '-'}</td>
              </tr>
              <tr>
                <td>学歴</td>
                <td>{member.member.academic_background || '-'}</td>
              </tr>
              <tr>
                <td>婚姻状況</td>
                <td>{member.member.marital_status || '-'}</td>
              </tr>
              <tr>
                <td>趣味・ライフスタイル</td>
                <td>{member.member.hobbies_lifestyle || '-'}</td>
              </tr>
              <tr>
                <td>飲酒</td>
                <td>{member.member.alcohol || '-'}</td>
              </tr>
              <tr>
                <td>喫煙</td>
                <td>{member.member.tobacco || '-'}</td>
              </tr>
              <tr>
                <td>ペット</td>
                <td>{member.member.pet || '-'}</td>
              </tr>
              <tr>
                <td>好きな食べ物</td>
                <td>{member.member.favorite_food || '-'}</td>
              </tr>
              <tr>
                <td>性格</td>
                <td>{member.member.character || '-'}</td>
              </tr>
              <tr>
                <td>宗教</td>
                <td>{member.member.religion || '-'}</td>
              </tr>
              <tr>
                <td>理想のパートナー</td>
                <td>{member.member.conditions_ideal_partner || '-'}</td>
              </tr>
              <tr>
                <td>年齢範囲</td>
                <td>
                  {member.member.age_range
                    ? getAgeRangeJp(member.member.age_range)
                    : '-'}
                </td>
              </tr>
              <tr>
                <td>対象エリア</td>
                <td>{member.member.target_area || '-'}</td>
              </tr>
              <tr>
                <td>結婚願望</td>
                <td>{member.member.marriage_aspiration || '-'}</td>
              </tr>
              <tr>
                <td>自己紹介文</td>
                <td>{member.member.self_introductory_statement || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* MemberProfile {bcuid} */}
      </div>
    </>
  );
};
export default MemberProfile;

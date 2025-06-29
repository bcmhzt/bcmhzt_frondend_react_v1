/** 105ca813 */

import { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import axios from 'axios';

import Gender from './myProfileDetails/Gender';
import Age from './myProfileDetails/Age';
import Location from './myProfileDetails/Location';
import OccupationType from './myProfileDetails/OccupationType';
import BHeight from './myProfileDetails/BHeight';
import BWeight from './myProfileDetails/BWeight';
import BloodType from './myProfileDetails/BloodType';
import AcademicBackground from './myProfileDetails/AcademicBackground';
import MaritalStatus from './myProfileDetails/MaritalStatus';
import HobbiesLifestyle from './myProfileDetails/HobbiesLifestyle';
import Alcohol from './myProfileDetails/Alcohol';
import Tobacco from './myProfileDetails/Tobacco';
import Pet from './myProfileDetails/Pet';
import Holidays from './myProfileDetails/Holidays';
import FavoriteFood from './myProfileDetails/FavoriteFood';
import Character from './myProfileDetails/Character';
import Religion from './myProfileDetails/Religion';
import Belief from './myProfileDetails/Belief';
import ConditionsIdealPartner from './myProfileDetails/ConditionsIdealPartner';
import AgeRange from './myProfileDetails/AgeRange';
import TargetArea from './myProfileDetails/TargetArea';
import MarriageAspiration from './myProfileDetails/MarriageAspiration';
import SelfIntroductoryStatement from './myProfileDetails/SelfIntroductoryStatement';
import OthersOptions from './myProfileDetails/OthersOptions';
// import ProfileVideo from './myProfileDetails/ProfileVideo';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/users/MyProfileDetails.tsx:xx] debug:', debug);
}

/**
 * 105ca813
 * [src/components/users/MyProfileDetails.tsx:xx]
 *
 * type: page
 *
 * [Order] このコードでやっていること
 * - プロフィールの更新項目のComponentをまとめて表示
 * - 各項目の更新は個別のComponentで行う
 * - 各項目の更新はAPIを通じて行う
 * - 各項目の更新状態はuseStateで管理
 * - 各項目の更新状態はAPIのレスポンスで更新する
 * - 各項目の更新状態はuseEffectで管理
 *
 * https://docs.google.com/spreadsheets/d/1sINwQiixedhJGhLYSvMZka6OE7B6YpdtkPWghpswgbc/edit?gid=0#gid=0
 */

const MyProfileDetails = () => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // 保存ボタンのアクション
  const handleSaveClick = () => {
    setLoading(true);
    setSaved(false);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
    }, 2000); // 2秒間「保存中...」
  };

  // 「保存しました」を数秒後に自動で消す
  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 2000); // 2秒後に非表示
      return () => clearTimeout(timer);
    }
  }, [saved]);

  // const [loading, setLoading] = useState(false);
  // const { currentUserProfile, token } = useAuth();

  /* location */
  // const [location, setLocation] = useState(
  //   currentUserProfile.user_detail.location || ''
  // );
  // const [locationState, setLocationState] = useState(false);

  // /* character */
  // const [character, setCharacter] = useState(
  //   currentUserProfile.user_detail.character || ''
  // );
  // const [characterState, setCharacterState] = useState(false);

  // /* occupationType */
  // const [occupationType, setOccupationType] = useState(
  //   currentUserProfile.user_detail.occupationType || ''
  // );
  // const [occupationTypeState, setOccupationTypeState] = useState(false);

  // 追加: 地域変更時のハンドラ
  // const changeLocation = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const newLocation = e.target.value;
  //   setLocation(newLocation);
  //   try {
  //     const response = await axios.post(
  //       `${apiEndpoint}/update/user/detail/location/${currentUserProfile.user_profile.uid}`,
  //       {
  //         value: newLocation,
  //         token: token,
  //       },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     if (debug === 'true') {
  //       console.log('API response [changeLocation]:', response.data);
  //     }
  //     if (response.data.status === true) {
  //       setLocationState(true);
  //     }
  //   } catch (error) {
  //     console.log('API error [changeLocation]:', error);
  //     setLocationState(false);
  //   }
  // };

  // ...（省略：関数定義はそのまま）

  // const blurCharacter = async () => {
  //   console.log('Character:', character);
  //   if (character) {
  //     try {
  //       const response = await axios.post(
  //         `${apiEndpoint}/update/user/detail/character/${currentUserProfile.user_profile.uid}`,
  //         {
  //           value: character,
  //           token: token,
  //         },
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  //       if (debug === 'true') {
  //         console.log('API response [changeCharacter]:', response.data);
  //       }
  //       console.log('changeCharacter debug 01', response.data.status);
  //       /* update dispay */
  //       if (response.data.status === true) {
  //         setCharacterState(response.data.status);
  //       }
  //     } catch (error) {
  //       console.log('API error [changeCharacter e1]:', error);
  //       if (
  //         typeof error === 'object' &&
  //         error !== null &&
  //         'response' in error &&
  //         typeof (error as any).response === 'object' &&
  //         (error as any).response !== null &&
  //         'data' in (error as any).response &&
  //         typeof (error as any).response.data === 'object' &&
  //         (error as any).response.data !== null &&
  //         'errors' in (error as any).response.data
  //       ) {
  //         console.log(
  //           'Validation errors [changeCharacter e2]:',
  //           (error as any).response.data.errors
  //         );
  //       }
  //     }
  //   }
  // };

  return (
    <>
      <Gender />
      <Age />
      <Location />
      <OccupationType />
      <BHeight />
      <BWeight />
      <BloodType />
      <AcademicBackground />
      <MaritalStatus />
      <HobbiesLifestyle />
      <Alcohol />
      <Tobacco />
      <Pet />
      <Holidays />
      <FavoriteFood />
      <Character />
      <Religion />
      <Belief />
      <ConditionsIdealPartner />
      <AgeRange />
      <TargetArea />
      <MarriageAspiration />
      <SelfIntroductoryStatement />
      <OthersOptions />
      {/* <ProfileVideo /> */}
      {saved && (
        <div
          className="text-success align-self-center mb10"
          style={{ textAlign: 'right' }}
        >
          保存しました
        </div>
      )}
      <div className="d-flex justify-content-end mb30">
        {loading ? (
          <button type="button" className="btn btn-primary bcmhzt-btn" disabled>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            保存中...
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary bcmhzt-btn"
            onClick={handleSaveClick}
          >
            すべてを保存する
          </button>
        )}
      </div>
    </>
  );
};

export default MyProfileDetails;

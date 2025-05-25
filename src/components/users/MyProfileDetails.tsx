import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/MyProfileDetails.js:09] debug:', debug);
}
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const MyProfileDetails = () => {
  const [loading, setLoading] = useState(false);
  const { currentUserProfile, token } = useAuth();

  // ...（省略：state定義はそのまま）

  /* gender */
  const [gender, setGender] = useState(
    currentUserProfile.user_detail.gender || ''
  );
  const [genderState, setGenderState] = useState(false);

  /* location */
  const [location, setLocation] = useState(
    currentUserProfile.user_detail.location || ''
  );
  const [locationState, setLocationState] = useState(false);

  /* character */
  const [character, setCharacter] = useState(
    currentUserProfile.user_detail.character || ''
  );
  const [characterState, setCharacterState] = useState(false);

  /* occupationType */
  const [occupationType, setOccupationType] = useState(
    currentUserProfile.user_detail.occupationType || ''
  );
  const [occupationTypeState, setOccupationTypeState] = useState(false);

  // 追加: 地域変更時のハンドラ
  const changeLocation = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    try {
      const response = await axios.post(
        `${apiEndpoint}/update/user/detail/location/${currentUserProfile.user_profile.uid}`,
        {
          value: newLocation,
          token: token,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') {
        console.log('API response [changeLocation]:', response.data);
      }
      if (response.data.status === true) {
        setLocationState(true);
      }
    } catch (error) {
      console.log('API error [changeLocation]:', error);
      setLocationState(false);
    }
  };

  // ...（省略：関数定義はそのまま）

  const blurCharacter = async () => {
    console.log('Character:', character);
    if (character) {
      try {
        const response = await axios.post(
          `${apiEndpoint}/update/user/detail/character/${currentUserProfile.user_profile.uid}`,
          {
            value: character,
            token: token,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (debug === 'true') {
          console.log('API response [changeCharacter]:', response.data);
        }
        console.log('changeCharacter debug 01', response.data.status);
        /* update dispay */
        if (response.data.status === true) {
          setCharacterState(response.data.status);
        }
      } catch (error) {
        console.log('API error [changeCharacter e1]:', error);
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as any).response === 'object' &&
          (error as any).response !== null &&
          'data' in (error as any).response &&
          typeof (error as any).response.data === 'object' &&
          (error as any).response.data !== null &&
          'errors' in (error as any).response.data
        ) {
          console.log(
            'Validation errors [changeCharacter e2]:',
            (error as any).response.data.errors
          );
        }
      }
    }
  };

  const changeGender = async (newGender: string) => {
    setGender(newGender);
    try {
      const response = await axios.post(
        `${apiEndpoint}/update/user/detail/gender/${currentUserProfile.user_profile.uid}`,
        {
          value: newGender,
          token: token,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') {
        console.log('API response [changeGender]:', response.data);
      }
      if (response.data.status === true) {
        setGenderState(true);
      }
    } catch (error) {
      console.log('API error [changeGender]:', error);
      setGenderState(false);
    }
  };
  // ...（省略：他の関数・returnの前まで同じ）

  // 詳細情報を保存する関数を追加
  const saveMyProfileDetails = async () => {
    setLoading(true);
    try {
      // 必要なデータをまとめてAPIに送信する例
      const response = await axios.post(
        `${apiEndpoint}/update/user/detail/${currentUserProfile.user_profile.uid}`,
        {
          gender,
          location,
          character,
          occupationType,
          token,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') {
        console.log('API response [saveMyProfileDetails]:', response.data);
      }
      // 必要に応じてstateを更新
    } catch (error) {
      console.log('API error [saveMyProfileDetails]:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>MyProfileDetails</h2>
      <div className="myprofile-detail-items">
        {/* 性別 */}
        <div className="pb-gender mt20">
          <h3>
            性別 <span className="profile-require">必須</span>
          </h3>
          <div className="mb10">
            {genderState && <span className="pdupdated">保存完了</span>}
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="gender"
              id="man"
              value="1"
              checked={gender === '1'}
              onChange={() => changeGender('1')}
            />
            <label className="form-check-label" htmlFor="man">
              男
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="gender"
              id="woman"
              value="2"
              checked={gender === '2'}
              onChange={() => changeGender('2')}
            />
            <label className="form-check-label" htmlFor="woman">
              女
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="gender"
              id="other"
              value="3"
              checked={gender === '3'}
              onChange={() => changeGender('3')}
            />
            <label className="form-check-label" htmlFor="other">
              どちらでもない
            </label>
          </div>
        </div>

        {/* 地域 */}
        <div className="pb-location mt20">
          <h3>地域</h3>
          <div className="mb10">
            {locationState && <span className="pdupdated">保存完了</span>}
          </div>
          <label htmlFor="location" className="form-label">
            <span>関東、関西、九州など地域名で表示されます。</span>
          </label>
          <select
            className="form-select"
            id="location"
            aria-label="Default select example"
            value={location}
            onChange={changeLocation}
          >
            <option value="">地域を選択してください</option>
            {/* ...都道府県optionは同じ */}
            <option value="北海道">北海道</option>
            {/* ...省略 */}
            <option value="地域を選択しない">地域を選択しない</option>
          </select>
        </div>

        {/* 職業 */}
        <div className="pb-occupation-type mt20">
          <h3>職業</h3>
          <select
            className="form-select"
            id="occupation"
            aria-label="職業選択"
            value={occupationType}
            onChange={(e) => setOccupationType(e.target.value)}
          >
            <option value="">職業を選択してください</option>
            <option value="学生">学生</option>
            {/* ...省略 */}
            <option value="その他">その他</option>
          </select>
        </div>

        {/* ...省略：他の項目も <option selected> を <option value=""> 形式に修正 */}

        {/* 性格 */}
        <div className="pb-character mt20">
          <h3>性格</h3>
          <div className="mb10">
            {characterState && <span className="pdupdated">保存完了</span>}
          </div>
          <div className="pd-comment">1200文字以内で入力してください</div>
          <textarea
            className="form-control"
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            onBlur={blurCharacter}
            placeholder="自身の性格について入力してください"
          />
        </div>

        {/* ...省略：他の項目は同じ */}

        <div className="pb-description-save-btn">
          <button
            className="btn btn-bc-main btn-primary mt20"
            onClick={saveMyProfileDetails}
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              '詳細情報を保存'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default MyProfileDetails;

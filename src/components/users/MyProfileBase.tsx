import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/MyProfileBase.js.js:09] debug:', debug);
}
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const MyProfileBase = () => {
  const { currentUserProfile, token } = useAuth();
  if (debug === 'true') {
    console.log(
      '[src/components/MyProfileBase.js:18] currentUserProfile: ',
      currentUserProfile
    );
  }

  /* nickname */
  const [nickname, setNickname] = useState(
    currentUserProfile.user_profile.nickname || ''
  );
  const [nicknameState, setNicknamerState] = useState(false);

  /* description */
  const [description, setDescription] = useState(
    currentUserProfile.user_profile.description || ''
  );
  const [descriptionState, setDescriptionState] = useState(false);

  /* profile url */
  const [appProfileUrl, setAppProfileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  interface ChangeNicknameEvent {
    target: {
      value: string;
    };
  }

  const changeNickname = (e: ChangeNicknameEvent): void => {
    setNickname(e.target.value);
  };
  const blurNickname = async () => {
    if (nickname) {
      try {
        const response = await axios.post(
          `${apiEndpoint}/update/user/profile/nickname/${currentUserProfile.user_profile.uid}`,
          {
            value: nickname,
            token: token,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (debug === 'true') {
          console.log(
            '[src/components/MyProfileBase.js:42] API response [changeNickname 01]:',
            response.data
          );
        }
        /* update dispay */
        if (response.data.status === true) {
          setNicknamerState(response.data.status);
        }
      } catch (error) {
        console.log(
          '[src/components/MyProfileBase.js:49] API error [blurNickname e1]:',
          error
        );
        if (axios.isAxiosError(error) && error.response) {
          console.log(
            '[src/components/MyProfileBase.js:50] Validation errors [blurNickname e2]:',
            error.response.data.errors
          );
        }
      }
    }
  };

  interface ChangeEventWithValue {
    target: {
      value: string;
    };
  }

  const changeDescription = (e: ChangeEventWithValue): void => {
    if (debug === 'true') {
      console.log(
        '[src/components/MyProfileBase.js:56] changeDescription [MyProfileBase 05]: ',
        e.target.value
      );
    }
    setDescription(e.target.value);
  };

  const blurDescription = async () => {
    if (debug === 'true') {
      console.log(
        '[src/components/MyProfileBase.js:64] blurDescription [MyProfileBase 06]: ',
        description
      );
    }
    if (description) {
      try {
        const response = await axios.post(
          `${apiEndpoint}/update/user/profile/description/${currentUserProfile.user_profile.uid}`,
          {
            value: description,
            token: token,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (debug === 'true') {
          console.log(
            '[src/components/MyProfileBase.js:73] API response [changeDescription 01]:',
            response.data
          );
        }
        /* update dispay */
        if (response.data.status === true) {
          setDescriptionState(response.data.status);
        }
      } catch (error) {
        console.log(
          '[src/components/MyProfileBase.js:76] API error [blurDescription e1]:',
          error
        );
        if (axios.isAxiosError(error) && error.response) {
          console.log(
            '[src/components/MyProfileBase.js:77] Validation errors [blurDescription e2]:',
            error.response.data.errors
          );
        }
      }
    }
  };

  useEffect(() => {
    const appUrl = process.env.REACT_APP_URL;
    setAppProfileUrl(appUrl + '/member/' + currentUserProfile.user_profile.uid);
    if (debug === 'true') {
      console.log(
        '[src/components/MyProfileBase.js:87] appProfileUrl [MyProfileBase]',
        appProfileUrl
      );
    }
  }, [appProfileUrl, currentUserProfile.user_profile.uid]);

  const saveMyProfileBase = async () => {
    setLoading(true);
    if (debug === 'true') {
      console.log(
        '[src/components/MyProfileBase.js:94] saveMyProfileBase: ',
        nickname,
        description
      );
    }
    await Promise.all([blurNickname(), blurDescription()]);

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      <h2 className="section-title-h2">
        基本情報<span className="count">10/100</span>
      </h2>

      <div className="myprofile-base-items">
        <div className="pb-nicknam mt20">
          <h3>ニックネーム</h3>
          <div className="mb10">
            {nicknameState && <span className="pdupdated">保存完了</span>}
          </div>
          <div className="pd-comment">表示されるニックネーム</div>
          <input
            type="text"
            className="form-control"
            id="nickname"
            name="nickname"
            placeholder="ニックネーム"
            value={nickname}
            onChange={changeNickname}
            onBlur={blurNickname}
          />
        </div>

        <div className="pb-description mt20">
          <h3>自己紹介</h3>
          <div className="mb10">
            {descriptionState && <span className="pdupdated">保存完了</span>}
          </div>
          <div className="pd-comment">自己紹介文を書いてください</div>
          <textarea
            className="form-control"
            id="description"
            name="description"
            placeholder="自己紹介"
            value={description}
            onChange={changeDescription}
            onBlur={blurDescription}
            rows={7}
          />
        </div>
        <div className="app-profile-url mt20">
          <Link to="/">プロファイルページを確認する</Link>
        </div>
        <div className="pb-description-save-btn">
          <button
            className="btn btn-bc-main btn-primary mt20"
            onClick={saveMyProfileBase}
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              '基本情報を保存'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default MyProfileBase;

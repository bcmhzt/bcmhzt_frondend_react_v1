/** ec11d52c */
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/users/myProfileDetails/Gender.tsx:xx] debug:',
    debug
  );
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

/** 雛形作成 Gender　*/
const Gender = () => {
  const [loading, setLoading] = useState(false);
  const { currentUserProfile, token } = useAuth();

  const [gender, setGender] = useState(
    currentUserProfile?.user_detail?.gender || ''
  );
  const [genderState, setGenderState] = useState(false);

  useEffect(() => {
    if (genderState === true) {
      const timer = setTimeout(() => {
        setGenderState(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [genderState]);

  const changeGender = async (newGender: string) => {
    setGender(newGender);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
        console.log(
          '[src/components/users/myProfileDetails/Gender.tsx:39] response.data:',
          response.data
        );
      }
      if (response.data.status === true) {
        setGenderState(true);
      }
    } catch (error) {
      console.log('API error [changeGender]:', error);
      setGenderState(false);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <pre>
        {JSON.stringify(currentUserProfile.user_detail.gender, null, 2)}
      </pre> */}
      {/* <pre>{JSON.stringify(genderState, null, 2)}</pre> */}

      <div className="profile-update gender">
        <h3>
          性別<span className="require">必須</span>
        </h3>

        <div className="status">
          {genderState ? (
            <span className="save-done">保存完了</span>
          ) : loading ? (
            <span className="loading">保存中...</span>
          ) : (
            <span className="saved">保存済</span>
          )}
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
    </>
  );
};
export default Gender;

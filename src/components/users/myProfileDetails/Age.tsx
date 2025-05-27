/** f41dcf53 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[Age.tsx] debug:', debug);
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const Age = () => {
  const [loading, setLoading] = useState(false);
  const { currentUserProfile, token } = useAuth();

  const [age, setAge] = useState(currentUserProfile.user_detail.age || '');
  const [ageState, setAgeState] = useState(false);

  useEffect(() => {
    if (ageState) {
      const timer = setTimeout(() => setAgeState(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [ageState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setAge(e.target.value);

  const handleBlur = async () => {
    if (!age) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/age/${currentUserProfile.user_profile.uid}`,
        { value: age, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') console.log('response:', res.data);
      if (res.data.status === true) setAgeState(true);
    } catch (err) {
      console.error('API error [Age]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update age">
      <h3>
        年齢<span className="require">必須</span>
      </h3>
      <div className="status">
        {ageState ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">保存中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
      </div>
      <input
        type="text"
        className="form-control"
        placeholder="年齢"
        style={{ width: '100px' }}
        value={age}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default Age;

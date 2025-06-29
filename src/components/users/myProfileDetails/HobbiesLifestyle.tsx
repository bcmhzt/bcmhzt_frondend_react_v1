import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') console.log('[HobbiesLifestyle.tsx] debug:', debug);

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const HobbiesLifestyle = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.hobbies_lifestyle || ''
  );
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleBlur = async () => {
    if (!value) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/hobbies_lifestyle/${currentUserProfile.user_profile.uid}`,
        { value, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') console.log('response:', res.data);
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error('API error [HobbiesLifestyle]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update hobbies-lifestyle">
      <h3>趣味・ライフスタイル</h3>
      <div className="status">
        {status ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">保存中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
      </div>
      <div className="pd-comment">1200文字以内で入力してください</div>
      <textarea
        className="form-control"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="趣味やライフスタイルを入力してください"
      />
    </div>
  );
};

export default HobbiesLifestyle;

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const Alcohol = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.alcohol || ''
  );
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(false), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setValue(v);
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/alcohol/${currentUserProfile.user_profile.uid}`,
        { value: v, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update alcohol">
      <h3>お酒</h3>
      <div className="status">
        {status ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">保存中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
      </div>
      <select className="form-select" value={value} onChange={handleChange}>
        <option value="" selected>
          選択してください
        </option>
        <option value="よく飲む">よく飲む</option>
        <option value="ときどき飲む">ときどき飲む</option>
        <option value="付き合い程度に飲む">付き合い程度に飲む</option>
        <option value="殆ど飲まない">殆ど飲まない</option>
        <option value="飲まない">飲まない</option>
      </select>
    </div>
  );
};
export default Alcohol;

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') console.log('[OccupationType.tsx] debug:', debug);

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const OccupationType = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.occupation_type || ''
  );
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setValue(v);
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/occupation_type/${currentUserProfile.user_profile.uid}`,
        { value: v, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') console.log('response:', res.data);
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error('API error [OccupationType]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update occupation-type">
      <h3>職業</h3>
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
          職業を選択してください
        </option>
        <option value="学生">学生</option>
        <option value="会社員">会社員</option>
        <option value="公務員">公務員</option>
        <option value="自営業">自営業</option>
        <option value="フリーランス">フリーランス</option>
        <option value="主婦/主夫">主婦/主夫</option>
        <option value="無職">無職</option>
        <option value="退職者">退職者</option>
        <option value="その他">その他</option>
      </select>
    </div>
  );
};

export default OccupationType;

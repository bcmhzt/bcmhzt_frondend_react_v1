import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') console.log('[BloodType.tsx] debug:', debug);

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const BloodType = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.blood_type || ''
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
        `${apiEndpoint}/update/user/detail/blood_type/${currentUserProfile.user_profile.uid}`,
        { value: v, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') console.log('response:', res.data);
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error('API error [BloodType]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update blood-type">
      <h3>血液型</h3>
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
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="O">O</option>
        <option value="AB">AB</option>
        <option value="--">--</option>
      </select>
    </div>
  );
};

export default BloodType;

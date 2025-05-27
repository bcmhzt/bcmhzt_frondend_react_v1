import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') console.log('[MaritalStatus.tsx] debug:', debug);

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const MaritalStatus = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.marital_status || ''
  );
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = async (v: string) => {
    setValue(v);
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/marital_status/${currentUserProfile.user_profile.uid}`,
        { value: v, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') console.log('response:', res.data);
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error('API error [MaritalStatus]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update marital-status">
      <h3>婚姻状況</h3>
      <div className="status">
        {status ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">保存中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
      </div>
      <div className="form-check">
        <input
          type="radio"
          className="form-check-input"
          id="mikon"
          name="maritalStatus"
          value="未婚"
          checked={value === '未婚'}
          onChange={() => handleChange('未婚')}
        />
        <label className="form-check-label" htmlFor="mikon">
          未婚
        </label>
      </div>
      <div className="form-check">
        <input
          type="radio"
          className="form-check-input"
          id="kikon"
          name="maritalStatus"
          value="既婚"
          checked={value === '既婚'}
          onChange={() => handleChange('既婚')}
        />
        <label className="form-check-label" htmlFor="kikon">
          既婚
        </label>
      </div>
    </div>
  );
};

export default MaritalStatus;

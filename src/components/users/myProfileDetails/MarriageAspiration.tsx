import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const MarriageAspiration = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.marriage_aspiration || ''
  );
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(false), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleChange = async (v: string) => {
    setValue(v);
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/marriage_aspiration/${currentUserProfile.user_profile.uid}`,
        { value: v, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error('API error [MarriageAspiration]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update marriage-aspiration">
      <h3>結婚願望</h3>
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
          className="form-check-input"
          type="radio"
          name="marriageAspiration"
          id="ma1"
          value="結婚したい"
          checked={value === '結婚したい'}
          onChange={() => handleChange('結婚したい')}
        />
        <label className="form-check-label" htmlFor="ma1">
          結婚したい
        </label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="marriageAspiration"
          id="ma2"
          value="結婚したくない"
          checked={value === '結婚したくない'}
          onChange={() => handleChange('結婚したくない')}
        />
        <label className="form-check-label" htmlFor="ma2">
          結婚したくない
        </label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="marriageAspiration"
          id="ma3"
          value="どちらでもない"
          checked={value === 'どちらでもない'}
          onChange={() => handleChange('どちらでもない')}
        />
        <label className="form-check-label" htmlFor="ma3">
          どちらでもない
        </label>
      </div>
    </div>
  );
};
export default MarriageAspiration;

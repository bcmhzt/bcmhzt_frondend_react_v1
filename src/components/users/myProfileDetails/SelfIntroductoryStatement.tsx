import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const SelfIntroductoryStatement = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.self_introductory_statement || ''
  );
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(false), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleBlur = async () => {
    if (!value) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/self_introductory_statement/${currentUserProfile.user_profile.uid}`,
        { value, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error('API error [SelfIntroductoryStatement]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update self-introductory-statement">
      <h3>自己紹介文</h3>
      <div className="status">
        {status ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">保存中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
      </div>
      <textarea
        className="form-control"
        rows={5}
        placeholder="自己紹介文を入力"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
      />
    </div>
  );
};
export default SelfIntroductoryStatement;

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const Religion = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.religion || ''
  );
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        `${apiEndpoint}/update/user/detail/religion/${currentUserProfile.user_profile.uid}`,
        { value, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) {
        setStatus(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.value?.[0] || 'エラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update religion">
      <h3>宗教</h3>
      <div className="status">
        {status ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">保存中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
      </div>
      {error && <span className="pd-errormessage">{error}</span>}
      <input
        className="form-control"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="宗教を入力してください"
      />
    </div>
  );
};
export default Religion;

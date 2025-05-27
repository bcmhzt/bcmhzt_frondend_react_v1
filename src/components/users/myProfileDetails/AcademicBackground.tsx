import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') console.log('[AcademicBackground.tsx] debug:', debug);

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const AcademicBackground = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.academic_background || ''
  );
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        `${apiEndpoint}/update/user/detail/academic_background/${currentUserProfile.user_profile.uid}`,
        { value, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') console.log('response:', res.data);
      if (res.data.status) {
        setStatus(true);
        setError(null);
      }
    } catch (err: any) {
      console.error('API error [AcademicBackground]:', err);
      setError(err.response?.data?.errors?.value?.[0] || 'エラー');
      setStatus(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update academic-background">
      <h3>学歴</h3>
      <div className="status">
        {status ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">保存中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
        {error && <span className="pd-errormessage">{error}</span>}
      </div>
      <div className="pd-comment">100文字以内で入力してください</div>
      <input
        className="form-control"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="学歴を入力してください"
      />
    </div>
  );
};

export default AcademicBackground;

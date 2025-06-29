import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
const ranges = ['20', '30', '40', '50', '60', '70'];

const AgeRange = () => {
  const { currentUserProfile, token } = useAuth();
  const initial = currentUserProfile.user_detail.age_range
    ? currentUserProfile.user_detail.age_range.split(',')
    : [];
  const [selected, setSelected] = useState<string[]>(initial);
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(false), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const toggle = async (r: string, checked: boolean) => {
    const updated = checked
      ? [...selected, r]
      : selected.filter((x) => x !== r);
    setSelected(updated);
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/age_range/${currentUserProfile.user_profile.uid}`,
        { value: updated.join(','), token },
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
    <div className="profile-update age-range">
      <h3>
        対象年齢範囲<span className="require">必須</span>
      </h3>
      <div className="status">
        {status ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">保存中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
      </div>
      {ranges.map((r) => (
        <div key={r} className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id={`age-${r}`}
            checked={selected.includes(r)}
            onChange={(e) => toggle(r, e.target.checked)}
          />
          <label className="form-check-label" htmlFor={`age-${r}`}>
            {r}代
          </label>
        </div>
      ))}
    </div>
  );
};
export default AgeRange;

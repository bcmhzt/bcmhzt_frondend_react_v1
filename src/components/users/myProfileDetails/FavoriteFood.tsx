import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const FavoriteFood = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.favorite_food || ''
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
        `${apiEndpoint}/update/user/detail/favorite_food/${currentUserProfile.user_profile.uid}`,
        { value, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error('API error [FavoriteFood]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update favorite-food">
      <h3>好きな食べ物</h3>
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="好きな食べ物を入力"
      />
    </div>
  );
};

export default FavoriteFood;

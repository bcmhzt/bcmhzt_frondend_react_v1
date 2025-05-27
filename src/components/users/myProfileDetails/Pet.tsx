import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const Pet = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(currentUserProfile.user_detail.pet || '');
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
        `${apiEndpoint}/update/user/detail/pet/${currentUserProfile.user_profile.uid}`,
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
    <div className="profile-update pet">
      <h3>ペット</h3>
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
        <option value="犬を飼っている">犬を飼っている</option>
        <option value="猫を飼っている">猫を飼っている</option>
        <option value="鳥を飼っている">鳥を飼っている</option>
        <option value="小動物を飼っている">小動物を飼っている</option>
        <option value="魚を飼っている">魚を飼っている</option>
        <option value="爬虫類を飼っている">爬虫類を飼っている</option>
        <option value="ペットを飼っていない">ペットを飼っていない</option>
      </select>
    </div>
  );
};
export default Pet;

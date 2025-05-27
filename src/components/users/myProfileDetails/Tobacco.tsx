import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const Tobacco = () => {
  const { currentUserProfile, token } = useAuth();
  const [value, setValue] = useState(
    currentUserProfile.user_detail.tobacco || ''
  );
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
        `${apiEndpoint}/update/user/detail/tobacco/${currentUserProfile.user_profile.uid}`,
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
    <div className="profile-update tobacco">
      <h3>タバコ</h3>
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
        <option value="紙タバコをよく吸う">紙タバコをよく吸う</option>
        <option value="電子タバコをよく吸う">電子タバコをよく吸う</option>
        <option value="紙タバコをときどき吸う">紙タバコをときどき吸う</option>
        <option value="電子タバコをときどき吸う">
          電子タバコをときどき吸う
        </option>
        <option value="相手に合わせて吸わないことができる">
          相手に合わせて吸わないことができる
        </option>
        <option value="吸わない">吸わない</option>
      </select>
    </div>
  );
};
export default Tobacco;

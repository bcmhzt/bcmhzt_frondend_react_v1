import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const ProfileVideo = () => {
  const { currentUserProfile, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('token', token ?? '');
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/profile_video/${currentUserProfile.user_profile.uid}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (res.data.status) setStatus(true);
    } catch (err) {
      console.error('API error [ProfileVideo]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-update profile-video">
      <h3>プロフィール動画</h3>
      <div className="status">
        {status ? (
          <span className="save-done">保存完了</span>
        ) : loading ? (
          <span className="loading">アップロード中...</span>
        ) : (
          <span className="saved">保存済</span>
        )}
      </div>
      <input type="file" accept="video/*" onChange={handleChange} />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="btn btn-primary mt-2"
      >
        {loading ? 'アップロード中...' : 'アップロード'}
      </button>
    </div>
  );
};
export default ProfileVideo;

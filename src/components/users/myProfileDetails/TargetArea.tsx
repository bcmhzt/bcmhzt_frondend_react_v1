import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
const prefectures = [
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
  'その他（外国など）',
  '地域を選択しない',
];

const TargetArea = () => {
  const { currentUserProfile, token } = useAuth();
  const initial = currentUserProfile.user_detail.target_area
    ? currentUserProfile.user_detail.target_area.split(',')
    : [];
  const [selected, setSelected] = useState<string[]>(initial);
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  // 「地域を選択しない」が選択されているか
  const isNoneSelected = selected.includes('地域を選択しない');

  useEffect(() => {
    if (status) {
      const t = setTimeout(() => setStatus(false), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const toggle = async (area: string, checked: boolean) => {
    let updated: string[];
    if (area === '地域を選択しない') {
      if (checked) {
        updated = ['地域を選択しない'];
      } else {
        updated = [];
      }
    } else {
      // 他の地域を選択した場合、「地域を選択しない」を外す
      updated = checked
        ? [...selected.filter((x) => x !== '地域を選択しない'), area]
        : selected.filter((x) => x !== area);
    }
    setSelected(updated);
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/target_area/${currentUserProfile.user_profile.uid}`,
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
    <div className="profile-update target-area">
      <h3>
        対象地域<span className="require">必須</span>
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
      {prefectures.map((pref) => {
        // 「地域を選択しない」以外の項目をdisableにする
        const isNone = pref === '地域を選択しない';
        const disabled = !isNone && isNoneSelected;
        return (
          <div key={pref} className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={`area-${pref}`}
              checked={selected.includes(pref)}
              onChange={(e) => toggle(pref, e.target.checked)}
              disabled={disabled}
            />
            <label
              className="form-check-label"
              htmlFor={`area-${pref}`}
              style={disabled ? { color: '#bbb' } : {}}
            >
              {pref}
            </label>
          </div>
        );
      })}
    </div>
  );
};
export default TargetArea;

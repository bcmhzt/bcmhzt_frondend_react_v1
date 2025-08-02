/* fee0bab9 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  // PersonStanding,
  // PersonStandingDress,
  // PersonArmsUp,
  // PersonWalking,
  X,
  // CardText,
  // CardImage,
  Search,
} from 'react-bootstrap-icons';
import axios from 'axios';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/users/MyPropensitiesCore.tsx:xx] ‼️ debug:',
    debug
  );
}

type PropensityTag = {
  id: number;
  propensity_id: number;
  title: string;
  excerpt?: string;
  layer: string;
  type: string;
  matching_paradigm: string[];
  link?: string;
  delete_flag: boolean;
  created_at: string;
  updated_at: string;
  user_status: number;
};

const MyPropensitiesCore = () => {
  const { token } = useAuth();
  const [inputKeyword, setInputKeyword] = useState('');
  const [searchWords, setSearchWords] = useState('');
  const [propensityTags, setPropensityTags] = useState<PropensityTag[]>([]);
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const [showOnlyMyTags, setShowOnlyMyTags] = useState(false);

  useEffect(() => {
    fetchPropensityTagsFromApi('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(
      '[src/components/users/MyPropensitiesCore.tsx:30] ✅️ e.target.value:',
      e.target.value
    );

    const keyword = e.target.value;
    setInputKeyword(keyword);
    await fetchPropensityTagsFromApi(keyword);
  };

  // ✅ API呼び出し共通関数
  const fetchPropensityTagsFromApi = async (keyword: string) => {
    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/get/propensity_tags_core`,
        { words: keyword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(
        '[src/components/users/MyPropensitiesCore.tsx:74] ✅ fetchPropensityTagsFromApi API response:',
        response.data.data.data
      );
      setPropensityTags(response.data.data.data);
      // setPropensityTags([]);
    } catch (error) {
      console.error('[MyPropensitiesCore] ❌ API error:', error);
      setPropensityTags([]); // エラー時は空に
    }
  };

  const handleClear = () => {
    setInputKeyword('');
    setSearchWords('');
    fetchPropensityTagsFromApi('');
  };
  const handleSearch = () => {
    setSearchWords(inputKeyword);
    fetchPropensityTagsFromApi(searchWords);
    console.log(
      '[src/components/users/MyPropensitiesCore.tsx:42] 🌼 e.target.value:',
      inputKeyword
    );
  };

  const handleTagClick = async (propensity_id: number) => {
    console.log(
      '[src/components/users/MyPropensitiesCore.tsx:99] 🌼 handleTagClick called with propensity_id:',
      propensity_id
    );
    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/update/my_propensity_tags/${propensity_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(
        '[src/components/users/MyPropensitiesCore.tsx:114] ✅ handleTagClick API response:',
        response.data
      );
      // ✅ 即時UI反映
      setPropensityTags((prev) =>
        prev.map((tag) =>
          tag.propensity_id === propensity_id
            ? { ...tag, user_status: tag.user_status === 1 ? 0 : 1 }
            : tag
        )
      );
    } catch (error) {
      console.error(
        '[src/components/users/MyPropensitiesCore.tsx:106] ❌ handleTagClick API error:',
        error
      );
    }
  };

  const handleSelectMyPropensityTag = async (checked: boolean) => {
    setShowOnlyMyTags(checked);
    console.log(
      '[src/components/users/MyPropensitiesCore.tsx:114] ✅ handleSelectMyPropensityTag called with checked:',
      [checked, showOnlyMyTags]
    );

    if (checked) {
      const filteredTags = propensityTags.filter(
        (tag) => tag.user_status === 1
      );
      setPropensityTags(filteredTags);
    } else {
      await fetchPropensityTagsFromApi(''); // 全件取得
    }
  };

  return (
    <>
      <div className="propensity-tags mb50 mt20">
        <h3>
          性癖詳細<span className="subtitle">core</span>
        </h3>
        <div className="input-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="性癖 キーワードを入力して検索"
            value={inputKeyword}
            onChange={handleInputChange}
          />
          {inputKeyword && (
            <button
              className="btn clear-button"
              type="button"
              onClick={handleClear}
            >
              <X size={16} />
            </button>
          )}
          <button
            className="btn btn-primary bcmhzt-btn"
            type="button"
            onClick={handleSearch}
          >
            <Search className="search-icon" />
          </button>
        </div>

        <div className="myprofile-base-items mt20 ml20">
          <div className="form-check form-switch checkbox-item">
            <input
              className="form-check-input propensity-checkbox display-only-your-propensity"
              type="checkbox"
              role="switch"
              style={{ transform: 'scale(1.8)', marginRight: '1rem' }}
              id="my-propensity-switch"
              // name={`propensity-${item.id}`}
              // value={item.id}
              // checked={item.user_status === 1} // user_statusが1の場合ON、それ以外はOFF
              onChange={(e) => {
                handleSelectMyPropensityTag(e.target.checked);
              }}
            />
            <label className="form-check-label" htmlFor="my-propensity-switch">
              自分の性癖のみ表示する
            </label>
            {/* {item.showSavedMessage && (
              <span className="ml10 pdupdated">保存完了</span>
            )} */}
          </div>
        </div>
        <div className="propensity-tags-area mt20">
          {/* <pre>{JSON.stringify(searchWords, null, 2)}</pre> */}
          {propensityTags.length > 0 ? (
            <>
              {propensityTags.map((tag, index) => (
                <span
                  key={index}
                  className={`propensity-tags-word ${tag.user_status === 1 ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    handleTagClick(tag?.propensity_id);
                  }}
                >
                  {tag?.title}
                  {/* <pre>{JSON.stringify(tag, null, 2)}</pre> */}
                </span>
              ))}
            </>
          ) : (
            <>
              <div className="alert alert-secondary" role="alert">
                性癖タグが見つかりません。
                <button
                  className="btn clear-button"
                  type="button"
                  onClick={handleClear}
                >
                  <X size={16} />
                </button>
              </div>
            </>
          )}
          {/* <span className="propensity-tags-word" style={{ cursor: 'pointer' }}>
            歐派
          </span>
          <span
            className="propensity-tags-word active"
            style={{ cursor: 'pointer' }}
          >
            BDSM
          </span> */}
        </div>
      </div>
    </>
  );
};
export default MyPropensitiesCore;

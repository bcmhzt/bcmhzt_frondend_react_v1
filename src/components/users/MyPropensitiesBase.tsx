/* fee0bab9 */
import React, { useState } from 'react';
import {
  // PersonStanding,
  // PersonStandingDress,
  // PersonArmsUp,
  // PersonWalking,
  X,
  CardText,
  // CardImage,
  Search,
} from 'react-bootstrap-icons';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/users/MyPropensitiesBase.tsx:xx] ‼️ debug:',
    debug
  );
}

const MyPropensitiesBase = () => {
  const [inputKeyword, setInputKeyword] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(
      '[src/components/users/MyPropensitiesBase.tsx:18] e.target.value:',
      e.target.value
    );
    setInputKeyword(e.target.value);
  };
  return (
    <>
      <div className="propensity-tags mb20">
        <div className="input-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="メンバー検索"
            value={inputKeyword}
            onChange={handleInputChange}
          />
          {/* {inputKeyword && (
                    <button
                      className="btn clear-button"
                      type="button"
                      onClick={handleClear}
                    >
                      <X size={16} />
                    </button>
                  )} */}
          <button
            className="btn btn-primary bcmhzt-btn"
            type="button"
            // onClick={handleSearch}
          >
            <Search className="search-icon" />
          </button>
        </div>
      </div>
    </>
  );
};
export default MyPropensitiesBase;

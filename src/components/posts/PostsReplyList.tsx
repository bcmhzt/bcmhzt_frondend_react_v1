/** b34004f5 */
import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import PostBookmark from './PostBookmark';

const PostsReplyList = () => {
  return (
    <>
      <div className="member-search mb20">
        <div className="input-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Replyの検索"
            value=""
          />
          <button className="btn clear-button" type="button">
            ×
          </button>

          <button className="btn btn-primary bcmhzt-btn" type="button">
            検索
          </button>
        </div>
      </div>
      <p style={{ textAlign: 'right', color: '#888' }}>
        Total bookmarks: <span className="total-bookmarks">999</span>
      </p>
      <div className="replies">
        <ul className="reply-list">
          <li className="reply-item mb20">
            <div className="d-flex justify-content-between align-items-start px-3">
              <div className="avatar">
                <Link to="/">
                  <img
                    src="/assets/images/dummy/dummy_avatar.png"
                    alt="foo"
                    className="avatar-36"
                  />
                </Link>
              </div>
              <div className="reply-summary">
                <div className="reply-text mt-2">
                  <img
                    src="/assets/dummy/dummy.jpg"
                    className="bookmark-list-image"
                  />
                  日本の北部地方に位置する楠町（くすのきちょう）は、人口約一万人ほどの静かな山あいの町である。周囲を緩やかな山々に囲まれ、四季折々の自然に恵まれたこの町は、昔ながらの風景と温かみのある人々の暮らしが共存している。古くから農業と林業を中心とした産業で成り立っており、現代に至ってもその伝統が色濃く残っている。
                  <span>
                    <Link to="/">... No. 999</Link>
                  </span>
                </div>
              </div>
              <div className="reply-switch">
                {/* <PostBookmark item="null" /> */}
              </div>
            </div>
          </li>
          <li className="reply-item mb20">
            <div className="d-flex justify-content-between align-items-start px-3">
              <div className="avatar">
                <Link to="/">
                  <img
                    src="/assets/images/dummy/dummy_avatar.png"
                    alt="foo"
                    className="avatar-36"
                  />
                </Link>
              </div>
              <div className="reply-summary">
                <div className="reply-text mt-2">
                  <img
                    src="/assets/dummy/dummy.jpg"
                    className="bookmark-list-image"
                  />
                  日本の北部地方に位置する楠町（くすのきちょう）は、人口約一万人ほどの静かな山あいの町である。周囲を緩やかな山々に囲まれ、四季折々の自然に恵まれたこの町は、昔ながらの風景と温かみのある人々の暮らしが共存している。古くから農業と林業を中心とした産業で成り立っており、現代に至ってもその伝統が色濃く残っている。
                  <span>
                    <Link to="/">... No. 999</Link>
                  </span>
                </div>
              </div>
              <div className="reply-switch">
                削除
                {/* <PostBookmark item="null" /> */}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};
export default PostsReplyList;

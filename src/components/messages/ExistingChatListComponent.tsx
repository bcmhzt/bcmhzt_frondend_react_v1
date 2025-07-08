/** fca76db0 */
import React from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { Link } from 'react-router-dom';
// import { buildStorageUrl } from '../../utility/GetUseImage';
// import { firestore } from '../../firebaseConfig';
// import {
//   doc,
//   getDoc,
//   setDoc,
//   collection,
//   getDocs,
//   serverTimestamp,
//   query,
//   orderBy,
//   limit,
// } from 'firebase/firestore';
// import { useInfiniteQuery } from '@tanstack/react-query';
// import { generateChatRoomId } from '../../utility/Chat';
// import type { MatchUser, MatchListResponse } from '../../types/match';
// import ChatRoomCard from './ChatRoomCard';

const ExistingChatListComponent: React.FC = () => {
  return (
    <ul className="chat-room-list">
      <li className="chat-room-item">
        <div className="message-room">
          <div className="d-flex flex-row">
            <div className="avatar-area">
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`}
                className="avatar-36"
                alt="foobar"
              />
            </div>
            <div className="nickname-area">
              Unknown User
              <span className="bcuid"> @ unknown</span>
            </div>
          </div>
          <div className="chat-preview">
            <span>no mesage yet ...</span>
          </div>
        </div>
      </li>
    </ul>
  );
};

export default ExistingChatListComponent;

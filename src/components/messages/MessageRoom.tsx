import { buildStorageUrl } from '../../utility/GetUseImage';
import type { MatchUser } from '../../types/match';
import {
  ThreeDotsVertical,
  // PersonStanding,
  // PersonStandingDress,
  // PersonArmsUp,
  // PersonWalking,
  // X,
  // CardText,
  // CardImage,
  // Search,
} from 'react-bootstrap-icons';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
// import { firestore } from '../../firebaseConfig';
// import CryptoJS from 'crypto-js';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/messages/MessageRoom.tsx:xx] debug:', debug);
}

interface MessageRoomProps {
  item: MatchUser;
  chatRoomId: string;
  latestMessage?: any;
  onClose: () => void;
}

const MessageRoom = ({
  item,
  chatRoomId,
  latestMessage,
  onClose,
}: MessageRoomProps) => {
  const { currentUserProfile } = useAuth();
  console.log(
    '[src/components/messages/MessageRoom.tsx:xx] currentUserProfile:',
    currentUserProfile.user_profile.uid
  );
  console.log(
    '[src/components/messages/MessageRoom.tsx:xx] item.matched_uid:',
    item.matched_uid
  );

  return (
    <div className="message-room">
      <div className="d-flex flex-row">
        <pre>{JSON.stringify(item.profile_images, null, 2)}</pre>
        <div className="avatar-area">
          <img
            src={
              item.profile_images
                ? buildStorageUrl(
                    process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '',
                    item.profile_images,
                    '_small'
                  )
                : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
            }
            alt="avatar-36"
            className="avatar-36"
          />
        </div>
        <div className="nickname-area">
          {item?.nickname}
          <span className="bcuid"> @ {item?.bcuid}</span>
        </div>
        <div className="tool-area" style={{ marginLeft: 'auto' }}>
          <button>
            <ThreeDotsVertical style={{ fontSize: '20px', color: '#333' }} />
          </button>
        </div>
      </div>
      <div className="chat-preview">
        {latestMessage?.text
          ? latestMessage.text.slice(0, 50)
          : latestMessage?.image_url?.length
            ? '[画像]'
            : '(メッセージなし)'}
      </div>
    </div>
  );
};

export default MessageRoom;

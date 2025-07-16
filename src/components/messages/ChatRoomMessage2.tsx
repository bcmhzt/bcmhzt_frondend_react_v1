/** 711e23e7 */
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import axios, { AxiosResponse } from 'axios';
// import { firestore } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
// import {
//   collection,
//   query,
//   // where,
//   orderBy,
//   limit,
//   doc,
//   getDocs,
//   startAfter,
//   QueryDocumentSnapshot,
//   getDoc,
//   getCountFromServer,
//   onSnapshot,
//   QuerySnapshot,
//   DocumentData,
// } from 'firebase/firestore';
// import { ThreeDotsVertical, X, SendFill, Image } from 'react-bootstrap-icons';
// import { buildStorageUrl } from '../../utility/GetUseImage';
import ChatInputTool2 from './ChatInputTool2';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/messages/ChatRoomMessage.tsx:xx] ‼️debug:',
    debug
  );
}

const ChatRoomMessage = ({ chatRoomId }: { chatRoomId: string }) => {
  return (
    <div className="chat-room-message" id={`${chatRoomId}`}>
      <div className="chat-room-message-header">
        <div className="back-button">
          <button
            className="btn btn btn-light"
            onClick={() => window.history.back()}
          >
            前のページへ戻る
          </button>
        </div>
        <div className="d-flex flex-row">
          <div className="avatar-area">
            <Link to="/">
              <img
                src="/assets/images/dummy/dummy_avatar.png"
                className="avatar-36"
                alt=""
              />
            </Link>
          </div>
          <div className="nickname-area">
            nickename <span className="bcuid">@aaa-bbbb</span>
          </div>
        </div>
      </div>
      <div
        className="chat-room-message-body"
        // ref={messageBodyRef}
        style={
          {
            // overflowY: 'scroll',
            //✅️ここで高さを調整
            // maxHeight: 'calc(100vh - 50px)',
            // scrollbarWidth: 'none', // For Firefox
            // msOverflowStyle: 'none', // For IE and Edge
          }
        }
      >
        {/* 過去のメッセージを読み込むボタン */}
        <div className="load-more-messages text-center p-3">
          <button
            className="read-more-messages"
            // onClick={fetchMoreMessages}
            // disabled={isLoadingMessages}
          >
            Read more messages
          </button>
        </div>

        <ul className="message-list">
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>{' '}
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item own-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
          <li className="message-item other-message">
            <div className="message-content">
              <div className="message-text">こんばんは</div>
              <div className="message-time">16:42</div>
            </div>
          </li>
        </ul>
        <div />
      </div>
      <div className="chat-room-message-footer">
        {/* meta info */}
        {/* {debug === 'true' && (
          <>
            <div
              className="accordion accordion-flush"
              id="accordionFlushExample"
            >
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#flush-collapseOne"
                    aria-expanded="false"
                    aria-controls="flush-collapseOne"
                  >
                    ...
                  </button>
                </h2>
                <div
                  id="flush-collapseOne"
                  className="accordion-collapse collapse"
                  data-bs-parent="#accordionFlushExample"
                >
                  <div className="accordion-body">
                    <div>chatRoomId: xxxxxxxxxxx</div>
                    <div>総メッセージ件数: 999</div>
                    <div>表示中メッセージ件数: 10</div>
                    <div>さらに読み込み可能: はい</div>
                    <div>最新メッセージID: xxxxxxxx</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )} */}
        <div className="chat-input d-flex flex-column">
          <ChatInputTool2
          // chatRoomId={chatRoomId}
          // partnerUid={partnerUid}
          // currentUserProfile={currentUserProfile?.user_profile}
          // chatRoomData={chatRoomData}
          // onSendComplete={handleSendComplete}
          />
        </div>

        {/* meta info end */}
      </div>
    </div>
  );
};
export default ChatRoomMessage;

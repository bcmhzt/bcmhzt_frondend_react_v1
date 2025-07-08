import React, { useState } from 'react';
import type { MatchUser } from '../../types/match';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { Link } from 'react-router-dom';
import { ThreeDotsVertical, X } from 'react-bootstrap-icons';
import ChatRoomMessage from './ChatRoomMessage';

interface ChatRoomCardProps {
  user: MatchUser;
  chatRoomId: string;
}

const ChatRoomCard: React.FC<ChatRoomCardProps> = ({ user, chatRoomId }) => {
  const [showToolModal, setShowToolModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  return (
    <>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
      <div className="message-room">
        <div className="d-flex flex-row">
          <div className="avatar-area">
            <Link to={`/member/${user.bcuid}`}>
              <img
                src={
                  user.profile_images
                    ? buildStorageUrl(
                        process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '',
                        user.profile_images,
                        '_small'
                      )
                    : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                }
                className="avatar-36"
                alt={user.nickname || 'Unknown User'}
              />
            </Link>
          </div>
          <div className="nickname-area">
            {user.nickname || 'Unknown User'}
            <span className="bcuid"> @ {user.bcuid}</span>
          </div>
          <div className="tool-area" style={{ marginLeft: 'auto' }}>
            <ThreeDotsVertical
              style={{
                fontSize: '20px',
                cursor: 'pointer',
                color: 'rgb(51, 51, 51)',
              }}
              onClick={() => setShowToolModal(true)}
            />
          </div>
        </div>
        <div className="chat-preview" onClick={() => setShowChatModal(true)}>
          <span>no mesage yet ...</span>
        </div>
      </div>

      {/* ThreeDots メニュー */}
      {showToolModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050,
          }}
          onClick={() => setShowToolModal(false)}
        >
          <div
            className="modal-dialog modal-sm"
            role="document"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="modal-content">
              <div className="modal-header">
                <X
                  onClick={() => setShowToolModal(false)}
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
                />
              </div>
              <div className="modal-body">
                <p>chatRoomId: {chatRoomId}</p>
                <ul>
                  <li>ナイススケベの解除</li>
                  <li>ブロックする</li>
                  <li>通報する</li>
                </ul>
              </div>
              <div className="modal-footer">
                <X
                  onClick={() => setShowToolModal(false)}
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* チャットルームモーダル */}
      {showChatModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050,
          }}
          onClick={() => setShowChatModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-chat"
            role="document"
            onClick={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="modal-content modal-content-chat">
              <div className="modal-header d-flex align-items-center justify-content-between">
                <div>
                  <img
                    src={
                      user.profile_images
                        ? buildStorageUrl(
                            process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ??
                              '',
                            user.profile_images,
                            '_small'
                          )
                        : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                    }
                    alt="avatar-64"
                    className="avatar-64"
                  />
                  <span className="nickname-area-modal">{user.nickname}</span>
                  <span className="bcuid">@ {user.bcuid}</span>
                </div>
                <X
                  onClick={() => setShowChatModal(false)}
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
                />
              </div>
              <div className="modal-body modal-body-chat">
                <ul className="message-list">
                  <ChatRoomMessage />
                </ul>
              </div>
              <div className="modal-footer modal-footer-chat">
                <X
                  onClick={() => setShowChatModal(false)}
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatRoomCard;

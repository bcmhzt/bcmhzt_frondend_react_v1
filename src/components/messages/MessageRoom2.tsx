import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildStorageUrl } from '../../utility/GetUseImage';
import type { MatchUser } from '../../types/match';
import { ThreeDotsVertical, X } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
// import {
//   // ThreeDotsVertical,
//   // PersonStanding,
//   // PersonStandingDress,
//   // PersonArmsUp,
//   // PersonWalking,
//   // X,
//   // CardText,
//   // CardImage,
//   // Search,
// } from 'react-bootstrap-icons';

interface MessageRoom2Props {
  item: MatchUser;
  chatRoomId: string;
  latestMessage?: any;
  onClose: () => void;
}

const MessageRoom2 = ({
  item,
  chatRoomId,
  latestMessage,
  onClose,
}: MessageRoom2Props) => {
  const { currentUserProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  return (
    <>
      {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
      <div className="message-room">
        <div className="d-flex flex-row">
          <div className="avatar-area">
            <Link to={`/member/${item.bcuid}`}>
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
            </Link>
          </div>
          <div className="nickname-area">
            {item?.nickname}
            <span className="bcuid"> @ {item?.bcuid}</span>
          </div>

          <div className="tool-area" style={{ marginLeft: 'auto' }}>
            <ThreeDotsVertical
              style={{ fontSize: '20px', color: '#333', cursor: 'pointer' }}
              onClick={() => setShowModal(true)}
            />
          </div>
        </div>
        <div className="chat-preview" onClick={() => setShowChatModal(true)}>
          {latestMessage?.text ? (
            <span>{latestMessage.text.slice(0, 50)} ...</span>
          ) : latestMessage?.image_url?.length ? (
            <span>[画像]</span>
          ) : (
            <span className="no-message-yet">No message yet.</span>
          )}
        </div>
      </div>

      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1050,
            }}
            onClick={() => setShowModal(false)}
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
                    onClick={() => setShowModal(false)}
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  />
                </div>
                <div className="modal-body">
                  {/* <p>chatRoomId: {chatRoomId}</p> */}
                  <ul>
                    <li>ナイススケベの解除</li>
                    <li>ブロックする</li>
                    <li>通報する</li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <X
                    onClick={() => setShowModal(false)}
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showChatModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1050,
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="modal-dialog"
              role="document"
              onClick={(e) => e.stopPropagation()}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <X
                    onClick={() => setShowChatModal(false)}
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  />
                </div>
                <div className="modal-body chat-room-messages">
                  <p>chatRoomId: {chatRoomId}</p>
                  <p>hoge</p>
                </div>
                <div className="modal-footer">
                  <X
                    onClick={() => setShowChatModal(false)}
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MessageRoom2;

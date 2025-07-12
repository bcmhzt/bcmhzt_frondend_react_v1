import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { ThreeDotsVertical, X } from 'react-bootstrap-icons';

interface UserProps {
  user: ApiData;
  chatRoomId: string;
}

interface ApiData {
  matched_uid: string;
  id: number;
  uid: string;
  target_uid: string;
  reason: string;
  level: number;
  created_at: string;
  updated_at: string;
  bcuid: string;
  email: string;
  nickname: string | null;
  description: string | null;
  profile_images: string | null;
  status: number | null;
  gender: string | null;
  gender_detail: string | null;
  age: number | null;
  location: string | null;
  occupation_type: string | null;
  bheight: number | null;
  bweight: number | null;
  blood_type: string | null;
  academic_background: string | null;
  marital_status: string | null;
  hobbies_lifestyle: string | null;
  alcohol: string | null;
  tobacco: string | null;
  pet: string | null;
  holidays: string | null;
  favorite_food: string | null;
  character: string | null;
  religion: string | null;
  belief: string | null;
  conditions_ideal_partner: string | null;
  age_range: string | null;
  target_area: string | null;
  marriage_aspiration: string | null;
  self_introductory_statement: string | null;
  others_options: string | null;
  profile_video: string | null;
  member_like_created_at: string;
  user_profile_created_at: string;
}

const MesageChatRoomCard: React.FC<UserProps> = ({ user, chatRoomId }) => {
  const [showToolModal, setShowToolModal] = useState(false);
  return (
    <>
      <div className="message-room">
        {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
        <pre>{JSON.stringify(chatRoomId, null, 2)}</pre>
        <div className="d-flex flex-row">
          <div className="avatar-area">
            <Link to={`/member/${user?.bcuid}`}>
              <img
                src={
                  user?.profile_images
                    ? buildStorageUrl(
                        process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '',
                        user?.profile_images,
                        '_small'
                      )
                    : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                }
                className="avatar-36"
                alt={user?.nickname || 'Unknown User'}
              />
            </Link>
          </div>
          <div className="nickname-area">
            {user?.nickname || 'Unknown User'}
            <span className="bcuid"> @ {user?.bcuid}</span>
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
        <Link to={`/message/${user?.matched_uid}`} className="chat-link">
          <div className="chat-preview">
            <span>message</span>
          </div>
        </Link>
        {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
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
                {/* <p>chatRoomId: {chatRoomId}</p> */}
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
    </>
  );
};
export default MesageChatRoomCard;

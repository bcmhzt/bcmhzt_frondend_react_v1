import React from 'react';
import { buildStorageUrl } from '../../utility/GetUseImage';

interface MatchedMember {
  matched_uid: string;
  id: number;
  uid: string;
  bcuid: string;
  nickname: string;
  profile_images: string;
  gender: string;
  age: number;
  location: string;
}

interface ChatModalProps {
  member: MatchedMember | null;
  onClose: () => void;
  storage: string | undefined;
}

const ChatModal: React.FC<ChatModalProps> = ({ member, onClose, storage }) => {
  if (!member) return null;

  return (
    <div className="modal-wrapper">
      <div className="modal show" style={{ display: 'block' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center">
                <img
                  src={buildStorageUrl(
                    storage ?? '',
                    member.profile_images,
                    '_thumbnail'
                  )}
                  alt={member.nickname}
                  className="avatar-36 me-2"
                />
                <span>{member.nickname}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="chat-area" style={{ minHeight: '300px' }}>
                {/* チャット領域 */}
              </div>
            </div>
            <div className="modal-footer">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="メッセージを入力..."
                />
                <button className="btn btn-primary">送信</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </div>
  );
};

export default ChatModal;

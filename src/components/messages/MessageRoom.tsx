import React from 'react';
import { getImageWithSuffix } from '../../utility/GetUseImage';
import { OpenChatRoom } from '../../types/chat';

interface MessageRoomProps {
  room: OpenChatRoom;
  onRoomClick: (roomId: string) => void;
}

const MessageRoom: React.FC<MessageRoomProps> = ({ room, onRoomClick }) => {
  const storage_base_url =
    process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL || '';

  return (
    <div
      className="message-room cursor-pointer"
      onClick={() => onRoomClick(room.id)}
      data-bs-toggle="modal"
      data-bs-target={`#chatModal-${room.id}`}
    >
      <div className="d-flex justify-content-start align-items-center">
        <div className="member-avator-area">
          <a href={`/member/${room.userInfo?.bcuid ?? ''}`}>
            <img
              className="member-avator"
              src={
                room.userInfo?.profile_images
                  ? `${storage_base_url}${getImageWithSuffix(
                      room.userInfo.profile_images,
                      '_thumbnail'
                    )}?alt=media`
                  : '/assets/dummy/150x150.png'
              }
              alt={`${room.userInfo?.nickname ?? ''}のアバター`}
            />
          </a>
        </div>
        <div className="user-info">
          {/* <pre>{JSON.stringify(room.unreadCount, null, 2)}</pre> */}
          {room.unreadCount > 0 && (
            <span className="badge bg-primary me-2">{room.unreadCount}</span>
          )}
          <span className="nickname">
            {room.userInfo?.nickname ?? '読み込み中...'}
          </span>
          <span className="bcuid text-muted ms-2">
            @{room.userInfo?.bcuid ?? ''}
          </span>
        </div>
      </div>

      {/* チャットモーダル */}
      <div
        className="modal fade"
        id={`chatModal-${room.id}`}
        tabIndex={-1}
        aria-labelledby={`chatModalLabel-${room.id}`}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={`chatModalLabel-${room.id}`}>
                {room.userInfo?.nickname ?? ''}とのチャット
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* チャットメッセージ表示エリア */}
              <div className="chat-messages-container">
                {/* メッセージコンポーネントをここに実装予定 */}
              </div>
            </div>
            <div className="modal-footer">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="メッセージを入力..."
                />
                <button className="btn btn-primary" type="button">
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageRoom;

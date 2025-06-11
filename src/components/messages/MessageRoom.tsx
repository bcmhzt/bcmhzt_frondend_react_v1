import React, { useState } from 'react'; // useStateを追加
import { useAuth } from '../../contexts/AuthContext';
import { getImageWithSuffix } from '../../utility/GetUseImage';
import { OpenChatRoom } from '../../types/chat';
import ChatMessages from './ChatMessages';
import { sendMessage } from '../../services/firestoreChat';
import {
  CollectionReference,
  DocumentData,
  collection,
  getFirestore,
  getDocs,
  DocumentReference,
  deleteDoc,
} from 'firebase/firestore';

interface MessageRoomProps {
  room: OpenChatRoom;
  onRoomClick: (roomId: string) => void;
}
const MessageRoom: React.FC<MessageRoomProps> = ({ room, onRoomClick }) => {
  const { currentUser } = useAuth(); // currentUserを取得
  const [newMessage, setNewMessage] = useState(''); // メッセージ入力用のstate
  const [sending, setSending] = useState(false); // 送信中状態管理用のstate
  const storage_base_url =
    process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL || '';

  // メッセージ送信処理を追加
  const handleSendMessage = async () => {
    if (!currentUser?.uid || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(room.id, currentUser.uid, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // メッセージ全削除処理を追加
  const handleDeleteAllMessages = async () => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') return;
    if (!window.confirm('本当にすべてのメッセージを削除しますか？')) return;

    console.log(
      '[src/components/messages/MessageRoom.tsx] Room ID:',
      room.id,
      'Messages count:'
    );
    try {
      const db = getFirestore();
      // パスの指定方法を修正
      const messagesRef = collection(db, 'chats', room.id, 'messages');
      const snapshot = await getDocs(messagesRef);

      console.log(
        '[src/components/messages/MessageRoom.tsx] Room ID:',
        room.id,
        'Messages count:',
        snapshot.docs.length
      );

      if (snapshot.empty) {
        console.log(
          '[src/components/messages/MessageRoom.tsx] No messages found'
        );
        return;
      }

      // 一件ずつ削除
      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
        console.log(
          '[src/components/messages/MessageRoom.tsx] Deleted message:',
          doc.id
        );
      }

      console.log(
        '[src/components/messages/MessageRoom.tsx] All messages deleted:',
        snapshot.docs.length
      );
    } catch (error) {
      console.error('[src/components/messages/MessageRoom.tsx] Error:', error);
    }
  };

  return (
    <>
      {/* ルーム一覧の表示部分 */}
      <div
        className="message-room d-flex align-items-center p-3 border-bottom"
        role="button"
        data-bs-toggle="modal"
        data-bs-target={`#chatModal-${room.id}`}
      >
        <div className="member-avator-area me-3">
          <img
            className="member-avator rounded-circle"
            width="50"
            height="50"
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
        </div>
        <div className="user-info">
          <div className="d-flex align-items-center">
            <span className="nickname">
              {room.userInfo?.nickname ?? '読み込み中...'}
            </span>
            {room.unreadCount > 0 && (
              <span className="badge bg-primary ms-2">{room.unreadCount}</span>
            )}
          </div>
          <small className="text-muted">@{room.userInfo?.bcuid ?? ''}</small>
        </div>
      </div>

      {/* モーダル */}
      <div
        className="modal fade"
        id={`chatModal-${room.id}`}
        tabIndex={-1}
        aria-hidden="true"
        data-bs-scroll="true"
        chat-room-id={room.id}
        current-user-uid={currentUser?.uid}
        partner-user-uid={room.userInfo?.matched_uid}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {room.userInfo?.nickname ?? ''}とのチャット
              </h5>
              {process.env.REACT_APP_ENV !== 'prod' && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm ms-2"
                  onClick={handleDeleteAllMessages}
                >
                  全メッセージ削除（開発用）
                </button>
              )}
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="modal-body">
              {currentUser && (
                <ChatMessages
                  roomId={room.id}
                  currentUserId={currentUser.uid}
                />
              )}
            </div>
            <div className="modal-footer">
              <form
                className="w-100"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="メッセージを入力..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!newMessage.trim()}
                  >
                    送信
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default MessageRoom;

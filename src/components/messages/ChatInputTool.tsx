import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebaseConfig';
import { serverTimestamp } from 'firebase/firestore';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ThreeDotsVertical, X, SendFill, Image } from 'react-bootstrap-icons';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/messages/ChatInputTool.tsx:xx] ‼️debug:', debug);
}

interface ChatInputToolProps {
  chatRoomId: string;
  onSendComplete?: (newMessage: ChatMessage) => void;
  partnerUid?: string;
  currentUserProfile?: any;
  chatRoomData?: any;
}

interface ChatMessage {
  id: string;
  created_at: any; // Firestore Timestamp - メッセージ送信日時
  updated_at: any; // Firestore Timestamp - メッセージ送信日時（修正日時）
  image_url: string[]; // 添付画像（複数枚対応）
  is_deleted: boolean; // 論理削除フラグ
  last_read_at: { [uid: string]: any }; // 各UIDごとの既読タイムスタンプ（Firestore Timestamp）
  sender_id: string; // 送信者UID
  text: string; // 本文メッセージ
}

/**
 *
 * @props
 * onSendComplete: 送信完了時のシグナル
 * partnerUid: 相手ユーザーのUID
 * currentUserProfile: 再取得を避ける
 * chatRoomData: すでに取得済みなら渡すと冗長な取得を避けられる
 */
const ChatInputTool: React.FC<ChatInputToolProps> = ({
  chatRoomId,
  onSendComplete,
  partnerUid,
  currentUserProfile,
  chatRoomData,
}) => {
  const { currentUser } = useAuth();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    console.log(
      '[src/components/messages/ChatInputTool.tsx:50] ✳️ handleSend:',
      text
    );
    if (!text.trim() || sending || !chatRoomId) return;

    const messageData: ChatMessage = {
      id: '', // Placeholder ID, will be replaced later
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      image_url: [], // 今は画像なし
      is_deleted: false,
      last_read_at: {
        [currentUserProfile?.uid]: serverTimestamp(),
      },
      sender_id: currentUser?.uid || '',
      text: text.trim(),
    };

    try {
      setSending(true);
      const messagesRef = collection(
        firestore,
        'chats',
        chatRoomId,
        'messages'
      );
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, messageData);

      const newMessage = { ...messageData, id: newMessageRef.id };
      if (onSendComplete) {
        onSendComplete(newMessage);
      }

      setText('');
    } catch (error) {
      console.error('[ChatInputTool] メッセージ送信エラー:', error);
    } finally {
      setSending(false);
    }

    // setSending(true);
  };

  return (
    <>
      {/* <pre>{JSON.stringify(chatRoomId, null, 2)}</pre>{' '} */}
      {/* <pre>{JSON.stringify(partnerUid, null, 2)}</pre>{' '} */}
      {/* <pre>{JSON.stringify(currentUserProfile, null, 2)}</pre>{' '} */}
      {/* <pre>{JSON.stringify(chatRoomData, null, 2)}</pre> */}
      <div className="chat-input-textarea">
        <div className="text-count-alert">text count: 999</div>
        <textarea
          placeholder="メッセージを入力"
          rows={3}
          style={{
            width: '100%',
            fontSize: '16px',
            padding: '10px',
          }}
          maxLength={1500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={sending}
        />
        <div className="d-flex justify-content-end mt-2">
          <button
            className="btn btn-primary bcmhzt-btn-gray mr10"
            // onClick={() => {
            //   const fi = document.createElement('input');
            //   fi.type = 'file';
            //   fi.multiple = true;
            //   fi.accept = 'image/*';
            //   fi.onchange = (e) => handleImageChange(e as any);
            //   fi.click();
            // }}
          >
            <Image style={{ cursor: 'pointer', color: '#fff' }} />
          </button>
          <button
            className="btn btn-primary bcmhzt-btn"
            onClick={handleSend}
            disabled={sending}
          >
            {/* {isSending ? (
                  <span className="spinner-border spinner-border-sm text-white" />
                ) : (
                  <SendFill style={{ cursor: 'pointer', color: '#fff' }} />
                )} */}
            <SendFill style={{ cursor: 'pointer', color: '#fff' }} />
          </button>
        </div>
      </div>
    </>
  );
};
export default ChatInputTool;

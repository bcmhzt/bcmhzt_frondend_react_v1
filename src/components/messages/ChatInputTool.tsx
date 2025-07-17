/** ba4d1749 OK */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebaseConfig';
import { serverTimestamp } from 'firebase/firestore';
import { collection, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SendFill, Image } from 'react-bootstrap-icons';

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
  created_at: any;
  updated_at: any;
  image_url: string[];
  is_deleted: boolean;
  last_read_at: { [uid: string]: any };
  sender_id: string;
  text: string;
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      const newFiles = Array.from(files).slice(0, 5 - selectedImages.length);
      setSelectedImages((prev) => [...prev, ...newFiles]);
    };
    input.click();
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!text.trim() && selectedImages.length === 0) || sending || !chatRoomId)
      return;

    setSending(true);
    try {
      const messagesRef = collection(
        firestore,
        'chats',
        chatRoomId,
        'messages'
      );
      const newMessageRef = doc(messagesRef);
      const messageId = newMessageRef.id;

      // アップロード処理
      const storage = getStorage();
      const imageUrls: string[] = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const storageRef = ref(
          storage,
          `chat_images/${chatRoomId}/${messageId}/${Date.now()}_${i}.jpg`
        );
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

      const messageData: ChatMessage = {
        id: messageId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        image_url: imageUrls,
        is_deleted: false,
        last_read_at: {
          [currentUserProfile?.uid]: serverTimestamp(),
        },
        sender_id: currentUser?.uid || '',
        text: text.trim(),
      };

      // try {
      //   setSending(true);
      //   const messagesRef = collection(
      //     firestore,
      //     'chats',
      //     chatRoomId,
      //     'messages'
      //   );
      //   const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, messageData);

      // const newMessage = { ...messageData, id: newMessageRef.id };
      if (onSendComplete) {
        onSendComplete(messageData);
      }

      setText('');
      setSelectedImages([]);
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
        {/* <div className="text-count-alert">text count: 999</div> */}
        <textarea
          className="chat-textarea"
          placeholder="メッセージを入力"
          name="hoge"
          id="hoge"
          rows={3}
          style={{
            width: '100%',
            fontSize: '16px',
            padding: '10px',
          }}
          maxLength={1500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          // onKeyDown={(e) => {
          //   if (e.key === 'Enter' && !e.shiftKey) {
          //     e.preventDefault();
          //     handleSend();
          //   }
          // }}
          disabled={sending}
        />

        {/* ✅ サムネイルプレビュー */}
        {selectedImages.length > 0 && (
          <div className="chat-image-preview d-flex flex-wrap mt-2">
            {selectedImages.map((file, index) => (
              <div key={index} className="position-relative m-1">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute"
                  style={{
                    top: -10,
                    right: -10,
                    borderRadius: '50%',
                    padding: 0,
                    width: 20,
                    height: 20,
                    fontSize: 12,
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="d-flex justify-content-end mt-2">
          <button
            className="btn btn-primary bcmhzt-btn-gray mr10"
            onClick={handleImageSelect}
          >
            <Image style={{ cursor: 'pointer', color: '#fff' }} />
          </button>
          <button
            className="btn btn-primary bcmhzt-btn"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? (
              <span
                className="spinner-border spinner-border-sm text-light"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <SendFill style={{ cursor: 'pointer', color: '#fff' }} />
            )}
          </button>
        </div>
      </div>
    </>
  );
};
export default ChatInputTool;

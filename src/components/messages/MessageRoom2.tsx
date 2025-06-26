// import React, { useEffect, useRef, useState } from 'react';
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   serverTimestamp,
// } from 'firebase/firestore';
// import { useAuth } from '../../contexts/AuthContext';
// import { firestore } from '../../firebaseConfig';

type MessageRoom2Props = {
  otherUser: { uid: string; name?: string }; // Define the expected structure of otherUser
  onClose: () => void;
};

const MessageRoom2 = ({ otherUser, onClose }: MessageRoom2Props) => {
  // const { currentUser } = useAuth();
  // const [messages, setMessages] = useState([]);
  // const [newMessage, setNewMessage] = useState('');
  // const [loading, setLoading] = useState(false);
  // const bottomRef = useRef(null);

  // const generateChatId = (uid1, uid2) => {
  //   const [a, b] = [uid1, uid2].sort();
  //   return sha256(`${a}-${b}`);
  // };

  // const chatId = generateChatId(currentUser.uid, otherUser.uid);

  // useEffect(() => {
  //   const q = query(
  //     collection(firestore, 'chats', chatId, 'messages'),
  //     orderBy('created_at', 'asc')
  //   );
  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const fetched = snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     setMessages(fetched);
  //     setTimeout(
  //       () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
  //       0
  //     );
  //   });
  //   return () => unsubscribe();
  // }, [chatId]);

  // const handleSend = async () => {
  //   if (!newMessage.trim()) return;
  //   setLoading(true);
  //   await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
  //     text: newMessage,
  //     sender_id: currentUser.uid,
  //     created_at: serverTimestamp(),
  //     is_deleted: false,
  //     image_url: [],
  //   });
  //   setNewMessage('');
  //   setLoading(false);
  // };

  return (
    <div className="message-room">
      {/* <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`msg ${msg.sender_id === currentUser.uid ? 'me' : 'other'}`}
          >
            {msg.text && <p>{msg.text}</p>}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <div className="input-area">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          maxLength={1500}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? '送信中...' : '送信'}
        </button>
        <button onClick={onClose}>閉じる</button>
      </div> */}
    </div>
  );
};

export default MessageRoom2;

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  onSnapshot,
} from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { ChatMessage as ChatMessageType } from '../../types/chat';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
  roomId: string;
  currentUserId: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  roomId,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<any>(null);

  // 初期メッセージの読み込み
  useEffect(() => {
    setLoading(true);

    const messagesRef = collection(firestore, 'chats', roomId, 'messages');
    const q = query(
      messagesRef,
      orderBy('created_at', 'asc'), // descからascに変更
      limit(30)
    );

    // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ChatMessageType, 'id'>),
      })) as ChatMessageType[];

      setMessages(fetchedMessages);
      lastMessageRef.current = snapshot.docs[0];
      setHasMore(snapshot.docs.length === 30);
      setLoading(false);
    });

    // クリーンアップ関数
    return () => {
      unsubscribe();
      setMessages([]);
    };
  }, [roomId]);

  // メッセージ履歴の読み込み
  const loadInitialMessages = async () => {
    setLoading(true);
    try {
      const messagesRef = collection(firestore, 'chats', roomId, 'messages');
      const q = query(messagesRef, orderBy('created_at', 'desc'), limit(30));
      const snapshot = await getDocs(q);

      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessageType[];

      setMessages(fetchedMessages.reverse());
      lastMessageRef.current = snapshot.docs[0];
      setHasMore(snapshot.docs.length === 30);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    setLoading(false);
  };

  // 過去メッセージの読み込み
  const loadMoreMessages = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const messagesRef = collection(firestore, 'chats', roomId, 'messages');
      const q = query(
        messagesRef,
        orderBy('created_at', 'desc'),
        startAfter(lastMessageRef.current),
        limit(30)
      );
      const snapshot = await getDocs(q);

      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ChatMessageType, 'id'>),
      })) as ChatMessageType[];

      setMessages((prev) => [...fetchedMessages.reverse(), ...prev]);
      lastMessageRef.current = snapshot.docs[0];
      setHasMore(snapshot.docs.length === 30);
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
    setLoading(false);
  };

  // スクロール監視
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop } = containerRef.current;
    if (scrollTop === 0 && hasMore) {
      loadMoreMessages();
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="chat-messages"
      onScroll={handleScroll}
      style={{ height: '400px', overflowY: 'auto' }}
    >
      {loading && (
        <div className="text-center p-2">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          isOwn={message.sender_id === currentUserId}
        />
      ))}
    </div>
  );
};

export default ChatMessages;

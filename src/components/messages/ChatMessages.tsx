import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  getDocs,
  DocumentData,
  QuerySnapshot,
  limitToLast,
} from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { ChatMessage as ChatMessageType } from '../../types/chat';
import ChatMessage from './ChatMessage';
import { QueryConstraint, endAt } from 'firebase/firestore';

interface ChatMessagesProps {
  roomId: string;
  currentUserId: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  roomId,
  currentUserId,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(firestore, 'chats', roomId, 'messages');
    const baseQuery = query(
      messagesRef,
      orderBy('created_at', 'asc'),
      limitToLast(30) // limitToLastを使用
    );

    const unsubscribe = onSnapshot(
      baseQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        if (snapshot.empty) {
          setMessages([]);
          setLoading(false);
          return;
        }

        const fetchedMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate(),
            image_url: data.image_url || [],
            read_by: data.read_by || [],
            is_deleted: data.is_deleted || false,
          };
        }) as ChatMessageType[];

        setMessages(fetchedMessages);
        setLastVisible(snapshot.docs[0]); // 最も古いメッセージを参照として保存
        setLoading(false);
      },
      (error) => {
        console.error('[Firestore error]:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const loadMoreMessages = async () => {
    if (!hasMore || !lastVisible || loading) return;

    try {
      console.log('[DEBUG] Loading more messages...');
      const nextQuery = query(
        collection(firestore, 'chats', roomId, 'messages'),
        orderBy('created_at', 'asc'), // ascに変更
        endAt(lastVisible), // startAfterからendAtに変更
        limitToLast(30) // limitからlimitToLastに変更
      );

      const nextSnapshot = await getDocs(nextQuery);
      console.log('[DEBUG] Next batch size:', nextSnapshot.size);

      if (nextSnapshot.empty) {
        console.log('[DEBUG] No more messages to load');
        setHasMore(false);
        return;
      }

      const nextMessages = nextSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate(),
          image_url: data.image_url || [],
          read_by: data.read_by || [],
          is_deleted: data.is_deleted || false,
        };
      }) as ChatMessageType[];

      setLastVisible(nextSnapshot.docs[0]); // 最も古いメッセージを参照として保存
      setMessages((prev) => [...nextMessages, ...prev]); // 古いメッセージを前に追加
    } catch (error) {
      console.error('[ERROR] Loading more messages failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <div className="chat-messages-container">
      {hasMore && (
        <div className="text-center p-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={loadMoreMessages}
            disabled={loading}
          >
            過去のメッセージを読み込む
          </button>
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

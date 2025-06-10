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
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);

  useEffect(() => {
    console.log(
      '[src/components/messages/ChatMessages.tsx:26] === ChatMessages Debug ==='
    );
    console.log(
      '[src/components/messages/ChatMessages.tsx:27] roomId:',
      roomId
    );
    console.log(
      '[src/components/messages/ChatMessages.tsx:28] currentUserId:',
      currentUserId
    );

    // roomIdの存在チェックを追加
    if (!roomId) {
      console.warn('[ChatMessages] roomId is undefined or null');
      setLoading(false);
      return;
    }
    // roomIdの存在チェックの直後に追加
    const messagesRef = collection(firestore, 'chats', roomId, 'messages');
    const baseQuery = query(
      messagesRef,
      orderBy('created_at', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      baseQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        console.log(
          '[src/components/messages/ChatMessages.tsx:999] Snapshot size:',
          snapshot.size
        );
        console.log(
          '[src/components/messages/ChatMessages.tsx:999] Snapshot empty:',
          snapshot.empty
        );

        if (snapshot.empty) {
          console.log(
            '[src/components/messages/ChatMessages.tsx:999] No messages found in this room'
          );
          setMessages([]);
          setLoading(false);
          return;
        }

        const fetchedMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log(
            '[src/components/messages/ChatMessages.tsx:61] Message:',
            {
              id: doc.id,
              sender_id: data.sender_id,
              text: data.text,
              created_at: data.created_at?.toDate(),
              image_url: data.image_url || [],
              read_by: data.read_by || [],
              is_deleted: data.is_deleted || false,
            }
          );
          return {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate(),
            image_url: data.image_url || [],
            read_by: data.read_by || [],
            is_deleted: data.is_deleted || false,
          };
        }) as ChatMessageType[];

        console.log(
          '[src/components/messages/ChatMessages.tsx:73] Total fetched messages:',
          fetchedMessages.length
        );

        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setMessages(fetchedMessages.reverse());
        setLoading(false);
      },
      (error) => {
        console.error(
          '[src/components/messages/ChatMessages.tsx:87] Firestore error:',
          error
        );
        setLoading(false);
      }
    );

    return () => {
      console.log('[ChatMessages] Cleanup - unsubscribing');
      unsubscribe();
    };
  }, [roomId, currentUserId]);

  const loadMoreMessages = async () => {
    if (!hasMore || !lastVisible || loading) return;

    try {
      console.log('[DEBUG] Loading more messages...');
      const nextQuery = query(
        collection(firestore, 'chats', roomId, 'messages'),
        orderBy('created_at', 'desc'),
        startAfter(lastVisible),
        limit(30)
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

      setLastVisible(nextSnapshot.docs[nextSnapshot.docs.length - 1]);
      setMessages((prev) => [...prev, ...nextMessages.reverse()]);
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

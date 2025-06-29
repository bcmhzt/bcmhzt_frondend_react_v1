import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Contextの型定義
type Message = {
  id: string;
  text: string;
  type: string;
  duration?: number;
};

interface MessageContextType {
  messages: Message[];
  showMessage: (text: string, type?: string, duration?: number) => void;
  hideMessage: (id: string) => void;
  clearAllMessages: () => void;
  // Message型は上で定義済みなので、この部分は削除またはコメントアウトしてください。
  // type Message = {
  //   id: string;
  //   text: string;
  //   type: string;
  //   duration?: number;
  // };
}
const MessageContext = createContext<MessageContextType | undefined>(undefined);

/**
 * MessageProvider:
 * - `messages`: 通知（メッセージ）の配列
 * - `showMessage`: 通知を追加・表示
 * - `hideMessage`: 指定IDの通知を消す
 * - `clearAllMessages`: すべての通知を消す
 */

export const MessageProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  /**
   * 通知を追加して表示する
   * @param {string} text - 表示する本文
   * @param {string} [type='info'] - 通知の種類 (info, success, error, warning等)
   * @param {number} [duration] - 自動で消えるまでの時間(ms)
   */
  interface ShowMessage {
    (text: string, type?: string, duration?: number): void;
  }

  const showMessage: ShowMessage = useCallback(
    (text, type = 'info', duration) => {
      const id = uuidv4();
      const newMessage: Message = { id, text, type, duration };

      setMessages((prev: Message[]) => [...prev, newMessage]);

      // durationが設定されていれば自動的に削除
      if (duration && duration > 0) {
        setTimeout(() => {
          setMessages((prevState: Message[]) =>
            prevState.filter((msg) => msg.id !== id)
          );
        }, duration);
      }
    },
    []
  );

  /**
   * 指定したIDの通知を消す
   * @param {string} id - 消したいメッセージのID
   */
  interface HideMessage {
    (id: string): void;
  }

  const hideMessage: HideMessage = useCallback((id: string) => {
    setMessages((prev: Message[]) =>
      prev.filter((msg: Message) => msg.id !== id)
    );
  }, []);

  /**
   * すべての通知を消す
   */
  const clearAllMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = {
    messages,
    showMessage,
    hideMessage,
    clearAllMessages,
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

/**
 * useMessage (カスタムフック):
 * MessageContextの値を取得する
 */
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

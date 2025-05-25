import React, { useState, useEffect } from 'react';
import { useMessage } from '../contexts/MessageContext';

/**
 * メッセージ一覧を表示するコンテナ
 */
export const MessageContainer = () => {
  const { messages, hideMessage } = useMessage();

  return (
    <div className="mesage-container w-90">
      {messages.map((msg) => (
        <MessageItem key={msg.id} msg={msg} hideMessage={hideMessage} />
      ))}
    </div>
  );
};

/**
 * 単一メッセージ要素を描画 + フェードイン/アウト制御
 */
type MessageType = 'success' | 'error' | 'warning' | 'info';

type Message = {
  id: string;
  text: string;
  type: string; // Accept any string to match the context's message type
};

type MessageItemProps = {
  msg: Message;
  hideMessage: (id: string) => void;
};

function MessageItem({ msg, hideMessage }: MessageItemProps) {
  // "show"クラスを付与するためのstate
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    // マウントされたら少し遅延して"show"クラスを付ける → フェードイン開始
    const timer = setTimeout(() => {
      setIsShow(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  // 閉じるボタン or フェードアウト開始
  const handleClose = () => {
    setIsShow(false); // "show"クラスを外し、フェードアウト
    setTimeout(() => {
      // トランジションが終わる0.3秒後に実際にメッセージを配列から削除
      hideMessage(msg.id);
    }, 300);
  };

  return (
    <div
      // .show クラスを付け外しする
      className={`message-style ${isShow ? 'show' : ''}`}
      style={getMessageStyle(msg.type)}
    >
      <span>{msg.text}</span>
      <button style={closeButtonStyle} onClick={handleClose}>
        ×
      </button>
    </div>
  );
}

// インラインスタイル(背景色など)をタイプ別に切り替え
interface MessageStyle {
  backgroundColor?: string;
}

function getMessageStyle(type: string): MessageStyle {
  switch (type) {
    case 'success':
      return { backgroundColor: '#333' };
    case 'error':
      return { backgroundColor: '#800' };
    case 'warning':
      return { backgroundColor: 'orange' };
    case 'info':
      return { backgroundColor: '#457B9D' };
    default:
      return {};
  }
}

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontWeight: 'bold',
  marginLeft: '8px',
  cursor: 'pointer',
};

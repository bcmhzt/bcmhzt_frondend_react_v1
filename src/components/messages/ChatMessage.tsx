import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  return (
    <div className={`chat-message ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        {message.image_url && message.image_url.length > 0 && (
          <div className="message-images">
            {message.image_url.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="添付画像"
                className="message-image"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildStorageUrl } from '../../utility/GetUseImage';
import type { MatchUser } from '../../types/match';
import { ThreeDotsVertical, X } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

interface MessageRoom2Props {
  item: MatchUser;
  chatRoomId: string;
  latestMessage?: any;
  onClose: () => void;
}

const MessageRoom2 = ({
  item,
  chatRoomId,
  latestMessage,
  onClose,
}: MessageRoom2Props) => {
  const { currentUserProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const topObserverRef = useRef<HTMLDivElement | null>(null);
  const fetchedMessageIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);
  const topMostDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchMessages = async () => {
    if (!chatRoomId || isLoading) return;
    setIsLoading(true);
    const baseQuery = query(
      collection(firestore, `chats/${chatRoomId}/messages`),
      orderBy('created_at', 'desc'),
      ...(topMostDocRef.current ? [startAfter(topMostDocRef.current)] : []),
      limit(30)
    );

    const snapshot = await getDocs(baseQuery);
    const newDocs = snapshot.docs.filter(
      (doc) => !fetchedMessageIdsRef.current.has(doc.id)
    );

    newDocs.forEach((doc) => fetchedMessageIdsRef.current.add(doc.id));

    const newMessages = newDocs.map((doc) => doc.data());
    setMessages((prev) => [...newMessages.reverse(), ...prev]);
    if (snapshot.docs.length > 0) {
      topMostDocRef.current = snapshot.docs[snapshot.docs.length - 1];
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [chatRoomId]);

  useEffect(() => {
    if (initialLoadRef.current && messagesEndRef.current && showChatModal) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
      initialLoadRef.current = false;
    }
  }, [messages, showChatModal]);

  useEffect(() => {
    if (!chatBodyRef.current || !topObserverRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          fetchMessages();
        }
      },
      {
        root: chatBodyRef.current,
        threshold: 0.1,
      }
    );

    observerRef.current.observe(topObserverRef.current);

    return () => {
      if (observerRef.current && topObserverRef.current) {
        observerRef.current.unobserve(topObserverRef.current);
      }
    };
  }, [messages, isLoading]);

  return (
    <>
      {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
      <div className="message-room">
        <div className="d-flex flex-row">
          <div className="avatar-area">
            <Link to={`/member/${item.bcuid}`}>
              <img
                src={
                  item.profile_images
                    ? buildStorageUrl(
                        process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '',
                        item.profile_images,
                        '_small'
                      )
                    : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                }
                alt="avatar-36"
                className="avatar-36"
              />
            </Link>
          </div>
          <div className="nickname-area">
            {item?.nickname}
            <span className="bcuid"> @ {item?.bcuid}</span>
          </div>

          <div className="tool-area" style={{ marginLeft: 'auto' }}>
            <ThreeDotsVertical
              style={{ fontSize: '20px', color: '#333', cursor: 'pointer' }}
              onClick={() => setShowModal(true)}
            />
          </div>
        </div>
        <div className="chat-preview" onClick={() => setShowChatModal(true)}>
          {latestMessage?.text ? (
            <span>{latestMessage.text.slice(0, 50)} ...</span>
          ) : latestMessage?.image_url?.length ? (
            <span>[画像]</span>
          ) : (
            <span className="no-message-yet">No message yet.</span>
          )}
        </div>
      </div>

      {showModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1050,
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="modal-dialog modal-sm"
              role="document"
              onClick={(e) => e.stopPropagation()}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <X
                    onClick={() => setShowModal(false)}
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  />
                </div>
                <div className="modal-body">
                  <p>chatRoomId: {chatRoomId}</p>
                  <ul>
                    <li>ナイススケベの解除</li>
                    <li>ブロックする</li>
                    <li>通報する</li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <X
                    onClick={() => setShowModal(false)}
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showChatModal && (
        <>
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1050,
            }}
            onClick={() => setShowChatModal(false)}
          >
            <div
              className="modal-dialog"
              role="document"
              onClick={(e) => e.stopPropagation()}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <X
                    onClick={() => setShowChatModal(false)}
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  />
                </div>
                <div
                  className="modal-body chat-room-messages"
                  ref={chatBodyRef}
                >
                  <div ref={topObserverRef} style={{ height: '1px' }} />
                  <pre>{JSON.stringify(topObserverRef, null, 2)}</pre>
                  {/* <p>chatRoomId: {chatRoomId}</p>
                  <pre>
                    {JSON.stringify(currentUserProfile?.user_profile, null, 2)}
                  </pre> */}

                  <ul className="list-unstyled">
                    {[...messages].reverse().map((msg, idx) => (
                      <li
                        key={idx}
                        className={
                          msg.uid === currentUserProfile.uid
                            ? 'text-right'
                            : 'text-left'
                        }
                      >
                        <div className="message-box p-2 mb-2 border rounded">
                          #{idx + 1}
                          {msg.text || '[画像メッセージ]'}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div ref={messagesEndRef} />
                  {isLoading && (
                    <div className="text-center my-2">読み込み中...</div>
                  )}
                </div>
                <div className="modal-footer">
                  <X
                    onClick={() => setShowChatModal(false)}
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MessageRoom2;

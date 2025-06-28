import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
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

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/messages/MessageRoom2.tsx:xx] debug:', debug);
}

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
  const [messagesToolModal, setMessagesToolModal] = useState(false);
  // infinite-scroll 前の scrollHeight を覚えておく
  const prevScrollHeightRef = useRef<number>(0);

  // useEffect(() => {
  //   if (!showChatModal) return;
  //   console.log('showChatModal が true になりました');
  //   if (!chatBodyRef.current || !topObserverRef.current) {
  //     console.log('まだ要素がありません');
  //     return;
  //   }
  //   console.log('要素がマウントされました', topObserverRef.current);
  //   // ここで observer.observe を行う
  // }, [showChatModal, isLoading]);

  // --- 追加 ---
  // 初回：最新30件だけを取得 → 古→新 の順にセットし、
  // 次ページ読み込み用に「最も古いドキュメント」を保持
  const fetchInitialMessages = async () => {
    if (!chatRoomId) return;
    // setIsLoading(true);
    fetchedMessageIdsRef.current.clear();
    setIsLoading(true);
    const snapshot = await getDocs(
      query(
        collection(firestore, `chats/${chatRoomId}/messages`),
        orderBy('created_at', 'desc'),
        limit(30)
      )
    );
    // 取得は [新, …, 古] なので、reverse() して [古, …, 新] に
    const docs = snapshot.docs.map((d) => d.data()).reverse();
    setMessages(docs);
    topMostDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
    setIsLoading(false);

    // 初回ロードで取り込んだ ID をフィルタ集合に追加
    snapshot.docs.forEach((d) => fetchedMessageIdsRef.current.add(d.id));
  };

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
    // OK 問題なし
    console.log(
      '[src/components/messages/MessageRoom2.tsx:75] Firestore snapshot.docs IDs:',
      snapshot.docs.map((d) => d.id)
    );
    const newDocs = snapshot.docs.filter(
      (doc) => !fetchedMessageIdsRef.current.has(doc.id)
    );
    console.log(
      '[src/components/messages/MessageRoom2.tsx:81] filtered newDocs IDs:',
      newDocs.map((d) => d.id)
    );
    newDocs.forEach((doc) => fetchedMessageIdsRef.current.add(doc.id));

    const newMessages = newDocs.map((doc) => doc.data());
    console.log(
      '[src/components/messages/MessageRoom2.tsx:88] newMessages (desc order):',
      newMessages
    );
    // 最新を下に、古いを上に追加
    setMessages((prev) => {
      console.log(
        '[src/components/messages/MessageRoom2.tsx:94] before prepend, prev length:',
        prev.length
      );
      const merged = [...newMessages.reverse(), ...prev];
      console.log(
        '[src/components/messages/MessageRoom2.tsx:97] after prepend, merged length:',
        merged.length,
        'first few:',
        merged.slice(0, 5)
      );
      return merged;
    });
    if (snapshot.docs.length > 0) {
      topMostDocRef.current = snapshot.docs[snapshot.docs.length - 1];
    }
    setIsLoading(false);
  };

  // チャットID変化時に初回30件読み込み
  useEffect(() => {
    // fetchMessages();
    fetchInitialMessages();
  }, [chatRoomId]);

  useLayoutEffect(() => {
    // モーダル開いて＆初回ロード＆メッセージがある、の三条件で一度だけスクロール
    if (
      showChatModal &&
      initialLoadRef.current &&
      messages.length > 0 &&
      chatBodyRef.current
    ) {
      // 直接 scrollTop を設定
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      initialLoadRef.current = false;
    }
  }, [showChatModal, messages]);

  // 無限スクロール: 上端に到達すると古いメッセージを追加取得
  // useEffect(() => {
  //   if (!showChatModal) return;
  //   const container = chatBodyRef.current;
  //   const sentinel = topObserverRef.current;
  //   if (!container || !sentinel) return;

  //   // 既存のオブザーバーがあれば解除
  //   observerRef.current?.disconnect();
  //   observerRef.current = new IntersectionObserver(
  //     async (entries) => {
  //       if (
  //         entries[0].isIntersecting &&
  //         topMostDocRef.current && // 前回の最古ドキュメントがある
  //         !isLoading
  //       ) {
  //         // 追加読み込み前の高さを保持
  //         const prevHeight = container.scrollHeight;
  //         await fetchMessages();
  //         // 読み込み後、スクロール位置を維持
  //         container.scrollTop = container.scrollHeight - prevHeight;
  //       }
  //     },
  //     {
  //       root: container,
  //       rootMargin: '0px',
  //       threshold: 0, // sentinel が一部でも見えたら発火
  //     }
  //   );
  //   observerRef.current.observe(sentinel);

  //   return () => {
  //     observerRef.current?.disconnect();
  //   };
  // }, [showChatModal, isLoading]);

  useEffect(() => {
    if (!showChatModal) return;
    const container = chatBodyRef.current;
    const sentinel = topObserverRef.current;
    if (!container || !sentinel) return;

    // 既存のオブザーバーを切り離し
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && topMostDocRef.current) {
          // 読み込み直前の scrollHeight を覚えておく
          prevScrollHeightRef.current = container.scrollHeight;
          fetchMessages();
        }
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: 0,
      }
    );
    observerRef.current.observe(sentinel);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [showChatModal]);

  // メッセージが更新されたタイミングで、先ほどの scrollHeight 差分を反映
  useLayoutEffect(() => {
    if (
      !initialLoadRef.current &&
      prevScrollHeightRef.current &&
      chatBodyRef.current
    ) {
      const container = chatBodyRef.current;
      // 新 scrollHeight から旧 scrollHeight を引いて scrollTop に設定
      container.scrollTop =
        container.scrollHeight - prevScrollHeightRef.current;
      // 次回に影響しないようクリア
      prevScrollHeightRef.current = 0;
    }
  }, [messages]);

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
              style={{ fontSize: '20px', cursor: 'pointer', color: '#333' }}
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
      {/* ThreeDots メニュー */}
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
              className="modal-dialog modal-dialog-chat"
              role="document"
              onClick={(e) => e.stopPropagation()}
              style={{ pointerEvents: 'auto' }}
            >
              <div className="modal-content modal-content-chat">
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
                <div className="modal-body modal-body-chat" ref={chatBodyRef}>
                  {/* 上端検知用 sentinel */}
                  <div
                    ref={topObserverRef}
                    style={{ height: '1px', backgroundColor: 'transparent' }}
                  />
                  <ul className="message-list">
                    {[...messages].map((msg, idx) => (
                      <>
                        {/* <pre>{JSON.stringify(msg.created_at, null, 2)}</pre> */}
                        {/* <pre>{JSON.stringify(msg.images, null, 2)}</pre> */}
                        <li
                          key={idx}
                          className={`${
                            msg.sender_id ===
                            currentUserProfile?.user_profile?.uid
                              ? 'text-right'
                              : 'text-left'
                          } message-text`}
                          onClick={() => {
                            if (
                              msg.sender_id ===
                              currentUserProfile?.user_profile?.uid
                            ) {
                              setMessagesToolModal(true);
                            }
                          }}
                        >
                          <div className="message-box p-2 mb-2 border rounded">
                            #{messages.length - idx}{' '}
                            {msg.text || '[画像メッセージ]'}
                          </div>
                          <div className="datetime text-muted">
                            {new Date(
                              msg.created_at?.seconds * 1000
                            ).toLocaleString('ja-JP', {
                              timeZone: 'Asia/Tokyo',
                            })}{' '}
                            既読 | 未読
                          </div>
                        </li>
                      </>
                    ))}
                  </ul>
                  <div ref={messagesEndRef} />
                  {/* <pre>{JSON.stringify(isLoading, null, 2)}</pre> */}
                  {/* {isLoading && (
                    <div className="text-center my-2">読み込み中...</div>
                  )} */}
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

          {/* メッセージツールモーダル */}
          {messagesToolModal && (
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
                onClick={() => setMessagesToolModal(false)}
              >
                <div
                  className="modal-dialog modal-sm"
                  role="document"
                  onClick={(e) => e.stopPropagation()}
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="modal-content">
                    <div className="modal-body">
                      <ul>
                        <li>メッセージをコピーする</li>
                        <li>メッセージを編集する</li>
                        <li>メッセージを削除</li>
                      </ul>
                    </div>
                    <div className="modal-footer">
                      <X
                        onClick={() => setMessagesToolModal(false)}
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
      )}
    </>
  );
};

export default MessageRoom2;

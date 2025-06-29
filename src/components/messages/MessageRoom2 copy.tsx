import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { buildStorageUrl } from '../../utility/GetUseImage';
import type { MatchUser } from '../../types/match';
import { ThreeDotsVertical, X, SendFill, Image } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  startAfter,
  limit,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

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
  const prevScrollHeightRef = useRef<number>(0);

  // 入力・送信状態
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 画像プレビュー・選択ファイル
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  {
    /* メッセージ一覧 */
  }
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
  // 初回：最新30件だけを取得 → 古→新 の順にセット
  const fetchInitialMessages = async () => {
    if (!chatRoomId) return;
    // 前回取得済みIDセットをクリア
    fetchedMessageIdsRef.current.clear();
    setIsLoading(true);

    // Firestore から降順(limit 30)で取得
    const snap = await getDocs(
      query(
        collection(firestore, `chats/${chatRoomId}/messages`),
        orderBy('created_at', 'desc'),
        limit(30)
      )
    );

    // ドキュメントID付きで取得し、reverse() して古→新順に
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();

    setMessages(docs);
    // 次ページ読み込みの startAfter 用に最も古いドキュメントを保持
    topMostDocRef.current = snap.docs[snap.docs.length - 1] || null;
    setIsLoading(false);

    // 取得したIDをキャッシュ
    snap.docs.forEach((d) => fetchedMessageIdsRef.current.add(d.id));
  };
  // 過去メッセージ取得
  const fetchMessages = async () => {
    if (!chatRoomId || isLoading) return;
    setIsLoading(true);

    const baseQ = query(
      collection(firestore, `chats/${chatRoomId}/messages`),
      orderBy('created_at', 'desc'),
      ...(topMostDocRef.current ? [startAfter(topMostDocRef.current)] : []),
      limit(30)
    );
    const snap = await getDocs(baseQ);

    // 未取得のドキュメントだけフィルタ
    const newDocs = snap.docs.filter(
      (d) => !fetchedMessageIdsRef.current.has(d.id)
    );
    newDocs.forEach((d) => fetchedMessageIdsRef.current.add(d.id));

    // id を含めてマージ
    const newMsgs = newDocs.map((d) => ({ id: d.id, ...d.data() }));
    setMessages((prev) => [...newMsgs.reverse(), ...prev]);

    // 次の startAfter 用
    if (snap.docs.length > 0) {
      topMostDocRef.current = snap.docs[snap.docs.length - 1];
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchInitialMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]);

  useLayoutEffect(() => {
    if (
      showChatModal &&
      initialLoadRef.current &&
      messages.length > 0 &&
      chatBodyRef.current
    ) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      initialLoadRef.current = false;
    }
  }, [showChatModal, messages]);

  /** メッセージ送信 */
  const handleSend = async () => {
    const text = inputText.trim();
    if (!chatRoomId || (text === '' && selectedFiles.length === 0)) return;
    setIsSending(true);
    try {
      // 1) Firestore に空 images で登録
      const msgRef = await addDoc(
        collection(firestore, `chats/${chatRoomId}/messages`),
        {
          sender_id: currentUserProfile?.user_profile?.uid,
          text,
          images: [],
          is_deleted: false,
          last_read_at: {},
          created_at: serverTimestamp(),
        }
      );
      // 2) 画像アップロード＆URL取得
      let imageObjects: Array<{
        original: string;
        thumb: string;
        aspect: number;
      }> = [];
      if (selectedFiles.length > 0) {
        const storage = getStorage();
        imageObjects = await Promise.all(
          selectedFiles.map(async (file) => {
            const basePath = `chats/${chatRoomId}/messages/${msgRef.id}`;
            const origPath = `${basePath}/original/${file.name}`;
            const thumbPath = `${basePath}/thumb/${file.name}`;
            const origRef = storageRef(storage, origPath);
            const thumbRef = storageRef(storage, thumbPath);
            await uploadBytes(origRef, file);
            await uploadBytes(thumbRef, file);
            const [originalUrl, thumbUrl] = await Promise.all([
              getDownloadURL(origRef),
              getDownloadURL(thumbRef),
            ]);
            const imgEl = await new Promise<HTMLImageElement>((res) => {
              const img = document.createElement('img');
              img.onload = () => res(img);
              img.src = originalUrl;
            });
            return {
              original: originalUrl,
              thumb: thumbUrl,
              aspect: imgEl.width / imgEl.height,
            };
          })
        );
        await updateDoc(msgRef, { images: imageObjects });
      }
      // 3) ルーム updated_at
      await updateDoc(doc(firestore, 'chats', chatRoomId), {
        updated_at: serverTimestamp(),
      });
      // 4) ローカル state
      setMessages((prev) => [
        ...prev,
        {
          sender_id: currentUserProfile?.user_profile?.uid,
          text,
          images: imageObjects,
          is_deleted: false,
          last_read_at: {},
          created_at: { seconds: Math.floor(Date.now() / 1000) },
        },
      ]);
      setSelectedFiles([]);
      setPreviewImages([]);
    } catch (error) {
      console.error('メッセージ送信中にエラー:', error);
    } finally {
      setIsSending(false);
      setInputText('');
    }
  };

  // 無限スクロール
  useEffect(() => {
    if (!showChatModal) return;
    const container = chatBodyRef.current;
    const sentinel = topObserverRef.current;
    if (!container || !sentinel) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && topMostDocRef.current) {
          prevScrollHeightRef.current = container.scrollHeight;
          fetchMessages();
        }
      },
      { root: container, rootMargin: '0px', threshold: 0 }
    );
    observerRef.current.observe(sentinel);
    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChatModal]);

  // スクロール位置キープ
  useLayoutEffect(() => {
    if (
      !initialLoadRef.current &&
      prevScrollHeightRef.current &&
      chatBodyRef.current
    ) {
      const c = chatBodyRef.current;
      c.scrollTop = c.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messages]);

  /** 画像選択時の preview とファイル保持 */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5);
    // 既存分と合わせて最大5枚まで
    const combined = [...selectedFiles, ...files].slice(0, 5); // ← 変更
    setSelectedFiles(combined);
    // プレビューは URL.createObjectURL でまとめて生成
    const urls = combined.map((f) => URL.createObjectURL(f)); // ← 変更
    setPreviewImages(urls);
  };

  /** メッセージ削除 */
  const handleDeleteMessage = async (messageId: string) => {
    console.log(
      '[src/components/messages/MessageRoom2.tsx:287] handleDeleteMessage:',
      messageId
    );
    if (!chatRoomId || !messageId) return;
    try {
      const msgRef = doc(firestore, `chats/${chatRoomId}/messages`, messageId);
      await updateDoc(msgRef, { is_deleted: true });
      setMessages((prev) =>
        prev.map((msg) =>
          // もし id フィールドが入っていなければ、fetchInitialMessages / fetchMessages で map に含めてください
          (msg as any).id === messageId ? { ...msg, is_deleted: true } : msg
        )
      );
      // ルームの updated_at も更新
      await updateDoc(doc(firestore, 'chats', chatRoomId), {
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('メッセージ削除エラー:', error);
    } finally {
      setMessagesToolModal(false);
      setActiveMessageId(null);
    }
  };

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
            {item.nickname}
            <span className="bcuid"> @ {item.bcuid}</span>
          </div>
          <div className="tool-area" style={{ marginLeft: 'auto' }}>
            <ThreeDotsVertical
              style={{ fontSize: 20, cursor: 'pointer', color: '#333' }}
              onClick={() => setShowModal(true)}
            />
          </div>
        </div>
        <div className="chat-preview" onClick={() => setShowChatModal(true)}>
          {latestMessage?.text ? (
            <span>{latestMessage.text.slice(0, 50)} …</span>
          ) : latestMessage?.images?.length ? (
            <img
              src={latestMessage.images[0].thumb}
              alt="preview"
              style={{
                width: 60,
                height: 60,
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          ) : (
            <span className="no-message-yet">No message yet.</span>
          )}
        </div>
      </div>

      {/* ThreeDots メニュー */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
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
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
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
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* チャットルームモーダル */}
      {showChatModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
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
              <div className="modal-header d-flex align-items-center justify-content-between">
                <div>
                  <img
                    src={
                      item.profile_images
                        ? buildStorageUrl(
                            process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ??
                              '',
                            item.profile_images,
                            '_small'
                          )
                        : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                    }
                    alt="avatar-64"
                    className="avatar-64"
                  />
                  <span className="nickname-area-modal">{item.nickname}</span>
                  <span className="bcuid">@ {item.bcuid}</span>
                </div>
                <X
                  onClick={() => setShowChatModal(false)}
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
                />
              </div>
              <div className="modal-body modal-body-chat" ref={chatBodyRef}>
                {/* sentinel */}
                <div
                  ref={topObserverRef}
                  style={{ height: 1, backgroundColor: 'transparent' }}
                />
                <ul className="message-list">
                  {messages.map((msg, idx) => (
                    <li
                      key={idx}
                      className={`${msg.sender_id === currentUserProfile?.user_profile?.uid ? 'text-right' : 'text-left'} message-text`}
                      onClick={() => {
                        if (
                          msg.sender_id ===
                          currentUserProfile?.user_profile?.uid
                        ) {
                          setMessagesToolModal(true);
                          setActiveMessageId(msg.id);
                        }
                      }}
                    >
                      <pre>{JSON.stringify(msg, null, 2)}</pre>

                      <div className="message-box p-2 mb-2 border rounded">
                        {/* JSON デバッグ */}
                        {/* <pre>{JSON.stringify(msg.images, null, 2)}</pre> */}
                        {msg.text}
                        {msg.images?.length > 0 && (
                          <div className="image-message">
                            {msg.images.map((m: any, i: number) => (
                              <img
                                key={i}
                                src={m.original}
                                alt={`message-img-${i}`}
                                style={{
                                  maxWidth: '100%',
                                  borderRadius: 4,
                                  marginTop: 8,
                                }}
                              />
                            ))}
                          </div>
                        )}
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
                  ))}
                </ul>
                <div ref={messagesEndRef} />

                <div className="chat-input d-flex flex-column">
                  <div className="chat-input-textarea">
                    <div className="image-preview-list d-flex mt-2">
                      {previewImages.map((src, i) => (
                        <div
                          key={i}
                          className="preview-thumb position-relative mr-2"
                          style={{ width: 60, height: 60 }}
                        >
                          <img
                            src={src}
                            alt={`preview-${i}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 4,
                            }}
                          />
                          <button
                            type="button"
                            className="position-absolute"
                            style={{
                              top: -6,
                              right: -6,
                              background: '#dc3545',
                              border: 'none',
                              borderRadius: '50%',
                              width: 20,
                              height: 20,
                              color: '#fff',
                              fontSize: 12,
                              lineHeight: 1,
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              // プレビューと selectedFiles の両方から i 番目を取り除く
                              setPreviewImages((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              );
                              setSelectedFiles((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              );
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-count-alert">
                      text count: {inputText.length}
                    </div>
                    <textarea
                      placeholder="メッセージを入力"
                      rows={3}
                      style={{ width: '100%' }}
                      maxLength={1500}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onInput={(e) => {
                        const t = e.currentTarget as HTMLTextAreaElement;
                        t.rows = Math.min(10, Math.max(3, t.scrollHeight / 20));
                      }}
                    />
                  </div>
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      className="btn btn-primary bcmhzt-btn-gray mr10"
                      onClick={() => {
                        const fi = document.createElement('input');
                        fi.type = 'file';
                        fi.multiple = true;
                        fi.accept = 'image/*';
                        fi.onchange = (e) => handleImageChange(e as any);
                        fi.click();
                      }}
                    >
                      <Image style={{ cursor: 'pointer', color: '#fff' }} />
                    </button>
                    <button
                      className="btn btn-primary bcmhzt-btn"
                      onClick={handleSend}
                      disabled={
                        isSending ||
                        (!inputText.trim() && selectedFiles.length === 0)
                      }
                    >
                      {isSending ? (
                        <span className="spinner-border spinner-border-sm text-white" />
                      ) : (
                        <SendFill
                          style={{ cursor: 'pointer', color: '#fff' }}
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer modal-footer-chat">
                <X
                  onClick={() => setShowChatModal(false)}
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メッセージツールモーダル */}
      {messagesToolModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
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
                <pre>{JSON.stringify(activeMessageId, null, 2)}</pre>
                <ul>
                  <li>メッセージをコピーする</li>
                  <li>メッセージを編集する</li>
                  <li
                    className="delete-message"
                    style={{ color: '#880000', cursor: 'pointer' }}
                    onClick={() => {
                      if (activeMessageId) handleDeleteMessage(activeMessageId);
                    }}
                  >
                    メッセージを削除する
                  </li>
                </ul>
              </div>
              <div className="modal-footer">
                <X
                  onClick={() => setMessagesToolModal(false)}
                  style={{ fontSize: 30, cursor: 'pointer', color: '#555' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageRoom2;

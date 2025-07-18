/** 711e23e7 OK */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios, { AxiosResponse } from 'axios';
import { firestore } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  // where,
  orderBy,
  limit,
  doc,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  getDoc,
  getCountFromServer,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  deleteDoc,
} from 'firebase/firestore';
import {
  ThreeDotsVertical,
  Trash,
  // ReplyFill,
  // BookmarkFill,
  // X,
  // SendFill,
  // Image,
} from 'react-bootstrap-icons';
import { buildStorageUrl } from '../../utility/GetUseImage';
import ChatInputTool from './ChatInputTool';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/messages/ChatRoomMessage.tsx:xx] ‼️debug:',
    debug
  );
}

interface MemberData {
  member: {
    id: number | string;
    bcuid: string;
    uid: string;
    nickname: string | null;
    description: string | null;
    profile_images: string | null;
    gender: string | null;
    age: number | null;
    location: string | null;
    occupation_type: string | null;
    bheight: number | null;
    bweight: number | null;
    blood_type: string | null;
    academic_background: string | null;
    marital_status: string | null;
    hobbies_lifestyle: string | null;
    alcohol: string | null;
    tobacco: string | null;
    pet: string | null;
    favorite_food: string | null;
    character: string | null;
    religion: string | null;
    conditions_ideal_partner: string | null;
    age_range: string | null;
    target_area: string | null;
    marriage_aspiration: string | null;
    self_introductory_statement: string | null;
  };
  propensities: Propensity[];
}

interface Propensity {
  id: number;
  name_ja: string;
  status: number; // 1: 表示対象
}

// メッセージの型定義
interface ChatMessage {
  id: string;
  created_at: any; // Firestore Timestamp - メッセージ送信日時
  updated_at: any; // Firestore Timestamp - メッセージ送信日時（修正日時）
  image_url: string[]; // 添付画像（複数枚対応）
  is_deleted: boolean; // 論理削除フラグ
  last_read_at: { [uid: string]: any }; // 各UIDごとの既読タイムスタンプ（Firestore Timestamp）
  sender_id: string; // 送信者UID
  text: string; // 本文メッセージ
}

const ChatRoomMessage = ({ chatRoomId }: { chatRoomId: string }) => {
  const [totalMessageCount, setTotalMessageCount] = useState<number>(0);
  const { token, currentUserProfile } = useAuth();
  const [chatRoomData, setChatRoomData] = useState<any>(null);
  const [partnerUid, setPartnerUid] = useState<string>('');

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT as string;
  const [loading, setLoading] = useState<boolean>(true);
  const [member, setMember] = useState<MemberData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] =
    useState<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  const messageBodyRef = useRef<HTMLDivElement | null>(null);
  const [messageToolOpenId, setMessageToolOpenId] = useState<string | null>(
    null
  );

  const handleSendComplete = (newMessage: ChatMessage) => {
    setMessages((prev) => [...prev, newMessage]);
    setLatestMessageId(newMessage.id); // 新しいメッセージにエフェクト付与
    setShouldAutoScroll(true); // 新しいメッセージが送信されたら自動スクロールを有効にする
    scrollToBottom(); // 自動スクロール

    // 2秒後にエフェクト解除
    setTimeout(() => setLatestMessageId(null), 2000);
  };

  // ページネーション設定
  const MESSAGES_PER_PAGE = 30;

  // メッセージ件数を取得する関数
  const fetchMessageCount = useCallback(async () => {
    try {
      const messagesRef = collection(
        firestore,
        'chats',
        chatRoomId,
        'messages'
      );
      const snapshot = await getCountFromServer(messagesRef);
      const count = snapshot.data().count;

      console.log(
        '[src/components/messages/ChatRoomMessage.tsx] 📊 総メッセージ件数:',
        count
      );

      setTotalMessageCount(count);
      console.log(
        '[src/components/messages/ChatRoomMessage.tsx] 📊 総メッセージ件数(status):',
        totalMessageCount
      );

      return count;
    } catch (error) {
      console.error(
        '[src/components/messages/ChatRoomMessage.tsx] メッセージ件数取得エラー:',
        error
      );
      return 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]);

  // 🔽 最新のメッセージをリアルタイムで取得するリスナー（初回読み込み後）
  useEffect(() => {
    if (!chatRoomId) return;

    const messagesRef = collection(firestore, 'chats', chatRoomId, 'messages');
    const q = query(
      messagesRef,
      orderBy('created_at', 'desc'),
      limit(MESSAGES_PER_PAGE)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const realTimeMessages: ChatMessage[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          realTimeMessages.push({
            id: doc.id,
            created_at: data.created_at,
            updated_at: data.updated_at,
            image_url: data.image_url || [],
            is_deleted: data.is_deleted || false,
            last_read_at: data.last_read_at || {},
            sender_id: data.sender_id || '',
            text: data.text || '',
          });
        });

        // 古い順に並べて表示
        const sortedMessages = realTimeMessages.reverse();

        console.log(
          '[src/components/messages/ChatRoomMessage.tsx] 🔁 リアルタイム更新メッセージ:',
          sortedMessages
        );

        setMessages(sortedMessages);

        // 最後のドキュメントを更新（ページネーションに影響は与えない）
        if (querySnapshot.docs.length > 0) {
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }

        // まだメッセージがあるかを更新
        setHasMoreMessages(querySnapshot.docs.length === MESSAGES_PER_PAGE);
      }
    );

    return () => unsubscribe(); // クリーンアップ
  }, [chatRoomId]);

  // 過去のメッセージを追加で取得する関数（スクロール時用）
  const fetchMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMessages || !lastVisible) return;

    const container = messageBodyRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;
    const prevScrollTop = container?.scrollTop ?? 0;

    setIsLoadingMessages(true);
    setIsLoadingOlderMessages(true); // 過去のメッセージを読み込み中であることを示す
    setShouldAutoScroll(false); // 自動スクロールを無効にする

    try {
      const messagesRef = collection(
        firestore,
        'chats',
        chatRoomId,
        'messages'
      );
      const q = query(
        messagesRef,
        orderBy('created_at', 'desc'),
        startAfter(lastVisible),
        limit(MESSAGES_PER_PAGE)
      );

      const querySnapshot = await getDocs(q);
      const fetchedMessages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
          id: doc.id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          image_url: data.image_url || [],
          is_deleted: data.is_deleted || false,
          last_read_at: data.last_read_at || {},
          sender_id: data.sender_id || '',
          text: data.text || '',
        });
      });

      // 古い順に並び替え
      const sortedMessages = fetchedMessages.reverse();

      console.log(
        '[src/components/messages/ChatRoomMessage.tsx] 📨 追加取得したメッセージ:',
        sortedMessages
      );

      setMessages((prevMessages) => [...sortedMessages, ...prevMessages]);

      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      setHasMoreMessages(querySnapshot.docs.length === MESSAGES_PER_PAGE);

      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop =
            newScrollHeight - prevScrollHeight + prevScrollTop;
        }
      }, 0);
    } catch (error) {
      console.error(
        '[src/components/messages/ChatRoomMessage.tsx] 追加メッセージ取得エラー:',
        error
      );
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingOlderMessages(false);
    }
  };

  useEffect(() => {
    if (!chatRoomId) return;

    const runInitialFetch = async () => {
      try {
        const docRef = doc(firestore, 'chats', chatRoomId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const chatData = docSnap.data();
          setChatRoomData(chatData);

          const currentUid = currentUserProfile?.user_profile?.uid;
          const otherUserUid = chatData.members.find(
            (uid: string) => uid !== currentUid
          );
          setPartnerUid(otherUserUid);

          await fetchMessageCount();
        }
      } catch (error) {
        console.log('fetchMessages error:', error);
        setChatRoomData(null);
        window.location.href = '/message_chats';
      }
    };

    runInitialFetch();
  }, [chatRoomId, currentUserProfile, fetchMessageCount]);

  /**
   * /v1/get/member/uid/{uid}
   */
  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      setLoading(true);
      try {
        const response: AxiosResponse<{ data: MemberData }> = await axios.post(
          `${apiEndpoint}/v1/get/member/uid/${partnerUid}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (debug) {
          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:166] ❤️response.data:',
            response.data
          );
          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:170] ❤️response.data.data:',
            response.data.data
          );
        }

        setMember(response.data.data ?? null);
      } catch (error) {
        console.error('[MemberProfile] fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (partnerUid) {
      fetchMember();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, token, partnerUid]);

  /**
   * メッセージのツールチップを開く関数
   * @param messageId
   * @param chatRoomId
   * - メッセージの削除
   * @returns void
   */
  function messageTools(messageId: string) {
    setMessageToolOpenId((prevState) =>
      prevState === messageId ? null : messageId
    );
    console.log(
      `[src/components/messages/ChatRoomMessage.tsx] messageTool() called for messageId: ${messageId}`,
      [chatRoomId, messageId]
    );
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const toolsElement = document.querySelector('.message-tools');
      if (toolsElement && !toolsElement.contains(event.target as Node)) {
        setMessageToolOpenId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * メッセージを削除する関数
   * @param messageId 削除するメッセージのID
   */
  const handleDeleteMessage = async (messageId: string) => {
    console.log(
      '[src/components/messages/ChatRoomMessage.tsx] handleDeleteMessage() called',
      [messageId, chatRoomId]
    );
    try {
      await deleteDoc(
        doc(firestore, 'chats', chatRoomId, 'messages', messageId)
      );
      console.log(
        '[src/components/messages/ChatRoomMessage.tsx] Message deleted successfully'
      );
    } catch (error) {
      console.error(
        '[src/components/messages/ChatRoomMessage.tsx] Error deleting message:',
        error
      );
    }
  };

  /**
   *メッセージをレンダリングする関数
   * @param message メッセージレンダリング
   * @returns
   */
  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage =
      message.sender_id === currentUserProfile?.user_profile?.uid;
    const messageTime = message.created_at?.toDate
      ? message.created_at.toDate()
      : new Date();

    return (
      <li
        key={message.id}
        className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}
      >
        <div className="message-content">
          {/* <pre>{JSON.stringify(message, null, 2)}</pre> */}
          {/* メッセージ送信者によってデザインの振り分け */}
          <div className="message-text">{message.text}</div>
          {message.image_url && message.image_url.length > 0 && (
            <div className="message-images">
              {message.image_url.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="メッセージ画像"
                  className="message-image"
                />
              ))}
            </div>
          )}

          {/* 日時 */}
          <div className="message-time">
            {/* <pre>{JSON.stringify(messageTime, null, 2)}</pre> */}
            {messageTime.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}{' '}
            {messageTime.toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            <button
              className={`reaction-button message-tool-item ${isOwnMessage ? 'own-message-item' : 'other-message-item'}`}
              onClick={() => messageTools(message.id)}
            >
              <ThreeDotsVertical id={message.id} />
            </button>
            {messageToolOpenId === message.id && (
              <div className="message-tools">
                <ul className="message-tools-list">
                  <li
                    className="message-tools-item trash"
                    onClick={() => handleDeleteMessage(message.id)}
                  >
                    <Trash style={{ fontSize: '18px', cursor: 'pointer' }} />{' '}
                    送信取消
                  </li>
                  {/* <li className="message-tools-item">
                    <ReplyFill
                      style={{ fontSize: '20px', cursor: 'pointer' }}
                    />{' '}
                    リプライ
                  </li>
                  <li className="message-tools-item">
                    <BookmarkFill
                      style={{ fontSize: '15px', cursor: 'pointer' }}
                    />{' '}
                    Keepメモ
                  </li> */}
                </ul>
              </div>
            )}
          </div>
        </div>
      </li>
    );
  };

  // 自動スクロール処理を修正
  useEffect(() => {
    if (messages.length === 0 || isLoadingOlderMessages) return;

    // 新しいメッセージが投稿された場合、または初回読み込み時のみ自動スクロール
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll, isLoadingOlderMessages]);

  /**
   * 実装のベストプラクティス
   * チャットインターフェースは通常、メッセージページ（すべての送受信メッセージを含む）とメッセージ入
   * セクション（入力フィールドと送信ボタン）で構成されます Building a chat interface using
   * HTML and CSS - CSS Projects| Scaler Topics。
   *
   * 推奨事項：
   * Flexboxを使用した垂直レイアウトが最も柔軟で保守しやす
   * メッセージエリアにoverflow-y: autoを適用してスクロール可能にす
   * 入力エリアとヘッダーは固定高さ（flex: 0 0 auto）
   * レスポンシブデザインを考慮してmax-widthを設定
   * 仮想化（React VirtualizedやReact Windowなど）を検討して大量メッセージのパフォーマンスを向上
   * この設計により、LINE、WhatsApp、
   * Slackなどの主要チャットアプリケーションと同様のUXを実現できます。
   */
  return (
    <div className="chat-room-message" id={`${chatRoomId}`}>
      {loading && (
        <>
          <p>Loading...</p>
        </>
      )}
      {/* <pre>{JSON.stringify(chatRoomData, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(partnerUid, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(member, null, 2)}</pre> */}
      <div className="chat-room-message-header">
        <div className="back-button">
          <button
            className="btn btn btn-light"
            onClick={() => window.history.back()}
          >
            前のページへ戻る
          </button>
        </div>
        <div className="d-flex flex-row">
          <div className="avatar-area">
            {/* {member?.member?.profile_images} */}
            <Link to={`/member/${member?.member?.bcuid}`}>
              <img
                src={
                  member?.member?.profile_images
                    ? buildStorageUrl(
                        process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '',
                        member?.member?.profile_images,
                        '_small'
                      )
                    : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                }
                className="avatar-36"
                alt={member?.member?.nickname || 'Unknown User'}
              />
            </Link>
          </div>
          <div className="nickname-area">
            {member?.member?.nickname}{' '}
            <span className="bcuid">@{member?.member?.bcuid}</span>
          </div>
        </div>
      </div>
      <div
        className="chat-room-message-body"
        ref={messageBodyRef}
        style={{
          overflowY: 'scroll',
          maxHeight: 'calc(100vh - 170px)',
          scrollbarWidth: 'none', // For Firefox
          msOverflowStyle: 'none', // For IE and Edge
        }}
      >
        {/* Hide scrollbar for Webkit-based browsers */}
        <style>
          {`
        .chat-room-message-body::-webkit-scrollbar {
          display: none;
        }
          `}
        </style>
        {/* 過去のメッセージを読み込むボタン */}
        {hasMoreMessages && (
          <div className="load-more-messages text-center p-3">
            <button
              className="read-more-messages"
              onClick={fetchMoreMessages}
              disabled={isLoadingMessages}
            >
              {isLoadingMessages ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  読み込み中...
                </>
              ) : (
                'Read more messages'
              )}
            </button>
          </div>
        )}
        <ul className="message-list">{messages.map(renderMessage)}</ul>
        <div ref={messagesEndRef} />
        <p
          className=""
          style={{ color: '#c1c1c1', fontSize: '12px', textAlign: 'center' }}
        >
          これ以上のメッセージはありません
        </p>
        {isLoadingMessages && messages.length === 0 && (
          <div className="text-center p-3">
            <span className="spinner-border spinner-border-sm me-2" />
            メッセージを読み込み中...
          </div>
        )}
      </div>
      <div className="chat-room-message-footer">
        <div className="chat-input d-flex flex-column">
          <ChatInputTool
            chatRoomId={chatRoomId}
            partnerUid={partnerUid}
            currentUserProfile={currentUserProfile?.user_profile}
            chatRoomData={chatRoomData}
            onSendComplete={handleSendComplete}
          />
        </div>

        {latestMessageId}

        {/* meta info */}
        {/* <div className="accordion accordion-flush" id="accordionFlushExample">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                // data-bs-target="#flush-collapseOne"
                data-bs-target={`#${chatRoomId}`}
                aria-expanded="false"
                aria-controls={`#${chatRoomId}`}
              >
                ...
              </button>
            </h2>
            <div
              id={`#${chatRoomId}`}
              className="accordion-collapse collapse"
              data-bs-parent="#accordionFlushExample"
            >
              <div className="accordion-body">
                <div>chatRoomId: {chatRoomId}</div>
                <div>総メッセージ件数: {totalMessageCount}</div>
                <div>表示中メッセージ件数: {messages.length}</div>
                <div>
                  さらに読み込み可能: {hasMoreMessages ? 'はい' : 'いいえ'}
                </div>
                {latestMessageId && (
                  <>
                    <div>最新メッセージID: {latestMessageId}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div> */}
        {/* meta info end */}
      </div>
    </div>
  );
};
export default ChatRoomMessage;

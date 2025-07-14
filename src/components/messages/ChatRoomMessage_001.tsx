/** 711e23e7 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios, { AxiosResponse } from 'axios';
import { firestore } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  getDoc,
  getCountFromServer,
} from 'firebase/firestore';
import { ThreeDotsVertical, X, SendFill, Image } from 'react-bootstrap-icons';
import { buildStorageUrl } from '../../utility/GetUseImage';

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
  const [chatRoomData, setChatRoomData] = useState<any>(null);
  const [partnerUid, setPartnerUid] = useState<string>('');
  const { token, currentUserProfile } = useAuth();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT as string;
  const [loading, setLoading] = useState<boolean>(true);
  const [member, setMember] = useState<MemberData | null>(null);

  // メッセージ関連の状態
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [totalMessageCount, setTotalMessageCount] = useState<number>(0);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);

  // ページネーション設定
  const MESSAGES_PER_PAGE = 30;

  // メッセージ件数を取得する関数
  const fetchMessageCount = async () => {
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
      return count;
    } catch (error) {
      console.error(
        '[src/components/messages/ChatRoomMessage.tsx] メッセージ件数取得エラー:',
        error
      );
      return 0;
    }
  };

  // 最新のメッセージを取得する関数（初回読み込み用）
  const fetchLatestMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const messagesRef = collection(
        firestore,
        'chats',
        chatRoomId,
        'messages'
      );
      const q = query(
        messagesRef,
        orderBy('created_at', 'desc'), // 最新から古い順
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

      // 表示用に古い順に並び替え（チャットは古いメッセージが上、新しいメッセージが下）
      const sortedMessages = fetchedMessages.reverse();

      console.log(
        '[src/components/messages/ChatRoomMessage.tsx] 📨 取得したメッセージ:',
        sortedMessages
      );

      setMessages(sortedMessages);

      // 最後のドキュメントを保存（ページネーション用）
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      // まだメッセージがあるかどうかを判定
      setHasMoreMessages(querySnapshot.docs.length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error(
        '[src/components/messages/ChatRoomMessage.tsx] メッセージ取得エラー:',
        error
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // 過去のメッセージを追加で取得する関数（スクロール時用）
  const fetchMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMessages || !lastVisible) return;

    setIsLoadingMessages(true);
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

      // 既存のメッセージの前に追加
      setMessages((prevMessages) => [...sortedMessages, ...prevMessages]);

      // 最後のドキュメントを更新
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      // まだメッセージがあるかどうかを判定
      setHasMoreMessages(querySnapshot.docs.length === MESSAGES_PER_PAGE);
    } catch (error) {
      console.error(
        '[src/components/messages/ChatRoomMessage.tsx] 追加メッセージ取得エラー:',
        error
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!chatRoomId) return;

    const fetchMessages = async () => {
      try {
        /** chats */
        const docRef = doc(firestore, 'chats', chatRoomId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const chatData = docSnap.data();
          setChatRoomData(chatData);
          // 相手のUIDを取得
          const currentUid = currentUserProfile?.user_profile?.uid;
          const otherUserUid = chatData.members.find(
            (uid: string) => uid !== currentUid
          );

          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:41] 😑自分のUID:',
            currentUid
          );
          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:41] 😑相手のUID:',
            otherUserUid
          );
          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:41] chatData.members:✅',
            chatData.members
          );
          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:41] currentUserProfile?.user_profile?.uid:✅',
            currentUserProfile?.user_profile?.uid
          );
          // ここでchatDataを使用
          setPartnerUid(otherUserUid);

          // メッセージ件数を取得
          await fetchMessageCount();

          // 最新のメッセージを取得
          await fetchLatestMessages();
        } else {
          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:41] チャットが見つかりません⛔️'
          );
        }

        // /** message */
        // const messagesRef = collection(
        //   firestore,
        //   'chats',
        //   chatRoomId,
        //   'messages'
        // );
        // const messagesSnapshot = await getDocs(messagesRef);
        // messagesSnapshot.forEach((doc) => {
        //   console.log(
        //     `[src/components/messages/ChatRoomMessage.tsx:41] 😑 Document ID: ${doc.id}`
        //   );
        //   console.log(
        //     '[src/components/messages/ChatRoomMessage.tsx:41] 😑 Data:',
        //     doc.data()
        //   );
        // });
      } catch (error) {
        console.log(
          '[src/components/messages/ChatRoomMessage.tsx:31] ‼️ error:',
          error
        );
        setChatRoomData(null);
        window.location.href = '/message_chats';
      }
    };

    fetchMessages();
  }, [chatRoomId, currentUserProfile]);

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

  // メッセージをレンダリングする関数
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
          <div className="message-time">
            {messageTime.toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </li>
    );
  };

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

        {/* meta info */}
        <div className="accordion accordion-flush" id="accordionFlushExample">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapseOne"
                aria-expanded="false"
                aria-controls="flush-collapseOne"
              >
                ...
              </button>
            </h2>
            <div
              id="flush-collapseOne"
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
              </div>
            </div>
          </div>
        </div>
        {/* meta info end */}
      </div>
      <div
        className="chat-room-message-body"
        style={{
          overflowY: 'scroll',
          maxHeight: 'calc(100vh - 400px)',
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
              className="btn btn-outline-primary"
              onClick={fetchMoreMessages}
              disabled={isLoadingMessages}
            >
              {isLoadingMessages ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  読み込み中...
                </>
              ) : (
                '過去のメッセージを読み込む'
              )}
            </button>
          </div>
        )}
        <ul className="message-list">{messages.map(renderMessage)}</ul>

        {isLoadingMessages && messages.length === 0 && (
          <div className="text-center p-3">
            <span className="spinner-border spinner-border-sm me-2" />
            メッセージを読み込み中...
          </div>
        )}
      </div>
      <div className="chat-room-message-footer">
        <div className="chat-input d-flex flex-column">
          <div className="chat-input-textarea">
            <div className="image-preview-list d-flex mt-2">foo</div>
            <div className="text-count-alert">text count: 999</div>
            <textarea
              placeholder="メッセージを入力"
              rows={3}
              style={{
                width: '100%',
                fontSize: '16px',
                padding: '10px',
              }}
              maxLength={1500}
              value=""
              // onChange={(e) => setInputText(e.target.value)}
              // onInput={(e) => {
              //   const t = e.currentTarget as HTMLTextAreaElement;
              //   t.rows = Math.min(10, Math.max(3, t.scrollHeight / 20));
              // }}
            />
            <div className="d-flex justify-content-end mt-2">
              <button
                className="btn btn-primary bcmhzt-btn-gray mr10"
                // onClick={() => {
                //   const fi = document.createElement('input');
                //   fi.type = 'file';
                //   fi.multiple = true;
                //   fi.accept = 'image/*';
                //   fi.onchange = (e) => handleImageChange(e as any);
                //   fi.click();
                // }}
              >
                <Image style={{ cursor: 'pointer', color: '#fff' }} />
              </button>
              <button
                className="btn btn-primary bcmhzt-btn"
                // onClick={handleSend}
                // disabled={
                //   isSending || (!inputText.trim() && selectedFiles.length === 0)
                // }
              >
                {/* {isSending ? (
                  <span className="spinner-border spinner-border-sm text-white" />
                ) : (
                  <SendFill style={{ cursor: 'pointer', color: '#fff' }} />
                )} */}
                <SendFill style={{ cursor: 'pointer', color: '#fff' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatRoomMessage;

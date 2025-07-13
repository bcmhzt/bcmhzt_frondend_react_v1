/** 711e23e7 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios, { AxiosResponse } from 'axios';
import { firestore } from '../../firebaseConfig';
import {
  collection,
  // query,
  // where,
  // orderBy,
  // limit,
  doc,
  getDocs,
  // startAfter,
  // QueryDocumentSnapshot,
  getDoc,
} from 'firebase/firestore';
import { ThreeDotsVertical, X, SendFill, Image } from 'react-bootstrap-icons';

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

const ChatRoomMessage = ({ chatRoomId }: { chatRoomId: string }) => {
  const [chatRoomData, setChatRoomData] = useState<any>(null);
  const [partnerUid, setPartnerUid] = useState<string>('');
  const { token, currentUserProfile } = useAuth();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT as string;
  const [loading, setLoading] = useState<boolean>(true);
  const [member, setMember] = useState<MemberData | null>(null);

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
        } else {
          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:41] チャットが見つかりません⛔️'
          );
        }

        /** message */
        const messagesRef = collection(
          firestore,
          'chats',
          chatRoomId,
          'messages'
        );
        const messagesSnapshot = await getDocs(messagesRef);
        messagesSnapshot.forEach((doc) => {
          console.log(
            `[src/components/messages/ChatRoomMessage.tsx:41] 😑 Document ID: ${doc.id}`
          );
          console.log(
            '[src/components/messages/ChatRoomMessage.tsx:41] 😑 Data:',
            doc.data()
          );
        });
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

    fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, token, partnerUid]);

  return (
    <div className="chat-room-message" id={`${chatRoomId}`}>
      {loading && (
        <>
          <p>Loading...</p>
        </>
      )}
      <pre>{JSON.stringify(chatRoomData, null, 2)}</pre>
      <pre>{JSON.stringify(partnerUid, null, 2)}</pre>
      <pre>{JSON.stringify(member, null, 2)}</pre>
      <div className="chat-room-message-header">
        <div className="partner d-flex flex-row">
          <div className="avatar-area">
            <img
              src="/assets/images/dummy/dummy_avatar.png"
              alt="User Avatar"
              className="avatar-36"
            />
          </div>
        </div>
      </div>
      <div className="chat-room-message-content">
        ChatRoom: ChatRoomMessage {chatRoomId}
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatRoomMessage;

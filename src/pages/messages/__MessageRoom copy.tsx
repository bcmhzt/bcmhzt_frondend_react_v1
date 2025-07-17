/** c8031bb6 page */
// import { Link } from 'react-router-dom';
// import { buildStorageUrl } from '../../utility/GetUseImage';
// import Header from '../../components/Header';
// import Footer from '../../components/Footer';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import ChatRoomMessage from '../../components/messages/ChatRoomMessage';

/**
 * c8031bb6
 * ChatRoomMessageコンポーネントにchatRomIdを送信する
 *
 */
const MessageRoom = () => {
  const { chat_room_id } = useParams<{ chat_room_id: string }>();
  const [chatRoomData, setChatRoomData] = useState<any>(null);

  useEffect(() => {
    const fetchChatRoomData = async () => {
      if (!chat_room_id) return;

      const db = getFirestore();
      const chatRoomDocRef = doc(db, 'chats', chat_room_id);

      try {
        const chatRoomDoc = await getDoc(chatRoomDocRef);
        if (chatRoomDoc.exists()) {
          setChatRoomData(chatRoomDoc.data());
          console.log('Chat room data:', chatRoomData);
        } else {
          console.error('Chat room not found');
        }
      } catch (error) {
        console.error('Error fetching chat room data:', error);
      }
    };

    fetchChatRoomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat_room_id]);

  return (
    <div className="app-body">
      {/* <Header /> */}
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left-no-footer">
            {chat_room_id && <ChatRoomMessage chatRoomId={chat_room_id} />}
          </div>
          <div className="d-none d-md-block col-md-6 bc-right">
            <div
              style={{
                background: '#f1f1f1',
                height: '100%',
                padding: '20px',
              }}
            >
              広告エリア / サブエリア
            </div>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};
export default MessageRoom;

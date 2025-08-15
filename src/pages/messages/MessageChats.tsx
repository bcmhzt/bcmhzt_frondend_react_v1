/** a79a11d9 OK */
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import MessageChatsList from '../../components/messages/MessageChatsList';

/**
 * /message_chats
 * MessageChats
 * @returns
 */
const MessageChats = () => {
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            <h2 className="page-title mb20">Messages</h2>
            <div className="post-index-header d-flex justify-content-around mb20">
              <div className="pih-posts pih">
                <Link to="/message_chats_new">最新メッセージ</Link>
              </div>
              <div className="pih-posts pih active">
                <Link to="/message_chats">新規メッセージ</Link>
              </div>

              <div className="pih-posts pih">
                <Link to="/message_chats_bookmark">ブックマーク</Link>
              </div>
            </div>
            <MessageChatsList />
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
      <Footer />
    </div>
  );
};
export default MessageChats;

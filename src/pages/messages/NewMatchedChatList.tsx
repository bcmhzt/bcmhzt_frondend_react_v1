/** 9f5f1892 */
import Header from '../../components/Header';
import Footer from '../../components/Footer';
// import MessageList2 from '../../components/messages/MessageList2';
import NewMatchedChatListComponent from '../../components/messages/NewMatchedChatListComponent';
import { Link } from 'react-router-dom';

const NewMatchedChatList = () => {
  return (
    <>
      <div className="app-body">
        <Header />
        <div className="container bc-app">
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              <h2 className="page-title mb20">Messages2</h2>
              <div className="post-index-header d-flex justify-content-around mb20">
                <div className="pih-posts pih">
                  <Link to="/existing_chat_messages">最新メッセージ</Link>
                </div>
                <div className="pih-posts pih active">
                  <Link to="/new_matched_chat_messages">メッセージルーム</Link>
                </div>

                <div className="pih-posts pih">
                  <Link to="/message_bookmark">ブックマーク</Link>
                </div>
              </div>
              <NewMatchedChatListComponent />
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
    </>
  );
};
export default NewMatchedChatList;

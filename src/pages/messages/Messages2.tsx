/** b74cec9b */
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MessageList2 from '../../components/messages/MessageList2';

const Messages2 = () => {
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            <h2 className="page-title mb20">Messages2</h2>
            <MessageList2 />
          </div>
          <div className="d-none d-md-block col-md-6 bc-right">
            <div
              style={{ background: '#f1f1f1', height: '100%', padding: '20px' }}
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
export default Messages2;

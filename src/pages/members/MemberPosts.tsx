/** 8c6ddb87 */
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MemberPostList from '../../components/members/MemberPostList';
// src/components/members/MemberPostList.tsx

// MemberPosts

const MemberPosts = () => {
  const bcuid = useParams<{ bcuid: string }>().bcuid;

  return (
    <>
      <div className="app-body">
        <Header />
        <div className="container bc-app">
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              <MemberPostList bcuid={bcuid} />
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
export default MemberPosts;

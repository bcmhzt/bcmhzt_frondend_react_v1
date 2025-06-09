import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
// import PostDetailSection from '../../components/posts/PostDetailSection';
// src/components/posts/PostDetailCard.tsx
import PostDetailCard from '../../components/posts/PostDetailCard';

/** 84e033cb */
const PostDetail = () => {
  const { post_id } = useParams<{ post_id: string }>();
  return (
    <>
      <div className="app-body">
        <Header />
        <div className="container bc-app">
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              <PostDetailCard id={post_id} />
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
export default PostDetail;

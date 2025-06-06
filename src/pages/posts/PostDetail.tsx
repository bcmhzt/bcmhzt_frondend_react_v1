import { useParams } from 'react-router-dom';

/** 84e033cb */
const PostDetail = () => {
  const { post_id } = useParams<{ post_id: string }>();
  return <>PostDetail: {post_id}</>;
};
export default PostDetail;

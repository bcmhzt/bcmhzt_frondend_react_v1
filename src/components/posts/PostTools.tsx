/** f8656bc2 */
import React, { useState, useEffect } from 'react';
import {
  ThreeDotsVertical,
  FlagFill,
  Link,
  PersonFill,
  Ban,
  Trash,
  CardText,
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useMessage } from '../../contexts/MessageContext';
import { LoadingOverlay } from '../../components/LoadingOverlay';

interface PostToolsProps {
  postId: number;
  postUid?: string;
}

const PostTools: React.FC<PostToolsProps> = ({ postId, postUid }) => {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUserProfile, token } = useAuth();
  const modalId = `postToolsModal-${postId}`;
  const { showMessage } = useMessage();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;

  useEffect(() => {
    axios
      .post(`${apiEndpoint}/v1/delete/post/${postId}`, { post_id: postId })
      .then((response) => {
        console.log(
          '[src/components/posts/PostTools.tsx:32] API response:',
          response.data
        );
      })
      .catch((error) => {
        console.error(
          '[src/components/posts/PostTools.tsx:40] API error:',
          error
        );
      });
  });

  async function handleDeletePost() {
    // console.log('[src/components/posts/PostTools.tsx:46] postId:', postId);
    if (window.confirm('この投稿を削除してもよろしいですか？')) {
      console.log('[src/components/posts/PostTools.tsx:48] postId:', postId);
      console.log('[src/components/posts/PostTools.tsx:49] token:', token);
      console.log(
        '[src/components/posts/PostTools.tsx:50] apiEndpoint:',
        apiEndpoint
      );
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${apiEndpoint}/v1/delete/post/${postId}`,
          { post_id: postId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        console.log(
          '[src/components/posts/PostTools.tsx:52] API response:',
          response.data
        );
        showMessage(
          'POST No.' + postId + 'は、削除されました。',
          'success',
          3000
        );
        setShow(false);
      } catch (error) {
        console.error(
          '[src/components/posts/PostTools.tsx:62] API error:',
          error
        );
        console.log(
          '[src/components/posts/PostTools.tsx:65] API error: unexpected error'
        );
        showMessage('POSTの削除に失敗しました。', 'error');
        setShow(false);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
      console.log('[src/components/posts/PostTools.tsx:60] API error ??:');
      // axios
      //   .post(`${apiEndpoint}/v1/delete/post/${postId}`, { post_id: postId })
      //   .then((response) => {
      //     console.log(
      //       '[src/components/posts/PostTools.tsx:52] API response:',
      //       response.data
      //     );
      //     showMessage('POSTが削除されました。', 'success', 3000);
      //     setShow(false);
      //   })
      //   .catch((error) => {
      //     console.error(
      //       '[src/components/posts/PostTools.tsx:60] API error:',
      //       error
      //     );
      //     showMessage('POSTの削除に失敗しました。', 'error');
      //     setShow(false);
      //   });
    }
  }

  // () => {
  //   if (window.confirm('この投稿を削除してもよろしいですか？')) {
  //     axios
  //       .delete(`/api/posts/${postId}`)
  //       .then(() => {
  //         alert('投稿が削除されました');
  //         setShow(false);
  //         // Optional: Add logic to refresh or update the UI
  //       })
  //       .catch((error) => {
  //         console.error('投稿の削除中にエラーが発生しました:', error);
  //         alert('投稿の削除に失敗しました');
  //       });
  //   }
  // };

  return (
    <>
      {/* <LoadingOverlay /> */}

      {isLoading && <LoadingOverlay />}
      <ThreeDotsVertical
        style={{ fontSize: '20px', cursor: 'pointer' }}
        onClick={() => setShow(true)}
      />

      {show && (
        <div
          className="modal fade show"
          id={modalId}
          style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          aria-labelledby={`${modalId}Label`}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShow(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div
                className="modal-body ml10 mt10 mb10"
                style={{ fontSize: '16px' }}
              >
                {/* <pre>{JSON.stringify(isLoading, null, 2)}</pre> */}
                <div className="mb10" style={{ cursor: 'pointer' }}>
                  通報する{' '}
                  <FlagFill style={{ fontSize: '18px', color: '#555' }} />
                </div>
                <div className="mb10" style={{ cursor: 'pointer' }}>
                  この投稿のURLを取得する{' '}
                  <Link style={{ fontSize: '18px', color: '#555' }} />{' '}
                </div>
                <div className="mb10" style={{ cursor: 'pointer' }}>
                  投稿者をコピーする{' '}
                  <PersonFill
                    style={{ fontSize: '18px', color: '#555' }}
                  />{' '}
                </div>

                {/* <div className="mb10" style={{ cursor: 'pointer' }}>
                  ブロックする{' '}
                  <Ban style={{ fontSize: '18px', color: '#555' }} />{' '}
                </div> */}
                {/* <pre>{JSON.stringify(postUid, null, 2)}</pre>
                <pre>
                  {JSON.stringify(currentUserProfile.user_profile.uid, null, 2)}
                </pre> */}
                {postUid === currentUserProfile.user_profile.uid && (
                  <>
                    <hr />
                    <div className="mb10" style={{ cursor: 'pointer' }}>
                      この投稿を編集する{' '}
                      <CardText
                        style={{ fontSize: '18px', color: '#555' }}
                      />{' '}
                    </div>
                    <div
                      className="mb10"
                      style={{ cursor: 'pointer', color: '#880000' }}
                      onClick={handleDeletePost}
                    >
                      この投稿を削除する{' '}
                      <Trash
                        style={{ fontSize: '18px', color: '#880000' }}
                      />{' '}
                    </div>

                    {isLoading && (
                      <div className="alert alert-danger" role="alert">
                        削除中...
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShow(false)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostTools;

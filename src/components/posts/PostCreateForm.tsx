import React, { useState } from 'react';
import { PlusCircleFill, Image, XCircleFill } from 'react-bootstrap-icons';
import { Spinner } from 'react-bootstrap';
import { usePostImageUploader } from '../../utility/usePostImageUploader';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/posts/PostCreateForm.tsx:xx] debug:', debug);
}

interface PostCreateFormProps {
  onPostSuccess: (newPost: any) => void;
  onPostError?: (error: any) => void;
}

const PostCreateForm: React.FC<PostCreateFormProps> = ({
  onPostSuccess,
  onPostError,
}) => {
  const [open, setOpen] = useState(false);
  const [post, setPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [postError, setPostError] = useState<string>('');
  const { showMessage } = useMessage();

  // 認証情報
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

  const {
    files: images,
    addFiles,
    removeFile,
    uploadAll,
    uploadProgress,
  } = usePostImageUploader({ baseDir: 'uploads', limit: 10 });

  const handleShow = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setPost('');
    addFiles([]);
    setPostError('');
    // 画像リセットは必要に応じて
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handleRemoveImage = removeFile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.trim() && images.length === 0) return;
    setIsLoading(true);
    setPostError('');

    try {
      // ① 画像を Storage へ
      const uploadedUrls = await uploadAll();
      if (debug === 'true') {
        console.log('[PostCreateForm] uploadedUrls:', uploadedUrls);
      }

      // ② バックエンドへ投稿 API
      if (!currentUser || !currentUser.uid) {
        throw new Error('認証情報がありません');
      }
      const accessToken = await currentUser.getIdToken();
      const formData = new FormData();
      formData.append('uid', currentUser.uid);
      formData.append('post', post);
      uploadedUrls.forEach((url: string, i: number) =>
        formData.append(`post_images[${i}]`, url)
      );

      const res = await axios.post(
        `${apiEndpoint}/post/${currentUser.uid}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (debug === 'true') {
        console.log('[PostCreateForm] axios response:', res);
      }

      if (res.status === 201) {
        const saved = res.data.data;
        onPostSuccess(saved);
        setPost('');
        addFiles([]);
        handleClose();
        showMessage('POSTが投稿されました。', 'success', 3000); // 必要なら
      } else {
        throw new Error('投稿に失敗しました');
      }
    } catch (err) {
      console.error(err);
      setPostError('致命的なエラーが発生しました');
      if (onPostError) onPostError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="post-create-form">
        <div
          className="post-create-form-add-btn"
          onClick={handleShow}
          style={{ cursor: 'pointer' }}
        >
          <PlusCircleFill style={{ fontSize: '36px' }} />
        </div>
      </div>
      {open && (
        <div
          className="modal fade show"
          tabIndex={-1}
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">新規投稿</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleClose}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="投稿内容を入力"
                    value={post}
                    onChange={(e) => setPost(e.target.value)}
                  />
                  {postError && (
                    <div className="text-danger mt-2">{postError}</div>
                  )}
                  {/* 画像アップロードUI */}
                  <div className="uploads mt10">
                    <input
                      type="file"
                      accept="image/*"
                      id="imageUpload"
                      hidden
                      multiple
                      onChange={handleImageChange}
                    />
                    <label htmlFor="imageUpload" style={{ cursor: 'pointer' }}>
                      <Image size={30} />
                    </label>
                    <div className="image-thumbnails mt10 d-flex flex-wrap">
                      {images.map((file: File, idx: number) => (
                        <div
                          key={idx}
                          className="thumbnail-container me-2"
                          style={{ position: 'relative' }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt="thumb"
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover', borderRadius: 5 }}
                          />
                          <XCircleFill
                            className="position-absolute"
                            style={{ top: -5, right: -5, cursor: 'pointer' }}
                            onClick={() => handleRemoveImage(idx)}
                          />
                          {uploadProgress[idx] != null &&
                            uploadProgress[idx] < 100 && (
                              <p className="small mb-0">
                                {uploadProgress[idx]}%
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleClose}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        (!post.trim() && images.length === 0) || isLoading
                      }
                    >
                      {isLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        '投稿'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCreateForm;

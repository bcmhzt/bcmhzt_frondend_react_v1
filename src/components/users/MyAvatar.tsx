/** 9f5e8c15 */
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { XLg } from 'react-bootstrap-icons';
import { Spinner } from 'react-bootstrap';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Image } from 'react-bootstrap-icons';
// import { storage } from '../../firebaseConfig';
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getImageWithSuffix } from '../../utility/GetUseImage';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/users/MyAvatar.tsx:13] debug:', debug);
}

const MyAvatar = () => {
  /* update modal */
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => {
    console.log('modal');
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  /* user information */
  const { currentUser, myProfileImage } = useAuth();
  if (debug === 'true') {
    console.log('myProfileImage [MyAvatar 01]:', myProfileImage);
    console.log(
      'currentUser [MyAvatar 02]:',
      JSON.stringify(currentUser, null, 2)
    );
  }

  /**
   * avavar image
   * prepaire to upload avatar image
   */
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState(
    myProfileImage || '/assets/images/dummy/dummy_avatar.png'
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarUrl, setUploadedURL] = useState<string | null>(null);
  const [showCancelButton, setShowCancelButton] = useState(false);

  interface ImageChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleImageChange = (e: ImageChangeEvent): void => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      setAvatar(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setShowCancelButton(true);
    }
  };

  /* Drag over / leave */
  const [isDragging, setIsDragging] = useState(false);
  interface DragEventHandler {
    (e: React.DragEvent<HTMLDivElement>): void;
  }

  const handleDragOver: DragEventHandler = (e) => {
    e.preventDefault();

    setIsDragging(true);
    if (debug === 'true') {
      console.log('isDragging:' + isDragging);
    }
  };
  const handleDragLeave = () => {
    setIsDragging(false);
    if (debug === 'true') {
      console.log('isDragging:' + isDragging);
    }
  };
  /* Add images by drag & drop */
  interface DropEventHandler {
    (e: React.DragEvent<HTMLDivElement>): void;
  }

  const handleDrop: DropEventHandler = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadedURL(null);
    setUploadProgress(0);
    console.log('isDragging:' + isDragging);

    const droppedFile: File = e.dataTransfer.files[0];
    if (droppedFile) {
      setAvatar(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setShowCancelButton(true);
    }
  };

  // アップロード取りやめ処理（プレビューを削除し、元の画像に戻す）
  const handleCancelUpload = () => {
    setAvatar(null);
    setPreview(myProfileImage || '/assets/images/dummy/dummy_avatar.png');
    setShowCancelButton(false);
  };

  /**
   * Profile avatr upload
   * 1. Firebase Storage にアップロードする
   * 2. Firestore にアップロードした画像のURLを保存する
   *
   * @returns
   */
  const uploadImageToFirebase = async () => {
    if (!avatar) return;

    /* ここで画像の圧縮とフォーマットを軽目の画像に変換したい */
    let fileExtension = avatar.name.split('.').pop() || '';
    if (['jpeg', 'jpg', 'JPEG', 'JPG'].includes(fileExtension)) {
      fileExtension = 'jpg';
    } else if (['png'].includes(fileExtension)) {
      fileExtension = 'png';
    }
    if (debug === 'true') {
      console.log('fileExtension:' + fileExtension);
      console.log('currentUser:', currentUser ? currentUser.uid : null);
    }

    /* make upload image file name */
    if (!currentUser || !currentUser.uid) {
      console.error('No currentUser or uid found.');
      return;
    }
    const renamedFileName = currentUser.uid + '.' + fileExtension;
    // console.log('renamedFileName:', renamedFileName);
    /* upload image file to Firebase Storage */
    const storageRef = ref(
      storage,
      `profiles/${currentUser.uid}/${renamedFileName}`
    );
    const uploadTask = uploadBytesResumable(storageRef, avatar);
    try {
      /* 画像のアップロードが完了するのを待機 */
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload failed:', error);
            reject(error);
          },
          () => {
            resolve(undefined);
          }
        );
      });
      const avatarUrl = await getDownloadURL(uploadTask.snapshot.ref);
      setUploadedURL(avatarUrl);
      console.log('Uploaded URL:', avatarUrl);

      /* ここで Firestore にアップロードした画像のURLを保存する */
      // Get the ID token from Firebase Auth user
      const token = currentUser.getIdToken
        ? await currentUser.getIdToken()
        : '';
      console.log('token', token);
      console.log('api:', process.env.REACT_APP_API_ENDPOINT);
      await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/user/update/profileimage/${currentUser.uid}`,
        {
          image_path: `profiles%2F${currentUser.uid}%2F${renamedFileName}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(
        '[src/components/users/MyAvatar.tsx:198] profileImage2:',
        myProfileImage
      );
      const avavarImage = getImageWithSuffix(myProfileImage ?? '', '_large');
      console.log(
        '[src/components/users/MyAvatar.tsx:200] new profileImage2:',
        avavarImage
      );
    } catch (error) {}

    console.log('uploadImageToFirebase');
  };

  return (
    <>
      <div className="avatar-area">
        <img
          src={myProfileImage || '/assets/images/dummy/dummy_avatar.png'}
          className="user-avatar mr30"
          alt="uid"
          onClick={handleShowModal}
          style={{ cursor: 'pointer' }}
        />
        <div className="edit-avatar" onClick={handleShowModal}>
          画像を変更
        </div>
      </div>

      {showModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content avatar-update">
              <div className="modal-header">
                <span onClick={handleCloseModal} className="mr20">
                  <XLg style={{ fontSize: '23px', cursor: 'pointer' }} />
                </span>{' '}
                プロフィール画像を変更
              </div>
              <div className="modal-body avatar-update-body">
                <div className="my-avatar">
                  <img src={preview} className="user-avatar" alt="uid" />
                  {showCancelButton && (
                    <div className="cancel" onClick={handleCancelUpload}>
                      <XLg style={{ fontSize: '17px', cursor: 'pointer' }} />
                      取り消す
                    </div>
                  )}
                </div>
                <div
                  className="uploads mt10"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  style={{
                    border: '1px dashed #ccc',
                    height: '145px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? '#f5f5f5' : '#fff',
                    borderColor: isDragging ? '#000' : '#a9a9a9',
                  }}
                >
                  <p>Drag & Drop</p>

                  {uploadProgress > 0 && !avatarUrl && (
                    <div>
                      <Spinner animation="border" size="sm" /> {uploadProgress}%
                    </div>
                  )}
                  {avatarUrl && <p>Complete</p>}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="imageUpload"
                    multiple
                  />
                  <label htmlFor="imageUpload">
                    <Image
                      style={{
                        fontSize: '30px',
                        cursor: 'pointer',
                        color: '#000',
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                {uploadProgress > 0 && !avatarUrl ? (
                  <button className="btn btn-secondary bcmhzt-btn" disabled>
                    <Spinner animation="border" size="sm" /> アップロード中...
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary bcmhzt-btn"
                    onClick={uploadImageToFirebase}
                    disabled={!avatar}
                  >
                    プロフィール画像を変更する
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
              <div
                className="text-end mr10 ml10 mb10"
                style={{ fontSize: '12px', color: '#888' }}
              >
                ブラウザーキャッシュが強い場合があります。
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default MyAvatar;

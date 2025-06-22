import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { storage as firebaseStorage } from '../../firebaseConfig';

interface OpenTalk {
  id: string;
  uid: string;
  bcuid: string;
  nickname: string;
  text: string;
  profile_images: string;
  deleted: boolean;
  createdAt: any; // Timestamp型でもOK
  images?:
    | {
        path: string;
        size: number;
        name: string;
      }[]
    | undefined;
}

interface OpenTalksChatCardProps {
  talk: OpenTalk;
}

const OpenTalksChatCard: React.FC<OpenTalksChatCardProps> = ({ talk }) => {
  const { currentUserProfile } = useAuth();
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;
  console.log(
    '[src/components/open_talks/OpenTalksChatCard.tsx:32] storage:',
    storageUrl
  );
  const [imageStatus, setImageStatus] = useState<{
    [key: string]: 'loading' | 'success' | 'error';
  }>({});
  const [imageSrcs, setImageSrcs] = useState<{ [key: string]: string }>({});
  const [openTalks, setOpenTalks] = useState<OpenTalk[]>([]);

  // 画像URLの初期セット
  useEffect(() => {
    if (talk.images) {
      const newSrcs: { [key: string]: string } = {};
      talk.images.forEach((image, idx) => {
        const imgKey = `${talk.id}_${idx}`;
        newSrcs[imgKey] = buildStorageUrl(storageUrl, image.path, '_medium');
      });
      setImageSrcs(newSrcs);
    }
  }, [talk, storageUrl]);

  const handleImageLoad = (imgKey: string, image: any) => {
    setImageStatus((prev) => ({
      ...prev,
      [imgKey]: 'success',
    }));
    setImageSrcs((prev) => ({
      ...prev,
      [imgKey]: buildStorageUrl(storageUrl ?? '', image.path, '_medium'),
    }));
  };

  const handleImageError = (imgKey: string, image: any) => {
    setImageStatus((prev) => ({
      ...prev,
      [imgKey]: 'error',
    }));
    setTimeout(() => {
      setImageStatus((prev) => ({
        ...prev,
        [imgKey]: 'loading',
      }));
      setImageSrcs((prev) => ({
        ...prev,
        [imgKey]: `${buildStorageUrl(storageUrl ?? '', image.path, '_medium')}&t=${Date.now()}`,
      }));
    }, 3000);
  };

  /**
   * self block
   * @param talk
   * @returns
   */
  function selfBlock(talk: OpenTalk) {
    const date = talk.createdAt ? talk.createdAt.toDate() : null;
    return (
      <div className="self-block" style={{ width: '90%', marginLeft: 'auto' }}>
        <div className="d-flex flex-row align-items-center justify-content-end">
          {/* メッセージ */}
          {talk.text && (
            <>
              <div className="message-text">{talk.text}</div>
            </>
          )}
          {/* プロフィールイメージ */}
          <div className="align-self-start avatar-container">
            <img
              src={buildStorageUrl(
                storageUrl,
                talk.profile_images ?? '',
                '_thumbnail'
              )}
              alt={talk.nickname}
              className="avatar-36"
            />
          </div>
        </div>
        {/* 投稿画像 */}
        <div className="images">
          {talk.images?.map((image, idx) => {
            const imgKey = `${talk.id}_${idx}`;
            const status = imageStatus[imgKey] || 'loading';
            const dummyImage = '/assets/dummy/image_larage_dummy.png';
            return (
              <div
                key={imgKey}
                className="image-container"
                style={{
                  width: '100%',
                  height: status === 'success' ? 'auto' : '300px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#eee',
                  borderRadius: 8,
                }}
              >
                <div className="image-container">
                  <img
                    src={status === 'error' ? dummyImage : imageSrcs[imgKey]}
                    // src={dummyImage}
                    alt={image.name}
                    className="image-preview"
                    style={{
                      width: '100%',
                      height: status === 'success' ? 'auto' : '100%',
                      objectFit: status === 'success' ? 'contain' : 'cover',
                      display: 'block',
                      transition: 'opacity 0.3s',
                      opacity: status === 'success' ? 1 : 0.5,
                    }}
                    onLoad={() => handleImageLoad(imgKey, image)}
                    onError={() => handleImageError(imgKey, image)}
                  />

                  {/* 成功時以外はダミーやローディングUIを重ねる */}
                  {status !== 'success' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#888',
                        fontWeight: 'bold',
                        background: 'rgba(255,255,255,0.5)',
                      }}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 投稿日時 */}
        {date && (
          <div className="timestamp text-end">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  }

  function otherBlock(talk: OpenTalk) {
    return (
      <div className="other-block">
        other
        <span>{talk.nickname}</span>
        <span>{talk.text}</span>
      </div>
    );
  }

  return (
    <div className="open-talks-chat-card">
      {/* <pre>{JSON.stringify(currentUserProfile.user_profile.uid, null, 2)}</pre>
      <pre>{JSON.stringify(talk.uid, null, 2)}</pre> */}
      {talk.uid === currentUserProfile.user_profile.uid ? (
        <>{selfBlock(talk)}</>
      ) : (
        <>{otherBlock(talk)}</>
      )}
    </div>
  );
};

export default OpenTalksChatCard;

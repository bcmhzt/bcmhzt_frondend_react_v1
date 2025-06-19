/** bfe3a60e */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useInfiniteQuery } from '@tanstack/react-query';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { formatFirestoreTimestamp } from '../../utility/GetCommonFunctions';
import { Images } from 'react-bootstrap-icons';
import { storage as firebaseStorage } from '../../firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';

const DOCS_PER_PAGE = 10;

interface OpenTalkImage {
  path: string;
  size: number;
  name: string;
}

interface OpenTalk {
  id: string;
  uid: string;
  bcuid: string;
  nickname: string;
  text: string;
  profile_images: string;
  deleted: boolean;
  createdAt: Timestamp | null;
  images?: OpenTalkImage[];
}

const fetchOpenTalks = async ({
  pageParam,
}: {
  pageParam?: any;
}): Promise<{ docs: OpenTalk[]; lastDoc: any; hasMore: boolean }> => {
  let q;
  if (pageParam) {
    q = query(
      collection(firestore, 'openTalks'),
      orderBy('createdAt', 'desc'),
      startAfter(pageParam),
      limit(DOCS_PER_PAGE)
    );
  } else {
    q = query(
      collection(firestore, 'openTalks'),
      orderBy('createdAt', 'desc'),
      limit(DOCS_PER_PAGE)
    );
  }
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as OpenTalk[];
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
  return { docs, lastDoc, hasMore: snapshot.docs.length === DOCS_PER_PAGE };
};

const DevFirestoreSnapshot: React.FC = () => {
  const { currentUserProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const storage = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;

  // useInfiniteQuery
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['openTalks'],
    queryFn: fetchOpenTalks,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    refetchOnWindowFocus: false,
  });

  // Intersection ObserverでfetchNextPage
  useEffect(() => {
    if (!observerTarget.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 画像選択
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  // 画像選択ボタン
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // プレビュー画像削除
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 投稿
  async function handleSubmit(message: string) {
    try {
      if (!message.trim() && selectedImages.length === 0) return;

      // 画像データの準備
      const now = Date.now();
      const imageData = selectedImages.map((file) => ({
        path: `open_talks%2F${currentUserProfile.user_profile.uid}%2F${now}_${file.name}`,
        size: file.size,
        name: file.name,
      }));

      // Firestoreにドキュメントを追加
      const docRef = await addDoc(collection(firestore, 'openTalks'), {
        uid: currentUserProfile.user_profile.uid,
        bcuid: currentUserProfile.user_profile.bcuid,
        nickname: currentUserProfile.user_profile.nickname,
        profile_images: currentUserProfile.user_profile.profile_images,
        text: message,
        deleted: false,
        createdAt: serverTimestamp(),
        images: imageData,
      });

      // 画像のアップロード
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map((file, index) =>
          uploadImage(file, imageData[index].path)
        );
        await Promise.all(uploadPromises);
      }

      // 状態をリセット
      setMessage('');
      setSelectedImages([]);
      setPreviewUrls([]);

      // 投稿後にリロード
      refetch();
    } catch (error) {
      console.error('[DevFirestoreSnapshot] Error:', error);
    }
  }

  // 画像アップロード
  const uploadImage = async (file: File, path: string) => {
    try {
      const decodedPath = decodeURIComponent(path);
      const storageRef = ref(firebaseStorage, decodedPath);
      await uploadBytes(storageRef, file);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // プレビューURLの解放
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // 投稿一覧
  const talks: OpenTalk[] = data?.pages.flatMap((page) => page.docs) ?? [];

  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            <h2 className="page-title mb20">Open Talk</h2>
            {isLoading && <>Loading...</>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(message);
              }}
            >
              <div className="d-flex align-items-center">
                <Link to={`/member/${currentUserProfile.user_profile.bcuid}`}>
                  <img
                    src={
                      buildStorageUrl(
                        storage ?? '',
                        currentUserProfile.user_profile.profile_images ?? '',
                        '_thumbnail'
                      ) || '/assets/images/dummy/dummy_avatar.png'
                    }
                    className="avatar-36"
                    alt="foobar"
                  />
                </Link>
                <input
                  type="text"
                  className="form-control me-2"
                  id="openTalkMessage"
                  placeholder="今、何をしてますか？"
                  aria-label="Open Talk Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />
                <button
                  className="btn btn-primary bcmhzt-btn mr10"
                  type="button"
                  onClick={handleImageButtonClick}
                >
                  <Images style={{ fontSize: '20px' }} />
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isLoading}
                >
                  投稿
                </button>
              </div>
              {/* 画像プレビューエリア */}
              {previewUrls.length > 0 && (
                <div className="selected-images my-2">
                  <div className="d-flex flex-wrap gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="position-relative">
                        <img
                          src={url}
                          alt={`選択された画像 ${index + 1}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0"
                          onClick={() => handleRemoveImage(index)}
                          style={{ padding: '2px 6px' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
            {/* 投稿一覧 */}
            <div className="talk-list mt-4">
              {talks.map((talk) => (
                <div key={talk.id} className="talk-item mb-3">
                  <div className="d-flex align-items-center mb-1">
                    <img
                      src={
                        buildStorageUrl(
                          storage ?? '',
                          talk.profile_images ?? '',
                          '_thumbnail'
                        ) || '/assets/images/dummy/dummy_avatar.png'
                      }
                      className="avatar-36 me-2"
                      alt="avatar"
                    />
                    <div>
                      <span className="fw-bold">{talk.nickname}</span>
                      <span className="text-muted ms-2">{talk.bcuid}</span>
                      <br />
                      <small className="text-muted">
                        {talk.createdAt
                          ? formatFirestoreTimestamp(talk.createdAt)
                          : '送信中...'}
                      </small>
                    </div>
                  </div>
                  <div className="mb-2">{talk.text}</div>
                  {/* 画像表示 */}
                  {talk.images &&
                    talk.images.map((image, index) => (
                      <div key={index} className="image-container mb-2">
                        <img
                          src={buildStorageUrl(
                            storage ?? '',
                            image.path,
                            '_medium'
                          )}
                          alt={`投稿画像 ${index + 1}`}
                          style={{
                            maxWidth: '100%',
                            borderRadius: '4px',
                            display: 'block',
                          }}
                          loading="lazy"
                        />
                      </div>
                    ))}
                </div>
              ))}
              {/* 無限スクロール用ターゲット */}
              <div ref={observerTarget} style={{ height: '20px' }}>
                {isFetchingNextPage && (
                  <div className="text-center">
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
              {!hasNextPage && talks.length > 0 && (
                <div className="text-center text-muted my-3">
                  これ以上のメッセージはありません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DevFirestoreSnapshot;

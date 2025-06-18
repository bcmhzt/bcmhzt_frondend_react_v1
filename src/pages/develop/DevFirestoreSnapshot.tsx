/** bfe3a60e */
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebaseConfig';
import {
  collection,
  /* input */
  addDoc,
  serverTimestamp,
  /* select */
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  /* pagenation */
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { formatFirestoreTimestamp } from '../../utility/GetCommonFunctions';
import { Images } from 'react-bootstrap-icons';
import { storage as firebaseStorage } from '../../firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/develop/DevFirestoreSnapshot.tsx:xx] debug:', debug);
}

/* select用のインターフェイス */
interface OpenTalk {
  id: string;
  uid: string;
  bcuid: string;
  nickname: string;
  text: string;
  profile_images: string;
  deleted: boolean;
  createdAt: Timestamp;
  images?: {
    path: string;
    size: number;
    name: string;
  }[];
}

/**
 *
 * @returns
 */
const DevFirestoreSnapshot = () => {
  const [message, setMessage] = useState('');
  const { currentUserProfile } = useAuth();
  const storage = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;
  /* select用のステート */
  const [openTalks, setOpenTalks] = useState<OpenTalk[]>([]);
  const [loading, setLoading] = useState(true);
  /* 無限スクロール */
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const DOCS_PER_PAGE = 100;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  // const storage = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL; // URL用

  /* 追加データ取得 */
  const fetchMoreData = useCallback(async () => {
    if (!hasMore || isLoadingMore || !lastDoc) return;

    setIsLoadingMore(true);
    try {
      const q = query(
        collection(firestore, 'openTalks'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(DOCS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const newTalks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OpenTalk[];

      setOpenTalks((prev) => [...prev, ...newTalks]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === DOCS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching more data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, lastDoc, DOCS_PER_PAGE]);

  /* 初期データ取得 */
  useEffect(() => {
    setLoading(true);

    // クエリの設定
    const q = query(
      collection(firestore, 'openTalks'),
      orderBy('createdAt', 'desc'),
      limit(DOCS_PER_PAGE)
    );

    // リアルタイムリスナーの設定
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const talks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as OpenTalk[];

        setOpenTalks(talks);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === DOCS_PER_PAGE);
        setLoading(false);
      } catch (error) {
        console.error('Error in realtime listener:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* Intersection Observer */
  useEffect(() => {
    const currentObserverTarget = observerTarget.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchMoreData();
        }
      },
      { threshold: 0.5 }
    );

    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [hasMore, isLoadingMore, fetchMoreData]);

  useEffect(() => {
    return () => {
      // コンポーネントのアンマウント時にプレビューURLを解放
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // 画像選択ハンドラー
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // ファイルサイズと形式のバリデーション
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(
        file.type
      );
      return isValidSize && isValidType;
    });

    // プレビューURL生成
    const urls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
    setSelectedImages((prev) => [...prev, ...validFiles]);
  };

  // 画像選択ボタンクリックハンドラー
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // プレビュー画像削除
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * 入力ルーティンはこれな！handleSubmitを参考に！
   * @param message
   */
  async function handleSubmit(message: string) {
    try {
      // 画像データの準備
      const imageData =
        selectedImages.length > 0
          ? selectedImages.map((file) => ({
              path: `open_talks/${currentUserProfile.user_profile.uid}/${Date.now()}_${file.name}`,
              size: file.size,
              name: file.name,
            }))
          : [];

      const messageData = {
        uid: currentUserProfile.user_profile.uid,
        bcuid: currentUserProfile.user_profile.bcuid,
        nickname: currentUserProfile.user_profile.nickname,
        profile_images: currentUserProfile.user_profile.profile_images,
        text: message,
        deleted: false,
        createdAt: serverTimestamp(),
        images: imageData,
      };

      // Firestoreにドキュメントを追加
      const docRef = await addDoc(
        collection(firestore, 'openTalks'),
        messageData
      );

      // 画像が選択されている場合、Storageにアップロード
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

      console.log(
        '[DevFirestoreSnapshot] Message and images added successfully'
      );
    } catch (error) {
      console.error('[DevFirestoreSnapshot] Error:', error);
    }
  }

  /**
   * 画像をStorageにアップロード
   */
  /**
   * 画像をStorageにアップロード
   */
  const uploadImage = async (file: File, path: string) => {
    try {
      const storageRef = ref(firebaseStorage, path); // firebaseStorageを使用
      await uploadBytes(storageRef, file);
      console.log('Image uploaded successfully:', path);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  return (
    <div className="app-body">
      <Header />

      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            <h2 className="page-title mb20">Open Talk</h2>
            {/* <pre>
              {JSON.stringify(currentUserProfile.user_profile, null, 2)}
            </pre> */}
            {loading && <>Loading...</>}
            <form>
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
                  type="email"
                  className="form-control me-2"
                  id="openTalkMessage"
                  placeholder="今、何をしてますか？"
                  aria-label="Open Talk Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
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

              <div className="d-flex align-items-center justify-content-end">
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
                  onClick={() => handleSubmit(message)}
                  type="button"
                  className="btn btn-primary bcmhzt-btn"
                >
                  Submit
                </button>
              </div>
            </form>

            <div className="opentalk-messages">
              {openTalks.map((talk) =>
                /* 自分のメッセージ */
                talk.bcuid === currentUserProfile.user_profile.bcuid ? (
                  <div
                    className="message-block-right mb20"
                    style={{
                      width: '80%',
                      marginLeft: 'auto',
                    }}
                    key={talk.id}
                  >
                    <pre>{JSON.stringify(talk, null, 2)}</pre>
                    <div className="d-flex justify-content-end align-items-end">
                      <div>
                        <div>
                          {talk.text}
                          <br />
                          {talk.createdAt
                            ? formatFirestoreTimestamp(talk.createdAt)
                            : ''}
                        </div>
                      </div>
                      <div>
                        <Link to={`/member/${talk.bcuid}`}>
                          <img
                            src={
                              buildStorageUrl(
                                storage ?? '',
                                talk.profile_images ?? '',
                                '_thumbnail'
                              ) || '/assets/images/dummy/dummy_avatar.png'
                            }
                            className="avatar-36"
                            alt="foobar"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 他の人のメッセージ */
                  <div
                    className="message-block-left mb20"
                    style={{ width: '90%' }}
                    key={talk.id}
                  >
                    <div className="d-flex align-items-start">
                      <div>
                        <Link to={`/member/${talk.bcuid}`}>
                          <img
                            src={
                              buildStorageUrl(
                                storage ?? '',
                                talk.profile_images ?? '',
                                '_thumbnail'
                              ) || '/assets/images/dummy/dummy_avatar.png'
                            }
                            className="avatar-36"
                            alt="foobar"
                          />
                        </Link>
                      </div>
                      <div>
                        {talk.nickname}@{talk.bcuid}
                        <br />
                        {talk.text}
                        <br />
                        {talk.createdAt
                          ? formatFirestoreTimestamp(talk.createdAt)
                          : ''}
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Intersection Observer target */}
              <div
                ref={observerTarget}
                style={{ height: '20px', margin: '20px 0' }}
              >
                {isLoadingMore && (
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

              {!hasMore && (
                <div className="text-center text-muted my-3">
                  これ以上のメッセージはありません
                </div>
              )}
            </div>

            {/* <pre>{JSON.stringify(openTalks, null, 2)}</pre> */}
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
  );
};

export default DevFirestoreSnapshot;

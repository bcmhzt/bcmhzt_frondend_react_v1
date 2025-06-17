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

  /**
   * 入力ルーティンはこれな！handleSubmitを参考に！
   * @param message
   */
  function handleSubmit(message: string) {
    const messageData = {
      uid: currentUserProfile.user_profile.uid,
      bcuid: currentUserProfile.user_profile.bcuid,
      nickname: currentUserProfile.user_profile.nickname,
      profile_images: currentUserProfile.user_profile.profile_images,
      text: message,
      deleted: false,
      createdAt: serverTimestamp(),
    };

    /* openTalks コレクションに書き込み */
    const openTalksCollection = collection(firestore, 'openTalks');
    /* 取得したオブジェクトにaddDoc */
    addDoc(openTalksCollection, messageData)
      .then(() => {
        setMessage('');
        console.log(
          '[src/pages/develop/DevFirestoreSnapshot.tsx:46] Message added successfully',
          [messageData]
        );
      })
      .catch((error) => {
        console.error(
          '[src/pages/develop/DevFirestoreSnapshot.tsx:52] Error adding message:',
          [error, messageData]
        );
      });
    console.log(
      '[src/pages/develop/DevFirestoreSnapshot.tsx:xx] handleSubmit:',
      messageData
    );
  }

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
              <div className="mb-3 d-flex align-items-center">
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
                    <div className="d-flex justify-content-end align-items-end">
                      <div>
                        <div>{talk.text}</div>
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

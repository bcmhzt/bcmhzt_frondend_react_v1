import React, { useEffect } from 'react';
/**
 * appはimportしなくてもいかな。
 * Firebase authentication
 * Firebase storage
 * Firebase firestore
 */
import { auth, storage, firestore } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

/* debug */
console.log(
  '[src/pages/develop/DevFirestoreSnapshot.tsx:13] process.env.REACT_APP_DEBUG:',
  process.env.REACT_APP_DEBUG
);
console.log('[src/pages/develop/DevFirestoreSnapshot.tsx:16] debug:');
const dlog = (...args: any[]) => {
  if (process.env.REACT_APP_DEBUG === 'true') {
    console.log(...args); // ✅ console.log に出力すべき
  }
};

interface DevFirestoreSnapshotProps {}

const fetchOpenTalks = async () => {
  dlog(
    '[src/pages/develop/DevFirestoreSnapshot.tsx:27] Firestore instance:',
    firestore
  );
  try {
    const openTalksCollection = collection(firestore, 'openTalks');
    /**
     * うまくopenTalksにアクセスできていた場合は、logにsegments: Array(1)0: "openTalks"が取得できる
     */
    dlog(
      '[src/pages/develop/DevFirestoreSnapshot.tsx:33] コレクション参照:',
      openTalksCollection
    );
    // スナップショット取得のデバッグ
    try {
      const snapshot = await getDocs(openTalksCollection);
      dlog(
        '[src/pages/develop/DevFirestoreSnapshot.tsx:42] スナップショット取得結果:',
        {
          empty: snapshot.empty,
          size: snapshot.size,
          exists: !!snapshot,
          metadata: snapshot.metadata,
        }
      );

      if (snapshot.empty) {
        dlog(
          '[src/pages/develop/DevFirestoreSnapshot.tsx:50] ドキュメントが存在しません'
        );
        return [];
      }

      // ドキュメントデータの取得を試行
      try {
        const openTalks = snapshot.docs.map((doc) => {
          const data = doc.data();
          dlog(
            '[src/pages/develop/DevFirestoreSnapshot.tsx:58] ドキュメントデータ:',
            {
              id: doc.id,
              data: data,
            }
          );
          return {
            id: doc.id,
            ...data,
          };
        });

        dlog(
          '[src/pages/develop/DevFirestoreSnapshot.tsx:68] 変換後のデータ:',
          openTalks
        );
        return openTalks;
      } catch (dataError) {
        dlog(
          '[src/pages/develop/DevFirestoreSnapshot.tsx:71] データ変換エラー:',
          dataError
        );
        return [];
      }
    } catch (snapshotError) {
      dlog(
        '[src/pages/develop/DevFirestoreSnapshot.tsx:75] スナップショット取得エラー:',
        snapshotError
      );
      return [];
    }
  } catch (error) {
    console.error('Error fetching openTalks:', error);
    return [];
  }
};

interface OpenTalk {
  id: string;
  // 必要に応じて他のフィールドを追加
  [key: string]: any;
}

/** チャットのようなリアルタイムの更新などの練習帳 */
const DevFirestoreSnapshot: React.FC<DevFirestoreSnapshotProps> = () => {
  const [openTalks, setOpenTalks] = React.useState<OpenTalk[]>([]);
  const [loading, setLoading] = React.useState(true);
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const result = await fetchOpenTalks();
        setOpenTalks(result);
        dlog(
          '[src/pages/develop/DevFirestoreSnapshot.tsx:83] openTalks:',
          result
        );
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <div className="container">
      <h1>DevFirestoreSnapshot</h1>
      <div className="row">
        <div className="col">
          {loading ? (
            <div>Loading...</div>
          ) : openTalks.length === 0 ? (
            <div className="alert alert-info">データが存在しません</div>
          ) : (
            <div className="list-group">
              {openTalks.map((talk) => (
                <div key={talk.id} className="list-group-item">
                  <h5>Document ID: {talk.id}</h5>
                  <pre>{JSON.stringify(talk, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevFirestoreSnapshot;

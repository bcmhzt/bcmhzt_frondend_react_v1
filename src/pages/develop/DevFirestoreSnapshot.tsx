import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
/**
 * appはimportしなくてもいかな。
 * Firebase authentication
 * Firebase storage
 * Firebase firestore
 */
import { auth, storage, firestore } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

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

interface OpenTalk {
  uid: string;
  bcuid: string;
  nickname: string;
  text: string;
  profile_images: string;
  // image_url: string;
  deleted: boolean;
  // mentioned_uids: string[];
  // mentioned_bcuids: string[];
  // mentioned_nicknames: string[];
  // created_at: Date | import('firebase/firestore').FieldValue;
}

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
        const openTalks = snapshot.docs
          .map((doc) => {
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
              uid: data.uid || '',
              bcuid: data.bcuid || '',
              nickname: data.nickname || '',
              text: data.text || '',
              profile_images: data.profile_images || '',
              image_url: data.image_url || '',
              deleted: data.deleted || false,
              mentioned_uids: data.mentioned_uids || [],
              mentioned_bcuids: data.mentioned_bcuids || [],
              mentioned_nicknames: data.mentioned_nicknames || [],
              created_at: data.created_at,
            };
          })
          .sort((a, b) => {
            // ソート用にタイムスタンプを数値に変換
            const timeA =
              a.created_at instanceof Date ? a.created_at.getTime() : 0;
            const timeB =
              b.created_at instanceof Date ? b.created_at.getTime() : 0;
            return timeB - timeA; // 降順ソート
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
  const { currentUserProfile, token } = useAuth();
  const [loading, setLoading] = React.useState(true);
  // const [uid, setUid] = React.useState<string>('');
  // const [bcuid, setBcuid] = React.useState<string>('');
  // const [nickname, setNickname] = React.useState<string>('');
  // const [profileImages, setProfileImages] = React.useState<string>('');
  // const [deleted, setDeleted] = React.useState<boolean>(false);

  const [formData, setFormData] = React.useState<Partial<OpenTalk>>({
    uid: '',
    bcuid: '',
    nickname: '',
    text: '',
    profile_images: '',
    // image_url: '',
    deleted: false,
    // mentioned_uids: [],
    // mentioned_bcuids: [],
    // mentioned_nicknames: [],
    // created_at: serverTimestamp() as import('firebase/firestore').FieldValue,
  });

  useEffect(() => {
    if (currentUserProfile?.user_profile) {
      setFormData((prev) => ({
        ...prev,
        uid: currentUserProfile.user_profile.uid,
        bcuid: currentUserProfile.user_profile.bcuid,
        nickname: currentUserProfile.user_profile.nickname,
        profile_images: currentUserProfile.user_profile.profile_images,
        // created_at:
        //   serverTimestamp() as import('firebase/firestore').FieldValue,
      }));

      // デバッグ用
      dlog(
        '[src/pages/develop/DevFirestoreSnapshot.tsx:174] formData updated:',
        {
          currentUser: currentUserProfile.user_profile,
          formData: formData,
        }
      );
    }
  }, [currentUserProfile]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Firestoreに保存するデータを作成（一つのdocDataに統合）
      const docData = {
        uid: formData.uid,
        bcuid: formData.bcuid,
        nickname: formData.nickname,
        text: formData.text,
        profile_images: formData.profile_images,
        deleted: formData.deleted || false,
        created_at: serverTimestamp(), // サーバータイムスタンプを設定
      };

      dlog('[DevFirestoreSnapshot] 保存するデータ:', docData);

      // ドキュメントを作成
      const docRef = await addDoc(collection(firestore, 'openTalks'), docData);
      dlog('ドキュメントを追加しました。ID:', docRef.id);

      // フォームをリセット（ユーザー情報は保持）
      setFormData((prev) => ({
        ...prev,
        text: '', // テキストのみリセット
      }));

      // データを再取得
      const result = await fetchOpenTalks();
      setOpenTalks(result);
    } catch (error) {
      console.error('ドキュメントの追加に失敗:', error);
    }
  };

  const handleArrayInput = (
    field: keyof Pick<
      OpenTalk,
      'mentioned_uids' | 'mentioned_bcuids' | 'mentioned_nicknames'
    >,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(',').map((item) => item.trim()),
    }));
  };

  return (
    <div className="container">
      <h1>DevFirestoreSnapshot</h1>
      <pre>{JSON.stringify(currentUserProfile.user_profile, null, 2)}</pre>
      <div className="row">
        <div className="col">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Text:</label>
              <textarea
                className="form-control"
                value={formData.text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, text: e.target.value }))
                }
              />
            </div>

            <button type="submit" className="btn btn-primary">
              ドキュメントを作成
            </button>
          </form>

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

/** 6c84d6f6 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import type { JSX } from "react";
import { auth } from "../firebaseConfig";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signOut,
  User
} from "firebase/auth";
import axios from "axios";

/**
 * 6c84d6f6 (hash)
 * [src/contexts/AuthContext.tsx:xx]
 * 
 * type: context
 * 
 * [Order] このコードでやっていること
 * - AuthContextTypeのインターフェイス指定
 * - AuthContextの作成
 * - useAuthの作成
 * - AuthProviderの作成
 * - useEffectでFirebaseのログイン状態を監視
 * - useEffectでFirebaseのトークンを監視 (onIdTokenChanged)
 * - useEffectでmyProfileImageの変更を監視
 * - logout関数の作成
 * - contextValueの作成
 * - AuthContext.Providerでラップ
 * - loadingがfalseのときにchildrenを表示
 */

/* create context */
interface AuthContextType {
  isLogin: boolean;
  currentUser: User | null;
  currentUserProfile: any;
  token: string | null;
  uid: string | null;
  // imageUrl: string | null;
  myProfileImage: string | null;
  error: any;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log("[src/contexts/AuthContext.js:xx] debug:", debug);
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [isLogin, setIsLogin] = useState(false);
  const [currentUser, setFirebaseCurrentUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  // const [imageUrl, setImageUrl] = useState(null);
  const [myProfileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (debug === 'true') {
      console.log("[src/contexts/AuthContext.js:66] useEffect called for login judgment.");
    }
    const env = process.env.REACT_APP_ENV;
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    const firebaseProfilesBaseUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;

    /**
     * ログイン判定 (Firebase Auth)
     * https://firebase.google.com/docs/auth/web/manage-users?hl=ja
     * 
     * Firebaseのユーザーで根本的なログインを行っているが、システム的には、
     * Firebase Authentication と bcmhztメンバーがuser_profilesのデータを取得できたときに
     * ログインと判断する
     */
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (debug === 'true') {
        console.log("[src/contexts/AuthContext.js:82] onAuthStateChanged called.");
      }
      setLoading(true);
      
      /* Firebaseにログインしている場合はトークンを取得する */
      if (debug === 'true') {
        console.log('[src/contexts/AuthContext.js:88] check firebase user ', firebaseUser);
      }
      if (firebaseUser) {
        if (debug === 'true') {
          console.log("[src/contexts/AuthContext.js:92] User is not log in Firebase. But user data keep in your browser. ", firebaseUser);
        }
        setFirebaseCurrentUser(firebaseUser);
        setUid(firebaseUser.uid);

        try {
          const idToken = await firebaseUser.getIdToken();
          if (debug === 'true') {
            console.log("[src/contexts/AuthContext.js:100] ID Token (JWT).", idToken);
          }
          setToken(idToken);

          /**
           * get user information from bcmhzt backend api
           * 
           * ユーザ情報を取得する
           * firebase user
           * users
           * user_details
           * user_profiles
           */
          const response = await axios.post(`${apiEndpoint}/user/${firebaseUser.uid}`, {}, {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          setCurrentUserProfile(response.data);
          
          if (debug === 'true') {
            /* Backendが起動していない（通信できていない）場合は、ここで止まる */
            console.log("[src/contexts/AuthContext.js:122] API currentUserProfile. (user_profiles, user_details, users)", response.data);
          }
          
          /**
           * Get & make user basic information
           * user avatar image
           * user nickname
           */

          /* profile_images */
          if (response.data.user_profile.profile_images !== null) {
            setProfileImage(firebaseProfilesBaseUrl + response.data.user_profile.profile_images + '?alt=media');
          }
          /* nickname */
          if (debug === 'true') {
            console.log('[src/contexts/AuthContext.js:137] nickname: ', myProfileImage);
            console.log('[src/contexts/AuthContext.js:138] nickname: ', response.data.user_profile.nickname);
          }
   
          /*  最終ログイン判定 */
          setIsLogin(true);
          if (debug === 'true') {
            console.log( firebaseUser.uid + " is logged in [AuthContext 08]");
            console.log('is Login [AuthContext 09]', isLogin );
          }

        } catch (error) {
          /* Backendのシステムが落ちているときは、ここで例外処理 */
          setLoading(false);
          setError(error);

          /* Backend APIと通信ができていないとき（ユーザー情報が取得できていない） */
          console.error('[src/contexts/AuthContext.js:154] Error fetching data. ', error);
          /* error 処理をもう少し詳しく書く */         
          if (env === 'prod') {
            window.location.href = '/error.html';
          }
        }        
      } else {
        if (debug === 'true') {
          console.log("User is logged out"); // デバッグ用ログ
        }
        setFirebaseCurrentUser(null);
        setToken(null);
        setUid(null);
        setCurrentUserProfile([]);
        // setImageUrl(null);
        setError(null);
      }
      setLoading(false);
    });
    // ★ トークンの自動リフレッシュを検知
    const unsubIdToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (debug === 'true') {
        console.log("[src/contexts/AuthContext.js:176] onIdTokenChanged called. firebaseUser:", firebaseUser);
      }
      if (firebaseUser) {
        const newToken = await firebaseUser.getIdToken();
        if (debug === 'true') {
          console.log("[src/contexts/AuthContext.js:181] onIdTokenChanged new token:", newToken);
        }
        setToken(newToken);
      } else {
        // ログアウト後は null
        setToken(null);
      }
    });

    // マウント解除時には両方のリスナーを解除
    return () => {
      unsubAuth();
      unsubIdToken();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /* myProfileImageの変更を監視するuseEffectフック */
  useEffect(() => {
    if (debug === 'true') {
      console.log('[src/contexts/AuthContext.js:201] myProfileImage: ', [myProfileImage]);
      console.log('[src/contexts/AuthContext.js:202] API currentUserProfile: ', currentUserProfile);
    }
  }, [ currentUserProfile, myProfileImage, isLogin ]);


  const logout = useCallback(async () => {
    if (debug === 'true') {
      console.log("Logging out [AuthContext 07]:");
    }
    await signOut(auth);
    setFirebaseCurrentUser(null);
    setToken(null);
    setUid(null);
    setCurrentUserProfile([]);
    // setImageUrl(null);
    setError(null);
  }, []);
  

  const contextValue = useMemo(() => ({
    currentUser,
    currentUserProfile,
    token,
    uid,
    // imageUrl,
    myProfileImage,
    error,
    loading,
    isLogin,
    logout
  }), [
    currentUser,
    currentUserProfile,
    token,
    uid,
    // imageUrl,
    myProfileImage,
    error,
    loading,
    isLogin,
    logout
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
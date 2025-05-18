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
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import axios from 'axios';

/* create context */
interface AuthContextType {
  isLogin: boolean;
  currentUser: User | null;
  currentUserProfile: any;      // 必要に応じて具体的な型に置き換えてください
  token: string | null;
  uid: string | null;
  imageUrl: string | null;
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

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;  // children に ReactNode 型を指定
}): JSX.Element => {
  const [isLogin, setIsLogin] = useState(false);
  const [currentUser, setFirebaseCurrentUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [myProfileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (debug === 'true') {
      console.log("[src/contexts/AuthContext.js:56] useEffect called for login judgment.");
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (debug === 'true') {
        console.log("[src/contexts/AuthContext.js:42] onAuthStateChanged called.");
      }
      setLoading(true);
      
      /* Firebaseにログインしている場合はトークンを取得する */
      if (debug === 'true') {
        console.log('[src/contexts/AuthContext.js:48] check firebase user ', firebaseUser);
      }
      if (firebaseUser) {
        if (debug === 'true') {
          console.log("[src/contexts/AuthContext.js:52] User is not log in Firebase. But user data keep in your browser. ", firebaseUser);
        }
        setFirebaseCurrentUser(firebaseUser);
        setUid(firebaseUser.uid);

        try {
          const idToken = await firebaseUser.getIdToken();
          if (debug === 'true') {
            console.log("[src/contexts/AuthContext.js:60] ID Token (JWT).", idToken);
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
            console.log("[src/contexts/AuthContext.js:82] API currentUserProfile. (user_profiles, user_details, users)", response.data);
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
            console.log('[src/contexts/AuthContext.js:97] nickname: ', myProfileImage);
            console.log('[src/contexts/AuthContext.js:98] nickname: ', response.data.user_profile.nickname);
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
          console.error('[src/contexts/AuthContext.js:117] Error fetching data. ', error);
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
        setImageUrl(null);
        setError(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [isLogin, myProfileImage]);
  
  /* myProfileImageの変更を監視するuseEffectフック */
  useEffect(() => {
    if (debug === 'true') {
      console.log('[src/contexts/AuthContext.js:171] myProfileImage: ', [myProfileImage]);
      console.log('[src/contexts/AuthContext.js:172] API currentUserProfile: ', currentUserProfile);
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
    setImageUrl(null);
    setError(null);
  }, []);
  

  const contextValue = useMemo(() => ({
    currentUser,
    currentUserProfile,
    token,
    uid,
    imageUrl,
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
    imageUrl,
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
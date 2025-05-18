import { Link } from "react-router-dom";
import { useAuth } from  "../../contexts/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const DevAuthenticate = () => {
  const auth = useAuth();
  const {
    currentUser,
    currentUserProfile,
    token,
    uid,
    imageUrl,
    myProfileImage,
    error,
    loading,
    isLogin,
    logout,
  } = auth || {};

  return (
    <>
      <Header />
      <h2>DevAuthenticate</h2>DevAuthenticate
      currentUser
      <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      currentUserProfile
      <pre>{JSON.stringify(currentUserProfile, null, 2)}</pre>
      token
      <pre>{JSON.stringify(token, null, 2)}</pre>
      uid
      <pre>{JSON.stringify(uid, null, 2)}</pre>
      imageUrl
      <pre>{JSON.stringify(imageUrl, null, 2)}</pre>
      myProfileImage
      <pre>{JSON.stringify(myProfileImage, null, 2)}</pre>
      error
      <pre>{JSON.stringify(error, null, 2)}</pre>
      loading
      <pre>{JSON.stringify(loading, null, 2)}</pre>
      isLogin
      <pre>{JSON.stringify(isLogin, null, 2)}</pre>
      <br /><br /><br /><br /><br /><br /><br />
      <button onClick={logout}>Logout</button>
      <Link to="/">top</Link>
      <Footer />
    </>
  );
};
export default DevAuthenticate;
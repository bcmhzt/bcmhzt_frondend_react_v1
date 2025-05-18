// import { Link } from "react-router-dom";
import Header from "../components/Header";
// import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import DevelopBanner from "../components/DevelopBanner";

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log("[src/pages/Top.tsx:xx] debug:", debug);
}

const Top = () => {


  const auth = useAuth();
  const isLogin = auth?.isLogin;
  // const isLogin = false;
  if (isLogin) {
    window.location.replace("/dashboard");
    return null;
  }

  return (
    <>
      <Header />
      <DevelopBanner />
      

      


    </>
  );
};
export default Top;
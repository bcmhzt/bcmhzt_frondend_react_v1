import { Link } from "react-router-dom";
import HeaderNoLogin from "../components/HeaderNoLogin";
import Footer from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

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
    {/* <pre>{JSON.stringify(isLogin, null, 2)}</pre> */}
    <HeaderNoLogin />
      
      <Link to="/about" className="btn btn-primary">About</Link>
      <ul>
        <li><Link to="/list">List</Link></li>
      </ul>
    <Footer />
    </>
  );
};
export default Top;
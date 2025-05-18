import { Link } from "react-router-dom";
import bcmhztLogo from '../assets/images/icon/bcmhzt-logo.png';
// import dummyAvatar from '../assets/images/dummy/dummy-avatar.png';

const HeaderNoLogin = () => {

  return (
    <>
      <div className="topbar"></div>

      <div className="header">
        <div className="header-section">

          <Link to="/"><img src={bcmhztLogo} alt="logo" className="brand" /></Link>
          <h1 className="site-name"><Link to="/">Bcmhzt</Link></h1>
          <ul>
            <li><Link to="/usage">Usage</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>

        <div className="member-section">
          <a href="/register" className="btn btn-sm btn-primary bcmhzt-btn mr10">Sign up</a>
          <a href="/login" className="btn btn-sm btn-primary bcmhzt-btn-gray mr5">Login</a>
        </div>
      </div>
    </>
  );
};

export default HeaderNoLogin;

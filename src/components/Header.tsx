import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bcmhztLogo from '../assets/images/icon/bcmhzt-logo.png';
import dummyAvatar from '../assets/images/dummy/dummy-avatar.png';
import { HouseDoor, List, ListUl, Power, XLg, Gear, WindowDock, Book, Easel, Mailbox, CodeSlash } from 'react-bootstrap-icons';
import LanguageSelector from '../utility/LanguageSelector';
import { useAuth } from "../contexts/AuthContext";
// import useCommon from "../hooks/useCommon";
import {getImageWithSuffix} from "../utility/GetUseImage";

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log("[src/components/Header.tsx:xx] debug:", debug);
}

/**
 * 99999999 (hash)
 * [src/pages/Archtect.tsx:xx]
 * 
 * type: page
 * 
 * [Order] このコードでやっていること
 * - ログイン時と非ログイン時のヘッダーの出し分け
 */

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const env = process.env.REACT_APP_ENV;
  const auth = useAuth();
  const currentUserProfile = auth?.currentUserProfile;
  const myProfileImage = auth?.myProfileImage;
  const isLogin = auth?.isLogin;
  // const isLogin = false;
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
    if (debug === 'true') {
      console.log("[src/components/Header.tsx:toggle] sidebar toggled");
    }
  };

  const marumeru = (nickname: string): string => {
    if (!nickname) return "";
    return nickname.length > 12 ? nickname.slice(0, 12) + "…" : nickname;
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    console.log("[src/components/Header.tsx:32] close sidebar");
  }

  return (
    <>
      <div className="topbar"></div>

      <div className="header">
        
        <div className="header-section">
          <Link to="/"><img src={bcmhztLogo} alt="logo" className="brand" /></Link>
          <h1 className="site-name"><Link to="/">Bcmhzt</Link></h1>
          <ul>
            {isLogin ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/member">Members</Link></li>
                <li><Link to="/about">Usage</Link></li>
              </>
              ) : (
              <>
                <li><Link to="/usage">Usage</Link></li>
                <li><Link to="/about">About</Link></li>
              </>
              )
            }
          </ul>
        </div>
      
        <div className="member-section">
          {isLogin ? (
            <>
            <span className="nickname">
              <Link to="/member">
                <span className="name">
                  {!currentUserProfile?.user_profile?.nickname ? "NaN" : marumeru(currentUserProfile?.user_profile?.nickname ?? "Error")}
                </span>
                <span className="bcuid ml5">@{currentUserProfile?.user_profile?.bcuid}</span>
              </Link>
            </span>
          
            <img
              src={getImageWithSuffix(myProfileImage ?? '', '_thumbnail') || dummyAvatar}
              alt="logo"
              className="header-avatar"
              onClick={handleToggleSidebar}
          />
            </>
            ) : (
              <>
              <div className="member-section">
                <a href="/register" className="btn btn-sm btn-primary bcmhzt-btn mr10">Sign up</a>
                <a href="/login" className="btn btn-sm btn-primary bcmhzt-btn-gray mr5">Login</a>
              </div>
              </>
            )
          }
        </div>
      </div>

      {/* オーバーレイ */}
      {sidebarOpen && isLogin && (
        <div
          className="sidebar-overlay"
          onClick={handleCloseSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 5,
            backdropFilter: "blur(1px)",
          }}
        />
      )}
      
      {isLogin && (
      <div className={`sidebar${sidebarOpen ? " open" : ""}`}>

        <button className="close-btn mt10 ml10" onClick={handleCloseSidebar}>
          <XLg className="close-xlg" />
        </button>

        <div className="sidebar-menu">
          <ul>
            <li>
              <WindowDock className="icon-lg" />
              <Link to="/myprofile">プロフィールの設定</Link>
            </li>
            <li>
              <HouseDoor className="icon-lg" />
              <Link to="/dashboard">ダッシュボード</Link>
            </li>
            <li>
              <List className="icon-lg" />
              <Link to="/members">メンバー検索</Link>
            </li>
            <li>
              <Easel className="icon-lg" />
              <Link to="/about">このサイトについて</Link>
            </li>
            <li>
              <Book className="icon-lg" />
              <Link to="/usage">ご利用方法</Link>
            </li>
            <li>
              <Gear className="icon-lg" />
              <Link to="/settings">設定</Link>
            </li>
            <li>
              <ListUl className="icon-lg" />
              <Link to="/myindex">目次・サイトマップ</Link>
            </li>
            <li>
              <Mailbox className="icon-lg" />
              <Link to="/contact">お問い合わせ</Link>
            </li>

            {env === "local" ? (
              <>
              <hr />
              <li>
                <CodeSlash className="icon-lg" />
                <Link to="/list">開発リストインデックス</Link>
              </li>
              <hr />
              </>
            ) : null}
 
            <li>
              <Power className="icon-lg" />
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (auth?.logout) {auth.logout()}
                  navigate("/login");
                }}
              >ログアウト
              </span>
            </li>
          </ul>
        </div>

        <div className="tools mt60" style={{ marginLeft: '-20px' }}>
          <LanguageSelector />
        </div>

      </div>
      )}









      {/* <pre>{JSON.stringify(currentUserProfile.user_profile.profile_images, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(currentUserProfile.user_firebase, null, 2)}</pre> */}
      {/* {currentUserProfile?.user_profile && (
        <pre>{JSON.stringify(currentUserProfile.user_profile, null, 2)}</pre>
      )} */}
      {/* <pre>{JSON.stringify(currentUserProfile.user_detail, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(currentUserProfile.user, null, 2)}</pre> */}

    </>
  );
};
export default Header;
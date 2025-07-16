/** 5310e80a */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import bcmhztLogo from '../assets/images/icon/bcmhzt-logo.png';
import dummyAvatar from '../assets/images/dummy/dummy-avatar.png';
import {
  HouseDoor,
  // List,
  ListUl,
  Power,
  XLg,
  Gear,
  WindowDock,
  Book,
  Easel,
  Mailbox,
  CodeSlash,
  Braces,
  ChatText,
  People,
  CardText,
  Bell,
  Envelope,
} from 'react-bootstrap-icons';
import LanguageSelector from '../utility/LanguageSelector';
import { useAuth } from '../contexts/AuthContext';
// import useCommon from "../hooks/useCommon";
import { getImageWithSuffix } from '../utility/GetUseImage';
import TopHeaderBar from './TopHeaderBar';
import DisorderMessage from './header/DisorderMessage';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/Header.tsx:xx] debug:', debug);
}

/**
 * 5310e80a
 * [src/components/Header.tsx:xx]
 *
 * type: component
 *
 * [Order]
 * - TopHeaderBar
 * - getImageWithSuffix
 */

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const env = process.env.REACT_APP_ENV;
  const auth = useAuth();
  const currentUserProfile = auth?.currentUserProfile;
  const myProfileImage = auth?.myProfileImage;
  const isLogin = auth?.isLogin;

  const handleLogout = async () => {
    await auth.logout();
    setSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
    if (!sidebarOpen) {
      document.body.style.overflow = 'hidden';
    }
    if (debug === 'true') {
      console.log('[src/components/Header.tsx:toggle] sidebar toggled');
    }
  };

  const marumeru = (nickname: string): string => {
    if (!nickname) return '';
    return nickname.length > 12 ? nickname.slice(0, 12) + '…' : nickname;
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = '';
    console.log('[src/components/Header.tsx:32] close sidebar');
  };

  return (
    <>
      <TopHeaderBar />
      <DisorderMessage />

      <div className="header">
        <div className="header-section">
          <Link to="/">
            <img src={bcmhztLogo} alt="logo" className="brand" />
          </Link>
          <h1 className="site-name">
            {isLogin ? (
              <Link to="/dashboard">Bcmhzt</Link>
            ) : (
              <Link to="/">Bcmhzt</Link>
            )}
          </h1>

          <ul>
            {/* ログイン時 */}
            {isLogin ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/members">Members</Link>
                </li>
                <li>
                  <Link to="/posts">Posts</Link>
                </li>
              </>
            ) : (
              // ログアウト時
              <>
                <li>
                  <Link to="https://portal.bcmhzt.net/%e3%81%94%e5%88%a9%e7%94%a8%e6%96%b9%e6%b3%95-usage/">
                    Usage
                  </Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* ログイン時 */}
        <div className="member-section">
          {isLogin ? (
            <>
              <span className="nickname">
                <Link to={`/member/${currentUserProfile?.user_profile?.bcuid}`}>
                  <span className="name">
                    {!currentUserProfile?.user_profile?.nickname
                      ? 'NaN'
                      : marumeru(
                          currentUserProfile?.user_profile?.nickname ?? 'Error'
                        )}
                  </span>
                  <span className="bcuid ml5">
                    @{currentUserProfile?.user_profile?.bcuid}
                  </span>
                </Link>
              </span>

              <img
                src={
                  getImageWithSuffix(myProfileImage ?? '', '_thumbnail') ||
                  dummyAvatar
                }
                alt="logo"
                className="header-avatar"
                onClick={handleToggleSidebar}
              />
            </>
          ) : (
            <>
              <div className="member-section">
                <a
                  href="/register"
                  className="btn btn-sm btn-primary bcmhzt-btn mr10"
                >
                  Sign up
                </a>
                <a
                  href="/login"
                  className="btn btn-sm btn-primary bcmhzt-btn-gray mr5"
                >
                  Login
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* オーバーレイ */}
      {sidebarOpen && isLogin && (
        <div
          className="sidebar-overlay"
          onClick={handleCloseSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 5,
            backdropFilter: 'blur(1px)',
          }}
        />
      )}

      {isLogin && (
        <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <button className="close-btn mt20 ml10" onClick={handleCloseSidebar}>
            <XLg className="close-xlg" />
          </button>

          <div className="sidebar-menu">
            <ul>
              <li>
                <HouseDoor className="icon-lg" />
                <Link to="/dashboard">ダッシュボード</Link>
              </li>
              <li>
                <People className="icon-lg" />
                <Link to="/members">メンバー</Link>
              </li>
              <li>
                <CardText className="icon-lg" />
                <Link to="/posts">投稿</Link>
              </li>
              <li>
                <Bell className="icon-lg" />
                <Link to="/notice">通知</Link>
              </li>
              <li>
                <Envelope className="icon-lg" />
                <Link to="/messages">メッセージ</Link>
              </li>
              <li>
                <ChatText className="icon-lg" />
                <Link to="/open_talks">オープントーク</Link>
              </li>
              <li>
                <WindowDock className="icon-lg" />
                <Link to="/myprofile">プロフィールの設定</Link>
              </li>

              <li>
                <Book className="icon-lg" />
                <a
                  href="https://portal.bcmhzt.net/usage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-2"
                >
                  ご利用方法
                </a>
              </li>
              <li>
                <Gear className="icon-lg" />
                <Link to="/settings">設定</Link>
              </li>
              <li>
                <ListUl className="icon-lg" />
                <Link to="/index">目次・サイトマップ</Link>
              </li>
              <li>
                <Mailbox className="icon-lg" />
                <Link to="https://portal.bcmhzt.net/contact/" target="_blank">
                  お問い合わせ
                </Link>
              </li>

              {env === 'local' || env === 'test' || env === 'dev' ? (
                <>
                  <hr />
                  <li>
                    <CodeSlash className="icon-lg" />
                    <Link to="/list">開発リストインデックス</Link>
                  </li>
                  <li>
                    <Braces className="icon-lg" />
                    <Link to="/develop/authenticate">開発パラメータ</Link>
                  </li>
                  <hr />
                </>
              ) : null}

              <li>
                <Power className="icon-lg" />
                <span style={{ cursor: 'pointer' }} onClick={handleLogout}>
                  ログアウト
                </span>
              </li>
              {env === 'local' || env === 'test' || env === 'dev' ? (
                <>
                  <hr />
                  <li>
                    <Easel className="icon-lg" />
                    <span style={{ cursor: 'pointer' }}>Dummy Index</span>
                  </li>
                  <li>
                    <Easel className="icon-lg" />
                    <span style={{ cursor: 'pointer' }}>Dummy Index</span>
                  </li>
                  <li>
                    <Easel className="icon-lg" />
                    <span style={{ cursor: 'pointer' }}>Dummy Index</span>
                  </li>
                  <li>
                    <Easel className="icon-lg" />
                    <span style={{ cursor: 'pointer' }}>Dummy Index</span>
                  </li>
                  <li>
                    <Easel className="icon-lg" />
                    <span style={{ cursor: 'pointer' }}>Dummy Index</span>
                  </li>
                </>
              ) : null}
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

/** c19359aa */
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  HouseDoor,
  // List,
  // ListUl,
  // Power,
  // XLg,
  // Gear,
  // WindowDock,
  // Book,
  // Easel,
  // Mailbox,
  // CodeSlash,
  // Braces,
  ChatText,
  People,
  CardText,
  Bell,
  Envelope,
  // BoxArrowUpRight,
  ArrowRightSquare,
  PersonPlus,
  Key,
  FileEarmarkSlides,
  Ban,
} from 'react-bootstrap-icons';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/Index.tsx:xx] debug:', debug);
}

/**
 * c19359aa
 * [src/pages/Index.tsx:xx]
 *
 * type: page
 *
 * [Order]
 * - 目次
 */

const Index = () => {
  return (
    <>
      <div className="app-body">
        <Header />
        <div className="container bc-app">
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              <h2 className="page-title mb20">Index</h2>
              <ul className="index-menu">
                <li>
                  <HouseDoor style={{ fontSize: '20px' }} />{' '}
                  <a href="/dashboard">ダッシュボード</a>
                </li>
                <li>
                  <People style={{ fontSize: '20px' }} />{' '}
                  <a href="/members">メンバー</a>
                </li>
                <li>
                  <CardText style={{ fontSize: '20px' }} />{' '}
                  <a href="/posts">投稿</a>
                </li>
                <li>
                  <Bell style={{ fontSize: '20px' }} />{' '}
                  <a href="/notice">通知</a>
                </li>
                <li>
                  <Envelope style={{ fontSize: '20px' }} />{' '}
                  <a href="/messages">メッセージ</a>
                </li>
                <hr />
                <li>
                  <ChatText style={{ fontSize: '20px' }} />{' '}
                  <a href="/">オープントーク</a>
                </li>
                <hr />
                <li>
                  <PersonPlus style={{ fontSize: '20px' }} />{' '}
                  <a href="/register">新規登録</a>
                </li>
                <li>
                  <ArrowRightSquare style={{ fontSize: '20px' }} />{' '}
                  <a href="/login">ログイン</a>
                </li>
                <li>
                  <Key style={{ fontSize: '20px' }} />{' '}
                  <a href="/forgotmypassword">パスワードをお忘れた</a>
                </li>
                <li>
                  <FileEarmarkSlides style={{ fontSize: '20px' }} />{' '}
                  <a href="/easy_sexual_profile_regist">簡単性癖登録</a>
                </li>
                <hr />
                <li>
                  <Ban style={{ fontSize: '20px' }} />{' '}
                  <a href="/members/blocks">ブロックリスト</a>
                </li>
                {/* <li>
                  <HouseDoor style={{ fontSize: '20px' }} />{' '}
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li> */}
              </ul>
            </div>
            <div className="d-none d-md-block col-md-6 bc-right">
              <div
                style={{
                  background: '#f1f1f1',
                  height: '100%',
                  padding: '20px',
                }}
              >
                広告エリア / サブエリア
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};
export default Index;

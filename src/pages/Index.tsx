/** c19359aa */
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
              <ul>
                <li>
                  <a href="/dashboard">ダッシュボード</a>
                </li>
                <li>
                  <a href="/members">メンバー</a>
                </li>
                <li>
                  <a href="/posts">投稿</a>
                </li>
                <li>
                  <a href="/notice">通知</a>
                </li>
                <li>
                  <a href="/messages">メッセージ</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/register">新規登録</a>
                </li>
                <li>
                  <a href="/login">ログイン</a>
                </li>
                <li>
                  <a href="/forgotmypassword">パスワードをお忘れた</a>
                </li>
                <li>
                  <a href="/easy_sexual_profile_regist">簡単性癖登録</a>
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
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
                <li>
                  <a href="/">オープントーク</a>
                </li>
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

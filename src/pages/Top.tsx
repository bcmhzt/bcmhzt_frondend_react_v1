import React, { useEffect, useState } from "react";
import { useLocation, Link } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Header from "../components/Header";
import VisualBackground from '../components/VidualBackground';
// import Footer from "../components/Footer";
// import { useAuth } from "../contexts/AuthContext";
import DevelopBanner from "../components/DevelopBanner";
import NewsLimited from '../components/NewsLimited';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log("[src/pages/Top.tsx:xx] debug:", debug);
}

const Top = () => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  // const auth = useAuth();

  /**
   * 年齢認証モーダルの表示
   */
  useEffect(() => {
    /* ローカルストレージから年齢認証フラグを確認 */
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
      setShowModal(true);
    }
  }, [location]);

  // const isLogin = false;
  // if (auth && auth.isLogin) {
  //   window.location.replace("/dashboard");
  //   return null;
  // }



  /* 年齢認証モーダルの表示 verified */
  /* Yes */
  const handleYesClick = () => {
    localStorage.setItem('ageVerified', 'true');
    setShowModal(false);
  };
  /* No */
  const handleNoClick = () => {
    if (debug === 'true') {
      console.log('[src/pages/Top.js:36] handleNoClick: 年齢認証でNoを選択した場合');
    }
    setShowModal(false);
  };

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Bcmhzt | バクムーツ</title>
          <meta name="description" content="拘束・オーガズム・躾・エクスタシー、身近な性と向き合う「bcmhzt」バクムーツ" />
        </Helmet>
      </HelmetProvider>

      <Header />
      <DevelopBanner />
      <VisualBackground />

      <div className="container mt30 mb80">
        <div className="row">
          <div className="col-md-6 col-lg-6 main-section mb50">

            <div  className="register">
              {/* <h2 className="main-title"><span className="bgbar">BCMHZT</span></h2> */}
              <p className="main-description">バクムーツは、身近な性と向き合う性癖マッチングサイトです。</p>
              <div className="register-button mb30">
                <div className="mb20">
                  <Link to="/register" className="reg btn bcmhzt-btn btn-primary w-100 text-center">新規アカウント登録</Link>
                  {/* <a
                    href="/register"
                    className="reg btn bcmhzt-btn btn-primary w-100 text-center"
                  >
                    新規アカウント登録
                  </a> */}
                  <p className="comment">現在紹介制のみで登録が可能です。</p>
                </div>
                <div>
                  <Link to="/login" className="log btn btn-primary w-100 text-center">すでにアカウントをお持ちの方</Link>
                    {/* <a
                    href="/login"
                    className="log btn btn-primary w-100 text-center"
                    style={{ display: "block" }}
                    >
                    すでにアカウントをお持ちの方
                    </a> */}
                </div>
              </div>
            </div>

            <div className="post-ogp">
              <div className="post-ogp-item">
                <a href="https://seihekitecho.com/" target="_blank" rel="noopener noreferrer">
                  <img src="http://seihekitecho.com/wp-content/uploads/2025/02/9bfd185148e7f0e43fdeca5075b9460b.jpg" alt="ogp"/>
                  <div className="post-ogp-title">性癖手帖</div>
                  <div className="post-ogp-description">
                    昔の人も変だった！？性癖の万華鏡。性癖って自由だ！歴史と世界の珍百景。性癖マニアのための時空を超えた手帖。常識のスキマに性癖あり。
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-6 main-section mb50">
            <NewsLimited />     
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center">
              <p>© 2023 BCMHZT. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* 年齢認証モーダル */}
      {showModal && (
      <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
          <h5 className="modal-title">年齢確認</h5>
          </div>
          <div className="modal-body">
          このサイトを利用するには、18歳以上である必要があります。あなたは18歳以上ですか？
          </div>
          <div className="modal-footer">
          <button className="btn bcmhzt-btn-glay btn-secondary" onClick={handleNoClick}>
            No
          </button>
          <button className="btn bcmhzt-btn btn-primary" onClick={handleYesClick}>
            Yes
          </button>
          </div>
        </div>
        </div>
      </div>
      )}
    </>
  );
};
export default Top;
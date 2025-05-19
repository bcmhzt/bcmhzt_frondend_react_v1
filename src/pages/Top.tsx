import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Header from "../components/Header";
import VisualBackground from '../components/VidualBackground';
// import Footer from "../components/Footer";
// import { useAuth } from "../contexts/AuthContext";
import DevelopBanner from "../components/DevelopBanner";

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
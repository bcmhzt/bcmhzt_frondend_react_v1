/** fbfb2bb3 */
import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import PostBoard from '../components/PostBoard';
import Instructor from '../components/Instructor';
// import FooterTool from '../components/FooterTool';
// import MemberList from '../components/v1/member/Memberlist';
// import MatchedMemberLimit from '../components/v1/dashboard/MatchedMemberLimit';
// import ArchtectTemplate from '../components/dashboards/ArchtectTemplate';
import LikedMeCardLimit from '../components/dashboards/LikedMeCardLimit';
import MatchedMemberLimit from '../components/dashboards/MatchedMemberLimit';
import ILikedCardLimit from '../components/dashboards/ILikedCardLimit';
import BcmhztLinkCollections from '../components/dashboards/BcmhztLinkCollections';
import ReferralEntries from '../components/dashboards/ReferralEntries';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/Dashboard.tsx:xx] debug:', debug);
}

/**
 * fbfb2bb3
 * [src/pages/Dashboard.tsx:xx]
 *
 * type: page
 *
 * [Order]
 * - LikedMeCardLimit あなたにナイススケベをした人
 * - MatchedMemberLimit マッチした人
 * - ILikedCardLimit あなたがナイススケベをした人
 */

const Dashboard = () => {
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left dashboard">
            <Instructor />

            {/* <h2>Dashboard</h2> */}
            {/* <ArchtectTemplate /> */}
            <LikedMeCardLimit />
            <MatchedMemberLimit />
            <ILikedCardLimit />
            <BcmhztLinkCollections />
          </div>
          <div className="col-12 col-md-6 bc-right dashboard">
            <ReferralEntries />
            <p>bar</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Dashboard;

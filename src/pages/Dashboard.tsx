/** fbfb2bb3 */
import React from 'react';
import Instructor from '../components/Instructor';
import TopLinkMenu from '../components/dashboards/TopLinkMenu';
import LikedMeCardLimit from '../components/dashboards/LikedMeCardLimit';
import MatchedMemberLimit from '../components/dashboards/MatchedMemberLimit';
import ILikedCardLimit from '../components/dashboards/ILikedCardLimit';
import BcmhztLinkCollections from '../components/dashboards/BcmhztLinkCollections';
import ReferralEntries from '../components/dashboards/ReferralEntries';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PortalNewsLimited from '../components/news/PortalNewsLimited';

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

            <h2 className="page-title mb20">Dashboard</h2>

            {/* <ArchtectTemplate /> */}
            <TopLinkMenu />
            <LikedMeCardLimit />
            <MatchedMemberLimit />
            <ILikedCardLimit />
            <BcmhztLinkCollections />
          </div>
          <div className="col-12 col-md-6 bc-right dashboard">
            <ReferralEntries />
            <PortalNewsLimited />
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
  );
};
export default Dashboard;

import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import PostBoard from '../components/PostBoard';
import Instructor from '../components/Instructor';
// import FooterTool from '../components/FooterTool';
// import MemberList from '../components/v1/member/Memberlist';
// import MatchedMemberLimit from '../components/v1/dashboard/MatchedMemberLimit';
// import ArchtectTemplate from '../components/dashboards/ArchtectTemplate';
import LikedMemberLimit from '../components/dashboards/LikedMemberLimit';
import MatchedMemberLimit from '../components/dashboards/MatchedMemberLimit';
import MyLikedMemberLimit from '../components/dashboards/MyLikedMemberLimit';
import BcmhztLinkCollections from '../components/dashboards/BcmhztLinkCollections';
import ReferralEntries from '../components/dashboards/ReferralEntries';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/Dashboard.tsx:xx] debug:', debug);
}

const Dashboard = () => {
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left dashboard">
            <div className="dashboard-instructor">
              <Instructor />
            </div>
            <h2>Dashboard</h2>
            {/* <ArchtectTemplate /> */}
            <LikedMemberLimit />
            <MatchedMemberLimit />
            <MyLikedMemberLimit />
            <BcmhztLinkCollections />
          </div>
          <div className="d-none d-md-block col-md-6 bc-right">
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

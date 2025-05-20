/** 201c651f */
import React from 'react';
/* header */
import Header from '../../components/Header';
import Footer from "../../components/Footer";

/* tools */
// import PostBoard from '../../components/PostBoard';
// import FooterTool from '../../components/FooterTool';
import MemberList from '../..//components/members/Memberlist';
// import Imagelist from '../../components/v1/member/Imagelist';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log("[src/pages/member/Members.tsx:xx] debug:", debug);
}

/**
 * 201c651f (hash)
 * [src/pages/member/Members.tsx:xx]
 * 
 * type: page
 * 
 * [Order]
 * - 各Componentの雛形
 */

/* ユーザーリスト */
const Members = () => {

  return(
    <div className="app-body">
      <Header />

      {/* <PostBoard />
      <FooterTool /> */}

      <div className="container bc-app">
        <div className="row">

          <div className="col-12 col-md-6 bc-left">
            <MemberList />
          </div>

          <div className="d-none d-md-block col-md-6 bc-right">
            bar
            {/* <Imagelist /> */}
          </div>
          
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Members;
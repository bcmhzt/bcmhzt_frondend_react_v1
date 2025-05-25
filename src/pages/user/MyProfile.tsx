// import PostBoard from '../components/PostBoard';
import MyAvatar from '../../components/users/MyAvatar';
import MyProfileDetails from '../../components/users/MyProfileDetails';
import MyProfileBase from '../../components/users/MyProfileBase';
import Propensity from '../../components/users/Propensity';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

const MyProfile = () => {
  return (
    <>
      <Header />
      <div className="container myprofile mt50">
        <div className="row">
          <div className="col-lg-6 main-section mb50">
            {/* Firebase profile<br></br> */}
            <div className="myprofile">
              <MyAvatar />
            </div>
            <div className="myprofile-base mt50">
              <MyProfileBase />
              <Propensity />
            </div>
          </div>
          <div className="col-lg-6 sub-section mb100">
            <div className="myprofile-details mt20">
              <MyProfileDetails />
            </div>
          </div>
        </div>
      </div>
      {/* <PostBoard /> */}
      <Footer />
    </>
  );
};
export default MyProfile;

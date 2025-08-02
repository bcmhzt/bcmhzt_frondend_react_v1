/** 105ca813 */
// import PostBoard from '../components/PostBoard';
import MyAvatar from '../../components/users/MyAvatar';
import MyProfileDetails from '../../components/users/MyProfileDetails';
import MyProfileBase from '../../components/users/MyProfileBase';
import Propensity from '../../components/users/Propensity';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyPropensitiesBase from '../../components/users/MyPropensitiesBase';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

const MyProfile = () => {
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left profile">
            <div className="myprofile">
              <MyAvatar />
            </div>
            <div className="myprofile-base mt50">
              <MyProfileBase />
              <MyPropensitiesBase />
              <Propensity />
            </div>
          </div>
          <div className="col-12 col-md-6 bc-right profile">
            <MyProfileDetails />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default MyProfile;

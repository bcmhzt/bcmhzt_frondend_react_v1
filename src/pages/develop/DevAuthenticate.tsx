import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from  "../../contexts/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { IdTokenResult } from "firebase/auth";
import dummyAvatar from '../../assets/images/dummy/dummy-avatar.png';
import {getImageWithSuffix} from "../../utility/GetUseImage";
import {getGenderJp, getAgeRangeJp} from "../../utility/GetCommonFunctions";

const DevAuthenticate = () => {
  const auth = useAuth();
  const {
    currentUser,
    currentUserProfile,
    token,
    uid,
    // imageUrl,
    myProfileImage,
    // error,
    // loading,
    isLogin,
    // logout,
  } = auth || {};
  const [tokenResult, setTokenResult] = useState<IdTokenResult | null>(null);

  useEffect(() => {
    if (currentUser) {
      currentUser
        .getIdTokenResult(/* forceRefresh= */ false)
        .then(result => setTokenResult(result))
        .catch(console.error);
    }
  }, [currentUser]);

  return (
    <>
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-6 bc-left">

            <div className="section mb20">
              <h2 className="mb30">User Authentcation Data</h2>

              <table className="devauthenticate table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>key</th>
                    <th>value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>isLogin</td>
                    <td>{JSON.stringify(isLogin, null, 2)}</td>
                  </tr>
                  <tr>
                    <td>uid</td>
                    <td>{currentUser?.uid}</td>
                  </tr>
                  <tr>
                    <td>token</td>
                    <td>
                      <textarea className="form-control" rows={10} readOnly>
                        {token}
                      </textarea>
                      {/* <pre>{JSON.stringify(token, null, 2)}</pre> */}
                    </td>
                  </tr>
                  <tr>
                    <td>expirationTime</td>
                    <td>
                      {tokenResult
                        ? new Date(tokenResult.expirationTime).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td>email</td>
                    <td>{currentUser?.email}</td>
                  </tr>
                  <tr>
                    <td>emailVerified</td>
                    <td>{JSON.stringify(currentUser?.emailVerified, null, 2)}</td>
                  </tr>
                  <tr>
                    <td>isAnonymous</td>
                    <td>{JSON.stringify(currentUser?.isAnonymous, null, 2)}</td>
                  </tr>
                  <tr>
                    <td>providerData</td>
                    <td><pre>{JSON.stringify(currentUser?.providerData, null, 2)}</pre></td>
                  </tr>
                  <tr>
                    <td>createdAt</td>
                    <td>
                      {currentUser?.metadata?.creationTime
                        ? new Date(currentUser.metadata.creationTime).toLocaleString("ja-JP", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          }).replace(/\//g, "/").replace(/(\d{4})\/(\d{2})\/(\d{2})/, "$1/$2/$3").replace(/(\d{2}):(\d{2}):\d{2}/, "$1:$2")
                        : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td>lastLoginAt</td>
                    <td>
                      {currentUser?.metadata?.lastSignInTime
                        ? new Date(currentUser.metadata.lastSignInTime).toLocaleString("ja-JP", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          }).replace(/\//g, "/").replace(/(\d{4})\/(\d{2})\/(\d{2})/, "$1/$2/$3").replace(/(\d{2}):(\d{2}):\d{2}/, "$1:$2")
                        : "—"}
                    </td>
                  </tr>

                </tbody>
              </table>

              <h2 className="mb30">Profiles</h2>

              <table className="devauthenticate table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>key</th>
                    <th>value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>profile image</td>
                    <td>
                      <img
                        src={getImageWithSuffix(myProfileImage ?? '', '_thumbnail') || dummyAvatar}
                        alt="logo"
                        className="header-avatar"
                      />
                      <div>{currentUserProfile?.user_profile?.profile_images}</div>
                    </td>
                  </tr>
                  <tr>
                    <td>id</td>
                    <td>{currentUserProfile?.user_profile?.id}</td>
                  </tr>
                  <tr>
                    <td>nickname</td>
                    <td>{currentUserProfile?.user_profile?.nickname}</td>
                  </tr>
                  <tr>
                    <td>bcuid</td>
                    <td>{currentUserProfile?.user_profile?.bcuid}</td>
                  </tr>
                  <tr>
                    <td>description</td>
                    <td>
                      <textarea className="form-control" rows={5} readOnly>
                        {currentUserProfile?.user_profile?.description}
                      </textarea>
                      {/* {currentUserProfile?.user_profile?.description} */}
                    </td>
                  </tr>
                  <tr>
                    <td>status</td>
                    <td>{currentUserProfile?.user_profile?.status}</td>
                  </tr>
                  <tr>
                    <td>created_at</td>
                    <td>{currentUserProfile?.user_profile?.created_at}</td>
                  </tr>
                  <tr>
                    <td>updated_at</td>
                    <td>{currentUserProfile?.user_profile?.updated_at}</td>
                  </tr>
                </tbody>
              </table>

              
              <h2 className="mb30">Profiles</h2>

              <table className="devauthenticate table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>key</th>
                    <th>value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>gender</td>
                    <td>
                      {getGenderJp(currentUserProfile?.user_detail?.gender)}
                    </td>
                  </tr>
                  <tr>
                    <td>gender_detail</td>
                    <td>
                      {currentUserProfile?.user_detail?.gender_detail}
                    </td>
                  </tr>
                  <tr>
                    <td>age</td>
                    <td>
                      {currentUserProfile?.user_detail?.age}
                    </td>
                  </tr>
                  <tr>
                    <td>location</td>
                    <td>
                      {currentUserProfile?.user_detail?.location}
                    </td>
                  </tr>
                  <tr>
                    <td>occupation_type</td>
                    <td>
                      {currentUserProfile?.user_detail?.occupation_type}
                    </td>
                  </tr>
                  <tr>
                    <td>height</td>
                    <td>
                      {currentUserProfile?.user_detail?.bheight} cm
                    </td>
                  </tr>
                  <tr>
                    <td>weight</td>
                    <td>
                      {currentUserProfile?.user_detail?.bweight} kg
                    </td>
                  </tr>
                  <tr>
                    <td>blood_type</td>
                    <td>
                      {currentUserProfile?.user_detail?.blood_type}
                    </td>
                  </tr>
                  <tr>
                    <td>academic_background</td>
                    <td>
                      {currentUserProfile?.user_detail?.academic_background}
                    </td>
                  </tr>
                  <tr>
                    <td>marital_status</td>
                    <td>
                      {currentUserProfile?.user_detail?.marital_status}
                    </td>
                  </tr>
                  <tr>
                    <td>hobbies_lifestyle</td>
                    <td>
                      {currentUserProfile?.user_detail?.hobbies_lifestyle}
                    </td>
                  </tr>
                  <tr>
                    <td>alcohol</td>
                    <td>
                      {currentUserProfile?.user_detail?.alcohol}
                    </td>
                  </tr>
                  <tr>
                    <td>tobacco</td>
                    <td>
                      {currentUserProfile?.user_detail?.tobacco}
                    </td>
                  </tr>
                  <tr>
                    <td>pet</td>
                    <td>
                      {currentUserProfile?.user_detail?.pet}
                    </td>
                  </tr>
                  {/* <tr>
                    <td>holidays</td>
                    <td>
                      {currentUserProfile?.user_detail?.holidays}
                    </td>
                  </tr> */}
                  <tr>
                    <td>favorite_food</td>
                    <td>
                      {currentUserProfile?.user_detail?.favorite_food}
                    </td>
                  </tr>
                  <tr>
                    <td>character</td>
                    <td>
                      {currentUserProfile?.user_detail?.character}
                    </td>
                  </tr>
                  <tr>
                    <td>religion</td>
                    <td>
                      {currentUserProfile?.user_detail?.religion}
                    </td>
                  </tr>
                  {/* <tr>
                    <td>belief</td>
                    <td>
                      {currentUserProfile?.user_detail?.belief}
                    </td>
                  </tr> */}
                  <tr>  
                    <td>conditions_ideal_partner</td>
                    <td>
                      {currentUserProfile?.user_detail?.conditions_ideal_partner}
                    </td>
                  </tr>
                  <tr>
                    <td>age_range</td>
                    <td>
                      {getAgeRangeJp(currentUserProfile?.user_detail?.age_range)}
                    </td>
                  </tr>
                  <tr>
                    <td>target_area</td>
                    <td>
                      {currentUserProfile?.user_detail?.target_area}
                    </td>
                  </tr>
                  <tr>
                    <td>marriage_aspiration</td>
                    <td>
                      {currentUserProfile?.user_detail?.marriage_aspiration}
                    </td>
                  </tr>
                  <tr>
                    <td>self_introductory_statement</td>
                    <td>
                      {currentUserProfile?.user_detail?.self_introductory_statement}
                    </td>
                  </tr>
                  {/* <tr>
                    <td>others_options</td>
                    <td>
                      {currentUserProfile?.user_detail?.others_options}
                    </td>
                  </tr>
                  <tr>
                    <td>profile_video</td>
                    <td>
                      {currentUserProfile?.user_detail?.profile_video}
                    </td>
                  </tr> */}
                  <tr>
                    <td>created_at</td>
                    <td>
                      {currentUserProfile?.user_detail?.created_at}
                    </td>
                  </tr>
                  <tr>  
                    <td>updated_at</td>
                    <td>
                      {currentUserProfile?.user_detail?.updated_at}
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
          <div className="d-none d-md-block col-md-6 col-lg-6 bc-right">
            <div className="section mb20">
              <h2>DevAuthenticate row data</h2>
              <h3>currentUser</h3>
              <pre>{JSON.stringify(currentUser, null, 2)}</pre>
              <h3>currentUserProfile</h3>
              <pre>{JSON.stringify(currentUserProfile, null, 2)}</pre>
              <h3>token</h3>
              <pre>{JSON.stringify(token, null, 2)}</pre>
              <h3>uid</h3>
              <pre>{JSON.stringify(uid, null, 2)}</pre>
            </div>
            
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};
export default DevAuthenticate;



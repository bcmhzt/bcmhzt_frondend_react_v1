import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { XLg } from 'react-bootstrap-icons';

// 型定義ファイルからUserProfile型をインポート（パスは実際の型定義ファイルに合わせて修正してください）
// import type { UserProfile } from '../types/UserProfile';

// src/components/Instructor.js
// [src/components/Instructor.js]
// instructor
// instructor	instructor	instructor	Instructor	instructor

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/Instructor.js:13] debug:', debug);
}

const Instructor = () => {
  const { currentUserProfile, isLogin } = useAuth();
  const [nicknameInstructor, setNicknameInstructor] = useState<string | null>(
    null
  );
  const [descriptionInstructor, setDescriptionInstructor] = useState<
    string | null
  >(null);
  const [profileImagesInstructor, setProfileImagesInstructor] = useState<
    string | null
  >(null);
  /* 全体表示の判定 (非表示のときはfalseにする) */
  const [instructorStatus, setInstructorStatus] = useState(false);

  if (debug === 'true') {
    console.log('[src/components/Instructor.js:25] isLogin - ', isLogin);
    console.log(
      '[src/components/Instructor.js:26] currentUserProfile - ',
      currentUserProfile
    );
  }

  /**
   * プロファイルをまだ書いていない人に、書くように促します
   * currentUserProfile
   */
  useEffect(() => {
    const profile = currentUserProfile?.user_profile;
    if (!profile) return;

    // console.log('[Instructor] useEffect start');
    // console.count('[Instructor] useEffect fired');

    if (debug === 'true') {
      console.log(
        '[src/components/Instructor.js:33] description - ',
        currentUserProfile?.user_profile?.description
      );
      console.log(
        '[src/components/Instructor.js:33] nickname - ',
        currentUserProfile?.user_profile?.nickname
      );
      console.log(
        '[src/components/Instructor.js:33] profile_image - ',
        currentUserProfile?.user_profile?.profile_image
      );
    }

    if (
      currentUserProfile?.user_profile?.description === null &&
      currentUserProfile?.user_profile?.nickname === null &&
      !currentUserProfile?.user_profile?.profile_image
    ) {
      setInstructorStatus(true);
    } else {
      /** 強制的に表示させるときは、ここをtrueにする */
      setInstructorStatus(true);
    }

    if (currentUserProfile?.user_profile?.description === null) {
      setDescriptionInstructor('自己紹介文を書きましょう');
    }
    if (currentUserProfile?.user_profile?.nickname === 'no nickname') {
      setNicknameInstructor('ニックネームを設定しましょう');
    }
    if (!currentUserProfile?.user_profile?.profile_image) {
      setProfileImagesInstructor('プロフィール画像を追加しましょう');
    }

    // Auto-hide the instructor list after 10 seconds
    // const timer = setTimeout(() => {
    //   setInstructorStatus(true); // Hide the instructor list
    // }, 100000);

    // Clear timer if component unmounts
    // return () => clearTimeout(timer);
  }, [currentUserProfile]);

  return (
    <>
      {/* <pre>{JSON.stringify(currentUserProfile, null, 2)}</pre>
      <pre>{JSON.stringify(instructorStatus, null, 2)}</pre> */}
      {instructorStatus && (
        <div className="instructor-list">
          <span
            onClick={() => setInstructorStatus(false)}
            className="close-button"
          >
            <XLg style={{ fontSize: '23px', cursor: 'pointer' }} />
          </span>
          <div className="mt40 mb10 ml10 mr10">
            <span style={{ fontSize: '22px' }}>
              Bcmhztに登録ありがとうございます
            </span>
          </div>
          <ul>
            {descriptionInstructor && (
              <li
                style={{ fontSize: '30px', fontWeight: 'bold', color: '#434' }}
              >
                {descriptionInstructor}{' '}
              </li>
            )}
            {nicknameInstructor && (
              <li style={{ fontSize: '16px' }}>{nicknameInstructor}</li>
            )}
            {profileImagesInstructor && (
              <li style={{ fontSize: '23px' }}>{profileImagesInstructor}</li>
            )}
          </ul>
          <p className="ml20 mr10">
            プロフィールを記入しないと、このWEBサービスは使えません。
          </p>
          <div className="edit-profile">
            <button
              className="btn btn-primary btn-bc-main"
              onClick={() => (window.location.href = '/myprofile')}
            >
              プロフィールを変更する
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default Instructor;

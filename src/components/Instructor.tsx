/** ec46447e */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { XLg } from 'react-bootstrap-icons';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/Instructor.tsx:xx] debug:', debug);
}

/**
 * ec46447e
 * [src/components/Instructor.tsx:xx]
 *
 * type: component
 *
 * [Order]
 * - プロフィールの必須項目のチェック
 * - 画像、ニックネーム、性別、年齢、地域）をチェックして、入力や更新を促す
 * - ひとつでも未入力があったらこの画面を出す。（instructorStatus）
 */

const Instructor = () => {
  const { currentUserProfile } = useAuth();
  /* 全体表示の判定 (非表示のときはfalseにする) */
  const [instructorStatus, setInstructorStatus] = useState(false);

  useEffect(() => {
    /* プロフィール画像の確認 */
    if (
      currentUserProfile?.user_profile?.profile_images === null ||
      currentUserProfile?.user_profile?.nickname === null ||
      currentUserProfile?.user_profile?.description === null ||
      currentUserProfile?.user_detail.gender === null ||
      currentUserProfile?.user_detail.location === null ||
      currentUserProfile?.user_detail.age === null
    ) {
      setInstructorStatus(true);
    } else {
      setInstructorStatus(false);
    }
    /* develop & test */
    // setInstructorStatus(true);

    const timer = setTimeout(() => {
      setInstructorStatus(false);
    }, 120000);
    return () => clearTimeout(timer);
  }, [currentUserProfile]);

  return (
    <>
      {/* <pre>
        profile_images:
        {JSON.stringify(
          currentUserProfile?.user_profile?.profile_images,
          null,
          2
        )}
      </pre>
      <pre>
        nickname:
        {JSON.stringify(currentUserProfile?.user_profile?.nickname, null, 2)}
      </pre>
      <pre>
        description:
        {JSON.stringify(currentUserProfile?.user_profile?.description, null, 2)}
      </pre>
      <pre>
        gender:
        {JSON.stringify(currentUserProfile?.user_detail?.gender, null, 2)}
      </pre>
      <pre>
        location:
        {JSON.stringify(currentUserProfile?.user_detail?.location, null, 2)}
      </pre>
      <pre>
        age:
        {JSON.stringify(currentUserProfile?.user_detail?.age, null, 2)}
      </pre>
      <pre>
        open/close:
        {JSON.stringify(instructorStatus, null, 2)}
      </pre> */}

      {instructorStatus && (
        <div className="dashboard-instructor">
          <span
            onClick={() => setInstructorStatus(false)}
            className="close-button"
          >
            <XLg style={{ fontSize: '23px', cursor: 'pointer' }} />
          </span>
          <h3>Bcmhztに登録ありがとうございます</h3>
          <ul>
            {currentUserProfile?.user_profile?.profile_images === null && (
              <li>
                <span className="enhunce">プロフィール画像</span>
                を設定してください。放っておくとシステムが勝手に適当な画像を設定します。
              </li>
            )}
            {currentUserProfile?.user_profile?.nickname === null && (
              <li>
                <span className="enhunce">ニックネーム</span>
                を設定してください。放っておくとシステムにより適当な名前を授けます。
              </li>
            )}

            {currentUserProfile?.user_profile?.description === null && (
              <li>
                <span className="enhunce">自己紹介文</span>
                を作成してください。放っておくとシステムが適当な自己紹介を設定します。
              </li>
            )}
            {currentUserProfile?.user_detail?.gender === null && (
              <li>
                <span className="enhunce">性別</span>
                を設定してください。あるいは、性別を選択しないという選択ができます。
              </li>
            )}
            {currentUserProfile?.user_detail?.location === null && (
              <li>
                <span className="enhunce">地域</span>
                を設定してください。地域の設定は大切です。
              </li>
            )}
            {currentUserProfile?.user_detail?.age === null && (
              <li>
                <span className="enhunce">年齢</span>を設定してください。
              </li>
            )}
          </ul>
          <p className="ml20 mr10">
            プロフィールを記入しないと、このWEBサービスは使えません。というか、マッチングのアルゴリズムが迷います。
          </p>
          <div className="edit-profile mb20 ml10">
            <button
              className="btn btn-primary btn-bc-main bcmhzt-btn"
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

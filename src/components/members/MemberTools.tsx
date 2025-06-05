import React, { useState, useEffect, useCallback } from 'react';
import {
  ThreeDotsVertical,
  HeartFill,
  X,
  Ban,
  Flag,
  // PersonWalking,
  // PersonStanding,
  // PersonArmsUp,
  // PersonStandingDress,
  // Bookmark,
  // Heart,
  // ChatDots,
  // BoxArrowDown
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useMessage } from '../../contexts/MessageContext';
import { Link } from 'react-router-dom';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/v1/member/MemberTools.js:23] debug:', debug);
}

type MemberToolsProps = {
  targetBcuid: string;
};

const MemberTools = ({ targetBcuid }: MemberToolsProps) => {
  const [isLike, setIsLike] = useState(false);
  const { currentUserProfile, token } = useAuth();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { showMessage } = useMessage();
  const [showModal, setShowModal] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);

  useEffect(() => {
    async function fetchInitialLikeStatus() {
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/get/like_status/${targetBcuid}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        /* APIのレスポンスに合わせて、isLikeに対応する値をセット */
        if (debug === 'true') {
          console.log(
            '[src/components/v1/member/MemberTools.js:42] fetchInitialLikeStatus response:',
            [response]
          );
        }
        setIsLike(response.data.data);
      } catch (error) {
        console.error(
          '[src/components/v1/member/MemberTools.js:42] fetchInitialLikeStatus Failed to retrieve initial like status.',
          error
        );
      }
    }
    fetchInitialLikeStatus();
  }, [apiEndpoint, token, isLike, targetBcuid]);

  /* Like or unlike */
  const toggleMemberLike = useCallback(async () => {
    if (debug === 'true') {
      console.log(
        '[src/components/v1/member/MemberTools.js:55] toggleMemberLike',
        [isLike]
      );
    }
    setIsLike((prev) => !prev);

    const bcuid = currentUserProfile.user_profile.bcuid;

    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/toggle/like/${targetBcuid}`,
        {
          reason: 'comment', // 2025-03-28時点では未使用なのでデフォルト値
          level: 1, // 2025-03-28時点では未使用なのでデフォルト値
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (debug === 'true') {
        console.log('[src/components/v1/member/MemberTools.js:38] response:', [
          response,
        ]);
      }

      if (response.status === 201) {
        if (!isLike) {
          if (debug === 'true') {
            console.log(
              '[src/components/v1/member/MemberTools.js:25] ' +
                bcuid +
                'が、' +
                targetBcuid +
                'に、ナイススケベした'
            );
          }
          showMessage('ナイススケベしました！', 'success', 3000);
        } else {
          if (debug === 'true') {
            console.log(
              '[src/components/v1/member/MemberTools.js:25] ' +
                bcuid +
                'が、' +
                targetBcuid +
                'に、ナイススケベを解除した'
            );
          }
          showMessage('ナイススケベを解除しました！', 'success', 3000);
        }
      }
    } catch (error) {
      console.log('[src/components/v1/member/MemberTools.js:48] ', [error]);
    }
  }, [
    isLike,
    apiEndpoint,
    currentUserProfile.user_profile.bcuid,
    targetBcuid,
    token,
    showMessage,
  ]);

  /** Block confirm */
  const handleBlock = async () => {
    if (debug === 'true') {
      // subject
      console.log(
        '[src/components/v1/member/MemberTools.js:99] handleBlock who?: ',
        currentUserProfile.user_profile.uid
      );
      // targetBcuid
      console.log(
        '[src/components/v1/member/MemberTools.js:99] handleBlock target bcuid: ',
        targetBcuid
      );
      // APIで更新
    }
    setShowBlockConfirmModal(true);
    // showMessage('ブロックしました！', 'error', 3000);
    setShowModal(false);
  };

  /** Block exec */
  const handleFinishBlock = async () => {
    if (debug === 'true') {
      // subject
      console.log(
        '[src/components/v1/member/MemberTools.js:99] handleFinishBlock who?: ',
        currentUserProfile.user_profile.uid
      );
      // targetBcuid
      console.log(
        '[src/components/v1/member/MemberTools.js:99] handleFinishBlock target bcuid: ',
        targetBcuid
      );
      // APIで更新
    }

    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/create/block/${targetBcuid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (debug === 'true') {
        console.log(
          '[src/components/v1/member/MemberTools.js:130] handleFinishBlock response:',
          [response]
        );
      }
    } catch (error) {
      console.log('[src/components/v1/member/MemberTools.js:135] error:', [
        error,
      ]);
    } finally {
      showMessage('ブロックしました。', 'success', 3000);
      setShowBlockConfirmModal(false);
    }

    // try {
    //   const response = await axios.post(`${apiEndpoint}/v1/member/block/${targetBcuid}`, {}, {
    //     headers: {
    //       'Authorization': `Bearer ${token}`
    //     }
    //   });

    //   if (debug === 'true') {
    //     console.log("[src/components/v1/member/MemberTools.js:130] response:", [response]);
    //   }
    //   if (response.status === 201) {
    //     showMessage('ブロックしました！', 'error', 3000);
    //   }
    // } catch (error) {
    //   console.log("[src/components/v1/member/MemberTools.js:139] ", [error]);
    // }
  };

  /** 通報 */
  const handleReport = async () => {
    if (debug === 'true') {
      // subject
      console.log(
        '[src/components/v1/member/MemberTools.js:99] handleReport: ',
        currentUserProfile.user_profile.uid
      );
      // targetBcuid
      console.log(
        '[src/components/v1/member/MemberTools.js:99] handleReport: ',
        targetBcuid
      );
      // APIで更新
    }

    // /v1/member/report/{buid}
    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/member/report/${targetBcuid}`,
        {
          content_type: 'profile', // 2025-03-28時点では未使用なのでデフォルト値
          comment: 'hoge', // 2025-03-28時点では未使用なのでデフォルト値
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (debug === 'true') {
        console.log('[src/components/v1/member/MemberTools.js:130] response:', [
          response,
        ]);
      }
      if (response.status === 201) {
        showMessage('通報しました！', 'warning', 3000);
      }
    } catch (error) {
      console.log('[src/components/v1/member/MemberTools.js:139] ', [error]);
    }
    setShowModal(false);
  };

  return (
    <>
      {currentUserProfile.user_profile.bcuid !== targetBcuid && (
        <>
          <div id="member-tools">
            <div className="member-tools-box d-flex justify-content-end">
              <div className="like-box mr10" onClick={toggleMemberLike}>
                {isLike ? (
                  <div className="like-box-button-on">
                    <HeartFill className="like-on" />
                    <span className="like-on-text">ナイススケベ</span>
                  </div>
                ) : (
                  <div className="like-box-button-off">
                    <HeartFill className="like-off" />
                    <span className="like-off-text">ナイススケベ</span>
                  </div>
                )}
              </div>

              <div className="menu-box">
                <ThreeDotsVertical
                  style={{ fontSize: '20px', color: '#666', cursor: 'pointer' }}
                  onClick={() => setShowModal(true)}
                />
              </div>
            </div>
          </div>

          {/* Bootstrap Modal */}
          {showModal && (
            <div
              className="modal menu-box-modal show d-block"
              tabIndex={-1}
              role="dialog"
            >
              <div
                className="modal-dialog menu-box-modal-dialog"
                role="document"
              >
                <div className="modal-content menu-box-modal-content">
                  <div className="modal-body menu-box-modal-body">
                    <X
                      type="button"
                      className="close"
                      onClick={() => setShowModal(false)}
                      style={{
                        fontSize: '30px',
                        color: '#333',
                        cursor: 'pointer',
                      }}
                    />
                    <div className="menu-box-items">
                      <ul>
                        <li
                          className="item-block"
                          onClick={() => handleBlock()}
                        >
                          <Ban
                            style={{
                              fontSize: '20px',
                              color: '#880000',
                              marginRight: '8px',
                            }}
                          />
                          ブロックする
                        </li>
                        <li
                          className="item-report"
                          onClick={() => handleReport()}
                        >
                          <Flag
                            style={{
                              fontSize: '20px',
                              color: '#333',
                              marginRight: '8px',
                            }}
                          />
                          通報する
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showBlockConfirmModal && (
            <>
              <div
                className="modal menu-box-modal show d-block"
                tabIndex={-1}
                role="dialog"
              >
                <div
                  className="modal-dialog menu-box-modal-dialog"
                  role="document"
                >
                  <div className="modal-content menu-box-modal-content">
                    <div className="modal-body menu-box-modal-body">
                      <X
                        type="button"
                        className="close"
                        onClick={() => setShowBlockConfirmModal(false)}
                        style={{
                          fontSize: '30px',
                          color: '#333',
                          cursor: 'pointer',
                        }}
                      />
                      <div className="block-confirm-modal">
                        <p className="block-message">
                          本当にブロックしますか？
                          <br />
                          ブロックすると、
                          <Link to={`/member/${targetBcuid}`}>
                            このメンバー
                          </Link>
                          はあなたのプロフィールやメッセージが見えなくなります。
                        </p>

                        <ul className="mt20">
                          <li>
                            <Link to={`/member/${targetBcuid}`}>
                              このメンバー
                            </Link>
                            はあなたのプロフィールを見ることができません。
                          </li>
                          <li>
                            あなたは
                            <Link to={`/member/${targetBcuid}`}>
                              このメンバー
                            </Link>
                            のプロフィールを見ることができます。
                          </li>

                          <li>
                            <Link to={`/member/${targetBcuid}`}>
                              このメンバー
                            </Link>
                            はあなたの投稿を見ることができません。
                          </li>
                          <li>
                            あなたはこのメンバーの投稿を見ることができます。
                          </li>

                          <li>
                            <Link to={`/member/${targetBcuid}`}>
                              このメンバー
                            </Link>
                            はあなたにナイススケベ・いいね・返信・ブックマークなどができません。
                          </li>
                          <li>
                            あなたはこのメンバーにナイススケベ・いいね・返信・ブックマークなどができますが、
                            <Link to={`/v1/member/${targetBcuid}`}>
                              このメンバーに
                            </Link>
                            表示されません。
                          </li>

                          <li>
                            Notice（通知）のこれまでの双方の通知の内容は削除されます。解除後も復旧しません。
                          </li>
                          <li>
                            これまでの双方のメッセージの内容は削除されます。解除後も復旧しません。
                          </li>
                        </ul>
                        <div className="d-flex justify-content-end mt30">
                          <button
                            type="button"
                            className="btn btn-secondary mr10"
                            onClick={() => setShowBlockConfirmModal(false)}
                          >
                            キャンセル
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-block"
                            onClick={() => handleFinishBlock()}
                          >
                            ブロックする
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};
export default MemberTools;

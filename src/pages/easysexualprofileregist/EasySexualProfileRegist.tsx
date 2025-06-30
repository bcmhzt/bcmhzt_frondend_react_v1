import React, { useState, useRef, useLayoutEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:xx] debug:',
    debug
  );
}

/** 簡易アンケート形式 */
const EasySexualProfileRegist: React.FC = () => {
  // モーダル表示フラグ（マウント時に自動オープン）
  const [showModal, setShowModal] = useState(true);
  const waitetime = 3000; // モーダル表示後の待機時間
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // block01: age
  const [keepBalloon01, setKeepBalloon01] = useState(false);
  const [showBlock01, setShowBlock01] = useState(false);
  const [selectedValue01, setSelectedValue01] = useState<number | ''>(0);
  const [keepReplyBalloon01, setKeepReplyBalloon01] = useState(false);
  const [showReplyBlock01, setShowReplyBlock01] = useState(false);

  // block02: gender
  const [keepBalloon02, setKeepBalloon02] = useState(false);
  const [showBlock02, setShowBlock02] = useState(false);
  const [selectedValue02, setSelectedValue02] = useState<number | ''>(0);
  const [keepReplyBalloon02, setKeepReplyBalloon02] = useState(false);
  const [showReplyBlock02, setShowReplyBlock02] = useState(false);

  // block03: location
  const [keepBalloon03, setKeepBalloon03] = useState(false);
  const [showBlock03, setShowBlock03] = useState(false);
  const [selectedValue03, setSelectedValue03] = useState<string | ''>('');
  const [keepReplyBalloon03, setKeepReplyBalloon03] = useState(false);
  const [showReplyBlock03, setShowReplyBlock03] = useState(false);

  // block04: domi&sub
  const [keepBalloon04, setKeepBalloon04] = useState(false);
  const [showBlock04, setShowBlock04] = useState(false);
  const [selectedValue04, setSelectedValue04] = useState<string | ''>('');
  const [keepReplyBalloon04, setKeepReplyBalloon04] = useState(false);
  const [showReplyBlock04, setShowReplyBlock04] = useState(false);

  useLayoutEffect(() => {
    if (
      //01
      keepBalloon01 ||
      showBlock01 ||
      keepReplyBalloon01 ||
      showReplyBlock01 ||
      //02
      keepBalloon02 ||
      showBlock02 ||
      showReplyBlock02 ||
      keepReplyBalloon02 ||
      showReplyBlock02 ||
      //03
      keepBalloon03 ||
      showBlock03 ||
      showReplyBlock03 ||
      keepReplyBalloon03 ||
      showReplyBlock03 ||
      //04
      keepBalloon04 ||
      showBlock04 ||
      showReplyBlock04 ||
      keepReplyBalloon04 ||
      showReplyBlock04 ||
      (showReplyBlock04 && modalBodyRef.current)
    ) {
      const el = modalBodyRef.current;
      // el.scrollTop = el.scrollHeight; // 一気に最下部へ
      if (el) {
        el.scrollTo({
          // スムーズにしたいならこちら
          top: el.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [
    //01
    keepBalloon01,
    showBlock01,
    keepReplyBalloon01,
    showReplyBlock01,
    //02
    keepBalloon02,
    showBlock02,
    showReplyBlock02,
    keepReplyBalloon02,
    //03
    keepBalloon03,
    showBlock03,
    keepReplyBalloon03,
    showReplyBlock03,
    //04
    keepBalloon04,
    showBlock04,
    keepReplyBalloon04,
    showReplyBlock04,
  ]);

  function openBlock01() {
    console.log(
      '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:31] openBlock01 called'
    );
    setKeepBalloon01(true); // 最初に...バルーンを表示
    setShowBlock01(false); // 最初は、質問は非表示にする
    setTimeout(() => {
      setKeepBalloon01(false); // ...バルーンを消す
      setShowBlock01(true); // 質問を表示
    }, waitetime);
  }

  function updateBlock01(value01: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:56] updateBlock01 called with value: ${value01}`
    );
    setKeepReplyBalloon01(true); // 返信のバルーンを表示
    setShowReplyBlock01(false); // 返信のメッセージは非表示
    //年齢をAPI経由で保存
    setTimeout(() => {
      setSelectedValue01(Number(value01));
      setKeepReplyBalloon01(false); // 返信のバルーンを消す
      setShowReplyBlock01(true); // 返信のメッセージは表示

      //02へ
      setKeepBalloon02(true);
      setTimeout(() => {
        setKeepBalloon02(false);
        setShowBlock02(true);
      }, waitetime);
    }, waitetime);
  }

  function updateBlock02(value02: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:72] updateBlock02 called with value: ${value02}`
    );
    setKeepReplyBalloon02(true); // 返信のバルーンを表示
    setShowReplyBlock02(false); // 返信のメッセージは非表示
    //性別をAPI経由で保存
    setTimeout(() => {
      setSelectedValue02(Number(value02));
      setKeepReplyBalloon02(false);
      setShowReplyBlock02(true);

      //03へ
      setKeepBalloon03(true);
      setTimeout(() => {
        setKeepBalloon03(false);
        setShowBlock03(true);
      }, waitetime);
    }, waitetime);
  }

  function updateBlock03(value: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:88] updateBlock03 called with value: ${value}`
    );
    setKeepReplyBalloon03(true);
    //住んでいる場所をAPI経由で保存
    //返信のバルーンを表示
    setTimeout(() => {
      setKeepReplyBalloon03(false);
      setSelectedValue03(String(value));
      setShowReplyBlock03(true);

      // モーダル本文だけスクロール
      setTimeout(() => {
        const el = modalBodyRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      }, 0);
    }, waitetime);

    //04へ
    setKeepBalloon04(true);
    setTimeout(() => {
      setKeepBalloon04(false);
      setShowBlock04(true);
    }, waitetime);
  }

  function updateBlock04(value: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:104] updateBlock04 called with value: ${value}`
    );
    setKeepReplyBalloon04(true);
    //ドミナント・サブミッシブをAPI経由で保存
    //返信のバルーンを表示
    setTimeout(() => {
      setKeepReplyBalloon04(false);
      setSelectedValue04(String(value));
      setShowReplyBlock04(true);
    }, waitetime);

    // モーダル本文だけスクロール
    setTimeout(() => {
      const el = modalBodyRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }

  // ダミーのタイピングドット
  const TypingDots = () => {
    return (
      <div className="dummy-balloon">
        <span className="typing-dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    );
  };

  // 性癖アドバイザー
  const Advisor = () => {
    return (
      <div className="avatar">
        <img
          src="/assets/images/advisor.png"
          alt="Avatar"
          className="avatar-64"
        />{' '}
        <span className="advisor">性癖アドバイザー 担当 佐藤</span>
      </div>
    );
  };

  // ReplyBlock01
  const ReplyBlock01: React.FC<{ value01: string }> = ({ value01 }) => {
    return (
      <div className="reply-block mt20">
        <Advisor />
        <div className="balloon">{value01}代ですね。</div>
      </div>
    );
  };

  // ReplyBlock02
  const ReplyBlock02: React.FC<{ value02: string }> = ({ value02 }) => {
    if (value02 === '1') {
      value02 = '男性';
    } else if (value02 === '2') {
      value02 = '女性';
    } else if (value02 === '3') {
      value02 = 'どちらでもない';
    }
    return (
      <div className="reply-block mt20">
        <Advisor />
        <div className="balloon">{value02}ですね。</div>
      </div>
    );
  };

  // ReplyBlock03
  const ReplyBlock03: React.FC<{ value03: string }> = ({ value03 }) => {
    return (
      <div className="reply-block mt20">
        <Advisor />
        <div className="balloon">{value03}ですね。</div>
      </div>
    );
  };

  // ReplyBlock04
  const ReplyBlock04: React.FC<{ value04: string }> = ({ value04 }) => {
    return (
      <div className="reply-block mt20">
        <Advisor />
        <div className="balloon">{value04}ですね。</div>
      </div>
    );
  };

  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            お手軽プロフィール＆性癖登録
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              モーダルを開く
            </button>
            {/* モーダル本体 */}
            {showModal && (
              <>
                {/* バックドロップ */}
                <div className="modal-backdrop fade show" />

                <div
                  className="modal fade show d-block"
                  tabIndex={-1}
                  aria-labelledby="exampleModalLabel"
                  aria-modal="true"
                  role="dialog"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  <div
                    className="modal-dialog"
                    role="document"
                    style={{ pointerEvents: 'none' }}
                  >
                    <div
                      className="modal-content"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">
                          簡単性癖登録
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                        />
                      </div>
                      <div
                        className="modal-body"
                        ref={modalBodyRef}
                        style={{
                          maxHeight: '60vh', // 画面に応じて調整
                          overflowY: 'auto',
                        }}
                      >
                        <div className="start mb30">
                          <p>開始ボタンを押してスタートしてください。</p>
                          <button
                            type="button"
                            className="btn btn-secondary btn-lg bcmhzt-btn"
                            onClick={() => openBlock01()}
                          >
                            開始
                          </button>
                        </div>

                        {/* 年齢は？ ==================================*/}
                        <div className="age">
                          {/* 最初に待機する */}
                          {keepBalloon01 && !showBlock01 && (
                            <div className="block">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {/* 質問を表示 */}
                          {!keepBalloon01 && showBlock01 && (
                            <div className="block block01">
                              <Advisor />
                              <div className="balloon">
                                あなたの年齢をおしえてください。
                              </div>
                              <div className="select-area mt20">
                                <select
                                  style={{ width: '80%' }}
                                  className="form-select"
                                  aria-label="Default select example"
                                  onChange={(e) => {
                                    console.log(
                                      `Selected age: ${e.target.value}`
                                    );
                                    updateBlock01(e.target.value);
                                  }}
                                >
                                  <option value="" disabled selected>
                                    年齢を選択してください
                                  </option>
                                  <option value="20">20代</option>
                                  <option value="30">30代</option>
                                  <option value="40">40代</option>
                                  <option value="50">50代</option>
                                  <option value="60">60代</option>
                                </select>
                              </div>
                            </div>
                          )}
                          {/* 返信の待機... */}
                          {!showReplyBlock01 && keepReplyBalloon01 && (
                            <div className="reply-block mt20">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {/* 返信の表示 */}
                          {showReplyBlock01 && !keepReplyBalloon01 && (
                            <ReplyBlock01 value01={String(selectedValue01)} />
                          )}
                        </div>

                        {/* 性別は？ ==================================*/}
                        <div className="gender">
                          {/* 最初に待機する */}
                          {keepBalloon02 && !showBlock02 && (
                            <div className="block">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {/* 質問を表示 */}
                          {!keepBalloon02 && showBlock02 && (
                            <div className="block block02 mt20">
                              <Advisor />
                              <div className="balloon">
                                次に、あなたの性別をおしえてください。
                              </div>
                              <div className="select-area mt20">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="gender"
                                    id="male"
                                    value="1"
                                    onChange={(e) => {
                                      console.log(
                                        `Selected gender: ${e.target.value}`
                                      );
                                      updateBlock02(e.target.value);
                                    }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="male"
                                  >
                                    男性
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="gender"
                                    id="female"
                                    value="2"
                                    onChange={(e) => {
                                      console.log(
                                        `Selected gender: ${e.target.value}`
                                      );
                                      updateBlock02(e.target.value);
                                    }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="female"
                                  >
                                    女性
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="gender"
                                    id="other"
                                    value="3"
                                    onChange={(e) => {
                                      console.log(
                                        `Selected gender: ${e.target.value}`
                                      );
                                      updateBlock02(e.target.value);
                                    }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="other"
                                  >
                                    どちらでもない
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* 返信の待機... */}
                          {keepReplyBalloon02 && !showReplyBlock02 && (
                            <div className="reply-block mt20">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {/* 返信の表示 */}
                          {showReplyBlock02 && !keepReplyBalloon02 && (
                            <ReplyBlock02 value02={String(selectedValue02)} />
                          )}
                        </div>

                        {/* 住んでいる場所は？ ==================================*/}
                        <div className="location">
                          {keepBalloon03 && !showBlock03 && (
                            <>
                              <Advisor />
                              <TypingDots />
                            </>
                          )}
                          {!keepBalloon03 && showBlock03 && (
                            <div className="block block03 mt20">
                              <Advisor />
                              <div className="balloon">
                                次に、あなたのお住まいをおしえてください。
                              </div>
                              <div className="select-area mt20">
                                <select
                                  style={{ width: '80%' }}
                                  className="form-select"
                                  aria-label="Default select example"
                                  onChange={(e) => {
                                    console.log(
                                      `Selected location: ${e.target.value}`
                                    );
                                    updateBlock03(e.target.value);
                                  }}
                                >
                                  <option value="" disabled selected>
                                    住んでいる場所を選択してください
                                  </option>
                                  <option value="東京都">東京都</option>
                                  <option value="大阪府">大阪府</option>
                                  <option value="京都府">京都府</option>
                                  <option value="北海道">北海道</option>
                                  <option value="沖縄県">沖縄県</option>
                                </select>
                              </div>
                            </div>
                          )}
                          {keepReplyBalloon03 && !showReplyBlock03 && (
                            <div className="reply-block mt20">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {showReplyBlock03 && (
                            <ReplyBlock03 value03={String(selectedValue03)} />
                          )}
                        </div>

                        {/* ドミナント・サブミッシブは？ ==================================*/}
                        <div className="domi-sub">
                          {keepBalloon04 && !showBlock04 && (
                            <div className="block">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon04 && showBlock04 && (
                            <div className="block block04 mt20">
                              <Advisor />
                              <div className="balloon">
                                あなたはドミナントですか？サブミッシブですか？
                              </div>
                              <div className="select-area mt20">
                                <select
                                  style={{ width: '80%' }}
                                  className="form-select"
                                  aria-label="Default select example"
                                  onChange={(e) => {
                                    console.log(
                                      `Selected domi-sub: ${e.target.value}`
                                    );
                                    updateBlock04(e.target.value);
                                  }}
                                >
                                  <option value="" disabled selected>
                                    選択してください
                                  </option>
                                  <option value="ドミナント">ドミナント</option>
                                  <option value="サブミッシブ">
                                    サブミッシブ
                                  </option>
                                </select>
                              </div>
                            </div>
                          )}
                          {keepReplyBalloon04 && !showReplyBlock04 && (
                            <div className="reply-block mt20">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {showReplyBlock04 && (
                            <ReplyBlock04 value04={String(selectedValue04)} />
                          )}
                        </div>

                        <div style={{ height: '100px' }}></div>
                      </div>
                      {/* modal-body */}

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="col-12 col-md-6 bc-right">
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

export default EasySexualProfileRegist;

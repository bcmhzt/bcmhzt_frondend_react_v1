import React, { useState, useRef, useLayoutEffect } from 'react'; // Ensure React is imported for JSX
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

/**
 * あなたはドミナントですか？サブミッシブですか？
あなたはノーマルですか？それともアブノーマルですか？
  ノーマル、ドミナント、サブミッシブ、複数プレイ、NTR、スイッチャー、スパンキング、緊縛、フェティッシュ、コスプレ
どんな相手を探していますか？
　オンライン上での話し相手
　友達
　恋人
　セックスフレンド
　一晩限りの相手
性欲は強いですか？弱いですか？
　強い/普通/弱い/わからない
セックスに重きを置きますか？
　重要／どちらでもよい／なくてもよい／必要ない
連絡の希望頻度は？
　毎日/週に数回程度/１ヶ月に数回程度
NG
  撮影
  録音
  痛みを伴うプレイ
  暴力的行為
  流血を伴うプレイ
  傷跡を残す行為
  スカトロ
  嘔吐プレイ
  薬物使用
  非同意のその他のプレイ
 */

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

  // block05 interval
  const [keepBalloon05, setKeepBalloon05] = useState(false);
  const [showBlock05, setShowBlock05] = useState(false);
  const [keepBalloon05_1, setKeepBalloon05_1] = useState(false);
  const [showBlock05_1, setShowBlock05_1] = useState(false);
  // const [keepReplyBalloon05, setKeepReplyBalloon05] = useState(false);

  // block06: normal or abnormal
  const [keepBalloon06, setKeepBalloon06] = useState(false);
  const [showBlock06, setShowBlock06] = useState(false);
  const [selectedValue06, setSelectedValue06] = useState<string | ''>('');
  const [keepReplyBalloon06, setKeepReplyBalloon06] = useState(false);
  const [showReplyBlock06, setShowReplyBlock06] = useState(false);

  // block07: 何かを聞く
  const [keepBalloon07, setKeepBalloon07] = useState(false);
  const [showBlock07, setShowBlock07] = useState(false);
  const [selectedValue07, setSelectedValue07] = useState<string | ''>('');
  const [keepReplyBalloon07, setKeepReplyBalloon07] = useState(false);
  const [showReplyBlock07, setShowReplyBlock07] = useState(false);

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
      //05
      keepBalloon05 ||
      showBlock05 ||
      keepBalloon05_1 ||
      showBlock05_1 ||
      //06
      keepBalloon06 ||
      showBlock06 ||
      keepReplyBalloon06 ||
      showReplyBlock06 ||
      //07
      keepBalloon07 ||
      showBlock07 ||
      showReplyBlock07 ||
      keepReplyBalloon07 ||
      (showReplyBlock07 && modalBodyRef.current)
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
    keepReplyBalloon02,
    showReplyBlock02,
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
    //05
    keepBalloon05,
    showBlock05,
    keepBalloon05_1,
    showBlock05_1,
    //06
    keepBalloon06,
    showBlock06,
    showReplyBlock06,
    keepReplyBalloon06,
    //07
    keepBalloon07,
    showBlock07,
    keepReplyBalloon07,
    showReplyBlock07,
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

  function updateBlock03(value03: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:88] updateBlock03 called with value: ${value03}`
    );
    setKeepReplyBalloon03(true); // 返信のバルーンを表示
    setShowReplyBlock03(false); // 返信のメッセージは非表示
    //住んでいる場所をAPI経由で保存
    setTimeout(() => {
      setSelectedValue03(String(value03));
      setKeepReplyBalloon03(false);
      setShowReplyBlock03(true);

      //04へ
      setKeepBalloon04(true);
      setTimeout(() => {
        setKeepBalloon04(false);
        setShowBlock04(true);
      }, waitetime);
    }, waitetime);
  }

  function updateBlock04(value04: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:204] updateBlock04 called with value: ${value04}`
    );
    setKeepReplyBalloon04(true);
    //ドミナント・サブミッシブをAPI経由で保存
    //返信のバルーンを表示
    setTimeout(() => {
      setKeepReplyBalloon04(false);
      setSelectedValue04(String(value04));
      setShowReplyBlock04(true);

      //05へ
      console.log(
        `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:216] updateBlock04 called with value:`
      );

      setTimeout(() => {
        setKeepBalloon05(true); // Trigger the balloon display
        setShowBlock05(false); // Ensure the block is initially hidden
        // setTimeout(() => {
        console.log(
          `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:216] updateBlock04 called with value: setKeepBalloon05`
        );
        setKeepBalloon05(false); // Hide the balloon
        setShowBlock05(true); // Display the block
        setTimeout(() => {
          setKeepBalloon05_1(true); // Display the block
          setShowBlock05_1(false); // Ensure the block is initially hidden
          setTimeout(() => {
            setKeepBalloon05_1(false); // Display the block
            setShowBlock05_1(true); // Ensure the block is initially hidden
            setTimeout(() => {
              setKeepBalloon06(true); // Trigger the balloon display
              setShowBlock06(false); // Ensure the block is initially hidden
              setTimeout(() => {
                setKeepBalloon06(false); // Hide the balloon
                setShowBlock06(true); // Display the block
              }, waitetime);
              //=================
              // ここから06の質問へ
              //=================
            }, waitetime);
          }, waitetime);
        }, waitetime);
        // }, waitetime);
      }, 500);
    }, waitetime);
  }

  function updateBlock06(value06: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:216] updateBlock06 called with value: ${value06}`
    );
    setKeepReplyBalloon06(true);
    setShowReplyBlock06(false);
    //性癖傾向志向をAPI経由で保存
    setTimeout(() => {
      setSelectedValue06(String(value06));
      setKeepReplyBalloon06(false);
      setShowReplyBlock06(true);

      //07へ
      setKeepBalloon07(true);
      setShowBlock07(false);
      setTimeout(() => {
        setKeepBalloon07(false);
        setShowBlock07(true);
      }, waitetime);
    }, waitetime);
  }

  function updateBlock07(value07: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:216] updateBlock07 called with value: ${value07}`
    );
    setKeepReplyBalloon07(true);
    setShowReplyBlock07(false);
    //どんな相手を探していますか？をAPI経由で保存
    setTimeout(() => {
      setSelectedValue07(String(value07));
      setKeepReplyBalloon07(false);
      setShowReplyBlock07(true);
      //08へ
      // setKeepBalloon08(true);
      // setShowBlock08(false);
      //   setTimeout(() => {
      //     setKeepBalloon08(false);
      //     setShowBlock08(true);
      // }, waitetime);
    }, waitetime);
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
        <span className="advisor">性癖シニア・アドバイザー 担当 佐藤</span>
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

  // ReplyBlock06
  const ReplyBlock06: React.FC<{ value06: string }> = ({ value06 }) => {
    if (value06 === '1') {
      value06 = 'ノーマル';
    } else if (value06 === '2') {
      value06 = 'アブノーマル';
    } else if (value06 === '3') {
      value06 = 'どちらでもない';
    }
    return (
      <div className="reply-block mt20">
        <Advisor />
        <div className="balloon">{value06}ですね。</div>
      </div>
    );
  };

  // ReplyBlock07
  const ReplyBlock07: React.FC<{ value07: string }> = ({ value07 }) => {
    return (
      <div className="reply-block mt20">
        <Advisor />
        <div className="balloon">{value07}ですね。</div>
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

                        {/* 年齢は？ 01 ==================================*/}
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
                                  defaultValue=""
                                  onChange={(e) => {
                                    console.log(
                                      `Selected age: ${e.target.value}`
                                    );
                                    updateBlock01(e.target.value);
                                  }}
                                >
                                  <option value="" disabled>
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

                        {/* 性別は？ 02 ==================================*/}
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

                        {/* 住んでいる場所は？ 03 ==================================*/}
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

                        {/* ドミナント・サブミッシブは？ 04==================================*/}
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

                        {/* interval 05==================================*/}
                        <div className="interval">
                          {keepBalloon05 && !showBlock05 && (
                            <div className="block">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon05 && showBlock05 && (
                            <div className="block block05 mt20">
                              <Advisor />
                              <div className="balloon">
                                あと、数問の質問で終わります。
                                <br />
                                最後までがんばりましょう。
                              </div>
                            </div>
                          )}
                          {keepBalloon05_1 && !showBlock05_1 && (
                            <div className="block block05 mt20">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon05_1 && showBlock05_1 && (
                            <div className="block block05 mt20">
                              <Advisor />
                              <div className="balloon">
                                すべて、簡単な質問です。
                                <br />
                                ややセンスティブな話題にうつりましょう
                              </div>
                            </div>
                          )}
                        </div>

                        {/* normal-abnormal 06==================================*/}
                        <div className="normal-abnormal">
                          {keepBalloon06 && !showBlock06 && (
                            <div className="block">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon06 && showBlock06 && (
                            <div className="block block06 mt20">
                              <Advisor />
                              <div className="balloon">
                                あなたはノーマルですか？それともアブノーマルですか？
                              </div>
                              <div className="select-area mt20">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sexual_orientation"
                                    id="sexual_orientation_1"
                                    value="1"
                                    onChange={(e) => {
                                      console.log(
                                        `Selected sexual orientation: ${e.target.value}`
                                      );
                                      updateBlock06(e.target.value);
                                    }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="sexual_orientation_1"
                                  >
                                    ノーマル（プレーン、バニラ）
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sexual_orientation"
                                    id="sexual_orientation_2"
                                    value="2"
                                    onChange={(e) => {
                                      console.log(
                                        `Selected sexual orientation: ${e.target.value}`
                                      );
                                      updateBlock06(e.target.value);
                                    }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="sexual_orientation_2"
                                  >
                                    アブノーマル（特殊・マニアック）
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="sexual_orientation"
                                    id="sexual_orientation_3"
                                    value="3"
                                    onChange={(e) => {
                                      console.log(
                                        `Selected sexual orientation: ${e.target.value}`
                                      );
                                      updateBlock06(e.target.value);
                                    }}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="sexual_orientation_3"
                                  >
                                    どちらでもない
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                          {keepReplyBalloon06 && !showReplyBlock06 && (
                            <div className="block">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepReplyBalloon06 && showReplyBlock06 && (
                            <div className="block">
                              <ReplyBlock06 value06={String(selectedValue06)} />
                            </div>
                          )}
                        </div>

                        {/* sex-drive 07==================================*/}
                        {keepBalloon07 && !showBlock07 && (
                          <div className="block">
                            <Advisor />
                            <TypingDots />
                          </div>
                        )}
                        {!keepBalloon07 && showBlock07 && (
                          <div className="block block06 mt20">
                            <Advisor />
                            <div className="balloon">
                              どんな相手を探していますか？
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
                                  updateBlock07(e.target.value);
                                }}
                              >
                                <option value="" disabled selected>
                                  お相手を選択してください
                                </option>
                                <option value="オンライン上での話し相手">
                                  オンライン上での話し相手
                                </option>
                                <option value="友達">友達</option>
                                <option value="恋人">恋人</option>
                                <option value="セックスフレンド">
                                  セックスフレンド
                                </option>
                                <option value="一晩限りの相手">
                                  一晩限りの相手
                                </option>
                              </select>
                            </div>
                          </div>
                        )}
                        {keepReplyBalloon07 && !showReplyBlock07 && (
                          <div className="block">
                            <Advisor />
                            <TypingDots />
                          </div>
                        )}
                        {!keepReplyBalloon07 && showReplyBlock07 && (
                          <div className="block">
                            <ReplyBlock07 value07={String(selectedValue07)} />
                          </div>
                        )}

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

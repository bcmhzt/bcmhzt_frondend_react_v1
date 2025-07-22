import React, { useState, useRef, useLayoutEffect } from 'react'; // Ensure React is imported for JSX
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Image } from 'react-bootstrap-icons';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytesResumable } from 'firebase/storage';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:xx] debug:',
    debug
  );
}

/**
 * 01: あなたの年齢をおしえてください。
 * 02: 次に、あなたの性別をおしえてください。
 * 03: 次に、あなたのお住まいをおしえてください。
 * 04: あなたはドミナントですか？サブミッシブですか？
 * 05:  あと、数問の質問で終わります。
 *      最後までがんばりましょう。
 *      すべて、簡単な質問です。
 *      ややセンスティブな話題にうつりましょう"
 * 06:  あなたはノーマルですか？それともアブノーマルですか？
 *      複数の項目を選んでください。
 * 07: どんな相手を探していますか？
 * 08: 性欲は強いですか？弱いですか？
 * 09: NGプレイを選択してください。
 * 10: あなたのニックネームをおしえてください。あなたのプロフィール画像を設定してください。
 * Ending: ありがとうございました。
 */

/** 簡易アンケート形式 */
const EasySexualProfileRegist: React.FC = () => {
  const { currentUserProfile, token } = useAuth();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

  // モーダル表示フラグ（マウント時に自動オープン）
  const [showModal, setShowModal] = useState(true);
  const waitetime = 2000; // モーダル表示後の待機時間
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // block01: age
  const [ageState, setAgeState] = useState(false);
  const [keepBalloon01, setKeepBalloon01] = useState(false);
  const [showBlock01, setShowBlock01] = useState(false);
  const [selectedValue01, setSelectedValue01] = useState<number | ''>(0);
  const [keepReplyBalloon01, setKeepReplyBalloon01] = useState(false);
  const [showReplyBlock01, setShowReplyBlock01] = useState(false);

  // block02: gender
  const [genderState, setGenderState] = useState(false);
  const [keepBalloon02, setKeepBalloon02] = useState(false);
  const [showBlock02, setShowBlock02] = useState(false);
  const [selectedValue02, setSelectedValue02] = useState<number | ''>(0);
  const [keepReplyBalloon02, setKeepReplyBalloon02] = useState(false);
  const [showReplyBlock02, setShowReplyBlock02] = useState(false);

  // block03: location
  const [locationStatus, setLocationStatus] = useState(false);
  const [keepBalloon03, setKeepBalloon03] = useState(false);
  const [showBlock03, setShowBlock03] = useState(false);
  const [selectedValue03, setSelectedValue03] = useState<string | ''>('');
  const [keepReplyBalloon03, setKeepReplyBalloon03] = useState(false);
  const [showReplyBlock03, setShowReplyBlock03] = useState(false);

  // block04: domi&sub
  const [dominantId, setDominantId] = useState(0);
  const [submissiveId, setSubmissiveId] = useState(0);
  // const [domisubStatus, setDomisubStatus] = useState(0);
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

  // block06: ノーマルですか？それともアブノーマルですか？
  const [keepBalloon06, setKeepBalloon06] = useState(false);
  const [showBlock06, setShowBlock06] = useState(false);
  const [selectedValue06, setSelectedValue06] = useState<string[]>([]);
  // const [keepReplyBalloon06, setKeepReplyBalloon06] = useState(false);
  // const [showReplyBlock06, setShowReplyBlock06] = useState(false);

  // block07: どんな相手を探していますか？
  const [keepBalloon07, setKeepBalloon07] = useState(false);
  const [showBlock07, setShowBlock07] = useState(false);
  const [selectedValue07, setSelectedValue07] = useState<string | ''>('');
  const [keepReplyBalloon07, setKeepReplyBalloon07] = useState(false);
  const [showReplyBlock07, setShowReplyBlock07] = useState(false);

  // block08: 性欲は強いですか？弱いですか？
  const [keepBalloon08, setKeepBalloon08] = useState(false);
  const [showBlock08, setShowBlock08] = useState(false);
  const [selectedValue08, setSelectedValue08] = useState<string[]>([]);
  const [keepReplyBalloon08, setKeepReplyBalloon08] = useState(false);
  const [showReplyBlock08, setShowReplyBlock08] = useState(false);

  // block09: NGプレイを選択してください。
  const [keepBalloon09, setKeepBalloon09] = useState(false);
  const [showBlock09, setShowBlock09] = useState(false);
  const [selectedValue09, setSelectedValue09] = useState<string[]>([]);

  // block10: ニックネームとプロフィール画像
  const [keepBalloon10, setKeepBalloon10] = useState(false);
  const [showBlock10, setShowBlock10] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [isReadyForNext, setIsReadyForNext] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(true);

  // Ending
  const [keepBalloonEnding, setKeepBalloonEnding] = useState(false);
  const [showBlockEnding, setShowBlockEnding] = useState(false);

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
      // keepReplyBalloon06 ||
      // showReplyBlock06 ||
      //07
      keepBalloon07 ||
      showBlock07 ||
      showReplyBlock07 ||
      keepReplyBalloon07 ||
      //08
      keepBalloon08 ||
      showBlock08 ||
      showReplyBlock08 ||
      keepReplyBalloon08 ||
      //09
      keepBalloon09 ||
      showBlock09 ||
      // showReplyBlock09 ||
      // keepReplyBalloon09 ||
      //10
      keepBalloon10 ||
      showBlock10 ||
      //11
      keepBalloonEnding ||
      showBlockEnding ||
      // Ending
      (showBlockEnding && modalBodyRef.current)
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
    // showReplyBlock06,
    // keepReplyBalloon06,
    //07
    keepBalloon07,
    showBlock07,
    keepReplyBalloon07,
    showReplyBlock07,
    //08
    keepBalloon08,
    showBlock08,
    keepReplyBalloon08,
    showReplyBlock08,
    //09
    keepBalloon09,
    showBlock09,
    // keepReplyBalloon09,
    // showReplyBlock09,
    //10
    keepBalloon10,
    showBlock10,
    //11
    keepBalloonEnding,
    showBlockEnding,
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

  /* 01: あなたの年齢をおしえてください。*/
  async function updateBlock01(value01: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:255] updateBlock01 called with value: ${value01}`
    );
    setKeepReplyBalloon01(true); // 返信のバルーンを表示
    setShowReplyBlock01(false); // 返信のメッセージは非表示
    //年齢をAPI経由で保存
    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/age/${currentUserProfile.user_profile.uid}`,
        { value: value01, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true')
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:268] response:',
          res.data
        );
      if (res.data.status === true) setAgeState(true);
    } catch (err) {
      console.error(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:274] API error [Age]:',
        err
      );
    }

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

  /* 02: 次に、あなたの性別をおしえてください。*/
  async function updateBlock02(value02: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:270] updateBlock02 called with value: ${value02}`
    );
    setKeepReplyBalloon02(true);
    setShowReplyBlock02(false);
    //性別をAPI経由で保存
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:276] updateBlock02 called with value: ${value02}`
    );

    try {
      const response = await axios.post(
        `${apiEndpoint}/update/user/detail/gender/${currentUserProfile.user_profile.uid}`,
        {
          value: value02,
          token: token,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') {
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:294] response.data:',
          response.data
        );
      }
      if (response.data.status === true) {
        setGenderState(true);
      }
    } catch (error) {
      console.log(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:304] API error changeGender:',
        error
      );
      setGenderState(false);
    }

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

  /* 03: あなたのお住まいをおしえてください。*/
  async function updateBlock03(value03: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:88] updateBlock03 called with value: ${value03}`
    );
    setKeepReplyBalloon03(true); // 返信のバルーンを表示
    setShowReplyBlock03(false); // 返信のメッセージは非表示
    //住んでいる場所をAPI経由で保存

    try {
      const res = await axios.post(
        `${apiEndpoint}/update/user/detail/location/${currentUserProfile.user_profile.uid}`,
        { value: value03, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (debug === 'true') console.log('response:', res.data);
      if (res.data.status) setLocationStatus(true);
    } catch (err) {
      console.error('API error [Location]:', err);
    } finally {
      // setLoading(false);
    }
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

  /* 04: あなたはドミナントですか？サブミッシブですか？ */
  async function updateBlock04(value04: string) {
    /**
     * propensities 5:dominant 6:submissive
     * user_propensities
     * const [dominantId, setDominantId] = useState(0);
  const [submissiveStatus, setSubmissiveStatus] = useState(0);
     */
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:385] updateBlock04 called with value: ${value04}`
    );
    setKeepReplyBalloon04(true);
    /* ドミナント・サブミッシブをAPI経由で保存 */
    if (value04 === 'ドミナント') {
      setDominantId(1);
      setSubmissiveId(0);
    } else if (value04 === 'サブミッシブ') {
      setDominantId(0);
      setSubmissiveId(5);
    }
    console.log(
      '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:407] action:',
      dominantId,
      submissiveId
    );
    //domi
    if (value04 === 'ドミナント') {
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/update/propensity`,
          { propensity_id: 5, status: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:418] action:',
          response.data
        );
      } catch (err) {
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:417] API err:',
          err
        );
      }
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/update/propensity`,
          { propensity_id: 6, status: 0 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:418] action:',
          response.data
        );
      } catch (err) {
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:417] API err:',
          err
        );
      }
    } else if (value04 === 'サブミッシブ') {
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/update/propensity`,
          { propensity_id: 6, status: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:418] action:',
          response.data
        );
      } catch (err) {
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:417] API err:',
          err
        );
      }
      try {
        const response = await axios.post(
          `${apiEndpoint}/v1/update/propensity`,
          { propensity_id: 5, status: 0 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:418] action:',
          response.data
        );
      } catch (err) {
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:417] API err:',
          err
        );
      }
    } else {
      console.log(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:418] action: わからない（この場合は、何も保存しない）'
      );
    }
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

  /**
   * 06: あなたはノーマルですか？それともアブノーマルですか？
   * ノーマル（82）
   * スイッチャー (11)
   * DBSM/緊縛系　（83/84）
   * フェティッシュ（85）
   * スパンキング（86）
   * コスプレ　(23)
   * 複数プレイ (57)
   * NTR（87）
   * アナルプレイ（88）
   * その他
   */
  function handleCheckboxChange06(value: string, checked: boolean) {
    // チェックボックスの変更ハンドラ
    setSelectedValue06((prev) => {
      const next = checked ? [...prev, value] : prev.filter((v) => v !== value);
      // 変更後の配列を updateBlock06 に渡す
      updateBlock06(next);
      return next;
    });
  }
  function updateBlock06(values06: string[]) {
    const allIds = ['11', '23', '57', '82', '83', '84', '85', '86', '87', '88'];
    const counts06: Record<string, number> = allIds.reduce(
      (acc, id) => {
        acc[id] = values06.includes(id) ? 1 : 0;
        return acc;
      },
      {} as Record<string, number>
    );
    console.log(
      '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:553] counts06:',
      counts06
    );
    // [11, 23, 57, 82, 83, 84, 85, 86, 87, 88]
    console.log(
      '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:588]',
      token
    );
    allIds.forEach((id) => {
      try {
        axios.post(
          `${apiEndpoint}/v1/update/propensity`,
          { propensity_id: Number(id), status: counts06[id] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json', // 必要に応じて追加
            },
          }
        );
      } catch (err) {
        // エラーメッセージを入れないと駄目かも。
        alert('Errorが発生しました。リロードして最初からやり直してください。');
        console.error(
          `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:379] API error [Propensity]:`,
          err
        );
      }

      console.log(
        `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:379] updateBlock06 called with value forEach: ${id}`
      );
    });
  }

  /**
   * 07: どんな相手を探していますか？
   * オンラインのみ(44)
   * 友達(47)
   * 恋人（91）
   * セックスフレンド（92）
   * 一晩限りの相手（93）
   */
  function handleProgress07() {
    console.log(
      '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:588] handleProgress07'
    );
    setKeepBalloon07(true);
    setShowBlock07(false);
    setTimeout(() => {
      setKeepBalloon07(false);
      setShowBlock07(true);
    }, waitetime);
  }
  async function updateBlock07(value07: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:599] updateBlock07 called with value: ${value07}`
    );
    setKeepReplyBalloon07(true);
    setShowReplyBlock07(false);
    //どんな相手を探していますか？をAPI経由で保存
    const id =
      value07 === 'オンラインのみ'
        ? 44
        : value07 === '友達'
          ? 47
          : value07 === '恋人'
            ? 91
            : value07 === 'セックスフレンド'
              ? 92
              : value07 === '一晩限りの相手'
                ? 93
                : 0;
    console.log(
      '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:617] API response:',
      id
    );
    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/update/propensity`,
        { propensity_id: id, status: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:599] API response:',
        response.data
      );
    } catch (error) {
      console.error(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:599] API error:',
        error
      );
    }

    setTimeout(() => {
      setSelectedValue07(String(value07));
      setKeepReplyBalloon07(false);
      setShowReplyBlock07(true);
      //08へ
      setKeepBalloon08(true);
      setShowBlock08(false);
      setTimeout(() => {
        setKeepBalloon08(false);
        setShowBlock08(true);
      }, waitetime);
    }, waitetime);
  }

  /* 08: 性欲は強いですか？弱いですか？ */
  /**
   * 性欲最強(とても強い):94
   * 性欲強(そこそこ強い):95
   * 性欲普通(普通ぐらいだと思う):96
   * 性欲弱(弱い):97
   * 性欲最弱(とても弱い):98
   * @param value08
   */
  async function updateBlock08(value08: string) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:662] updateBlock08 called with value: ${value08}`
    );
    setKeepReplyBalloon08(true);
    setShowReplyBlock08(false);
    //どんな相手を探していますか？をAPI経由で保存
    // Reset ids 94 to 98 by setting their status to 0
    const idsToReset = [94, 95, 96, 97, 98];
    try {
      for (const id of idsToReset) {
        await axios.post(
          `${apiEndpoint}/v1/update/propensity`,
          { propensity_id: id, status: 0 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      console.log(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:662] Reset successful for ids:',
        idsToReset
      );
    } catch (error) {
      console.error(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:662] API error during reset:',
        error
      );
    }

    // [94, 95, 96, 97, 98]
    const id =
      value08 === 'とても強い'
        ? 94
        : value08 === 'そこそこ強い'
          ? 95
          : value08 === '普通ぐらいだと思う'
            ? 96
            : value08 === '弱い'
              ? 97
              : value08 === 'とても弱い'
                ? 98
                : 0;
    try {
      const response = await axios.post(
        `${apiEndpoint}/v1/update/propensity`,
        { propensity_id: id, status: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:599] API response:',
        response.data
      );
    } catch (error) {
      console.error(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:599] API error:',
        error
      );
    }

    setTimeout(() => {
      setSelectedValue08([String(value08)]);
      setKeepReplyBalloon08(false);
      setShowReplyBlock08(true);
      //08へ
      setKeepBalloon09(true);
      setShowBlock09(false);
      setTimeout(() => {
        setKeepBalloon09(false);
        setShowBlock09(true);
      }, waitetime);
    }, waitetime);
  }

  //09: あなたはノーマルですか？それともアブノーマルですか？
  function handleCheckboxChange09(value09: string, checked: boolean) {
    // チェックボックスの変更ハンドラ
    setSelectedValue09((prev) => {
      const next = checked
        ? [...prev, value09]
        : prev.filter((v) => v !== value09);
      // 変更後の配列を updateBlock06 に渡す
      updateBlock09(next);
      return next;
    });
  }
  function updateBlock09(values09: string[]) {
    console.log(
      `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:342] updateBlock09 called with value: ${values09}`
    );
    // NGをAPIで保存
  }
  function handleProgress09() {
    console.log(
      '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:369] handleProgress09'
    );

    setKeepBalloon10(true);
    setShowBlock10(false);
    setTimeout(() => {
      setKeepBalloon10(false);
      setShowBlock10(true);
    }, waitetime);
  }

  function handleProgress10() {
    console.log(
      '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:369] handleProgress10'
    );
    setKeepBalloonEnding(true);
    setShowBlockEnding(false);
    setTimeout(() => {
      setKeepBalloonEnding(false);
      setShowBlockEnding(true);
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
      <div className="reply-block mt30">
        <Advisor />
        <div className="balloon">{value01}代ですね。</div>
      </div>
    );
  };

  // ReplyBlock02
  const ReplyBlock02: React.FC<{ value02: string }> = ({ value02 }) => {
    if (value02 === '1') {
      value02 = '男性ですね。';
    } else if (value02 === '2') {
      value02 = '女性ですね。';
    } else if (value02 === '3') {
      value02 = '「どちらでもない」ですね。性別とは複雑なものですね。';
    }

    return (
      <div className="reply-block mt30">
        <Advisor />
        <div className="balloon">{value02}</div>
      </div>
    );
  };

  // ReplyBlock03
  const ReplyBlock03: React.FC<{ value03: string }> = ({ value03 }) => {
    return (
      <div className="reply-block mt30">
        <Advisor />
        <div className="balloon">{value03}ですね。</div>
      </div>
    );
  };

  // ReplyBlock04
  const ReplyBlock04: React.FC<{ value04: string }> = ({ value04 }) => {
    return (
      <div className="reply-block mt30">
        <Advisor />
        <div className="balloon">{value04}ですね。</div>
      </div>
    );
  };

  // ReplyBlock07
  const ReplyBlock07: React.FC<{ value07: string }> = ({ value07 }) => {
    return (
      <div className="reply-block mt30">
        <Advisor />
        <div className="balloon">「{value07}」をお探しですね。</div>
      </div>
    );
  };

  // ReplyBlock08
  const ReplyBlock08: React.FC<{ value08: string }> = ({ value08 }) => {
    return (
      <div className="reply-block mt30">
        <Advisor />
        <div className="balloon">性欲は、{value08}のですね。</div>
      </div>
    );
  };

  /** nickname */
  const handleNicknameBlur = async () => {
    try {
      console.log(
        `[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:897] Saving nickname: ${nickname}`
      );
      const response = await axios.post(
        `${apiEndpoint}/update/user/profile/nickname/${currentUserProfile.user_profile.uid}`,
        { value: nickname, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === true) {
        console.log(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx] Nickname saved successfully'
        );
        // setNicknameAndProfileImage(true);
      } else {
        console.error(
          '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx] Failed to save nickname'
        );
        // setNicknameAndProfileImage(false);
      }
    } catch (error) {
      console.error(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx] Error saving nickname:',
        error
      );
    }
  };

  const checkReady = (nicknameValue: string, imageUploaded: boolean) => {
    const isNicknameValid = nicknameValue.trim().length > 0;
    setIsReadyForNext(isNicknameValid && imageUploaded);
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploadCompleted(false);
    const file = event.target.files?.[0];
    if (!file || !currentUserProfile?.user_profile?.uid) return;

    // プレビュー表示
    // setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));

    const uid = currentUserProfile.user_profile.uid;
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const renamedFileName = `${uid}.${fileExtension}`;
    const filePath = `profiles/${uid}/${renamedFileName}`;
    const storageRef = ref(storage, filePath);

    try {
      // Firebase Storage へアップロード
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => reject(error),
          () => resolve()
        );
      });

      // Firebase URLの代わりに、パスを API に保存（指定の形式）
      // const token = currentUserProfile.token; // または useAuth() から取得した token を使用
      const encodedPath = encodeURIComponent(filePath); // `profiles%2F...` の形式に変換
      await axios.post(
        `${apiEndpoint}/user/update/profileimage/${uid}`,
        {
          image_path: encodedPath,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:985] ✅ プロフィール画像を保存しました:',
        encodedPath
      );
      // setIsImageUploadedToServer(true);
      checkReady(nickname || '', true);
    } catch (error) {
      console.error(
        '[src/pages/easysexualprofileregist/EasySexualProfileRegist.tsx:987] ❌ プロフィール画像アップロードエラー:',
        error
      );
    } finally {
      // ✅ 完了を通知
      setUploadCompleted(true);
    }
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
                        {/* Start 00=======*/}
                        <div className="start mb30">
                          <p>開始ボタンを押してスタートしてください。</p>
                          <p>
                            プロフィール画像を用意してください。
                            <br />
                            ニックネームを考えておいてください。
                          </p>
                          <button
                            type="button"
                            className="btn btn-secondary btn-lg bcmhzt-btn w-100 mt20 mb20"
                            onClick={() => openBlock01()}
                          >
                            簡単性癖登録スタート
                          </button>
                          <img
                            src="/assets/images/easy-sexual-profile-regist.png"
                            alt="hoge"
                            className="mt30"
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </div>

                        {/* あなたの年齢をおしえてください。01=======*/}
                        <div className="age">
                          {/* 最初に待機する */}
                          {keepBalloon01 && !showBlock01 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {/* 質問を表示 */}
                          {!keepBalloon01 && showBlock01 && (
                            <div className="block block01 mt30">
                              <Advisor />
                              <div className="balloon">
                                あなたの年齢をおしえてください。
                              </div>
                              <div
                                className="select-area mt20"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <select
                                  style={{ width: '80%' }}
                                  className="form-select form-select-md"
                                  aria-label="Default select example"
                                  defaultValue=""
                                  onChange={(e) => {
                                    console.log(
                                      `Selected age: ${e.target.value}`
                                    );
                                    updateBlock01(e.target.value);
                                  }}
                                >
                                  <option value="">
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
                          {ageState && (
                            <span
                              className="success-save text-end"
                              style={{
                                width: '100px',
                                background: '#eee',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '10px',
                              }}
                            >
                              保存
                            </span>
                          )}
                          {/* 返信の待機... */}
                          {!showReplyBlock01 && keepReplyBalloon01 && (
                            <div className="reply-block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {/* 返信の表示 */}
                          {showReplyBlock01 && !keepReplyBalloon01 && (
                            <ReplyBlock01 value01={String(selectedValue01)} />
                          )}
                        </div>

                        {/* 次に、あなたの性別をおしえてください。 02=======*/}
                        <div className="gender">
                          {/* 最初に待機する */}
                          {keepBalloon02 && !showBlock02 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {/* 質問を表示 */}
                          {!keepBalloon02 && showBlock02 && (
                            <div className="block block02 mt30">
                              <Advisor />
                              <div className="balloon">
                                次に、あなたの性別をおしえてください。
                              </div>
                              <div
                                className="select-area bcmhztparts-radiobtn mt20"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="gender"
                                  id="man"
                                  value="1"
                                  autoComplete="off"
                                  onChange={(e) => {
                                    console.log(
                                      `Selected gender: ${e.target.value}`
                                    );
                                    updateBlock02(e.target.value);
                                  }}
                                />
                                <label className="btn btn-sm" htmlFor="man">
                                  男性
                                </label>

                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="gender"
                                  id="woman"
                                  value="2"
                                  autoComplete="off"
                                  onChange={(e) => {
                                    console.log(
                                      `Selected gender: ${e.target.value}`
                                    );
                                    updateBlock02(e.target.value);
                                  }}
                                />
                                <label className="btn btn-sm" htmlFor="woman">
                                  女性
                                </label>
                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="gender"
                                  id="nogender"
                                  autoComplete="off"
                                  value="3"
                                  onChange={(e) => {
                                    console.log(
                                      `Selected gender: ${e.target.value}`
                                    );
                                    updateBlock02(e.target.value);
                                  }}
                                />
                                <label
                                  className="btn btn-sm"
                                  htmlFor="nogender"
                                >
                                  どちらでもない
                                </label>
                              </div>
                            </div>
                          )}
                          {genderState && (
                            <span
                              className="success-save text-end"
                              style={{
                                width: '100px',
                                background: '#eee',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '10px',
                              }}
                            >
                              保存
                            </span>
                          )}
                          {/* 返信の待機... */}
                          {keepReplyBalloon02 && !showReplyBlock02 && (
                            <div className="reply-block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {/* 返信の表示 */}
                          {showReplyBlock02 && !keepReplyBalloon02 && (
                            <ReplyBlock02 value02={String(selectedValue02)} />
                          )}
                        </div>

                        {/* あなたのお住まいをおしえてください。 03=======*/}
                        <div className="location">
                          {keepBalloon03 && !showBlock03 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon03 && showBlock03 && (
                            <div className="block block03 mt30">
                              <Advisor />
                              <div className="balloon">
                                次に、あなたのお住まいをおしえてください。
                              </div>
                              <div
                                className="select-area mt20"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <select
                                  style={{ width: '80%' }}
                                  className="form-select form-select-md"
                                  aria-label="Default select example"
                                  onChange={(e) => {
                                    console.log(
                                      `Selected location: ${e.target.value}`
                                    );
                                    updateBlock03(e.target.value);
                                  }}
                                >
                                  <option value="" disabled selected>
                                    住んでいる場所を選択
                                  </option>
                                  <option value="北海道">北海道</option>
                                  <option value="青森県">青森県</option>
                                  <option value="岩手県">岩手県</option>
                                  <option value="宮城県">宮城県</option>
                                  <option value="秋田県">秋田県</option>
                                  <option value="山形県">山形県</option>
                                  <option value="福島県">福島県</option>
                                  <option value="茨城県">茨城県</option>
                                  <option value="栃木県">栃木県</option>
                                  <option value="群馬県">群馬県</option>
                                  <option value="埼玉県">埼玉県</option>
                                  <option value="千葉県">千葉県</option>
                                  <option value="東京都">東京都</option>
                                  <option value="神奈川県">神奈川県</option>
                                  <option value="新潟県">新潟県</option>
                                  <option value="富山県">富山県</option>
                                  <option value="石川県">石川県</option>
                                  <option value="福井県">福井県</option>
                                  <option value="山梨県">山梨県</option>
                                  <option value="長野県">長野県</option>
                                  <option value="岐阜県">岐阜県</option>
                                  <option value="静岡県">静岡県</option>
                                  <option value="愛知県">愛知県</option>
                                  <option value="三重県">三重県</option>
                                  <option value="滋賀県">滋賀県</option>
                                  <option value="京都府">京都府</option>
                                  <option value="大阪府">大阪府</option>
                                  <option value="兵庫県">兵庫県</option>
                                  <option value="奈良県">奈良県</option>
                                  <option value="和歌山県">和歌山県</option>
                                  <option value="鳥取県">鳥取県</option>
                                  <option value="島根県">島根県</option>
                                  <option value="岡山県">岡山県</option>
                                  <option value="広島県">広島県</option>
                                  <option value="山口県">山口県</option>
                                  <option value="徳島県">徳島県</option>
                                  <option value="香川県">香川県</option>
                                  <option value="愛媛県">愛媛県</option>
                                  <option value="高知県">高知県</option>
                                  <option value="福岡県">福岡県</option>
                                  <option value="佐賀県">佐賀県</option>
                                  <option value="長崎県">長崎県</option>
                                  <option value="熊本県">熊本県</option>
                                  <option value="大分県">大分県</option>
                                  <option value="宮崎県">宮崎県</option>
                                  <option value="鹿児島県">鹿児島県</option>
                                  <option value="沖縄県">沖縄県</option>
                                </select>
                              </div>
                            </div>
                          )}
                          {locationStatus && (
                            <span
                              className="success-save text-end"
                              style={{
                                width: '100px',
                                background: '#eee',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '10px',
                              }}
                            >
                              保存
                            </span>
                          )}
                          {keepReplyBalloon03 && !showReplyBlock03 && (
                            <div className="reply-block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {showReplyBlock03 && (
                            <ReplyBlock03 value03={String(selectedValue03)} />
                          )}
                        </div>

                        {/* あなたはドミナントですか？サブミッシブですか？ 04=======*/}
                        <div className="domi-sub">
                          {keepBalloon04 && !showBlock04 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon04 && showBlock04 && (
                            <div className="block block04 mt30">
                              <Advisor />
                              <div className="balloon">
                                あなたは、どちらかというと、ドミナントですか？サブミッシブですか？
                              </div>
                              <div
                                className="select-area bcmhztparts-radiobtn mt20"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <div>
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="domisub"
                                    id="dominanto"
                                    value="ドミナント"
                                    autoComplete="off"
                                    onChange={(e) => {
                                      console.log(
                                        `Selected domisub: ${e.target.value}`
                                      );
                                      updateBlock04(e.target.value);
                                    }}
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="dominanto"
                                  >
                                    ドミナント
                                  </label>
                                </div>
                                <div>
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="domisub"
                                    id="submissive"
                                    value="サブミッシブ"
                                    autoComplete="off"
                                    onChange={(e) => {
                                      console.log(
                                        `Selected domisub: ${e.target.value}`
                                      );
                                      updateBlock04(e.target.value);
                                    }}
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="submissive"
                                  >
                                    サブミッシブ
                                  </label>
                                </div>

                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="notsure"
                                  id="notsure"
                                  value="わからない"
                                  autoComplete="off"
                                  onChange={(e) => {
                                    console.log(
                                      `Selected notsure: ${e.target.value}`
                                    );
                                    updateBlock04(e.target.value);
                                  }}
                                />
                                <label className="btn btn-sm" htmlFor="notsure">
                                  わからない
                                </label>
                              </div>
                            </div>
                          )}
                          {keepReplyBalloon04 && !showReplyBlock04 && (
                            <div className="reply-block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {showReplyBlock04 && (
                            <ReplyBlock04 value04={String(selectedValue04)} />
                          )}
                        </div>

                        {/* interval 05=======*/}
                        <div className="interval">
                          {keepBalloon05 && !showBlock05 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon05 && showBlock05 && (
                            <div className="block block05 mt30">
                              <Advisor />
                              <div className="balloon">
                                あと、数問の質問で終わります。
                                <br />
                                最後までがんばりましょう。
                              </div>
                            </div>
                          )}
                          {keepBalloon05_1 && !showBlock05_1 && (
                            <div className="block block05 mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon05_1 && showBlock05_1 && (
                            <div className="block block05 mt30">
                              <Advisor />
                              <div className="balloon">
                                すべて、簡単な質問です。
                                <br />
                                ややセンスティブな話題にうつりましょう。
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ノーマルですか？それともアブノーマルですか？ 06=======*/}
                        <div className="normal-abnormal">
                          {keepBalloon06 && !showBlock06 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon06 && showBlock06 && (
                            <div className="block block06 mt30">
                              <Advisor />
                              <div className="balloon">
                                あなたはノーマル系ですか？それともアブノーマル系ですか？
                                <br />
                                複数の項目を選んでください。（後からもっと詳細に設定できます）
                              </div>
                              {/* ノーマル|スイッチャー|DBSM/緊縛系|フェティッシュ|スパンキング|コスプレ|複数プレイ|NTR */}
                              <div className="select-area bcmhztparts-checkbox mt20">
                                {/* ノーマル */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-check1"
                                    value="82"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check1"
                                  >
                                    ノーマル
                                  </label>
                                </span>
                                {/* スイッチャー */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check2"
                                    value="11"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check2"
                                  >
                                    スイッチャー
                                  </label>
                                </span>
                                {/* DBSM */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check3_1"
                                    value="83"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check3_1"
                                  >
                                    DBSM
                                  </label>
                                </span>
                                {/* 緊縛 */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check3_2"
                                    value="84"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check3_2"
                                  >
                                    緊縛
                                  </label>
                                </span>
                                {/* フェティッシュ */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check4"
                                    value="85"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check4"
                                  >
                                    フェティッシュ
                                  </label>
                                </span>
                                {/* スパンキング */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check5"
                                    value="86"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check5"
                                  >
                                    スパンキング
                                  </label>
                                </span>
                                {/* コスプレ */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check6"
                                    value="23"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check6"
                                  >
                                    コスプレ
                                  </label>
                                </span>
                                {/* 複数プレイ */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check7"
                                    value="57"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check7"
                                  >
                                    複数プレイ
                                  </label>
                                </span>
                                {/* NTR */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check8"
                                    value="87"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check8"
                                  >
                                    NTR
                                  </label>
                                </span>
                                {/* アナルプレイ */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check9"
                                    value="88"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check9"
                                  >
                                    アナルプレイ
                                  </label>
                                </span>
                                {/* その他 */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check"
                                    id="btn-check10"
                                    value="none"
                                    onChange={(e) =>
                                      handleCheckboxChange06(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-check10"
                                  >
                                    その他
                                  </label>
                                </span>
                                <div>
                                  <button
                                    onClick={handleProgress07}
                                    className="btn btn-secondary bcmhzt-btn ml10 mt10"
                                    disabled={selectedValue06.length === 0}
                                  >
                                    次に進む
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* どんな相手を探していますか？ 07=======*/}
                        <div className="partner">
                          {keepBalloon07 && !showBlock07 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon07 && showBlock07 && (
                            <div className="block block06 mt30">
                              <Advisor />
                              <div className="balloon">
                                どんな相手を探していますか？
                              </div>
                              <div
                                className="select-area mt20"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <select
                                  style={{ width: '80%' }}
                                  className="form-select form-select-lg"
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
                                  <option value="オンラインのみ">
                                    オンラインのみ
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
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepReplyBalloon07 && showReplyBlock07 && (
                            <div className="block mt30">
                              <ReplyBlock07 value07={String(selectedValue07)} />
                            </div>
                          )}
                        </div>

                        {/* 性欲は強いですか？弱いですか？ 08=======*/}
                        <div className="sex-drive">
                          {keepBalloon08 && !showBlock08 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon08 && showBlock08 && (
                            <div className="block block08 mt30">
                              <Advisor />
                              <div className="balloon">
                                性欲は強いですか？弱いですか？
                              </div>
                              <div
                                className="select-area mt20"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <select
                                  style={{ width: '80%' }}
                                  className="form-select form-select-lg"
                                  aria-label="Default select example"
                                  defaultValue=""
                                  onChange={(e) => {
                                    console.log(
                                      `Selected age: ${e.target.value}`
                                    );
                                    updateBlock08(e.target.value);
                                  }}
                                >
                                  <option value="" disabled>
                                    選択してください
                                  </option>
                                  <option value="とても強い">とても強い</option>
                                  <option value="そこそこ強い">
                                    そこそこ強い
                                  </option>
                                  <option value="普通ぐらいだと思う">
                                    普通ぐらいだと思う
                                  </option>
                                  <option value="弱い">弱い</option>
                                  <option value="とても弱い">とても弱い</option>
                                  <option value="わからない">わからない</option>
                                </select>
                              </div>
                            </div>
                          )}
                          {keepReplyBalloon08 && !showReplyBlock08 && (
                            <div className="block">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepReplyBalloon08 && showReplyBlock08 && (
                            <div className="block mt30">
                              <ReplyBlock08 value08={String(selectedValue08)} />
                            </div>
                          )}
                        </div>

                        {/*  NGプレイ 09=======*/}
                        <div className="ng-play">
                          {keepBalloon09 && !showBlock09 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon09 && showBlock09 && (
                            <div className="block block09 mt30">
                              <Advisor />
                              <div className="balloon">
                                NGプレイを選択してください。
                              </div>
                              <div className="select-area bcmhztparts-checkbox mt20">
                                {/* 撮影 */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check1"
                                    value="撮影"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check1"
                                  >
                                    撮影
                                  </label>
                                </span>
                                {/* 録音 */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check2"
                                    value="録音"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check2"
                                  >
                                    録音
                                  </label>
                                </span>
                                {/* 痛みを伴うプレイ */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check3"
                                    value="痛みを伴うプレイ"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check3"
                                  >
                                    痛みを伴うプレイ
                                  </label>
                                </span>
                                {/* 暴力的行為 */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check4"
                                    value="暴力的行為"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check4"
                                  >
                                    暴力的行為
                                  </label>
                                </span>
                                {/* 流血を伴うプレイ */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check5"
                                    value="流血を伴うプレイ"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check5"
                                  >
                                    流血を伴うプレイ
                                  </label>
                                </span>
                                {/* 傷跡を残す行為 */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check6"
                                    value="傷跡を残す行為"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check6"
                                  >
                                    傷跡を残す行為
                                  </label>
                                </span>
                                {/* スカトロ */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check7"
                                    value="スカトロ"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check7"
                                  >
                                    スカトロ
                                  </label>
                                </span>
                                {/* 薬物使用 */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check8"
                                    value="薬物使用"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check8"
                                  >
                                    薬物使用
                                  </label>
                                </span>
                                {/* 非同意のその他のプレイ */}
                                <span>
                                  <input
                                    type="checkbox"
                                    className="btn-check "
                                    id="btn-ng-check9"
                                    value="非同意のその他のプレイ"
                                    onChange={(e) =>
                                      handleCheckboxChange09(
                                        e.target.value,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <label
                                    className="btn btn-sm"
                                    htmlFor="btn-ng-check9"
                                  >
                                    非同意のその他のプレイ
                                  </label>
                                </span>
                                <div>
                                  <button
                                    onClick={handleProgress09}
                                    className="btn btn-secondary bcmhzt-btn ml10 mt10"
                                    disabled={selectedValue09.length === 0}
                                  >
                                    次に進む
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/*  ニックネーム&プロフィール画像 10=======*/}
                        <div className="nickname-profileimage">
                          {keepBalloon10 && !showBlock10 && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloon10 && showBlock10 && (
                            <div className="block block10 mt30">
                              <Advisor />
                              <div className="balloon">
                                あなたのニックネームとプロフィール画像を設定してください。
                              </div>
                              <div className="nickname-profileimage mt30">
                                <input
                                  type="text"
                                  placeholder="ニックネーム"
                                  className="form-control"
                                  value={nickname || ''}
                                  onChange={(e) => setNickname(e.target.value)}
                                  onBlur={handleNicknameBlur}
                                />
                                <label
                                  className="mt10 ml10"
                                  htmlFor="profile-image-upload"
                                  style={{ cursor: 'pointer' }}
                                >
                                  プロフィール画像を選択:{' '}
                                  <Image style={{ fontSize: '28px' }} />
                                </label>
                                <input
                                  id="profile-image-upload"
                                  type="file"
                                  accept="image/*"
                                  className="form-control"
                                  style={{ display: 'none' }}
                                  onChange={(e) => {
                                    handleImageChange(e);
                                  }}
                                />
                                {profileImagePreview && (
                                  <div className="image-preview mt10">
                                    <img
                                      className="avatar-200"
                                      src={profileImagePreview}
                                      alt="プロフィール画像プレビュー"
                                    />
                                  </div>
                                )}
                              </div>
                              {uploadCompleted === false && (
                                <div
                                  className="loading-indicator"
                                  style={{ fontSize: '14px', color: '#888' }}
                                >
                                  <span
                                    className="spinner-border text-secondary"
                                    role="status"
                                  ></span>{' '}
                                  ローディング中...
                                </div>
                              )}
                              <div>
                                <button
                                  onClick={handleProgress10}
                                  className="btn btn-secondary bcmhzt-btn ml10 mt10"
                                  disabled={!isReadyForNext}
                                >
                                  次に進む
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* エンディング 10=======*/}
                        <div className="ending">
                          {keepBalloonEnding && !showBlockEnding && (
                            <div className="block mt30">
                              <Advisor />
                              <TypingDots />
                            </div>
                          )}
                          {!keepBalloonEnding && showBlockEnding && (
                            <div className="block mt30">
                              <Advisor />
                              <div className="balloon">
                                これで終了です。
                                <br />
                                お疲れ様でした！
                                <br />
                                この設定は
                                <a
                                  href="/myprofile"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  プロフィールの設定
                                </a>
                                から後から変更できます。
                                <br />
                                楽しい性癖ライフをお楽しみください。
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="close">
                          {showBlockEnding && (
                            <div className="block">
                              <Advisor />
                              <div className="balloon">
                                この画面を閉じてください。
                                <br />
                                ナイススケベ！
                              </div>

                              <button
                                type="button"
                                className="btn btn-secondary bcmhzt-btn mt20"
                                onClick={() => setShowModal(false)}
                              >
                                この画面を閉じる
                              </button>
                            </div>
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

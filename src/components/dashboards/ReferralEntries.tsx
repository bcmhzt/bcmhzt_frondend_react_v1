/* 21333628 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';
import axios from 'axios';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/dashboards/ReferralEntries.tsx:13] debug:',
    debug
  );
}

const ReferralEntries = () => {
  const [referralMethod, setReferralMethod] = useState('share');
  const [restCount, setRestCount] = useState(0);
  const [shareOpen, setShareOpen] = useState(true);
  const [nickname, setNickname] = useState('');
  const siteUrl = process.env.REACT_APP_URL || 'http://localhost:3000';
  const [registerUrl, setRegisterUrl] = useState(siteUrl + '/register');
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { currentUserProfile, token } = useAuth();
  const { showMessage } = useMessage();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  /** 残り人数の取得 */
  useEffect(() => {
    if (!token) return; // token が入ってから呼ぶ

    const fetchRestCount = async () => {
      try {
        if (debug) console.log('fetchRestCount start');

        const { data } = await axios.post(
          `${apiEndpoint}/v1/referral_entries/checklimit`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (debug) {
          console.log(
            '[src/components/dashboards/ReferralEntries.tsx:42] response.data:',
            data
          );
          console.log(
            '[src/components/dashboards/ReferralEntries.tsx:46] response.data:',
            data.data.rest_count
          );
        }
        setRestCount(data.data.rest_count);
      } catch (error) {
        console.error(
          '[src/components/dashboards/ReferralEntries.tsx:53] Error fetching restCount:',
          error
        );
      }
    };

    fetchRestCount();
  }, [apiEndpoint, token, restCount]);

  /** 招待者のハッシュを作成するAPI */
  const createReferralMember = async () => {
    try {
      if (debug) console.log('createReferralMember start');
      const response = await axios.post(
        `${apiEndpoint}/v1/referral_entries/create`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRestCount(response.data.data.rest_count);
      if (debug) {
        console.log(
          '[src/components/dashboards/ReferralEntries.tsx:13] rest_count: ',
          response.data.data
        );
        console.log(
          '[src/components/dashboards/ReferralEntries.tsx:13] rest_count: ',
          response.data.data.introduced_hash
        );
      }
      const shareUrl = `${siteUrl}/register?referral_hash=${response.data.data.introduced_hash}`;
      setRegisterUrl(shareUrl);
      if (debug) {
        console.log(
          '[src/components/dashboards/ReferralEntries.tsx:13] registerUrl: ',
          registerUrl
        );
      }
      return response.data.data.introduced_hash;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  };

  // interface ReferralMethodChangeEvent {
  //   target: { checked: boolean };
  // }

  const handleReferralChange = (method: 'share' | 'email') => {
    setReferralMethod(method);
    setShareOpen(method === 'share');
  };

  /** Web Share APIで共有する（招待する） */
  const handleShare = async () => {
    setNickname(currentUserProfile.user_profile.nickname);

    if (!navigator.share) {
      alert('ご利用のブラウザでは共有できません。');
      return;
    }

    try {
      // 1) 招待レコードを作成してハッシュを取得
      const hash = await createReferralMember();
      // 2) URL を組み立て
      const shareUrl = `${siteUrl}/register?referral_hash=${hash}`;

      // 3) シェア実行
      await navigator.share({
        title: 'Bcmhzt（バクムーツ）から招待が届いています。',
        text: `${nickname}さんが、あなたをBcmhzt（バクムーツ）に招待しています。\nリンクから登録してください。`,
        url: shareUrl,
      });

      showMessage('あなたはメンバーを招待しました！', 'success', 3000);
    } catch (error) {
      const status =
        (axios.isAxiosError(error) && error.response?.status) || 'unknown';
      const message =
        (axios.isAxiosError(error) && error.response?.data.message) ||
        'unknown';
      if (status === 400) {
        showMessage('招待状人数の上限に達しました。', 'error');
      } else {
        showMessage('招待状の送信に失敗しました。', 'error');
      }
      console.error(
        `[src/components/dashboards/ReferralEntries.tsx:131] Error 招待状の送信に失敗しました。HTTP Status: ${status}`,
        [error, message]
      );
    }
  };

  /** Emailで共有する（招待する） */
  const handleEmail = async () => {
    setNickname(currentUserProfile.user_profile.nickname);

    if (!email) {
      setEmailError('メールアドレスを入力してください。');
      return;
    }

    try {
      // 1) 招待レコードを作成してハッシュを取得
      const hash = await createReferralMember();
      // 2) URL を組み立て
      const shareUrl = `${siteUrl}/register?referral_hash=${hash}`;

      const sendText = `${nickname}さんが、あなたをBcmhzt（バクムーツ）に招待しています。<br />\n以下のリンクから登録してください。<br />\n${shareUrl}<br /><br />\n\nもし、招待されていない場合は無視してください。`;

      // 3) メール送信APIを呼び出す
      const formData = new FormData();
      formData.append('email', email);
      formData.append('send_text', sendText);
      formData.append('hash', hash);

      // FormDataの内容をログ出力
      // if (debug === 'true') {
      //   for (let pair of formData.entries()) {
      //     console.log(
      //       '[src/components/dashboards/ReferralEntries.tsx:182] FormData:',
      //       pair[0],
      //       pair[1]
      //     );
      //   }
      // }

      const response = await axios.post(
        `${apiEndpoint}/v1/referral_entries/sendmail`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showMessage('招待メールを送信しました', 'success');
        document
          .querySelector('.email-input')
          ?.setAttribute('disabled', 'true');
      }
      if (debug === 'true') {
        console.log('[src/components/dashboards/ReferralEntries.tsx:175]', [
          response.data,
        ]);
      }
    } catch (error) {
      if (debug === 'true') {
        console.log(
          '[src/components/dashboards/ReferralEntries.tsx:179]',
          error
        );
      }
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        showMessage(
          'すでに登録されているEmailアドレスです。招待メールの送信を中止しました。',
          'error'
        );
        setEmail('');
        setEmailError('すでに登録されているEmailアドレスです。');
      }

      if (axios.isAxiosError(error)) {
        console.error(
          '[src/components/dashboards/ReferralEntries.tsx:205] API Error:',
          {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          }
        );
      }
      // throw error;
    } finally {
    }
  };

  return (
    <>
      {/* <pre>{JSON.stringify(referralMethod, null, 2)}</pre> */}
      {restCount >= 0 ? (
        <>
          <div className="referral-entries">
            <h2 className="referral-entries-title">紹介する</h2>
            <p className="small-comment">メンバーリファラル制度</p>
            残り人数: {restCount}人
            <img
              src="/assets/images/referral-entries.png"
              alt="Referral Entries"
            />
            <div className="referral-entries-content">
              <div className="form-check form-switch">
                <input
                  className="form-check-input switch-radio"
                  type="checkbox"
                  role="switch"
                  id="referralShare"
                  checked={referralMethod === 'share'}
                  onChange={() => handleReferralChange('share')}
                />
                <label className="form-check-label" htmlFor="referralShare">
                  アプリの共有で紹介する
                </label>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input switch-radio"
                  type="checkbox"
                  role="switch"
                  id="referralEmail"
                  checked={referralMethod === 'email'}
                  onChange={() => handleReferralChange('email')}
                />
                <label className="form-check-label" htmlFor="referralEmail">
                  メールアドレスで紹介する
                </label>
              </div>

              {shareOpen ? (
                <div className="share-content">
                  <p>
                    以下のボタンをクリックして、友達にこのサイトを共有してください。
                  </p>
                  <button
                    onClick={handleShare}
                    className="btn bcmhzt-btn btn-primary"
                  >
                    Bcmhztに知り合いを招待する
                  </button>
                </div>
              ) : (
                <div className="email-content">
                  <p>
                    友達のメールアドレスを入力して、招待状を送信してください。
                  </p>
                  <input
                    type="email"
                    placeholder="メールアドレスを入力"
                    className="email-input form-control mb10"
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailError('')}
                  />
                  <p style={{ color: 'red', fontSize: '13px' }}>{emailError}</p>
                  <button
                    className="btn bcmhzt-btn btn-primary mt10"
                    onClick={handleEmail}
                  >
                    招待を送信
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-warning" role="alert">
          【紹介制度】
          <br />
          人数の上限に達しました。ご紹介ありがとうございました。
        </div>
      )}
    </>
  );
};

export default ReferralEntries;

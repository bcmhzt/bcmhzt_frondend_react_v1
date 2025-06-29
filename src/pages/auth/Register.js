/** 0914f57b */
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';
import HeaderNoLogin from '../../components/HeaderNoLogin';
/** i18n */
import LanguageSelector from '../../utility/LanguageSelector';
import { useTranslation } from 'react-i18next';

let debug = process.env.REACT_APP_DEBUG;

/**
 * 0914f57b
 * [src/pages/v1/Register.js:xx]
 *
 * type: page
 *
 * [Order]
 * 新規アカウント登録時のスロットルとロックアウト
 * - 1分間に5回以上の登録試行がある場合、リクエストIPアドレスはロックアウトされる(backend)
 * - ロックアウトされたIPアドレスは、24時間後に自動的に解除される
 * - ロックアウトされたIPアドレスはブラックリストに記録し、監視対象にする
 *
 * メールアドレスを入力して仮登録
 * 登録したメールに６桁の認証コードが送信される
 */

const Register = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const referralHash = searchParams.get('referral_hash');
  const [isReferral, setIsReferral] = useState(false);
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const [isTooManyAccess, setIsTooManyAccess] = useState(null);

  /** referralHash がサーバーに登録されているかチェック */
  useEffect(() => {
    const checkReferralHash = async () => {
      if (!referralHash) {
        setIsReferral(false);
        return;
      }
      try {
        if (debug === 'true') {
          console.log(
            '[src/pages/Register.js] checking referralHash:',
            referralHash
          );
        }
        const response = await axios.post(
          `${apiEndpoint}/v1/referral_entries/checkhash?referral_hash=${referralHash}`,
          {}
        );
        if (debug === 'true') {
          console.log(
            '[src/pages/auth/Register.js:61] checkReferralHash response true:',
            response.data
          );
          if (
            response.data.data &&
            Array.isArray(response.data.data) &&
            response.data.data.length > 0 &&
            response.data.data[0].introduced_hash
          ) {
            console.log(
              '[src/pages/auth/Register.js:71] introduced_hash:',
              response.data.data[0].introduced_hash
            );
          }
        }

        if (response.data.status === 201) {
          setIsReferral(true);
        } else {
          setIsReferral(false);
        }
      } catch (err) {
        if (err.response && err.response.status === 429) {
          console.log(
            '[src/pages/v1/Register.js] checkReferralHash response:',
            err.response.data
          );
          setIsTooManyAccess(t('register.is_too_many_access'));
        } else {
          console.error(
            '[src/pages/Register.js] chackReferralHash error:',
            err
          );
        }

        console.error('[src/pages/Register.js] chackReferralHash error:', err);
        setIsReferral(false);
      }
    };

    checkReferralHash();
  }, [referralHash, apiEndpoint, t]);

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      return t('register.email_validation_error1');
    }
    if (!emailPattern.test(email)) {
      return t('register.email_validation_error2');
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

    setError('');
    setIsLoading(true);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    /**
     * ユーザーの仮登録
     */
    let response;

    try {
      response = await axios.post(`${apiEndpoint}/user/verifyemail`, {
        email: email,
        referral_hash: referralHash,
      });

      console.log('Verification successful:', response.data);

      if (debug === 'true') {
        console.log(
          '[src/pages/Register.js:119] Response from /user/verifyemail:',
          response
        );
      }

      if (response && response.status === 201) {
        const currentLang = i18n.language;
        if (debug === 'true') {
          console.log(
            '[src/pages/Register.js:109] Success: ' + response.data.hash
          );
        }
        navigate(`/verifyemail/${response.data.hash}?lang=${currentLang}`);
      }
    } catch (apiError) {
      // エラー処理
      if (apiError.response) {
        // サーバーがエラーを返した場合（4xx, 5xx）
        console.error('Server error:', apiError.response.data);
        console.error('Status code:', apiError.response.status);
        console.error('Headers:', apiError.response.headers);

        /** 登録済のユーザーの場合は登録できない */
        if (apiError.response.status === 403) {
          setError(t('register.email_validation_error3'));
          setIsLoading(false);
          return;
        } else if (apiError.response.status === 429) {
          setError(t('register.email_validation_error4'));
          setIsLoading(false);
          return;
        }
      } else if (apiError.request) {
        // リクエストが送信されたが応答がない場合
        setError('No response received:', apiError.request);
        console.error('No response received:', apiError.request);
        setIsLoading(false);
        return;
      } else {
        // その他のエラー（設定ミスやネットワークエラーなど）
        setError('No response received:', apiError.request);
        console.error('Error during setup:', apiError.message);
        setIsLoading(false);
        return;
      }

      // 必要に応じてエラーメッセージをUIに表示
      console.error('An error occurred:', apiError);
      throw apiError; // エラーを再スローして上位でキャッチする
    }
  };

  return (
    <>
      <HeaderNoLogin />
      <LanguageSelector />

      {/* <pre>{JSON.stringify(referralHash, null, 2)}</pre> */}

      <div className="login container d-flex justify-content-center mt80">
        <div className="card p-4" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="text-center mb-4">{t('register.title')}</h2>

          {isTooManyAccess && <p className="text-danger">{isTooManyAccess}</p>}

          {isReferral ? (
            <></>
          ) : (
            <p className="referral-message">{t('register.referral_message')}</p>
          )}

          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group mb-3">
              <label className="mb10" htmlFor="email">
                {t('register.email')}
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('register.placeholder_email')}
                required
                disabled={!isReferral}
              />
            </div>

            <button
              type="submit"
              className="mt50 bcmhzt-btn btn btn-primary w-100 bcmhzt-btn-sm"
              disabled={isLoading || !isReferral}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('register.loading_message')}
                </>
              ) : (
                t('register.submit')
              )}
            </button>
          </form>
          <div className="create-account mt30">
            <Link to="/login">{t('register.to_login')}</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderNoLogin from '../../components/HeaderNoLogin';
import LanguageSelector from '../../utility/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Button, InputGroup, FormControl, Spinner } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/VerifyEmail.js:14] debug:', debug);
}

/**
 * fba7c8b2
 * [src/pages/VerifyEmail.js:xx]
 *
 * type: page
 *
 * [Order]
 * メールで届いた６桁の認証コードを入力
 * 認証できたらログイン画面に遷移
 *
 */

const VerifyEmail: React.FC = () => {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  console.log(currentLang);

  // ...existing code...
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (/^\d$/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value !== '' && index < 5) {
        document.getElementById(`digit-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // バックスペースで前のフィールドに移動
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // 認証ボタンがクリックされたときにAPIへPOSTリクエストを送信
  const handleVerify = async () => {
    setIsLoading(true);
    setError('');
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setIsLoading(false);
      setError(String(t('verifyemail.input_verification_code')));
      return;
    }
    if (password === null || password === '') {
      setIsLoading(false);
      setError(String(t('verifyemail.input_password')));
      return;
    }
    if (password !== confirmPassword) {
      setIsLoading(false);
      setError(String(t('verifyemail.input_password_not_match')));
      return;
    }
    const passwordPolicy =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // パスワードポリシーに合っているかを確認
    if (!passwordPolicy.test(password)) {
      setIsLoading(false);
      setError(String(t('verifyemail.input_password_policy')));
      return;
    }

    try {
      /**
       * Email authentication API
       */
      const response = await axios.post(`${apiEndpoint}/user/verifiedemail`, {
        hash: hash, // URLから取得したhash
        code: verificationCode, // 入力された認証コード
        password: password,
      });

      if (debug === 'true') {
        console.log('[src/pages/VerifyEmail.js:91] debug:', response);
      }

      // APIが成功を返した場合の処理
      if (response.status === 201 || response.status === 200) {
        if (debug === 'true') {
          console.log('Verification successful', response.data);
        }
        // return; // debug
        navigate(`/login?${currentLang}`);
      } else if (response.status === 492) {
        setIsLoading(false);
        setError('バリデーションに失敗しました。[492]');
        return;
      } else if (response.status === 403) {
        setIsLoading(false);
        setError('認証テーブルがありません。[403]');
        return;
      } else {
        setIsLoading(false);
        setError('認証に失敗しました。[01]');
        return;
      }
    } catch (error) {
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        console.log(
          '[src/pages/VerifyEmail.js:124] /user/verifiedemail error:',
          error.response?.status
        );
      } else {
        console.log(
          '[src/pages/VerifyEmail.js:124] /user/verifiedemail error:',
          error
        );
      }
      console.error('Error during verification:', error);
      setError('認証に失敗しました。[02]');

      return;
    }
  };

  return (
    <>
      <HeaderNoLogin />
      <LanguageSelector />

      <div className="login container d-flex justify-content-center mt20">
        <div
          className="card p-2 verify-email"
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div className="card-body mt20">
            <h5 className="card-title message-title">
              {t('verifyemail.title')}
            </h5>
            <p className="submessage">Input your code.</p>
            {/* エラーメッセージ表示 */}
            {error && (
              <p className="text-danger mt20 ml50 mr50 d-flex align-items-end">
                {error}
              </p>
            )}
            <p className="card-text description">
              {t('verifyemail.message')}
              <br></br>
            </p>
            <div className="d-flex justify-content-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id={`digit-${index}`}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  maxLength={1}
                  className="form-control digit-input"
                  style={{
                    width: '40px',
                    margin: '0 5px',
                    textAlign: 'center',
                    fontSize: '24px',
                  }}
                />
              ))}
            </div>

            {/* パスワード入力フィールド */}
            <div className="passwod-input mt30 ml30 mr30">
              <div className="password-area">
                <div className="mb20">
                  <InputGroup>
                    <FormControl
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="パスワードを入力してください"
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlash /> : <Eye />}
                    </Button>
                  </InputGroup>
                </div>

                <InputGroup>
                  <FormControl
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="もう一度パスワードを入力してください"
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash /> : <Eye />}
                  </Button>
                </InputGroup>
              </div>
            </div>

            {/* 認証ボタン */}
            <button
              onClick={handleVerify}
              className="btn btn-primary mt30 bcmhzt-btn mb10"
              disabled={isLoading} // ローディング中はボタンを無効化
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('verifyemail.authenticating')}
                </>
              ) : (
                t('verifyemail.authenticating')
              )}
            </button>

            {/* hashを表示（デバッグ用） */}
            {/* <p className="mt20">URLのHash値: {hash}</p> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;

/** 81fdd56e */
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HeaderNoLogin from '../../components/HeaderNoLogin';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import LanguageSelector from '../../utility/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { useAuth } from  "../../contexts/AuthContext";

/**
 * 81fdd56e (hash)
 * [src/pages/auth/Login.tsx:xx]
 * 
 * type: page
 * 
 * [Order]
 * - 各Componentの雛形
 */

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();
  // const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  // const vapidKey = process.env.REACT_APP_VAPID_KEY;
  const { t } = useTranslation();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const loginAuth = useAuth();
  // isLoginがtrueならダッシュボードにリダイレクト
  useEffect(() => {
    if (loginAuth?.isLogin) {
      navigate("/dashboard");
    }
  }, [loginAuth?.isLogin, navigate]);
  
  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleSubmit = async (e: HandleSubmitEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setLoadingLogin(true); // ログイン開始

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        // try {
        //   const token = await user.getIdToken();
        // } catch (error) {
        //   console.error("[src/pages/Login.j:99] Error during publishing json web token: ", error);
        // }

        navigate("/dashboard");

      } else {
        alert(t('login.login_error1'));
        setError(t('login.login_error2'));
        await auth.signOut();
      }
    } catch (error: unknown) {
      setError(t('login.login_error3'));
    } finally {
      setLoadingLogin(false); // 処理完了後に false に戻す
    }
  };

  return (
    <>
      <HeaderNoLogin />
      <LanguageSelector />

      <div className="login container d-flex justify-content-center mt80">
        <div className="card p-4" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="text-center mb-4">{t('login.title')}</h2>
          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group mb-3">
              <label className="mb10" htmlFor="email">{t('login.email')}</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.placeholder_email')}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label className="mb10" htmlFor="password">{t('login.password')}</label>
              <InputGroup>
                <FormControl
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.placeholder_password')}
                  required
                />
                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash /> : <Eye />}
                </Button>
              </InputGroup>
            </div>
            <p><Link to="/forgotmypassword" className="forgotPassword">
            {t('login.forgot_password')}
            </Link></p>

            <button
              type="submit"
              className="mt50 btn-bc-main btn btn-primary w-100 bcmhzt-btn"
              disabled={loadingLogin} // ローディング中はボタンを無効化
            >
              {loadingLogin ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('login.loading')}  {/* ローディング中のテキスト */}
                </>
              ) : (
                "Login"
              )}
            </button>

          </form>
          <div className="create-account mt30">
            <Link to="/v1/register">{t('login.to_register')}</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

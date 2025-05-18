/**
 * path: /forgotmypassword
 * Document
 * https://docs.google.com/document/d/1AuxLeXvjJMcbI1f8soyuEzzpuRFpXngHoVlBr_-zlkk/edit?tab=t.0
 * 
 * component: LanguageSelector
 * /locales/{{lng}}/translation.json
 */
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import axios from 'axios';
import LanguageSelector from '../../utility/LanguageSelector';
import { useTranslation } from 'react-i18next';

const ForgotMyPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  interface ForgotPasswordResponse {
    status: number;
    data: any;
  }

  const handlePasswordReset = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
    console.log(apiEndpoint);
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      /**
       * Firebaseのデフォルトの機能を利用していたが、オリジナルの機能に変更
       * リセットメールの送信はBackend側からオリジナルの文面とメールで送信する
       * 1. メールアドレスにリセットリンクを送信 (react + Laravel)
       * 2. リンクをクリックしてパスワードをリセット
       * 3. パスワードをリセットしたら、ログインページにリダイレクト
       */
      const response: ForgotPasswordResponse = await axios.post(`${apiEndpoint}/user/forgotpassword`, {
        email: email
      });

      if (response.status === 201) {
        setMessage("パスワードリセットメールを送信しました。メールを確認してください。");

        // メール送信後にログインページにリダイレクト
        setTimeout(() => {
          navigate("/login");
        }, 60000); // 1分後にリダイレクト
      } else {
        setError("メール送信に失敗しました。再度お試しください。");
      }

    } catch (error) {
      console.error("Failed to send reset email", error);
      setError("メール送信に失敗しました。再度お試しください。");
    }
  };

  return (
    <>
      <Header />
      <LanguageSelector />

      <div className="forgot-password container d-flex justify-content-center mt50">
        <div className="card p-4" style={{ width: "100%", maxWidth: "400px" }}>

          <h2 className="text-center mb-4">{t('forgotmypassword.title')}</h2>
          {message && <p className="text-success">{message}</p>}
          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handlePasswordReset}>
            <div className="form-group mb-3 mt20">
              <label htmlFor="email">{t('forgotmypassword.email')}</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('forgotmypassword.enter_your_email')}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary bcmhzt-btn w-100 mt30">
              {t('forgotmypassword.submit')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotMyPassword;
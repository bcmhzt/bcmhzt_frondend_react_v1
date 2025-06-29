/**
 * path: /passwordreset/:hash
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import axios from 'axios';

/**
 * 
 * @returns hashをDataseに問い合わせる
 * hashが存在すれば、パスワードリセット画面を表示
 * hashが存在しなければ、エラーページを表示
 * 新しいパスワードを入力してもらい、Firebaseに送信
 * Firebaseでパスワードをリセット
 */
const PasswordReset = () => {
  const { hash } = useParams();
  console.log(hash);
  const env = process.env.REACT_APP_ENV;
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState(null);
  const [uid, setUid] = useState(null);
  const navigate = useNavigate();

  // hashをデータベースに問い合わせる
  // console.log(hash);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${apiEndpoint}/user/getpasswordresethash`, {
          hash: hash
        });
        // ここでemailとuidを取得してセット
        setEmail(response.data.email);
        setUid(response.data.uid);
      } catch (error) {
        navigate('/error/パスワードリセットリンクが無効です。');
      }

      if (env === 'local' || env === 'dev') {
        console.log(password);
        console.log('email: ' + email);
        console.log('uid: ' + uid);
      }
    };
    fetchData();
  }, [hash, apiEndpoint, email, env, navigate, password, uid]);


  interface ValidatePasswordResult {
    (password: string): string | null;
  }

  const validatePassword: ValidatePasswordResult = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
      return "パスワードは8文字以上である必要があります。";
    }
    if (!hasUpperCase) {
      return "パスワードには少なくとも1つの大文字を含める必要があります。";
    }
    if (!hasLowerCase) {
      return "パスワードには少なくとも1つの小文字を含める必要があります。";
    }
    if (!hasNumber) {
      return "パスワードには少なくとも1つの数字を含める必要があります。";
    }
    if (!hasSpecialChar) {
      return "パスワードには少なくとも1つの特殊文字を含める必要があります。(!@#$%^&*)";
    }
    return null;
  };

  

  interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  interface PasswordResetResponse {
    status: number;
    data: {
      uid: string;
      email: string;
      hash: string;
    };
  }

  const handleSubmit = async (e: HandleSubmitEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    if (env === 'local' || env === 'dev') {
      console.log(password);
    }

    try {
      const response: PasswordResetResponse = await axios.post(`${apiEndpoint}/user/passwordreset/${hash}`, {
        uid,
        password,
        email
      });
      if (response.status === 201) {
        alert('パスワードリセットが完了しました。ログインページから再ログインしてください。');
        navigate('/login');
      } else {
        alert('パスワードリセットに失敗しました。最初からやり直してください。');
        navigate('/login');
      }
    } catch (error) {
      alert('パスワードリセット失敗');
    }
  };

  return (
    <>
      <Header />
      <div className="login container d-flex justify-content-center mt100">
        <div className="card p-4" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="text-center mb-4">Password reset</h2>
          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handleSubmit} noValidate>
          <div className="form-group mb-3">
            <label className="mb10" htmlFor="password">パスワード</label>
            <InputGroup>
              <FormControl
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeSlash /> : <Eye />}
              </Button>
            </InputGroup>
          </div>
          <div className="form-group mb-3">
            <label className="mb10" htmlFor="confirmPassword">パスワード（確認）</label>
            <InputGroup>
              <FormControl
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
              <Button variant="outline-secondary" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeSlash /> : <Eye />}
              </Button>
              </InputGroup>
            </div>
            <button type="submit" className="mt50 bcmhzt-btn btn btn-primary w-100">
            パスワードを設定する
          </button>
          </form>
        </div>
      </div>
    </>
  );
};
export default PasswordReset;

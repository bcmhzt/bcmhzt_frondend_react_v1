import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC = () => {
  const auth = useAuth();

  if (!auth) {
    // 認証情報が取得できない場合はローディング表示
    return <div>Loading...</div>;
  }

  const { loading, isLogin } = auth;

  // ロード中は何かスピナーでも返す
  if (loading) {
    return <div>Loading...</div>;
  }
  // 認証されていなければ /login へリダイレクト
  return isLogin ? <Outlet /> : <Navigate to="/login" replace />;
};
export default PrivateRoute;
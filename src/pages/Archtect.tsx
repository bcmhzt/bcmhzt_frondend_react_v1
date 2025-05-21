/** 99999999 */
import React from 'react';
// import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
// import { LoadingOverlay } from "../components/LoadingOverlay";

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/Archtect.tsx:xx] debug:', debug);
}

/**
 * 99999999 (hash)
 * [src/pages/Archtect.tsx:xx]
 *
 * type: page | component | hook | context ...
 *
 * [Order] このコードでやっていること
 * - 各Componentの雛形
 */

/** API から取得するデータの型 */
interface ArchtectData {
  title: string;
  description: string;
}

/** データ取得関数 */
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
async function fetchArchtectData(): Promise<ArchtectData> {
  // テスト用に 1.5秒 の遅延を入れる
  await new Promise<void>((resolve) => setTimeout(resolve, 1500));
  const response = await axios.get(`${apiEndpoint}/bcmhzt`);
  return response.data;
}

const Archtect: React.FC = () => {
  // React Query でデータ＋ローディング／エラー状態を取得
  const { data, isLoading, isError, error } = useQuery<ArchtectData, Error>({
    queryKey: ['architectData'],
    queryFn: fetchArchtectData,
    retry: 1,
  });

  // グローバルオーバーレイは LoadingProvider が制御するので、
  // isLoading 時に何も返さず null にしておくと LoadingOverlay が画面に出ます
  if (isLoading) {
    // LoadingProvider の useIsFetching() に任せる場合は null を返す
    return null;
  }

  // エラー時はページ内にメッセージ
  if (isError) {
    return (
      <div className="app-body">
        <Header />
        <div className="container my-5">
          <div className="alert alert-danger">
            データの取得に失敗しました: {error.message}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // データ取得済みなら通常のページを表示
  return (
    <div className="app-body">
      <Header />

      <div className="container bc-app">
        {/* セクション単位のローディング例（必要に応じて） */}
        {isLoading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* 取得したデータを使った中身 */}
        {data && (
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              {/* <pre>{JSON.stringify(data.title, null, 2)}</pre> */}
              <h2>{JSON.stringify(data, null, 2)}</h2>
              <p>{JSON.stringify(data, null, 2)}</p>
            </div>
            <div className="d-none d-md-block col-md-6 bc-right">
              barbarbarbarbarbarbarbarbarbarbarbarbarbar
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Archtect;

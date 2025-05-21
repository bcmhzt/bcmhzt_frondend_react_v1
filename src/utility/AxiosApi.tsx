// src/utility/AxiosApi.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { AuthContextType } from '../contexts/AuthContext';

interface RequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (err: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(token!);
  });
  failedQueue = [];
};

export function createAxiosApi(auth: AuthContextType): AxiosInstance {
  const instance = axios.create({
    baseURL: process.env.REACT_APP_API_ENDPOINT,
  });

  // --- リクエスト前に必ず最新トークンをセット ---
  instance.interceptors.request.use(
    (config) => {
      if (auth.token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${auth.token}`;
      }
      return config;
    },
    (e) => Promise.reject(e)
  );

  // --- 401 / 403 を検知したら“強制リフレッシュ”→リトライ ---
  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      const originalReq = error.config as RequestConfigWithRetry;
      const status = error.response?.status;

      if ((status === 401 || status === 403) && !originalReq._retry) {
        if (isRefreshing) {
          // すでにリフレッシュ中ならキューに積む
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalReq.headers!['Authorization'] = `Bearer ${token}`;
            return instance(originalReq);
          });
        }

        originalReq._retry = true;
        isRefreshing = true;

        return new Promise<AxiosResponse>(async (resolve, reject) => {
          try {
            const newToken = await auth.refreshToken();
            processQueue(null, newToken);
            originalReq.headers!['Authorization'] = `Bearer ${newToken}`;
            resolve(instance(originalReq));
          } catch (e) {
            processQueue(e, null);
            auth.logout();
            reject(e);
          } finally {
            isRefreshing = false;
          }
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

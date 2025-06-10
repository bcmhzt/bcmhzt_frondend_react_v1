import axios from 'axios';
import { FetchMatchedListResponse } from '../types/chat';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

/**
 * マッチしたユーザー一覧を取得
 * @param token 認証トークン
 * @param page ページ番号
 * @returns マッチユーザー一覧
 */
export async function fetchMatchedList(
  token: string, 
  page: number = 1
): Promise<FetchMatchedListResponse> {
  try {
    const res = await axios.post<FetchMatchedListResponse>(
      `${apiEndpoint}/v1/get/matched_member?page=${page}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error('[fetchMatchedList] error:', error);
    throw error;
  }
}
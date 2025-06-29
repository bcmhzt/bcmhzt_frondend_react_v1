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

export async function generateChatRoomId(uids: string[]) {
  const sorted = [...uids].sort();
  const joined = sorted.join("_");

  const encoder = new TextEncoder();
  const data = encoder.encode(joined);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hashBuffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
import { Timestamp } from 'firebase/firestore';

// APIから取得するマッチユーザー情報
export interface MatchedUser {
  matched_uid: string;
  nickname: string;
  bcuid: string;
  profile_images?: string;
}

// Firestoreのchatsコレクション
export interface ChatRoom {
  name: string;            // グループ名（なし）
  type: 'private';        // 現状privateのみ
  is_closed: boolean;     // true/false
  created_at: Timestamp;  // 作成日時
  updated_at: Timestamp;  // 更新日時
  members: string[];      // 参加ユーザー2名のUID
}

// Firestore chats/{chatId}/messagesサブコレクション
export interface ChatMessage {
  id?: string;         // 追加
  sender_id: string;     // 送信者のuid
  text: string;         // メッセージ本文
  image_url: string[];  // 画像URL（複数）
  read_by: string[];    // 既読をつけたユーザーUIDのリスト
  is_deleted: boolean;  // true/false
  created_at: Timestamp; // 作成日時
}

// UI表示用に拡張したチャットルーム情報
export interface OpenChatRoom extends ChatRoom {
  id: string;                     // FirestoreのドキュメントID
  unreadCount: number;            // 未読メッセージ数
  otherUid: string | null;        // 相手のUID
  userInfo: MatchedUser | null;   // 相手のユーザー情報
}

// APIのレスポンス型
export interface FetchMatchedListResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    data: MatchedUser[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
  };
}
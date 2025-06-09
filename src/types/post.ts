export interface OGPData {
  url: string;
  title: string;
  description: string;
  image: string;
}

export interface PostData {
  // 投稿基本情報
  post_id: number;
  reply_id?: number;
  uid: string;
  post: string;
  post_images: string;  // JSON文字列
  post_status: number;
  post_created_at: string;
  post_updated_at: string;
  delete_flg: number;
  created_at: string;
  updated_at: string;

  // ユーザー情報
  id: number;
  bcuid: string;
  email: string;
  nickname: string;
  description: string;
  profile_images: string | null;
  status: number;
  gender: string | null;

  // プロフィール詳細（全てnull許容）
  gender_detail: string | null;
  age: string | null;
  location: string | null;
  occupation_type: string | null;
  bheight: string | null;
  bweight: string | null;
  blood_type: string | null;
  academic_background: string | null;
  marital_status: string | null;
  hobbies_lifestyle: string | null;
  alcohol: string | null;
  tobacco: string | null;
  pet: string | null;
  holidays: string | null;
  favorite_food: string | null;
  character: string | null;
  religion: string | null;
  belief: string | null;
  conditions_ideal_partner: string | null;
  age_range: string | null;
  target_area: string | null;
  marriage_aspiration: string | null;
  self_introductory_statement: string | null;
  others_options: string | null;
  profile_video: string | null;

  // カウント情報
  replies_count: number;
  likes_count: number;
  bookmarks_count: number;

  // OGP情報
  ogps: OGPData[];
}
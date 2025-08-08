/** dee4d281 OK */
import React, { useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  useInfiniteQuery,
  QueryFunctionContext,
  InfiniteData,
} from '@tanstack/react-query';
import MeassageChatRoomCard from '../../components/messages/MeassageChatRoomCard';
import { generateChatRoomId } from '../../utility/Chat';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/messages/MessageChatsList.tsx:xx] ‼️debug:',
    debug
  );
}

interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: ApiPage;
  badges?: {
    total_count: number;
    latest_created_at: string | null;
  };
  errors: any;
}

interface ApiPage {
  current_page: number;
  data: ApiData[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

interface ApiData {
  matched_uid: string;
  id: number;
  uid: string;
  target_uid: string;
  reason: string;
  level: number;
  created_at: string;
  updated_at: string;
  bcuid: string;
  email: string;
  nickname: string | null;
  description: string | null;
  profile_images: string | null;
  status: number | null;
  gender: string | null;
  gender_detail: string | null;
  age: number | null;
  location: string | null;
  occupation_type: string | null;
  bheight: number | null;
  bweight: number | null;
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
  member_like_created_at: string;
  user_profile_created_at: string;
}

/**
 * チャットルーム一覧（マッチング）
 * @returns
 */
const MesageChatsList = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT!;
  const { currentUserProfile, token } = useAuth();
  const [chatRoomIds, setChatRoomIds] = React.useState<Record<string, string>>(
    {}
  );

  // console.log('[src/components/messages/MessageChatsList.tsx:97] token:', token);

  async function fetchApiData(
    page: number,
    token: string
  ): Promise<ApiResponse> {
    const res = await axios.post(
      `${apiEndpoint}/v1/get/matched?page=${page}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(
      '[src/components/messages/MessageChatsList.tsx:107] 😑 res.data:',
      res.data
    );
    return res.data;
  }

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    // refetch,
  } = useInfiniteQuery<
    ApiResponse,
    Error,
    InfiniteData<ApiResponse>, // ←ここを修正
    [_: string, token: string]
  >({
    queryKey: ['memberList', token!],
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<[_: string, token: string]>) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return await fetchApiData(page, token!);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    retry: 1,
    enabled: !!token,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node || !hasNextPage || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const listDatas = React.useMemo(() => {
    return data?.pages.flatMap((p) => p.data.data) ?? [];
  }, [data]);

  React.useEffect(() => {
    const fetchChatRoomIds = async () => {
      const ids: Record<string, string> = {};
      for (const user of listDatas) {
        const myUid = currentUserProfile?.user_profile?.uid;
        const partnerUid = user.uid;

        // 安全に進める
        if (!myUid || !partnerUid) continue;

        const chatRoomId = await generateChatRoomId([myUid, partnerUid]);
        console.log(
          `[src/components/messages/MessageChatsList.tsx:188] chatRoomId: ${chatRoomId}`
        );
        ids[partnerUid] = chatRoomId;
      }
      setChatRoomIds(ids);
    };

    if (listDatas.length > 0) {
      fetchChatRoomIds();
    }
  }, [listDatas, currentUserProfile]);

  return (
    <div>
      {isLoading && <p>読み込み中...</p>}
      {isError && <p>エラー: {error.message}</p>}

      <div className="chat-room-count d-flex justify-content-end">
        <p>mesages count: {listDatas.length}</p>
      </div>
      <ul className="chat-room-list">
        {listDatas.map((user, index) => (
          <li
            key={user.id}
            ref={index === listDatas.length - 1 ? lastItemRef : null}
            style={{ height: 'auto' }}
            className="chat-room-item"
          >
            {/* {index} */}
            {/* <pre>partner_uid: {JSON.stringify(user.uid, null, 2)}</pre> */}
            {/* <pre>
              my_uid:
              {JSON.stringify(currentUserProfile?.user_profile?.uid, null, 2)}
            </pre> */}
            {/* {user.nickname} (@{user.bcuid}) - {user.location} */}
            {chatRoomIds[user.uid] ? (
              <MeassageChatRoomCard
                user={user}
                chatRoomId={chatRoomIds[user.uid]}
              />
            ) : (
              <p>チャットルームID生成中...</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MesageChatsList;

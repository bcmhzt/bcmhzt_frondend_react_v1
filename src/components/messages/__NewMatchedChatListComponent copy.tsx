/** a069c8b8 */
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import type { MatchUser, MatchListResponse } from '../../types/match';
import ChatRoomCard from '../../components/messages/ChatRoomCard';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log(
    '[src/components/messages/NewMatchedChatListComponent.tsx:xx] debug:',
    debug
  );
}

const fetchMatchedUsers = async ({
  pageParam,
  token,
}: {
  pageParam?: unknown;
  token: string;
}) => {
  const page = typeof pageParam === 'number' ? pageParam : 1;
  const res = await axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/v1/get/matched?page=${page}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(
    '[src/components/messages/NewMatchedChatListComponent.tsxsrc/components/messages/NewMatchedChatListComponent.tsx:34] page:',
    page
  );
  console.log(
    '[src/components/messages/NewMatchedChatListComponent.tsx:36] response:',
    res.data
  );
  // return res.data as MatchListResponse;
};

const NewMatchedChatListComponent: React.FC = () => {
  const { token, currentUserProfile } = useAuth();

  const MessageList: React.FC = () => {
    const { token, currentUserProfile } = useAuth();
    // const [chatDataList, setChatDataList] = useState<ChatRoomDisplayData[]>([]);
    const now = new Date(); // クライアント時刻を取得
    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      isError,
      error,
    } = useInfiniteQuery<MatchListResponse, Error>({
      queryKey: ['matchedUsers', token],
      // queryFn: ({ pageParam }) => {
      //   if (!token) return Promise.reject(new Error('Token is missing'));
      //   return fetchMatchedUsers({ pageParam, token });
      // },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { current_page, last_page } = lastPage.data;
        return current_page < last_page ? current_page + 1 : undefined;
      },
      enabled: !!token,
    });

    return <>MessageList Component</>;
  };

  return <div>NewMatchedChatListComponent</div>;
};
export default NewMatchedChatListComponent;

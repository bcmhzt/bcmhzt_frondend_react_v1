import React, { useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { convertUtcToTimeZone } from '../../utility/GetCommonFunctions';
import type { MatchUser, MatchListResponse } from '../../types/match';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const fetchMatchedUsers = async ({
  pageParam,
  token,
}: {
  pageParam?: unknown;
  token: string;
}) => {
  const page = typeof pageParam === 'number' ? pageParam : 1;
  const res = await axios.post(
    `${apiEndpoint}/v1/get/matched?page=${page}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data as MatchListResponse;
};

const MessageList2: React.FC = () => {
  const { token } = useAuth();

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
    queryFn: ({ pageParam }) =>
      token
        ? fetchMatchedUsers({ pageParam, token })
        : Promise.reject(new Error('Token is null')),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    enabled: !!token,
  });

  const matchedUsers: MatchUser[] =
    data?.pages.flatMap((p) => p.data.data) ?? [];

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node) return;
      observerRef.current?.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  if (isLoading) return <div>読み込み中...</div>;
  if (isError) return <div>エラー: {error.message}</div>;

  return (
    <ul className="chat-room-list">
      {matchedUsers.map((user, i) => {
        const isLast = i === matchedUsers.length - 1;
        const lastMessage = (user as any).latest_message;

        return (
          <li
            key={user.uid}
            ref={isLast ? lastItemRef : null}
            className="chat-room-item"
          >
            <Link to={`/messages/${user.uid}`} className="chat-room-link">
              <img
                src={
                  user.profile_images
                    ? buildStorageUrl(
                        process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ?? '',
                        user.profile_images,
                        '_small'
                      )
                    : `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                }
                alt="avatar"
                className="chat-avatar"
              />
              <div className="chat-room-text">
                <div className="chat-user">
                  <span className="nickname">{user.nickname}</span>
                  <span className="bcuid">@{user.bcuid}</span>
                </div>
                <div className="chat-preview">
                  {lastMessage?.text
                    ? lastMessage.text.slice(0, 50)
                    : lastMessage?.image_url?.length
                      ? '[画像]'
                      : '(メッセージなし)'}
                </div>
                <div className="timestamp">
                  {convertUtcToTimeZone(
                    lastMessage?.created_at || '',
                    'Asia/Tokyo'
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
      {isFetchingNextPage && <li className="loading">さらに読み込み中…</li>}
    </ul>
  );
};

export default MessageList2;

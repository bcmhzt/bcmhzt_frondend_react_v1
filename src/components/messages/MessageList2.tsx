import axios from 'axios';
import { useRef, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { buildStorageUrl } from '../../utility/GetUseImage';
import ChatModal from './ChatModal';

/* matchしたユーザー */
interface MatchedMember {
  matched_uid: string;
  id: number;
  uid: string;
  bcuid: string;
  nickname: string;
  profile_images: string;
  gender: string;
  age: number;
  location: string;
}

/* pagenation */
interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface MatchedListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    current_page: number;
    data: MatchedMember[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  errors: null | any;
}

const MessageList2 = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { token } = useAuth();
  const observerTarget = useRef<HTMLDivElement>(null); // 修正: observerRef → observerTarget
  const storage = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL;
  const [selectedMember, setSelectedMember] = useState<MatchedMember | null>(
    null
  );

  const fetchMatchedList = async (
    page: number = 1
  ): Promise<MatchedListResponse> => {
    try {
      const response = await axios.post<MatchedListResponse>(
        `${apiEndpoint}/v1/get/matched_member?page=${page}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('[MessageList2] fetchMatchedList error:', error);
      throw error;
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['matchedMembers', token],
    queryFn: ({ pageParam = 1 }) => fetchMatchedList(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.data.data.length) return undefined;
      return lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined;
    },
    enabled: !!token,
  });

  // Intersection Observer の設定
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // マッチしたメンバーの一覧を結合
  const matchedMembers = data?.pages.flatMap((page) => page.data.data) ?? [];

  const handleChatClick = (member: MatchedMember) => {
    setSelectedMember(member);
  };

  const handleCloseChat = () => {
    setSelectedMember(null);
  };

  return (
    <>
      <div className="message-list">
        {isLoading ? (
          <div className="text-center my-3">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center text-danger">
            エラーが発生しました: {error.message}
          </div>
        ) : (
          <>
            <ul className="chat-rooms">
              {matchedMembers.map((member) => (
                <li
                  key={member.id}
                  className="chat-room-item"
                  onClick={() => handleChatClick(member)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center p-3">
                    <div className="avatar me-3">
                      <img
                        src={buildStorageUrl(
                          storage ?? '',
                          member.profile_images,
                          '_thumbnail'
                        )}
                        alt={member.nickname}
                        className="avatar-36"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="mb-0">{member.nickname}</div>
                      <small className="text-muted">
                        {member.age}歳・{member.location}
                      </small>
                    </div>
                    <div>message</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Intersection Observer のターゲット要素 */}
            <div ref={observerTarget} style={{ height: '20px' }}>
              {isFetchingNextPage && (
                <div className="text-center">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>

            {!hasNextPage && matchedMembers.length > 0 && (
              <div className="text-center text-muted my-3">
                これ以上のメッセージはありません
              </div>
            )}
          </>
        )}
      </div>

      <ChatModal
        member={selectedMember}
        onClose={handleCloseChat}
        storage={storage}
      />
    </>
  );
};

export default MessageList2;

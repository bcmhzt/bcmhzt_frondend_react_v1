/** 89e6f05d */
import React, { useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { buildStorageUrl } from '../../utility/GetUseImage';

let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/notice/NoticeList.tsx] debug mode enabled');
}

interface NoticeLog {
  id: number;
  uid: string;
  target_uid: string;
  member_image: string;
  action_type: string;
  log_type: string;
  log_message: string;
  created_at: string;
  updated_at: string;
}

interface NoticeLogsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    current_page: number;
    data: NoticeLog[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  errors: any;
}

const fetchNoticeLogs = async (
  page: number,
  token: string
): Promise<NoticeLogsResponse> => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/v1/notice_logs?page=${page}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (debug === 'true') {
    console.log('[NoticeList] fetchNoticeLogs result:', res.data);
  }
  return res.data;
};

const NoticeList: React.FC = () => {
  const { token } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<NoticeLogsResponse, Error>({
    queryKey: ['noticeLogs'],
    queryFn: ({ pageParam = 1 }) =>
      fetchNoticeLogs(pageParam as number, token!),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    retry: 1,
  });

  const lastItemRef = React.useCallback(
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

  const logs: NoticeLog[] =
    data?.pages.flatMap((page) => page?.data?.data ?? []) ?? [];

  if (isLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger mt30">
        通知の取得中にエラーが発生しました: {error.message}
      </div>
    );
  }

  return (
    <div className="notice-logs">
      <ul className="notice-logs-list">
        {logs.length === 0 ? (
          <div className="no-data mb10">まだ情報がありません</div>
        ) : (
          logs.map((log, index) => (
            <li
              key={log.id}
              ref={index === logs.length - 1 ? lastItemRef : null}
            >
              <div className="notice-logs-item d-flex justify-content-start">
                <div className="avatar-area">
                  <img
                    className="avatar"
                    src={
                      log?.member_image
                        ? buildStorageUrl(
                            process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ||
                              '',
                            log.member_image,
                            '_small'
                          )
                        : `${process.env.PUBLIC_URL}/assets/dummy-user.png`
                    }
                    alt="user"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `${process.env.PUBLIC_URL}/assets/dummy-user.png`;
                    }}
                  />
                </div>
                <div
                  className="notice-message"
                  dangerouslySetInnerHTML={{ __html: log.log_message }}
                />
                <div className="date">{log.created_at}</div>
              </div>
            </li>
          ))
        )}
        {isFetchingNextPage && (
          <div className="text-center my-3">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading more…</span>
            </div>
          </div>
        )}
      </ul>
    </div>
  );
};

export default NoticeList;

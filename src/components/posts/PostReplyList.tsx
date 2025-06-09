import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
// import PostCard from './PostCard';
import { PostData } from '../../types/post';
import { buildStorageUrl } from '../../utility/GetUseImage';
import GetGenderIcon from '../commons/GetGenderIcon';

interface PostReplyListProps {
  id: number;
}

interface RepliesPage {
  current_page: number;
  last_page: number;
  total: number;
  data: PostData[];
}

interface ReplyListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    post_id: string;
    replies: RepliesPage;
    replies_count: number;
  };
  errors: any;
}

const fetchReplies = async (
  page: number,
  postId: number,
  token: string
): Promise<ReplyListResponse> => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/v1/get/replies?page=${page}`,
    { post_id: postId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const PostReplyList: React.FC<PostReplyListProps> = ({ id }) => {
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
  } = useInfiniteQuery<ReplyListResponse, Error>({
    queryKey: ['replies', id],
    queryFn: ({ pageParam = 1 }) =>
      fetchReplies(pageParam as number, id, token!),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data?.replies) return undefined;
      const { current_page, last_page } = lastPage.data.replies;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    retry: 1,
    initialPageParam: 1,
  });

  const lastItemRef = React.useCallback(
    (node: HTMLDivElement | null) => {
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

  // 全ての返信を取得
  const replies =
    data?.pages.flatMap((page) =>
      page?.data?.replies?.data ? page.data.replies.data : []
    ) ?? [];

  if (isLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="alert alert-secondary mt30">
        この投稿にはまだ返信がありません。
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger mt30">
        エラーが発生しました: {error.message}
      </div>
    );
  }

  return (
    <div className="post-replies mt30">
      <hr />

      {replies.length === 0 ? (
        <div className="text-muted">まだ返信はありません</div>
      ) : (
        <div className="replies-list">
          <div className="replies-list-header mb20">
            <div className="replies-list-title">Reply list</div>
          </div>
          {replies.map((reply, index) => (
            <>
              <div
                key={reply.reply_id}
                ref={index === replies.length - 1 ? lastItemRef : null}
                className="post-reply-item pt20"
              >
                <div className="header d-flex align-items-center justify-content-start">
                  <div className="avatar">
                    {/* <pre>{JSON.stringify(reply.profile_images, null, 2)}</pre> */}
                    <Link to={`/member/${reply.bcuid}`}>
                      <img
                        className="avatar-36"
                        src={
                          buildStorageUrl(
                            process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL ||
                              '',
                            reply.profile_images ?? '',
                            '_thumbnail'
                          ) || '/assets/images/dummy/dummy_avatar.png'
                        }
                        alt={reply.bcuid}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            '/assets/images/dummy/dummy_avatar.png';
                        }}
                      />
                    </Link>
                  </div>
                  <div className="nickname">
                    {reply.nickname}@{reply.bcuid}　
                    <GetGenderIcon genderId={reply.gender ?? ''} />　
                    {reply.location || '不明'}
                  </div>
                </div>
                <div className="body">
                  <p>{reply.post}</p>
                </div>
                <div className="footer"></div>
              </div>
              {/* <pre>{JSON.stringify(reply, null, 2)}</pre> */}
            </>
          ))}
        </div>
      )}

      {isFetchingNextPage && (
        <div className="text-center my-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostReplyList;

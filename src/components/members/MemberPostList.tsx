/** 6eb3e0a6 */
import React, { useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../posts/PostCard';
import { PostData } from '../../types/post';

interface MemberPostListProps {
  bcuid: string | undefined;
}

interface PostsPage {
  current_page: number;
  last_page: number;
  total: number;
  data: PostData[];
}

interface PostListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    posts: PostsPage;
    posts_count: number;
  };
  errors: any;
}

const fetchPosts = async (
  page: number,
  bcuid: string,
  token: string
): Promise<PostListResponse> => {
  const response = await axios.post(
    `${process.env.REACT_APP_API_ENDPOINT}/v1/get/member_posts/${bcuid}?page=${page}`,
    { bcuid: bcuid },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const MemberPostList: React.FC<MemberPostListProps> = ({ bcuid }) => {
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
  } = useInfiniteQuery<PostListResponse, Error>({
    queryKey: ['memberposts', bcuid],
    queryFn: ({ pageParam = 1 }) =>
      fetchPosts(pageParam as number, bcuid!, token!),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data?.posts) return undefined;
      const { current_page, last_page } = lastPage.data.posts;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    enabled: !!bcuid && !!token,
    retry: 1,
    initialPageParam: 1,
  });

  // 無限スクロール用のref callback
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

  // 全ての投稿を取得
  const posts =
    data?.pages.flatMap((page) =>
      page?.data?.posts?.data ? page.data.posts.data : []
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

  if (isError) {
    return <div className="alert alert-danger">Error: {error.message}</div>;
  }

  return (
    <div className="member-post-list">
      {posts.length === 0 ? (
        <div className="alert alert-secondary">投稿はありません</div>
      ) : (
        <div className="posts-container">
          {posts.map((post, index) => (
            <PostCard
              key={post.post_id}
              post={post}
              isLastItem={index === posts.length - 1}
              lastItemRef={lastItemRef}
            />
          ))}

          {isFetchingNextPage && (
            <div className="text-center my-3">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberPostList;

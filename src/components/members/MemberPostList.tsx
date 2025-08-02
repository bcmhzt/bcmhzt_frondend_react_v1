/** 6eb3e0a6 */
import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import MemberPostCard from '../posts/MemberPostCard';
import { PostData } from '../../types/post';
import { buildStorageUrl } from '../../utility/GetUseImage';
import { convertFormattedText } from '../../utility/GetCommonFunctions';
import GetGenderIcon from '../../components/commons/GetGenderIcon';

interface MemberPostListProps {
  bcuid: string | undefined;
}

interface MemberResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    member: MemberData; // この階層構造が重要
  };
  errors: any;
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

/** API で取得するメンバー情報 */
interface MemberData {
  id: number | string;
  bcuid: string;
  uid: string;
  nickname: string | null;
  description: string | null;
  profile_images: string | null;
  gender: string | null;
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
  favorite_food: string | null;
  character: string | null;
  religion: string | null;
  conditions_ideal_partner: string | null;
  age_range: string | null;
  target_area: string | null;
  marriage_aspiration: string | null;
  self_introductory_statement: string | null;
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

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/member/Members.tsx:xx] debug:', debug);
}

const MemberPostList: React.FC<MemberPostListProps> = ({ bcuid }) => {
  const { token } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT as string;
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /** bcuidからユーザー情報を取得 */
  /** メンバー情報取得 */
  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      try {
        const response = await axios.post<MemberResponse>(
          `${apiEndpoint}/v1/get/member/${bcuid}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // デバッグログ
        if (debug === 'true') {
          console.log(
            '[src/components/members/MemberPostList.tsx:116] Full response:',
            response
          );
          console.log(
            '[src/components/members/MemberPostList.tsx:120] Member data:',
            response.data.data.member
          );
        }

        // response.data.data.member を使用
        setMember(response.data.data.member);
      } catch (error) {
        console.error('[ERROR] Failed to fetch member:', error);
      } finally {
        setLoading(false);
        console.log('Loading state:', loading);
      }
    };

    fetchMember();
  }, [apiEndpoint, token, bcuid, loading]);

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
    <>
      {/* <pre>{JSON.stringify(loading, null, 2)}</pre> */}
      <div className="member-post-list">
        <div className="member-profile d-flex">
          {member && (
            <>
              <div className="profile-images">
                <Link to={`/member/${member.bcuid}`}>
                  <img
                    className="avatar-160"
                    src={
                      buildStorageUrl(
                        process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL || '',
                        member.profile_images ?? '',
                        '_small'
                      ) || '/assets/images/dummy/dummy_avatar.png'
                    }
                    alt={member.bcuid}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/assets/images/dummy/dummy_avatar.png';
                    }}
                  />
                </Link>
              </div>
              <div className="profile-name">
                <h2 className="nickname">
                  {member.nickname}
                  <span className="bcuid">@{member.bcuid}</span>
                </h2>
                <div className="location">
                  <GetGenderIcon genderId={member?.gender ?? ''} />　
                  {member?.location}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="profile-description">
          <span
            dangerouslySetInnerHTML={{
              __html: convertFormattedText(member?.description ?? ''),
            }}
          />
        </div>

        {posts.length === 0 ? (
          <div className="alert alert-secondary">投稿はありません</div>
        ) : (
          <div className="posts-container posts">
            {posts.map((post, index) => (
              <MemberPostCard
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
    </>
  );
};

export default MemberPostList;

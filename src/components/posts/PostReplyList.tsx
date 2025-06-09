import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
// import PostCard from './PostCard';
import { PostData } from '../../types/post';
import { buildStorageUrl } from '../../utility/GetUseImage';
import GetGenderIcon from '../commons/GetGenderIcon';
import { Send } from 'react-bootstrap-icons';
import { useMessage } from '../../contexts/MessageContext';
// src/utility/GetCommonFunctions.tsx
import { convertFormattedText } from '../../utility/GetCommonFunctions';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/posts/PostReplyList.tsx:xx] debug:', debug);
}

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
  const { token, currentUser, currentUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');
  const [replyTextCount, setReplyTextCount] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { showMessage } = useMessage();

  const {
    data,
    isLoading,
    // isError,
    // error,
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

  const replyMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/v1/create/reply`,
        {
          post_id: id,
          uid: currentUser?.uid,
          post: replyText.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onMutate: async () => {
      // 楽観的更新のために既存のキャッシュデータを取得
      const previousReplies = queryClient.getQueryData(['replies', id]);

      // 楽観的に新しい返信を追加
      queryClient.setQueryData(['replies', id], (old: any) => {
        if (!old?.pages?.[0]) return old;

        const optimisticReply = {
          post_id: 'temp-' + new Date().getTime(),
          reply_id: 'temp-' + new Date().getTime(),
          post: replyText,
          created_at: new Date().toISOString(),
          profile_images: currentUserProfile?.profile_images,
          nickname: currentUserProfile?.nickname,
          bcuid: currentUserProfile?.bcuid,
          gender: currentUserProfile?.gender,
          location: currentUserProfile?.location,
          isOptimistic: true,
        };

        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          data: {
            ...newPages[0].data,
            replies: {
              ...newPages[0].data.replies,
              data: [optimisticReply, ...newPages[0].data.replies.data],
            },
          },
        };

        return { ...old, pages: newPages };
      });

      return { previousReplies };
    },
    onError: (err, variables, context) => {
      // エラー時は以前のデータに戻す
      if (context?.previousReplies) {
        queryClient.setQueryData(['replies', id], context.previousReplies);
      }
      alert('返信の投稿に失敗しました');
    },
    onSuccess: () => {
      setReplyText(''); // フォームをクリア
      setReplyTextCount(0);
      showMessage('Replyが投稿されました。', 'success', 3000); // 必要なら
    },
    onSettled: () => {
      // 成功・失敗にかかわらずデータを再取得
      queryClient.invalidateQueries({ queryKey: ['replies', id] });
    },
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

  // const handleReplySubmit = async () => {
  //   // ここに返信投稿のロジックを追加
  //   const replyText = (
  //     document.querySelector('.reply-form-textarea') as HTMLTextAreaElement
  //   )?.value;

  //   if (!replyText || replyText.trim() === '') {
  //     alert('返信内容を入力してください。');
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_API_ENDPOINT}/v1/create/reply`,
  //       {
  //         post_id: id,
  //         uid: token, // Assuming `token` is the user's UID
  //         post: replyText.trim(),
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       alert('返信が投稿されました。');
  //       // Optionally clear the textarea after successful submission
  //       (
  //         document.querySelector('.reply-form-textarea') as HTMLTextAreaElement
  //       ).value = '';
  //     } else {
  //       alert(`返信の投稿に失敗しました: ${response.data.message}`);
  //     }
  //   } catch (error) {
  //     console.error('返信の投稿中にエラーが発生しました:', error);
  //     alert('返信の投稿中にエラーが発生しました。');
  //   }
  //   if (debug === 'true') {
  //     console.log(
  //       '[src/components/posts/PostReplyList.tsx:xx] handleReplySubmit:'
  //     );
  //   }
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      replyMutation.mutate();
    }
  };

  const handleReplyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReplyText(text);
    setReplyTextCount(text.length);
  };

  // if (replies.length === 0) {
  //   return (
  //     <div className="alert alert-secondary mt30">
  //       この投稿にはまだ返信がありません。
  //     </div>
  //   );
  // }

  // if (isError) {
  //   return (
  //     <div className="alert alert-danger mt30">
  //       エラーが発生しました: {error.message}
  //     </div>
  //   );
  // }

  return (
    <div className="post-replies mt30">
      <hr />
      {replyTextCount > 0 && (
        <>
          <span className="ml10">{replyTextCount}</span>
        </>
      )}

      <div className="reply-form mb20">
        <textarea
          className="form-control reply-form-textarea"
          placeholder="返信を入力してください..."
          rows={3}
          value={replyText}
          onChange={handleReplyTextChange}
          disabled={replyMutation.isPending}
        />
        <div className="d-flex justify-content-end mt10">
          <button
            className="btn btn-primary bcmhzt-btn"
            onClick={handleSubmit}
            disabled={!replyText.trim() || replyMutation.isPending}
          >
            {replyMutation.isPending ? (
              <div className="spinner-border spinner-border-sm" />
            ) : (
              <Send />
            )}
          </button>
        </div>
      </div>

      {replies.length === 0 ? (
        <div className="text-muted">まだ返信はありません</div>
      ) : (
        <div className="replies-list">
          <div className="replies-list-header mb20">
            {/* <div className="replies-list-title">Reply list</div> */}
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
                  <div
                    dangerouslySetInnerHTML={{
                      __html: convertFormattedText(reply.post),
                    }}
                  />
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

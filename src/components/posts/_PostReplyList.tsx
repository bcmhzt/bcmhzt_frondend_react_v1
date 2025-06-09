import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useMessage } from '../../contexts/MessageContext';
// ...existing imports...

interface PostReplyListProps {
  id: string; // Adjust the type of 'id' as needed
}

const PostReplyList: React.FC<PostReplyListProps> = ({ id }) => {
  const { token, currentUser, currentUserProfile } = useAuth();
  const { showMessage } = useMessage();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');
  const [replyTextCount, setReplyTextCount] = useState(0);

  // ...existing useInfiniteQuery and other code...

  // 返信投稿のミューテーション
  const replyMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/v1/create/reply`,
        {
          post_id: id,
          uid: currentUser?.uid,
          post: replyText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      // 楽観的UI更新
      queryClient.setQueryData(['replies', id], (oldData: any) => {
        if (!oldData?.pages?.[0]) return oldData;

        const newReply = {
          ...data.data,
          profile_images: currentUserProfile?.profile_images,
          nickname: currentUserProfile?.nickname,
          bcuid: currentUserProfile?.bcuid,
          gender: currentUserProfile?.gender,
          location: currentUserProfile?.location,
          isNew: true,
        };

        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          data: {
            ...newPages[0].data,
            replies: {
              ...newPages[0].data.replies,
              data: [newReply, ...newPages[0].data.replies.data],
            },
          },
        };

        return { ...oldData, pages: newPages };
      });

      setReplyText('');
      setReplyTextCount(0);
      showMessage('返信を投稿しました', 'success', 2000);
    },
    onError: () => {
      showMessage('返信の投稿に失敗しました', 'error', 2000);
    },
  });

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

  return (
    <div className="post-replies mt30">
      <hr />

      {/* 返信フォーム */}
      <div className="post-reply-form mt20 mb20">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="replyTextarea" className="form-label">
              返信を書く
            </label>
            {replyTextCount > 0 && (
              <div
                className={`post-text-count mb10 ${
                  replyTextCount > 1900
                    ? replyTextCount >= 2000
                      ? 'post-text-count-alert'
                      : 'post-text-count-warning'
                    : 'post-text-count-safe'
                }`}
              >
                {replyTextCount > 1900 ? (
                  replyTextCount >= 2000 ? (
                    <>
                      入力文字数: 2000を超えています{' '}
                      <span className="count">
                        {replyTextCount - 2000} over
                      </span>
                    </>
                  ) : (
                    <>*2000文字までです 入力文字数: {replyTextCount}</>
                  )
                ) : (
                  <>入力文字数: {replyTextCount}</>
                )}
              </div>
            )}
            <textarea
              className="form-control"
              id="replyTextarea"
              value={replyText}
              onChange={handleReplyTextChange}
              rows={3}
              disabled={replyMutation.isPending}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-bc-main"
            disabled={!replyText.trim() || replyMutation.isPending}
          >
            {replyMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                送信中...
              </>
            ) : (
              '返信する'
            )}
          </button>
        </form>
      </div>

      {/* 既存の返信一覧部分 */}
      {/* ...existing replies list code... */}
    </div>
  );
};
export default PostReplyList;

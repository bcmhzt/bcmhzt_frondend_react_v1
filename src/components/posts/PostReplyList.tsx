/**
 * 6dbde5d5 (post reply)
 */
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
// import PostCard from './PostCard';
import { PostData } from '../../types/post';
import {
  buildStorageUrl,
  buildStoragePostImageUrl,
} from '../../utility/GetUseImage';
import GetGenderIcon from '../commons/GetGenderIcon';
import { Send, Image, XCircleFill } from 'react-bootstrap-icons';
import { useMessage } from '../../contexts/MessageContext';
// src/utility/GetCommonFunctions.tsx
import { convertFormattedText } from '../../utility/GetCommonFunctions';
import { usePostReplyImageUploader } from '../../utility/usePostImageUploader';

//src/components/dashboards/BcmhztLinkCollections.tsx

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 画像アップロード用フック（posts と同じやり方）
  const {
    files: images,
    addFiles,
    removeFile,
    uploadAll,
    uploadProgress,
    clear,
  } = usePostReplyImageUploader({
    baseDir: 'reply_uploads',
    uid: currentUser?.uid || '',
    limit: 10,
  });

  // プレビューURL（objectURL）を管理
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [images]);

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

  interface ReplyPayload {
    text: string | null;
    urls: string[];
  }

  const replyMutation = useMutation({
    mutationFn: async ({ text, urls }: ReplyPayload) => {
      console.log('[src/components/posts/PostReplyList.tsx:129] urls:', urls);
      const response = await axios.post(
        `${process.env.REACT_APP_API_ENDPOINT}/v1/create/reply`,
        {
          post_id: id,
          uid: currentUser?.uid,
          post: text,
          reply_images: urls,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onMutate: async (variables?: ReplyPayload) => {
      // 楽観的更新のために既存のキャッシュデータを取得
      const previousReplies = queryClient.getQueryData(['replies', id]);

      // 楽観的に新しい返信を追加
      queryClient.setQueryData(['replies', id], (old: any) => {
        if (!old?.pages?.[0]) return old;

        const optimisticReply = {
          post_id: 'temp-' + new Date().getTime(),
          reply_id: 'temp-' + new Date().getTime(),
          post: variables?.text ?? (replyText.trim().length ? replyText : null),
          created_at: new Date().toISOString(),
          profile_images: currentUserProfile?.profile_images,
          nickname: currentUserProfile?.nickname,
          bcuid: currentUserProfile?.bcuid,
          gender: currentUserProfile?.gender,
          location: currentUserProfile?.location,
          isOptimistic: true,
          reply_images: variables?.urls ?? [], // ← 画像も即時表示
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
      setPreviewUrls([]);
      clear();
      if (fileInputRef.current) {
        // 同じ画像の再選択でも onChange が発火するように
        fileInputRef.current.value = '';
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && images.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedUrls = await uploadAll(); // Storage → URL[]

      // アップロード全滅で本文も空なら何も作らない
      const normalized = replyText.trim();
      if (uploadedUrls.length === 0 && normalized.length === 0) {
        setIsUploading(false);
        return;
      }
      // replyMutation.mutate({ text: replyText.trim(), urls: uploadedUrls });
      replyMutation.mutate({
        text: normalized.length ? normalized : null, // ← 空なら null
        urls: uploadedUrls,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(
      '[src/components/posts/PostReplyList.tsx:250] handleImageChange'
    );
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const handleReplyTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReplyText(text);
    setReplyTextCount(text.length);
  };

  // 画像配列を安全に取り出す（reply_images / post_images / JSON文字列 / 単一URL 全対応）
  const getReplyImages = (r: any): string[] => {
    const cand = r?.reply_images ?? r?.post_images ?? [];
    if (Array.isArray(cand))
      return cand.filter((x) => typeof x === 'string' && x);
    if (typeof cand === 'string') {
      try {
        const arr = JSON.parse(cand);
        return Array.isArray(arr)
          ? arr.filter((x) => typeof x === 'string' && x)
          : cand.startsWith('http')
            ? [cand]
            : [];
      } catch {
        return cand.startsWith('http') ? [cand] : [];
      }
    }
    return [];
  };

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
          disabled={replyMutation.isPending || isUploading}
        />
        <div className="uploads mt10">
          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            hidden
            multiple
            onChange={handleImageChange}
            ref={fileInputRef}
          />
          <label htmlFor="imageUpload" style={{ cursor: 'pointer' }}>
            <Image size={30} />
          </label>

          {/* サムネイル */}
          {previewUrls.length > 0 && (
            <div className="image-thumbnails mt10 d-flex flex-wrap">
              {previewUrls.map((src, idx) => (
                <div
                  key={idx}
                  className="thumbnail-container me-2"
                  style={{ position: 'relative' }}
                >
                  <img
                    src={src}
                    alt={`thumb-${idx}`}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: 5 }}
                  />
                  <XCircleFill
                    className="position-absolute"
                    style={{ top: -5, right: -5, cursor: 'pointer' }}
                    onClick={() => removeFile(idx)}
                  />
                  {uploadProgress[idx] != null && uploadProgress[idx] < 100 && (
                    <p className="small mb-0">{uploadProgress[idx]}%</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end mt10">
          {/* 送信ボタン */}
          <button
            className="btn btn-primary bcmhzt-btn"
            onClick={handleSubmit}
            disabled={
              (!replyText.trim() && images.length === 0) ||
              replyMutation.isPending ||
              isUploading
            }
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
        <div className="text-muted mb50">
          <div className="alert alert-secondary mb50">まだ返信はありません</div>
        </div>
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
                  <p
                    dangerouslySetInnerHTML={{
                      __html: convertFormattedText(reply.post ?? ''), // ← null/undefined を空文字に
                    }}
                  />
                  {(() => {
                    const imgs = getReplyImages(reply);
                    return imgs.length ? (
                      <div className="mt10 d-flex flex-wrap reply-images">
                        {imgs.map((img, idx) => (
                          <>
                            {/* <pre>{JSON.stringify(img, null, 2)}</pre> */}
                            <img
                              key={idx}
                              src={toReplyImageSrc(img)}
                              alt={`reply-image-${idx}`}
                              className="reply-image"
                              loading="lazy"
                              onError={(e) => {
                                // 取得に失敗したら非表示にする（別URLへ差し替えない＝再試行ループ防止）
                                const el = e.currentTarget as HTMLImageElement;
                                el.onerror = null;
                                el.style.display = 'none';
                              }}
                            />
                          </>
                        ))}
                      </div>
                    ) : null;
                  })()}
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

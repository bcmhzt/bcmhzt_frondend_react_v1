import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useInfiniteQuery } from '@tanstack/react-query';
// import { generateAvatarUrl } from '../../utility/generateImageUrl';
import {
  buildStoragePostImageUrl,
  buildStorageUrl,
} from '../../utility/GetUseImage';

// 型定義
interface ImagePost {
  post_id: number;
  uid: string;
  bcuid: string;
  nickname: string | null;
  description: string | null;
  profile_images: string | null;
  created_at: string;
  updated_at: string;
  image: string;
}

interface PaginationResponse {
  current_page: number;
  data: ImagePost[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// コンポーネント
const PostsMediaList: React.FC = () => {
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [modalImageLoading, setModalImageLoading] = useState<boolean>(true);
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { token } = useAuth();
  const debug = process.env.REACT_APP_DEBUG;
  const storageUrl = process.env.REACT_APP_FIREBASE_STORAGE_BASE_URL!;

  // useInfiniteQueryの実装を修正
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['memberImages', token],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (debug === 'true') {
        console.log('[PostsMediaList] Fetching page:', pageParam);
      }

      const response = await axios.post<PaginationResponse>(
        `${apiEndpoint}/v1/get/member_images?page=${pageParam}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (debug === 'true') {
        console.log('[PostsMediaList] Response:', response.data);
      }

      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage;

      if (debug === 'true') {
        console.log('[PostsMediaList] Pagination:', {
          current_page,
          last_page,
          hasMore: current_page < last_page,
        });
      }

      return current_page < last_page ? current_page + 1 : undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // データ処理を修正
  const images = React.useMemo(() => {
    const result = data?.pages.flatMap((page) => page.data) ?? [];

    if (debug === 'true') {
      console.log('[PostsMediaList] Processed images:', result);
    }

    return result;
  }, [data, debug]);

  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const lastItemRef = React.useCallback(
    (node: HTMLImageElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const handleImageClick = (index: number): void => {
    setActiveIndex(index);
    setModalImageLoading(true);
    setModalShow(true);
  };

  const handleNext = (): void => {
    if (activeIndex < images.length - 1) {
      setActiveIndex(activeIndex + 1);
      setModalImageLoading(true);
    }
  };

  const handlePrev = (): void => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setModalImageLoading(true);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <div className="member-images">
        <div className="member-image d-flex flex-wrap">
          {images.map((item, index) => (
            <img
              key={item.post_id}
              ref={index === images.length - 1 ? lastItemRef : null}
              id={`image-${item.post_id}`}
              className="image-item"
              src={buildStoragePostImageUrl(item.image, '_thumbnail')}
              alt={item.nickname || 'user'}
              style={{ cursor: 'pointer' }}
              onClick={() => handleImageClick(index)}
            />
          ))}
        </div>
        {isFetchingNextPage && (
          <div className="text-center my-3">Loading more...</div>
        )}
      </div>

      {modalShow && images[activeIndex] && (
        <>
          <div
            className="modal-backdrop fade show bcmhzt1"
            onClick={() => setModalShow(false)}
          />
          <div
            className="modal show image-modal"
            tabIndex={-1}
            style={{ display: 'block' }}
          >
            <div className="modal-dialog modal-dialog-centered image-modal-dialog modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <div className="member-profile">
                    <a href={`/member/${images[activeIndex].bcuid}`}>
                      <img
                        className="avatar-64"
                        alt={`member_`}
                        src={
                          buildStorageUrl(
                            storageUrl ?? '',
                            images[activeIndex].profile_images ?? '',
                            '_thumbnail'
                          ) ||
                          `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`
                        }
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `${process.env.PUBLIC_URL}/assets/images/dummy/dummy_avatar.png`;
                        }}
                      />
                    </a>
                    {images[activeIndex].nickname}
                    <span className="bcuid">@{images[activeIndex].bcuid}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setModalShow(false)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body text-center position-relative">
                  {modalImageLoading && (
                    <img
                      src="/assets/images/loading-posts.gif"
                      alt="loading"
                      className="img-fluid-loading"
                    />
                  )}
                  <img
                    key={activeIndex}
                    src={buildStoragePostImageUrl(
                      images[activeIndex].image,
                      '_medium'
                    )}
                    alt={images[activeIndex].nickname || 'user'}
                    className="img-fluid"
                    style={modalImageLoading ? { display: 'none' } : {}}
                    onLoad={() => setModalImageLoading(false)}
                  />
                </div>
                <div className="modal-footer justify-content-between">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handlePrev}
                    disabled={activeIndex === 0}
                  >
                    ＜
                  </button>
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleNext}
                    disabled={activeIndex === images.length - 1}
                  >
                    ＞
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PostsMediaList;

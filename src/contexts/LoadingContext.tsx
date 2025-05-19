import React from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { LoadingOverlay } from '../components/LoadingOverlay';

/**
 * LoadingProvider
 * React Query のフェッチ/ミューテーション数を監視し、いずれかが実行中であれば
 * LoadingOverlay を表示します。
 */
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 実行中のクエリ数
  const fetchCount = useIsFetching();
  // 実行中のミューテーション数（POST/PUT/DELETE など）
  const mutateCount = useIsMutating();

  const loading = fetchCount + mutateCount > 0;

  return (
    <>
      {children}
      {loading && <LoadingOverlay />}
    </>
  );
};


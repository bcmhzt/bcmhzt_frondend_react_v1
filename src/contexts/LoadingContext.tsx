import React, { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { LoadingOverlay } from '../components/LoadingOverlay';

/**
 * LoadingProvider
 * React Query のフェッチ/ミューテーション数を監視し、いずれかが実行中であれば
 * LoadingOverlay を表示します。
 */
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // AuthProvider の loading も監視
  const { loading: authLoading } = useAuth();

  const fetchCount = useIsFetching();
  const mutateCount = useIsMutating();

  // 最低表示時間（ms）
  const MIN_DISPLAY = 300;
  const [visible, setVisible] = useState(false);

  const loading = fetchCount + mutateCount > 0 || authLoading;

  // ローディングが始まったら即表示、終わってもMIN_DISPLAY後に非表示
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setVisible(true);
    } else {
      timer = setTimeout(() => setVisible(false), MIN_DISPLAY);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <>
      {children}
      {visible && (
        <LoadingOverlay
          // アクセシビリティ向上
          aria-live="assertive"
          aria-modal="true"
        />
      )}
    </>
  );
};

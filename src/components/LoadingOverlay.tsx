// src/components/LoadingOverlay.tsx
import React from 'react';

/**
 * 全画面ローディングオーバーレイ（Bootstrap版・大きめ黒スピナー）
 */
export const LoadingOverlay: React.FC = () => (
  <div
    className="
      position-fixed top-0 start-0
      w-100 h-100
      bg-dark bg-opacity-50
      d-flex align-items-center justify-content-center
    "
    style={{ zIndex: 2000 }}
    role="status"
    aria-busy="true"
    aria-label="Loading"
  >
    <div
      className="spinner-grow text-dark"
      role="status"
      aria-hidden="true"
      style={{ width: '4rem', height: '4rem' }}  // ← サイズを大きく
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

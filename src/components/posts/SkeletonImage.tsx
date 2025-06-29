import React from 'react';

const SkeletonImage: React.FC<{
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}> = ({ width = 120, height = 120, style = {} }) => (
  <div
    className="skeleton-image shimmer"
    style={{ width, height, borderRadius: 8, ...style }}
  />
);

export default SkeletonImage;

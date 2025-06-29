import React, { useState, useEffect } from 'react';

type Props = {
  src: string;
  alt?: string;
  retryInterval?: number; // ms
  maxRetry?: number;
  style?: React.CSSProperties;
};

const RetryImage: React.FC<Props> = ({
  src,
  alt = '',
  retryInterval = 1500,
  maxRetry = 10,
  style,
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setImgSrc(src);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount < maxRetry) {
      setTimeout(() => {
        setRetryCount((c) => c + 1);
        setImgSrc(src + `?retry=${Date.now()}`); // キャッシュバスター
      }, retryInterval);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default RetryImage;

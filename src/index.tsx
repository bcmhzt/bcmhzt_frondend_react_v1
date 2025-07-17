// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './styles/main.scss';

// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Loading & Auth
import { LoadingProvider } from './contexts/LoadingContext';
import { AuthProvider } from './contexts/AuthContext';

/* <body style="overflow: hidden;">のデバック */
// src/index.tsx のデバッグコード部分を以下に置き換え
console.log('[src/index.tsx] Body overflow debug start');
if (process.env.REACT_APP_ENV === 'local') {
  console.log('[src/index.tsx] Starting comprehensive body monitoring');

  // より詳細なスタックトレースを取得
  const getDetailedStack = () => {
    const stack = new Error().stack;
    const lines = stack?.split('\n') || [];
    return lines.slice(1, 10).map((line) => line.trim());
  };

  // MutationObserver で style 属性の変更を直接監視
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target === document.body) {
        if (mutation.attributeName === 'style') {
          const bodyStyle = (mutation.target as HTMLElement).getAttribute(
            'style'
          );
          console.log(
            '[src/index.tsx] [MutationObserver] Body style attribute changed:',
            bodyStyle
          );
          if (bodyStyle && bodyStyle.includes('overflow')) {
            console.log(
              '[src/index.tsx] [MutationObserver] 🎯 OVERFLOW DETECTED:',
              bodyStyle
            );
            console.log('[src/index.tsx] [MutationObserver] Detailed Stack:');
            getDetailedStack().forEach((line, index) => {
              console.log(`[${index}] ${line}`);
            });

            // React Developer Tools での情報
            console.log('[src/index.tsx] [MutationObserver] React Fiber info:');
            console.log(
              (mutation.target as any)._reactInternalFiber ||
                (mutation.target as any)._reactInternalInstance ||
                'No React info'
            );

            debugger;
          }
        }
      }
    });
  });

  // DOM読み込み後に監視開始
  const startObserver = () => {
    console.log('[src/index.tsx] [MutationObserver] Starting observation');
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  };

  if (document.body) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver);
  }
}
console.log('[src/index.tsx] Body overflow debug end');
/* <body style="overflow: hidden;">のデバック */

const queryClient = new QueryClient();

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

reportWebVitals();

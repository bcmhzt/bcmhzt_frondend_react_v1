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

// デバッグコード（開発環境でのみ実行）
// src/index.tsx のデバッグコード部分を以下に置き換え
console.log('[src/index.tsx] Body overflow debug start');
if (process.env.REACT_APP_ENV === 'local') {
  console.log('[src/index.tsx] Starting comprehensive body monitoring');

  // 即座に現在の状態をチェック
  const checkCurrentState = () => {
    const computedStyle = getComputedStyle(document.body);
    const inlineStyle = document.body.getAttribute('style');
    const bodyClasses = document.body.className;

    console.log('[src/index.tsx] Current body state:', {
      computedOverflow: computedStyle.overflow,
      inlineStyle: inlineStyle,
      bodyClasses: bodyClasses,
      scrollHeight: document.body.scrollHeight,
      clientHeight: document.body.clientHeight,
    });

    if (computedStyle.overflow === 'hidden') {
      console.log('[src/index.tsx] 🎯 OVERFLOW IS ALREADY HIDDEN!');
      debugger;
    }
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
            console.log(
              '[src/index.tsx] [MutationObserver] Stack:',
              new Error().stack
            );
            debugger;
          }
        }

        if (mutation.attributeName === 'class') {
          const bodyClasses = (mutation.target as HTMLElement).className;
          console.log(
            '[src/index.tsx] [MutationObserver] Body classes changed:',
            bodyClasses
          );
          if (
            bodyClasses.includes('overflow') ||
            bodyClasses.includes('scroll') ||
            bodyClasses.includes('hidden') ||
            bodyClasses.includes('modal') ||
            bodyClasses.includes('no-scroll')
          ) {
            console.log(
              '[src/index.tsx] [MutationObserver] 🎯 SUSPICIOUS CLASS DETECTED:',
              bodyClasses
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
    checkCurrentState(); // 監視開始時に現在の状態をチェック
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

  // 定期的なチェック（より頻繁に）
  const checkInterval = setInterval(() => {
    const computedStyle = getComputedStyle(document.body);
    const inlineStyle = document.body.getAttribute('style');
    const bodyClasses = document.body.className;

    if (computedStyle.overflow === 'hidden') {
      console.log(
        '[src/index.tsx] [Periodic Check] 🎯 Body overflow is hidden!'
      );
      console.log(
        '[src/index.tsx] [Periodic Check] Computed style:',
        computedStyle.overflow
      );
      console.log(
        '[src/index.tsx] [Periodic Check] Inline style:',
        inlineStyle
      );
      console.log(
        '[src/index.tsx] [Periodic Check] Body classes:',
        bodyClasses
      );

      clearInterval(checkInterval);
      debugger;
    }
  }, 100); // 100msごとにチェック

  // 5秒後に強制停止（デバッグ用）
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('[src/index.tsx] Periodic check stopped after 5 seconds');
  }, 5000);
}
console.log('[src/index.tsx] Body overflow debug end');

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

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/contexts/BadgeContext.tsx:xx] debug:', debug);
}

export type BadgeCategory = 'members' | 'posts' | 'notice' | 'messages';

interface BadgeInfo {
  id: number;
  created_at: string;
  uid: string;
  total: number;
}

interface BadgeData {
  members: BadgeInfo | null;
  posts: BadgeInfo | null;
  notice: BadgeInfo | null;
  messages: BadgeInfo | null;
}

interface BadgeCounts {
  members: number;
  posts: number;
  notice: number;
  messages: number;
}

interface BadgeContextType {
  latestBadgeData: BadgeData;
  badgeCounts: BadgeCounts;
  clearBadge: (category: BadgeCategory) => void;
  refreshBadgeCounts: (latestData: BadgeData) => Promise<void>;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);
const STORAGE_KEY = 'bcmzt-350435ff627f1cb9fc8abb09ee918f3f';

export const BadgeProvider = ({ children }: { children: React.ReactNode }) => {
  const [latestBadgeData, setLatestBadgeData] = useState<BadgeData>({
    members: null,
    posts: null,
    notice: null,
    messages: null,
  });

  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    members: 0,
    posts: 0,
    notice: 0,
    messages: 0,
  });

  const { token } = useAuth();

  // #1 アプリ起動時に一度だけ実行
  useEffect(() => {
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

    const initBadges = async () => {
      try {
        const res = await axios.post(
          `${apiEndpoint}/get/badge_data`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (debug === 'true') {
          console.log('[src/contexts/BadgeContext.tsx:77] debug:', [res]);
        }
        const newData = res.data.data;
        setLatestBadgeData(newData);
        refreshBadgeCounts(newData);
      } catch (err) {
        console.error('バッジ情報取得失敗:', err);
      }
    };

    if (token) initBadges();
  }, [token]); // ← token が変わった時も再取得

  // #2 LocalStorageと比較してバッジ数を算出
  const refreshBadgeCounts = async (latestData: BadgeData) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    const counts: Partial<BadgeCounts> = {};

    (['members', 'posts', 'notice', 'messages'] as BadgeCategory[]).forEach(
      (cat) => {
        const latest = latestData[cat];
        const lastSeen = stored[cat];

        if (latest && lastSeen) {
          const diff = latest.total - (lastSeen.total ?? 0);
          counts[cat] = Math.max(diff, 0);
        } else if (latest) {
          counts[cat] = latest.total;
        } else {
          counts[cat] = 0;
        }
      }
    );

    if (debug === 'true') {
      console.log('[refreshBadgeCounts] counts:', counts);
    }

    setBadgeCounts(counts as BadgeCounts);
  };

  // #3 バッジのクリア処理
  const clearBadge = (category: BadgeCategory) => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    stored[category] = latestBadgeData[category];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    setBadgeCounts((prev) => ({
      ...prev,
      [category]: 0,
    }));
  };

  return (
    <BadgeContext.Provider
      value={{ latestBadgeData, badgeCounts, clearBadge, refreshBadgeCounts }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadge = () => {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error('useBadge must be used within a BadgeProvider');
  return ctx;
};

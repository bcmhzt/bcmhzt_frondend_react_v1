import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getImageWithSuffix } from '../../utility/GetUseImage';
import MessageRoom from './MessageRoom';
import { syncChatRooms, fetchChatRooms } from '../../services/firestoreChat';
import { fetchMatchedList } from '../../services/chatApi';
import type { MatchedUser, OpenChatRoom } from '../../types/chat';

const MessageList: React.FC = () => {
  const { currentUser, token } = useAuth();
  const [matchedList, setMatchedList] = useState<MatchedUser[]>([]);
  const [openChatRooms, setOpenChatRooms] = useState<OpenChatRoom[]>([]);

  // マッチユーザー一覧の取得
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['matchedMembers', token],
    queryFn: ({ pageParam = 1 }) => fetchMatchedList(token!, pageParam),
    initialPageParam: 1,
    enabled: !!token,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.next_page_url) {
        const match = lastPage.data.next_page_url.match(/page=(\d+)/);
        return match ? Number(match[1]) : undefined;
      }
      return undefined;
    },
  });

  // マッチリストの更新とチャットルームの同期
  useEffect(() => {
    if (!data || !currentUser?.uid) return;

    const flatList = data.pages.flatMap((page) => page.data.data);
    setMatchedList(flatList);

    // ユーザー情報のマップを作成
    const matchedMap = new Map(
      flatList.map((user) => [user.matched_uid, user])
    );

    // チャットルームの同期
    const syncRooms = async () => {
      try {
        await syncChatRooms({
          currentUid: currentUser.uid,
          matchedList: flatList,
        });

        // チャットルーム一覧の取得
        const rooms = await fetchChatRooms(currentUser.uid, matchedMap);
        setOpenChatRooms(rooms);
      } catch (error) {
        console.error('[syncRooms] error:', error);
      }
    };

    syncRooms();
  }, [currentUser?.uid, data]);

  if (isLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleRoomClick = (roomId: string) => {
    // モーダルは自動で開くのでここでは必要に応じて追加の処理を実装
    console.log('Room clicked:', roomId);
  };

  return (
    <div className="message-list">
      <ul className="chat-rooms">
        {openChatRooms.map((room) => (
          <li key={room.id} className="chat-room-item mb-3">
            <MessageRoom room={room} onRoomClick={handleRoomClick} />
          </li>
        ))}
        {openChatRooms.length === 0 && (
          <div className="alert alert-secondary">
            まだメッセージはありません
          </div>
        )}
      </ul>

      {hasNextPage && (
        <div className="text-center mt-4">
          <button
            className="btn btn-outline-primary"
            onClick={() => fetchNextPage()}
          >
            さらに読み込む
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageList;

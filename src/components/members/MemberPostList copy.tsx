/** 6eb3e0a6 */
// src/components/members/MemberPostList.tsx
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

interface MemberPostListProps {
  bcuid: string | undefined;
}

const MemberPostList: React.FC<MemberPostListProps> = ({ bcuid }) => {
  return (
    <div className="member-post-list">
      {/* Render posts based on bcuid */}
      hoehoges
      <br />
      hgo
      {bcuid}
    </div>
  );
};

export default MemberPostList;

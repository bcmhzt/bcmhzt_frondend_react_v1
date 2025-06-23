import React, { useState } from 'react';
import {
  ThreeDotsVertical,
  FlagFill,
  Link,
  PersonFill,
  Ban,
  Trash,
} from 'react-bootstrap-icons';

interface PostToolsProps {
  postId: number;
}

const PostTools: React.FC<PostToolsProps> = ({ postId }) => {
  const [show, setShow] = useState(false);
  const modalId = `postToolsModal-${postId}`;

  return (
    <>
      <ThreeDotsVertical
        style={{ fontSize: '20px', cursor: 'pointer' }}
        onClick={() => setShow(true)}
      />

      {show && (
        <div
          className="modal fade show"
          id={modalId}
          style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          aria-labelledby={`${modalId}Label`}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShow(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <FlagFill />
                通報する
                <br />
                <Link />
                この投稿のURLを取得する
                <br />
                <PersonFill />
                投稿者をコピーする
                <br />
                <Ban />
                ブロックする
                <br />
                <Trash />
                この投稿を削除する
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShow(false)}
                  aria-label="Close"
                ></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostTools;

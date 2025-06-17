/** f8656bc2 */
import React from 'react';
import {
  ThreeDotsVertical,
  FlagFill,
  Link,
  PersonFill,
  Ban,
  Trash,
} from 'react-bootstrap-icons';

interface PostToolsProps {}

const PostTools: React.FC<PostToolsProps> = () => {
  return (
    <>
      <ThreeDotsVertical
        style={{ fontSize: '20px', cursor: 'pointer' }}
        data-bs-toggle="modal"
        data-bs-target="#postToolsModal"
      />

      <div
        className="modal fade"
        id="postToolsModal"
        aria-labelledby="postToolsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
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
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default PostTools;

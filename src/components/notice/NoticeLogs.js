import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { generateAvatarUrl } from '../../../utility/generateImageUrl.js';
// import { useNoticeCountBadge } from '../../../contexts/Badge/NoticeCountBadge';

const NoticeLogs = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
  const { token } = useAuth();
  const [noticeLogs, setNoticeLogs] = useState([]);
  // const { noticeCount, updateNoticeCount } = useNoticeCountBadge();

  useEffect(() => {
    const fetchNoticeLogs = async () => {
      try {
        const response = await axios.post(`${apiEndpoint}/v1/notice_logs?page=1`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("[src/components/v1/notice/NoticeLogs.js:13] debug response:", [response]);
        setNoticeLogs(response.data.data.data);

      } catch (error) {
        console.log("[src/components/v1/notice/NoticeLogs.js:13] error:", error);
      }
    };
    fetchNoticeLogs();
  },[apiEndpoint, token]);

  useEffect(() => {
    const fetchNoticeCount = async () => {
      const response = await axios.post(`${apiEndpoint}/v1/get/badge/notice_count`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.setItem('noticelogcount', response.data.data.count);
    }
    fetchNoticeCount();
  }, [apiEndpoint, token]);

  return (
    <>
    <div className="notice-logs">
    {/* <pre>{JSON.stringify(noticeLogs, null, 2)}</pre> */}
      <ul className="notice-logs-list">
        {noticeLogs && noticeLogs.length > 0 ? (
          noticeLogs.map((log, index) => (
          <li key={index}>
            <div className="notice-logs-item d-flex justify-content-start">
              <div className="avatar-area">
              {/* <pre>{JSON.stringify(generateAvatarUrl(log.member_image), null, 2)}</pre> */}
                <img
                  className="avatar"
                  src={
                    log?.member_image
                    ? generateAvatarUrl(log.member_image)
                    : `${process.env.PUBLIC_URL}/assets/dummy-user.png`
                  }
                  alt="user"
                />
              </div>
              <div className="notice-message" dangerouslySetInnerHTML={{ __html: log.log_message }} />
              <div className="date">{log.created_at}</div>
            </div>
          </li>
        ))
        ) : (
          <div className="no-data mb10">まだ情報がありません</div>
        )}

        {/* <li>
          <div className="notice-logs-item d-flex justify-content-start">
              <div className="avatar-area">
                <img className="avatar" src="/assets/dummy-user.png" alt="user" />
              </div>
              <div>Bcmhtztさんがあなたにナイススケベしました。</div>
              <div className="date">2025-03-23</div>
          </div>
        </li> */}
        
      </ul>    
    </div>
    </>
  );
};
export default NoticeLogs;
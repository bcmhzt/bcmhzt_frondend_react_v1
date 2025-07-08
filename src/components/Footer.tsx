import { Link } from 'react-router-dom';
import {
  Bell,
  People,
  Envelope,
  HouseDoor,
  CardText,
} from 'react-bootstrap-icons';
import { useBadge } from '../contexts/BadgeContext';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/Footer.tsx:xx] debug:', debug);
}

const Footer = () => {
  const { badgeCounts } = useBadge();
  if (debug === 'true') {
    console.log('[src/components/Footer.tsx:20] debug:', [badgeCounts]);
  }
  const renderBadge = (count: number) => {
    if (count <= 0) return null;
    return (
      <span className="badge bg-primary">
        {count > 99 ? '+99' : `${count}`}
      </span>
    );
  };
  return (
    <div className="footer">
      <div className="footer-pc">
        {/* ご利用規約
        プライバシーポリシー
        お問い合わせ */}
        <span className="footer-copyright">
          Copyright © 2023 Bcmhzt All Rights Reserved.
        </span>
      </div>

      <div className="main-link">
        <div className="item">
          <Link to="/dashboard">
            <HouseDoor className="footer-icon" />
          </Link>
          <span className="withname">Dashboard</span>
        </div>
        <div className="item">
          <Link to="/members">
            <People className="footer-icon" />
          </Link>
          {renderBadge(badgeCounts.members)}
          <span className="withname">Members</span>
        </div>
        <div className="item">
          <Link to="/posts">
            <CardText className="footer-icon" />
          </Link>
          {renderBadge(badgeCounts.posts)}
          <span className="withname">Post</span>
        </div>
        <div className="item">
          <Link to="/notice">
            <Bell className="footer-icon" />
          </Link>
          {renderBadge(badgeCounts.notice)}
          <span className="withname">notice</span>
        </div>
        <div className="item">
          <Link to="/existing_chat_messages">
            <Envelope className="footer-icon" />
          </Link>
          {/* <span className="badge bg-primary">+99</span> */}
          <span className="withname">Message</span>
        </div>
      </div>
    </div>
  );
};
export default Footer;

import { Link } from "react-router-dom";
import {
  Bell,
  People,
  Envelope,
  HouseDoor,
  CardText,
} from 'react-bootstrap-icons';

const Footer = () => {
  return (
    <div className="footer">

      <div className="footer-pc">
        {/* ご利用規約
        プライバシーポリシー
        お問い合わせ */}
        <span className="footer-copyright">Copyright © 2023 Bcmhzt All Rights Reserved.</span>
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
          <span className="withname">Members</span>
        </div>
        <div className="item">
          <Link to="/v1/posts">
            <CardText className="footer-icon" />
          </Link>
          <span className="withname">Post</span>
        </div>
        <div className="item">
          <Link to="/v1/notice">
            <Bell className="footer-icon" />
          </Link>
          <span className="badge bg-primary">+99</span>
          <span className="withname">notice</span>
        </div>
        <div className="item">
          <Link to="/v1/message">
            <Envelope className="footer-icon" />
          </Link>
          <span className="badge bg-primary">+99</span>
          <span className="withname">Message</span>
        </div>
      </div>



    </div>
  );
};
export default Footer;
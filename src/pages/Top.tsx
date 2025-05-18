import { Link } from "react-router-dom";
import Header from "../components/Header";

const Top = () => {
  return (
    <>
    <Header />
      
      <Link to="/about" className="btn btn-primary">About</Link>
      <ul>
        <li><Link to="/list">List</Link></li>
      </ul>
    </>
  );
};
export default Top;
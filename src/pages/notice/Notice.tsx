import Header from '../../components/Header';
import Footer from '../../components/Footer';
const Notice = () => {
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            <h2>Notice</h2>
            <p className="">Posts</p>
          </div>
          <div className="d-none d-md-block col-md-6 bc-right">
            <h2>foo</h2>
            <p>bar</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Notice;

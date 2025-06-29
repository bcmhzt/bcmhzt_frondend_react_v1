import React from 'react';
import ArchtectTemplate from '../../components/dashboards/ArchtectTemplate';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
const DevArchtectPage = () => {
  return (
    <div className="app-body">
      <Header />
      <div className="container bc-app">
        <div className="row">
          <div className="col-12 col-md-6 bc-left">
            <ArchtectTemplate />
          </div>
          <div className="d-none d-md-block col-md-6 bc-right">foobar</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default DevArchtectPage;

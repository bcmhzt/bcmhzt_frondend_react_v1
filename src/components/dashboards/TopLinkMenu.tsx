import React from 'react';

const TopLinkMenu = () => {
  return (
    <div className="top-link-menu mb30">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 mb10">
            <a href="/open_talks" className="btn btn-primary bcmhzt-btn">
              Open Talks
            </a>
          </div>
          <div className="col-12 col-md-6 mb10">
            <a href="/" className="btn btn-secondary disabled">
              Comming soon
            </a>
          </div>
          <div className="col-12 col-md-6 mb10">
            <a href="/" className="btn btn-secondary disabled">
              Comming soon
            </a>
          </div>
          <div className="col-12 col-md-6 mb10">
            <a href="/" className="btn btn-secondary disabled">
              Comming soon
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopLinkMenu;

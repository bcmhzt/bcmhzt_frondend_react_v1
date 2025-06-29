/** 11111111 */
import routes from '../routes';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/List.tsx:xx] debug:', debug);
}

/**
 * 11111111
 * [src/pages/Archtect.tsx:xx]
 *
 * type: page
 *
 * [Order]
 * - 全ページリスト
 */

const List = () => {
  return (
    <>
      <div className="app-body">
        <Header />
        <div className="container bc-app">
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              <h2>List</h2>
              <h3>Public</h3>
              {routes.publicRoutes.map((route, index) => (
                <li key={index}>
                  <Link to={route.path}>{route.path}</Link>
                </li>
              ))}

              <h3>Private</h3>
              {routes.privateRoutes.map((route, index) => (
                <li key={index}>
                  <Link to={route.path}>{route.path}</Link>
                </li>
              ))}

              <h3>Error Routes</h3>
              {routes.errorRoutes.map((route, index) => (
                <li key={index}>
                  <Link to={route.path}>{route.path}</Link>
                </li>
              ))}

              <h3>Dev</h3>
              {routes.devRoutes.map((route, index) => (
                <li key={index}>
                  <Link to={route.path}>{route.path}</Link>
                </li>
              ))}
            </div>

            <div className="d-none d-md-block col-md-6 bc-right">bar</div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};
export default List;

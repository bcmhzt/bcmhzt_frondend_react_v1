import routes from '../routes';
import { Link } from 'react-router-dom';

const List = () => {
  return (
    <>
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
    </>
  );
};
export default List;
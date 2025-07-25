// App.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import routes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import { MessageProvider } from './contexts/MessageContext';
import { MessageContainer } from './containers/MessageContainer';
import { BadgeProvider } from './contexts/BadgeContext';

function OverflowResetOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    // ルート変更時にbodyのoverflowを解除
    document.body.style.overflow = 'auto';
  }, [location.pathname]);

  return null;
}

function App() {
  console.log('ENV:', process.env.REACT_APP_ENV);
  return (
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <MessageProvider>
            <BadgeProvider>
              <OverflowResetOnRouteChange />
              <Routes>
                {routes.publicRoutes.map(({ path, component: Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}

                <Route element={<PrivateRoute />}>
                  {routes.privateRoutes.map(
                    ({ path, component: Component }) => (
                      <Route key={path} path={path} element={<Component />} />
                    )
                  )}
                </Route>

                {['local', 'dev', 'test', 'stg'].includes(
                  process.env.REACT_APP_ENV || ''
                ) &&
                  routes.devRoutes.map(({ path, component: Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                  ))}

                <Route
                  path={routes.notFound.path}
                  element={<routes.notFound.component />}
                />
              </Routes>
            </BadgeProvider>
            <MessageContainer />
          </MessageProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;

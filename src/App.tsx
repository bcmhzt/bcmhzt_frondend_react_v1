// App.tsx
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import routes from "./routes";
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  console.log("ENV:", process.env.REACT_APP_ENV);
  return (
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
        <Routes>
          
          {routes.publicRoutes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          
          <Route element={<PrivateRoute />}>
            {routes.privateRoutes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          {['local', 'dev', 'test', 'stg'].includes(process.env.REACT_APP_ENV || '') &&
            routes.devRoutes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))
          }

          <Route path={routes.notFound.path} element={<routes.notFound.component />} />
          
        </Routes>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;



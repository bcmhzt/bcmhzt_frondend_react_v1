// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import routes from "./routes";
import { AuthProvider } from './contexts/AuthContext';

function App() {
  console.log("ENV:", process.env.REACT_APP_ENV);
  return (
    <BrowserRouter>
      <Routes>
        

        {routes.publicRoutes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        
        <Route
          element={
            <AuthProvider>
              <Outlet />
            </AuthProvider>
          }
        >
          {routes.privateRoutes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>

        {['local', 'dev', 'test'].includes(process.env.REACT_APP_ENV || '') &&
          routes.devRoutes.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))
        }

        <Route path={routes.notFound.path} element={<routes.notFound.component />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;



// routes.ts
import { ComponentType } from "react";
/** publicRoutes */
import Top from "./pages/Top";
import About from "./pages/About";
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Login from './pages/auth/Login';
import ForgotMyPassword from './pages/auth/ForgotMyPassword';
import PasswordReset from './pages/auth/PasswordReset';
/** privateRoutes */
import Dashboard from "./pages/Dashboard";
import Members from "./pages/members/Members";
import Posts from "./pages/posts/Posts";
// import MetaAccount from "./pages/User/MetaAccount";


/** devRoutes */
import List from "./pages/List";
import Archtect from "./pages/Archtect";
import DevAuthenticate from "./pages/develop/DevAuthenticate";
/** not fount 404 */
import NotFound404 from "./pages/errors/NotFound404";


type RouteItem = {
  path: string;
  component: ComponentType;
};

type RoutesObject = {
  publicRoutes: RouteItem[];
  privateRoutes: RouteItem[];
  errorRoutes: RouteItem[];
  devRoutes: RouteItem[];
  notFound: RouteItem;
};

const routes: RoutesObject = {
  publicRoutes: [
    { path: "/", component: Top },
    { path: "/about", component: About },
    { path: "/register", component: Register },
    { path: "/verifyemail/:hash", component: VerifyEmail },
    { path: "/login", component: Login },
    { path: "/forgotmypassword", component: ForgotMyPassword },
    { path: "/passwordreset/:hash", component: PasswordReset }
  ],
  privateRoutes: [
    { path: "/develop/authenticate", component: DevAuthenticate },
    { path: "/dashboard", component: Dashboard },
    { path: "/members", component: Members },
    { path: "/posts", component: Posts },
    // { path: "/metaaccount", component: MetaAccount }
  ],
  errorRoutes: [],
  devRoutes: [
    { path: "/list", component: List },
    { path: "/develop/archtect", component: Archtect },
    
  ],
  notFound: { path: "*", component: NotFound404 }
};

export default routes;

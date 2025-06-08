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
import MemberDetail from "./pages/members/MemberDetail";
import Posts from "./pages/posts/Posts";
import PostsLikeList from "./pages/posts/PostsLikeList";
import PostsReplyList from "./pages/posts/PostsReplyList";
import PostsBookmarks from "./pages/posts/PostsBookmarks";
import PostsMediaList from "./pages/posts/PostsMediaList";
import PostDetail from "./pages/posts/PostDetail"
import Notice from "./pages/notice/Notice";
import Messages from "./pages/messages/Messages"
import LoopTutorial from "./pages/develop/LoopTutorial";
import DevArchtectPage from "./pages/develop/DevArchtectPage";
import MyProfile from "./pages/user/MyProfile";
import LikedMeCard from "./pages/likematch/LikedMeCard";
import MatchedCard from "./pages/likematch/MatchedCard";
import ILikedCard from "./pages/likematch/ILikedCard";
import Settings from "./pages/user/Settings";
// import MetaAccount from "./pages/User/MetaAccount";
//src/pages/user/MyProfile.tsx



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
    { path: "/member/:bcuid", component: MemberDetail },
    { path: "/posts", component: Posts },
    { path: "/posts_like", component: PostsLikeList },
    { path: "/posts_reply", component: PostsReplyList },
    { path: "/posts_bookmark", component: PostsBookmarks },
    { path: "/posts_media", component: PostsMediaList },
    { path: "/post/:post_id", component: PostDetail },
    { path: "/notice", component: Notice },
    { path: "/messages", component: Messages },
    { path: "/loop_tutorial", component: LoopTutorial },
    { path: "/myprofile", component: MyProfile },
    { path: "/liked_me", component: LikedMeCard },
    { path: "/matched", component: MatchedCard },
    { path: "/i_liked", component: ILikedCard },
    /** user */
    { path: "/settings", component: Settings },
    // { path: "/metaaccount", component: MetaAccount }
  ],
  errorRoutes: [],
  devRoutes: [
    { path: "/list", component: List },
    { path: "/develop/archtect", component: Archtect },
    { path: "/develop/archtect/page", component: DevArchtectPage },
    
  ],
  notFound: { path: "*", component: NotFound404 }
};

export default routes;

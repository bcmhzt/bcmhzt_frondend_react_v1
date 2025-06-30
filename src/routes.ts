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
import OpenTalks from "./pages/opentalks/OpenTalks";
import EasySexualProfileRegist from "./pages/easysexualprofileregist/EasySexualProfileRegist";
import Members from "./pages/members/Members";
import MemberDetail from "./pages/members/MemberDetail";
import MemberPosts from "./pages/members/MemberPosts";
import Posts from "./pages/posts/Posts";
import PostsLike from "./pages/posts/PostsLike";
import PostsReply from "./pages/posts/PostsReply";
import PostsBookmarks from "./pages/posts/PostsBookmarks";
import PostsMedia from "./pages/posts/PostsMedia";
import PostDetail from "./pages/posts/PostDetail"
import Notice from "./pages/notice/Notice";
import Messages from "./pages/messages/Messages";
import Messages2 from "./pages/messages/Messages2";
import LoopTutorial from "./pages/develop/LoopTutorial";
import DevArchtectPage from "./pages/develop/DevArchtectPage";
import MyProfile from "./pages/user/MyProfile";
import LikedMeCard from "./pages/likematch/LikedMeCard";
import MatchedCard from "./pages/likematch/MatchedCard";
import ILikedCard from "./pages/likematch/ILikedCard";
import Settings from "./pages/user/Settings";
import Index from "./pages/Index";
// import MetaAccount from "./pages/User/MetaAccount";
//src/pages/user/MyProfile.tsx



/** devRoutes */
import List from "./pages/List";
import Archtect from "./pages/Archtect";
import DevAuthenticate from "./pages/develop/DevAuthenticate";
import DevFirestoreSnapshot from "./pages/develop/DevFirestoreSnapshot"
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
    { path: "/", component: Top },// Topページ
    { path: "/about", component: About },// Aboutページ
    { path: "/register", component: Register },// 新規登録
    { path: "/verifyemail/:hash", component: VerifyEmail },// メール認証
    { path: "/login", component: Login },// ログイン
    { path: "/forgotmypassword", component: ForgotMyPassword },// パスワードをお忘れの方
    { path: "/passwordreset/:hash", component: PasswordReset } // パスワードリセット
  ],
  privateRoutes: [
    { path: "/develop/authenticate", component: DevAuthenticate },// 認証ページテスト(開発)
    { path: "/dashboard", component: Dashboard },// ダッシュボード
    { path: "/open_talks", component: OpenTalks },// チャットの開発
    { path: "/easy_sexual_profile_regist", component: EasySexualProfileRegist},// お手軽プロフィール＆性癖登録
    { path: "/members", component: Members },// メンバー一覧
    { path: "/member/:bcuid", component: MemberDetail },// メンバー詳細
    { path: "/member/post/:bcuid", component: MemberPosts },// メンバー投稿一覧
    { path: "/posts", component: Posts },// 投稿一覧
    { path: "/posts_like", component: PostsLike },// いいね一覧
    { path: "/posts_reply", component: PostsReply },// 返信一覧
    { path: "/posts_bookmark", component: PostsBookmarks },// ブックマーク一覧
    { path: "/posts_media", component: PostsMedia },// メディア一覧
    { path: "/post/:post_id", component: PostDetail },// 投稿詳細
    { path: "/notice", component: Notice },// 通知
    { path: "/messages", component: Messages },// メッセージルーム（チャット）
    { path: "/messages2", component: Messages2 },// メッセージルーム（チャット）
    { path: "/loop_tutorial", component: LoopTutorial },// ループチュートリアル
    { path: "/myprofile", component: MyProfile },// マイプロフィール更新・変更
    { path: "/liked_me", component: LikedMeCard },// いいねしてくれた人（全量）
    { path: "/matched", component: MatchedCard },// マッチングした人（全量）
    { path: "/i_liked", component: ILikedCard },// 自分がいいねした人（全量）
    /** user */
    { path: "/settings", component: Settings },
    { path: "/index", component: Index },
    // { path: "/metaaccount", component: MetaAccount }
  ],
  errorRoutes: [],
  devRoutes: [
    { path: "/list", component: List },// ページ一覧（開発）
    { path: "/develop/archtect", component: Archtect },// 雛形（開発）
    { path: "/develop/archtect/page", component: DevArchtectPage },// 雛形（開発）
    { path: "/develop/firestore_snapshot", component: DevFirestoreSnapshot },// チャットの開発
  ],
  notFound: { path: "*", component: NotFound404 }
};

export default routes;

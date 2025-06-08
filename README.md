```
rm -rf node_modules package-lock.json;
npm cache clean --force;
npm install --legacy-peer-deps;
npm start;
```

# Spec

react: v19.1.0
type script: Version 4.9.5

% npx tsc -v
Version 4.9.5

## Develop command

インストール時は`--legacy-peer-deps`をつける。

```
% npm install xxxxxx --legacy-peer-deps
```

### Delete cache & restart

```
% npm cache clean --force
% rm -f package-lock.json
% rm -fR node_modules
% --legacy-peer-deps
% npm start
```

# Rules

| 対象                         | 命名規則                    | 例                            |
| ---------------------------- | --------------------------- | ----------------------------- |
| React コンポーネントファイル | PascalCase                  | `UserProfile.tsx`             |
| ユーティリティファイル       | camelCase または PascalCase | `useAuth.ts`, `formatDate.ts` |
| ディレクトリ名               | kebab-case                  | `components/`, `pages/`       |
| 関数・変数名                 | camelCase                   | `handleClick`, `fetchData`    |
| React コンポーネント名       | PascalCase                  | `UserProfile`                 |
| React フック                 | camelCase + `use` 始まり    | `useAuth`                     |

# 新規作成

1. Type scriptファイルの作成
   page以下、またはcomponent以下など。

```
const ArchitectFile = () => {
  return (
    <>
      ArchitectFile
    </>
  );
};
export default ArchitectFile;
```

1. routeの登録
   src/routes.ts

## スマホのエミュレーター

```
% npm install ngrok --save-dev --legacy-peer-deps
% ipconfig getifaddr en0
192.168.1.14
% npm start HTTPS=true HOST=192.168.1.14
% npx ngrok http 3000
```

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

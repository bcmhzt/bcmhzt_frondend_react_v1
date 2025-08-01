# Firebase maintenace tools

Firebaseの管理ツールです。Firebaseには便利なCLIがないので、それぞれコマンドを自作で開発する必要があります。

##　実行環境に移動
このツールはReactのプロジェクトとは独立していて（gitの管理は同じ）、別のnpmで動いています。

```
% cd firebase_maintenance_tools
% npm install
```

キャッシュの削除方法

```
% npm cache clean --force
% rm -rf ~/.npm
% rm -rf node_modules
% npm install
```

## 実行

```
% npm run hello
または
% npx tsx hello_firebase_maintenance_tools.ts
=======================================
☀️ hello! firebase maintenance tools !!
=======================================
```

各スクリプトは個別に実行します。

### openTalk

openTalkの確認（最新の一件を表示）

```
% npx ts-node openTalks/hello_opentalks.ts
```

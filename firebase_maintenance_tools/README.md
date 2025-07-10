# Firebase maintenace tools

## 準備

ts-nodeで実行するための準備

```
% （プロジェクトルート）
% npm install -D ts-node typescript --legacy-peer-deps
% npx tsc --init
```

tsconfig.jsonがすでに存在する場合は、tsconfig.jsonを開いて実行環境を拡張する。

```
  "include": [
    "src",
    "firebase_maintenance_tools"
  ],
```

2025-07-10現在は以下で設定

```
{
  "compilerOptions": {
    "target": "es2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": ".",
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx"
  },
  "include": [
    "src",
    "firebase_maintenance_tools"
  ],
  "downlevelIteration": true
}
```

## ビルド

Typeスクリプトをビルドします。成功すると、dist

```
% npx tsc
(Errorが出なかったら成功)
```

## 実行

ビルド

```
% npx tsc
```

実行

```
% node dist/firebase_maintenance_tools/hello_firebase_maintenance_tools.js
```

1. open_talksのdocumentを削除する

```

```

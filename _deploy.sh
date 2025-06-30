#!/bin/bash

## Auto deply system

# コミットメッセージを入力
read -p "Enter commit message: " COMMIT_MSG

echo "Deploying with commit message: $COMMIT_MSG"

git status;
# ステージングエリアに変更を追加
git add -A;
git commit -m "$COMMIT_MSG";
git push origin dev;

git checkout test;
git merge dev;
git push origin test;

git checkout main;
git merge test;
git push origin main;
#!/bin/bash

## Auto deply system
## dev ブランチから行う

## % bash _deploy.sh

# 現在のブランチを確認
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "dev" ]]; then
  echo "Warning: You are not on the 'dev' branch. Please switch to the 'dev' branch to proceed."
  exit 1
fi

# コミットメッセージを入力
read -p "Enter commit message: " COMMIT_MSG

echo "Deploying with commit message: $COMMIT_MSG"

npm run build;
echo "Building the project, please wait..."
while true; do
  echo -n "."
  sleep 1
  if ! ps -C npm > /dev/null; then
    break
  fi
done
echo -e "\nBuild completed."

read -p "Do you want to proceed with deployment? (Y/n): " PROCEED
if [[ "$PROCEED" != "Y" && "$PROCEED" != "y" ]]; then
  echo "Deployment aborted."
  exit 1
fi

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

git checkout dev;
echo "Deployment completed successfully.";
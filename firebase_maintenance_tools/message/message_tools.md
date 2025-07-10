# message_tooles

メッセージ（チャット）のメンテナンスツールです。FirebaseはCLIがないので、個別にコマンドを作成しないといけません。すべてローカルで実行します。（後にクラウド上で実行できるようにしたい）

```
% cd firebase_maintenance_tools
% node hello_firebase_maintenance_tools.ts
```

| file name                | summary                                                       | command exec |
| ------------------------ | ------------------------------------------------------------- | ------------ |
| fetch_match_chatRooms.ts | 本人（ログインuid）を引数にマッチリストとChatRoomIdを取得する | command exec |

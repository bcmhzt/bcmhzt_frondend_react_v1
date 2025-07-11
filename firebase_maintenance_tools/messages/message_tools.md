# message_tooles

メッセージ（チャット）のメンテナンスツールです。FirebaseはCLIがないので、個別にコマンドを作成しないといけません。すべてローカルで実行します。（後にクラウド上で実行できるようにしたい）

```
% cd firebase_maintenance_tools
% npx ts-node hello_firebase_maintenance_tools.ts
(% npm run hello)
```

| file name                | summary                                                       | command exec                                                                                         |
| ------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| fetch_match_chatRooms.ts | 本人（ログインuid）を引数にマッチリストとChatRoomIdを取得する | % npx ts-node messages/fetch_match_chatRooms.ts Ptp2VzffuSOklLbFADqeSEvgbXW2                         |
| delete_chatRooms.ts      | ChatRoomId引数にしてDocumentを削除する                        | % npx ts-node messages/delete_chatRooms.ts Ptp2VzffuSOklLbFADqeSEvgbXW2_zrTgTgyLfnbVmy0CJyc1poyf0Wu2 |

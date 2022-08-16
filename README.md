# pow

## これは何？
「pow」はDiscord用音声読み上げBotです。  
読み上げAPIに「[VoiceText Web API](https://cloud.voicetext.jp/webapi)」を使用しています。

## プレビュー

https://user-images.githubusercontent.com/34514603/184809823-c66e5f0c-7a7c-476a-b9c1-3ce2e0cc8d12.mp4

## BOT追加URL

[こちらのURL](https://discord.com/oauth2/authorize?client_id=939494577574924339&permissions=36716544&scope=applications.commands%20bot)から追加可能です。

## 使い方

### ⚠ powから見えないチャンネルでは使用する事が出来ません。

1. powを参加させたいボイスチャンネルに参加します。
2. powに読み上げさせたいテキストチャンネル上で `/join` を実行します。
3. Done.

### コマンドリスト

| コマンド名 (存在する場合は引数) | 説明 |
| :--- | :--- |
| /join | 実行者が参加しているボイスチャンネルに参加します。 |
| /leave | 参加しているボイスチャンネルから退出します。 |
| /purge | 読み上げのキューを空にして、読み上げを中断します。 |
| /random | 声の設定をランダムに変更します。 |
| /read (text) | 引数に渡されたメッセージを読み上げます。 |
| /readtoggle | メッセージを読み上げるかどうかを切り替えます。 |
| /view | 現在の読み上げボイスの設定を表示します。 |
| /voice (下段で詳細説明) | 読み上げボイスの設定を変更します。 |

### 設定変更

このBOTは「話者」「声の高さ」「声の速度」を変更する事が出来ます。  
変更するには `/voice` コマンドの第一引数でカテゴリを指定し、第二引数で内容を指定します。  
なお、**同時に複数の設定を変更する事は出来ません**。複数設定を変更したい際は一つずつ分けて実行してください。

| 第一引数(設定カテゴリ) | 第二引数(設定内容) |
| :--- | :--- |
| speaker | show, haruka, hikari, takeru, santa, bear |
| pitch | 50 から 200 |
| speed | 50 から 400 |
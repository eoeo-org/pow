# pow

## これは何？

「pow」は Discord 用音声読み上げ Bot です。\
読み上げ API に「[VoiceText Web API](https://cloud.voicetext.jp/webapi)」を使用しています。

## プレビュー

https://user-images.githubusercontent.com/34514603/184809823-c66e5f0c-7a7c-476a-b9c1-3ce2e0cc8d12.mp4

## BOT 追加 URL

| ボット名       | サーバーに追加URL                                                                                      |
|:-------------|:----------------------------------------------------------------------------------------------------|
|pow.js#1687    |https://discord.com/api/oauth2/authorize?client_id=939494577574924339&permissions=3164160&scope=applications.commands%20bot|
|pow.js(02)#6569|https://discord.com/api/oauth2/authorize?client_id=1092794194667520070&permissions=3145728&scope=bot|
|pow.js(03)#6971|https://discord.com/api/oauth2/authorize?client_id=1096472754187948073&permissions=3145728&scope=bot|
|pow.js(04)#1884|https://discord.com/api/oauth2/authorize?client_id=1099605468722249728&permissions=3145728&scope=bot|
|pow.js(05)#1501|https://discord.com/api/oauth2/authorize?client_id=1099605507792195604&permissions=3145728&scope=bot|
|pow.js(06)#2465|https://discord.com/api/oauth2/authorize?client_id=1101127292287201332&permissions=3145728&scope=bot|
|pow.js(07)#8155|https://discord.com/api/oauth2/authorize?client_id=1101127376332664933&permissions=3145728&scope=bot|
|pow.js(08)#5359|https://discord.com/api/oauth2/authorize?client_id=1101127454841643078&permissions=3145728&scope=bot|
|pow.js(09)#7365|https://discord.com/api/oauth2/authorize?client_id=1101127534415974463&permissions=3145728&scope=bot|
|pow.js(10)#5506|https://discord.com/api/oauth2/authorize?client_id=1101127722505359411&permissions=3145728&scope=bot|
|pow.js(11)#1725|https://discord.com/api/oauth2/authorize?client_id=1109944502061371483&permissions=3145728&scope=bot|
|pow.js(12)#7321|https://discord.com/api/oauth2/authorize?client_id=1109944571560996946&permissions=3145728&scope=bot|

## 使い方

**⚠ pow から見えないチャンネルでは使用できません。**

1. pow を参加させたいボイスチャンネルに参加します。
2. pow に読み上げさせたいテキストチャンネル上で `/join` を実行します。
3. Done.

### コマンドリスト

| コマンド名 (存在する場合は引数) | 説明                                               |
| :------------------------------ | :------------------------------------------------- |
| /help                           | この場所へのリンクを返します。                  |
| /join                           | 実行者が参加しているボイスチャンネルに参加します。 |
| /leave                          | 参加しているボイスチャンネルから退出します。       |
| /purge                          | 読み上げのキューを空にして、読み上げを中断します。 |
| /read (text)                    | 引数に渡されたメッセージを読み上げます。           |
| /ttsmute                        | メッセージを一時的に読み上げないようにします。     |
| /skip                           | 今読み上げている内容をスキップします。            |
| /user-settings view             | 現在の読み上げボイスの設定状態を表示します。           |
| /user-settings voice ( [設定変更](#設定変更) )   | 読み上げボイスの設定を変更します。  |
| /reset                          | このサーバーでの参加状態を初期化します。(⚠VCからBOTが退出します。)<br>このコマンドの実行には「メンバーを移動」権限が必要です。 |

### 設定変更

この BOT は「話者」「声の高さ」「声の速度」の変更に対応しています。

| オプション名 | 説明 | 設定内容                        |
| :--------------------- | :---------- | :-------------- |
| random       | 同時に指定していないオプションにランダム値を割り当てるか | True, False |
| speaker      |     話者の指定         | show, haruka, hikari, takeru, santa, bear |
| pitch        |     声の高さの指定      | 50 から 200                               |
| speed        |     声の速度の指定      | 50 から 400                               |

#### 設定例

パラメータの調整例です。

|名前|speaker|pitch|speed|
|:---|:---|:---|:---|
|ずんだもんのような声|haruka|127|100|
|トリビアの泉のナレーターのような声|santa|50|80|


### 読み上げをスキップするには

`_`を最初に付けると読み上げをスキップできますが、また同様にコードブロック、またはスポイラーでもスキップできます。

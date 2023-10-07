# Changelog

## [3.6.1](https://github.com/kazukazu123123/pow/compare/v3.6.0...v3.6.1) (2023-10-07)


### Bug Fixes

* **deps:** update dependency @sapphire/framework to v4.6.1 ([#824](https://github.com/kazukazu123123/pow/issues/824)) ([49b39c9](https://github.com/kazukazu123123/pow/commit/49b39c9a4fc8ad5e4649323cb8dde9f7f5487713))

## [3.6.0](https://github.com/kazukazu123123/pow/compare/v3.5.2...v3.6.0) (2023-09-28)


### Features

* エラーを console に書き出すように ([#815](https://github.com/kazukazu123123/pow/issues/815)) ([326759a](https://github.com/kazukazu123123/pow/commit/326759a1c015714110668a6c1f5801007d50073e))

## [3.5.2](https://github.com/kazukazu123123/pow/compare/v3.5.1...v3.5.2) (2023-09-25)


### Bug Fixes

* 退出メッセージの送信先チャンネルがない時にエラーをスローしないように修正 ([#808](https://github.com/kazukazu123123/pow/issues/808)) ([9b9bed7](https://github.com/kazukazu123123/pow/commit/9b9bed77157a6aea2865ed5ad46bc63e711ba8a5))

## [3.5.1](https://github.com/kazukazu123123/pow/compare/v3.5.0...v3.5.1) (2023-09-21)


### Bug Fixes

* メッセージによる join に失敗した時に落ちないように修正 ([#802](https://github.com/kazukazu123123/pow/issues/802)) ([42c21b2](https://github.com/kazukazu123123/pow/commit/42c21b23fef419d4567f019901050cf2269484f8))

## [3.5.0](https://github.com/kazukazu123123/pow/compare/v3.4.0...v3.5.0) (2023-09-20)


### Features

* 再起動後に再参加する機能を追加 ([#801](https://github.com/kazukazu123123/pow/issues/801)) ([597d340](https://github.com/kazukazu123123/pow/commit/597d340e1549519073f88b5132027a643655609d))


### Performance Improvements

* idベースの管理にする ([#798](https://github.com/kazukazu123123/pow/issues/798)) ([30054cf](https://github.com/kazukazu123123/pow/commit/30054cfd9c62fdacf89bb75c1f1a5851eae29a2a))
* idベースの管理にする2 ([#800](https://github.com/kazukazu123123/pow/issues/800)) ([9ecc3b5](https://github.com/kazukazu123123/pow/commit/9ecc3b53ec0a17b551d5dabb4cf8defd28c724e2))

## [3.4.0](https://github.com/kazukazu123123/pow/compare/v3.3.0...v3.4.0) (2023-09-17)


### Features

* leave 時に必ず readChannel へメッセージを送信する ([#789](https://github.com/kazukazu123123/pow/issues/789)) ([bb71877](https://github.com/kazukazu123123/pow/commit/bb71877753fea3001c330c3535e2d1d922e6c43a))


### Bug Fixes

* **commands:** /reset コマンドで GuildContext をリセットするように修正 ([#786](https://github.com/kazukazu123123/pow/issues/786)) ([888ca79](https://github.com/kazukazu123123/pow/commit/888ca797b1671c39b9eedc7f6e1b61de14c900b1))
* **db:** return 位置修正 ([#792](https://github.com/kazukazu123123/pow/issues/792)) ([d3e4f87](https://github.com/kazukazu123123/pow/commit/d3e4f8762ca9f80d93a5e884f0259d3c5cab9625))
* **deps:** update dependency libsodium-wrappers to v0.7.13 ([#788](https://github.com/kazukazu123123/pow/issues/788)) ([e586592](https://github.com/kazukazu123123/pow/commit/e58659222aac3e70ed307fe4212fc82b3e152b5e))
* **deps:** update dependency mariadb to v3.2.1 ([#790](https://github.com/kazukazu123123/pow/issues/790)) ([b32f48d](https://github.com/kazukazu123123/pow/commit/b32f48dff105f6a4b5d5595a922d1123a9f296cb))


### Performance Improvements

* **db:** query 減らす ([#793](https://github.com/kazukazu123123/pow/issues/793)) ([3603a71](https://github.com/kazukazu123123/pow/commit/3603a71397e8711066091272d48a85ec4e187010))

## [3.3.0](https://github.com/kazukazu123123/pow/compare/v3.2.5...v3.3.0) (2023-09-13)


### Features

* ユーザー設定をキャッシュするようにする ([#783](https://github.com/kazukazu123123/pow/issues/783)) ([22e0636](https://github.com/kazukazu123123/pow/commit/22e0636c1ed8fd418b06ba1aa6b50405afd45f75))

## [3.2.5](https://github.com/kazukazu123123/pow/compare/v3.2.4...v3.2.5) (2023-09-13)


### Bug Fixes

* **db:** DBエラーのメッセージを修正 ([#781](https://github.com/kazukazu123123/pow/issues/781)) ([04d98f3](https://github.com/kazukazu123123/pow/commit/04d98f31f45efe689692d99ed899fb14d9ebc398))

## [3.2.4](https://github.com/kazukazu123123/pow/compare/v3.2.3...v3.2.4) (2023-09-09)


### Bug Fixes

* **db:** SQLインジェクション対策 ([#771](https://github.com/kazukazu123123/pow/issues/771)) ([1b38bec](https://github.com/kazukazu123123/pow/commit/1b38becc0eb411db8c73866d9d65000a9be78108))

## [3.2.3](https://github.com/kazukazu123123/pow/compare/v3.2.2...v3.2.3) (2023-09-09)


### Bug Fixes

* **commands:** voice コマンドで落ちるのを修正 ([#768](https://github.com/kazukazu123123/pow/issues/768)) ([f51b8a4](https://github.com/kazukazu123123/pow/commit/f51b8a4550e7db2eda0416b31bcbdcca03fdd468))


### Performance Improvements

* add compress option to db connection ([#766](https://github.com/kazukazu123123/pow/issues/766)) ([56c89ba](https://github.com/kazukazu123123/pow/commit/56c89ba9f5686b1321c77c46ca5505ac136d5f80))

## [3.2.2](https://github.com/kazukazu123123/pow/compare/v3.2.1...v3.2.2) (2023-09-07)


### Bug Fixes

* **deps:** update dependency @sapphire/framework to v4.6.0 ([#761](https://github.com/kazukazu123123/pow/issues/761)) ([07696b1](https://github.com/kazukazu123123/pow/commit/07696b1a26504e470d3a7f8af962d7457fafdcc1))

## [3.2.1](https://github.com/kazukazu123123/pow/compare/v3.2.0...v3.2.1) (2023-09-02)


### Bug Fixes

* **commands:** join コマンドのエラー処理を修正 ([#755](https://github.com/kazukazu123123/pow/issues/755)) ([9bc93fb](https://github.com/kazukazu123123/pow/commit/9bc93fbc77d5616ac202f9ddec8c17cf813133bb)), closes [#754](https://github.com/kazukazu123123/pow/issues/754)

## [3.2.0](https://github.com/kazukazu123123/pow/compare/v3.1.4...v3.2.0) (2023-09-01)


### Features

* **commands:** `/read` に声設定のオプションを追加 ([#750](https://github.com/kazukazu123123/pow/issues/750)) ([c59aed8](https://github.com/kazukazu123123/pow/commit/c59aed857cf8b59e0d8df32f1fee6e0e449d2e9c)), closes [#9](https://github.com/kazukazu123123/pow/issues/9)

## [3.1.4](https://github.com/kazukazu123123/pow/compare/v3.1.3...v3.1.4) (2023-08-31)


### Miscellaneous Chores

* release 3.1.4 ([#746](https://github.com/kazukazu123123/pow/issues/746)) ([88e1a8c](https://github.com/kazukazu123123/pow/commit/88e1a8c74611cf337ac8e7618e062aaee69638cc))

## [3.1.3](https://github.com/kazukazu123123/pow/compare/v3.1.2...v3.1.3) (2023-08-31)


### Bug Fixes

* add handle db errors ([#743](https://github.com/kazukazu123123/pow/issues/743)) ([b3e9ba6](https://github.com/kazukazu123123/pow/commit/b3e9ba63dd082ba996ef1fe6998e6fcff31988f1))
* **deps:** update dependency @sapphire/plugin-subcommands to v4.2.1 ([#737](https://github.com/kazukazu123123/pow/issues/737)) ([9ab4793](https://github.com/kazukazu123123/pow/commit/9ab4793e9bd6705019b30521a1fcf909c9d5fc9b))
* **refactor:** エラー処理を修正 ([#739](https://github.com/kazukazu123123/pow/issues/739)) ([a3e3621](https://github.com/kazukazu123123/pow/commit/a3e36219a7cb049699432bb316764334be379f2f))

## [3.1.2](https://github.com/kazukazu123123/pow/compare/v3.1.1...v3.1.2) (2023-08-27)


### Bug Fixes

* **commands:** Fix error message ([#731](https://github.com/kazukazu123123/pow/issues/731)) ([5ee752b](https://github.com/kazukazu123123/pow/commit/5ee752b616f13d6a97b5bb05c907b617067c8236))

## [3.1.1](https://github.com/kazukazu123123/pow/compare/v3.1.0...v3.1.1) (2023-08-27)


### Bug Fixes

* **commands:** rejoin コマンドを修正 ([#728](https://github.com/kazukazu123123/pow/issues/728)) ([306ddf8](https://github.com/kazukazu123123/pow/commit/306ddf8f18f67abb87bc88e4de2a6f3d2b009a47))

## [3.1.0](https://github.com/kazukazu123123/pow/compare/v3.0.1...v3.1.0) (2023-08-25)


### Features

* **command:** Add /rejoin command. ([#715](https://github.com/kazukazu123123/pow/issues/715)) ([1aac74b](https://github.com/kazukazu123123/pow/commit/1aac74bf2b88110d16576a87fadbda3d4615b3a3))


### Bug Fixes

* **commands:** add command validations ([#722](https://github.com/kazukazu123123/pow/issues/722)) ([881db8a](https://github.com/kazukazu123123/pow/commit/881db8a7bc5d24113036bce7f22eddbe3ce61e40))

## [3.0.1](https://github.com/kazukazu123123/pow/compare/v3.0.0...v3.0.1) (2023-08-24)


### Bug Fixes

* **commands:** help の返答メッセージを修正 ([#710](https://github.com/kazukazu123123/pow/issues/710)) ([9670fac](https://github.com/kazukazu123123/pow/commit/9670fac23c8f84462accac682c61778748de6c6e))
* **deps:** update dependency @sapphire/framework to v4.5.2 ([#700](https://github.com/kazukazu123123/pow/issues/700)) ([2786c34](https://github.com/kazukazu123123/pow/commit/2786c346993b1472b8624ad35f6a547a5dcb03e4))
* **deps:** update dependency @sapphire/framework to v4.5.3 ([#706](https://github.com/kazukazu123123/pow/issues/706)) ([0988321](https://github.com/kazukazu123123/pow/commit/0988321a769be31dde8d02b2604b43a513d8b6f4))
* **deps:** update dependency @sapphire/plugin-subcommands to v4.1.0 ([#701](https://github.com/kazukazu123123/pow/issues/701)) ([c8d517c](https://github.com/kazukazu123123/pow/commit/c8d517c4c7d26151f7602f3f73279c231d3acfdb))
* **deps:** update dependency @sapphire/plugin-subcommands to v4.2.0 ([#705](https://github.com/kazukazu123123/pow/issues/705)) ([b77a3d8](https://github.com/kazukazu123123/pow/commit/b77a3d82fc651074b5d76818acde0edd5eb6c47d))

## [3.0.0](https://github.com/kazukazu123123/pow/compare/v2.10.1...v3.0.0) (2023-08-21)


### ⚠ BREAKING CHANGES

* **commands:** `/readtoggle` を `/ttsmute` に置き換え ([#699](https://github.com/kazukazu123123/pow/issues/699))
* **commands:** `/user-settings` に移行しUXを向上 ([#692](https://github.com/kazukazu123123/pow/issues/692))

### Features

* **commands:** `/readtoggle` を `/ttsmute` に置き換え ([#699](https://github.com/kazukazu123123/pow/issues/699)) ([02626ce](https://github.com/kazukazu123123/pow/commit/02626ce1f6f7c4980860c8129aad1ed3ef3bab31))
* **commands:** `/user-settings` に移行しUXを向上 ([#692](https://github.com/kazukazu123123/pow/issues/692)) ([fcb440c](https://github.com/kazukazu123123/pow/commit/fcb440c9436807294a24ccc6fdf763a3d46d02d6))


### Bug Fixes

* **deps:** update dependency @discordjs/collection to v1.5.3 ([#695](https://github.com/kazukazu123123/pow/issues/695)) ([e40dd66](https://github.com/kazukazu123123/pow/commit/e40dd66fafe87bec6979ff5dd8ec8ab1b0618b26))
* **deps:** update dependency discord.js to v14.13.0 ([#696](https://github.com/kazukazu123123/pow/issues/696)) ([c3b1f9c](https://github.com/kazukazu123123/pow/commit/c3b1f9cb5196f65b74f95babc3477f3d6618e153))
* **deps:** update dependency ffmpeg-static to v5.2.0 ([#693](https://github.com/kazukazu123123/pow/issues/693)) ([e452a01](https://github.com/kazukazu123123/pow/commit/e452a01f03695e35dbd8d185d2a4bd6697f3ffdb))
* refactor ([#697](https://github.com/kazukazu123123/pow/issues/697)) ([47737de](https://github.com/kazukazu123123/pow/commit/47737de32a9ec21e56f505eb95493300ad8c3f6b))

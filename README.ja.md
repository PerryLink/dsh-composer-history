# ⌨️ dsh-composer-history

**DeepSeek Harness の Web GUI コンポーザーに、ターミナル流の入力履歴を。**

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md)

<p align="center">
  <a href="https://github.com/topics/dsh"><img alt="topic: dsh" src="https://img.shields.io/badge/topic-dsh-8A2BE2"></a>
  <a href="https://github.com/topics/dsh-plugin"><img alt="topic: dsh-plugin" src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2"></a>
  <a href="https://github.com/topics/deepseek-harness"><img alt="topic: deepseek-harness" src="https://img.shields.io/badge/topic-deepseek--harness-8A2BE2"></a>
  <br>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <a href="./package.json"><img alt="version" src="https://img.shields.io/badge/version-0.2.0-66ccff"></a>
  <a href="./package.json"><img alt="node" src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933"></a>
  <img alt="tests" src="https://img.shields.io/badge/tests-168%2F168-brightgreen">
  <img alt="harness client" src="https://img.shields.io/badge/harness%20client-types%20rc.6-orange">
</p>

ターミナルと同じ感覚で **↑** を押して履歴を呼び戻す——でも、入力途中の下書きは常に安全です。`dsh-composer-history` は Claude Code の「エッジ優先」矢印キーモデルを dsh の Web コンポーザーに持ち込み、さらに一歩先へ：最新エントリまで戻る（または `Esc` を押す）と、退避した下書きとカーソル位置が**正確に復元**されます——クリアされません。その上：送信済みメッセージは**ブラウザローカルに永続化**されるので、履歴はリロードをまたいで残り、セッションを横断します。`Ctrl+R` は**逆検索**を開き、すべてのキーと調整値が設定可能です。

> 純粋な UI 動作です：セッションイベントの追加、agent-loop の変更、モデルへのリクエストは一切ありません。リコールされたテキストは通常のコンポーザーの下書きに入るだけで、モデルに届くのはあなたが Enter を押したときだけです。永続化された履歴はブラウザローカルのテキストです（[プライバシー](#プライバシー) 参照）。

## ✨ ハイライト

- 🎯 **エッジ優先の矢印キー** —— 素の ↑/↓ はまずカーソルを動かします。履歴リコールは、カーソルが下書きの先頭行／最終行に達したときだけ発動します。
- 💾 **下書きの退避** —— 最初のリコールで `{draft, caret}` を退避。最新エントリに再び達する（または `Esc`）と両方を正確に復元。Claude Code がここでクリアするところを、本プラグインは復元します。
- 🛡️ **分岐ガード** —— リコールしたエントリを編集すると即座にブラウズ終了。編集内容が新しい下書きになります。
- 🔄 **ライブ履歴** —— キー入力のたびにセッションスナップショットから再抽出：`kind === 'user'` のメッセージ、テキストブロックを連結、空白をスキップ、隣接重複をマージ、最新が末尾。送信した新しいメッセージも自動的に入ります。
- 💿 **永続化された履歴** —— 送信済みメッセージはすべて、上限付きのブラウザローカルストア（`dsh.composer-history.v1`）に追記されるため、ページリロード後もセッションをまたいでもリコールできます。`persistHistory: false` で無効化できます。
- 🗂️ **ワークスペーススコープ** —— `historyScope: 'workspace'` は、現在のセッションの前に他の一覧表示されたセッションのメッセージを前置します。
- 🔍 **逆検索** —— `Ctrl+R`（設定可能）でコンポーザーの下にクエリパネルが開きます：入力で絞り込み、↑/↓ で選択、Enter で確定、Esc でキャンセル。
- 🎛️ **すべてのキーが設定可能** —— `upKey`/`downKey`/`escapeKey`/`searchKeys` はコードではなく Config スキーマにあります。
- ⚙️ **設定との統合** —— ホスト側が `composer-history` 設定名前空間を登録します（cordis.yml の設定が composition の `base` になります）。設定ドキュメントからのユーザー上書きはブラウザに届きます。設定サービスが無い場合も、プラグインは composition のとおりにそのまま動作します。
- 🚦 **完全なゲーティング** —— `plain` 入力フェーズのみ横取り。スラッシュメニュー・コマンドポップアップ・IME 変換中・テキスト選択・alt/meta/shift コンビネーションにはすべて譲ります。パススルー経路は副作用ゼロ。
- 📐 **2 種類のエッジ判定** —— `logical`（改行ベース、デフォルト）または `visual`（隠し mirror div が実際の折り返し行を測定）。

## 🎬 使用イメージ

```text
$ you type a half-finished prompt and press ↑
        └─ draft is stashed, newest history entry fills the composer
$ ↑ ↑ … walk to older entries        $ ↓ ↓ … walk back to the newest
        └─ at the oldest: hold (no-op)         └─ one more ↓: your draft is back,
                                                  caret exactly where it was
$ press Esc at any time → instant restore, browsing ends
$ press Ctrl+R → type a fragment → ↑/↓ → Enter → the match fills the composer
```

## 🚀 クイックスタート

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # all green: 168/168
pnpm run test:coverage                                  # per-module coverage report
pnpm run check:readmes && pnpm run verify:pack          # doc consistency + pack surface
```

その後、プロファイルに登録し（[インストール](#インストール) 参照）、`dsh --profile <your-profile> --port 3080` で起動します。

## 📦 インストール

起動する**前に**ビルドしてください——未ビルドのバンドルに対してはクライアントパッケージの検証が起動を拒否します。

1. プラグインをビルドします（上記）。
2. `$DSH_HOME/profiles/<your-profile>/cordis.patch.yml` に行を登録します。行の `name` には**裸のパッケージ名**を使ってください：ブラウザ側グラフの行 id はこの文字列そのもので、クライアントバンドルもビルド時に同じ id を埋め込みます。

   ```yaml
   # appended after the bundle layers
   - insert:
       - id: composer-history
         name: dsh-composer-history
         config:
           recallWithDraft: save     # 'save' | 'gate'
           restoreOnEscape: true
           edgeMode: logical         # 'logical' | 'visual'
           enableCtrlAlias: true
           restoreCaret: true
           upKey: ArrowUp
           downKey: ArrowDown
           escapeKey: Escape
           maxHistory: 500           # 0 = unlimited
           includeKinds: [user]      # optionally add 'steering'
           historyScope: session     # 'session' | 'workspace'
           persistHistory: true
           maxPersisted: 200         # 0 = unlimited
           enableSearch: true
           searchKeys: [Ctrl+R]
           searchCaseSensitive: false
   ```

   `config:` ブロックはホスト Loader が同じスキーマで検証し、（設定サービスが存在する場合は）設定の `base` レイヤーとしてブラウザに流れ込みます——つまり、これらの値はバリデータだけでなく実際にブラウザ側に届きます。

3. 裸の行はプロファイルのリゾルバーマニフェストにも必要です——ホスト Loader はプロファイルディレクトリの `node_modules` から解決します：

   `$DSH_HOME/profiles/<your-profile>/package.json`：

   ```json
   {
     "name": "dsh-profile-<your-profile>",
     "private": true,
     "dependencies": {
       "dsh-composer-history": "file:D:/deepseek-harness/Project/Plugins/dsh-composer-history"
     },
     "dsh": {
       "profile": {
         "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app"]
       }
     }
   }
   ```

4. プロファイルディレクトリで `pnpm install` してから：

   ```sh
   dsh --profile <your-profile> --port 3080
   ```

5. tarball インストール（任意のパッケージマネージャー）の場合：このディレクトリで `pnpm pack` を実行し、プロファイルの `package.json` でその tarball を参照します。`pnpm run verify:pack` は発送前に pack サーフェスを検証します。

## ⚙️ Config

調整可能なパラメータはすべて Schemastery の `Config` スキーマにあります（ハードコードされたツマミはありません）。不正な列挙値は**dsh の起動全体を大きなエラーで失敗させます**——ホスト Loader が同じスキーマで cordis.yml のブロックを検証し、設定セクションはブラウザ側で使用前に再検証されます。

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`：空でない下書きはリコール前に退避；`gate`：空の下書きのみリコール（Claude/Codex 流ゲーティング） |
| `restoreOnEscape` | `boolean` | `true` | ブラウズ中に `Esc` で退避した下書きを復元 |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | エッジ判定を `\n` 論理行で行うか、実測した折り返し行で行うか |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ を素の矢印キーと同じ扱いにする |
| `restoreCaret` | `boolean` | `true` | 末尾到達／`Esc` 復元時に退避したカーソル位置も復元 |
| `upKey` | `string` | `'ArrowUp'` | 上方向へリコールする `KeyboardEvent.key`；`''` で無効化 |
| `downKey` | `string` | `'ArrowDown'` | 新しい方へ移動／復元する `KeyboardEvent.key`；`''` で無効化 |
| `escapeKey` | `string` | `'Escape'` | ブラウズを終了する `KeyboardEvent.key`；`''` で無効化 |
| `maxHistory` | `number` | `500` | リコールする最大エントリ数（新しい方を保持）；`0` = 無制限 |
| `includeKinds` | `string[]` | `['user']` | 履歴に取り込む会話ノードの kind（steer メッセージを含めるには `'steering'` を追加） |
| `historyScope` | `'session' \| 'workspace'` | `'session'` | `'workspace'` は現在のセッションの前に他の一覧表示されたセッションのユーザーメッセージを前置 |
| `persistHistory` | `boolean` | `true` | 送信済みメッセージをブラウザローカルストアに追記（[プライバシー](#プライバシー) 参照） |
| `maxPersisted` | `number` | `200` | 保存する最大エントリ数；`0` = 無制限 |
| `enableSearch` | `boolean` | `false` | `Ctrl+R` 逆検索オーバーレイを有効化 |
| `searchKeys` | `string[]` | `['Ctrl+R']` | 検索を開くコードスペック（修飾キー `Ctrl`/`Alt`/`Meta`/`Shift` + キー名）；不正なスペックはブラウザファイバーを大きなエラーで失敗させる |
| `searchCaseSensitive` | `boolean` | `false` | 検索マッチングで大文字小文字を区別するか |

## 🎹 キーバインド

| キー | 状態 | 動作 |
| --- | --- | --- |
| ↑ | IDLE、カーソルが先頭行 | {draft, caret} を退避し、最新エントリを入力、カーソルを末尾へ（履歴なしならパス） |
| ↑ | BROWSING、カーソルが先頭行 | 一つ古いエントリへ；最古では hold（横取りするが変更なし） |
| ↑ | カーソルが先頭行でない | 完全に解放（ブラウザがカーソルを移動） |
| ↓ | IDLE | 常に解放（通常のカーソル移動） |
| ↓ | BROWSING、カーソルが最終行 | 一つ新しいエントリへ；最新で → `savedDraft` + `savedCaret` を復元 → IDLE |
| ↓ | カーソルが最終行でない | 完全に解放 |
| Esc | BROWSING（`restoreOnEscape: true`） | `savedDraft` + `savedCaret` を復元 → IDLE、横取り |
| Esc | それ以外 | 解放（メニュー／ポップアップの Escape セマンティクスは不変） |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | 素の矢印キーと同義 |
| `searchKeys` chord | コンポーザーにフォーカス、`plain` フェーズ、メニュー／選択／IME なし | 逆検索を開く；ブラウズ終了、表示中のテキストが下書きになる |
| Shift/Alt/Meta+arrows, IME, selection | 任意 | 常に解放 |

`upKey`/`downKey`/`escapeKey`/`searchKeys` は上記のキーを改名します。修飾キーポリシー（および検索コードの完全一致する修飾キー）は変わりません。検索オーバーレイ内では：↑/↓ でマッチ選択を移動、Enter で確定、Esc でキャンセル、クリックで選択、外側の押下でキャンセル。

## 🔍 逆検索

- **開く**：コンポーザーにフォーカスがあり入力が `plain` のときの `searchKeys` コード（ここでの `Ctrl+R` はブラウザのページリロードも止めます——このキーはコンポーザー内でのみ消費されます）。
- **絞り込み**：マージ済み履歴（現在のセッション + 永続化 + ワークスペースエントリ）に対する部分文字列マッチ。大文字小文字の区別は `searchCaseSensitive` に従います。
- **選択**：Enter で下書きを確定しカーソルを末尾へ移動——通常のリコールと同じ単一の `setDraft` 書き込み経路です。リコールされたテキストがモデルに届くのは、その後に Enter を押したときだけです。
- **キャンセル**：Esc またはパネル外の押下。下書きは変更されません。

## 🔒 プライバシー

`persistHistory: true`（デフォルト）は、送信済みメッセージをこのブラウザの `localStorage` の `dsh.composer-history.v1` キーに書き込みます。上限は `maxPersisted`、どこにもアップロードされず、同じオリジンのページからのみ読み取れます。`persistHistory: false` で無効化すると——リコールはライブのセッション投影（とワークスペーススコープ）のみを使う v1 動作になります。破損または外部のペイロードは無言でリセットされます。

## ✅ 検証

1. Web UI を開き、`window.__DSH_BOOT__` に本プラグインの行（`id: "dsh-composer-history"`、`url: "/plugins/dsh-composer-history/client.js?rev=…"`）が含まれることを確認します。
2. `/plugins/dsh-composer-history/client.js` をリクエスト——`200`（`text/javascript`）を期待します。
3. 手動チェックリスト：
   - 空のコンポーザー：↑ で最後のメッセージをリコール；↑ の連打で古い方へ；↓↓ で最新へ；もう一度 ↓ で空に戻る。
   - 入力途中の下書き：↑ で退避＆リコール；↓↓ で末尾まで戻ると下書きが**カーソル位置ごと**復元；`Esc` は即時復元。
   - 複数行の下書き：中間行の ↑/↓ はカーソル移動のみ；リコールは先頭行／最終行からのみ発動。
   - `/xxx` エントリをリコールして Enter を押すと、コマンドが通常どおり裁定されます（想定どおり）。
   - スラッシュメニュー表示中は ↑/↓ がメニューのハイライトだけを動かします。
   - モデル生成中（phase が `plain` 以外）は矢印キーでリコールしません。
   - Shift+↑/↓ の選択、IME 変換、Ctrl+Z/Y のアンドゥ／リドゥはすべて影響を受けません。
   - `Ctrl+R` で検索パネルが開きます。入力で絞り込み、↑/↓ + Enter で確定、Esc で下書きは変更されません。
   - ページリロード後も、↑ でリロード前に送信したメッセージをリコールできます（`persistHistory` が有効な場合）。
   - `historyScope: 'workspace'` の場合、他の一覧表示されたセッションのエントリが現在のセッションの前に来ます。
4. ゲート：`pnpm run typecheck`、`pnpm run build`、`pnpm run test` がすべて成功——**ビルド済みバンドル**を jsdom 上で本物の `__ModuleLoader__` ハンドシェイク経由で実行するスモークテストを含みます。加えて `pnpm run test:coverage`、`pnpm run check:readmes`、`pnpm run verify:pack`。

## 🔬 互換性ベースライン（このマシンで実測、2026-08-14）

- **型**：devDependencies が npm から公開済みクライアントパッケージ **0.1.0-rc.6** を固定します（`dsh-client-runtime`、`dsh-client-ui-conversation`、`dsh-client-ui-input-trigger`、`dsh-client-ui-settings`、`dsh-settings`、`dsh-api-remotes`）。`typecheck` はもはやローカルチェックアウトに依存しません。実行時スモークテストは、クライアントパッケージ **0.1.0-rc.5**、`@deepseek-ai/cordis` **4.0.1**、`@deepseek-ai/schemastery` **3.18.1** のチェックアウトに対して実行されます。
- `InputState` のフェーズ（`packages/client/ui-conversation/src/client/input/contract.ts` を実読）：`'plain' | 'adjudicating' | 'claimed' | 'submitting'`、ほかに `draft`/`draftRev`。下書きの唯一の公開書き込み経路は `ctx.conversation.input.for(actx).setDraft(text)`。`editRange` 対応の `ComposerKeyboard` フェイスは InputBar 私有です（`docs/upstream-proposals.md` C1 参照）。
- **クライアントプラグインのメタデータはネストされた `dsh.client` フィールド**（`packages/client/modules` の `resolveMeta` が `pkg.dsh.client` を読む）：置き場所を間違えると、boot グラフから**無言で**パッケージが落ちます。エラーは出ません。
- **ベンダー化された cordis は `@deepseek-ai/cordis` に改名済み**：type-only でインポート。ビルド済み `lib/client.js` には cordis の実行時インポートがゼロです（`require(` 呼び出し自体が皆無）。
- **ブラウザの boot はプラグインに config を渡しません**（boot グラフは `{id, url, rev, inject, immediately}` のみ）：ブラウザ側はスキーマのデフォルト値で解決し、——新しい経路では——トランスポートの準備が整うと設定スコープがホスト解決済みセクション（cordis.yml の `base` + ユーザー上書き）を届けます。設定サービスが無い場合は、従来どおりスキーマのデフォルト値にフォールバックします。実測：`recallWithDraft: bogus` で起動全体が中断——`failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"`。
- **設定トランスポートは loopback 専用**：リモートのブラウザはホストドキュメントを読めません。そのスコープは memory/unavailable モードを報告し、プラグインはデフォルト値にフォールバックします（履歴ストアはどのみちブラウザローカルです）。
- **再起動前に再ビルド**：起動チェックは `lib/client.js` を読みます。未ビルドのパッケージは拒否され、ブラウザが取得するのは常にビルド成果物のみです。
- **公開シンボルのみ**：パッケージ横断の読み取りは `@deepseek-ai/dsh-client-*` の `/client` エントリが公開する型とサービスのみを使います。`inputTriggers` サービスインスタンスを `InputTriggerService` にアサートするのは承認されたコミュニティパターンです（本プラグインでは type-only インポート + `ctx.get('inputTriggers') as InputTriggerService | undefined` で実装し、理由をコメントしています）。
- クライアントバンドル契約：CJS ファクトリを `window.__ModuleLoader__.load({ id, factory })` でラップし、プラットフォームモジュール（react、cordis、slots など + `@deepseek-ai/dsh-client-runtime/client` の適用除外）は外部化、それ以外はインライン化。本プラグインは実行時に外部依存を必要としませんが、tsdown 設定は防御的にこのリストを宣言しています。
- プロファイルのファイルは**BOM なし UTF-8**でなければなりません（`readProfileManifest` が素の `JSON.parse` を実行します。実測で BOM により `Unexpected token '\uFEFF'` で起動失敗）。

## ⚠️ 既知の制限

- **論理行 vs 視覚行**：デフォルトの `logical` は `\n` 基準（長い自動折り返しメッセージは 1 行扱い）。`visual` は mirror による実測（隠しノード、エッジ判定ごとに O(行数·log n) の二分探索、下書き／幅ごとにメモ化）。mirror 測定自体は本物のレイアウトエンジンを必要とします——純粋な span 数学は代わりに単体テストされています（`tests/visual-mirror.spec.ts` 参照）。
- **永続化された履歴はブラウザごと**：ストアは 1 つのオリジンの `localStorage` にあります。ブラウザ間・マシン間で同期されることはありません。破損したペイロードは無言でリセットされます。
- **undo スタックにリコールトランザクションが入る**：充填／復元はそれぞれ入力マシンの undo ログにある 1 つの `setDraft` トランザクションです。Ctrl+Z でリコールを遡って戻せます。プラグインは undo/redo のセマンティクスを変更しません。精度の修正には上流の edit-range 公開が必要です（`docs/upstream-proposals.md` C1 参照）。
- `/xxx` エントリをリコールして Enter を押すと、通常のコマンド claim／裁定経路をたどります（想定どおり。Enter は決して横取りされません）。
- メニュー／ポップアップと非 `plain` フェーズが常に優先されます。送信確定による下書きクリア（プログラム的）とセッション切替はどちらも IDLE にリセットします。
- 参照チップ（U+FFFC プレースホルダー）はリコール／復元される下書きテキストにそのまま乗ります。
- `historyScope: 'workspace'` は他の一覧表示されたセッションのライブ assembly を読みます。assembly がまだ実体化していないセッションは、まだ何も寄与しません。
- 検索オーバーレイは素の DOM です（React 依存なし）。`maxHistory` の上限までのすべてのマッチを描画します。

## 🗺️ 上流への提案

`deepseek-ai/deepseek-harness` 向けの拡張ポイント提案 3 件が [`docs/upstream-proposals.md`](docs/upstream-proposals.md) にまとめられています：入力フェイスへの公開 edit-range 書き込み（C1）、トリガー検出の純粋関数の公開（C2）、文書化されたコンポーザーキーボード調停チェーン（C3）。

## 🏷️ トピックとエコシステム

本プロジェクトは DeepSeek Harness プラグインエコシステムの一部です。推奨 GitHub トピック（リポジトリ設定で設定します）：

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `typescript`

関連リンク：[github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 📄 License

[Apache License 2.0](./LICENSE)

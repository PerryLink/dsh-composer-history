# ⌨️ dsh-composer-history

**DeepSeek Harness の Web GUI コンポーザーに、ターミナル流の入力履歴リコールを。**

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md)

<p align="center">
  <a href="https://github.com/topics/dsh"><img alt="topic: dsh" src="https://img.shields.io/badge/topic-dsh-8A2BE2"></a>
  <a href="https://github.com/topics/dsh-plugin"><img alt="topic: dsh-plugin" src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2"></a>
  <a href="https://github.com/topics/deepseek-harness"><img alt="topic: deepseek-harness" src="https://img.shields.io/badge/topic-deepseek--harness-8A2BE2"></a>
  <br>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <a href="./package.json"><img alt="version" src="https://img.shields.io/badge/version-0.1.0-66ccff"></a>
  <a href="./package.json"><img alt="node" src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933"></a>
  <img alt="tests" src="https://img.shields.io/badge/tests-94%2F94-brightgreen">
  <img alt="harness client" src="https://img.shields.io/badge/harness%20client-0.1.0--rc.5-orange">
</p>

ターミナルと同じ感覚で **↑** を押して履歴を呼び戻す——でも、入力途中の下書きは常に安全です。`dsh-composer-history` は Claude Code の「カーソル優先のエッジリコール」キーモデルを dsh の Web コンポーザーに持ち込み、さらに一歩先へ：最新エントリまで戻る（または `Esc` を押す）と、退避した下書きとカーソル位置が**正確に復元**されます。クリアされません。

> 純粋な UI 動作です：セッションイベントの追加、agent-loop の変更、モデルへのリクエストは一切ありません。リコールされたテキストは通常の下書きに入るだけで、モデルに届くのはあなたが Enter を押したときだけです。

## ✨ ハイライト

- 🎯 **エッジ優先の矢印キー** —— 素の ↑/↓ はまずカーソルを動かします。履歴リコールは、カーソルが下書きの先頭行／最終行に達したときだけ発動します。
- 💾 **下書きの退避** —— 最初のリコールで `{draft, caret}` を退避。最新エントリに戻る（または `Esc`）と両方を正確に復元。Claude Code がここでクリアするところを、本プラグインは復元します。
- 🛡️ **分岐ガード** —— リコールしたエントリを編集すると即座にブラウズ終了。編集内容が新しい下書きになります。
- 🔄 **ライブ履歴** —— キー入力のたびにセッションスナップショットから再抽出：`kind === 'user'` のメッセージ、テキストブロックを連結、空白をスキップ、隣接重複をマージ、最新が末尾。送信した新しいメッセージも自動的に入ります。
- 🚦 **完全なゲーティング** —— `plain` フェーズのみ横取り。スラッシュメニュー・コマンドポップアップ・IME 変換中・テキスト選択・alt/meta/shift コンビネーションにはすべて譲ります。パススルー経路は副作用ゼロ。
- 📐 **2 種類のエッジ判定** —— `logical`（改行ベース、デフォルト）または `visual`（隠し mirror div が実際の折り返し行を測定）。

## 🎬 使用イメージ

```text
$ 入力途中で ↑ を押す
        └─ 下書きを退避し、最新の履歴エントリがコンポーザーに入る
$ ↑ ↑ … 古いエントリへ移動     $ ↓ ↓ … 最新へ戻る
        └─ 最古で hold（無操作で横取り）   └─ もう一度 ↓：下書きが戻る、
                                              カーソルも元の位置のまま
$ いつでも Esc → 即座に復元してブラウズ終了
```

## 🚀 クイックスタート

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # すべて成功：94/94
```

プロファイルに登録して（[インストール](#インストール)参照）、`dsh --profile <プロファイル名> --port 3080` で起動します。

## 📦 インストール

**必ず先に build してから起動**してください——未ビルドのバンドルはクライアントパッケージ検証が拒否します。

1. プラグインをビルドします（上記）。
2. `$DSH_HOME/profiles/<プロファイル名>/cordis.patch.yml` に行を登録します。行の `name` は**裸のパッケージ名**にしてください：ブラウザ側グラフの行 id はこの文字列そのもので、クライアントバンドルもビルド時に同じ id を埋め込みます。

   ```yaml
   # バンドルレイヤの後に追記
   - insert:
       - id: composer-history
         name: dsh-composer-history
         config:
           recallWithDraft: save     # 'save' | 'gate'
           restoreOnEscape: true
           edgeMode: logical         # 'logical' | 'visual'
           enableCtrlAlias: true
           restoreCaret: true
   ```

3. 裸の行はプロファイルのリゾルバーマニフェストにも必要です——ホスト Loader はプロファイルディレクトリの `node_modules` から解決します：

   `$DSH_HOME/profiles/<プロファイル名>/package.json`：

   ```json
   {
     "name": "dsh-profile-<プロファイル名>",
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
   dsh --profile <プロファイル名> --port 3080
   ```

## ⚙️ Config

調整可能なパラメータはすべて Schemastery の `Config` スキーマにあります（ハードコードされたツマミはありません）。不正な列挙値は**dsh の起動全体を大きなエラーで失敗させます**——ホスト Loader が同じスキーマで cordis.yml の `config:` ブロックを検証します。

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`：空でない下書きは退避してからリコール；`gate`：空の下書きのみリコール（Claude/Codex 流ゲーティング） |
| `restoreOnEscape` | `boolean` | `true` | ブラウズ中に Esc で退避した下書きを復元 |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | エッジ判定を `\n` 論理行で行うか、mirror 実測の折り返し行で行うか |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ を素の矢印キーと同じ扱いにする |
| `restoreCaret` | `boolean` | `true` | 末尾到達／Esc 復元時に退避したカーソル位置も復元 |

## 🎹 キーバインド

| キー | 状態 | 動作 |
| --- | --- | --- |
| ↑ | IDLE、カーソルが先頭行 | {下書き, カーソル} を退避し、最新エントリを入力、カーソルを末尾へ（履歴なしならパス） |
| ↑ | BROWSING、カーソルが先頭行 | 一つ古いエントリへ；最古では hold（横取りするが変更なし） |
| ↑ | カーソルが先頭行でない | 完全に解放（ブラウザがカーソルを移動） |
| ↓ | IDLE | 常に解放（通常のカーソル移動） |
| ↓ | BROWSING、カーソルが最終行 | 一つ新しいエントリへ；最新で → `savedDraft` + `savedCaret` を復元 → IDLE |
| ↓ | カーソルが最終行でない | 完全に解放 |
| Esc | BROWSING（`restoreOnEscape: true`） | `savedDraft` + `savedCaret` を復元 → IDLE、横取り |
| Esc | それ以外 | 解放（メニュー／ポップアップの Esc セマンティクスは不変） |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | 素の矢印キーと同義 |
| Shift/Alt/Meta+矢印、IME、選択あり | 任意 | 常に解放 |

## ✅ 検証

1. Web UI を開き、`window.__DSH_BOOT__` に本プラグインの行（`id: "dsh-composer-history"`、`url: "/plugins/dsh-composer-history/client.js?rev=…"`）が含まれることを確認します。
2. `/plugins/dsh-composer-history/client.js` をリクエスト——`200`（`text/javascript`）を期待します。
3. 手動チェックリスト：
   - 空のコンポーザー：↑ で最後のメッセージをリコール；連打で古い方へ；↓↓ で最新へ；もう一度 ↓ で空に戻る。
   - 入力途中の下書き：↑ で退避＆リコール；↓↓ で末尾まで戻ると下書きが**カーソル位置ごと**復元；Esc は即時復元。
   - 複数行の下書き：中間行の ↑/↓ はカーソル移動のみ；先頭行／最終行でのみリコールが発動。
   - `/xxx` エントリをリコールして Enter → コマンドが通常どおり裁定・実行される（想定どおり）。
   - スラッシュメニュー表示中は ↑/↓ がメニューのハイライトだけを動かす。
   - モデル生成中（phase が `plain` 以外）は矢印キーでリコールしない。
   - Shift+↑/↓ の選択、IME 変換、Ctrl+Z/Y のアンドゥ／リドゥはすべて影響なし。
4. ゲート：`pnpm run typecheck`、`pnpm run build`、`pnpm run test` がすべて成功——**ビルド済みバンドル**を jsdom 上で本物の `__ModuleLoader__` ハンドシェイク経由で実行するスモークテストを含みます。

## 🔬 互換性ベースライン（このマシンで実測、2026-08-13）

- ベースライン：ローカルチェックアウト `D:\deepseek-harness`（client パッケージの `lib/types` は 2026-08-13 ビルド）；client パッケージ **0.1.0-rc.5**（npm 最新は 0.1.0-rc.6、rc.5 は未公開）；`@deepseek-ai/cordis` **4.0.1**；`@deepseek-ai/schemastery` **3.18.1**。
- `InputState` のフェーズ（`packages/client/ui-conversation/src/client/input/contract.ts` を実読）：`'plain' | 'adjudicating' | 'claimed' | 'submitting'`、ほかに `draft`/`draftRev`。下書きの唯一の書き込み経路は `ctx.conversation.input.for(actx).setDraft(text)`。
- **クライアントプラグインのメタデータはネストされた `dsh.client` フィールド**（`packages/client/modules` の `resolveMeta` が `pkg.dsh.client` を読む）：置き場所を間違えると boot グラフから**無言で**落ちます。エラーは出ません。
- **ベンダー化された cordis は `@deepseek-ai/cordis` に改名済み**：type-only でインポート。実測で `lib/client.js` に cordis の実行時インポートはゼロ（`require(` 呼び出し自体が皆無）。
- **ブラウザの boot はプラグインに config を渡しません**（boot グラフは `{id, url, rev, inject, immediately}` のみ）：ブラウザ側はスキーマのデフォルト値で解決し、cordis.yml の `config:` はホスト Loader が同じスキーマで検証します。実測：`recallWithDraft: bogus` で起動全体が中断——`failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"`。
- **ソース変更後は再ビルドしてから再起動**：起動検証は `lib/client.js` を読み、未ビルドなら拒否。ブラウザが取得するのも常にビルド成果物です。
- **公開シンボルのみ使用**：パッケージ横断の読み取りは `@deepseek-ai/dsh-client-*` の `/client` エントリが公開する型とサービスのみ。`inputTriggers` サービスを `InputTriggerService` にアサートするのはコミュニティの定石です（本プラグインでは type-only インポート + `ctx.get('inputTriggers') as InputTriggerService | undefined` で実装し、理由をコメントしています）。
- クライアントバンドル契約：CJS ファクトリを `window.__ModuleLoader__.load({ id, factory })` でラップし、プラットフォームモジュール（react、cordis、slots など + `@deepseek-ai/dsh-client-runtime/client` の適用除外）は外部化、それ以外はインライン化。本プラグインは実行時に外部依存ゼロですが、tsdown 設定は防御的にこのリストを宣言しています。
- 外部プラグインの型チェック：npm に rc.5 がないため、tsconfig の `paths` でローカルチェックアウトの `packages/client/*/lib/types/client/index.d.ts` を指し + `skipLibCheck`。チェックアウト更新後は typecheck を再実行してください。
- プロファイルのファイルは**BOM なし UTF-8**で（`readProfileManifest` が素の `JSON.parse` を実行；実測で BOM により `Unexpected token '\uFEFF'` で起動失敗）。

## ⚠️ 既知の制限

- **論理行 vs 視覚行**：デフォルトの `logical` は `\n` 基準（長い自動折り返しメッセージは 1 行扱い）；`visual` は mirror による実測（隠しノード、エッジ判定ごとに O(行数·log n) の二分探索）。
- **セッション内のみ**：v1 は現在のセッションの投影ウィンドウのみ対象。セッション横断・ディスク永続化はなし。履歴はページ更新後も残ります（セッションログからの投影）が、ブラウズ状態は残りません。
- **undo スタックにリコールトランザクションが入る**：充填／復元はそれぞれ入力マシンの `setDraft` トランザクション（undo ログ）になり、Ctrl+Z で段階的に戻せます。プラグインは undo/redo のセマンティクスを変更しません。
- `/xxx` エントリをリコールして Enter → 通常のコマンド claim／裁定経路（想定どおり。Enter は決して横取りしません）。
- メニュー／ポップアップと非 `plain` フェーズが常に優先。送信確定による下書きクリア（プログラム的）とセッション切替はどちらも IDLE に戻ります。
- `visual` の mirror 測定は jsdom では単体テスト不可（レイアウトエンジンなし）。純粋な span 数学はテスト済みです。
- 参照チップ（U+FFFC プレースホルダー）はリコール／復元される下書きテキストにそのまま乗ります。

## 🏷️ トピックとエコシステム

本プロジェクトは DeepSeek Harness プラグインエコシステムの一部です。推奨 GitHub トピック（リポジトリ設定で設定）：

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `typescript`

関連リンク：[github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 📄 License

[Apache License 2.0](./LICENSE)

# ⌨️ dsh-composer-history

**Terminal-style input history for the DeepSeek Harness Web GUI composer.**

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

Press **↑** like you're in a terminal — but keep your half-typed prompt safe. `dsh-composer-history` brings Claude Code's edge-first arrow-key model to the dsh web composer, and goes one step further: when you walk back to the newest entry (or hit `Esc`), your stashed draft and caret position are **restored exactly** — not cleared.

> Pure UI behavior: no session events, no agent-loop changes, no model requests. Recalled text only enters the ordinary composer draft; it reaches the model only if *you* press Enter.

## ✨ Highlights

- 🎯 **Edge-first arrows** — bare ↑/↓ move the caret first. History recall only triggers when the caret hits the first/last line of the draft.
- 💾 **Draft stashing** — the first recall stashes `{draft, caret}`; reaching the newest entry again (or `Esc`) restores both precisely. Claude Code clears here — we restore.
- 🛡️ **Divergence guard** — edit a recalled entry and browsing ends instantly; your edit becomes the new draft.
- 🔄 **Live history** — re-extracted from the session snapshot on every keypress: `kind === 'user'` messages, text blocks joined, blanks skipped, adjacent duplicates merged, newest last. Newly sent messages join automatically.
- 🚦 **Full gating** — intercepts only in the `plain` input phase; yields to the slash menu, command popups, IME composition, text selections, and alt/meta/shift combos. Pass-through paths have zero side effects.
- 📐 **Two edge modes** — `logical` (newline-based, default) or `visual` (a hidden mirror div measures real wrapped lines).

## 🎬 How it feels

```text
$ you type a half-finished prompt and press ↑
        └─ draft is stashed, newest history entry fills the composer
$ ↑ ↑ … walk to older entries        $ ↓ ↓ … walk back to the newest
        └─ at the oldest: hold (no-op)         └─ one more ↓: your draft is back,
                                                  caret exactly where it was
$ press Esc at any time → instant restore, browsing ends
```

## 🚀 Quick start

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # all green: 94/94
```

Then register it in a profile (see [Installation](#installation)) and launch `dsh --profile <your-profile> --port 3080`.

## 📦 Installation

Build **before** launching — the client-package check refuses to boot against an unbuilt bundle.

1. Build the plugin (above).
2. Register the row in `$DSH_HOME/profiles/<your-profile>/cordis.patch.yml`. Use the **bare package name** as the row `name`: the browser graph row id *is* that string, and the client bundle stamps the same id at build time.

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
   ```

3. Bare rows must also appear in the profile's resolver manifest — the host Loader resolves them from the profile directory's `node_modules`:

   `$DSH_HOME/profiles/<your-profile>/package.json`:

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

4. `pnpm install` inside the profile directory, then:

   ```sh
   dsh --profile <your-profile> --port 3080
   ```

## ⚙️ Config

Every tunable lives in a Schemastery `Config` schema (no hardcoded knobs). Invalid enum values **fail the whole dsh boot loudly** — the host Loader validates your cordis.yml block against the same schema.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`: a non-empty draft is stashed before recall; `gate`: only an empty draft recalls (Claude/Codex-style gating) |
| `restoreOnEscape` | `boolean` | `true` | `Esc` while browsing restores the stashed draft |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | edge detection by `\n` lines or by measured wrapped lines |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ behaves like the bare arrows |
| `restoreCaret` | `boolean` | `true` | bottom-out / `Esc` also restores the stashed caret |

## 🎹 Keybindings

| Key | State | Behavior |
| --- | --- | --- |
| ↑ | IDLE, caret on first line | stash {draft, caret}, fill newest entry, caret to end (no history → pass) |
| ↑ | BROWSING, caret on first line | older entry; hold at the oldest (intercept, no mutation) |
| ↑ | caret not on first line | fully released (browser moves the caret) |
| ↓ | IDLE | always released (plain caret movement) |
| ↓ | BROWSING, caret on last line | newer entry; at newest → restore `savedDraft` + `savedCaret` → IDLE |
| ↓ | caret not on last line | fully released |
| Esc | BROWSING (`restoreOnEscape: true`) | restore `savedDraft` + `savedCaret` → IDLE, intercepted |
| Esc | otherwise | released (menu/popup Escape semantics untouched) |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | same as bare arrows |
| Shift/Alt/Meta+arrows, IME, selection | any | always released |

## ✅ Verification

1. Open the web UI and confirm `window.__DSH_BOOT__` contains this plugin's row (`id: "dsh-composer-history"`, `url: "/plugins/dsh-composer-history/client.js?rev=…"`).
2. Request `/plugins/dsh-composer-history/client.js` — expect `200` (`text/javascript`).
3. Manual checklist:
   - Empty composer: ↑ recalls the last message; more ↑ walks older; ↓↓ back to newest; one more ↓ returns to empty.
   - Half-typed draft: ↑ stashes and recalls; ↓↓ to the bottom restores the draft **including caret**; `Esc` restores instantly.
   - Multiline draft: mid-line ↑/↓ only move the caret; recall triggers only from the first/last line.
   - Recalling a `/xxx` entry then pressing Enter adjudicates the command normally (expected).
   - With the slash menu open, ↑/↓ highlight menu items only.
   - During model generation (phase ≠ `plain`) arrows never recall.
   - Shift+↑/↓ selection, IME composition, Ctrl+Z/Y undo/redo are all unaffected.
4. Gates: `pnpm run typecheck`, `pnpm run build`, `pnpm run test` — all green, including a smoke test that executes the **built bundle** in jsdom through the real `__ModuleLoader__` handshake.

## 🔬 Compatibility baseline (measured on this machine, 2026-08-13)

- Baseline: local checkout `D:\deepseek-harness` (client package `lib/types` built 2026-08-13); client packages **0.1.0-rc.5** (npm's latest is 0.1.0-rc.6 — rc.5 is not published); `@deepseek-ai/cordis` **4.0.1**; `@deepseek-ai/schemastery` **3.18.1**.
- `InputState` phases (read from `packages/client/ui-conversation/src/client/input/contract.ts`): `'plain' | 'adjudicating' | 'claimed' | 'submitting'`, plus `draft`/`draftRev`. The single draft write path is `ctx.conversation.input.for(actx).setDraft(text)`.
- **Client plugin metadata is the nested `dsh.client` field** (`packages/client/modules` `resolveMeta` reads `pkg.dsh.client`): putting it in the wrong place silently drops the package from the boot graph — no error.
- **Vendored cordis is renamed `@deepseek-ai/cordis`**: type-only imports from it; the built `lib/client.js` has zero runtime cordis imports (no `require(` calls at all).
- **The browser boot passes no config to plugins** (the boot graph carries `{id, url, rev, inject, immediately}`): the browser half resolves the schema defaults; a cordis.yml `config:` block is validated by the host Loader against the same schema. Measured: `recallWithDraft: bogus` aborts the whole boot with `failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"`.
- **Rebuild before relaunching**: the startup check reads `lib/client.js`; unbuilt packages are rejected, and the browser only ever fetches build artifacts.
- **Exported symbols only**: cross-package reads use types/services exported from `@deepseek-ai/dsh-client-*` `/client` entries; asserting the `inputTriggers` service instance to `InputTriggerService` is the sanctioned community pattern (done here as a type-only import + `ctx.get('inputTriggers') as InputTriggerService | undefined`, with a comment explaining why).
- Client bundle contract: a CJS factory wrapped in `window.__ModuleLoader__.load({ id, factory })`, platform modules (react, cordis, slots, … plus the `@deepseek-ai/dsh-client-runtime/client` exemption) external, everything else inlined. This plugin needs no runtime externals; the tsdown config declares the list defensively.
- External-plugin typechecking: rc.5 isn't on npm, so tsconfig `paths` point at the local checkout's `packages/client/*/lib/types/client/index.d.ts` with `skipLibCheck`. Re-run typecheck after updating the checkout.
- Profile files must be **UTF-8 without BOM** (`readProfileManifest` runs plain `JSON.parse`; a BOM aborts boot with `Unexpected token '\uFEFF'` — measured).

## ⚠️ Known limitations

- **Logical vs visual lines**: default `logical` keys off `\n` (a long auto-wrapped message counts as one line); `visual` measures real wraps via the mirror (a hidden node, O(lines·log n) binary search per edge check).
- **Session-scoped only**: v1 recalls from the current session's projected window only — no cross-session or on-disk history. History survives a page refresh (it's projected from the session log); browsing state does not.
- **Undo stack includes recall transactions**: every fill/restore is one `setDraft` transaction in the input machine's undo log; Ctrl+Z can step back through recalls. The plugin never modifies undo/redo semantics.
- Recalling a `/xxx` entry then Enter follows the normal command claim/adjudication path (expected, and Enter is never intercepted).
- Menus/popups and non-`plain` phases always win; a committed send (programmatic draft clear) and session switches both reset to IDLE.
- The `visual` mirror measurement can't be unit-tested under jsdom (no layout engine); the pure span math is tested instead.
- Reference chips (U+FFFC placeholders) ride along with recalled/restored draft text.

## 🏷️ Topics & ecosystem

This project is part of the DeepSeek Harness plugin ecosystem. Suggested GitHub topics (set them in the repository settings):

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `typescript`

Useful links: [github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 📄 License

[Apache License 2.0](./LICENSE)

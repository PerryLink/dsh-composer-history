# ⌨️ dsh-composer-history

**Terminal-style input history for the DeepSeek Harness Web GUI composer.**

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md)

<p align="center">
  <a href="https://github.com/topics/dsh"><img alt="topic: dsh" src="https://img.shields.io/badge/topic-dsh-8A2BE2"></a>
  <a href="https://github.com/topics/dsh-plugin"><img alt="topic: dsh-plugin" src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2"></a>
  <a href="https://github.com/topics/deepseek-harness"><img alt="topic: deepseek-harness" src="https://img.shields.io/badge/topic-deepseek--harness-8A2BE2"></a>
  <br>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <a href="https://www.npmjs.com/package/dsh-composer-history"><img alt="npm version" src="https://img.shields.io/npm/v/dsh-composer-history"></a>
  <a href="https://www.npmjs.com/package/dsh-composer-history"><img alt="npm downloads" src="https://img.shields.io/npm/dm/dsh-composer-history"></a>
  <a href="https://github.com/PerryLink/dsh-composer-history/actions/workflows/ci.yml"><img alt="ci" src="https://github.com/PerryLink/dsh-composer-history/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./package.json"><img alt="node" src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933"></a>
  <img alt="tests" src="https://img.shields.io/badge/tests-217%2F217-brightgreen">
  <img alt="harness client" src="https://img.shields.io/badge/harness%20client-types%20rc.6-orange">
</p>

Press **↑** like you're in a terminal — but keep your half-typed prompt safe. `dsh-composer-history` brings Claude Code's edge-first arrow-key model to the dsh web composer, and goes one step further: when you walk back to the newest entry (or hit `Esc`), your stashed draft and caret position are **restored exactly** — not cleared. On top of that: sent messages are **persisted browser-locally** so history survives reloads and reaches across sessions, `Ctrl+R` opens a **reverse search**, and every key and tunable is configurable. And when the harness's **sliding context** compacts a long conversation (the same auto-compact workflow as Claude Code and Codex), the plugin keeps that history usable: checkpoint summaries join recall and search, and a transient notice announces each compaction with a one-click `/compact` fill.

> Pure UI behavior: no session events, no agent-loop changes, no model requests. Recalled text only enters the ordinary composer draft; it reaches the model only if *you* press Enter. The persisted history is browser-local text (see [Privacy](#privacy)).

## ✨ Highlights

- 🎯 **Edge-first arrows** — bare ↑/↓ move the caret first. History recall only triggers when the caret hits the first/last line of the draft.
- 💾 **Draft stashing** — the first recall stashes `{draft, caret}`; reaching the newest entry again (or `Esc`) restores both precisely. Claude Code clears here — we restore.
- 🛡️ **Divergence guard** — edit a recalled entry and browsing ends instantly; your edit becomes the new draft.
- 🔄 **Live history** — re-extracted from the session snapshot on every keypress: `kind === 'user'` messages, text blocks joined, blanks skipped, adjacent duplicates merged, newest last. Newly sent messages join automatically.
- 💿 **Persisted history** — every sent message is appended to a bounded browser-local store (`dsh.composer-history.v1`), so recall works after a page reload and across sessions. Opt out with `persistHistory: false`.
- 🗂️ **Workspace scope** — `historyScope: 'workspace'` prepends other listed sessions' messages before the current session's.
- 🔍 **Reverse search** — `Ctrl+R` (configurable) opens a query panel under the composer: type to filter, ↑/↓ to pick, Enter to fill, Esc to cancel.
- 🎛️ **Every key is configurable** — `upKey`/`downKey`/`escapeKey`/`searchKeys` live in the Config schema, not in code.
- 🧭 **Sliding-context aware** — when the harness auto-compacts (Claude Code / Codex-style), checkpoint summaries join ↑ recall and `Ctrl+R` search as `[compacted] …` entries, and a transient notice (with a one-click "Fill `/compact`" action) announces each compaction. See [Sliding context](#-sliding-context).
- 📚 **Cross-session snippet library** — `/save <name>` turns the current input into a named, tagged snippet (workspace-scoped); `/load <name>` (or a `Ctrl+R` pick) inserts it. The library persists browser-locally and shares the search panel with history.
- 🧩 **Prompt templates with variables** — a template library with `{{workspace}}` / `{{session}}` / `{{draft}}` placeholders filled at insertion; the library exports/imports as JSON on an explicit click only.
- 🔁 **Reuse insights** — browser-local statistics count how often a prompt was used across sessions; a small hint under the composer reports "used M× in N sessions". Nothing is ever uploaded.
- 🏷️ **Compaction summary highlight** — `[compacted] …` summaries badge amber in the search panel, visually distinct from history, snippets (green) and templates (purple).
- ⚙️ **Settings integration** — the host half registers the `composer-history` settings namespace (cordis.yml config becomes the composition `base`); user overrides from the settings document reach the browser. Without a settings service the plugin keeps working exactly as composed.
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
$ press Ctrl+R → type a fragment → ↑/↓ → Enter → the match fills the composer
```

## 🚀 Quick start

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # all green: 234/234
pnpm run test:coverage                                  # per-module coverage report
pnpm run check:readmes && pnpm run verify:pack          # doc consistency + pack surface
```

Then register it in a profile (see [Installation](#installation)) and launch `dsh --profile <your-profile> --port 3080`.

## 📦 Installation

Build **before** launching — the client-package check refuses to boot against an unbuilt bundle.

> From npm: `pnpm add dsh-composer-history` (or npm/yarn) ships the built bundles — skip steps 1 and 5. The package also declares a `dsh.bundle` manifest (root `cordis.patch.yml`), so `dsh plugin add`-style installers can register the row automatically.

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
           includeCompactionSummaries: true   # summaries join recall/search
           showCompactionNotice: true         # transient notice on compaction
           compactCommandText: /compact       # filled by "Compact now"; '' hides it
   ```

   The `config:` block is validated by the host Loader against the same schema, and (when the settings service is present) flows into the browser as the settings `base` layer — so these values actually reach the browser half, not just the validator.

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

5. For a tarball install (any package manager): `pnpm pack` in this directory, then reference the tarball in the profile's `package.json`. `pnpm run verify:pack` checks the pack surface before you ship it.

## ⚙️ Config

Every tunable lives in a Schemastery `Config` schema (no hardcoded knobs). Invalid enum values **fail the whole dsh boot loudly** — the host Loader validates your cordis.yml block against the same schema, and the settings section is re-validated in the browser before use.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`: a non-empty draft is stashed before recall; `gate`: only an empty draft recalls (Claude/Codex-style gating) |
| `restoreOnEscape` | `boolean` | `true` | `Esc` while browsing restores the stashed draft |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | edge detection by `\n` lines or by measured wrapped lines |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ behaves like the bare arrows |
| `restoreCaret` | `boolean` | `true` | bottom-out / `Esc` also restores the stashed caret |
| `upKey` | `string` | `'ArrowUp'` | `KeyboardEvent.key` that recalls upward; `''` disables |
| `downKey` | `string` | `'ArrowDown'` | `KeyboardEvent.key` that walks newer / restores; `''` disables |
| `escapeKey` | `string` | `'Escape'` | `KeyboardEvent.key` that escapes browsing; `''` disables |
| `maxHistory` | `number` | `500` | maximum recalled entries (newest kept); `0` = unlimited |
| `includeKinds` | `string[]` | `['user']` | conversation node kinds admitted into the history (add `'steering'` to include steer messages) |
| `historyScope` | `'session' \| 'workspace'` | `'session'` | `'workspace'` prepends other listed sessions' user messages before the current session's |
| `persistHistory` | `boolean` | `true` | append sent messages to the browser-local store (see [Privacy](#privacy)) |
| `maxPersisted` | `number` | `200` | maximum stored entries; `0` = unlimited |
| `enableSearch` | `boolean` | `true` | enable the `Ctrl+R` reverse-search overlay |
| `searchKeys` | `string[]` | `['Ctrl+R']` | chord specs opening the search (modifiers `Ctrl`/`Alt`/`Meta`/`Shift` + a key name); a malformed spec fails the browser fiber loudly |
| `searchCaseSensitive` | `boolean` | `false` | whether search matching distinguishes letter case |
| `includeCompactionSummaries` | `boolean` | `true` | admit `[compacted] …` checkpoint summaries into recall and search |
| `showCompactionNotice` | `boolean` | `true` | show a transient notice when a compaction checkpoint lands |
| `compactCommandText` | `string` | `'/compact'` | slash command the notice's "Compact now" action fills into the composer; `''` hides the action |
| `enableSnippets` | `boolean` | `true` | enable the snippet library (`/save`, `/load`, search-panel picking) |
| `maxSnippets` | `number` | `200` | maximum stored snippets; `0` = unlimited |
| `enableTemplates` | `boolean` | `true` | enable the prompt-template library (variables fill at insertion) |
| `enableInsights` | `boolean` | `true` | enable the reuse-insight hint (local usage statistics) |
| `insightMinUses` | `number` | `2` | minimum uses before the reuse hint shows |
| `enableCompactionHighlight` | `boolean` | `true` | badge `[compacted] …` summaries distinctly in the search panel |

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
| `searchKeys` chord | composer focused, `plain` phase, no menu/selection/IME | open reverse search; browsing ends, the shown text becomes the draft |
| Shift/Alt/Meta+arrows, IME, selection | any | always released |

`upKey`/`downKey`/`escapeKey`/`searchKeys` rename the keys above; the modifier policy (and the search chord's exact-modifier match) is unchanged. Inside the search overlay: ↑/↓ move the match selection (the selected row scrolls into view), Enter fills, Esc cancels, a click picks, a press outside cancels; matched substrings are highlighted in every row.

## 🔍 Reverse search

- **Open**: the `searchKeys` chord while the composer is focused and the input is `plain` (a `Ctrl+R` here also stops the browser's page reload — the key is consumed only inside the composer).
- **Filter**: substring match over the merged history (current session + persisted + workspace entries); case sensitivity per `searchCaseSensitive`; matched substrings are highlighted in each row.
- **Pick**: Enter fills the draft and moves the caret to the end — the same single `setDraft` write path as ordinary recall. Recalled text reaches the model only if you press Enter afterwards.
- **Cancel**: Esc or a press outside the panel; the draft is untouched.

## 🧭 Sliding context

The harness core gives every dsh session a sliding context window, the same workflow Claude Code and Codex ship: when a conversation approaches the model's context limit (or the provider reports an overflow), the harness **auto-compacts** — older turns are summarized behind a `compaction` checkpoint marker that stays visible in the transcript, the model keeps only the summary plus the recent tail, and the session continues. `/compact` triggers the same compaction on demand, and the marker renders as an expandable "Context compacted" row.

`dsh-composer-history` plugs the composer into that workflow so the window slide never costs you your typing history:

- **Recall survives compaction** — shadowed turns stay in the session snapshot, so ↑ still walks every message you sent before and after a checkpoint.
- **Summaries join the history** — each checkpoint's summary text enters ↑ recall and `Ctrl+R` search as a `[compacted] …` entry (toggle: `includeCompactionSummaries`), so context the model no longer sees verbatim stays one keystroke away.
- **Compaction notice** — when a checkpoint lands while the page is open, a transient snackbar announces it (the Claude Code "Auto-compacting conversation…" moment) with the summary snippet and a one-click **Fill `/compact`** action (`showCompactionNotice`, `compactCommandText`); the fill lands in the ordinary draft, and only your Enter sends it.
- **Search counts** — the `Ctrl+R` panel now shows a live `N entries` / `N matches` status line, and long entries are clamped to two lines.

> Compaction itself (thresholds, summary model, `/compact`) is owned by the harness core's compaction plugins — this plugin only observes the checkpoint markers the client snapshot already exposes, so it works without any agent-loop or model-request changes.

## 🧠 Smart input layer

On top of the terminal-style history, three browser-local libraries turn the composer into a reusable input surface. Everything below lives in `localStorage` (keys `dsh.composer-history.snippets.v1`, `.templates.v1`, `.insights.v1`), never touches the network, and every switch is a Config field.

**Snippets (cross-session command library)**

```text
/save ship-check --tag=release,ops
check the build, run the smoke suite, tag the release        ← the rest of the draft is the snippet
/save ship-check                                             → "snippet saved: ship-check"
/load ship-check                                             → the snippet fills the composer
Ctrl+R → search panel lists snippets (green badge = name) alongside history
```

- `/save <name>` consumes the Enter, stores the draft (minus the command line) under a kebab-case name with optional tags, and clears the composer. Nothing to save → an error notice, the command never sends.
- `/load <name>` inserts the snippet at the caret (whole-draft replace, caret to end) and counts the use.
- Scope: snippets saved with a workspace cwd are workspace-scoped; snippets saved without one are global. `maxSnippets` bounds the library; same-name saves replace.
- The plugin never sends: every fill lands in the ordinary draft and your Enter stays yours.

**Prompt templates with variables**

Templates are stored prompt texts with `{{variable}}` placeholders. The search panel lists them with a purple badge; picking one fills the variables from the live session and inserts the result. Built-in variables: `{{workspace}}` (the session's cwd), `{{session}}` (the session id), `{{draft}}` (the current draft). A template referencing an unknown variable fails loudly with the missing list — a half-filled prompt is worse than an error.

The template library exports to and imports from a JSON document (`composer-templates-v1`) through the panel's **Export templates / Import templates** buttons — an explicit user action; the plugin never writes files on its own.

**Reuse insights**

Every newly committed user message (and every snippet load) lands one browser-local usage record keyed by exact text. While you type, a small hint under the composer reports `used M× in N sessions · 在 N 个会话里用过 M 次` once the draft matches a prompt used in at least `insightMinUses` (default 2) sessions. Toggle with `enableInsights`; the statistics contain only the deduped texts and counters.

**Compaction summary highlight**

`Ctrl+R` marks `[compacted] …` summaries with an amber badge (history stays unbadged), snippets green, templates purple — the panel's provenance is visible at a glance. Toggle with `enableCompactionHighlight`.

## 🔒 Privacy

`persistHistory: true` (default) writes sent messages to this browser's `localStorage` under `dsh.composer-history.v1`, bounded by `maxPersisted`, never uploaded anywhere, and readable only by pages of the same origin. Disable it with `persistHistory: false` — recall then uses only the live session projection (and workspace scope), like the v1 behavior. Corrupt or foreign payloads are silently reset. To erase everything already stored, run `localStorage.removeItem('dsh.composer-history.v1')` in the page's devtools console.

The smart-input libraries add three more keys under the same policy (browser-local, never uploaded, corrupt payloads reset): `dsh.composer-history.snippets.v1` (snippet texts + tags + use counters), `dsh.composer-history.templates.v1` (template texts), `dsh.composer-history.insights.v1` (deduped prompt texts + per-session use counters). Remove any of them the same way to wipe that library.

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
   - `Ctrl+R` opens the search panel; typing filters; ↑/↓ + Enter fills; Esc leaves the draft untouched.
   - After a page reload, ↑ recalls messages sent before the reload (with `persistHistory` on).
   - With `historyScope: 'workspace'`, entries from other listed sessions precede the current session's.
   - After a compaction lands (auto or `/compact`), ↑ walks into the `[compacted] …` summary entry; `Ctrl+R` finds it by its text and badges it amber.
   - A compaction notice appears near the bottom, auto-dismisses, and its button fills `/compact` into the composer.
    - /save ship-check followed by more lines saves the rest as a snippet; /load ship-check fills it back; Ctrl+R lists it with a green badge.
    - A template pick fills {{workspace}}/{{session}}/{{draft}}; an unknown variable shows an error notice naming the missing ones.
    - Typing a prompt used before shows the reuse hint under the composer; enableInsights: false hides it.
    - Template Export downloads a JSON document; Import accepts it back and reports the count (invalid documents fail loudly).
4. Gates: `pnpm run typecheck`, `pnpm run build`, `pnpm run test` — all green, including a smoke test that executes the **built bundle** in jsdom through the real `__ModuleLoader__` handshake; plus `pnpm run test:coverage`, `pnpm run check:readmes`, `pnpm run verify:pack`.

## 🔬 Compatibility baseline (measured on this machine, 2026-08-14)

- **Types**: devDependencies pin the published client packages **0.1.0-rc.6** from npm (`dsh-client-runtime`, `dsh-client-ui-conversation`, `dsh-client-ui-input-trigger`, `dsh-client-ui-settings`, `dsh-settings`, `dsh-api-remotes`); `typecheck` no longer depends on a local checkout. Runtime smoke runs against a checkout whose client packages are **0.1.0-rc.5**; `@deepseek-ai/cordis` **4.0.1**; `@deepseek-ai/schemastery` **3.18.1**.
- **Compaction markers are client-visible in rc.6**: `ConversationNode` includes `CompactionSummaryNode` (`kind: 'compaction'`, `summary`/`shadowedItemCount`/`shadowedTokenCount`), and the transcript stays intact above each marker — shadowed turns are never removed from the snapshot. The sliding-context features read only that published face.
- `InputState` phases (read from `packages/client/ui-conversation/src/client/input/contract.ts`): `'plain' | 'adjudicating' | 'claimed' | 'submitting'`, plus `draft`/`draftRev`. The single public draft write path is `ctx.conversation.input.for(actx).setDraft(text)`; the `editRange`-aware `ComposerKeyboard` face is InputBar-private (see `docs/upstream-proposals.md` C1).
- **Client plugin metadata is the nested `dsh.client` field** (`packages/client/modules` `resolveMeta` reads `pkg.dsh.client`): putting it in the wrong place silently drops the package from the boot graph — no error.
- **Vendored cordis is renamed `@deepseek-ai/cordis`**: type-only imports from it; the built `lib/client.js` has zero runtime cordis imports (no `require(` calls at all).
- **The browser boot passes no config to plugins** (the boot graph carries `{id, url, rev, inject, immediately}`): the browser half resolves the schema defaults, and — the new path — the settings scope delivers the host-resolved section (cordis.yml `base` + user overrides) once the transport is ready. Without a settings service the plugin falls back to schema defaults, exactly as before. Measured: `recallWithDraft: bogus` aborts the whole boot with `failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"`.
- **Settings transport is loopback-only**: a remote browser cannot read the host document; its scope reports memory/unavailable mode and the plugin falls back to defaults (the history store is browser-local regardless).
- **Rebuild before relaunching**: the startup check reads `lib/client.js`; unbuilt packages are rejected, and the browser only ever fetches build artifacts.
- **Exported symbols only**: cross-package reads use types/services exported from `@deepseek-ai/dsh-client-*` `/client` entries; asserting the `inputTriggers` service instance to `InputTriggerService` is the sanctioned community pattern (done here as a type-only import + `ctx.get('inputTriggers') as InputTriggerService | undefined`, with a comment explaining why).
- Client bundle contract: a CJS factory wrapped in `window.__ModuleLoader__.load({ id, factory })`, platform modules (react, cordis, slots, … plus the `@deepseek-ai/dsh-client-runtime/client` exemption) external, everything else inlined. This plugin needs no runtime externals; the tsdown config declares the list defensively.
- Profile files must be **UTF-8 without BOM** (`readProfileManifest` runs plain `JSON.parse`; a BOM aborts boot with `Unexpected token '\uFEFF'` — measured).

## ⚠️ Known limitations

- **Logical vs visual lines**: default `logical` keys off `\n` (a long auto-wrapped message counts as one line); `visual` measures real wraps via the mirror (a hidden node, O(lines·log n) binary search per edge check, memoized per draft/width). The mirror measurement itself needs a real layout engine — the pure span math is unit-tested instead (see `tests/visual-mirror.spec.ts`).
- **Persisted history is per-browser**: the store lives in `localStorage` of one origin; it never syncs between browsers or machines. Corrupt payloads reset silently.
- **Undo stack includes recall transactions**: every fill/restore is one `setDraft` transaction in the input machine's undo log; Ctrl+Z can step back through recalls. The plugin never modifies undo/redo semantics; the precision fix needs the upstream edit-range exposure (see `docs/upstream-proposals.md` C1).
- Recalling a `/xxx` entry then Enter follows the normal command claim/adjudication path (expected, and Enter is never intercepted).
- Menus/popups and non-`plain` phases always win; a committed send (programmatic draft clear) and session switches both reset to IDLE.
- Reference chips (U+FFFC placeholders) ride along with recalled/restored draft text.
- `historyScope: 'workspace'` reads the live assemblies of other listed sessions; sessions whose assembly has not materialized simply contribute nothing yet.
- The search overlay is plain DOM (no React dependency); it renders all matches up to the `maxHistory` bound.
- **Compaction awareness is observational**: checkpoints that landed before the plugin install (or before a session switch) never trigger a notice; only markers landing while the page is open do. A checkpoint whose summary event fell outside the loaded window contributes no `[compacted] …` entry (`summary: null`).
- The notice's "Compact now" action only *fills* the configured command text into the draft — sending (and `/compact`'s own admission) remains the user's Enter.
- **Snippets, templates, and insights are browser-local**: each library lives in this browser's `localStorage` and never syncs between browsers or machines; corrupt payloads reset silently. Snippet/template names are kebab-case (1..64 chars); tags cap at 8 × 32 chars.
- **Template variables resolve from the live session**: `{{draft}}` is the draft at pick time; values are never persisted inside templates.

## 🗺️ Upstream proposals

Three extension-point proposals for `deepseek-ai/deepseek-harness` are written up in [`docs/upstream-proposals.md`](docs/upstream-proposals.md): a public edit-range write on the input face (C1), exporting the trigger-detection pure function (C2), and a documented composer keyboard arbitration chain (C3).

## 🏷️ Topics & ecosystem

This project is part of the DeepSeek Harness plugin ecosystem. Suggested GitHub topics (set them in the repository settings):

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `compaction` · `sliding-context` · `typescript`

Useful links: [github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 🙌 Contributors

Thanks to everyone who has contributed to this plugin:

- [PerryLink](https://github.com/PerryLink) — creator and maintainer: every release from v0.1.0 to v0.5.0 (edge-first arrow recall, persisted history, reverse search, sliding-context awareness, search overlay polish, snippet library, prompt templates, reuse insights, `dsh.bundle` and `dshWorkshop` manifests).

Open a PR to join this list.

## 📄 License

[Apache License 2.0](./LICENSE) · release history in [CHANGELOG.md](./CHANGELOG.md)

## PerryLink DSH Plugin Family

This project is one of the [15 DeepSeek Harness plugins](https://github.com/PerryLink) maintained by [PerryLink](https://github.com/PerryLink). If this one helps you, the others likely will too:

| Plugin | One-liner |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | Engineering-discipline guard: requirements grill, test gates, adversary review |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | Durable background child agents with a Web UI sidebar, messaging and interrupt |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | LSP diagnostics, formatting, completion, code actions and rename over language servers |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | Claude Code outputStyles-equivalent runtime style switching |
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | Claude Code-style declarative allow/deny/ask permission rules with audit |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | Second-model auto-review on the approval chain, fail-closed by default |
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |
| [dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security) | Security-audit skill pack: secret scan, dependency and supply-chain review |
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | Pin sessions in the Web sidebar with durable ordering |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |
| [dsh-github](https://github.com/PerryLink/dsh-github) | GitHub PR/issues integration for DSH, every write gated by approval |
| [dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) | Plugin-development knowledge base as an on-demand agent skill |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH |

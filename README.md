<div align="center">

# ⌨️ dsh-composer-history

> Release stamp: `0.8.8` (2026-10-04).
- **1024 store channel**: `npm i -g dsh1024` once, then `dsh1024 plugin --profile web add dsh-composer-history` (counts toward the [deepseek1024.com](https://deepseek1024.com) install ranking).
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-composer-history)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-composer-history?metric=downloads)](https://dshfind.com/plugins/PerryLink/dsh-composer-history?ref=badge)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/PerryLink/dsh-composer-history/badge)](https://api.securityscorecards.dev/projects/github.com/PerryLink/dsh-composer-history)

**Terminal-style input history for the DeepSeek Harness Web GUI composer.**

*Press ↑ like it's in a terminal — and keep your half-typed draft safe.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-composer-history.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-top-rated.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-composer-history/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-composer-history/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-composer-history?label=version)](https://github.com/PerryLink/dsh-composer-history/releases)
[![npm version](https://img.shields.io/npm/v/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)
[![npm downloads](https://img.shields.io/npm/dm/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-composer-history
```


</div>

---

**📖 Ecosystem knowledge base** — measured data, not marketing: [plugin development guide · plugin-selection data · maintenance criteria](https://perrylink.github.io/dsh-plugin-guide/).

<!-- star-cta -->
## Install & uninstall

The npm package ships the built bundles; a source checkout must be built first (`pnpm run build`) — the client-package check refuses to boot against an unbuilt bundle.

- **git channel** (latest `main`): `dsh plugin --profile web add github:PerryLink/dsh-composer-history`.
- **npm channel** (published releases): `dsh plugin --profile web add dsh-composer-history`.
- **tarball channel**: `pnpm pack` in this repo, then `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`.
- **uninstall**: `dsh plugin --profile web remove dsh-composer-history` (or remove the row from the profile patch).

## ⭐ 如果它帮到了你

这个插件是 [DSH 插件家族](https://github.com/PerryLink)的一员（95 个，全部 Apache-2.0）。如果你在用，**给个 star** —— 它不会解锁任何功能，但会让下一个人在搜索里更容易找到它。

*English:* part of a 95 plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.


## What is dsh-composer-history?

Terminal-style input history for the DeepSeek Harness Web GUI composer.

Press ↑ like it's in a terminal — and keep your half-typed draft safe.

![Terminal demo of dsh-composer-history: dsh-composer-history — /save and /load, plus arrow recall and Ctrl+R search](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-hero.png)

![Animated terminal demo of dsh-composer-history](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-demo.gif)

*The same run, animated.*

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-rc.2` (verified 2026-10-18): `engines.dsh >=0.2.1-0 <0.3.0`; the P0 compatibility paths have regression tests. |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | Web GUI only (client plugin; browser-local storage; no network, no native code) |
| Model | Any (no model requests — pure UI behavior) |

The browser half rides the published client packages (`dsh-client-ui-conversation`, `dsh-client-ui-input-trigger`, `dsh-client-ui-settings`) and the cordis `Context`; it no longer depends on the removed `dsh-client-runtime` package, so the client surface also lines up with `0.1.2-rc.1` hosts.
Interception anchors on the web composer's DOM: the contenteditable surface `div[data-composer-input]` inside `[data-input-scroll]` (the Lexical composer shipped since 0.1.2-alpha.5 / 0.1.2-rc.1), with the legacy textarea composer inside `[data-input-scroll]` (harness lines up to 0.1.1-rc.2) still matched; textareas elsewhere pass through. The compat workflow's jsdom web-behavior smoke asserts this identity/text/caret face against the packed bundle.
0.1.2-rc.1 (adapted 2026-09-04): the session envelope keeps its ignorable field for stored-log read compatibility only - Session.append still cannot stamp it, so audit-gate behavior is unchanged. Verified 2026-09-06 against the dsh-v0.1.7-alpha.1 master checkout (full gate chain + profile install smoke).
0.1.5-rc.1 (adapted 2026-09-10): dependency pins move to the published 0.1.5-rc.1 line; no seam change affects this plugin's behavior.
0.1.5-rc.2 (adapted 2026-09-11): dependency pins move to the published 0.1.5-rc.2 line; no seam change affects this plugin's behavior.
0.1.7-alpha.1 (adapted 2026-10-04): the settings seam is replaced on both halves. The host half no longer registers a `composer-history` namespace through the removed `ctx.settings.register(ns, schema, { base })` — on this line a plugin's durable settings surface IS its own live `Config`: every tunable is declared `.volatile()`, the profile entry id (`composer-history`, the bundle patch's row id) names the form, and `apply` claims the generated-form presentation (`ctx.settings.configure({ auto: true }, ctx.fiber)`, effect-owned so a reload re-registers cleanly). The browser half reads the same entry through `ctx.configForms.get('composer-history')` instead of the removed `ctx.settingsScope.bind({ namespace })`; the snapshot/subscribe shape is unchanged, so the wiring still reinstalls on every committed change. Editable surface is preserved, not widened: every field the old namespace exposed is volatile, and no new field became editable. An existing `settings.yaml` section named `composer-history` is migrated into the profile entry of the same id by the host itself.

## What you get

`dsh-composer-history` puts a terminal's input history into the DeepSeek Harness Web GUI composer:

1. **Edge-first arrow recall** — bare ↑/↓ move the caret first; history recall triggers only when the caret sits on the first/last line. The first recall stashes `{draft, caret}`, and reaching the newest entry again (or pressing `Esc`) restores both exactly — never cleared.
2. **Persisted history** — every sent message is appended to a bounded browser-local store, so recall survives page reloads and reaches across sessions.
3. **Reverse search** — `Ctrl+R` (configurable) opens a query overlay over merged history, snippets, and templates.
4. **Smart input layer** — `/save`/`/load` snippets, prompt templates with `{{workspace}}`/`{{session}}`/`{{draft}}` variables, and browser-local reuse insights.
5. **Sliding-context aware** — compaction summaries join recall and search as `[compacted] …` entries, and a transient notice announces each compaction with a one-click `/compact` fill.
6. **Versioned JSON backup** — export/import all four libraries (history, snippets, templates, insights) as one schema-versioned document; download or copy on export, file pick or paste on import.

Pure UI behavior: no session events, no agent-loop changes, no model requests. Recalled text only enters the ordinary composer draft; it reaches the model only if *you* press Enter.

## Quick start

```sh
dsh plugin --profile web add github:PerryLink/dsh-composer-history
```

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add github:PerryLink/dsh-composer-history

# or from npm (published releases)
dsh plugin --profile web add dsh-composer-history

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: composer-history'
```

## Configuration

All tunables are Schemastery `Config` fields (changeable from cordis.yml and the entry's settings form; the profile patch is the persisted document). An id-targeted override replaces the whole row — restate every key you need. Invalid enum values fail the whole dsh boot loudly, and a settings-form edit is validated by the host before it persists.

| Key | Default | Meaning |
|---|---|---|
| `recallWithDraft` | `'save'` | Recall mode (`save` / `gate`): `save` stashes a non-empty draft before recall; `gate` recalls only an empty draft (Claude/Codex-style gating) |
| `restoreOnEscape` | `true` | Restore the stashed draft when `Esc` ends browsing |
| `edgeMode` | `'logical'` | Edge detection mode (`logical` / `visual`): by `\n` lines or by measured wrapped lines |
| `enableCtrlAlias` | `true` | Let Ctrl+↑/↓ behave like the bare arrows |
| `restoreCaret` | `true` | Also restore the stashed caret on bottom-out / `Esc` |
| `upKey` | `'ArrowUp'` | `KeyboardEvent.key` that recalls upward; `''` disables |
| `downKey` | `'ArrowDown'` | `KeyboardEvent.key` that walks newer / restores; `''` disables |
| `escapeKey` | `'Escape'` | `KeyboardEvent.key` that escapes browsing; `''` disables |
| `maxHistory` | `500` | Maximum recalled entries (newest kept); `0` = unlimited |
| `includeKinds` | `['user']` | Conversation node kinds admitted into the history (add `'steering'` to include steer messages) |
| `historyScope` | `'session'` | History scope (`session` / `workspace`): `workspace` prepends other listed sessions' user messages before the current session's |
| `persistHistory` | `true` | Append sent messages to the browser-local store |
| `maxPersisted` | `200` | Maximum persisted entries; `0` = unlimited |
| `enableSearch` | `true` | Enable the `Ctrl+R` reverse-search overlay |
| `searchKeys` | `['Ctrl+R']` | Chord specs opening the search (modifiers `Ctrl`/`Alt`/`Meta`/`Shift` + a key name); a malformed spec fails the browser fiber loudly |
| `searchCaseSensitive` | `false` | Whether search matching distinguishes letter case |
| `includeCompactionSummaries` | `true` | Admit `[compacted] …` checkpoint summaries into recall and search |
| `showCompactionNotice` | `true` | Show a transient notice when a compaction checkpoint lands |
| `compactCommandText` | `'/compact'` | Slash command the notice's "Compact now" action fills into the composer; `''` hides the action |
| `enableSnippets` | `true` | Enable the snippet library (`/save`, `/load`, search-panel picking) |
| `maxSnippets` | `200` | Maximum stored snippets; `0` = unlimited |
| `enableTemplates` | `true` | Enable the prompt-template library (variables fill at insertion) |
| `enableInsights` | `true` | Enable the reuse-insight hint (local usage statistics) |
| `insightMinUses` | `2` | Minimum uses before the reuse hint shows |
| `enableCompactionHighlight` | `true` | Badge `[compacted] …` summaries distinctly in the search panel |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `ArrowUp` | keybinding | Edge-first ↑/↓ recall — stashes `{draft, caret}`, restores both exactly on bottom-out or `Esc` |
| `Ctrl+R` | keybinding | Reverse-search overlay over merged history, snippets, and templates |
| `/save` | command | Save the current draft as a named, tagged snippet |
| `/load` | command | Insert a saved snippet at the caret |
| `templates` | UI | Versioned JSON backup export/import of history, snippets, templates, and insights (explicit click only) |
| `composer-history` | settings form | The profile entry's own live `Config` form — carries the resolved config (cordis.yml base + profile overrides) into the browser half |

## Keybindings

| Key | State | Behavior |
|---|---|---|
| ↑ | IDLE, caret on first line | stash `{draft, caret}`, fill newest entry, caret to end (no history → pass) |
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

## Reverse search

- **Open**: the `searchKeys` chord while the composer is focused and the input is `plain` (a `Ctrl+R` here also stops the browser's page reload — the key is consumed only inside the composer).
- **Filter**: substring match over the merged history (current session + persisted + workspace entries); case sensitivity per `searchCaseSensitive`; matched substrings are highlighted in each row.
- **Pick**: Enter fills the draft and moves the caret to the end — the same single `setDraft` write path as ordinary recall. Recalled text reaches the model only if you press Enter afterwards.
- **Cancel**: Esc or a press outside the panel; the draft is untouched.

## Smart input layer

On top of the terminal-style history, three browser-local libraries turn the composer into a reusable input surface. Everything below lives in `localStorage` (keys `dsh.composer-history.snippets.v1`, `.templates.v1`, `.insights.v1`), never touches the network, and every switch is a `Config` field.

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

The whole library — history, snippets, templates, and insights — exports to and imports from a single versioned JSON document through the panel's **Export JSON / Import file** actions; see **Backup export & import** below. An explicit user action; the plugin never writes files on its own.

**Reuse insights**

Every newly committed user message (and every snippet load) lands one browser-local usage record keyed by exact text. While you type, a small hint under the composer reports `used M× in N sessions · 在 N 个会话里用过 M 次` once the draft matches a prompt used in at least `insightMinUses` (default 2) sessions. Toggle with `enableInsights`; the statistics contain only the deduped texts and counters.

**Compaction summary highlight**

`Ctrl+R` marks `[compacted] …` summaries with an amber badge (history stays unbadged), snippets green, templates purple — the panel's provenance is visible at a glance. Toggle with `enableCompactionHighlight`.

## Backup export & import

All four browser-local libraries export to and import from one versioned JSON document. The panel's **Export JSON / Copy JSON / Import file / Paste JSON** actions run entirely in the browser: download or copy to clipboard on export, file pick or pasted text on import — nothing is uploaded and no host RPC or network call is involved.

**Document shape**

```json
{
  "schemaVersion": 1,
  "exportedAt": 1735689600000,
  "data": {
    "history": ["…"],
    "snippets": [{ "name": "…", "text": "…", "tags": [], "scope": "global", "createdAt": 0, "updatedAt": 0, "useCount": 0, "lastUsedAt": 0 }],
    "templates": [{ "name": "…", "text": "…", "description": "", "updatedAt": 0 }],
    "insights": [{ "text": "…", "sessions": [], "uses": 0, "lastUsedAt": 0 }]
  }
}
```

**Merge & conflict strategy**

- History entries are plain strings and deduplicate by exact text; a duplicate or blank entry is skipped, never overwritten.
- Snippets and templates key on `name`; insights key on exact `text`. On a same-key conflict the **newest timestamp wins** (`updatedAt` for snippets/templates, `lastUsedAt` for insights); an older or equal-timestamp import is skipped, and new keys are appended.
- The import respects `maxPersisted` and `maxSnippets`; templates and insights cap at their fixed protocol limits (`500` each).
- The result notice reports how many records were written and how many were skipped (older/duplicate).

**Schema versioning**

`schemaVersion` starts at `1`. Imports run a stepwise migration (one version at a time) so future formats can upgrade old documents in place. A document whose `schemaVersion` is **newer** than the one this build understands is rejected with an error — it is never silently dropped or partially merged; a version too old to migrate is rejected the same way.

## Sliding context

The harness core gives every dsh session a sliding context window, the same workflow Claude Code and Codex ship: when a conversation approaches the model's context limit (or the provider reports an overflow), the harness **auto-compacts** — older turns are summarized behind a `compaction` checkpoint marker that stays visible in the transcript, the model keeps only the summary plus the recent tail, and the session continues. `/compact` triggers the same compaction on demand, and the marker renders as an expandable "Context compacted" row.

`dsh-composer-history` plugs the composer into that workflow so the window slide never costs you your typing history:

- **Recall survives compaction** — shadowed turns stay in the finalized conversation the Chat view publishes, so ↑ still walks every message you sent before and after a checkpoint.
- **Summaries join the history** — each checkpoint's summary text enters ↑ recall and `Ctrl+R` search as a `[compacted] …` entry (toggle: `includeCompactionSummaries`), so context the model no longer sees verbatim stays one keystroke away.
- **Compaction notice** — when a checkpoint lands while the page is open, a transient snackbar announces it (the Claude Code "Auto-compacting conversation…" moment) with the summary snippet and a one-click **Fill `/compact`** action (`showCompactionNotice`, `compactCommandText`); the fill lands in the ordinary draft, and only your Enter sends it.
- **Search counts** — the `Ctrl+R` panel now shows a live `N entries` / `N matches` status line, and long entries are clamped to two lines.

> Compaction itself (thresholds, summary model, `/compact`) is owned by the harness core's compaction plugins — this plugin only observes the checkpoint markers the Chat view's conversation projection already publishes (`uiConversation.binding(id).target('chat').legacy.nodes`), so it works without any agent-loop or model-request changes.

## Permissions & data

- **Permissions**: the plugin declares `browser:local-storage` in its workshop manifest — nothing else. No network, no subprocesses, no session events.
- **Data**: four browser-local `localStorage` keys — `dsh.composer-history.v1` (sent-message history), `dsh.composer-history.snippets.v1` (snippet texts + tags + use counters), `dsh.composer-history.templates.v1` (template texts), and `dsh.composer-history.insights.v1` (deduped prompt texts + per-session use counters). All bounded, same-origin only, never uploaded; corrupt payloads reset silently.
- **Model-visible ⟺ you press Enter**: recalled text, snippet loads, template fills, and the `/compact` fill all land in the ordinary composer draft. Nothing reaches the model until you press Enter.

## Security boundaries

- **UI-only, never enforcement.** The plugin edits the composer draft only; the sandbox, approval, and session systems remain the enforcement authorities, and no command or tool is ever claimed or bypassed.
- **No content leaves the browser** except an explicit export. History, snippets, templates, and insights live in `localStorage`; nothing is uploaded, and no model request or network call is made. The versioned backup export only writes a local download or the clipboard on an explicit click.
- **Fail loud.** Invalid enum values fail the whole dsh boot; a malformed search chord fails the browser fiber — misconfiguration never silently degrades.
- **Bounded everything.** `maxHistory`, `maxPersisted`, and `maxSnippets` cap retained entries; corrupt or foreign payloads reset silently.
- **Zero side effects on pass-through.** The plugin intercepts only in the `plain` input phase and yields to the slash menu, command popups, IME composition, text selections, and modifier combos.

## Known limitations

- **Composer DOM face.** Interception anchors on host-private DOM: the contenteditable `div[data-composer-input]` inside `[data-input-scroll]` (harness 0.1.2-alpha.5 / 0.1.2-rc.1 and later); the legacy textarea composer inside `[data-input-scroll]` (lines up to 0.1.1-rc.2) stays matched. This shape is not a published API (upstream proposal C3 records that plugins can only guess host DOM), so a future host DOM change can break interception silently — the compat workflow's jsdom smoke re-asserts the face against the packed bundle.
- **Logical vs visual lines.** Default `logical` keys off `\n` (a long auto-wrapped message counts as one line); `visual` measures real wraps via a hidden mirror that copies the contenteditable surface's computed box (O(lines·log n) binary search per edge check, memoized per draft/width). Mirror measurement needs a real layout engine — the pure span math is unit-tested instead, and measured spans on the Lexical composer stay best-effort (logical remains the default).
- **Persisted history is per-browser.** The store lives in one origin's `localStorage`; it never syncs between browsers or machines. Corrupt payloads reset silently.
- **Undo stack includes recall transactions.** Every fill/restore is one `setDraft` transaction in the input machine's undo log; Ctrl+Z steps back through recalls. The precision fix needs the upstream edit-range exposure.
- Recalling a `/xxx` entry then Enter follows the normal command claim/adjudication path (expected, and Enter is never intercepted).
- Menus/popups and non-`plain` phases always win; a committed send and session switches both reset to IDLE.
- Reference chips (U+FFFC placeholders) ride along with recalled/restored draft text.
- `historyScope: 'workspace'` reads the Chat targets of other listed sessions; a session whose Chat view has not been activated in this page contributes nothing yet.
- The search overlay is plain DOM (no React dependency); it renders all matches up to the `maxHistory` bound.
- **Compaction awareness is observational.** Checkpoints landed before install (or before a session switch) never trigger a notice; a checkpoint whose summary event fell outside the loaded window contributes no `[compacted] …` entry (`summary: null`).
- The notice's "Compact now" action only *fills* the configured command text into the draft — sending remains the user's Enter.
- **Snippets, templates, and insights are browser-local.** Names are kebab-case (1..64 chars); tags cap at 8 × 32 chars. Template variables resolve from the live session; `{{draft}}` is the draft at pick time.

## Development

```sh
pnpm install           # node ^22.19 || >=24
pnpm run build         # tsc build + tsdown bundle (lib/)
pnpm run typecheck     # tsc --noEmit (src + tests)
pnpm test              # vitest run
pnpm run test:watch    # vitest watch
pnpm run test:coverage # vitest run --coverage
pnpm run check:readmes # README consistency gate
pnpm run verify:pack   # pack-surface check
```

## Topics

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `compaction` · `sliding-context` · `typescript`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — creator and maintainer: edge-first arrow recall, persisted history, reverse search, sliding-context awareness, snippet library, prompt templates, reuse insights, and the `dsh.bundle` / `dshWorkshop` manifests.

## PerryLink DSH Plugin Family

This project is one of the **87 actively maintained** DeepSeek Harness plugins from [PerryLink](https://github.com/PerryLink). The family roster is **95** plugins in total — **5 frozen**, **3 retired** — and stays collapsed below so every README keeps a short first screen. Expand it to see every row, with the reason in the Status column.

<details>
<summary>Expand all 95 plugins</summary>

| Plugin | One-liner | Status |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRED — see the repo README |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 FROZEN — see the repo README |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 FROZEN — see the repo README |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 FROZEN — see the repo README |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 FROZEN — see the repo README |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 FROZEN — see the repo README |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRED — see the repo README |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRED — see the repo README |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>

### Install from the DSH Desktop Market

All PerryLink plugins are browsable in the built-in DSH Desktop Market: **Market → Sources → add source → paste** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ select it**. Installation still goes through the Market's npm-identity verification and your confirmation.

## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors

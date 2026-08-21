<div align="center">

# ⌨️ dsh-composer-history

**Terminal-style input history for the DeepSeek Harness Web GUI composer.**

*Press ↑ like it's in a terminal — and keep your half-typed draft safe.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-composer-history/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-composer-history/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-composer-history?label=version)](https://github.com/PerryLink/dsh-composer-history/releases)
[![npm version](https://img.shields.io/npm/v/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)
[![npm downloads](https://img.shields.io/npm/dm/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [हिन्दी](README.hi.md)

</div>

---

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `0.1.0-rc.8` |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | Web GUI only (client plugin; browser-local storage; no network, no native code) |
| Model | Any (no model requests — pure UI behavior) |

## What you get

`dsh-composer-history` puts a terminal's input history into the DeepSeek Harness Web GUI composer:

1. **Edge-first arrow recall** — bare ↑/↓ move the caret first; history recall triggers only when the caret sits on the first/last line. The first recall stashes `{draft, caret}`, and reaching the newest entry again (or pressing `Esc`) restores both exactly — never cleared.
2. **Persisted history** — every sent message is appended to a bounded browser-local store, so recall survives page reloads and reaches across sessions.
3. **Reverse search** — `Ctrl+R` (configurable) opens a query overlay over merged history, snippets, and templates.
4. **Smart input layer** — `/save`/`/load` snippets, prompt templates with `{{workspace}}`/`{{session}}`/`{{draft}}` variables, and browser-local reuse insights.
5. **Sliding-context aware** — compaction summaries join recall and search as `[compacted] …` entries, and a transient notice announces each compaction with a one-click `/compact` fill.

Pure UI behavior: no session events, no agent-loop changes, no model requests. Recalled text only enters the ordinary composer draft; it reaches the model only if *you* press Enter.

## Quick start

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"

# or from npm (published releases)
dsh plugin --profile web add dsh-composer-history

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: composer-history'
```

## Install & uninstall

The npm package ships the built bundles; a source checkout must be built first (`pnpm run build`) — the client-package check refuses to boot against an unbuilt bundle.

- **git channel** (latest `main`): `dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"`.
- **npm channel** (published releases): `dsh plugin --profile web add dsh-composer-history`.
- **tarball channel**: `pnpm pack` in this repo, then `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`.
- **uninstall**: `dsh plugin --profile web remove dsh-composer-history` (or remove the row from the profile patch).

## Configuration

All tunables are Schemastery `Config` fields (changeable from cordis.yml and the settings document). An id-targeted override replaces the whole row — restate every key you need. Invalid enum values fail the whole dsh boot loudly.

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
| `templates` | UI | Prompt-template export/import as a JSON document (explicit click only) |
| `composer-history` | settings namespace | Carries the resolved config into the browser half |

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

The template library exports to and imports from a JSON document (`composer-templates-v1`) through the panel's **Export templates / Import templates** buttons — an explicit user action; the plugin never writes files on its own.

**Reuse insights**

Every newly committed user message (and every snippet load) lands one browser-local usage record keyed by exact text. While you type, a small hint under the composer reports `used M× in N sessions · 在 N 个会话里用过 M 次` once the draft matches a prompt used in at least `insightMinUses` (default 2) sessions. Toggle with `enableInsights`; the statistics contain only the deduped texts and counters.

**Compaction summary highlight**

`Ctrl+R` marks `[compacted] …` summaries with an amber badge (history stays unbadged), snippets green, templates purple — the panel's provenance is visible at a glance. Toggle with `enableCompactionHighlight`.

## Sliding context

The harness core gives every dsh session a sliding context window, the same workflow Claude Code and Codex ship: when a conversation approaches the model's context limit (or the provider reports an overflow), the harness **auto-compacts** — older turns are summarized behind a `compaction` checkpoint marker that stays visible in the transcript, the model keeps only the summary plus the recent tail, and the session continues. `/compact` triggers the same compaction on demand, and the marker renders as an expandable "Context compacted" row.

`dsh-composer-history` plugs the composer into that workflow so the window slide never costs you your typing history:

- **Recall survives compaction** — shadowed turns stay in the session snapshot, so ↑ still walks every message you sent before and after a checkpoint.
- **Summaries join the history** — each checkpoint's summary text enters ↑ recall and `Ctrl+R` search as a `[compacted] …` entry (toggle: `includeCompactionSummaries`), so context the model no longer sees verbatim stays one keystroke away.
- **Compaction notice** — when a checkpoint lands while the page is open, a transient snackbar announces it (the Claude Code "Auto-compacting conversation…" moment) with the summary snippet and a one-click **Fill `/compact`** action (`showCompactionNotice`, `compactCommandText`); the fill lands in the ordinary draft, and only your Enter sends it.
- **Search counts** — the `Ctrl+R` panel now shows a live `N entries` / `N matches` status line, and long entries are clamped to two lines.

> Compaction itself (thresholds, summary model, `/compact`) is owned by the harness core's compaction plugins — this plugin only observes the checkpoint markers the client snapshot already exposes, so it works without any agent-loop or model-request changes.

## Permissions & data

- **Permissions**: the plugin declares `browser:local-storage` in its workshop manifest — nothing else. No network, no subprocesses, no session events.
- **Data**: four browser-local `localStorage` keys — `dsh.composer-history.v1` (sent-message history), `dsh.composer-history.snippets.v1` (snippet texts + tags + use counters), `dsh.composer-history.templates.v1` (template texts), and `dsh.composer-history.insights.v1` (deduped prompt texts + per-session use counters). All bounded, same-origin only, never uploaded; corrupt payloads reset silently.
- **Model-visible ⟺ you press Enter**: recalled text, snippet loads, template fills, and the `/compact` fill all land in the ordinary composer draft. Nothing reaches the model until you press Enter.

## Security boundaries

- **UI-only, never enforcement.** The plugin edits the composer draft only; the sandbox, approval, and session systems remain the enforcement authorities, and no command or tool is ever claimed or bypassed.
- **No content leaves the browser.** History, snippets, templates, and insights live in `localStorage`; nothing is uploaded, and no model request or network call is made.
- **Fail loud.** Invalid enum values fail the whole dsh boot; a malformed search chord fails the browser fiber — misconfiguration never silently degrades.
- **Bounded everything.** `maxHistory`, `maxPersisted`, and `maxSnippets` cap retained entries; corrupt or foreign payloads reset silently.
- **Zero side effects on pass-through.** The plugin intercepts only in the `plain` input phase and yields to the slash menu, command popups, IME composition, text selections, and modifier combos.

## Known limitations

- **Logical vs visual lines.** Default `logical` keys off `\n` (a long auto-wrapped message counts as one line); `visual` measures real wraps via a hidden mirror (O(lines·log n) binary search per edge check, memoized per draft/width). Mirror measurement needs a real layout engine — the pure span math is unit-tested instead.
- **Persisted history is per-browser.** The store lives in one origin's `localStorage`; it never syncs between browsers or machines. Corrupt payloads reset silently.
- **Undo stack includes recall transactions.** Every fill/restore is one `setDraft` transaction in the input machine's undo log; Ctrl+Z steps back through recalls. The precision fix needs the upstream edit-range exposure.
- Recalling a `/xxx` entry then Enter follows the normal command claim/adjudication path (expected, and Enter is never intercepted).
- Menus/popups and non-`plain` phases always win; a committed send and session switches both reset to IDLE.
- Reference chips (U+FFFC placeholders) ride along with recalled/restored draft text.
- `historyScope: 'workspace'` reads the live assemblies of other listed sessions; sessions whose assembly has not materialized contribute nothing yet.
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

## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors

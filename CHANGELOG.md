# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions
follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Rename the four translated READMEs to `README-<lang>.md`. npm selects the package-page readme as the first markdown file matching its `{README,README.*}` glob (`@npmcli/package-json`, publish path), and that glob order puts `README.<lang>.md` ahead of `README.md` — so npm was serving the Simplified-Chinese file for this package too (measured on 15/15 sampled packages of the family). The new names sit outside the glob, so the English source is served again. No content changed apart from the language-switcher link each translation holds to its siblings, and the repo readme gate still passes. Takes effect with the next release; an already-published version cannot gain a corrected readme retroactively.

## [0.8.1] - 2026-09-10

### Changed

- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.1` line and record `0.1.5-rc.1` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow now runs against `0.1.5-rc.1`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-rc.1` (verified 2026-09-10).

## [0.8.0] - 2026-09-09

### Fixed

- **Session history now comes from a live source (CP-7).** Every supported
  host line publishes a lifecycle-only per-session snapshot (queue, pending
  submissions, running/open state), so the `session.getSnapshot().nodes` read
  the plugin was originally written against returned `undefined` on every
  install, and the `?? []` fallback silently emptied ↑ recall, `Ctrl+R` search,
  cross-session persistence, and compaction notices; on a hot reload with a
  current Session the same `undefined` reached `latestCompactionSeq()` and
  failed the browser fiber with `TypeError: nodes is not iterable`. History is
  now read from the official per-Session Chat target —
  `uiConversation.binding(id).target('chat')`, whose compatibility projection
  `legacy.nodes` carries the finalized conversation union in seq order (the
  same array the host's own StatsPills reads). The wiring subscribes before
  its first read, because a target publishes only after activation and the
  first `subscribe` activates it synchronously.
- `historyScope: 'workspace'` reads the other listed Sessions' Chat targets
  instead of the removed session-snapshot field; a Session whose Chat view has
  not been activated in this page still contributes nothing.

### Changed

- `inject` gains `uiConversation` (provided by the already-declared
  `@deepseek-ai/dsh-client-ui-conversation` peer): the browser fiber now waits
  for the service instead of silently degrading to an empty history.
- The compat workflow's jsdom web-behavior smoke encodes the Chat-target face
  (activation-on-subscribe, `legacy.nodes`) instead of the removed
  session-snapshot field, so this class of drift fails the gate again.
- New `tests/session-nodes.spec.ts` (projection, inactive target, binding
  error) and `tests/wiring-recall.spec.ts` (cold install subscribe-before-read,
  late mount through the sessions list, live checkpoint notice, dispose); the
  built-bundle smoke now drives one ArrowUp recall through `lib/client.js`.

### Docs

- Rewrite the sliding-context and workspace-scope README claims in all five
  languages: history and checkpoint markers come from the Chat view's
  conversation projection, not from a session snapshot field that does not
  exist.

## [0.7.4] - 2026-09-09

### Changed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` and pin the dev/test dependencies to the published `0.1.5-alpha.1` line: adaptation to DeepSeek Harness `dsh-v0.1.5-alpha.1` (session format V3, `ctx.agent` removal, `Inbox` type-only interface); no host API breakage on any supported line.
- Record `0.1.5-alpha.1` in `dshWorkshop.compatibility.dshVersions`.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-alpha.1` (verified 2026-09-09).

## [0.7.3] - 2026-09-08

### Docs

- Repair GBK mojibake in the package.json description: the em dash was corrupted to the U+95B3 U+003F marker pair; the description is restored to the clean pre-corruption text; no behavior change.


## [0.7.2] - 2026-09-07

### Docs

- Fix the DSH plugin badge URL: shields.io rejects the four-segment static badge form with "404 badge not found"; the label now uses the documented double-dash form (`dsh--plugin`), rendering identically; no behavior change.


## [0.7.1] - 2026-09-07

### Fixed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0`: the older `>=0.1.0-rc.8 <0.2.0` band resolved to only the `0.1.0-rc.8` prerelease under registry-driven resolution and broke fresh tarball installs; no behavior change.

### Docs

- Refresh the five-language README support-version wording: the verified GitHub tag `dsh-v0.1.3-alpha.1` now leads the compatibility claim, while npm `0.1.2-rc.1` stays the published dependency-pin line (peers `>=0.1.2-rc.1 <0.2.0`); no behavior change.


## [0.7.0] - 2026-09-04

### Fixed

- **Contenteditable composer adaptation.** The harness composer has been a
  Lexical contenteditable div (`div[data-composer-input]` inside
  `[data-input-scroll]`) since commit b519cb87b0 (an ancestor of the
  published 0.1.2-alpha.5 / 0.1.2-rc.1 lines); the plugin's only
  interception gate matched `HTMLTextAreaElement` inside the scrollport, so
  on those hosts arrow-up recall, Ctrl+R, /save, /load, the hint line, and
  the visual edge math all silently no-opped. The identity face now anchors
  on the contenteditable surface (textareas outside the scrollport stay
  negative cases; the legacy textarea composer inside `[data-input-scroll]`
  keeps matching), the read/write face uses the contenteditable text face
  plus the Selection/Range caret API, and the visual mirror copies the
  contenteditable surface's computed box. The interception specs now run
  against the real host DOM shape instead of textarea fakes (plus a
  dedicated composer-dom face suite), and the compat workflow gained a
  jsdom web-behavior smoke that asserts the identity/text/caret face and an
  ArrowUp recall against the packed bundle.

### Changed

- DevDependency pins and the workshop compatibility manifest move to the
  published `0.1.2-rc.1` line; the compat workflow's dsh/dsh-base/
  dsh-headless pins follow (0.1.1-rc.2 → 0.1.2-rc.1). Peer ranges stay
  `>=0.1.1-rc.2 <0.2.0`; the config schema and localStorage keys are
  unchanged.
- The input listener moved from window capture to window bubble: the
  contenteditable DOM only carries an edit after the editor library's
  target-phase listeners have written it.

### Docs

- Five-language READMEs record the 0.1.2-rc.1 baseline and the composer
  DOM-face dependency (Compatibility + Known limitations); DSH Desktop
  Market install note added.

### Internal

- Align cordis-plugin-loader ^1.0.3 / cordis-plugin-include ^1.0.7 with the
  cordis 4.0.2 peers (no behavior change).

## [0.6.5] - 2026-09-02

### Docs

- Sync the five-language READMEs to the 0.1.2-alpha.5 facts; no behavior change.

## [0.6.4] - 2026-09-02

### Changed

- Align the devDependency pins to the published dsh 0.1.2-alpha.5 line and re-verify the adaptation claims; no behavior change.

## [0.6.3] - 2026-09-01

### Changed

- Align the devDependency pins to the published dsh `0.1.2-alpha.3` line (six `@deepseek-ai/dsh-*` packages), and align `cordis`/`schemastery` to `^4.0.2`/`^3.18.2`. No behavior change; the five-language READMEs record the alpha.3 fact.

## [0.6.2] - 2026-08-30

### Changed

- **Client dependency-surface migration.** The browser half no longer
  type-imports the removed `@deepseek-ai/dsh-client-runtime` package: it
  rides the cordis `Context` plus the published client packages. The
  conversation node union is declared as a local structural contract (the
  published `0.1.1-rc.2` line keeps the union inside the removed runtime
  package), and the sessions service is read through a local structural
  face via `ctx.get`. The tsdown external list drops
  `dsh-client-web-react` / `dsh-client-schema-form` /
  `dsh-client-runtime/client` and adds `dsh-client-ui-conversation/client`;
  peers, devDeps, and the client inject manifest drop
  `dsh-client-runtime`. No runtime behavior change.

## [0.6.1] - 2026-08-27

### Fixed

- **Ctrl+R history rows overlapping when the list overflows.** Rows are CSS scroll containers (`overflow:hidden` makes their automatic `min-height` resolve to 0) and defaulted to `flex-shrink:1`, so once the list outgrew the panel's `max-height:320px`, the column-flex layout squashed every row into the one above instead of scrolling. Rows now keep `flex-shrink:0` and the `overflow-y:auto` list scrolls (issue #3). Regression coverage in `tests/search-overlay.spec.ts`.

## [0.6.0] - 2026-08-26

### Added

- **Versioned JSON export/import** — a unified browser-local backup covering history, snippets, templates, and insights as a schema-versioned JSON document (`schemaVersion` v1 + `exportedAt` + `data`). Export downloads or copies to clipboard; import merges from a file pick or pasted text with keep-newest-by-timestamp conflict resolution and skip counts, runs a stepwise migration, and rejects newer/unknown versions fail-closed.

## [0.5.3] - 2026-08-23

### Internal

- Added a wiring-lifecycle (C1) test asserting the fiber disposer removes the
  window-capture listeners and the sessions-list subscription — closing the
  dispose-coverage gap flagged in the plugin inspection plan. No behavior
  change.

## [0.5.2] - 2026-08-22

### Changed

- **DeepSeek Harness 0.1.1-rc.2 compatibility release.** The `@deepseek-ai/dsh-*` devDependencies pin the exact `0.1.1-rc.2` line, the workshop compatibility manifest and the five-language READMEs declare the rc.2 baseline, and the compat workflow pins follow. No behavior change; the full gate (typecheck, build, tests, coverage, lint, README check, pack verification) passes against rc.2, and a real rc.2 headless profile smoke run mounts the bundle.

## [0.5.1] - 2026-08-21

### Changed

- **DeepSeek Harness 0.1.0-rc.8 compatibility release.** The `@deepseek-ai/dsh-*` devDependencies pin the exact `0.1.0-rc.8` line, the workshop compatibility manifest and the five-language READMEs declare the rc.8 baseline, and the compat workflow pins follow. No behavior change; the full gate (typecheck, build, 241 tests, coverage, lint, README check, pack verification) passes against rc.8, and a real rc.8 headless profile smoke run mounts the bundle.

## [0.5.0] - 2026-08-16

### Added

- **Cross-session snippet library** (`enableSnippets` / `maxSnippets`): `/save <name> [--tag=a,b]` stores the current input as a named, tagged snippet (workspace-scoped), `/load <name>` inserts it back, and the `Ctrl+R` panel lists snippets (green badge = name) alongside history. The library persists browser-locally (`dsh.composer-history.snippets.v1`), counts uses, and caps at `maxSnippets`. Enter on a snippet command is consumed — the command never reaches the send path.
- **Prompt templates with variables** (`enableTemplates`): a browser-local template library with `{{workspace}}` / `{{session}}` / `{{draft}}` placeholders filled at insertion; unknown variables fail loudly with the missing list. The library exports/imports as a `composer-templates-v1` JSON document through the search panel's explicit Export/Import buttons — the plugin never writes files on its own.
- **Reuse insights** (`enableInsights` / `insightMinUses`): browser-local usage statistics keyed by exact prompt text; the composer shows a small "used M× in N sessions · 在 N 个会话里用过 M 次" hint once a prompt passes `insightMinUses`. Nothing is ever uploaded.
- **Compaction summary highlight** (`enableCompactionHighlight`): `[compacted] …` summaries badge amber in the search panel, visually distinct from snippets (green) and templates (purple).
- Structured search entries (`SearchEntry` with source/label) and footer actions in the reverse-search overlay; text-only matching (labels never match).

### Changed

- Five-language READMEs: smart input layer section, six new Config fields, privacy keys, and the verification checklist; test count updated to 234.
- `Config` gained six fields with schema defaults — existing cordis.yml blocks keep working unchanged.

## [0.4.0] - 2026-08-15

### Added

- **Search overlay polish**: the `Ctrl+R` panel now highlights the matched
  substring inside every listed row, keeps the selected row scrolled into
  view while navigating with ↑/↓, clamps itself into the viewport (flipping
  above the composer on downward overflow), and exposes a full combobox ARIA
  wiring (`aria-expanded`, `aria-controls`, `aria-activedescendant`, option
  ids) plus a query placeholder.
- `CHANGELOG.md` ships with the package (Keep a Changelog).

### Changed

- **`enableSearch` now defaults to `true`** — reverse search is on out of the
  box, matching the plugin's headline behavior; set `enableSearch: false` for
  the previous opt-in behavior. The `Ctrl+R` chord is still only consumed
  while the composer is focused and the input phase is `plain`.

### Internal

- Migrated the build off tsdown's deprecated `external`/`noExternal` options
  to `deps.neverBundle` (identical bundle output, no deprecation warnings).
- Coverage thresholds now gate CI: the behavior surface (`src/client`,
  excluding the smoke-tested wiring layer) must hold ≥90% statements/lines/
  functions and ≥85% branches.
- Added a tag-driven release workflow (npm publish + GitHub release).

## [0.3.0] - 2026-08-14

### Added

- Sliding-context awareness: compaction checkpoint summaries join ↑ recall
  and `Ctrl+R` search as `[compacted] …` entries (`includeCompactionSummaries`).
- Transient compaction notice with a one-click "Fill `/compact`" action
  (`showCompactionNotice`, `compactCommandText`).

## [0.2.0] - 2026-08-13

### Added

- Browser-local persisted history (`persistHistory`, `maxPersisted`) so
  recall survives reloads and reaches across sessions.
- `Ctrl+R` reverse-search overlay (`enableSearch`, `searchKeys`,
  `searchCaseSensitive`).
- Workspace-scoped recall (`historyScope`) prepends other listed sessions'
  messages before the current session's.
- Settings integration: the host half registers the `composer-history`
  namespace so cordis.yml config and user overrides reach the browser.

## [0.1.0] - 2026-08-12

### Added

- Edge-first arrow-key recall over the composer with exact draft/caret
  stashing and restore, the divergence guard, logical/visual edge modes,
  configurable keys, and the full interception gate matrix.

[0.4.0]: https://github.com/PerryLink/dsh-composer-history/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/PerryLink/dsh-composer-history/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/PerryLink/dsh-composer-history/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/PerryLink/dsh-composer-history/releases/tag/v0.1.0

# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions
follow [Semantic Versioning](https://semver.org/).

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

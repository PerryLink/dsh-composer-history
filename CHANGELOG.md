# Changelog

All notable changes to this project are documented in this file. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions
follow [Semantic Versioning](https://semver.org/).

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

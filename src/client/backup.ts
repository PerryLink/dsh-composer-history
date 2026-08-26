/**
 * Versioned JSON backup: one export document covering all four browser-local
 * namespaces (history, snippets, templates, insights). Export serializes the
 * whole state into a `{ schemaVersion, exportedAt, data }` envelope; import
 * parses, migrates, and merges it back — all over an injected storage face,
 * so the whole path is unit-testable without a browser and without a network.
 *
 * Conflict resolution is keep-newest-by-timestamp for the record namespaces
 * (snippets and templates by `updatedAt`, insights by `lastUsedAt`), while
 * history entries are plain strings and deduplicate by exact text (a
 * duplicate or blank entry is skipped, never overwritten). The import report
 * records added/updated/skipped per namespace so the UI can summarize what
 * actually changed. A document whose `schemaVersion` is newer than the one
 * this build understands is rejected loudly (fail-closed) — it is never
 * silently dropped or partially merged.
 */

import { STORE_KEY, loadEntries, saveEntries, type StorageLike } from './history-store.ts'
import { isSnippetRecord, loadSnippets, saveSnippets, type SnippetRecord } from './snippets.ts'
import { isTemplateRecord, loadTemplates, MAX_TEMPLATES, saveTemplates, type TemplateRecord } from './templates.ts'
import { isUsageRecord, loadUsage, MAX_INSIGHT_RECORDS, saveUsage, type UsageRecord } from './insights.ts'

/** Current backup envelope version; the first released format. */
export const BACKUP_SCHEMA_VERSION = 1

/** The four persisted namespaces, oldest-first in each list. */
export interface BackupData {
  readonly history: readonly string[]
  readonly snippets: readonly SnippetRecord[]
  readonly templates: readonly TemplateRecord[]
  readonly insights: readonly UsageRecord[]
}

/** The export document: schema version, export time, and the payload. */
export interface BackupEnvelope {
  readonly schemaVersion: number
  readonly exportedAt: number
  readonly data: BackupData
}

/** Per-namespace import counts for the record namespaces. */
export interface NamespaceImportCounts {
  readonly added: number
  readonly updated: number
  readonly skipped: number
}

/** Import counts for the plain-string history namespace (no updates possible). */
export interface HistoryImportCounts {
  readonly added: number
  readonly skipped: number
}

/** Complete import report, one entry per namespace. */
export interface ImportReport {
  readonly history: HistoryImportCounts
  readonly snippets: NamespaceImportCounts
  readonly templates: NamespaceImportCounts
  readonly insights: NamespaceImportCounts
}

/** Import caps for the two Config-bounded namespaces (0 = unlimited). */
export interface ImportCaps {
  readonly history: number
  readonly snippets: number
}

/**
 * Stepwise migration registry: keyed by the source `schemaVersion`, each step
 * upgrades one version to the next. Empty today because v1 is the first
 * format; future formats register `{ 1: fromV1ToV2 }` here so `migrateBackup`
 * upgrades old documents one step at a time without touching this loop.
 */
type MigrationStep = (data: unknown) => unknown
const MIGRATIONS: Readonly<Record<number, MigrationStep>> = {}

/**
 * Migrate and validate a parsed (but still unknown) backup value into a
 * {@link BackupEnvelope} at {@link BACKUP_SCHEMA_VERSION}. Unknown newer
 * versions and versions too old to migrate both throw (fail-closed).
 * @param value - the parsed JSON value.
 * @returns the migrated, validated envelope.
 * @throws on a foreign shape, an unknown version, or malformed data.
 */
export function migrateBackup(value: unknown): BackupEnvelope {
  if (typeof value !== 'object' || value === null) {
    throw new Error('backup import must be a JSON object')
  }
  const record = value as Record<string, unknown>
  const version = record['schemaVersion']
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    throw new Error('backup import schemaVersion must be an integer')
  }
  if (version > BACKUP_SCHEMA_VERSION) {
    throw new Error(`backup import schemaVersion ${version} is newer than the supported ${BACKUP_SCHEMA_VERSION}`)
  }
  let data: unknown = record['data']
  for (let current = version; current < BACKUP_SCHEMA_VERSION; current++) {
    const step = MIGRATIONS[current]
    if (step === undefined) {
      throw new Error(`backup import schemaVersion ${current} is too old to migrate (current ${BACKUP_SCHEMA_VERSION})`)
    }
    data = step(data)
  }
  const exportedAt = typeof record['exportedAt'] === 'number' ? record['exportedAt'] : 0
  return { schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt, data: validateBackupData(data) }
}

/** Validate the `data` object and every record it carries; throw on the first violation. */
function validateBackupData(value: unknown): BackupData {
  if (typeof value !== 'object' || value === null) {
    throw new Error('backup import data must be a JSON object')
  }
  const record = value as Record<string, unknown>
  if (!Array.isArray(record['history'])) throw new Error('backup import data.history must be an array')
  const history = record['history'] as unknown[]
  for (const entry of history) {
    if (typeof entry !== 'string') throw new Error('backup import data.history must contain only strings')
  }
  if (!Array.isArray(record['snippets'])) throw new Error('backup import data.snippets must be an array')
  const snippets = record['snippets'] as unknown[]
  for (const item of snippets) {
    if (!isSnippetRecord(item)) throw new Error('backup import data.snippets contains malformed records')
  }
  if (!Array.isArray(record['templates'])) throw new Error('backup import data.templates must be an array')
  const templates = record['templates'] as unknown[]
  for (const item of templates) {
    if (!isTemplateRecord(item)) throw new Error('backup import data.templates contains malformed records')
  }
  if (!Array.isArray(record['insights'])) throw new Error('backup import data.insights must be an array')
  const insights = record['insights'] as unknown[]
  for (const item of insights) {
    if (!isUsageRecord(item)) throw new Error('backup import data.insights contains malformed records')
  }
  return {
    history: history as string[],
    snippets: snippets as SnippetRecord[],
    templates: templates as TemplateRecord[],
    insights: insights as UsageRecord[],
  }
}

/**
 * Serialize one backup into the export JSON document.
 * @param data - the four namespaces.
 * @param exportedAt - epoch ms export timestamp (defaults to now).
 * @returns the pretty-printed JSON document.
 */
export function serializeBackup(data: BackupData, exportedAt: number = Date.now()): string {
  const envelope: BackupEnvelope = { schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt, data }
  return JSON.stringify(envelope, null, 2)
}

/**
 * Read all four namespaces out of storage.
 * @param storage - readable storage.
 * @returns the collected namespaces.
 */
export function collectBackup(storage: StorageLike): BackupData {
  return {
    history: loadEntries(storage, STORE_KEY),
    snippets: loadSnippets(storage),
    templates: loadTemplates(storage),
    insights: loadUsage(storage),
  }
}

/**
 * Export the current state as a JSON document (no side effects).
 * @param storage - readable storage.
 * @param exportedAt - epoch ms export timestamp (defaults to now).
 * @returns the export document.
 */
export function exportBackupJson(storage: StorageLike, exportedAt: number = Date.now()): string {
  return serializeBackup(collectBackup(storage), exportedAt)
}

/**
 * Parse and migrate a backup JSON document.
 * @param json - the import document.
 * @returns the migrated, validated envelope.
 * @throws on invalid JSON, a foreign shape, an unknown version, or malformed data.
 */
export function parseBackup(json: string): BackupEnvelope {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (error) {
    throw new Error(`backup import is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
  return migrateBackup(parsed)
}

/** Merge two same-keyed record lists with keep-newest-by-timestamp conflict resolution. */
function mergeByKey<T>(
  existing: readonly T[],
  incoming: readonly T[],
  keyOf: (item: T) => string,
  newerOf: (item: T) => number,
): { readonly list: readonly T[]; readonly added: number; readonly updated: number; readonly skipped: number } {
  // Deduplicate incoming first: same key keeps the newest timestamp (ties keep the later occurrence).
  const incomingByKey = new Map<string, T>()
  for (const item of incoming) {
    const key = keyOf(item)
    const prev = incomingByKey.get(key)
    if (prev === undefined || newerOf(item) >= newerOf(prev)) incomingByKey.set(key, item)
  }
  const merged = new Map<string, T>()
  for (const item of existing) merged.set(keyOf(item), item)
  let added = 0
  let updated = 0
  let skipped = 0
  for (const item of incomingByKey.values()) {
    const key = keyOf(item)
    const current = merged.get(key)
    if (current === undefined) {
      merged.set(key, item)
      added++
    } else if (newerOf(item) > newerOf(current)) {
      merged.set(key, item)
      updated++
    } else {
      skipped++
    }
  }
  // Preserve existing order (winners in place), then append new items in incoming order.
  const list: T[] = []
  const placed = new Set<string>()
  for (const item of existing) {
    const key = keyOf(item)
    const winner = merged.get(key)
    if (winner !== undefined && !placed.has(key)) {
      placed.add(key)
      list.push(winner)
    }
  }
  for (const item of incomingByKey.values()) {
    const key = keyOf(item)
    if (!placed.has(key)) {
      placed.add(key)
      list.push(item)
    }
  }
  return { list, added, updated, skipped }
}

/** Merge two history lists by exact text: duplicates and blanks are skipped, never overwritten. */
function mergeHistory(existing: readonly string[], incoming: readonly string[]): { readonly list: readonly string[]; readonly added: number; readonly skipped: number } {
  const list = [...existing]
  const seen = new Set(existing)
  let added = 0
  let skipped = 0
  for (const text of incoming) {
    if (text.trim() === '' || seen.has(text)) {
      skipped++
      continue
    }
    seen.add(text)
    list.push(text)
    added++
  }
  return { list, added, skipped }
}

/**
 * Import a backup document: parse, migrate, merge (keep-newest), and write
 * each namespace back through the existing store writers. History and
 * snippets respect the Config caps; templates and insights use their fixed
 * protocol caps.
 * @param storage - readable and writable storage.
 * @param json - the import document.
 * @param caps - history and snippet caps from Config (0 = unlimited).
 * @returns per-namespace added/updated/skipped counts.
 * @throws on invalid JSON, a foreign/unknown version, or malformed data.
 */
export function importBackupJson(storage: StorageLike, json: string, caps: ImportCaps): ImportReport {
  const { data } = parseBackup(json)

  const history = mergeHistory(loadEntries(storage, STORE_KEY), data.history)
  saveEntries(storage, STORE_KEY, caps.history > 0 ? history.list.slice(-caps.history) : history.list)

  const snippets = mergeByKey(loadSnippets(storage), data.snippets, item => item.name, item => item.updatedAt)
  saveSnippets(storage, caps.snippets > 0 ? snippets.list.slice(-caps.snippets) : snippets.list)

  const templates = mergeByKey(loadTemplates(storage), data.templates, item => item.name, item => item.updatedAt)
  saveTemplates(storage, templates.list.slice(-MAX_TEMPLATES))

  const insights = mergeByKey(loadUsage(storage), data.insights, item => item.text, item => item.lastUsedAt)
  saveUsage(storage, insights.list.slice(-MAX_INSIGHT_RECORDS))

  return {
    history: { added: history.added, skipped: history.skipped },
    snippets: { added: snippets.added, updated: snippets.updated, skipped: snippets.skipped },
    templates: { added: templates.added, updated: templates.updated, skipped: templates.skipped },
    insights: { added: insights.added, updated: insights.updated, skipped: insights.skipped },
  }
}

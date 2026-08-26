// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  BACKUP_SCHEMA_VERSION,
  exportBackupJson,
  importBackupJson,
  parseBackup,
  serializeBackup,
  type BackupData,
} from '../src/client/backup.ts'
import { STORE_KEY, loadEntries, saveEntries, type StorageLike } from '../src/client/history-store.ts'
import { loadSnippets, upsertSnippet } from '../src/client/snippets.ts'
import { loadTemplates, upsertTemplate } from '../src/client/templates.ts'
import { loadUsage, noteUsage } from '../src/client/insights.ts'

/** In-memory storage fake with the localStorage face. */
function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(initial))
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value) },
  }
}

function snippet(name: string, text: string, updatedAt: number): BackupData['snippets'][number] {
  return { name, text, tags: [], scope: 'global', createdAt: 1, updatedAt, useCount: 0, lastUsedAt: 0 }
}

const data: BackupData = {
  history: ['alpha', 'beta'],
  snippets: [snippet('ship-check', 'check the build', 2)],
  templates: [{ name: 'review', text: 'review {{file}}', description: 'code review', updatedAt: 5 }],
  insights: [{ text: 'deploy to prod', sessions: ['s1'], uses: 2, lastUsedAt: 6 }],
}

describe('serializeBackup and parseBackup', () => {
  it('round-trips every namespace through the versioned envelope', () => {
    const json = serializeBackup(data, 12345)
    const parsed = parseBackup(json)
    expect(parsed.schemaVersion).toBe(BACKUP_SCHEMA_VERSION)
    expect(parsed.exportedAt).toBe(12345)
    expect(parsed.data).toEqual(data)
    expect(JSON.parse(json)['schemaVersion']).toBe(BACKUP_SCHEMA_VERSION)
  })
})

describe('migrateBackup fail-closed', () => {
  it('rejects invalid JSON and foreign shapes', () => {
    expect(() => parseBackup('{oops')).toThrow(/not valid JSON/)
    expect(() => parseBackup('null')).toThrow(/JSON object/)
    expect(() => parseBackup(JSON.stringify({ schemaVersion: '1', data: {} }))).toThrow(/integer/)
  })

  it('rejects unknown newer and too-old schema versions', () => {
    expect(() => parseBackup(JSON.stringify({ schemaVersion: 2, data: {} }))).toThrow(/newer/)
    expect(() => parseBackup(JSON.stringify({ schemaVersion: 0, data: {} }))).toThrow(/too old/)
  })

  it('rejects malformed namespace data', () => {
    const envelope = { schemaVersion: 1, data: { history: [1], snippets: [], templates: [], insights: [] } }
    expect(() => parseBackup(JSON.stringify(envelope))).toThrow(/only strings/)
    const badSnippet = { schemaVersion: 1, data: { history: [], snippets: [{ name: 'x' }], templates: [], insights: [] } }
    expect(() => parseBackup(JSON.stringify(badSnippet))).toThrow(/malformed/)
  })
})

describe('importBackupJson merge and dedupe', () => {
  it('exports one storage and imports it into another across all namespaces', () => {
    const source = memoryStorage()
    saveEntries(source, STORE_KEY, ['alpha', 'beta'])
    upsertSnippet(source, { name: 'ship-check', text: 'check the build', tags: ['ops'], scope: 'global' }, 200)
    upsertTemplate(source, { name: 'review', text: 'review {{file}}', description: 'code review' })
    noteUsage(source, 'deploy to prod', 'session-1')

    const json = exportBackupJson(source)
    const target = memoryStorage()
    const report = importBackupJson(target, json, { history: 200, snippets: 200 })

    expect(loadEntries(target, STORE_KEY)).toEqual(['alpha', 'beta'])
    expect(loadSnippets(target).map(item => item.name)).toEqual(['ship-check'])
    expect(loadTemplates(target).map(item => item.name)).toEqual(['review'])
    expect(loadUsage(target).map(item => item.text)).toEqual(['deploy to prod'])
    expect(report.history.added).toBe(2)
    expect(report.snippets.added).toBe(1)
    expect(report.templates.added).toBe(1)
    expect(report.insights.added).toBe(1)
  })

  it('deduplicates history by exact text and skips blanks', () => {
    const target = memoryStorage()
    saveEntries(target, STORE_KEY, ['a'])
    const json = serializeBackup({ history: ['a', 'b', ''], snippets: [], templates: [], insights: [] }, 1)
    const report = importBackupJson(target, json, { history: 0, snippets: 0 })
    expect(loadEntries(target, STORE_KEY)).toEqual(['a', 'b'])
    expect(report.history.added).toBe(1)
    expect(report.history.skipped).toBe(2)
  })

  it('resolves same-name conflicts keep-newest-by-timestamp', () => {
    const target = memoryStorage({
      'dsh.composer-history.snippets.v1': JSON.stringify({ v: 1, snippets: [snippet('x', 'existing', 200)] }),
    })
    // Incoming older than the stored record → skipped, stored text kept.
    const older = serializeBackup({ history: [], snippets: [snippet('x', 'incoming-older', 100)], templates: [], insights: [] }, 1)
    const first = importBackupJson(target, older, { history: 0, snippets: 0 })
    expect(loadSnippets(target)[0]?.text).toBe('existing')
    expect(first.snippets.skipped).toBe(1)

    // Incoming newer → replaces the stored record (counted as updated).
    const newer = serializeBackup({ history: [], snippets: [snippet('x', 'incoming-newer', 300)], templates: [], insights: [] }, 1)
    const second = importBackupJson(target, newer, { history: 0, snippets: 0 })
    expect(loadSnippets(target)[0]?.text).toBe('incoming-newer')
    expect(second.snippets.updated).toBe(1)
  })

  it('respects the history and snippet caps', () => {
    const target = memoryStorage()
    const json = serializeBackup({ history: ['a', 'b', 'c'], snippets: [snippet('one', '1', 1), snippet('two', '2', 2)], templates: [], insights: [] }, 1)
    importBackupJson(target, json, { history: 2, snippets: 1 })
    expect(loadEntries(target, STORE_KEY)).toEqual(['b', 'c'])
    expect(loadSnippets(target).map(item => item.name)).toEqual(['two'])
  })
})

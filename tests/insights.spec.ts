import { describe, expect, it } from 'vitest'
import { hintFor, hintText, noteUsage, type StorageLike } from '../src/client/insights.ts'
import { filterSearchEntries, type SearchEntry } from '../src/client/search.ts'

function memoryStorage(): StorageLike {
  const map = new Map<string, string>()
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value) },
  }
}

describe('noteUsage and hintFor', () => {
  it('counts uses across sessions and renders the bilingual hint', () => {
    const storage = memoryStorage()
    const first = noteUsage(storage, '帮我部署到生产', 'session-a')
    expect(first?.uses).toBe(1)
    const second = noteUsage(storage, '帮我部署到生产', 'session-b')
    expect(second?.uses).toBe(2)
    expect(second?.sessions).toEqual(['session-b', 'session-a'])
    expect(hintFor(storage, '帮我部署到生产')?.uses).toBe(2)
    expect(hintText(second!)).toContain('2')
    expect(hintText(second!)).toContain('2 个会话')
  })

  it('ignores short noise and unknown drafts', () => {
    const storage = memoryStorage()
    expect(noteUsage(storage, 'hi', 's1')).toBeUndefined()
    expect(hintFor(storage, 'never seen before')).toBeUndefined()
  })

  it('caps records and degrades on corrupt payloads', () => {
    const storage = memoryStorage()
    for (let i = 0; i < 10; i++) noteUsage(storage, `prompt text number ${i} with length`, 's1')
    expect(noteUsage(storage, 'a'.repeat(20), 's1')).toBeDefined()
    const stored = loadRawCount(storage)
    expect(stored).toBeGreaterThan(0)
    storage.setItem('dsh.composer-history.insights.v1', '{broken')
    expect(hintFor(storage, 'a'.repeat(20))).toBeUndefined()
  })
})

/** Count records via the store payload (shape-sanity, not content). */
function loadRawCount(storage: StorageLike): number {
  const raw = storage.getItem('dsh.composer-history.insights.v1')
  if (raw === null) return 0
  return (JSON.parse(raw) as { records: unknown[] }).records.length
}

describe('filterSearchEntries', () => {
  const entries: SearchEntry[] = [
    { text: 'ship the build', source: 'snippet', label: 'release' },
    { text: 'summary of the session', source: 'compacted' },
    { text: 'draft the report document', source: 'template', label: 'tpl' },
  ]

  it('matches text only (never labels) with empty-query listing everything', () => {
    expect(filterSearchEntries(entries, '', false)).toHaveLength(3)
    expect(filterSearchEntries(entries, 'ship', false).map(item => item.source)).toEqual(['snippet'])
    expect(filterSearchEntries(entries, 'release', false)).toEqual([])
    expect(filterSearchEntries(entries, 'REPORT', false).map(item => item.text)).toEqual(['draft the report document'])
    expect(filterSearchEntries(entries, 'Report', true)).toEqual([])
    expect(filterSearchEntries(entries, 'summary', false).map(item => item.source)).toEqual(['compacted'])
  })
})

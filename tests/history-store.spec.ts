import { describe, expect, it } from 'vitest'
import { STORE_KEY, appendEntries, loadEntries, safeStorage, saveEntries, type StorageLike } from '../src/client/history-store.ts'

/** In-memory StorageLike double. */
function memoryStorage(seed: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(seed))
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value) },
  }
}

describe('loadEntries', () => {
  it('returns empty for an absent key', () => {
    expect(loadEntries(memoryStorage(), STORE_KEY)).toEqual([])
  })

  it('round-trips saved entries', () => {
    const storage = memoryStorage()
    saveEntries(storage, STORE_KEY, ['a', 'b'])
    expect(loadEntries(storage, STORE_KEY)).toEqual(['a', 'b'])
  })

  it('resets on corrupt JSON', () => {
    const storage = memoryStorage({ [STORE_KEY]: '{nope' })
    expect(loadEntries(storage, STORE_KEY)).toEqual([])
  })

  it('resets on a foreign or outdated payload shape', () => {
    expect(loadEntries(memoryStorage({ [STORE_KEY]: JSON.stringify({ v: 99, entries: ['a'] }) }), STORE_KEY)).toEqual([])
    expect(loadEntries(memoryStorage({ [STORE_KEY]: JSON.stringify({ v: 1, entries: 'a' }) }), STORE_KEY)).toEqual([])
    expect(loadEntries(memoryStorage({ [STORE_KEY]: JSON.stringify([1, 2]) }), STORE_KEY)).toEqual([])
  })

  it('drops non-string and blank entries', () => {
    const storage = memoryStorage({ [STORE_KEY]: JSON.stringify({ v: 1, entries: ['a', 5, '  ', null] }) })
    expect(loadEntries(storage, STORE_KEY)).toEqual(['a'])
  })
})

describe('appendEntries', () => {
  it('appends new entries preserving order and reports the additions', () => {
    const storage = memoryStorage()
    expect(appendEntries(storage, STORE_KEY, ['a', 'b'], 0)).toEqual(['a', 'b'])
    expect(appendEntries(storage, STORE_KEY, ['c'], 0)).toEqual(['c'])
    expect(loadEntries(storage, STORE_KEY)).toEqual(['a', 'b', 'c'])
  })

  it('skips exact duplicates already stored', () => {
    const storage = memoryStorage()
    appendEntries(storage, STORE_KEY, ['a', 'b'], 0)
    expect(appendEntries(storage, STORE_KEY, ['b', 'c', 'b'], 0)).toEqual(['c'])
    expect(loadEntries(storage, STORE_KEY)).toEqual(['a', 'b', 'c'])
  })

  it('skips blank entries', () => {
    const storage = memoryStorage()
    expect(appendEntries(storage, STORE_KEY, ['', '  ', '\n', 'a'], 0)).toEqual(['a'])
    expect(loadEntries(storage, STORE_KEY)).toEqual(['a'])
  })

  it('trims to the newest cap entries', () => {
    const storage = memoryStorage()
    appendEntries(storage, STORE_KEY, ['a', 'b', 'c', 'd'], 3)
    expect(loadEntries(storage, STORE_KEY)).toEqual(['b', 'c', 'd'])
  })

  it('writes nothing when nothing was added', () => {
    const storage = memoryStorage()
    saveEntries(storage, STORE_KEY, ['a'])
    let writes = 0
    const counting: StorageLike = {
      getItem: (key) => storage.getItem(key),
      setItem: (key, value) => {
        writes++
        storage.setItem(key, value)
      },
    }
    expect(appendEntries(counting, STORE_KEY, ['a'], 0)).toEqual([])
    expect(writes).toBe(0)
  })
})

describe('safeStorage', () => {
  it('returns undefined without a Storage', () => {
    expect(safeStorage(undefined)).toBeUndefined()
  })

  it('absorbs read and write failures', () => {
    const broken: Storage = {
      getItem: () => { throw new Error('denied') },
      setItem: () => { throw new Error('denied') },
    } as unknown as Storage
    const safe = safeStorage(broken)
    expect(safe).toBeDefined()
    expect(safe?.getItem(STORE_KEY)).toBeNull()
    expect(() => safe?.setItem(STORE_KEY, 'x')).not.toThrow()
  })
})

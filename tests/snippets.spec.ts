import { describe, expect, it } from 'vitest'
import { loadSnippets, noteSnippetUse, parseSnippetCommand, saveCommandText, upsertSnippet, validateSnippet, type StorageLike } from '../src/client/snippets.ts'

/** In-memory storage fake with the localStorage face. */
function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(initial))
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value) },
  }
}

describe('parseSnippetCommand', () => {
  it('parses /save with tags', () => {
    expect(parseSnippetCommand('/save ship-check --tag=release,ops')).toEqual({ verb: 'save', name: 'ship-check', tags: ['release', 'ops'] })
  })

  it('parses /load without tags', () => {
    expect(parseSnippetCommand('/load ship-check')).toEqual({ verb: 'load', name: 'ship-check', tags: [] })
  })

  it('rejects drafts that are not snippet commands', () => {
    expect(parseSnippetCommand('/save')).toBeUndefined()
    expect(parseSnippetCommand('/save Bad Name!')).toBeUndefined()
    expect(parseSnippetCommand('just text\n/save x')).toBeUndefined()
    expect(parseSnippetCommand('/export all')).toBeUndefined()
    expect(parseSnippetCommand('')).toBeUndefined()
  })
})

describe('saveCommandText', () => {
  it('strips the command line and trims the rest', () => {
    expect(saveCommandText('/save my-snippet\nline one\nline two\n')).toBe('line one\nline two')
    expect(saveCommandText('/save my-snippet')).toBe('')
  })
})

describe('snippet persistence', () => {
  it('saves, lists, replaces, and counts uses', () => {
    const storage = memoryStorage()
    const saved = upsertSnippet(storage, { name: 'ship-check', text: 'check the build', tags: ['ops'], scope: 'global' }, 200)
    expect(saved.useCount).toBe(0)
    expect(loadSnippets(storage)).toHaveLength(1)
    upsertSnippet(storage, { name: 'ship-check', text: 'check the build twice', tags: [], scope: 'global' }, 200)
    expect(loadSnippets(storage)).toHaveLength(1)
    expect(loadSnippets(storage)[0]?.text).toBe('check the build twice')
    const used = noteSnippetUse(storage, 'ship-check')
    expect(used?.useCount).toBe(1)
    expect(noteSnippetUse(storage, 'missing')).toBeUndefined()
  })

  it('caps the library to the newest entries', () => {
    const storage = memoryStorage()
    for (const name of ['a', 'b', 'c', 'd']) upsertSnippet(storage, { name, text: `text ${name}`, tags: [], scope: 'global' }, 3)
    expect(loadSnippets(storage).map(item => item.name)).toEqual(['b', 'c', 'd'])
  })

  it('degrades to empty on corrupt or foreign payloads', () => {
    expect(loadSnippets(memoryStorage())).toEqual([])
    const storage = memoryStorage()
    storage.setItem('dsh.composer-history.snippets.v1', '{not json')
    expect(loadSnippets(storage)).toEqual([])
    storage.setItem('dsh.composer-history.snippets.v1', JSON.stringify({ v: 9, snippets: [] }))
    expect(loadSnippets(storage)).toEqual([])
  })
})

describe('validateSnippet', () => {
  it('fails loudly on invalid names, empty text, and bad tags', () => {
    expect(() => validateSnippet('Bad Name', 'x', [])).toThrow(/kebab-case/)
    expect(() => validateSnippet('ok', '  ', [])).toThrow(/must not be empty/)
    expect(() => validateSnippet('ok', 'x', ['a'.repeat(33)])).toThrow(/invalid snippet tag/)
    expect(() => validateSnippet('ok', 'x', Array.from({ length: 9 }, (_, i) => `t${i}`))).toThrow(/at most 8 tags/)
    validateSnippet('ok', 'x', [])
  })
})

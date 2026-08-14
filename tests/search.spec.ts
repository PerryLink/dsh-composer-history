import { describe, expect, it } from 'vitest'
import { filterEntries } from '../src/client/search.ts'

const ENTRIES = ['first prompt', 'second prompt', 'FIRST draft', 'another']

describe('filterEntries', () => {
  it('lists everything for an empty query', () => {
    expect(filterEntries(ENTRIES, '', false)).toEqual(ENTRIES)
    expect(filterEntries(ENTRIES, '', true)).toEqual(ENTRIES)
  })

  it('filters by substring case-insensitively by default', () => {
    expect(filterEntries(ENTRIES, 'first', false)).toEqual(['first prompt', 'FIRST draft'])
  })

  it('filters case-sensitively when asked', () => {
    expect(filterEntries(ENTRIES, 'first', true)).toEqual(['first prompt'])
    expect(filterEntries(ENTRIES, 'FIRST', true)).toEqual(['FIRST draft'])
  })

  it('preserves original order and returns empty on no match', () => {
    expect(filterEntries(ENTRIES, 'prompt', false)).toEqual(['first prompt', 'second prompt'])
    expect(filterEntries(ENTRIES, 'zzz', false)).toEqual([])
  })
})

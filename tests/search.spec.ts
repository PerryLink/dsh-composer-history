import { describe, expect, it } from 'vitest'
import { filterEntries, matchRanges } from '../src/client/search.ts'

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

describe('matchRanges', () => {
  it('returns no ranges for an empty query', () => {
    expect(matchRanges('first prompt', '', false)).toEqual([])
    expect(matchRanges('first prompt', '', true)).toEqual([])
  })

  it('recovers every non-overlapping occurrence in source order', () => {
    expect(matchRanges('ab ab ab', 'ab', false)).toEqual([[0, 2], [3, 5], [6, 8]])
    expect(matchRanges('aaaa', 'aa', false)).toEqual([[0, 2], [2, 4]])
  })

  it('matches case-insensitively by default', () => {
    expect(matchRanges('First prompt', 'first', false)).toEqual([[0, 5]])
    expect(matchRanges('FIRST draft', 'first', false)).toEqual([[0, 5]])
  })

  it('matches case-sensitively when asked', () => {
    expect(matchRanges('First prompt', 'first', true)).toEqual([])
    expect(matchRanges('First prompt', 'First', true)).toEqual([[0, 5]])
  })

  it('returns no ranges when the query is absent', () => {
    expect(matchRanges('another', 'zzz', false)).toEqual([])
  })

  it('highlights occurrences that span a substring boundary once each', () => {
    expect(matchRanges('prompt prompt', 'prompt', false)).toEqual([[0, 6], [7, 13]])
  })
})

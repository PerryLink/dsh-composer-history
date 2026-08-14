import { describe, expect, it, vi } from 'vitest'
import { HistoryExtractor } from '../src/client/history-extract.ts'

interface FakeNode { readonly id: number }

describe('HistoryExtractor', () => {
  const nodes = (id: number): readonly FakeNode[] => [{ id }]

  it('extracts on first contact and memoizes by array reference', () => {
    const convert = vi.fn((list: readonly FakeNode[]) => [{ kind: 'user', texts: [`n${list[0]?.id}`] }])
    const extractor = new HistoryExtractor(['user'], 500, convert)
    const source = nodes(1)
    expect(extractor.extract(source)).toEqual(['n1'])
    expect(extractor.extract(source)).toEqual(['n1'])
    expect(convert).toHaveBeenCalledTimes(1)
  })

  it('recomputes when the array reference changes', () => {
    const convert = vi.fn((list: readonly FakeNode[]) => [{ kind: 'user', texts: [`n${list[0]?.id}`] }])
    const extractor = new HistoryExtractor(['user'], 500, convert)
    expect(extractor.extract(nodes(1))).toEqual(['n1'])
    expect(extractor.extract(nodes(2))).toEqual(['n2'])
    expect(convert).toHaveBeenCalledTimes(2)
  })

  it('caches the unlimited and capped shapes separately', () => {
    const convert = vi.fn(() => [
      { kind: 'user', texts: ['a'] },
      { kind: 'user', texts: ['b'] },
      { kind: 'user', texts: ['c'] },
    ])
    const extractor = new HistoryExtractor(['user'], 2, convert)
    const source = nodes(9)
    expect(extractor.extract(source, 0)).toEqual(['a', 'b', 'c'])
    expect(extractor.extract(source, 2)).toEqual(['b', 'c'])
    expect(extractor.extract(source, 0)).toEqual(['a', 'b', 'c'])
    expect(convert).toHaveBeenCalledTimes(2)
  })

  it('honors the configured kinds', () => {
    const extractor = new HistoryExtractor(['steering'], 0, () => [
      { kind: 'user', texts: ['u'] },
      { kind: 'steering', texts: ['s'] },
    ])
    expect(extractor.extract(nodes(1), 0)).toEqual(['s'])
  })
})

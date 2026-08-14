import { describe, expect, it } from 'vitest'
import { compactionAfter, latestCompactionSeq } from '../src/client/compaction-watch.ts'

interface NodeLike {
  readonly kind: string
  readonly seq: number
  readonly summary?: unknown
  readonly shadowedItemCount?: unknown
  readonly shadowedTokenCount?: unknown
}

const compaction = (seq: number, extra: Partial<NodeLike> = {}): NodeLike => ({
  kind: 'compaction',
  seq,
  summary: `summary ${seq}`,
  shadowedItemCount: 3,
  shadowedTokenCount: 1200,
  ...extra,
})
const user = (seq: number): NodeLike => ({ kind: 'user', seq })

describe('latestCompactionSeq', () => {
  it('returns undefined when no checkpoint exists', () => {
    expect(latestCompactionSeq([user(1), user(2)])).toBeUndefined()
  })

  it('returns the highest checkpoint seq in the snapshot', () => {
    expect(latestCompactionSeq([user(1), compaction(7), user(9), compaction(11)])).toBe(11)
  })

  it('ignores checkpoints without a numeric seq', () => {
    const broken = { kind: 'compaction', seq: 'x' } as unknown as NodeLike
    expect(latestCompactionSeq([broken, compaction(4)])).toBe(4)
  })
})

describe('compactionAfter', () => {
  it('reports nothing when no checkpoint follows the last reported seq', () => {
    expect(compactionAfter([user(1), compaction(7)], 7)).toBeUndefined()
  })

  it('reports the newest checkpoint strictly after the last reported seq', () => {
    const info = compactionAfter([user(1), compaction(7), compaction(9)], 7)
    expect(info?.seq).toBe(9)
  })

  it('treats an undefined baseline as reporting the newest present checkpoint', () => {
    const info = compactionAfter([compaction(3), compaction(5)], undefined)
    expect(info?.seq).toBe(5)
  })

  it('carries summary and count fields with foreign shapes normalized to null', () => {
    const info = compactionAfter([
      compaction(8, { summary: 'real', shadowedItemCount: 4, shadowedTokenCount: 900 }),
    ], 0)
    expect(info).toEqual({ seq: 8, summary: 'real', itemCount: 4, tokenCount: 900 })

    const degraded = compactionAfter([
      compaction(9, { summary: 42, shadowedItemCount: 'x', shadowedTokenCount: -1 }),
    ], 0)
    expect(degraded).toEqual({ seq: 9, summary: null, itemCount: null, tokenCount: null })
  })

  it('ignores other node kinds entirely', () => {
    expect(compactionAfter([user(4), { kind: 'assistant', seq: 6 }], 0)).toBeUndefined()
  })
})

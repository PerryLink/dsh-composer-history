import { describe, expect, it } from 'vitest'
import { COMPACTED_PREFIX, viewOfNode, viewOfNodes, type ConversationNode } from '../src/client/node-views.ts'

/** Loose structural stand-ins for the runtime node union (fields beyond the projection stay absent). */
const N = (node: object): ConversationNode => node as unknown as ConversationNode

const userNode = (texts: string[]) =>
  N({ kind: 'user', seq: 1, time: 0, content: texts.map(text => ({ type: 'text', text })), source: undefined })
const steeringNode = (texts: string[]) =>
  N({ kind: 'steering', seq: 2, time: 0, content: texts.map(text => ({ type: 'text', text })), source: undefined })
const compactionNode = (summary: string | null) =>
  N({ kind: 'compaction', seq: 3, time: 0, summary, summaryEventSeq: null, shadowedItemCount: null, shadowedTokenCount: null })
const assistantNode = () => N({ kind: 'assistant', seq: 4, time: 0, turn: 1, step: 1, blocks: [] })

describe('viewOfNode', () => {
  it('projects user nodes from their text blocks in source order', () => {
    expect(viewOfNode(userNode(['hello', 'world']))).toEqual({ kind: 'user', texts: ['hello', 'world'] })
  })

  it('projects steering nodes the same way', () => {
    expect(viewOfNode(steeringNode(['steer me']))).toEqual({ kind: 'steering', texts: ['steer me'] })
  })

  it('skips non-text blocks inside user content', () => {
    const node = N({
      kind: 'user',
      seq: 1,
      time: 0,
      content: [{ type: 'image', attachment: {} }, { type: 'text', text: 'keep' }],
      source: undefined,
    })
    expect(viewOfNode(node)).toEqual({ kind: 'user', texts: ['keep'] })
  })

  it('projects compaction checkpoints as prefixed summary entries', () => {
    expect(viewOfNode(compactionNode('earlier turns summarized')))
      .toEqual({ kind: 'compaction', texts: [`${COMPACTED_PREFIX}earlier turns summarized`] })
  })

  it('drops compaction markers whose summary is null or blank', () => {
    expect(viewOfNode(compactionNode(null))).toBeUndefined()
    expect(viewOfNode(compactionNode('   '))).toBeUndefined()
  })

  it('returns undefined for kinds without composer text', () => {
    expect(viewOfNode(assistantNode())).toBeUndefined()
    expect(viewOfNode(N({ kind: 'turn-error', seq: 5, time: 0, turn: 1, step: 1, message: 'x' }))).toBeUndefined()
  })
})

describe('viewOfNodes', () => {
  it('keeps source order and drops unviewable nodes', () => {
    const views = viewOfNodes([
      userNode(['first']),
      assistantNode(),
      compactionNode('summary'),
      userNode(['last']),
    ])
    expect(views).toEqual([
      { kind: 'user', texts: ['first'] },
      { kind: 'compaction', texts: [`${COMPACTED_PREFIX}summary`] },
      { kind: 'user', texts: ['last'] },
    ])
  })
})

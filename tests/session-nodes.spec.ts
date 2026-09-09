/**
 * Session-history read channel (CP-7): the structural accessors that resolve a
 * Session's Chat target and read ui-chat's compatibility projection. These
 * cases pin the two failure modes the wiring depends on — an inactive target
 * (getSnapshot undefined) and an unaddressable Session (binding throws) — plus
 * the projection read itself.
 */
import { describe, expect, it, vi } from 'vitest'
import { chatNodes, chatSourceFor, type ChatTargetSource, type UiConversationFace } from '../src/client/session-nodes.ts'
import type { ConversationNode } from '../src/client/node-views.ts'

const N = (node: object): ConversationNode => node as unknown as ConversationNode
const hello = N({ kind: 'user', seq: 1, content: [{ type: 'text', text: 'hello' }] })

/** One observable target source double; `activate` models the first subscribe. */
function fakeSource(initial: { legacy: { nodes: readonly ConversationNode[] } } | undefined): {
  source: ChatTargetSource
  subscribe: ReturnType<typeof vi.fn>
  unsubscribe: ReturnType<typeof vi.fn>
  activate(snapshot: { legacy: { nodes: readonly ConversationNode[] } }): void
} {
  let snapshot = initial
  const unsubscribe = vi.fn()
  const subscribe = vi.fn(() => unsubscribe)
  return {
    source: { getSnapshot: () => snapshot, subscribe },
    subscribe,
    unsubscribe,
    activate: (next) => { snapshot = next },
  }
}

describe('chatNodes', () => {
  it('reads the finalized nodes from the compatibility projection', () => {
    const { source } = fakeSource({ legacy: { nodes: [hello] } })
    expect(chatNodes(source)).toEqual([hello])
  })

  it('returns [] while the target is not activated (getSnapshot undefined)', () => {
    const { source } = fakeSource(undefined)
    expect(chatNodes(source)).toEqual([])
  })

  it('returns [] when the snapshot carries no legacy projection or no nodes', () => {
    expect(chatNodes({ getSnapshot: () => ({}), subscribe: () => () => {} })).toEqual([])
    expect(chatNodes({ getSnapshot: () => ({ legacy: {} }), subscribe: () => () => {} })).toEqual([])
  })
})

describe('chatSourceFor', () => {
  const serviceOf = (source: ChatTargetSource, binding = vi.fn((_id: string) => ({ target: () => source }))): {
    service: UiConversationFace
    binding: ReturnType<typeof vi.fn>
  } => ({ service: { binding }, binding })

  it('resolves the chat target for a Session id', () => {
    const { source } = fakeSource({ legacy: { nodes: [hello] } })
    const { service, binding } = serviceOf(source)
    expect(chatSourceFor(service, 's1')).toBe(source)
    expect(binding).toHaveBeenCalledWith('s1')
  })

  it('returns undefined without the service (host line without uiConversation)', () => {
    expect(chatSourceFor(undefined, 's1')).toBeUndefined()
  })

  it('swallows the host binding error for an unknown Session', () => {
    const service: UiConversationFace = {
      binding: () => { throw new Error('uiConversation.binding: unknown session "ghost"') },
    }
    expect(chatSourceFor(service, 'ghost')).toBeUndefined()
  })

  it('passes the source subscription disposer through unchanged', () => {
    const { source, subscribe, unsubscribe } = fakeSource({ legacy: { nodes: [] } })
    const { service } = serviceOf(source)
    const dispose = chatSourceFor(service, 's1')!.subscribe(() => {})
    expect(subscribe).toHaveBeenCalledTimes(1)
    dispose()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})

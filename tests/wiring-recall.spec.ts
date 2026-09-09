// @vitest-environment jsdom
/**
 * CP-7 wiring regression: the plugin's history channel is the ui-conversation
 * Chat target, whose snapshot only exists after activation. The real assembler
 * activates a target synchronously inside the first `subscribe`, so these
 * cases prove the wiring subscribes before its first read on both install
 * paths — a cold first install (Session already current) and a late mount
 * (Session arrives through the sessions-list subscription) — and that recall
 * and persistence therefore see real nodes instead of the `undefined → []`
 * that silently emptied them before the fix.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apply } from '../src/client/index.ts'
import { setComposerCaret } from '../src/client/composer-dom.ts'
import { STORE_KEY, loadEntries } from '../src/client/history-store.ts'
import type { ConversationNode } from '../src/client/node-views.ts'

const N = (node: object): ConversationNode => node as unknown as ConversationNode
const hello = N({ kind: 'user', seq: 1, content: [{ type: 'text', text: 'hello' }] })
const checkpoint = N({ kind: 'compaction', seq: 2, summary: 'earlier turns summarized' })

/** Real host composer shape: [data-input-scroll] > contenteditable div[data-composer-input]. */
function composerElement(): HTMLElement {
  const scroll = document.createElement('div')
  scroll.setAttribute('data-input-scroll', '')
  const composer = document.createElement('div')
  composer.setAttribute('data-composer-input', '')
  composer.setAttribute('contenteditable', 'true')
  scroll.appendChild(composer)
  document.body.appendChild(scroll)
  return composer
}

/**
 * Observable Chat target double: `getSnapshot()` is undefined until the first
 * subscribe, exactly like the host's BoundConversation before activation.
 */
function chatTarget(nodes: readonly ConversationNode[]) {
  let snapshot: { legacy: { nodes: readonly ConversationNode[] } } | undefined
  let current = nodes
  const listeners = new Set<() => void>()
  return {
    source: {
      getSnapshot: () => snapshot,
      subscribe: (listener: () => void): (() => void) => {
        snapshot = { legacy: { nodes: current } }
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
    },
    activated: () => snapshot !== undefined,
    subscriberCount: () => listeners.size,
    publish: (next: readonly ConversationNode[]) => {
      current = next
      snapshot = { legacy: { nodes: next } }
      for (const listener of listeners) listener()
    },
  }
}

/** Sessions-list double: a mutable snapshot plus manual notification. */
function sessionsList(initial: {
  current?: string | undefined
  ids: readonly string[]
  byId?: Record<string, { title?: string; blank?: boolean }> | undefined
}) {
  let snapshot = initial
  const listeners = new Set<() => void>()
  return {
    list: {
      getSnapshot: () => snapshot,
      subscribe: (listener: () => void): (() => void) => {
        listeners.add(listener)
        return () => { listeners.delete(listener) }
      },
    },
    set: (next: typeof initial) => {
      snapshot = next
      for (const listener of listeners) listener()
    },
    subscriberCount: () => listeners.size,
  }
}

/** Minimal client ctx over the doubles; returns the effect disposer and the setDraft spy. */
function harness(list: ReturnType<typeof sessionsList>, chat: ReturnType<typeof chatTarget>) {
  const actx = {}
  const draft = { text: '' }
  const setDraft = vi.fn((text: string) => { draft.text = text })
  let dispose: (() => void) | undefined
  const scope = {
    getSnapshot: () => ({ status: 'unavailable', value: undefined, writable: false, mode: 'memory' }),
    subscribe: (): (() => void) => () => {},
    set: (): Promise<void> => Promise.resolve(),
    unset: (): Promise<void> => Promise.resolve(),
  }
  const ctx = {
    effect: (fn: () => unknown): (() => void) => {
      dispose = fn() as (() => void) | undefined
      return () => dispose?.()
    },
    get: (name: string): unknown => {
      if (name === 'sessions') return { list: list.list, scope: () => actx }
      if (name === 'uiConversation') {
        return { binding: (_id: string) => ({ target: () => chat.source }) }
      }
      return undefined
    },
    settingsScope: { bind: () => scope },
    conversation: {
      input: {
        for: () => ({
          state: { getSnapshot: () => ({ draft: draft.text, phase: 'plain' }) },
          setDraft,
        }),
      },
    },
  }
  return { ctx, setDraft, dispose: () => dispose?.() }
}

/** Dispatch one ArrowUp at the composer's first line and report the takeover. */
function pressArrowUp(composer: HTMLElement): KeyboardEvent {
  setComposerCaret(composer, 0)
  const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
  composer.dispatchEvent(event)
  return event
}

describe('Chat-target history wiring (CP-7)', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
    localStorage.clear()
  })

  it('cold install: subscribes (activating the target) before the first read', () => {
    const list = sessionsList({ current: 's1', ids: ['s1'], byId: { s1: { title: 't', blank: false } } })
    const chat = chatTarget([hello])
    const h = harness(list, chat)

    // Before the fix this path threw TypeError (nodes undefined) or read [].
    expect(() => { apply(h.ctx as unknown as Parameters<typeof apply>[0]) }).not.toThrow()
    expect(chat.activated()).toBe(true)

    // The reconcile read real nodes: the user message reached the persisted store.
    expect(loadEntries(localStorage, STORE_KEY)).toEqual(['hello'])

    const composer = composerElement()
    const event = pressArrowUp(composer)
    expect(event.defaultPrevented).toBe(true)
    expect(h.setDraft).toHaveBeenCalledWith('hello')
  })

  it('late mount: re-targets when the current Session arrives after install', () => {
    const list = sessionsList({ current: undefined, ids: [], byId: {} })
    const chat = chatTarget([hello])
    const h = harness(list, chat)
    apply(h.ctx as unknown as Parameters<typeof apply>[0])
    expect(chat.activated()).toBe(false)

    // The sessions list publishes the current Session: the list subscription
    // must reconcile against the newly addressable Chat target.
    list.set({ current: 's1', ids: ['s1'], byId: { s1: { title: 't', blank: false } } })
    expect(chat.activated()).toBe(true)
    expect(loadEntries(localStorage, STORE_KEY)).toEqual(['hello'])

    const composer = composerElement()
    expect(pressArrowUp(composer).defaultPrevented).toBe(true)
    expect(h.setDraft).toHaveBeenCalledWith('hello')
  })

  it('observes checkpoints published through the Chat subscription', () => {
    const list = sessionsList({ current: 's1', ids: ['s1'], byId: { s1: { title: 't', blank: false } } })
    const chat = chatTarget([hello])
    const h = harness(list, chat)
    apply(h.ctx as unknown as Parameters<typeof apply>[0])
    expect(document.body.textContent).not.toContain('earlier turns summarized')

    chat.publish([hello, checkpoint])
    expect(document.body.textContent).toContain('earlier turns summarized')
    h.dispose()
  })

  it('dispose drops the Chat-target and list subscriptions', () => {
    const list = sessionsList({ current: 's1', ids: ['s1'], byId: { s1: { title: 't', blank: false } } })
    const chat = chatTarget([hello])
    const h = harness(list, chat)
    apply(h.ctx as unknown as Parameters<typeof apply>[0])
    expect(chat.subscriberCount()).toBe(1)

    h.dispose()
    expect(chat.subscriberCount()).toBe(0)
    expect(list.subscriberCount()).toBe(0)
  })
})

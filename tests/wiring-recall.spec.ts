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
import * as notices from '../src/client/compaction-notice.ts'
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
  const snapshotOf = (messages: readonly ConversationNode[]) => ({
    legacy: { nodes: messages },
    // Real 0.2.1-rc.2 targets also publish renderer nodes without content.
    nodes: { values: () => messages.map(node => ({ kind: node.kind, data: node })) },
  })
  let snapshot: ReturnType<typeof snapshotOf> | undefined
  type ChangeKind = 'replace' | 'append' | 'prepend'
  const entriesOf = (items: readonly ConversationNode[]) => items.map(({ seq, kind }) => ({
    event: { seq, type: kind === 'steering' ? 'user/steering' : 'user/message' },
  }))
  const changeOf = (kind: ChangeKind, items: readonly ConversationNode[]) => ({ kind, entries: entriesOf(items) })
  let current = nodes
  let window = { revision: 0, change: changeOf('replace', nodes) }
  const listeners = new Set<() => void>()
  return {
    source: {
      getSnapshot: () => snapshot,
      subscribe: (listener: () => void): (() => void) => {
        listeners.add(listener)
        if (snapshot === undefined) {
          snapshot = snapshotOf(current)
          listener()
        }
        return () => { listeners.delete(listener) }
      },
    },
    eventSource: { getSnapshot: () => window },
    activated: () => snapshot !== undefined,
    subscriberCount: () => listeners.size,
    publish: (kind: ChangeKind, delta: readonly ConversationNode[]) => {
      if (kind === 'replace') current = delta
      else if (kind === 'prepend') current = [...delta, ...current]
      else current = [...current, ...delta]
      window = { revision: window.revision + 1, change: changeOf(kind, delta) }
      // The assembler reads the updated event window and publishes Chat before other feed listeners run.
      if (snapshot !== undefined) {
        snapshot = snapshotOf(current)
        for (const listener of listeners) listener()
      }
    },
  }
}

/** Sessions-list double: a mutable snapshot plus manual notification. */
function sessionsList(initial: {
  current?: string | undefined
  ids: readonly string[]
  byId?: Record<string, { title?: string; blank?: boolean; retainedBy?: { mainView?: number } }> | undefined
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
function harness(list: ReturnType<typeof sessionsList>, chats: Record<string, ReturnType<typeof chatTarget>>) {
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
      if (name === 'sessions') {
        return { list: list.list, scope: () => actx, binding: (id: string) => ({ eventSource: chats[id]!.eventSource }) }
      }
      if (name === 'uiConversation') {
        return { binding: (id: string) => ({ target: () => chats[id]!.source }) }
      }
      return undefined
    },
    configForms: { get: () => scope },
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
    const h = harness(list, { s1: chat })

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

  it('boots with field references and recalls raw messages from a dual-shape Chat target', () => {
    const list = sessionsList({ current: 's1', ids: ['s1'] })
    const chat = chatTarget([hello])
    const h = harness(list, { s1: chat })
    const bootConfig = { recallWithDraft: { get: () => 'save' }, maxHistory: { get: () => 500 } }
    expect(() => apply(h.ctx as unknown as Parameters<typeof apply>[0],
      bootConfig as unknown as Parameters<typeof apply>[1])).not.toThrow()
    expect(loadEntries(localStorage, STORE_KEY)).toEqual(['hello'])
    expect(pressArrowUp(composerElement()).defaultPrevented).toBe(true)
    expect(h.setDraft).toHaveBeenCalledWith('hello')
    h.dispose()
  })

  it('late mount: re-targets when the current Session arrives after install', () => {
    const list = sessionsList({ current: undefined, ids: [], byId: {} })
    const chat = chatTarget([hello])
    const h = harness(list, { s1: chat })
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

  it('derives the current session from the main-view retention when `current` is gone (B5)', () => {
    // The 0.1.6 line removed SessionListState.current: the snapshot only
    // carries retention facts, so the wiring must pick the session the main
    // view holds (retainedBy.mainView > 0) instead of degrading to undefined.
    const list = sessionsList({
      current: undefined,
      ids: ['s1', 's2'],
      byId: { s1: { title: 'other', blank: false }, s2: { title: 'main', blank: false, retainedBy: { mainView: 1 } } },
    })
    const chat = chatTarget([hello])
    const h = harness(list, { s1: chatTarget([]), s2: chat })
    apply(h.ctx as unknown as Parameters<typeof apply>[0])
    expect(chat.activated()).toBe(true)

    const composer = composerElement()
    expect(pressArrowUp(composer).defaultPrevented).toBe(true)
    expect(h.setDraft).toHaveBeenCalledWith('hello')
    h.dispose()
  })

  it('observes checkpoints published through the Chat subscription', () => {
    const list = sessionsList({ current: 's1', ids: ['s1'], byId: { s1: { title: 't', blank: false } } })
    const chat = chatTarget([hello])
    const h = harness(list, { s1: chat })
    apply(h.ctx as unknown as Parameters<typeof apply>[0])
    expect(document.body.textContent).not.toContain('earlier turns summarized')

    chat.publish('append', [checkpoint])
    expect(document.body.textContent).toContain('earlier turns summarized')
    h.dispose()
  })

  it('keeps a checkpoint from synchronous Chat activation silent', () => {
    const list = sessionsList({ current: 's1', ids: ['s1'] })
    const h = harness(list, { s1: chatTarget([hello, checkpoint]) })
    try {
      apply(h.ctx as unknown as Parameters<typeof apply>[0])
      expect(document.body.textContent).not.toContain('earlier turns summarized')
    } finally { h.dispose() }
  })

  it.each(['replace', 'prepend'] as const)('keeps a history %s silent after an empty checkpoint baseline', (kind) => {
    const list = sessionsList({ current: 's1', ids: ['s1'] })
    const recent = N({ kind: 'user', seq: 9, content: [{ type: 'text', text: 'recent' }] })
    const chat = chatTarget(kind === 'replace' ? [] : [recent])
    const h = harness(list, { s1: chat })
    try {
      apply(h.ctx as unknown as Parameters<typeof apply>[0])
      chat.publish(kind, [hello, checkpoint])
      expect(document.body.textContent).not.toContain('earlier turns summarized')
      expect(loadEntries(localStorage, STORE_KEY)).toContain('hello')
      chat.publish('append', [N({ kind: 'user', seq: 10, content: [{ type: 'text', text: 'next' }] })])
      expect(document.body.textContent).not.toContain('earlier turns summarized')
    } finally { h.dispose() }
  })

  it('announces one active append across repeated list updates and keeps inactive appends silent on return', () => {
    // show() refreshes the same DOM element, so counting visible elements would miss duplicate calls.
    const createNotice = notices.createCompactionNotice
    const shown = vi.fn()
    vi.spyOn(notices, 'createCompactionNotice').mockImplementation(deps => {
      const notice = createNotice(deps)!
      return { ...notice, show(info) { shown(info.seq); notice.show(info) } }
    })
    const session = (current: string) => ({ current, ids: ['s1', 's2'] })
    const list = sessionsList(session('s1'))
    const s1 = chatTarget([hello])
    const s2 = chatTarget([hello])
    const h = harness(list, { s1, s2 })
    try {
      apply(h.ctx as unknown as Parameters<typeof apply>[0])
      list.set(session('s2'))
      s1.publish('append', [checkpoint])
      list.set(session('s1'))
      list.set(session('s1'))
      expect(shown).not.toHaveBeenCalled()

      // Independent sessions can use the same revision and event seq.
      list.set(session('s2'))
      list.set(session('s2'))
      s2.publish('append', [checkpoint])
      expect(document.body.textContent).toContain('earlier turns summarized')
      list.set(session('s2'))
      list.set(session('s1'))
      list.set(session('s2'))
      expect(shown.mock.calls).toEqual([[checkpoint.seq]])
    } finally { h.dispose() }
  })

  it('dispose drops the Chat-target and list subscriptions', () => {
    const list = sessionsList({ current: 's1', ids: ['s1'], byId: { s1: { title: 't', blank: false } } })
    const chat = chatTarget([hello])
    const h = harness(list, { s1: chat })
    apply(h.ctx as unknown as Parameters<typeof apply>[0])
    expect(chat.subscriberCount()).toBe(1)

    h.dispose()
    expect(chat.subscriberCount()).toBe(0)
    expect(list.subscriberCount()).toBe(0)
  })
})

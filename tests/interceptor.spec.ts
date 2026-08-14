// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createComposerHistory, type ComposerHistoryHost } from '../src/client/interceptor.ts'
import type { HistoryNodeView } from '../src/client/recall.ts'
import type { ComposerHistoryConfig } from '../src/client/config.ts'

const CONFIG: ComposerHistoryConfig = {
  recallWithDraft: 'save',
  restoreOnEscape: true,
  edgeMode: 'logical',
  enableCtrlAlias: true,
  restoreCaret: true,
  upKey: 'ArrowUp',
  downKey: 'ArrowDown',
  escapeKey: 'Escape',
  maxHistory: 500,
  includeKinds: ['user'],
  historyScope: 'session',
  persistHistory: true,
  maxPersisted: 200,
  enableSearch: true,
  searchKeys: ['Ctrl+R'],
  searchCaseSensitive: false,
  includeCompactionSummaries: true,
  showCompactionNotice: true,
  compactCommandText: '/compact',
}

const user = (text: string): HistoryNodeView => ({ kind: 'user', texts: [text] })

/** Window-capture listeners registered by fixtures (removed between tests). */
const cleanups: Array<() => void> = []

interface Fixture {
  composer: HTMLTextAreaElement
  scroll: HTMLElement
  handle: ReturnType<typeof createComposerHistory>
  historyNodes: HistoryNodeView[]
  supplemental: HistoryNodeView[]
  setDraftCalls: string[]
  searchCalls: string[][]
  /** Bubble-phase witness on the composer: fires only when propagation survives. */
  witness: ReturnType<typeof vi.fn>
  dispatchKey(key: string, init?: KeyboardEventInit): KeyboardEvent
  typeInto(text: string): void
  setDraftText(text: string): void
  flushFrames(count?: number): Promise<void>
  setMenuOpen(open: boolean): void
  setPhase(phase: string): void
  setSession(id: string): void
}

function fixture(overrides: Partial<ComposerHistoryHost> = {}, config: ComposerHistoryConfig = CONFIG): Fixture {
  const composer = document.createElement('textarea')
  const scroll = document.createElement('div')
  scroll.setAttribute('data-input-scroll', '')
  scroll.appendChild(composer)
  document.body.appendChild(scroll)

  let phase = 'plain'
  let draft = ''
  let menuOpen = false
  let sessionKey = 's1'
  const historyNodes: HistoryNodeView[] = [user('one'), user('two')]
  const supplemental: HistoryNodeView[] = []
  const setDraftCalls: string[] = []
  const searchCalls: string[][] = []

  const host: ComposerHistoryHost = {
    composerOf: target =>
      target instanceof HTMLTextAreaElement && target.closest('[data-input-scroll]') !== null
        ? target
        : undefined,
    sessionKey: () => sessionKey,
    inputState: () => ({ draft, phase }),
    history: () => historyNodes,
    supplementalHistory: () => supplemental.map(node => node.texts.join('\n')),
    menuOpen: () => menuOpen,
    setDraft: (_composer, text) => {
      draft = text
      composer.value = text
      setDraftCalls.push(text)
    },
    openSearch: (_composer, history) => {
      searchCalls.push([...history])
    },
    ...overrides,
  }

  const handle = createComposerHistory(host, config)
  window.addEventListener('keydown', handle.keydown, true)
  window.addEventListener('input', handle.input, true)
  cleanups.push(() => {
    window.removeEventListener('keydown', handle.keydown, true)
    window.removeEventListener('input', handle.input, true)
    handle.dispose()
  })
  const witness = vi.fn()
  composer.addEventListener('keydown', witness)

  const dispatchKey = (key: string, init: KeyboardEventInit = {}): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
    composer.dispatchEvent(event)
    return event
  }

  // Mimics the composer wiring: the edit lands in the DOM value immediately
  // and in the input-machine draft via the bubble-phase onChange.
  const typeInto = (text: string): void => {
    composer.value = text
    draft = text
    composer.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
  }

  const setDraftText = (text: string): void => {
    draft = text
    composer.value = text
  }

  const flushFrames = async (count = 2): Promise<void> => {
    for (let i = 0; i < count; i++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
  }

  return {
    composer,
    scroll,
    handle,
    historyNodes,
    supplemental,
    setDraftCalls,
    searchCalls,
    witness,
    dispatchKey,
    typeInto,
    setDraftText,
    flushFrames,
    setMenuOpen: open => { menuOpen = open },
    setPhase: value => { phase = value },
    setSession: id => { sessionKey = id },
  }
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('takeover discipline', () => {
  it('prevents default and stops propagation only on takeover, then fills and moves the caret', async () => {
    const fx = fixture()
    fx.composer.focus()
    fx.composer.setSelectionRange(0, 0)
    const event = fx.dispatchKey('ArrowUp')
    expect(event.defaultPrevented).toBe(true)
    expect(fx.witness).not.toHaveBeenCalled()
    expect(fx.setDraftCalls).toEqual(['two'])
    expect(fx.handle.state()).toMatchObject({ kind: 'browsing', index: 1, savedDraft: '', savedCaret: 0 })
    await fx.flushFrames()
    expect(fx.composer.selectionStart).toBe('two'.length)
    expect(fx.composer.selectionEnd).toBe('two'.length)
  })

  it('hold at the oldest entry intercepts without any mutation', async () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp')
    fx.dispatchKey('ArrowUp')
    expect(fx.handle.state()).toMatchObject({ kind: 'browsing', index: 0 })
    const event = fx.dispatchKey('ArrowUp')
    expect(event.defaultPrevented).toBe(true)
    expect(fx.witness).not.toHaveBeenCalled()
    expect(fx.setDraftCalls).toEqual(['two', 'one'])
  })

  it('pass paths leave the event untouched (no preventDefault, propagation intact)', () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    const cases: Array<[string, KeyboardEventInit, (fx: Fixture) => void]> = [
      ['live ArrowDown', { key: 'ArrowDown' }, () => {}],
      ['shift modifier', { key: 'ArrowUp', shiftKey: true }, () => {}],
      ['alt modifier', { key: 'ArrowUp', altKey: true }, () => {}],
      ['meta modifier', { key: 'ArrowUp', metaKey: true }, () => {}],
      ['IME composition', { key: 'ArrowUp', isComposing: true }, () => {}],
      ['menu open', { key: 'ArrowUp' }, fx => fx.setMenuOpen(true)],
      ['non-plain phase', { key: 'ArrowUp' }, fx => fx.setPhase('submitting')],
    ]
    for (const [label, init, prepare] of cases) {
      prepare(fx)
      fx.witness.mockClear()
      const event = fx.dispatchKey(init.key ?? 'ArrowUp', init)
      expect(event.defaultPrevented, label).toBe(false)
      expect(fx.witness, label).toHaveBeenCalledTimes(1)
    }
    expect(fx.setDraftCalls).toEqual([])
  })

  it('ctrl alias off passes ctrl+up; on it takes over', () => {
    const off = fixture({}, { ...CONFIG, enableCtrlAlias: false })
    off.composer.setSelectionRange(0, 0)
    const pass = off.dispatchKey('ArrowUp', { ctrlKey: true })
    expect(pass.defaultPrevented).toBe(false)
    expect(off.witness).toHaveBeenCalledTimes(1)

    const on = fixture()
    on.composer.setSelectionRange(0, 0)
    const take = on.dispatchKey('ArrowUp', { ctrlKey: true })
    expect(take.defaultPrevented).toBe(true)
    expect(on.witness).not.toHaveBeenCalled()
  })

  it('a selection blocks recall and leaves the event alone', () => {
    const fx = fixture()
    fx.setDraftText('abc')
    fx.composer.setSelectionRange(0, 3)
    const event = fx.dispatchKey('ArrowUp')
    expect(event.defaultPrevented).toBe(false)
    expect(fx.witness).toHaveBeenCalledTimes(1)
  })

  it('focus outside the composer is inert', () => {
    const fx = fixture()
    const other = document.createElement('textarea')
    document.body.appendChild(other)
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    other.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(fx.setDraftCalls).toEqual([])
  })
})

describe('browse cycle', () => {
  it('recalls, walks, and restores the stashed draft and caret exactly', async () => {
    const fx = fixture()
    fx.setDraftText('hello')
    fx.composer.setSelectionRange(5, 5)
    fx.dispatchKey('ArrowUp') // stash hello, fill 'two'
    expect(fx.setDraftCalls).toEqual(['two'])
    fx.dispatchKey('ArrowUp') // fill 'one'
    expect(fx.setDraftCalls).toEqual(['two', 'one'])
    fx.dispatchKey('ArrowDown') // fill 'two'
    expect(fx.setDraftCalls).toEqual(['two', 'one', 'two'])
    fx.dispatchKey('ArrowDown') // restore 'hello' + caret 5
    expect(fx.setDraftCalls).toEqual(['two', 'one', 'two', 'hello'])
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
    await fx.flushFrames()
    expect(fx.composer.value).toBe('hello')
    expect(fx.composer.selectionStart).toBe(5)
  })

  it('restores an empty draft to empty', async () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp')
    fx.dispatchKey('ArrowDown')
    expect(fx.setDraftCalls).toEqual(['two', ''])
    expect(fx.composer.value).toBe('')
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
  })

  it('multiline: middle-line arrows only move the caret, edges recall', () => {
    const fx = fixture()
    fx.setDraftText('a\nb\nc')
    // caret 3 = start of the middle line
    fx.composer.setSelectionRange(3, 3)
    const midUp = fx.dispatchKey('ArrowUp')
    const midDown = fx.dispatchKey('ArrowDown')
    expect(midUp.defaultPrevented).toBe(false)
    expect(midDown.defaultPrevented).toBe(false)
    expect(fx.setDraftCalls).toEqual([])
    // first line recalls
    fx.composer.setSelectionRange(0, 0)
    const top = fx.dispatchKey('ArrowUp')
    expect(top.defaultPrevented).toBe(true)
    expect(fx.setDraftCalls).toEqual(['two'])
  })

  it('escape restores immediately and consumes the key', async () => {
    const fx = fixture()
    fx.setDraftText('hello')
    fx.composer.setSelectionRange(5, 5)
    fx.dispatchKey('ArrowUp')
    const event = fx.dispatchKey('Escape')
    expect(event.defaultPrevented).toBe(true)
    expect(fx.witness).not.toHaveBeenCalled()
    expect(fx.setDraftCalls).toEqual(['two', 'hello'])
    await fx.flushFrames()
    expect(fx.composer.selectionStart).toBe(5)
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
  })

  it('escape passes when restoreOnEscape is off', () => {
    const fx = fixture({}, { ...CONFIG, restoreOnEscape: false })
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp')
    const event = fx.dispatchKey('Escape')
    expect(event.defaultPrevented).toBe(false)
    expect(fx.handle.state()).toMatchObject({ kind: 'browsing' })
  })
})

describe('divergence and reset', () => {
  it('editing a recalled entry ends browsing and the edit becomes the next stash', () => {
    const fx = fixture()
    fx.setDraftText('draft')
    fx.composer.setSelectionRange(5, 5)
    fx.dispatchKey('ArrowUp') // browsing 'two', stashed 'draft'
    fx.typeInto('two more') // user edited the recall
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
    // next recall stashes the edited text and restores it on the way back
    fx.dispatchKey('ArrowUp')
    fx.dispatchKey('ArrowDown')
    expect(fx.setDraftCalls).toEqual(['two', 'two', 'two more'])
  })

  it('an input event with the recalled value unchanged keeps browsing', () => {
    const fx = fixture()
    fx.setDraftText('')
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp')
    fx.typeInto('two') // same text re-entered via an input event
    expect(fx.handle.state()).toMatchObject({ kind: 'browsing', index: 1 })
  })

  it('a session switch resets to idle before the next key', () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp')
    expect(fx.handle.state()).toMatchObject({ kind: 'browsing' })
    fx.setSession('s2')
    fx.dispatchKey('ArrowDown')
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
  })

  it('a programmatic send-clear resets browsing at the next key', () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp')
    fx.setDraftText('') // send committed: draft cleared without an input event
    fx.dispatchKey('ArrowDown')
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
    expect(fx.setDraftCalls).toEqual(['two'])
  })
})

describe('fresh history extraction', () => {
  it('picks up a newly appended message on the next down press', () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp') // browsing 'two' (index 1)
    fx.historyNodes.push(user('three'))
    fx.dispatchKey('ArrowDown') // fill the new newest
    expect(fx.setDraftCalls).toEqual(['two', 'three'])
    expect(fx.handle.state()).toMatchObject({ kind: 'browsing', index: 2 })
    fx.dispatchKey('ArrowDown') // newest again -> restore
    expect(fx.setDraftCalls).toEqual(['two', 'three', ''])
  })

  it('prepends supplemental entries before the current session', async () => {
    const fx = fixture()
    fx.supplemental.push(user('zero'), user('one'))
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp') // fills the newest (current 'two')
    expect(fx.setDraftCalls).toEqual(['two'])
    expect(fx.handle.state()).toMatchObject({
      kind: 'browsing',
      index: 2,
      history: ['zero', 'one', 'two'],
    })
    fx.dispatchKey('ArrowUp') // 'one' (supplemental duplicate of a current entry dropped earlier)
    expect(fx.setDraftCalls).toEqual(['two', 'one'])
    fx.dispatchKey('ArrowUp') // 'zero'
    expect(fx.setDraftCalls).toEqual(['two', 'one', 'zero'])
  })
})

describe('reverse search', () => {
  it('Ctrl+R opens the search with the merged history and consumes the key', () => {
    const fx = fixture()
    fx.supplemental.push(user('zero'))
    fx.composer.setSelectionRange(0, 0)
    const event = fx.dispatchKey('r', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(true)
    expect(fx.witness).not.toHaveBeenCalled()
    expect(fx.searchCalls).toEqual([['zero', 'one', 'two']])
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
  })

  it('starting a search ends browsing without touching the draft', () => {
    const fx = fixture()
    fx.setDraftText('hello')
    fx.composer.setSelectionRange(5, 5)
    fx.dispatchKey('ArrowUp') // browsing 'two'
    expect(fx.handle.state()).toMatchObject({ kind: 'browsing' })
    fx.dispatchKey('r', { ctrlKey: true })
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
    expect(fx.setDraftCalls).toEqual(['two'])
  })

  it('does not re-open on key repeat', () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('r', { ctrlKey: true, repeat: true })
    expect(fx.searchCalls).toEqual([])
  })

  it('passes through while searching is disabled', () => {
    const fx = fixture({}, { ...CONFIG, enableSearch: false })
    fx.composer.setSelectionRange(0, 0)
    const event = fx.dispatchKey('r', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(fx.witness).toHaveBeenCalledTimes(1)
  })

  it('passes through chords that do not match the configured specs', () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    const event = fx.dispatchKey('k', { ctrlKey: true })
    expect(event.defaultPrevented).toBe(false)
    expect(fx.searchCalls).toEqual([])
  })

  it('gates on phase, menu, and selection like recall', () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    fx.setPhase('submitting')
    fx.dispatchKey('r', { ctrlKey: true })
    fx.setPhase('plain')
    fx.setMenuOpen(true)
    fx.dispatchKey('r', { ctrlKey: true })
    fx.setMenuOpen(false)
    fx.setDraftText('abc')
    fx.composer.setSelectionRange(0, 3)
    fx.dispatchKey('r', { ctrlKey: true })
    expect(fx.searchCalls).toEqual([])
  })
})

describe('compaction summaries in history', () => {
  const compacted = (text: string): HistoryNodeView => ({ kind: 'compaction', texts: [`[compacted] ${text}`] })

  it('admits compaction summary views into recall when enabled', async () => {
    const fx = fixture()
    fx.historyNodes.push(compacted('earlier work'))
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp') // newest entry is the checkpoint summary
    expect(fx.setDraftCalls).toEqual(['[compacted] earlier work'])
    expect(fx.handle.state()).toMatchObject({ kind: 'browsing', index: 2 })
    await fx.flushFrames()
    expect(fx.composer.value).toBe('[compacted] earlier work')
  })

  it('skips compaction views when includeCompactionSummaries is off', () => {
    const fx = fixture({}, { ...CONFIG, includeCompactionSummaries: false })
    fx.historyNodes.push(compacted('earlier work'))
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp')
    expect(fx.setDraftCalls).toEqual(['two'])
  })

  it('includes summaries in the reverse-search history', () => {
    const fx = fixture()
    fx.historyNodes.push(compacted('earlier work'))
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('r', { ctrlKey: true })
    expect(fx.searchCalls).toEqual([['one', 'two', '[compacted] earlier work']])
  })

  it('walks out of a recalled summary like any other entry', () => {
    const fx = fixture()
    fx.historyNodes.push(compacted('earlier work'))
    fx.composer.setSelectionRange(0, 0)
    fx.dispatchKey('ArrowUp') // summary
    fx.dispatchKey('ArrowUp') // 'two'
    fx.dispatchKey('ArrowDown') // summary again
    expect(fx.setDraftCalls).toEqual([
      '[compacted] earlier work',
      'two',
      '[compacted] earlier work',
    ])
  })
})

describe('key remapping', () => {
  it('honors remapped up/down/escape keys', async () => {
    const fx = fixture({}, { ...CONFIG, upKey: 'PageUp', downKey: 'PageDown', escapeKey: 'q' })
    fx.setDraftText('hello')
    fx.composer.setSelectionRange(5, 5)
    fx.dispatchKey('PageUp')
    expect(fx.setDraftCalls).toEqual(['two'])
    fx.dispatchKey('q')
    expect(fx.setDraftCalls).toEqual(['two', 'hello'])
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
  })

  it('an empty key name disables that key', () => {
    const fx = fixture({}, { ...CONFIG, upKey: '' })
    fx.composer.setSelectionRange(0, 0)
    const event = fx.dispatchKey('ArrowUp')
    expect(event.defaultPrevented).toBe(false)
    expect(fx.setDraftCalls).toEqual([])
  })
})

describe('fill and dispose', () => {
  it('fill writes the text and moves the caret to its end', async () => {
    const fx = fixture()
    fx.composer.setSelectionRange(0, 0)
    fx.handle.fill(fx.composer, 'picked')
    expect(fx.setDraftCalls).toEqual(['picked'])
    expect(fx.handle.state()).toEqual({ kind: 'idle' })
    await fx.flushFrames()
    expect(fx.composer.selectionStart).toBe('picked'.length)
  })

  it('dispose cancels a pending caret frame', async () => {
    const fx = fixture()
    const spy = vi.spyOn(fx.composer, 'setSelectionRange')
    fx.handle.fill(fx.composer, 'later') // schedules a caret frame for the fill
    fx.handle.dispose()
    fx.composer.value = 'changed-before-frame'
    await fx.flushFrames()
    expect(spy).not.toHaveBeenCalled()
  })

  it('malformed search chord specs throw at construction', () => {
    expect(() => createComposerHistory({} as ComposerHistoryHost, { ...CONFIG, searchKeys: ['Ctrl+'] })).toThrow()
  })
})

import { describe, expect, it } from 'vitest'
import {
  DraftRecall, downAtLogicalEdge, extractHistory, hasActiveTriggerToken, upAtLogicalEdge,
  type HistoryNodeView, type RecallKeyFrame, type RecallOptions,
} from '../src/client/recall.ts'

const OPTIONS: RecallOptions = {
  recallWithDraft: 'save',
  restoreOnEscape: true,
  edgeMode: 'logical',
  enableCtrlAlias: true,
  restoreCaret: true,
}

/** A minimal valid frame with the common single-line browsing shape; tests override what they vary. */
function frame(over: Partial<RecallKeyFrame> = {}): RecallKeyFrame {
  return {
    key: 'up',
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    isComposing: false,
    hasSelection: false,
    phase: 'plain',
    menuOpen: false,
    draft: '',
    caret: 0,
    history: ['one', 'two', 'three'],
    upEdge: true,
    downEdge: true,
    ...over,
  }
}

function node(kind: string, texts: readonly string[]): HistoryNodeView {
  return { kind, texts }
}

function idleMachine(options: RecallOptions = OPTIONS): DraftRecall {
  return new DraftRecall(options)
}

describe('extractHistory', () => {
  it('keeps only user nodes, in time order', () => {
    const nodes = [
      node('context', ['system']),
      node('user', ['hello']),
      node('assistant', ['hi']),
      node('user', ['world']),
      node('tool-result', ['x']),
      node('command', ['y']),
    ]
    expect(extractHistory(nodes)).toEqual(['hello', 'world'])
  })

  it('joins a node\'s text blocks with newlines', () => {
    expect(extractHistory([node('user', ['part one', 'part two'])])).toEqual(['part one\npart two'])
  })

  it('skips blank entries', () => {
    const nodes = [node('user', ['']), node('user', ['   ']), node('user', ['\n']), node('user', ['real'])]
    expect(extractHistory(nodes)).toEqual(['real'])
  })

  it('merges adjacent duplicates but keeps repeats separated by other entries', () => {
    const nodes = [
      node('user', ['a']),
      node('user', ['a']),
      node('user', ['b']),
      node('user', ['a']),
    ]
    expect(extractHistory(nodes)).toEqual(['a', 'b', 'a'])
  })

  it('returns an empty list for no user nodes', () => {
    expect(extractHistory([])).toEqual([])
  })
})

describe('logical edge predicates', () => {
  it('up edge: single-line draft is always at the top', () => {
    expect(upAtLogicalEdge('hello', 0)).toBe(true)
    expect(upAtLogicalEdge('hello', 5)).toBe(true)
  })

  it('up edge: caret at or before the first newline is the top line', () => {
    expect(upAtLogicalEdge('ab\ncd', 0)).toBe(true)
    expect(upAtLogicalEdge('ab\ncd', 2)).toBe(true)
    expect(upAtLogicalEdge('ab\ncd', 3)).toBe(false)
    expect(upAtLogicalEdge('ab\ncd', 5)).toBe(false)
  })

  it('down edge: single-line draft is always at the bottom', () => {
    expect(downAtLogicalEdge('hello', 0)).toBe(true)
    expect(downAtLogicalEdge('hello', 5)).toBe(true)
  })

  it('down edge: caret after the last newline is the bottom line', () => {
    expect(downAtLogicalEdge('ab\ncd', 3)).toBe(true)
    expect(downAtLogicalEdge('ab\ncd', 5)).toBe(true)
    expect(downAtLogicalEdge('ab\ncd', 2)).toBe(false)
    expect(downAtLogicalEdge('ab\ncd', 1)).toBe(false)
  })
})

describe('hasActiveTriggerToken', () => {
  it('detects a leading slash or at token', () => {
    expect(hasActiveTriggerToken('/cmd', 4)).toBe(true)
    expect(hasActiveTriggerToken('@ref', 4)).toBe(true)
    expect(hasActiveTriggerToken('/', 1)).toBe(true)
  })

  it('detects a token after whitespace', () => {
    expect(hasActiveTriggerToken('x /cmd', 5)).toBe(true)
    expect(hasActiveTriggerToken('x @ref', 5)).toBe(true)
  })

  it('rejects trigger chars after a word character', () => {
    expect(hasActiveTriggerToken('a/b', 3)).toBe(false)
    expect(hasActiveTriggerToken('a@b', 3)).toBe(false)
  })

  it('rejects URL slashes', () => {
    expect(hasActiveTriggerToken('https://x', 9)).toBe(false)
    expect(hasActiveTriggerToken('a://b', 5)).toBe(false)
    expect(hasActiveTriggerToken('x://y', 5)).toBe(false)
  })

  it('treats a leading slash of a double slash as a live trigger', () => {
    expect(hasActiveTriggerToken('//x', 3)).toBe(true)
  })

  it('rejects an empty scan', () => {
    expect(hasActiveTriggerToken('', 0)).toBe(false)
    expect(hasActiveTriggerToken('plain', 5)).toBe(false)
  })
})

describe('live up', () => {
  it('recalls the newest entry and stashes the empty draft', () => {
    const machine = idleMachine()
    const effect = machine.up(frame())
    expect(effect).toEqual({ kind: 'fill', text: 'three' })
    expect(machine.stateOf()).toEqual({
      kind: 'browsing', index: 2, savedDraft: '', savedCaret: 0, history: ['one', 'two', 'three'],
    })
  })

  it('save mode stashes a non-empty draft before recalling', () => {
    const machine = idleMachine()
    const effect = machine.up(frame({ draft: 'hello', caret: 5 }))
    expect(effect).toEqual({ kind: 'fill', text: 'three' })
    const state = machine.stateOf()
    expect(state).toMatchObject({ kind: 'browsing', savedDraft: 'hello', savedCaret: 5 })
  })

  it('gate mode refuses a non-empty draft', () => {
    const machine = idleMachine({ ...OPTIONS, recallWithDraft: 'gate' })
    expect(machine.up(frame({ draft: 'hello' }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })

  it('gate mode admits an empty draft', () => {
    const machine = idleMachine({ ...OPTIONS, recallWithDraft: 'gate' })
    expect(machine.up(frame())).toEqual({ kind: 'fill', text: 'three' })
  })

  it('stays idle without history', () => {
    const machine = idleMachine()
    expect(machine.up(frame({ history: [] }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })

  it('passes when the caret is not on the first line', () => {
    const machine = idleMachine()
    expect(machine.up(frame({ upEdge: false }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })
})

describe('live down', () => {
  it('always passes while idle, even with history', () => {
    const machine = idleMachine()
    expect(machine.down(frame({ key: 'down' }))).toEqual({ kind: 'pass' })
    expect(machine.down(frame({ key: 'down', history: [] }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })
})

describe('browsing up', () => {
  it('walks one entry older from the first line', () => {
    const machine = idleMachine()
    machine.up(frame())
    expect(machine.up(frame())).toEqual({ kind: 'fill', text: 'two' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 1 })
  })

  it('stops at the oldest entry with a hold, state unchanged', () => {
    const machine = idleMachine()
    machine.up(frame())
    machine.up(frame())
    machine.up(frame())
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 0 })
    expect(machine.up(frame())).toEqual({ kind: 'hold' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 0 })
  })

  it('passes when the caret is not on the first line', () => {
    const machine = idleMachine()
    machine.up(frame())
    expect(machine.up(frame({ upEdge: false }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 2 })
  })

  it('keeps browsing at 0 when a fresh extraction appended entries', () => {
    const machine = idleMachine()
    machine.up(frame())
    machine.up(frame())
    machine.up(frame())
    expect(machine.up(frame({ history: ['zero', 'one', 'two', 'three', 'four'] }))).toEqual({ kind: 'hold' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 0, history: ['zero', 'one', 'two', 'three', 'four'] })
  })

  it('clamps a stale index when the window shrank, then walks older', () => {
    const machine = idleMachine()
    machine.up(frame({ history: ['a', 'b', 'c', 'd', 'e', 'f'] }))
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 5 })
    expect(machine.up(frame({ history: ['c', 'd', 'f'] }))).toEqual({ kind: 'fill', text: 'd' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 1, history: ['c', 'd', 'f'] })
  })

  it('returns to idle when history vanishes entirely', () => {
    const machine = idleMachine()
    machine.up(frame())
    expect(machine.up(frame({ history: [] }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })
})

describe('browsing down', () => {
  it('walks one entry newer from the last line', () => {
    const machine = idleMachine()
    machine.up(frame())
    machine.up(frame()) // index 1 ('two')
    expect(machine.down(frame({ key: 'down' }))).toEqual({ kind: 'fill', text: 'three' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 2 })
  })

  it('restores the stashed draft and caret at the newest entry', () => {
    const machine = idleMachine()
    machine.up(frame({ draft: 'hello', caret: 5 }))
    const effect = machine.down(frame({ key: 'down' }))
    expect(effect).toEqual({ kind: 'restore', text: 'hello', caret: 5 })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })

  it('restores to an empty draft when the stash was empty', () => {
    const machine = idleMachine()
    machine.up(frame())
    expect(machine.down(frame({ key: 'down' }))).toEqual({ kind: 'restore', text: '', caret: 0 })
  })

  it('omits the caret from restore when restoreCaret is off', () => {
    const machine = idleMachine({ ...OPTIONS, restoreCaret: false })
    machine.up(frame({ draft: 'hello', caret: 5 }))
    expect(machine.down(frame({ key: 'down' }))).toEqual({ kind: 'restore', text: 'hello', caret: undefined })
  })

  it('passes when the caret is not on the last line', () => {
    const machine = idleMachine()
    machine.up(frame())
    machine.up(frame())
    machine.up(frame()) // index 0
    expect(machine.down(frame({ key: 'down', downEdge: false }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 0 })
  })

  it('picks up a newly appended newest entry on the next down', () => {
    const machine = idleMachine()
    machine.up(frame())
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 2 })
    expect(machine.down(frame({ key: 'down', history: ['one', 'two', 'three', 'four'] }))).toEqual({
      kind: 'fill', text: 'four',
    })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 3 })
  })

  it('restores when a shrunken window clamps the index to newest', () => {
    const machine = idleMachine()
    machine.up(frame({ draft: 'hello', caret: 5, history: ['a', 'b', 'c', 'd', 'e', 'f'] }))
    expect(machine.down(frame({ key: 'down', history: ['c', 'd', 'f'] }))).toEqual({
      kind: 'restore', text: 'hello', caret: 5,
    })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })

  it('returns to idle when history vanishes entirely', () => {
    const machine = idleMachine()
    machine.up(frame())
    expect(machine.down(frame({ key: 'down', history: [] }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })
})

describe('escape', () => {
  it('restores the stashed draft and caret while browsing', () => {
    const machine = idleMachine()
    machine.up(frame({ draft: 'hello', caret: 5 }))
    expect(machine.escape(frame({ key: 'escape' }))).toEqual({ kind: 'restore', text: 'hello', caret: 5 })
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })

  it('passes while idle', () => {
    const machine = idleMachine()
    expect(machine.escape(frame({ key: 'escape' }))).toEqual({ kind: 'pass' })
  })

  it('passes when restoreOnEscape is off and keeps browsing', () => {
    const machine = idleMachine({ ...OPTIONS, restoreOnEscape: false })
    machine.up(frame())
    expect(machine.escape(frame({ key: 'escape' }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing' })
  })

  it('omits the caret from restore when restoreCaret is off', () => {
    const machine = idleMachine({ ...OPTIONS, restoreCaret: false })
    machine.up(frame({ draft: 'hello', caret: 5 }))
    expect(machine.escape(frame({ key: 'escape' }))).toEqual({ kind: 'restore', text: 'hello', caret: undefined })
  })
})

describe('divergence guard', () => {
  it('stays browsing while the draft equals the browsed entry', () => {
    const machine = idleMachine()
    machine.up(frame())
    machine.noteDraftChange('three')
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing', index: 2 })
  })

  it('leaves browsing when the draft diverged (the edit is the new draft)', () => {
    const machine = idleMachine()
    machine.up(frame())
    machine.noteDraftChange('three!')
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })

  it('is a no-op while idle', () => {
    const machine = idleMachine()
    machine.noteDraftChange('anything')
    expect(machine.stateOf()).toEqual({ kind: 'idle' })
  })
})

describe('gate matrix', () => {
  const gatedCases: ReadonlyArray<{ label: string; over: Partial<RecallKeyFrame>; options?: Partial<RecallOptions> }> = [
    { label: 'shift modifier', over: { shiftKey: true } },
    { label: 'alt modifier', over: { altKey: true } },
    { label: 'meta modifier', over: { metaKey: true } },
    { label: 'ctrl without alias', over: { ctrlKey: true }, options: { enableCtrlAlias: false } },
    { label: 'IME composition', over: { isComposing: true } },
    { label: 'active selection', over: { hasSelection: true } },
    { label: 'claimed phase', over: { phase: 'claimed' } },
    { label: 'adjudicating phase', over: { phase: 'adjudicating' } },
    { label: 'submitting phase', over: { phase: 'submitting' } },
    { label: 'menu open', over: { menuOpen: true } },
  ]

  for (const { label, over, options } of gatedCases) {
    it(`passes ${label} on up`, () => {
      const machine = idleMachine({ ...OPTIONS, ...options })
      expect(machine.up(frame(over))).toEqual({ kind: 'pass' })
      expect(machine.stateOf()).toEqual({ kind: 'idle' })
    })
    it(`passes ${label} on down while browsing`, () => {
      const machine = idleMachine({ ...OPTIONS, ...options })
      machine.up(frame())
      expect(machine.down(frame({ key: 'down', ...over }))).toEqual({ kind: 'pass' })
      expect(machine.stateOf()).toMatchObject({ kind: 'browsing' })
    })
  }

  it('ctrl alias on treats ctrl+up like the bare arrow', () => {
    const machine = idleMachine()
    expect(machine.up(frame({ ctrlKey: true }))).toEqual({ kind: 'fill', text: 'three' })
  })

  it('ctrl+escape never intercepts', () => {
    const machine = idleMachine()
    machine.up(frame())
    expect(machine.escape(frame({ key: 'escape', ctrlKey: true }))).toEqual({ kind: 'pass' })
    expect(machine.stateOf()).toMatchObject({ kind: 'browsing' })
  })
})

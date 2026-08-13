import { describe, expect, it } from 'vitest'
import {
  caretVisualLine, downAtLastVisualLine, upAtFirstVisualLine, type VisualLineSpan,
} from '../src/client/visual-edge.ts'

const SPANS: readonly VisualLineSpan[] = [
  { start: 0, end: 5 },
  { start: 5, end: 10 },
]

describe('caretVisualLine', () => {
  it('assigns carets inside each span to that line', () => {
    expect(caretVisualLine(SPANS, 0)).toBe(0)
    expect(caretVisualLine(SPANS, 4)).toBe(0)
    expect(caretVisualLine(SPANS, 5)).toBe(1)
    expect(caretVisualLine(SPANS, 9)).toBe(1)
  })

  it('assigns a caret at or past the final end to the last line', () => {
    expect(caretVisualLine(SPANS, 10)).toBe(1)
    expect(caretVisualLine(SPANS, 99)).toBe(1)
  })

  it('handles a single span and empty spans', () => {
    expect(caretVisualLine([{ start: 0, end: 7 }], 0)).toBe(0)
    expect(caretVisualLine([], 0)).toBe(0)
  })
})

describe('visual edge predicates', () => {
  it('up edge only on the first visual line', () => {
    expect(upAtFirstVisualLine(SPANS, 0)).toBe(true)
    expect(upAtFirstVisualLine(SPANS, 4)).toBe(true)
    expect(upAtFirstVisualLine(SPANS, 5)).toBe(false)
    expect(upAtFirstVisualLine(SPANS, 10)).toBe(false)
  })

  it('down edge only on the last visual line', () => {
    expect(downAtLastVisualLine(SPANS, 0)).toBe(false)
    expect(downAtLastVisualLine(SPANS, 5)).toBe(true)
    expect(downAtLastVisualLine(SPANS, 10)).toBe(true)
  })

  it('a single-line draft is both edges', () => {
    const single = [{ start: 0, end: 3 }]
    expect(upAtFirstVisualLine(single, 0)).toBe(true)
    expect(downAtLastVisualLine(single, 3)).toBe(true)
  })
})

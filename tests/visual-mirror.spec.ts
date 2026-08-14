import { describe, expect, it } from 'vitest'
import { computeSpans, nextWrapOffsetBy, type TopAt } from '../src/client/visual-mirror.ts'

/**
 * Build a stepwise top probe matching the seam contract: `topAt(offset)` is
 * the top of the visual line holding the CHARACTER AT `offset`, with each
 * boundary being the first character index of the next line.
 */
function stepTops(boundaries: readonly number[], lineHeight = 10): TopAt {
  return (offset) => {
    let line = 0
    for (const boundary of boundaries) {
      if (offset < boundary) return line * lineHeight
      line++
    }
    return boundaries.length * lineHeight
  }
}

describe('nextWrapOffsetBy', () => {
  it('returns undefined when the whole range stays on one line', () => {
    const topAt = stepTops([10])
    expect(nextWrapOffsetBy(topAt, 0, 6)).toBeUndefined()
  })

  it('finds the first character index that opens a new line', () => {
    const topAt = stepTops([5])
    expect(nextWrapOffsetBy(topAt, 0, 10)).toBe(5)
  })

  it('finds a wrap after a non-zero start', () => {
    const topAt = stepTops([3, 8])
    expect(nextWrapOffsetBy(topAt, 3, 10)).toBe(8)
  })

  it('returns undefined when the start is already the last line', () => {
    const topAt = stepTops([3, 8])
    expect(nextWrapOffsetBy(topAt, 8, 10)).toBeUndefined()
  })

  it('returns undefined when the search range is empty', () => {
    const topAt = stepTops([3])
    expect(nextWrapOffsetBy(topAt, 5, 5)).toBeUndefined()
  })
})

describe('computeSpans', () => {
  it('returns one span for a single visual line', () => {
    expect(computeSpans(stepTops([10]), 10, 1)).toEqual([{ start: 0, end: 10 }])
  })

  it('recovers span boundaries from the line-top probe', () => {
    const topAt = stepTops([3, 8])
    expect(computeSpans(topAt, 10, 3)).toEqual([
      { start: 0, end: 3 },
      { start: 3, end: 8 },
      { start: 8, end: 10 },
    ])
  })

  it('handles a wrap right before the final character', () => {
    const topAt = stepTops([9])
    expect(computeSpans(topAt, 10, 2)).toEqual([
      { start: 0, end: 9 },
      { start: 9, end: 10 },
    ])
  })

  it('closes a trailing span when the probe disagrees with the rect count', () => {
    // The full-range rects claim 4 lines but the probe only sees 2: the
    // trailing span still covers the draft so edge math never reads past it.
    const topAt = stepTops([6])
    const spans = computeSpans(topAt, 10, 4)
    expect(spans).toEqual([
      { start: 0, end: 6 },
      { start: 6, end: 10 },
    ])
  })
})

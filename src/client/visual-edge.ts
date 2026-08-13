/**
 * Visual-edge math: pure functions over measured line spans. The DOM
 * measurement itself lives in visual-mirror.ts; this module owns only the
 * span → caret-line reasoning so the decision logic stays unit-testable.
 */

/** One visual line as a half-open character range [start, end). */
export interface VisualLineSpan {
  readonly start: number
  readonly end: number
}

/**
 * The visual line index the caret belongs to. A caret sitting after a line
 * break (at the start of the next span) belongs to that next line; a caret
 * at or beyond the final span's end belongs to the last line.
 * @param spans - measured spans covering the draft, sorted, non-empty in practice.
 * @param caret - caret offset into the draft.
 * @returns 0-based line index; 0 when spans are empty.
 */
export function caretVisualLine(spans: readonly VisualLineSpan[], caret: number): number {
  if (spans.length === 0) return 0
  const last = spans[spans.length - 1]
  if (last === undefined || caret >= last.end) return spans.length - 1
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i]
    if (span !== undefined && caret >= span.start && caret < span.end) return i
  }
  return 0
}

/**
 * ↑ takeover boundary: the caret is on the first visual line.
 * @param spans - measured spans for the draft.
 * @param caret - caret offset.
 */
export function upAtFirstVisualLine(spans: readonly VisualLineSpan[], caret: number): boolean {
  return caretVisualLine(spans, caret) <= 0
}

/**
 * ↓ takeover boundary: the caret is on the last visual line.
 * @param spans - measured spans for the draft.
 * @param caret - caret offset.
 */
export function downAtLastVisualLine(spans: readonly VisualLineSpan[], caret: number): boolean {
  return caretVisualLine(spans, caret) >= spans.length - 1
}

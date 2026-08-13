/**
 * DOM mirror measurement for edgeMode='visual': a hidden div replicating the
 * textarea's width/font/line-height/padding/white-space pre-wrap geometry
 * exposes the real wrapped line boxes, and a Range over the mirror text
 * yields one client rect per visual line. Character offsets of the wrap
 * boundaries are recovered by binary-searching rect tops, which produces
 * the {@link VisualLineSpan} list consumed by the pure edge predicates.
 *
 * Untestable under jsdom (no layout engine): the pure span math in
 * visual-edge.ts carries the testable logic; this file is thin glue.
 */

import type { VisualLineSpan } from './visual-edge.ts'

/** Hidden measurement mirror bound to one plugin lifetime. */
export interface MirrorMeasurer {
  /**
   * Measure the visual line spans of a draft for one composer.
   * @param composer - the textarea whose geometry the mirror copies.
   * @param draft - the text to lay out.
   * @returns spans in character order, or undefined when no measurement is possible.
   */
  spans(composer: HTMLTextAreaElement, draft: string): VisualLineSpan[] | undefined
  /** Remove the mirror node. */
  dispose(): void
}

/** Computed styles the mirror copies so its line boxes match the textarea's. */
const COPIED_PROPERTIES: readonly string[] = [
  'boxSizing', 'width', 'fontFamily', 'fontSize', 'fontStyle', 'fontVariant',
  'fontWeight', 'lineHeight', 'letterSpacing', 'wordSpacing', 'textIndent',
  'tabSize', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
]

/** Safety bound against a pathological rect/loop disagreement. */
const MAX_LINES = 1000

/** Zero-width placeholder so an empty draft still produces one line box. */
const EMPTY_TEXT = '\u200b'

/**
 * Create the hidden mirror and its span measurer. The mirror is appended to
 * document.body and removed by {@link MirrorMeasurer.dispose}.
 * @returns the measurer, or undefined outside a document.
 */
export function createMirrorMeasurer(): MirrorMeasurer | undefined {
  if (typeof document === 'undefined') return undefined
  const mirror = document.createElement('div')
  const style = mirror.style
  style.position = 'fixed'
  style.left = '-9999px'
  style.top = '0'
  style.visibility = 'hidden'
  style.pointerEvents = 'none'
  style.setProperty('white-space', 'pre-wrap')
  style.setProperty('word-break', 'break-word')
  style.setProperty('overflow-wrap', 'break-word')
  document.body.appendChild(mirror)
  return {
    spans: (composer, draft) => measureSpans(mirror, composer, draft),
    dispose: () => {
      mirror.remove()
    },
  }
}

/**
 * Copy the textarea's computed metrics onto the mirror and measure.
 * @param mirror - the hidden mirror div.
 * @param composer - the textarea to copy geometry from.
 * @param draft - the text to lay out.
 * @returns visual line spans, or undefined when rect measurement is unavailable.
 */
function measureSpans(mirror: HTMLDivElement, composer: HTMLTextAreaElement, draft: string): VisualLineSpan[] | undefined {
  const computed = window.getComputedStyle(composer)
  for (const property of COPIED_PROPERTIES) {
    (mirror.style as CSSStyleDeclaration & Record<string, string>)[property] = computed.getPropertyValue(property)
  }
  mirror.textContent = draft === '' ? EMPTY_TEXT : draft
  const node = mirror.firstChild
  if (node === null) return undefined
  const range = document.createRange()
  range.setStart(node, 0)
  range.setEnd(node, node.textContent?.length ?? 0)
  const rects = range.getClientRects()
  const visualLines = rects.length
  if (visualLines <= 1) return [{ start: 0, end: draft.length }]
  const spans: VisualLineSpan[] = []
  let start = 0
  for (let line = 0; line < visualLines && line < MAX_LINES; line++) {
    if (line === visualLines - 1) {
      spans.push({ start, end: draft.length })
      break
    }
    const next = nextWrapOffset(range, node, start, draft.length)
    if (next === undefined || next <= start) break
    spans.push({ start, end: next })
    start = next
  }
  if (spans.length === 0 || spans[spans.length - 1]?.end !== draft.length) {
    spans.push({ start, end: draft.length })
  }
  return spans
}

/**
 * The top of the range covering text [0, offset) — i.e. the top of the line
 * holding character offset-1. An offset of 0 yields the empty range at the
 * start of the first line.
 * @param range - reusable range over the mirror text node.
 * @param node - the mirror text node.
 * @param offset - exclusive range end.
 */
function topAt(range: Range, node: Node, offset: number): number {
  range.setStart(node, 0)
  range.setEnd(node, Math.max(offset, 1))
  return range.getBoundingClientRect().top
}

/**
 * Find the first character offset after `start` that opens a new visual
 * line, by binary-searching the offset whose line top exceeds the line top
 * at `start`.
 * @param range - reusable range over the mirror text node.
 * @param node - the mirror text node.
 * @param start - first character of the current visual line.
 * @param length - draft length.
 * @returns the wrap offset, or undefined when no transition exists.
 */
function nextWrapOffset(range: Range, node: Node, start: number, length: number): number | undefined {
  const base = topAt(range, node, start + 1)
  let low = start + 1
  let high = length
  if (low > high) return undefined
  if (topAt(range, node, high) <= base) return undefined
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (topAt(range, node, mid) > base) high = mid
    else low = mid + 1
  }
  return low
}

/**
 * DOM mirror measurement for edgeMode='visual': a hidden div replicating the
 * composer surface's width/font/line-height/padding/white-space geometry
 * exposes the real wrapped line boxes, and a Range over the mirror text
 * yields one client rect per visual line. Character offsets of the wrap
 * boundaries are recovered by binary-searching rect tops, which produces
 * the {@link VisualLineSpan} list consumed by the pure edge predicates.
 *
 * The composer surface is the contenteditable div (`data-composer-input`)
 * since harness 0.1.2-alpha.5 / 0.1.2-rc.1 (and the legacy textarea on
 * older lines); the mirror copies that element's computed box, so the wrap
 * width derives from the same width/padding/border the surface renders
 * with. On the Lexical composer the measured spans stay best-effort — the
 * suite cannot verify real layout-engine geometry (jsdom has none), which
 * is why `logical` remains the default edgeMode.
 *
 * The span math is a pure seam over an injected `topAt(offset)` line-top
 * probe ({@link nextWrapOffsetBy}/{@link computeSpans}), so the binary search
 * is unit-testable without a layout engine; the Range glue stays thin. The
 * measurer also memoizes its last measurement per (composer, draft, width),
 * because every key press re-measures while browsing.
 */

import { type ComposerElement } from './composer-dom.ts'
import type { VisualLineSpan } from './visual-edge.ts'

/** Hidden measurement mirror bound to one plugin lifetime. */
export interface MirrorMeasurer {
  /**
   * Measure the visual line spans of a draft for one composer.
   * @param composer - the composer surface whose geometry the mirror copies.
   * @param draft - the text to lay out.
   * @returns spans in character order, or undefined when no measurement is possible.
   */
  spans(composer: ComposerElement, draft: string): VisualLineSpan[] | undefined
  /** Remove the mirror node. */
  dispose(): void
}

/** Computed styles the mirror copies so its line boxes match the composer surface's. */
const COPIED_PROPERTIES: readonly string[] = [
  'boxSizing', 'width', 'fontFamily', 'fontSize', 'fontStyle', 'fontVariant',
  'fontWeight', 'lineHeight', 'letterSpacing', 'wordSpacing', 'textIndent',
  'tabSize', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
]

/**
 * Text-layout properties with hardcoded fallbacks: copied from the computed
 * style when the engine resolves them (real browsers), else the fallback
 * keeps the mirror's text layout well-defined (jsdom resolves nothing).
 */
const LAYOUT_OR_DEFAULT: ReadonlyArray<readonly [property: string, fallback: string]> = [
  ['whiteSpace', 'pre-wrap'],
  ['wordBreak', 'break-word'],
  ['overflowWrap', 'break-word'],
]

/** Safety bound against a pathological rect/loop disagreement. */
const MAX_LINES = 1000

/** Zero-width placeholder so an empty draft still produces one line box. */
const EMPTY_TEXT = '\u200b'

/** A probe returning the top of the visual line holding the character AT an offset. */
export type TopAt = (offset: number) => number

/**
 * Find the first character index after `start` that opens a new visual
 * line, by binary-searching the index whose line top exceeds the line top
 * at `start`. Pure over the injected top probe; the probe is only ever
 * asked about offsets inside [start, length), so the caller needs no
 * sentinel semantics.
 * @param topAt - line-top probe.
 * @param start - first character of the current visual line.
 * @param length - draft length.
 * @returns the wrap offset (first index of the next line), or undefined
 *   when no later line exists.
 */
export function nextWrapOffsetBy(topAt: TopAt, start: number, length: number): number | undefined {
  if (start >= length) return undefined
  const base = topAt(start)
  if (topAt(length - 1) <= base) return undefined
  let low = start + 1
  let high = length - 1
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (topAt(mid) > base) high = mid
    else low = mid + 1
  }
  return low
}

/**
 * Recover the visual-line span list from a line-top probe: one span per
 * visual line, each boundary found with {@link nextWrapOffsetBy}. Pure over
 * the injected probe; the DOM layer supplies it from Range rects.
 * @param topAt - line-top probe over [0, draftLength].
 * @param draftLength - character count of the laid-out draft.
 * @param visualLines - rect count of the full range (the probe must agree).
 * @returns spans covering the draft, or undefined when the probe cannot
 *   resolve the layout.
 */
export function computeSpans(topAt: TopAt, draftLength: number, visualLines: number): VisualLineSpan[] | undefined {
  if (visualLines <= 1) return [{ start: 0, end: draftLength }]
  const spans: VisualLineSpan[] = []
  let start = 0
  for (let line = 0; line < visualLines && line < MAX_LINES; line++) {
    if (line === visualLines - 1) {
      spans.push({ start, end: draftLength })
      break
    }
    const next = nextWrapOffsetBy(topAt, start, draftLength)
    if (next === undefined || next <= start) break
    spans.push({ start, end: next })
    start = next
  }
  if (spans.length === 0 || spans[spans.length - 1]?.end !== draftLength) {
    spans.push({ start, end: draftLength })
  }
  return spans
}

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
  document.body.appendChild(mirror)

  // Measurement memo: browsing re-measures on every key press; identical
  // (composer, draft, width) input must not re-run the binary search.
  let cachedComposer: ComposerElement | undefined
  let cachedDraft: string | undefined
  let cachedWidth = -1
  let cachedSpans: VisualLineSpan[] | undefined

  return {
    spans: (composer, draft) => {
      const width = composer.clientWidth
      if (cachedComposer === composer && cachedDraft === draft && cachedWidth === width) return cachedSpans
      cachedComposer = composer
      cachedDraft = draft
      cachedWidth = width
      cachedSpans = measureSpans(mirror, composer, draft)
      return cachedSpans
    },
    dispose: () => {
      mirror.remove()
    },
  }
}

/**
 * Copy the composer surface's computed metrics onto the mirror and measure.
 * @param mirror - the hidden mirror div.
 * @param composer - the composer surface to copy geometry from.
 * @param draft - the text to lay out.
 * @returns visual line spans, or undefined when rect measurement is unavailable.
 */
function measureSpans(mirror: HTMLDivElement, composer: ComposerElement, draft: string): VisualLineSpan[] | undefined {
  const computed = window.getComputedStyle(composer)
  for (const property of COPIED_PROPERTIES) {
    (mirror.style as CSSStyleDeclaration & Record<string, string>)[property] = computed.getPropertyValue(property)
  }
  for (const entry of LAYOUT_OR_DEFAULT) {
    const property = entry[0]
    const fallback = entry[1]
    const value = computed.getPropertyValue(property)
    ;(mirror.style as CSSStyleDeclaration & Record<string, string>)[property] = value === '' ? fallback : value
  }
  mirror.textContent = draft === '' ? EMPTY_TEXT : draft
  const node = mirror.firstChild
  if (node === null) return undefined
  const range = document.createRange()
  const textLength = node.textContent?.length ?? 0
  const topAt: TopAt = (offset) => {
    // The range [0, offset+1) ends inside the target line; the LAST client
    // rect is that line's box, whose top identifies the line holding the
    // character at `offset`. (The union getBoundingClientRect() top is
    // always the first line's — measuring it would hide every wrap.)
    range.setStart(node, 0)
    range.setEnd(node, Math.min(offset + 1, textLength))
    const rects = range.getClientRects()
    const last = rects[rects.length - 1]
    return last === undefined ? 0 : last.top
  }
  range.setStart(node, 0)
  range.setEnd(node, textLength)
  const visualLines = range.getClientRects().length
  return computeSpans(topAt, draft.length, visualLines)
}

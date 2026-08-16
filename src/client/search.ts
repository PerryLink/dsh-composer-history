/**
 * Pure reverse-search matching: substring filter over the composed history
 * plus the match-range recovery the overlay's highlight rendering consumes.
 * The overlay owns the DOM; this module owns only the match decisions so
 * they stay unit-testable without a browser.
 */

/** One searchable overlay entry: the text plus its provenance label. */
export interface SearchEntry {
  /** The entry text (matched and inserted verbatim). */
  readonly text: string
  /** Provenance: 'history' | 'compacted' | 'snippet' | 'template'. */
  readonly source: 'history' | 'compacted' | 'snippet' | 'template'
  /** Optional short label shown next to the entry (snippet name, template name). */
  readonly label?: string
}

/**
 * Filter history entries by a query. An empty query lists every entry.
 * @param entries - history entries, oldest first.
 * @param query - the search text.
 * @param caseSensitive - whether letter case matters.
 * @returns matching entries in their original order.
 */
export function filterEntries(entries: readonly string[], query: string, caseSensitive: boolean): string[] {
  if (query === '') return [...entries]
  const needle = caseSensitive ? query : query.toLowerCase()
  return entries.filter(entry => (caseSensitive ? entry : entry.toLowerCase()).includes(needle))
}

/**
 * Filter structured search entries by their text (same substring semantics
 * as {@link filterEntries}); the query matches text only, never the label.
 * @param entries - structured entries.
 * @param query - the search text.
 * @param caseSensitive - whether letter case matters.
 * @returns matching entries in their original order.
 */
export function filterSearchEntries(entries: readonly SearchEntry[], query: string, caseSensitive: boolean): SearchEntry[] {
  if (query === '') return [...entries]
  const needle = caseSensitive ? query : query.toLowerCase()
  return entries.filter(entry => (caseSensitive ? entry.text : entry.text.toLowerCase()).includes(needle))
}

/**
 * All non-overlapping occurrences of the query inside one entry, as
 * half-open character ranges [start, end) in source order. An empty query
 * yields no ranges (nothing to highlight). Used by the overlay to mark the
 * matched substrings inside a listed row.
 * @param text - one history entry.
 * @param query - the search text.
 * @param caseSensitive - whether letter case matters.
 * @returns match ranges, or [] for an empty query / no occurrence.
 */
export function matchRanges(text: string, query: string, caseSensitive: boolean): readonly (readonly [number, number])[] {
  if (query === '') return []
  const haystack = caseSensitive ? text : text.toLowerCase()
  const needle = caseSensitive ? query : query.toLowerCase()
  const ranges: Array<readonly [number, number]> = []
  let from = 0
  for (;;) {
    const at = haystack.indexOf(needle, from)
    if (at === -1) break
    ranges.push([at, at + needle.length])
    from = at + needle.length
  }
  return ranges
}

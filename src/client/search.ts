/**
 * Pure reverse-search matching: substring filter over the composed history.
 * The overlay owns the DOM; this module owns only the match decision so it
 * stays unit-testable without a browser.
 */

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

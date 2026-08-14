/**
 * Extraction memo for the wiring layer: conversation snapshots are immutable
 * (stable array reference until the next change), so repeated per-keypress
 * extraction can reuse the last result keyed by the nodes array reference.
 * Two extraction shapes coexist per source — unlimited and history-capped —
 * and each is cached separately so the persistence path (unlimited) and the
 * recall path (capped) never answer each other's slot.
 */

import { extractHistory, type HistoryNodeView } from './recall.ts'

/** Cached extraction over one snapshot source. */
export class HistoryExtractor<TNodes extends object> {
  private readonly slots = new WeakMap<object, { unlimited?: string[]; capped?: string[] }>()

  /**
   * @param kinds - node kinds admitted (fixed per install).
   * @param max - the install's history cap (fixed per install).
   * @param convert - maps the raw snapshot nodes to projected views (runs
   *   only on cache misses).
   */
  constructor(
    private readonly kinds: readonly string[],
    private readonly max: number,
    private readonly convert: (nodes: TNodes) => readonly HistoryNodeView[],
  ) {}

  /**
   * Extract the entries of one nodes snapshot, memoized by its reference.
   * @param nodes - the snapshot's nodes array.
   * @param max - this call's cap; 0 means unlimited (defaults to the
   *   install's cap).
   * @returns non-blank entries, oldest first.
   */
  extract(nodes: TNodes, max: number = this.max): string[] {
    let slot = this.slots.get(nodes)
    if (slot === undefined) {
      slot = {}
      this.slots.set(nodes, slot)
    }
    const key = max <= 0 ? 'unlimited' : 'capped'
    const cached = slot[key]
    if (cached !== undefined) return cached
    const entries = extractHistory(this.convert(nodes), { kinds: this.kinds, max })
    slot[key] = entries
    return entries
  }
}

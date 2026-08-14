/**
 * Pure sliding-context observation: detect compaction checkpoints in a
 * session snapshot so the wiring layer can (a) baseline against markers
 * that predate the plugin install and (b) surface only checkpoints that
 * land while the page is open. Zero DOM, zero cordis — nodes arrive
 * structurally, so the detection is unit-testable with plain objects.
 */

/** One compaction checkpoint worth reporting. */
export interface CompactionNoticeInfo {
  /** Seq of the replacement user/message that landed the checkpoint. */
  readonly seq: number
  /** Summary text, or null when the summary event fell outside the window. */
  readonly summary: string | null
  /** Number of surface items replaced, or null when unavailable. */
  readonly itemCount: number | null
  /** Estimated token price of the replaced items, or null when unavailable. */
  readonly tokenCount: number | null
}

/** Structural face of one snapshot node (the real union is compatible). */
interface CompactionNodeLike {
  readonly kind: string
  readonly seq: number
  readonly summary?: unknown
  readonly shadowedItemCount?: unknown
  readonly shadowedTokenCount?: unknown
}

/** Read a count-shaped field, accepting only non-negative integers. */
function countOf(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/** The newest checkpoint's summary, or null (unavailable/foreign shape). */
function summaryOf(node: CompactionNodeLike): string | null {
  return typeof node.summary === 'string' ? node.summary : null
}

/**
 * The seq of the newest compaction checkpoint in a snapshot (baseline
 * value: checkpoints at or below it predate the current plugin install).
 * @param nodes - snapshot nodes in seq order.
 * @returns the newest checkpoint seq, or undefined when there is none.
 */
export function latestCompactionSeq(nodes: readonly CompactionNodeLike[]): number | undefined {
  let latest: number | undefined
  for (const node of nodes) {
    if (node.kind !== 'compaction') continue
    if (typeof node.seq !== 'number') continue
    if (latest === undefined || node.seq > latest) latest = node.seq
  }
  return latest
}

/**
 * The newest compaction checkpoint that landed after `afterSeq` (the last
 * reported one). Iterates the snapshot once and keeps the highest matching
 * seq, so a burst of checkpoints in one snapshot reports only the newest.
 * @param nodes - snapshot nodes in seq order.
 * @param afterSeq - last reported checkpoint seq (undefined = report the newest present).
 * @returns the newest unreported checkpoint, or undefined when none exists.
 */
export function compactionAfter(nodes: readonly CompactionNodeLike[], afterSeq: number | undefined): CompactionNoticeInfo | undefined {
  let best: CompactionNoticeInfo | undefined
  for (const node of nodes) {
    if (node.kind !== 'compaction') continue
    if (typeof node.seq !== 'number') continue
    if (afterSeq !== undefined && node.seq <= afterSeq) continue
    const info: CompactionNoticeInfo = {
      seq: node.seq,
      summary: summaryOf(node),
      itemCount: countOf(node.shadowedItemCount),
      tokenCount: countOf(node.shadowedTokenCount),
    }
    if (best === undefined || info.seq > best.seq) best = info
  }
  return best
}

/**
 * Runtime-node → recall-view mapping: the pure seam between the client
 * conversation snapshot ({@link ConversationNode}) and the extractor's
 * {@link HistoryNodeView}. Lifted out of the wiring layer so the mapping is
 * unit-testable with structural fakes and stays free of cordis/DOM.
 *
 * Sliding-context integration: `compaction` checkpoint markers (the
 * harness's Claude Code / Codex-style auto-compact summaries) project to a
 * single prefixed text entry, so the summarized history stays reachable
 * from ↑ recall and Ctrl+R search after the model surface has slid past it.
 */

import type { ConversationNode } from '@deepseek-ai/dsh-client-runtime/client'
import type { HistoryNodeView } from './recall.ts'

/** Prefix marking an entry that came from a compaction checkpoint, not the composer. */
export const COMPACTED_PREFIX = '[compacted] '

/**
 * Project one conversation node onto a recall view.
 * @param node - one snapshot node (any kind).
 * @returns the view, or undefined when the node carries no recallable text
 *   (non-text kinds, compaction markers whose summary fell outside the
 *   window, blank content).
 */
export function viewOfNode(node: ConversationNode): HistoryNodeView | undefined {
  switch (node.kind) {
    // Text-bearing human messages; other blocks (images, chips) carry no composer text.
    case 'user':
    case 'steering': {
      const texts: string[] = []
      for (const block of node.content) {
        if (block.type === 'text') texts.push(block.text)
      }
      return { kind: node.kind, texts }
    }
    // Sliding-context checkpoint: the marker's summary is the model-facing
    // memory of the shadowed turns. A null summary means the summary event
    // fell outside the loaded window — nothing recallable.
    case 'compaction': {
      const summary = node.summary
      if (summary === null || summary.trim() === '') return undefined
      return { kind: node.kind, texts: [COMPACTED_PREFIX + summary] }
    }
    default:
      return undefined
  }
}

/**
 * Project a snapshot's nodes onto recall views, keeping source order.
 * @param nodes - conversation nodes in seq order.
 * @returns views for every node that carries recallable text.
 */
export function viewOfNodes(nodes: readonly ConversationNode[]): HistoryNodeView[] {
  const views: HistoryNodeView[] = []
  for (const node of nodes) {
    const view = viewOfNode(node)
    if (view !== undefined) views.push(view)
  }
  return views
}

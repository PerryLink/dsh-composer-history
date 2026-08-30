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

import type { HistoryNodeView } from './recall.ts'

/**
 * Local structural contract for the conversation snapshot nodes this plugin
 * reads (user / steering / compaction). Declared locally because the owning
 * package (`@deepseek-ai/dsh-client-ui-conversation`) re-exports the node
 * union from its `client` entry only on the unreleased 0.1.2-alpha.1 host,
 * while the published 0.1.1-rc.2 line keeps the union inside the removed
 * `dsh-client-runtime` package. The runtime contract is structural: the
 * session snapshot provides the same fields under both hosts, and every
 * node kind outside this union projects to no view through the default arm.
 */

/** One text content block — the only block shape the recall views read. */
interface TextContentBlock {
  type: 'text'
  text: string
}

/** One content block without composer text (images, chips, ...). */
interface OpaqueContentBlock {
  type: string
}

/** One finalized user message (fields the recall views read). */
interface UserMessageNode {
  kind: 'user'
  seq: number
  content: readonly (TextContentBlock | OpaqueContentBlock)[]
}

/** One steering message (fields the recall views read). */
interface SteeringMessageNode {
  kind: 'steering'
  seq: number
  content: readonly (TextContentBlock | OpaqueContentBlock)[]
}

/** One compaction checkpoint marker (fields the recall views read). */
interface CompactionSummaryNode {
  kind: 'compaction'
  seq: number
  summary: string | null
}

/** The conversation node kinds the recall views project. */
export type ConversationNode = UserMessageNode | SteeringMessageNode | CompactionSummaryNode

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
        if ('text' in block) texts.push(block.text)
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

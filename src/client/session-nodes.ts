/**
 * Session-history read channel (CP-7): the sessions service exposes no
 * conversation nodes on any supported host line — its per-session snapshot is
 * lifecycle-only (queue, pending submissions, running/open state), so the
 * `session.getSnapshot().nodes` read this plugin was originally written
 * against is `undefined` everywhere and the `?? []` fallback silently
 * emptied ↑ recall, Ctrl+R search, persistence, and compaction notices.
 *
 * History now comes from the official per-Session Chat target instead:
 * `uiConversation.binding(id).target('chat')` publishes ui-chat's
 * compatibility projection, whose `legacy.nodes` is the finalized
 * conversation union in seq order — the same array the host's own StatsPills
 * derives its window statistics from.
 *
 * A target publishes only after activation. The shell activates the current
 * Session's selected view; the first `subscribe` on any other target
 * activates it synchronously (assembler `activateTarget` → `replaceView`),
 * so callers must subscribe before their first read. Every access to the
 * projection lives in this module, so a future upstream retirement of the
 * `legacy` slice is a one-module change (switch to `nodes.values()`).
 */
import type { ConversationNode } from './node-views.ts'

/** Structural face of one Chat target snapshot (the fields this plugin reads). */
interface ChatSnapshotFace {
  /** Preferred shape on newer host lines: the node store itself. */
  readonly nodes?: { values(): readonly ConversationNode[] }
  readonly legacy?: { readonly nodes?: readonly ConversationNode[] }
}

/**
 * Structural face of one observable target source (ui-conversation's
 * `ObservableSnapshot`): `getSnapshot()` is undefined until activation.
 */
export interface ChatTargetSource {
  getSnapshot(): ChatSnapshotFace | undefined
  subscribe(listener: () => void): () => void
}

/**
 * Structural face of `ctx.uiConversation`. Declared structurally (read via
 * `ctx.get`) so the plugin needs no `@deepseek-ai/dsh-client-ui-chat` type
 * edge for the `chat` target key.
 */
export interface UiConversationFace {
  /** @throws for a Session neither listed nor already scoped (host contract). */
  binding(id: string): { target(target: 'chat'): ChatTargetSource }
}

/** Whether the one-time legacy-shape warning has been emitted. */
let warnedLegacyNodes = false

/**
 * The finalized conversation nodes of one Chat target source. The newer
 * snapshot shape (`nodes`, a store exposing `values()`) wins when present;
 * otherwise the compatibility projection (`legacy.nodes`) is read. Strict
 * A-else-B: merging the two would duplicate every node and mix two orderings.
 * The legacy path warns once so the fallback stays visible.
 * @param source - the Chat target source.
 * @returns the finalized nodes in seq order; `[]` before activation or when
 *   neither shape carries nodes.
 */
export function chatNodes(source: ChatTargetSource): readonly ConversationNode[] {
  const snapshot = source.getSnapshot()
  if (snapshot === undefined) return []
  const store = snapshot.nodes
  if (store !== undefined) return store.values()
  const legacy = snapshot.legacy?.nodes
  if (legacy === undefined) return []
  if (!warnedLegacyNodes) {
    warnedLegacyNodes = true
    console.warn('dsh-composer-history: the conversation target exposes only the legacy `legacy.nodes` shape; the newer `nodes` store is absent on this host line')
  }
  return legacy
}

/**
 * Resolve one Session's Chat target source.
 * @param uiConversation - the service, or undefined when it is absent.
 * @param id - Session id.
 * @returns the source, or undefined when the service is absent or the id is
 *   unaddressable (`binding` throws for unknown Sessions).
 */
export function chatSourceFor(
  uiConversation: UiConversationFace | undefined,
  id: string,
): ChatTargetSource | undefined {
  if (uiConversation === undefined) return undefined
  try {
    return uiConversation.binding(id).target('chat')
  } catch {
    return undefined
  }
}

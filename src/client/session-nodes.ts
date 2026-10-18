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
 * projection lives in this module. The keyed `nodes` store on 0.2.1-rc.2
 * contains renderer nodes with payloads under `data`, so it must not replace
 * the raw compatibility projection without an explicit conversion.
 */
import type { ConversationNode } from './node-views.ts'

/** Structural face of one Chat target snapshot (the fields this plugin reads). */
interface ChatSnapshotFace {
  /** Fallback for hosts exposing raw conversation nodes through a store. */
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

/**
 * The finalized conversation nodes of one Chat target source. Prefer the
 * raw compatibility projection (`legacy.nodes`); the keyed store contains
 * renderer nodes on DSH 0.2.1-rc.2 and cannot be read as raw messages. Strict
 * A-else-B: merging the two would duplicate every node and mix two orderings.
 * Use the store fallback only when the raw projection is absent.
 * @param source - the Chat target source.
 * @returns the finalized nodes in seq order; `[]` before activation or when
 *   neither shape carries nodes.
 */
export function chatNodes(source: ChatTargetSource): readonly ConversationNode[] {
  const snapshot = source.getSnapshot()
  if (snapshot === undefined) return []
  const legacy = snapshot.legacy?.nodes
  if (legacy !== undefined) return legacy
  const store = snapshot.nodes
  if (store !== undefined) return store.values()
  return []
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

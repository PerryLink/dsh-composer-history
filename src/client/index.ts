/**
 * dsh-composer-history, browser half: window-capture keyboard interception
 * that layers terminal-style draft recall over the composer. All reads go
 * through the session services (current session snapshot for history, the
 * input machine facade for draft/phase and the single setDraft write path);
 * the slash-menu gate reads the inputTriggers service, asserted to its
 * exported class type — the sanctioned cross-package pattern for service
 * instances — and falls back to the trigger-token heuristic when the
 * service is absent.
 *
 * Effective options resolve from three layers: the boot config (none today),
 * the settings scope (the host namespace carrying the cordis.yml `base` plus
 * any user overrides), and the schema defaults. The scope arrives
 * asynchronously; the wiring reinstalls on every committed change.
 * Sent messages are appended to a bounded browser-local history store so
 * recall survives reloads and reaches across sessions.
 */
import type { ClientContext, ConversationNode } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: activates the ctx.conversation Context merge (IConversation face).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: activates the ctx.inputTriggers merge and names the class face for the service assertion.
import type { InputTriggerService } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
// Type-only: activates the ctx.settingsScope merge (SettingsScopeBinder face).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { resolveConfig, type ComposerHistoryConfig } from './config.ts'
import { createComposerHistory, type ComposerHistoryHandle, type ComposerHistoryHost } from './interceptor.ts'
import { createMirrorMeasurer, type MirrorMeasurer } from './visual-mirror.ts'
import { hasActiveTriggerToken, type HistoryNodeView } from './recall.ts'
import { HistoryExtractor } from './history-extract.ts'
import { createSearchOverlay, type SearchOverlay } from './search-overlay.ts'
import { STORE_KEY, appendEntries, loadEntries, safeStorage } from './history-store.ts'

export { Config, resolveConfig } from './config.ts'
export type { ComposerHistoryConfig } from './config.ts'
export type { RecallEffect, RecallOptions, RecallState } from './recall.ts'

/** Plugin name: matches the package name, the graph row id, and the bundle id. */
export const name = 'dsh-composer-history'

/** Services the interception reads; activation waits on them. */
export const inject = ['conversation', 'sessions', 'inputTriggers', 'settingsScope']

/** Settings namespace the host half registers (lowercase kebab-case). */
const NAMESPACE = 'composer-history'

/** Structural face of the command popup shell (ctx.commandUi, read defensively without a dependency edge). */
interface PopupSelectFace {
  popupFor(actx: ClientContext): { readonly state: { getSnapshot(): { readonly open: boolean } } }
}

/**
 * Browser plugin body: resolve the effective options, wire the interception
 * host over the session/input/trigger services, keep the persisted history
 * store in sync with the current session's commits, and register the
 * window-capture listeners as one effect. The settings scope is observed;
 * every committed option change tears the wiring down and reinstalls it.
 * @param ctx - client root context.
 * @param config - partial config (browser boot passes none today); resolved
 *   against the schema so defaults apply and invalid values throw loudly.
 */
export function apply(ctx: ClientContext, config: Partial<ComposerHistoryConfig> = {}): void {
  const fallback = resolveConfig(config)
  const storage = safeStorage(typeof localStorage === 'undefined' ? undefined : localStorage)

  ctx.effect(() => {
    const scope = ctx.settingsScope.bind<ComposerHistoryConfig>({ namespace: NAMESPACE })
    let disposeWiring: (() => void) | undefined

    const install = (): void => {
      disposeWiring?.()
      disposeWiring = undefined
      const snapshot = scope.getSnapshot()
      // The host namespace resolves base (cordis.yml) + user layer; before
      // the first acceptance the boot config is the effective value.
      const options = snapshot.status === 'ready' && snapshot.value !== undefined
        ? resolveConfig(snapshot.value)
        : fallback
      disposeWiring = installWiring(ctx, options, storage)
    }

    install()
    const disposeScope = scope.subscribe(install)
    return () => {
      disposeScope()
      disposeWiring?.()
      disposeWiring = undefined
    }
  }, 'dsh-composer-history: capture keyboard wiring')
}

/**
 * Build the full interception wiring for one effective option set. Returns
 * the disposer for every registration it made (listeners, subscriptions,
 * mirror node, overlay).
 * @param ctx - client root context.
 * @param options - resolved tunables.
 * @param storage - safe browser-local storage, or undefined outside a browser.
 */
function installWiring(ctx: ClientContext, options: ComposerHistoryConfig, storage: ReturnType<typeof safeStorage>): () => void {
  const mirror: MirrorMeasurer | undefined = options.edgeMode === 'visual' ? createMirrorMeasurer() : undefined

  const currentActx = (): ClientContext | undefined => {
    const id = ctx.sessions.list.getSnapshot().current
    return id === undefined ? undefined : ctx.sessions.scope(id)
  }

  const currentSessionId = (): string | undefined => {
    const id = ctx.sessions.list.getSnapshot().current
    return id === undefined ? undefined : String(id)
  }

  // Extraction memo over the immutable snapshot arrays (B3): the persistence
  // path extracts unlimited, the recall paths use the history cap — both
  // shapes are cached per nodes reference inside the extractor.
  const toViews = (nodes: readonly ConversationNode[]): HistoryNodeView[] => {
    const views: HistoryNodeView[] = []
    for (const node of nodes) {
      switch (node.kind) {
        // Text-bearing user-facing kinds; other kinds carry no composer text.
        case 'user':
        case 'steering': {
          const texts: string[] = []
          for (const block of node.content) {
            if (block.type === 'text') texts.push(block.text)
          }
          views.push({ kind: node.kind, texts })
          break
        }
        default:
          break
      }
    }
    return views
  }
  const extractor = new HistoryExtractor(options.includeKinds, options.maxHistory, toViews)
  const extract = (nodes: readonly ConversationNode[], max: number): string[] => extractor.extract(nodes, max)

  let handle: ComposerHistoryHandle | undefined
  let searchAnchor: HTMLTextAreaElement | undefined
  const overlay: SearchOverlay | undefined = createSearchOverlay({
    onPick: (text) => {
      const composer = searchAnchor
      // Return keyboard focus to the composer so typing continues naturally.
      composer?.focus()
      if (handle !== undefined && composer !== undefined) handle.fill(composer, text)
    },
    onCancel: () => {
      searchAnchor?.focus()
    },
  })

  const host: ComposerHistoryHost = {
    composerOf: (target) =>
      target instanceof HTMLTextAreaElement && target.closest('[data-input-scroll]') !== null
        ? target
        : undefined,

    sessionKey: () => currentSessionId(),

    inputState: () => {
      const actx = currentActx()
      if (actx === undefined) return undefined
      const snapshot = ctx.conversation.input.for(actx).state.getSnapshot()
      return { draft: snapshot.draft, phase: snapshot.phase }
    },

    history: () => {
      const id = ctx.sessions.list.getSnapshot().current
      if (id === undefined) return []
      const nodes = ctx.sessions.binding(id)?.session.getSnapshot().nodes ?? []
      return toViews(nodes)
    },

    supplementalHistory: () => {
      const list = ctx.sessions.list.getSnapshot()
      const current = list.current
      const parts: string[] = []
      if (options.persistHistory && storage !== undefined) {
        parts.push(...loadEntries(storage, STORE_KEY))
      }
      if (options.historyScope === 'workspace') {
        for (const id of list.ids) {
          if (current !== undefined && id === current) continue
          const summary = list.byId[id]
          if (summary === undefined || summary.blank) continue
          const binding = ctx.sessions.binding(id)
          if (binding === undefined) continue
          parts.push(...extract(binding.session.getSnapshot().nodes, options.maxHistory))
        }
      }
      return parts
    },

    menuOpen: (composer) => {
      const actx = currentActx()
      const triggers = ctx.get('inputTriggers') as InputTriggerService | undefined
      if (actx !== undefined) {
        if (triggers !== undefined && triggers.sessionOf(actx).menu.getSnapshot().open) return true
        const commands = ctx.get('commandUi') as PopupSelectFace | undefined
        if (commands !== undefined && commands.popupFor(actx).state.getSnapshot().open) return true
      }
      // Service missing (or popup controller unresolvable): approximate the
      // open menu with the live trigger token under the caret.
      return triggers === undefined && hasActiveTriggerToken(composer.value, composer.selectionStart)
    },

    setDraft: (_composer, text) => {
      const actx = currentActx()
      if (actx === undefined) return
      ctx.conversation.input.for(actx).setDraft(text)
    },

    openSearch: (composer, history) => {
      if (overlay === undefined) return
      searchAnchor = composer
      overlay.open(composer, history, options.searchCaseSensitive)
    },
  }

  const visualSpans = mirror === undefined
    ? undefined
    : (composer: HTMLTextAreaElement, draft: string) => mirror.spans(composer, draft)
  const hostWithSpans: ComposerHistoryHost = visualSpans === undefined ? host : { ...host, visualSpans }

  handle = createComposerHistory(hostWithSpans, options)

  const windowKeydown = (event: KeyboardEvent): void => { handle?.keydown(event) }
  const windowInput = (event: Event): void => { handle?.input(event) }
  window.addEventListener('keydown', windowKeydown, true)
  window.addEventListener('input', windowInput, true)

  // Persistence: append newly committed user messages of the current session
  // to the bounded local store. The subscription re-targets on session
  // switches; both subscriptions are disposer-returning registrations. The
  // length/last-seq guard skips extraction while only assistant deltas are
  // streaming (snapshot updates arrive per delta; user-message growth is the
  // only change that can add persisted entries).
  let lastSync = { length: -1, seq: -1 }
  const syncPersisted = (nodes: readonly ConversationNode[]): void => {
    if (!options.persistHistory || storage === undefined) return
    const last = nodes[nodes.length - 1]
    const seq = typeof last?.seq === 'number' ? last.seq : -1
    if (nodes.length === lastSync.length && seq === lastSync.seq) return
    lastSync = { length: nodes.length, seq }
    appendEntries(storage, STORE_KEY, extract(nodes, 0), options.maxPersisted)
  }
  let disposeSessionSub: (() => void) | undefined
  const reconcileSession = (): void => {
    disposeSessionSub?.()
    disposeSessionSub = undefined
    const id = ctx.sessions.list.getSnapshot().current
    if (id === undefined) return
    const binding = ctx.sessions.binding(id)
    if (binding === undefined) return
    const session = binding.session
    syncPersisted(session.getSnapshot().nodes)
    disposeSessionSub = session.subscribe(() => syncPersisted(session.getSnapshot().nodes))
  }
  const disposeListSub = ctx.sessions.list.subscribe(reconcileSession)
  reconcileSession()

  return () => {
    disposeListSub()
    disposeSessionSub?.()
    window.removeEventListener('keydown', windowKeydown, true)
    window.removeEventListener('input', windowInput, true)
    handle?.dispose()
    handle = undefined
    overlay?.dispose()
    mirror?.dispose()
  }
}

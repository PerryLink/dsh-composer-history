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
 * recall survives reloads and reaches across sessions. Compaction
 * checkpoints (the harness's sliding-context summaries) join recall and
 * search as prefixed entries, and a transient notice announces each
 * checkpoint that lands while the page is open.
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
import { hasActiveTriggerToken, effectiveKinds } from './recall.ts'
import { HistoryExtractor } from './history-extract.ts'
import { viewOfNodes } from './node-views.ts'
import { createSearchOverlay, type SearchOverlay } from './search-overlay.ts'
import type { SearchEntry } from './search.ts'
import { createCompactionNotice, type CompactionNotice } from './compaction-notice.ts'
import { compactionAfter, latestCompactionSeq } from './compaction-watch.ts'
import { STORE_KEY, appendEntries, loadEntries, safeStorage } from './history-store.ts'
import { loadSnippets, noteSnippetUse, parseSnippetCommand, saveCommandText, upsertSnippet, type SnippetRecord } from './snippets.ts'
import { fillTemplate, loadTemplates, mergeTemplates, templatesFromJson, templatesToJson } from './templates.ts'
import { hintFor, hintText, noteUsage } from './insights.ts'
import { createDraftHint, createTransientNotice } from './notice.ts'

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
  // path extracts the configured kinds only (model-written summaries never
  // pollute the sent-message store), the recall paths also admit compaction
  // checkpoint summaries when enabled — both shapes are cached per nodes
  // reference inside each extractor.
  const toViews = viewOfNodes
  const recallExtractor = new HistoryExtractor(
    effectiveKinds(options.includeKinds, options.includeCompactionSummaries),
    options.maxHistory,
    toViews,
  )
  const persistExtractor = new HistoryExtractor(options.includeKinds, 0, toViews)
  const extract = (nodes: readonly ConversationNode[], max: number): string[] => recallExtractor.extract(nodes, max)
  const extractPersist = (nodes: readonly ConversationNode[]): string[] => persistExtractor.extract(nodes, 0)

  let handle: ComposerHistoryHandle | undefined
  let searchAnchor: HTMLTextAreaElement | undefined
  let lastComposer: HTMLTextAreaElement | undefined

  // The workspace key snippet scoping and template variables resolve against:
  // the current session's cwd, falling back to its title (both browser-local).
  const currentWorkspaceKey = (): string => {
    const id = ctx.sessions.list.getSnapshot().current
    if (id === undefined) return ''
    const summary = (ctx.sessions.list.getSnapshot() as { byId?: Record<string, { cwd?: string; title?: string }> }).byId?.[String(id)]
    return summary?.cwd ?? summary?.title ?? ''
  }

  // Snippet library scoped to this workspace: global snippets plus the ones
  // saved under the current workspace key.
  const visibleSnippets = (): SnippetRecord[] => {
    if (!options.enableSnippets || storage === undefined) return []
    const key = currentWorkspaceKey()
    return loadSnippets(storage).filter(snippet => snippet.scope === 'global' || snippet.scope === key)
  }

  const transient = createTransientNotice()
  const hint = createDraftHint()

  /** Update the reuse-insight hint under the composer ('' hides it). */
  const updateDraftHint = (composer: HTMLTextAreaElement): void => {
    if (hint === undefined) return
    if (!options.enableInsights || storage === undefined) {
      hint.set('', composer)
      return
    }
    const record = hintFor(storage, composer.value)
    if (record === undefined || record.uses < options.insightMinUses) {
      hint.set('', composer)
      return
    }
    hint.set(hintText(record), composer)
  }

  /**
   * `/save <name>` and `/load <name>` command handling on Enter: the draft's
   * first line is parsed as a snippet command; a match consumes the Enter so
   * the command never reaches the send path. The plugin never sends.
   * @returns true when the Enter was consumed.
   */
  const runSnippetCommand = (composer: HTMLTextAreaElement): boolean => {
    if (!options.enableSnippets || storage === undefined) return false
    const input = host.inputState(composer)
    if (input === undefined || input.phase !== 'plain') return false
    if (host.menuOpen(composer)) return false
    const command = parseSnippetCommand(input.draft)
    if (command === undefined) return false
    if (command.verb === 'save') {
      const text = saveCommandText(input.draft)
      if (text === '') {
        transient?.show(`snippet ${command.name}: nothing to save (draft after the command is empty)`, 'error')
        return true
      }
      try {
        upsertSnippet(
          storage,
          { name: command.name, text, tags: command.tags, scope: currentWorkspaceKey() === '' ? 'global' : currentWorkspaceKey() },
          options.maxSnippets,
        )
        transient?.show(`snippet saved: ${command.name}`)
      } catch (error) {
        transient?.show(`snippet ${command.name}: ${error instanceof Error ? error.message : String(error)}`, 'error')
      }
      handle?.fill(composer, '')
      updateDraftHint(composer)
      return true
    }
    const snippet = loadSnippets(storage).find(item => item.name === command.name)
    if (snippet === undefined) {
      transient?.show(`no snippet named ${command.name} (open Ctrl+R search to browse snippets)`, 'error')
      return true
    }
    noteSnippetUse(storage, command.name)
    transient?.show(`snippet loaded: ${command.name}`)
    handle?.fill(composer, snippet.text)
    updateDraftHint(composer)
    return true
  }

  const overlay: SearchOverlay | undefined = createSearchOverlay({
    onPick: (text, source, label) => {
      const composer = searchAnchor
      // Return keyboard focus to the composer so typing continues naturally.
      composer?.focus()
      if (handle !== undefined && composer !== undefined) {
        if (source === 'template') {
          try {
            const values = {
              workspace: currentWorkspaceKey() || 'workspace',
              session: currentSessionId() ?? '',
              draft: composer.value,
            }
            handle.fill(composer, fillTemplate(text, values))
          } catch (error) {
            transient?.show(`template ${label ?? ''}: ${error instanceof Error ? error.message : String(error)}`, 'error')
          }
        } else {
          if (source === 'snippet' && label !== undefined && storage !== undefined) {
            noteSnippetUse(storage, label)
            transient?.show(`snippet loaded: ${label}`)
          }
          handle.fill(composer, text)
        }
        updateDraftHint(composer)
      }
    },
    onCancel: () => {
      searchAnchor?.focus()
    },
  })
  const notice: CompactionNotice | undefined = createCompactionNotice({
    compactCommandText: options.compactCommandText,
    onCompactNow: () => {
      // Fill the compact command into the composer the user last used; the
      // plugin never sends — Enter stays the user's.
      const composer = lastComposer
      if (composer === undefined || handle === undefined) return
      composer.focus()
      handle.fill(composer, options.compactCommandText)
    },
  })

  /** Template library export: one explicit click downloads the JSON document. */
  const exportTemplates = (): void => {
    if (storage === undefined || typeof document === 'undefined') return
    const json = templatesToJson(loadTemplates(storage))
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'dsh-composer-templates.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  /** Template library import: one explicit file pick, validated fail-loud. */
  const importTemplates = (): void => {
    if (storage === undefined || typeof document === 'undefined') return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (file === undefined) return
      void file.text().then(raw => {
        try {
          const imported = templatesFromJson(raw)
          const written = mergeTemplates(storage, imported)
          transient?.show(`templates imported: ${written}`)
        } catch (error) {
          transient?.show(`template import failed: ${error instanceof Error ? error.message : String(error)}`, 'error')
        }
      })
    })
    input.click()
  }

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
      // Structured entries: compaction summaries badge amber (highlight),
      // snippets and templates show their name and fill on pick.
      const entries: Array<string | SearchEntry> = []
      for (const text of history) {
        if (options.enableCompactionHighlight && text.startsWith('[compacted]')) {
          entries.push({ text, source: 'compacted' })
        } else {
          entries.push(text)
        }
      }
      if (storage !== undefined) {
        if (options.enableSnippets) {
          for (const snippet of visibleSnippets()) {
            entries.push({ text: snippet.text, source: 'snippet', label: snippet.name })
          }
        }
        if (options.enableTemplates) {
          for (const template of loadTemplates(storage)) {
            entries.push({ text: template.text, source: 'template', label: template.name })
          }
        }
      }
      const actions = options.enableTemplates && storage !== undefined
        ? [{ label: 'Export templates', onClick: exportTemplates }, { label: 'Import templates', onClick: importTemplates }]
        : undefined
      overlay.open(composer, entries, options.searchCaseSensitive, actions)
    },
  }

  const visualSpans = mirror === undefined
    ? undefined
    : (composer: HTMLTextAreaElement, draft: string) => mirror.spans(composer, draft)
  const hostWithSpans: ComposerHistoryHost = visualSpans === undefined ? host : { ...host, visualSpans }

  handle = createComposerHistory(hostWithSpans, options)

  const windowKeydown = (event: KeyboardEvent): void => {
    const composer = host.composerOf(event.target)
    if (composer !== undefined) lastComposer = composer
    // Snippet commands consume Enter before the interceptor ever sees it:
    // the draft's first line is a /save or /load command, so the send path
    // is never reached with the command line.
    if (composer !== undefined && event.key === 'Enter' && !event.isComposing && runSnippetCommand(composer)) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    handle?.keydown(event)
  }
  const windowInput = (event: Event): void => {
    const composer = host.composerOf(event.target)
    if (composer !== undefined) {
      lastComposer = composer
      updateDraftHint(composer)
    }
    handle?.input(event)
  }
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
    const added = appendEntries(storage, STORE_KEY, extractPersist(nodes), options.maxPersisted)
    // Reuse insights: every newly committed user message lands one usage
    // record so the hint can report "used M times across N sessions".
    if (options.enableInsights) {
      for (const text of added) noteUsage(storage, text, currentSessionId() ?? '')
    }
  }

  // Sliding-context observation: report compaction checkpoints that land
  // while this page is open. Each session subscribe re-baselines to the
  // newest checkpoint already in the log, so markers that predate the
  // plugin install (or a session switch) never toast.
  let lastCompactionSeq: number | undefined
  const watchCompaction = (nodes: readonly ConversationNode[]): void => {
    if (!options.showCompactionNotice || notice === undefined) return
    const info = compactionAfter(nodes, lastCompactionSeq)
    if (info === undefined) return
    lastCompactionSeq = info.seq
    notice.show(info)
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
    lastCompactionSeq = latestCompactionSeq(session.getSnapshot().nodes)
    lastSync = { length: -1, seq: -1 }
    syncPersisted(session.getSnapshot().nodes)
    disposeSessionSub = session.subscribe(() => {
      const nodes = session.getSnapshot().nodes
      syncPersisted(nodes)
      watchCompaction(nodes)
    })
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
    notice?.dispose()
    mirror?.dispose()
    transient?.dispose()
    hint?.dispose()
  }
}

/**
 * dsh-composer-history, browser half: window-capture keyboard interception
 * that layers terminal-style draft recall over the composer. All reads go
 * through the session services (current session snapshot for history, the
 * input machine facade for draft/phase and the single setDraft write path);
 * the slash-menu gate reads the inputTriggers service, asserted to its
 * exported class type — the sanctioned cross-package pattern for service
 * instances — and falls back to the trigger-token heuristic when the
 * service is absent.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: activates the ctx.conversation Context merge (IConversation face).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: activates the ctx.inputTriggers merge and names the class face for the service assertion.
import type { InputTriggerService } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import { resolveConfig, type ComposerHistoryConfig } from './config.ts'
import { createComposerHistory, type ComposerHistoryHost } from './interceptor.ts'
import { createMirrorMeasurer, type MirrorMeasurer } from './visual-mirror.ts'
import { hasActiveTriggerToken, type HistoryNodeView } from './recall.ts'

export { Config, resolveConfig } from './config.ts'
export type { ComposerHistoryConfig } from './config.ts'
export type { RecallEffect, RecallOptions, RecallState } from './recall.ts'

/** Plugin name: matches the package name, the graph row id, and the bundle id. */
export const name = 'dsh-composer-history'

/** Services the interception reads; activation waits on them. */
export const inject = ['conversation', 'sessions', 'inputTriggers']

/** Structural face of the command popup shell (ctx.commandUi, read defensively without a dependency edge). */
interface PopupSelectFace {
  popupFor(actx: ClientContext): { readonly state: { getSnapshot(): { readonly open: boolean } } }
}

/**
 * Browser plugin body: resolve the config, wire the interception host over
 * the session/input/trigger services, and register the window-capture
 * listeners as one effect.
 * @param ctx - client root context.
 * @param config - partial config (browser boot passes none today); resolved
 *   against the schema so defaults apply and invalid values throw loudly.
 */
export function apply(ctx: ClientContext, config: Partial<ComposerHistoryConfig> = {}): void {
  const options = resolveConfig(config)
  const mirror: MirrorMeasurer | undefined = options.edgeMode === 'visual' ? createMirrorMeasurer() : undefined

  const currentActx = (): ClientContext | undefined => {
    const id = ctx.sessions.list.getSnapshot().current
    return id === undefined ? undefined : ctx.sessions.scope(id)
  }

  const currentSessionId = (): string | undefined => {
    const id = ctx.sessions.list.getSnapshot().current
    return id === undefined ? undefined : String(id)
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
      const views: HistoryNodeView[] = []
      for (const node of nodes) {
        if (node.kind === 'user') {
          views.push({
            kind: 'user',
            texts: node.content.filter(block => block.type === 'text').map(block => block.text),
          })
        }
      }
      return views
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
  }

  const visualSpans = mirror === undefined
    ? undefined
    : (composer: HTMLTextAreaElement, draft: string) => mirror.spans(composer, draft)
  const hostWithSpans: ComposerHistoryHost = visualSpans === undefined ? host : { ...host, visualSpans }

  ctx.effect(() => {
    const handle = createComposerHistory(hostWithSpans, options)
    window.addEventListener('keydown', handle.keydown, true)
    window.addEventListener('input', handle.input, true)
    return () => {
      window.removeEventListener('keydown', handle.keydown, true)
      window.removeEventListener('input', handle.input, true)
      mirror?.dispose()
    }
  }, 'dsh-composer-history: capture keyboard wiring')
}

/**
 * Browser wiring core: turns the pure {@link DraftRecall} machine into the
 * window-capture keyboard behavior. Everything platform-specific arrives
 * through the injected {@link ComposerHistoryHost}, so the full takeover
 * semantics (preventDefault/stopPropagation discipline, divergence on edit,
 * session-switch reset) are testable under jsdom with fakes.
 *
 * Contract: an event is only prevented once the machine produced a non-pass
 * effect; every pass path leaves the event untouched. After a takeover the
 * caret is moved to the end of the filled text on the next animation frame
 * (requestAnimationFrame + setSelectionRange), and the draft write always
 * goes through the host's setDraft (the input machine's single write path).
 */

import {
  DraftRecall, downAtLogicalEdge, extractHistory, upAtLogicalEdge,
  type HistoryNodeView, type RecallEffect, type RecallOptions, type RecallState,
} from './recall.ts'
import {
  downAtLastVisualLine, upAtFirstVisualLine, type VisualLineSpan,
} from './visual-edge.ts'

/** The input-machine slice the interceptor reads (phase gates interception). */
export interface ComposerInputView {
  readonly draft: string
  readonly phase: string
}

/**
 * Platform seams the plugin body satisfies. All methods run synchronously;
 * event-handler reads of live snapshots are the sanctioned pattern.
 */
export interface ComposerHistoryHost {
  /** The composer textarea behind an event target, or undefined outside the composer. */
  composerOf(target: EventTarget | null): HTMLTextAreaElement | undefined
  /** Stable identity of the session the composer belongs to (resets on switch). */
  sessionKey(composer: HTMLTextAreaElement): string | undefined
  /** Live input machine state of the composer's session. */
  inputState(composer: HTMLTextAreaElement): ComposerInputView | undefined
  /** Session nodes for the fresh history extraction (called per key press). */
  history(composer: HTMLTextAreaElement): readonly HistoryNodeView[]
  /** A picker owning the arrow keys is open (slash menu, command popup, token fallback). */
  menuOpen(composer: HTMLTextAreaElement): boolean
  /** Single programmatic draft write path. */
  setDraft(composer: HTMLTextAreaElement, text: string): void
  /** Measured visual line spans for edgeMode='visual'; absent in logical mode. */
  visualSpans?(composer: HTMLTextAreaElement, draft: string): readonly VisualLineSpan[] | undefined
}

/** Handle owned by one plugin apply: the window-capture listeners plus introspection. */
export interface ComposerHistoryHandle {
  keydown(event: KeyboardEvent): void
  input(event: Event): void
  state(): RecallState
  reset(): void
}

/**
 * Build the interception handle over a host and the resolved options.
 * @param host - platform seams.
 * @param options - resolved tunables.
 * @returns the handle; wire it to window capture listeners and dispose with
 *   the owning fiber (the handle owns no external resources itself).
 */
export function createComposerHistory(host: ComposerHistoryHost, options: RecallOptions): ComposerHistoryHandle {
  const machine = new DraftRecall(options)
  let lastSession: string | undefined

  const keyOf = (event: KeyboardEvent): 'up' | 'down' | 'escape' | undefined => {
    switch (event.key) {
      case 'ArrowUp': return 'up'
      case 'ArrowDown': return 'down'
      case 'Escape': return 'escape'
      default: return undefined
    }
  }

  const caretTo = (composer: HTMLTextAreaElement, caret: number): void => {
    // Defer past React's discrete-event render commit, which applies the
    // setDraft value to the textarea before the next frame.
    requestAnimationFrame(() => {
      composer.setSelectionRange(caret, caret)
    })
  }

  const caretToEnd = (composer: HTMLTextAreaElement): void => {
    caretTo(composer, composer.value.length)
  }

  const apply = (composer: HTMLTextAreaElement, effect: RecallEffect): void => {
    switch (effect.kind) {
      case 'pass':
        return
      case 'hold':
        return
      case 'fill':
        host.setDraft(composer, effect.text)
        caretToEnd(composer)
        return
      case 'restore':
        host.setDraft(composer, effect.text)
        if (effect.caret !== undefined) caretTo(composer, Math.min(effect.caret, effect.text.length))
        return
    }
  }

  const edgeVerdicts = (composer: HTMLTextAreaElement, draft: string, caret: number): { upEdge: boolean; downEdge: boolean } => {
    if (options.edgeMode === 'visual') {
      const spans = host.visualSpans?.(composer, draft) ?? [{ start: 0, end: draft.length }]
      return { upEdge: upAtFirstVisualLine(spans, caret), downEdge: downAtLastVisualLine(spans, caret) }
    }
    return { upEdge: upAtLogicalEdge(draft, caret), downEdge: downAtLogicalEdge(draft, caret) }
  }

  const keydown = (event: KeyboardEvent): void => {
    const key = keyOf(event)
    if (key === undefined) return
    const composer = host.composerOf(event.target)
    if (composer === undefined) return
    const sessionKey = host.sessionKey(composer)
    if (sessionKey !== lastSession) {
      machine.reset()
      lastSession = sessionKey
    }
    const input = host.inputState(composer)
    if (input === undefined) return
    if (input.phase !== 'plain') return
    if (host.menuOpen(composer)) return
    const caret = composer.selectionStart
    if (composer.selectionEnd !== caret) return
    if (event.altKey || event.metaKey || event.shiftKey) return
    if (event.isComposing) return
    if (key === 'escape') {
      if (event.ctrlKey) return
    } else if (event.ctrlKey && !options.enableCtrlAlias) {
      return
    }
    // A send committed while browsing clears the draft programmatically
    // (no input event): leave browsing before any recall decisions.
    if (machine.stateOf().kind === 'browsing' && input.draft === '' && input.phase === 'plain') {
      machine.reset()
    }
    const draft = input.draft
    const { upEdge, downEdge } = edgeVerdicts(composer, draft, caret)
    const frame = {
      key,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      isComposing: event.isComposing,
      hasSelection: false,
      phase: input.phase,
      menuOpen: false,
      draft,
      caret,
      history: extractHistory(host.history(composer)),
      upEdge,
      downEdge,
    }
    const effect = key === 'up' ? machine.up(frame) : key === 'down' ? machine.down(frame) : machine.escape(frame)
    if (effect.kind === 'pass') return
    event.preventDefault()
    event.stopPropagation()
    apply(composer, effect)
  }

  const input = (event: Event): void => {
    const composer = host.composerOf(event.target)
    if (composer === undefined) return
    const sessionKey = host.sessionKey(composer)
    if (sessionKey !== lastSession) {
      machine.reset()
      lastSession = sessionKey
    }
    // The DOM value already carries the edit at capture time; the machine
    // snapshot updates only after React handles the event in the bubble phase.
    machine.noteDraftChange(composer.value)
  }

  return {
    keydown,
    input,
    state: () => machine.stateOf(),
    reset: () => {
      machine.reset()
    },
  }
}

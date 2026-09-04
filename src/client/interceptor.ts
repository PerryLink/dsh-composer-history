/**
 * Browser wiring core: turns the pure {@link DraftRecall} machine into the
 * window-capture keyboard behavior. Everything platform-specific arrives
 * through the injected {@link ComposerHistoryHost}, so the full takeover
 * semantics (preventDefault/stopPropagation discipline, divergence on edit,
 * session-switch reset, search chord, key remapping) are testable under
 * jsdom with fakes.
 *
 * Contract: an event is only prevented once the machine produced a non-pass
 * effect; every pass path leaves the event untouched. After a takeover the
 * caret is moved to the end of the filled text on the next animation frame
 * (requestAnimationFrame + the Selection/Range caret face from
 * composer-dom.ts, pending frames cancelled on reschedule and dispose), and
 * the draft write always goes through the host's setDraft (the input
 * machine's single write path).
 */

import {
  DraftRecall, composeHistory, downAtLogicalEdge, effectiveKinds, extractHistory, upAtLogicalEdge,
  type HistoryNodeView, type RecallEffect, type RecallState,
} from './recall.ts'
import {
  downAtLastVisualLine, upAtFirstVisualLine, type VisualLineSpan,
} from './visual-edge.ts'
import { chordMatches, parseChord, type KeyChord } from './keys.ts'
import { composerCaret, composerText, setComposerCaret, type ComposerElement } from './composer-dom.ts'
import type { ComposerHistoryConfig } from './config.ts'

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
  /** The composer element behind an event target, or undefined outside the composer. */
  composerOf(target: EventTarget | null): ComposerElement | undefined
  /** Stable identity of the session the composer belongs to (resets on switch). */
  sessionKey(composer: ComposerElement): string | undefined
  /** Live input machine state of the composer's session. */
  inputState(composer: ComposerElement): ComposerInputView | undefined
  /** Session nodes for the fresh history extraction (called per key press). */
  history(composer: ComposerElement): readonly HistoryNodeView[]
  /** Already-extracted entries from beyond the current session (persisted, workspace). */
  supplementalHistory?(composer: ComposerElement): readonly string[]
  /** A picker owning the arrow keys is open (slash menu, command popup, token fallback). */
  menuOpen(composer: ComposerElement): boolean
  /** Single programmatic draft write path. */
  setDraft(composer: ComposerElement, text: string): void
  /** Open the reverse-search overlay for the merged history (search chord takeover). */
  openSearch(composer: ComposerElement, history: readonly string[]): void
  /** Measured visual line spans for edgeMode='visual'; absent in logical mode. */
  visualSpans?(composer: ComposerElement, draft: string): readonly VisualLineSpan[] | undefined
}

/** Handle owned by one plugin apply: the window-capture listeners plus introspection. */
export interface ComposerHistoryHandle {
  keydown(event: KeyboardEvent): void
  input(event: Event): void
  state(): RecallState
  reset(): void
  /** Write a text into the draft and move the caret to its end (search picks). */
  fill(composer: ComposerElement, text: string): void
  /** Cancel pending caret frames and leave the machine idle (owner teardown). */
  dispose(): void
}

/**
 * Build the interception handle over a host and the resolved options.
 * Search chord specs are parsed here: a malformed spec throws, failing the
 * browser fiber loudly at load.
 * @param host - platform seams.
 * @param config - resolved tunables.
 * @returns the handle; wire it to window capture listeners and dispose with
 *   the owning fiber (the handle owns no external resources itself).
 */
export function createComposerHistory(host: ComposerHistoryHost, config: ComposerHistoryConfig): ComposerHistoryHandle {
  const machine = new DraftRecall(config)
  const searchChords: readonly KeyChord[] = config.searchKeys.map(parseChord)
  let lastSession: string | undefined
  let rafId: number | undefined

  const keyOf = (event: KeyboardEvent): 'up' | 'down' | 'escape' | undefined => {
    if (event.key === config.upKey) return 'up'
    if (event.key === config.downKey) return 'down'
    if (event.key === config.escapeKey) return 'escape'
    return undefined
  }

  const caretTo = (composer: ComposerElement, caret: number): void => {
    // Defer past React's discrete-event render commit, which applies the
    // setDraft value to the composer surface before the next frame.
    if (rafId !== undefined) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      rafId = undefined
      setComposerCaret(composer, caret)
    })
  }

  const caretToEnd = (composer: ComposerElement): void => {
    caretTo(composer, composerText(composer).length)
  }

  const apply = (composer: ComposerElement, effect: RecallEffect): void => {
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
      case 'openSearch':
        host.openSearch(composer, effect.history)
        return
    }
  }

  const edgeVerdicts = (composer: ComposerElement, draft: string, caret: number): { upEdge: boolean; downEdge: boolean } => {
    if (config.edgeMode === 'visual') {
      const spans = host.visualSpans?.(composer, draft) ?? [{ start: 0, end: draft.length }]
      return { upEdge: upAtFirstVisualLine(spans, caret), downEdge: downAtLastVisualLine(spans, caret) }
    }
    return { upEdge: upAtLogicalEdge(draft, caret), downEdge: downAtLogicalEdge(draft, caret) }
  }

  /** Fresh merged history for this key press: supplemental entries, then the current session's. */
  const mergedHistory = (composer: ComposerElement): string[] => {
    const kinds = effectiveKinds(config.includeKinds, config.includeCompactionSummaries)
    const current = extractHistory(host.history(composer), { kinds, max: config.maxHistory })
    const merged = composeHistory(host.supplementalHistory?.(composer) ?? [], current)
    return config.maxHistory > 0 && merged.length > config.maxHistory ? merged.slice(-config.maxHistory) : merged
  }

  const keydown = (event: KeyboardEvent): void => {
    const key = keyOf(event)
    const searchChord = config.enableSearch && !event.repeat
      ? searchChords.find(chord => chordMatches(event, chord))
      : undefined
    if (key === undefined && searchChord === undefined) return
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
    const caret = composerCaret(composer)
    if (caret === undefined) return
    if (event.isComposing) return
    let effect: RecallEffect
    if (searchChord !== undefined) {
      // Search branch: the chord's modifiers are exact by match, so the
      // alt/meta/shift arrow policy must not gate it. Starting a search ends
      // any browsing — the recalled text shown becomes the ordinary draft,
      // exactly like the divergence guard.
      machine.reset()
      effect = { kind: 'openSearch', history: mergedHistory(composer) }
    } else {
      if (key === undefined) return
      if (event.altKey || event.metaKey || event.shiftKey) return
      if (key === 'escape') {
        if (event.ctrlKey) return
      } else if (event.ctrlKey && !config.enableCtrlAlias) {
        return
      }
      // A send committed while browsing clears the draft programmatically
      // (no input event): leave browsing before any recall decisions. The
      // phase is already known to be 'plain' at this point.
      if (machine.stateOf().kind === 'browsing' && input.draft === '') {
        machine.reset()
      }
      const draft = input.draft
      const { upEdge, downEdge } = edgeVerdicts(composer, draft, caret)
      // History is only consumed by ↑ (always) and by ↓ while browsing;
      // the common IDLE-↓ caret path and Escape skip the merge entirely.
      const needsHistory = key === 'up' || (key === 'down' && machine.stateOf().kind === 'browsing')
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
        history: needsHistory ? mergedHistory(composer) : [],
        upEdge,
        downEdge,
      }
      effect = key === 'up' ? machine.up(frame) : key === 'down' ? machine.down(frame) : machine.escape(frame)
    }
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
    // The surface text already carries the edit by the time this bubble
    // listener runs (the editor library writes the contenteditable DOM in
    // its own target-phase listeners); the machine snapshot updates only
    // after the full dispatch.
    machine.noteDraftChange(composerText(composer))
  }

  return {
    keydown,
    input,
    state: () => machine.stateOf(),
    reset: () => {
      machine.reset()
    },
    fill: (composer, text) => {
      host.setDraft(composer, text)
      caretToEnd(composer)
    },
    dispose: () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId)
      rafId = undefined
      machine.reset()
    },
  }
}

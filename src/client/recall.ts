/**
 * Pure composer-history state machine: draft recall over the current
 * session's user messages, plus the history extraction, the interception
 * gates, and the logical edge predicates. Zero DOM, zero cordis — every
 * dependency arrives through method arguments, so the whole behavior matrix
 * is unit-testable without a browser.
 *
 * State:
 * - IDLE: not browsing; the composer behaves normally.
 * - BROWSING { index, savedDraft, savedCaret, history }: index points into
 *   the history array (newest last); savedDraft/savedCaret are the draft and
 *   caret stashed when browsing started. Returning to the newest entry (or
 *   Escape) restores exactly that pair, so a half-typed draft survives the
 *   detour instead of being cleared like a plain terminal recall.
 */

/** How a non-empty draft interacts with the first recall. */
export type RecallMode = 'save' | 'gate'

/** Which edge predicate picks the takeover boundary. */
export type EdgeMode = 'logical' | 'visual'

/** Tunables the machine honors; the plugin Config resolves into this shape. */
export interface RecallOptions {
  /** 'save': a non-empty draft is stashed before the first recall; 'gate': only an empty draft recalls. */
  readonly recallWithDraft: RecallMode
  /** Escape while browsing restores the stashed draft. */
  readonly restoreOnEscape: boolean
  /** 'logical' reasons over '\n' characters; 'visual' over measured wrapped lines. */
  readonly edgeMode: EdgeMode
  /** Ctrl+ArrowUp/Down behaves like the bare arrow. */
  readonly enableCtrlAlias: boolean
  /** Returning to the newest entry / Escape restores the stashed caret too. */
  readonly restoreCaret: boolean
}

/** Projected view of one conversation node (the wiring layer maps the runtime snapshot). */
export interface HistoryNodeView {
  readonly kind: string
  /** Text block payloads in source order. */
  readonly texts: readonly string[]
}

/** Machine state; 'browsing' carries the snapshot the restore path needs. */
export type RecallState =
  | { readonly kind: 'idle' }
  | {
      readonly kind: 'browsing'
      readonly index: number
      readonly savedDraft: string
      readonly savedCaret: number
      readonly history: readonly string[]
    }

/**
 * What the caller must do after a key.
 * - pass: leave the event alone (zero side effects).
 * - hold: intercept without any mutation (at the oldest entry).
 * - fill: write the entry into the draft, then move the caret to its end.
 * - restore: write the stashed draft back; caret present exactly when
 *   restoreCaret is on and the stashed caret should be re-applied.
 */
export type RecallEffect =
  | { readonly kind: 'pass' }
  | { readonly kind: 'hold' }
  | { readonly kind: 'fill'; readonly text: string }
  | { readonly kind: 'restore'; readonly text: string; readonly caret?: number }

/** Everything one intercepted key press can depend on (resolved by the caller). */
export interface RecallKeyFrame {
  readonly key: 'up' | 'down' | 'escape'
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
  readonly shiftKey: boolean
  readonly isComposing: boolean
  readonly hasSelection: boolean
  /** Input machine phase; only 'plain' admits interception. */
  readonly phase: string
  /** A picker that owns the arrow keys is open (slash menu / command popup). */
  readonly menuOpen: boolean
  readonly draft: string
  readonly caret: number
  /** Fresh extraction for this session at key time (newest last). */
  readonly history: readonly string[]
  /** Precomputed edge verdicts for the caret (logical or visual, per config). */
  readonly upEdge: boolean
  readonly downEdge: boolean
}

/**
 * Extract the recall history from a session's nodes in time order (newest
 * last): user nodes only, text blocks joined per node, blank entries
 * dropped, adjacent duplicates merged. One entry per submitted message.
 * @param nodes - projected conversation nodes in seq order.
 * @returns non-blank user entries, oldest first.
 */
export function extractHistory(nodes: readonly HistoryNodeView[]): string[] {
  const entries: string[] = []
  for (const node of nodes) {
    if (node.kind !== 'user') continue
    const text = node.texts.join('\n')
    if (text.trim() === '') continue
    if (entries[entries.length - 1] === text) continue
    entries.push(text)
  }
  return entries
}

const WORD_CHAR = /[\p{L}\p{N}_]/u
const WHITESPACE = /\s/u

/**
 * Whether a live trigger token ('/' or '@' at a word boundary) sits at the
 * caret — the menu-open fallback when the inputTriggers service is missing.
 * Mirrors the slash pipeline's boundary rules: a trigger opens at
 * start-of-draft, after whitespace, or after punctuation; '/' additionally
 * stays dead directly after '/' and after a scheme separator (`https:/…`).
 * @param draft - composer draft text.
 * @param caret - caret offset into `draft`.
 */
export function hasActiveTriggerToken(draft: string, caret: number): boolean {
  for (let i = caret - 1; i >= 0; i--) {
    const ch = draft.charAt(i)
    if (WHITESPACE.test(ch)) return false
    if (ch !== '/' && ch !== '@') continue
    if (i > 0) {
      const prev = draft.charAt(i - 1)
      if (WORD_CHAR.test(prev)) continue
      if (ch === '/') {
        if (prev === '/') continue
        if (prev === ':' && i >= 2 && !WHITESPACE.test(draft.charAt(i - 2))) continue
      }
    }
    return true
  }
  return false
}

/** Logical ↑ edge: the caret sits on the first line (or the draft has one line). */
export function upAtLogicalEdge(draft: string, caret: number): boolean {
  const firstNewline = draft.indexOf('\n')
  return firstNewline === -1 || caret <= firstNewline
}

/** Logical ↓ edge: the caret sits on the last line. */
export function downAtLogicalEdge(draft: string, caret: number): boolean {
  return caret > draft.lastIndexOf('\n')
}

/**
 * Keyboard/composition/selection gate shared by every key. Modifier sets
 * allowed: none, or Ctrl alone on the arrows when enableCtrlAlias is on.
 * @param frame - the key press facts.
 * @param options - tunables.
 */
function keysAllowed(frame: RecallKeyFrame, options: RecallOptions): boolean {
  if (frame.isComposing || frame.hasSelection) return false
  if (frame.altKey || frame.metaKey || frame.shiftKey) return false
  if (frame.key === 'escape') return !frame.ctrlKey
  return !frame.ctrlKey || options.enableCtrlAlias
}

/** Interception gate: keyboard facts plus the input phase and the picker state. */
function interceptionGate(frame: RecallKeyFrame, options: RecallOptions): boolean {
  if (frame.phase !== 'plain') return false
  if (frame.menuOpen) return false
  return keysAllowed(frame, options)
}

/**
 * The draft-recall machine. All mutation stays inside; every method is a
 * pure function of its arguments plus the internal state.
 */
export class DraftRecall {
  private state: RecallState = { kind: 'idle' }

  /** @param options - resolved tunables (the plugin Config output). */
  constructor(private readonly options: RecallOptions) {}

  /** Current state (tests and diagnostics). */
  stateOf(): RecallState {
    return this.state
  }

  /** Leave browsing without touching the draft (session switch, teardown). */
  reset(): void {
    this.state = { kind: 'idle' }
  }

  /**
   * User edit guard: when browsing and the draft diverged from the browsed
   * entry, the edit becomes the new draft and browsing ends. Called on every
   * composer input event with the live DOM value (which already carries the
   * edit at capture time).
   * @param draft - the composer's current value.
   */
  noteDraftChange(draft: string): void {
    const state = this.state
    if (state.kind !== 'browsing') return
    if (draft !== state.history[state.index]) this.state = { kind: 'idle' }
  }

  /**
   * ↑: in IDLE the first recall stashes {draft, caret} and fills the newest
   * entry (gated by recallWithDraft); while browsing an eligible ↑ walks one
   * entry older, stopping at index 0 with a hold.
   * @param frame - key facts plus the fresh history extraction.
   * @returns the effect to apply.
   */
  up(frame: RecallKeyFrame): RecallEffect {
    if (!interceptionGate(frame, this.options) || !frame.upEdge) return { kind: 'pass' }
    const history = frame.history
    const state = this.state
    if (state.kind === 'idle') {
      if (history.length === 0) return { kind: 'pass' }
      if (this.options.recallWithDraft === 'gate' && frame.draft !== '') return { kind: 'pass' }
      const index = history.length - 1
      const text = history[index]
      if (text === undefined) return { kind: 'pass' }
      this.state = { kind: 'browsing', index, savedDraft: frame.draft, savedCaret: frame.caret, history }
      return { kind: 'fill', text }
    }
    if (history.length === 0) {
      this.state = { kind: 'idle' }
      return { kind: 'pass' }
    }
    const index = Math.min(state.index, history.length - 1)
    if (index <= 0) {
      // Oldest entry: intercept without mutation so the textarea neither
      // scrolls nor attempts a caret move beyond the draft.
      this.state = { ...state, index, history }
      return { kind: 'hold' }
    }
    const next = index - 1
    const text = history[next]
    if (text === undefined) return { kind: 'pass' }
    this.state = { ...state, index: next, history }
    return { kind: 'fill', text }
  }

  /**
   * ↓: IDLE always passes (plain caret movement). While browsing an eligible
   * ↓ walks one entry newer; at the newest entry it restores the stashed
   * draft (and caret, when restoreCaret) and returns to IDLE.
   * @param frame - key facts plus the fresh history extraction.
   * @returns the effect to apply.
   */
  down(frame: RecallKeyFrame): RecallEffect {
    if (!interceptionGate(frame, this.options)) return { kind: 'pass' }
    const state = this.state
    if (state.kind === 'idle') return { kind: 'pass' }
    const history = frame.history
    if (history.length === 0) {
      this.state = { kind: 'idle' }
      return { kind: 'pass' }
    }
    if (!frame.downEdge) return { kind: 'pass' }
    const index = Math.min(state.index, history.length - 1)
    if (index < history.length - 1) {
      const next = index + 1
      const text = history[next]
      if (text === undefined) return { kind: 'pass' }
      this.state = { ...state, index: next, history }
      return { kind: 'fill', text }
    }
    this.state = { kind: 'idle' }
    return this.options.restoreCaret
      ? { kind: 'restore', text: state.savedDraft, caret: state.savedCaret }
      : { kind: 'restore', text: state.savedDraft }
  }

  /**
   * Esc: while browsing and restoreOnEscape is on, restore the stashed draft
   * (and caret) and return to IDLE, consuming the key. Every other Esc —
   * including while the menu or a popup owns it — passes untouched.
   * @param frame - key facts.
   * @returns the effect to apply.
   */
  escape(frame: RecallKeyFrame): RecallEffect {
    if (!this.options.restoreOnEscape) return { kind: 'pass' }
    if (!interceptionGate(frame, this.options)) return { kind: 'pass' }
    const state = this.state
    if (state.kind === 'idle') return { kind: 'pass' }
    this.state = { kind: 'idle' }
    return this.options.restoreCaret
      ? { kind: 'restore', text: state.savedDraft, caret: state.savedCaret }
      : { kind: 'restore', text: state.savedDraft }
  }
}

/**
 * Key-spec parsing and matching: the tunable keybindings of the plugin.
 * Arrow/Escape keys are plain `KeyboardEvent.key` names; search chords are
 * `Modifier+Key` specs ('Ctrl+R'). Both are Config strings — malformed specs
 * throw here, so a bad cordis.yml/settings value fails the plugin fiber
 * loudly at load instead of silently disabling a key.
 */

/** One parsed search chord: exact modifier set plus the key name. */
export interface KeyChord {
  readonly key: string
  readonly ctrl: boolean
  readonly alt: boolean
  readonly meta: boolean
  readonly shift: boolean
}

/** Keyboard facts a chord is matched against (KeyboardEvent is structural). */
export interface ChordKeyEvent {
  readonly key: string
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
  readonly shiftKey: boolean
}

const MODIFIERS = new Map<string, keyof Pick<KeyChord, 'ctrl' | 'alt' | 'meta' | 'shift'>>([
  ['ctrl', 'ctrl'],
  ['control', 'ctrl'],
  ['alt', 'alt'],
  ['option', 'alt'],
  ['meta', 'meta'],
  ['cmd', 'meta'],
  ['win', 'meta'],
  ['shift', 'shift'],
])

/**
 * Parse one chord spec like 'Ctrl+R' or 'Ctrl+Shift+Up'.
 * @param spec - config string.
 * @returns the parsed chord.
 * @throws when the spec is empty, names an unknown modifier, repeats a
 *   modifier, or has no trailing key name.
 */
export function parseChord(spec: string): KeyChord {
  const parts = spec.split('+')
  let key = ''
  let ctrl = false
  let alt = false
  let meta = false
  let shift = false
  for (const raw of parts) {
    const token = raw.trim()
    if (token === '') throw new Error(`invalid key spec ${JSON.stringify(spec)}: empty part`)
    const modifier = MODIFIERS.get(token.toLowerCase())
    if (modifier !== undefined) {
      if (modifier === 'ctrl') {
        if (ctrl) throw new Error(`invalid key spec ${JSON.stringify(spec)}: repeated ${token}`)
        ctrl = true
      } else if (modifier === 'alt') {
        if (alt) throw new Error(`invalid key spec ${JSON.stringify(spec)}: repeated ${token}`)
        alt = true
      } else if (modifier === 'meta') {
        if (meta) throw new Error(`invalid key spec ${JSON.stringify(spec)}: repeated ${token}`)
        meta = true
      } else {
        if (shift) throw new Error(`invalid key spec ${JSON.stringify(spec)}: repeated ${token}`)
        shift = true
      }
      continue
    }
    if (key !== '') throw new Error(`invalid key spec ${JSON.stringify(spec)}: more than one key name`)
    key = token
  }
  if (key === '') throw new Error(`invalid key spec ${JSON.stringify(spec)}: missing key name`)
  return { key, ctrl, alt, meta, shift }
}

/**
 * Whether a keyboard event matches a parsed chord exactly: every modifier
 * the chord declares is held, no undeclared modifier is held, and the key
 * name matches case-insensitively.
 * @param event - keyboard facts.
 * @param chord - parsed chord.
 */
export function chordMatches(event: ChordKeyEvent, chord: KeyChord): boolean {
  return event.ctrlKey === chord.ctrl
    && event.altKey === chord.alt
    && event.metaKey === chord.meta
    && event.shiftKey === chord.shift
    && event.key.toLowerCase() === chord.key.toLowerCase()
}

/**
 * Reverse-search overlay: a minimal DOM panel (query input + match list)
 * opened under the composer for terminal-style Ctrl+R recall. Owns its DOM,
 * styles, and listeners; keyboard events targeting the overlay pass the
 * window-capture interception untouched (the composerOf gate rejects them).
 * Pick (Enter / click) hands the chosen text to the caller; Escape or an
 * outside press cancels. All filter and highlight decisions delegate to
 * search.ts; the panel placement is the pure placePanel clamp (below the
 * composer, flipped above on downward overflow, horizontally clamped into
 * the viewport).
 *
 * Entries are either plain strings (history, backward compatible) or
 * structured {@link SearchEntry} values carrying a provenance badge
 * (compacted summaries are highlighted amber, snippets and templates show
 * their name) and optional footer actions (template import/export).
 */

import { filterSearchEntries, matchRanges, type SearchEntry } from './search.ts'

/** Callbacks the owning wiring satisfies. */
export interface SearchOverlayDeps {
  /** The chosen entry was confirmed (provenance passed through for templates/snippets). */
  onPick(text: string, source?: SearchEntry['source'], label?: string): void
  /** The search was dismissed without a pick. */
  onCancel(): void
}

/** One footer action (rendered as a small button row under the list). */
export interface OverlayAction {
  readonly label: string
  onClick(): void
}

/** Overlay handle owned by one plugin install. */
export interface SearchOverlay {
  /** Whether the panel is currently shown. */
  isOpen(): boolean
  /** Show the panel under the composer and list the matches for ''. */
  open(anchor: HTMLElement, entries: (string | SearchEntry)[], caseSensitive: boolean, actions?: OverlayAction[]): void
  /** Remove the panel node and every listener. */
  dispose(): void
}

/** Viewport-relative anchor rectangle (the composer's bounding rect). */
export interface PanelAnchorRect {
  readonly left: number
  readonly right: number
  readonly top: number
  readonly bottom: number
}

/** Viewport size the panel is placed inside. */
export interface PanelViewport {
  readonly width: number
  readonly height: number
}

/** Resolved fixed-position placement of the panel. */
export interface PanelPlacement {
  readonly left: number
  readonly top: number
  readonly width: number
}

const ROOT_CLASS = '__dsh-composer-history-search__'
const STYLE_ID = '__dsh-composer-history-search-style__'
const PANEL_MARGIN = 8
const PANEL_MIN_WIDTH = 320
const PANEL_MAX_HEIGHT = 328

/**
 * Resolve the panel's fixed-position placement for one composer anchor:
 * at least {@link PANEL_MIN_WIDTH} wide (never wider than the viewport
 * minus margins), horizontally clamped into the viewport, below the
 * composer by default and above it when the panel would overflow downward.
 * Pure over the injected rects so the clamp math is unit-testable.
 * @param anchor - the composer's viewport-relative bounding rect.
 * @param viewport - window inner size.
 * @returns rounded pixel placement.
 */
export function placePanel(anchor: PanelAnchorRect, viewport: PanelViewport): PanelPlacement {
  const width = Math.min(Math.max(anchor.right - anchor.left, PANEL_MIN_WIDTH), viewport.width - 2 * PANEL_MARGIN)
  const left = Math.min(Math.max(anchor.left, PANEL_MARGIN), viewport.width - width - PANEL_MARGIN)
  const belowTop = anchor.bottom + PANEL_MARGIN
  const top = belowTop + PANEL_MAX_HEIGHT <= viewport.height
    ? belowTop
    : Math.max(PANEL_MARGIN, anchor.top - PANEL_MARGIN - PANEL_MAX_HEIGHT)
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width) }
}

/** Injected once per document: the panel chrome (positioned via inline rect math). */
const STYLE_TEXT = [
  `.${ROOT_CLASS}{`,
  'position:fixed;z-index:2147483000;display:flex;flex-direction:column;',
  'background:#1c2128;border:1px solid #444c56;border-radius:8px;',
  'box-shadow:0 8px 24px rgba(0,0,0,.45);font:13px/1.4 system-ui,sans-serif;',
  'color:#e6edf3;max-height:320px;overflow:hidden;padding:6px;gap:6px;',
  '}',
  `.${ROOT_CLASS} input{`,
  'all:unset;box-sizing:border-box;width:100%;padding:6px 8px;border-radius:6px;',
  'background:#10151b;border:1px solid #3d444d;color:#e6edf3;',
  '}',
  `.${ROOT_CLASS} input:focus{border-color:#58a6ff;}`,
  `.${ROOT_CLASS} input::placeholder{color:#8b949e;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}list{overflow-y:auto;display:flex;flex-direction:column;gap:2px;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}status{padding:0 8px;color:#8b949e;font-size:11px;}`,
  // Rows must not shrink: they are scroll containers (overflow:hidden makes
  // their automatic min-height resolve to 0), so a column-flex list that
  // outgrows the panel would squash every row into the one above instead of
  // scrolling. flex-shrink:0 keeps each row at its own height and lets the
  // overflow-y:auto list scroll (issue #3).
  `.${ROOT_CLASS} .${ROOT_CLASS}row{`,
  'padding:5px 8px;border-radius:6px;cursor:pointer;white-space:pre-wrap;flex-shrink:0;',
  'overflow-wrap:anywhere;color:#c9d1d9;max-height:36px;overflow:hidden;',
  '}',
  `.${ROOT_CLASS} .${ROOT_CLASS}row[aria-selected="true"]{background:#316dca;color:#ffffff;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}match{background:transparent;color:#58a6ff;font-weight:600;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}row[aria-selected="true"] .${ROOT_CLASS}match{color:#ffffff;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}empty{padding:5px 8px;color:#8b949e;font-style:italic;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}badge{`,
  'display:inline-block;margin-right:6px;padding:0 5px;border-radius:4px;font-size:10px;',
  'line-height:16px;vertical-align:1px;flex:none;',
  '}',
  `.${ROOT_CLASS} .${ROOT_CLASS}badge--compacted{background:#4a3b10;color:#e3b341;border:1px solid #9e7a16;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}badge--snippet{background:#123b2a;color:#3fb950;border:1px solid #2ea043;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}badge--template{background:#2a1f4d;color:#bc8cff;border:1px solid #8250df;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}row[aria-selected="true"] .${ROOT_CLASS}badge{border-color:#ffffff;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}actions{display:flex;gap:6px;padding-top:2px;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}action{`,
  'all:unset;cursor:pointer;padding:4px 8px;border-radius:6px;font-size:11px;',
  'background:#21262d;border:1px solid #3d444d;color:#c9d1d9;',
  '}',
  `.${ROOT_CLASS} .${ROOT_CLASS}action:hover{border-color:#58a6ff;color:#e6edf3;}`,
].join('')

/** The badge label for a structured entry's provenance ('' = no badge). */
function badgeOf(entry: SearchEntry): string {
  if (entry.source === 'compacted') return 'compacted'
  if (entry.source === 'snippet') return entry.label ?? 'snippet'
  if (entry.source === 'template') return entry.label ?? 'template'
  return ''
}

/**
 * Create the overlay (injecting its shared stylesheet once per document).
 * @param deps - pick/cancel callbacks.
 * @returns the handle, or undefined outside a document.
 */
export function createSearchOverlay(deps: SearchOverlayDeps): SearchOverlay | undefined {
  if (typeof document === 'undefined') return undefined
  if (document.getElementById(STYLE_ID) === null) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = STYLE_TEXT
    document.head.appendChild(style)
  }

  const root = document.createElement('div')
  root.className = ROOT_CLASS
  root.setAttribute('role', 'dialog')
  root.setAttribute('aria-label', 'Search composer history')
  root.style.display = 'none'
  const input = document.createElement('input')
  input.setAttribute('role', 'combobox')
  input.setAttribute('aria-label', 'Search query')
  input.setAttribute('aria-autocomplete', 'list')
  input.setAttribute('aria-expanded', 'false')
  input.setAttribute('aria-controls', `${ROOT_CLASS}list`)
  input.placeholder = 'Search history…'
  const status = document.createElement('div')
  status.className = `${ROOT_CLASS}status`
  const list = document.createElement('div')
  list.className = `${ROOT_CLASS}list`
  list.id = `${ROOT_CLASS}list`
  list.setAttribute('role', 'listbox')
  const actions = document.createElement('div')
  actions.className = `${ROOT_CLASS}actions`
  root.append(input, status, list, actions)

  let open = false
  let entries: readonly SearchEntry[] = []
  let caseSensitive = false
  let selected = 0
  let matches: readonly SearchEntry[] = []

  /** Stable id of one option row (the combobox's activedescendant target). */
  const rowId = (index: number): string => `${ROOT_CLASS}option-${index}`

  const close = (): void => {
    if (!open) return
    open = false
    input.setAttribute('aria-expanded', 'false')
    input.removeAttribute('aria-activedescendant')
    root.style.display = 'none'
    document.removeEventListener('mousedown', onOutside, true)
  }

  /** Append the row text with the matched substrings wrapped in mark spans. */
  const appendRowText = (row: HTMLElement, text: string): void => {
    const ranges = matchRanges(text, input.value, caseSensitive)
    if (ranges.length === 0) {
      row.append(document.createTextNode(text))
      return
    }
    let cursor = 0
    for (const [start, end] of ranges) {
      if (start > cursor) row.append(document.createTextNode(text.slice(cursor, start)))
      const mark = document.createElement('mark')
      mark.className = `${ROOT_CLASS}match`
      mark.textContent = text.slice(start, end)
      row.append(mark)
      cursor = end
    }
    if (cursor < text.length) row.append(document.createTextNode(text.slice(cursor)))
  }

  const render = (): void => {
    list.textContent = ''
    status.textContent = matches.length > 0
      ? `${matches.length} ${input.value === '' ? 'entries' : 'matches'}`
      : ''
    input.setAttribute('aria-activedescendant', matches.length > 0 ? rowId(selected) : '')
    if (matches.length === 0) {
      const empty = document.createElement('div')
      empty.className = `${ROOT_CLASS}empty`
      empty.textContent = 'No matches'
      list.append(empty)
      selected = 0
      return
    }
    matches.forEach((entry, index) => {
      const row = document.createElement('div')
      row.className = `${ROOT_CLASS}row`
      row.setAttribute('role', 'option')
      row.id = rowId(index)
      row.setAttribute('aria-selected', index === selected ? 'true' : 'false')
      const badgeText = badgeOf(entry)
      if (badgeText !== '') {
        const badge = document.createElement('span')
        badge.className = `${ROOT_CLASS}badge ${ROOT_CLASS}badge--${entry.source}`
        badge.textContent = badgeText
        row.append(badge)
      }
      appendRowText(row, entry.text)
      row.addEventListener('click', () => pick(index))
      list.append(row)
    })
    // Keep the selected row inside the scrollable list (jsdom has no
    // layout, so the optional call also keeps tests runnable).
    const selectedRow = list.children[selected]
    if (selectedRow instanceof HTMLElement) selectedRow.scrollIntoView?.({ block: 'nearest' })
  }

  const pick = (index: number): void => {
    const entry = matches[index]
    if (entry === undefined) return
    close()
    deps.onPick(entry.text, entry.source, entry.label)
  }

  const refilter = (): void => {
    matches = filterSearchEntries(entries, input.value, caseSensitive)
    if (matches.length > 0 && selected >= matches.length) selected = matches.length - 1
    render()
  }

  const onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (matches.length > 0) {
        selected = selected + 1 >= matches.length ? 0 : selected + 1
        render()
      }
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (matches.length > 0) {
        selected = selected - 1 < 0 ? matches.length - 1 : selected - 1
        render()
      }
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (matches.length === 0) {
        close()
        deps.onCancel()
      } else {
        pick(selected)
      }
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
      deps.onCancel()
    }
  }

  const onInput = (): void => {
    refilter()
  }

  const onOutside = (event: MouseEvent): void => {
    if (event.target instanceof Node && root.contains(event.target)) return
    close()
    deps.onCancel()
  }

  root.addEventListener('keydown', onKeydown)
  input.addEventListener('input', onInput)

  return {
    isOpen: () => open,
    open: (anchor, rawEntries, matchCase, footerActions) => {
      entries = rawEntries.map(entry => (typeof entry === 'string' ? { text: entry, source: 'history' } : entry))
      caseSensitive = matchCase
      selected = 0
      input.value = ''
      actions.textContent = ''
      if (footerActions !== undefined && footerActions.length > 0) {
        for (const action of footerActions) {
          const button = document.createElement('button')
          button.className = `${ROOT_CLASS}action`
          button.type = 'button'
          button.textContent = action.label
          button.addEventListener('click', () => action.onClick())
          actions.append(button)
        }
      }
      refilter()
      open = true
      root.style.display = 'flex'
      const rect = anchor.getBoundingClientRect()
      const placement = placePanel(rect, { width: window.innerWidth, height: window.innerHeight })
      root.style.left = `${placement.left}px`
      root.style.top = `${placement.top}px`
      root.style.width = `${placement.width}px`
      input.setAttribute('aria-expanded', 'true')
      if (root.parentNode === null) document.body.appendChild(root)
      input.focus()
      document.addEventListener('mousedown', onOutside, true)
    },
    dispose: () => {
      close()
      root.remove()
    },
  }
}

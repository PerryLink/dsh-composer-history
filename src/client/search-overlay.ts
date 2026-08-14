/**
 * Reverse-search overlay: a minimal DOM panel (query input + match list)
 * opened under the composer for terminal-style Ctrl+R recall. Owns its DOM,
 * styles, and listeners; keyboard events targeting the overlay pass the
 * window-capture interception untouched (the composerOf gate rejects them).
 * Pick (Enter / click) hands the chosen text to the caller; Escape or an
 * outside press cancels. All filter decisions delegate to search.ts.
 */

import { filterEntries } from './search.ts'

/** Callbacks the owning wiring satisfies. */
export interface SearchOverlayDeps {
  /** The chosen entry was confirmed. */
  onPick(text: string): void
  /** The search was dismissed without a pick. */
  onCancel(): void
}

/** Overlay handle owned by one plugin install. */
export interface SearchOverlay {
  /** Whether the panel is currently shown. */
  isOpen(): boolean
  /** Show the panel under the composer and list the matches for ''. */
  open(anchor: HTMLElement, entries: readonly string[], caseSensitive: boolean): void
  /** Remove the panel node and every listener. */
  dispose(): void
}

const ROOT_CLASS = '__dsh-composer-history-search__'
const STYLE_ID = '__dsh-composer-history-search-style__'

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
  `.${ROOT_CLASS} .${ROOT_CLASS}list{overflow-y:auto;display:flex;flex-direction:column;gap:2px;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}status{padding:0 8px;color:#8b949e;font-size:11px;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}row{`,
  'padding:5px 8px;border-radius:6px;cursor:pointer;white-space:pre-wrap;',
  'overflow-wrap:anywhere;color:#c9d1d9;max-height:36px;overflow:hidden;',
  '}',
  `.${ROOT_CLASS} .${ROOT_CLASS}row[aria-selected="true"]{background:#316dca;color:#ffffff;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}empty{padding:5px 8px;color:#8b949e;font-style:italic;}`,
].join('')

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
  const status = document.createElement('div')
  status.className = `${ROOT_CLASS}status`
  const list = document.createElement('div')
  list.className = `${ROOT_CLASS}list`
  list.setAttribute('role', 'listbox')
  root.append(input, status, list)

  let open = false
  let entries: readonly string[] = []
  let caseSensitive = false
  let selected = 0
  let matches: readonly string[] = []

  const close = (): void => {
    if (!open) return
    open = false
    root.style.display = 'none'
    document.removeEventListener('mousedown', onOutside, true)
  }

  const render = (): void => {
    list.textContent = ''
    status.textContent = matches.length > 0
      ? `${matches.length} ${input.value === '' ? 'entries' : 'matches'}`
      : ''
    if (matches.length === 0) {
      const empty = document.createElement('div')
      empty.className = `${ROOT_CLASS}empty`
      empty.textContent = 'No matches'
      list.append(empty)
      selected = 0
      return
    }
    matches.forEach((text, index) => {
      const row = document.createElement('div')
      row.className = `${ROOT_CLASS}row`
      row.setAttribute('role', 'option')
      row.setAttribute('aria-selected', index === selected ? 'true' : 'false')
      row.textContent = text
      row.addEventListener('click', () => pick(index))
      list.append(row)
    })
  }

  const pick = (index: number): void => {
    const text = matches[index]
    if (text === undefined) return
    close()
    deps.onPick(text)
  }

  const refilter = (): void => {
    matches = filterEntries(entries, input.value, caseSensitive)
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
    open: (anchor, history, matchCase) => {
      entries = history
      caseSensitive = matchCase
      selected = 0
      input.value = ''
      refilter()
      open = true
      root.style.display = 'flex'
      const rect = anchor.getBoundingClientRect()
      root.style.left = `${Math.round(rect.left)}px`
      root.style.width = `${Math.round(Math.max(rect.width, 320))}px`
      // Below the composer by default; above it when the panel would
      // overflow the viewport downward (328 = max panel height + margins).
      const belowTop = rect.bottom + 8
      root.style.top = belowTop + 328 <= window.innerHeight
        ? `${Math.round(belowTop)}px`
        : `${Math.round(Math.max(8, rect.top - 8 - 328))}px`
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

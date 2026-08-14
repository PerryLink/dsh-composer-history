/**
 * Compaction notice: a transient, viewport-anchored snackbar announcing that
 * the harness just slid the context window — the Claude Code / Codex
 * "Auto-compacting conversation…" moment. Plain DOM, no React, one injected
 * stylesheet per document. Shown for a bounded time, dismissed on any
 * click; the optional "Compact now" action hands the configured slash
 * command to the caller (which fills the composer — the plugin never sends).
 */

import type { CompactionNoticeInfo } from './compaction-watch.ts'

/** Callbacks the owning wiring satisfies. */
export interface CompactionNoticeDeps {
  /** Fill the configured compact command into the composer ('' = hidden action). */
  readonly compactCommandText: string
  /** The "Compact now" action was pressed. */
  onCompactNow(): void
}

/** Toast handle owned by one plugin install. */
export interface CompactionNotice {
  /** Show (or refresh) the notice for one landed checkpoint. */
  show(info: CompactionNoticeInfo): void
  /** Cancel the auto-dismiss timer and remove the node. */
  dispose(): void
}

const ROOT_CLASS = '__dsh-composer-history-notice__'
const STYLE_ID = '__dsh-composer-history-notice-style__'
const AUTO_DISMISS_MS = 6000
const SUMMARY_SNIPPET_LENGTH = 160

/** Injected once per document: the snackbar chrome. */
const STYLE_TEXT = [
  `.${ROOT_CLASS}{`,
  'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483001;',
  'display:flex;flex-direction:column;gap:4px;max-width:min(560px,calc(100vw - 32px));',
  'background:#1c2128;border:1px solid #444c56;border-radius:10px;',
  'box-shadow:0 8px 24px rgba(0,0,0,.45);font:13px/1.4 system-ui,sans-serif;',
  'color:#e6edf3;padding:10px 12px;cursor:pointer;',
  '}',
  `.${ROOT_CLASS} .${ROOT_CLASS}head{display:flex;align-items:center;gap:8px;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}title{font-weight:600;color:#ffffff;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}hint{margin-left:auto;color:#8b949e;white-space:nowrap;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}detail{color:#c9d1d9;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}summary{color:#8b949e;font-style:italic;}`,
  `.${ROOT_CLASS} .${ROOT_CLASS}action{`,
  'all:unset;align-self:flex-end;margin-top:4px;padding:4px 10px;border-radius:6px;',
  'background:#316dca;color:#ffffff;cursor:pointer;font-weight:600;',
  '}',
  `.${ROOT_CLASS} .${ROOT_CLASS}action:hover{background:#3b7dd8;}`,
].join('')

/** Truncate a long summary to a single readable snippet. */
function snippet(summary: string): string {
  if (summary.length <= SUMMARY_SNIPPET_LENGTH) return summary
  return `${summary.slice(0, SUMMARY_SNIPPET_LENGTH)}…`
}

/**
 * Create the notice (injecting its stylesheet once per document).
 * @param deps - compact-now wiring plus the command label.
 * @returns the handle, or undefined outside a document.
 */
export function createCompactionNotice(deps: CompactionNoticeDeps): CompactionNotice | undefined {
  if (typeof document === 'undefined') return undefined
  if (document.getElementById(STYLE_ID) === null) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = STYLE_TEXT
    document.head.appendChild(style)
  }

  const root = document.createElement('div')
  root.className = ROOT_CLASS
  root.setAttribute('role', 'status')
  root.setAttribute('aria-live', 'polite')
  root.style.display = 'none'

  let timer: ReturnType<typeof setTimeout> | undefined

  const hide = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    root.style.display = 'none'
  }

  root.addEventListener('click', () => {
    hide()
  })

  return {
    show: (info) => {
      hide()
      root.textContent = ''

      const head = document.createElement('div')
      head.className = `${ROOT_CLASS}head`
      const title = document.createElement('span')
      title.className = `${ROOT_CLASS}title`
      title.textContent = '⧉ Context compacted'
      head.append(title)

      const hint = document.createElement('span')
      hint.className = `${ROOT_CLASS}hint`
      hint.textContent = 'click to dismiss'
      head.append(hint)
      root.append(head)

      const detail = document.createElement('div')
      detail.className = `${ROOT_CLASS}detail`
      const parts: string[] = []
      if (info.itemCount !== null) parts.push(`${info.itemCount} history items summarized`)
      if (info.tokenCount !== null) parts.push(`~${info.tokenCount} tokens`)
      detail.textContent = parts.length > 0
        ? `${parts.join(' · ')}. Now in ↑ history and Ctrl+R search.`
        : 'Earlier history summarized. Now in ↑ history and Ctrl+R search.'
      root.append(detail)

      if (info.summary !== null && info.summary.trim() !== '') {
        const summary = document.createElement('div')
        summary.className = `${ROOT_CLASS}summary`
        summary.textContent = snippet(info.summary.trim())
        root.append(summary)
      }

      if (deps.compactCommandText !== '') {
        const action = document.createElement('button')
        action.className = `${ROOT_CLASS}action`
        action.textContent = `Fill ${deps.compactCommandText}`
        action.addEventListener('click', (event) => {
          event.stopPropagation()
          hide()
          deps.onCompactNow()
        })
        root.append(action)
      }

      if (root.parentNode === null) document.body.appendChild(root)
      root.style.display = 'flex'
      timer = setTimeout(hide, AUTO_DISMISS_MS)
    },
    dispose: () => {
      hide()
      root.remove()
    },
  }
}

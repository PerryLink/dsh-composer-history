/**
 * Transient composer notices: two tiny DOM surfaces the new capabilities
 * use for feedback. `createTransientNotice` flashes one line for a short
 * while (snippet saved/loaded, template errors, import results);
 * `createDraftHint` pins a small read-only line under the composer for the
 * reuse insight, hidden whenever the hint text is empty. Both own their DOM
 * and are fully removable — the wiring disposes them with the fiber.
 */

const NOTICE_CLASS = '__dsh-composer-history-notice__'
const HINT_CLASS = '__dsh-composer-history-hint__'
const STYLE_ID = '__dsh-composer-history-notice-style__'

/** One shared stylesheet injected once per document. */
const STYLE_TEXT = [
  `.${NOTICE_CLASS}{`,
  'position:fixed;z-index:2147483001;left:50%;bottom:64px;transform:translateX(-50%);',
  'background:#1c2128;color:#e6edf3;border:1px solid #444c56;border-radius:8px;',
  'padding:8px 14px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.45);',
  'max-width:min(80vw,560px);overflow-wrap:anywhere;',
  '}',
  `.${NOTICE_CLASS}--error{border-color:#f85149;color:#ffa198;}`,
  `.${HINT_CLASS}{`,
  'position:fixed;z-index:2147483000;display:none;',
  'background:#161b22;color:#8b949e;border:1px solid #30363d;border-radius:6px;',
  'padding:3px 8px;font:11px/1.4 system-ui,sans-serif;pointer-events:none;',
  'max-width:min(60vw,480px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
  '}',
].join('')

function ensureStyle(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = STYLE_TEXT
  document.head.appendChild(style)
}

/** Handle of one transient notice instance. */
export interface TransientNotice {
  /** Flash a message near the composer for a short while. */
  show(text: string, kind?: 'info' | 'error'): void
  dispose(): void
}

/**
 * Create the transient notice surface. One node is reused across flashes;
 * the timer is cancelled on dispose.
 * @returns the handle, or undefined outside a document.
 */
export function createTransientNotice(): TransientNotice | undefined {
  if (typeof document === 'undefined') return undefined
  ensureStyle()
  const node = document.createElement('div')
  node.className = NOTICE_CLASS
  node.style.display = 'none'
  document.body.appendChild(node)
  let timer: ReturnType<typeof setTimeout> | undefined

  return {
    show(text, kind = 'info') {
      if (timer !== undefined) clearTimeout(timer)
      node.textContent = text
      node.className = kind === 'error' ? `${NOTICE_CLASS} ${NOTICE_CLASS}--error` : NOTICE_CLASS
      node.style.display = 'block'
      timer = setTimeout(() => {
        node.style.display = 'none'
        timer = undefined
      }, 3200)
    },
    dispose: () => {
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
      node.remove()
    },
  }
}

/** Handle of the draft hint (reuse insight line). */
export interface DraftHint {
  /** Update the hint text and position it under the composer ('' hides it). */
  set(text: string, anchor: HTMLElement): void
  dispose(): void
}

/**
 * Create the reuse-insight hint. Hidden until {@link DraftHint.set} receives
 * non-empty text; positioned under the anchor composer's bounding rect.
 * @returns the handle, or undefined outside a document.
 */
export function createDraftHint(): DraftHint | undefined {
  if (typeof document === 'undefined') return undefined
  ensureStyle()
  const node = document.createElement('div')
  node.className = HINT_CLASS
  document.body.appendChild(node)

  return {
    set(text, anchor) {
      if (text === '') {
        node.style.display = 'none'
        return
      }
      node.textContent = text
      const rect = anchor.getBoundingClientRect()
      node.style.display = 'block'
      node.style.left = `${Math.round(rect.left)}px`
      node.style.top = `${Math.round(rect.bottom + 4)}px`
    },
    dispose: () => {
      node.remove()
    },
  }
}

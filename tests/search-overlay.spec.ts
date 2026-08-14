// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSearchOverlay, type SearchOverlay } from '../src/client/search-overlay.ts'

const ENTRIES = ['alpha prompt', 'beta prompt', 'gamma note']

/** Wait one microtask so focus/deferred DOM state settles. */
const tick = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

interface Fixture {
  overlay: SearchOverlay
  onPick: ReturnType<typeof vi.fn>
  onCancel: ReturnType<typeof vi.fn>
  root: HTMLElement
  input: HTMLInputElement
  anchor: HTMLTextAreaElement
  rows(): HTMLElement[]
  dispatch(key: string): void
  query(text: string): void
}

function fixture(): Fixture {
  const anchor = document.createElement('textarea')
  document.body.appendChild(anchor)
  const onPick = vi.fn()
  const onCancel = vi.fn()
  const overlay = createSearchOverlay({ onPick, onCancel })
  if (overlay === undefined) throw new Error('overlay missing in jsdom')
  overlay.open(anchor, ENTRIES, false)
  const root = document.querySelector<HTMLElement>(`.${'__dsh-composer-history-search__'}`)
  if (root === null) throw new Error('overlay DOM missing')
  const input = root.querySelector('input')
  if (input === null) throw new Error('overlay input missing')
  const rows = (): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('[role="option"]')]
  const dispatch = (key: string): void => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  }
  const query = (text: string): void => {
    input.value = text
    input.dispatchEvent(new InputEvent('input', { bubbles: true }))
  }
  return { overlay, onPick, onCancel, root, input, anchor, rows, dispatch, query }
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('open and filter', () => {
  it('shows every entry for an empty query and marks the first selected', () => {
    const fx = fixture()
    expect(fx.overlay.isOpen()).toBe(true)
    expect(fx.rows()).toHaveLength(3)
    expect(fx.rows()[0]?.getAttribute('aria-selected')).toBe('true')
  })

  it('filters on input and collapses the selection', () => {
    const fx = fixture()
    fx.query('prompt')
    expect(fx.rows()).toHaveLength(2)
    expect(fx.rows()[0]?.textContent).toBe('alpha prompt')
    expect(fx.rows()[1]?.textContent).toBe('beta prompt')
  })

  it('shows the empty state on no match', () => {
    const fx = fixture()
    fx.query('zzz')
    expect(fx.rows()).toHaveLength(0)
    expect(fx.root.textContent).toContain('No matches')
  })
})

describe('keyboard and pointer', () => {
  it('ArrowDown/ArrowUp move the selection with wraparound', () => {
    const fx = fixture()
    fx.dispatch('ArrowDown')
    expect(fx.rows()[1]?.getAttribute('aria-selected')).toBe('true')
    fx.dispatch('ArrowDown')
    fx.dispatch('ArrowDown')
    expect(fx.rows()[0]?.getAttribute('aria-selected')).toBe('true')
    fx.dispatch('ArrowUp')
    expect(fx.rows()[2]?.getAttribute('aria-selected')).toBe('true')
  })

  it('Enter picks the selected entry, closes, and reports the text', async () => {
    const fx = fixture()
    fx.dispatch('ArrowDown')
    fx.dispatch('Enter')
    await tick()
    expect(fx.onPick).toHaveBeenCalledWith('beta prompt')
    expect(fx.overlay.isOpen()).toBe(false)
    expect(fx.root.style.display).toBe('none')
  })

  it('clicking a row picks it', async () => {
    const fx = fixture()
    fx.rows()[2]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await tick()
    expect(fx.onPick).toHaveBeenCalledWith('gamma note')
    expect(fx.overlay.isOpen()).toBe(false)
  })

  it('Escape cancels without a pick', async () => {
    const fx = fixture()
    fx.dispatch('Escape')
    await tick()
    expect(fx.onPick).not.toHaveBeenCalled()
    expect(fx.onCancel).toHaveBeenCalledTimes(1)
    expect(fx.overlay.isOpen()).toBe(false)
  })

  it('Enter with no matches cancels', async () => {
    const fx = fixture()
    fx.query('zzz')
    fx.dispatch('Enter')
    await tick()
    expect(fx.onPick).not.toHaveBeenCalled()
    expect(fx.onCancel).toHaveBeenCalledTimes(1)
  })

  it('a press outside the panel cancels', async () => {
    const fx = fixture()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await tick()
    expect(fx.onCancel).toHaveBeenCalledTimes(1)
    expect(fx.overlay.isOpen()).toBe(false)
  })

  it('a press inside the panel does not cancel', () => {
    const fx = fixture()
    fx.root.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(fx.onCancel).not.toHaveBeenCalled()
    expect(fx.overlay.isOpen()).toBe(true)
  })
})

describe('lifecycle', () => {
  it('dispose removes the panel node', () => {
    const fx = fixture()
    fx.overlay.dispose()
    expect(document.querySelector('.__dsh-composer-history-search__')).toBeNull()
  })

  it('reopen re-lists fresh entries and resets the query', () => {
    const fx = fixture()
    fx.query('prompt')
    fx.dispatch('Escape')
    fx.overlay.open(fx.anchor, ['delta'], true)
    expect(fx.overlay.isOpen()).toBe(true)
    expect(fx.input.value).toBe('')
    expect(fx.rows()).toHaveLength(1)
    expect(fx.rows()[0]?.textContent).toBe('delta')
  })
})

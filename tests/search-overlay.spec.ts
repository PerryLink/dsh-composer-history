// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSearchOverlay, placePanel, type SearchOverlay } from '../src/client/search-overlay.ts'

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
  delete (Element.prototype as unknown as Record<string, unknown>)['scrollIntoView']
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

  it('shows an entry count for an empty query and a match count while filtering', () => {
    const fx = fixture()
    expect(fx.root.textContent).toContain('3 entries')
    fx.query('prompt')
    expect(fx.root.textContent).toContain('2 matches')
  })

  it('marks the matched substring inside each row and preserves row text', () => {
    const fx = fixture()
    fx.query('prompt')
    const marks = fx.root.querySelectorAll('mark')
    expect(marks).toHaveLength(2)
    expect(marks[0]?.textContent).toBe('prompt')
    expect(marks[1]?.textContent).toBe('prompt')
    expect(fx.rows()[0]?.textContent).toBe('alpha prompt')
    expect(fx.rows()[1]?.textContent).toBe('beta prompt')
  })

  it('renders plain rows without marks for an empty query', () => {
    const fx = fixture()
    expect(fx.root.querySelectorAll('mark')).toHaveLength(0)
  })

  it('marks every occurrence of a repeated query substring', () => {
    const fx = fixture()
    fx.query('a')
    const marks = fx.root.querySelectorAll('mark')
    expect(marks.length).toBeGreaterThan(0)
    for (const mark of marks) expect(mark.textContent).toBe('a')
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
    expect(fx.onPick).toHaveBeenCalledWith('beta prompt', 'history', undefined)
    expect(fx.overlay.isOpen()).toBe(false)
    expect(fx.root.style.display).toBe('none')
  })

  it('clicking a row picks it', async () => {
    const fx = fixture()
    fx.rows()[2]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await tick()
    expect(fx.onPick).toHaveBeenCalledWith('gamma note', 'history', undefined)
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

  it('scrolls the selected row into view as the selection moves', () => {
    const scroll = vi.fn()
    ;(Element.prototype as unknown as Record<string, unknown>)['scrollIntoView'] = scroll
    const fx = fixture()
    scroll.mockClear()
    fx.dispatch('ArrowDown')
    expect(scroll).toHaveBeenCalledTimes(1)
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' })
    expect(scroll.mock.instances[0]).toBe(fx.rows()[1])
  })
})

describe('combobox accessibility', () => {
  it('expands on open, tracks the active option, and collapses on cancel', () => {
    const fx = fixture()
    expect(fx.input.getAttribute('aria-expanded')).toBe('true')
    expect(fx.input.getAttribute('aria-controls')).toBe('__dsh-composer-history-search__list')
    expect(fx.input.getAttribute('aria-activedescendant')).toBe('__dsh-composer-history-search__option-0')
    fx.dispatch('ArrowDown')
    expect(fx.input.getAttribute('aria-activedescendant')).toBe('__dsh-composer-history-search__option-1')
    fx.dispatch('Escape')
    expect(fx.input.getAttribute('aria-expanded')).toBe('false')
    expect(fx.input.hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('clears the active option reference when there are no matches', () => {
    const fx = fixture()
    fx.query('zzz')
    expect(fx.input.getAttribute('aria-activedescendant')).toBe('')
  })

  it('shows a placeholder on the query input', () => {
    const fx = fixture()
    expect(fx.input.placeholder).toBe('Search history\u2026')
  })
})

describe('placePanel', () => {
  it('places below the anchor and enforces the minimum width', () => {
    expect(placePanel({ left: 40, right: 100, top: 200, bottom: 230 }, { width: 1280, height: 800 }))
      .toEqual({ left: 40, top: 238, width: 320 })
  })

  it('flips above the anchor when the panel would overflow downward', () => {
    expect(placePanel({ left: 40, right: 100, top: 600, bottom: 630 }, { width: 1280, height: 800 }))
      .toEqual({ left: 40, top: 264, width: 320 })
  })

  it('clamps horizontally into a narrow viewport', () => {
    expect(placePanel({ left: 700, right: 760, top: 200, bottom: 230 }, { width: 720, height: 800 }))
      .toEqual({ left: 392, top: 238, width: 320 })
  })

  it('shrinks the width below the minimum when the viewport is narrower', () => {
    expect(placePanel({ left: 0, right: 300, top: 0, bottom: 40 }, { width: 300, height: 800 }))
      .toEqual({ left: 8, top: 48, width: 284 })
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

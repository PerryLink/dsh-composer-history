// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCompactionNotice, type CompactionNotice } from '../src/client/compaction-notice.ts'
import type { CompactionNoticeInfo } from '../src/client/compaction-watch.ts'

const INFO: CompactionNoticeInfo = { seq: 9, summary: 'a very long summary that keeps going and going', itemCount: 14, tokenCount: 52000 }

interface Fixture {
  notice: CompactionNotice
  onCompactNow: ReturnType<typeof vi.fn>
  root: HTMLElement
}

function fixture(compactCommandText = '/compact'): Fixture {
  const onCompactNow = vi.fn()
  const notice = createCompactionNotice({ compactCommandText, onCompactNow })
  if (notice === undefined) throw new Error('notice missing in jsdom')
  notice.show(INFO)
  const root = document.querySelector<HTMLElement>('.__dsh-composer-history-notice__')
  if (root === null) throw new Error('notice DOM missing')
  return { notice, onCompactNow, root }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('rendering', () => {
  it('shows the compaction title, detail, summary snippet, and action', () => {
    const fx = fixture()
    expect(fx.root.style.display).toBe('flex')
    expect(fx.root.textContent).toContain('Context compacted')
    expect(fx.root.textContent).toContain('14 history items summarized')
    expect(fx.root.textContent).toContain('~52000 tokens')
    expect(fx.root.textContent).toContain('Fill /compact')
  })

  it('falls back to a generic detail when counts are unavailable', () => {
    const onCompactNow = vi.fn()
    const notice = createCompactionNotice({ compactCommandText: '/compact', onCompactNow })
    notice?.show({ seq: 1, summary: null, itemCount: null, tokenCount: null })
    const root = document.querySelector<HTMLElement>('.__dsh-composer-history-notice__')
    expect(root?.textContent).toContain('Earlier history summarized')
    expect(root?.textContent).not.toContain('summary')
  })

  it('hides the action when the compact command is empty', () => {
    const fx = fixture('')
    expect(fx.root.textContent).not.toContain('Fill')
  })

  it('truncates long summaries', () => {
    const fx = fixture()
    const summary = 'a'.repeat(500)
    fx.notice.show({ ...INFO, summary })
    expect(fx.root.textContent).toContain('…')
    expect((fx.root.textContent?.match(/a/g) ?? []).length).toBeLessThan(500)
  })
})

describe('dismissal', () => {
  it('auto-dismisses after the bounded time', () => {
    const fx = fixture()
    vi.advanceTimersByTime(5999)
    expect(fx.root.style.display).toBe('flex')
    vi.advanceTimersByTime(1)
    expect(fx.root.style.display).toBe('none')
  })

  it('a re-show refreshes content and restarts the timer', () => {
    const fx = fixture()
    vi.advanceTimersByTime(4000)
    fx.notice.show({ seq: 12, summary: 'second compaction', itemCount: 2, tokenCount: 300 })
    expect(fx.root.textContent).toContain('second compaction')
    vi.advanceTimersByTime(5999)
    expect(fx.root.style.display).toBe('flex')
    vi.advanceTimersByTime(1)
    expect(fx.root.style.display).toBe('none')
  })

  it('a click dismisses', () => {
    const fx = fixture()
    fx.root.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(fx.root.style.display).toBe('none')
  })

  it('the action press reports and dismisses', () => {
    const fx = fixture()
    const action = fx.root.querySelector('button')
    action?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(fx.onCompactNow).toHaveBeenCalledTimes(1)
    expect(fx.root.style.display).toBe('none')
  })
})

describe('lifecycle', () => {
  it('dispose cancels the timer and removes the node', () => {
    const fx = fixture()
    fx.notice.dispose()
    expect(document.querySelector('.__dsh-composer-history-notice__')).toBeNull()
    expect(() => vi.advanceTimersByTime(10000)).not.toThrow()
  })
})

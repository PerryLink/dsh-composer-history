// @vitest-environment jsdom
/**
 * Wiring lifecycle (community five-layer model, C1): the plugin's
 * authoritative registry is the window event surface plus the sessions-list
 * subscription. This suite proves the fiber disposer removes every
 * registration the wiring made — the two window-capture listeners and the
 * list subscription — rather than only the component-level disposers the
 * individual modules test.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apply } from '../src/client/index.ts'

/** Settings-scope double: unavailable snapshot, no-op write surface. */
function fakeScope() {
  return {
    getSnapshot: () => ({ status: 'unavailable', value: undefined, writable: false, mode: 'memory' }),
    subscribe: (): (() => void) => () => {},
    set: (): Promise<void> => Promise.resolve(),
    unset: (): Promise<void> => Promise.resolve(),
  }
}

describe('wiring lifecycle (C1: fiber dispose)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('registers window-capture listeners and the list subscription, then removes them all on dispose', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    let listUnsubscribed = false
    let wiringDispose: (() => void) | undefined
    const sessions = {
      list: {
        getSnapshot: () => ({ current: undefined, ids: [], byId: {} }),
        subscribe: (): (() => void) => () => { listUnsubscribed = true },
      },
    }
    const ctx = {
      effect: (fn: () => unknown): (() => void) => {
        wiringDispose = fn() as (() => void) | undefined
        return () => wiringDispose?.()
      },
      get: (name: string): unknown => (name === 'sessions' ? sessions : undefined),
      settingsScope: { bind: () => fakeScope() },
    }

    apply(ctx as unknown as Parameters<typeof apply>[0])

    // Authoritative registry part 1: the two window-capture listeners.
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true)
    expect(addSpy).toHaveBeenCalledWith('input', expect.any(Function), true)

    wiringDispose?.()

    // Disposing the wiring must remove exactly those registrations and
    // cancel the sessions-list subscription.
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function), true)
    expect(removeSpy).toHaveBeenCalledWith('input', expect.any(Function), true)
    expect(listUnsubscribed).toBe(true)
  })
})

// @vitest-environment jsdom
/**
 * Built-artifact smoke: executes the real lib/client.js in jsdom through the
 * shell's module-loader handoff, checks the exported cordis surface, and runs
 * apply() with a minimal fake ctx to prove the wiring registers without
 * throwing. Skipped when the bundle has not been built yet (`pnpm run build`).
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const BUNDLE_PATH = resolve(process.cwd(), 'lib/client.js')

interface LoaderHandoff {
  id: string
  factory: (require: (spec: string) => unknown) => unknown
}

describe('built client bundle', () => {
  const skip = !existsSync(BUNDLE_PATH)

  it.skipIf(skip)('registers the factory under the plugin id and exports the cordis surface', () => {
    const win = window as unknown as Record<string, unknown>
    let handoff: LoaderHandoff | undefined
    win.__ModuleLoader__ = { load: (entry: LoaderHandoff): void => { handoff = entry } }
    // Execute the artifact exactly as a <script> tag would.
    const run = new Function('window', readFileSync(BUNDLE_PATH, 'utf8'))
    expect(() => run(window)).not.toThrow()
    expect(handoff?.id).toBe('dsh-composer-history')
    const strictRequire = (spec: string): never => {
      throw new Error(`bundle unexpectedly required ${spec}`)
    }
    const module = handoff?.factory(strictRequire) as Record<string, unknown>
    expect(module.name).toBe('dsh-composer-history')
    expect(module.inject).toEqual(['conversation', 'sessions', 'inputTriggers', 'settingsScope'])
    expect(typeof module.apply).toBe('function')
    expect(typeof module.Config).toBe('function')
  })

  it.skipIf(skip)('apply() installs the window-capture listeners without touching services', () => {
    const win = window as unknown as Record<string, unknown>
    let handoff: LoaderHandoff | undefined
    win.__ModuleLoader__ = { load: (entry: LoaderHandoff): void => { handoff = entry } }
    const run = new Function('window', readFileSync(BUNDLE_PATH, 'utf8'))
    run(window)
    const module = handoff?.factory((spec: string) => {
      throw new Error(`bundle unexpectedly required ${spec}`)
    }) as { apply(ctx: unknown, config?: unknown): void }

    const disposed: string[] = []
    const fakeScope = {
      getSnapshot: () => ({ status: 'unavailable', value: undefined, writable: false, mode: 'memory' }),
      subscribe: (): (() => void) => () => {},
      set: (): Promise<void> => Promise.resolve(),
      unset: (): Promise<void> => Promise.resolve(),
    }
    const fakeCtx = {
      effect: (fn: () => unknown): (() => void) => {
        fn()
        return () => { disposed.push('effect') }
      },
      get: (name: string): unknown => (name === 'sessions' ? {
        list: {
          getSnapshot: () => ({ current: undefined }),
          subscribe: (): (() => void) => () => {},
        },
      } : undefined),
      settingsScope: { bind: () => fakeScope },
    }
    expect(() => module.apply(fakeCtx)).not.toThrow()

    // An event outside any composer must pass through without a crash.
    const other = document.createElement('div')
    document.body.appendChild(other)
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    expect(() => other.dispatchEvent(event)).not.toThrow()
    expect(event.defaultPrevented).toBe(false)
    document.body.innerHTML = ''
  })
})

// @vitest-environment jsdom
/**
 * Built-artifact smoke: executes the real lib/client.js in jsdom through the
 * shell's module-loader handoff, checks the exported cordis surface, runs
 * apply() with a minimal fake ctx to prove the wiring registers without
 * throwing, and drives one ArrowUp recall through the packed bundle against
 * the real host composer shape (the L3 counterpart of the CP-7 wiring
 * regression, which exercises src/ directly). Skipped when the bundle has not
 * been built yet (`pnpm run build`).
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const BUNDLE_PATH = resolve(process.cwd(), 'lib/client.js')

interface LoaderHandoff {
  id: string
  factory: (require: (spec: string) => unknown) => unknown
}

/** Load the packed bundle exactly as a <script> tag would. */
function loadBundle(): Record<string, unknown> {
  const win = window as unknown as Record<string, unknown>
  let handoff: LoaderHandoff | undefined
  win.__ModuleLoader__ = { load: (entry: LoaderHandoff): void => { handoff = entry } }
  const run = new Function('window', readFileSync(BUNDLE_PATH, 'utf8'))
  expect(() => run(window)).not.toThrow()
  expect(handoff?.id).toBe('dsh-composer-history')
  const strictRequire = (spec: string): never => {
    throw new Error(`bundle unexpectedly required ${spec}`)
  }
  return handoff?.factory(strictRequire) as Record<string, unknown>
}

/**
 * Minimal client ctx over the CP-7 history channel: the Chat target publishes
 * only after the first subscribe (as the host assembler does), so this double
 * fails any wiring that reads before subscribing.
 */
function fakeServices() {
  const draft = { text: '' }
  const setDraftCalls: string[] = []
  const actx = {}
  let activated = false
  const chatTarget = {
    getSnapshot: () => (activated
      ? { legacy: { nodes: [{ kind: 'user', seq: 1, content: [{ type: 'text', text: 'hello' }] }] } }
      : undefined),
    subscribe: (): (() => void) => {
      activated = true
      return () => {}
    },
  }
  const scope = {
    getSnapshot: () => ({ status: 'unavailable', value: undefined, writable: false, mode: 'memory' }),
    subscribe: (): (() => void) => () => {},
    set: (): Promise<void> => Promise.resolve(),
    unset: (): Promise<void> => Promise.resolve(),
  }
  const ctx = {
    effect: (fn: () => unknown): (() => void) => {
      fn()
      return () => {}
    },
    get: (name: string): unknown => {
      if (name === 'sessions') {
        return {
          list: {
            getSnapshot: () => ({ current: 's1', ids: ['s1'], byId: { s1: { title: 't', blank: false } } }),
            subscribe: (): (() => void) => () => {},
          },
          scope: () => actx,
        }
      }
      if (name === 'uiConversation') return { binding: () => ({ target: () => chatTarget }) }
      return undefined
    },
    settingsScope: { bind: () => scope },
    conversation: {
      input: {
        for: () => ({
          state: { getSnapshot: () => ({ draft: draft.text, phase: 'plain' }) },
          setDraft: (text: string) => {
            draft.text = text
            setDraftCalls.push(text)
          },
        }),
      },
    },
  }
  return { ctx, setDraftCalls }
}

/** Real host composer shape: [data-input-scroll] > contenteditable div[data-composer-input]. */
function composerElement(): HTMLElement {
  const scroll = document.createElement('div')
  scroll.setAttribute('data-input-scroll', '')
  const composer = document.createElement('div')
  composer.setAttribute('data-composer-input', '')
  composer.setAttribute('contenteditable', 'true')
  scroll.appendChild(composer)
  document.body.appendChild(scroll)
  return composer
}

describe('built client bundle', () => {
  const skip = !existsSync(BUNDLE_PATH)

  it.skipIf(skip)('registers the factory under the plugin id and exports the cordis surface', () => {
    const module = loadBundle()
    expect(module.name).toBe('dsh-composer-history')
    expect(module.inject).toEqual(['conversation', 'sessions', 'inputTriggers', 'settingsScope', 'uiConversation'])
    expect(typeof module.apply).toBe('function')
    expect(typeof module.Config).toBe('function')
  })

  it.skipIf(skip)('apply() installs the window-capture listeners without touching services', () => {
    const module = loadBundle() as { apply(ctx: unknown, config?: unknown): void }
    const { ctx } = fakeServices()
    expect(() => module.apply(ctx)).not.toThrow()

    // An event outside any composer must pass through without a crash.
    const other = document.createElement('div')
    document.body.appendChild(other)
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    expect(() => other.dispatchEvent(event)).not.toThrow()
    expect(event.defaultPrevented).toBe(false)
    document.body.innerHTML = ''
  })

  it.skipIf(skip)('recalls the newest user message from the Chat target through the packed bundle', () => {
    const module = loadBundle() as {
      apply(ctx: unknown, config?: unknown): void
      setComposerCaret(composer: Element, caret: number): void
    }
    const { ctx, setDraftCalls } = fakeServices()
    module.apply(ctx)

    const composer = composerElement()
    module.setComposerCaret(composer, 0)
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
    composer.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(setDraftCalls).toEqual(['hello'])
    document.body.innerHTML = ''
  })
})

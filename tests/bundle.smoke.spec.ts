// @vitest-environment jsdom
/**
 * Built-artifact smoke: executes the real lib/client.js in jsdom through the
 * shell's module-loader handoff, checks the exported cordis surface, runs
 * apply() with a minimal fake ctx to prove the wiring registers without
 * throwing, and drives one ArrowUp recall through the packed bundle against
 * the real host composer shape (the L3 counterpart of the CP-7 wiring
 * regression, which exercises src/ directly).
 *
 * The artifact is built on demand and never skipped. `tests/composition.spec.ts`
 * runs `pnpm run build` in its own `beforeAll` (the gate chain runs the tests
 * before the build), and that build deletes `lib/` before rebuilding — so a
 * plain `existsSync` at collection time raced it and silently skipped this
 * whole suite inside a full run. The wait below rides that concurrent build
 * out and only builds from scratch when nobody else is.
 */
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const BUNDLE_PATH = resolve(process.cwd(), 'lib/client.js')
const REPOSITORY_ROOT = process.cwd()
/** Handshake the emitted bundle must carry; a partial write is not a bundle. */
const HANDSHAKE = '__ModuleLoader__.load'

/**
 * Read the built bundle, waiting out a concurrent build. `lib/client.js` is
 * cleaned and rewritten by `pnpm run build`, so the file is absent (or
 * half-written) for a moment; a complete artifact is one that carries the
 * module-loader handshake.
 * @returns the bundle text.
 */
async function bundleText(): Promise<string> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const text = readFileSync(BUNDLE_PATH, 'utf8')
      if (text.includes(HANDSHAKE)) return text
    } catch {
      // Not built yet (or mid-rewrite): keep waiting.
    }
    await new Promise(settle => setTimeout(settle, 250))
  }
  throw new Error(`bundle.smoke: ${BUNDLE_PATH} was never built to completion (run pnpm run build)`)
}

let bundle: string

beforeAll(async () => {
  try {
    bundle = await bundleText()
  } catch {
    // Nobody is building it: build it here, then read it once more.
    const build = spawnSync('pnpm', ['run', 'build'], {
      cwd: REPOSITORY_ROOT,
      encoding: 'utf8',
      shell: process.platform === 'win32',
      timeout: 180_000,
    })
    if (build.status !== 0) {
      throw new Error(`pnpm run build failed (${String(build.status)})\nstdout:\n${build.stdout}\nstderr:\n${build.stderr}`)
    }
    bundle = await bundleText()
  }
}, 300_000)

interface LoaderHandoff {
  id: string
  factory: (require: (spec: string) => unknown) => unknown
}

/** Load the packed bundle exactly as a <script> tag would. */
function loadBundle(): Record<string, unknown> {
  const win = window as unknown as Record<string, unknown>
  let handoff: LoaderHandoff | undefined
  win.__ModuleLoader__ = { load: (entry: LoaderHandoff): void => { handoff = entry } }
  const run = new Function('window', bundle)
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
    // The settings domain's client service (the removed `settingsScope`
    // binder's successor): the host entry id resolves to the form carrying the
    // composition config plus the profile override layer.
    configForms: { get: () => scope },
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
  it('registers the factory under the plugin id and exports the cordis surface', () => {
    const module = loadBundle()
    expect(module.name).toBe('dsh-composer-history')
    expect(module.inject).toEqual(['conversation', 'sessions', 'inputTriggers', 'configForms', 'uiConversation'])
    expect(typeof module.apply).toBe('function')
    expect(typeof module.Config).toBe('function')
  })

  it('apply() installs the window-capture listeners without touching services', () => {
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

  it('recalls the newest user message from the Chat target through the packed bundle', () => {
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

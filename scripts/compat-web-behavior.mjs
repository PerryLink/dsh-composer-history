/**
 * Packed-bundle web-behavior smoke (community five-layer model, layer 4):
 * executes the built client bundle exactly as a <script> tag would (jsdom
 * window.eval), against the real host composer DOM shape, and asserts the
 * DOM face the browser behavior depends on — composer identity (the
 * contenteditable `div[data-composer-input]` inside `[data-input-scroll]`),
 * the text/caret faces, the retained textarea negatives, and an ArrowUp
 * recall through the real apply() wiring.
 *
 * Usage: node scripts/compat-web-behavior.mjs [bundleResolutionDir]
 *   bundleResolutionDir: a directory whose node_modules holds the packed
 *   dsh-composer-history install (the compat workflow's bare project).
 *   Defaults to the repository root, falling back to the freshly built
 *   lib/client.js when the package is not self-installed.
 *
 * Exit 0 prints one ok line; any failed assertion exits non-zero.
 */

import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const resolutionDir = process.argv[2] ?? repositoryRoot

/** Resolve the installed bundle, falling back to the repository's own build output. */
function bundleSource() {
  const require = createRequire(resolve(resolutionDir, 'package.json'))
  try {
    return require.resolve('dsh-composer-history/client')
  } catch {
    const fallback = resolve(repositoryRoot, 'lib/client.js')
    if (!existsSync(fallback)) throw new Error('compat-web-behavior: no packed bundle and no lib/client.js (run pnpm run build)')
    return fallback
  }
}

const code = readFileSync(bundleSource(), 'utf8')
const { JSDOM } = await import('jsdom')
// runScripts: 'dangerously' gives window.eval the full page global scope
// (window, HTMLElement, ...); the page itself carries no scripts.
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
  runScripts: 'dangerously',
})
const { window } = dom

let handoff
window.__ModuleLoader__ = { load: (entry) => { handoff = entry } }
// Execute the artifact exactly as a <script> tag would: the bundle resolves
// window/HTMLElement against the page realm, so window.eval is the faithful
// harness (new Function would leave instanceof checks realm-blind).
window.eval(code)
if (handoff?.id !== 'dsh-composer-history') throw new Error('compat-web-behavior: bundle id mismatch')
const module = handoff.factory((spec) => { throw new Error(`bundle unexpectedly required ${spec}`) })

const assert = (cond, message) => {
  if (!cond) throw new Error(`compat-web-behavior: ${message}`)
}
const doc = window.document

// Real host shape: [data-input-scroll] > contenteditable div[data-composer-input].
const scroll = doc.createElement('div')
scroll.setAttribute('data-input-scroll', '')
const composer = doc.createElement('div')
composer.setAttribute('data-composer-input', '')
composer.setAttribute('contenteditable', 'true')
composer.setAttribute('role', 'textbox')
composer.setAttribute('aria-multiline', 'true')
scroll.appendChild(composer)
doc.body.appendChild(scroll)

// Identity face.
assert(module.composerOf(composer) === composer, 'contenteditable composer must match')
assert(module.composerOf(null) === undefined, 'null target must pass through')
const bareTextarea = doc.createElement('textarea')
doc.body.appendChild(bareTextarea)
assert(module.composerOf(bareTextarea) === undefined, 'textarea outside the scrollport must pass through (retained negative case)')
const plainDiv = doc.createElement('div')
scroll.appendChild(plainDiv)
assert(module.composerOf(plainDiv) === undefined, 'non-composer target inside the scrollport must pass through')
const legacy = doc.createElement('textarea')
scroll.appendChild(legacy)
assert(module.composerOf(legacy) === legacy, 'legacy textarea composer inside the scrollport must keep matching')

// Text + caret faces round-trip on the contenteditable surface.
composer.textContent = 'alpha\nbeta'
assert(module.composerText(composer) === 'alpha\nbeta', 'text face must read the contenteditable draft')
module.setComposerCaret(composer, 6)
assert(module.composerCaret(composer) === 6, 'caret face must round-trip the written caret')

// ArrowUp recall through the real apply() wiring (faked services only).
let draft = ''
const setDraftCalls = []
const actx = {}
const fakeCtx = {
  effect: (fn) => { fn(); return () => {} },
  get: (name) => (name === 'sessions' ? {
    list: {
      getSnapshot: () => ({ current: 's1', ids: ['s1'], byId: { s1: { title: 't', blank: false } } }),
      subscribe: () => () => {},
    },
    scope: () => actx,
    binding: () => ({ session: { getSnapshot: () => ({ nodes: [{ kind: 'user', seq: 1, content: [{ type: 'text', text: 'hello' }] }] }), subscribe: () => () => {} } }),
  } : undefined),
  settingsScope: {
    bind: () => ({
      getSnapshot: () => ({ status: 'unavailable', value: undefined, writable: false, mode: 'memory' }),
      subscribe: () => () => {},
    }),
  },
  conversation: {
    input: {
      for: () => ({
        state: { getSnapshot: () => ({ draft, phase: 'plain' }) },
        setDraft: (text) => {
          draft = text
          composer.textContent = text
          setDraftCalls.push(text)
        },
      }),
    },
  },
}
module.apply(fakeCtx)
module.setComposerCaret(composer, 0)
const event = new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
composer.dispatchEvent(event)
assert(event.defaultPrevented === true, 'ArrowUp at the draft edge must take over the key')
assert(setDraftCalls.length === 1 && setDraftCalls[0] === 'hello', 'ArrowUp must fill the newest user message')
await new Promise(resolveFrame => window.requestAnimationFrame(() => resolveFrame()))
assert(module.composerCaret(composer) === 'hello'.length, 'the caret must land at the end of the recalled text')

console.log('compat-web-behavior: ok (identity, text/caret face, ArrowUp recall)')

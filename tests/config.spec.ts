import { describe, expect, it } from 'vitest'
import { Config, PlainConfig, resolveConfig } from '../src/client/config.ts'

/** The live Config the Loader hands the host half: every field a stable reference. */
type LiveConfig = { readonly [field: string]: { get(): unknown } }

/**
 * Resolve the schema exactly as the Loader does. `schemastery`'s object typing
 * derives a field's declared output from its pre-volatile input type, so this
 * cast crosses that (upstream) typing gap once, at the test boundary; the
 * runtime value is the plugin's own live face, references included.
 */
const resolveLive = Config as unknown as (value: unknown) => LiveConfig

describe('Config schema', () => {
  it('fills every default', () => {
    expect(resolveConfig({})).toEqual({
      recallWithDraft: 'save',
      restoreOnEscape: true,
      edgeMode: 'logical',
      enableCtrlAlias: true,
      restoreCaret: true,
      upKey: 'ArrowUp',
      downKey: 'ArrowDown',
      escapeKey: 'Escape',
      maxHistory: 500,
      includeKinds: ['user'],
      historyScope: 'session',
      persistHistory: true,
      maxPersisted: 200,
      enableSearch: true,
      searchKeys: ['Ctrl+R'],
      searchCaseSensitive: false,
      includeCompactionSummaries: true,
      showCompactionNotice: true,
      compactCommandText: '/compact',
      enableSnippets: true,
      maxSnippets: 200,
      enableTemplates: true,
      enableInsights: true,
      insightMinUses: 2,
      enableCompactionHighlight: true,
    })
  })

  it('accepts explicit values and fills the rest', () => {
    expect(resolveConfig({ recallWithDraft: 'gate', edgeMode: 'visual' })).toMatchObject({
      recallWithDraft: 'gate',
      edgeMode: 'visual',
      restoreOnEscape: true,
      maxHistory: 500,
    })
  })

  it('rejects an invalid recallWithDraft at load time', () => {
    expect(() => resolveConfig({ recallWithDraft: 'bogus' })).toThrow()
  })

  it('rejects an invalid edgeMode at load time', () => {
    expect(() => resolveConfig({ edgeMode: 'magic' })).toThrow()
  })

  it('rejects an invalid historyScope at load time', () => {
    expect(() => resolveConfig({ historyScope: 'universe' })).toThrow()
  })

  it('rejects a negative maxHistory at load time', () => {
    expect(() => resolveConfig({ maxHistory: -1 })).toThrow()
  })

  it('rejects a fractional maxPersisted at load time', () => {
    expect(() => resolveConfig({ maxPersisted: 1.5 })).toThrow()
  })

  it('rejects an invalid recallWithDraft even when other keys are valid', () => {
    expect(() => resolveConfig({ recallWithDraft: 'bogus', restoreOnEscape: false })).toThrow()
  })
})

describe('live Config face (the 0.1.7 settings form field set)', () => {
  /** Every tunable named in the plain face: the same keys must be live. */
  const PLAIN_FIELDS = Object.keys(PlainConfig({} as never) as unknown as Record<string, unknown>)

  it('exposes every plain field as a live reference', () => {
    const live = resolveLive({})
    for (const field of PLAIN_FIELDS) {
      expect(typeof live[field]?.get, `${field} must be a live reference`).toBe('function')
    }
    // The plain projection is exactly the same field set: one definition, two
    // projections, so a new tunable cannot reach one face without the other.
    expect(Object.keys(live).sort()).toEqual([...PLAIN_FIELDS].sort())
  })

  it('carries the composition config into the live references the browser half reads', () => {
    const live = resolveLive({ maxHistory: 123, recallWithDraft: 'gate', enableSearch: false })
    expect(live.maxHistory?.get()).toBe(123)
    expect(live.recallWithDraft?.get()).toBe('gate')
    expect(live.enableSearch?.get()).toBe(false)
    // Untouched fields keep their defaults.
    expect(live.downKey?.get()).toBe('ArrowDown')
    expect(live.maxSnippets?.get()).toBe(200)
  })

  it('rejects out-of-domain values on the live face too', () => {
    expect(() => resolveLive({ maxHistory: -1 })).toThrow()
    expect(() => resolveLive({ historyScope: 'universe' })).toThrow()
  })

  it('resolves a wire section to plain values, never to live references', () => {
    // The browser half resolves the settings-form section (plain JSON off the
    // wire) through the plain projection: running the LIVE schema on it would
    // hand the wiring reference objects where it reads ordinary option values.
    const resolved = resolveConfig({ maxHistory: 123 }) as unknown as Record<string, unknown>
    expect(resolved.maxHistory).toBe(123)
    expect(typeof (resolved.maxHistory as { get?: unknown }).get).toBe('undefined')
  })
})

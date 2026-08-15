import { describe, expect, it } from 'vitest'
import { resolveConfig } from '../src/client/config.ts'

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

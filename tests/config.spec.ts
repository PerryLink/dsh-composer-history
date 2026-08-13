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
    })
  })

  it('accepts explicit values and fills the rest', () => {
    expect(resolveConfig({ recallWithDraft: 'gate', edgeMode: 'visual' })).toEqual({
      recallWithDraft: 'gate',
      restoreOnEscape: true,
      edgeMode: 'visual',
      enableCtrlAlias: true,
      restoreCaret: true,
    })
  })

  it('rejects an invalid recallWithDraft at load time', () => {
    expect(() => resolveConfig({ recallWithDraft: 'bogus' })).toThrow()
  })

  it('rejects an invalid edgeMode at load time', () => {
    expect(() => resolveConfig({ edgeMode: 'magic' })).toThrow()
  })

  it('rejects an invalid recallWithDraft even when other keys are valid', () => {
    expect(() => resolveConfig({ recallWithDraft: 'bogus', restoreOnEscape: false })).toThrow()
  })
})

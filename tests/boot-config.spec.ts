import { describe, expect, it } from 'vitest'
import { bootConfigOf } from '../src/client/index.ts'
import { resolveConfig } from '../src/client/config.ts'

describe('bootConfigOf', () => {
  it('ignores the host volatile config object (issue #10)', () => {
    expect(bootConfigOf({ get: () => ({ recallWithDraft: '{}' }), set: () => {} })).toEqual({})
  })
  it('passes a plain partial config through', () => {
    expect(bootConfigOf({ recallWithDraft: 'gate' })).toEqual({ recallWithDraft: 'gate' })
  })

  it('ignores per-field volatile references passed by DSH 0.2.1-rc.2', () => {
    const reference = (value: unknown) => ({
      get: () => value,
      [Symbol('cosmokit.volatile.write')]: () => {},
    })
    const config = {
      recallWithDraft: reference('save'),
      maxHistory: reference(500),
    }
    expect(bootConfigOf(config)).toEqual({})
    expect(resolveConfig(bootConfigOf(config)).recallWithDraft).toBe('save')
  })

  it('keeps plain overrides and validation of invalid plain values', () => {
    expect(resolveConfig(bootConfigOf({ recallWithDraft: 'gate', maxHistory: 12 })))
      .toMatchObject({ recallWithDraft: 'gate', maxHistory: 12 })
    expect(() => resolveConfig(bootConfigOf({ recallWithDraft: 'invalid' }))).toThrow()
    expect(resolveConfig(bootConfigOf(undefined)).recallWithDraft).toBe('save')
  })
})

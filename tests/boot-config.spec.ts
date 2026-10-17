import { describe, expect, it } from 'vitest'
import { bootConfigOf } from '../src/client/index.ts'

describe('bootConfigOf', () => {
  it('ignores the host volatile config object (issue #10)', () => {
    expect(bootConfigOf({ get: () => ({ recallWithDraft: '{}' }), set: () => {} })).toEqual({})
  })
  it('passes a plain partial config through', () => {
    expect(bootConfigOf({ recallWithDraft: 'gate' })).toEqual({ recallWithDraft: 'gate' })
  })
})

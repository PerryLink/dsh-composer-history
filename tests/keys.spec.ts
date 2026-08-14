import { describe, expect, it } from 'vitest'
import { chordMatches, parseChord } from '../src/client/keys.ts'

describe('parseChord', () => {
  it('parses a bare key', () => {
    expect(parseChord('Enter')).toEqual({ key: 'Enter', ctrl: false, alt: false, meta: false, shift: false })
  })

  it('parses one modifier with case-insensitive names', () => {
    expect(parseChord('Ctrl+R')).toEqual({ key: 'R', ctrl: true, alt: false, meta: false, shift: false })
    expect(parseChord('ctrl+r')).toEqual({ key: 'r', ctrl: true, alt: false, meta: false, shift: false })
    expect(parseChord('CMD+k')).toEqual({ key: 'k', ctrl: false, alt: false, meta: true, shift: false })
  })

  it('parses several modifiers', () => {
    expect(parseChord('Ctrl+Shift+Up')).toEqual({ key: 'Up', ctrl: true, alt: false, meta: false, shift: true })
  })

  it('rejects an empty spec', () => {
    expect(() => parseChord('')).toThrow()
    expect(() => parseChord('   ')).toThrow()
  })

  it('rejects a missing key name', () => {
    expect(() => parseChord('Ctrl+')).toThrow()
    expect(() => parseChord('Ctrl')).toThrow()
  })

  it('rejects a repeated modifier', () => {
    expect(() => parseChord('Ctrl+Ctrl+R')).toThrow()
  })

  it('rejects more than one key name', () => {
    expect(() => parseChord('Ctrl+R+E')).toThrow()
  })

  it('rejects an unknown modifier token as a duplicate key name', () => {
    expect(() => parseChord('Hyper+R+E')).toThrow()
  })
})

describe('chordMatches', () => {
  const event = (key: string, init: Partial<Record<'ctrlKey' | 'altKey' | 'metaKey' | 'shiftKey', boolean>> = {}): Parameters<typeof chordMatches>[0] => ({
    key,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
    ...init,
  })

  it('requires the exact modifier set', () => {
    const chord = parseChord('Ctrl+R')
    expect(chordMatches(event('r', { ctrlKey: true }), chord)).toBe(true)
    expect(chordMatches(event('r'), chord)).toBe(false)
    expect(chordMatches(event('r', { ctrlKey: true, shiftKey: true }), chord)).toBe(false)
    expect(chordMatches(event('r', { shiftKey: true }), chord)).toBe(false)
  })

  it('matches the key name case-insensitively', () => {
    const chord = parseChord('Ctrl+R')
    expect(chordMatches(event('R', { ctrlKey: true }), chord)).toBe(true)
    expect(chordMatches(event('k', { ctrlKey: true }), chord)).toBe(false)
  })

  it('matches a bare-key chord only without modifiers', () => {
    const chord = parseChord('Enter')
    expect(chordMatches(event('Enter'), chord)).toBe(true)
    expect(chordMatches(event('Enter', { ctrlKey: true }), chord)).toBe(false)
  })
})

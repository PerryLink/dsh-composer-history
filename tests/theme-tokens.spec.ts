// The notice, compaction card and search overlay must follow the host theme: no literal colours, and only
// `--dsw-*` names the host theme defines (a renamed or invented token silently falls back to nothing).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const FILES = ['notice.ts', 'compaction-notice.ts', 'search-overlay.ts']
const root = join(process.cwd(), 'src/client')
/** Tokens the DSH theme sheets define and these surfaces use (subset of the host's --dsw-* list). */
const KNOWN = new Set([
  'bg-layer-1', 'bg-layer-2', 'border-l2', 'border-l3', 'label-primary', 'label-secondary', 'label-tertiary',
  'label-primary-foreground', 'interactive-bg-hover', 'button-primary-fill', 'button-primary-hover',
  'state-business-primary', 'state-business-tertiary', 'state-error-primary', 'state-success-primary',
  'state-success-secondary', 'state-success-tertiary', 'state-warn-primary', 'state-warn-label', 'state-warn-tertiary',
].map(name => `--dsw-alias-${name}`).concat('--dsw-elevation-prominent'))

describe.each(FILES)('%s', (file) => {
  const source = readFileSync(join(root, file), 'utf8')
  it('contains no literal colours', () => {
    expect(source.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g) ?? []).toEqual([])
  })
  it('references only known theme tokens', () => {
    const used = new Set(source.match(/--dsw-[a-z0-9-]+/g) ?? [])
    expect(used.size).toBeGreaterThan(0)
    for (const token of used) expect(KNOWN.has(token), token).toBe(true)
  })
})

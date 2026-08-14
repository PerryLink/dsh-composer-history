/**
 * README consistency gate: every localized README must carry the same set of
 * backtick-quoted identifier tokens in table first columns (config field
 * names, key names) as the English README.md. Headings and prose are
 * intentionally translated and stay out of scope; code identifiers are
 * language-neutral, so a newly added config field that missed one language
 * fails this check loudly.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'

const root = process.cwd()
const tokenPattern = /^\|\s*`([A-Za-z][A-Za-z0-9]*)`\s*\|/gm

const files = readdirSync(root)
  .filter(name => /^README.*\.md$/.test(name))
  .sort()

const collect = (file) => {
  const text = readFileSync(join(root, file), 'utf8')
  const tokens = new Set()
  for (const match of text.matchAll(tokenPattern)) tokens.add(match[1])
  return { file, tokens }
}

const reference = collect('README.md')
let failed = false
for (const file of files) {
  if (file === 'README.md') continue
  const { tokens } = collect(file)
  const missing = [...reference.tokens].filter(token => !tokens.has(token))
  const extra = [...tokens].filter(token => !reference.tokens.has(token))
  if (missing.length > 0 || extra.length > 0) {
    failed = true
    console.error(`check-readmes: ${file} drifted from README.md`)
    if (missing.length > 0) console.error(`  missing: ${missing.join(', ')}`)
    if (extra.length > 0) console.error(`  extra:   ${extra.join(', ')}`)
  }
}

if (failed) process.exit(1)
console.log(`check-readmes: ok (${files.length} files, ${reference.tokens.size} shared tokens)`)

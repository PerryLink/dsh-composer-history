/**
 * Pack-surface verification (no child processes, cross-platform): every
 * artifact the host Loader and the browser boot require must (a) exist on
 * disk (the build ran) and (b) be covered by the package.json `files`
 * whitelist, so a published tarball would carry it. Fails loud with a
 * per-file reason list.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

const REQUIRED = [
  'package.json',
  'lib/index.js',
  'lib/invariant.js',
  'lib/client.js',
  'lib/types/index.d.ts',
  'lib/types/client/index.d.ts',
  'cordis.patch.yml',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
]

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const patterns = Array.isArray(pkg.files) ? pkg.files : []

/** Minimal matcher for the `files` glob forms this package uses. */
function covered(path) {
  for (const pattern of patterns) {
    if (pattern === path) return true
    if (pattern === 'README*.md' && /^README[^/]*\.md$/.test(path)) return true
    if (pattern.endsWith('/**/*.d.ts')) {
      const prefix = pattern.slice(0, -'/**/*.d.ts'.length)
      if (path.startsWith(`${prefix}/`) && path.endsWith('.d.ts')) return true
    }
    if (!pattern.includes('*') && path.startsWith(`${pattern}/`)) return true
  }
  return false
}

const failures = []
for (const file of REQUIRED) {
  if (!existsSync(join(root, file))) failures.push(`${file}: missing on disk (run pnpm run build)`)
  else if (file !== 'package.json' && !covered(file)) failures.push(`${file}: not covered by package.json "files"`)
}

if (failures.length > 0) {
  console.error(`verify-pack: ${failures.join('; ')}`)
  process.exit(1)
}
console.log(`verify-pack: ok (${REQUIRED.length} required artifacts present and packaged)`)

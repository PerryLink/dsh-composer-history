// scripts/loader-runner.mjs — real Loader composition runner (community
// five-layer model, layer 4). An independent process boots a real Context,
// mounts the vendored Loader with the Include builtin, reads the given
// cordis.yml (settings service row + plugin row + config), then asserts the
// plugin's settings-namespace registration and one config-dependent fact.
// Config is applied by the Loader, so the expected outcome proves the config
// in the file was honored.
//
// Usage: node scripts/loader-runner.mjs <cordis.yml>
// Exit 0 prints DSH_LOADER_RESULT <json>; a load failure (invalid config)
// exits non-zero with the reason on stderr.

import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const configArgument = process.argv[2]
if (configArgument === undefined) {
  console.error('usage: loader-runner.mjs <cordis.yml>')
  process.exit(2)
}

const configPath = resolve(configArgument)
// Resolve bare package rows from this repository's dependency tree so the
// composition works with config files written anywhere (e.g. a temp dir).
const configRequire = createRequire(resolve(import.meta.dirname, '../package.json'))

const ctx = new Context()
try {
  ctx.baseUrl = `${pathToFileURL(dirname(configPath)).href}/`
  // The host half soft-injects `settings`; the abstract npm `dsh-settings`
  // Service Definition cannot init without a storage provider, so the runner
  // provides a narrow in-process face that records each namespace's `base`
  // (the Loader-validated, default-filled config) exactly as a provider would.
  const namespaces = new Map()
  ctx.provide('settings', {
    register(ns, _schema, options) {
      namespaces.set(ns, options?.base)
      return { get: () => options?.base }
    },
    get(ns) {
      return namespaces.get(ns)
    },
  })
  await ctx.plugin(Loader)
  ctx.loader.internal = /** @type {any} */ ({
    version: 'v2',
    async import(specifier) {
      if (specifier.startsWith('file:')) return import(specifier)
      if (specifier.startsWith('node:')) return import(specifier)
      const absolute = /^([a-zA-Z]:)?[\\/]/u.test(specifier)
      return import(pathToFileURL(absolute ? specifier : configRequire.resolve(specifier)).href)
    },
  })
  ctx.loader.builtins.include = Include
  await ctx.loader.create({
    name: 'cordis:include',
    config: { path: pathToFileURL(configPath).href },
  })
  await ctx.loader.await()

  // The host half registers the `composer-history` settings namespace; the
  // resolved value carries the composition `base` (the Loader-applied config).
  const settings = ctx.get('settings')
  if (settings === undefined) throw new Error('Loader composition: settings service is missing')
  const resolved = settings.get('composer-history')
  if (resolved === undefined) throw new Error('Loader composition: composer-history settings namespace is not registered')
  process.stdout.write(`DSH_LOADER_RESULT ${JSON.stringify({ maxHistory: resolved.maxHistory })}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
} finally {
  await ctx.fiber.dispose()
}

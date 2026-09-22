// scripts/loader-runner.mjs — real Loader composition runner (community
// five-layer model, layer 4). An independent process boots a real Context,
// mounts the vendored Loader with the Include builtin, reads the given
// cordis.yml (settings service row + plugin row + config), then asserts the
// host half's 0.1.7 contract: the plugin claims the generated settings-form
// presentation for its own fiber, and the Loader-applied config reaches that
// fiber as LIVE references (the values the entry's form projects to the
// browser half). Config is applied by the Loader, so the expected outcome
// proves the config in the file was honored.
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
  // provides a narrow in-process face that records each presentation claim
  // (the generated-form policy the plugin instance asked for) exactly as the
  // real `SettingsForms` service would.
  const claims = []
  ctx.provide('settings', {
    configure(presentation, owner) {
      claims.push({ presentation, owner })
      return () => {}
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

  // The host half claims the generated-form presentation for its own fiber,
  // and that fiber's live Config is the form's field set: the composition
  // config (cordis.yml) resolved into stable references the browser half
  // reads through `ctx.configForms.get(entryId)`.
  if (claims.length !== 1) {
    throw new Error(`Loader composition: expected exactly one settings presentation claim, got ${claims.length}`)
  }
  if (claims[0].presentation?.auto !== true) {
    throw new Error(`Loader composition: the generated-form policy must be auto:true, got ${JSON.stringify(claims[0].presentation)}`)
  }
  const live = claims[0].owner?.config
  if (live === undefined) throw new Error('Loader composition: the presentation claim carries no plugin fiber')
  const maxHistory = live.maxHistory?.get?.()
  if (maxHistory === undefined) {
    throw new Error('Loader composition: maxHistory is not a live reference on the plugin fiber config')
  }
  process.stdout.write(`DSH_LOADER_RESULT ${JSON.stringify({ maxHistory })}`)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
} finally {
  await ctx.fiber.dispose()
}

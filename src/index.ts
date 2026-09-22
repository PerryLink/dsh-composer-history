/**
 * dsh-composer-history, host half. The plugin behavior is browser-only; the
 * host Loader still needs this entry so the package can appear as a
 * cordis.yml row and its `dsh.client` manifest can join the web boot graph.
 * Host-side jobs on the `0.1.7` settings contract:
 * - export the Config schema, which the Loader uses to validate any
 *   cordis.yml `config:` block at load time — invalid values fail the entry
 *   loudly before the browser ever boots;
 * - claim the generated-form presentation policy for this profile entry, so
 *   the entry's live (volatile) Config fields are the plugin's settings
 *   surface. The form namespace IS the local id of the profile entry
 *   (`SETTINGS_ENTRY_ID`, the `cordis.patch.yml` row id), the browser half
 *   binds the same string through `ctx.configForms.get()`, and the composition
 *   `base` plus the profile's override layer resolve into the form the browser
 *   half reads. The removed `ctx.settings.register(ns, schema, { base })`
 *   seam is gone: a plugin's durable settings surface is now its own live
 *   Config, so this half registers nothing and persists nothing.
 * @module dsh-composer-history
 */
import type { Context } from '@deepseek-ai/cordis'
// Type-only: declares the `ctx.settings` (SettingsForms) Context merge.
import type {} from '@deepseek-ai/dsh-settings'
import type { ComposerHistoryLiveConfig } from './client/config.ts'

// Service Definition: the exported Config schema — the contract the Loader validates cordis.yml `config:` blocks against, and the schema the entry's settings form is projected from.
export { Config, PlainConfig, resolveConfig } from './client/config.ts'
export type { ComposerHistoryConfig, ComposerHistoryLiveConfig } from './client/config.ts'

/** Plugin name: matches the package name, the graph row id, and the bundle id. */
export const name = 'dsh-composer-history'

/** Settings is optional: without a settings provider this half simply claims no presentation. */
export const inject: string[] = []

/**
 * Profile entry id carrying this plugin's settings form. The `0.1.7` contract
 * names a form by the local id of its profile entry, and `cordis.patch.yml`
 * mounts this plugin as `composer-history`; the browser half binds the same
 * string through `ctx.configForms.get()`, so the two halves agree by
 * construction.
 */
export const SETTINGS_ENTRY_ID = 'composer-history'

/**
 * Claim the generated-form presentation when a settings service exists; the
 * entry's volatile Config is the plugin's whole settings surface, and it has
 * no custom settings page, so the generated one carries it (`auto: true`).
 * The claim is effect-owned: the disposer releases it on reload, so a
 * re-applied entry never trips the service's duplicate-configuration guard.
 * No settings service means no claim and no host-side behavior at all.
 * @param ctx - host root context.
 * @param _config - validated live config (the Loader resolves cordis.yml
 *   `config:` into these references for the browser half to read; this half
 *   reads no field of it, and the parameter documents the contract).
 */
export function apply(ctx: Context, _config: ComposerHistoryLiveConfig): void {
  // Consumer: the optional settings service is consumed through ctx.inject(...); without a settings provider the entry claims nothing.
  // Service Provider: none — the entry's own live Config IS the namespace its form projects.
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: true }, ctx.fiber))
  })
}

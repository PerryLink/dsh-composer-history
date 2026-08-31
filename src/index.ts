/**
 * dsh-composer-history, host half. The plugin behavior is browser-only; the
 * host Loader still needs this entry so the package can appear as a
 * cordis.yml row and its `dsh.client` manifest can join the web boot graph.
 * Host-side jobs:
 * - export the Config schema, which the Loader uses to validate any
 *   cordis.yml `config:` block at load time — invalid values fail the entry
 *   loudly before the browser ever boots;
 * - register the `composer-history` settings namespace through the canonical
 *   optional-settings wiring, so when the settings service exists the
 *   resolved section (cordis.yml `base` + user overrides) reaches the
 *   browser half; without a settings service the entry keeps working exactly
 *   as composed.
 * @module dsh-composer-history
 */
import type { Context } from '@deepseek-ai/cordis'
import type { SettingsNamespace } from '@deepseek-ai/dsh-settings'
import { Config, type ComposerHistoryConfig } from './client/config.ts'

export { Config, resolveConfig } from './client/config.ts'
export type { ComposerHistoryConfig } from './client/config.ts'

/** Plugin name: matches the package name, the graph row id, and the bundle id. */
export const name = 'dsh-composer-history'

/** Settings is optional (registration is skipped when the provider is absent). */
export const inject: string[] = []

/** Settings namespace carrying the resolved options into the browser half. */
const NAMESPACE = 'composer-history' as SettingsNamespace

/**
 * Register the settings section when a settings service exists; the entry
 * config is the composition `base`, and the browser half overlays user
 * overrides on top. No settings service means no registration and no
 * host-side behavior at all. The 0.1.2-alpha.2 settings seam registers a
 * namespace schema through `ctx.settings.register`; the removed
 * `installSettingsSection` helper no longer exists.
 * @param ctx - host root context.
 * @param config - validated config (the composition base).
 */
export function apply(ctx: Context, config: ComposerHistoryConfig): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(NAMESPACE, Config, { base: config as never })
  })
}

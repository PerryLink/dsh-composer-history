/**
 * dsh-composer-history, host half. The plugin is browser-only: the host
 * Loader still needs this entry so the package can appear as a cordis.yml
 * row and its `dsh.client` manifest can join the web boot graph. The only
 * host-side job is exporting the Config schema, which the Loader uses to
 * validate any cordis.yml `config:` block at load time — invalid values
 * fail the entry loudly before the browser ever boots.
 * @module dsh-composer-history
 */
import type { Context } from '@deepseek-ai/cordis'
import type { ComposerHistoryConfig } from './client/config.ts'

export { Config, resolveConfig } from './client/config.ts'
export type { ComposerHistoryConfig } from './client/config.ts'

/** Plugin name: matches the package name, the graph row id, and the bundle id. */
export const name = 'dsh-composer-history'

/** No services required host-side; the browser half declares its own inject. */
export const inject: string[] = []

/**
 * Empty host apply: no server-side behavior. The browser half installs the
 * window-capture interception once the shell loads /plugins/<id>/client.js.
 * @param ctx - host root context (unused).
 * @param config - validated config (unused host-side).
 */
export function apply(_ctx: Context, _config: ComposerHistoryConfig): void {}

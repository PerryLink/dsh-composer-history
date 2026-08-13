/**
 * Plugin Config: the Schemastery schema every tunable lives in. The schema
 * is exported from both halves — the host Loader validates any cordis.yml
 * `config:` block against it at load time (invalid values fail the entry
 * loudly), and the browser half resolves it again in apply() so defaults
 * apply even though the browser boot graph carries no config payload today.
 */

import z from '@deepseek-ai/schemastery'
import type { RecallOptions } from './recall.ts'

/** Config face; structurally the pure machine's {@link RecallOptions}. */
export interface ComposerHistoryConfig extends RecallOptions {}

/** Defaults are the plugin behavior baseline; every key is changeable from cordis.yml. */
export const Config: z<ComposerHistoryConfig> = z.object({
  recallWithDraft: z.union([z.const('save'), z.const('gate')]).default('save'),
  restoreOnEscape: z.boolean().default(true),
  edgeMode: z.union([z.const('logical'), z.const('visual')]).default('logical'),
  enableCtrlAlias: z.boolean().default(true),
  restoreCaret: z.boolean().default(true),
})

/**
 * Resolve a config input through the schema: partial input gets the
 * defaults, invalid values throw at load time. The boundary cast is
 * deliberate — the schema's declared source type is the fully-populated
 * object, while runtime accepts partial input and fills the rest.
 * @param input - raw config (cordis.yml block, or absent in the browser).
 * @returns the validated, fully-defaulted options.
 */
export function resolveConfig(input: unknown): ComposerHistoryConfig {
  return Config(input as ComposerHistoryConfig)
}

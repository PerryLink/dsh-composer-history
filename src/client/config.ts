/**
 * Plugin Config: the Schemastery schema every tunable lives in. The schema
 * is exported from both halves — the host Loader validates any cordis.yml
 * `config:` block against it at load time (invalid values fail the entry
 * loudly), the host half also registers it as the settings-namespace schema
 * (so the resolved composition `base` + user layer reaches the browser), and
 * the browser half resolves it again in apply() so defaults apply even
 * without either. Key-spec GRAMMAR (chord syntax) is validated at parse time
 * by keys.ts, not by the schema — a malformed chord fails the browser fiber
 * loudly at load.
 */

import z from '@deepseek-ai/schemastery'
import type { RecallOptions } from './recall.ts'

/** Config face; structurally the pure machine's {@link RecallOptions} plus the wiring tunables. */
export interface ComposerHistoryConfig extends RecallOptions {
  /** `KeyboardEvent.key` that recalls upward; '' disables. */
  readonly upKey: string
  /** `KeyboardEvent.key` that walks newer / restores; '' disables. */
  readonly downKey: string
  /** `KeyboardEvent.key` that escapes browsing; '' disables. */
  readonly escapeKey: string
  /** Maximum recalled entries (newest kept); 0 means unlimited. */
  readonly maxHistory: number
  /** Conversation node kinds admitted into the history ('user', optionally 'steering'). */
  readonly includeKinds: string[]
  /** 'session': current session only; 'workspace': other listed sessions join before it. */
  readonly historyScope: 'session' | 'workspace'
  /** Persist sent messages across page reloads and sessions (browser-local). */
  readonly persistHistory: boolean
  /** Maximum persisted entries; 0 means unlimited. */
  readonly maxPersisted: number
  /** Enable the reverse-search overlay. */
  readonly enableSearch: boolean
  /** Chord specs opening the search overlay, e.g. 'Ctrl+R'. */
  readonly searchKeys: string[]
  /** Whether search matching distinguishes letter case. */
  readonly searchCaseSensitive: boolean
  /** Admit `[compacted]` checkpoint summaries into recall and search. */
  readonly includeCompactionSummaries: boolean
  /** Show a transient notice when a compaction checkpoint lands. */
  readonly showCompactionNotice: boolean
  /** Slash command the notice's "Compact now" action fills; '' hides the action. */
  readonly compactCommandText: string
  /** Enable the cross-session snippet library (`/save`, `/load`, overlay picking). */
  readonly enableSnippets: boolean
  /** Maximum stored snippets; 0 means unlimited. */
  readonly maxSnippets: number
  /** Enable the prompt-template library (variables fill at insertion). */
  readonly enableTemplates: boolean
  /** Enable the reuse-insight hint (local usage statistics). */
  readonly enableInsights: boolean
  /** Minimum uses before a reuse hint shows. */
  readonly insightMinUses: number
  /** Badge compacted summaries distinctly in the search overlay. */
  readonly enableCompactionHighlight: boolean
}

/** Defaults are the plugin behavior baseline; every key is changeable from cordis.yml and the settings document. */
export const Config: z<ComposerHistoryConfig> = z.object({
  recallWithDraft: z.union([z.const('save'), z.const('gate')]).default('save'),
  restoreOnEscape: z.boolean().default(true),
  edgeMode: z.union([z.const('logical'), z.const('visual')]).default('logical'),
  enableCtrlAlias: z.boolean().default(true),
  restoreCaret: z.boolean().default(true),
  upKey: z.string().default('ArrowUp'),
  downKey: z.string().default('ArrowDown'),
  escapeKey: z.string().default('Escape'),
  maxHistory: z.number().step(1).min(0).default(500),
  includeKinds: z.array(z.string()).default(['user']),
  historyScope: z.union([z.const('session'), z.const('workspace')]).default('session'),
  persistHistory: z.boolean().default(true),
  maxPersisted: z.number().step(1).min(0).default(200),
  enableSearch: z.boolean().default(true),
  searchKeys: z.array(z.string()).default(['Ctrl+R']),
  searchCaseSensitive: z.boolean().default(false),
  includeCompactionSummaries: z.boolean().default(true),
  showCompactionNotice: z.boolean().default(true),
  compactCommandText: z.string().default('/compact'),
  enableSnippets: z.boolean().default(true),
  maxSnippets: z.number().step(1).min(0).default(200),
  enableTemplates: z.boolean().default(true),
  enableInsights: z.boolean().default(true),
  insightMinUses: z.number().step(1).min(1).default(2),
  enableCompactionHighlight: z.boolean().default(true),
})

/**
 * Resolve a config input through the schema: partial input gets the
 * defaults, invalid values throw at load time. The boundary cast is
 * deliberate — the schema's declared source type is the fully-populated
 * object, while runtime accepts partial input and fills the rest.
 * @param input - raw config (cordis.yml block, settings section, or absent in the browser).
 * @returns the validated, fully-defaulted options.
 */
export function resolveConfig(input: unknown): ComposerHistoryConfig {
  return Config(input as ComposerHistoryConfig)
}

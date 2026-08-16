/**
 * Cross-session snippet library: named command texts saved from the
 * composer (`/save <name>`), loaded back by name (`/load <name>`) or picked
 * from the reverse-search overlay, persisted browser-locally and scoped
 * per workspace. Everything here is pure over an injected storage face —
 * the DOM stays in the owning wiring, so the whole library is unit-testable
 * without a browser. A corrupt or foreign payload degrades to empty, never
 * to a failure.
 */

/** One stored snippet. */
export interface SnippetRecord {
  /** Unique snippet name (kebab-case), 1..64 chars. */
  readonly name: string
  /** The snippet text (non-empty after trim). */
  readonly text: string
  /** Advisory tags, ≤8, each ≤32 chars, trimmed and deduped. */
  readonly tags: readonly string[]
  /** 'global' or a workspace key (the snippet only loads inside that workspace). */
  readonly scope: string
  /** Epoch ms of creation. */
  readonly createdAt: number
  /** Epoch ms of the last save. */
  readonly updatedAt: number
  /** How many times the snippet was loaded. */
  readonly useCount: number
  /** Epoch ms of the last load, or 0. */
  readonly lastUsedAt: number
}

/** Storage face (the safeStorage wrapper from history-store satisfies it). */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** Parsed `/save` / `/load` command. */
export interface SnippetCommand {
  readonly verb: 'save' | 'load'
  readonly name: string
  /** Tags declared with --tag=a,b (save only). */
  readonly tags: readonly string[]
}

/** LocalStorage key of the snippet payload. */
export const SNIPPET_STORE_KEY = 'dsh.composer-history.snippets.v1'

/** Payload format version; bumping abandons older payloads. */
const SNIPPET_STORE_VERSION = 1

/** Name grammar: kebab-case, 1..64 chars. */
const SNIPPET_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/

/** Hard caps (protocol constants, not tunables). */
export const MAX_SNIPPET_TAGS = 8
export const MAX_TAG_LENGTH = 32

interface StoredShape {
  readonly v: number
  readonly snippets: readonly SnippetRecord[]
}

function isStoredShape(value: unknown): value is StoredShape {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return record['v'] === SNIPPET_STORE_VERSION && Array.isArray(record['snippets'])
}

/** Structural snippet guard: a stored record must carry every declared field with the right type. */
function isSnippetRecord(value: unknown): value is SnippetRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record['name'] === 'string'
    && typeof record['text'] === 'string'
    && Array.isArray(record['tags'])
    && typeof record['scope'] === 'string'
    && typeof record['createdAt'] === 'number'
    && typeof record['updatedAt'] === 'number'
    && typeof record['useCount'] === 'number'
    && typeof record['lastUsedAt'] === 'number'
}

/**
 * Parse a `/save <name>` or `/load <name>` command from a composer draft.
 * Only a draft whose first line is exactly the command qualifies; tags are
 * optional and only meaningful for save.
 * @param draft - the full composer draft.
 * @returns the parsed command, or undefined when the draft is not a snippet command.
 */
export function parseSnippetCommand(draft: string): SnippetCommand | undefined {
  const line = draft.split('\n', 1)[0] ?? ''
  const match = /^\/(save|load)\s+(\S+)(?:\s+--tag=([\w,-]+))?\s*$/.exec(line)
  if (match === null) return undefined
  const verb = match[1] === 'save' ? 'save' : 'load'
  const name = match[2] ?? ''
  if (!SNIPPET_NAME_PATTERN.test(name)) return undefined
  const rawTags = match[3] ?? ''
  const tags = rawTags === ''
    ? []
    : [...new Set(rawTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''))]
  if (tags.length > MAX_SNIPPET_TAGS || tags.some(tag => tag.length > MAX_TAG_LENGTH)) return undefined
  return { verb, name, tags }
}

/**
 * The text a `/save <name>` command captures: the draft with the command's
 * first line removed, trimmed. Empty when there is nothing to save.
 * @param draft - the full composer draft.
 * @returns the snippet text ('' when nothing remains).
 */
export function saveCommandText(draft: string): string {
  const rest = draft.split('\n').slice(1).join('\n').trim()
  return rest
}

/**
 * Validate a snippet before persistence: name grammar, non-empty text,
 * tag caps. Throws a descriptive Error on the first violation (fail-loud).
 * @param name - snippet name.
 * @param text - snippet text.
 * @param tags - advisory tags.
 */
export function validateSnippet(name: string, text: string, tags: readonly string[]): void {
  if (!SNIPPET_NAME_PATTERN.test(name)) {
    throw new Error(`invalid snippet name ${JSON.stringify(name)}: use 1..64 kebab-case characters`)
  }
  if (text.trim() === '') throw new Error('snippet text must not be empty')
  if (tags.length > MAX_SNIPPET_TAGS) throw new Error(`at most ${MAX_SNIPPET_TAGS} tags per snippet`)
  for (const tag of tags) {
    if (tag.trim() === '' || tag.length > MAX_TAG_LENGTH) {
      throw new Error(`invalid snippet tag ${JSON.stringify(tag)}: non-empty, at most ${MAX_TAG_LENGTH} chars`)
    }
  }
}

/**
 * Read the stored snippets, oldest first. Returns [] for an absent, corrupt,
 * or foreign payload — the library is a convenience, never a failure mode.
 * @param storage - readable storage.
 * @returns the stored snippets.
 */
export function loadSnippets(storage: StorageLike): SnippetRecord[] {
  const raw = storage.getItem(SNIPPET_STORE_KEY)
  if (raw === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!isStoredShape(parsed)) return []
  return parsed.snippets.filter(isSnippetRecord)
}

/**
 * Save or replace one snippet: same name = replace (fresh updatedAt,
 * preserved use counters); new name = append. Trimmed to the newest `cap`
 * (0 = unlimited) and written once.
 * @param storage - readable and writable storage.
 * @param snippet - the snippet to persist.
 * @param cap - maximum stored snippets; 0 means unlimited.
 * @returns the stored record.
 */
export function upsertSnippet(storage: StorageLike, snippet: Omit<SnippetRecord, 'createdAt' | 'updatedAt' | 'useCount' | 'lastUsedAt'>, cap: number): SnippetRecord {
  validateSnippet(snippet.name, snippet.text, snippet.tags)
  const existing = loadSnippets(storage)
  const index = existing.findIndex(item => item.name === snippet.name)
  const now = Date.now()
  const record: SnippetRecord = index === -1
    ? { ...snippet, tags: normalizeTags(snippet.tags), createdAt: now, updatedAt: now, useCount: 0, lastUsedAt: 0 }
    : {
        ...existing[index]!,
        text: snippet.text,
        tags: normalizeTags(snippet.tags),
        scope: snippet.scope,
        updatedAt: now,
      }
  const next = index === -1 ? [...existing, record] : existing.map(item => (item.name === snippet.name ? record : item))
  saveSnippets(storage, cap > 0 ? next.slice(-cap) : next)
  return record
}

/**
 * Record one snippet load: use counters and last-used time update in place.
 * @param storage - readable and writable storage.
 * @param name - the loaded snippet name.
 * @returns the updated record, or undefined when the snippet does not exist.
 */
export function noteSnippetUse(storage: StorageLike, name: string): SnippetRecord | undefined {
  const existing = loadSnippets(storage)
  const index = existing.findIndex(item => item.name === name)
  if (index === -1) return undefined
  const record: SnippetRecord = {
    ...existing[index]!,
    useCount: existing[index]!.useCount + 1,
    lastUsedAt: Date.now(),
  }
  saveSnippets(storage, existing.map(item => (item.name === name ? record : item)))
  return record
}

/** Dedupe and trim tags, preserving first-occurrence order. */
function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map(tag => tag.trim()).filter(tag => tag !== ''))]
}

/** Replace the stored payload wholesale. */
function saveSnippets(storage: StorageLike, snippets: readonly SnippetRecord[]): void {
  const payload: StoredShape = { v: SNIPPET_STORE_VERSION, snippets: [...snippets] }
  storage.setItem(SNIPPET_STORE_KEY, JSON.stringify(payload))
}

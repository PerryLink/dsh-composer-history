/**
 * Reuse insights: browser-local statistics over which prompt texts the
 * user keeps sending. Every committed user message (and every snippet
 * load) lands one usage record keyed by exact text; the composer then
 * shows a lightweight hint — "this prompt was used M times across N
 * sessions". Nothing ever leaves the browser: the store is localStorage,
 * there is no network path, and the stats carry no content beyond the
 * deduped texts themselves.
 */

/** Storage face (safeStorage satisfies it). */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** One usage record. */
export interface UsageRecord {
  /** The exact prompt text the record is keyed on. */
  readonly text: string
  /** Session ids the text was used in (most recent first, capped). */
  readonly sessions: readonly string[]
  /** Total use count. */
  readonly uses: number
  /** Epoch ms of the last use. */
  readonly lastUsedAt: number
}

/** LocalStorage key of the usage payload. */
export const INSIGHT_STORE_KEY = 'dsh.composer-history.insights.v1'

/** Payload format version; bumping abandons older payloads. */
const INSIGHT_STORE_VERSION = 1

/** Hard caps (protocol constants, not tunables). */
export const MAX_INSIGHT_RECORDS = 500
export const MAX_SESSIONS_PER_RECORD = 50
/** Minimum text length considered a reusable prompt (one-line noise excluded). */
export const MIN_REUSABLE_LENGTH = 3

interface StoredShape {
  readonly v: number
  readonly records: readonly UsageRecord[]
}

function isStoredShape(value: unknown): value is StoredShape {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return record['v'] === INSIGHT_STORE_VERSION && Array.isArray(record['records'])
}

export function isUsageRecord(value: unknown): value is UsageRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record['text'] === 'string'
    && Array.isArray(record['sessions'])
    && typeof record['uses'] === 'number'
    && typeof record['lastUsedAt'] === 'number'
}

/**
 * Read the stored usage records. Returns [] for an absent, corrupt, or
 * foreign payload — insights are a convenience, never a failure mode.
 * @param storage - readable storage.
 * @returns the stored records.
 */
export function loadUsage(storage: StorageLike): UsageRecord[] {
  const raw = storage.getItem(INSIGHT_STORE_KEY)
  if (raw === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!isStoredShape(parsed)) return []
  return parsed.records.filter(isUsageRecord)
}

/**
 * Record one use of a prompt text in one session. Short texts are ignored
 * (noise filter); the record list is capped at {@link MAX_INSIGHT_RECORDS}
 * by last-used recency.
 * @param storage - readable and writable storage.
 * @param text - the used prompt text.
 * @param sessionId - the session it was used in ('' when unknown).
 * @returns the updated record, or undefined when the text was filtered out.
 */
export function noteUsage(storage: StorageLike, text: string, sessionId: string): UsageRecord | undefined {
  const trimmed = text.trim()
  if (trimmed.length < MIN_REUSABLE_LENGTH) return undefined
  const existing = loadUsage(storage)
  const index = existing.findIndex(item => item.text === trimmed)
  const now = Date.now()
  const record: UsageRecord = index === -1
    ? { text: trimmed, sessions: sessionId === '' ? [] : [sessionId], uses: 1, lastUsedAt: now }
    : {
        text: trimmed,
        sessions: sessionId === '' || existing[index]!.sessions.includes(sessionId)
          ? existing[index]!.sessions
          : [sessionId, ...existing[index]!.sessions].slice(0, MAX_SESSIONS_PER_RECORD),
        uses: existing[index]!.uses + 1,
        lastUsedAt: now,
      }
  const next = index === -1 ? [...existing, record] : existing.map(item => (item.text === trimmed ? record : item))
  next.sort((a, b) => a.lastUsedAt - b.lastUsedAt)
  const payload: StoredShape = { v: INSIGHT_STORE_VERSION, records: next.slice(-MAX_INSIGHT_RECORDS) }
  storage.setItem(INSIGHT_STORE_KEY, JSON.stringify(payload))
  return record
}

/**
 * Replace the stored usage payload wholesale (used by the versioned backup
 * import, which resolves conflicts before calling this).
 * @param storage - readable and writable storage.
 * @param records - the usage records to store.
 */
export function saveUsage(storage: StorageLike, records: readonly UsageRecord[]): void {
  const payload: StoredShape = { v: INSIGHT_STORE_VERSION, records: [...records] }
  storage.setItem(INSIGHT_STORE_KEY, JSON.stringify(payload))
}

/**
 * The reuse hint for a draft's first line: the usage record whose text the
 * draft exactly matches. Undefined when there is no match or the draft is
 * below the reusable length.
 * @param storage - readable storage.
 * @param draft - the current composer draft.
 * @returns the matching record, or undefined.
 */
export function hintFor(storage: StorageLike, draft: string): UsageRecord | undefined {
  const first = draft.trim()
  if (first.length < MIN_REUSABLE_LENGTH) return undefined
  return loadUsage(storage).find(item => item.text === first)
}

/**
 * Render the hint line for a record: session and use counts, bilingual,
 * kept to one short line (it overlays the composer, never the message).
 * @param record - the usage record.
 * @returns the hint text.
 */
export function hintText(record: UsageRecord): string {
  return `used ${record.uses}× in ${record.sessions.length} session${record.sessions.length === 1 ? '' : 's'} · 在 ${record.sessions.length} 个会话里用过 ${record.uses} 次`
}

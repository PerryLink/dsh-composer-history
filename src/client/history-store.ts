/**
 * Bounded persisted history cache: the plugin's on-disk (browser-local)
 * companion to the live session projection. Entries are appended when new
 * user messages commit, stored newest-last under one versioned JSON payload,
 * deduplicated by exact text, and trimmed to a cap. A corrupt or foreign
 * payload resets to empty — recall never depends on this store.
 */

/** Minimal storage face (window.localStorage is structural). */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** LocalStorage key of the persisted history payload. */
export const STORE_KEY = 'dsh.composer-history.v1'

/** Payload format version; bumping it abandons older payloads. */
const STORE_VERSION = 1

interface StoredShape {
  readonly v: number
  readonly entries: string[]
}

/** Shape guard for a parsed payload: exact version plus a string array. */
function isStoredShape(value: unknown): value is StoredShape {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return record['v'] === STORE_VERSION && Array.isArray(record['entries'])
}

/**
 * Read the persisted entries. Returns [] for an absent, corrupt, foreign, or
 * unreadable payload — persistence is a convenience, never a failure mode.
 * @param storage - readable storage.
 * @param key - storage key.
 * @returns stored entries, oldest first.
 */
export function loadEntries(storage: StorageLike, key: string): string[] {
  const raw = storage.getItem(key)
  if (raw === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Corrupt payload: reset to empty rather than erroring on recall.
    return []
  }
  if (!isStoredShape(parsed)) return []
  return parsed.entries.filter(entry => typeof entry === 'string' && entry.trim() !== '')
}

/**
 * Persist entries (replace the payload wholesale).
 * @param storage - writable storage.
 * @param key - storage key.
 * @param entries - entries to store, oldest first.
 */
export function saveEntries(storage: StorageLike, key: string, entries: readonly string[]): void {
  const payload: StoredShape = { v: STORE_VERSION, entries: [...entries] }
  storage.setItem(key, JSON.stringify(payload))
}

/**
 * Append new entries to the persisted store: exact-text dedupe against the
 * stored entries (new occurrences keep their stored position), then trim to
 * the newest `cap` (0 = unlimited) and write once. Nothing is written when
 * nothing was added.
 * @param storage - readable and writable storage.
 * @param key - storage key.
 * @param texts - candidate entries in oldest-first order.
 * @param cap - maximum stored entries, newest kept; 0 means unlimited.
 * @returns the entries actually added, in order.
 */
export function appendEntries(storage: StorageLike, key: string, texts: readonly string[], cap: number): string[] {
  const existing = loadEntries(storage, key)
  const seen = new Set(existing)
  const added: string[] = []
  for (const text of texts) {
    if (text.trim() === '' || seen.has(text)) continue
    seen.add(text)
    added.push(text)
    existing.push(text)
  }
  if (added.length === 0) return added
  saveEntries(storage, key, cap > 0 ? existing.slice(-cap) : existing)
  return added
}

/**
 * Wrap a DOM Storage in never-throw accessors: a disabled or full storage
 * (private mode, quota) degrades persistence to session lifetime instead of
 * breaking key handling.
 * @param storage - the ambient localStorage, or undefined outside a browser.
 * @returns the safe face, or undefined when no storage exists.
 */
export function safeStorage(storage: Storage | undefined): StorageLike | undefined {
  if (storage === undefined) return undefined
  return {
    getItem: (key) => {
      try {
        return storage.getItem(key)
      } catch {
        // Storage denied: treat as absent.
        return null
      }
    },
    setItem: (key, value) => {
      try {
        storage.setItem(key, value)
      } catch {
        // Storage denied or full: degrade to session lifetime.
      }
    },
  }
}

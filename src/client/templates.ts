/**
 * Prompt templates with `{{variable}}` placeholders: a browser-local
 * template library filled at insertion time from the built-in session
 * variables (workspace, session, draft) plus the user's own values. The
 * library exports to and imports from JSON only on an explicit user
 * action — the plugin never writes files on its own. All logic is pure:
 * parse/fill/round-trip are unit-testable without a browser.
 */

/** One stored template. */
export interface TemplateRecord {
  /** Unique template name (kebab-case), 1..64 chars. */
  readonly name: string
  /** The template text; `{{var}}` placeholders are filled at insertion. */
  readonly text: string
  /** One-line purpose note (optional). */
  readonly description: string
  /** Epoch ms of the last save. */
  readonly updatedAt: number
}

/** Storage face (safeStorage satisfies it). */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** LocalStorage key of the template payload. */
export const TEMPLATE_STORE_KEY = 'dsh.composer-history.templates.v1'

/** Payload format version; bumping abandons older payloads. */
const TEMPLATE_STORE_VERSION = 1

/** Hard caps (protocol constants, not tunables). */
export const MAX_TEMPLATES = 500
const TEMPLATE_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/
const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_-]*)\s*\}\}/g

interface StoredShape {
  readonly v: number
  readonly templates: readonly TemplateRecord[]
}

function isStoredShape(value: unknown): value is StoredShape {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return record['v'] === TEMPLATE_STORE_VERSION && Array.isArray(record['templates'])
}

function isTemplateRecord(value: unknown): value is TemplateRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record['name'] === 'string'
    && typeof record['text'] === 'string'
    && typeof record['description'] === 'string'
    && typeof record['updatedAt'] === 'number'
}

/**
 * Extract the `{{variable}}` names from a template, in first-occurrence
 * order. Duplicate occurrences collapse to one name.
 * @param text - template text.
 * @returns the variable names.
 */
export function templateVariables(text: string): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const match of text.matchAll(VARIABLE_PATTERN)) {
    const name = match[1]!
    if (!seen.has(name)) {
      seen.add(name)
      names.push(name)
    }
  }
  return names
}

/**
 * Fill a template from the variable values. Unknown variables fail loudly
 * with the full missing list — a half-filled prompt is worse than an error.
 * @param text - template text.
 * @param values - variable values by name.
 * @returns the filled text.
 * @throws when a variable has no value.
 */
export function fillTemplate(text: string, values: Readonly<Record<string, string>>): string {
  const missing = templateVariables(text).filter(name => values[name] === undefined)
  if (missing.length > 0) {
    throw new Error(`template variables missing values: ${missing.map(name => `{{${name}}}`).join(', ')}`)
  }
  return text.replace(VARIABLE_PATTERN, (_whole, name: string) => values[name]!)
}

/**
 * Validate a template before persistence. Throws on the first violation.
 * @param name - template name.
 * @param text - template text.
 */
export function validateTemplate(name: string, text: string): void {
  if (!TEMPLATE_NAME_PATTERN.test(name)) {
    throw new Error(`invalid template name ${JSON.stringify(name)}: use 1..64 kebab-case characters`)
  }
  if (text.trim() === '') throw new Error('template text must not be empty')
}

/**
 * Read the stored templates. Returns [] for an absent, corrupt, or foreign
 * payload — the library is a convenience, never a failure mode.
 * @param storage - readable storage.
 * @returns the stored templates, oldest first.
 */
export function loadTemplates(storage: StorageLike): TemplateRecord[] {
  const raw = storage.getItem(TEMPLATE_STORE_KEY)
  if (raw === null) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!isStoredShape(parsed)) return []
  return parsed.templates.filter(isTemplateRecord)
}

/**
 * Save or replace one template (same name replaces, fresh updatedAt).
 * @param storage - readable and writable storage.
 * @param template - name/text/description.
 * @returns the stored record.
 */
export function upsertTemplate(storage: StorageLike, template: { readonly name: string; readonly text: string; readonly description?: string }): TemplateRecord {
  validateTemplate(template.name, template.text)
  const existing = loadTemplates(storage)
  const record: TemplateRecord = {
    name: template.name,
    text: template.text,
    description: template.description ?? '',
    updatedAt: Date.now(),
  }
  const next = existing.some(item => item.name === template.name)
    ? existing.map(item => (item.name === template.name ? record : item))
    : [...existing, record]
  if (next.length > MAX_TEMPLATES) next.splice(0, next.length - MAX_TEMPLATES)
  const payload: StoredShape = { v: TEMPLATE_STORE_VERSION, templates: next }
  storage.setItem(TEMPLATE_STORE_KEY, JSON.stringify(payload))
  return record
}

/**
 * Serialize the template library to an export JSON document (an explicit
 * user action in the UI; this function never writes anywhere).
 * @param templates - the library.
 * @returns the export document as a JSON string.
 */
export function templatesToJson(templates: readonly TemplateRecord[]): string {
  return JSON.stringify({ plugin: 'dsh-composer-history', schema: 'composer-templates-v1', templates }, null, 2)
}

/**
 * Parse and validate an import JSON document. Unknown schema markers and
 * malformed templates throw with a descriptive message (fail-loud), and
 * the imported list is capped at {@link MAX_TEMPLATES}.
 * @param json - the import document.
 * @returns the validated templates, oldest first.
 * @throws on a foreign schema or malformed template.
 */
export function templatesFromJson(json: string): TemplateRecord[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (error) {
    throw new Error(`template import is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (typeof parsed !== 'object' || parsed === null) throw new Error('template import must be a JSON object')
  const record = parsed as Record<string, unknown>
  if (record['plugin'] !== 'dsh-composer-history' || record['schema'] !== 'composer-templates-v1') {
    throw new Error('template import is not a dsh-composer-history templates document (expected schema "composer-templates-v1")')
  }
  if (!Array.isArray(record['templates'])) throw new Error('template import must carry a templates array')
  const templates = (record['templates'] as unknown[])
    .filter(isTemplateRecord)
    .map(item => ({ name: item.name, text: item.text, description: item.description, updatedAt: Date.now() }))
  if (templates.length !== (record['templates'] as unknown[]).length) {
    throw new Error('template import contains malformed templates')
  }
  for (const item of templates) validateTemplate(item.name, item.text)
  if (templates.length > MAX_TEMPLATES) throw new Error(`template import exceeds ${MAX_TEMPLATES} templates`)
  return templates
}

/**
 * Merge imported templates into the library (same name = import wins) and
 * persist. Capped at {@link MAX_TEMPLATES} newest first.
 * @param storage - readable and writable storage.
 * @param incoming - imported templates.
 * @returns the number of templates written.
 */
export function mergeTemplates(storage: StorageLike, incoming: readonly TemplateRecord[]): number {
  const existing = loadTemplates(storage)
  const byName = new Map<string, TemplateRecord>()
  for (const item of existing) byName.set(item.name, item)
  for (const item of incoming) byName.set(item.name, item)
  const next = [...byName.values()]
  const trimmed = next.slice(-MAX_TEMPLATES)
  const payload: StoredShape = { v: TEMPLATE_STORE_VERSION, templates: trimmed }
  storage.setItem(TEMPLATE_STORE_KEY, JSON.stringify(payload))
  return trimmed.length
}

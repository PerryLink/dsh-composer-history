import { describe, expect, it } from 'vitest'
import { fillTemplate, loadTemplates, mergeTemplates, templateVariables, templatesFromJson, templatesToJson, upsertTemplate, type StorageLike } from '../src/client/templates.ts'

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const map = new Map(Object.entries(initial))
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value) },
  }
}

describe('templateVariables', () => {
  it('extracts unique variable names in first-occurrence order', () => {
    expect(templateVariables('review {{file}} and {{diff}}, again {{file}}')).toEqual(['file', 'diff'])
    expect(templateVariables('no variables here')).toEqual([])
  })
})

describe('fillTemplate', () => {
  it('fills every variable and fails loudly on missing values', () => {
    expect(fillTemplate('look at {{file}} in {{workspace}}', { file: 'src/a.ts', workspace: 'proj' })).toBe('look at src/a.ts in proj')
    expect(() => fillTemplate('{{a}} {{b}}', { a: '1' })).toThrow(/{{b}}/)
  })
})

describe('template persistence and round-trip', () => {
  it('saves, replaces, exports, and imports', () => {
    const storage = memoryStorage()
    upsertTemplate(storage, { name: 'review', text: 'review {{file}}', description: 'code review' })
    upsertTemplate(storage, { name: 'review', text: 'review {{diff}}' })
    expect(loadTemplates(storage)).toHaveLength(1)
    expect(loadTemplates(storage)[0]?.text).toBe('review {{diff}}')

    const json = templatesToJson(loadTemplates(storage))
    expect(JSON.parse(json)['schema']).toBe('composer-templates-v1')

    const target = memoryStorage()
    const imported = templatesFromJson(json)
    expect(imported).toHaveLength(1)
    expect(mergeTemplates(target, imported)).toBe(1)
    expect(loadTemplates(target)[0]?.name).toBe('review')
  })

  it('rejects foreign or malformed import documents', () => {
    expect(() => templatesFromJson('{oops')).toThrow(/not valid JSON/)
    expect(() => templatesFromJson('{"plugin":"other","schema":"x","templates":[]}')).toThrow(/composer-templates-v1/)
    expect(() => templatesFromJson(JSON.stringify({ plugin: 'dsh-composer-history', schema: 'composer-templates-v1', templates: [{ name: 'x' }] }))).toThrow(/malformed/)
  })

  it('degrades to empty on corrupt stored payloads', () => {
    const storage = memoryStorage()
    storage.setItem('dsh.composer-history.templates.v1', '{broken')
    expect(loadTemplates(storage)).toEqual([])
  })
})

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createDraftHint, createTransientNotice } from '../src/client/notice.ts'

/** Remove any nodes the fixtures appended (cleanup between tests). */
function clearBody(): void {
  document.body.innerHTML = ''
}

afterEach(clearBody)

describe('createTransientNotice', () => {
  it('shows a message and hides it again on dispose', () => {
    const notice = createTransientNotice()
    expect(notice).toBeDefined()
    notice!.show('snippet saved: ship-check')
    const node = document.querySelector('.__dsh-composer-history-notice__') as HTMLElement
    expect(node).not.toBeNull()
    expect(node.textContent).toBe('snippet saved: ship-check')
    expect(node.style.display).toBe('block')
    notice!.dispose()
    expect(document.querySelector('.__dsh-composer-history-notice__')).toBeNull()
  })

  it('marks error messages with the error class and replaces text on repeated shows', () => {
    const notice = createTransientNotice()!
    notice.show('first')
    notice.show('template tpl: {{missing}} missing', 'error')
    const node = document.querySelector('.__dsh-composer-history-notice__') as HTMLElement
    expect(node.textContent).toBe('template tpl: {{missing}} missing')
    expect(node.className).toContain('--error')
    notice.dispose()
  })
})

describe('createDraftHint', () => {
  it('positions the hint under the anchor and hides it on empty text', () => {
    const hint = createDraftHint()!
    const anchor = document.createElement('textarea')
    document.body.appendChild(anchor)
    anchor.getBoundingClientRect = () => ({ left: 10, right: 100, top: 20, bottom: 40, width: 90, height: 20, x: 10, y: 20, toJSON: () => ({}) })
    hint.set('used 3× in 2 sessions', anchor)
    const node = document.querySelector('.__dsh-composer-history-hint__') as HTMLElement
    expect(node.textContent).toBe('used 3× in 2 sessions')
    expect(node.style.display).toBe('block')
    expect(node.style.left).toBe('10px')
    expect(node.style.top).toBe('44px')
    hint.set('', anchor)
    expect(node.style.display).toBe('none')
    hint.dispose()
    expect(document.querySelector('.__dsh-composer-history-hint__')).toBeNull()
  })
})

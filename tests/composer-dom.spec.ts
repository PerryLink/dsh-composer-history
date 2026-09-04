// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { composerCaret, composerOf, composerText, setComposerCaret, type ComposerElement } from '../src/client/composer-dom.ts'

/** The real host shape: `[data-input-scroll]` > contenteditable `div[data-composer-input]`. */
function hostComposer(contenteditable = 'true'): { composer: ComposerElement; scroll: HTMLElement } {
  const composer = document.createElement('div')
  composer.setAttribute('data-composer-input', '')
  composer.setAttribute('contenteditable', contenteditable)
  composer.setAttribute('role', 'textbox')
  composer.setAttribute('aria-multiline', 'true')
  const scroll = document.createElement('div')
  scroll.setAttribute('data-input-scroll', '')
  scroll.appendChild(composer)
  document.body.appendChild(scroll)
  return { composer, scroll }
}

/** The legacy host shape (harness <= 0.1.1-rc.2): a textarea inside `[data-input-scroll]`. */
function legacyTextarea(): { composer: HTMLTextAreaElement; scroll: HTMLElement } {
  const composer = document.createElement('textarea')
  const scroll = document.createElement('div')
  scroll.setAttribute('data-input-scroll', '')
  scroll.appendChild(composer)
  document.body.appendChild(scroll)
  return { composer, scroll }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('composerOf identity', () => {
  it('matches the contenteditable composer div itself', () => {
    const { composer } = hostComposer()
    expect(composerOf(composer)).toBe(composer)
  })

  it('matches a target nested inside the contenteditable surface', () => {
    const { composer } = hostComposer()
    const span = document.createElement('span')
    composer.appendChild(span)
    expect(composerOf(span)).toBe(composer)
  })

  it('rejects a plain textarea (the retained negative case)', () => {
    const other = document.createElement('textarea')
    document.body.appendChild(other)
    expect(composerOf(other)).toBeUndefined()
  })

  it('rejects a non-composer div inside the scrollport', () => {
    const { scroll } = hostComposer()
    const other = document.createElement('div')
    scroll.appendChild(other)
    expect(composerOf(other)).toBeUndefined()
  })

  it('rejects a contenteditable surface without the data-composer-input anchor', () => {
    const { scroll } = hostComposer()
    const other = document.createElement('div')
    other.setAttribute('contenteditable', 'true')
    scroll.appendChild(other)
    expect(composerOf(other)).toBeUndefined()
  })

  it('rejects an anchored surface outside the scrollport', () => {
    const { composer } = hostComposer()
    composer.parentNode?.removeChild(composer)
    document.body.appendChild(composer)
    expect(composerOf(composer)).toBeUndefined()
  })

  it('rejects the inert surface (contenteditable="false", the workspace-trigger hero)', () => {
    const { composer } = hostComposer('false')
    expect(composerOf(composer)).toBeUndefined()
  })

  it('rejects null and non-element targets', () => {
    const { composer } = hostComposer()
    composer.textContent = 'x'
    expect(composerOf(null)).toBeUndefined()
    expect(composerOf(composer.firstChild)).toBeUndefined()
  })

  it('keeps the legacy textarea composer inside the scrollport matching', () => {
    const { composer } = legacyTextarea()
    expect(composerOf(composer)).toBe(composer)
  })
})

describe('composerText', () => {
  it('reads the contenteditable text (deterministic walk under jsdom)', () => {
    const { composer } = hostComposer()
    composer.textContent = 'alpha\nbeta'
    expect(composerText(composer)).toBe('alpha\nbeta')
  })

  it('counts <br> line breaks as newlines', () => {
    const { composer } = hostComposer()
    composer.innerHTML = 'a<br>b'
    expect(composerText(composer)).toBe('a\nb')
  })

  it('includes nested span text', () => {
    const { composer } = hostComposer()
    composer.innerHTML = 'a<span>b</span>c'
    expect(composerText(composer)).toBe('abc')
  })

  it('reads an empty surface as empty text', () => {
    const { composer } = hostComposer()
    expect(composerText(composer)).toBe('')
  })

  it('reads the legacy textarea value', () => {
    const { composer } = legacyTextarea()
    composer.value = 'typed'
    expect(composerText(composer)).toBe('typed')
  })
})

describe('composerCaret and setComposerCaret', () => {
  it('round-trips collapsed carets at the start, middle, and end', () => {
    const { composer } = hostComposer()
    composer.textContent = 'hello'
    for (const offset of [0, 2, 5]) {
      setComposerCaret(composer, offset)
      expect(composerCaret(composer)).toBe(offset)
    }
  })

  it('places a caret on an empty surface', () => {
    const { composer } = hostComposer()
    setComposerCaret(composer, 0)
    expect(composerCaret(composer)).toBe(0)
  })

  it('clamps out-of-range offsets to the text bounds', () => {
    const { composer } = hostComposer()
    composer.textContent = 'abc'
    setComposerCaret(composer, 99)
    expect(composerCaret(composer)).toBe(3)
    setComposerCaret(composer, -5)
    expect(composerCaret(composer)).toBe(0)
  })

  it('counts <br> line breaks in caret math', () => {
    const { composer } = hostComposer()
    composer.innerHTML = 'a<br>b'
    setComposerCaret(composer, 1) // after 'a', before the line break
    expect(composerCaret(composer)).toBe(1)
    setComposerCaret(composer, 2) // after the line break, before 'b'
    expect(composerCaret(composer)).toBe(2)
    setComposerCaret(composer, 3) // end
    expect(composerCaret(composer)).toBe(3)
  })

  it('reads carets inside nested spans', () => {
    const { composer } = hostComposer()
    composer.innerHTML = 'a<span>bcd</span>e'
    setComposerCaret(composer, 3) // inside the span ('bc' consumed)
    expect(composerCaret(composer)).toBe(3)
  })

  it('returns undefined for a non-collapsed selection', () => {
    const { composer } = hostComposer()
    composer.textContent = 'abc'
    const doc = composer.ownerDocument
    const selection = doc.getSelection()
    expect(selection).not.toBeNull()
    const range = doc.createRange()
    range.setStart(composer.firstChild as Node, 0)
    range.setEnd(composer.firstChild as Node, 2)
    selection?.removeAllRanges()
    selection?.addRange(range)
    expect(composerCaret(composer)).toBeUndefined()
  })

  it('returns undefined when the selection has no ranges', () => {
    const { composer } = hostComposer()
    composer.textContent = 'abc'
    composer.ownerDocument.getSelection()?.removeAllRanges()
    expect(composerCaret(composer)).toBeUndefined()
  })

  it('returns undefined when the caret sits in another element', () => {
    const { composer } = hostComposer()
    composer.textContent = 'abc'
    const other = document.createElement('div')
    other.textContent = 'zzz'
    document.body.appendChild(other)
    setComposerCaret(other, 1)
    expect(composerCaret(composer)).toBeUndefined()
  })

  it('keeps the legacy textarea face (value + selection range)', () => {
    const { composer } = legacyTextarea()
    composer.value = 'legacy'
    setComposerCaret(composer, 4)
    expect(composerCaret(composer)).toBe(4)
    composer.setSelectionRange(0, 2)
    expect(composerCaret(composer)).toBeUndefined()
  })
})

describe('face consistency', () => {
  it('written carets land where the text face reports (plain and nested content)', () => {
    for (const html of ['', 'hello world', 'a\nb\nc', 'x<span>y</span>z', 'l1<br>l2']) {
      const { composer } = hostComposer()
      composer.innerHTML = html
      const length = composerText(composer).length
      for (let offset = 0; offset <= length; offset++) {
        setComposerCaret(composer, offset)
        expect(composerCaret(composer), `${JSON.stringify(html)} @ ${offset}`).toBe(offset)
      }
    }
  })
})

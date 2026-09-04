/**
 * Contenteditable composer DOM face: the identity, text, and caret helpers
 * the wiring (index.ts) and the interception core (interceptor.ts) share.
 *
 * Since harness commit b519cb87b0 (an ancestor of the published
 * 0.1.2-alpha.5 / 0.1.2-rc.1 lines) the web composer is a Lexical
 * contenteditable div — `div[data-composer-input]` inside the
 * `[data-input-scroll]` scrollport — instead of a `<textarea>`. The legacy
 * textarea composer (inside `[data-input-scroll]` on harness lines up to
 * 0.1.1-rc.2) stays supported through the same helpers, while textareas
 * outside the scrollport are negative cases that pass through untouched.
 *
 * Text reads prefer `innerText` (rendered text: `<br>` line breaks count as
 * '\n') and fall back to a deterministic node walk where innerText is
 * unavailable (jsdom). Caret math walks text nodes and `<br>` elements in
 * document order so offsets line up with the text face; the same walk
 * writes carets back, so both faces round-trip in either environment.
 */

/** The composer surface this plugin matches: a contenteditable div (or legacy textarea). */
export type ComposerElement = HTMLElement

/** Whether an element is an editable composer surface (contenteditable "true"/inherit, not "false"). */
function isEditableSurface(el: HTMLElement): boolean {
  const attr = el.getAttribute('contenteditable')
  return attr !== null && attr !== 'false'
}

/** Characters one node contributes to the text face ('<br>' = one '\n', other elements = their content). */
function nodeLength(node: Node): number {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.length ?? 0
  if (node.nodeType !== Node.ELEMENT_NODE) return 0
  const element = node as HTMLElement
  if (element.tagName === 'BR') return 1
  let total = 0
  for (let child = node.firstChild; child !== null; child = child.nextSibling) total += nodeLength(child)
  return total
}

/** Deterministic text face: concatenated text nodes with '<br>' as '\n' (innerText semantics for the plain Lexical root). */
function walkedText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const element = node as HTMLElement
  if (element.tagName === 'BR') return '\n'
  let out = ''
  for (let child = node.firstChild; child !== null; child = child.nextSibling) out += walkedText(child)
  return out
}

/**
 * The composer behind an event target, or undefined when the target is not
 * a composer. Matches the contenteditable surface anchored on
 * `[data-composer-input]` inside `[data-input-scroll]` (harness
 * 0.1.2-alpha.5 / 0.1.2-rc.1 and later), plus the legacy textarea composer
 * inside `[data-input-scroll]` (harness up to 0.1.1-rc.2). Every other
 * target — plain textareas, inert `[data-composer-input]` surfaces
 * (contenteditable="false", the no-session workspace-trigger state),
 * contenteditable elements without the anchor, and targets without the
 * scrollport ancestor — passes through.
 * @param target - the keyboard/input event target.
 * @returns the composer element, or undefined.
 */
export function composerOf(target: EventTarget | null): ComposerElement | undefined {
  if (!(target instanceof HTMLElement)) return undefined
  const editable = target.closest('[data-composer-input]')
  if (editable instanceof HTMLElement && editable.closest('[data-input-scroll]') !== null && isEditableSurface(editable)) {
    return editable
  }
  // Legacy textarea-era composer (harness <= 0.1.1-rc.2): the textarea
  // inside the scrollport. Textareas anywhere else stay negative cases.
  if (target instanceof HTMLTextAreaElement && target.closest('[data-input-scroll]') !== null) return target
  return undefined
}

/**
 * The draft text of a composer surface.
 * @param composer - the composer element.
 * @returns the current text (the textarea value on the legacy face; the
 *   rendered contenteditable text otherwise).
 */
export function composerText(composer: ComposerElement): string {
  if (composer instanceof HTMLTextAreaElement) return composer.value
  if (typeof composer.innerText === 'string') return composer.innerText
  return walkedText(composer)
}

/**
 * The collapsed caret offset into the composer text, or undefined when no
 * collapsed caret sits inside the composer (no selection, a non-collapsed
 * selection, or a caret owned by another element — all pass-through cases).
 * @param composer - the composer element.
 * @returns the character offset, or undefined.
 */
export function composerCaret(composer: ComposerElement): number | undefined {
  if (composer instanceof HTMLTextAreaElement) {
    return composer.selectionEnd === composer.selectionStart ? composer.selectionStart : undefined
  }
  const selection = composer.ownerDocument.getSelection()
  if (selection === null || selection.rangeCount === 0) return undefined
  const range = selection.getRangeAt(0)
  if (!range.collapsed) return undefined
  const container = range.startContainer
  const offset = range.startOffset
  if (container !== composer && !composer.contains(container)) return undefined
  return caretOffsetBefore(composer, container, offset)
}

/**
 * Characters between the start of a node's content and the point
 * (container, offset) inside it: text nodes contribute up to `offset`
 * characters, element containers sum their first `offset` child nodes.
 * @param root - the walked subtree root (the composer surface).
 * @param container - the caret's container node (inside `root`).
 * @param offset - the caret's offset into `container`.
 * @returns the character offset of the point.
 */
function caretOffsetBefore(root: Node, container: Node, offset: number): number {
  const visit = (node: Node): number | undefined => {
    if (node === container) {
      if (node.nodeType === Node.TEXT_NODE) return Math.min(offset, node.textContent?.length ?? 0)
      let sum = 0
      let child = node.firstChild
      let index = 0
      while (child !== null && index < offset) {
        sum += nodeLength(child)
        child = child.nextSibling
        index += 1
      }
      return sum
    }
    let sum = 0
    for (let child = node.firstChild; child !== null; child = child.nextSibling) {
      const hit = visit(child)
      if (hit !== undefined) return sum + hit
      sum += nodeLength(child)
    }
    return undefined
  }
  return visit(root) ?? 0
}

/**
 * Place a collapsed caret at a character offset into the composer text.
 * Offsets clamp to the text bounds; the walk mirrors {@link composerCaret},
 * so a written caret reads back as the same offset.
 * @param composer - the composer element.
 * @param offset - the character offset (clamped).
 */
export function setComposerCaret(composer: ComposerElement, offset: number): void {
  if (composer instanceof HTMLTextAreaElement) {
    const clamped = Math.max(0, Math.min(offset, composer.value.length))
    composer.setSelectionRange(clamped, clamped)
    return
  }
  const doc = composer.ownerDocument
  const selection = doc.getSelection()
  if (selection === null) return
  const clamped = Math.max(0, Math.min(offset, nodeLength(composer)))
  const range = doc.createRange()
  const place = (node: Node, remaining: number): boolean => {
    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.textContent?.length ?? 0
      if (remaining <= length) {
        range.setStart(node, remaining)
        return true
      }
      return false
    }
    if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'BR') {
      if (remaining <= 0) {
        range.setStartBefore(node)
        return true
      }
      if (remaining <= 1) {
        range.setStartAfter(node)
        return true
      }
      return false
    }
    for (let child = node.firstChild; child !== null; child = child.nextSibling) {
      if (place(child, remaining)) return true
      remaining -= nodeLength(child)
    }
    return false
  }
  if (!place(composer, clamped)) {
    range.selectNodeContents(composer)
    range.collapse(false)
  } else {
    range.collapse(true)
  }
  selection.removeAllRanges()
  selection.addRange(range)
}

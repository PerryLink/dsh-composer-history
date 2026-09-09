# Upstream Proposals (C1–C3)

Target: `deepseek-ai/deepseek-harness`. These are extension-point proposals for
the harness client surface, motivated by the constraints this plugin hit while
building terminal-style composer recall. None of them are required for the
plugin to work today; each removes a workaround or an unreachable improvement.

---

## C1 — Expose an edit-range write on the public input face

**Where:** `packages/client/ui-conversation` — `SessionInput`/`InputActions`
(`src/client/input/contract.ts`).

**Current state:** the only public draft write is
`setDraft(text: string)` (plus `InputActions.setDraft`). The
`ComposerKeyboard` face does accept `setDraft(text, editRange?)`, but that face
is explicitly InputBar-private ("never across a plugin boundary"). A plugin
replacing the whole draft therefore always runs the machine's prefix/suffix
diff scan, and every recall fill/restore lands in the undo log as an ordinary
transaction.

**Consequence for this plugin:** recall transactions pollute the composer undo
stack (documented limitation), and full-draft replacements carry less precise
occurrence math than they could.

**Proposal:** widen the public face with an optional edit shape, e.g.
`setDraft(text: string, editRange?: EditRange)` on `InputActions` (the
`EditRange` type already exists), or a separate `replaceDraft(text, range)`
verb when the semantics must stay distinct. The machine already supports the
parameter on the internal face; the change is exposure plus tests.

**Alternative considered:** a "non-undoable write" verb — rejected here because
undoability is a policy the machine owns; the proposal only asks for precision,
not new policy.

---

## C2 — Export the trigger-detection pure function as a value

**Where:** `packages/client/ui-input-trigger` — `src/core/detect.ts`.

**Current state:** `detectTrigger` (`DetectTrigger` over
`(draft, caret, guard)`) exists as a runtime function, but the package exports
only its *type* (`DetectTrigger`) from the `/client` entry. Plugins that need
the boundary rules (leading `/`/`@`, word-boundary constraints, the URL-scheme
exemption, dead `/` after `/`) must re-implement them by hand.

**Consequence for this plugin:** `hasActiveTriggerToken` in
`src/client/recall.ts` duplicates those rules for the menu-open fallback path
(the path taken when the `inputTriggers` service cannot be resolved). Every
upstream rule change silently desynchronizes the copy.

**Proposal:** export `detectTrigger` as a value from
`@deepseek-ai/dsh-client-ui-input-trigger/client` (the function is already
dependency-free). The plugin then drops its copy and calls the sanctioned
implementation.

**Alternative considered:** leaving the fallback as-is — rejected because the
whole point of the fallback is to mirror the real pipeline's boundary rules.

---

## C3 — A documented composer keyboard arbitration chain

**Where:** `docs/architecture.md` ("Where new behavior goes") + a new seam in
`packages/client/ui-conversation` (or a standalone client package).

**Current state:** the only keyboard seams are (a) the InputBar-private
`ComposerKeyboard` and (b) raw DOM events. This plugin therefore installs
`window`-capture `keydown`/`input` listeners and re-derives every gate itself:
composer identity (`[data-input-scroll]` ancestor scan), input phase, the
slash-menu/popup state, selection, IME composition, and modifier policy. Every
keyboard-oriented community plugin will re-derive the same gates, and two such
plugins intercept the same window events with no ordering contract.

**Consequence for this plugin:** the capture wiring works today (and is fully
tested), but it guesses at DOM structure (`data-input-scroll`) and duplicates
gate knowledge that the conversation package already owns.

**Proposal:** document (and provide) a composer keyboard arbitration chain
analogous to `ctx.inputTriggers.arbitrate`'s waterline model: plugins register
a key handler with a priority, the chain runs on capture from the conversation
wiring layer, and the first handler returning "consumed" ends dispatch with
`preventDefault`. The chain would own the shared gates (phase/menu/IME) so
handlers receive only adjudicated key facts. This turns "window capture with
re-derived gates" into a supported extension point.

**Alternative considered:** keep window capture as the sanctioned pattern and
only document it — acceptable as an interim step, but it leaves the
multi-plugin ordering problem unsolved.

---

## Alignment notes (0.1.5-alpha.1, 2026-09-09)

> Status check against `origin/master` = `5dda764e` (`0.1.5-alpha.1`),
> read-only. The official vocabulary is now the `ui-input-trigger`
> subsystem: `packages/client/ui-input-trigger`
> (`@deepseek-ai/dsh-client-ui-input-trigger`), whose pure core lives in
> `src/core/` (`detect.ts` holds the `detectTrigger` value, zero
> React/DOM/cordis; `contract.ts` and `menu.ts` complete it) and whose
> browser half lives in `src/client/` (`InputTriggerService` =
> `ctx.inputTriggers`, `InputTriggerController`, `MenuView` into the
> `conversation.input.overlay` slot). Guard tiers are
> `TriggerGuard.tier: 'plain' | 'claimed' | 'frozen'` (plain = `/` and `@`
> live; claimed = `/` suppressed, `@` live; frozen = none); the boundary
> rules are exactly the ones C2 lists (leading, after whitespace or
> punctuation, the two URL carve-outs for `/`, `user@host` dead). Per
> proposal, the diffs against that official state:

### C1 -- edit-range write: still open

- `editRange` has **zero hits** in `packages/client/ui-conversation` on
  master (grep measured). The public write remains
  `setDraft(text: string): void` on both `SessionInput` and `InputActions`
  -- and the contract moved to `src/client/contract/input.ts` (now
  documented as the frozen input-machine contract).
- `ComposerKeyboard` no longer carries `setDraft(text, editRange?)`. Its
  current members are `snapshot`, `editor`, `submit(mode)`, `steerQueue()`,
  `paste(text)`, `caretSpan()`, `arbitrate(key, composing)`, `space()`,
  `dismissPopup()`. Text editing rides the shell's Lexical editor; the
  machine is the submit plane alone.
- Rewording: ask for a span-scoped public write verb over the editor
  currency (`EditSelection` / `TokenSpan`), e.g. a `SessionInput`-level
  replacement with span CAS -- the old "add `editRange` to the internal
  `setDraft`" phrasing no longer names real code.

### C2 -- detectTrigger value export: still open

- `detectTrigger` exists as a runtime value at `src/core/detect.ts` (the
  `InputTriggerController` imports and calls it), and the `/client` entry
  still exports only `DetectTrigger` and friends as **types** -- verified
  on master.
- The package export map carries a `./src/*` source subpath, but `files`
  ships only `lib/index.js`, `lib/client.js`, `lib/types/**/*.d.ts`, so
  the source deep import is not a consumable npm surface and does not
  resolve C2.
- Proposal unchanged: export `detectTrigger` as a value from
  `@deepseek-ai/dsh-client-ui-input-trigger/client`.

### C3 -- keyboard arbitration chain: mostly landed upstream

- An arbitration seam now **exists**: `arbitrate(key, composing)` returns
  `'consumed' | 'pick-highlighted' | 'pass'` for
  `ArbitrateKey = 'up' | 'down' | 'enter' | 'escape' | 'tab'`, on both the
  `InputTriggerController` and `ComposerKeyboard`. The composer keymap
  (`src/client/input/editor/keymap.ts`) drives it from Lexical commands
  registered at CRITICAL priority, with the IME guard (including the
  Safari compositionend window); `'pass'` falls through to Lexical
  defaults -- the waterline model C3 asked for. The conversation wiring
  layer (`facade.ts`) routes arbitration through `ctx.inputTriggers`
  (`?? 'pass'` when absent), so the gates this plugin used to re-derive
  in window listeners (phase, menu state, IME) are now owned upstream.
- What remains open: the chain is **single-owner** -- the trigger pipeline
  arbitrates its own menu keys, and there is no third-party key-handler
  registration with priorities, so the multi-plugin ordering problem C3
  named is unsolved.
- Rewording: from "create a composer keyboard arbitration chain" to
  "extend the existing `arbitrate` waterline with priority-ordered
  third-party key-handler registration on the capture path, keeping the
  current menu-key arbitration as the built-in claimant".

/**
 * Package-owned invariant companion for `dsh-composer-history`.
 *
 * This plugin owns no runtime invariant to install: it is a pure-UI
 * interaction layer over the composer. It emits no cordis events, registers
 * no services, owns no cross-plugin mutable state, and never adds anything
 * to a model-visible channel — recall text enters the ordinary composer
 * draft, which the session log records as a normal user message when (and
 * only when) the user submits it. There is therefore nothing for the
 * harness's runtime invariant machinery to assert; the behavior matrix is
 * pinned by the unit suite in tests/ instead (state machine transitions,
 * gate predicates, and the DOM interception discipline).
 *
 * The companion exists for symmetry with the harness package convention and
 * so a deployment may wire the `./invariant` entry the same way it would for
 * any other package; it intentionally installs nothing.
 * @module dsh-composer-history/invariant
 */

/** Companion plugin name. */
export const name = 'dsh-composer-history-invariant'

/** No invariant service needed: the companion installs nothing. */
export const inject: string[] = []

/** Install nothing: the plugin declares no runtime invariant to check. */
export function apply(): void {}

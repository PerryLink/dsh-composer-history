/**
 * Build faces for dsh-composer-history. The node half (`src/index.ts`,
 * `src/invariant.ts`) is the host Loader entry; the browser half
 * (`src/client/index.ts`) is the client bundle the modules node half serves
 * under /plugins/dsh-composer-history/client.js.
 *
 * The browser half must follow the shell's client-bundle handshake exactly:
 * a CJS bundle wrapped in `window.__ModuleLoader__.load({ id, factory })`,
 * with the shell's platform modules left external (the factory's `require`
 * answers them from the frozen module table) and every other dependency
 * inlined. This plugin value-imports no other @deepseek-ai plugin package —
 * cross-package reads go through cordis services — so the external list is
 * defensive. `@deepseek-ai/schemastery` is an ordinary vendored library and
 * is inlined into both halves.
 */

import { defineConfig } from 'tsdown'

/** Plugin id: the cordis.yml bare row name, the graph row id, and the stamped bundle id must all match. */
const PLUGIN_ID = 'dsh-composer-history'

/**
 * Module specifiers the shell shares into the frozen browser module table
 * (packages/client/web/src/platform.ts) plus the client bundle id the
 * conversation domain registers (`@deepseek-ai/dsh-client-ui-conversation/client`).
 * Any value import outside this list must be inlined.
 */
const PLATFORM_EXTERNALS: readonly string[] = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-conversation/client',
]

export default defineConfig([
  {
    name: PLUGIN_ID,
    entry: ['src/index.ts', 'src/invariant.ts'],
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    dts: false,
    clean: false,
    // ESM output under a "type": "module" package must land on .js, not .mjs.
    fixedExtension: false,
    deps: { neverBundle: [/^node:/] },
  },
  {
    name: `${PLUGIN_ID}/client`,
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: ['cjs'],
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    // The shell's platform modules stay external (the factory's `require`
    // answers them from the frozen module table); everything else is
    // inlined by default because this package declares no runtime
    // `dependencies` — the only production dep is the type-only cordis
    // peer, and `@deepseek-ai/schemastery` is an ordinary vendored library
    // living in devDependencies. Any future runtime import outside the
    // platform list must therefore stay out of `dependencies` (or be
    // force-inlined with `deps.alwaysBundle`).
    deps: { neverBundle: [...PLATFORM_EXTERNALS] },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
])

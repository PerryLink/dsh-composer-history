// Remove the previous lib/ output so a rebuild never mixes stale artifacts.
import { rmSync } from 'node:fs'

rmSync(new URL('../lib', import.meta.url), { recursive: true, force: true })

<div align="center">

# ⌨️ dsh-composer-history
- **Canal 1024 store**: `npm i -g dsh1024` una vez, luego `dsh1024 plugin --profile web add dsh-composer-history` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

**Historial de entrada estilo terminal para el compositor de la Web GUI de DeepSeek Harness.**

*Pulsa ↑ como en una terminal — y conserva tu borrador a medio escribir.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-composer-history/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-composer-history/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-composer-history?label=version)](https://github.com/PerryLink/dsh-composer-history/releases)
[![npm version](https://img.shields.io/npm/v/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)
[![npm downloads](https://img.shields.io/npm/dm/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [हिन्दी](README.hi.md)

</div>

---

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `0.1.2-alpha.5` (client peers `>=0.1.1-rc.2 <0.2.0`) |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | Solo Web GUI (plugin de cliente; almacenamiento local del navegador; sin red, sin código nativo) |
| Model | Cualquiera (sin peticiones al modelo — comportamiento puramente de UI) |

La mitad de navegador se apoya en los paquetes de cliente publicados (`dsh-client-ui-conversation`, `dsh-client-ui-input-trigger`, `dsh-client-ui-settings`) y en el `Context` de cordis; ya no depende del paquete eliminado `dsh-client-runtime`, por lo que la superficie de cliente también encaja con hosts `0.1.2-alpha.5`.
0.1.2-alpha.5 (adaptado el 2026-09-02): el sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia.

## What you get

`dsh-composer-history` lleva el historial de entrada de una terminal al compositor de la Web GUI de DeepSeek Harness:

1. **Recuperación por flechas con prioridad de borde** — las flechas ↑/↓ simples mueven primero el cursor; la recuperación del historial solo se activa cuando el cursor está en la primera/última línea. La primera recuperación guarda `{draft, caret}`, y al volver a la entrada más reciente (o pulsar `Esc`) se restauran ambos exactamente — nunca se borran.
2. **Historial persistente** — cada mensaje enviado se añade a un almacén local del navegador acotado, de modo que la recuperación sobrevive a las recargas y llega a otras sesiones.
3. **Búsqueda inversa** — `Ctrl+R` (configurable) abre un panel de consulta sobre el historial, los fragmentos y las plantillas combinados.
4. **Capa de entrada inteligente** — fragmentos `/save`/`/load`, plantillas de prompt con variables `{{workspace}}`/`{{session}}`/`{{draft}}` e información de reutilización local del navegador.
5. **Consciente del contexto deslizante** — los resúmenes de compactación se unen a la recuperación y la búsqueda como entradas `[compacted] …`, y un aviso transitorio anuncia cada compactación con un relleno de `/compact` de un clic.

Comportamiento puramente de UI: sin eventos de sesión, sin cambios en el agent-loop, sin peticiones al modelo. El texto recuperado solo entra en el borrador ordinario del compositor; llega al modelo únicamente si *tú* pulsas Enter.

## Quick start

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"

# or from npm (published releases)
dsh plugin --profile web add dsh-composer-history

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: composer-history'
```

## Install & uninstall

El paquete npm incluye los bundles ya compilados; un checkout del código fuente debe compilarse primero (`pnpm run build`) — la verificación del paquete de cliente se niega a arrancar con un bundle sin compilar.

- **canal git** (último `main`): `dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"`.
- **canal npm** (versiones publicadas): `dsh plugin --profile web add dsh-composer-history`.
- **canal tarball**: ejecuta `pnpm pack` en este repositorio y luego `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-composer-history` (o elimina la fila del patch del perfil).

## Configuration

Todos los ajustes son campos Schemastery `Config` (modificables desde cordis.yml y el documento de ajustes). Una sustitución dirigida por id reemplaza toda la fila — vuelve a indicar cada clave que necesites. Los valores de enum no válidos detienen todo el arranque de dsh de forma estrepitosa.

| Key | Default | Meaning |
|---|---|---|
| `recallWithDraft` | `'save'` | Modo de recuperación (`save` / `gate`): `save` guarda un borrador no vacío antes de recuperar; `gate` solo recupera con un borrador vacío (control estilo Claude/Codex) |
| `restoreOnEscape` | `true` | Restaurar el borrador guardado cuando `Esc` termina la navegación |
| `edgeMode` | `'logical'` | Modo de detección de borde (`logical` / `visual`): por líneas `\n` o por líneas ajustadas medidas |
| `enableCtrlAlias` | `true` | Hacer que Ctrl+↑/↓ se comporte como las flechas simples |
| `restoreCaret` | `true` | Restaurar también el cursor guardado al llegar al final / `Esc` |
| `upKey` | `'ArrowUp'` | `KeyboardEvent.key` que recupera hacia arriba; `''` lo desactiva |
| `downKey` | `'ArrowDown'` | `KeyboardEvent.key` que avanza a lo más reciente / restaura; `''` lo desactiva |
| `escapeKey` | `'Escape'` | `KeyboardEvent.key` que sale de la navegación; `''` lo desactiva |
| `maxHistory` | `500` | Máximo de entradas recuperadas (se conservan las más recientes); `0` = ilimitado |
| `includeKinds` | `['user']` | Tipos de nodo de conversación admitidos en el historial (añade `'steering'` para incluir los mensajes steer) |
| `historyScope` | `'session'` | Ámbito del historial (`session` / `workspace`): `workspace` antepone los mensajes de usuario de otras sesiones listadas a los de la sesión actual |
| `persistHistory` | `true` | Añadir los mensajes enviados al almacén local del navegador |
| `maxPersisted` | `200` | Máximo de entradas persistidas; `0` = ilimitado |
| `enableSearch` | `true` | Activar el panel de búsqueda inversa `Ctrl+R` |
| `searchKeys` | `['Ctrl+R']` | Especificaciones de acorde que abren la búsqueda (modificadores `Ctrl`/`Alt`/`Meta`/`Shift` + un nombre de tecla); una especificación mal formada hace fallar el fiber del navegador de forma estrepitosa |
| `searchCaseSensitive` | `false` | Si la búsqueda distingue mayúsculas de minúsculas |
| `includeCompactionSummaries` | `true` | Admitir los resúmenes de punto de control `[compacted] …` en la recuperación y la búsqueda |
| `showCompactionNotice` | `true` | Mostrar un aviso transitorio cuando aterriza un punto de control de compactación |
| `compactCommandText` | `'/compact'` | Comando slash que la acción "Compact now" del aviso rellena en el compositor; `''` oculta la acción |
| `enableSnippets` | `true` | Activar la biblioteca de fragmentos (`/save`, `/load`, selección en el panel de búsqueda) |
| `maxSnippets` | `200` | Máximo de fragmentos almacenados; `0` = ilimitado |
| `enableTemplates` | `true` | Activar la biblioteca de plantillas de prompt (las variables se rellenan al insertar) |
| `enableInsights` | `true` | Activar la pista de reutilización (estadísticas de uso locales) |
| `insightMinUses` | `2` | Usos mínimos antes de que aparezca la pista de reutilización |
| `enableCompactionHighlight` | `true` | Marcar los resúmenes `[compacted] …` de forma distintiva en el panel de búsqueda |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `ArrowUp` | keybinding | Recuperación ↑/↓ con prioridad de borde — guarda `{draft, caret}`, restaura ambos exactamente al llegar al final o con `Esc` |
| `Ctrl+R` | keybinding | Panel de búsqueda inversa sobre el historial, los fragmentos y las plantillas combinados |
| `/save` | command | Guarda el borrador actual como un fragmento con nombre y etiquetas |
| `/load` | command | Inserta un fragmento guardado en el cursor |
| `templates` | UI | Exportar/importar plantillas de prompt como documento JSON (solo con un clic explícito) |
| `composer-history` | settings namespace | Lleva la configuración resuelta a la mitad del navegador |

## Keybindings

| Key | State | Behavior |
|---|---|---|
| ↑ | IDLE, cursor en la primera línea | guarda `{draft, caret}`, rellena la entrada más reciente, cursor al final (sin historial → pasa) |
| ↑ | BROWSING, cursor en la primera línea | entrada anterior; se mantiene en la más antigua (intercepta, sin mutación) |
| ↑ | cursor no está en la primera línea | liberado por completo (el navegador mueve el cursor) |
| ↓ | IDLE | siempre liberado (movimiento normal del cursor) |
| ↓ | BROWSING, cursor en la última línea | entrada más reciente; en la más nueva → restaura `savedDraft` + `savedCaret` → IDLE |
| ↓ | cursor no está en la última línea | liberado por completo |
| Esc | BROWSING (`restoreOnEscape: true`) | restaura `savedDraft` + `savedCaret` → IDLE, interceptado |
| Esc | en otro caso | liberado (la semántica de Escape de menús/ventanas no se toca) |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | igual que las flechas simples |
| `searchKeys` chord | compositor enfocado, fase `plain`, sin menú/selección/IME | abre la búsqueda inversa; la navegación termina, el texto mostrado pasa a ser el borrador |
| Shift/Alt/Meta+flechas, IME, selección | cualquiera | siempre liberado |

`upKey`/`downKey`/`escapeKey`/`searchKeys` renombran las teclas de arriba; la política de modificadores (y la coincidencia exacta de modificadores del acorde de búsqueda) no cambia. Dentro del panel de búsqueda: ↑/↓ mueven la selección (la fila seleccionada se desplaza a la vista), Enter rellena, Esc cancela, un clic elige, pulsar fuera cancela; las subcadenas coincidentes se resaltan en cada fila.

## Reverse search

- **Abrir**: el acorde `searchKeys` con el compositor enfocado y la entrada en `plain` (un `Ctrl+R` aquí también detiene la recarga de página del navegador — la tecla solo se consume dentro del compositor).
- **Filtrar**: coincidencia de subcadena sobre el historial combinado (sesión actual + entradas persistidas + de workspace); sensibilidad a mayúsculas según `searchCaseSensitive`; las subcadenas coincidentes se resaltan en cada fila.
- **Elegir**: Enter rellena el borrador y mueve el cursor al final — la misma ruta de escritura única `setDraft` que la recuperación ordinaria. El texto recuperado llega al modelo solo si pulsas Enter después.
- **Cancelar**: Esc o pulsar fuera del panel; el borrador no se toca.

## Smart input layer

Sobre el historial estilo terminal, tres bibliotecas locales del navegador convierten el compositor en una superficie de entrada reutilizable. Todo lo siguiente vive en `localStorage` (claves `dsh.composer-history.snippets.v1`, `.templates.v1`, `.insights.v1`), nunca toca la red, y cada interruptor es un campo `Config`.

**Fragmentos (biblioteca de comandos entre sesiones)**

```text
/save ship-check --tag=release,ops
check the build, run the smoke suite, tag the release        ← el resto del borrador es el fragmento
/save ship-check                                             → "snippet saved: ship-check"
/load ship-check                                             → el fragmento rellena el compositor
Ctrl+R → el panel de búsqueda lista fragmentos (insignia verde = nombre) junto al historial
```

- `/save <nombre>` consume el Enter, guarda el borrador (menos la línea de comando) bajo un nombre kebab-case con etiquetas opcionales y limpia el compositor. Nada que guardar → un aviso de error, el comando nunca se envía.
- `/load <nombre>` inserta el fragmento en el cursor (reemplazo de todo el borrador, cursor al final) y cuenta el uso.
- Ámbito: los fragmentos guardados con un cwd de workspace tienen ámbito de workspace; los guardados sin uno son globales. `maxSnippets` limita la biblioteca; los guardados con el mismo nombre reemplazan.
- El plugin nunca envía: cada relleno cae en el borrador ordinario y tu Enter sigue siendo tuyo.

**Plantillas de prompt con variables**

Las plantillas son textos de prompt almacenados con marcadores `{{variable}}`. El panel de búsqueda las lista con una insignia morada; elegir una rellena las variables desde la sesión en vivo e inserta el resultado. Variables integradas: `{{workspace}}` (el cwd de la sesión), `{{session}}` (el id de la sesión), `{{draft}}` (el borrador actual). Una plantilla que referencia una variable desconocida falla de forma estrepitosa con la lista de faltantes — un prompt a medio rellenar es peor que un error.

La biblioteca de plantillas exporta a e importa desde un documento JSON (`composer-templates-v1`) mediante los botones **Export templates / Import templates** del panel — una acción explícita del usuario; el plugin nunca escribe archivos por su cuenta.

**Información de reutilización**

Cada mensaje de usuario recién confirmado (y cada carga de fragmento) registra un registro de uso local del navegador indexado por texto exacto. Mientras escribes, una pequeña pista bajo el compositor informa `used M× in N sessions` cuando el borrador coincide con un prompt usado en al menos `insightMinUses` (por defecto 2) sesiones. Se alterna con `enableInsights`; las estadísticas contienen solo los textos deduplicados y los contadores.

**Resaltado de resúmenes de compactación**

`Ctrl+R` marca los resúmenes `[compacted] …` con una insignia ámbar (el historial permanece sin insignia), los fragmentos en verde, las plantillas en morado — la procedencia del panel es visible de un vistazo. Se alterna con `enableCompactionHighlight`.

## Exportación e importación de respaldo

Las cuatro bibliotecas locales del navegador exportan e importan desde un único documento JSON versionado. Las acciones **Export JSON / Copy JSON / Import file / Paste JSON** del panel se ejecutan completamente en el navegador: descarga o copia al portapapeles al exportar, selector de archivo o texto pegado al importar — nada se sube y no hay RPC de host ni llamadas de red.

**Forma del documento**

```json
{
  "schemaVersion": 1,
  "exportedAt": 1735689600000,
  "data": {
    "history": ["…"],
    "snippets": [{ "name": "…", "text": "…", "tags": [], "scope": "global", "createdAt": 0, "updatedAt": 0, "useCount": 0, "lastUsedAt": 0 }],
    "templates": [{ "name": "…", "text": "…", "description": "", "updatedAt": 0 }],
    "insights": [{ "text": "…", "sessions": [], "uses": 0, "lastUsedAt": 0 }]
  }
}
```

**Estrategia de fusión y conflictos**

- Las entradas de historial son cadenas planas y se deduplican por texto exacto; una entrada duplicada o vacía se omite, nunca se sobrescribe.
- Los snippets y plantillas se indexan por `name`; los insights por `text` exacto. En un conflicto de misma clave gana la **marca de tiempo más nueva** (`updatedAt` para snippets/plantillas, `lastUsedAt` para insights); una importación más antigua o de igual marca se omite, y las claves nuevas se añaden.
- La importación respeta `maxPersisted` y `maxSnippets`; las plantillas e insights se limitan a sus topes de protocolo (`500` cada uno).
- El aviso de resultado informa cuántos registros se escribieron y cuántos se omitieron (antiguos/duplicados).

**Versionado de esquema**

`schemaVersion` empieza en `1`. Las importaciones ejecutan una migración por pasos (una versión a la vez) para que los formatos futuros puedan actualizar documentos antiguos in situ. Un documento cuyo `schemaVersion` sea **más nuevo** que el que entiende esta compilación se rechaza con un error — nunca se descarta en silencio ni se fusiona parcialmente; una versión demasiado antigua para migrar se rechaza igual.

## Sliding context

El núcleo del harness da a cada sesión de dsh una ventana de contexto deslizante, el mismo flujo de trabajo que ofrecen Claude Code y Codex: cuando una conversación se acerca al límite de contexto del modelo (o el proveedor informa un desbordamiento), el harness **auto-compacta** — los turnos antiguos se resumen detrás de un marcador de checkpoint `compaction` que permanece visible en la transcripción, el modelo conserva solo el resumen más la cola reciente, y la sesión continúa. `/compact` dispara la misma compactación bajo demanda, y el marcador se renderiza como una fila expandible "Context compacted".

`dsh-composer-history` conecta el compositor a ese flujo para que el deslizamiento de la ventana nunca te cueste tu historial de escritura:

- **La recuperación sobrevive a la compactación** — los turnos sombreados permanecen en la instantánea de la sesión, así que ↑ sigue recorriendo cada mensaje enviado antes y después de un checkpoint.
- **Los resúmenes se unen al historial** — el texto del resumen de cada checkpoint entra en la recuperación ↑ y la búsqueda `Ctrl+R` como una entrada `[compacted] …` (conmutador: `includeCompactionSummaries`), de modo que el contexto que el modelo ya no ve literalmente queda a una pulsación.
- **Aviso de compactación** — cuando un checkpoint aterriza con la página abierta, un snackbar transitorio lo anuncia (el momento "Auto-compacting conversation…" de Claude Code) con el fragmento del resumen y una acción de un clic **Fill `/compact`** (`showCompactionNotice`, `compactCommandText`); el relleno cae en el borrador ordinario, y solo tu Enter lo envía.
- **Conteos de búsqueda** — el panel `Ctrl+R` ahora muestra una línea de estado en vivo `N entries` / `N matches`, y las entradas largas se limitan a dos líneas.

> La compactación en sí (umbrales, modelo de resumen, `/compact`) pertenece a los plugins de compactación del núcleo del harness — este plugin solo observa los marcadores de checkpoint que la instantánea del cliente ya expone, así que funciona sin ningún cambio de agent-loop ni petición al modelo.

## Permissions & data

- **Permisos**: el plugin declara `browser:local-storage` en su manifest de workshop — nada más. Sin red, sin subprocesos, sin eventos de sesión.
- **Datos**: cuatro claves de `localStorage` del navegador — `dsh.composer-history.v1` (historial de mensajes enviados), `dsh.composer-history.snippets.v1` (textos de fragmentos + etiquetas + contadores de uso), `dsh.composer-history.templates.v1` (textos de plantillas) y `dsh.composer-history.insights.v1` (textos de prompt deduplicados + contadores de uso por sesión). Todas acotadas, solo del mismo origen, nunca se suben; las cargas corruptas se reinician silenciosamente.
- **Visible para el modelo ⟺ pulsas Enter**: el texto recuperado, las cargas de fragmentos, los rellenos de plantillas y el relleno de `/compact` caen en el borrador ordinario del compositor. Nada llega al modelo hasta que pulsas Enter.

## Security boundaries

- **Solo UI, nunca aplicación.** El plugin solo edita el borrador del compositor; el sandbox, la aprobación y el sistema de sesiones siguen siendo las autoridades de aplicación, y ningún comando ni herramienta se reclama o se elude jamás.
- **Ningún contenido sale del navegador.** El historial, los fragmentos, las plantillas y la información viven en `localStorage`; nada se sube y no se hace ninguna petición al modelo ni llamada de red.
- **Fallo estrepitoso.** Los valores de enum no válidos detienen todo el arranque de dsh; un acorde de búsqueda mal formado hace fallar el fiber del navegador — la mala configuración nunca se degrada en silencio.
- **Todo acotado.** `maxHistory`, `maxPersisted` y `maxSnippets` limitan las entradas retenidas; las cargas corruptas o ajenas se reinician silenciosamente.
- **Cero efectos secundarios al pasar.** El plugin solo intercepta en la fase de entrada `plain` y cede ante el menú slash, las ventanas de comandos, la composición IME, las selecciones de texto y las combinaciones de modificadores.

## Known limitations

- **Líneas lógicas vs visuales.** El `logical` por defecto se basa en `\n` (un mensaje largo con ajuste automático cuenta como una línea); `visual` mide los ajustes reales mediante un mirror oculto (búsqueda binaria O(líneas·log n) por comprobación de borde, memorizado por borrador/ancho). La medición del mirror necesita un motor de layout real — la matemática pura de spans está cubierta por pruebas unitarias.
- **El historial persistente es por navegador.** El almacén vive en el `localStorage` de un origen; nunca se sincroniza entre navegadores o máquinas. Las cargas corruptas se reinician silenciosamente.
- **La pila de deshacer incluye transacciones de recuperación.** Cada relleno/restauración es una transacción `setDraft` en el registro de deshacer de la máquina de entrada; Ctrl+Z retrocede por las recuperaciones. La corrección de precisión necesita la exposición del edit-range aguas arriba.
- Recuperar una entrada `/xxx` y pulsar Enter sigue la ruta normal de claim/adjudication del comando (esperado, y Enter nunca se intercepta).
- Los menús/ventanas y las fases que no son `plain` siempre ganan; un envío confirmado y los cambios de sesión restablecen a IDLE.
- Los chips de referencia (marcadores U+FFFC) viajan con el texto de borrador recuperado/restaurado.
- `historyScope: 'workspace'` lee los ensamblados en vivo de otras sesiones listadas; las sesiones cuyo ensamblado no se ha materializado no aportan nada todavía.
- El panel de búsqueda es DOM plano (sin dependencia de React); renderiza todas las coincidencias hasta el límite `maxHistory`.
- **La conciencia de compactación es observacional.** Los puntos de control que aterrizaron antes de la instalación (o antes de un cambio de sesión) nunca disparan un aviso; un punto de control cuyo evento de resumen cayó fuera de la ventana cargada no aporta ninguna entrada `[compacted] …` (`summary: null`).
- La acción "Compact now" del aviso solo *rellena* el texto de comando configurado en el borrador — el envío sigue siendo tu Enter.
- **Los fragmentos, las plantillas y la información son locales del navegador.** Los nombres usan kebab-case (1..64 caracteres); las etiquetas se limitan a 8 × 32 caracteres. Las variables de plantilla se resuelven desde la sesión en vivo; `{{draft}}` es el borrador en el momento de elegir.

## Development

```sh
pnpm install           # node ^22.19 || >=24
pnpm run build         # tsc build + tsdown bundle (lib/)
pnpm run typecheck     # tsc --noEmit (src + tests)
pnpm test              # vitest run
pnpm run test:watch    # vitest watch
pnpm run test:coverage # vitest run --coverage
pnpm run check:readmes # README consistency gate
pnpm run verify:pack   # pack-surface check
```

## Topics

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `compaction` · `sliding-context` · `typescript`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — creador y mantenedor: recuperación por flechas con prioridad de borde, historial persistente, búsqueda inversa, conciencia del contexto deslizante, biblioteca de fragmentos, plantillas de prompt, información de reutilización y los manifests `dsh.bundle` / `dshWorkshop`.

## PerryLink DSH Plugin Family

Este proyecto es uno de los [33 complementos de DeepSeek Harness](https://github.com/PerryLink) mantenidos por [PerryLink](https://github.com/PerryLink). Si este te ayuda, probablemente los demás también:

| Plugin | One-liner |
|---|---|
| **[dsh-dsh-auto-review](https://github.com/PerryLink/dsh-dsh-auto-review)** | Auto-revisión de segundo modelo en la cadena de aprobación, con cierre en fallo por defecto | |
| **[dsh-dsh-background-agents](https://github.com/PerryLink/dsh-dsh-background-agents)** | Agentes hijos en segundo plano durables con barra lateral de UI web, mensajería e interrupción | |
| **[dsh-dsh-budget](https://github.com/PerryLink/dsh-dsh-budget)** | Gobernanza de costes para DeepSeek Harness: presupuestos, carbono y latencia en un panel. | |
| **[dsh-dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-dsh-checkpoint-rewind)** | Equivalente a /rewind de Claude Code: instantáneas, bifurcaciones de sesión, restauración de un solo uso | |
| **[dsh-dsh-claude-move](https://github.com/PerryLink/dsh-dsh-claude-move)** | Migra sesiones, memoria, habilidades y CLAUDE.md de Claude Code a DSH | |
| **[dsh-dsh-click](https://github.com/PerryLink/dsh-dsh-click)** | Control de escritorio nativo multiplataforma para DeepSeek Harness — Windows primero. | |
| **[dsh-dsh-data-quality](https://github.com/PerryLink/dsh-dsh-data-quality)** | Comprobaciones de calidad de datasets y verificación de citas (el puente numérico opcional consumido aquí) | |
| **[dsh-dsh-defend](https://github.com/PerryLink/dsh-dsh-defend)** | Defensa contra inyección de prompts, jailbreak y fuga de secretos para DeepSeek Harness. | |
| **[dsh-dsh-doublecheck](https://github.com/PerryLink/dsh-dsh-doublecheck)** | Guardián de disciplina de ingeniería: interrogatorio de requisitos, puertas de pruebas, revisión adversaria | |
| **[dsh-dsh-draw](https://github.com/PerryLink/dsh-dsh-draw)** | Enrutamiento unificado de generación de imágenes estáticas para DeepSeek Harness. | |
| **[dsh-dsh-fast](https://github.com/PerryLink/dsh-dsh-fast)** | Diagnóstico de rendimiento de solo lectura para DeepSeek Harness. | |
| **[dsh-dsh-fund-research](https://github.com/PerryLink/dsh-dsh-fund-research)** | Informes de investigación deterministas para fondos mutuos públicos chinos | |
| **[dsh-dsh-github](https://github.com/PerryLink/dsh-dsh-github)** | Integración de PR/issues de GitHub para DSH, cada escritura controlada por aprobación | |
| **[dsh-dsh-industry-research](https://github.com/PerryLink/dsh-dsh-industry-research)** | Orquestación de investigación sectorial que sella sus entregables mediante el `ctx.researchReport.assemble` de este plugin | |
| **[dsh-dsh-library](https://github.com/PerryLink/dsh-dsh-library)** | Base de conocimiento documental local para DeepSeek Harness. | |
| **[dsh-dsh-local-ai](https://github.com/PerryLink/dsh-dsh-local-ai)** | Integración de modelos locales (Ollama) para DeepSeek Harness. | |
| **[dsh-dsh-lsp-actions](https://github.com/PerryLink/dsh-dsh-lsp-actions)** | Diagnósticos, formato, autocompletado, acciones de código y renombrado LSP sobre servidores de lenguaje | |
| **[dsh-dsh-mask](https://github.com/PerryLink/dsh-dsh-mask)** | Middleware de enmascaramiento de PII: anonimiza en el límite del modelo, restaura en la capa de visualización | |
| **[dsh-dsh-mcp-panel](https://github.com/PerryLink/dsh-dsh-mcp-panel)** | Panel de tiempo de ejecución MCP de solo lectura: comando /mcp + pestaña Settings con estado, herramientas y errores | |
| **[dsh-dsh-memento](https://github.com/PerryLink/dsh-dsh-memento)** | Memoria entre sesiones controlada por aprobación: costura ctx.memory + SQLite + herramienta de memoria | |
| **[dsh-dsh-observe](https://github.com/PerryLink/dsh-dsh-observe)** | Exportador de observabilidad OpenTelemetry y Langfuse para DeepSeek Harness. | |
| **[dsh-dsh-output-styles](https://github.com/PerryLink/dsh-dsh-output-styles)** | Cambio de estilo en tiempo de ejecución equivalente a outputStyles de Claude Code | |
| **[dsh-dsh-permission-rules](https://github.com/PerryLink/dsh-dsh-permission-rules)** | Reglas de permisos declarativas allow/deny/ask estilo Claude Code con auditoría | |
| **[dsh-dsh-plugin-guide](https://github.com/PerryLink/dsh-dsh-plugin-guide)** | Base de conocimiento de desarrollo de plugins como habilidad de agente bajo demanda | |
| **[dsh-dsh-research-report](https://github.com/PerryLink/dsh-dsh-research-report)** | Motor de informes de investigación verificables con evidencia direccionada por contenido | |
| **[dsh-dsh-score](https://github.com/PerryLink/dsh-dsh-score)** | Puntuación de calidad multidimensional para plugins de DeepSeek Harness. | |
| **[dsh-dsh-session-pin](https://github.com/PerryLink/dsh-dsh-session-pin)** | Fija sesiones en la barra lateral web con orden durable | |
| **[dsh-dsh-session-sync](https://github.com/PerryLink/dsh-dsh-session-sync)** | Sincronización de sesiones entre dispositivos para DeepSeek Harness — un espejo git dedicado de tu almacén de sesiones. | |
| **[dsh-dsh-skill-pack-security](https://github.com/PerryLink/dsh-dsh-skill-pack-security)** | Paquete de habilidades de auditoría de seguridad: escaneo de secretos, revisión de dependencias y cadena de suministro | |
| **[dsh-dsh-talk](https://github.com/PerryLink/dsh-dsh-talk)** | Bucle de sesión con voz para DeepSeek Harness: háblale y escucha su respuesta. | |
| **[dsh-dsh-test-drive](https://github.com/PerryLink/dsh-dsh-test-drive)** | Pruebas de instalación y humo aisladas para plugins de DeepSeek Harness. | |
| **[dsh-dsh-translate](https://github.com/PerryLink/dsh-dsh-translate)** | Traducción de parámetros entre proveedores y reparación determinista de JSON para DeepSeek Harness. | |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors

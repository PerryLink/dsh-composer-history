<div align="center">

# ⌨️ dsh-composer-history

> Release stamp: `0.8.8` (2026-10-04).
- **Canal 1024 store**: `npm i -g dsh1024` una vez, luego `dsh1024 plugin --profile web add dsh-composer-history` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

**Historial de entrada estilo terminal para el compositor de la Web GUI de DeepSeek Harness.**

*Pulsa ↑ como en una terminal — y conserva tu borrador a medio escribir.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-composer-history)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-composer-history.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-top-rated.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-composer-history/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-composer-history/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-composer-history?label=version)](https://github.com/PerryLink/dsh-composer-history/releases)
[![npm version](https://img.shields.io/npm/v/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)
[![npm downloads](https://img.shields.io/npm/dm/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-composer-history?metric=downloads&lang=es)](https://dshfind.com/es/plugins/PerryLink/dsh-composer-history?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-composer-history
```


</div>

---


**📖 Base de conocimiento del ecosistema** — datos medidos, no marketing: [guía de desarrollo · datos de selección · criterios de mantenimiento](https://perrylink.github.io/dsh-plugin-guide/).

<!-- star-cta -->
## Install & uninstall

El paquete npm incluye los bundles ya compilados; un checkout del código fuente debe compilarse primero (`pnpm run build`) — la verificación del paquete de cliente se niega a arrancar con un bundle sin compilar.

- **canal git** (último `main`): `dsh plugin --profile web add github:PerryLink/dsh-composer-history`.
- **canal npm** (versiones publicadas): `dsh plugin --profile web add dsh-composer-history`.
- **canal tarball**: ejecuta `pnpm pack` en este repositorio y luego `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-composer-history` (o elimina la fila del patch del perfil).

## ⭐ 如果它帮到了你

Este plugin forma parte de la [familia de plugins DSH](https://github.com/PerryLink) (más de 40, todos Apache-2.0). Si te resulta útil, **dale una estrella**: no desbloquea nada, pero ayuda a que la siguiente persona lo encuentre antes.

*English:* part of a 40+ plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.

## What is dsh-composer-history?

Historial de entrada estilo terminal para el compositor de la Web GUI de DeepSeek Harness.

Pulsa ↑ como en una terminal — y conserva tu borrador a medio escribir.

![Demostración de terminal de dsh-composer-history: dsh-composer-history — /save and /load, plus arrow recall and Ctrl+R search](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-hero.png)

![Animated terminal demo of dsh-composer-history](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-demo.gif)

*La misma ejecución, animada.*

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-alpha.1` (verificado el 2026-09-25: doble typecheck + 294 pruebas; client peers `>=0.1.2-rc.1 <0.2.0 \|\| >=0.1.5-alpha.1 <0.2.0 \|\| >=0.1.6-0 <0.2.0 \|\| >=0.1.7-0 <0.2.0`). En esta línea la costura de ajustes es el propio formulario de `Config` vivo de la entrada de perfil: la familia eliminada `ctx.settings.register` / `SettingsProvider` y el servicio de cliente `ctx.settingsScope` desaparecen, así que cada ajuste viaja por `ctx.configForms`. En las líneas 0.1.6+ `SessionListState.current` ya no existe: la sesión actual se deriva de los hechos de retención, así que la inyección de historial y la biblioteca de fragmentos siguen funcionando. |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | Solo Web GUI (plugin de cliente; almacenamiento local del navegador; sin red, sin código nativo) |
| Model | Cualquiera (sin peticiones al modelo — comportamiento puramente de UI) |

La mitad de navegador se apoya en los paquetes de cliente publicados (`dsh-client-ui-conversation`, `dsh-client-ui-input-trigger`, `dsh-client-ui-settings`) y en el `Context` de cordis; ya no depende del paquete eliminado `dsh-client-runtime`, por lo que la superficie de cliente también encaja con hosts `0.1.2-rc.1`.
La intercepción se ancla en el DOM del compositor web: la superficie contenteditable `div[data-composer-input]` dentro de `[data-input-scroll]` (el compositor Lexical incluido desde 0.1.2-alpha.5 / 0.1.2-rc.1), manteniendo además el compositor textarea heredado dentro de `[data-input-scroll]` (líneas hasta 0.1.1-rc.2); otros textareas pasan de largo. El smoke de comportamiento web en jsdom del flujo de compatibilidad reafirma esta cara identidad/texto/cursor contra el paquete empaquetado.
0.1.2-rc.1 (adaptado el 2026-09-04): el sobre de sesión conserva su campo ignorable solo para compatibilidad de lectura de logs almacenados - Session.append aún no puede estamparlo, por lo que el comportamiento de la puerta no cambia. Verificado el 2026-09-06 contra el checkout master de dsh-v0.1.7-alpha.1 (cadena completa de puertas + smoke de instalación de perfil).
0.1.5-rc.1 (adaptado el 2026-09-10): los pines de dependencias pasan a la línea publicada 0.1.5-rc.1; ningún cambio de costura afecta el comportamiento de este plugin.
0.1.5-rc.2 (adaptado el 2026-09-11): los pines de dependencias pasan a la línea publicada 0.1.5-rc.2; ningún cambio de costura afecta el comportamiento de este plugin.
0.1.7-alpha.1 (adaptado el 2026-10-04): la costura de ajustes se reemplaza en ambas mitades. La mitad de host ya no registra un espacio de nombres `composer-history` mediante el eliminado `ctx.settings.register(ns, schema, { base })`: en esta línea la superficie de ajustes durable de un plugin ES su propio `Config` vivo. Cada ajuste se declara `.volatile()`, el id de la entrada de perfil (`composer-history`, el id de fila del bundle patch) nombra el formulario, y `apply` reclama la política de formulario generado (`ctx.settings.configure({ auto: true }, ctx.fiber)`, propiedad del effect para que una recarga se vuelva a registrar limpiamente). La mitad de navegador lee la misma entrada mediante `ctx.configForms.get('composer-history')` en lugar del eliminado `ctx.settingsScope.bind({ namespace })`; la forma de snapshot/suscripción no cambia, así que el cableado se reinstala en cada cambio confirmado. La superficie editable se conserva, no se amplía: todos los campos que exponía el antiguo espacio de nombres son volatile y ningún campo nuevo pasó a ser editable. Una sección existente de `settings.yaml` llamada `composer-history` la migra el propio host a la entrada de perfil del mismo id.

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
dsh plugin --profile web add github:PerryLink/dsh-composer-history
```

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add github:PerryLink/dsh-composer-history

# or from npm (published releases)
dsh plugin --profile web add dsh-composer-history

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: composer-history'
```

## Configuration

Todos los ajustes son campos Schemastery `Config` (modificables desde cordis.yml y el formulario de ajustes de la entrada; el patch de perfil es el documento persistido). Una sustitución dirigida por id reemplaza toda la fila — vuelve a indicar cada clave que necesites. Los valores de enum no válidos detienen todo el arranque de dsh de forma estrepitosa, y una edición del formulario de ajustes la valida el host antes de persistirla.

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
| `composer-history` | settings form | El formulario de `Config` vivo de la propia entrada de perfil — lleva la configuración resuelta (base de cordis.yml + sustituciones del perfil) a la mitad del navegador |

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

- **La recuperación sobrevive a la compactación** — los turnos sombreados permanecen en la conversación finalizada que publica la vista Chat, así que ↑ sigue recorriendo cada mensaje enviado antes y después de un checkpoint.
- **Los resúmenes se unen al historial** — el texto del resumen de cada checkpoint entra en la recuperación ↑ y la búsqueda `Ctrl+R` como una entrada `[compacted] …` (conmutador: `includeCompactionSummaries`), de modo que el contexto que el modelo ya no ve literalmente queda a una pulsación.
- **Aviso de compactación** — cuando un checkpoint aterriza con la página abierta, un snackbar transitorio lo anuncia (el momento "Auto-compacting conversation…" de Claude Code) con el fragmento del resumen y una acción de un clic **Fill `/compact`** (`showCompactionNotice`, `compactCommandText`); el relleno cae en el borrador ordinario, y solo tu Enter lo envía.
- **Conteos de búsqueda** — el panel `Ctrl+R` ahora muestra una línea de estado en vivo `N entries` / `N matches`, y las entradas largas se limitan a dos líneas.

> La compactación en sí (umbrales, modelo de resumen, `/compact`) pertenece a los plugins de compactación del núcleo del harness — este plugin solo observa los marcadores de checkpoint que ya publica la proyección de conversación de la vista Chat (`uiConversation.binding(id).target('chat').legacy.nodes`), así que funciona sin ningún cambio de agent-loop ni petición al modelo.

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

- **Cara DOM del compositor.** La intercepción se ancla en DOM privado del host: el `div[data-composer-input]` contenteditable dentro de `[data-input-scroll]` (host 0.1.2-alpha.5 / 0.1.2-rc.1 y posteriores); el compositor textarea heredado dentro de `[data-input-scroll]` (líneas hasta 0.1.1-rc.2) sigue coincidiendo. Esta forma no es una API publicada (la propuesta upstream C3 registra que los plugins solo pueden adivinar el DOM del host), así que un cambio futuro del DOM del host puede romper la intercepción en silencio — el smoke jsdom del flujo de compatibilidad reafirma la cara contra el paquete empaquetado.
- **Líneas lógicas vs visuales.** El `logical` por defecto se basa en `\n` (un mensaje largo con ajuste automático cuenta como una línea); `visual` mide los ajustes reales mediante un mirror oculto que copia la caja computada de la superficie contenteditable (búsqueda binaria O(líneas·log n) por comprobación de borde, memorizado por borrador/ancho). La medición del mirror necesita un motor de layout real — la matemática pura de spans está cubierta por pruebas unitarias, y los spans medidos sobre el compositor Lexical siguen siendo de mejor esfuerzo (`logical` sigue siendo el valor por defecto).
- **El historial persistente es por navegador.** El almacén vive en el `localStorage` de un origen; nunca se sincroniza entre navegadores o máquinas. Las cargas corruptas se reinician silenciosamente.
- **La pila de deshacer incluye transacciones de recuperación.** Cada relleno/restauración es una transacción `setDraft` en el registro de deshacer de la máquina de entrada; Ctrl+Z retrocede por las recuperaciones. La corrección de precisión necesita la exposición del edit-range aguas arriba.
- Recuperar una entrada `/xxx` y pulsar Enter sigue la ruta normal de claim/adjudication del comando (esperado, y Enter nunca se intercepta).
- Los menús/ventanas y las fases que no son `plain` siempre ganan; un envío confirmado y los cambios de sesión restablecen a IDLE.
- Los chips de referencia (marcadores U+FFFC) viajan con el texto de borrador recuperado/restaurado.
- `historyScope: 'workspace'` lee los objetivos Chat de otras sesiones listadas; una sesión cuya vista Chat no se ha activado en esta página no aporta nada todavía.
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

## Familia de plugins DSH de PerryLink

Este proyecto es uno de los **87 plugins activamente mantenidos** de DeepSeek Harness de [PerryLink](https://github.com/PerryLink). El registro familiar tiene **95** plugins — **5 congelados**, **3 retirados** — y permanece plegado abajo para que cada README conserve una primera pantalla corta. Expándelo para ver cada fila, con el motivo en la columna Estado.

<details>
<summary>Expandir los 95 plugins</summary>

| Plugin | Una línea | Estado |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 CONGELADO — ver el README del repositorio |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRADO — ver el README del repositorio |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors

### Instalar desde el mercado de DSH Desktop

Todos los plugins de PerryLink pueden explorarse en el mercado integrado de DSH Desktop: **Market → Sources → add source → pegar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ seleccionarlo**. La instalación sigue pasando por la verificación de identidad npm del mercado y tu confirmación.

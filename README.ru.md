# ⌨️ dsh-composer-history

**История ввода в стиле терминала для композера DeepSeek Harness Web GUI.**

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md)

<p align="center">
  <a href="https://github.com/topics/dsh"><img alt="topic: dsh" src="https://img.shields.io/badge/topic-dsh-8A2BE2"></a>
  <a href="https://github.com/topics/dsh-plugin"><img alt="topic: dsh-plugin" src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2"></a>
  <a href="https://github.com/topics/deepseek-harness"><img alt="topic: deepseek-harness" src="https://img.shields.io/badge/topic-deepseek--harness-8A2BE2"></a>
  <br>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <a href="./package.json"><img alt="version" src="https://img.shields.io/badge/version-0.2.0-66ccff"></a>
  <a href="./package.json"><img alt="node" src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933"></a>
  <img alt="tests" src="https://img.shields.io/badge/tests-168%2F168-brightgreen">
  <img alt="harness client" src="https://img.shields.io/badge/harness%20client-types%20rc.6-orange">
</p>

Нажмите **↑**, как в терминале, — но недописанный промпт останется в безопасности. `dsh-composer-history` переносит модель клавиш-стрелок Claude Code «сначала край, потом история» в веб-композер dsh и идёт дальше: когда вы возвращаетесь к самой свежей записи (или жмёте `Esc`), сохранённый черновик и позиция курсора **восстанавливаются точно**, а не очищаются. Вдобавок: отправленные сообщения **сохраняются локально в браузере**, так что история переживает перезагрузку и распространяется между сессиями, `Ctrl+R` открывает **обратный поиск**, а каждая клавиша и каждый параметр настраивается.

> Чистое UI-поведение: без событий сессии, без правок agent-loop, без запросов к модели. Вызванный текст попадает только в обычный черновик композера и достигает модели, лишь когда *вы* нажмёте Enter. Сохранённая история — это локальный для браузера текст (см. [Приватность](#приватность)).

## ✨ Особенности

- 🎯 **Сначала края** — голые ↑/↓ сначала двигают курсор. Вызов истории срабатывает только когда курсор на первой/последней строке черновика.
- 💾 **Сохранение черновика** — первый вызов сохраняет `{draft, caret}`; возврат к самой свежей записи (или `Esc`) восстанавливает оба точно. Claude Code здесь очищает — мы восстанавливаем.
- 🛡️ **Защита от расхождения** — отредактировали вызванную запись — просмотр немедленно завершается, правка становится новым черновиком.
- 🔄 **Живая история** — извлекается из снимка сессии на каждое нажатие: сообщения `kind === 'user'`, текстовые блоки склеиваются, пустые пропускаются, соседние дубли сливаются, самая свежая запись в конце. Новые отправленные сообщения попадают автоматически.
- 💿 **Сохранённая история** — каждое отправленное сообщение добавляется в ограниченное локальное хранилище браузера (`dsh.composer-history.v1`), так что вызов работает после перезагрузки страницы и между сессиями. Отключение — `persistHistory: false`.
- 🗂️ **Область воркспейса** — `historyScope: 'workspace'` ставит сообщения других перечисленных сессий перед сообщениями текущей сессии.
- 🔍 **Обратный поиск** — `Ctrl+R` (настраивается) открывает панель запроса под композером: ввод фильтрует, ↑/↓ выбирают, Enter заполняет, Esc отменяет.
- 🎛️ **Каждая клавиша настраивается** — `upKey`/`downKey`/`escapeKey`/`searchKeys` живут в схеме Config, а не в коде.
- ⚙️ **Интеграция с настройками** — хостовая половина регистрирует namespace настроек `composer-history` (config из cordis.yml становится `base` композиции); пользовательские переопределения из документа настроек доходят до браузера. Без сервиса настроек плагин продолжает работать ровно как скомпонован.
- 🚦 **Полное гейтирование** — перехват только в фазе ввода `plain`; уступает slash-меню, командным попапам, IME-композиции, выделению текста и комбинациям alt/meta/shift. Пути пропуска не имеют побочных эффектов.
- 📐 **Два режима краёв** — `logical` (по переносам строк, по умолчанию) или `visual` (скрытый mirror-div измеряет реальные перенесённые строки).

## 🎬 Как это ощущается

```text
$ you type a half-finished prompt and press ↑
        └─ draft is stashed, newest history entry fills the composer
$ ↑ ↑ … walk to older entries        $ ↓ ↓ … walk back to the newest
        └─ at the oldest: hold (no-op)         └─ one more ↓: your draft is back,
                                                  caret exactly where it was
$ press Esc at any time → instant restore, browsing ends
$ press Ctrl+R → type a fragment → ↑/↓ → Enter → the match fills the composer
```

## 🚀 Быстрый старт

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # all green: 168/168
pnpm run test:coverage                                  # per-module coverage report
pnpm run check:readmes && pnpm run verify:pack          # doc consistency + pack surface
```

Затем зарегистрируйте плагин в профиле (см. [Установка](#установка)) и запустите `dsh --profile <your-profile> --port 3080`.

## 📦 Установка

**Сначала соберите, потом запускайте** — проверка клиентских пакетов отказывается загружаться на несобранном бандле.

> Из npm: `pnpm add dsh-composer-history` (или npm/yarn) поставляется с собранными бандлами — пропустите шаги 1 и 5.

1. Соберите плагин (см. выше).
2. Зарегистрируйте строку в `$DSH_HOME/profiles/<your-profile>/cordis.patch.yml`. В поле `name` указывайте **голое имя пакета**: id строки графа браузера — это ровно та строка, а клиентский бандл зашивает тот же id при сборке.

   ```yaml
   # appended after the bundle layers
   - insert:
       - id: composer-history
         name: dsh-composer-history
         config:
           recallWithDraft: save     # 'save' | 'gate'
           restoreOnEscape: true
           edgeMode: logical         # 'logical' | 'visual'
           enableCtrlAlias: true
           restoreCaret: true
           upKey: ArrowUp
           downKey: ArrowDown
           escapeKey: Escape
           maxHistory: 500           # 0 = unlimited
           includeKinds: [user]      # optionally add 'steering'
           historyScope: session     # 'session' | 'workspace'
           persistHistory: true
           maxPersisted: 200         # 0 = unlimited
           enableSearch: true
           searchKeys: [Ctrl+R]
           searchCaseSensitive: false
   ```

   Блок `config:` валидируется хост-Loader той же схемой и (когда сервис настроек присутствует) попадает в браузер как слой `base` настроек — так что эти значения действительно доходят до браузерной половины, а не только до валидатора.

3. Голые строки обязаны также присутствовать в манифесте-резолвере профиля — хост-Loader разрешает их из `node_modules` каталога профиля:

   `$DSH_HOME/profiles/<your-profile>/package.json`:

   ```json
   {
     "name": "dsh-profile-<your-profile>",
     "private": true,
     "dependencies": {
       "dsh-composer-history": "file:D:/deepseek-harness/Project/Plugins/dsh-composer-history"
     },
     "dsh": {
       "profile": {
         "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app"]
       }
     }
   }
   ```

4. `pnpm install` в каталоге профиля, затем:

   ```sh
   dsh --profile <your-profile> --port 3080
   ```

5. Для установки из tarball (любой менеджер пакетов): выполните `pnpm pack` в этом каталоге, затем укажите tarball в `package.json` профиля. `pnpm run verify:pack` проверяет pack-поверхность перед публикацией.

## ⚙️ Конфигурация

Все настраиваемые параметры живут в схеме Schemastery `Config` (никаких захардкоженных ручек). Недопустимые значения перечислений **громко роняют весь запуск dsh** — хост-Loader валидирует ваш блок cordis.yml той же схемой, а секция настроек повторно валидируется в браузере перед использованием.

| Поле | Тип | По умолчанию | Смысл |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`: непустой черновик сохраняется перед вызовом; `gate`: вызов только при пустом черновике (гейт в духе Claude/Codex) |
| `restoreOnEscape` | `boolean` | `true` | `Esc` во время просмотра восстанавливает сохранённый черновик |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | определение края по строкам `\n` или по измеренным перенесённым строкам |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ действует как голые стрелки |
| `restoreCaret` | `boolean` | `true` | возврат вниз/`Esc` также восстанавливает сохранённый курсор |
| `upKey` | `string` | `'ArrowUp'` | `KeyboardEvent.key`, который вызывает вверх; `''` отключает |
| `downKey` | `string` | `'ArrowDown'` | `KeyboardEvent.key`, который идёт к более новым/восстанавливает; `''` отключает |
| `escapeKey` | `string` | `'Escape'` | `KeyboardEvent.key`, который выходит из просмотра; `''` отключает |
| `maxHistory` | `number` | `500` | максимум вызванных записей (сохраняются самые свежие); `0` = без ограничения |
| `includeKinds` | `string[]` | `['user']` | виды узлов беседы, допускаемые в историю (добавьте `'steering'`, чтобы включить steer-сообщения) |
| `historyScope` | `'session' \| 'workspace'` | `'session'` | `'workspace'` ставит пользовательские сообщения других перечисленных сессий перед сообщениями текущей сессии |
| `persistHistory` | `boolean` | `true` | добавляет отправленные сообщения в локальное хранилище браузера (см. [Приватность](#приватность)) |
| `maxPersisted` | `number` | `200` | максимум хранимых записей; `0` = без ограничения |
| `enableSearch` | `boolean` | `false` | включает оверлей обратного поиска `Ctrl+R` |
| `searchKeys` | `string[]` | `['Ctrl+R']` | спецификации аккордов, открывающих поиск (модификаторы `Ctrl`/`Alt`/`Meta`/`Shift` + имя клавиши); некорректная спецификация громко роняет браузерный fiber |
| `searchCaseSensitive` | `boolean` | `false` | различает ли поиск регистр букв |

## 🎹 Раскладка клавиш

| Клавиша | Состояние | Поведение |
| --- | --- | --- |
| ↑ | IDLE, курсор на первой строке | сохранить {черновик, курсор}, вставить самую свежую запись, курсор в конец (нет истории → пропуск) |
| ↑ | BROWSING, курсор на первой строке | более старая запись; на самой старой — hold (перехват, без изменений) |
| ↑ | курсор не на первой строке | полностью отпускается (браузер двигает курсор) |
| ↓ | IDLE | всегда отпускается (обычное движение курсора) |
| ↓ | BROWSING, курсор на последней строке | более новая запись; на самой свежей → восстановить `savedDraft` + `savedCaret` → IDLE |
| ↓ | курсор не на последней строке | полностью отпускается |
| Esc | BROWSING (`restoreOnEscape: true`) | восстановить `savedDraft` + `savedCaret` → IDLE, перехват |
| Esc | иначе | отпускается (семантика Esc меню/попапов не тронута) |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | как голые стрелки |
| `searchKeys` chord | композер в фокусе, фаза `plain`, нет меню/выделения/IME | открыть обратный поиск; просмотр завершается, показанный текст становится черновиком |
| Shift/Alt/Meta+arrows, IME, selection | любое | всегда отпускается |

`upKey`/`downKey`/`escapeKey`/`searchKeys` переименовывают клавиши выше; политика модификаторов (и точное совпадение модификаторов поискового аккорда) не меняется. Внутри оверлея поиска: ↑/↓ двигают выбор совпадения, Enter заполняет, Esc отменяет, клик выбирает, нажатие снаружи отменяет.

## 🔍 Обратный поиск

- **Открытие**: аккорд `searchKeys`, пока композер в фокусе и ввод в фазе `plain` (здесь `Ctrl+R` также останавливает перезагрузку страницы браузера — клавиша поглощается только внутри композера).
- **Фильтр**: поиск подстроки по объединённой истории (текущая сессия + сохранённые + записи воркспейса); учёт регистра — по `searchCaseSensitive`.
- **Выбор**: Enter заполняет черновик и ставит курсор в конец — тот же единственный путь записи `setDraft`, что и при обычном вызове. Вызванный текст достигает модели, только если вы после этого нажмёте Enter.
- **Отмена**: Esc или нажатие вне панели; черновик не тронут.

## 🔒 Приватность

`persistHistory: true` (по умолчанию) записывает отправленные сообщения в `localStorage` этого браузера под ключом `dsh.composer-history.v1`, ограниченно `maxPersisted`, никуда не загружается и читается только страницами того же origin. Отключите через `persistHistory: false` — тогда вызов использует только живую проекцию сессии (и область воркспейса), как в поведении v1. Повреждённые или чужеродные данные молча сбрасываются.

## ✅ Проверка

1. Откройте веб-интерфейс и убедитесь, что `window.__DSH_BOOT__` содержит строку плагина (`id: "dsh-composer-history"`, `url: "/plugins/dsh-composer-history/client.js?rev=…"`).
2. Запросите `/plugins/dsh-composer-history/client.js` — ожидается `200` (`text/javascript`).
3. Ручной чек-лист:
   - Пустой композер: ↑ вызывает последнее сообщение; ещё ↑ — к более старым; ↓↓ — назад к самой свежей; ещё один ↓ — возврат к пустому.
   - Недописанный черновик: ↑ сохраняет и вызывает; ↓↓ до низа восстанавливает черновик **включая курсор**; `Esc` — мгновенное восстановление.
   - Многострочный черновик: в середине ↑/↓ только двигают курсор; вызов срабатывает лишь с первой/последней строки.
   - Вызов записи `/xxx` и затем Enter арбитражирует команду обычным образом (ожидаемо).
   - При открытом slash-меню ↑/↓ только подсвечивают пункты меню.
   - Во время генерации модели (фаза ≠ `plain`) стрелки никогда не вызывают историю.
   - Shift+↑/↓-выделение, IME-композиция, Ctrl+Z/Y (undo/redo) не затронуты.
   - `Ctrl+R` открывает панель поиска; ввод фильтрует; ↑/↓ + Enter заполняют; Esc оставляет черновик нетронутым.
   - После перезагрузки страницы ↑ вызывает сообщения, отправленные до перезагрузки (при включённом `persistHistory`).
   - При `historyScope: 'workspace'` записи из других перечисленных сессий идут перед записями текущей сессии.
4. Гейты: `pnpm run typecheck`, `pnpm run build`, `pnpm run test` — всё зелёное, включая смоук-тест, выполняющий **собранный бандл** в jsdom через настоящее рукопожатие `__ModuleLoader__`; плюс `pnpm run test:coverage`, `pnpm run check:readmes`, `pnpm run verify:pack`.

## 🔬 Базовый уровень совместимости (замерено на этой машине, 2026-08-14)

- **Типы**: devDependencies фиксируют опубликованные клиентские пакеты **0.1.0-rc.6** из npm (`dsh-client-runtime`, `dsh-client-ui-conversation`, `dsh-client-ui-input-trigger`, `dsh-client-ui-settings`, `dsh-settings`, `dsh-api-remotes`); `typecheck` больше не зависит от локального чекаута. Runtime-смоук выполняется против чекаута, чьи клиентские пакеты — **0.1.0-rc.5**; `@deepseek-ai/cordis` **4.0.1**; `@deepseek-ai/schemastery` **3.18.1**.
- Фазы `InputState` (прочитано из `packages/client/ui-conversation/src/client/input/contract.ts`): `'plain' | 'adjudicating' | 'claimed' | 'submitting'`, плюс `draft`/`draftRev`. Единственный публичный путь записи черновика — `ctx.conversation.input.for(actx).setDraft(text)`; учитывающий `editRange` интерфейс `ComposerKeyboard` приватный для InputBar (см. `docs/upstream-proposals.md` C1).
- **Метаданные клиентских плагинов — вложенное поле `dsh.client`** (`resolveMeta` в `packages/client/modules` читает `pkg.dsh.client`): неверное расположение **молча** выбрасывает пакет из графа загрузки — без ошибок.
- **Вендоренный cordis переименован в `@deepseek-ai/cordis`**: импорт только type-only; собранный `lib/client.js` не имеет runtime-импортов cordis (вообще нет вызовов `require(`).
- **Браузерная загрузка не передаёт плагинам config** (граф загрузки несёт `{id, url, rev, inject, immediately}`): браузерная половина применяет дефолты схемы, а — новый путь — scope настроек доставляет разрешённую хостом секцию (cordis.yml `base` + пользовательские переопределения), как только транспорт готов. Без сервиса настроек плагин откатывается к дефолтам схемы, ровно как раньше. Замерено: `recallWithDraft: bogus` обрывает весь запуск с `failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"`.
- **Транспорт настроек только loopback**: удалённый браузер не может прочитать документ хоста; его scope сообщает режим memory/unavailable, и плагин откатывается к дефолтам (хранилище истории в любом случае локально для браузера).
- **Пересборка до перезапуска**: стартовая проверка читает `lib/client.js`; несобранные пакеты отклоняются, и браузер всегда получает только собранные артефакты.
- **Только экспортированные символы**: межпакетные чтения используют типы/сервисы, экспортированные из `/client`-входов пакетов `@deepseek-ai/dsh-client-*`; приведение экземпляра сервиса `inputTriggers` к `InputTriggerService` — принятый в сообществе паттерн (здесь сделано как type-only импорт + `ctx.get('inputTriggers') as InputTriggerService | undefined`, с комментарием, объясняющим почему).
- Контракт клиентского бандла: CJS-фабрика, обёрнутая в `window.__ModuleLoader__.load({ id, factory })`, платформенные модули (react, cordis, slots, … плюс исключение `@deepseek-ai/dsh-client-runtime/client`) — снаружи, всё остальное — внутрь. Этому плагину не нужны runtime-внешние зависимости; конфиг tsdown объявляет список оборонительно.
- Файлы профиля должны быть **в UTF-8 без BOM** (`readProfileManifest` делает простой `JSON.parse`; BOM обрывает запуск с `Unexpected token '\uFEFF'` — замерено).

## ⚠️ Известные ограничения

- **Логические и визуальные строки**: по умолчанию `logical` смотрит на `\n` (длинное автоматически перенесённое сообщение считается одной строкой); `visual` измеряет реальные переносы через mirror (скрытый узел, бинарный поиск O(строк·log n) на каждую проверку края, мемоизируется по черновику/ширине). Само измерение mirror требует реального движка раскладки — вместо этого юнит-тестируется чистая математика span-ов (см. `tests/visual-mirror.spec.ts`).
- **Сохранённая история — на один браузер**: хранилище живёт в `localStorage` одного origin; оно никогда не синхронизируется между браузерами или машинами. Повреждённые данные молча сбрасываются.
- **Стек undo включает транзакции вызова**: каждая вставка/восстановление — это одна `setDraft`-транзакция в undo-логе машины ввода; Ctrl+Z может пошагово откатывать вызовы. Плагин никогда не меняет семантику undo/redo; исправление точности требует раскрытия edit-range в апстриме (см. `docs/upstream-proposals.md` C1).
- Вызов записи `/xxx` и затем Enter идёт по обычному пути claim/арбитража команд (ожидаемо; Enter никогда не перехватывается).
- Меню/попапы и фазы, отличные от `plain`, всегда приоритетны; отправка (программная очистка черновика) и переключение сессий сбрасывают состояние в IDLE.
- Ссылочные чипы (плейсхолдеры U+FFFC) переносятся вместе с вызываемым/восстанавливаемым текстом черновика.
- `historyScope: 'workspace'` читает живые сборки других перечисленных сессий; сессии, чья сборка ещё не материализовалась, пока ничего не дают.
- Оверлей поиска — это простой DOM (без зависимости от React); он рендерит все совпадения до лимита `maxHistory`.

## 🗺️ Апстрим-предложения

Три предложения точек расширения для `deepseek-ai/deepseek-harness` описаны в [`docs/upstream-proposals.md`](docs/upstream-proposals.md): публичная запись edit-range в интерфейсе ввода (C1), экспорт чистой функции определения триггера (C2) и документированная цепочка арбитража клавиатуры композера (C3).

## 🏷️ Темы и экосистема

Проект — часть экосистемы плагинов DeepSeek Harness. Рекомендуемые темы GitHub (задаются в настройках репозитория):

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `typescript`

Полезные ссылки: [github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 📄 Лицензия

[Apache License 2.0](./LICENSE)

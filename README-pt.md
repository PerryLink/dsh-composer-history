<div align="center">

# ⌨️ dsh-composer-history

> Release stamp: `0.8.8` (2026-10-04).
- **Canal 1024 store**: `npm i -g dsh1024` uma vez, depois `dsh1024 plugin --profile web add dsh-composer-history` (conta para o ranking de instalações do [deepseek1024.com](https://deepseek1024.com)).

**Histórico de entrada estilo terminal para o compositor da Web GUI do DeepSeek Harness.**

*Pressione ↑ como em um terminal — e mantenha seu rascunho pela metade seguro.*

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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-composer-history?metric=downloads&lang=pt)](https://dshfind.com/pt/plugins/PerryLink/dsh-composer-history?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-composer-history
```


</div>

---


**📖 Base de conhecimento do ecossistema** — dados medidos, não marketing: [guia de desenvolvimento · dados de seleção · critérios de manutenção](https://perrylink.github.io/dsh-plugin-guide/).

<!-- star-cta -->
## Install & uninstall

O pacote npm inclui os bundles já compilados; um checkout do código-fonte deve ser compilado primeiro (`pnpm run build`) — a verificação do pacote de cliente se recusa a iniciar com um bundle não compilado.

- **canal git** (último `main`): `dsh plugin --profile web add github:PerryLink/dsh-composer-history`.
- **canal npm** (versões publicadas): `dsh plugin --profile web add dsh-composer-history`.
- **canal tarball**: execute `pnpm pack` neste repositório e depois `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-composer-history` (ou remova a linha do patch do perfil).

## ⭐ 如果它帮到了你

Este plugin faz parte da [família de plugins DSH](https://github.com/PerryLink) (mais de 40, todos Apache-2.0). Se for útil, **deixe uma estrela**: não desbloqueia nada, mas ajuda a próxima pessoa a encontrá-lo.

*English:* part of a 40+ plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.

## What is dsh-composer-history?

Histórico de entrada estilo terminal para o compositor da Web GUI do DeepSeek Harness.

Pressione ↑ como em um terminal — e mantenha seu rascunho pela metade seguro.

![Demonstração de terminal do dsh-composer-history: dsh-composer-history — /save and /load, plus arrow recall and Ctrl+R search](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-hero.png)

![Animated terminal demo of dsh-composer-history](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-demo.gif)

*A mesma execução, animada.*

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `dsh-v0.2.1-alpha.1` (verificado em 2026-09-25: typecheck duplo + 294 testes; client peers `>=0.1.2-rc.1 <0.2.0 \|\| >=0.1.5-alpha.1 <0.2.0 \|\| >=0.1.6-0 <0.2.0 \|\| >=0.1.7-0 <0.2.0`). Nesta linha a costura de configurações é o próprio formulário de `Config` vivo da entrada de perfil: a família removida `ctx.settings.register` / `SettingsProvider` e o serviço de cliente `ctx.settingsScope` desaparecem, então cada ajuste trafega por `ctx.configForms`. Nas linhas 0.1.6+ `SessionListState.current` foi removido: a sessão atual é derivada dos fatos de retenção, então a injeção de histórico e a biblioteca de trechos continuam funcionando. |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | Somente Web GUI (plugin de cliente; armazenamento local do navegador; sem rede, sem código nativo) |
| Model | Qualquer um (sem requisições ao modelo — comportamento puramente de UI) |

A metade de navegador usa os pacotes de cliente publicados (`dsh-client-ui-conversation`, `dsh-client-ui-input-trigger`, `dsh-client-ui-settings`) e o `Context` do cordis; ela não depende mais do pacote removido `dsh-client-runtime`, então a superfície de cliente também se alinha com hosts `0.1.2-rc.1`.
A interceptação se ancora no DOM do compositor web: a superfície contenteditable `div[data-composer-input]` dentro de `[data-input-scroll]` (o compositor Lexical enviado desde 0.1.2-alpha.5 / 0.1.2-rc.1), mantendo também o compositor textarea legado dentro de `[data-input-scroll]` (linhas até 0.1.1-rc.2); outros textareas passam direto. O smoke de comportamento web em jsdom do fluxo de compatibilidade reafirma essa face identidade/texto/cursor contra o pacote empacotado.
0.1.2-rc.1 (adaptado em 2026-09-04): o envelope de sessão mantém seu campo ignorable apenas para compatibilidade de leitura de logs armazenados - o Session.append ainda não consegue estampá-lo, então o comportamento da porta não muda. Verificado em 2026-09-06 contra o checkout master do dsh-v0.1.7-alpha.1 (cadeia completa de portas + smoke de instalação de perfil).
0.1.5-rc.1 (adaptado em 2026-09-10): os pinos de dependências passam para a linha publicada 0.1.5-rc.1; nenhuma mudança de costura afeta o comportamento deste plugin.
0.1.5-rc.2 (adaptado em 2026-09-11): os pinos de dependências passam para a linha publicada 0.1.5-rc.2; nenhuma mudança de costura afeta o comportamento deste plugin.
0.1.7-alpha.1 (adaptado em 2026-10-04): a costura de configurações é substituída nas duas metades. A metade de host não registra mais um namespace `composer-history` pelo removido `ctx.settings.register(ns, schema, { base })`: nesta linha a superfície de configurações durável de um plugin É o seu próprio `Config` vivo. Cada ajuste é declarado `.volatile()`, o id da entrada de perfil (`composer-history`, o id de linha do bundle patch) nomeia o formulário, e `apply` reivindica a política de formulário gerado (`ctx.settings.configure({ auto: true }, ctx.fiber)`, de propriedade do effect para que um reload se registre de novo limpidamente). A metade de navegador lê a mesma entrada por `ctx.configForms.get('composer-history')` em vez do removido `ctx.settingsScope.bind({ namespace })`; a forma de snapshot/assinatura não muda, então a fiação é reinstalada a cada mudança confirmada. A superfície editável é preservada, não ampliada: todo campo que o antigo namespace expunha é volatile e nenhum campo novo passou a ser editável. Uma seção existente de `settings.yaml` chamada `composer-history` é migrada pelo próprio host para a entrada de perfil do mesmo id.

## What you get

`dsh-composer-history` leva o histórico de entrada de um terminal para o compositor da Web GUI do DeepSeek Harness:

1. **Recuperação por setas com prioridade de borda** — as setas ↑/↓ simples movem primeiro o cursor; a recuperação do histórico só dispara quando o cursor está na primeira/última linha. A primeira recuperação guarda `{draft, caret}`, e ao voltar à entrada mais recente (ou pressionar `Esc`) ambos são restaurados exatamente — nunca apagados.
2. **Histórico persistente** — cada mensagem enviada é anexada a um armazenamento local do navegador limitado, então a recuperação sobrevive a recarregamentos e alcança outras sessões.
3. **Busca reversa** — `Ctrl+R` (configurável) abre um painel de consulta sobre o histórico, os snippets e os templates combinados.
4. **Camada de entrada inteligente** — snippets `/save`/`/load`, templates de prompt com variáveis `{{workspace}}`/`{{session}}`/`{{draft}}` e insights de reutilização locais do navegador.
5. **Consciente do contexto deslizante** — os resumos de compactação entram na recuperação e na busca como entradas `[compacted] …`, e um aviso transitório anuncia cada compactação com um preenchimento de `/compact` em um clique.

Comportamento puramente de UI: sem eventos de sessão, sem mudanças no agent-loop, sem requisições ao modelo. O texto recuperado apenas entra no rascunho comum do compositor; ele chega ao modelo somente se *você* pressionar Enter.

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

Todos os ajustes são campos Schemastery `Config` (alteráveis pelo cordis.yml e pelo formulário de configurações da entrada; o patch de perfil é o documento persistido). Uma substituição direcionada por id substitui a linha inteira — repita cada chave de que precisar. Valores de enum inválidos interrompem toda a inicialização do dsh de forma ruidosa, e uma edição no formulário de configurações é validada pelo host antes de persistir.

| Key | Default | Meaning |
|---|---|---|
| `recallWithDraft` | `'save'` | Modo de recuperação (`save` / `gate`): `save` guarda um rascunho não vazio antes de recuperar; `gate` só recupera com rascunho vazio (controle estilo Claude/Codex) |
| `restoreOnEscape` | `true` | Restaurar o rascunho guardado quando `Esc` encerra a navegação |
| `edgeMode` | `'logical'` | Modo de detecção de borda (`logical` / `visual`): por linhas `\n` ou por linhas quebradas medidas |
| `enableCtrlAlias` | `true` | Fazer Ctrl+↑/↓ se comportar como as setas simples |
| `restoreCaret` | `true` | Restaurar também o cursor guardado ao chegar ao final / `Esc` |
| `upKey` | `'ArrowUp'` | `KeyboardEvent.key` que recupera para cima; `''` desativa |
| `downKey` | `'ArrowDown'` | `KeyboardEvent.key` que avança para o mais recente / restaura; `''` desativa |
| `escapeKey` | `'Escape'` | `KeyboardEvent.key` que sai da navegação; `''` desativa |
| `maxHistory` | `500` | Máximo de entradas recuperadas (mantêm-se as mais recentes); `0` = ilimitado |
| `includeKinds` | `['user']` | Tipos de nó de conversa admitidos no histórico (adicione `'steering'` para incluir mensagens steer) |
| `historyScope` | `'session'` | Escopo do histórico (`session` / `workspace`): `workspace` antepõe as mensagens de usuário de outras sessões listadas às da sessão atual |
| `persistHistory` | `true` | Anexar as mensagens enviadas ao armazenamento local do navegador |
| `maxPersisted` | `200` | Máximo de entradas persistidas; `0` = ilimitado |
| `enableSearch` | `true` | Ativar o painel de busca reversa `Ctrl+R` |
| `searchKeys` | `['Ctrl+R']` | Especificações de acorde que abrem a busca (modificadores `Ctrl`/`Alt`/`Meta`/`Shift` + um nome de tecla); uma especificação malformada faz o fiber do navegador falhar de forma ruidosa |
| `searchCaseSensitive` | `false` | Se a busca distingue maiúsculas de minúsculas |
| `includeCompactionSummaries` | `true` | Admitir resumos de checkpoint `[compacted] …` na recuperação e na busca |
| `showCompactionNotice` | `true` | Mostrar um aviso transitório quando um checkpoint de compactação aterrissa |
| `compactCommandText` | `'/compact'` | Comando slash que a ação "Compact now" do aviso preenche no compositor; `''` oculta a ação |
| `enableSnippets` | `true` | Ativar a biblioteca de snippets (`/save`, `/load`, seleção no painel de busca) |
| `maxSnippets` | `200` | Máximo de snippets armazenados; `0` = ilimitado |
| `enableTemplates` | `true` | Ativar a biblioteca de templates de prompt (variáveis preenchidas na inserção) |
| `enableInsights` | `true` | Ativar a dica de reutilização (estatísticas de uso locais) |
| `insightMinUses` | `2` | Usos mínimos antes de a dica de reutilização aparecer |
| `enableCompactionHighlight` | `true` | Marcar resumos `[compacted] …` de forma distinta no painel de busca |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `ArrowUp` | keybinding | Recuperação ↑/↓ com prioridade de borda — guarda `{draft, caret}`, restaura ambos exatamente ao chegar ao final ou com `Esc` |
| `Ctrl+R` | keybinding | Painel de busca reversa sobre o histórico, os snippets e os templates combinados |
| `/save` | command | Salva o rascunho atual como um snippet com nome e tags |
| `/load` | command | Insere um snippet salvo no cursor |
| `templates` | UI | Exportar/importar templates de prompt como documento JSON (apenas com clique explícito) |
| `composer-history` | settings form | O formulário de `Config` vivo da própria entrada de perfil — leva a configuração resolvida (base do cordis.yml + substituições do perfil) para a metade do navegador |

## Keybindings

| Key | State | Behavior |
|---|---|---|
| ↑ | IDLE, cursor na primeira linha | guarda `{draft, caret}`, preenche a entrada mais recente, cursor ao final (sem histórico → passa) |
| ↑ | BROWSING, cursor na primeira linha | entrada mais antiga; segura na mais antiga (intercepta, sem mutação) |
| ↑ | cursor não está na primeira linha | totalmente liberado (o navegador move o cursor) |
| ↓ | IDLE | sempre liberado (movimento normal do cursor) |
| ↓ | BROWSING, cursor na última linha | entrada mais recente; na mais nova → restaura `savedDraft` + `savedCaret` → IDLE |
| ↓ | cursor não está na última linha | totalmente liberado |
| Esc | BROWSING (`restoreOnEscape: true`) | restaura `savedDraft` + `savedCaret` → IDLE, interceptado |
| Esc | caso contrário | liberado (a semântica de Escape de menus/popups não é tocada) |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | igual às setas simples |
| `searchKeys` chord | compositor focado, fase `plain`, sem menu/seleção/IME | abre a busca reversa; a navegação termina, o texto exibido vira o rascunho |
| Shift/Alt/Meta+setas, IME, seleção | qualquer | sempre liberado |

`upKey`/`downKey`/`escapeKey`/`searchKeys` renomeiam as teclas acima; a política de modificadores (e a correspondência exata de modificadores do acorde de busca) não muda. Dentro do painel de busca: ↑/↓ movem a seleção (a linha selecionada rola para a vista), Enter preenche, Esc cancela, um clique escolhe, pressionar fora cancela; as substrings correspondentes são destacadas em cada linha.

## Reverse search

- **Abrir**: o acorde `searchKeys` com o compositor focado e a entrada em `plain` (um `Ctrl+R` aqui também interrompe a recarga de página do navegador — a tecla só é consumida dentro do compositor).
- **Filtrar**: correspondência de substring sobre o histórico combinado (sessão atual + entradas persistidas + de workspace); sensibilidade a maiúsculas conforme `searchCaseSensitive`; as substrings correspondentes são destacadas em cada linha.
- **Escolher**: Enter preenche o rascunho e move o cursor para o final — o mesmo caminho de escrita única `setDraft` da recuperação comum. O texto recuperado chega ao modelo apenas se você pressionar Enter depois.
- **Cancelar**: Esc ou pressionar fora do painel; o rascunho não é tocado.

## Smart input layer

Sobre o histórico estilo terminal, três bibliotecas locais do navegador transformam o compositor em uma superfície de entrada reutilizável. Tudo abaixo vive no `localStorage` (chaves `dsh.composer-history.snippets.v1`, `.templates.v1`, `.insights.v1`), nunca toca a rede, e cada interruptor é um campo `Config`.

**Snippets (biblioteca de comandos entre sessões)**

```text
/save ship-check --tag=release,ops
check the build, run the smoke suite, tag the release        ← o resto do rascunho é o snippet
/save ship-check                                             → "snippet saved: ship-check"
/load ship-check                                             → o snippet preenche o compositor
Ctrl+R → o painel de busca lista snippets (selo verde = nome) ao lado do histórico
```

- `/save <nome>` consome o Enter, armazena o rascunho (menos a linha de comando) sob um nome kebab-case com tags opcionais e limpa o compositor. Nada a salvar → um aviso de erro, o comando nunca envia.
- `/load <nome>` insere o snippet no cursor (substituição de todo o rascunho, cursor ao final) e conta o uso.
- Escopo: snippets salvos com um cwd de workspace têm escopo de workspace; os salvos sem um são globais. `maxSnippets` limita a biblioteca; salvamentos com o mesmo nome substituem.
- O plugin nunca envia: cada preenchimento cai no rascunho comum e seu Enter continua sendo seu.

**Templates de prompt com variáveis**

Templates são textos de prompt armazenados com marcadores `{{variable}}`. O painel de busca os lista com um selo roxo; escolher um preenche as variáveis a partir da sessão em tempo real e insere o resultado. Variáveis integradas: `{{workspace}}` (o cwd da sessão), `{{session}}` (o id da sessão), `{{draft}}` (o rascunho atual). Um template que referencia uma variável desconhecida falha de forma ruidosa com a lista de faltantes — um prompt pela metade é pior que um erro.

A biblioteca de templates exporta para e importa de um documento JSON (`composer-templates-v1`) pelos botões **Export templates / Import templates** do painel — uma ação explícita do usuário; o plugin nunca grava arquivos por conta própria.

**Insights de reutilização**

Cada mensagem de usuário recém-confirmada (e cada carga de snippet) registra um registro de uso local do navegador indexado por texto exato. Enquanto você digita, uma pequena dica sob o compositor informa `used M× in N sessions` quando o rascunho corresponde a um prompt usado em pelo menos `insightMinUses` (padrão 2) sessões. Alterne com `enableInsights`; as estatísticas contêm apenas os textos deduplicados e os contadores.

**Destaque de resumos de compactação**

`Ctrl+R` marca os resumos `[compacted] …` com um selo âmbar (o histórico permanece sem selo), snippets em verde, templates em roxo — a procedência do painel é visível de relance. Alterne com `enableCompactionHighlight`.

## Exportação e importação de backup

As quatro bibliotecas locais do navegador exportam e importam a partir de um único documento JSON versionado. As ações **Export JSON / Copy JSON / Import file / Paste JSON** do painel rodam totalmente no navegador: download ou cópia para a área de transferência ao exportar, seletor de arquivo ou texto colado ao importar — nada é enviado e não há RPC de host nem chamadas de rede.

**Forma do documento**

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

**Estratégia de mesclagem e conflitos**

- Entradas de histórico são strings simples e deduplicam por texto exato; uma entrada duplicada ou vazia é pulada, nunca sobrescrita.
- Snippets e templates são indexados por `name`; insights por `text` exato. Em conflito de mesma chave, a **marca de tempo mais nova vence** (`updatedAt` para snippets/templates, `lastUsedAt` para insights); uma importação mais antiga ou de marca igual é pulada, e chaves novas são anexadas.
- A importação respeita `maxPersisted` e `maxSnippets`; templates e insights param nos limites fixos do protocolo (`500` cada).
- O aviso de resultado informa quantos registros foram gravados e quantos foram pulados (antigos/duplicados).

**Versionamento de esquema**

`schemaVersion` começa em `1`. As importações rodam uma migração passo a passo (uma versão por vez) para que formatos futuros possam atualizar documentos antigos no lugar. Um documento cujo `schemaVersion` seja **mais novo** que o entendido por esta build é rejeitado com erro — nunca descartado silenciosamente nem mesclado parcialmente; uma versão antiga demais para migrar é rejeitada da mesma forma.

## Sliding context

O núcleo do harness dá a cada sessão do dsh uma janela de contexto deslizante, o mesmo fluxo de trabalho do Claude Code e do Codex: quando uma conversa se aproxima do limite de contexto do modelo (ou o provedor reporta um estouro), o harness **auto-compacta** — os turnos antigos são resumidos atrás de um marcador de checkpoint `compaction` que permanece visível na transcrição, o modelo mantém apenas o resumo mais a cauda recente, e a sessão continua. `/compact` dispara a mesma compactação sob demanda, e o marcador é renderizado como uma linha expansível "Context compacted".

`dsh-composer-history` conecta o compositor a esse fluxo para que o deslizamento da janela nunca custe seu histórico de digitação:

- **A recuperação sobrevive à compactação** — os turnos sombreados permanecem na conversa finalizada que a vista Chat publica, então ↑ ainda percorre cada mensagem enviada antes e depois de um checkpoint.
- **Os resumos entram no histórico** — o texto do resumo de cada checkpoint entra na recuperação ↑ e na busca `Ctrl+R` como uma entrada `[compacted] …` (alternância: `includeCompactionSummaries`), de modo que o contexto que o modelo já não vê literalmente fica a uma tecla de distância.
- **Aviso de compactação** — quando um checkpoint aterrissa com a página aberta, um snackbar transitório o anuncia (o momento "Auto-compacting conversation…" do Claude Code) com o trecho do resumo e uma ação de um clique **Fill `/compact`** (`showCompactionNotice`, `compactCommandText`); o preenchimento cai no rascunho comum, e somente seu Enter o envia.
- **Contagens de busca** — o painel `Ctrl+R` agora mostra uma linha de status ao vivo `N entries` / `N matches`, e entradas longas se limitam a duas linhas.

> A compactação em si (limiares, modelo de resumo, `/compact`) pertence aos plugins de compactação do núcleo do harness — este plugin apenas observa os marcadores de checkpoint que a projeção de conversa da vista Chat já expõe (`uiConversation.binding(id).target('chat').legacy.nodes`), então funciona sem nenhuma mudança de agent-loop ou requisição ao modelo.

## Permissions & data

- **Permissões**: o plugin declara `browser:local-storage` em seu manifest de workshop — nada mais. Sem rede, sem subprocessos, sem eventos de sessão.
- **Dados**: quatro chaves de `localStorage` do navegador — `dsh.composer-history.v1` (histórico de mensagens enviadas), `dsh.composer-history.snippets.v1` (textos de snippets + tags + contadores de uso), `dsh.composer-history.templates.v1` (textos de templates) e `dsh.composer-history.insights.v1` (textos de prompt deduplicados + contadores de uso por sessão). Todas limitadas, somente da mesma origem, nunca enviadas; cargas corrompidas são reiniciadas silenciosamente.
- **Visível para o modelo ⟺ você pressiona Enter**: o texto recuperado, as cargas de snippets, os preenchimentos de templates e o preenchimento de `/compact` caem no rascunho comum do compositor. Nada chega ao modelo até você pressionar Enter.

## Security boundaries

- **Somente UI, nunca aplicação.** O plugin edita apenas o rascunho do compositor; o sandbox, a aprovação e o sistema de sessões permanecem as autoridades de aplicação, e nenhum comando ou ferramenta é reivindicado ou contornado.
- **Nenhum conteúdo sai do navegador.** Histórico, snippets, templates e insights vivem no `localStorage`; nada é enviado e nenhuma requisição ao modelo ou chamada de rede é feita.
- **Falha ruidosa.** Valores de enum inválidos interrompem toda a inicialização do dsh; um acorde de busca malformado faz o fiber do navegador falhar — a má configuração nunca se degrada silenciosamente.
- **Tudo limitado.** `maxHistory`, `maxPersisted` e `maxSnippets` limitam as entradas retidas; cargas corrompidas ou estranhas são reiniciadas silenciosamente.
- **Zero efeitos colaterais na passagem.** O plugin intercepta apenas na fase de entrada `plain` e cede ao menu slash, aos popups de comando, à composição IME, às seleções de texto e às combinações de modificadores.

## Known limitations

- **Face DOM do compositor.** A interceptação se ancora em DOM privado do host: o `div[data-composer-input]` contenteditable dentro de `[data-input-scroll]` (host 0.1.2-alpha.5 / 0.1.2-rc.1 e posteriores); o compositor textarea legado dentro de `[data-input-scroll]` (linhas até 0.1.1-rc.2) continua correspondendo. Essa forma não é uma API publicada (a proposta upstream C3 registra que plugins só podem adivinhar o DOM do host), então uma mudança futura no DOM do host pode quebrar a interceptação silenciosamente — o smoke jsdom do fluxo de compatibilidade reafirma a face contra o pacote empacotado.
- **Linhas lógicas vs visuais.** O `logical` padrão se baseia em `\n` (uma mensagem longa com quebra automática conta como uma linha); `visual` mede quebras reais por um mirror oculto que copia a caixa computada da superfície contenteditable (busca binária O(linhas·log n) por verificação de borda, memoizado por rascunho/largura). A medição do mirror precisa de um motor de layout real — a matemática pura de spans é coberta por testes unitários, e os spans medidos no compositor Lexical seguem como melhor esforço (`logical` segue como padrão).
- **O histórico persistente é por navegador.** O armazenamento vive no `localStorage` de uma origem; nunca sincroniza entre navegadores ou máquinas. Cargas corrompidas são reiniciadas silenciosamente.
- **A pilha de desfazer inclui transações de recuperação.** Cada preenchimento/restauração é uma transação `setDraft` no registro de desfazer da máquina de entrada; Ctrl+Z retrocede pelas recuperações. A correção de precisão precisa da exposição do edit-range upstream.
- Recuperar uma entrada `/xxx` e pressionar Enter segue o caminho normal de claim/adjudication do comando (esperado, e Enter nunca é interceptado).
- Menus/popups e fases que não são `plain` sempre vencem; um envio confirmado e as trocas de sessão redefinem para IDLE.
- Os chips de referência (marcadores U+FFFC) viajam junto com o texto de rascunho recuperado/restaurado.
- `historyScope: 'workspace'` lê os alvos Chat de outras sessões listadas; uma sessão cuja vista Chat ainda não foi ativada nesta página não contribui.
- O painel de busca é DOM puro (sem dependência de React); renderiza todas as correspondências até o limite `maxHistory`.
- **A consciência de compactação é observacional.** Checkpoints que aterrissaram antes da instalação (ou antes de uma troca de sessão) nunca disparam um aviso; um checkpoint cujo evento de resumo caiu fora da janela carregada não contribui com nenhuma entrada `[compacted] …` (`summary: null`).
- A ação "Compact now" do aviso apenas *preenche* o texto de comando configurado no rascunho — o envio continua sendo seu Enter.
- **Snippets, templates e insights são locais do navegador.** Os nomes usam kebab-case (1..64 caracteres); as tags se limitam a 8 × 32 caracteres. As variáveis de template são resolvidas a partir da sessão em tempo real; `{{draft}}` é o rascunho no momento da escolha.

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

- [@PerryLink](https://github.com/PerryLink) — criador e mantenedor: recuperação por setas com prioridade de borda, histórico persistente, busca reversa, consciência do contexto deslizante, biblioteca de snippets, templates de prompt, insights de reutilização e os manifests `dsh.bundle` / `dshWorkshop`.

## Família de plugins DSH da PerryLink

Este projeto é um dos **87 plugins ativamente mantidos** do DeepSeek Harness da [PerryLink](https://github.com/PerryLink). O registro da família tem **95** plugins — **5 congelados**, **3 retirados** — e fica recolhido abaixo para que cada README mantenha uma primeira tela curta. Expanda para ver cada linha, com o motivo na coluna Status.

<details>
<summary>Expandir os 95 plugins</summary>

| Plugin | Uma linha | Status |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 CONGELADO — ver o README do repositório |
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
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 CONGELADO — ver o README do repositório |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 RETIRADO — ver o README do repositório |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors

### Instalar a partir do mercado do DSH Desktop

Todos os plugins PerryLink podem ser explorados no mercado integrado do DSH Desktop: **Market → Sources → add source → colar** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ selecionar**. A instalação continua passando pela verificação de identidade npm do mercado e pela sua confirmação.

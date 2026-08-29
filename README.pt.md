<div align="center">

# ⌨️ dsh-composer-history
- **Canal 1024 store**: `npm i -g dsh1024` uma vez, depois `dsh1024 plugin --profile web add dsh-composer-history` (conta para o ranking de instalações do [deepseek1024.com](https://deepseek1024.com)).

**Histórico de entrada estilo terminal para o compositor da Web GUI do DeepSeek Harness.**

*Pressione ↑ como em um terminal — e mantenha seu rascunho pela metade seguro.*

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
| Harness | DeepSeek Harness `0.1.1-rc.2` |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | Somente Web GUI (plugin de cliente; armazenamento local do navegador; sem rede, sem código nativo) |
| Model | Qualquer um (sem requisições ao modelo — comportamento puramente de UI) |

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
# 1. install the bundle into your profile
dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"

# or from npm (published releases)
dsh plugin --profile web add dsh-composer-history

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: composer-history'
```

## Install & uninstall

O pacote npm inclui os bundles já compilados; um checkout do código-fonte deve ser compilado primeiro (`pnpm run build`) — a verificação do pacote de cliente se recusa a iniciar com um bundle não compilado.

- **canal git** (último `main`): `dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"`.
- **canal npm** (versões publicadas): `dsh plugin --profile web add dsh-composer-history`.
- **canal tarball**: execute `pnpm pack` neste repositório e depois `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`.
- **desinstalar**: `dsh plugin --profile web remove dsh-composer-history` (ou remova a linha do patch do perfil).

## Configuration

Todos os ajustes são campos Schemastery `Config` (alteráveis pelo cordis.yml e pelo documento de configurações). Uma substituição direcionada por id substitui a linha inteira — repita cada chave de que precisar. Valores de enum inválidos interrompem toda a inicialização do dsh de forma ruidosa.

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
| `composer-history` | settings namespace | Leva a configuração resolvida para a metade do navegador |

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

## Sliding context

O núcleo do harness dá a cada sessão do dsh uma janela de contexto deslizante, o mesmo fluxo de trabalho do Claude Code e do Codex: quando uma conversa se aproxima do limite de contexto do modelo (ou o provedor reporta um estouro), o harness **auto-compacta** — os turnos antigos são resumidos atrás de um marcador de checkpoint `compaction` que permanece visível na transcrição, o modelo mantém apenas o resumo mais a cauda recente, e a sessão continua. `/compact` dispara a mesma compactação sob demanda, e o marcador é renderizado como uma linha expansível "Context compacted".

`dsh-composer-history` conecta o compositor a esse fluxo para que o deslizamento da janela nunca custe seu histórico de digitação:

- **A recuperação sobrevive à compactação** — os turnos sombreados permanecem no snapshot da sessão, então ↑ ainda percorre cada mensagem enviada antes e depois de um checkpoint.
- **Os resumos entram no histórico** — o texto do resumo de cada checkpoint entra na recuperação ↑ e na busca `Ctrl+R` como uma entrada `[compacted] …` (alternância: `includeCompactionSummaries`), de modo que o contexto que o modelo já não vê literalmente fica a uma tecla de distância.
- **Aviso de compactação** — quando um checkpoint aterrissa com a página aberta, um snackbar transitório o anuncia (o momento "Auto-compacting conversation…" do Claude Code) com o trecho do resumo e uma ação de um clique **Fill `/compact`** (`showCompactionNotice`, `compactCommandText`); o preenchimento cai no rascunho comum, e somente seu Enter o envia.
- **Contagens de busca** — o painel `Ctrl+R` agora mostra uma linha de status ao vivo `N entries` / `N matches`, e entradas longas se limitam a duas linhas.

> A compactação em si (limiares, modelo de resumo, `/compact`) pertence aos plugins de compactação do núcleo do harness — este plugin apenas observa os marcadores de checkpoint que o snapshot do cliente já expõe, então funciona sem nenhuma mudança de agent-loop ou requisição ao modelo.

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

- **Linhas lógicas vs visuais.** O `logical` padrão se baseia em `\n` (uma mensagem longa com quebra automática conta como uma linha); `visual` mede quebras reais por um mirror oculto (busca binária O(linhas·log n) por verificação de borda, memoizado por rascunho/largura). A medição do mirror precisa de um motor de layout real — a matemática pura de spans é coberta por testes unitários.
- **O histórico persistente é por navegador.** O armazenamento vive no `localStorage` de uma origem; nunca sincroniza entre navegadores ou máquinas. Cargas corrompidas são reiniciadas silenciosamente.
- **A pilha de desfazer inclui transações de recuperação.** Cada preenchimento/restauração é uma transação `setDraft` no registro de desfazer da máquina de entrada; Ctrl+Z retrocede pelas recuperações. A correção de precisão precisa da exposição do edit-range upstream.
- Recuperar uma entrada `/xxx` e pressionar Enter segue o caminho normal de claim/adjudication do comando (esperado, e Enter nunca é interceptado).
- Menus/popups e fases que não são `plain` sempre vencem; um envio confirmado e as trocas de sessão redefinem para IDLE.
- Os chips de referência (marcadores U+FFFC) viajam junto com o texto de rascunho recuperado/restaurado.
- `historyScope: 'workspace'` lê os assemblies em tempo real de outras sessões listadas; sessões cujo assembly não se materializou ainda não contribuem.
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

## PerryLink DSH Plugin Family

Este projeto é um dos [15 plugins do DeepSeek Harness](https://github.com/PerryLink) mantidos por [PerryLink](https://github.com/PerryLink). Se este ajudar você, os outros provavelmente também ajudarão:

| Plugin | One-liner |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | Engineering-discipline guard: requirements grill, test gates, adversary review |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | Durable background child agents with a Web UI sidebar, messaging and interrupt |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | LSP diagnostics, formatting, completion, code actions and rename over language servers |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | Claude Code outputStyles-equivalent runtime style switching |
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | Claude Code-style declarative allow/deny/ask permission rules with audit |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | Second-model auto-review on the approval chain, fail-closed by default |
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |
| [dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security) | Security-audit skill pack: secret scan, dependency and supply-chain review |
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | Pin sessions in the Web sidebar with durable ordering |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |
| [dsh-github](https://github.com/PerryLink/dsh-github) | GitHub PR/issues integration for DSH, every write gated by approval |
| [dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) | Plugin-development knowledge base as an on-demand agent skill |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors

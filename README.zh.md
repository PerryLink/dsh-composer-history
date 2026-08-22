<div align="center">

# ⌨️ dsh-composer-history

**DeepSeek Harness Web GUI 作曲器的终端式输入历史。**

*像在终端里一样按 ↑ —— 你打到一半的草稿不会丢。*

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
| Platforms | 仅 Web GUI（客户端插件；浏览器本地存储；无网络、无原生代码） |
| Model | 任意（不发模型请求 —— 纯 UI 行为） |

## What you get

`dsh-composer-history` 把终端的输入历史搬进 DeepSeek Harness Web GUI 作曲器：

1. **边缘优先的方向键召回** —— 裸 ↑/↓ 先移动光标；只有当光标位于首行/末行时才触发历史召回。首次召回暂存 `{draft, caret}`，回到最新一条（或按 `Esc`）时两者精确还原 —— 从不被清空。
2. **持久化历史** —— 每条已发送消息追加到有界的浏览器本地存储，刷新页面、跨会话仍可召回。
3. **反向搜索** —— `Ctrl+R`（可配置）在合并的历史、片段与模板上打开查询覆盖层。
4. **智能输入层** —— `/save`/`/load` 片段、带 `{{workspace}}`/`{{session}}`/`{{draft}}` 变量的提示词模板，以及浏览器本地的复用洞察。
5. **感知滑动上下文** —— 压缩摘要以 `[compacted] …` 条目加入召回与搜索，每次压缩弹出带一键 `/compact` 填入的短暂通知。

纯 UI 行为：不产生会话事件、不改 agent-loop、不发模型请求。召回的文本只进入普通作曲器草稿；只有*你*按下 Enter 才会到达模型。

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

npm 包自带构建产物；源码 checkout 须先构建（`pnpm run build`）—— 客户端包检查会拒绝未构建的 bundle 启动。

- **git 渠道**（最新 `main`）：`dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"`。
- **npm 渠道**（已发布版本）：`dsh plugin --profile web add dsh-composer-history`。
- **tarball 渠道**：在本仓库执行 `pnpm pack`，然后 `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`。
- **卸载**：`dsh plugin --profile web remove dsh-composer-history`（或从 profile patch 中移除该行）。

## Configuration

所有可调项都是 Schemastery `Config` 字段（可从 cordis.yml 与 settings 文档修改）。按 id 的覆盖会替换整行 —— 重新列出你需要的每个键。非法枚举值会响亮地中止整个 dsh 启动。

| Key | Default | Meaning |
|---|---|---|
| `recallWithDraft` | `'save'` | 召回模式（`save` / `gate`）：`save` 在召回前暂存非空草稿；`gate` 仅空草稿才召回（Claude/Codex 式门控） |
| `restoreOnEscape` | `true` | `Esc` 结束浏览时还原暂存的草稿 |
| `edgeMode` | `'logical'` | 边缘判定模式（`logical` / `visual`）：按 `\n` 行，或按测量出的折行 |
| `enableCtrlAlias` | `true` | 让 Ctrl+↑/↓ 与裸方向键行为一致 |
| `restoreCaret` | `true` | 回到底部 / `Esc` 时同时还原暂存的光标 |
| `upKey` | `'ArrowUp'` | 向上召回的 `KeyboardEvent.key`；`''` 表示禁用 |
| `downKey` | `'ArrowDown'` | 走向更新 / 还原的 `KeyboardEvent.key`；`''` 表示禁用 |
| `escapeKey` | `'Escape'` | 退出浏览的 `KeyboardEvent.key`；`''` 表示禁用 |
| `maxHistory` | `500` | 召回条目上限（保留最新）；`0` = 不限 |
| `includeKinds` | `['user']` | 允许进入历史的会话节点 kind（加入 `'steering'` 以包含 steer 消息） |
| `historyScope` | `'session'` | 历史范围（`session` / `workspace`）：`workspace` 把其他已列表会话的用户消息排在当前会话之前 |
| `persistHistory` | `true` | 把已发送消息追加到浏览器本地存储 |
| `maxPersisted` | `200` | 持久化条目上限；`0` = 不限 |
| `enableSearch` | `true` | 启用 `Ctrl+R` 反向搜索覆盖层 |
| `searchKeys` | `['Ctrl+R']` | 打开搜索的组合键规格（修饰键 `Ctrl`/`Alt`/`Meta`/`Shift` + 键名）；非法规格会使浏览器 fiber 响亮失败 |
| `searchCaseSensitive` | `false` | 搜索匹配是否区分字母大小写 |
| `includeCompactionSummaries` | `true` | 把 `[compacted] …` 检查点摘要纳入召回与搜索 |
| `showCompactionNotice` | `true` | 压缩检查点落地时显示短暂通知 |
| `compactCommandText` | `'/compact'` | 通知中"Compact now"按钮填入作曲器的斜杠命令；`''` 隐藏该按钮 |
| `enableSnippets` | `true` | 启用片段库（`/save`、`/load`、搜索面板选取） |
| `maxSnippets` | `200` | 最大存储片段数；`0` = 不限 |
| `enableTemplates` | `true` | 启用提示词模板库（插入时填充变量） |
| `enableInsights` | `true` | 启用复用洞察提示（本地使用统计） |
| `insightMinUses` | `2` | 复用提示显示前的最少使用次数 |
| `enableCompactionHighlight` | `true` | 在搜索面板中给 `[compacted] …` 摘要加醒目徽标 |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `ArrowUp` | keybinding | 边缘优先的 ↑/↓ 召回 —— 暂存 `{draft, caret}`，回到底部或按 `Esc` 时两者精确还原 |
| `Ctrl+R` | keybinding | 在合并的历史、片段与模板上打开反向搜索覆盖层 |
| `/save` | command | 把当前草稿存为带名称与标签的片段 |
| `/load` | command | 在光标处插入已保存的片段 |
| `templates` | UI | 提示词模板以 JSON 文档导出/导入（仅显式点击触发） |
| `composer-history` | settings namespace | 把解析后的配置带进浏览器半边 |

## Keybindings

| Key | State | Behavior |
|---|---|---|
| ↑ | IDLE，光标在首行 | 暂存 `{draft, caret}`，填入最新条目，光标到末尾（无历史 → 放行） |
| ↑ | BROWSING，光标在首行 | 走向更早条目；在最旧一条按住不动（拦截，无任何变更） |
| ↑ | 光标不在首行 | 完全放行（浏览器移动光标） |
| ↓ | IDLE | 始终放行（普通光标移动） |
| ↓ | BROWSING，光标在末行 | 走向更新条目；到最新一条 → 还原 `savedDraft` + `savedCaret` → IDLE |
| ↓ | 光标不在末行 | 完全放行 |
| Esc | BROWSING（`restoreOnEscape: true`） | 还原 `savedDraft` + `savedCaret` → IDLE，拦截 |
| Esc | 其他情况 | 放行（菜单/弹窗的 Escape 语义不受影响） |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | 与裸方向键一致 |
| `searchKeys` chord | 作曲器聚焦、`plain` 阶段、无菜单/选区/IME | 打开反向搜索；浏览结束，当前显示的文本成为草稿 |
| Shift/Alt/Meta+方向键、IME、选区 | 任意 | 始终放行 |

`upKey`/`downKey`/`escapeKey`/`searchKeys` 可以重命名上表按键；修饰键策略（以及搜索组合键的精确修饰键匹配）不变。搜索覆盖层内：↑/↓ 移动匹配选择（选中行自动滚入可见区域）、Enter 填充、Esc 取消、点击选中、点击面板外取消；匹配到的子串在每行中高亮显示。

## Reverse search

- **打开**：作曲器聚焦且输入处于 `plain` 阶段时按下 `searchKeys` 组合键（此时 `Ctrl+R` 也会拦截浏览器的页面刷新——按键只在作曲器内被消费）。
- **过滤**：对合并历史（当前会话 + 持久化 + 工作区条目）做子串匹配；是否区分大小写由 `searchCaseSensitive` 决定；匹配到的子串在每行中高亮。
- **选中**：Enter 填充草稿并把光标移到末尾——与普通召回同一条 `setDraft` 写路径。召回文本只有在你随后按 Enter 时才会到达模型。
- **取消**：Esc 或点击面板外；草稿不被触碰。

## Smart input layer

在终端式历史之上，三套浏览器本地库把作曲器变成可复用的输入面。下面的所有内容都存于 `localStorage`（键 `dsh.composer-history.snippets.v1`、`.templates.v1`、`.insights.v1`），绝不触碰网络，每个开关都是 `Config` 字段。

**片段（跨会话命令库）**

```text
/save ship-check --tag=release,ops
check the build, run the smoke suite, tag the release        ← 草稿其余部分就是片段
/save ship-check                                             → "snippet saved: ship-check"
/load ship-check                                             → 片段填入作曲器
Ctrl+R → 搜索面板在历史旁列出片段（绿色徽标 = 名称）
```

- `/save <名字>` 消费这次 Enter，把草稿（去掉命令那一行）以 kebab-case 名称（可带标签）存下，并清空作曲器。没有可保存的内容 → 弹出错误通知，命令绝不发送。
- `/load <名字>` 在光标处插入片段（整段替换、光标到末尾）并计一次使用。
- 作用域：带工作区 cwd 保存的片段是工作区作用域；不带的是全局。`maxSnippets` 限定库大小；同名保存会替换。
- 插件从不发送：每次填入都落在普通草稿里，Enter 永远属于你。

**带变量的提示词模板**

模板是带 `{{variable}}` 占位符的存储提示词文本。搜索面板以紫色徽标列出；选中一条会从实时会话填充变量并插入结果。内置变量：`{{workspace}}`（会话的 cwd）、`{{session}}`（会话 id）、`{{draft}}`（当前草稿）。引用未知变量的模板会响亮失败并列出缺失项 —— 半填充的提示词比报错更糟。

模板库通过面板的 **Export templates / Import templates** 按钮以 JSON 文档（`composer-templates-v1`）导出/导入 —— 是显式的用户操作；插件从不自行写文件。

**复用洞察**

每条新提交的用户消息（以及每次片段加载）都会以精确文本为键写入一条浏览器本地使用记录。当你输入时，一旦草稿匹配到至少在 `insightMinUses`（默认 2）个会话里用过的提示词，作曲器下方的小提示就会显示 `used M× in N sessions · 在 N 个会话里用过 M 次`。用 `enableInsights` 开关；统计只包含去重后的文本与计数器。

**压缩摘要高亮**

`Ctrl+R` 给 `[compacted] …` 摘要加琥珀色徽标（历史不加徽标），片段绿色、模板紫色 —— 面板的来源一眼可见。用 `enableCompactionHighlight` 开关。

## Sliding context

harness 核心给每个 dsh 会话提供滑动上下文窗口 —— 与 Claude Code 和 Codex 同款的工作流：当会话接近模型的上下文上限（或提供方回报溢出）时，harness 会**自动压缩** —— 更早的轮次被总结为留在会话记录中的 `compaction` 检查点标记，模型只保留摘要加上最近的尾部，会话继续；`/compact` 可随时手动触发同样的压缩，标记在记录中渲染为可展开的"上下文已压缩"行。

`dsh-composer-history` 把作曲器接入这个工作流，让上下文窗口滑动时你的输入历史一条不丢：

- **召回跨压缩留存** —— 被遮蔽的轮次仍留在会话快照里，↑ 依旧能走过检查点前后你发送过的每一条消息。
- **摘要加入历史** —— 每个检查点的摘要文本以 `[compacted] …` 条目进入 ↑ 召回和 `Ctrl+R` 搜索（开关：`includeCompactionSummaries`），模型不再逐字看到的上下文仍然一键可达。
- **压缩通知** —— 页面打开期间有检查点落地时，底部弹出短暂通知（Claude Code 的"自动压缩会话…"时刻），附摘要片段和一键**填入 `/compact`** 按钮（`showCompactionNotice`、`compactCommandText`）；填入只进普通草稿，只有你按 Enter 才发送。
- **搜索计数** —— `Ctrl+R` 面板新增实时的 `N entries` / `N matches` 状态行，长条目限两行显示。

> 压缩本身（阈值、摘要模型、`/compact`）由 harness 核心的 compaction 插件负责 —— 本插件只观察客户端快照已经暴露的检查点标记，因此不需要任何 agent-loop 或模型请求改动。

## Permissions & data

- **权限**：插件在其 workshop manifest 中声明 `browser:local-storage` —— 仅此而已。无网络、无子进程、无会话事件。
- **数据**：四个浏览器本地 `localStorage` 键 —— `dsh.composer-history.v1`（已发送消息历史）、`dsh.composer-history.snippets.v1`（片段文本 + 标签 + 使用计数）、`dsh.composer-history.templates.v1`（模板文本）、`dsh.composer-history.insights.v1`（去重提示词文本 + 每会话使用计数）。全部有界、仅同源可读、绝不上传；损坏载荷静默重置。
- **模型可见 ⟺ 你按 Enter**：召回文本、片段加载、模板填充、`/compact` 填入都只进普通作曲器草稿。在你按下 Enter 之前，任何内容都不会到达模型。

## Security boundaries

- **仅 UI，从不执行强制。** 插件只编辑作曲器草稿；沙箱、审批与会话系统仍是执行权威，绝不接管或绕过任何命令或工具。
- **内容不出浏览器。** 历史、片段、模板与洞察都活在 `localStorage` 里；什么都不上传，也不发模型请求或网络调用。
- **响亮失败。** 非法枚举值中止整个 dsh 启动；非法搜索组合键使浏览器 fiber 失败 —— 错误配置绝不静默降级。
- **处处有界。** `maxHistory`、`maxPersisted`、`maxSnippets` 限定保留条目；损坏或外来的载荷静默重置。
- **放行路径零副作用。** 插件仅在 `plain` 输入阶段拦截，对斜杠菜单、命令弹窗、IME 组合、文本选区与修饰键组合一律放行。

## Known limitations

- **逻辑行 vs 视觉行。** 默认 `logical` 按 `\n` 判定（一条自动折行的长消息算一行）；`visual` 通过隐藏 mirror（每次边缘检查 O(行数·log n) 二分，按草稿/宽度 memoize）测量真实折行。mirror 测量需要真实布局引擎 —— 纯 span 数学已单测覆盖。
- **持久化历史按浏览器隔离。** 存储位于某一 origin 的 `localStorage`，不在浏览器或机器间同步。损坏载荷静默重置。
- **撤销栈包含召回事务。** 每次填充/还原都是输入机撤销日志里的一条 `setDraft` 事务；Ctrl+Z 会一步步退回召回。精确化需要上游暴露 edit-range。
- 召回 `/xxx` 条目后按 Enter 走正常的命令 claim/adjudication 路径（符合预期，且 Enter 从不被拦截）。
- 菜单/弹窗与非 `plain` 阶段永远优先；提交发送与会话切换都会重置为 IDLE。
- 引用 chip（U+FFFC 占位符）随召回/还原的草稿文本一起保留。
- `historyScope: 'workspace'` 读取其他已列表会话的实时装配；装配尚未物化的会话暂时没有贡献。
- 搜索覆盖层是纯 DOM（无 React 依赖）；最多渲染 `maxHistory` 条匹配。
- **压缩感知是观察性的。** 安装前（或会话切换前）已落地的检查点绝不触发通知；摘要事件落在已加载窗口之外的检查点不产生 `[compacted] …` 条目（`summary: null`）。
- 通知的"Compact now"按钮只把配置的命令文本*填入*草稿 —— 发送仍由你的 Enter 决定。
- **片段、模板与洞察是浏览器本地的。** 名称用 kebab-case（1..64 字符）；标签上限 8 × 32 字符。模板变量从实时会话解析；`{{draft}}` 是选取时刻的草稿。

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

- [@PerryLink](https://github.com/PerryLink) — 创建者与维护者：边缘优先的方向键召回、持久化历史、反向搜索、滑动上下文感知、片段库、提示词模板、复用洞察，以及 `dsh.bundle` / `dshWorkshop` manifest。

## PerryLink DSH Plugin Family

本项目是 [PerryLink](https://github.com/PerryLink) 维护的 [15 个 DeepSeek Harness 插件](https://github.com/PerryLink)之一。如果这个对你有用，其余的很可能同样有用：

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

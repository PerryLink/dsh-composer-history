<div align="center">

# ⌨️ dsh-composer-history

> Release stamp: `0.8.8` (2026-10-04).
- **1024 商店渠道**：先 `npm i -g dsh1024`，再 `dsh1024 plugin --profile web add dsh-composer-history`（计入 [deepseek1024.com](https://deepseek1024.com) 安装排行）。

**DeepSeek Harness Web GUI 作曲器的终端式输入历史。**

*像在终端里一样按 ↑ —— 你打到一半的草稿不会丢。*

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
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-composer-history?metric=downloads&lang=zh)](https://dshfind.com/zh/plugins/PerryLink/dsh-composer-history?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-composer-history
```


</div>

---


**📖 生态实测知识库**（实测数据，不是营销）：[插件开发指南 · 选型实测数据 · 维护取舍判据](https://perrylink.github.io/dsh-plugin-guide/)。

<!-- star-cta -->
## Install & uninstall

npm 包自带构建产物；源码 checkout 须先构建（`pnpm run build`）—— 客户端包检查会拒绝未构建的 bundle 启动。

- **git 渠道**（最新 `main`）：`dsh plugin --profile web add github:PerryLink/dsh-composer-history`。
- **npm 渠道**（已发布版本）：`dsh plugin --profile web add dsh-composer-history`。
- **tarball 渠道**：在本仓库执行 `pnpm pack`，然后 `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`。
- **卸载**：`dsh plugin --profile web remove dsh-composer-history`（或从 profile patch 中移除该行）。

## ⭐ 如果它帮到了你

这个插件是 [DSH 插件家族](https://github.com/PerryLink)的一员（95 个，全部 Apache-2.0）。如果你在用，**给个 star** —— 它不会解锁任何功能，但会让下一个人在搜索里更容易找到它。

*English:* part of a 95 plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.

## What is dsh-composer-history?

DeepSeek Harness Web GUI 作曲器的终端式输入历史。

像在终端里一样按 ↑ —— 你打到一半的草稿不会丢。

![dsh-composer-history 终端演示：dsh-composer-history — /save and /load, plus arrow recall and Ctrl+R search](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-hero.png)

![Animated terminal demo of dsh-composer-history](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-demo.gif)

*同一次运行，动图版。*

## Compatibility

| Surface | Status |
|---|---|
| 宿主 | DeepSeek Harness `dsh-v0.2.1-rc.2`（2026-10-18 验证）：`engines.dsh >=0.2.1-0 <0.3.0`；P0 兼容路径已有回归测试。 |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | 仅 Web GUI（客户端插件；浏览器本地存储；无网络、无原生代码） |
| Model | 任意（不发模型请求 —— 纯 UI 行为） |

浏览器半边基于已发布的客户端包（`dsh-client-ui-conversation`、`dsh-client-ui-input-trigger`、`dsh-client-ui-settings`）与 cordis `Context`；它不再依赖已移除的 `dsh-client-runtime` 包，因此客户端接口面同样对齐 `0.1.2-rc.1` 宿主。
拦截锚定 Web 作曲器的 DOM：`[data-input-scroll]` 内的 contenteditable 表面 `div[data-composer-input]`（自 0.1.2-alpha.5 / 0.1.2-rc.1 起随附的 Lexical 作曲器），同时保留对 `[data-input-scroll]` 内旧式 textarea 作曲器（0.1.1-rc.2 及以前宿主线）的匹配；其余 textarea 一律穿过。compat 工作流的 jsdom web 行为冒烟针对打包产物断言该身份/文本/光标面。
0.1.2-rc.1（2026-09-04 已适配）：会话信封保留 ignorable 字段但仅用于存量日志读取兼容——Session.append 仍无法盖章，门控行为不变。已于 2026-09-06 对照 dsh-v0.1.7-alpha.1 master checkout 核验（全部门禁链 + profile 试装冒烟）。
0.1.5-rc.1（2026-09-10 已适配）：依赖钉号移至已发布的 0.1.5-rc.1 线；无接缝变更影响本插件行为。
0.1.5-rc.2（2026-09-11 已适配）：依赖钉号移至已发布的 0.1.5-rc.2 线；无接缝变更影响本插件行为。
0.1.7-alpha.1（2026-09-22 已适配）：设置接缝在两个半边都被替换。宿主半边不再通过已移除的 `ctx.settings.register(ns, schema, { base })` 注册 `composer-history` 命名空间——该线上插件的持久设置面就是它自己的活 `Config`：每个可调项声明为 `.volatile()`，profile 条目 id（`composer-history`，即 bundle patch 的行 id）就是表单名，`apply` 认领生成表单的呈现策略（`ctx.settings.configure({ auto: true }, ctx.fiber)`，由 effect 持有以便 reload 干净重注册）。浏览器半边改经 `ctx.configForms.get('composer-history')` 读取同一条目，取代已移除的 `ctx.settingsScope.bind({ namespace })`；快照/订阅形状未变，因此每次提交的变更仍会重装接线。可编辑面是**保留**而非新增：旧命名空间暴露过的字段全部 volatile，没有任何新字段变成可编辑。既有的 `settings.yaml` 中名为 `composer-history` 的小节由宿主自身迁移进同 id 的 profile 条目。

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

所有可调项都是 Schemastery `Config` 字段（可从 cordis.yml 与该条目的设置表单修改；profile patch 即持久化文档）。按 id 的覆盖会替换整行 —— 重新列出你需要的每个键。非法枚举值会响亮地中止整个 dsh 启动，设置表单的编辑也会在持久化前由宿主拒绝非法值。

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
| `composer-history` | settings form | 该 profile 条目自身的活 `Config` 表单——把解析后的配置（cordis.yml 基线与 profile 覆盖）带进浏览器半边 |

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

## 备份导出与导入

四个浏览器本地库统一导出/导入为一份带版本号的 JSON 文档。面板的 **Export JSON / Copy JSON / Import file / Paste JSON** 操作完全在浏览器内完成：导出时下载或复制到剪贴板，导入时选文件或粘贴文本——不会上传任何内容，不涉及宿主 RPC 或网络调用。

**文档结构**

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

**合并与冲突策略**

- 历史条目是纯字符串，按精确文本去重；重复或空白条目被跳过，绝不覆盖。
- 片段与模板按 `name` 为键；洞察按精确 `text` 为键。同键冲突时**最新时间戳胜出**（片段/模板看 `updatedAt`，洞察看 `lastUsedAt`）；更旧或等时间戳的导入被跳过，新键追加。
- 导入遵守 `maxPersisted` 与 `maxSnippets`；模板与洞察止于固定协议上限（各 `500`）。
- 结果通知会报告写入多少条、跳过多少条（更旧/重复）。

**模式版本**

`schemaVersion` 从 `1` 开始。导入按版本逐步迁移（一次一个版本），未来格式可就地升级旧文档。`schemaVersion` **高于**当前构建理解的文档以错误拒绝——绝不静默丢弃或部分合并；过旧无法迁移的版本同样拒绝。

## Sliding context

harness 核心给每个 dsh 会话提供滑动上下文窗口 —— 与 Claude Code 和 Codex 同款的工作流：当会话接近模型的上下文上限（或提供方回报溢出）时，harness 会**自动压缩** —— 更早的轮次被总结为留在会话记录中的 `compaction` 检查点标记，模型只保留摘要加上最近的尾部，会话继续；`/compact` 可随时手动触发同样的压缩，标记在记录中渲染为可展开的"上下文已压缩"行。

`dsh-composer-history` 把作曲器接入这个工作流，让上下文窗口滑动时你的输入历史一条不丢：

- **召回跨压缩留存** —— 被遮蔽的轮次仍留在 Chat 视图发布的已结算会话里，↑ 依旧能走过检查点前后你发送过的每一条消息。
- **摘要加入历史** —— 每个检查点的摘要文本以 `[compacted] …` 条目进入 ↑ 召回和 `Ctrl+R` 搜索（开关：`includeCompactionSummaries`），模型不再逐字看到的上下文仍然一键可达。
- **压缩通知** —— 页面打开期间有检查点落地时，底部弹出短暂通知（Claude Code 的"自动压缩会话…"时刻），附摘要片段和一键**填入 `/compact`** 按钮（`showCompactionNotice`、`compactCommandText`）；填入只进普通草稿，只有你按 Enter 才发送。
- **搜索计数** —— `Ctrl+R` 面板新增实时的 `N entries` / `N matches` 状态行，长条目限两行显示。

> 压缩本身（阈值、摘要模型、`/compact`）由 harness 核心的 compaction 插件负责 —— 本插件只观察 Chat 视图的会话投影（`uiConversation.binding(id).target('chat').legacy.nodes`）已经发布的检查点标记，因此不需要任何 agent-loop 或模型请求改动。

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

- **作曲器 DOM 面。** 拦截锚定宿主私有 DOM：`[data-input-scroll]` 内的 contenteditable `div[data-composer-input]`（0.1.2-alpha.5 / 0.1.2-rc.1 及以后的宿主）；`[data-input-scroll]` 内的旧式 textarea 作曲器（0.1.1-rc.2 及以前）保持匹配。该形状并非公开 API（上游提案 C3 记载插件只能猜测宿主 DOM），未来宿主 DOM 变化可能让拦截静默失效 —— compat 工作流的 jsdom 冒烟针对打包产物重新断言该面。
- **逻辑行 vs 视觉行。** 默认 `logical` 按 `\n` 判定（一条自动折行的长消息算一行）；`visual` 通过复制 contenteditable 表面计算盒的隐藏 mirror（每次边缘检查 O(行数·log n) 二分，按草稿/宽度 memoize）测量真实折行。mirror 测量需要真实布局引擎 —— 纯 span 数学已单测覆盖；Lexical 作曲器上测得的 span 保持尽力而为（默认仍为 `logical`）。
- **持久化历史按浏览器隔离。** 存储位于某一 origin 的 `localStorage`，不在浏览器或机器间同步。损坏载荷静默重置。
- **撤销栈包含召回事务。** 每次填充/还原都是输入机撤销日志里的一条 `setDraft` 事务；Ctrl+Z 会一步步退回召回。精确化需要上游暴露 edit-range。
- 召回 `/xxx` 条目后按 Enter 走正常的命令 claim/adjudication 路径（符合预期，且 Enter 从不被拦截）。
- 菜单/弹窗与非 `plain` 阶段永远优先；提交发送与会话切换都会重置为 IDLE。
- 引用 chip（U+FFFC 占位符）随召回/还原的草稿文本一起保留。
- `historyScope: 'workspace'` 读取其他已列表会话的 Chat 目标；本页面尚未激活过 Chat 视图的会话暂时没有贡献。
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

本项目是 [PerryLink](https://github.com/PerryLink) 维护的 DeepSeek Harness 插件家族成员：**87 个活跃维护**，名册共 **95** 个，其中 **5 个已冻结**、**3 个已退役**。完整名单默认折叠，避免每个 README 的首屏被长表淹没；点击展开可查看每一行，原因见「状态」列。

<details>
<summary>展开全部 95 个插件</summary>

| 插件 | 一句话 | 状态 |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 已退役 — 见仓库 README |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 已冻结 — 见仓库 README |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 已冻结 — 见仓库 README |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 已冻结 — 见仓库 README |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 已冻结 — 见仓库 README |
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
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 已冻结 — 见仓库 README |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 已退役 — 见仓库 README |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 已退役 — 见仓库 README |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>

## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors

### 从 DSH Desktop 市场安装

所有 PerryLink 插件均可在 DSH Desktop 内置市场中浏览：**市场 → 来源 → 添加来源 → 粘贴** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ 选中**。安装仍需通过市场的 npm 身份校验与你的确认。

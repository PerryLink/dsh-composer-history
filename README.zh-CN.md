# ⌨️ dsh-composer-history

**DeepSeek Harness Web GUI 作曲器的终端式输入历史。**

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md)

<p align="center">
  <a href="https://github.com/topics/dsh"><img alt="topic: dsh" src="https://img.shields.io/badge/topic-dsh-8A2BE2"></a>
  <a href="https://github.com/topics/dsh-plugin"><img alt="topic: dsh-plugin" src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2"></a>
  <a href="https://github.com/topics/deepseek-harness"><img alt="topic: deepseek-harness" src="https://img.shields.io/badge/topic-deepseek--harness-8A2BE2"></a>
  <br>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <a href="https://www.npmjs.com/package/dsh-composer-history"><img alt="npm version" src="https://img.shields.io/npm/v/dsh-composer-history"></a>
  <a href="https://www.npmjs.com/package/dsh-composer-history"><img alt="npm downloads" src="https://img.shields.io/npm/dm/dsh-composer-history"></a>
  <a href="https://github.com/PerryLink/dsh-composer-history/actions/workflows/ci.yml"><img alt="ci" src="https://github.com/PerryLink/dsh-composer-history/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./package.json"><img alt="node" src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933"></a>
  <img alt="tests" src="https://img.shields.io/badge/tests-217%2F217-brightgreen">
  <img alt="harness client" src="https://img.shields.io/badge/harness%20client-types%20rc.6-orange">
</p>

像在终端里一样按 **↑** —— 但你打到一半的提示词不会被丢。`dsh-composer-history` 把 Claude Code 的"边缘优先"方向键模型带进 dsh Web 作曲器，并且更进一步：当你走回最新一条（或按 `Esc`）时，被暂存的草稿和光标位置会**原样还原**，而不是被清空。在此之上：已发送的消息会**持久化在浏览器本地**，历史跨刷新、跨会话保留；`Ctrl+R` 打开**反向搜索**；所有按键与可调项都可配置。当 harness 的**滑动上下文**压缩长会话时（与 Claude Code / Codex 同款的自动压缩工作流），插件让这些历史继续可用：检查点摘要加入召回与搜索，并在每次压缩时弹出带有"一键填入 `/compact`"的短暂通知。

> 纯 UI 行为：不产生会话事件、不改 agent-loop、不发模型请求。召回的文本只进入普通作曲器草稿，只有你按下 Enter 才会到达模型。持久化历史是浏览器本地文本（见[隐私](#隐私)）。

## ✨ 亮点

- 🎯 **边缘优先的方向键** —— 裸 ↑/↓ 先移动光标；只有当光标位于草稿首行/末行时才触发历史召回。
- 💾 **草稿暂存** —— 首次召回暂存 `{draft, caret}`；回到最新一条（或按 `Esc`）时两者精确还原。Claude Code 在这里是清空——我们是还原。
- 🛡️ **分歧守卫** —— 编辑一条召回的记录，浏览立即结束；你的编辑成为新草稿。
- 🔄 **实时历史** —— 每次按键都从会话快照重新提取：`kind === 'user'` 消息、文本块拼接、跳过空条目、合并相邻重复、最新在后。新发送的消息自动加入。
- 💿 **持久化历史** —— 每条已发送消息追加到有界的浏览器本地存储（`dsh.composer-history.v1`），刷新页面或切换会话后仍可召回。`persistHistory: false` 可关闭。
- 🗂️ **工作区范围** —— `historyScope: 'workspace'` 把其他已列表会话的消息排在当前会话之前。
- 🔍 **反向搜索** —— `Ctrl+R`（可配置）在作曲器下方打开查询面板：输入过滤、↑/↓ 选择、Enter 填充、Esc 取消。
- 🎛️ **每个按键都可配置** —— `upKey`/`downKey`/`escapeKey`/`searchKeys` 都在 Config schema 里，不硬编码。
- 🧭 **感知滑动上下文** —— harness 自动压缩（Claude Code / Codex 同款）时，检查点摘要以 `[compacted] …` 条目加入 ↑ 召回与 `Ctrl+R` 搜索；每次压缩弹出短暂通知（带一键"填入 `/compact`"按钮）。见[滑动上下文](#-滑动上下文)。
- ⚙️ **Settings 集成** —— 宿主半边注册 `composer-history` settings 命名空间（cordis.yml 配置成为组合 `base` 层）；settings 文档中的用户覆盖会到达浏览器。没有 settings 服务时插件照常工作。
- 🚦 **完整门控** —— 仅在 `plain` 输入阶段拦截；对斜杠菜单、命令弹窗、IME 组合、文本选区、alt/meta/shift 组合键一律放行。放行路径零副作用。
- 📐 **两种边缘模式** —— `logical`（按换行符，默认）或 `visual`（隐藏 mirror div 测量真实折行）。

## 🎬 使用体验

```text
$ 你打到一半的提示词，按 ↑
        └─ 草稿被暂存，最新一条历史填入作曲器
$ ↑ ↑ … 走向更早的记录          $ ↓ ↓ … 走回最新一条
        └─ 到最旧一条：按住不动（no-op）     └─ 再按一下 ↓：草稿回来了，
                                                  光标也在原位
$ 随时按 Esc → 立即还原，浏览结束
$ 按 Ctrl+R → 输入片段 → ↑/↓ → Enter → 匹配项填入作曲器
```

## 🚀 快速开始

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # 全绿：234/234
pnpm run test:coverage                                  # 分模块覆盖率报告
pnpm run check:readmes && pnpm run verify:pack          # 文档一致性 + 打包面
```

然后注册到 profile（见[安装](#安装)），运行 `dsh --profile <your-profile> --port 3080`。

## 📦 安装

启动**之前**先构建 —— 客户端包检查会拒绝从未构建产物启动。

> 从 npm 安装：`pnpm add dsh-composer-history`（或 npm/yarn）自带构建产物——跳过步骤 1 和 5。包同时声明了 `dsh.bundle` manifest（根目录 `cordis.patch.yml`），`dsh plugin add` 类安装器可直接注册插件行。

1. 构建插件（见上）。
2. 在 `$DSH_HOME/profiles/<your-profile>/cordis.patch.yml` 里注册这一行。行 `name` 用**裸包名**：浏览器图的行 id *就是*这个字符串，客户端 bundle 在构建时也盖上同一个 id。

   ```yaml
   # 追加在 bundle 层之后
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
           maxHistory: 500           # 0 = 不限
           includeKinds: [user]      # 可选加入 'steering'
           historyScope: session     # 'session' | 'workspace'
           persistHistory: true
           maxPersisted: 200         # 0 = 不限
           enableSearch: true
           searchKeys: [Ctrl+R]
           searchCaseSensitive: false
           includeCompactionSummaries: true   # 摘要加入召回/搜索
           showCompactionNotice: true         # 压缩时显示短暂通知
           compactCommandText: /compact       # "立即压缩"填入的文本；'' 隐藏按钮
   ```

   `config:` 块由宿主 Loader 用同一 schema 校验；当 settings 服务存在时，还会作为 settings 的 `base` 层流入浏览器 —— 所以这些值真正到达浏览器半边，而不只是被校验一遍。

3. 裸行还必须出现在该 profile 的 resolver manifest 中 —— 宿主 Loader 从 profile 目录的 `node_modules` 解析它们：

   `$DSH_HOME/profiles/<your-profile>/package.json`：

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

4. 在 profile 目录里执行 `pnpm install`，然后：

   ```sh
   dsh --profile <your-profile> --port 3080
   ```

5. tarball 安装（任意包管理器）：在本目录执行 `pnpm pack`，然后在 profile 的 `package.json` 里引用该 tarball。发布前用 `pnpm run verify:pack` 检查打包面。

## ⚙️ 配置

每个可调项都活在 Schemastery `Config` schema 里（不硬编码）。非法枚举值**响亮地中止整个 dsh 启动** —— 宿主 Loader 用同一 schema 校验你的 cordis.yml 块；settings 段在使用前还会在浏览器里再校验一次。

| 字段 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`：非空草稿在召回前被暂存；`gate`：只有空草稿才召回（Claude/Codex 式门控） |
| `restoreOnEscape` | `boolean` | `true` | 浏览时按 `Esc` 还原暂存草稿 |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | 边缘判定按 `\n` 行，或按测量出的折行 |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ 与裸方向键行为一致 |
| `restoreCaret` | `boolean` | `true` | 回到底部 / `Esc` 时同时还原暂存光标 |
| `upKey` | `string` | `'ArrowUp'` | 向上召回的 `KeyboardEvent.key`；`''` 表示禁用 |
| `downKey` | `string` | `'ArrowDown'` | 走向更新 / 还原的 `KeyboardEvent.key`；`''` 表示禁用 |
| `escapeKey` | `string` | `'Escape'` | 退出浏览的 `KeyboardEvent.key`；`''` 表示禁用 |
| `maxHistory` | `number` | `500` | 召回条目上限（保留最新）；`0` = 不限 |
| `includeKinds` | `string[]` | `['user']` | 允许进入历史的会话节点 kind（加入 `'steering'` 以包含 steer 消息） |
| `historyScope` | `'session' \| 'workspace'` | `'session'` | `'workspace'` 把其他已列表会话的用户消息排在当前会话之前 |
| `persistHistory` | `boolean` | `true` | 把已发送消息追加到浏览器本地存储（见[隐私](#隐私)） |
| `maxPersisted` | `number` | `200` | 存储条目上限；`0` = 不限 |
| `enableSearch` | `boolean` | `true` | 启用 `Ctrl+R` 反向搜索覆盖层 |
| `searchKeys` | `string[]` | `['Ctrl+R']` | 打开搜索的组合键规格（修饰键 `Ctrl`/`Alt`/`Meta`/`Shift` + 键名）；非法规格会使浏览器 fiber 响亮失败 |
| `searchCaseSensitive` | `boolean` | `false` | 搜索匹配是否区分字母大小写 |
| `includeCompactionSummaries` | `boolean` | `true` | 把 `[compacted] …` 检查点摘要纳入召回与搜索 |
| `showCompactionNotice` | `boolean` | `true` | 检查点落地时显示短暂通知 |
| `compactCommandText` | `string` | `'/compact'` | 通知中"立即压缩"按钮填入作曲器的斜杠命令；`''` 隐藏该按钮 |
| `enableSnippets` | `boolean` | `true` | 启用片段库（`/save`、`/load`、搜索面板选取） |
| `maxSnippets` | `number` | `200` | 最大存储片段数；`0` = 无限制 |
| `enableTemplates` | `boolean` | `true` | 启用提示词模板库（插入时填充变量） |
| `enableInsights` | `boolean` | `true` | 启用复用洞察提示（本地使用统计） |
| `insightMinUses` | `number` | `2` | 复用提示显示前的最少使用次数 |
| `enableCompactionHighlight` | `boolean` | `true` | 在搜索面板中给 `[compacted] …` 摘要加醒目徽标 |

## 🎹 按键绑定

| 按键 | 状态 | 行为 |
| --- | --- | --- |
| ↑ | IDLE，光标在首行 | 暂存 {draft, caret}，填入最新条目，光标到末尾（无历史 → 放行） |
| ↑ | BROWSING，光标在首行 | 走向更早条目；在最旧一条按住不动（拦截，无任何变更） |
| ↑ | 光标不在首行 | 完全放行（浏览器移动光标） |
| ↓ | IDLE | 始终放行（普通光标移动） |
| ↓ | BROWSING，光标在末行 | 走向更新条目；到最新一条 → 还原 `savedDraft` + `savedCaret` → IDLE |
| ↓ | 光标不在末行 | 完全放行 |
| Esc | BROWSING（`restoreOnEscape: true`） | 还原 `savedDraft` + `savedCaret` → IDLE，拦截 |
| Esc | 其他情况 | 放行（菜单/弹窗的 Escape 语义不受影响） |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | 与裸方向键一致 |
| `searchKeys` 组合键 | 作曲器聚焦、`plain` 阶段、无菜单/选区/IME | 打开反向搜索；浏览结束，当前显示的文本成为草稿 |
| Shift/Alt/Meta+方向键、IME、选区 | 任意 | 始终放行 |

`upKey`/`downKey`/`escapeKey`/`searchKeys` 可以重命名上表按键；修饰键策略（以及搜索组合键的精确修饰键匹配）不变。搜索覆盖层内：↑/↓ 移动匹配选择（选中行自动滚入可见区域）、Enter 填充、Esc 取消、点击选中、点击面板外取消；匹配到的子串会在每行中高亮显示。

## 🔍 反向搜索

- **打开**：作曲器聚焦且输入处于 `plain` 阶段时按下 `searchKeys` 组合键（此时 `Ctrl+R` 也会拦截浏览器的页面刷新——按键只在作曲器内被消费）。
- **过滤**：对合并历史（当前会话 + 持久化 + 工作区条目）做子串匹配；是否区分大小写由 `searchCaseSensitive` 决定。
- **选中**：Enter 填充草稿并把光标移到末尾——与普通召回同一条 `setDraft` 写路径。召回文本只有在你随后按 Enter 时才会到达模型。
- **取消**：Esc 或点击面板外；草稿不被触碰。

## 🧭 滑动上下文

harness 核心给每个 dsh 会话提供滑动上下文窗口 —— 与 Claude Code 和 Codex 同款的工作流：当会话接近模型的上下文上限（或提供方回报溢出）时，harness 会**自动压缩** —— 更早的轮次被总结为留在会话记录中的 `compaction` 检查点标记，模型只保留摘要加上最近的尾部，会话继续；`/compact` 可随时手动触发同样的压缩，标记在记录中渲染为可展开的"上下文已压缩"行。

`dsh-composer-history` 把作曲器接入这个工作流，让上下文窗口滑动时你的输入历史一条不丢：

- **召回跨压缩留存** —— 被遮蔽的轮次仍留在会话快照里，↑ 依旧能走过检查点前后你发送过的每一条消息。
- **摘要加入历史** —— 每个检查点的摘要文本以 `[compacted] …` 条目进入 ↑ 召回和 `Ctrl+R` 搜索（开关：`includeCompactionSummaries`），模型不再逐字看到的上下文仍然一键可达。
- **压缩通知** —— 页面打开期间有检查点落地时，底部弹出短暂通知（Claude Code 的"自动压缩会话…"时刻），附摘要片段和一键**填入 `/compact`** 按钮（`showCompactionNotice`、`compactCommandText`）；填入只进普通草稿，只有你按 Enter 才发送。
- **搜索计数** —— `Ctrl+R` 面板新增实时的 `N entries` / `N matches` 状态行，长条目限两行显示。

> 压缩本身（阈值、摘要模型、`/compact`）由 harness 核心的 compaction 插件负责 —— 本插件只观察客户端快照已经暴露的检查点标记，因此不需要任何 agent-loop 或模型请求改动。

## 🧠 智能输入层

在终端式历史之上，三套浏览器本地库把作曲器变成可复用的输入面：**片段库**（`/save <名字>` 把当前输入存为带标签的命名片段、`/load <名字>` 或 `Ctrl+R` 选取插入，工作区作用域、浏览器本地持久化）、**提示词模板**（`{{workspace}}`/`{{session}}`/`{{draft}}` 变量在插入时实时填充；模板库仅在显式点击时以 JSON 导出/导入）、**复用洞察**（本地统计高频提示词，作曲器下方轻量提示「在 N 个会话里用过 M 次」；绝不上传）。压缩摘要继续以 `[compacted] …` 形式与历史同源展示，并在搜索面板中加琥珀色徽标高亮。全部数据仅存本浏览器 `localStorage`（`dsh.composer-history.snippets.v1` / `.templates.v1` / `.insights.v1`），损坏载荷静默重置。

## 🔒 隐私
## 🔒 隐私

`persistHistory: true`（默认）把已发送消息写入本浏览器 `localStorage` 的 `dsh.composer-history.v1` 键，受 `maxPersisted` 限制，绝不上传，仅同源页面可读。用 `persistHistory: false` 关闭——召回随即只使用实时会话投影（和工作区范围），与 v1 行为一致。损坏或外来的载荷会被静默重置。要清除全部已存储数据，请在页面 DevTools 控制台执行 `localStorage.removeItem('dsh.composer-history.v1')`。
智能输入层新增三个键，遵守同一策略（浏览器本地、绝不上传、损坏载荷静默重置）：`dsh.composer-history.snippets.v1`（片段文本 + 标签 + 使用计数）、`dsh.composer-history.templates.v1`（模板文本）、`dsh.composer-history.insights.v1`（去重提示词文本 + 每会话使用计数）。用同样的 `localStorage.removeItem(...)` 方式可清除任一库。

## ✅ 验证

1. 打开 Web UI，确认 `window.__DSH_BOOT__` 包含本插件行（`id: "dsh-composer-history"`、`url: "/plugins/dsh-composer-history/client.js?rev=…"`）。
2. 请求 `/plugins/dsh-composer-history/client.js` —— 期望 `200`（`text/javascript`）。
3. 手动清单：
   - 空作曲器：↑ 召回最后一条消息；继续 ↑ 走向更早；↓↓ 回到最新；再按一下 ↓ 回到空。
   - 打到一半的草稿：↑ 暂存并召回；↓↓ 到底还原草稿**包括光标**；`Esc` 立即还原。
   - 多行草稿：行中间的 ↑/↓ 只移动光标；只有首行/末行触发召回。
   - 召回 `/xxx` 条目后按 Enter 会正常裁决该命令（符合预期）。
   - 斜杠菜单打开时，↑/↓ 只高亮菜单项。
   - 模型生成期间（phase ≠ `plain`）方向键绝不召回。
   - Shift+↑/↓ 选区、IME 组合、Ctrl+Z/Y 撤销/重做均不受影响。
   - `Ctrl+R` 打开搜索面板；输入即过滤；↑/↓ + Enter 填充；Esc 不动草稿。
   - 刷新页面后，↑ 能召回刷新前发送的消息（`persistHistory` 开启时）。
   - `historyScope: 'workspace'` 时，其他已列表会话的条目排在当前会话之前。
   - 一次压缩落地后（自动或 `/compact`），↑ 能走入 `[compacted] …` 摘要条目；`Ctrl+R` 能按摘要文本搜到它。
   - 压缩通知出现在底部、到时自动消失，其按钮把 `/compact` 填入作曲器。
4. 门禁：`pnpm run typecheck`、`pnpm run build`、`pnpm run test` —— 全绿，包括在 jsdom 中经真实 `__ModuleLoader__` handshake 执行**构建产物**的 smoke 测试；另有 `pnpm run test:coverage`、`pnpm run check:readmes`、`pnpm run verify:pack`。

## 🔬 兼容性基线（2026-08-14 于本机实测）

- **类型**：devDependencies 固定 npm 上已发布的客户端包 **0.1.0-rc.6**（`dsh-client-runtime`、`dsh-client-ui-conversation`、`dsh-client-ui-input-trigger`、`dsh-client-ui-settings`、`dsh-settings`、`dsh-api-remotes`）；`typecheck` 不再依赖本地 checkout。运行时 smoke 针对客户端包为 **0.1.0-rc.5** 的 checkout；`@deepseek-ai/cordis` **4.0.1**；`@deepseek-ai/schemastery` **3.18.1**。
- **rc.6 中压缩标记对客户端可见**：`ConversationNode` 包含 `CompactionSummaryNode`（`kind: 'compaction'`，带 `summary`/`shadowedItemCount`/`shadowedTokenCount`），且每个标记之上的记录保持完整 —— 被遮蔽的轮次不会从快照移除。滑动上下文功能只读取这个已发布的面。
- `InputState` 阶段（读自 `packages/client/ui-conversation/src/client/input/contract.ts`）：`'plain' | 'adjudicating' | 'claimed' | 'submitting'`，外加 `draft`/`draftRev`。唯一的公开草稿写路径是 `ctx.conversation.input.for(actx).setDraft(text)`；带 `editRange` 的 `ComposerKeyboard` 面是 InputBar 私有（见 `docs/upstream-proposals.md` C1）。
- **客户端插件元数据是嵌套的 `dsh.client` 字段**（`packages/client/modules` 的 `resolveMeta` 读 `pkg.dsh.client`）：放错位置会静默丢掉启动图里的包——没有报错。
- **vendored cordis 被重命名为 `@deepseek-ai/cordis`**：只做类型导入；构建出的 `lib/client.js` 运行时零 cordis 导入（完全没有 `require(` 调用）。
- **浏览器启动不向插件传 config**（启动图携带 `{id, url, rev, inject, immediately}`）：浏览器半边解析 schema 默认值；而新路径是——settings 传输就绪后，settings scope 送达宿主解析后的段（cordis.yml `base` + 用户覆盖）。没有 settings 服务时插件回落到 schema 默认值，与之前完全一致。实测：`recallWithDraft: bogus` 会以 `failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"` 中止整个启动。
- **Settings 传输仅限回环**：远程浏览器读不到宿主文档；其 scope 报告 memory/unavailable 模式，插件回落到默认值（历史存储无论何时都是浏览器本地）。
- **重新启动前先重建**：启动检查读的是 `lib/client.js`；未构建的包会被拒绝，浏览器永远只取构建产物。
- **只导入导出符号**：跨包读取使用 `@deepseek-ai/dsh-client-*` `/client` 入口导出的类型/服务；把 `inputTriggers` 服务实例断言为 `InputTriggerService` 是受认可的社区模式（此处为仅类型导入 + `ctx.get('inputTriggers') as InputTriggerService | undefined`，注释说明缘由）。
- 客户端 bundle 契约：一个 CJS factory 包在 `window.__ModuleLoader__.load({ id, factory })` 里，平台模块（react、cordis、slots、… 以及 `@deepseek-ai/dsh-client-runtime/client` 豁免）保持外部，其余全部内联。本插件无需运行时外部依赖；tsdown 配置防御性地声明了该列表。
- Profile 文件必须是**无 BOM 的 UTF-8**（`readProfileManifest` 直接 `JSON.parse`；BOM 会以 `Unexpected token '\uFEFF'` 中止启动——实测）。

## ⚠️ 已知限制

- **逻辑行 vs 视觉行**：默认 `logical` 按 `\n` 判定（一条自动折行的长消息算一行）；`visual` 通过 mirror（隐藏节点，每次边缘检查 O(行数·log n) 二分，按草稿/宽度 memoize）测量真实折行。mirror 测量本身需要真实布局引擎——纯 span 数学已单测覆盖（见 `tests/visual-mirror.spec.ts`）。
- **持久化历史按浏览器隔离**：存储位于某一 origin 的 `localStorage`，不在浏览器或机器间同步。损坏载荷静默重置。
- **撤销栈包含召回事务**：每次填充/还原都是输入机撤销日志里的一条 `setDraft` 事务；Ctrl+Z 会一步步退回召回。插件从不修改撤销/重做语义；精确化需要上游暴露 edit-range（见 `docs/upstream-proposals.md` C1）。
- 召回 `/xxx` 条目后 Enter 走正常的命令 claim/adjudication 路径（符合预期，且 Enter 从不被拦截）。
- 菜单/弹窗与非 `plain` 阶段永远优先；提交发送（程序化清空草稿）和会话切换都会重置为 IDLE。
- 引用 chip（U+FFFC 占位符）随召回/还原的草稿文本一起保留。
- `historyScope: 'workspace'` 读取其他已列表会话的实时装配；装配尚未物化的会话暂时没有贡献。
- 搜索覆盖层是纯 DOM（无 React 依赖）；最多渲染 `maxHistory` 条匹配。
- **压缩感知是观察性的**：插件安装前（或会话切换前）已落地的检查点绝不触发通知；只有页面打开期间落地的标记才会。摘要事件落在已加载窗口之外的检查点不产生 `[compacted] …` 条目（`summary: null`）。
- 通知的"立即压缩"按钮只把配置的命令文本*填入*草稿 —— 发送（以及 `/compact` 自身的受理）仍由你的 Enter 决定。

## 🗺️ 上游提案

写给 `deepseek-ai/deepseek-harness` 的三条扩展点提案见 [`docs/upstream-proposals.md`](docs/upstream-proposals.md)：公开输入面的 edit-range 写入（C1）、导出触发器检测纯函数（C2）、文档化的作曲器键盘仲裁链（C3）。

## 🏷️ 话题与生态

本项目属于 DeepSeek Harness 插件生态。建议的 GitHub 话题（在仓库设置中设置）：

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `compaction` · `sliding-context` · `typescript`

相关链接：[github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 🙌 贡献者

感谢为本插件做出贡献的每一位：

- [PerryLink](https://github.com/PerryLink) — 创建者与维护者：v0.1.0 至 v0.4.0 全部版本（边缘优先方向键召回、持久化历史、反向搜索、滑动上下文感知、搜索面板打磨、`dsh.bundle` 与 `dshWorkshop` manifest）。

欢迎通过 PR 加入这个名单。

## 📄 许可证

[Apache License 2.0](./LICENSE) · 发布历史见 [CHANGELOG.md](./CHANGELOG.md)

## PerryLink DSH 插件家族

本项目是 [PerryLink](https://github.com/PerryLink) 维护的 [15 个 DeepSeek Harness 插件](https://github.com/PerryLink)之一。如果你觉得这个插件有用，其余的很可能同样有用：

| 插件 | 一句话说明 |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | 只读 MCP 运行时面板：/mcp 命令 + 设置页，状态/工具/错误一览 |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | 工程纪律守门：需求审讯、测试证据门、对抗评审 |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | 持久化后台子代理：Web 侧边栏进度、随时留言与打断 |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | 基于语言服务器的诊断/格式化/补全/代码动作/重命名 |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | 对标 Claude Code outputStyles 的运行时风格切换 |
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | 对标 Claude Code /rewind：快照、会话 fork、一键回退 |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | Claude Code 风格声明式 allow/deny/ask 权限规则，带审计 |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | 审批链上的第二模型自动审查，默认 fail-closed |
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | 带审批门的跨会话记忆：ctx.memory + SQLite + memory 工具 |
| [dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security) | 安全审计技能包：密钥扫描、依赖与供应链审查 |
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | 在 Web 侧边栏置顶会话，持久排序 |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Web 作曲器终端式输入历史：方向键、Ctrl+R 搜索 |
| [dsh-github](https://github.com/PerryLink/dsh-github) | DSH 的 GitHub PR/issue 集成，所有写操作经审批门 |
| [dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) | 插件开发知识库，随 bundle 安装的按需 agent 技能 |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | 把 Claude Code 会话、记忆、技能和 CLAUDE.md 迁入 DSH |

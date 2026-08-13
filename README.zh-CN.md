# ⌨️ dsh-composer-history

**给 DeepSeek Harness Web GUI 输入框加上终端式输入历史召回。**

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md)

<p align="center">
  <a href="https://github.com/topics/dsh"><img alt="topic: dsh" src="https://img.shields.io/badge/topic-dsh-8A2BE2"></a>
  <a href="https://github.com/topics/dsh-plugin"><img alt="topic: dsh-plugin" src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2"></a>
  <a href="https://github.com/topics/deepseek-harness"><img alt="topic: deepseek-harness" src="https://img.shields.io/badge/topic-deepseek--harness-8A2BE2"></a>
  <br>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <a href="./package.json"><img alt="version" src="https://img.shields.io/badge/version-0.1.0-66ccff"></a>
  <a href="./package.json"><img alt="node" src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933"></a>
  <img alt="tests" src="https://img.shields.io/badge/tests-94%2F94-brightgreen">
  <img alt="harness client" src="https://img.shields.io/badge/harness%20client-0.1.0--rc.5-orange">
</p>

像在终端里一样按 **↑** 召回历史——但你打到一半的草稿永远安全。本插件把 Claude Code 的"光标优先边缘召回"键位模型带进 dsh web 输入框，并更进一步：回到底部（或按 `Esc`）时，暂存的草稿与光标位置会被**精确复原**，而不是被清空。

> 纯 UI 行为：不新增会话事件、不改 agent-loop、不进模型请求。召回文本只进入普通输入草稿，只有你按下 Enter 才会成为会话消息。

## ✨ 亮点

- 🎯 **光标优先的边缘召回** —— 裸 ↑/↓ 先移动光标，只有光标到达草稿首行/末行才触发历史召回。
- 💾 **草稿暂存** —— 首次召回暂存 `{draft, caret}`；回到最新一条（或按 `Esc`）时两者都被精确复原。Claude Code 在这里是清空，我们是复原。
- 🛡️ **分歧守卫** —— 编辑召回条目立刻结束浏览，编辑内容成为新草稿。
- 🔄 **实时历史** —— 每次按键从会话快照重新提取：`kind === 'user'` 消息、拼接 text 块、跳过空白、合并相邻重复、最新在末尾。发送后的新消息自动进入。
- 🚦 **全部门控** —— 仅在 `plain` 相位拦截；斜杠菜单、命令弹层、IME 组合、选区、alt/meta/shift 组合键一律放行；放行路径零副作用。
- 📐 **两种边缘判定** —— `logical`（按 `\n` 逻辑行，默认）或 `visual`（隐藏 mirror div 实测折行）。

## 🎬 使用体验

```text
$ 你打了半句话，按 ↑
        └─ 草稿被暂存，最新一条历史填入输入框
$ ↑ ↑ … 走到更旧        $ ↓ ↓ … 走回最新
        └─ 最旧处 hold（拦截但不修改）      └─ 再按一次 ↓：你的草稿回来了，
                                              光标也停在原来的位置
$ 任何时刻按 Esc → 立即复原，浏览结束
```

## 🚀 快速开始

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # 全绿：94/94
```

然后在 profile 里注册（见[安装](#安装)），启动 `dsh --profile <你的profile> --port 3080`。

## 📦 安装

**必须先 build 再启动**——客户端包校验会拒绝加载未构建的 bundle。

1. 构建插件（见上）。
2. 在 `$DSH_HOME/profiles/<你的profile>/cordis.patch.yml` 注册。行 `name` 必须用**裸包名**：浏览器图行 id 就是这串字符串，而客户端 bundle 在构建期内嵌的加载 id 与之一致。

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
   ```

3. 裸行还必须出现在 profile 的解析器清单里——host Loader 从 profile 目录的 `node_modules` 解析它：

   `$DSH_HOME/profiles/<你的profile>/package.json`：

   ```json
   {
     "name": "dsh-profile-<你的profile>",
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

4. 在 profile 目录执行 `pnpm install`，然后：

   ```sh
   dsh --profile <你的profile> --port 3080
   ```

## ⚙️ Config

所有可调参数都在 Schemastery `Config` schema 里（无硬编码旋钮）。非法枚举值会让**整个 dsh 启动响亮失败**——host Loader 用同一 schema 校验 cordis.yml 的 `config:` 块。

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`：非空草稿先暂存再召回；`gate`：仅空草稿允许召回（对齐 Claude/Codex 门控） |
| `restoreOnEscape` | `boolean` | `true` | BROWSING 中按 Esc 复原暂存草稿 |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | 按 `\n` 逻辑行判定边缘，或按 mirror 实测折行判定 |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ 与裸方向键同义 |
| `restoreCaret` | `boolean` | `true` | 回到底部/Esc 复原时一并恢复暂存光标 |

## 🎹 键位表

| 按键 | 状态 | 行为 |
| --- | --- | --- |
| ↑ | IDLE，光标在首行 | 暂存 {草稿, 光标}，填入最新一条，光标移到末尾（无历史则放行） |
| ↑ | BROWSING，光标在首行 | 更旧一条；到最旧处 hold（拦截但不修改） |
| ↑ | 光标不在首行 | 完全放行（浏览器移动光标） |
| ↓ | IDLE | 一律放行（普通光标移动） |
| ↓ | BROWSING，光标在末行 | 更新一条；已在最新 → 复原 `savedDraft` + `savedCaret` → IDLE |
| ↓ | 光标不在末行 | 完全放行 |
| Esc | BROWSING（`restoreOnEscape: true`） | 复原 `savedDraft` + `savedCaret` → IDLE，拦截 |
| Esc | 其他 | 放行（菜单/弹层的 Esc 语义不受影响） |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | 与裸方向键同义 |
| Shift/Alt/Meta+方向键、IME 组合、有选区 | 任意 | 一律放行 |

## ✅ 验证方法

1. 打开 Web UI，确认 `window.__DSH_BOOT__` 清单包含本插件行（`id: "dsh-composer-history"`、`url: "/plugins/dsh-composer-history/client.js?rev=…"`）。
2. 请求 `/plugins/dsh-composer-history/client.js`——预期 `200`（`text/javascript`）。
3. 手动清单：
   - 空输入框：↑ 召回上一条；连按走到更旧；↓↓ 回最新；再 ↓ 回到空。
   - 半句话草稿：↑ 暂存并召回；↓↓ 到底完整复原草稿（含光标位置）；Esc 立即复原。
   - 多行输入：中间行 ↑/↓ 只移动光标；到首行再 ↑ 才召回；到末行再 ↓ 才前进。
   - 召回 `/xxx` 后按 Enter：命令正常裁决执行（预期行为）。
   - 斜杠菜单打开时，↑/↓ 只移动菜单高亮。
   - 模型生成中（phase 非 `plain`）方向键不触发历史。
   - Shift+↑/↓ 选区、IME 组合、Ctrl+Z/Y 撤销重做全部不受影响。
4. 门禁：`pnpm run typecheck`、`pnpm run build`、`pnpm run test` 全绿——其中包括在 jsdom 里通过真实 `__ModuleLoader__` 握手执行**构建产物**的冒烟测试。

## 🔬 兼容基线（本机实测，2026-08-13）

- 基线：本机检出 `D:\deepseek-harness`（client 包 `lib/types` 构建于 2026-08-13）；client 包 **0.1.0-rc.5**（npm 最新为 0.1.0-rc.6，rc.5 未发布）；`@deepseek-ai/cordis` **4.0.1**；`@deepseek-ai/schemastery` **3.18.1**。
- `InputState` 相位（实读 `packages/client/ui-conversation/src/client/input/contract.ts`）：`'plain' | 'adjudicating' | 'claimed' | 'submitting'`，另含 `draft`/`draftRev`。写草稿唯一通道是 `ctx.conversation.input.for(actx).setDraft(text)`。
- **客户端插件元数据字段是嵌套 `dsh.client`**（`packages/client/modules` 的 `resolveMeta` 读 `pkg.dsh.client`）：放错位置会被**静默**丢出 boot 图，无报错。
- **vendored cordis 已更名 `@deepseek-ai/cordis`**：类型导入一律 type-only；实测 `lib/client.js` 零 cordis 运行时导入（无任何 `require(` 调用）。
- **浏览器 boot 不向插件传 config**（boot 图只含 `{id, url, rev, inject, immediately}`）：浏览器半用 schema 默认值；cordis.yml 的 `config:` 由 host Loader 按同一 schema 校验。实测 `recallWithDraft: bogus` 使整个启动中止：`failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"`。
- **改源码后必须重新 build 再启动**：启动校验读 `lib/client.js`，未构建直接拒绝；浏览器也只拉到构建产物。
- **只依赖官方包已导出符号**：跨包读状态只用 `@deepseek-ai/dsh-client-*` 包 `/client` 入口导出的类型与服务；把 `inputTriggers` 服务断言为 `InputTriggerService` 是社区通行做法（本插件以 type-only 导入 + `ctx.get('inputTriggers') as InputTriggerService | undefined` 实现，注释说明理由）。
- 客户端 bundle 契约：CJS 工厂包裹 `window.__ModuleLoader__.load({ id, factory })`，平台模块（react、cordis、slots 等 + `@deepseek-ai/dsh-client-runtime/client` 豁免）保持外部化，其余依赖内联；本插件运行时零外部依赖，tsdown 配置按该清单防御性声明。
- 外部插件类型检查：npm 无 rc.5，经 tsconfig `paths` 指向本机检出 `packages/client/*/lib/types/client/index.d.ts` + `skipLibCheck`；更新检出后需重跑 typecheck。
- profile 文件必须**无 UTF-8 BOM**（`readProfileManifest` 直接 `JSON.parse`；实测 BOM 导致 `Unexpected token '\uFEFF'` 启动失败）。

## ⚠️ 已知边界

- **逻辑行 vs 可视行**：默认 `logical` 按 `\n` 判定（超长自动折行消息算一行）；`visual` 按 mirror 实测折行（隐藏节点，每次边缘判定 O(行数·log n) 二分）。
- **会话内范围**：v1 仅当前会话窗口内已投影消息，不跨会话、不落盘；刷新后历史仍在（来自会话日志投影），浏览状态不跨刷新。
- **undo 栈包含召回事务**：每次填充/复原都是一次 `setDraft` 事务（输入机撤销日志），Ctrl+Z 可逐步撤销召回；插件不修改撤销/重做语义。
- 召回 `/xxx` 后 Enter 走正常命令裁决路径（预期行为，插件从不拦截 Enter）。
- 菜单/弹层与非 `plain` 相位永远优先；发送提交清空草稿（程序性）与切换会话都回到 IDLE。
- `visual` 模式的 mirror 测量无法在 jsdom 单测（无布局引擎）；纯 span 数学已单测覆盖。
- 参考 chips（U+FFFC 占位符）随草稿文本一起召回/复原。

## 🏷️ 话题与生态

本项目属于 DeepSeek Harness 插件生态。建议的 GitHub 话题（在仓库设置中设置）：

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `typescript`

相关链接：[github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 📄 License

[Apache License 2.0](./LICENSE)

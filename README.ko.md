# ⌨️ dsh-composer-history

**DeepSeek Harness 웹 GUI 컴포저를 위한 터미널 스타일 입력 히스토리 리콜.**

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

터미널처럼 **↑** 를 눌러 히스토리를 불러오세요 — 작성 중이던 초안은 언제나 안전합니다. `dsh-composer-history`는 Claude Code의 "커서 우선 엣지 리콜" 키 모델을 dsh 웹 컴포저에 그대로 옮기고, 한 걸음 더 나아갑니다: 최신 항목까지 되돌아오거나(또는 `Esc`를 누르면) 저장해 둔 초안과 커서 위치가 **정확히 복원**됩니다. 지워지지 않습니다.

> 순수 UI 동작입니다: 세션 이벤트 추가 없음, agent-loop 변경 없음, 모델 요청 없음. 리콜된 텍스트는 일반 컴포저 초안에만 들어가며, 모델에 전달되는 것은 *당신이* Enter를 눌렀을 때뿐입니다.

## ✨ 하이라이트

- 🎯 **엣지 우선 화살표 키** — 순수 ↑/↓ 는 먼저 커서를 움직입니다. 히스토리 리콜은 커서가 초안의 첫 줄/마지막 줄에 도달했을 때만 발동합니다.
- 💾 **초안 보관** — 첫 리콜에서 `{draft, caret}` 을 보관하고, 최신 항목으로 돌아오거나(또는 `Esc`) 두 값을 정확히 복원합니다. Claude Code가 여기서 지우는 것을, 이 플러그인은 복원합니다.
- 🛡️ **분기 가드** — 리콜한 항목을 편집하면 즉시 브라우징이 끝나고, 편집 내용이 새 초안이 됩니다.
- 🔄 **라이브 히스토리** — 키 입력마다 세션 스냅샷에서 재추출: `kind === 'user'` 메시지, 텍스트 블록 결합, 공백 건너뜀, 인접 중복 병합, 최신 항목이 끝에. 방금 보낸 메시지도 자동으로 포함됩니다.
- 🚦 **완전한 게이팅** — `plain` 페이즈에서만 가로챕니다. 슬래시 메뉴, 명령 팝업, IME 조합, 텍스트 선택, alt/meta/shift 조합에는 모두 양보합니다. 패스스루 경로는 부작용이 전혀 없습니다.
- 📐 **두 가지 엣지 판정** — `logical`(개행 기준, 기본값) 또는 `visual`(숨겨진 mirror div가 실제 줄바꿈을 측정).

## 🎬 사용 흐름

```text
$ 작성 도중 ↑ 를 누르면
        └─ 초안이 보관되고 최신 히스토리 항목이 컴포저에 채워짐
$ ↑ ↑ … 오래된 항목으로 이동     $ ↓ ↓ … 최신 항목으로 복귀
        └─ 가장 오래된 곳에서 hold(가로채되 변경 없음)  └─ ↓ 한 번 더: 초안이 돌아오고,
                                               커서도 원래 위치 그대로
$ 언제든 Esc → 즉시 복원, 브라우징 종료
```

## 🚀 빠른 시작

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # 전부 통과: 94/94
```

프로필에 등록하고([설치](#설치) 참조) `dsh --profile <프로필> --port 3080` 으로 실행하세요.

## 📦 설치

**반드시 먼저 build 후 실행**하세요 — 클라이언트 패키지 검증이 빌드되지 않은 번들을 거부합니다.

1. 플러그인을 빌드합니다(위 참조).
2. `$DSH_HOME/profiles/<프로필>/cordis.patch.yml` 에 행을 등록합니다. 행의 `name` 은 **베어 패키지 이름**이어야 합니다 — 브라우저 그래프 행 id가 곧 이 문자열이고, 클라이언트 번들도 빌드 시 같은 id를 새깁니다.

   ```yaml
   # 번들 레이어 뒤에 추가
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

3. 베어 행은 프로필의 리졸버 매니페스트에도 반드시 있어야 합니다 — 호스트 Loader가 프로필 디렉터리의 `node_modules` 에서 해석합니다:

   `$DSH_HOME/profiles/<프로필>/package.json`:

   ```json
   {
     "name": "dsh-profile-<프로필>",
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

4. 프로필 디렉터리에서 `pnpm install` 후:

   ```sh
   dsh --profile <프로필> --port 3080
   ```

## ⚙️ Config

조정 가능한 모든 파라미터는 Schemastery `Config` 스키마에 있습니다(하드코딩된 노브 없음). 잘못된 열거형 값은 **dsh 부팅 전체를 크게 실패시킵니다** — 호스트 Loader가 같은 스키마로 cordis.yml의 `config:` 블록을 검증합니다.

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`: 비어 있지 않은 초안은 보관 후 리콜; `gate`: 빈 초안만 리콜(Claude/Codex식 게이팅) |
| `restoreOnEscape` | `boolean` | `true` | 브라우징 중 Esc로 보관된 초안 복원 |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | `\n` 논리 행 기준 또는 mirror 실측 줄바꿈 기준 엣지 판정 |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ 를 순수 화살표 키와 동일하게 취급 |
| `restoreCaret` | `boolean` | `true` | 끝까지 복귀/Esc 복원 시 보관된 커서 위치도 복원 |

## 🎹 키 바인딩

| 키 | 상태 | 동작 |
| --- | --- | --- |
| ↑ | IDLE, 커서가 첫 줄 | {초안, 커서} 보관 후 최신 항목 입력, 커서를 끝으로(히스토리 없으면 패스) |
| ↑ | BROWSING, 커서가 첫 줄 | 한 항목 더 과거로; 가장 오래된 곳에서 hold(가로채되 변경 없음) |
| ↑ | 커서가 첫 줄이 아님 | 완전 해제(브라우저가 커서 이동) |
| ↓ | IDLE | 항상 해제(일반 커서 이동) |
| ↓ | BROWSING, 커서가 마지막 줄 | 한 항목 더 최신으로; 최신에서 → `savedDraft` + `savedCaret` 복원 → IDLE |
| ↓ | 커서가 마지막 줄이 아님 | 완전 해제 |
| Esc | BROWSING(`restoreOnEscape: true`) | `savedDraft` + `savedCaret` 복원 → IDLE, 가로챔 |
| Esc | 그 외 | 해제(메뉴/팝업의 Esc 의미는 그대로) |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | 순수 화살표 키와 동일 |
| Shift/Alt/Meta+화살표, IME, 선택 영역 | 모두 | 항상 해제 |

## ✅ 검증

1. 웹 UI를 열고 `window.__DSH_BOOT__` 에 이 플러그인의 행(`id: "dsh-composer-history"`, `url: "/plugins/dsh-composer-history/client.js?rev=…"`)이 포함되어 있는지 확인합니다.
2. `/plugins/dsh-composer-history/client.js` 를 요청 — `200`(`text/javascript`)이 기대값입니다.
3. 수동 체크리스트:
   - 빈 컴포저: ↑ 로 마지막 메시지 리콜; 연타로 과거 이동; ↓↓ 로 최신 복귀; ↓ 한 번 더로 빈 상태 복귀.
   - 작성 중인 초안: ↑ 로 보관 & 리콜; ↓↓ 로 끝까지 가면 초안이 **커서 위치까지** 복원; Esc 는 즉시 복원.
   - 여러 줄 초안: 중간 줄의 ↑/↓ 는 커서 이동만; 첫 줄/마지막 줄에서만 리콜 발동.
   - `/xxx` 항목 리콜 후 Enter → 명령이 정상적으로 심사·실행(예상된 동작).
   - 슬래시 메뉴가 열려 있으면 ↑/↓ 는 메뉴 하이라이트만 움직임.
   - 모델 생성 중(phase ≠ `plain`)에는 화살표 키로 리콜하지 않음.
   - Shift+↑/↓ 선택, IME 조합, Ctrl+Z/Y 실행 취소/재실행은 모두 영향 없음.
4. 게이트: `pnpm run typecheck`, `pnpm run build`, `pnpm run test` 전부 통과 — **빌드된 번들**을 실제 `__ModuleLoader__` 핸드셰이크로 jsdom에서 실행하는 스모크 테스트 포함.

## 🔬 호환성 기준선(이 머신에서 실측, 2026-08-13)

- 기준선: 로컬 체크아웃 `D:\deepseek-harness`(client 패키지 `lib/types` 2026-08-13 빌드); client 패키지 **0.1.0-rc.5**(npm 최신은 0.1.0-rc.6, rc.5는 미공개); `@deepseek-ai/cordis` **4.0.1**; `@deepseek-ai/schemastery` **3.18.1**.
- `InputState` 페이즈(`packages/client/ui-conversation/src/client/input/contract.ts` 실독): `'plain' | 'adjudicating' | 'claimed' | 'submitting'`, 그 밖에 `draft`/`draftRev`. 초안의 유일한 쓰기 경로는 `ctx.conversation.input.for(actx).setDraft(text)`.
- **클라이언트 플러그인 메타데이터는 중첩된 `dsh.client` 필드**(`packages/client/modules`의 `resolveMeta`가 `pkg.dsh.client`를 읽음): 위치를 잘못 두면 boot 그래프에서 **조용히** 빠집니다. 오류 없음.
- **벤더드 cordis는 `@deepseek-ai/cordis` 로 개명됨**: type-only로만 임포트. 실측 결과 `lib/client.js` 에 cordis 런타임 임포트 없음(`require(` 호출 자체가 전무).
- **브라우저 boot는 플러그인에 config를 전달하지 않음**(boot 그래프는 `{id, url, rev, inject, immediately}` 뿐): 브라우저 절반은 스키마 기본값으로 해석하고, cordis.yml의 `config:` 블록은 호스트 Loader가 같은 스키마로 검증합니다. 실측: `recallWithDraft: bogus` → 부팅 전체 중단 — `failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"`.
- **소스 변경 후 반드시 재빌드 후 재시작**: 시작 검증이 `lib/client.js` 를 읽고, 미빌드 시 거부합니다. 브라우저가 가져오는 것도 항상 빌드 산출물입니다.
- **공개된 심볼만 사용**: 패키지 간 읽기는 `@deepseek-ai/dsh-client-*` 의 `/client` 엔트리가 공개한 타입/서비스만 사용. `inputTriggers` 서비스를 `InputTriggerService` 로 단언하는 것은 커뮤니티의 통용 패턴입니다(본 플러그인은 type-only 임포트 + `ctx.get('inputTriggers') as InputTriggerService | undefined` 로 구현, 이유는 주석에).
- 클라이언트 번들 계약: CJS 팩토리를 `window.__ModuleLoader__.load({ id, factory })` 로 감싸고, 플랫폼 모듈(react, cordis, slots 등 + `@deepseek-ai/dsh-client-runtime/client` 면제)은 외부화, 나머지는 인라인화. 본 플러그인은 런타임 외부 의존성이 없지만 tsdown 설정은 이 목록을 방어적으로 선언합니다.
- 외부 플러그인 타입체크: npm에 rc.5가 없으므로 tsconfig `paths` 가 로컬 체크아웃의 `packages/client/*/lib/types/client/index.d.ts` 를 가리키고 + `skipLibCheck`. 체크아웃 업데이트 후 typecheck를 다시 실행하세요.
- 프로필 파일은 **BOM 없는 UTF-8**이어야 함(`readProfileManifest` 가 그대로 `JSON.parse` 를 실행; 실측: BOM으로 `Unexpected token '\uFEFF'` 부팅 실패).

## ⚠️ 알려진 한계

- **논리 행 vs 시각 행**: 기본값 `logical` 은 `\n` 기준(길게 자동 줄바꿈된 메시지는 한 줄 취급); `visual` 은 mirror 실측(숨겨진 노드, 엣지 판정마다 O(줄 수·log n) 이진 탐색).
- **세션 내 범위**: v1은 현재 세션의 투영 창만 대상. 세션 간·디스크 영속화 없음. 히스토리는 페이지 새로고침 후에도 유지(세션 로그 투영)되지만 브라우징 상태는 유지되지 않음.
- **undo 스택에 리콜 트랜잭션 포함**: 채움/복원은 각각 입력 머신의 `setDraft` 트랜잭션(undo 로그)이며 Ctrl+Z 로 단계적으로 되돌릴 수 있음. 플러그인은 undo/redo 의미를 변경하지 않음.
- `/xxx` 항목 리콜 후 Enter → 정상적인 명령 claim/심사 경로(예상된 동작이며 Enter는 절대 가로채지 않음).
- 메뉴/팝업과 `plain` 이 아닌 페이즈가 항상 우선. 전송 확정으로 인한 초안 비우기(프로그램적)와 세션 전환은 모두 IDLE로 복귀.
- `visual` mirror 측정은 jsdom에서 단위 테스트 불가(레이아웃 엔진 없음); 순수 span 수학은 테스트됨.
- 참조 칩(U+FFFC 자리표시자)은 리콜/복원되는 초안 텍스트에 그대로 실려감.

## 🏷️ 토픽과 생태계

이 프로젝트는 DeepSeek Harness 플러그인 생태계의 일부입니다. 권장 GitHub 토픽(리포지토리 설정에서 지정):

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `typescript`

관련 링크: [github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 📄 License

[Apache License 2.0](./LICENSE)

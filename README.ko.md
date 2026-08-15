# ⌨️ dsh-composer-history

**DeepSeek Harness 웹 GUI 컴포저를 위한 터미널 스타일 입력 히스토리.**

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md)

<p align="center">
  <a href="https://github.com/topics/dsh"><img alt="topic: dsh" src="https://img.shields.io/badge/topic-dsh-8A2BE2"></a>
  <a href="https://github.com/topics/dsh-plugin"><img alt="topic: dsh-plugin" src="https://img.shields.io/badge/topic-dsh--plugin-8A2BE2"></a>
  <a href="https://github.com/topics/deepseek-harness"><img alt="topic: deepseek-harness" src="https://img.shields.io/badge/topic-deepseek--harness-8A2BE2"></a>
  <br>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
  <a href="./package.json"><img alt="version" src="https://img.shields.io/badge/version-0.4.0-66ccff"></a>
  <a href="./package.json"><img alt="node" src="https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-339933"></a>
  <img alt="tests" src="https://img.shields.io/badge/tests-217%2F217-brightgreen">
  <img alt="harness client" src="https://img.shields.io/badge/harness%20client-types%20rc.6-orange">
</p>

터미널처럼 **↑** 를 눌러 히스토리를 불러오세요 — 작성 중이던 프롬프트는 언제나 안전합니다. `dsh-composer-history`는 Claude Code의 엣지 우선 화살표 키 모델을 dsh 웹 컴포저에 옮기고, 한 걸음 더 나아갑니다: 최신 항목까지 되돌아오거나(또는 `Esc`를 누르면) 저장해 둔 초안과 커서 위치가 **정확히 복원**됩니다. 지워지지 않습니다. 그 위에 더해: 전송된 메시지는 **브라우저 로컬에 영속화**되어 새로고침 후에도, 세션을 넘어서도 히스토리가 유지되고, `Ctrl+R` 로 **역방향 검색**이 열리며, 모든 키와 조정값이 설정 가능합니다. 그리고 harness의 **슬라이딩 컨텍스트**가 긴 대화를 압축할 때(Claude Code / Codex와 동일한 자동 압축 워크플로), 플러그인은 그 히스토리를 계속 쓸 수 있게 합니다: 체크포인트 요약이 리콜과 검색에 합류하고, 압축마다 원클릭 `/compact` 입력이 붙은 일시 알림이 표시됩니다.

> 순수 UI 동작입니다: 세션 이벤트 추가 없음, agent-loop 변경 없음, 모델 요청 없음. 리콜된 텍스트는 일반 컴포저 초안에만 들어가며, 모델에 전달되는 것은 *당신이* Enter를 눌렀을 때뿐입니다. 영속화된 히스토리는 브라우저 로컬 텍스트입니다([개인정보](#개인정보) 참조).

## ✨ 하이라이트

- 🎯 **엣지 우선 화살표 키** — 순수 ↑/↓ 는 먼저 커서를 움직입니다. 히스토리 리콜은 커서가 초안의 첫 줄/마지막 줄에 도달했을 때만 발동합니다.
- 💾 **초안 보관** — 첫 리콜에서 `{draft, caret}` 을 보관합니다; 최신 항목에 다시 도달하면(또는 `Esc`) 두 값을 정확히 복원합니다. Claude Code는 여기서 지웁니다 — 우리는 복원합니다.
- 🛡️ **분기 가드** — 리콜한 항목을 편집하면 브라우징이 즉시 끝나고, 편집 내용이 새 초안이 됩니다.
- 🔄 **라이브 히스토리** — 키 입력마다 세션 스냅샷에서 재추출: `kind === 'user'` 메시지, 텍스트 블록 결합, 공백 건너뜀, 인접 중복 병합, 최신 항목이 끝에. 방금 보낸 메시지도 자동으로 포함됩니다.
- 💿 **영속화 히스토리** — 전송된 모든 메시지가 상한이 있는 브라우저 로컬 저장소(`dsh.composer-history.v1`)에 추가되어, 페이지 새로고침 후와 세션 간에도 리콜이 동작합니다. `persistHistory: false` 로 빠질 수 있습니다.
- 🗂️ **워크스페이스 범위** — `historyScope: 'workspace'` 는 현재 세션의 메시지보다 먼저 다른 등록된 세션들의 메시지를 앞에 붙입니다.
- 🔍 **역방향 검색** — `Ctrl+R`(설정 가능)이 컴포저 아래에 쿼리 패널을 엽니다: 타이핑하면 필터, ↑/↓ 로 선택, Enter 로 채움, Esc 로 취소.
- 🎛️ **모든 키 설정 가능** — `upKey`/`downKey`/`escapeKey`/`searchKeys` 가 코드가 아닌 Config 스키마에 있습니다.
- 🧭 **슬라이딩 컨텍스트 인식** — harness가 자동 압축(Claude Code / Codex 방식)할 때, 체크포인트 요약이 `[compacted] …` 항목으로 ↑ 리콜과 `Ctrl+R` 검색에 합류하고, 압축마다 일시 알림(원클릭 "`/compact` 입력" 버튼 포함)이 표시됩니다. [슬라이딩 컨텍스트](#-슬라이딩-컨텍스트) 참조.
- ⚙️ **설정 통합** — 호스트 절반이 `composer-history` 설정 네임스페이스를 등록합니다(cordis.yml config가 컴포지션 `base` 가 됨); 설정 문서의 사용자 오버라이드가 브라우저에 도달합니다. 설정 서비스가 없으면 플러그인은 컴포즈된 그대로 정확히 계속 동작합니다.
- 🚦 **완전한 게이팅** — `plain` 입력 페이즈에서만 가로챕니다; 슬래시 메뉴, 명령 팝업, IME 조합, 텍스트 선택, alt/meta/shift 조합에는 모두 양보합니다. 패스스루 경로는 부작용이 전혀 없습니다.
- 📐 **두 가지 엣지 모드** — `logical`(개행 기준, 기본값) 또는 `visual`(숨겨진 mirror div가 실제 줄바꿈을 측정).

## 🎬 사용 흐름

```text
$ you type a half-finished prompt and press ↑
        └─ draft is stashed, newest history entry fills the composer
$ ↑ ↑ … walk to older entries        $ ↓ ↓ … walk back to the newest
        └─ at the oldest: hold (no-op)         └─ one more ↓: your draft is back,
                                                  caret exactly where it was
$ press Esc at any time → instant restore, browsing ends
$ press Ctrl+R → type a fragment → ↑/↓ → Enter → the match fills the composer
```

## 🚀 빠른 시작

```sh
cd Project/Plugins/dsh-composer-history
pnpm install
pnpm run typecheck && pnpm run build && pnpm run test   # all green: 200/200
pnpm run test:coverage                                  # per-module coverage report
pnpm run check:readmes && pnpm run verify:pack          # doc consistency + pack surface
```

그런 다음 프로필에 등록하고([설치](#설치) 참조) `dsh --profile <your-profile> --port 3080` 로 실행하세요.

## 📦 설치

**반드시 먼저 build 후 실행**하세요 — 클라이언트 패키지 검증이 빌드되지 않은 번들에 대해 부팅을 거부합니다.

> npm에서: `pnpm add dsh-composer-history`(또는 npm/yarn)는 빌드된 번들을 포함합니다 — 1번과 5번 단계는 건너뛰세요. 패키지는 `dsh.bundle` 매니페스트(루트 `cordis.patch.yml`)도 선언하므로, `dsh plugin add` 방식 설치기가 행을 자동 등록할 수 있습니다.

1. 플러그인을 빌드합니다(위 참조).
2. `$DSH_HOME/profiles/<your-profile>/cordis.patch.yml` 에 행을 등록합니다. 행의 `name` 으로 **베어 패키지 이름**을 사용하세요: 브라우저 그래프 행 id가 곧 그 문자열이고, 클라이언트 번들도 빌드 시 같은 id를 새깁니다.

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
           includeCompactionSummaries: true   # summaries join recall/search
           showCompactionNotice: true         # transient notice on compaction
           compactCommandText: /compact       # filled by "Compact now"; '' hides it
   ```

   `config:` 블록은 호스트 Loader가 같은 스키마로 검증하며, (설정 서비스가 있으면) 설정 `base` 레이어로 브라우저에 흘러 들어갑니다 — 그래서 이 값들은 검증기에만 도달하는 것이 아니라 실제로 브라우저 절반에 도달합니다.

3. 베어 행은 프로필의 리졸버 매니페스트에도 반드시 있어야 합니다 — 호스트 Loader가 프로필 디렉터리의 `node_modules` 에서 해석합니다:

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

4. 프로필 디렉터리에서 `pnpm install` 후:

   ```sh
   dsh --profile <your-profile> --port 3080
   ```

5. tarball 설치(어떤 패키지 매니저든)의 경우: 이 디렉터리에서 `pnpm pack` 후, 프로필의 `package.json` 에서 그 tarball을 참조합니다. `pnpm run verify:pack` 이 배포 전에 pack 표면을 검사합니다.

## ⚙️ Config

조정 가능한 모든 파라미터는 Schemastery `Config` 스키마에 있습니다(하드코딩된 노브 없음). 잘못된 열거형 값은 **dsh 부팅 전체를 크게 실패시킵니다** — 호스트 Loader가 같은 스키마로 cordis.yml 블록을 검증하고, 설정 섹션은 사용 전에 브라우저에서 다시 검증됩니다.

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `recallWithDraft` | `'save' \| 'gate'` | `'save'` | `save`: 비어 있지 않은 초안은 리콜 전에 보관됩니다; `gate`: 빈 초안만 리콜합니다(Claude/Codex식 게이팅) |
| `restoreOnEscape` | `boolean` | `true` | 브라우징 중 `Esc` 가 보관된 초안을 복원합니다 |
| `edgeMode` | `'logical' \| 'visual'` | `'logical'` | `\n` 행 기준 또는 실측 줄바꿈 기준 엣지 판정 |
| `enableCtrlAlias` | `boolean` | `true` | Ctrl+↑/↓ 가 순수 화살표 키처럼 동작합니다 |
| `restoreCaret` | `boolean` | `true` | 끝까지 복귀/`Esc` 시 보관된 커서 위치도 복원합니다 |
| `upKey` | `string` | `'ArrowUp'` | 위로 리콜하는 `KeyboardEvent.key`; `''` 는 비활성화 |
| `downKey` | `string` | `'ArrowDown'` | 더 최신으로 이동/복원하는 `KeyboardEvent.key`; `''` 는 비활성화 |
| `escapeKey` | `string` | `'Escape'` | 브라우징을 벗어나는 `KeyboardEvent.key`; `''` 는 비활성화 |
| `maxHistory` | `number` | `500` | 리콜되는 최대 항목 수(최신 항목 유지); `0` = 무제한 |
| `includeKinds` | `string[]` | `['user']` | 히스토리에 포함할 대화 노드 종류(스티어 메시지를 포함하려면 `'steering'` 추가) |
| `historyScope` | `'session' \| 'workspace'` | `'session'` | `'workspace'` 는 현재 세션보다 먼저 다른 등록된 세션들의 사용자 메시지를 앞에 붙입니다 |
| `persistHistory` | `boolean` | `true` | 전송된 메시지를 브라우저 로컬 저장소에 추가합니다([개인정보](#개인정보) 참조) |
| `maxPersisted` | `number` | `200` | 저장되는 최대 항목 수; `0` = 무제한 |
| `enableSearch` | `boolean` | `true` | `Ctrl+R` 역방향 검색 오버레이를 활성화합니다 |
| `searchKeys` | `string[]` | `['Ctrl+R']` | 검색을 여는 조합 스펙(수정자 `Ctrl`/`Alt`/`Meta`/`Shift` + 키 이름); 잘못된 스펙은 브라우저 파이버를 크게 실패시킵니다 |
| `searchCaseSensitive` | `boolean` | `false` | 검색 매칭이 대소문자를 구분하는지 여부 |
| `includeCompactionSummaries` | `boolean` | `true` | `[compacted] …` 체크포인트 요약을 리콜과 검색에 포함 |
| `showCompactionNotice` | `boolean` | `true` | 압축 체크포인트가 도착할 때 일시 알림 표시 |
| `compactCommandText` | `string` | `'/compact'` | 알림의 "지금 압축" 동작이 컴포저에 입력하는 슬래시 명령; `''` 이면 숨김 |

## 🎹 키 바인딩

| 키 | 상태 | 동작 |
| --- | --- | --- |
| ↑ | IDLE, 커서가 첫 줄 | {초안, 커서} 보관 후 최신 항목 입력, 커서를 끝으로(히스토리 없으면 패스) |
| ↑ | BROWSING, 커서가 첫 줄 | 한 항목 더 과거로; 가장 오래된 곳에서 hold(가로채되 변경 없음) |
| ↑ | 커서가 첫 줄이 아님 | 완전 해제(브라우저가 커서 이동) |
| ↓ | IDLE | 항상 해제(일반 커서 이동) |
| ↓ | BROWSING, 커서가 마지막 줄 | 한 항목 더 최신으로; 최신에서 → `savedDraft` + `savedCaret` 복원 → IDLE |
| ↓ | 커서가 마지막 줄이 아님 | 완전 해제 |
| Esc | BROWSING (`restoreOnEscape: true`) | `savedDraft` + `savedCaret` 복원 → IDLE, 가로챔 |
| Esc | 그 외 | 해제(메뉴/팝업의 Esc 의미는 그대로) |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | 순수 화살표 키와 동일 |
| `searchKeys` 조합 | 컴포저 포커스, `plain` 페이즈, 메뉴/선택/IME 없음 | 역방향 검색 열기; 브라우징 종료, 표시된 텍스트가 초안이 됨 |
| Shift/Alt/Meta+화살표, IME, 선택 영역 | 모두 | 항상 해제 |

`upKey`/`downKey`/`escapeKey`/`searchKeys` 는 위 키들의 이름을 바꿉니다; 수정자 정책(그리고 검색 조합의 정확한 수정자 일치)은 그대로입니다. 검색 오버레이 안에서: ↑/↓ 가 매치 선택을 이동(선택된 행은 보이는 영역으로 스크롤)하고, Enter 가 채우며, Esc 가 취소하고, 클릭이 선택하며, 바깥 클릭이 취소합니다. 일치한 부분 문자열은 각 행에서 강조 표시됩니다.

## 🔍 역방향 검색

- **열기**: 컴포저가 포커스되고 입력이 `plain` 인 동안 `searchKeys` 조합(여기서 `Ctrl+R` 은 브라우저의 페이지 새로고침도 막습니다 — 키는 컴포저 안에서만 소비됩니다).
- **필터**: 병합된 히스토리(현재 세션 + 영속화 + 워크스페이스 항목)에 대한 부분 문자열 매치; 대소문자 구분은 `searchCaseSensitive` 기준.
- **선택**: Enter 가 초안을 채우고 커서를 끝으로 이동시킵니다 — 일반 리콜과 동일한 단일 `setDraft` 쓰기 경로입니다. 리콜된 텍스트가 모델에 도달하는 것은 그 후에 Enter를 눌렀을 때뿐입니다.
- **취소**: Esc 또는 패널 바깥 클릭; 초안은 그대로입니다.

## 🧭 슬라이딩 컨텍스트

harness 코어는 모든 dsh 세션에 슬라이딩 컨텍스트 창을 제공합니다 — Claude Code와 Codex가 제공하는 것과 동일한 워크플로입니다: 대화가 모델의 컨텍스트 한계에 다가가면(또는 공급자가 오버플로를 보고하면) harness가 **자동 압축**합니다 — 이전 턴들이 트랜스크립트에 남는 `compaction` 체크포인트 마커 뒤에 요약되고, 모델은 요약과 최근 꼬리만 유지한 채 세션이 계속됩니다. `/compact` 는 같은 압축을 필요할 때 실행하며, 마커는 펼칠 수 있는 "컨텍스트 압축됨" 행으로 렌더링됩니다.

`dsh-composer-history` 는 컴포저를 이 워크플로에 연결해, 창이 미끄러져도 입력 히스토리를 잃지 않게 합니다:

- **리콜이 압축을 넘어 유지** — 가려진 턴들은 세션 스냅샷에 남아, ↑ 가 체크포인트 전후에 보낸 모든 메시지를 계속 걸어갑니다.
- **요약이 히스토리에 합류** — 각 체크포인트의 요약 텍스트가 `[compacted] …` 항목으로 ↑ 리콜과 `Ctrl+R` 검색에 들어갑니다(토글: `includeCompactionSummaries`). 모델이 더는 그대로 보지 않는 컨텍스트가 키 하나 거리에 남습니다.
- **압축 알림** — 페이지가 열려 있는 동안 체크포인트가 도착하면 일시 스낵바가 알려주고(Claude Code의 "대화 자동 압축 중…" 순간), 요약 스니펫과 원클릭 **`/compact` 입력** 동작이 붙습니다(`showCompactionNotice`, `compactCommandText`). 입력은 일반 초안에만 들어가며, 보내는 것은 당신의 Enter뿐입니다.
- **검색 카운트** — `Ctrl+R` 패널에 실시간 `N entries` / `N matches` 상태 줄이 추가되고, 긴 항목은 두 줄로 잘립니다.

> 압축 자체(임계값, 요약 모델, `/compact`)는 harness 코어의 compaction 플러그인이 담당합니다 — 이 플러그인은 클라이언트 스냅샷이 이미 노출하는 체크포인트 마커를 관찰할 뿐이므로, agent-loop나 모델 요청 변경이 전혀 필요 없습니다.

## 🔒 개인정보

`persistHistory: true`(기본값)는 전송된 메시지를 이 브라우저의 `localStorage` 에 `dsh.composer-history.v1` 키로 기록하며, `maxPersisted` 로 상한이 정해지고, 어디에도 업로드되지 않으며, 같은 origin의 페이지만 읽을 수 있습니다. `persistHistory: false` 로 비활성화하세요 — 그러면 리콜은 v1 동작처럼 라이브 세션 투영(및 워크스페이스 범위)만 사용합니다. 손상되었거나 외부의 페이로드는 조용히 초기화됩니다. 이미 저장된 데이터를 모두 지우려면 페이지의 DevTools 콘솔에서 `localStorage.removeItem('dsh.composer-history.v1')` 를 실행하세요.

## ✅ 검증

1. 웹 UI를 열고 `window.__DSH_BOOT__` 에 이 플러그인의 행(`id: "dsh-composer-history"`, `url: "/plugins/dsh-composer-history/client.js?rev=…"`)이 포함되어 있는지 확인합니다.
2. `/plugins/dsh-composer-history/client.js` 를 요청합니다 — `200`(`text/javascript`)이 기대값입니다.
3. 수동 체크리스트:
   - 빈 컴포저: ↑ 로 마지막 메시지 리콜; ↑ 연타로 과거 이동; ↓↓ 로 최신 복귀; ↓ 한 번 더로 빈 상태 복귀.
   - 작성 중인 초안: ↑ 로 보관·리콜; ↓↓ 로 끝까지 가면 초안이 **커서 위치까지 포함하여** 복원; `Esc` 는 즉시 복원.
   - 여러 줄 초안: 중간 줄의 ↑/↓ 는 커서 이동만; 첫 줄/마지막 줄에서만 리콜 발동.
   - `/xxx` 항목을 리콜한 뒤 Enter 를 누르면 명령이 정상적으로 심사됩니다(예상된 동작).
   - 슬래시 메뉴가 열려 있으면 ↑/↓ 는 메뉴 항목 하이라이트만 움직입니다.
   - 모델 생성 중(phase ≠ `plain`)에는 화살표 키로 리콜하지 않습니다.
   - Shift+↑/↓ 선택, IME 조합, Ctrl+Z/Y 실행 취소/재실행은 모두 영향 없음.
   - `Ctrl+R` 로 검색 패널 열림; 타이핑하면 필터; ↑/↓ + Enter 로 채움; Esc 는 초안을 그대로 둠.
   - 페이지 새로고침 후, ↑ 로 새로고침 전에 보낸 메시지 리콜(`persistHistory` 켜짐).
   - `historyScope: 'workspace'` 이면 다른 등록된 세션의 항목이 현재 세션보다 앞에 옵니다.
   - 압축(자동 또는 `/compact`)이 도착한 뒤 ↑ 로 `[compacted] …` 요약 항목까지 걸어가고, `Ctrl+R` 이 그 텍스트로 찾아줍니다.
   - 압축 알림이 아래쪽에 나타나 자동으로 사라지고, 버튼이 `/compact` 를 컴포저에 입력합니다.
4. 게이트: `pnpm run typecheck`, `pnpm run build`, `pnpm run test` 전부 통과 — 실제 `__ModuleLoader__` 핸드셰이크로 jsdom에서 **빌드된 번들**을 실행하는 스모크 테스트 포함; 그리고 `pnpm run test:coverage`, `pnpm run check:readmes`, `pnpm run verify:pack`.

## 🔬 호환성 기준선 (이 머신에서 실측, 2026-08-14)

- **타입**: devDependencies 가 npm의 공개 클라이언트 패키지 **0.1.0-rc.6**(`dsh-client-runtime`, `dsh-client-ui-conversation`, `dsh-client-ui-input-trigger`, `dsh-client-ui-settings`, `dsh-settings`, `dsh-api-remotes`)을 고정합니다; `typecheck` 는 더 이상 로컬 체크아웃에 의존하지 않습니다. 런타임 스모크는 클라이언트 패키지가 **0.1.0-rc.5** 인 체크아웃에 대해 실행됩니다; `@deepseek-ai/cordis` **4.0.1**; `@deepseek-ai/schemastery` **3.18.1**.
- **rc.6 에서 압축 마커는 클라이언트에 보임**: `ConversationNode` 에 `CompactionSummaryNode`(`kind: 'compaction'`, `summary`/`shadowedItemCount`/`shadowedTokenCount`)가 포함되고, 각 마커 위의 트랜스크립트는 그대로 유지됩니다 — 가려진 턴이 스냅샷에서 제거되지 않습니다. 슬라이딩 컨텍스트 기능은 이 공개 페이스만 읽습니다.
- `InputState` 페이즈(`packages/client/ui-conversation/src/client/input/contract.ts` 실독): `'plain' | 'adjudicating' | 'claimed' | 'submitting'`, 그 밖에 `draft`/`draftRev`. 초안의 유일한 공개 쓰기 경로는 `ctx.conversation.input.for(actx).setDraft(text)` 입니다; `editRange` 인식 `ComposerKeyboard` 페이스는 InputBar 전용입니다(`docs/upstream-proposals.md` C1 참조).
- **클라이언트 플러그인 메타데이터는 중첩된 `dsh.client` 필드**(`packages/client/modules`의 `resolveMeta`가 `pkg.dsh.client`를 읽음): 위치를 잘못 두면 boot 그래프에서 조용히 빠집니다 — 오류 없음.
- **벤더드 cordis는 `@deepseek-ai/cordis` 로 개명됨**: type-only로만 임포트. 빌드된 `lib/client.js` 에 cordis 런타임 임포트 없음(`require(` 호출 자체가 전무).
- **브라우저 boot는 플러그인에 config를 전달하지 않음**(boot 그래프는 `{id, url, rev, inject, immediately}` 뿐): 브라우저 절반은 스키마 기본값을 해석하고 — 새로운 경로로 — 설정 스코프가 전송이 준비되면 호스트가 해석한 섹션(cordis.yml `base` + 사용자 오버라이드)을 전달합니다. 설정 서비스가 없으면 플러그인은 이전과 정확히 동일하게 스키마 기본값으로 폴백합니다. 실측: `recallWithDraft: bogus` → 부팅 전체 중단 — `failed to apply loader entry composer-history … $.recallWithDraft expected "save" | "gate" but got "bogus"`.
- **설정 전송은 루프백 전용**: 원격 브라우저는 호스트 문서를 읽을 수 없습니다; 그 스코프는 memory/unavailable 모드를 보고하고 플러그인은 기본값으로 폴백합니다(히스토리 저장소는 어쨌든 브라우저 로컬).
- **재실행 전 재빌드**: 시작 검증이 `lib/client.js` 를 읽습니다; 미빌드 패키지는 거부되고, 브라우저는 항상 빌드 산출물만 가져옵니다.
- **공개된 심볼만 사용**: 패키지 간 읽기는 `@deepseek-ai/dsh-client-*` 의 `/client` 엔트리가 공개한 타입/서비스만 사용합니다. `inputTriggers` 서비스 인스턴스를 `InputTriggerService` 로 단언하는 것은 커뮤니티의 승인된 패턴입니다(본 플러그인은 type-only 임포트 + `ctx.get('inputTriggers') as InputTriggerService | undefined` 로 구현, 이유는 주석에).
- 클라이언트 번들 계약: CJS 팩토리를 `window.__ModuleLoader__.load({ id, factory })` 로 감싸고, 플랫폼 모듈(react, cordis, slots 등 + `@deepseek-ai/dsh-client-runtime/client` 면제)은 외부화, 나머지는 인라인화. 본 플러그인은 런타임 외부 의존성이 없지만 tsdown 설정은 이 목록을 방어적으로 선언합니다.
- 프로필 파일은 **BOM 없는 UTF-8**이어야 함(`readProfileManifest` 가 그대로 `JSON.parse` 를 실행; 실측: BOM으로 `Unexpected token '\uFEFF'` 부팅 실패).

## ⚠️ 알려진 한계

- **논리 행 vs 시각 행**: 기본값 `logical` 은 `\n` 기준(길게 자동 줄바꿈된 메시지는 한 줄 취급); `visual` 은 mirror로 실제 줄바꿈을 측정(숨겨진 노드, 엣지 판정마다 O(줄 수·log n) 이진 탐색, 초안/너비별 메모화). mirror 측정 자체는 실제 레이아웃 엔진이 필요합니다 — 대신 순수 span 수학이 단위 테스트됩니다(`tests/visual-mirror.spec.ts` 참조).
- **영속화 히스토리는 브라우저별**: 저장소는 한 origin의 `localStorage` 에 있습니다; 브라우저 간 또는 머신 간 동기화되지 않습니다. 손상된 페이로드는 조용히 초기화됩니다.
- **undo 스택에 리콜 트랜잭션 포함**: 채움/복원은 각각 입력 머신의 undo 로그에서 하나의 `setDraft` 트랜잭션입니다; Ctrl+Z 로 리콜을 단계적으로 되돌릴 수 있습니다. 플러그인은 undo/redo 의미를 절대 변경하지 않습니다; 정밀 수정에는 업스트림 edit-range 노출이 필요합니다(`docs/upstream-proposals.md` C1 참조).
- `/xxx` 항목 리콜 후 Enter → 정상적인 명령 claim/심사 경로(예상된 동작이며 Enter는 절대 가로채지 않음).
- 메뉴/팝업과 `plain` 이 아닌 페이즈가 항상 우선. 전송 확정(프로그램적 초안 비우기)과 세션 전환은 모두 IDLE로 복귀.
- 참조 칩(U+FFFC 자리표시자)은 리콜/복원되는 초안 텍스트에 그대로 실려갑니다.
- `historyScope: 'workspace'` 는 다른 등록된 세션들의 라이브 어셈블리를 읽습니다; 어셈블리가 아직 구체화되지 않은 세션은 단순히 아직 아무것도 기여하지 않습니다.
- 검색 오버레이는 순수 DOM입니다(React 의존성 없음); `maxHistory` 상한까지 모든 매치를 렌더링합니다.
- **압축 인식은 관찰 기반**: 플러그인 설치 전(또는 세션 전환 전)에 이미 도착한 체크포인트는 알림을 띄우지 않습니다. 알림은 페이지가 열려 있는 동안 도착한 마커뿐입니다. 요약 이벤트가 로드된 창 밖에 있는 체크포인트는 `[compacted] …` 항목을 만들지 않습니다(`summary: null`).
- 알림의 "지금 압축" 동작은 설정된 명령 텍스트를 초안에 *입력*할 뿐입니다 — 전송(및 `/compact` 자체의 수락)은 여전히 당신의 Enter입니다.

## 🗺️ 업스트림 제안

`deepseek-ai/deepseek-harness` 에 대한 세 가지 확장점 제안이 [`docs/upstream-proposals.md`](docs/upstream-proposals.md) 에 정리되어 있습니다: 입력 페이스의 공개 edit-range 쓰기(C1), 트리거 감지 순수 함수의 export(C2), 문서화된 컴포저 키보드 중재 체인(C3).

## 🏷️ 토픽과 생태계

이 프로젝트는 DeepSeek Harness 플러그인 생태계의 일부입니다. 권장 GitHub 토픽(리포지토리 설정에서 지정):

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `compaction` · `sliding-context` · `typescript`

관련 링크: [github.com/topics/dsh-plugin](https://github.com/topics/dsh-plugin) · [github.com/topics/deepseek-harness](https://github.com/topics/deepseek-harness) · [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

## 📄 License

[Apache License 2.0](./LICENSE) · 릴리스 이력은 [CHANGELOG.md](./CHANGELOG.md)

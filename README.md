# VAIS Cursor

> 기획부터 배포까지, 팀 개발을 빠르고 튼튼하게. — Cursor Extension

**v0.1.0** · 최종 수정 2026-03-16

VAIS 9단계 개발 워크플로우의 **Cursor Extension** 버전입니다.
메인 소스는 [vais-claude-code](https://github.com/ghlee3401/vais-claude-code)이며, git submodule + 동기화 스크립트로 갱신됩니다.

---

## 목차

- [설치](#설치)
- [업데이트](#업데이트)
- [빠른 시작](#빠른-시작)
- [Extension 커맨드](#extension-커맨드)
- [개발 워크플로우 (9단계)](#개발-워크플로우-9단계)
- [실행 방식 (체이닝 문법)](#실행-방식-체이닝-문법)
- [커맨드 레퍼런스](#커맨드-레퍼런스)
- [핵심 기능 상세](#핵심-기능-상세)
- [Cursor 병렬 실행 (mcp_task)](#cursor-병렬-실행-mcp_task)
- [Claude 버전과의 차이](#claude-버전과의-차이)
- [설정 (vais.config.json)](#설정-vaisconfigjson)
- [Extension 개발](#extension-개발)
- [프로젝트 구조](#프로젝트-구조)
- [FAQ](#faq)
- [라이선스](#라이선스)

---

## 설치

### 방법 1: .vsix 파일로 설치

```bash
# 1. 레포 클론
git clone --recurse-submodules https://github.com/ghlee3401/vais-cursor.git
cd vais-cursor

# 2. 빌드
npm install
npm run package

# 3. Cursor에 설치
cursor --install-extension vais-cursor-0.1.0.vsix
```

### 방법 2: Cursor UI에서 설치

1. `.vsix` 파일을 빌드 (위 1~2단계)
2. Cursor에서 `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
3. `vais-cursor-0.1.0.vsix` 선택

### 설치 후

프로젝트를 열고 `Ctrl+Shift+P` → `VAIS: Install` 실행.
`.cursor/rules/`, `.vais/`, `vais.config.json`이 자동으로 설치됩니다.

---

## 업데이트

vais-claude-code가 업데이트되면 아래 순서로 갱신합니다.

### 1단계: Extension 업데이트 (개발자)

```bash
cd vais-cursor

# submodule에서 최신 코드를 받아 assets/에 복사
npm run sync

# .vsix 재빌드
npm run package
```

`npm run sync`는 내부적으로:
1. `vais-claude-code/` submodule에서 `git pull origin main`
2. phases, templates, scripts, lib, AGENTS.md, vais.config.json → `assets/`에 복사

### 2단계: Cursor에 재설치

```bash
cursor --install-extension vais-cursor-0.1.0.vsix
```

또는 `Ctrl+Shift+P` → `Extensions: Install from VSIX...`

### 3단계: 프로젝트 갱신

각 프로젝트에서 `Ctrl+Shift+P` → **`VAIS: Sync`** 실행.
Extension에 포함된 최신 규칙·에셋이 프로젝트의 `.vais/`와 `.cursor/rules/`에 반영됩니다.

### 요약

```
vais-claude-code 업데이트
  → npm run sync          (submodule pull + assets 복사)
  → npm run package       (.vsix 재빌드)
  → Cursor에 .vsix 재설치
  → 각 프로젝트에서 VAIS: Sync
```

---

## 빠른 시작

Cursor 채팅에서 아래처럼 요청합니다:

```
vais auto SNS앱                          # 전체 자동 (순차 진행 + 병렬 구간 mcp_task)
vais plan:ia:wireframe 로그인기능         # 순차 체이닝
vais fe+be 로그인기능                     # 병렬 체이닝 (mcp_task)
vais plan 로그인기능                      # 단일 실행
vais status                               # 진행 상태 확인
```

피처명 없이 실행하면 기존 피처 목록에서 선택하거나 새 피처명을 입력할 수 있습니다.

---

## Extension 커맨드

`Ctrl+Shift+P`로 Command Palette를 열고 실행합니다.

| 커맨드 | 설명 |
|--------|------|
| `VAIS: Install` | 프로젝트에 VAIS 설치 (`.cursor/rules/` + `.vais/` + `vais.config.json`) |
| `VAIS: Sync` | 규칙·에셋 최신화 (extension 업데이트 후 실행) |
| `VAIS: Status` | 워크플로우 진행 상태 보기 |
| `VAIS: Uninstall` | 프로젝트에서 VAIS 제거 (`docs/` 산출물은 유지) |

---

## 개발 워크플로우 (9단계)

```
조사·탐색 → 기획 → IA → 와이어프레임 → 설계(UI+DB) → 프론트 → 백엔드 → Gap분석 → 검토
```

### 산출물 경로

| 단계 | 산출물 경로 |
|------|-----------|
| 조사·탐색 | `docs/01-research/{feature}.md` |
| 기획 (+ 코딩 규칙) | `docs/02-plan/{feature}.md` |
| IA | `docs/03-ia/{feature}.md` |
| 와이어프레임 | `docs/04-wireframe/{feature}.md` |
| UI 설계 | `docs/05-design/{feature}.md` |
| DB 설계 | `docs/05-design/{feature}-db.md` |
| Gap 분석 | `docs/06-check/{feature}.md` |
| 검토 | `docs/07-review/{feature}.md` |

프론트엔드·백엔드 단계는 코드가 산출물이므로 별도 문서를 생성하지 않습니다.

---

## 실행 방식 (체이닝 문법)

명령어가 곧 실행 방식입니다. Cursor 채팅에서 `vais` 뒤에 체이닝을 붙여 요청합니다.

| 방식 | 문법 | 예시 |
|------|------|------|
| 단일 | `vais {단계} {기능}` | `vais plan 로그인기능` |
| 순차 (`:`) | `vais {단계}:{단계} {기능}` | `vais plan:ia:wireframe 로그인기능` |
| 병렬 (`+`) | `vais {단계}+{단계} {기능}` | `vais fe+be 로그인기능` |
| 혼합 | 순차와 병렬 조합 | `vais plan:ia:design:fe+be:check 로그인기능` |
| 전체 | `vais auto {기능}` | `vais auto 로그인기능` |

### 혼합 체이닝 실행 흐름

```
vais plan:ia:design:fe+be:check 로그인기능

① plan 완료 →
② ia 완료 →
③ design 완료 (내부에서 UI+DB 병렬 → mcp_task) →
④ fe와 be 동시 실행 (mcp_task), 둘 다 완료 →
⑤ check 실행
```

에러 발생 시 **즉시 중단**하고 사용자에게 보고합니다.

---

## 커맨드 레퍼런스

### 워크플로우 커맨드

| 커맨드 | 설명 |
|--------|------|
| `vais init {기능}` | 기존 프로젝트 분석 → VAIS 문서 역생성 |
| `vais auto {기능}` | 전체 자동 워크플로우 |
| `vais research {기능}` | 아이디어 정리 + MVP 범위 결정 |
| `vais plan {기능}` | 기획서 작성 (코딩 규칙 포함) + Plan-Plus 검증 |
| `vais ia {기능}` | Information Architecture 설계 |
| `vais wireframe {기능}` | 와이어프레임 생성 (ASCII/HTML) |
| `vais design {기능}` | UI + DB 설계 (병렬 → mcp_task) |
| `vais fe {기능}` | 프론트엔드 구현 |
| `vais be {기능}` | 백엔드 구현 |
| `vais check {기능}` | 빌드 검증 + Gap 분석 + QA 시나리오 생성 |
| `vais review {기능}` | 코드 리뷰 + QA 판정 + 최종 승인 |
| `vais fix {기능}` | 영향 분석 → 코드·문서 일괄 수정 → 검증 |

### 유틸리티 커맨드

| 커맨드 | 설명 |
|--------|------|
| `vais test` | 테스트 실행 + 커버리지 리포트 |
| `vais commit` | Conventional Commits 형식 자동 커밋 |
| `vais status` | 전체 피처 워크플로우 진행 상태 |
| `vais next` | 다음 단계 자동 안내 |
| `vais help` | 대화형 사용법 안내 |

### 와이어프레임 옵션

| 커맨드 | 설명 |
|--------|------|
| `vais wireframe {기능}` | ASCII 와이어프레임 (기본) |
| `vais wireframe {기능} --format html` | HTML 와이어프레임 |
| `vais wireframe {기능} --format mermaid` | Mermaid 화면 흐름도 |
| `vais wireframe {기능} --device all` | 반응형 전체 (모바일+태블릿+데스크탑) |

---

## 핵심 기능 상세

### 자동 워크플로우 (`vais auto`)

tech-lead 역할로 전체 9단계를 자동 진행합니다. 병렬 구간(design, fe+be)에서는 mcp_task로 subagent를 호출합니다.

**게이트 체크포인트**: `plan`, `fe` 단계 완료 시 사용자에게 확인을 요청합니다.
- "계속" — 다음 단계로 진행
- "수정 후 계속" — 피드백 반영 후 진행
- "여기서 중단" — 워크플로우 일시 중지

### Plan-Plus (강화된 기획)

기획 단계에서 3단계 검증을 자동 수행합니다:

| 검증 단계 | 질문 | 목적 |
|----------|------|------|
| 의도 탐색 | "이 기능이 정말 해결하려는 문제가 뭔가?" | 근본 원인 파악 |
| 대안 탐색 | "기존 라이브러리나 다른 접근법은 없나?" | 최선의 방법 선택 |
| YAGNI 리뷰 | "지금 당장 필요한 것만 포함했나?" | 과잉 설계 방지 |

### 설계 병렬화 (UI + DB)

design 단계에서 UI 설계와 DB 설계를 병렬로 진행합니다:

- plan에서 `hasDatabase` 플래그를 판단
- DB 필요 시 → mcp_task(designer) + mcp_task(backend-dev) 동시 호출
- DB 불필요 시 → UI 설계만 실행

| DB 종류 | ORM/클라이언트 |
|---------|--------------|
| SQLite | better-sqlite3 / Prisma |
| PostgreSQL | Prisma / Drizzle |
| Supabase | @supabase/supabase-js |
| Firebase | firebase-admin |
| MongoDB | mongoose |

### 빌드 검증 + Gap 분석 (`vais check`)

check 단계는 4단계로 구성됩니다:

1. **빌드/실행 검증** — 의존성 → 빌드 → 서버 시작 → 핵심 동작 확인
2. **Gap 분석** — 설계 vs 구현 비교, 일치율 산출, 패치 단위 수정 지시
3. **보안 스캔** — OWASP Top 10 체크
4. **QA 시나리오 생성** — 기획서 기반 테스트 시나리오 (review에서 판정)

### 문서 참조 투명성

에이전트가 구현 시 참조한 문서 목록을 산출물 상단에 기록합니다:

```markdown
> 참조 문서:
> - plan 3.1: 네이밍 규칙
> - design 4.2: 색상 토큰
```

### 테스트 & 커밋

```bash
vais test     # 프레임워크 자동 감지 (jest, vitest, pytest 등)
vais commit   # → feat(auth): 로그인 API 엔드포인트 추가
```

---

## Cursor 병렬 실행 (mcp_task)

Cursor에는 Agent Team이 없으므로, 병렬 구간은 **mcp_task**로 subagent를 호출합니다.

### 역할 매핑

| 역할 | subagent_type | 담당 단계 |
|------|---------------|----------|
| tech-lead | `tech-lead` | 전체 총괄 (auto 시 오케스트레이터) |
| designer | `designer` | ia, wireframe, design (UI) |
| frontend-dev | `frontend-dev` | fe |
| backend-dev | `backend-dev` | design (DB), be |
| reviewer | `reviewer` | check, review |

### 병렬 호출 방식

| 체이닝 | mcp_task 호출 A | mcp_task 호출 B |
|--------|-----------------|-----------------|
| `design` | `subagent_type: "designer"` | `subagent_type: "backend-dev"` |
| `fe+be` | `subagent_type: "frontend-dev"` | `subagent_type: "backend-dev"` |

### auto 실행 흐름

```
메인 에이전트 (tech-lead 역할): research → plan
  → mcp_task(designer): ia → wireframe
  → mcp_task(designer) + mcp_task(backend-dev) 병렬: design (UI + DB)
  → mcp_task(frontend-dev) + mcp_task(backend-dev) 병렬: fe + be
  → mcp_task(reviewer): check → review
```

---

## Claude 버전과의 차이

| 항목 | Claude (vais-claude-code) | Cursor (vais-cursor) |
|------|--------------------------|---------------------|
| 설치 | `/plugin install` | **Cursor Extension (.vsix)** |
| 병렬 실행 | Agent 도구 / Agent Teams | **mcp_task** (subagent 호출) |
| 훅 시스템 | 6개 자동 훅 (SessionStart, Stop 등) | 없음 (규칙으로 대체, 스크립트 수동 실행) |
| Agent Teams | 지원 (실험적) | 미지원 |
| 커맨드 접두사 | `/vais` (슬래시 커맨드) | `vais` (채팅 입력) |
| 에이전트 정의 | `agents/*.md` | Cursor subagent_type 직접 사용 |
| 스킬 라우터 | `SKILL.md` (Skills 2.0) | `.cursor/rules/vais-workflow.mdc` |

**공통**: 9단계 워크플로우, 체이닝 문법, 문서 구조, 설정(vais.config.json), 스크립트, 템플릿.

---

## 설정 (vais.config.json)

| 설정 | 기본값 | 설명 |
|------|-------|------|
| `workflow.phases` | 9단계 배열 | research → plan → ia → wireframe → design → fe → be → check → review |
| `parallelGroups.design` | `["ui-design", "db-design"]` | 설계 단계 병렬 그룹 |
| `parallelGroups.implementation` | `["fe", "be"]` | 구현 단계 병렬 그룹 |
| `chaining.sequential` | `":"` | 순차 실행 구분자 |
| `chaining.parallel` | `"+"` | 병렬 실행 구분자 |
| `gapAnalysis.matchThreshold` | 90 | Gap 분석 통과 기준 (%) |
| `gapAnalysis.maxIterations` | 5 | 자동 수정 최대 반복 횟수 |
| `orchestration.gates` | `["plan", "fe"]` | 자동 모드에서 사용자 확인 체크포인트 |

---

## Extension 개발

이 레포 자체를 수정하거나 빌드하는 개발자를 위한 안내입니다.

### 사전 요구

| 항목 | 최소 버전 |
|------|----------|
| Node.js | v18+ |
| Cursor | 최신 버전 권장 |

### 셋업

```bash
git clone --recurse-submodules https://github.com/ghlee3401/vais-cursor.git
cd vais-cursor
npm install
```

### 빌드 & 패키징

```bash
npm run compile     # TypeScript 컴파일
npm run package     # .vsix 빌드
```

### 개발 모드 (F5 디버깅)

Cursor/VS Code에서 이 레포를 열고 `F5` → Extension Development Host가 실행됩니다.

### vais-claude-code 동기화

```bash
npm run sync        # submodule pull + assets/ 복사
npm run package     # .vsix 재빌드
```

자세한 동기화 절차는 [SYNC.md](./SYNC.md) 참고.

---

## 프로젝트 구조

```
vais-cursor/
├── src/
│   └── extension.ts            # Extension 진입점 (install/sync/status/uninstall)
├── assets/                      # 사용자 프로젝트에 설치되는 파일들
│   ├── cursor-rules/
│   │   └── vais-workflow.mdc   # Cursor용 VAIS 규칙
│   ├── phases/                  # phase별 지침 (동기화됨)
│   ├── templates/               # 문서 템플릿 (동기화됨)
│   ├── scripts/                 # 유틸리티 스크립트 (동기화됨)
│   ├── lib/                     # 유틸리티 (동기화됨)
│   ├── AGENTS.md                # 에이전트 지침 (동기화됨)
│   └── vais.config.json         # 중앙 설정 (동기화됨)
├── bin/
│   └── sync-from-claude.js      # 동기화 스크립트
├── vais-claude-code/            # git submodule (소스)
├── .cursor/rules/               # 이 레포 개발용 규칙
├── out/                         # 컴파일 출력 (gitignore)
├── package.json                 # Extension manifest + scripts
├── tsconfig.json
├── .vscodeignore                # .vsix 패키징 제외 목록
├── AGENTS.md
├── vais.config.json
├── SYNC.md
├── LICENSE
└── README.md
```

---

## FAQ

### Q: Claude 버전과 같은 워크플로우인가요?

네. 동일한 9단계, 동일한 문서 구조, 동일한 체이닝 문법입니다. 차이는 병렬 실행 방식(Agent → mcp_task)과 훅(자동 → 규칙/수동)뿐입니다.

### Q: Claude 버전이 업데이트되면?

`npm run sync && npm run package` → Cursor에 .vsix 재설치 → 각 프로젝트에서 `VAIS: Sync`.

### Q: 훅이 없으면 불편하지 않나요?

`.cursor/rules/vais-workflow.mdc`에 핵심 규칙이 들어 있어, 에이전트가 규칙을 따라 동작합니다. 위험 명령 차단(`bash-guard.js`)이나 상태 확인(`get-context.js`)은 필요할 때 터미널에서 직접 실행할 수 있습니다.

### Q: 특정 단계만 실행할 수 있나요?

네. `vais plan 로그인기능`처럼 단일 실행하거나, `vais plan:ia 로그인기능`으로 체이닝할 수 있습니다.

### Q: 기존 프로젝트에도 적용할 수 있나요?

네. `VAIS: Install` 후 `vais init {피처명}`으로 기존 코드를 분석해 VAIS 문서를 역생성합니다.

### Q: 외부 의존성이 있나요?

런타임 의존성은 없습니다. Extension은 VS Code API만 사용합니다.

---

## 라이선스

MIT License (vais-claude-code와 동일)

---

Made by [VAIS Voice](https://github.com/ghlee3401)

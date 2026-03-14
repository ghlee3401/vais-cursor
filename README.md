# VAIS Cursor

> VAIS 9단계 개발 워크플로우의 **Cursor용** 버전. 메인 소스는 [vais-claude-code](https://github.com/ghlee3401/vais-claude-code)이며, 이 레포는 **한 방향 동기화**로 갱신됩니다.

## vais-claude-code → vais-cursor

- **역할**: Claude가 메인, Cursor는 서브. 공통 콘텐츠(기획·설계·문서 구조·스크립트)는 Claude 레포에서만 수정하고, Cursor 레포는 동기화 스크립트로 반영합니다.
- **병렬 실행**: Cursor에는 Agent Team이 없으므로, `design` / `fe+be` 구간은 **mcp_task**로 designer·backend-dev·frontend-dev·reviewer 등 subagent를 호출하는 방식으로 동작합니다.

## 설치

프로젝트에 VAIS Cursor를 쓰려면:

1. 이 레포를 클론하거나 프로젝트에 복사합니다 (예: `vais-cursor/` 또는 `.vais-cursor/`).
2. Cursor 규칙으로 **`.cursor/rules/`** 내용을 프로젝트의 `.cursor/rules/`에 넣거나, 이 레포의 규칙을 참조하도록 설정합니다.
3. (선택) 환경 변수 **`VAIS_CURSOR_ROOT`**에 이 폴더 경로를 지정하면, 규칙에서 스크립트·phases 경로를 찾을 수 있습니다.

## 동기화 (vais-claude-code → vais-cursor)

Claude 쪽이 업데이트된 뒤, 이 레포에서 아래 한 번 실행하면 됩니다.

```bash
# vais-cursor 루트에서 실행. 기본값: ../vais-claude-code
npm run sync
# 또는
node bin/sync-from-claude.js
```

다른 경로에 있는 Claude 레포를 쓰려면:

```bash
VAIS_CLAUDE_REPO=/path/to/vais-claude-code node bin/sync-from-claude.js
```

### 동기화되는 항목

| 소스 (vais-claude-code) | 대상 (vais-cursor) |
|-------------------------|---------------------|
| `AGENTS.md`             | `AGENTS.md`         |
| `vais.config.json`      | `vais.config.json`  |
| `skills/vais/phases/`   | `phases/`           |
| `templates/`            | `templates/`        |
| `scripts/`              | `scripts/`          |
| `lib/`                  | `lib/`              |

**동기화되지 않는 것** (Cursor 전용): `bin/`, `.cursor/`, `README.md`, 이 동기화 설명.

## 사용법

- **규칙**: `.cursor/rules/vais-workflow.mdc`가 VAIS 워크플로우와 체이닝·mcp_task 매핑을 설명합니다.
- **phase 지침**: 동기화된 `phases/*.md`를 참고해 `/vais plan`, `/vais fe+be` 등 동일한 액션을 수행합니다.
- **상태 확인**: (선택) `node vais-cursor/scripts/get-context.js [피처명]`으로 진행 상태를 볼 수 있습니다.

## 라이선스

MIT (vais-claude-code와 동일).

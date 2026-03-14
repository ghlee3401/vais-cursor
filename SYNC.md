# 동기화 체크리스트 (vais-claude-code → vais-cursor)

vais-claude-code가 업데이트되면 vais-cursor를 다음 순서로 갱신하세요.

## 1. 자동 동기화

vais-cursor 루트에서:

```bash
node bin/sync-from-claude.js
```

기본값으로 `../vais-claude-code`에서 위 항목을 복사합니다. 다른 경로면:

```bash
VAIS_CLAUDE_REPO=/path/to/vais-claude-code node bin/sync-from-claude.js
```

## 2. 수동 확인 (필요 시)

- **.cursor/rules**  
  Claude 측에 규칙/워크플로우 변경이 있으면 `vais-workflow.mdc`의 체이닝·mcp_task 매핑이 여전히 맞는지 확인하세요.
- **README**  
  동기화 대상 목록이나 사용법이 바뀌었으면 이 레포의 README를 수동으로 수정하세요.

## 3. 동기화되는 파일 목록

| Claude (소스) | Cursor (대상) |
|---------------|----------------|
| AGENTS.md | AGENTS.md |
| vais.config.json | vais.config.json |
| skills/vais/phases/*.md | phases/*.md |
| templates/* | templates/* |
| scripts/* | scripts/* |
| lib/* | lib/* |

Cursor 전용(동기화 제외): `bin/`, `.cursor/`, `README.md`, `SYNC.md`.

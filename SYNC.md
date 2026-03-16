# 동기화 체크리스트 (vais-claude-code → vais-cursor)

vais-claude-code가 업데이트되면 vais-cursor를 다음 순서로 갱신하세요.

## 1. 자동 동기화

vais-claude-code는 **git submodule**로 포함되어 있습니다. 동기화 한 번이면 pull + assets/ 복사가 자동으로 진행됩니다:

```bash
npm run sync
```

### 최초 클론 시

```bash
git clone --recurse-submodules https://github.com/ghlee3401/vais-cursor.git
# 또는 이미 클론했다면:
git submodule update --init
```

### 외부 경로 사용 (선택)

submodule 대신 별도 경로의 Claude 레포를 쓰려면:

```bash
VAIS_CLAUDE_REPO=/path/to/vais-claude-code npm run sync
```

## 2. .vsix 재빌드

동기화 후 extension을 다시 패키징합니다:

```bash
npm run package
```

## 3. 수동 확인 (필요 시)

- **assets/cursor-rules/**
  Claude 측에 규칙/워크플로우 변경이 있으면 `vais-workflow.mdc`를 수동으로 업데이트하세요.
- **README**
  동기화 대상 목록이나 사용법이 바뀌었으면 이 레포의 README를 수동으로 수정하세요.

## 4. 동기화되는 파일 목록

| Claude (소스) | Cursor (대상) |
|---------------|----------------|
| AGENTS.md | assets/AGENTS.md |
| vais.config.json | assets/vais.config.json |
| skills/vais/phases/*.md | assets/phases/*.md |
| templates/* | assets/templates/* |
| scripts/* | assets/scripts/* |
| lib/* | assets/lib/* |

Cursor 전용(동기화 제외): `bin/`, `src/`, `.cursor/`, `assets/cursor-rules/`, `README.md`, `SYNC.md`.

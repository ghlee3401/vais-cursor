# Changelog

## [0.4.0] - 2026-03-19

### Changed

- **vais-claude-code 0.13.0 동기화** -- Manager 에이전트, Memory 시스템, fix 체이닝, 피처 레지스트리 등 최신 워크플로우 반영
  - Manager 에이전트: 프로젝트 최상위 의사결정자, 피처 간 의존성 관리
  - Memory 시스템: `.vais/memory.json` 영속 메모리 (7가지 엔트리 타입)
  - fix 워크플로우: 영향 분석 기반 크로스-피처 수정
  - 피처 레지스트리: `.vais/features/{feature}.json` 기능 목록 구조화 저장
  - 워크플로우 10단계 -> 9단계 간소화 (convention 단계 통합)
  - SKILL.md Skills 2.0 리팩토링, 단계명 간소화 (frontend -> fe, backend -> be)
  - QA 시나리오, init 명령어, wireframe 스킬 통합, check Gap 방향 판단

### Fixed

- **코드베이스 전체 점검** -- 버그, 보안, 설정 수정 (PR #1)

---

## [0.3.0] - 2026-03-16

### Added

- **README 사용법 섹션 추가** -- 설치부터 사용까지 단계별 안내
- **업데이트 방법 정리** -- submodule 동기화 -> 빌드 -> 재설치 -> Sync 흐름 문서화

---

## [0.2.0] - 2026-03-15

### Changed

- 각 phase를 개별 `.mdc` 규칙 파일로 변환
- Cursor Extension으로 전환 (`src/extension.ts`)
- vais-claude-code를 git submodule으로 추가, sync 스크립트 개선

---

## [0.1.0] - 2026-03-14

### Added

- 초기 프로젝트 구조
- README 사용법 가이드

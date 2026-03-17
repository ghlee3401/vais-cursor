#!/usr/bin/env node
/**
 * VAIS Code - Bash Guard (PreToolUse)
 * 위험한 명령을 자동 차단
 */
const { readStdin, parseHookInput, outputAllow, outputBlock } = require('../lib/io');
const { debugLog } = require('../lib/debug');

const input = readStdin();
const { command } = parseHookInput(input);

if (!command) {
  outputAllow();
  process.exit(0);
}

const BLOCKED = [
  { pattern: /rm\s+(-[a-zA-Z]*r[a-zA-Z]*\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?|(-[a-zA-Z]*f[a-zA-Z]*\s+)?-[a-zA-Z]*r[a-zA-Z]*\s+)\/(\s|$)/, reason: '루트 디렉토리 삭제 시도' },
  { pattern: /rm\s+(-[a-zA-Z]*r[a-zA-Z]*\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?|(-[a-zA-Z]*f[a-zA-Z]*\s+)?-[a-zA-Z]*r[a-zA-Z]*\s+)~/, reason: '홈 디렉토리 삭제 시도' },
  { pattern: /rm\s+(-[a-zA-Z]*r[a-zA-Z]*\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?|(-[a-zA-Z]*f[a-zA-Z]*\s+)?-[a-zA-Z]*r[a-zA-Z]*\s+)\.(\s|\/?\s|$)/, reason: '현재 디렉토리 전체 삭제 시도' },
  { pattern: /rm\s+-rf\s/i, reason: '재귀 강제 삭제 시도' },
  { pattern: /drop\s+database/i, reason: 'DB 전체 삭제 시도' },
  { pattern: /drop\s+table/i, reason: 'DB 테이블 삭제 시도' },
  { pattern: /truncate\s+table/i, reason: 'DB 테이블 초기화 시도' },
  { pattern: /git\s+push\s+.*--force/, reason: '강제 푸시는 팀 작업에 위험합니다' },
  { pattern: /git\s+push\s+.*-f(\s|$)/, reason: '강제 푸시는 팀 작업에 위험합니다' },
  { pattern: /mkfs\b/, reason: '파일시스템 포맷 시도' },
  { pattern: /:\(\)\{.*\|.*&\s*\}/, reason: 'Fork bomb 감지' },
  { pattern: /dd\s+.*of=\/dev\//, reason: '디스크 직접 쓰기 시도' },
];

const ASK = [
  { pattern: /rm\s+-r\b/, reason: '재귀 삭제 명령 - 정말 실행할까요?' },
  { pattern: /git\s+reset\s+--hard/, reason: '커밋되지 않은 변경사항이 모두 사라집니다' },
  { pattern: /delete\s+from/i, reason: 'DB 레코드 대량 삭제' },
];

for (const { pattern, reason } of BLOCKED) {
  if (typeof command === 'string' && pattern.test(command)) {
    debugLog('BashGuard', 'BLOCKED', { reason });
    // 로그에 명령어 전체를 노출하지 않고 축약
    const displayCmd = command.length > 80 ? command.substring(0, 80) + '...' : command;
    outputBlock(`⛔ 차단됨: ${reason}\n명령: ${displayCmd}`);
    process.exit(0);
  }
}

for (const { pattern, reason } of ASK) {
  if (typeof command === 'string' && pattern.test(command)) {
    debugLog('BashGuard', 'WARNING', { command, reason });
    outputAllow(`⚠️ 주의: ${reason}\n실행하려는 명령: \`${command}\`\n사용자에게 확인을 받으세요.`);
    process.exit(0);
  }
}

outputAllow();
process.exit(0);

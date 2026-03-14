#!/usr/bin/env node
/**
 * VAIS Cursor - 한 방향 동기화: vais-claude-code → vais-cursor
 * vais-cursor 루트에서 실행: node bin/sync-from-claude.js
 *
 * 환경 변수:
 *   VAIS_CLAUDE_REPO - Claude 레포 경로 (기본: ../vais-claude-code)
 */
const fs = require('fs');
const path = require('path');

const CURSOR_ROOT = path.resolve(__dirname, '..');
const CLAUDE_ROOT = process.env.VAIS_CLAUDE_REPO
  ? path.resolve(process.cwd(), process.env.VAIS_CLAUDE_REPO)
  : path.resolve(CURSOR_ROOT, '..', 'vais-claude-code');

const SYNC_MAP = [
  { src: 'AGENTS.md', dest: 'AGENTS.md' },
  { src: 'vais.config.json', dest: 'vais.config.json' },
  { src: 'skills/vais/phases', dest: 'phases', dir: true },
  { src: 'templates', dest: 'templates', dir: true },
  { src: 'scripts', dest: 'scripts', dir: true },
  { src: 'lib', dest: 'lib', dir: true },
];

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

function main() {
  if (!fs.existsSync(CLAUDE_ROOT)) {
    console.error('Claude 레포를 찾을 수 없습니다:', CLAUDE_ROOT);
    console.error('VAIS_CLAUDE_REPO 환경 변수로 경로를 지정하세요.');
    process.exit(1);
  }

  console.log('동기화: %s → %s', CLAUDE_ROOT, CURSOR_ROOT);

  for (const { src, dest, dir } of SYNC_MAP) {
    const srcPath = path.join(CLAUDE_ROOT, src);
    const destPath = path.join(CURSOR_ROOT, dest);
    if (!fs.existsSync(srcPath)) {
      console.warn('건너뜀 (없음):', src);
      continue;
    }
    if (dir) {
      copyDir(srcPath, destPath);
      console.log('복사(폴더): %s → %s', src, dest);
    } else {
      copyFile(srcPath, destPath);
      console.log('복사: %s → %s', src, dest);
    }
  }

  console.log('동기화 완료.');
}

main();

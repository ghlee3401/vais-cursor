#!/usr/bin/env node
/**
 * VAIS Cursor - 한 방향 동기화: vais-claude-code → vais-cursor
 * vais-cursor 루트에서 실행: node bin/sync-from-claude.js
 *
 * submodule(vais-claude-code/)에서 git pull 후 파일을 복사합니다.
 * 환경 변수:
 *   VAIS_CLAUDE_REPO - Claude 레포 경로 (기본: ./vais-claude-code submodule)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CURSOR_ROOT = path.resolve(__dirname, '..');
const CLAUDE_ROOT = process.env.VAIS_CLAUDE_REPO
  ? path.resolve(process.cwd(), process.env.VAIS_CLAUDE_REPO)
  : path.resolve(CURSOR_ROOT, 'vais-claude-code');

const SYNC_MAP = [
  { src: 'AGENTS.md', dest: 'assets/AGENTS.md' },
  { src: 'vais.config.json', dest: 'assets/vais.config.json' },
  { src: 'skills/vais/phases', dest: 'assets/phases', dir: true },
  { src: 'templates', dest: 'assets/templates', dir: true },
  { src: 'scripts', dest: 'assets/scripts', dir: true },
  { src: 'lib', dest: 'assets/lib', dir: true },
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

function pullSubmodule() {
  console.log('submodule 최신화: git pull (main)...');
  try {
    const submodulePath = path.join(CURSOR_ROOT, 'vais-claude-code');
    execSync('git pull origin main', {
      cwd: submodulePath,
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('submodule pull 실패:', e.message);
    process.exit(1);
  }
}

function main() {
  if (!fs.existsSync(CLAUDE_ROOT)) {
    console.error('Claude 레포를 찾을 수 없습니다:', CLAUDE_ROOT);
    console.error('git submodule update --init 을 먼저 실행하세요.');
    process.exit(1);
  }

  // submodule이면 pull, 외부 경로면 건너뜀
  if (!process.env.VAIS_CLAUDE_REPO) {
    pullSubmodule();
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

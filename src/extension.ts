import * as vscode from 'vscode';

// 설치 대상 디렉토리 매핑: extension assets → workspace
const ASSET_MAP = [
  { src: 'cursor-rules', dest: '.cursor/rules' },
  { src: 'phases',       dest: '.vais/phases' },
  { src: 'templates',    dest: '.vais/templates' },
  { src: 'scripts',      dest: '.vais/scripts' },
  { src: 'lib',          dest: '.vais/lib' },
];

const ASSET_FILES = [
  { src: 'AGENTS.md',        dest: '.vais/AGENTS.md' },
  { src: 'vais.config.json', dest: 'vais.config.json' },
];

function getWorkspaceUri(): vscode.Uri | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri;
}

function assetUri(context: vscode.ExtensionContext, ...segments: string[]): vscode.Uri {
  return vscode.Uri.joinPath(context.extensionUri, 'assets', ...segments);
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src: vscode.Uri, dest: vscode.Uri): Promise<number> {
  let count = 0;
  const entries = await vscode.workspace.fs.readDirectory(src);
  for (const [name, type] of entries) {
    const s = vscode.Uri.joinPath(src, name);
    const d = vscode.Uri.joinPath(dest, name);
    if (type === vscode.FileType.Directory) {
      count += await copyDir(s, d);
    } else {
      await vscode.workspace.fs.copy(s, d, { overwrite: true });
      count++;
    }
  }
  return count;
}

async function deleteDir(uri: vscode.Uri): Promise<void> {
  try {
    await vscode.workspace.fs.delete(uri, { recursive: true, useTrash: false });
  } catch {
    // ignore if not exists
  }
}

// ─── VAIS: Install ───────────────────────────────────────────────
async function installCommand(context: vscode.ExtensionContext): Promise<void> {
  const wsUri = getWorkspaceUri();
  if (!wsUri) {
    vscode.window.showErrorMessage('워크스페이스를 먼저 열어주세요.');
    return;
  }

  const vaisDir = vscode.Uri.joinPath(wsUri, '.vais');
  if (await exists(vaisDir)) {
    const answer = await vscode.window.showQuickPick(['덮어쓰기', '취소'], {
      placeHolder: '.vais 폴더가 이미 존재합니다. 덮어쓸까요?',
    });
    if (answer !== '덮어쓰기') { return; }
  }

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'VAIS 설치 중...' },
    async (progress) => {
      let totalFiles = 0;

      // 디렉토리 복사
      for (const { src, dest } of ASSET_MAP) {
        progress.report({ message: `${src} 복사 중...` });
        const srcUri = assetUri(context, src);
        const destUri = vscode.Uri.joinPath(wsUri, dest);
        totalFiles += await copyDir(srcUri, destUri);
      }

      // 단일 파일 복사
      for (const { src, dest } of ASSET_FILES) {
        progress.report({ message: `${src} 복사 중...` });
        const srcUri = assetUri(context, src);
        const destUri = vscode.Uri.joinPath(wsUri, dest);
        await vscode.workspace.fs.copy(srcUri, destUri, { overwrite: true });
        totalFiles++;
      }

      vscode.window.showInformationMessage(
        `VAIS 설치 완료! (${totalFiles}개 파일)  Cursor 채팅에서 "vais auto 피처명"으로 시작하세요.`
      );
    }
  );
}

// ─── VAIS: Sync ──────────────────────────────────────────────────
async function syncCommand(context: vscode.ExtensionContext): Promise<void> {
  const wsUri = getWorkspaceUri();
  if (!wsUri) {
    vscode.window.showErrorMessage('워크스페이스를 먼저 열어주세요.');
    return;
  }

  const vaisDir = vscode.Uri.joinPath(wsUri, '.vais');
  if (!(await exists(vaisDir))) {
    vscode.window.showWarningMessage('VAIS가 설치되지 않았습니다. "VAIS: Install"을 먼저 실행하세요.');
    return;
  }

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'VAIS 동기화 중...' },
    async (progress) => {
      let totalFiles = 0;

      for (const { src, dest } of ASSET_MAP) {
        progress.report({ message: `${src} 동기화 중...` });
        const srcUri = assetUri(context, src);
        const destUri = vscode.Uri.joinPath(wsUri, dest);
        totalFiles += await copyDir(srcUri, destUri);
      }

      for (const { src, dest } of ASSET_FILES) {
        progress.report({ message: `${src} 동기화 중...` });
        const srcUri = assetUri(context, src);
        const destUri = vscode.Uri.joinPath(wsUri, dest);
        await vscode.workspace.fs.copy(srcUri, destUri, { overwrite: true });
        totalFiles++;
      }

      vscode.window.showInformationMessage(`VAIS 동기화 완료! (${totalFiles}개 파일)`);
    }
  );
}

// ─── VAIS: Status ────────────────────────────────────────────────
async function statusCommand(): Promise<void> {
  const wsUri = getWorkspaceUri();
  if (!wsUri) {
    vscode.window.showErrorMessage('워크스페이스를 먼저 열어주세요.');
    return;
  }

  const statusUri = vscode.Uri.joinPath(wsUri, '.vais', 'status.json');
  if (!(await exists(statusUri))) {
    vscode.window.showInformationMessage('VAIS: 아직 워크플로우가 시작되지 않았습니다.');
    return;
  }

  const raw = await vscode.workspace.fs.readFile(statusUri);
  const status = JSON.parse(Buffer.from(raw).toString('utf8'));

  const phases = ['research', 'plan', 'ia', 'wireframe', 'design', 'fe', 'be', 'check', 'review'];
  const phaseNames: Record<string, string> = {
    research: '조사·탐색', plan: '기획', ia: 'IA 설계',
    wireframe: '와이어프레임', design: '설계', fe: '프론트엔드',
    be: '백엔드', check: 'Gap 분석', review: '검토',
  };

  const lines: string[] = ['# VAIS Workflow Status\n'];

  const features = status.features || {};
  for (const [feature, data] of Object.entries<any>(features)) {
    lines.push(`## ${feature}\n`);
    const featurePhases = data.phases || {};
    for (const p of phases) {
      const s = featurePhases[p]?.status || 'pending';
      const icon = s === 'completed' ? '✅' : s === 'in_progress' ? '🔄' : '⬜';
      lines.push(`${icon} ${phaseNames[p] || p}`);
    }
    lines.push('');
  }

  if (Object.keys(features).length === 0) {
    lines.push('진행 중인 피처가 없습니다.');
  }

  const doc = await vscode.workspace.openTextDocument({
    content: lines.join('\n'),
    language: 'markdown',
  });
  await vscode.window.showTextDocument(doc, { preview: true });
}

// ─── VAIS: Uninstall ─────────────────────────────────────────────
async function uninstallCommand(): Promise<void> {
  const wsUri = getWorkspaceUri();
  if (!wsUri) { return; }

  const answer = await vscode.window.showWarningMessage(
    'VAIS를 프로젝트에서 제거합니다. .vais/ 폴더와 .cursor/rules/vais-workflow.mdc가 삭제됩니다. docs/ 폴더(산출물)는 유지됩니다.',
    { modal: true },
    '제거',
  );
  if (answer !== '제거') { return; }

  await deleteDir(vscode.Uri.joinPath(wsUri, '.vais'));

  // .cursor/rules/vais-*.mdc 모두 삭제
  try {
    const rulesDir = vscode.Uri.joinPath(wsUri, '.cursor', 'rules');
    const entries = await vscode.workspace.fs.readDirectory(rulesDir);
    for (const [name] of entries) {
      if (name.startsWith('vais-') && name.endsWith('.mdc')) {
        await vscode.workspace.fs.delete(vscode.Uri.joinPath(rulesDir, name));
      }
    }
  } catch {
    // ignore if .cursor/rules doesn't exist
  }

  // vais.config.json 제거
  try {
    await vscode.workspace.fs.delete(vscode.Uri.joinPath(wsUri, 'vais.config.json'));
  } catch {
    // ignore
  }

  vscode.window.showInformationMessage('VAIS가 프로젝트에서 제거되었습니다. docs/ 산출물은 유지됩니다.');
}

// ─── activate / deactivate ───────────────────────────────────────
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('vais.install', () => installCommand(context)),
    vscode.commands.registerCommand('vais.sync', () => syncCommand(context)),
    vscode.commands.registerCommand('vais.status', () => statusCommand()),
    vscode.commands.registerCommand('vais.uninstall', () => uninstallCommand()),
  );
}

export function deactivate(): void {}

// Inicia backend (porta 3001) e frontend Vite (porta 5173) juntos, sem dependências extras.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const children = [
  spawn(process.execPath, ['--watch', '--disable-warning=ExperimentalWarning', 'server/server.js'], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, [path.join('node_modules', 'vite', 'bin', 'vite.js')], { cwd: root, stdio: 'inherit' }),
];

const stop = (code = 0) => {
  for (const child of children) child.kill();
  process.exit(code);
};
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
for (const child of children) child.on('exit', (code) => code && stop(code));

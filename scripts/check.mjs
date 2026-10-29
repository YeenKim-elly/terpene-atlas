import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function walk(directory) {
  return (await Promise.all((await fs.readdir(directory, {withFileTypes: true})).map(async entry =>
    entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]
  ))).flat();
}
for (const directory of ['src', 'scripts', 'tests']) {
  for (const file of (await walk(path.join(root, directory))).filter(file => /\.[cm]?js$/.test(file))) {
    const result = spawnSync(process.execPath, ['--check', file], {stdio: 'inherit'});
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
const tests = (await walk(path.join(root, 'tests'))).filter(file => file.endsWith('.test.mjs'));
const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...tests], {stdio: 'inherit'});
process.exit(result.status || 0);

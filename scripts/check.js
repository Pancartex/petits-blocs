import { readdir, readFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.filter(entry => !entry.name.startsWith('.') && entry.name !== 'node_modules')
    .map(entry => entry.isDirectory() ? filesIn(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return nested.flat();
}

let modules = 0;
let references = 0;
for (const file of await filesIn(root)) {
  const extension = path.extname(file);
  if (!['.html', '.js', '.css'].includes(extension)) continue;
  const source = await readFile(file, 'utf8');
  if (extension === '.js') {
    const checked = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (checked.status !== 0) throw new Error(checked.stderr || `Syntax check failed: ${file}`);
    modules++;
  }
  const pattern = extension === '.html' ? /(?:src|href)=["']([^"']+)["']/g
    : extension === '.css' ? /url\(['"]?([^)'"\s]+)['"]?\)/g
    : /(?:\bfrom\s*|\bimport\s*)['"]([^'"]+)['"]/g;
  for (const [, reference] of source.matchAll(pattern)) {
    if (!reference.startsWith('.')) continue;
    await access(path.resolve(path.dirname(file), reference));
    references++;
  }
}
console.log(`Checked ${modules} JavaScript files and ${references} local asset/module references.`);

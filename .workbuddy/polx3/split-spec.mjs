import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(new URL('./spec/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const src = readFileSync(resolve(new URL('./SPEC.md', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'utf8');
const blocks = src.split(/\n(?=## xx3-)/).filter((s) => s.startsWith('## xx3-'));
for (const b of blocks) {
  const m = b.match(/^## (xx3-c\d+-s\d+)\s+(.+)$/m);
  if (!m) continue;
  writeFileSync(resolve(dir, `${m[1]}.md`), `# 本节规格\n\n${b.trim()}\n`, 'utf8');
}
console.log(`${blocks.length} specs written`);

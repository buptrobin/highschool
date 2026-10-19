import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(new URL('./spec/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const files = ['bx3a.md', 'bx3b.md', 'bx4a.md', 'bx4b.md'];
let n = 0;
for (const f of files) {
  const src = readFileSync(resolve(dir, f), 'utf8');
  const blocks = src.split(/\n(?=## bx[34]-)/).filter((s) => /^## bx[34]-/.test(s));
  for (const b of blocks) {
    const m = b.match(/^## (bx[34]-c\d+-s\d+)\s+(.+)$/m);
    if (!m) continue;
    writeFileSync(resolve(dir, `${m[1]}.md`), `# 本节规格\n\n${b.trim()}\n`, 'utf8');
    n++;
  }
}
console.log(`${n} specs written`);
console.log(readdirSync(dir).filter((x) => /^bx[34]-/.test(x)).length + ' spec files on disk');

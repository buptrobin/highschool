/* 清理 headless Chrome 体检留下的临时 profile。
   用法：node tools/clean-temp.mjs
   只删 %TEMP% 下 45 分钟前创建的 iso-drive-* 目录，正在跑的不动。 */
import { readdirSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const cutoff = Date.now() - 45 * 60 * 1000;
let removed = 0, bytes = 0, skipped = 0;

function sizeOf(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    try {
      const st = statSync(p);
      total += st.isDirectory() ? sizeOf(p) : st.size;
    } catch { /* 正在被删除就跳过 */ }
  }
  return total;
}

for (const name of readdirSync(tmpdir())) {
  if (!/^iso-drive-/.test(name)) continue;
  const p = join(tmpdir(), name);
  let st;
  try { st = statSync(p); } catch { continue; }
  if (!st.isDirectory()) continue;
  if (st.mtimeMs > cutoff) { skipped++; continue; }
  try {
    bytes += sizeOf(p);
    rmSync(p, { recursive: true, force: true });
    removed++;
  } catch { /* 占用中，下次再删 */ }
}

console.log(`cleaned ${removed} profiles, ${(bytes / 1024 / 1024).toFixed(1)} MB, skipped ${skipped} recent`);

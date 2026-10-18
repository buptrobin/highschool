// 给各册的 audit-all.mjs 收尾挂上临时目录清理（幂等：已经挂过就跳过）
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const hooks = `
// 收尾：清掉本次体检留下的 Chrome 临时目录（按 pid 判断，不会误删别的进程正在跑的浏览器）
try {
  const out = execFileSync(process.execPath, [resolve(root, '.workbuddy/clean-temp.mjs')], { encoding: 'utf8' });
  appendFileSync(log, out.trim() + '\\n', 'utf8');
  console.log(out.trim());
} catch (e) {
  appendFileSync(log, '（临时目录清理失败：' + e.message + '）\\n', 'utf8');
}
`;

let patched = 0;
for (const dir of readdirSync('.workbuddy')) {
  const p = `.workbuddy/${dir}/audit-all.mjs`;
  if (!existsSync(p)) continue;
  let t = readFileSync(p, 'utf8');
  if (t.includes('clean-temp.mjs')) {
    console.log(`跳过 ${dir}（已挂）`);
    continue;
  }
  if (!t.includes("appendFileSync(log, 'DONE\\n', 'utf8');")) {
    console.log(`跳过 ${dir}（找不到 DONE 锚点）`);
    continue;
  }
  t = t.replace("appendFileSync(log, 'DONE\\n', 'utf8');", "appendFileSync(log, 'DONE\\n', 'utf8');\n" + hooks);
  writeFileSync(p, t);
  patched++;
  console.log(`已挂 ${dir}`);
}
console.log('共挂上', patched, '个');

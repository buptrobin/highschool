/* 全量动态体检：逐页跑 audit.mjs，结果逐行追加到 audit-log.txt（崩了也能看出跑到哪一页）。
   用法（后台跑）：node .workbuddy/bio4/audit-all.mjs [起始序号] */
import { readdirSync, appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const dir = resolve(root, 'pages/bio');
const log = resolve(root, '.workbuddy/bio4/audit-log.txt');
const files = readdirSync(dir).filter((f) => /^xx2-c\d+-s\d+\.html$/.test(f)).sort();
const from = Number(process.argv[2] || 0);

if (from === 0) writeFileSync(log, '', 'utf8');
for (let i = from; i < files.length; i++) {
  const f = files[i];
  const t0 = Date.now();
  let line;
  try {
    const out = execFileSync(process.execPath, [resolve(root, '.workbuddy/bio4/audit.mjs'), resolve(dir, f)], { encoding: 'utf8', timeout: 180000 });
    const okLine = (out.match(/^PASS.*$/m) || [''])[0];
    const fails = (out.match(/✗.*$/gm) || []).join(' | ');
    line = okLine ? `[${i + 1}/${files.length}] ${okLine}` : `[${i + 1}/${files.length}] FAIL ${f}  ${fails}`;
  } catch (e) {
    const out = (e.stdout || '') + (e.stderr || '');
    const okLine = (out.match(/^PASS.*$/m) || [''])[0];
    const fails = (out.match(/✗.*$/gm) || []).join(' | ');
    line = okLine ? `[${i + 1}/${files.length}] ${okLine}` : `[${i + 1}/${files.length}] FAIL ${f}  ${fails || e.message}`;
  }
  appendFileSync(log, line + '\n', 'utf8');
  console.log(`${f}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
appendFileSync(log, 'DONE\n', 'utf8');

// 收尾：清掉本次体检留下的 Chrome 临时目录（按 pid 判断，不会误删别的进程正在跑的浏览器）
try {
  const out = execFileSync(process.execPath, [resolve(root, '.workbuddy/clean-temp.mjs')], { encoding: 'utf8' });
  appendFileSync(log, out.trim() + '\n', 'utf8');
  console.log(out.trim());
} catch (e) {
  appendFileSync(log, '（临时目录清理失败：' + e.message + '）\n', 'utf8');
}


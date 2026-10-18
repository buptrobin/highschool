/* 数学册静态体检：不开浏览器，只查结构与硬性文案。
   用法：node .workbuddy/math5/static.mjs */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const dir = resolve(root, 'pages/math');
const files = readdirSync(dir).filter((f) => /^xx3-c\d+-s\d+\.html$/.test(f)).sort();

const BAD = ['简单来说', '众所周知', '其实很简单', '只要记住', '请拖动', '请滑动'];
let ok = 0;
const rows = [];

for (const f of files) {
  const h = readFileSync(resolve(dir, f), 'utf8');
  const err = [];
  const secs = (h.match(/<section class="gx-sec"/g) || []).length;
  const figs = (h.match(/<figure class="gx-fig"/g) || []).length;
  const steps = (h.match(/<li class="step"/g) || []).length;
  const qa = (h.match(/<div class="qac">/g) || []).length;
  const errs = (h.match(/<div class="er">/g) || []).length;
  const board = /id="gxStage"/.test(h);
  const badge = /class="gx-ap"/.test(h);
  const ap = /window\.__ap\s*=/.test(h);
  const model = /window\.__model\s*=/.test(h);
  const cases = (h.match(/v:\s*[\d.]+,\s*eq:/g) || []).length;
  const loop = (h.match(/\{\s*t:\s*[\d.]+,\s*v:/g) || []).length;
  const sub = (h.match(/<sub>|<sup>/g) || []).length;
  if (secs !== 6) err.push(`区块 ${secs}`);
  if (figs < 5) err.push(`figure ${figs}`);
  if (steps < 4) err.push(`步骤 ${steps}`);
  if (qa < 5) err.push(`问答 ${qa}`);
  if (errs < 5) err.push(`易错 ${errs}`);
  if (!board) err.push('无 #gxStage');
  if (!badge) err.push('无 .gx-ap');
  if (!ap) err.push('无 window.__ap');
  if (!model) err.push('无 window.__model');
  if (cases < 2) err.push(`断言 ${cases}`);
  if (loop < 4) err.push(`loop 帧 ${loop}`);
  if (sub > 0) err.push(`用了 <sub>/<sup> ×${sub}`);
  for (const w of BAD) if (h.includes(w)) err.push(`禁用语「${w}」`);
  const badText = h.match(/<text[^>]*>[^<]*<b>/g);
  if (badText) err.push(`SVG text 里有 <b> ×${badText.length}`);
  const open = (h.match(/<section/g) || []).length;
  const close = (h.match(/<\/section>/g) || []).length;
  if (open !== close) err.push(`section 开 ${open} 闭 ${close}`);
  if (err.length === 0) ok++;
  rows.push({ f, kb: (h.length / 1024).toFixed(0), secs, figs, steps, qa, errs, cases, err });
}

for (const r of rows) {
  const tag = r.err.length ? 'FAIL' : 'ok  ';
  console.log(`${tag} ${r.f.padEnd(17)} ${String(r.kb).padStart(3)}KB 区块${r.secs} 图${r.figs} 步${r.steps} 问${r.qa} 错${r.errs} 断言${r.cases}${r.err.length ? '  ← ' + r.err.join(' / ') : ''}`);
}
console.log(`\n${ok}/${rows.length} 静态通过`);
process.exit(ok === rows.length ? 0 : 1);

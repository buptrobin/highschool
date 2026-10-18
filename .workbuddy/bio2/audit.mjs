/* 生物必修2 讲义页体检器
 *
 * 用法：
 *   node .workbuddy/bio2/audit.mjs pages/bio/bx2-c1-s1.html
 *   node .workbuddy/bio2/audit.mjs pages/bio/bx2-c1-s1.html --fast
 *   node .workbuddy/bio2/audit.mjs pages/bio/*.html --fast --json
 *
 * 做四件事：
 *   1. 五个宽度（1440/1024/768/390/360）跑结构 + SVG 几何 + 横向溢出
 *   2. 1440 宽跑一遍 Autopilot：初始 auto、2.6s 后数值变、点击→manual、5.6s→auto
 *   3. 页面自报的 __bio.cases 数值断言（每页把教材真值写进页面）
 *   4. prefers-reduced-motion 下初始必须是 manual
 *
 * 依赖 anatomy 技能的 drive.mjs（headless Chrome）。
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DRIVE = process.env.DRIVE || 'C:/Users/robin/.workbuddy/skills/anatomy/scripts/drive.mjs';
const here = new URL('./', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const AUDIT = readFileSync(new URL('./audit-fn.js', import.meta.url), 'utf8');
const PROBE = readFileSync(new URL('./probe-fn.js', import.meta.url), 'utf8');

const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith('--'));
const files = argv.filter((a) => !a.startsWith('--'));
const fast = flags.includes('--fast');
const asJson = flags.includes('--json');
const onlyWidth = flags.includes('--width') ? Number(argv[argv.indexOf('--width') + 1]) : null;

const WIDTHS = [1440, 1024, 768, 390, 360];

function drive(page, width, actions, extra = []) {
  const out = spawnSync(
    process.execPath,
    [DRIVE, page, JSON.stringify(actions), '--width', String(width), '--height', '1200', ...extra],
    { encoding: 'utf8', timeout: 180000, maxBuffer: 64 * 1024 * 1024 }
  );
  const text = `${out.stdout || ''}\n${out.stderr || ''}`;
  const evals = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^eval: (.*)$/);
    if (m) {
      try { evals.push(JSON.parse(m[1])); } catch { evals.push(m[1]); }
    }
  }
  return { text, evals, clean: /console: clean/.test(text), code: out.status };
}

const FAST_ACTS = [['wait', 450], ['eval', AUDIT]];

function fullActs() {
  return [
    ['wait', 450],
    ['eval', AUDIT],
    ['eval', "({m0: window.__ap ? __ap.mode : 'none', v0: window.__ap ? +__ap.value.toFixed(2) : -1})"],
    ['wait', 2600],
    ['eval', "({m1: window.__ap ? __ap.mode : 'none', v1: window.__ap ? +__ap.value.toFixed(2) : -1, top: (function(){var s=document.getElementById('gxStage');if(!s)return -1;s.scrollIntoView({block:'center',behavior:'instant'});return Math.round(s.getBoundingClientRect().top);})()})"],
    ['click', '#gxStage'],
    ['wait', 500],
    ['eval', "({m2: window.__ap ? __ap.mode : 'none', v2: window.__ap ? +__ap.value.toFixed(2) : -1})"],
    ['wait', 5700],
    ['eval', "({m3: window.__ap ? __ap.mode : 'none'})"],
    ['eval', PROBE]
  ];
}

function check(page) {
  const abs = resolve(page);
  if (!existsSync(abs)) return { page, ok: false, fail: ['文件不存在'] };
  const url = pathToFileURL(abs).href;
  const fail = [];
  const warn = [];
  const widths = {};
  const startsAt = Date.now();

  for (const w of WIDTHS) {
    if (onlyWidth && w !== onlyWidth) continue;
    let r = drive(url, w, FAST_ACTS);
    let s = r.evals[0];
    /* 偶发：Chrome 启动竞争导致首帧 eval 空转 → 最多重试两次 */
    for (let k = 0; k < 2 && (!s || typeof s !== 'object'); k++) { r = drive(url, w, FAST_ACTS); s = r.evals[0]; }
    if (!s || typeof s !== 'object') { fail.push(`${w}px: 页面没有返回体检数据（渲染失败？）`); if (!r.clean) fail.push(`${w}px: console 不干净`); continue; }
    widths[w] = { overflow: s.overflow, err: s.err.length, clean: r.clean };
    if (!r.clean) fail.push(`${w}px: console 不干净`);
    if (s.overflow > 0) fail.push(`${w}px: 横向溢出 ${s.overflow}px`);
    if (w === (onlyWidth || 1440)) {
      if (s.len < 4000) fail.push(`正文太短（${s.len} 字）`);
      if (s.secs !== 6) fail.push(`区块数 ${s.secs} ≠ 6`);
      if (s.figs < 4) fail.push(`插图 ${s.figs} 张（<4）`);
      if (s.steps < 3 || s.steps > 6) fail.push(`例题步骤 ${s.steps}（应 3–6）`);
      if (s.qa < 5) fail.push(`问答 ${s.qa} 个（<5）`);
      if (s.errs < 5) fail.push(`易错 ${s.errs} 条（<5）`);
      if (s.boards < 1) fail.push('没有互动画布（.gx-board svg）');
      if (!s.badge) fail.push('缺 Autopilot 状态徽标 .gx-ap');
      if (s.err.length) fail.push(...s.err.slice(0, 8));
      if (s.err.length > 8) fail.push(`… 还有 ${s.err.length - 8} 条几何问题`);
    }
  }

  let ap = null;
  if (!fast) {
    const r = drive(url, 1440, fullActs());
    const [s, a0, a1, a2, a3, probe] = r.evals;
    if (!r.clean) fail.push('全量运行 console 不干净');
    if (s && s.err && s.err.length) fail.push(...s.err.slice(0, 6));
    ap = { a0, a1, a2, a3 };
    if (!a0 || a0.m0 === 'none') fail.push('没有 window.__ap（Autopilot 未挂载）');
    else {
      if (a0.m0 !== 'auto') fail.push(`初次进入 mode=${a0.m0}（应为 auto）`);
      if (Math.abs(a1.v1 - a0.v0) < 0.3) fail.push(`2.6s 后数值没变（${a0.v0}→${a1.v1}）`);
      if (!a2 || a2.m2 !== 'manual') fail.push(`点击后 mode=${a2 && a2.m2}（应为 manual）`);
      if (!a3 || a3.m3 !== 'auto') fail.push(`5.7s 后 mode=${a3 && a3.m3}（应回到 auto）`);
    }
    if (probe && probe.cases) {
      const bad = probe.cases.filter((c) => !c.ok);
      for (const b of bad) fail.push(`数值断言 v=${b.v} 不符：${b.bad.join('; ')}`);
      if (!probe.cases.length) warn.push('没有数值断言（__bio.cases 为空）');
    } else {
      warn.push('页面没有 __bio.cases 数值断言');
    }

    const rr = drive(url, 390, [['wait', 450], ['eval', "({m0: window.__ap ? __ap.mode : 'none'})"]], ['--reduced']);
    const rm = rr.evals[0];
    if (!rm || rm.m0 !== 'manual') fail.push(`prefers-reduced-motion 下 mode=${rm && rm.m0}（应为 manual）`);
  }

  return {
    page: page.replace(/\\/g, '/').split('/').slice(-2).join('/'),
    ok: fail.length === 0,
    ms: Date.now() - startsAt,
    widths,
    ap,
    fail,
    warn
  };
}

const results = files.map(check);
if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  for (const r of results) {
    const w = Object.entries(r.widths || {}).map(([k, v]) => `${k}:${v.overflow}`).join(' ');
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.page}  (${Math.round((r.ms || 0) / 1000)}s)  溢出 ${w || '-'}`);
    for (const f of r.fail || []) console.log(`    ✗ ${f}`);
    for (const f of r.warn || []) console.log(`    · ${f}`);
  }
  const bad = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - bad}/${results.length} 通过`);
}
process.exit(results.some((r) => !r.ok) ? 1 : 0);

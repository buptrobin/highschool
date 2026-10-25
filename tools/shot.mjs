// shot.mjs — 给精练页/解析页拍图，人工看版式
// 用法（先起一个带调试端口的 headless Chrome，端口见 CDP 环境变量）：
//   set CDP=http://127.0.0.1:9233
//   node tools/shot.mjs bio bx1-c5-s4 out/shot-1.png            # 默认从头截 2200px
//   node tools/shot.mjs bio bx1-c5-s4 out/shot-2.png 3000 2200  # 从 3000px 处截 2200px
//
// 直接跑可以不设 CDP，脚本会自己起一个临时 Chrome（Windows 路径写死在本仓库环境）。
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const [subject, slug, out, yArg, hArg] = process.argv.slice(2);
if (!subject || !slug || !out) {
  console.error('用法: node tools/shot.mjs <科目> <slug> <输出.png> [起始y] [高度]');
  process.exit(2);
}
const y = Number(yArg || 0), h = Number(hArg || 2200);
const sleep = ms => new Promise(r => setTimeout(r, ms));

let chrome = null, base = process.env.CDP;
if (!base) {
  const port = 9300 + Math.floor(Math.random() * 600);
  const prof = join(tmpdir(), 'shot-' + process.pid + '-' + port);
  chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    '--hide-scrollbars', '--user-data-dir=' + prof, '--remote-debugging-port=' + port,
    '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  base = 'http://127.0.0.1:' + port;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try { const v = await (await fetch(base + '/json/version')).json(); if (v.webSocketDebuggerUrl) break; } catch { }
  }
  chrome.prof = prof;
}

const targets = await (await fetch(base + '/json/list')).json();
const t = targets.find(x => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise(r => ws.onopen = r);
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'file:///C:/wangxp/mygit/highschool/' + (subject === 'pages' ? 'pages' : 'quiz') + '/' + (subject === 'pages' ? '' : subject + '/') + slug + '.html' });
await sleep(1800);
const res = await send('Page.captureScreenshot', {
  format: 'png',
  clip: { x: 0, y, width: 1440, height: h, scale: 1 },
  captureBeyondViewport: true,
});
const buf = Buffer.from(res.result.data, 'base64');
mkdirSync(join(out, '..'), { recursive: true });
writeFileSync(out, buf);
console.log(out, buf.length + ' bytes');
ws.close();
if (chrome) {
  chrome.kill();
  try { rmSync(chrome.prof, { recursive: true, force: true }); } catch { }
}
process.exit(0);

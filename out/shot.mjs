// shot.mjs — 用 CDP 给精练页截图（整页 / 指定选择器区域）
// 用法：CDP=http://127.0.0.1:9333 node out/shot.mjs <slug> <out.png> [selector]
const BASE = process.env.CDP || 'http://127.0.0.1:9333';
const ROOT = 'file:///C:/wangxp/mygit/highschool/quiz/geo/';
const [slug, out, sel] = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const targets = await (await fetch(BASE + '/json/list')).json();
const t = targets.find(x => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0;
const pend = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
};
const send = (method, params = {}) => new Promise(res => {
  const i = ++id; pend.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});
await new Promise(r => ws.onopen = r);
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.result?.value;

await send('Page.navigate', { url: ROOT + slug + '.html' });
await sleep(1800);

let clip;
if (sel) {
  const r = await ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView(); const b = e.getBoundingClientRect(); return JSON.stringify({x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height}); })()`);
  if (!r) { console.log('selector not found:', sel); process.exit(2); }
  const o = JSON.parse(r);
  await sleep(400);
  const r2 = await ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); const b = e.getBoundingClientRect(); return JSON.stringify({x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height}); })()`);
  const b = JSON.parse(r2);
  clip = { x: Math.max(0, b.x - 10), y: Math.max(0, b.y - 10), width: Math.min(1440, b.w + 20), height: Math.min(2000, b.h + 20), scale: 1 };
} else {
  const h = await ev('document.body.scrollHeight');
  clip = { x: 0, y: 0, width: 1440, height: Math.min(6000, h), scale: 1 };
}
const shot = await send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true });
const fs = await import('node:fs');
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('saved', out);

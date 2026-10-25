// shot2.mjs — 截取指定选择器所在区域（不滚动，直接按 offsetTop 裁剪）
const BASE = process.env.CDP || 'http://127.0.0.1:9346';
const ROOT = 'file:///C:/wangxp/mygit/highschool/quiz/geo/';
const [slug, out, sel, hh] = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(BASE + '/json/list')).json();
const t = targets.find(x => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise(r => ws.onopen = r);
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.result?.value;
await send('Page.navigate', { url: ROOT + slug + '.html' });
await sleep(2000);
const r = await ev(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return 'null'; const b = e.getBoundingClientRect(); return JSON.stringify({top: Math.round(b.top + scrollY), h: Math.round(b.height), w: Math.round(b.width), left: Math.round(b.left)}); })()`);
if (r === 'null') { console.log('not found', sel); process.exit(2); }
const o = JSON.parse(r);
const clip = { x: 0, y: Math.max(0, o.top - 20), width: 1440, height: Math.min(o.h + 40, Number(hh) || 1500), scale: 1 };
const shot = await send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true });
const fs = await import('node:fs');
fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log('saved', out, JSON.stringify(clip));

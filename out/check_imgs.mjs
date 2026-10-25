// check_imgs.mjs — 检查页面里所有图片（含综合题材料内嵌图）是否加载成功
const BASE = process.env.CDP || 'http://127.0.0.1:9344';
const ROOT = 'file:///C:/wangxp/mygit/highschool/quiz/geo/';
const slugs = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch(BASE + '/json/list')).json();
const t = targets.find(x => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise(r => ws.onopen = r);
await send('Runtime.enable');
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.result?.value;
for (const slug of slugs) {
  await send('Page.navigate', { url: ROOT + slug + '.html' });
  await sleep(2000);
  const r = await ev(`JSON.stringify({
    total: document.images.length,
    broken: [...document.images].filter(i => !i.naturalWidth).map(i => (i.alt || 'noalt').slice(0, 20)),
    essayImgs: [...document.querySelectorAll('.essay img')].map(i => [i.naturalWidth, i.clientWidth, Math.round(i.clientHeight)]),
    ovf: document.documentElement.scrollWidth > window.innerWidth
  })`);
  console.log(slug, r);
}

// qa-quiz.mjs — 批量验收精练页：卡片数、配图、横向溢出、运行时报错、判分可用
// 用法：先起一个 headless Chrome（--remote-debugging-port=9229），再
//   node tools/qa-quiz.mjs bx1-c4-s2 bx1-c5-s1 ...
// 输出每页一行 JSON；任何一页有 errs 或 broken 图即以非零码退出。
const BASE = process.env.CDP || 'http://127.0.0.1:9229';
const ROOT = 'file:///C:/wangxp/mygit/highschool/quiz/geo/';
const slugs = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const targets = await (await fetch(BASE + '/json/list')).json();
const t = targets.find(x => x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0, errs = [];
const pend = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    errs.push(((d.exception && d.exception.description) || d.text || '').split('\n')[0].slice(0, 90));
  }
};
const send = (method, params = {}) => new Promise(res => {
  const i = ++id; pend.set(i, res);
  ws.send(JSON.stringify({ id: i, method, params }));
});
await new Promise(r => ws.onopen = r);
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.result?.value;

let bad = 0;
for (const slug of slugs) {
  errs = [];
  await send('Page.navigate', { url: ROOT + slug + '.html' });
  await sleep(1600);
  const r = await ev(`JSON.stringify({
    q: document.querySelectorAll('.q').length,
    essay: document.querySelectorAll('.essay').length,
    hud: document.getElementById('hud-total')?.textContent,
    lv: document.querySelectorAll('.lvl').length,
    fig: document.querySelectorAll('.q .svg-box').length,
    broken: [...document.querySelectorAll('.q img, #map img')].filter(i => !i.naturalWidth).length,
    mapfig: document.querySelectorAll('#map svg').length,
    traps: document.querySelectorAll('.trap').length,
    sw: document.documentElement.scrollWidth,
    store: (function(){try{return Object.keys(localStorage).filter(k=>k.indexOf(location.pathname.split('/').pop())>=0).length}catch(e){return -1}})()
  })`);
  const o = JSON.parse(r || '{}');
  const ok = !errs.length && o.broken === 0 && o.sw <= 1440 && o.q > 0;
  if (!ok) bad++;
  console.log(slug.padEnd(12), ok ? 'OK ' : 'BAD', r, errs.length ? 'errs=' + JSON.stringify(errs) : '');
}
ws.close();
process.exit(bad ? 1 : 0);

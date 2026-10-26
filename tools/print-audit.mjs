#!/usr/bin/env node
/**
 * 打印版式体检：在「打印媒体 + A4 版心宽度」下量一遍，找出会溢出纸边的元素。
 *
 *   node tools/print-audit.mjs --pages geo/bx1-c4-s1,geo/bx1-c4-s2
 *   node tools/print-audit.mjs --subject geo          # 某个科目全部内容页
 *   node tools/print-audit.mjs --all                  # 全站 373 页
 *
 * 版心宽度默认 658px（210mm - 左右各 18mm），与 assets/print.css 的 @page 一致。
 * 有溢出时退出码为 1，可直接接在 CI / 收尾脚本里。
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith("--")) {
      const key = k.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) a[key] = true;
      else { a[key] = next; i++; }
    } else a._.push(k);
  }
  return a;
}
const args = parseArgs(process.argv.slice(2));
const WIDTH = Number(args.width || 658);
const TOL = 1.5;   // px，抗亚像素误差

/* ---------- 收集页面 ---------- */
let pages = [];
if (args.pages) {
  pages = String(args.pages).split(",").map((s) => s.trim()).filter(Boolean);
} else {
  const subjects = args.subject
    ? [String(args.subject)]
    : (await readdir(path.join(ROOT, "pages"), { withFileTypes: true }))
        .filter((d) => d.isDirectory()).map((d) => d.name);
  for (const s of subjects) {
    const dir = path.join(ROOT, "pages", s);
    if (!existsSync(dir)) continue;
    for (const f of await readdir(dir)) {
      if (f.endsWith(".html")) pages.push(`${s}/${f.replace(/\.html$/, "")}`);
    }
  }
}
if (!pages.length) { console.error("没有要测的页面"); process.exit(1); }

/* ---------- Chrome ---------- */
const CHROME = [
  args.chrome && String(args.chrome),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean).find((p) => existsSync(p));
if (!CHROME) { console.error("找不到 Chrome"); process.exit(1); }

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".woff2": "font/woff2", ".ico": "image/x-icon",
};
const server = createServer(async (req, res) => {
  try {
    const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch { res.writeHead(500).end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const userDir = path.join(ROOT, "out", "pdf", "_profiles", "a" + Date.now().toString(36));
const dbgPort = 9800 + Math.floor(Math.random() * 150);
const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--no-default-browser-check",
  "--disable-extensions", `--user-data-dir=${userDir}`, `--remote-debugging-port=${dbgPort}`, "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function wsUrl() {
  for (let i = 0; i < 80; i++) {
    try { const j = await (await fetch(`http://127.0.0.1:${dbgPort}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl; } catch {}
    await sleep(125);
  }
  throw new Error("连不上 Chrome");
}
class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id);
        m.error ? reject(new Error(m.error.message)) : resolve(m.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const p = { id, method, params }; if (sessionId) p.sessionId = sessionId;
    this.ws.send(JSON.stringify(p));
    return new Promise((res, rej) => this.pending.set(id, { resolve: res, reject: rej }));
  }
}
const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
const cdp = new CDP(ws);
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId: S } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
await cdp.send("Page.enable", {}, S);
await cdp.send("Runtime.enable", {}, S);
await cdp.send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: 1200, deviceScaleFactor: 1, mobile: false }, S);
await cdp.send("Emulation.setEmulatedMedia", { media: "print" }, S);

const PROBE = `(function(){
  var W = ${WIDTH};   // 用版心宽度做阈值：clientWidth 会被滚动条吃掉 15px，漏报
  var out = [];
  var all = document.querySelectorAll('body *');
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') continue;
    // SVG 内部图形按 viewBox 坐标算 bbox，超出画布的部分本来就被 svg 裁掉了，
    // 不算版面溢出（只检查根 <svg> 本身）
    if (el.ownerSVGElement) continue;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.right > W + ${TOL} || r.left < -${TOL}) {
      var cls = (el.getAttribute('class') || '').slice(0, 48);
      out.push({ t: el.tagName.toLowerCase(), c: cls, l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) });
    }
  }
  return JSON.stringify({
    W: W,
    scroll: document.documentElement.scrollWidth,
    body: Math.round(document.body.getBoundingClientRect().width),
    n: out.length,
    bad: out.slice(0, 5),
    title: (document.querySelector('.page-title')||{}).textContent || ''
  });
})()`;

const bad = [];
let checked = 0, empty = 0;
for (const slug of pages) {
  await cdp.send("Page.navigate", { url: `${base}/pages/${slug}.html` }, S);
  await sleep(240);
  const r = await cdp.send("Runtime.evaluate", { expression: PROBE, returnByValue: true }, S);
  let st;
  try { st = JSON.parse(r.result.value || "{}"); } catch { st = {}; }
  checked++;
  if (st.n === 0 && st.scroll <= WIDTH + TOL) continue;
  if (!st.title) empty++;
  bad.push({ slug, ...st });
  if (bad.length && args.verbose) {
    console.log(`✗ ${slug}  视口${st.W} 滚动${st.scroll}`);
    (st.bad || []).forEach((b) => console.log(`    <${b.t} class="${b.c}">  ${b.l} → ${b.r}  (宽 ${b.w})`));
  }
}

ws.close(); chrome.kill(); server.close();
await sleep(300);
spawn(process.platform === "win32" ? "cmd" : "rm",
  process.platform === "win32" ? ["/c", "rmdir", "/s", "/q", userDir.replace(/\//g, "\\")] : ["-rf", userDir],
  { stdio: "ignore" });

console.log(`\n打印版式体检：${checked} 页，版心 ${WIDTH}px，溢出 ${bad.length} 页`);
if (bad.length) {
  const shown = args.verbose ? bad : bad.slice(0, 25);
  if (!args.verbose) {
    for (const b of shown) {
      const worst = (b.bad || [])[0];
      console.log(`  ✗ ${b.slug}  ${b.n} 个元素越界` +
        (worst ? `  ← <${worst.t} class="${worst.c}"> 右到 ${worst.r}px` : "") +
        (b.title ? `  「${b.title.trim().slice(0, 18)}」` : "  （空页）"));
    }
    if (bad.length > shown.length) console.log(`  … 还有 ${bad.length - shown.length} 页，加 --verbose 看全部`);
  }
  process.exit(1);
}
console.log("  全部落在版心内 ✓");

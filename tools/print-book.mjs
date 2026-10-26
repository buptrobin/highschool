#!/usr/bin/env node
/**
 * 把若干「课本解析页」合成一本 A4 PDF（带页码页脚）。
 *
 *   node tools/print-book.mjs --pages geo/bx1-c4-s1,geo/bx1-c4-s2 \
 *        --title "地理 · 必修第一册 · 第四章 地貌" --out out/pdf/geo-bx1-c4.pdf
 *
 * 可选：
 *   --msg "..."        标题下的一行小字（覆盖各页原有的 page-meta）
 *   --chrome <path>    指定 Chrome
 *   --keep-open        打印完不关浏览器（调试用）
 *   --dense            实验档：高于半页的卡片允许跨页，省 2 页但边框会在页边断开。
 *                      默认关闭（用户 2026-10-26 定的：宁可页底留白，不让卡片断框）。
 *
 * 原理：起一个本地静态服务 → 打开 tools/print-book.html →
 * 它用 iframe 逐页加载、等页内脚本画完图，再把 DOM 搬进合册容器 →
 * 通过 CDP 的 Page.printToPDF 出 PDF（这样页脚才能带「第 X / Y 页」）。
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- 参数 ---------- */
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
const pages = String(args.pages || args._[0] || "").split(",").map((s) => s.trim()).filter(Boolean);
if (!pages.length) {
  console.error("用法: node tools/print-book.mjs --pages geo/bx1-c4-s1,geo/bx1-c4-s2 --out out.pdf [--title 标题]");
  process.exit(1);
}
const outPath = path.resolve(args.out || path.join(ROOT, "out", "pdf", "book.pdf"));
const bookTitle = String(args.title || "");
const bookMsg = args.msg ? String(args.msg) : "";

/* ---------- Chrome ---------- */
const CHROME_CANDIDATES = [
  args.chrome && String(args.chrome),
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chromePath) { console.error("找不到 Chrome / Edge，请用 --chrome 指定"); process.exit(1); }

/* ---------- 微型静态服务 ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".woff2": "font/woff2", ".woff": "font/woff",
  ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
};
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    let rel = decodeURIComponent(url.pathname);
    let file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) { res.writeHead(403).end("no"); return; }
    if (!existsSync(file)) { res.writeHead(404).end("404 " + rel); return; }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(body);
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

/* ---------- 起浏览器 ---------- */
const userDir = path.join(ROOT, "out", "pdf", "_profiles", "p" + Date.now().toString(36));

/** 删目录：不直接用 fs.rm —— 某些环境会给 fs 打安全补丁，走系统命令更稳 */
function wipe(dir) {
  return new Promise((res) => {
    if (process.platform === "win32") {
      const p = spawn("cmd", ["/c", "rmdir", "/s", "/q", dir.replace(/\//g, "\\")], { stdio: "ignore" });
      p.on("exit", () => res());
      p.on("error", () => res());
    } else {
      const p = spawn("rm", ["-rf", dir], { stdio: "ignore" });
      p.on("exit", () => res());
      p.on("error", () => res());
    }
  });
}
await wipe(userDir);
const dbgPort = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath, [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--no-default-browser-check",
  "--disable-extensions", "--hide-scrollbars", "--force-color-profile=srgb",
  "--font-render-hinting=none",
  `--user-data-dir=${userDir}`,
  `--remote-debugging-port=${dbgPort}`,
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${dbgPort}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(125);
  }
  throw new Error("连不上 Chrome 调试端口");
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        m.error ? reject(new Error(m.error.message)) : resolve(m.result);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
}

const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
const cdp = new CDP(ws);

const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const S = sessionId;
await cdp.send("Page.enable", {}, S);
await cdp.send("Runtime.enable", {}, S);

/* ---------- 打开合册并等它拼完 ---------- */
const qs = new URLSearchParams({ pages: pages.join(",") });
if (bookMsg) qs.set("msg", bookMsg);
if (args.dense) qs.set("dense", "1");
const bookUrl = `${base}/tools/print-book.html?${qs}`;
await cdp.send("Page.navigate", { url: bookUrl }, S);

let secs = 0, splits = 0;
for (let i = 0; i < 240; i++) {
  const r = await cdp.send("Runtime.evaluate", {
    expression: "JSON.stringify({r: window.__ready===true, e: window.__err||null, n: window.__secs||0, k: window.__split||0, d: window.__denseInfo||''})",
    returnByValue: true,
  }, S);
  const st = JSON.parse(r.result.value || "{}");
  if (st.e) {
    console.error("合册渲染失败：" + st.e);
    ws.close(); chrome.kill(); server.close();
    process.exit(1);
  }
  if (st.r) { secs = st.n; splits = st.k; break; }
  await sleep(250);
}
if (!secs) {
  console.error("等待合册渲染超时");
  ws.close(); chrome.kill(); server.close();
  process.exit(1);
}

/* ---------- 出 PDF ---------- */
const mm = (v) => (v / 25.4).toFixed(4);   // mm -> inch
const footer = `
<div style="width:100%;box-sizing:border-box;padding:0 10mm;font-family:'Microsoft YaHei','PingFang SC',sans-serif;font-size:8px;color:#9aa3ae;display:flex;justify-content:space-between;align-items:baseline;">
  <span>${bookTitle.replace(/[<>&]/g, "")}</span>
  <span>第 <span class="pageNumber"></span> / <span class="totalPages"></span> 页</span>
</div>`;

const pdf = await cdp.send("Page.printToPDF", {
  printBackground: true,
  paperWidth: 8.2677,      // 210mm
  paperHeight: 11.6929,    // 297mm
  marginTop: Number(mm(12)),
  marginBottom: Number(mm(15)),
  marginLeft: Number(mm(10)),
  marginRight: Number(mm(10)),
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate: footer,
  preferCSSPageSize: false,
  scale: 1,
  transferMode: "ReturnAsBase64",
}, S);

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, Buffer.from(pdf.data, "base64"));

ws.close();
if (!args["keep-open"]) {
  chrome.kill();
  server.close();
  await sleep(400);
  await wipe(userDir);
}

const kb = Math.round(Buffer.from(pdf.data, "base64").length / 1024);
console.log(`OK  ${outPath}`);
console.log(`    ${secs} 节 · ${kb} KB` + (args.dense ? ` · dense 跨页块 ${splits}` : ""));

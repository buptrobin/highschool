/* 把「内容片段 + 互动脚本」拼成完整页面。
   用法：node .workbuddy/bio4/build-page.mjs xx2-c2-s1
   输入：.workbuddy/bio4/parts/<slug>.html  （<div class="gx"> 内部：kicker/claim/meta/lede/toc + 六个 section）
         .workbuddy/bio4/parts/<slug>.js    （互动脚本本体，不带 <script> 标签）
   输出：pages/bio/<slug>.html
   章节标题、上一节/下一节全部从 content/bio.txt 推导，片段里不用写。 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const slug = process.argv[2];
if (!slug || !/^xx2-c\d+-s\d+$/.test(slug)) {
  console.error('用法：node .workbuddy/bio4/build-page.mjs xx2-c2-s1');
  process.exit(1);
}

/* ---------- 1. 从大纲取顺序与标题 ---------- */
const outline = readFileSync(resolve(root, 'content/bio.txt'), 'utf8').split(/\r?\n/);
const items = [];
let book = null, chapter = null, cNo = 0, sNo = 0;
for (const line of outline) {
  let m;
  if ((m = line.match(/^#\s*\[(\w+)\]\s*(.+)$/))) { book = m[1]; cNo = 0; chapter = null; continue; }
  if (book !== 'xx2') continue;
  if ((m = line.match(/^##\s*(第\d+章)\s*(.+)$/))) { cNo++; sNo = 0; chapter = { no: m[1], name: m[2], title: `${m[1]} ${m[2]}` }; continue; }
  if ((m = line.match(/^###\s*(第\d+节)\s*(.+)$/))) {
    sNo++;
    items.push({ slug: `xx2-c${cNo}-s${sNo}`, title: `${m[1]} ${m[2]}`, chapter: chapter.title, chName: chapter.name, chNo: chapter.no });
  }
}
const idx = items.findIndex((it) => it.slug === slug);
if (idx < 0) { console.error('大纲里没有这个 slug：' + slug); process.exit(1); }
const me = items[idx];
const prev = items[idx - 1] || null;
const next = items[idx + 1] || null;

/* ---------- 2. 读片段 ---------- */
const partHtml = resolve(root, `.workbuddy/bio4/parts/${slug}.html`);
const partJs = resolve(root, `.workbuddy/bio4/parts/${slug}.js`);
if (!existsSync(partHtml)) { console.error('缺少内容片段：' + partHtml); process.exit(1); }
const content = readFileSync(partHtml, 'utf8').replace(/^\s+|\s+$/g, '');
const js = existsSync(partJs) ? readFileSync(partJs, 'utf8').replace(/^\s+|\s+$/g, '') : '';

/* ---------- 3. 拼页面 ---------- */
const pager = [
  prev ? `<a class="pager-link prev" href="${prev.slug}.html"><small>上一节</small><b>${prev.title}</b></a>`
       : `<span class="pager-link is-empty"></span>`,
  next ? `<a class="pager-link next" href="${next.slug}.html"><small>下一节</small><b>${next.title}</b></a>`
       : `<span class="pager-link is-empty"></span>`
].join('');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#16a34a">
<title>${me.title} · 生物 · 俯瞰太阳系</title>
<link rel="stylesheet" href="../../assets/app.css">
<link rel="stylesheet" href="../../assets/gx.css">
<style>
/* 生物分册：把讲义的强调色换成生物绿，其余语义色（琥珀/绿/红）沿用 gx.css */
.gx{--blue:#0f8a5f;--blue-soft:#edfaf3;--blue-line:#b3e2c7}
.gx h2 .sn{color:#0f8a5f}
.gx .fig-no{color:#0f8a5f}
</style>
</head>
<body class="page" style="--accent:#16a34a;--accent-soft:#f0fdf3">

<header class="topbar">
  <div class="wrap topbar-in">
    <a class="back" href="../../subject.html?s=bio">‹ 生物</a>
    <button class="done-btn" id="doneBtn" type="button" data-id="bio/${slug}">
      <span class="done-box"></span><span class="done-txt">标记已复习</span>
    </button>
  </div>
</header>

<main class="wrap page-wrap">
  <nav class="crumbs">
    <a href="../../index.html">首页</a><span class="sep">/</span>
    <a href="../../subject.html?s=bio">生物</a><span class="sep">/</span>
    <span>选择性必修2 生物与环境</span><span class="sep">/</span>
    <span class="cur">${me.chapter}</span>
  </nav>

  <h1 class="page-title">${me.title}</h1>
  <div class="page-meta">生物 · 选择性必修2 生物与环境 · ${me.chapter}</div>

  <article class="content" id="content"></article>

  <nav class="pager">
    ${pager}
  </nav>
</main>

<script>
window.PAGE = {"sid": "bio", "slug": "${slug}", "title": "${me.title}", "anchor": "#${slug}"};
</script>
<script type="text/markdown" id="md">
<div class="gx">

${content}

<footer class="gx-foot">
对应 人教版（2019）选择性必修2 生物与环境${me.title} · 生成自 <code>eli5-high</code> skill<br>
数据口径：教材表述引自本节正文，年份与数值按教材；互动模型（见「自己拖一下」的口径注释）为教学示意，不是实测值。
</footer>

<div class="gx-zoom" id="gxZoom" hidden>
<span class="gx-zoom-tip">双指放大 · 左右滑动看全图</span>
<button class="gx-zoom-x" type="button" aria-label="关闭">✕</button>
<div id="gxZoomInner"></div>
</div>

</div>
</script>
<script src="../../assets/page.js"></script>
<script src="../../assets/gx.js"></script>
<script src="../../assets/autopilot.js"></script>
<script>
${js}
</script>
</body>
</html>
`;

const out = resolve(root, `pages/bio/${slug}.html`);
writeFileSync(out, html, 'utf8');
console.log(`built pages/bio/${slug}.html  (${(html.length / 1024).toFixed(1)} KB, 内容 ${(content.length / 1024).toFixed(1)} KB, 脚本 ${(js.length / 1024).toFixed(1)} KB)`);

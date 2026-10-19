/* 把「正文片段」拼成完整页面（选择性必修2 法律与生活）。
   用法：node .workbuddy/polx2/build-page.mjs xx2-c1-s1
   输入：.workbuddy/polx2/parts/<slug>.html
   输出：pages/pol/<slug>.html */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const slug = process.argv[2];
if (!slug || !/^xx2-c\d+-s\d+$/.test(slug)) {
  console.error('用法：node .workbuddy/polx2/build-page.mjs xx2-c1-s1');
  process.exit(1);
}

/* ---------- 1. 从大纲取顺序、标题、册名 ---------- */
const outline = readFileSync(resolve(root, 'content/pol.txt'), 'utf8').split(/\r?\n/);
const items = [];
let book = null, bookName = '', chapter = null, cNo = 0, sNo = 0;
for (const line of outline) {
  let m;
  if ((m = line.match(/^#\s*\[(\w+)\]\s*(.+)$/))) {
    book = m[1]; bookName = m[2].trim(); cNo = 0; sNo = 0; chapter = null; continue;
  }
  if ((m = line.match(/^##\s*(第[一二三四五六七八九十]+(?:课|单元))\s*(.+)$/))) {
    cNo++; sNo = 0;
    chapter = { no: m[1], name: m[2], title: `${m[1]} ${m[2]}` };
    continue;
  }
  if ((m = line.match(/^###\s*(第[一二三四五六七八九十]+(?:框|课))\s*(.+)$/))) {
    if (!chapter) continue;
    sNo++;
    items.push({
      slug: `${book}-c${cNo}-s${sNo}`,
      title: `${m[1]} ${m[2]}`,
      chapter: chapter.title,
      bookKey: book,
      bookName
    });
  }
}
const idx = items.findIndex((it) => it.slug === slug);
if (idx < 0) { console.error('大纲里没有这个 slug：' + slug); process.exit(1); }
const me = items[idx];
const prev = items[idx - 1] || null;
const next = items[idx + 1] || null;

/* ---------- 2. 读片段 ---------- */
const partHtml = resolve(root, `.workbuddy/polx2/parts/${slug}.html`);
if (!existsSync(partHtml)) { console.error('缺少内容片段：' + partHtml); process.exit(1); }
const content = readFileSync(partHtml, 'utf8').replace(/^\s+|\s+$/g, '');

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
<meta name="theme-color" content="#e11d48">
<title>${me.title} · 政治 · 俯瞰太阳系</title>
<link rel="stylesheet" href="../../assets/app.css">
<link rel="stylesheet" href="../../assets/gx.css">
<style>
/* 政治分册：把讲义的强调色换成政治红，其余语义色沿用 gx.css */
.gx{--blue:#be123c;--blue-soft:#fff1f4;--blue-line:#fecdd3}
.gx h2 .sn{color:#be123c}
.gx .fig-no{color:#be123c}
</style>
</head>
<body class="page" style="--accent:#e11d48;--accent-soft:#fff1f4">

<header class="topbar">
  <div class="wrap topbar-in">
    <a class="back" href="../../subject.html?s=pol">‹ 政治</a>
    <button class="done-btn" id="doneBtn" type="button" data-id="pol/${slug}">
      <span class="done-box"></span><span class="done-txt">标记已复习</span>
    </button>
  </div>
</header>

<main class="wrap page-wrap">
  <nav class="crumbs">
    <a href="../../index.html">首页</a><span class="sep">/</span>
    <a href="../../subject.html?s=pol">政治</a><span class="sep">/</span>
    <span>${me.bookName}</span><span class="sep">/</span>
    <span class="cur">${me.chapter}</span>
  </nav>

  <h1 class="page-title">${me.title}</h1>
  <div class="page-meta">政治 · ${me.bookName} · ${me.chapter}</div>

  <article class="content" id="content"></article>

  <nav class="pager">
    ${pager}
  </nav>
</main>

<script>
window.PAGE = {"sid": "pol", "slug": "${slug}", "title": "${me.title}", "anchor": "#${slug}"};
</script>
<script type="text/markdown" id="md">
<div class="gx">

${content}

<footer class="gx-foot">
对应 人教版（2019）${me.bookName}${me.title} · 生成自 <code>eli5-high</code> skill<br>
数据口径：教材表述引自本节正文；情境判断器里的“对应/依据”是答题思路整理，不是教材原文。
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
<script src="../../assets/quiz.js"></script>
</body>
</html>
`;

const out = resolve(root, `pages/pol/${slug}.html`);
writeFileSync(out, html, 'utf8');
console.log(`built pages/pol/${slug}.html  (${(html.length / 1024).toFixed(1)} KB, 内容 ${(content.length / 1024).toFixed(1)} KB)`);

/* 数学（人教A版）：把「内容片段 + 互动脚本」拼成完整页面。书本由 slug 前缀决定（xx2 / bx2 / xx2 …）。
   用法：node .workbuddy/math4/build-page.mjs xx2-c1-s1
   输入：.workbuddy/math4/parts/<slug>.html  （<div class="gx"> 内部：kicker/claim/meta/lede/toc + 六个 section）
         .workbuddy/math4/parts/<slug>.js    （互动脚本本体，不带 <script> 标签）
   输出：pages/math/<slug>.html
   章节标题、上一节/下一节全部从 content/math.txt 推导。 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const slug = process.argv[2];
const m0 = slug && slug.match(/^([a-z]+\d)-c\d+-s\d+$/);
if (!m0) {
  console.error('用法：node .workbuddy/math4/build-page.mjs xx2-c1-s1');
  process.exit(1);
}
const bookKey = m0[1];
const BOOK_NAME = { xx2: '必修第一册', bx2: '必修第二册', xx2: '选择性必修第二册', xx2: '选择性必修第二册', xx3: '选择性必修第三册', xx4: '选择性必修第三册' }[bookKey] || bookKey;

/* ---------- 1. 大纲 ---------- */
const outline = readFileSync(resolve(root, 'content/math.txt'), 'utf8').split(/\r?\n/);
const items = [];
let book = null, chapter = null, cNo = 0, sNo = 0;
for (const line of outline) {
  let m;
  if ((m = line.match(/^#\s*\[(\w+)\]\s*(.+)$/))) { book = m[1]; cNo = 0; chapter = null; continue; }
  if (book !== bookKey) continue;
  if ((m = line.match(/^##\s*(第[一二三四五六七八九十\d]+章)\s*(.+)$/))) {
    cNo++; sNo = 0;
    chapter = { title: `${m[1]} ${m[2]}` };
    continue;
  }
  if ((m = line.match(/^###\s*(\d+\.\d+)\s*(.+)$/))) {
    sNo++;
    items.push({ slug: `${bookKey}-c${cNo}-s${sNo}`, title: `${m[1]} ${m[2]}`, chapter: chapter.title });
  }
}
const idx = items.findIndex((it) => it.slug === slug);
if (idx < 0) { console.error('大纲里没有这个 slug：' + slug); process.exit(1); }
const me = items[idx];
const prev = items[idx - 1] || null;
const next = items[idx + 1] || null;

/* ---------- 2. 片段 ---------- */
const partHtml = resolve(root, `.workbuddy/math4/parts/${slug}.html`);
const partJs = resolve(root, `.workbuddy/math4/parts/${slug}.js`);
if (!existsSync(partHtml)) { console.error('缺少内容片段：' + partHtml); process.exit(1); }
const content = readFileSync(partHtml, 'utf8').replace(/^\s+|\s+$/g, '');
const js = existsSync(partJs) ? readFileSync(partJs, 'utf8').replace(/^\s+|\s+$/g, '') : '';

/* ---------- 3. 拼接 ---------- */
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
<meta name="theme-color" content="#2563eb">
<title>${me.title} · 数学 · 俯瞰太阳系</title>
<link rel="stylesheet" href="../../assets/app.css">
<link rel="stylesheet" href="../../assets/gx.css">
<style>
/* 数学分册：讲义强调色换成数学蓝，语义色（琥珀/绿/红）沿用 gx.css */
.gx{--blue:#2563eb;--blue-soft:#eff5ff;--blue-line:#c7dbfa}
.gx h2 .sn{color:#2563eb}
.gx .fig-no{color:#2563eb}
</style>
</head>
<body class="page" style="--accent:#2563eb;--accent-soft:#eff5ff">

<header class="topbar">
  <div class="wrap topbar-in">
    <a class="back" href="../../subject.html?s=math">‹ 数学</a>
    <button class="done-btn" id="doneBtn" type="button" data-id="math/${slug}">
      <span class="done-box"></span><span class="done-txt">标记已复习</span>
    </button>
  </div>
</header>

<main class="wrap page-wrap">
  <nav class="crumbs">
    <a href="../../index.html">首页</a><span class="sep">/</span>
    <a href="../../subject.html?s=math">数学</a><span class="sep">/</span>
    <span>${BOOK_NAME}</span><span class="sep">/</span>
    <span class="cur">${me.chapter}</span>
  </nav>

  <h1 class="page-title">${me.title}</h1>
  <div class="page-meta">数学 · ${BOOK_NAME}（人教A版） · ${me.chapter}</div>

  <article class="content" id="content"></article>

  <nav class="pager">
    ${pager}
  </nav>
</main>

<script>
window.PAGE = {"sid": "math", "slug": "${slug}", "title": "${me.title}", "anchor": "#${slug}"};
</script>
<script type="text/markdown" id="md">
<div class="gx">

${content}

<footer class="gx-foot">
对应 人教版（2019）高中数学${BOOK_NAME} ${me.title} · 生成自 <code>eli5-high</code> skill<br>
数据口径：定义与定理表述按教材正文；互动模型（见「自己拖一下」的口径注释）为教学示意，不是实测数据。
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

const out = resolve(root, `pages/math/${slug}.html`);
writeFileSync(out, html, 'utf8');
console.log(`built pages/math/${slug}.html  (${(html.length / 1024).toFixed(1)} KB, 内容 ${(content.length / 1024).toFixed(1)} KB, 脚本 ${(js.length / 1024).toFixed(1)} KB)`);

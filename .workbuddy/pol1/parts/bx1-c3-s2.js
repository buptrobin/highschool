/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 1978;

  /* 五个阶段：起点年份就是写入党章的党代会年份 */
  var ST = [
    { no: 1, name: "探索阶段", year: "1978—1996", tag: "十二大提出", yr: 0, short: "十二大", q: "1982 年党的十二大提出「走自己的道路，建设有中国特色的社会主义」", when: "—", who: "尚未形成理论成果" },
    { no: 2, name: "邓小平理论", year: "1997—2001", tag: "十五大 · 写入党章", yr: 1997, short: "十五大", q: "什么是社会主义、怎样建设社会主义", when: "1997 年党的十五大", who: "马克思主义中国化成果" },
    { no: 3, name: "「三个代表」重要思想", year: "2002—2011", tag: "十六大 · 写入党章", yr: 2002, short: "十六大", q: "建设什么样的党、怎样建设党", when: "2002 年党的十六大", who: "马克思主义中国化成果" },
    { no: 4, name: "科学发展观", year: "2012—2016", tag: "十八大 · 写入党章", yr: 2012, short: "十八大", q: "实现什么样的发展、怎样发展", when: "2012 年党的十八大", who: "马克思主义中国化成果" },
    { no: 5, name: "习近平新时代中国特色社会主义思想", year: "2017—2022", tag: "十九大 · 写入党章", yr: 2017, short: "十九大", q: "新时代坚持和发展什么样的中国特色社会主义、怎样坚持和发展中国特色社会主义", when: "2017 年党的十九大", who: "马克思主义中国化最新成果" }
  ];

  function stageOf(y) { return y < 1997 ? 1 : y < 2002 ? 2 : y < 2012 ? 3 : y < 2017 ? 4 : 5; }

  /* 纯函数：年份 → 阶段。render() 和 __model.cases 都用它 */
  function calc(v) {
    var y = Math.round(v), s = stageOf(y);
    return { stage: s, year: y, index: s - 1, start: ST[s - 1].no };
  }

  function tone(s) {
    if (s === 1) return { fill: "#f4f6f8", line: "#c9d2db", text: "#5a6472" };
    if (s === 5) return { fill: "#fdf3e0", line: "#e6c98a", text: "#8a5c14" };
    return { fill: "#e6f6ee", line: "#9fd9bb", text: "#1e6640" };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function geom() {
    var g = { wide: L === W, rows: [] }, i;
    if (g.wide) {
      for (i = 0; i < 5; i++) g.rows.push({ x: 32, y: 62 + i * 74, w: 392, h: 64 });
      g.title = { x: 36, y: 42, fs: 10.5 };
      g.tx = 44; g.tg = 414; g.yy = 18; g.yn = 40; g.fsN = 10.2; g.fsT = 8.4; g.fsY = 9.2;
      g.px = 476; g.pw = 376;
      g.c = [{ x: 476, y: 52, w: 376, h: 64 }, { x: 476, y: 124, w: 376, h: 120 },
             { x: 476, y: 252, w: 376, h: 100 }, { x: 476, y: 358, w: 376, h: 96 }];
      g.fs = { lab: 9.2, big: 12.5, name: 13, sub: 9.4, q: 10.2, when: 11.5, foot: 9.2 };
      g.qw = 352;
    } else {
      for (i = 0; i < 5; i++) g.rows.push({ x: 16, y: 46 + i * 50, w: 328, h: 46 });
      g.title = { x: 24, y: 34, fs: 10 };
      g.tx = 28; g.tg = 336; g.yy = 15; g.yn = 32; g.fsN = 10; g.fsT = 8; g.fsY = 8.6;
      g.px = 38; g.pw = 312;
      g.c = [{ x: 24, y: 332, w: 312, h: 54 }, { x: 24, y: 392, w: 312, h: 96 },
             { x: 24, y: 494, w: 312, h: 96 }, { x: 24, y: 596, w: 312, h: 88 }];
      g.fs = { lab: 9, big: 11.5, name: 11, sub: 9, q: 9.8, when: 11.5, foot: 9 };
      g.qw = 288;
    }
    return g;
  }

  function card(gB, c, fill, line) {
    el("rect", { x: c.x, y: c.y, width: c.w, height: c.h, rx: 8, fill: fill || "#ffffff", stroke: line || "#e6e9ee" }, gB);
  }

  function draw() {
    var s = calc(A), d = ST[s.stage - 1], t = tone(s.stage), gG = G;
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, gG.title.x, gG.title.y, "五个阶段：年份跨过节点就翻页", "#5a6472", "start", gG.title.fs, 700);

    for (var i = 0; i < 5; i++) {
      var r = gG.rows[i], on = i === s.stage - 1;
      el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 8, fill: on ? t.fill : "#ffffff", stroke: on ? t.line : "#e6e9ee", "stroke-width": on ? 1.6 : 1 }, gA);
      tx(gA, gG.tx, r.y + gG.yy, ST[i].year, "#7a8390", "start", gG.fsY, 400);
      tx(gA, gG.tx, r.y + gG.yn, ST[i].name, on ? t.text : "#3a3a35", "start", gG.fsN, on ? 700 : 400);
      tx(gA, gG.tg, r.y + gG.yn, ST[i].tag, on ? t.text : "#8a939f", "end", gG.fsT, 400);
    }

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    if (gG.wide) tx(gB, L.right.x + 20, L.right.y + 26, "当前选中的阶段", "#5a6472", "start", 10.5, 700);

    /* ① 阶段 */
    card(gB, gG.c[0]);
    tx(gB, gG.px, gG.c[0].y + 20, "① 阶段", "#7a8390", "start", gG.fs.lab, 400);
    tx(gB, gG.px, gG.c[0].y + 46, "阶段 " + s.stage + " · " + d.year, t.text, "start", gG.fs.big, 700);

    /* ② 理论成果：全称不缩写 */
    card(gB, gG.c[1], s.stage === 5 ? "#fffdf7" : "#ffffff", s.stage === 5 ? "#f0d8ab" : "#e6e9ee");
    tx(gB, gG.px, gG.c[1].y + 20, "② 理论成果", "#7a8390", "start", gG.fs.lab, 400);
    tx(gB, gG.px, gG.c[1].y + 46, d.name, t.text, "start", gG.fs.name, 700);
    tx(gB, gG.px, gG.c[1].y + 66, d.who, "#5a6472", "start", gG.fs.sub, 400);
    if (gG.wide) tx(gB, gG.px, gG.c[1].y + 86, "一脉相承、与时俱进", "#7a8390", "start", gG.fs.sub, 400);

    /* ③ 回答的问题 */
    card(gB, gG.c[2]);
    tx(gB, gG.px, gG.c[2].y + 20, "③ 回答的问题", "#7a8390", "start", gG.fs.lab, 400);
    wrap(gB, gG.px, gG.c[2].y + 44, d.q, gG.qw, gG.fs.q, "#3a3a35", gG.wide ? 17 : 15);

    /* ④ 写入党章 */
    card(gB, gG.c[3], s.stage === 1 ? "#ffffff" : "#fdf9f1", s.stage === 1 ? "#e6e9ee" : "#f0e0c0");
    tx(gB, gG.px, gG.c[3].y + 20, "④ 写入党章", "#7a8390", "start", gG.fs.lab, 400);
    tx(gB, gG.px, gG.c[3].y + 46, d.when, s.stage === 1 ? "#8a939f" : t.text, "start", gG.fs.when, 700);
    tx(gB, gG.px, gG.c[3].y + 66, s.stage === 1 ? "尚未形成理论成果" : "确立为党的指导思想", "#7a8390", "start", gG.fs.foot, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; stage.setAttribute("viewBox", L.vb); G = geom(); }
    var s = calc(A), d = ST[s.stage - 1], st, col, bg, sn;
    $("gxVa").textContent = String(s.year);
    $("gxVb").textContent = "阶段 " + s.stage;
    $("gxVbs").textContent = d.year;
    $("gxVc").textContent = s.stage === 1 ? "—" : String(d.yr);
    $("gxVcs").textContent = s.stage === 1 ? "尚未形成理论成果" : (s.stage === 5 ? "十九大 · 最新成果" : d.short + "确立指导思想");
    st = s.stage === 1 ? "探索阶段" : d.name;
    if (s.stage === 1) { col = "#b8791f"; bg = "#fdf3e0"; sn = "尚未形成理论成果"; }
    else { col = "#2f8a5b"; bg = "#e6f6ee"; sn = s.stage === 5 ? "马克思主义中国化最新成果" : "马克思主义中国化成果"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    stage.setAttribute("viewBox", L.vb);
    G = geom();
    render();
  }

  var apBadge = $("gxAp"), apTxt = $("gxApTxt");
  function setMode(m) {
    if (!apBadge) return;
    apBadge.classList.toggle("is-auto", m === "auto");
    apBadge.classList.toggle("is-manual", m !== "auto");
    if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "你接管了";
  }

  var ap = AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: 1978 }, { t: 1.2, v: 1978 }, { t: 4, v: 1997 }, { t: 6.5, v: 1997 }, { t: 9, v: 2017 }, { t: 11.2, v: 2017 }, { t: 12.6, v: 2022 }, { t: 14, v: 1978 }],
    keys: [1978, 1997, 2002, 2012, 2017],
    value: A, min: 1978, max: 2022, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [
    { v: 1997, eq: { stage: 2 } },
    { v: 2002, eq: { stage: 3 } },
    { v: 2017, eq: { stage: 5 } }
  ] };
  window.__bio = window.__model;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});

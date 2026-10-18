/* bx1-c4-s2 实现中华民族伟大复兴的中国梦 —— 年份 → 剩余年数 / 两步走进程 */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = {
    vb: "0 0 880 470", narrow: false,
    left: { x: 16, y: 16, w: 540, h: 438 }, right: { x: 572, y: 16, w: 292, h: 438 },
    ax: { x0: 56, x1: 512, y: 210 }, bar: { x0: 56, w: 456, y: 290, h: 20 }
  };
  var N = {
    vb: "0 0 360 700", narrow: true,
    left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 },
    ax: { x0: 34, x1: 326, y: 152 }, bar: { x0: 34, w: 292, y: 212, h: 16 }
  };
  var L = W, G = null, A = 2020;

  function calc(y) { return { left: 2035 - y, pct: (y - 2020) / 30 * 100 }; }

  function statusOf(y) {
    if (y < 2035) return { t: "朝着基本实现现代化奋斗", c: "#b8791f", bg: "#fdf3e0", sn: "left > 0，第一步目标尚未达成" };
    if (y === 2035) return { t: "第一步目标达成", c: "#2f8a5b", bg: "#e6f6ee", sn: "left = 0，2035 基本实现社会主义现代化" };
    return { t: "向社会主义现代化强国迈进", c: "#2f8a5b", bg: "#e6f6ee", sn: "left < 0，目标转向本世纪中叶建成强国" };
  }

  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function pick() { return stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; }

  function geom() {
    stage.setAttribute("viewBox", L.vb);
    return { gA: $("gxA"), gB: $("gxB") };
  }

  function mx(y) { return L.ax.x0 + (y - 2020) / 30 * (L.ax.x1 - L.ax.x0); }

  function axis(g, big) {
    var a = L.ax, fsy = big ? 10.2 : 8.2, fsg = big ? 8.6 : 7.6;
    el("line", { x1: a.x0, y1: a.y, x2: a.x1, y2: a.y, stroke: "#8aa0b0", "stroke-width": 1.6 }, g);
    el("line", { x1: a.x0, y1: a.y, x2: mx(A), y2: a.y, stroke: "#2f8a5b", "stroke-width": 3.2 }, g);
    var pts = [2020, 2035, 2050];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], x = mx(p), on = A >= p, done = p === 2035 && A >= 2035;
      el("circle", { cx: x, cy: a.y, r: big ? 7.5 : 5.5, fill: done ? "#2f8a5b" : (on ? "#b8e6d0" : "#ffffff"), stroke: "#2f8a5b", "stroke-width": 1.4 }, g);
    }
    tx(g, a.x0, a.y + (big ? 28 : 24), "2020", "#4a5a68", "middle", fsy, 700);
    tx(g, mx(2035), a.y + (big ? 28 : 24), "2035", "#2f8a5b", "middle", fsy, 700);
    tx(g, a.x1, a.y + (big ? 28 : 24), "本世纪中叶", "#b8791f", "middle", fsy, 700);
    tx(g, a.x0, a.y + (big ? 54 : 44), "全面建成小康社会", "#6b6b63", "start", fsg, 400);
    tx(g, mx(2035), a.y + (big ? 54 : 44), "基本实现现代化", "#2f8a5b", "middle", fsg, 700);
    tx(g, a.x1, a.y + (big ? 54 : 44), "建成现代化强国", "#b8791f", "end", fsg, 700);
    tx(g, mx(2035), a.y - (big ? 22 : 20), "第一步目标达成", "#2f8a5b", "middle", fsg, 700);
  }

  function cursor(g) {
    var x = mx(A), a = L.ax;
    el("line", { x1: x, y1: a.y - 26, x2: x, y2: a.y + 20, stroke: "#b8402f", "stroke-width": 1.4, "stroke-dasharray": "4 3" }, g);
    el("circle", { cx: x, cy: a.y, r: 8.5, fill: "#ffffff", stroke: "#b8402f", "stroke-width": 2.2 }, g);
  }

  function bar(g, s, big) {
    var b = L.bar, w = Math.max(0, Math.min(1, s.pct / 100)) * b.w;
    el("rect", { x: b.x0, y: b.y, width: b.w, height: b.h, rx: 5, fill: "#eef1f4", stroke: "#dde4ea" }, g);
    el("rect", { x: b.x0, y: b.y, width: w, height: b.h, rx: 5, fill: "#2f8a5b" }, g);
    tx(g, b.x0, b.y - (big ? 10 : 8), "两步走进程（2020 → 2050）", "#8a939e", "start", big ? 9 : 8, 400);
  }

  function rows(g, col, big) {
    var r = L.right, xs = r.x + (big ? 20 : 14), ws = r.w - (big ? 40 : 28);
    var y0 = r.y + (big ? 62 : 52), hh = big ? 54 : 44, gap = big ? 12 : 10;
    var d = [
      { t: "① 2020 全面建成小康社会", ok: true, note: "已实现，两步走的起点" },
      { t: "② 2035 基本实现社会主义现代化", ok: A >= 2035, note: A >= 2035 ? "已达成：left = 0" : "尚未达成：还差 " + (2035 - A) + " 年" },
      { t: "③ 本世纪中叶建成社会主义现代化强国", ok: A >= 2050, note: A >= 2050 ? "已到达：建成强国" : "尚未到达：第二步" }
    ];
    for (var i = 0; i < 3; i++) {
      var y = y0 + i * (hh + gap), it = d[i];
      el("rect", { x: xs, y: y, width: ws, height: hh, rx: 7, fill: it.ok ? "#eef7f1" : "#ffffff", stroke: it.ok ? "#b8e6d0" : "#e6e9ee" }, g);
      tx(g, xs + 10, y + 20, (it.ok ? "✓ " : "○ ") + it.t, it.ok ? "#2f8a5b" : "#5a6472", "start", big ? 9.2 : 8.2, 700);
      tx(g, xs + 10, y + (big ? 38 : 34), it.note, "#8a939e", "start", big ? 8.6 : 7.8, 400);
    }
    return y0 + 3 * (hh + gap);
  }

  function drawWide(s, st) {
    var gA = G.gA, gB = G.gB;
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, 36, 44, "两步走时间轴：年份滑到哪，进程走到哪", "#5a6472", "start", 10.6, 700);
    tx(gA, 36, 62, "光标停在 2035 时，第一步目标（基本实现现代化）达成", "#8a939e", "start", 9, 400);
    axis(gA, true);
    cursor(gA);
    bar(gA, s, true);
    tx(gA, 56, 340, "两步走进程 " + s.pct.toFixed(0) + "%", "#151a21", "start", 12.5, 700);
    tx(gA, 56, 372, s.left > 0 ? "距 2035 还有 " + s.left + " 年" : (s.left === 0 ? "正好 2035：left = 0" : "已越过 2035 共 " + (-s.left) + " 年"), st.c, "start", 12.5, 700);
    wrap(gA, 56, 400, st.sn, 460, 9.2, "#6b6b63", 15);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 32, "两步走 · 三步核对", "#5a6472", "start", 10.6, 700);
    var endY = rows(gB, st.c, true);
    tx(gB, L.right.x + 20, endY + 20, "left = 2035 − y（负值=已越过）", "#8a939e", "start", 8.8, 400);
    tx(gB, L.right.x + 20, endY + 38, "pct = (y − 2020) ÷ 30 × 100", "#8a939e", "start", 8.8, 400);
    wrap(gB, L.right.x + 20, endY + 62, "y = 2035 是唯一翻转点：left 归零、进程 50%。", 250, 8.8, "#b8402f", 14);
  }

  function drawNarrow(s, st) {
    var gA = G.gA, gB = G.gB;
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, 24, 34, "两步走时间轴", "#5a6472", "start", 9.6, 700);
    tx(gA, 24, 50, "2020 → 2035 → 本世纪中叶", "#8a939e", "start", 8.2, 400);
    axis(gA, false);
    cursor(gA);
    bar(gA, s, false);
    tx(gA, 34, 250, "进程 " + s.pct.toFixed(0) + "%", "#151a21", "start", 10.5, 700);
    tx(gA, 34, 272, s.left > 0 ? "距 2035 还差 " + s.left + " 年" : (s.left === 0 ? "2035：left = 0" : "已过 2035 " + (-s.left) + " 年"), st.c, "start", 10.5, 700);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 16, L.right.y + 30, "三步核对", "#5a6472", "start", 9.6, 700);
    var endY = rows(gB, st.c, false);
    tx(gB, L.right.x + 16, endY + 18, "left = 2035 − y", "#8a939e", "start", 8.2, 400);
    tx(gB, L.right.x + 16, endY + 34, "pct = (y − 2020) ÷ 30 × 100", "#8a939e", "start", 8.2, 400);
    wrap(gB, L.right.x + 16, endY + 58, "y = 2035：left 归零、进程 50%，第一步目标达成。", 300, 8.4, "#b8402f", 14);
  }

  function render() {
    if (!G) { L = pick(); G = geom(); }
    var s = calc(A), st = statusOf(A);
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = String(s.left);
    $("gxVc").textContent = s.pct.toFixed(0) + "%";
    $("gxVs").textContent = st.t;
    $("gxVsn").textContent = st.sn;
    $("gxStBox").style.background = st.bg;
    $("gxStBox").style.borderColor = st.c + "44";
    $("gxVs").style.color = st.c;
    if (!G.gA || !G.gB) return;
    G.gA.textContent = ""; G.gB.textContent = "";
    if (L.narrow) drawNarrow(s, st); else drawWide(s, st);
  }

  function layout() { G = null; render(); }

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
    loop: [
      { t: 0, v: 2020 }, { t: 1.2, v: 2020 }, { t: 4, v: 2035 }, { t: 6.5, v: 2035 },
      { t: 9, v: 2050 }, { t: 11, v: 2040 }, { t: 13, v: 2020 }
    ],
    keys: [2020, 2035, 2040, 2050],
    value: A, min: 2020, max: 2050, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;

  var cases = [
    { v: 2020, eq: { left: 15, pct: 0 } },
    { v: 2035, eq: { left: 0, pct: 50 } },
    { v: 2050, eq: { left: -15, pct: 100 } }
  ];
  window.__bio = { calc: calc, cases: cases };
  window.__model = { calc: calc, cases: cases };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});

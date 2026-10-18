/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", narrow: false, left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", narrow: true, left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1956, G = null;

  var OLD = "人民日益增长的物质文化需要同落后的社会生产之间的矛盾";
  var NEW = "人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾";

  /* 纯函数：年份 → 主要矛盾表述版本。render() 与 __bio.cases 都用它 */
  function calc(v) {
    var y = Math.round(v);
    if (y < 1956) y = 1956;
    if (y > 2035) y = 2035;
    return { y: y, ma: y < 2017 ? 1 : 2, to2017: 2017 - y, since: y - 1956 };
  }

  function geom() {
    var n = L.narrow, l = L.left, r = L.right;
    var x0 = l.x + (n ? 20 : 36), x1 = l.x + l.w - (n ? 12 : 20), ay = l.y + (n ? 84 : 88);
    return {
      n: n, x0: x0, x1: x1, ay: ay,
      axX: function (y) { return x0 + (y - 1956) / 79 * (x1 - x0); },
      stmt: { x: l.x + 20, y: l.y + (n ? 124 : 142), w: l.w - 40, h: n ? 96 : 110 },
      keep: { x: l.x + 20, y: l.y + (n ? 232 : 264), w: l.w - 40, h: n ? 62 : 76 },
      c1: { x: r.x + 20, y: r.y + (n ? 34 : 48), w: r.w - 40, h: n ? 98 : 116 },
      c2: { x: r.x + 20, y: r.y + (n ? 142 : 176), w: r.w - 40, h: n ? 98 : 116 },
      st: { x: r.x + 20, y: r.y + (n ? 252 : 312), w: r.w - 40, h: n ? 68 : 76 }
    };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function card(c, on, label, l1, l2, cur) {
    var n = G.n;
    el("rect", { x: c.x, y: c.y, width: c.w, height: c.h, rx: 8, fill: on ? "#f4fbf7" : "#fbfcfd", stroke: on ? "#b8e6d0" : "#e6e9ee" }, $("gxB"));
    var g = $("gxB"), ac = on ? "#2f8a5b" : "#8a939e";
    tx(g, c.x + 12, c.y + 20, label, ac, "start", n ? 8.8 : 9.4, 700);
    tx(g, c.x + 12, c.y + (n ? 44 : 48), l1, on ? "#151a21" : "#8a939e", "start", n ? 8.8 : 9.2, on ? 700 : 400);
    tx(g, c.x + 12, c.y + (n ? 62 : 66), l2, on ? "#151a21" : "#8a939e", "start", n ? 8.8 : 9.2, on ? 700 : 400);
    tx(g, c.x + 12, c.y + (n ? 84 : 88), cur ? "● 当前表述" : "○ 未生效", ac, "start", n ? 8.4 : 9, 400);
  }

  function draw(s) {
    var gA = $("gxA"), gB = $("gxB");
    gA.textContent = ""; gB.textContent = "";
    var n = G.n, col = s.ma === 1 ? "#b8791f" : "#2f8a5b";

    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gA, L.left.x + 20, L.left.y + 30, "时间轴：1956 → 2035", "#5a6472", "start", 10.5, 700);
    tx(gB, L.right.x + 20, L.right.y + 30, "两种表述", "#5a6472", "start", 10.5, 700);

    el("rect", { x: G.axX(2012), y: G.ay - 7, width: G.axX(2035) - G.axX(2012), height: 14, rx: 7, fill: "#e6f6ee" }, gA);
    el("line", { x1: G.x0, y1: G.ay, x2: G.x1, y2: G.ay, stroke: "#9fb3c4", "stroke-width": 1.6 }, gA);
    var tk = [[1956, "middle"], [1981, "middle"], [2012, "end"], [2017, "start"], [2035, "end"]];
    for (var i = 0; i < tk.length; i++) {
      var t = tk[i][0], px = G.axX(t), an = tk[i][1];
      el("circle", { cx: px, cy: G.ay, r: 3.2, fill: "#8a939e" }, gA);
      if (n && t !== 1956 && t !== 2035) continue;
      tx(gA, px + (an === "end" ? -3 : an === "start" ? 3 : 0), G.ay - 12, String(t), "#5a6472", an, n ? 8.2 : 9, 700);
    }
    if (n) tx(gA, G.axX(2012) + 4, G.ay + 16, "新时代", "#2f8a5b", "start", 8, 700);

    var mx = G.axX(s.y);
    el("line", { x1: mx, y1: G.ay - 10, x2: mx, y2: G.ay + 10, stroke: col, "stroke-width": 2.6 }, gA);
    el("circle", { cx: mx, cy: G.ay, r: 5.2, fill: col }, gA);
    tx(gA, L.left.x + 20, G.ay + 32, "y = " + s.y, "#151a21", "start", n ? 9.6 : 10.2, 700);
    tx(gA, L.left.x + L.left.w - 20, G.ay + 32, s.ma === 1 ? "旧表述（1981）" : "新表述（2017）", col, "end", n ? 9 : 9.6, 700);

    var sp = G.stmt;
    el("rect", { x: sp.x, y: sp.y, width: sp.w, height: sp.h, rx: 8, fill: "#ffffff", stroke: "#cfd9e2" }, gA);
    tx(gA, sp.x + 12, sp.y + 20, "当前主要矛盾表述（ma = " + s.ma + "）", "#5a6472", "start", n ? 8.6 : 9.2, 700);
    wrap(gA, sp.x + 12, sp.y + 42, s.ma === 1 ? OLD : NEW, sp.w - 24, n ? 9.2 : 10.2, "#151a21", n ? 14 : 17);
    tx(gA, sp.x + 12, sp.y + (n ? 78 : 84), s.ma === 1 ? "→ 2017 年转化为新表述" : "→ 33 个字，两处换词", "#5a6472", "start", n ? 8.4 : 9, 400);

    var kp = G.keep;
    el("rect", { x: kp.x, y: kp.y, width: kp.w, height: kp.h, rx: 8, fill: "#f4fbf7", stroke: "#b8e6d0" }, gA);
    tx(gA, kp.x + 12, kp.y + 20, "两个「没有变」（任何年份都成立）", "#2f8a5b", "start", n ? 8.6 : 9.4, 700);
    tx(gA, kp.x + 12, kp.y + (n ? 38 : 46), "① 初级阶段的基本国情没有变", "#3a3a35", "start", n ? 8.2 : 9, 400);
    tx(gA, kp.x + 12, kp.y + (n ? 54 : 62), "② 最大发展中国家的国际地位没有变", "#3a3a35", "start", n ? 8.2 : 9, 400);

    if (!n) {
      el("line", { x1: L.left.x + 20, y1: 372, x2: L.left.x + L.left.w - 20, y2: 372, stroke: "#e6e9ee" }, gA);
      tx(gA, L.left.x + 20, 392, "2012 年党的十八大：进入新时代（历史方位）", "#5a6472", "start", 9, 400);
      tx(gA, L.left.x + 20, 410, "2017 年党的十九大：主要矛盾新表述正式提出", "#5a6472", "start", 9, 400);
      tx(gA, L.left.x + 20, 428, "2035 年：基本实现社会主义现代化", "#8a939e", "start", 9, 400);
    }

    card(G.c1, s.ma === 1, "旧表述 · 1981 年十一届六中全会", "人民日益增长的物质文化需要", "同落后的社会生产之间的矛盾", s.ma === 1);
    card(G.c2, s.ma === 2, "新表述 · 2017 年党的十九大", "人民日益增长的美好生活需要", "和不平衡不充分的发展之间的矛盾", s.ma === 2);

    var st = G.st, bg = s.y < 2017 ? "#fdf3e0" : "#e6f6ee", sc = s.y < 2017 ? "#b8791f" : "#2f8a5b";
    var tv = s.y < 2012 ? "尚未进入新时代" : (s.ma === 1 ? "新时代 · 旧表述" : "新时代 · 新表述");
    var sv = s.y < 2012 ? "2012 年十八大之前" : (s.ma === 1 ? "2012–2016：起点已定" : "2017 十九大正式提出");
    el("rect", { x: st.x, y: st.y, width: st.w, height: st.h, rx: 8, fill: bg, stroke: sc + "44" }, gB);
    tx(gB, st.x + 12, st.y + 20, "④ 状态判断", sc, "start", 9, 700);
    tx(gB, st.x + 12, st.y + (n ? 42 : 44), tv, sc, "start", n ? 9.4 : 10.2, 700);
    tx(gB, st.x + 12, st.y + (n ? 58 : 62), sv, "#5a6472", "start", n ? 8.2 : 8.8, 400);
    tx(gB, L.right.x + 20, L.right.y + L.right.h - 16, "2012 只改状态，2017 才改表述", "#8a939e", "start", 8.8, 400);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.y);
    $("gxVb").textContent = s.ma === 1 ? "旧表述" : "新表述";
    $("gxVc").textContent = String(s.to2017);
    if (s.y < 2012) { st = "尚未进入新时代"; col = "#b8791f"; bg = "#fdf3e0"; sn = "十八大（2012）之前"; }
    else if (s.ma === 1) { st = "新时代 · 旧表述"; col = "#b8791f"; bg = "#fdf3e0"; sn = "起点已定，表述未改"; }
    else { st = "新时代 · 新表述"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "2017 十九大正式提出"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw(s);
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
    loop: [{ t: 0, v: 1956 }, { t: 1.0, v: 1956 }, { t: 1.8, v: 1981 }, { t: 2.2, v: 1981 }, { t: 4.8, v: 2017 }, { t: 7.6, v: 2017 }, { t: 9.8, v: 2035 }, { t: 11.2, v: 2035 }, { t: 13.0, v: 1956 }],
    keys: [1956, 1981, 2017, 2035],
    value: A, min: 1956, max: 2035, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1981, eq: { ma: 1 } },
    { v: 2017, eq: { ma: 2 } },
    { v: 2035, eq: { ma: 2 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});

/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 1, G = null;

  var NAME = ["S 区", "W 区", "V 区", "H 区"];
  var SYM = ["不能讲话", "不能写字", "看不懂文字", "听不懂话"];
  var DIS = ["运动性失语症", "失写症", "失读症", "感觉性失语症"];
  var COL = ["#c2543f", "#b8791f", "#3f6fa8", "#2f8a5b"];
  /* 图块原始坐标 */
  var BOX = [[150, 160, 42, 26], [290, 200, 42, 26], [350, 168, 42, 26], [418, 118, 42, 26]];
  var TIP = [
    "能听、能写，说不出成句的话 → S 区",
    "能听能说，却写不出字 → W 区",
    "眼不瞎、能说能写，却看不懂字 → V 区",
    "耳不聋、能说能写，却听不懂话 → H 区"
  ];

  /* 纯函数：参数 → 数值。render() 和 __bio.cases 都用它 */
  function calc(v) {
    var loc = Math.max(1, Math.min(4, Math.round(v)));
    return { loc: loc, name: NAME[loc - 1], sym: SYM[loc - 1], dis: DIS[loc - 1], tip: TIP[loc - 1] };
  }

  /* 版面几何：脑图缩放与图块位置一次算好，render 里不再取 DOM 尺寸 */
  function geom() {
    var s = L === W ? 0.94 : 0.76;
    return {
      s: s,
      ox: L.left.x + (L === W ? 32 : 20) - 96 * s,
      oy: L.left.y + (L === W ? 66 : 52) - 52 * s,
      rowY: L.right.y + 74,
      step: L === W ? 42 : 46,
      rowW: L.right.w - 40
    };
  }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function brain(g, loc) {
    var gr = el("g", { transform: "translate(" + G.ox.toFixed(1) + "," + G.oy.toFixed(1) + ") scale(" + G.s + ")" }, g);
    el("path", {
      d: "M 118,196 C 96,172 98,134 124,110 C 148,84 186,72 224,76 C 244,56 286,52 312,70 C 340,54 384,62 398,94 C 432,94 460,120 456,150 C 480,168 474,200 446,206 C 428,226 396,232 372,222 C 340,236 280,238 240,228 C 200,236 152,224 138,208 Z",
      fill: "#ffffff", stroke: "#c9d6e0", "stroke-width": 1.7
    }, gr);
    for (var i = 0; i < 4; i++) {
      var b = BOX[i];
      el("rect", { x: b[0], y: b[1], width: b[2], height: b[3], rx: 5, fill: COL[i], opacity: i === loc - 1 ? 1 : 0.34 }, gr);
      tx(gr, b[0] + b[2] / 2, b[1] + b[3] / 2 + 4.6, NAME[i].charAt(0), "#ffffff", "middle", 13, 700);
    }
    var c = BOX[loc - 1], cx = c[0] + c[2] / 2, cy = c[1] + c[3] / 2, r = 16;
    el("line", { x1: cx - r, y1: cy - r * 0.72, x2: cx + r, y2: cy + r * 0.72, stroke: "#d64533", "stroke-width": 4.2, "stroke-linecap": "round" }, gr);
    el("line", { x1: cx + r, y1: cy - r * 0.72, x2: cx - r, y2: cy + r * 0.72, stroke: "#d64533", "stroke-width": 4.2, "stroke-linecap": "round" }, gr);
  }

  function draw() {
    var s = calc(A), gA = $("gxA"), gB = $("gxB"), i;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 18, L.left.y + 26, "左半球外侧面（简笔外形）", "#5a6472", "start", 10.2, 700);
    brain(gA, s.loc);
    tx(gA, L.left.x + 18, L.left.y + L.left.h - 46, "红叉＝本次受损的言语区", "#d64533", "start", 9.4, 700);
    wrap(gA, L.left.x + 18, L.left.y + L.left.h - 30, "四个色块依次是 S、W、V、H；坏哪一块，就缺它管的那一样。", L.left.w - 36, 9, "#5a6472", 14);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 18, L.right.y + 26, "四个言语区：谁坏，缺哪样", "#5a6472", "start", 10.2, 700);
    for (i = 0; i < 4; i++) {
      var y = G.rowY + i * G.step, on = i === s.loc - 1;
      if (on) el("rect", { x: L.right.x + 12, y: y - 19, width: L.right.w - 24, height: 32, rx: 6, fill: COL[i] + "14", stroke: COL[i] + "55" }, gB);
      el("rect", { x: L.right.x + 22, y: y - 8, width: 13, height: 13, rx: 3, fill: COL[i], opacity: on ? 1 : 0.42 }, gB);
      tx(gB, L.right.x + 44, y + 3, NAME[i] + " · " + SYM[i], on ? "#151a21" : "#6c7783", "start", 9.6, on ? 700 : 400);
      if (on) tx(gB, L.right.x + 44, y + 19, s.dis, COL[i], "start", 8.8, 700);
    }
    var by = G.rowY + 4 * G.step + 14;
    el("rect", { x: L.right.x + 14, y: by - 6, width: L.right.w - 28, height: 34, rx: 6, fill: "#eaf6ef", stroke: "#8fc9ab" }, gB);
    tx(gB, L.right.x + 26, by + 15, "其他功能多半完好", "#1f6b45", "start", 9.6, 700);
    wrap(gB, L.right.x + 16, by + 52, TIP[s.loc - 1], L.right.w - 32, 9.2, "#3a3a35", 15);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(s.loc);
    $("gxVb").textContent = s.name;
    $("gxVc").textContent = s.sym;
    if (s.loc === 2) { st = "最易混"; col = "#b8791f"; bg = "#fdf3e0"; sn = "能听能说，写不出"; }
    else { st = "只坏一处"; col = "#b8402f"; bg = "#fbeae7"; sn = "其他功能多半完好"; }
    $("gxVs").textContent = st;
    $("gxVsn").textContent = sn;
    $("gxStBox").style.background = bg;
    $("gxStBox").style.borderColor = col + "44";
    $("gxVs").style.color = col;
    draw();
  }

  function layout() {
    L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N;
    G = geom();
    stage.setAttribute("viewBox", L.vb);
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
    loop: [{ t: 0, v: 1 }, { t: 2.2, v: 1 }, { t: 4.6, v: 2 }, { t: 7, v: 2 }, { t: 9.4, v: 4 }, { t: 11.4, v: 3 }, { t: 13.4, v: 1 }],
    keys: [1, 2, 3, 4],
    value: A, min: 1, max: 4, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1, eq: { loc: 1 } },
    { v: 3, eq: { loc: 3 } },
    { v: 4, eq: { loc: 4 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});

/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 20;

  /* 纯函数：图距 d(0–50 cM) → 交换率 / 亲本型 / 重组型 / 是否连锁 */
  function calc(v) {
    var d = Math.max(0, Math.min(50, v));
    var cross = d / 100;
    return { d: d, cross: cross, parental: (1 - cross) / 2, recomb: cross / 2, linked: d < 50 ? 1 : 0 };
  }

  function geom() {
    var lp = L.left, rp = L.right;
    return {
      lp: lp, rp: rp,
      cx: lp.x + 26, cw: lp.w - 52, barY: lp.y + lp.h * 0.40, barH: 18,
      aF: 0.30, span: 0.30, fixed: [0.06, 0.15, 0.68, 0.82, 0.93],
      rowY0: rp.y + 72, rowH: Math.min(52, (rp.h - 190) / 4),
      barX: rp.x + 106, maxBW: rp.w - 156
    };
  }

  function sq(g, x, y, s, fill) {
    el("rect", { x: x - s / 2, y: y - s / 2, width: s, height: s, rx: 2, fill: fill }, g);
  }

  function drawLeft(s) {
    var g = $("gxA"), lp = G.lp, bx = G.cx, bw = G.cw, by = G.barY, i;
    el("rect", { x: lp.x, y: lp.y, width: lp.w, height: lp.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, g);
    tx(g, lp.x + 20, lp.y + 30, "一条染色体（长条）上的基因（小方块）", "#5a6472", "start", 10.5, 700);
    el("rect", { x: bx, y: by, width: bw, height: G.barH, rx: 9, fill: "#e6f0f7", stroke: "#a9c9dd" }, g);
    for (i = 0; i < G.fixed.length; i++) sq(g, bx + bw * G.fixed[i], by + G.barH / 2, 11, "#a9c9dd");
    var xA = bx + bw * G.aF, xB = bx + bw * (G.aF + s.d / 50 * G.span), cy = by + G.barH / 2;
    sq(g, xA, cy, 13, "#2f8a5b");
    tx(g, xA - 8, by - 7, "A", "#2f6b4a", "end", 9.6, 700);
    if (s.d < 2) {
      el("rect", { x: xB - 10, y: cy - 10, width: 20, height: 20, rx: 3, fill: "none", stroke: "#b8402f", "stroke-width": 1.8 }, g);
    } else {
      sq(g, xB, cy, 13, "#b8402f");
    }
    tx(g, xB + 8, by - 7, "B", "#b8402f", "start", 9.6, 700);
    var y1 = by + G.barH + 4, y2 = by + G.barH + 30;
    el("line", { x1: xA, y1: y1, x2: xA, y2: y2, stroke: "#9aa7b4", "stroke-width": 1 }, g);
    el("line", { x1: xB, y1: y1, x2: xB, y2: y2, stroke: "#9aa7b4", "stroke-width": 1 }, g);
    el("line", { x1: xA, y1: y2, x2: xB, y2: y2, stroke: "#7f8c99", "stroke-width": 1.2 }, g);
    tx(g, (xA + xB) / 2, y2 + 15, "d = " + Math.round(s.d) + " cM", "#3a3a35", "middle", 9.2, 700);
    tx(g, lp.x + 20, by + 84, "间隔 = 图距 " + (s.cross * 100).toFixed(0) + " cM → 交换率 " + (s.cross * 100).toFixed(0) + "%", "#3a3a35", "start", 8.4, 400);
    tx(g, lp.x + 20, by + 104, s.cross > 0 ? "两基因之间可发生交换，产生少量重组型" : "d = 0：两基因完全连锁，不产生重组型", "#3a3a35", "start", 8.4, 400);
    tx(g, lp.x + 20, by + 128, "同一根长条上的基因一起传递 → 连锁", "#b8791f", "start", 8.4, 600);
    tx(g, lp.x + 20, lp.y + lp.h - 40, "一条染色体上有许多个基因，呈线性排列。", "#2f6b4a", "start", 8.4, 700);
    tx(g, lp.x + 20, lp.y + lp.h - 22, "图中只画 7 个基因作示意，真实染色体上有几百个。", "#8a95a3", "start", 8.2, 400);
  }

  function drawRight(s) {
    var g = $("gxB"), rp = G.rp, bx = G.barX, bw = G.maxBW, i;
    el("rect", { x: rp.x, y: rp.y, width: rp.w, height: rp.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, g);
    tx(g, rp.x + 20, rp.y + 30, "测交后代的四种配子比例", "#5a6472", "start", 10.5, 700);
    var rows = [
      { k: "亲本型 AB", v: s.parental, c: "#2f8a5b" },
      { k: "亲本型 ab", v: s.parental, c: "#2f8a5b" },
      { k: "重组型 Ab", v: s.recomb, c: "#b8791f" },
      { k: "重组型 aB", v: s.recomb, c: "#b8791f" }
    ];
    var pctX = rp.x + rp.w - 42;
    for (i = 0; i < 4; i++) {
      var y = G.rowY0 + i * G.rowH;
      el("rect", { x: bx, y: y, width: bw, height: 15, rx: 7, fill: "#eef2f6" }, g);
      el("rect", { x: bx, y: y, width: Math.max(2, bw * (rows[i].v / 0.5)), height: 15, rx: 7, fill: rows[i].c }, g);
      tx(g, rp.x + 18, y + 11, rows[i].k, "#3a3a35", "start", 8.6, 600);
      tx(g, pctX, y + 11, (rows[i].v * 100).toFixed(1) + "%", "#3a3a35", "start", 8.5, 600);
    }
    var sy = rp.y + rp.h - 96, col = s.linked ? "#b8791f" : "#2f8a5b";
    tx(g, rp.x + 20, sy, s.linked ? "d = " + Math.round(s.d) + " cM < 50 cM：两基因连锁" : "d = 50 cM：表现如独立（自由组合）", col, "start", 8.8, 700);
    tx(g, rp.x + 20, sy + 22, "亲本型各 " + (s.parental * 100).toFixed(0) + "%，重组型各 " + (s.recomb * 100).toFixed(0) + "%", "#3a3a35", "start", 8.4, 400);
    tx(g, rp.x + 20, sy + 44, "连锁的基因不遵循自由组合：不是 9∶3∶3∶1", "#8a95a3", "start", 8.2, 400);
  }

  function draw() {
    $("gxA").textContent = "";
    $("gxB").textContent = "";
    var s = calc(A);
    drawLeft(s);
    drawRight(s);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(s.d));
    $("gxVb").textContent = (s.cross * 100).toFixed(1) + "%";
    $("gxVbs").textContent = "= d ÷ 100";
    $("gxVc").textContent = (s.recomb * 100).toFixed(1) + "%";
    $("gxVcs").textContent = "每种亲本型 " + (s.parental * 100).toFixed(1) + "%";
    if (s.linked) { st = "两基因连锁"; col = "#b8791f"; bg = "#fdf3e0"; sn = "交换率 " + (s.cross * 100).toFixed(0) + "% < 50%，亲本型多"; }
    else { st = "表现如独立"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "交换率 50%，四种配子各 1/4"; }
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
    loop: [{ t: 0, v: 0 }, { t: 0.6, v: 0 }, { t: 2.4, v: 20 }, { t: 3.9, v: 50 }, { t: 5.4, v: 50 }, { t: 7.4, v: 20 }, { t: 9.9, v: 20 }, { t: 11.5, v: 35 }, { t: 13, v: 0 }],
    keys: [0, 20, 35, 50],
    value: A, min: 0, max: 50, step: 1,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 0, eq: { cross: 0, linked: 1 } },
    { v: 20, eq: { cross: 0.2, recomb: 0.1 } },
    { v: 50, eq: { cross: 0.5, linked: 0 } }
  ] };
  window.__model = window.__bio;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});

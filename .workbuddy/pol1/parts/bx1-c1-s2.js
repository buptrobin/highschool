/* 互动脚本本体（build-page.mjs 会包进 <script>，这里不写标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 1840;
  var ERA = [
    ["诞生前：空想社会主义", "看到了资本主义的弊端", "没找到现实力量和正确道路"],
    ["1848：《宣言》发表", "标志科学社会主义的诞生", "社会主义从空想变为科学"],
    ["1871：巴黎公社", "无产阶级建立政权的", "第一次伟大尝试（未成功）"],
    ["1917：十月革命", "第一个社会主义国家", "从理论到现实的飞跃"]
  ];

  /* 纯函数：年份 → gap 与 era。render() 与 __bio.cases 共用 */
  function calc(y) {
    var era = y < 1848 ? 1 : y < 1871 ? 2 : y < 1917 ? 3 : 4;
    return { gap: y - 1848, era: era };
  }
  function xOf(y, g) { return g.ax + (y - 1840) / 80 * g.aw; }
  function eCol(e) { return (e === 2 || e === 4) ? "#2f8a5b" : "#b8791f"; }
  function eBg(e) { return (e === 2 || e === 4) ? "#e6f6ee" : "#fdf3e0"; }

  function geom() {
    if (L === W) {
      return { ax: 56, ay: 210, aw: 348, tickTop: 204, tickBot: 216, yearY: 232, markY: 247,
        curTop: 150, curLabelY: 138, gapLabelY: 292, gapY: 332, gapFs: 24, gapSubY: 352,
        eb: { x: 40, y: 378, w: 376, h: 52 }, ebTy: 409,
        rows: [0, 1, 2, 3].map(function (i) { return { x: 476, y: 64 + i * 92, w: 368, h: 82 }; }) };
    }
    return { ax: 30, ay: 150, aw: 292, tickTop: 144, tickBot: 156, yearY: 172, markY: 186,
      curTop: 106, curLabelY: 94, gapLabelY: 212, gapY: 242, gapFs: 20, gapSubY: 260,
      eb: { x: 20, y: 268, w: 312, h: 34 }, ebTy: 290,
      rows: [0, 1, 2, 3].map(function (i) { return { x: 8, y: 352 + i * 84, w: 344, h: 76 }; }) };
  }

  function draw() {
    var g = G, s = calc(A), gA = $("gxA"), gB = $("gxB"), col = eCol(s.era);
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: L.left.x, y: L.left.y, width: L.left.w, height: L.left.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, L.left.x + 20, L.left.y + 30, "时间轴：1840 → 1920", "#5a6472", "start", 10.5, 700);
    tx(gA, L.left.x + L.left.w - 20, L.left.y + 30, "y = " + A, col, "end", 11, 700);

    var endX = g.ax + g.aw, ticks = [[1848, "《宣言》"], [1871, "巴黎公社"], [1917, "十月革命"]], i, x;
    el("line", { x1: g.ax, y1: g.ay, x2: endX, y2: g.ay, stroke: "#8aa0b0", "stroke-width": 2 }, gA);
    el("polygon", { points: (endX + 8) + "," + g.ay + " " + (endX - 4) + "," + (g.ay - 5) + " " + (endX - 4) + "," + (g.ay + 5), fill: "#8aa0b0" }, gA);
    for (i = 0; i < ticks.length; i++) {
      x = xOf(ticks[i][0], g);
      el("line", { x1: x, y1: g.tickTop, x2: x, y2: g.tickBot, stroke: "#5a6472", "stroke-width": 1.4 }, gA);
      tx(gA, x, g.yearY, String(ticks[i][0]), "#151a21", "middle", 9.5, 700);
      tx(gA, x, g.markY, ticks[i][1], "#5a6472", "middle", 8, 400);
    }

    var xc = xOf(A, g), lx = Math.min(Math.max(xc, g.ax + 34), endX - 34);
    el("line", { x1: xc, y1: g.curTop, x2: xc, y2: g.ay, stroke: col, "stroke-dasharray": "4 4", "stroke-width": 1.6 }, gA);
    el("circle", { cx: xc, cy: g.ay, r: 6, fill: col }, gA);
    tx(gA, lx, g.curLabelY, "y = " + A, col, "middle", 10.5, 700);

    var cx = L.left.x + L.left.w / 2;
    tx(gA, cx, g.gapLabelY, "距《宣言》发表", "#5a6472", "middle", 9, 700);
    tx(gA, cx, g.gapY, (s.gap > 0 ? "+" : "") + s.gap, col, "middle", g.gapFs, 700);
    tx(gA, cx, g.gapSubY, "gap = y − 1848（1848 年之前为负）", "#7a8593", "middle", 8.4, 400);
    el("rect", { x: g.eb.x, y: g.eb.y, width: g.eb.w, height: g.eb.h, rx: 8, fill: eBg(s.era), stroke: col + "66", "stroke-width": 1.4 }, gA);
    tx(gA, g.eb.x + g.eb.w / 2, g.ebTy, "era " + s.era + " · " + ERA[s.era - 1][0], col, "middle", 10, 700);

    el("rect", { x: L.right.x, y: L.right.y, width: L.right.w, height: L.right.h, rx: 10, fill: "#ffffff", stroke: "#e6e9ee" }, gB);
    tx(gB, L.right.x + 20, L.right.y + 30, "四个阶段（era）", "#5a6472", "start", 10.5, 700);
    for (var k = 0; k < 4; k++) {
      var r = g.rows[k], on = (s.era === k + 1), c2 = eCol(k + 1);
      el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 8, fill: on ? eBg(k + 1) : "#fbfcfd",
        stroke: on ? c2 : "#e6e9ee", "stroke-width": on ? 1.6 : 1 }, gB);
      tx(gB, r.x + 14, r.y + 21, "era " + (k + 1), on ? c2 : "#9aa4b0", "start", 9, 700);
      tx(gB, r.x + 14, r.y + 39, ERA[k][0], on ? "#151a21" : "#5a6472", "start", 9.8, on ? 700 : 400);
      tx(gB, r.x + 14, r.y + 56, ERA[k][1], on ? "#3a3a35" : "#8b95a1", "start", 8.4, 400);
      tx(gB, r.x + 14, r.y + 70, ERA[k][2], on ? "#3a3a35" : "#8b95a1", "start", 8.4, 400);
    }
  }

  function render() {
    if (!G) { L = (stage.parentElement.getBoundingClientRect().width >= 640) ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(A);
    $("gxVb").textContent = (s.gap > 0 ? "+" : "") + s.gap;
    $("gxVc").textContent = "era " + s.era;
    if (s.era === 1) { col = "#b8791f"; bg = "#fdf3e0"; st = "理论还在酝酿"; sn = "1848 年之前：空想社会主义"; }
    else if (s.era === 2) { col = "#2f8a5b"; bg = "#e6f6ee"; st = "科学社会主义诞生"; sn = "《宣言》发表，科学社会主义诞生"; }
    else if (s.era === 3) { col = "#b8791f"; bg = "#fdf3e0"; st = "第一次伟大尝试"; sn = "巴黎公社：第一次伟大尝试"; }
    else { col = "#2f8a5b"; bg = "#e6f6ee"; st = "理论变为现实"; sn = "十月革命：理论变为现实"; }
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
    mount: stage, follow: $("gxSl"),
    loop: [{ t: 0, v: 1840 }, { t: 1.2, v: 1840 }, { t: 4, v: 1917 }, { t: 6.5, v: 1917 },
      { t: 9, v: 1848 }, { t: 11, v: 1871 }, { t: 13, v: 1840 }],
    keys: [1840, 1848, 1871, 1917],
    value: A, min: 1840, max: 1920, step: 1, idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 1840, eq: { gap: -8, era: 1 } },
    { v: 1848, eq: { gap: 0, era: 2 } },
    { v: 1917, eq: { gap: 69, era: 4 } }
  ] };
  window.__model = window.__bio;

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});

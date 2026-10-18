/* 互动脚本本体（由 build-page.mjs 包进 <script> 里，所以这里不要写 <script> 标签） */
document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  /* 两套坐标：宽屏 880×470，窄屏独立 360×700 */
  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, A = 0, G = null;

  /* 纯函数：唯一真值。I（阈值的百分数）→ 是否产生动作电位 + 幅度（全或无） */
  function calc(v) { return { ap: v >= 100 ? 1 : 0, amp: v >= 100 ? 100 : 0, thr: 100 }; }

  /* 几何：由 L 算纤维带与曲线坐标，两种屏宽共用一套逻辑 */
  function geom() {
    var l = L.left, h = Math.min(150, l.h * .34), b = l.y + l.h - 58;
    return { fx: l.x + 22, fw: l.w - 44, fy: l.y + 60, fh: 34, bx: l.x + 30, bw: l.w - 52, base: b, peak: b - h, thrY: b - h * .62 };
  }

  function rc(p, x, y, w, h, f, s, r) { el("rect", { x: x, y: y, width: w, height: h, rx: r || 0, fill: f, stroke: s || "none" }, p); }
  function ln(p, a, b, c, d, s, w, da) { el("line", { x1: a, y1: b, x2: c, y2: d, stroke: s, "stroke-width": w, "stroke-dasharray": da || "none" }, p); }
  function tri(p, cx, cy, dir, c) { el("polygon", { points: (cx - 5) + "," + (cy - dir * 6) + " " + (cx + 5) + "," + (cy - dir * 6) + " " + cx + "," + (cy + dir * 6), fill: c }, p); }

  /* 中文按字数换行，避免长句冲出面板 */
  function wrap(parent, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(parent, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw() {
    var gA = $("gxA"), gB = $("gxB"), s = calc(A), g = G, l = L.left, r = L.right;
    gA.textContent = ""; gB.textContent = "";
    var gx = r.x + 16, gw = r.w - 32, y = r.y;

    /* 左：一条横向的神经纤维带子，膜外/膜内各标正负号 */
    rc(gA, l.x, l.y, l.w, l.h, "#f8fbfd", "#dbe7ef", 10);
    tx(gA, l.x + 18, l.y + 26, "神经纤维（横切）与膜电位变化", "#5a6472", "start", 10.5, 700);
    rc(gA, g.fx, g.fy, g.fw, g.fh, "#eef6fb", "#9dc3d8");
    ln(gA, g.fx, g.fy, g.fx + g.fw, g.fy, "#5b8fa8", 2);
    ln(gA, g.fx, g.fy + g.fh, g.fx + g.fw, g.fy + g.fh, "#5b8fa8", 2);
    var oS = s.ap ? "−" : "+", iS = s.ap ? "+" : "−", oC = s.ap ? "#b8402f" : "#2f8a5b", iC = s.ap ? "#2f8a5b" : "#b8402f";
    var row = function (c) { var t = ""; for (var i = 0; i < 6; i++) t += c + "   "; return t; };
    tx(gA, g.fx + 4, g.fy - 9, "膜外", "#5a6472", "start", 8.5, 700);
    tx(gA, g.fx + 4, g.fy + g.fh + 17, "膜内", "#5a6472", "start", 8.5, 700);
    tx(gA, g.fx + g.fw * .45, g.fy - 9, row(oS), oC, "middle", 12, 700);
    tx(gA, g.fx + g.fw * .45, g.fy + g.fh + 17, row(iS), iC, "middle", 12, 700);
    var chx = g.fx + g.fw * .82;
    if (s.ap) {
      ln(gA, chx, g.fy - 16, chx, g.fy + g.fh + 6, "#2f8a5b", 1.8); tri(gA, chx, g.fy + g.fh + 6, 1, "#2f8a5b");
      tx(gA, chx + 9, g.fy + g.fh + 15, "Na⁺", "#2f6b48", "start", 9, 700);
    } else {
      ln(gA, chx, g.fy + g.fh + 12, chx, g.fy - 14, "#b8402f", 1.8); tri(gA, chx, g.fy - 14, -1, "#b8402f");
      tx(gA, chx + 9, g.fy - 12, "K⁺", "#8a3a2a", "start", 9, 700);
    }

    /* 膜电位曲线：阈下只有局部电位，达阈值画尖峰 */
    var b = g.base, t = g.thrY, pk = g.peak, x0 = g.bx + 12, w = g.bw - 30, p;
    ln(gA, g.bx, b, g.bx + g.bw, b, "#9aa7b3", 1);
    ln(gA, g.bx, t, g.bx + g.bw, t, "#b8791f", 1, "5 4");
    tx(gA, g.bx + g.bw, t - 5, "阈电位", "#b8791f", "end", 8.5, 700);
    tx(gA, g.bx, b + 13, "−70 mV", "#8894a1", "start", 8.5, 400);
    if (s.ap) {
      p = "M" + x0 + " " + b + " H" + (x0 + w * .26) +
        " C" + (x0 + w * .33) + " " + b + " " + (x0 + w * .37) + " " + (b - 8) + " " + (x0 + w * .43) + " " + t +
        " C" + (x0 + w * .49) + " " + (pk + 20) + " " + (x0 + w * .54) + " " + pk + " " + (x0 + w * .62) + " " + pk +
        " C" + (x0 + w * .69) + " " + pk + " " + (x0 + w * .74) + " " + (t - 18) + " " + (x0 + w * .8) + " " + b +
        " C" + (x0 + w * .85) + " " + (b + 14) + " " + (x0 + w * .9) + " " + (b + 15) + " " + (x0 + w * .94) + " " + (b + 5) +
        " C" + (x0 + w * .97) + " " + b + " " + (x0 + w * .98) + " " + b + " " + (x0 + w) + " " + b;
      tx(gA, x0 + w * .62, pk - 9, "+30 mV（峰高恒定）", "#8a3a2a", "middle", 9, 700);
    } else {
      p = "M" + x0 + " " + b + " H" + (x0 + w * .26) +
        " C" + (x0 + w * .3) + " " + b + " " + (x0 + w * .32) + " " + (b - 3) + " " + (x0 + w * .36) + " " + (b - 13) +
        " C" + (x0 + w * .4) + " " + (b - 3) + " " + (x0 + w * .42) + " " + b + " " + (x0 + w * .46) + " " + b + " H" + (x0 + w);
      wrap(gA, g.bx, b + 34, "阈下刺激：只有局部电位，没有动作电位", g.bw - 8, 9.5, "#8a3a2a", 16);
    }
    el("path", { d: p, fill: "none", stroke: s.ap ? "#b8402f" : "#8894a1", "stroke-width": 2.4 }, gA);

    /* 右：强度条 + 幅度条 + 三行对照 + 结论 */
    rc(gB, r.x, r.y, r.w, r.h, "#ffffff", "#e6e9ee", 10);
    tx(gB, gx, y + 26, "刺激强度 I → 动作电位", "#5a6472", "start", 10.5, 700);
    tx(gB, gx, y + 56, "I = " + Math.round(A) + " %", "#3a3a35", "start", 11, 700);
    rc(gB, gx, y + 66, gw, 18, "#eef1f4", "", 4);
    rc(gB, gx, y + 66, Math.max(3, gw * A / 150), 18, "#8fbfd6", "", 4);
    var thx = gx + gw * 100 / 150;
    ln(gB, thx, y + 60, thx, y + 90, "#b8791f", 1.6);
    tx(gB, thx, y + 104, "阈值 100%", "#b8791f", "middle", 8.5, 700);
    tx(gB, gx, y + 104, "0", "#8894a1", "start", 8.5, 400);
    tx(gB, gx + gw, y + 104, "150%", "#8894a1", "end", 8.5, 400);
    tx(gB, gx, y + 132, "幅度 " + s.amp + " %", "#3a3a35", "start", 11, 700);
    rc(gB, gx, y + 142, gw, 18, "#eef1f4", "", 4);
    rc(gB, gx, y + 142, Math.max(3, gw * s.amp / 100), 18, s.ap ? "#2f8a5b" : "#c3cbd4", "", 4);
    var items = [["I < 100%：阈下，无动作电位", A < 100], ["I = 100%：到阈值，立刻满幅", A === 100], ["I > 100%：幅度与阈值时相同", A > 100]];
    for (var i = 0; i < 3; i++) {
      var ry = y + 206 + i * 26;
      el("circle", { cx: gx + 5, cy: ry - 3, r: 3.4, fill: items[i][1] ? "#2f8a5b" : "#dde2e7" }, gB);
      tx(gB, gx + 15, ry, items[i][0], items[i][1] ? "#2f6b48" : "#7d8894", "start", 9.5, items[i][1] ? 700 : 400);
    }
    rc(gB, gx, y + 282, gw, 66, "#f6faf7", "#cfe6d8", 8);
    wrap(gB, gx + 10, y + 302, "幅度只取 0 或 100% 两个值，中间没有任何过渡值——这就是「全或无」的特点。", gw - 20, 10, "#2f6b48", 17);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; G = geom(); }
    var s = calc(A), st, col, bg, sn;
    $("gxVa").textContent = String(Math.round(A));
    $("gxVb").textContent = s.ap ? "有" : "无";
    $("gxVc").textContent = String(s.amp);
    if (A < 100) { st = "阈下刺激"; col = "#b8791f"; bg = "#fdf3e0"; sn = "只有局部电位，不产生动作电位"; }
    else if (A === 100) { st = "刚好达阈值"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "立刻产生动作电位，一步到满幅"; }
    else { st = "阈上刺激"; col = "#2f8a5b"; bg = "#e6f6ee"; sn = "幅度与 I = 100% 时完全相同"; }
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

  /* 停留帧在 I = 100%：50%（什么都没有）→ 150%（满幅）→ 退回 100%（仍满幅，停 3 秒） */
  var ap = AutoPilot.create({
    mount: stage,
    follow: $("gxSl"),
    loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 3.4, v: 50 }, { t: 5, v: 50 }, { t: 7.2, v: 150 }, { t: 9.4, v: 100 }, { t: 12.4, v: 100 }, { t: 14, v: 0 }],
    keys: [0, 50, 150, 100],
    value: A, min: 0, max: 150, step: 5,
    idle: 5000,
    onChange: function (v) { A = v; render(); },
    onMode: setMode
  });
  window.__ap = ap;
  window.__bio = { calc: calc, cases: [
    { v: 50, eq: { ap: 0, amp: 0 } },
    { v: 100, eq: { ap: 1, amp: 100 } },
    { v: 150, eq: { ap: 1, amp: 100 } }
  ] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(layout, 150); });
  layout();
});

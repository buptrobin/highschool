document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var GX = window.GX, el = GX.el, tx = GX.tx, $ = GX.$;
  var stage = $("gxStage");
  if (!stage || !window.AutoPilot) return;

  var W = { vb: "0 0 880 470", left: { x: 16, y: 16, w: 424, h: 438 }, right: { x: 456, y: 16, w: 408, h: 438 } };
  var N = { vb: "0 0 360 700", left: { x: 8, y: 8, w: 344, h: 300 }, right: { x: 8, y: 320, w: 344, h: 372 } };
  var L = W, G = null, A = 1, CO = ["#2f8a5b", "#b8791f", "#2f8a5b"], BG = ["#e6f6ee", "#fdf3e0", "#e6f6ee"];
  var NAME = ["十个明确", "十四个坚持", "十三个方面成就"];
  var ROLE = ["核心内容", "基本方略", "实践成果"];
  var LVL = ["理论层面", "实践层面", "成就层面"];
  var ASK = ["坚持和发展什么样的中国特色社会主义", "怎样坚持和发展中国特色社会主义", "已经干成了什么、取得了什么成就"];
  var CNT = [10, 14, 13];
  var HUH = ["它是理论本身，回答「是什么」，别跟「基本方略」混。",
    "它是基本方略，回答「怎么做」，是理论到实践的中间层，最易误写成核心内容。",
    "它是实践成果，是干出来的事，不能叫理论。"];
  var ST = ["十个明确——管方向、管理论", "十四个坚持——管怎么做", "十三个方面成就——已经做成的事"];
  var SN = ["理论层面，定位清晰", "中间层，最容易混", "成就层面，不是理论"];

  function calc(v) { var k = v <= 1.5 ? 1 : (v >= 2.5 ? 3 : 2); return { k: k, n: CNT[k - 1] }; }

  function geom() {
    var nar = L === N, l = L.left;
    return { nar: nar, cx: l.x + (nar ? 12 : 16), cw: l.w - (nar ? 24 : 32), ch: nar ? 70 : 96, gp: nar ? 12 : 16,
      y0: l.y + (nar ? 44 : 60), yx: nar ? [20, 38, 56] : [28, 50, 72], fsx: nar ? [11, 9, 8.4] : [13, 10, 9.4] };
  }

  function wrap(p, x, y, s, maxW, fs, col, lh) {
    var per = Math.max(6, Math.floor(maxW / fs)), lines = [], cur = "";
    for (var i = 0; i < s.length; i++) { cur += s.charAt(i); if (cur.length >= per) { lines.push(cur); cur = ""; } }
    if (cur) lines.push(cur);
    for (var k = 0; k < lines.length; k++) tx(p, x, y + k * lh, lines[k], col, "start", fs, 400);
  }

  function draw(k) {
    var gA = $("gxA"), gB = $("gxB"), g = G, l = L.left, r = L.right, n = g.nar, i, j, y, on, ax, y2;
    gA.textContent = ""; gB.textContent = "";
    el("rect", { x: l.x, y: l.y, width: l.w, height: l.h, rx: 10, fill: "#f8fbfd", stroke: "#dbe7ef" }, gA);
    tx(gA, l.x + 16, l.y + 26, "三个板块：一层理论、一层方略、一层成绩", "#5a6472", "start", n ? 9.6 : 10.5, 700);
    for (i = 0; i < 3; i++) {
      y = g.y0 + i * (g.ch + g.gp); on = i + 1 === k;
      el("rect", { x: g.cx, y: y, width: g.cw, height: g.ch, rx: 9, "stroke-width": on ? 1.6 : 1, fill: on ? "#fff1f4" : "#fff", stroke: on ? "#be123c" : "#e6e9ee" }, gA);
      el("rect", { x: g.cx, y: y + 10, width: 3, height: g.ch - 20, rx: 1.5, fill: on ? "#be123c" : "#e6e9ee" }, gA);
      var rw = [(i + 1) + "  " + NAME[i], ROLE[i] + " · " + LVL[i], ASK[i]];
      var cl = [on ? "#be123c" : "#151a21", on ? "#b8791f" : "#5a6472", "#3a3a35"];
      for (j = 0; j < 3; j++) tx(gA, g.cx + 14, y + g.yx[j], rw[j], cl[j], "start", g.fsx[j], j ? 400 : 700);
      if (i === 2) continue;
      ax = g.cx + g.cw / 2; y2 = y + g.ch + g.gp;
      el("line", { x1: ax, y1: y + g.ch + 2, x2: ax, y2: y2 - 5, stroke: "#c9d6e2" }, gA);
      el("polygon", { points: ax + "," + (y2 - 3) + " " + (ax - 4) + "," + (y2 - 7) + " " + (ax + 4) + "," + (y2 - 7), fill: "#c9d6e2" }, gA);
    }
    el("rect", { x: r.x, y: r.y, width: r.w, height: r.h, rx: 10, fill: "#fff", stroke: "#e6e9ee" }, gB);
    var px = r.x + (n ? 12 : 18), cw = n ? 118 : 132, ch = n ? 20 : 24;
    tx(gB, px, r.y + (n ? 22 : 26), "定位卡 · 教材原话", "#5a6472", "start", n ? 9.6 : 10.5, 700);
    tx(gB, px, r.y + (n ? 48 : 80), NAME[k - 1], "#151a21", "start", n ? 15 : 21, 700);
    el("rect", { x: px, y: r.y + (n ? 56 : 94), width: cw, height: ch, rx: ch / 2, fill: "#fff1f4", stroke: "#fecdd3" }, gB);
    tx(gB, px + cw / 2, r.y + (n ? 70 : 110), ROLE[k - 1] + " · " + LVL[k - 1], "#be123c", "middle", n ? 9 : 10.2, 700);
    var ty = n ? [412, 438, 464] : [150, 180, 210], lb = ["教材定位", "所处层面", "回答什么"];
    var vb = [ROLE[k - 1], LVL[k - 1], ASK[k - 1]], vx = r.x + (n ? 86 : 90);
    for (i = 0; i < 3; i++) {
      tx(gB, px, ty[i], lb[i], "#8a929e", "start", n ? 8.6 : 9, 400);
      tx(gB, vx, ty[i], vb[i], i ? "#151a21" : "#be123c", "start", n ? 9.4 : 10.4, i ? 400 : 700);
    }
    var bx = r.x + (n ? 12 : 18), by = r.y + (n ? 186 : 246), bw = r.w - (n ? 24 : 36);
    el("rect", { x: bx, y: by, width: bw, height: n ? 86 : 96, rx: 9, fill: "#fdf3e0", stroke: "#e0b06a" }, gB);
    tx(gB, bx + 12, by + (n ? 18 : 20), "最容易混的地方", "#b8791f", "start", n ? 8.8 : 9.4, 700);
    wrap(gB, bx + 12, by + (n ? 36 : 40), HUH[k - 1], bw - 24, n ? 8.6 : 9.2, "#3a3a35", n ? 13 : 14);
    wrap(gB, px, r.y + (n ? 292 : 370), "三个板块定位不同：十个明确是核心内容、十四个坚持是基本方略、十三个方面成就是实践成果。",
      r.w - (n ? 24 : 36), n ? 8.2 : 8.6, "#8a929e", n ? 12 : 13);
  }

  function render() {
    if (!G) { L = stage.parentElement.getBoundingClientRect().width >= 640 ? W : N; stage.setAttribute("viewBox", L.vb); G = geom(); }
    var s = calc(A), k = s.k;
    $("gxVa").textContent = String(k);
    $("gxVb").textContent = ROLE[k - 1];
    $("gxVc").textContent = CNT[k - 1] + (k === 1 ? " 项" : k === 2 ? " 条" : " 个方面");
    $("gxVs").textContent = ST[k - 1];
    $("gxVsn").textContent = SN[k - 1];
    $("gxStBox").style.background = BG[k - 1];
    $("gxStBox").style.borderColor = CO[k - 1] + "44";
    $("gxVs").style.color = CO[k - 1];
    draw(k);
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
    loop: [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 2 }, { t: 6.5, v: 2 }, { t: 9, v: 3 }, { t: 11, v: 2 }, { t: 13, v: 1 }],
    keys: [1, 2, 3], value: A, min: 1, max: 3, step: 1, idle: 5000,
    onChange: function (v) { A = v; render(); }, onMode: setMode
  });
  window.__ap = ap;
  window.__model = { calc: calc, cases: [{ v: 1, eq: { k: 1 } }, { v: 2, eq: { k: 2 } }, { v: 3, eq: { k: 3 } }] };

  var tmr = null;
  window.addEventListener("resize", function () { clearTimeout(tmr); tmr = setTimeout(function () { G = null; render(); }, 150); });
  render();
});

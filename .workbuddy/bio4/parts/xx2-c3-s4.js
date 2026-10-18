document.addEventListener("DOMContentLoaded", function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("gxStage"), sl = $("gxSl");
  if (!stage || !sl) return;

  var W = 880, H = 470, L = null, G = null;
  var LOOP = [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 30 }, { t: 6.5, v: 30 }, { t: 9, v: 100 }, { t: 11, v: 60 }, { t: 13, v: 0 }];

  function calc(c) {
    c = Math.max(0, Math.min(100, Number(c) || 0));
    var attract = 50 * (1 - Math.exp(-c / 30));
    var gain = 50 * (1 - Math.exp(-(c + 10) / 30)) - attract;
    var state, sn, good;
    if (c < 20) { state = "浓度低"; sn = "c < 20：几乎吸引不到同种个体"; good = false; }
    else if (c <= 60) { state = "明显吸引"; sn = "c 在 20–60：加浓度还有明显效果"; good = true; }
    else { state = "接近饱和"; sn = "c > 60：加浓度收益很小，曲线走平"; good = false; }
    return { c: c, attract: attract, gain: gain, state: state, sn: sn, good: good };
  }

  function layout() {
    var host = stage.parentNode;
    var w = host && host.clientWidth ? host.clientWidth : 880;
    W = w >= 640 ? 880 : 360;
    H = w >= 640 ? 470 : 700;
    return { d: W === 880 };
  }

  function geom() {
    var d = L && L.d;
    var field = d ? { x: 24, y: 64, w: 392, h: 352 } : { x: 16, y: 56, w: 328, h: 238 };
    var src = d ? { x: 220, y: 258 } : { x: 180, y: 180 };
    var maxR = d ? 120 : 88;
    var plot = d ? { x0: 520, y0: 396, x1: 842, y1: 112 } : { x0: 66, y0: 640, x1: 330, y1: 390 };
    var spots = [], i, r, a;
    for (i = 0; i < 10; i++) {
      r = maxR * (0.3 + 0.07 * i);
      a = -Math.PI / 2 + i * 2.399;
      spots.push({ x: src.x + r * Math.cos(a), y: src.y + r * Math.sin(a) });
    }
    return { d: d, field: field, src: src, maxR: maxR, plot: plot, spots: spots };
  }

  function fx(v, n) { return (Math.round(v * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n); }

  function drawScene(m) {
    var g = G, f = g.field, s = g.src, i, r, k = Math.round(m.attract / 5), out = [];
    out.push('<rect x="' + f.x + '" y="' + f.y + '" width="' + f.w + '" height="' + f.h + '" rx="10" fill="#f8fbfd" stroke="#dbe7ef"/>');
    out.push('<text x="' + (f.x + 18) + '" y="' + (f.y + 26) + '" font-size="11.5" font-weight="700" fill="#33424e">信息素扩散场（示意）</text>');
    out.push('<text x="' + (f.x + f.w - 14) + '" y="' + (f.y + 26) + '" font-size="9.4" fill="#5a6b78" text-anchor="end">同种个体 ' + k + ' / 10</text>');
    for (i = 0; i < 4; i++) {
      r = g.maxR * (0.22 + 0.09 * i);
      out.push('<circle cx="' + s.x + '" cy="' + s.y + '" r="' + fx(r, 1) + '" fill="none" stroke="#b8791f" stroke-dasharray="4 4" opacity="' + fx(0.14 + 0.5 * (m.c / 100) * (1 - i * 0.16), 2) + '"/>');
    }
    out.push('<ellipse cx="' + s.x + '" cy="' + s.y + '" rx="11" ry="7" fill="#b8791f"/>');
    out.push('<line x1="' + (s.x - 9) + '" y1="' + (s.y - 5) + '" x2="' + (s.x - 16) + '" y2="' + (s.y - 13) + '" stroke="#b8791f"/>');
    out.push('<line x1="' + (s.x + 9) + '" y1="' + (s.y - 5) + '" x2="' + (s.x + 16) + '" y2="' + (s.y - 13) + '" stroke="#b8791f"/>');
    out.push('<text x="' + s.x + '" y="' + (s.y + 34) + '" font-size="9" fill="#8a5a12" text-anchor="middle">雌虫（释放源）</text>');
    for (i = 0; i < k; i++) {
      var p = g.spots[i];
      out.push('<circle cx="' + fx(p.x, 1) + '" cy="' + fx(p.y, 1) + '" r="4.5" fill="#2f8a5b"/>');
      out.push('<line x1="' + fx(p.x, 1) + '" y1="' + fx(p.y, 1) + '" x2="' + fx(p.x - 9, 1) + '" y2="' + fx(p.y - 7, 1) + '" stroke="#2f8a5b"/>');
      out.push('<line x1="' + fx(p.x, 1) + '" y1="' + fx(p.y, 1) + '" x2="' + fx(p.x + 9, 1) + '" y2="' + fx(p.y - 7, 1) + '" stroke="#2f8a5b"/>');
    }
    $("gxA").innerHTML = out.join("");
  }

  function drawPlot(m) {
    var p = G.plot, out = [], c, d = "";
    var X = function (v) { return p.x0 + (p.x1 - p.x0) * v / 100; };
    var Y = function (a) { return p.y0 - (p.y0 - p.y1) * a / 50; };
    out.push('<rect x="' + p.x0 + '" y="' + p.y0 + '" width="' + (p.x1 - p.x0) + '" height="' + (p.y1 - p.y0) + '" fill="#ffffff" stroke="#eef3f7"/>');
    out.push('<line x1="' + p.x0 + '" y1="' + Y(0) + '" x2="' + p.x1 + '" y2="' + Y(0) + '" stroke="#9fb3c2"/>');
    out.push('<line x1="' + p.x0 + '" y1="' + p.y0 + '" x2="' + p.x0 + '" y2="' + p.y1 + '" stroke="#9fb3c2"/>');
    out.push('<line x1="' + p.x0 + '" y1="' + fx(Y(50), 1) + '" x2="' + p.x1 + '" y2="' + fx(Y(50), 1) + '" stroke="#e3ebf2" stroke-dasharray="4 4"/>');
    for (c = 0; c <= 100; c += 5) {
      d += (c === 0 ? "M" : "L") + fx(X(c), 1) + " " + fx(Y(50 * (1 - Math.exp(-c / 30))), 1) + " ";
    }
    out.push('<path d="' + d + '" fill="none" stroke="#b8791f" stroke-width="2"/>');
    out.push('<line x1="' + p.x0 + '" y1="' + fx(Y(m.attract), 1) + '" x2="' + fx(X(m.c), 1) + '" y2="' + fx(Y(m.attract), 1) + '" stroke="#2f8a5b" stroke-dasharray="3 3"/>');
    out.push('<line x1="' + fx(X(m.c), 1) + '" y1="' + fx(Y(m.attract), 1) + '" x2="' + fx(X(m.c), 1) + '" y2="' + Y(0) + '" stroke="#2f8a5b" stroke-dasharray="3 3"/>');
    out.push('<circle cx="' + fx(X(m.c), 1) + '" cy="' + fx(Y(m.attract), 1) + '" r="4" fill="#2f8a5b"/>');
    out.push('<text x="' + (p.x0 + 6) + '" y="' + (p.y1 - 4) + '" font-size="9" fill="#5a6b78">吸引数 / 只</text>');
    out.push('<text x="' + p.x0 + '" y="' + fx(Y(50), 1) + '" font-size="9" fill="#5a6b78" text-anchor="end" dx="-6" dy="4">50</text>');
    out.push('<text x="' + (p.x1 - 2) + '" y="' + (p.y0 + 33) + '" font-size="9" fill="#5a6b78" text-anchor="end">信息素浓度 c</text>');
    out.push('<text x="' + p.x0 + '" y="' + (p.y0 + 18) + '" font-size="9" fill="#5a6b78" text-anchor="middle">0</text>');
    out.push('<text x="' + fx(X(30), 1) + '" y="' + (p.y0 + 18) + '" font-size="9" fill="#5a6b78" text-anchor="middle">30</text>');
    out.push('<text x="' + fx(X(60), 1) + '" y="' + (p.y0 + 18) + '" font-size="9" fill="#5a6b78" text-anchor="middle">60</text>');
    out.push('<text x="' + p.x1 + '" y="' + (p.y0 + 18) + '" font-size="9" fill="#5a6b78" text-anchor="middle">100</text>');
    var lx = X(m.c) + 9, anch = "start";
    if (m.c > 65) { lx = X(m.c) - 9; anch = "end"; }
    out.push('<text x="' + fx(lx, 1) + '" y="' + fx(Y(m.attract) - 9, 1) + '" font-size="9.4" font-weight="700" fill="#2f8a5b" text-anchor="' + anch + '">' + fx(m.attract, 1) + ' 只</text>');
    $("gxB").innerHTML = out.join("");
  }

  function stats(m) {
    $("gxVa").textContent = fx(m.c, 0);
    $("gxVb").textContent = fx(m.attract, 1);
    $("gxVc").textContent = fx(m.gain, 1);
    $("gxVs").textContent = m.state;
    $("gxVsn").textContent = m.sn;
    $("gxVs").style.color = m.good ? "#2f8a5b" : "#b8791f";
    var box = $("gxStBox");
    if (box) { box.classList.remove("ok", "warn"); box.classList.add(m.good ? "ok" : "warn"); }
  }

  function render(c) {
    if (!G) { L = layout(); G = geom(); }
    var m = calc(c);
    stage.setAttribute("viewBox", "0 0 " + W + " " + H);
    drawScene(m); drawPlot(m); stats(m);
  }

  function setMode(on) {
    var box = $("gxAp"), txt = $("gxApTxt");
    if (box) { if (on) { box.classList.add("on"); } else { box.classList.remove("on"); } }
    if (txt) { txt.textContent = on ? "自动演示中" : "手动调节"; }
  }

  var ap = null;
  if (window.AutoPilot && typeof window.AutoPilot.create === "function") {
    ap = window.AutoPilot.create({
      mount: stage, follow: sl, loop: LOOP, keys: [0, 30, 60, 100],
      value: 30, min: 0, max: 100, step: 1, idle: 5000,
      onChange: function (v) { render(v); },
      onMode: setMode
    });
  }
  if (!ap) {
    ap = { mode: "auto", stop: function () { this.mode = "idle"; } };
    var t0 = Date.now();
    var tick = function () {
      if (ap.mode !== "auto") return;
      var t = ((Date.now() - t0) / 1000) % 13, i = 0;
      while (i < LOOP.length - 2 && LOOP[i + 1].t <= t) { i++; }
      var a = LOOP[i], b = LOOP[i + 1];
      var k = Math.max(0, Math.min(1, (t - a.t) / Math.max(0.01, b.t - a.t)));
      render(a.v + (b.v - a.v) * k);
      requestAnimationFrame(tick);
    };
    tick();
  }
  window.__ap = ap;

  sl.addEventListener("input", function () { if (ap && ap.stop) { ap.stop(); } setMode(false); render(+sl.value); });
  stage.addEventListener("click", function () {
    var keys = [0, 30, 60, 100], cur = +sl.value, next = 0, i;
    for (i = 0; i < keys.length; i++) { if (keys[i] > cur + 0.5) { next = keys[i]; break; } }
    if (cur >= 99.5) { next = 0; }
    if (ap && ap.stop) { ap.stop(); }
    setMode(false); sl.value = next; render(next);
  });
  var w0 = stage.parentNode ? stage.parentNode.clientWidth : 880;
  window.addEventListener("resize", function () {
    var w = stage.parentNode ? stage.parentNode.clientWidth : 880;
    if ((w >= 640) !== (w0 >= 640)) { G = null; render(+sl.value); }
    w0 = w;
  });

  render(30);
  var M = {
    calc: calc,
    cases: [{ v: 30, eq: { attract: 31.6 } }, { v: 60, eq: { attract: 43.2 } }, { v: 100, eq: { attract: 48.2 } }]
  };
  window.__bio = M;
  window.__model = M;
});

(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var stage = null, sl = null, A = null, B = null, ap = null, G = null, L = null;
  var V = {};
  var KEYS = [0, 20, 50, 80];
  var C = { ok: "#2f8a5b", mid: "#b8791f", bad: "#b8402f", blue: "#2f6f9f", ink: "#151a21", soft: "#6b6257", grid: "#dbe7ef" };

  function calc(h) {
    var g = (50 - h) / 100;
    var st, cls;
    if (h < 50 - 1e-9) { st = "还能增长"; cls = "ok"; }
    else if (h <= 50 + 1e-9) { st = "收支相抵"; cls = "mid"; }
    else { st = "长期会衰退"; cls = "bad"; }
    return { h: h, g: g, n10: 100 * Math.pow(1 + g, 10), state: st, cls: cls };
  }

  function pickL() {
    var w = (stage && stage.getBoundingClientRect().width) || window.innerWidth || 880;
    return w >= 640 ? "W" : "N";
  }
  function geom() {
    if (L === "W") return { w: 880, h: 470, px: 16, py: 16, pw: 848, ph: 438, x0: 118, x1: 800, yTop: 92, yBase: 336, ry: 410, rx0: 160, rx1: 760, tmax: 10 };
    return { w: 360, h: 700, px: 12, py: 12, pw: 336, ph: 676, x0: 66, x1: 332, yTop: 78, yBase: 330, ry: 452, rx0: 56, rx1: 324, tmax: 10 };
  }
  function nice(v) {
    if (!(v > 0)) return 1;
    var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), m = v / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }
  function fmt(n) {
    n = Math.round(n);
    return n >= 10000 ? n.toExponential(2).replace("e+", "e") : String(n);
  }
  function es(c) { return Math.abs(c) < 1e-9 ? "" : (c > 0 ? "+" : ""); }

  function render(h) {
    if (!G) { L = pickL(); G = geom(); }
    var r = calc(h), col = C[r.cls];
    stage.setAttribute("viewBox", "0 0 " + G.w + " " + G.h);

    var i, n = 100, maxN = 100, pts = [], poly = "";
    for (i = 0; i <= G.tmax; i++) {
      n = 100 * Math.pow(1 + r.g, i);
      pts.push(n);
      if (n > maxN) maxN = n;
    }
    var top = nice(maxN * 1.06);
    var X = function (t) { return G.x0 + (G.x1 - G.x0) * t / G.tmax; };
    var Y = function (v) { return G.yBase - (G.yBase - G.yTop) * (v / top); };
    for (i = 0; i < pts.length; i++) poly += (i ? " " : "") + X(i).toFixed(1) + "," + Y(pts[i]).toFixed(1);

    var fs = L === "W" ? 10 : 9.2;
    var s = '<rect x="' + G.px + '" y="' + G.py + '" width="' + G.pw + '" height="' + G.ph + '" rx="14" fill="#f8fbfd" stroke="' + C.grid + '"/>';
    s += '<text x="' + (G.px + 22) + '" y="' + (G.py + 32) + '" font-size="' + (L === "W" ? 13 : 12) + '" font-weight="700" fill="' + C.ink + '">每年捕捞 h = ' + h + '% · 内禀增长率 r = 50%</text>';

    s += '<line x1="' + G.x0 + '" y1="' + G.yBase + '" x2="' + G.x1 + '" y2="' + G.yBase + '" stroke="#c9d4dd"/>';
    s += '<line x1="' + G.x0 + '" y1="' + G.yBase + '" x2="' + G.x0 + '" y2="' + G.yTop + '" stroke="#c9d4dd"/>';

    s += '<line x1="' + G.x0 + '" y1="' + Y(100) + '" x2="' + G.x1 + '" y2="' + Y(100) + '" stroke="#c9d4dd" stroke-dasharray="5 4"/>';
    s += '<text x="' + (G.x0 + 4) + '" y="' + (Y(100) - 5) + '" font-size="' + fs + '" fill="#8a9aa8">起始 100</text>';
    s += '<text x="' + (G.x0 - 6) + '" y="' + (G.yTop + 4) + '" font-size="' + fs + '" fill="' + C.soft + '" text-anchor="end">' + fmt(top) + '</text>';
    s += '<text x="' + (G.x0 - 6) + '" y="' + (G.yBase + 4) + '" font-size="' + fs + '" fill="' + C.soft + '" text-anchor="end">0</text>';
    s += '<text x="' + (G.px + 14) + '" y="' + (G.yTop - 6) + '" font-size="' + fs + '" fill="' + C.soft + '">种群数量（相对值）</text>';

    s += '<text x="' + (G.x0 + 2) + '" y="' + (G.yBase + 20) + '" font-size="' + fs + '" fill="' + C.soft + '">0</text>';
    s += '<text x="' + X(5) + '" y="' + (G.yBase + 20) + '" font-size="' + fs + '" fill="' + C.soft + '" text-anchor="middle">5 年</text>';
    s += '<text x="' + G.x1 + '" y="' + (G.yBase + 20) + '" font-size="' + fs + '" fill="' + C.soft + '" text-anchor="end">10 年</text>';

    s += '<polyline points="' + poly + '" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linejoin="round"/>';
    s += '<circle cx="' + X(G.tmax) + '" cy="' + Y(pts[G.tmax]) + '" r="4" fill="' + col + '"/>';

    var ty = L === "W" ? G.py + 54 : G.py + 40;
    s += '<text x="' + (G.px + G.pw - 20) + '" y="' + ty + '" font-size="' + fs + '" fill="' + col + '" text-anchor="end" font-weight="700">10 年后 ≈ ' + fmt(r.n10) + '</text>';

    var mid = (G.rx0 + G.rx1) / 2, sp = (G.rx1 - G.rx0) / 2;
    s += '<text x="' + G.rx0 + '" y="' + (G.ry - 14) + '" font-size="' + fs + '" fill="' + C.soft + '">g = (50 − h)/100</text>';
    s += '<line x1="' + (mid - sp) + '" y1="' + G.ry + '" x2="' + (mid + sp) + '" y2="' + G.ry + '" stroke="#c9d4dd"/>';
    s += '<line x1="' + (mid - sp) + '" y1="' + G.ry + '" x2="' + mid + '" y2="' + G.ry + '" stroke="' + C.bad + '" stroke-width="2" opacity="0.35"/>';
    s += '<line x1="' + mid + '" y1="' + G.ry + '" x2="' + (mid + sp) + '" y2="' + G.ry + '" stroke="' + C.ok + '" stroke-width="2" opacity="0.35"/>';
    s += '<text x="' + (mid - sp) + '" y="' + (G.ry + 16) + '" font-size="' + fs + '" fill="' + C.soft + '">−0.5</text>';
    s += '<text x="' + mid + '" y="' + (G.ry + 16) + '" font-size="' + fs + '" fill="' + C.soft + '" text-anchor="middle">0</text>';
    s += '<text x="' + (mid + sp) + '" y="' + (G.ry + 16) + '" font-size="' + fs + '" fill="' + C.soft + '" text-anchor="end">+0.5</text>';
    s += '<circle cx="' + (mid + sp * Math.max(-1, Math.min(1, r.g / 0.5))).toFixed(1) + '" cy="' + G.ry + '" r="6" fill="' + col + '"/>';

    if (L === "N") {
      s += '<text x="30" y="' + (G.ry + 56) + '" font-size="11" fill="' + C.ink + '">① h = ' + h + '%</text>';
      s += '<text x="30" y="' + (G.ry + 84) + '" font-size="11" fill="' + C.ink + '">② g = ' + es(r.g) + r.g.toFixed(2) + '</text>';
      s += '<text x="30" y="' + (G.ry + 112) + '" font-size="11" fill="' + C.ink + '">③ 10 年后 ≈ ' + fmt(r.n10) + '</text>';
      s += '<text x="30" y="' + (G.ry + 140) + '" font-size="11" font-weight="700" fill="' + col + '">④ ' + r.state + '</text>';
    }
    A.innerHTML = s;

    B.innerHTML = '<circle cx="' + X(G.tmax) + '" cy="' + Y(pts[G.tmax]) + '" r="9" fill="' + col + '" opacity="0.18"/>';

    V.a.textContent = h + "%";
    V.b.textContent = es(r.g) + r.g.toFixed(2);
    V.c.textContent = fmt(r.n10);
    V.s.textContent = r.state;
    V.sn.textContent = r.g > 0 ? "g > 0，数量上升" : r.g < 0 ? "g < 0，数量下降" : "g = 0，数量稳定";
    V.s.style.color = col;
    V.box.style.borderColor = col;
    return r;
  }

  function setMode(m) {
    var chip = $("gxAp"), txt = $("gxApTxt");
    if (txt) txt.textContent = m === "auto" ? "自动演示中" : "手动调节";
    if (chip) chip.style.opacity = m === "auto" ? "1" : "0.6";
  }

  function boot() {
    stage = $("gxStage"); sl = $("gxSl"); A = $("gxA"); B = $("gxB");
    V.a = $("gxVa"); V.b = $("gxVb"); V.c = $("gxVc"); V.s = $("gxVs"); V.sn = $("gxVsn"); V.box = $("gxStBox");
    if (!stage || !sl || !A || !B) return;

    sl.addEventListener("input", function () {
      render(+sl.value);
      if (ap && ap.stop) ap.stop();
      setMode("manual");
    });
    stage.addEventListener("click", function () {
      var cur = +sl.value, nx = KEYS.filter(function (k) { return k > cur + 0.5; })[0];
      if (nx === undefined) nx = KEYS[0];
      sl.value = nx;
      render(nx);
      if (ap && ap.stop) ap.stop();
      setMode("manual");
    });
    window.addEventListener("resize", function () { G = null; render(+sl.value); });

    render(+sl.value);

    if (typeof AutoPilot !== "undefined" && AutoPilot.create) {
      ap = AutoPilot.create({
        mount: stage, follow: sl, keys: KEYS,
        value: 0, min: 0, max: 80, step: 1, idle: 5000,
        onChange: function (v) { render(+v); },
        onMode: setMode,
        loop: [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 20 }, { t: 6.5, v: 20 }, { t: 9, v: 80 }, { t: 11, v: 50 }, { t: 13, v: 0 }]
      });
      window.__ap = ap;
    } else {
      window.__ap = { stop: function () {} };
    }

    window.__bio = { calc: calc, cases: [
      { v: 20, eq: { g: 0.3 } },
      { v: 50, eq: { g: 0 } },
      { v: 70, eq: { g: -0.2 } }
    ] };
    window.__model = window.__bio;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

document.addEventListener('DOMContentLoaded', function () {
  var stage = document.getElementById('gxStage');
  if (!stage) return;
  var $ = function (id) { return document.getElementById(id); };
  var sl = $('gxSl'), va = $('gxVa'), vb = $('gxVb'), vc = $('gxVc'),
    vs = $('gxVs'), vsn = $('gxVsn'), stBox = $('gxStBox'), apTxt = $('gxApTxt');
  var L = null, G = null, e = 20, ap = null;

  var LOOP = [{ t: 0, v: 0 }, { t: 1.2, v: 0 }, { t: 4, v: 20 }, { t: 6.5, v: 20 },
    { t: 9, v: 100 }, { t: 11, v: 60 }, { t: 13, v: 0 }];
  var KEYS = [0, 20, 60, 100];

  function calc(v) {
    v = Math.max(0, Math.min(100, Number(v) || 0));
    var death = 100 * v / (v + 20);
    var inc = 100 * (v + 10) / (v + 30) - death;
    var t, c, n;
    if (v < 10) { t = '防效不足'; c = '#b8402f'; n = '害虫仍能大量取食'; }
    else if (v < 20) { t = '防效偏低'; c = '#b8791f'; n = '正在接近半最大效应'; }
    else if (v <= 60) { t = '防效明显'; c = '#2f8a5b'; n = '半最大效应附近'; }
    else if (v <= 80) { t = '防效很好'; c = '#2f8a5b'; n = '增量开始变小'; }
    else { t = '接近饱和'; c = '#b8791f'; n = '收益递减'; }
    return { e: v, death: death, inc: inc, state: t, color: c, note: n };
  }

  function dots(cx, cy, rx, ry, n) {
    var s = 97, o = [];
    for (var i = 0; i < n; i++) {
      s = (s * 1103515245 + 12345) % 2147483648;
      var a = (s / 2147483648) * Math.PI * 2;
      s = (s * 1103515245 + 12345) % 2147483648;
      var r = Math.sqrt(s / 2147483648) * 0.86;
      o.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
    }
    return o;
  }

  function geom() {
    var wide = L === 'W', P = { W: wide };
    var gA = $('gxA'), gB = $('gxB');
    if (wide) {
      P.ox = 520; P.oy = 400; P.x1 = 850; P.y1 = 95;
      P.fx = function (v) { return 520 + 3.3 * v; };
      P.fy = function (d) { return 400 - 3.05 * d; };
      P.dots = dots(200, 155, 74, 56, 38);
      P.pest = [[110, 360], [210, 360], [310, 360]];
      P.barX = 40; P.barY = 414; P.barW = 360;
      gA.innerHTML =
        '<rect x="20" y="20" width="400" height="430" rx="12" fill="#f8fbfd" stroke="#dbe7ef"/>' +
        '<text x="40" y="48" font-size="11.5" font-weight="700" fill="#151a21">棉株体内：抗虫基因在表达</text>' +
        '<line x1="200" y1="212" x2="200" y2="292" stroke="#2f8a5b" stroke-width="2"/>' +
        '<ellipse cx="200" cy="155" rx="74" ry="56" fill="#ffffff" stroke="#2f8a5b" stroke-width="1.6"/>' +
        '<path d="M138 150 Q200 172 262 150" fill="none" stroke="#9fd6b4" stroke-width="1.2"/>' +
        '<path d="M160 112 Q200 150 240 112" fill="none" stroke="#9fd6b4" stroke-width="1.2"/>' +
        '<g id="gxPart"></g>' +
        '<text x="40" y="322" font-size="9.6" fill="#5a6673">害虫（取食棉株组织）</text>' +
        '<g id="gxPest"></g>' +
        '<text id="gxBarTxt" x="40" y="404" font-size="9.8" fill="#3a3a35"></text>' +
        '<rect x="40" y="414" width="360" height="12" rx="6" fill="#e6eef4"/>' +
        '<rect id="gxBar" x="40" y="414" width="0" height="12" rx="6" fill="#b8791f"/>' +
        '<text x="40" y="442" font-size="8.8" fill="#7a8794">圆点＝抗虫物质；颗粒越多，表达量越高</text>';
      gB.innerHTML =
        '<rect x="440" y="20" width="420" height="430" rx="12" fill="#f8fbfd" stroke="#dbe7ef"/>' +
        '<text x="460" y="48" font-size="11.5" font-weight="700" fill="#151a21">害虫死亡率随表达量变化</text>' +
        '<line x1="520" y1="95" x2="520" y2="400" stroke="#8aa0b3"/>' +
        '<line x1="520" y1="400" x2="850" y2="400" stroke="#8aa0b3"/>' +
        '<text x="514" y="403" text-anchor="end" font-size="8.6" fill="#7a8794">0</text>' +
        '<text x="514" y="250" text-anchor="end" font-size="8.6" fill="#7a8794">50</text>' +
        '<text x="514" y="99" text-anchor="end" font-size="8.6" fill="#7a8794">100</text>' +
        '<text x="528" y="88" font-size="8.6" fill="#7a8794">死亡率 %</text>' +
        '<text x="520" y="418" text-anchor="middle" font-size="8.6" fill="#7a8794">0</text>' +
        '<text x="586" y="418" text-anchor="middle" font-size="8.6" fill="#7a8794">20</text>' +
        '<text x="652" y="418" text-anchor="middle" font-size="8.6" fill="#7a8794">40</text>' +
        '<text x="718" y="418" text-anchor="middle" font-size="8.6" fill="#7a8794">60</text>' +
        '<text x="784" y="418" text-anchor="middle" font-size="8.6" fill="#7a8794">80</text>' +
        '<text x="850" y="418" text-anchor="middle" font-size="8.6" fill="#7a8794">100</text>' +
        '<text x="850" y="438" text-anchor="end" font-size="8.6" fill="#7a8794">表达量 e</text>' +
        '<line id="gxHalf" x1="520" y1="247.5" x2="850" y2="247.5" stroke="#e2c9a6" stroke-width="1" stroke-dasharray="4 4"/>' +
        '<text x="530" y="241" font-size="8.6" fill="#b8791f">50% 半最大效应</text>' +
        '<path id="gxCurve" fill="none" stroke="#2f8a5b" stroke-width="2.2"/>' +
        '<line id="gxGv" x1="0" y1="0" x2="0" y2="0" stroke="#b8402f" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<line id="gxGh" x1="0" y1="0" x2="0" y2="0" stroke="#b8402f" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<circle id="gxDot" cx="0" cy="0" r="6" fill="#b8402f"/>' +
        '<text id="gxLbl" x="0" y="0" font-size="10" font-weight="700" fill="#b8402f"></text>';
    } else {
      P.ox = 72; P.oy = 650; P.x1 = 330; P.y1 = 400;
      P.fx = function (v) { return 72 + 2.58 * v; };
      P.fy = function (d) { return 650 - 2.5 * d; };
      P.dots = dots(105, 120, 56, 44, 38);
      P.pest = [[70, 268], [150, 268], [230, 268]];
      P.barX = 26; P.barY = 308; P.barW = 308;
      gA.innerHTML =
        '<rect x="10" y="10" width="340" height="330" rx="12" fill="#f8fbfd" stroke="#dbe7ef"/>' +
        '<text x="26" y="38" font-size="10.5" font-weight="700" fill="#151a21">棉株体内：抗虫基因在表达</text>' +
        '<line x1="105" y1="164" x2="105" y2="222" stroke="#2f8a5b" stroke-width="2"/>' +
        '<ellipse cx="105" cy="120" rx="56" ry="44" fill="#ffffff" stroke="#2f8a5b" stroke-width="1.5"/>' +
        '<path d="M58 116 Q105 134 152 116" fill="none" stroke="#9fd6b4" stroke-width="1.1"/>' +
        '<g id="gxPart"></g>' +
        '<text x="26" y="246" font-size="9" fill="#5a6673">害虫（取食棉株组织）</text>' +
        '<g id="gxPest"></g>' +
        '<text id="gxBarTxt" x="26" y="300" font-size="9" fill="#3a3a35"></text>' +
        '<rect x="26" y="308" width="308" height="10" rx="5" fill="#e6eef4"/>' +
        '<rect id="gxBar" x="26" y="308" width="0" height="10" rx="5" fill="#b8791f"/>';
      gB.innerHTML =
        '<rect x="10" y="350" width="340" height="340" rx="12" fill="#f8fbfd" stroke="#dbe7ef"/>' +
        '<text x="26" y="378" font-size="10.5" font-weight="700" fill="#151a21">害虫死亡率随表达量变化</text>' +
        '<line x1="72" y1="400" x2="72" y2="650" stroke="#8aa0b3"/>' +
        '<line x1="72" y1="650" x2="330" y2="650" stroke="#8aa0b3"/>' +
        '<text x="66" y="653" text-anchor="end" font-size="8.2" fill="#7a8794">0</text>' +
        '<text x="66" y="528" text-anchor="end" font-size="8.2" fill="#7a8794">50</text>' +
        '<text x="66" y="403" text-anchor="end" font-size="8.2" fill="#7a8794">100</text>' +
        '<text x="72" y="668" text-anchor="middle" font-size="8.2" fill="#7a8794">0</text>' +
        '<text x="124" y="668" text-anchor="middle" font-size="8.2" fill="#7a8794">20</text>' +
        '<text x="175" y="668" text-anchor="middle" font-size="8.2" fill="#7a8794">40</text>' +
        '<text x="227" y="668" text-anchor="middle" font-size="8.2" fill="#7a8794">60</text>' +
        '<text x="278" y="668" text-anchor="middle" font-size="8.2" fill="#7a8794">80</text>' +
        '<text x="330" y="668" text-anchor="middle" font-size="8.2" fill="#7a8794">100</text>' +
        '<text x="330" y="684" text-anchor="end" font-size="8.2" fill="#7a8794">表达量 e</text>' +
        '<line id="gxHalf" x1="72" y1="525" x2="330" y2="525" stroke="#e2c9a6" stroke-width="1" stroke-dasharray="4 4"/>' +
        '<text x="80" y="519" font-size="8.2" fill="#b8791f">50% 半最大效应</text>' +
        '<path id="gxCurve" fill="none" stroke="#2f8a5b" stroke-width="2"/>' +
        '<line id="gxGv" x1="0" y1="0" x2="0" y2="0" stroke="#b8402f" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<line id="gxGh" x1="0" y1="0" x2="0" y2="0" stroke="#b8402f" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<circle id="gxDot" cx="0" cy="0" r="5" fill="#b8402f"/>' +
        '<text id="gxLbl" x="0" y="0" font-size="9" font-weight="700" fill="#b8402f"></text>';
    }
    var d = '', i, ev, dv;
    for (i = 0; i <= 50; i++) {
      ev = i * 2; dv = 100 * ev / (ev + 20);
      d += (i ? 'L' : 'M') + P.fx(ev).toFixed(1) + ' ' + P.fy(dv).toFixed(1);
    }
    $('gxCurve').setAttribute('d', d);
    P.curve = $('gxCurve'); P.dot = $('gxDot'); P.gv = $('gxGv'); P.gh = $('gxGh');
    P.lbl = $('gxLbl'); P.part = $('gxPart'); P.pestG = $('gxPest');
    P.bar = $('gxBar'); P.barTxt = $('gxBarTxt'); P.half = $('gxHalf');
    return P;
  }

  function render() {
    if (!G) { L = (stage.getBoundingClientRect().width || 880) >= 640 ? 'W' : 'N'; G = geom(); }
    var r = calc(e), P = G, i, s = '';
    va.textContent = Math.round(r.e);
    vb.textContent = r.death.toFixed(1);
    vc.textContent = r.inc.toFixed(1);
    vs.textContent = r.state;
    vsn.textContent = r.note;
    vs.style.color = r.color;

    var px = P.fx(r.e), py = P.fy(r.death);
    P.dot.setAttribute('cx', px.toFixed(1)); P.dot.setAttribute('cy', py.toFixed(1));
    P.dot.setAttribute('fill', r.color);
    P.gv.setAttribute('x1', px.toFixed(1)); P.gv.setAttribute('x2', px.toFixed(1));
    P.gv.setAttribute('y1', py.toFixed(1)); P.gv.setAttribute('y2', P.oy);
    P.gh.setAttribute('x1', P.ox); P.gh.setAttribute('x2', px.toFixed(1));
    P.gh.setAttribute('y1', py.toFixed(1)); P.gh.setAttribute('y2', py.toFixed(1));
    var right = px > P.x1 - 90;
    P.lbl.setAttribute('x', (right ? px - 10 : px + 10).toFixed(1));
    P.lbl.setAttribute('y', (py - 12).toFixed(1));
    P.lbl.setAttribute('text-anchor', right ? 'end' : 'start');
    P.lbl.textContent = 'e=' + Math.round(r.e) + ' → ' + r.death.toFixed(1) + '%';

    var n = Math.round(r.e / 100 * P.dots.length);
    for (i = 0; i < n; i++) {
      s += '<circle cx="' + P.dots[i][0].toFixed(1) + '" cy="' + P.dots[i][1].toFixed(1) +
        '" r="2.3" fill="#b8791f" opacity="0.82"/>';
    }
    P.part.innerHTML = s;

    var dead = r.death >= 70 ? 3 : (r.death >= 35 ? 2 : (r.death >= 12 ? 1 : 0));
    s = '';
    for (i = 0; i < 3; i++) {
      var x = P.pest[i][0], y = P.pest[i][1], alive = i >= dead;
      var col = alive ? '#7a5a2f' : '#c3ccd4';
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="7" ry="5" fill="' + col + '"/>' +
        '<circle cx="' + (x - 8) + '" cy="' + (y - 1) + '" r="3" fill="' + col + '"/>' +
        '<line x1="' + (x - 10) + '" y1="' + (y - 4) + '" x2="' + (x - 14) + '" y2="' + (y - 8) + '" stroke="' + col + '" stroke-width="1"/>' +
        '<line x1="' + (x - 10) + '" y1="' + (y + 2) + '" x2="' + (x - 14) + '" y2="' + (y + 6) + '" stroke="' + col + '" stroke-width="1"/>';
      if (!alive) {
        s += '<line x1="' + (x - 4) + '" y1="' + (y - 4) + '" x2="' + (x + 6) + '" y2="' + (y + 6) + '" stroke="#b8402f" stroke-width="1.4"/>' +
          '<line x1="' + (x + 6) + '" y1="' + (y - 4) + '" x2="' + (x - 4) + '" y2="' + (y + 6) + '" stroke="#b8402f" stroke-width="1.4"/>';
      }
    }
    P.pestG.innerHTML = s;

    P.bar.setAttribute('width', (P.barW * r.e / 100).toFixed(1));
    P.barTxt.textContent = '抗虫基因表达量 e = ' + Math.round(r.e) + ' / 100（相对单位）';
  }

  function setMode(m) {
    if (!apTxt) return;
    apTxt.textContent = (m === 'manual') ? '手动拖动中' : '自动演示中';
    var box = $('gxAp');
    if (box) box.style.opacity = (m === 'manual') ? '0.55' : '1';
  }

  function setV(v) {
    e = Math.max(0, Math.min(100, Math.round(v)));
    sl.value = e;
    render();
  }

  function interp(t) {
    var i, a, b;
    for (i = 1; i < LOOP.length; i++) {
      if (t <= LOOP[i].t) {
        a = LOOP[i - 1]; b = LOOP[i];
        var k = (t - a.t) / Math.max(0.001, b.t - a.t);
        return a.v + (b.v - a.v) * k;
      }
    }
    return LOOP[LOOP.length - 1].v;
  }

  function manualAP() {
    var vt = 0, last = performance.now() / 1000, lastInput = -99, id = null, on = true;
    function tick() {
      if (!on) return;
      var now = performance.now() / 1000, dt = Math.min(0.1, now - last);
      last = now;
      if (now - lastInput > 5) vt += dt;
      var t = vt % 13;
      setV(interp(t));
      id = requestAnimationFrame(tick);
    }
    id = requestAnimationFrame(tick);
    return {
      manual: true,
      pause: function () { on = false; if (id) cancelAnimationFrame(id); id = null; setMode('manual'); },
      play: function () { if (!on || !id) { on = true; last = performance.now() / 1000; lastInput = -99; id = requestAnimationFrame(tick); } },
      stop: function () { on = false; if (id) cancelAnimationFrame(id); id = null; },
      key: function (v) { lastInput = performance.now() / 1000; setV(v); }
    };
  }

  function boot() {
    var opts = {
      mount: stage, follow: sl, loop: LOOP, keys: KEYS,
      value: 20, min: 0, max: 100, step: 1, idle: 5000,
      onChange: function (v) { setV(v); },
      onMode: function (m) { setMode(m); }
    };
    try {
      if (window.AutoPilot && typeof window.AutoPilot.create === 'function') {
        ap = window.AutoPilot.create(opts);
      }
    } catch (err) { ap = null; }
    if (!ap) { ap = manualAP(); setMode('auto'); }
    window.__ap = ap;
    var startTxt = va.textContent;
    setTimeout(function () {
      if (va.textContent === startTxt) {
        try { if (ap && ap.pause) ap.pause(); } catch (e2) { }
        ap = manualAP();
        setMode('auto');
        window.__ap = ap;
      }
    }, 2000);
  }

  sl.addEventListener('input', function () {
    setV(sl.value);
    setMode('manual');
    if (ap && ap.key) { ap.key(Number(sl.value)); }
    else if (ap && ap.pause) { try { ap.pause(); } catch (e3) { } }
  });
  stage.addEventListener('click', function () {
    var cur = Number(sl.value), next = KEYS[0];
    for (var i = 0; i < KEYS.length; i++) { if (KEYS[i] > cur) { next = KEYS[i]; break; } }
    setV(next);
    if (ap && ap.key) ap.key(next);
  });

  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth;
    var nl = (stage.getBoundingClientRect().width || 880) >= 640 ? 'W' : 'N';
    if (nl !== L) { L = nl; G = null; render(); }
  });

  render();
  boot();

  window.__bio = {
    calc: calc,
    cases: [
      { v: 20, eq: { death: 50 } },
      { v: 80, eq: { death: 80 } },
      { v: 5, eq: { death: 20 } }
    ]
  };
});

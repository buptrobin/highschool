(function () {
var $ = function (id) { return document.getElementById(id); };
var G = null, L = null, ap = null, stage, slider, box, va, vb, vc, vs, vsn, apTxt;
var val = 5, mode = "auto", idleT = null, tickT = null, t0 = 0;
var LOOP = [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 5 }, { t: 6.5, v: 5 }, { t: 9, v: 7 }, { t: 11, v: 6 }, { t: 13, v: 1 }];
var SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function calc(d) {
var col = 10000000 / Math.pow(10, d);
return { col: col, ok: col >= 30 && col <= 300 ? 1 : 0, d: d, dil: Math.pow(10, d) };
}
function sup(n) { return String(Math.round(n)).split("").map(function (c) { return SUP[+c]; }).join(""); }
function fmt(n) { return String(Math.round(n)); }
function layout() { return { W: 880, H: 470 }; }
function geom() { return { cx: 212, cy: 250, x0: 440, x1: 820, step: 52 }; }
function stateOf(col) {
if (col > 300) return { k: "菌落太多", s: "连成一片，数不清", c: "#b8402f", bg: "#fff6f4" };
if (col >= 30) return { k: "可数区间", s: "30–300，适合计数", c: "#2f8a5b", bg: "#f0f9f4" };
return { k: "菌落太少", s: "误差大，需减少稀释", c: "#b8791f", bg: "#fffaf0" };
}
function render(d) {
if (!G) { L = layout(); G = geom(); }
var r = calc(d), col = r.col, st = stateOf(col), c = st.c;
var n = Math.min(280, Math.max(1, Math.round(col))), dots = "";
for (var i = 0; i < n; i++) {
var rad = 104 * Math.sqrt((i + 0.5) / n), ang = i * 2.399963;
dots += '<circle cx="' + (G.cx + rad * Math.cos(ang)).toFixed(1) + '" cy="' + (G.cy + rad * Math.sin(ang)).toFixed(1) + '" r="2.3" fill="' + c + '" opacity="0.72"/>';
}
$("gxA").innerHTML =
'<rect x="8" y="8" width="864" height="454" rx="14" fill="#f8fbfd" stroke="#dbe7ef"/>' +
'<rect x="24" y="66" width="376" height="382" rx="12" fill="#ffffff" stroke="#e3edf3"/>' +
'<text x="212" y="94" text-anchor="middle" font-size="13" font-weight="700" fill="#151a21">平板上的菌落（示意）</text>' +
'<text x="212" y="118" text-anchor="middle" font-size="9.4" fill="#5b6670">每个小圆点代表一个菌落</text>' +
'<circle cx="212" cy="250" r="116" fill="#fbfdfe" stroke="#c9d6df" stroke-width="1.5"/>' +
'<circle cx="212" cy="250" r="106" fill="#ffffff" stroke="#e3edf3"/>' + dots +
'<text x="212" y="406" text-anchor="middle" font-size="12" font-weight="700" fill="' + c + '">每板 ≈ ' + fmt(col) + ' 个菌落</text>' +
'<text x="212" y="428" text-anchor="middle" font-size="9.2" fill="#5b6670">原始菌液 10⁷ 个/mL · 稀释 10' + sup(d) + ' 倍</text>';
var bandX = G.x0 + Math.log10(30) * G.step;
var bandW = (Math.log10(300) - Math.log10(30)) * G.step;
var mx = Math.min(G.x1, Math.max(G.x0, G.x0 + Math.log10(col) * G.step));
var gauge =
'<rect x="420" y="66" width="436" height="382" rx="12" fill="#ffffff" stroke="#e3edf3"/>' +
'<text x="440" y="94" font-size="12" font-weight="700" fill="#151a21">每板菌落数（个，对数刻度）</text>' +
'<rect x="' + bandX.toFixed(1) + '" y="150" width="' + bandW.toFixed(1) + '" height="210" fill="#e8f6ee" stroke="#b8e6d0"/>' +
'<text x="' + (bandX + bandW / 2).toFixed(1) + '" y="144" text-anchor="middle" font-size="8.8" fill="#2f8a5b">30–300</text>' +
'<line x1="440" y1="360" x2="820" y2="360" stroke="#9fb0bc"/>' +
'<line x1="' + mx.toFixed(1) + '" y1="160" x2="' + mx.toFixed(1) + '" y2="360" stroke="' + c + '" stroke-width="1.4" stroke-dasharray="4 3"/>' +
'<circle cx="' + mx.toFixed(1) + '" cy="360" r="5" fill="' + c + '"/>' +
'<text x="' + mx.toFixed(1) + '" y="128" text-anchor="middle" font-size="9.4" font-weight="700" fill="' + c + '">' + fmt(col) + ' 个</text>' +
'<text x="440" y="432" font-size="9.2" fill="' + c + '">' + st.s + '</text>';
for (var k = 0; k <= 7; k++) {
var tx = G.x0 + k * G.step;
gauge += '<line x1="' + tx + '" y1="356" x2="' + tx + '" y2="366" stroke="#9fb0bc"/>' +
'<text x="' + tx + '" y="384" text-anchor="middle" font-size="8.6" fill="#5b6670">' + (k === 0 ? "1" : "10" + (k === 1 ? "" : sup(k))) + '</text>';
}
$("gxB").innerHTML = gauge;
va.textContent = d; vb.textContent = fmt(col); vc.textContent = "10" + sup(d);
vs.textContent = st.k; vsn.textContent = st.s; vs.style.color = c;
box.style.background = st.bg; box.style.borderColor = c;
if (ap) ap.value = d;
}
function setMode(m) {
mode = m; if (ap) ap.mode = m;
if (apTxt) apTxt.textContent = m === "auto" ? "自动演示中" : "手动调节";
}
function setVal(v) { val = v; slider.value = Math.round(v); render(Math.round(v)); }
function sample(t) {
for (var i = 0; i < LOOP.length - 1; i++) {
var a = LOOP[i], b = LOOP[i + 1];
if (t >= a.t && t <= b.t) return a.v + (b.v - a.v) * (t - a.t) / (b.t - a.t);
}
return LOOP[LOOP.length - 1].v;
}
function tick() { setVal(sample(((Date.now() - t0) / 1000) % 13)); }
function startAuto() {
clearTimeout(idleT); if (tickT) clearInterval(tickT);
t0 = Date.now(); setMode("auto"); tickT = setInterval(tick, 60);
}
function stopAuto() {
if (tickT) { clearInterval(tickT); tickT = null; }
clearTimeout(idleT); setMode("manual"); idleT = setTimeout(startAuto, 4500);
}
function boot() {
stage = $("gxStage"); slider = $("gxSl"); box = $("gxStBox");
va = $("gxVa"); vb = $("gxVb"); vc = $("gxVc"); vs = $("gxVs"); vsn = $("gxVsn"); apTxt = $("gxApTxt");
if (!stage || !slider) return;
ap = { mode: "auto", value: 5, min: 1, max: 7, step: 1,
stop: stopAuto, start: startAuto, set: function (v) { stopAuto(); setVal(+v); } };
window.__ap = ap;
setVal(5);
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) { setMode("manual"); return; }
startAuto();
slider.addEventListener("input", function () { stopAuto(); setVal(+slider.value); });
stage.addEventListener("click", function () {
stopAuto();
var keys = [1, 5, 6, 7], cur = Math.round(val), nxt = keys[0];
for (var i = 0; i < keys.length; i++) { if (keys[i] > cur) { nxt = keys[i]; break; } }
setVal(nxt);
});
}
window.__bio = { calc: calc, cases: [{ v: 5, eq: { col: 100 } }, { v: 6, eq: { col: 10 } }, { v: 7, eq: { col: 1 } }] };
window.__model = window.__bio;
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();

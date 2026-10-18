/* 页面自报的数值断言：每页把 __bio.cases 写成「参数值 → 该参数下应有的数值」，
   与教材/公式的真值对账。这里只负责跑和比对，不改页面。 */
(function () {
  var b = window.__bio;
  var out = { cases: [], has: !!b };
  if (!b || typeof b.calc !== 'function') return { cases: [], has: false, miss: 'no __bio.calc' };
  if (!b.cases || !b.cases.length) return { cases: [], has: true, miss: 'empty cases' };
  for (var i = 0; i < b.cases.length; i++) {
    var c = b.cases[i], got = null, row = { v: c.v, ok: true, bad: [] };
    try { got = b.calc(c.v); } catch (e) { row.ok = false; row.bad.push('calc 抛错: ' + e.message); out.cases.push(row); continue; }
    for (var k in c.eq) {
      var e = c.eq[k], g = got ? got[k] : NaN;
      var tol = Math.max(0.06 * Math.abs(e), 0.06);
      if (typeof g !== 'number' || !isFinite(g) || Math.abs(g - e) > tol) {
        row.ok = false;
        row.bad.push(k + ':' + (typeof g === 'number' ? +g.toFixed(3) : g) + ' ≠ ' + e);
      }
    }
    out.cases.push(row);
  }
  return out;
})()

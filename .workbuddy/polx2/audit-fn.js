/* 页面结构 / SVG 几何 / 溢出 体检：在页面里执行，返回一个可 JSON 化的对象。
   约定（每页都必须满足）：
     .gx-sec × 6、figure.gx-fig ≥ 4、#gxSteps .step 3–6、.gx-qa .qac ≥ 5、.gx-errs .er ≥ 5
     #gxStage（互动画布）+ #gxSl（滑块）+ .gx-ap（Autopilot 状态徽标）
     svg 内 <text> 不得越出 viewBox，两个 <text> 的包围盒不得重叠超过 28%
*/
(function () {
  var A = { w: innerWidth, err: [] };
  var doc = document.documentElement;
  A.overflow = doc.scrollWidth - innerWidth;
  var c = document.getElementById('content');
  A.len = c ? (c.textContent || '').replace(/\s+/g, '').length : 0;
  A.secs = document.querySelectorAll('.gx-sec').length;
  A.figs = document.querySelectorAll('figure.gx-fig').length;
  A.steps = document.querySelectorAll('#gxSteps .step').length;
  A.qa = document.querySelectorAll('.gx-qa .qac').length;
  A.errs = document.querySelectorAll('.gx-errs .er').length;
  A.boards = document.querySelectorAll('.gx-board svg').length;
  A.quiz = document.querySelectorAll('.gx-quiz .qbtn').length;
  A.quizOut = !!document.querySelector('.gx-quiz .qout');
  var badge = document.querySelector('.gx-ap');
  A.badge = badge ? badge.textContent.replace(/\s+/g, '') : null;
  A.hasAP = !!badge;

  var svgs = document.querySelectorAll('#content svg');
  A.svgN = svgs.length;
  for (var i = 0; i < svgs.length; i++) {
    var s = svgs[i];
    var vb = (s.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number);
    if (vb.length !== 4 || !isFinite(vb[2]) || !isFinite(vb[3])) { A.err.push('svg' + i + ':badViewBox'); continue; }
    var sr = s.getBoundingClientRect();
    if (!sr.width || !sr.height) continue;
    var texts = s.querySelectorAll('text');
    var rects = [];
    for (var j = 0; j < texts.length; j++) {
      var t = texts[j];
      if (!t.textContent.trim()) continue;
      var rb = t.getBoundingClientRect();
      if (rb.width < 0.6 || rb.height < 0.6) continue;
      var out = Math.max(sr.left - rb.left, rb.right - sr.right, sr.top - rb.top, rb.bottom - sr.bottom);
      if (out > 6) {
        A.err.push('svg' + i + ':clip:' + t.textContent.slice(0, 14) + ':' + Math.round(out));
      }
      rects.push([rb, t.textContent.slice(0, 12)]);
    }
    for (var p = 0; p < rects.length; p++) {
      for (var q = p + 1; q < rects.length; q++) {
        var a = rects[p][0], b = rects[q][0];
        var ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        var oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 1 && oy > 1) {
          var area = ox * oy, mn = Math.min(a.width * a.height, b.width * b.height);
          if (area / mn > 0.28) A.err.push('svg' + i + ':overlap:' + rects[p][1] + '|' + rects[q][1]);
        }
      }
    }
  }
  return A;
})()

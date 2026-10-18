// 清掉 pol1 里残留的「选择性必修3 / 生物」字样，并把出处口径改成政治必修1
import { readFileSync, writeFileSync } from 'node:fs';

const edits = [
  ['.workbuddy/pol1/PAGE-RULES.md', [
    ['# 单页施工规则（政治选择性必修3 讲义）', '# 单页施工规则（政治必修1 中国特色社会主义 讲义）'],
  ]],
  ['.workbuddy/pol1/split-spec.mjs', [
    ['出处一律写「人教版（2019）选择性必修3 · 第X章第Y节」', '出处一律写「人教版（2019）必修1 中国特色社会主义 · 第X课第Y框」'],
    ['- 六区块 id 固定 a–f，顺序固定。', '- 六区块 id 固定 a–f，顺序固定。\n- 政治讲义的「四图」可以是漫画式的示意图（箭头、结构块、时间轴），不要求数据图。'],
  ]],
];

for (const [p, pairs] of edits) {
  let t = readFileSync(p, 'utf8');
  for (const [a, b] of pairs) {
    if (!t.includes(a)) console.log(`⚠ ${p} 找不到：${a.slice(0, 30)}`);
    t = t.split(a).join(b);
  }
  writeFileSync(p, t);
}
console.log('pol1 文案已修正');

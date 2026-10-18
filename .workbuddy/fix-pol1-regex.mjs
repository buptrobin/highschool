// 修 pol1/build-page.mjs 的章节正则（政治用「课 / 框」，不是「章 / 节」）
import { readFileSync, writeFileSync } from 'node:fs';

const p = '.workbuddy/pol1/build-page.mjs';
let t = readFileSync(p, 'utf8');
const before = t;

t = t.split('第\\d+章').join('第[一二三四五六七八九十]+课');
t = t.split('第\\d+节').join('第[一二三四五六七八九十]+框');

writeFileSync(p, t);
console.log(before === t ? '没改到' : '已改');
for (const line of t.split('\n')) {
  if (line.includes('line.match')) console.log(line.trim().slice(0, 120));
}

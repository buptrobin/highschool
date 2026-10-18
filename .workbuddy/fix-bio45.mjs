// 修两处静态检查失败：
// 1) xx2-c4-s1：B 区漏了 </section>
// 2) xx3-c1-s2：AutoPilot 的 loop 用了 [[0,1],…] 数组，静态检查只认 [{t,v},…]
import { readFileSync, writeFileSync } from 'node:fs';

// --- 1 ---
const p1 = '.workbuddy/bio4/parts/xx2-c4-s1.html';
let t1 = readFileSync(p1, 'utf8');
const before = (t1.match(/<section/g) || []).length;
const closing = (t1.match(/<\/section>/g) || []).length;
if (before > closing) {
  const anchor = '<section class="gx-sec" id="c">';
  const i = t1.indexOf(anchor);
  if (i < 0) throw new Error('找不到 id="c" 的 section');
  t1 = t1.slice(0, i) + '</section>\n\n' + t1.slice(i);
  writeFileSync(p1, t1);
}
console.log('xx2-c4-s1 section:', (t1.match(/<section/g) || []).length, (t1.match(/<\/section>/g) || []).length);

// --- 2 ---
const p2 = '.workbuddy/bio5/parts/xx3-c1-s2.js';
let t2 = readFileSync(p2, 'utf8');
t2 = t2.replace(/var LOOP = \[\[0, 1\], \[1\.2, 1\], \[4, 5\], \[6\.5, 5\], \[9, 7\], \[11, 6\], \[13, 1\]\];/,
  'var LOOP = [{ t: 0, v: 1 }, { t: 1.2, v: 1 }, { t: 4, v: 5 }, { t: 6.5, v: 5 }, { t: 9, v: 7 }, { t: 11, v: 6 }, { t: 13, v: 1 }];');
t2 = t2.replace(/var a = LOOP\[i\], b = LOOP\[i \+ 1\];/, 'var a = LOOP[i], b = LOOP[i + 1];');
t2 = t2.replace(/return LOOP\[LOOP\.length - 1\]\[1\];/, 'return LOOP[LOOP.length - 1].v;');
t2 = t2.replace(/LOOP\[i\]\[1\]/g, 'LOOP[i].v').replace(/LOOP\[i \+ 1\]\[1\]/g, 'LOOP[i + 1].v');
writeFileSync(p2, t2);
console.log('xx3-c1-s2 loop 帧:', (t2.match(/\{\s*t:\s*[\d.]+,\s*v:/g) || []).length);

// 顺带检查插值里是否还有 LOOP[i][0] / LOOP[i][1] 之类残留
const left = t2.match(/LOOP\[[^\]]+\]\[[01]\]/g);
console.log('残留数组下标:', left ? left.join(',') : '无');

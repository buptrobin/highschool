// 修正政治规格里的一处硬伤：旧民主主义革命与新民主主义革命「性质相同」
// （都是反帝反封建的资产阶级民主革命），差别在领导阶级与前途，不是「性质不同」。
import { readFileSync, writeFileSync } from 'node:fs';

const OLD = '✗ 旧民主主义革命和新民主主义革命性质相同';
const NEW = '✗ 新旧民主主义革命性质相同所以没有本质区别';
const FIX = '✗ 新旧民主主义革命性质相同，所以没有本质区别（性质确实相同，但领导阶级和前途不同，这就是本质区别）';

for (const p of ['.workbuddy/pol1/SPEC.md', '.workbuddy/pol1/spec/bx1-c2-s1.md']) {
  let t = readFileSync(p, 'utf8');
  if (!t.includes(OLD)) {
    console.log(`⚠ ${p} 没找到待改句`);
    continue;
  }
  t = t.split(OLD).join(FIX);
  // 同时把「三个扣分点」里那句也补一句说明，避免子代理再按错口径写
  t = t.split('**三个扣分点**：**1919 五四运动是开端**').join(
    '**三个扣分点**（注：新旧民主主义革命**性质相同**，都是反帝反封建的资产阶级民主革命，区别在领导阶级与前途）：**1919 五四运动是开端**',
  );
  writeFileSync(p, t);
  console.log(`${p} 已改`);
}

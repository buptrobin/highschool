/* 把 SPEC.md 按 “## bx1-…” 拆成一节一个文件，供子代理只读自己那一节。
   用法：node .workbuddy/bio1/split-spec.mjs */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const src = readFileSync(new URL('./SPEC.md', import.meta.url), 'utf8');
const dir = new URL('./spec/', import.meta.url);
if (!existsSync(dir)) mkdirSync(dir);

const head = src.split(/\n## bx1-/)[0];
const blocks = src.split(/\n(?=## bx1-)/).filter((s) => s.startsWith('## bx1-'));

for (const b of blocks) {
  const m = b.match(/## (bx1-[a-z0-9-]+)/);
  if (!m) continue;
  const body = `# 本节规格（只读这一节，不要读 SPEC.md 全文）\n\n${b.trim()}\n\n---\n\n## 通用约定（所有页一致）\n\n- 出处一律写「人教版（2019）必修1 · 第X章第Y节」，不写页码。\n- 六区块 id 固定 a–f，顺序固定。\n- 数值卡最后一个必须是「状态判断」，配色：绿=正常 #2f8a5b，琥珀=偏离 #b8791f，红=失活/危险 #b8402f。\n- 页脚写公式与端点，标注哪些是示意值。\n- 禁用语：简单来说 / 众所周知 / 其实很简单 / 只要记住。\n`;
  writeFileSync(new URL(`${m[1]}.md`, dir), body, 'utf8');
}
console.log(`${blocks.length} sections written`);

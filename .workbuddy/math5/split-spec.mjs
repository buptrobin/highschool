/* 把 SPEC.md 按 “## xx3-…” 拆成一节一个文件，供子代理只读自己那一节。
   用法：node .workbuddy/math5/split-spec.mjs */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const src = readFileSync(new URL('./SPEC.md', import.meta.url), 'utf8');
const dir = new URL('./spec/', import.meta.url);
if (!existsSync(dir)) mkdirSync(dir);

const blocks = src.split(/\n(?=## xx3-)/).filter((s) => s.startsWith('## xx3-'));

for (const b of blocks) {
  const m = b.match(/## (xx3-[a-z0-9-]+)/);
  if (!m) continue;
  const body = `# 本节规格（只读这一节，不要读 SPEC.md 全文）

${b.trim()}

---

## 通用约定（所有页一致）

- 出处一律写「人教A版选择性必修第三册 · 第X章第Y节」，**不写页码**。
- 六区块 id 固定 a–f，顺序固定：A 课本怎么说 / B 拆开看 / C 自己拖一下 / D 一道题走一遍 / E 会怎么考 / F 易错清单。
- 公式统一用 \`<span class="gx-fml">…</span>\`；行内符号用 Unicode（√ ² ³ · × ∠ ∥ ⊥ π θ λ μ ≠ ≤ ≥ ⇒ ⇔）。不用 MathJax、不用 \`<sub>\`/\`<sup>\`。
- 数值卡最后一个必须是「状态判断」，配色：蓝=主 #2563eb，绿=正常 #2f8a5b，琥珀=临界 #b8791f，红=错误/危险 #b8402f。
- 页脚写互动模型公式与端点，标注哪些是示意值。
- 断言挂在 \`window.__model = {calc, cases}\`（**不是** \`__bio\`）。
- 禁用语：简单来说 / 众所周知 / 其实很简单 / 只要记住。
- 禁止写「请拖动滑块」——自动演示时滑块的圆点会自己动，这才是提示。
`;
  writeFileSync(new URL(`${m[1]}.md`, dir), body, 'utf8');
}
console.log(`${blocks.length} sections written`);

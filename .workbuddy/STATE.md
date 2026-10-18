# 会话状态（压缩存档 · 2026-10-19）

## 目标

按 `/eli5-high` skill 给北京高中各册教材做单页图解讲义，**一节一页**，写进已有的占位页。
读者设定：基础一般，要好懂、好记、能答题。

## 仓库

`C:\wangxp\mygit\highschool`（静态站，零依赖，单文件页）。
页面：`pages/<学科>/<slug>.html`；占位页已存在，只写正文。
共建产物都在 `.workbuddy/<册>/`。

## 已完成（全部静态 + 全量体检 PASS，均已提交）

| 学科 | 册 | 页数 | 页目录 | 施工件 | commit |
|---|---|---|---|---|---|
| 数学 | 必修第一册 | 24 | pages/math/bx1-* | .workbuddy/math1 | 0852536 |
| 数学 | 必修第二册 | 19 | pages/math/bx2-* | .workbuddy/math2 | 79721ae |
| 数学 | 选择性必修第一册 | 12 | pages/math/xx1-* | .workbuddy/math3 | 022b135 |
| 数学 | 选择性必修第二册 | 7 | pages/math/xx2-* | .workbuddy/math4 | 6609ab5 |
| 数学 | 选择性必修第三册 | 11 | pages/math/xx3-* | .workbuddy/math5 | 56bbad2 |
| 生物 | 必修1 分子与细胞 | 18 | pages/bio/bx1-* | .workbuddy/bio1 | a7dc522 |
| 生物 | 必修2 遗传与进化 | 18 | pages/bio/bx2-* | .workbuddy/bio2 | 2c04bc1 |
| 生物 | 选择性必修1 稳态与调节 | 18 | pages/bio/xx1-* | .workbuddy/bio3 | 4f2aeed |
| 生物 | 选择性必修2 生物与环境 | 14 | pages/bio/xx2-* | .workbuddy/bio4 | 6750823 |
| 生物 | 选择性必修3 生物技术与工程 | 13 | pages/bio/xx3-* | .workbuddy/bio5 | 6750823 |
| 政治 | 必修1 中国特色社会主义 | 9 | pages/pol/bx1-* | .workbuddy/pol1 | 3858dd2 |

合计 **164 页**（数学 73 / 生物 82 / 政治 9）。

## 未开始（占位页都在）

- 政治 bx2 经济与社会（17 页占位）、bx3 政治与法治（24）、bx4 哲学与文化（24）
- 政治选择性必修 xx1/xx2/xx3
- 地理 `pages/geo/`（`content/geo.txt`）

## 每页的固定结构（六区块，id a–f）

1. **A 课本怎么说**：2–3 个 `.gx-quote`（照抄教材原话）+ 1 张 `.gx-cmp` 表（只高亮 1 行 `tr.key`）+ `.gx-note`
2. **B 拆开看**：4 张 `figure.gx-fig`，每张 `.fig-cap` + `.fig-s`（2–3 行）+ `.gx-svgbox`（svg + 点击放大）+ `.gx-take`
3. **C 自己拖一下**：1 个互动（滑块 + 4 张 `.st` 数值卡，末张是状态判断）+ Autopilot 自走
4. **D 一道题走一遍**：5 步 `li.step`（首步不 hidden）+ `.ans` 可抄答案
5. **E 考你会怎么考**：6 个 `.qac`（每个配 240×132 迷你 svg）
6. **F 易错清单**：7 条 `.er`（✗ / ✓ / 错在哪）

## 施工流水线（每册一套，复制工作区即可）

```bash
# 1. 写 SPEC.md（每节：课本原话 / 三个扣分点 / 四图 / 互动模型+公式+cases / 停留帧 / 例题 / 六问 / 易错）
node .workbuddy/<册>/split-spec.mjs          # 拆成一节一个 spec
# 2. 子代理写片段（并发 ≤3）：parts/<slug>.html（分 P1/P2/P3 三次写）+ parts/<slug>.js
node .workbuddy/<册>/build-page.mjs <slug>   # 拼外壳 → pages/<学科>/<slug>.html
node .workbuddy/<册>/audit.mjs pages/<学科>/<slug>.html   # 单页体检
node .workbuddy/<册>/static.mjs              # 全册静态检查
node .workbuddy/<册>/audit-all.mjs           # 全量体检（后台跑，尾行自动清 Chrome 临时目录）
```

体检内容：5 个宽度（360/390/768/1024/1440）横向溢出 = 0、DOM 结构计数、SVG 裁切/重叠、
Autopilot 三态（auto → 点击 manual → 5.6s 回 auto）、`__model.cases`（6% 容差）、reduced-motion 必须 manual。
PASS 行长这样：`PASS  bio/bx2-c1-s1.html  (28s)  溢出 360:0 390:0 768:0 1024:0 1440:0`

## 子代理提示词模板（已验证）

给每页一段，只读 3–4 个小文件（PAGE-RULES、parts/_CONTENT.html、parts/_SCRIPT.js、spec/<slug>.md），
明确「读完立刻写，不要复述、不要写计划、不要重读」，给出 6 步流程（write P1 → edit P2 → edit P3 → write js → build → audit），
外加：audit 报错只改对应一处再 rebuild；若报「2.6s 后数值没变」把位移放到 2.2–4.8s。

## 踩过的坑（按痛度）

1. **`el.textContent = ""` 必须每帧做**，放 `geom()` 里只做一次 → AutoPilot 每帧追加节点 → 几千个 `<text>` →
   `audit-fn.js` 的两两重叠检测 O(n²) → 单页体检 150–1000s 卡死，报「页面没有返回体检数据 / console 不干净 / 没有 window.__ap」。
2. **并发别超过 3**。4 个以上子代理 + 各自的 headless Chrome 会把 %TEMP% 塞满（`scoped_dir*` 每个 1.3MB），
   磁盘写满后子代理静默崩、页面只写一半。已加清理脚本 `.workbuddy/clean-temp.mjs`（按 pid 判断），挂在各册 `audit-all.mjs` 尾行。
3. **复制工作区的固定清单**：`build-page.mjs` 的 `book !== 'xxN'` 过滤、面包屑册名、**页脚「对应 人教版…《…》」行**、
   `content/<学科>.txt` 路径、`static/audit-all` 的目录与 glob 前缀、`split-spec.mjs` 里硬编码的出处口径、章节正则。
   政治是「第X课 / 第X框」，正则是 `第[一二三四五六七八九十]+课`。
4. 静态检查会抓：`<section>` 开闭不等、SVG `<text>` 里出现 `<b>`、`loop 帧 < 4`、缺 `window.__model`（政治口径，已接受 `__bio|__model`）。
5. `AutoPilot.create` 的 `loop` 必须是 `[{t,v}]` 对象数组；脚本必须包在 `DOMContentLoaded` 里；`render()` 里不要给滑块反向赋值。
6. 窄量程滑块（0–1、1–5、1949–1956）：位移必须**跨过整个量程**，只挪到停留帧过不了「2.6s 后数值没变」。
7. 规格里手算的迭代值要用代码验一遍（s=1 的递推终点手算 0.989，真值 0.9913）。

## 约定

- 每页要有三条「必背判断」贯穿 A/B/C/D/E/F 至少各出现两次。
- 术语照课本原话，禁用语：简单来说 / 众所周知 / 其实很简单 / 只要记住。
- 公式进 `<span class="gx-fml">`；**不用 MathJax、不用 `<sub>`/`<sup>`**，上下标一律 Unicode（₁ ₂ ⁿ ⁺ ⁻ ² ³）。
- 数值：教材值照抄并标来源；示意值必须页内注明「示意值」。
- 出处写「人教版（2019）必修X · 第X课第Y框」，**不写页码**。

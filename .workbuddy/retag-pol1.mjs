// 从 bio5 工作区复制出政治必修1 的工作区 pol1，并改掉学科、册名、目录、章节标签
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';

const SRC = '.workbuddy/bio5';
const DST = '.workbuddy/pol1';

mkdirSync(`${DST}/parts`, { recursive: true });
mkdirSync(`${DST}/spec`, { recursive: true });

const files = [
  'PAGE-RULES.md', 'split-spec.mjs', 'static.mjs', 'build-page.mjs', 'audit.mjs',
  'audit-fn.js', 'probe-fn.js', 'skeleton.html', 'BRIEF.md', 'audit-all.mjs',
  'parts/_CONTENT.html', 'parts/_SCRIPT.js',
];

const rep = [
  // 路径与 slug
  ['pages/bio', 'pages/pol'],
  ['content/bio.txt', 'content/pol.txt'],
  ['xx3-', 'bx1-'],
  ['^xx3-', '^bx1-'],
  ['/^xx3-', '/^bx1-'],
  ['xx3', 'bx1'],
  // 工作区名
  ['bio5', 'pol1'],
  // 学科与册名
  ['选择性必修3 生物技术与工程', '必修1 中国特色社会主义'],
  ['生物 · 必修1 中国特色社会主义', '政治 · 必修1 中国特色社会主义'],
  ['">生物<', '">政治<'],
  ['s=bio', 's=pol'],
  ['"bio"', '"pol"'],
  ['生物', '政治'],
  // 章节标签：政治用「课 / 框」
  ['第(\\d+)章', '第[一二三四五六七八九十]+课'],
  ['第(\\d+)节', '第[一二三四五六七八九十]+框'],
  // 配色：生物绿 → 政治红
  ['#16a34a', '#e11d48'],
  ['#f0fdf3', '#fff1f4'],
  ['#0f8a5f', '#be123c'],
  ['#edfaf3', '#fff1f4'],
  ['#b3e2c7', '#fecdd3'],
];

for (const f of files) {
  const s = `${SRC}/${f}`;
  if (!existsSync(s)) continue;
  let t = readFileSync(s, 'utf8');
  for (const [a, b] of rep) t = t.split(a).join(b);
  writeFileSync(`${DST}/${f}`, t);
}

// 把已有的 9 个旧页面从 pages/pol 里备份名字列出来，方便之后覆盖
const polPages = readdirSync('pages/pol').filter((f) => f.startsWith('bx1-'));
console.log('pol1 工作区已生成；待覆盖页面：', polPages.join(' '));

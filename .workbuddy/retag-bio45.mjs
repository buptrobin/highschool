// 一次性：把 bio3 工作区复制成 bio4 / bio5 并改掉册名与 slug 前缀
import { readFileSync, writeFileSync } from 'node:fs';

const books = [
  { dir: 'bio4', pfx: 'xx2', name: '选择性必修2 生物与环境' },
  { dir: 'bio5', pfx: 'xx3', name: '选择性必修3 生物技术与工程' },
];

const files = ['PAGE-RULES.md', 'split-spec.mjs', 'static.mjs', 'build-page.mjs', 'audit.mjs',
  'audit-fn.js', 'probe-fn.js', 'skeleton.html', 'BRIEF.md', 'audit-all.mjs',
  'parts/_CONTENT.html', 'parts/_SCRIPT.js'];

for (const { dir, pfx, name } of books) {
  for (const f of files) {
    const p = `.workbuddy/${dir}/${f}`;
    let t = readFileSync(p, 'utf8');
    t = t.split('bio3').join(dir)
      .split('xx1-').join(`${pfx}-`)
      .split('xx1').join(pfx)
      .split('选择性必修1 稳态与调节').join(name)
      .split("'xx1'").join(`'${pfx}'`);
    writeFileSync(p, t);
  }
  console.log(dir, 'ready');
}

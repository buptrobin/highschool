// 用修好的页脚模板重建两册全部已完成的页面（单进程顺序执行，避免并发把机器打崩）
import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const books = [
  { dir: 'bio4', pfx: 'xx2' },
  { dir: 'bio5', pfx: 'xx3' },
];
const root = process.cwd();
for (const { dir, pfx } of books) {
  const pages = readdirSync(`${root}/pages/bio`)
    .filter((f) => f.startsWith(`${pfx}-`) && f.endsWith('.html'))
    .sort();
  for (const f of pages) {
    const slug = f.replace(/\.html$/, '');
    try {
      execFileSync(process.execPath, [`.workbuddy/${dir}/build-page.mjs`, slug], { stdio: 'pipe' });
      process.stdout.write(`ok ${slug}\n`);
    } catch (e) {
      process.stdout.write(`FAIL ${slug} ${String(e.message).slice(0, 120)}\n`);
    }
  }
}
process.stdout.write('DONE\n');

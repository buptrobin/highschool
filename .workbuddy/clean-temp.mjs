// 清理体检留下的 Chrome 临时目录。
//
// 默认模式是「按 pid 判断」：目录名里带着创建它的进程号，
//   chrome_chrome_Unpacker_BeginUnzipping<pid>_<随机>   Chrome 解包组件包用的空目录
//   scoped_dir<pid>_<随机>                             puppeteer 每次启动的临时 profile（约 1.3 MB）
// 进程已经不在了 → 说明浏览器被 kill 掉、没走清理回调，目录就是垃圾，直接删。
// 进程还活着 → 可能正在跑别的体检，跳过。
//
// 用法：
//   node .workbuddy/clean-temp.mjs              按 pid 清理（audit-all 收尾用这个）
//   node .workbuddy/clean-temp.mjs --age=30     额外清理「30 分钟没动过」的（兜底，防 pid 被复用）
import { readdirSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ageArg = process.argv.find((a) => a.startsWith('--age='));
const ageMin = ageArg ? Number(ageArg.slice(6)) : null;
const ageCutoff = ageMin ? Date.now() - ageMin * 60 * 1000 : 0;

const rules = [
  { re: /^chrome_chrome_Unpacker\S*?_(\d+)_\d+$/, pidAware: true },
  { re: /^scoped_dir(\d+)_\d+$/, pidAware: true },
  { re: /^chrome_BITS_\d+_\d+$/, pidAware: false },
  { re: /^puppeteer_dev_chrome_profile-\w+$/, pidAware: false },
];

let removed = 0;
let freed = 0;
let skipped = 0;
const t = tmpdir();

for (const name of readdirSync(t)) {
  const rule = rules.find((r) => r.re.test(name));
  if (!rule) continue;

  const full = join(t, name);
  let st;
  try {
    st = statSync(full);
  } catch {
    continue;
  }
  if (!st.isDirectory()) continue;

  let reason = null;
  const m = name.match(rule.re);
  if (rule.pidAware && m) {
    const pid = Number(m[1]);
    if (!alive(pid)) reason = 'pid 已退出';
  }
  if (!reason && ageMin && st.mtimeMs < ageCutoff) reason = `${ageMin} 分钟未动`;
  if (!reason) {
    skipped++;
    continue;
  }

  try {
    freed += dirSize(full);
    rmSync(full, { recursive: true, force: true });
    removed++;
  } catch {
    skipped++;
  }
}

console.log(`临时目录清理：删除 ${removed} 个，释放 ${(freed / 1024 / 1024).toFixed(0)} MB，跳过 ${skipped} 个（可能仍在用）`);

function alive(pid) {
  if (!pid || Number.isNaN(pid)) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM'; // 存在但没权限，当作还活着
  }
}

function dirSize(dir) {
  let s = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    try {
      if (e.isDirectory()) s += dirSize(p);
      else s += statSync(p).size;
    } catch {
      /* 边删边读会抛，忽略 */
    }
  }
  return s;
}

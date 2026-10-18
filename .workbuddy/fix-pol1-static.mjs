// 政治分册的检查口径：断言对象叫 window.__model（__bio 是从生物模板带过来的旧名，两者都算过）
import { readFileSync, writeFileSync } from 'node:fs';

const p = '.workbuddy/pol1/static.mjs';
let t = readFileSync(p, 'utf8');
const before = t;

t = t.replace(
  "const bio = /window\\.__bio\\s*=/.test(h);",
  "const bio = /window\\.__(?:bio|model)\\s*=/.test(h);",
);
t = t.replace("if (!bio) err.push('无 window.__bio');", "if (!bio) err.push('无 window.__model');");

if (t === before) {
  console.log('没改到，检查原文');
} else {
  writeFileSync(p, t);
  console.log('static.mjs 已改成接受 __model');
}
for (const line of t.split('\n')) if (line.includes('__model') || line.includes('__bio')) console.log('  ' + line.trim());

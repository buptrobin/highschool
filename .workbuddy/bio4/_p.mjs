import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const acts = readFileSync(process.argv[2], 'utf8');
const file = process.argv[3];
const width = process.argv[4] || '360';
const out = spawnSync(process.execPath, ['C:/Users/robin/.workbuddy/skills/anatomy/scripts/drive.mjs', file, JSON.stringify(JSON.parse(acts)), '--width', width, '--height', '1200'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
console.log(out.stdout || '');
console.error(out.stderr || '');

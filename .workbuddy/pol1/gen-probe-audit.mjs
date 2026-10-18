import { readFileSync, writeFileSync } from 'node:fs';
const AUDIT = readFileSync('.workbuddy/pol1/audit-fn.js', 'utf8');
const acts = [
  ['wait', 450],
  ['eval', "(()=>{const s=document.querySelectorAll('#content svg');let n=0;for(let i=0;i<s.length;i++)n+=s[i].querySelectorAll('text').length;return {svgs:s.length,texts:n}})()"],
  ['eval', "(()=>{const t0=performance.now();const ts=document.querySelectorAll('#gxStage text');const r=[];for(let i=0;i<ts.length;i++)r.push(ts[i].getBoundingClientRect());return {n:ts.length,ms:+(performance.now()-t0).toFixed(1)}})()"],
  ['eval', "(()=>{const t0=performance.now();const ts=document.querySelectorAll('#gxStage text');const rs=[];for(let i=0;i<ts.length;i++)rs.push(ts[i].getBoundingClientRect());const N=rs.length;let c=0;for(let p=0;p<N;p++){const a=rs[p];for(let q=p+1;q<N;q++){const b=rs[q];const ox=Math.min(a.right,b.right)-Math.max(a.left,b.left);const oy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(ox>1&&oy>1){const ar=ox*oy;if(ar/Math.min(a.width*a.height,b.width*b.height)>0.28)c++;}}}return {n:N,pairs:+(N*(N-1)/2),hits:c,ms:+(performance.now()-t0).toFixed(1)}})()"],
  ['eval', AUDIT]
];
writeFileSync('.workbuddy/pol1/probe-audit.json', JSON.stringify(acts), 'utf8');
console.log('ok');

(function () {
"use strict";
var $=function(i){return document.getElementById(i);},stage,sl,G=null,L="W";
function A(i,o){var e=$(i);for(var k in o)e.setAttribute(k,o[k]);}
function T(i,t){$(i).textContent=t;}
function calc(v){
var R=Math.round(Number(v));if(!isFinite(R))R=1;R=Math.max(1,Math.min(18,R));
return {R0:R,need:(1-1/R)*100,hard:R>=10?1:0,level:R<3?0:(R<=10?1:2)};
}
function layout(){
var w=0;try{w=stage.getBoundingClientRect().width;}catch(e){w=0;}
if(!w)w=stage.parentNode?stage.parentNode.clientWidth:880;
return w>=640?"W":"N";
}
function geom(){
return L==="W"
?{p:{x:60,dx:64,y:90,dy:56,r:18},b:{a:40,z:420,y:356},q:{x0:496,x1:848,y0:336,y1:112},t:[24,38],f:[24,300],l:[40,380]}
:{p:{x:44,dx:68,y:76,dy:52,r:20},b:{a:22,z:338,y:302},q:{x0:54,x1:336,y0:630,y1:392},t:[16,26],f:[16,258],l:[22,326]};
}
function build(){
var g=G,P=g.p,B=g.b,Q=g.q,W=L==="W",i,c,r,y,s="";
var xa=function(R){return Q.x0+(R-1)/17*(Q.x1-Q.x0);};
stage.setAttribute("viewBox",W?"0 0 880 470":"0 0 360 700");
s+='<rect x="8" y="8" width="'+(W?864:344)+'" height="'+(W?454:684)+'" rx="12" fill="#fbfdfe" stroke="#dbe7ef"/>';
s+='<text x="'+g.t[0]+'" y="'+g.t[1]+'" font-size="11.5" font-weight="700" fill="#151a21">人群免疫屏障：每个小人 = 5% 的人</text>';
for(i=0;i<20;i++){c=i%5;r=(i-c)/5;s+='<circle id="gxP'+i+'" cx="'+(P.x+c*P.dx)+'" cy="'+(P.y+r*P.dy)+'" r="'+P.r+'" fill="#eef2f6" stroke="#c9d4de" stroke-width="1.4"/>';}
s+='<text x="'+g.f[0]+'" y="'+g.f[1]+'" font-size="9.6" fill="#3a3a35">绿色 = 已免疫　灰色 = 未免疫</text>';
s+='<line x1="'+B.a+'" y1="'+B.y+'" x2="'+B.z+'" y2="'+B.y+'" stroke="#c9d4de" stroke-width="3"/>';
s+='<circle id="gxKnob" cx="'+B.a+'" cy="'+B.y+'" r="6" fill="#b8402f"/>';
s+='<text x="'+g.l[0]+'" y="'+g.l[1]+'" font-size="9" fill="#6b7683">R₀ = 1</text>';
s+='<text x="'+B.z+'" y="'+g.l[1]+'" text-anchor="end" font-size="9" fill="#6b7683">18</text>';
s+='<text id="gxR0Txt" x="'+((B.a+B.z)/2)+'" y="'+(B.y-16)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#151a21">R₀ = 12</text>';
s+='<line x1="'+Q.x0+'" y1="'+Q.y1+'" x2="'+Q.x0+'" y2="'+Q.y0+'" stroke="#9aa7b4" stroke-width="1.2"/>';
s+='<line x1="'+Q.x0+'" y1="'+Q.y0+'" x2="'+Q.x1+'" y2="'+Q.y0+'" stroke="#9aa7b4" stroke-width="1.2"/>';
s+='<text x="'+Q.x0+'" y="'+(Q.y1-12)+'" font-size="9.2" fill="#6b7683">所需免疫覆盖率 / %</text>';
for(i=0;i<3;i++){y=Q.y0-i*0.5*(Q.y0-Q.y1);
s+='<line x1="'+Q.x0+'" y1="'+y+'" x2="'+Q.x1+'" y2="'+y+'" stroke="#e7edf3"/>';
s+='<text x="'+(Q.x0-6)+'" y="'+(y+3)+'" text-anchor="end" font-size="8.8" fill="#6b7683">'+i*50+'</text>';}
var pts=[];
for(r=1;r<=18;r+=0.5)pts.push(xa(r).toFixed(1)+","+(Q.y0-(1-1/r)*(Q.y0-Q.y1)).toFixed(1));
s+='<polyline points="'+pts.join(" ")+'" fill="none" stroke="#2f8a5b" stroke-width="2.2"/>';
s+='<line id="gxDashV" x1="0" y1="0" x2="0" y2="0" stroke="#b8402f" stroke-dasharray="4 4"/>';
s+='<line id="gxDashH" x1="0" y1="0" x2="0" y2="0" stroke="#b8402f" stroke-dasharray="4 4"/>';
s+='<circle id="gxDot" cx="0" cy="0" r="5" fill="#b8402f"/>';
s+='<text id="gxNeedTxt" x="0" y="0" text-anchor="middle" font-size="11" font-weight="700" fill="#b8402f">91.7%</text>';
var tk=[1,3,6,9,12,15,18];
for(i=0;i<7;i++)s+='<text x="'+xa(tk[i])+'" y="'+(Q.y0+15)+'" text-anchor="middle" font-size="8.8" fill="#6b7683">'+tk[i]+'</text>';
s+='<text x="'+((Q.x0+Q.x1)/2)+'" y="'+(Q.y0+32)+'" text-anchor="middle" font-size="9.2" fill="#3a3a35">基本传染数 R₀</text>';
s+='<text x="'+((Q.x0+Q.x1)/2)+'" y="'+(Q.y1+(W?60:46))+'" text-anchor="middle" font-size="9" fill="#6b7683">覆盖率 = 100(1 − 1/R₀) %</text>';
$("gxA").innerHTML=s;$("gxB").innerHTML="";
}
function render(v){
if(!G){L=layout();G=geom();build();}
var r=calc(v===undefined||v===null?sl.value:v),need=r.need,g=G,i,filled=Math.round(need/5);
for(i=0;i<20;i++)A("gxP"+i,{fill:i<filled?"#2f8a5b":"#eef2f6",stroke:i<filled?"#2f8a5b":"#c9d4de"});
A("gxKnob",{cx:g.b.a+(r.R0-1)/17*(g.b.z-g.b.a)});T("gxR0Txt","R₀ = "+r.R0);
var dx=g.q.x0+(r.R0-1)/17*(g.q.x1-g.q.x0),dy=g.q.y0-need/100*(g.q.y0-g.q.y1);
A("gxDot",{cx:dx,cy:dy});
A("gxDashV",{x1:dx,x2:dx,y1:dy,y2:g.q.y0});
A("gxDashH",{x1:g.q.x0,x2:dx,y1:dy,y2:dy});
A("gxNeedTxt",{x:Math.min(Math.max(dx,g.q.x0+34),g.q.x1-34),y:Math.max(dy-12,g.q.y1-4)});
T("gxNeedTxt",need.toFixed(1)+"%");T("gxVa",r.R0);T("gxVb",need.toFixed(1)+"%");T("gxVc",r.hard?"高位":"常规");
var sv=$("gxVs");
if(r.level===0){T("gxVs","常规传染病水平");T("gxVsn","R₀ < 3，链条易断");sv.style.color="#2f8a5b";}
else if(r.level===1){T("gxVs","需要高覆盖率");T("gxVsn","3 ≤ R₀ ≤ 10");sv.style.color="#b8791f";}
else{T("gxVs","防控极难");T("gxVsn","接近消灭不掉");sv.style.color="#b8402f";}
}
function setMode(m){
var t=$("gxApTxt");
if(t)t.textContent=(m==="auto"||m===true||m===1)?"自动演示中":"手动控制";
}
function wireSteps(){
var st=$("gxSteps"),nx=$("gxNext"),cnt=$("gxCnt"),ans=$("gxAns");
if(!st||!nx)return;
var it=st.querySelectorAll(".step"),i=0;
function show(){
for(var k=0;k<it.length;k++)it[k].hidden=k>i;
if(cnt)cnt.textContent=(i+1)+" / "+it.length;
nx.disabled=i>=it.length-1;
if(ans)ans.hidden=i<it.length-1;
}
nx.addEventListener("click",function(){if(i<it.length-1){i++;show();}});
show();
}
function boot(){
stage=$("gxStage");sl=$("gxSl");
if(!stage||!sl)return;
render();
sl.addEventListener("input",function(){render();});
wireSteps();
window.__ap=AutoPilot.create({
mount:stage,follow:sl,
loop:[{t:0,v:1},{t:1.2,v:1},{t:4,v:12},{t:6.5,v:12},{t:9,v:18},{t:11,v:15},{t:13,v:1}],
keys:[1,3,12,18],value:12,min:1,max:18,step:1,idle:5000,
onChange:function(v){render(v);},onMode:setMode
});
window.addEventListener("resize",function(){if(layout()!==L){G=null;render();}});
}
window.__bio={calc:calc,cases:[{v:3,eq:{need:66.7}},{v:12,eq:{need:91.7}},{v:18,eq:{need:94.4}}]};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})();

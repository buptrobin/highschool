/* 互动脚本：乙烯利浓度 c → 果实成熟度（build-page.mjs 会包进 <script>，这里不写 script 标签） */
document.addEventListener("DOMContentLoaded", function () {
"use strict";
var GX=window.GX,el=GX.el,tx=GX.tx,$=GX.$,stage=$("gxStage");
if(!stage||!window.AutoPilot)return;
var W={vb:"0 0 880 470",wide:true,left:{x:16,y:16,w:424,h:438},right:{x:456,y:16,w:408,h:438}};
var N={vb:"0 0 360 700",wide:false,left:{x:8,y:8,w:344,h:300},right:{x:8,y:320,w:344,h:372}};
var L=W,A=0,G=null;
function calc(c){var r=100*(1-Math.exp(-c/25));return{ripe:r,gain:100*(1-Math.exp(-(c+10)/25))-r}}
function zone(c){
if(c<15)return{t:"催熟不足",col:"#b8791f",bg:"#fdf3e0",s:"青涩，成熟度低"};
if(c<=40)return{t:"催熟合适",col:"#2f8a5b",bg:"#e6f6ee",s:"性价比最高的一段"};
if(c<=60)return{t:"接近饱和",col:"#b8791f",bg:"#fdf3e0",s:"再加浓度提升很小"};
return{t:"过量",col:"#b8402f",bg:"#fbeae7",s:"品质与残留风险上升"}}
function bc(f){return"hsl("+(95-65*f)+",55%,"+(50+4*f)+"%)"}
function ln(a,b,c,d,g){el("line",{x1:a,y1:b,x2:c,y2:d,stroke:"#9aa7b2","stroke-width":1},g)}
function box(g,x,y,w,h,fill,st){el("rect",{x:x,y:y,width:w,height:h,rx:9,fill:fill,stroke:st},g)}
function geom(){
var g={left:L.left,right:L.right,berries:[]},r,c;
if(L.wide){g.rows=5;g.cols=4;g.br=13;g.bx=L.left.x+L.left.w/2;g.by=L.left.y+96;g.dx=40;g.dy=44;g.ly=L.left.y+336;
g.p={x0:L.right.x+64,x1:L.right.x+L.right.w-30,y0:L.right.y+80,y1:L.right.y+L.right.h-92}}
else{g.rows=4;g.cols=4;g.br=10;g.bx=L.left.x+L.left.w/2;g.by=L.left.y+78;g.dx=32;g.dy=36;g.ly=L.left.y+232;
g.p={x0:L.right.x+44,x1:L.right.x+L.right.w-22,y0:L.right.y+62,y1:L.right.y+L.right.h-64}}
for(r=0;r<g.rows;r++)for(c=0;c<g.cols;c++)g.berries.push({x:g.bx+(c-(g.cols-1)/2)*g.dx,y:g.by+r*g.dy});
return g}
function draw(){
var gA=$("gxA"),gB=$("gxB"),g=G,p=g.p,s=calc(A),i,k,f,b,pts=[],lab,right,X,Y,cv,rv,xx,yy,ft=L.wide?10.5:9.4,fs=L.wide?9.2:8.2;
function px(c){return p.x0+c/100*(p.x1-p.x0)}function py(r){return p.y1-r/100*(p.y1-p.y0)}
gA.textContent="";gB.textContent="";
box(gA,L.left.x,L.left.y,L.left.w,L.left.h,"#f8fbfd","#dbe7ef");
tx(gA,L.left.x+16,L.left.y+28,"一串果实：颜色 = 成熟度","#5a6472","start",ft,700);
for(i=0;i<g.berries.length;i++){f=Math.min(1,Math.max(0,A/100*g.berries.length-i));b=g.berries[i];
el("circle",{cx:b.x,cy:b.y,r:g.br,fill:bc(f),stroke:"#5f6b4a","stroke-width":.8},gA)}
for(k=0;k<3;k++)el("circle",{cx:L.left.x+34+k*26,cy:g.ly,r:7,fill:bc(k/2),stroke:"#5f6b4a","stroke-width":.8},gA);
tx(gA,L.left.x+112,g.ly+3,"青 → 黄 → 橙：成熟度升高","#5a6472","start",fs,400);
tx(gA,L.left.x+16,g.ly+30,"浓度越高，变色的果实越多","#5a6472","start",fs,400);
box(gB,L.right.x,L.right.y,L.right.w,L.right.h,"#ffffff","#e6e9ee");
tx(gB,L.right.x+16,L.right.y+28,"成熟度随浓度变化","#5a6472","start",ft,700);
el("rect",{x:px(60),y:p.y0,width:p.x1-px(60),height:p.y1-p.y0,fill:"#fbeae7",opacity:.6},gB);
ln(p.x0,p.y0,p.x0,p.y1,gB);ln(p.x0,p.y1,p.x1,p.y1,gB);
tx(gB,p.x0+4,p.y0-8,"成熟度 %","#8a949f","start",8.4,400);
tx(gB,p.x1,p.y1+32,"浓度 c (mg/L)","#8a949f","end",8.4,400);
for(k=0;k<=4;k++){cv=k*25;xx=px(cv);ln(xx,p.y1,xx,p.y1+4,gB);tx(gB,xx,p.y1+15,String(cv),"#8a949f","middle",8,400)}
for(k=0;k<=2;k++){rv=k*50;yy=py(rv);ln(p.x0-4,yy,p.x0,yy,gB);tx(gB,p.x0-7,yy+3,String(rv),"#8a949f","end",8,400)}
tx(gB,p.x1-6,p.y0+14,">60 过量区","#b8402f","end",8,400);
for(k=0;k<=20;k++)pts.push(px(k*5).toFixed(1)+","+py(100*(1-Math.exp(-k/5))).toFixed(1));
el("polyline",{points:pts.join(" "),fill:"none",stroke:"#2f6b4a","stroke-width":2},gB);
X=px(A);Y=py(s.ripe);
el("line",{x1:X,y1:Y,x2:X,y2:p.y1,stroke:"#b8791f","stroke-width":1,"stroke-dasharray":"3 3"},gB);
el("line",{x1:p.x0,y1:Y,x2:X,y2:Y,stroke:"#b8791f","stroke-width":1,"stroke-dasharray":"3 3"},gB);
el("circle",{cx:X,cy:Y,r:5,fill:"#ffffff",stroke:"#b8791f","stroke-width":2},gB);
lab="c="+Math.round(A)+"，"+s.ripe.toFixed(1)+"%";right=X<p.x1-96;
tx(gB,right?X+10:X-10,Y-10,lab,"#6b4a16",right?"start":"end",8.6,700);
}
function render(){
if(!G){L=stage.parentElement.getBoundingClientRect().width>=640?W:N;G=geom();}
var s=calc(A),z=zone(A);
$("gxVa").textContent=String(Math.round(A));
$("gxVb").textContent=s.ripe.toFixed(1);
$("gxVc").textContent=s.gain.toFixed(1);
$("gxVs").textContent=z.t;$("gxVsn").textContent=z.s;
$("gxStBox").style.background=z.bg;$("gxStBox").style.borderColor=z.col+"44";$("gxVs").style.color=z.col;
draw();
}
function layout(){L=stage.parentElement.getBoundingClientRect().width>=640?W:N;stage.setAttribute("viewBox",L.vb);G=geom();render()}
var apBadge=$("gxAp"),apTxt=$("gxApTxt");
function setMode(m){if(!apBadge)return;apBadge.classList.toggle("is-auto",m==="auto");apBadge.classList.toggle("is-manual",m!=="auto");if(apTxt)apTxt.textContent=m==="auto"?"自动演示中":"你接管了"}
var ap=AutoPilot.create({mount:stage,follow:$("gxSl"),
loop:[{t:0,v:0},{t:.9,v:0},{t:1.4,v:25},{t:3.6,v:25},{t:5.2,v:100},{t:7.2,v:100},{t:8.8,v:50},{t:10.2,v:50},{t:11.8,v:0}],
keys:[0,25,50,100],value:A,min:0,max:100,step:5,idle:5000,
onChange:function(v){A=v;render()},onMode:setMode});
window.__ap=ap;
window.__bio={calc:calc,cases:[{v:0,eq:{ripe:0}},{v:25,eq:{ripe:63.2}},{v:50,eq:{ripe:86.5}},{v:100,eq:{ripe:98.2}}]};
var tmr=null;
window.addEventListener("resize",function(){clearTimeout(tmr);tmr=setTimeout(layout,150)});
layout();
});

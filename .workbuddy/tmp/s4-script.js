document.addEventListener("DOMContentLoaded",function(){"use strict";
var stage=document.getElementById("gxStage");if(!stage)return;
var NS="http://www.w3.org/2000/svg";
function mk(t,a,p){var n=document.createElementNS(NS,t);for(var k in a)if(a.hasOwnProperty(k))n.setAttribute(k,a[k]);if(p)p.appendChild(n);return n}
function tx(p,x,y,s,o){o=o||{};var n=mk("text",{x:x,y:y,"text-anchor":o.anchor||"start","font-size":o.size||11,"font-weight":o.weight||400,fill:o.fill||"#3a3a35"},p);n.textContent=s;return n}
var W={vb:"0 0 880 440",left:{x:20,y:18,w:300,h:404},right:{x:340,y:18,w:520,h:404},plot:{x:400,y:78,w:420,h:264}};
var N={vb:"0 0 360 620",left:{x:10,y:10,w:340,h:270},right:{x:10,y:292,w:340,h:318},plot:{x:58,y:372,w:282,h:196}};
var L=W,A=2000,R={dots:[]};
function build(){var gA=document.getElementById("gxA"),gB=document.getElementById("gxB");gA.textContent="";gB.textContent="";R={dots:[]};var lp=L.left,rp=L.right,p=L.plot;
mk("rect",{x:lp.x,y:lp.y,width:lp.w,height:lp.h,rx:10,fill:"#f8fbfd",stroke:"#dbe7ef"},gA);
tx(gA,lp.x+16,lp.y+26,"① 大气 CO₂ 与温度",{size:11.5,weight:700,fill:"#151a21"});
for(var i=0;i<24;i++){var bx=lp.x+26+(i*37)%150,by=lp.y+56+(i*53)%(lp.h-130);R.dots.push(mk("circle",{cx:bx,cy:by,r:2.6,fill:"#7cb8cf",opacity:"0.15"},gA))}
tx(gA,lp.x+22,lp.y+lp.h-30,"CO₂ 浓度随累计排放上升",{size:9.5,fill:"#3f6f92"});
var txc=lp.x+lp.w-70,top=lp.y+58,bot=lp.y+lp.h-60;
mk("rect",{x:txc-8,y:top,width:16,height:bot-top,rx:8,fill:"#e9eef2",stroke:"#c9d6df"},gA);
R.mercury=mk("rect",{x:txc-5.5,y:bot,width:11,height:0,rx:5.5,fill:"#b8402f"},gA);
mk("circle",{cx:txc,cy:bot+10,r:16,fill:"#e9eef2",stroke:"#c9d6df"},gA);
R.bulb=mk("circle",{cx:txc,cy:bot+10,r:12,fill:"#b8402f"},gA);
tx(gA,txc+18,top+4,"2℃",{size:9,fill:"#6b7280"});tx(gA,txc+18,bot+3,"0℃",{size:9,fill:"#6b7280"});
R.temp=tx(gA,txc,top-10,"0.90℃",{size:10.5,weight:700,fill:"#b8402f",anchor:"middle"});
mk("rect",{x:rp.x,y:rp.y,width:rp.w,height:rp.h,rx:10,fill:"#f8fbfd",stroke:"#dbe7ef"},gB);
tx(gB,rp.x+16,rp.y+26,"② 累计排放—升温",{size:11.5,weight:700,fill:"#151a21"});
var vals=[0,.5,1,1.5,2];
for(var j=0;j<vals.length;j++){var gy=p.y+p.h*(1-vals[j]/2);mk("line",{x1:p.x,y1:gy,x2:p.x+p.w,y2:gy,stroke:j===0?"#9fb0bd":"#e3ebf1","stroke-width":j===0?1.2:1},gB);tx(gB,p.x-8,gy+3.5,vals[j].toFixed(1),{size:9,fill:"#6b7280",anchor:"end"})}
for(var q=0;q<=4;q++){var gx=p.x+p.w*q/4;mk("line",{x1:gx,y1:p.y,x2:gx,y2:p.y+p.h,stroke:"#e3ebf1"},gB)}
tx(gB,p.x,p.y+p.h+18,"0",{size:9,fill:"#6b7280",anchor:"middle"});
tx(gB,p.x+p.w/2,p.y+p.h+18,"2000",{size:9,fill:"#6b7280",anchor:"middle"});
tx(gB,p.x+p.w,p.y+p.h+18,"4000",{size:9,fill:"#6b7280",anchor:"middle"});
tx(gB,p.x+p.w/2,p.y+p.h+34,"累计排放（GtC）",{size:9.5,fill:"#5b6673",anchor:"middle"});
tx(gB,p.x,p.y-12,"升温（℃）",{size:9.5,fill:"#5b6673"});
var y15=p.y+p.h*.25;
mk("line",{x1:p.x,y1:y15,x2:p.x+p.w,y2:y15,stroke:"#a86a12","stroke-dasharray":"5 4"},gB);
tx(gB,p.x+p.w-2,y15-5,"1.5℃",{size:9,fill:"#a86a12",anchor:"end"});
mk("line",{x1:p.x,y1:p.y,x2:p.x+p.w,y2:p.y,stroke:"#b8402f","stroke-dasharray":"5 4"},gB);
tx(gB,p.x+4,p.y+13,"2℃ 警戒线",{size:9,fill:"#b8402f"});
mk("line",{x1:p.x,y1:p.y+p.h,x2:p.x+p.w,y2:p.y+p.h*.1,stroke:"#0b6580","stroke-width":2.2},gB);
tx(gB,p.x+p.w-2,p.y+p.h*.1-8,"4000 → 1.80℃",{size:9,fill:"#0b6580",anchor:"end"});
R.guideV=mk("line",{x1:p.x,y1:p.y,x2:p.x,y2:p.y+p.h,stroke:"#b8402f","stroke-dasharray":"3 3",opacity:"0.55"},gB);
R.guideH=mk("line",{x1:p.x,y1:p.y+p.h,x2:p.x,y2:p.y+p.h,stroke:"#b8402f","stroke-dasharray":"3 3",opacity:"0.55"},gB);
R.marker=mk("circle",{cx:p.x,cy:p.y+p.h,r:5.5,fill:"#b8402f",stroke:"#ffffff","stroke-width":2},gB);
R.pt=tx(gB,p.x+8,p.y+p.h-8,"0.90℃",{size:10,weight:700,fill:"#b8402f"})}
function render(){var T=A*.45/1000,S=T*.35,st,sub,col,bg;
if(T<1.5){st="1.5℃以内";sub="风险可控";col="#1e6640";bg="#e6f6ee"}else if(T<1.75){st="超过 1.5℃";sub="逼近警戒线";col="#a86a12";bg="#fff7e6"}else{st="危险";sub="逼近 2℃";col="#b8402f";bg="#fbeae7"}
var $=document.getElementById.bind(document);
$("gxVa").textContent=String(Math.round(A));$("gxVb").textContent=T.toFixed(2);$("gxVc").textContent=S.toFixed(2);$("gxVs").textContent=st;$("gxVsn").textContent=sub;
var box=$("gxStBox");box.style.background=bg;box.style.borderColor=col+"44";$("gxVs").style.color=col;
var lp=L.left,top=lp.y+58,bot=lp.y+lp.h-60,mh=(bot-top)*Math.min(T/2,1);
R.mercury.setAttribute("y",String(bot-mh));R.mercury.setAttribute("height",String(mh));R.mercury.setAttribute("fill",col);R.bulb.setAttribute("fill",col);
R.temp.textContent=T.toFixed(2)+"℃";R.temp.setAttribute("fill",col);
for(var i=0;i<R.dots.length;i++){R.dots[i].setAttribute("opacity",String(.12+.78*A/4000));R.dots[i].setAttribute("r",String(2.2+1.2*A/4000))}
var p=L.plot,mx=p.x+p.w*A/4000,my=p.y+p.h*(1-T/2);
R.marker.setAttribute("cx",String(mx));R.marker.setAttribute("cy",String(my));R.marker.setAttribute("fill",col);
R.guideV.setAttribute("x1",String(mx));R.guideV.setAttribute("x2",String(mx));R.guideV.setAttribute("y2",String(my));R.guideH.setAttribute("y1",String(my));R.guideH.setAttribute("y2",String(my));R.guideH.setAttribute("x2",String(mx));
R.guideV.setAttribute("stroke",col);R.guideH.setAttribute("stroke",col);
R.pt.textContent=T.toFixed(2)+"℃";R.pt.setAttribute("fill",col);
if(mx>p.x+p.w-80){R.pt.setAttribute("x",String(mx-8));R.pt.setAttribute("text-anchor","end")}else{R.pt.setAttribute("x",String(mx+8));R.pt.setAttribute("text-anchor","start")}
R.pt.setAttribute("y",String(my-8));$("gxSl").value=String(A)}
function apply(){var w=stage.parentElement.getBoundingClientRect().width;L=w>=640?W:N;stage.setAttribute("viewBox",L.vb);build();render()}
document.getElementById("gxSl").addEventListener("input",function(){A=+this.value;render()});
document.getElementById("gxP1").addEventListener("click",function(){A=2000;render()});
document.getElementById("gxP2").addEventListener("click",function(){A=4000;render()});
stage.addEventListener("keydown",function(ev){if(ev.key==="ArrowLeft"||ev.key==="ArrowRight"){ev.preventDefault();A=Math.max(0,Math.min(4000,A+(ev.key==="ArrowRight"?50:-50)));render()}});
var tmr=null;window.addEventListener("resize",function(){clearTimeout(tmr);tmr=setTimeout(apply,180)});
apply()});
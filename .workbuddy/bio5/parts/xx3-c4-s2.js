(function () {
function boot() {
var $=function(id){return document.getElementById(id);};
var stage=$("gxStage");if(!stage)return;
var A=$("gxA"),B=$("gxB"),sl=$("gxSl"),Va=$("gxVa"),Vb=$("gxVb"),Vc=$("gxVc"),Vs=$("gxVs"),Vsn=$("gxVsn"),box=$("gxStBox");
var L="W",G=null,last=10;
function calc(v){var s=v,tries=100/s;return{s:s,tries:tries,cost:tries};}
function state(s){
if(s>=40)return["较高","#2f8a5b","但仍不是常规技术"];
if(s>=20)return["低","#b8791f","要反复尝试"];
if(s>=15)return["很低","#b8402f","代价开始变大"];
return["极低","#b8402f","代价巨大"];
}
function fmt(n){return Math.abs(n-Math.round(n))<0.05?""+Math.round(n):n.toFixed(1);}
function geom(){
return L==="W"?{
W:880,title:[36,40],sub:[36,61],frame:[40,84,480,320],
plot:[92,372,496,110],panel:[548,84,292,320],pT:[560,112],
dots:[576,160,40,44,8,5],info:[560,332,358,384],
bottom:[40,434,456,10],xt:390,xl:400,yl:84,tfs:12,sfs:10.5,ifs:9.4
}:{
W:360,title:[20,34],sub:[20,54],frame:[16,76,328,250],
plot:[56,300,326,104],panel:[16,344,328,200],pT:[30,372],
dots:[60,404,58,40,7,5],info:[30,570,594,618],
bottom:[20,650,674,9.5],xt:316,xl:324,yl:50,tfs:11,sfs:9.6,ifs:9.2
};
}
function render(v){
if(!G){L=(stage.clientWidth||880)>=640?"W":"N";G=geom();}
var g=G,d=calc(v),st=state(v),gx=g.plot[0],gy=g.plot[1],gx2=g.plot[2],gy2=g.plot[3];
var px=function(s){return gx+(s-5)/45*(gx2-gx);},py=function(n){return gy-Math.min(20,n)/20*(gy-gy2);};
var out=[],p=function(s){out.push(s);},i,x,y,n;
var tx=function(x,y,fs,fill,s,b){p('<text x="'+x+'" y="'+y+'" font-size="'+fs+'" fill="'+fill+'"'+(b?' font-weight="700"':'')+'>'+s+'</text>');};
tx(g.title[0],g.title[1],g.tfs,"#151a21","核移植成功率 s 与期望尝试次数",1);
tx(g.sub[0],g.sub[1],g.sfs,"#5b6875","tries = 100 / s（全部为示意值，教材未给数字）");
p('<rect x="'+g.frame[0]+'" y="'+g.frame[1]+'" width="'+g.frame[2]+'" height="'+g.frame[3]+'" rx="10" fill="#f8fbfd" stroke="#dbe7ef"/>');
for(i=0;i<=20;i+=5){y=py(i);p('<line x1="'+gx+'" y1="'+y+'" x2="'+gx2+'" y2="'+y+'" stroke="#e2e9ef" stroke-dasharray="3 4"/>');tx(g.yl,y+3,9,"#5b6875",i);}
p('<line x1="'+gx+'" y1="'+gy+'" x2="'+gx2+'" y2="'+gy+'" stroke="#98a5b1" stroke-width="1.2"/>');
p('<line x1="'+gx+'" y1="'+gy+'" x2="'+gx+'" y2="'+gy2+'" stroke="#98a5b1" stroke-width="1.2"/>');
[5,10,25,50].forEach(function(s){tx(px(s),g.xt,9,"#5b6875",s);});
tx(gx2,g.xl,9,"#5b6875","s / %");
var path=[];
for(n=5;n<=50;n++)path.push((n===5?"M":"L")+px(n).toFixed(1)+" "+py(calc(n).tries).toFixed(1));
p('<path d="'+path.join(" ")+'" fill="none" stroke="#2f6f9e" stroke-width="2"/>');
var mx=px(v),my=py(d.tries),tagX=gx+8,tagY=gy2+22;
p('<line x1="'+mx+'" y1="'+my+'" x2="'+mx+'" y2="'+gy+'" stroke="'+st[1]+'" stroke-dasharray="3 3"/>');
p('<line x1="'+gx+'" y1="'+my+'" x2="'+mx+'" y2="'+my+'" stroke="'+st[1]+'" stroke-dasharray="3 3"/>');
p('<circle cx="'+mx+'" cy="'+my+'" r="4" fill="'+st[1]+'"/>');
tx(tagX,tagY,9.6,st[1],"s="+v+"% → "+fmt(d.tries)+" 次",1);
p('<rect x="'+g.panel[0]+'" y="'+g.panel[1]+'" width="'+g.panel[2]+'" height="'+g.panel[3]+'" rx="10" fill="#ffffff" stroke="#dbe7ef"/>');
tx(g.pT[0],g.pT[1],10,"#151a21","期望要试 "+fmt(d.tries)+" 次",1);
n=Math.max(1,Math.min(20,Math.round(d.tries)));
for(i=0;i<20;i++){
x=g.dots[0]+(i%g.dots[5])*g.dots[2];y=g.dots[1]+Math.floor(i/g.dots[5])*g.dots[3];
p(i<n?'<circle cx="'+x+'" cy="'+y+'" r="'+g.dots[4]+'" fill="'+(i===n-1?"#2f8a5b":"#b8791f")+'"/>':'<circle cx="'+x+'" cy="'+y+'" r="'+g.dots[4]+'" fill="#f2f5f8" stroke="#cfd9e2"/>');}
tx(g.info[0],g.info[1],g.ifs,"#3a3a35","每次尝试：1 个卵母细胞（示意）");
tx(g.info[0],g.info[2],g.ifs,"#3a3a35","共需 "+fmt(d.cost)+" 个卵母细胞");
tx(g.info[0],g.info[3],g.ifs,"#3a3a35","也要 "+fmt(d.tries)+" 个重构胚胎");
A.innerHTML=out.join("");
B.innerHTML='<text x="'+g.bottom[0]+'" y="'+g.bottom[1]+'" font-size="'+g.bottom[3]+'" fill="#3a3a35">绿点＝最后一次成功；'+fmt(d.tries)+' 次尝试 = '+fmt(d.tries)+' 个卵母细胞（示意）</text>'
+'<text x="'+g.bottom[0]+'" y="'+g.bottom[2]+'" font-size="'+g.bottom[3]+'" fill="#3a3a35">低成功率 = 反复尝试 = 代价高，所以我国禁止生殖性克隆人。</text>';
Va.textContent=v+"%";Vb.textContent=fmt(d.tries);Vc.textContent=fmt(d.cost);
Vs.textContent=st[0];Vsn.textContent=st[2];Vs.style.color=st[1];box.style.borderColor=st[1];
box.style.background=st[1]==="#2f8a5b"?"#f2faf6":(st[1]==="#b8791f"?"#fff8ee":"#fdf1ef");
}
function setMode(auto){var ap=$("gxAp"),t=$("gxApTxt");if(ap)ap.classList.toggle("auto",!!auto);if(t)t.textContent=auto?"自动演示中":"手动拖动";}
function onChange(v){if(v===last)return;last=v;render(v);}
sl.addEventListener("input",function(){last=Number(sl.value);render(last);});
window.addEventListener("resize",function(){G=null;render(last);});
render(10);
window.__ap=AutoPilot.create({
mount:stage,follow:sl,
loop:[{t:0,v:50},{t:0.9,v:50},{t:3.4,v:25},{t:6.2,v:25},{t:9,v:5},{t:11,v:10},{t:13,v:50}],
keys:[5,10,25,50],value:10,min:5,max:50,step:5,idle:5000,onChange:onChange,onMode:setMode
});
var model={calc:calc,cases:[{v:10,eq:{tries:10}},{v:25,eq:{tries:4}},{v:50,eq:{tries:2}}]};
window.__bio=model;window.__model=model;
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();

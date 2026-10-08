(() => {
'use strict';
const M=CompressionModels,$=id=>document.getElementById(id),canvas=$('model'),ctx=canvas.getContext('2d'),kind=document.body.dataset.case;
let yaw=.9,pitch=.53,zoom=1,drag=null,pending=false;
const controls=$('controls'),defaults={};
function colors(){return matchMedia('(prefers-color-scheme: dark)').matches?{ink:'#e5edf7',muted:'#a1b1c7',grid:'#8096ad55',blue:'#7dc4ff',green:'#81d6ac',orange:'#ffc18b',bg:'#191d23'}:{ink:'#24354b',muted:'#60768e',grid:'#58759355',blue:'#237dbe',green:'#178d68',orange:'#c8731e',bg:'#ffffff'};}
function schedule(){if(!pending){pending=true;requestAnimationFrame(draw);}}
function draw(){
 pending=false;let w=canvas.clientWidth,h=canvas.clientHeight;if(w<2||h<2)return;
 const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const C=colors();ctx.font='11px system-ui';
 const raw=([x,y,z])=>{const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);return [a,z*Math.cos(pitch)-b*Math.sin(pitch),b*Math.cos(pitch)+z*Math.sin(pitch)];};
 let zLow=-1.9,zHigh=2.4;
 if(kind==='singularity-frontiers'){
  const d=+$('domain').value,r=+$('resource').value,s=+$('speed').value,scenario=$('scenario').value,mode=$('mode').value;
  for(let i=0;i<=40;i++){
   const dd=mode==='projection'?d:i/40;
   if(mode==='surface'){
    for(const rr of [-2,2]){const root=M.crossing(dd,rr,s,scenario);if(root!==null){const z=root*.32-1.7;zLow=Math.min(zLow,z-.2);zHigh=Math.max(zHigh,z+.2);}}
   }else{
    for(const t of [0,10])for(const key of ['ai','human']){const z=M.frontier(t,dd,r,s,scenario)[key]*.8;zLow=Math.min(zLow,z-.2);zHigh=Math.max(zHigh,z+.2);}
   }
  }
 }
 const bounds=[];for(const x of [-2.5,2.5])for(const y of [-1.7,1.7])for(const z of [zLow,zHigh])bounds.push(raw([x,y,z]));
 const minX=Math.min(...bounds.map(p=>p[0])),maxX=Math.max(...bounds.map(p=>p[0])),minY=Math.min(...bounds.map(p=>p[1])),maxY=Math.max(...bounds.map(p=>p[1]));
 const scale=Math.min((w-65)/(maxX-minX),(h-36)/(maxY-minY))*zoom;
 const P=p=>{const q=raw(p);return [w/2+(q[0]-(minX+maxX)/2)*scale,h/2-(q[1]-(minY+maxY)/2)*scale,q[2]];};
 function path(ps){ctx.beginPath();ps.forEach((p,i)=>{const q=P(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});}
 function line(ps,color,width=1,dash=[]){path(ps);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
 function text(p,t,color=C.ink){const q=P(p);ctx.fillStyle=color;ctx.fillText(t,q[0]+5,q[1]-4);}
 function point(p,color,r=4){const q=P(p);ctx.beginPath();ctx.arc(q[0],q[1],r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
 function faces(list){list.sort((a,b)=>b.ps.reduce((s,p)=>s+P(p)[2],0)/b.ps.length-a.ps.reduce((s,p)=>s+P(p)[2],0)/a.ps.length);for(const f of list){path(f.ps);ctx.closePath();ctx.fillStyle=f.color;ctx.fill();if(f.stroke){ctx.strokeStyle=f.stroke;ctx.lineWidth=.5;ctx.stroke();}}}
 function axes(x,y,z){const o=[-2.5,-1.6,-1.7];line([o,[2.5,-1.6,-1.7]],C.grid);line([o,[-2.5,1.7,-1.7]],C.grid);line([o,[-2.5,-1.6,2.2]],C.grid);text([2.3,-1.6,-1.7],x);text([-2.5,1.6,-1.7],y);text([-2.5,-1.6,2.2],z);}
 function inset(){const c=$('plane'),g=c.getContext('2d'),iw=c.clientWidth,ih=c.clientHeight;c.width=Math.round(iw*dpr);c.height=Math.round(ih*dpr);g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,iw,ih);g.font='10px system-ui';return {g,w:iw,h:ih};}
 if(kind==='singularity-frontiers'){
  const t=+$('time').value,d=+$('domain').value,r=+$('resource').value,speed=+$('speed').value,scenario=$('scenario').value,mode=$('mode').value;
  $('projection-options').hidden=mode!=='projection';
  const at=M.frontier(t,d,r,speed,scenario),cross=M.crossing(d,r,speed,scenario),Z=q=>q*.8;
  const pos=(t,d,q)=>[t*.5-2.5,d*3-1.5,Z(q)];
  if(mode==='projection'){
   const depth=+$('depth').value,plane=-1.7;
   const projected=(t,q)=>[t*.5-2.5,plane,Z(q)];
   const hidden=(t,q,key)=>[t*.5-2.5,key==='ai'?depth/2:-depth/2,Z(q)];
   for(const key of ['human','ai']){
    const ps=Array.from({length:81},(_,i)=>{const tt=i/8;return hidden(tt,M.frontier(tt,d,r,speed,scenario)[key],key);});
    line(ps,key==='ai'?C.blue:C.green,2.5);
    line(Array.from({length:81},(_,i)=>projected(i/8,M.frontier(i/8,d,r,speed,scenario)[key])),C.grid,1.3,[4,3]);
   }
   if(cross!==null&&cross>=0&&cross<=10){
    const q=M.frontier(cross,d,r,speed,scenario).human,pa=hidden(cross,q,'ai'),ph=hidden(cross,q,'human'),shadow=projected(cross,q);
    point(pa,C.blue,6);point(ph,C.green,6);point(shadow,C.orange,5);line([pa,shadow],C.blue,1,[4,3]);line([ph,shadow],C.green,1,[4,3]);line([pa,ph],C.orange,2);
    text(shadow,'깊이를 지운 교점',C.orange);
   }
   axes('가정 시간 t','둘째 능력 성분','첫째 로그 성능');
   point(hidden(t,at.ai,'ai'),C.blue,4);point(hidden(t,at.human,'human'),C.green,4);
  }else if(mode==='surface'){
   const list=[];for(let i=0;i<24;i++)for(let j=0;j<18;j++){
    const ps=[[i/24,j/18*4-2],[(i+1)/24,j/18*4-2],[(i+1)/24,(j+1)/18*4-2],[i/24,(j+1)/18*4-2]].map(([d,r])=>[d*5-2.5,r*.75,(M.crossing(d,r,speed,scenario)??0)*.32-1.7]);
    if(scenario==='growth')list.push({ps,color:M.crossing((i+.5)/24,(j+.5)/18*4-2,speed,scenario)<=t?'#7ed6a34a':'#78baff30',stroke:C.grid});
   }faces(list);axes('과제 조건 d','자원 r','임계 통과 t*');
   const probe=[d*5-2.5,r*.75,t*.32-1.7];point(probe,C.orange,5);text(probe,'현재 조건');
   if(cross!==null){const threshold=[d*5-2.5,r*.75,cross*.32-1.7];line([probe,threshold],C.orange,1.7,[4,3]);point(threshold,C.green,5);}
   if(scenario==='bounded')text([0,0,0],'A < H : 경계가 없음',C.orange);
  }else{
   if(mode==='curve'){
    const list=[];for(let i=0;i<22;i++)for(let j=0;j<12;j++)for(const key of ['ai','human']){
     const ps=[[i/22*10,j/12],[(i+1)/22*10,j/12],[(i+1)/22*10,(j+1)/12],[i/22*10,(j+1)/12]].map(([t,d])=>pos(t,d,M.frontier(t,d,r,speed,scenario)[key]));list.push({ps,color:key==='ai'?'#78baff20':'#7ed6a320'});
    }faces(list);
    if(scenario==='growth'){
     const boundary=Array.from({length:81},(_,i)=>{const d=i/80,t=M.crossing(d,r,speed,scenario);return pos(t,d,M.frontier(t,d,r,speed,scenario).human);});line(boundary,C.orange,3);
    }
   }
   for(let j=0;j<5;j++){
    const dd=j/4;for(const key of ['human','ai'])line(Array.from({length:81},(_,i)=>pos(i/8,dd,M.frontier(i/8,dd,r,speed,scenario)[key])),key==='ai'?C.blue:C.green,key==='ai'?2:1.3);
    const root=M.crossing(dd,r,speed,scenario);if(root!==null&&root>=0&&root<=10){const p=pos(root,dd,M.frontier(root,dd,r,speed,scenario).human);point(p,C.orange,4);text(p,root.toFixed(1),C.orange);}
    text(pos(10,dd,M.frontier(10,dd,r,speed,scenario).human),'과제 '+String.fromCharCode(65+j));
   }
   axes('가정 시간 t','과제 조건 d','로그 성능');
   const nowA=pos(t,d,at.ai),nowH=pos(t,d,at.human);line([nowA,nowH],C.orange,1.7,[3,3]);point(nowA,C.blue,5);point(nowH,C.green,5);
  }
  const I=inset(),g=I.g,X=t=>18+t*(I.w-28)/10,Y=q=>I.h-20-(q+3.5)*(I.h-36)/8;
  g.strokeStyle=C.grid;g.beginPath();g.moveTo(18,10);g.lineTo(18,I.h-20);g.lineTo(I.w-8,I.h-20);g.stroke();
  for(const key of ['human','ai']){g.beginPath();for(let i=0;i<=80;i++){const xx=i/8,yy=M.frontier(xx,d,r,speed,scenario)[key];i?g.lineTo(X(xx),Y(yy)):g.moveTo(X(xx),Y(yy));}g.strokeStyle=key==='ai'?C.blue:C.green;g.lineWidth=2;g.stroke();}
  g.strokeStyle=C.orange;g.beginPath();g.moveTo(X(t),10);g.lineTo(X(t),I.h-20);g.stroke();g.fillStyle=C.ink;g.fillText('한 조건의 A(파랑) / H(초록)',8,I.h-5);
  const count=Array.from({length:5},(_,i)=>M.crossing(i/4,r,speed,scenario)).filter(x=>x!==null&&x<=t&&x>=0).length;
  $('readout').textContent=mode==='projection'?`첫 성분의 교점 t*=${cross===null?'없음':cross.toFixed(2)} · 둘째 성분의 간격 ${Number($('depth').value).toFixed(2)}. 간격이 0이 아니면 같은 입체 점이 아닙니다.`:`설명용 함수 · ln(A/H)=${at.gap.toFixed(3)} · 선택 조건의 t*=${cross===null?'없음':cross.toFixed(2)} · 현재 t까지 통과 ${count}/5. 실측값·연도 예측이 아닙니다.`;
 }else if(kind==='moving-observer'){
  const t=+$('time').value,follow=+$('follow').value,reference=$('reference').value,landmarks=$('landmarks').checked,at=M.moving(t,follow,reference);
  const place=(t,x,lane)=>[x*.27,lane,t*.35-1.7];
  const rows=[['shownTarget',0,C.blue,'대상'],['shownObserver',1.25,C.green,'관찰자']];if(landmarks)rows.push(['shownLandmark',-1.25,C.orange,'고정 표식']);
  for(const [key,lane,color,label]of rows){const trail=Array.from({length:81},(_,i)=>{const tt=i/8;return place(tt,M.moving(tt,follow,reference)[key],lane);});line(trail,color,2);const p=place(t,at[key],lane);point(p,color,6);text(p,label,color);}
  faces([{ps:[[-2.5,-1.6,t*.35-1.7],[2.5,-1.6,t*.35-1.7],[2.5,1.6,t*.35-1.7],[-2.5,1.6,t*.35-1.7]],color:'#8ab9e014'}]);
  axes(reference==='lab'?'고정 좌표 x':'상대 좌표 x′','기록 대상','시간 t');
  const I=inset(),g=I.g,X=t=>15+t*(I.w-25)/10,Y=x=>I.h-20-(x+9)*(I.h-35)/18;
  g.strokeStyle=C.grid;g.beginPath();g.moveTo(15,10);g.lineTo(15,I.h-20);g.lineTo(I.w-8,I.h-20);g.stroke();
  for(const [key,lane,color,label]of rows){g.strokeStyle=color;g.beginPath();for(let i=0;i<=80;i++){const tt=i/8,xx=M.moving(tt,follow,reference)[key];i?g.lineTo(X(tt),Y(xx)):g.moveTo(X(tt),Y(xx));}g.stroke();}
  g.strokeStyle=C.orange;g.beginPath();g.moveTo(X(t),10);g.lineTo(X(t),I.h-20);g.stroke();g.fillStyle=C.ink;g.fillText(reference==='lab'?'고정 좌표의 이력':'관찰자 좌표의 이력',8,I.h-4);
  $('readout').textContent=`t=${t.toFixed(2)} · 고정 좌표 대상 x=${at.target.toFixed(2)} · 관찰자 x=${at.observer.toFixed(2)} · 둘 사이 Δx=${(at.target-at.observer).toFixed(2)}. 카메라 회전은 좌표 변환과 별개입니다.`;
 }else if(kind==='simpson-layers'){
  const mix=+$('mix').value,spread=+$('spread').value,a=M.aggregate(mix),list=[];
  function bar(x,y,rate,color){const z=rate*3.5-1.7,base=-1.7,dx=.22,dy=.2,corners=[[x-dx,y-dy],[x+dx,y-dy],[x+dx,y+dy],[x-dx,y+dy]];for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];list.push({ps:[[...a,base],[...b,base],[...b,z],[...a,z]],color});}list.push({ps:corners.map(p=>[...p,z]),color});return [x,y,z];}
  const labels=[];for(const [i,key]of ['A','B'].entries()){
   const x=i*2.4-1.2,color=key==='A'?'#77baff9a':'#ffc18b9a';let p=bar(x,-1.35,a.overall[key],color);labels.push([p,`${key} ${(a.overall[key]*100).toFixed(1)}%`]);
   if(spread>.015)for(let j=0;j<2;j++){const y=-1.35+(j+1)*1.45*spread,rate=a.rates[key][j],n=1000*(j===0?a.weights[key]:1-a.weights[key]);p=bar(x,y,rate,color);labels.push([p,`${key} ${rate*100}% · n=${Math.round(n)}`]);}
  }faces(list);axes('방법 A / B','집단 조건','성공 비율');labels.forEach(([p,t])=>text(p,t));text([1.5,-1.35,-1.7],'합계');if(spread>.1){text([1.5,-1.35+1.45*spread,-1.7],'쉬운 과제');text([1.5,-1.35+2.9*spread,-1.7],'어려운 과제');}
  const I=inset(),g=I.g;for(const [i,key]of ['A','B'].entries()){const x=I.w*(.3+.4*i),height=a.overall[key]*(I.h-28);g.fillStyle=key==='A'?C.blue:C.orange;g.fillRect(x-15,I.h-18-height,30,height);g.fillStyle=C.ink;g.fillText(`${key}: ${(a.overall[key]*100).toFixed(1)}%`,x-23,I.h-3);}g.fillStyle=C.muted;g.fillText('집단을 합친 비율',8,12);
  $('readout').textContent=`구성만 변경 · 쉬운 과제 비중 A ${(a.weights.A*100).toFixed(1)}% / B ${(a.weights.B*100).toFixed(1)}% · 전체 A ${(a.overall.A*100).toFixed(1)}% / B ${(a.overall.B*100).toFixed(1)}%. 집단별 A > B는 유지됩니다.`;
 }else if(kind==='mercator-area'){
  const lat=+$('latitude').value,projection=$('projection').value,show=$('comparison').checked;
  const graticule=[];for(let phi=-75;phi<=75;phi+=15)graticule.push(Array.from({length:97},(_,i)=>M.globe(i/96*2*Math.PI,phi*Math.PI/180)));for(let lon=0;lon<360;lon+=30)graticule.push(Array.from({length:61},(_,i)=>M.globe(lon*Math.PI/180,(-90+i*3)*Math.PI/180)));
  const sphere=p=>p.map(x=>x*1.75);for(const ps of graticule)line(ps.map(sphere),C.grid,.8);
  const centers=show?[0,45,70,lat]:[lat],list=[];
  centers.forEach((lat,index)=>{const p=M.patch(lat),lon=-.1+(index%3)*.7,color=index===centers.length-1?'#ffc18b80':'#7fc8ff50';for(let i=0;i<8;i++)for(let j=0;j<8;j++)list.push({ps:[[i,j],[i+1,j],[i+1,j+1],[i,j+1]].map(([i,j])=>sphere(M.globe(lon+(i/8-.5)*p.width,p.south+j/8*(p.north-p.south)))),color});text(sphere(M.globe(lon,(p.south+p.north)/2)),lat+'°');});faces(list);text([-1.9,-1.4,-1.7],'구면: 모든 색 영역의 실제 면적이 같음');
  const I=inset(),g=I.g,plotH=I.h-28,plotW=I.w-18,maxY=projection==='mercator'?2.65:1.0;
  g.strokeStyle=C.grid;for(let lon=-180;lon<=180;lon+=60){let x=9+(lon+180)/360*plotW;g.beginPath();g.moveTo(x,10);g.lineTo(x,10+plotH);g.stroke();}for(let phi=-75;phi<=75;phi+=15){let y=10+plotH/2-mapYdeg(phi)*plotH/(2*maxY);g.beginPath();g.moveTo(9,y);g.lineTo(I.w-9,y);g.stroke();}
  function mapYdeg(p){return M.mapY(p*Math.PI/180,projection);}
  centers.forEach((lat,index)=>{const p=M.patch(lat),lon=-.1+(index%3)*.7,x=9+(lon+Math.PI-p.width/2)/(2*Math.PI)*plotW,y=10+plotH/2-M.mapY(p.north,projection)*plotH/(2*maxY),ww=p.width/(2*Math.PI)*plotW,hh=(M.mapY(p.north,projection)-M.mapY(p.south,projection))*plotH/(2*maxY);g.fillStyle=index===centers.length-1?C.orange:C.blue;g.fillRect(x,y,ww,hh);});g.fillStyle=C.ink;g.fillText(projection==='mercator'?'메르카토르 평면':'원통 등적 평면',8,I.h-5);
  const p=M.patch(lat),ratio=p.mercatorArea/p.sphericalArea;
  $('readout').textContent=`중심 위도 ${lat}° · 구면 면적 ${p.sphericalArea.toFixed(4)} · 메르카토르 유한 영역 면적비 ${ratio.toFixed(2)}배 · 국소 면적배율 sec²φ=${p.localFactor.toFixed(2)}. 단위 구면·설명용 영역입니다.`;
 }
 const legend=kind==='singularity-frontiers'?($('mode').value==='surface'?'초록: 현재 t까지 통과 · 파랑: 이후 · 높이: t*':'파랑: AI · 초록: 인간 기준 · 주황: 비교 위치'):kind==='moving-observer'?'파랑: 대상 · 초록: 관찰자 · 주황: 고정 표식':kind==='simpson-layers'?'파랑: 방법 A · 주황: 방법 B · n: 표본 수':'구면의 색 영역: 같은 실제 면적';
 ctx.fillStyle=C.muted;ctx.font='11px system-ui';ctx.fillText(legend,8,15);
 canvas.dataset.camera=yaw.toFixed(4)+','+pitch.toFixed(4);canvas.dataset.zoom=zoom.toFixed(3);canvas.dataset.rendered='true';
 for(const el of controls.querySelectorAll('input[type=range]')){const out=$(el.id+'-value');if(out)out.textContent=el.value;}
}
for(const el of controls.querySelectorAll('input,select')){defaults[el.id]=el.type==='checkbox'?el.checked:el.value;el.addEventListener('input',schedule);el.addEventListener('change',schedule);}
if($('face-on'))$('face-on').addEventListener('click',()=>{yaw=0;pitch=0;schedule();});
$('reset').addEventListener('click',()=>{for(const [id,v]of Object.entries(defaults)){const el=$(id);if(el.type==='checkbox')el.checked=v;else el.value=v;}yaw=.9;pitch=.53;zoom=1;schedule();});
canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);canvas.focus();});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.008;pitch=Math.max(-1.45,Math.min(1.45,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];schedule();});for(const k of ['pointerup','pointercancel'])canvas.addEventListener(k,()=>drag=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.4,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));schedule();},{passive:false});
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','0'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch=Math.min(1.45,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(-1.45,pitch-.1);if(e.key==='+'||e.key==='=')zoom=Math.min(4,zoom*1.15);if(e.key==='-')zoom=Math.max(.4,zoom/1.15);if(e.key==='0'){yaw=.9;pitch=.53;zoom=1;}schedule();}});
new ResizeObserver(schedule).observe(canvas);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',schedule);schedule();
})();

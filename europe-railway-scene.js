(() => {
 'use strict';
 const D=window.CaseData,M=window.EuropeRailway,C=M.compile(D),$=id=>document.getElementById(id),cv=$('model');
 let zoom=1,yaw=.28,pitch=.75,pan=[0,0],request=0,hits=[],pointer=null,moved=false,lastScenario;
 const palette=['#53b4ed','#efb366','#bd8cec','#64c6a5','#ef8ca6','#e3ce61','#76cfdc','#aab5ff'];
 const dark=()=>matchMedia('(prefers-color-scheme: dark)').matches;
 const color=id=>(dark()?palette:['#177eac','#a4620b','#8050ab','#248065','#b64767','#927900','#238792','#5967ae'])[(id-1)%palette.length];
 const xy=n=>[(n.lon-10)*Math.cos(50*Math.PI/180),n.lat-50];
 const val=id=>Number($(id).value);
 const pause=()=>{if($('player-toggle')?.getAttribute('aria-pressed')==='true')$('player-toggle').click();};
 function schedule(){if(!request)request=requestAnimationFrame(()=>{request=0;draw();});}
 function set(id,value){const e=$(id);if(e.type==='checkbox')e.checked=!!value;else e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));}
 function state(){return M.scenario(C,{amplitude:val('offset'),aligned:$('aligned').checked,count:val('count'),unsafe:$('unsafe').checked});}
 function setup(){const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=Math.max(1,Math.round(r.width*d));cv.height=Math.max(1,Math.round(r.height*d));const c=cv.getContext('2d');c.scale(d,d);return {c,w:r.width,h:r.height};}
 function line(c,pts,stroke,width=1,dash=[]){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=stroke;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);}
 function dot(c,p,fill,r=3){c.beginPath();c.arc(p[0],p[1],r,0,2*Math.PI);c.fillStyle=fill;c.fill();}
 function text(c,t,x,y,size=12,fill){c.font=`${size>=16?'650':'500'} ${size}px system-ui`;c.fillStyle=fill|| (dark()?'#ecf2f8':'#243249');c.fillText(t,x,y);}
 function panel(c,x,y,w,h){c.fillStyle=dark()?'#142234e8':'#f6faffed';c.fillRect(x,y,w,h);}
 function stationName(id){return C.nodes[id].label;}
 function eventsFor(s,id){return (s.byNode[id]||[]).map(e=>({...e,planned:s.trains[e.train-1].planned.find(p=>p.node===id).time,local:e.time+s.offsets[id]}));}
 function stationTable(s){const id=$('station').value,events=eventsFor(s,id);$('events-caption').textContent=stationName(id)+' · 공통 기준 통과 시각';$('events').replaceChildren();
  for(const e of events){const tr=document.createElement('tr');const collision=s.conflicts.some(k=>k.node===id&&(k.a===e.train||k.b===e.train));for(const t of ['T'+e.train,M.timeText(e.planned),M.timeText(e.time),collision?'겹침':'분리']){const td=document.createElement('td');td.textContent=t;tr.append(td);}if(collision)tr.className='risk';$('events').append(tr);}
  if(!events.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='선택한 열차 수에서 통과 기록 없음';tr.append(td);$('events').append(tr);}
 }
 function draw(){const s=state();lastScenario=s;const {c,w,h}=setup(),mode=$('mode').value,time=val('progress')*s.horizon,station=$('station').value,err=s.offsets[station];
  c.fillStyle=dark()?'#0f1926':'#e8f0f7';c.fillRect(0,0,w,h);hits=[];
  $('rail-params').hidden=mode==='sync';$('sync-params').hidden=mode!=='sync';$('camera-controls').hidden=mode!=='cube';
  $('offset-value').textContent=val('offset').toFixed(0)+'분';$('delay-value').textContent=val('delay').toFixed(1)+'분';$('zoom-info').textContent=zoom.toFixed(2)+'×';
  $('clock-reference').textContent=M.timeText(time);$('clock-station').textContent=M.timeText(time+err);$('clock-label').textContent=stationName(station)+' 시계';
  const active=s.trains.filter(t=>M.position(t,time).active).length,current=s.conflicts.filter(k=>time>=k.from&&time<=k.to),base=M.scenario(C,{amplitude:0,count:val('count'),unsafe:$('unsafe').checked});
  $('metrics').textContent=`60개 도시 · 84개 구간 · ${s.trains.length}개 열차 경로\n현재 운행 ${active}대 · 현재 겹침 ${current.length}건\n전 구간 점유 창 겹침 ${s.conflicts.length}건 (동기화 후 ${base.conflicts.length}건)`;
  $('sync-status').textContent=$('aligned').checked?'모든 역의 시계 보정 적용':'역별 가상 시계 오차 적용';$('sync-status').className=$('aligned').checked?'ok':'risk';
  if(mode==='map'||mode==='cube')map(c,w,h,s,time,mode==='cube');else if(mode==='timeline')timeline(c,w,h,s,time);else signal(c,w,h,s,time);
  stationTable(s);
  if(mode==='sync'){const q=M.sync(err,val('delay'));$('readout').textContent=`기준 A 송신 0.00분 → ${stationName(station)} 반환 ${q.receive.toFixed(2)}분 → A 수신 ${q.returned.toFixed(2)}분. 보정 ${q.correction.toFixed(2)}분. 편도 지연은 절차를 읽기 위한 가상 값.`;}
  else $('readout').textContent='실선은 선택한 열차 경로, 번호는 이동하는 열차. 빨간 점은 시계 오차로 점유 창이 겹치는 역. 위치는 도시 대표점이며 시간표·속도·공유 분기점은 설명용 가정입니다.';
 }
 function map(c,w,h,s,time,cube){const err=s.offsets[$('station').value],region=$('region').value,center=region==='junction'?xy(C.nodes[$('station').value]):[0,0];
  const raw=(n,t=0)=>{let [x,y]=xy(n);x-=center[0];y-=center[1];const z=cube?t/s.horizon*7:0;return cube?[Math.cos(yaw)*x-Math.sin(yaw)*y,Math.cos(pitch)*(Math.sin(yaw)*x+Math.cos(yaw)*y)+Math.sin(pitch)*z]:[x,y];};
  const pts=cube?s.trains.flatMap(t=>t.events.map(e=>raw(C.nodes[e.node],e.time))):D.nodes.map(n=>raw(n));
  let loX=Math.min(...pts.map(p=>p[0])),hiX=Math.max(...pts.map(p=>p[0])),loY=Math.min(...pts.map(p=>p[1])),hiY=Math.max(...pts.map(p=>p[1]));
  if(region==='junction'&&!cube){loX=-3;hiX=3;loY=-2.5;hiY=2.5;}
  const sc=Math.min((w-60)/(hiX-loX),(h-105)/(hiY-loY))*.94*zoom,cx=(loX+hiX)/2,cy=(loY+hiY)/2;
  function project(n,t=0){const p=raw(n,t);return [w/2+pan[0]+(p[0]-cx)*sc,(h+6)/2+pan[1]-(p[1]-cy)*sc];}
  c.save();c.beginPath();c.rect(0,49,w,h-92);c.clip();
  for(const ring of D.land){c.beginPath();ring.forEach(([lon,lat],i)=>{const p=project({lon,lat});i?c.lineTo(...p):c.moveTo(...p);});c.closePath();c.fillStyle=dark()?'#223242':'#d8e3d7';c.fill();c.strokeStyle=dark()?'#4c6670':'#9baeb1';c.lineWidth=.8;c.stroke();}
  for(let lon=0;lon<=20;lon+=5)line(c,[project({lon,lat:44}),project({lon,lat:56})],dark()?'#728a9b25':'#7991a930',.7);
  for(let lat=45;lat<=55;lat+=5)line(c,[project({lon:-1,lat}),project({lon:21,lat})],dark()?'#728a9b25':'#7991a930',.7);
  for(const [a,b]of D.edges)line(c,[project(C.nodes[a]),project(C.nodes[b])],dark()?'#96a8bc65':'#64778d80',1.2);
  const focus=val('train');
  for(const t of s.trains){c.globalAlpha=focus&&t.id!==focus ? .10 : cube ? .6 : .38;const pts=t.events.map(e=>project(C.nodes[e.node],e.time));line(c,pts,color(t.id),focus===t.id?3.5:1.6);}
  c.globalAlpha=1;
  const conflictNodes=new Set(s.conflicts.map(k=>k.node)),selected=$('station').value,major=new Set(['Paris','Brussels','Cologne','Frankfurt','Berlin','Hamburg','Leipzig','Prague','Vienna','Munich','Zurich','Lyon','Wroclaw']);
  const boxes=[];for(const t of s.trains){if(focus&&t.id!==focus)continue;const p=M.position(t,time);if(!p.active)continue;const a=C.nodes[p.from],b=C.nodes[p.to],q=project({lon:a.lon+(b.lon-a.lon)*p.f,lat:a.lat+(b.lat-a.lat)*p.f},cube?time:0);boxes.push({x:q[0]-6,y:q[1]-12,w:34,h:18});}
  for(const n of D.nodes){const p=project(n);hits.push({p,id:n.id});dot(c,p,n.id===selected?'#ffd166':(conflictNodes.has(n.id)?'#ef7785':(dark()?'#c9d4df':'#4a6175')),n.id===selected?6:2.5);
   if(!major.has(n.id)&&n.id!==selected)continue;if(p[0]<0||p[0]>w||p[1]<55||p[1]>h-50)continue;
   c.font='11px system-ui';const tw=c.measureText(n.label).width;let bx=p[0]+6,by=p[1]-6;
   for(let k=0;k<10&&boxes.some(b=>bx<b.x+b.w&&bx+tw>b.x&&by-12<b.y+14&&by>b.y);k++)by+=13;
   if(by>h-50)by=p[1]-20;if(Math.abs(by-p[1])>18)line(c,[p,[bx,by-4]],dark()?'#97adbd':'#6b7c8c',.7);bx=Math.min(w-tw-5,Math.max(5,bx));boxes.push({x:bx,y:by-12,w:tw,h:14});panel(c,bx-2,by-12,tw+4,15);text(c,n.label,bx,by,11,n.id===selected?'#c18710':undefined);
  }
  for(const t of s.trains){if(focus&&t.id!==focus)continue;const p=M.position(t,time);if(!p.active)continue;const a=C.nodes[p.from],b=C.nodes[p.to],n={lon:a.lon+(b.lon-a.lon)*p.f,lat:a.lat+(b.lat-a.lat)*p.f},at=project(n,cube?time:0);dot(c,at,color(t.id),6);panel(c,at[0]+6,at[1]-12,20,15);text(c,String(t.id),at[0]+8,at[1],11);}
  if(cube){const n=C.nodes[selected];line(c,[project(n,0),project(n,s.horizon)],'#e2b451',1.5,[4,4]);for(const e of s.byNode[selected]||[])dot(c,project(n,e.time),color(e.train),4);const end=project(n,s.horizon);text(c,'시간 ↑',end[0]+5,end[1],12,'#c18710');}
  c.restore();panel(c,0,0,w,48);text(c,cube?'철도망을 시공간 경로로 펼치기':'중부유럽 철도망 · 주요 연결의 지리 모형',12,21,14);text(c,cube?'동서·남북 위치 + 기준 시간 높이 (고도가 아님)':`${s.trains.length}개 경로 · 점유 겹침 ${s.conflicts.length}건 / 동기화 후 ${M.scenario(C,{amplitude:0,count:val('count'),unsafe:$('unsafe').checked}).conflicts.length}건`,12,40,11);
  panel(c,0,h-43,w,43);text(c,`${M.timeText(time)} · ${stationName(selected)} 시계 ${err>=0?'+':''}${err.toFixed(1)}분`,12,h-25,12);text(c,cube?'드래그: 회전 · ±: 배율 · 역 선택: 시간축':'역 클릭: 통과 기록 · 드래그: 이동 · ±: 배율',12,h-9,11);
 }
 function timeline(c,w,h,s,time){const id=$('station').value,ev=eventsFor(s,id),range=240/zoom,lo=time-range/2,hi=time+range/2,left=54,right=w-18,top=85,bottom=h-55;panel(c,0,0,w,60);text(c,stationName(id)+' · 분기점 점유 시간',12,23,15);text(c,'회색: 시간표 / 색: 실제 통과 · 막대 폭 10분',12,44,12);const x=t=>left+(t-lo)/(hi-lo)*(right-left),visible=ev.filter(e=>Math.max(e.planned,e.time)>=lo-20&&Math.min(e.planned,e.time)<=hi+20),dy=Math.min(40,(bottom-top)/Math.max(visible.length,1));
  c.save();c.beginPath();c.rect(left,top-15,right-left,bottom-top+35);c.clip();
  for(let t=Math.ceil(lo/30)*30;t<=hi;t+=30){line(c,[[x(t),top-15],[x(t),bottom]],dark()?'#5e748944':'#67788d44',1);text(c,M.timeText(t),x(t)-16,bottom+20,10);}
  for(const [i,e]of visible.entries()){const y=top+i*dy;line(c,[[x(e.planned-5),y-5],[x(e.planned+5),y-5]],dark()?'#becbd880':'#66738880',6);line(c,[[x(e.time-5),y+5],[x(e.time+5),y+5]],color(e.train),7);const risk=s.conflicts.some(k=>k.node===id&&(k.a===e.train||k.b===e.train));if(risk)text(c,'겹침',x(e.time+7),y+9,10,dark()?'#ff90a0':'#b0263e');}
  line(c,[[x(time),top-15],[x(time),bottom]],'#e2b451',2,[4,3]);c.restore();visible.forEach((e,i)=>text(c,'T'+e.train,10,top+i*dy+4,12));if(!visible.length)text(c,'이 시간 주변에 통과하는 열차가 없습니다.',12,90,12);text(c,'가로: 공통 기준 시각 · 재생/슬라이더로 시간 이동',12,h-16,11);
 }
 function signal(c,w,h,s){const id=$('station').value,err=s.offsets[id],q=M.sync(err,val('delay')),p=val('progress'),x0=50,x1=w-50,y0=100,y1=Math.max(160,h-90);text(c,'왕복 신호로 정하는 원격 시각',12,23,15);text(c,'동일한 편도 지연 · 즉시 반환 · 일정한 시계 속도',12,46,11);line(c,[[x0,y0],[x0,y1]],'#6badcf',2);line(c,[[x1,y0],[x1,y1]],'#c091e2',2);text(c,'기준 A',x0-20,y0-20,12);text(c,stationName(id)+' B',Math.max(x0+40,x1-85),y0-20,12);const ymid=(y0+y1)/2;line(c,[[x0,y0],[x1,ymid],[x0,y1]],'#e6b553',2,[5,4]);const phase=p*2,pos=phase<=1?[x0+(x1-x0)*phase,y0+(ymid-y0)*phase]:[x1-(x1-x0)*(phase-1),ymid+(y1-ymid)*(phase-1)];dot(c,pos,'#ffd166',7);text(c,'송신 0.00분',x0+7,y0+17,11);if(p>=.5)text(c,`반환 ${q.receive.toFixed(2)}분`,Math.max(x0+35,x1-135),ymid-12,12);if(p>=.999){text(c,`수신 ${q.returned.toFixed(2)}분`,x0+7,y1-10,11);panel(c,10,h-69,w-20,57);text(c,`중간값 ${q.target.toFixed(2)}분 → 보정 ${q.correction.toFixed(2)}분`,20,h-45,13);text(c,'같은 절차를 각 역에 적용하면 기준 시각을 공유합니다.',20,h-23,11);}}
 for(const e of document.querySelectorAll('.controls input,.controls select'))e.addEventListener('input',()=>{if(e.id==='offset')$('aligned').checked=false;schedule();});
 $('show-controls').onclick=()=>{$('controls').scrollIntoView({behavior:'smooth',block:'start'});};$('back-model').onclick=()=>{document.body.scrollTo({top:0,behavior:'smooth'});};
 $('show-conflict').onclick=()=>{pause();const s=state(),k=s.conflicts[0];if(k){set('station',k.node);set('progress',k.time/s.horizon);set('mode','timeline');}else set('mode','timeline');};
 $('sync-method').onclick=()=>{pause();set('mode','sync');set('progress',0);};
 $('apply-sync').onclick=()=>{pause();const s=state();for(const offset of Object.values(s.offsets))if(Math.abs(M.sync(offset,val('delay')).residual)>1e-9)throw Error('Residual synchronization error');if($('mode').value==='sync')set('progress',window.CaseSpec.defaults.progress);set('aligned',true);set('mode','map');};
 $('restore-errors').onclick=()=>{pause();set('aligned',false);set('unsafe',false);set('mode','map');};
 $('reset').onclick=()=>{pause();for(const [id,v]of Object.entries(window.CaseSpec.defaults))set(id,v);zoom=1;pan=[0,0];yaw=.28;pitch=.75;schedule();};
 $('front').onclick=()=>{yaw=0;pitch=.5;pan=[0,0];schedule();};$('oblique').onclick=()=>{yaw=.28;pitch=.75;pan=[0,0];schedule();};
 cv.addEventListener('pointerdown',e=>{pointer=[e.clientX,e.clientY];moved=false;cv.setPointerCapture(e.pointerId);});cv.addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer[0],dy=e.clientY-pointer[1];if(Math.abs(dx)+Math.abs(dy)>2)moved=true;if($('mode').value==='cube'){yaw+=dx*.006;pitch=M.clamp(pitch+dy*.006,.15,1.45);}else if($('mode').value==='map'){pan[0]+=dx;pan[1]+=dy;}pointer=[e.clientX,e.clientY];schedule();});
 cv.addEventListener('pointerup',e=>{if(pointer&&!moved&&$('mode').value==='map'){const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,hit=hits.map(n=>({...n,d:Math.hypot(n.p[0]-x,n.p[1]-y)})).sort((a,b)=>a.d-b.d)[0];if(hit&&hit.d<20)set('station',hit.id);}pointer=null;});cv.addEventListener('pointercancel',()=>pointer=null);
 cv.addEventListener('wheel',e=>{e.preventDefault();zoom=M.clamp(zoom*Math.exp(-e.deltaY*.001),.4,5);schedule();},{passive:false});cv.addEventListener('keydown',e=>{if(['+','=','-'].includes(e.key)){zoom=M.clamp(zoom*(e.key==='-'?.8:1.25),.4,5);e.preventDefault();schedule();}if(e.key.startsWith('Arrow')){e.preventDefault();if($('mode').value==='cube'){yaw+=(e.key==='ArrowRight'?.12:e.key==='ArrowLeft'?-.12:0);pitch=M.clamp(pitch+(e.key==='ArrowDown'?.12:e.key==='ArrowUp'?-.12:0),.15,1.45);}else{pan[0]+=(e.key==='ArrowRight'?15:e.key==='ArrowLeft'?-15:0);pan[1]+=(e.key==='ArrowDown'?15:e.key==='ArrowUp'?-15:0);}schedule();}});
 new ResizeObserver(schedule).observe(cv);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',schedule);schedule();
})();

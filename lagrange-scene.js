(()=>{
'use strict';
const M=window.LagrangeModel,D=window.LagrangeData.systems,$=id=>document.getElementById(id),cv=$('model'),map=$('projection-map'),pi=Math.PI,blue='#62b6e9',orange='#efac62',green='#62c8a7',purple='#ba91ec';
let yaw=.5,pitch=.65,zoom=1,drag=null,request=0;const dark=()=>matchMedia('(prefers-color-scheme:dark)').matches,num=x=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:0}).format(x);
function setup(c){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle=dark()?'#171e27':'#f4f8fd';ctx.fillRect(0,0,r.width,r.height);return{ctx,w:r.width,h:r.height};}
function base(bound,center){return{bound,center,items:[],labels:[],head:[]};}
const line=(s,pts,color,width=1,alpha=1)=>s.items.push({kind:'line',points:pts,color,width,alpha}),face=(s,pts,color,alpha=.35)=>s.items.push({kind:'face',points:pts,color,alpha});
function point(s,p,color,r=4,label=''){s.items.push({kind:'point',points:[p],color,r,alpha:1});if(label)s.labels.push({p,text:label,color});}
function circle(r,n=180){return Array.from({length:n+1},(_,i)=>[r*Math.cos(2*pi*i/n),r*Math.sin(2*pi*i/n),0]);}
function axes(s,names){const e=s.bound*.55;for(let i=0;i<3;i++){const a=s.center.slice(),b=s.center.slice();a[i]-=e;b[i]+=e;line(s,[a,b],dark()?'#64778f':'#95aac2',.7,.6);s.labels.push({p:b,text:names[i],color:dark()?'#c8d9ec':'#3c5670'});}}
const missions=window.LagrangeMissions.missions,pink='#e589c8',utc=t=>new Date(t*1000).toISOString().replace('T',' ').slice(0,19)+' UTC';
let missionOptionsKey='',missionCache=null;
function missionUI(){
 const key=$('trajectory').value,active=key!=='ideal';$('mission-controls').hidden=!active;$('ideal-controls').hidden=active;
 $('view').querySelector('[value="approach"]').disabled=!active;
 $('frame').querySelector('[value="rotating"]').textContent=active?'태양–지구 방향 회전계':'두 천체와 도는 회전계';
 $('frame').querySelector('[value="inertial"]').textContent=active?'태양 중심 · 고정된 황도 방향':'질량중심 관성계';
 $('view').querySelector('[value="local"]').textContent=active?'지구 주변 · 같은 길이 척도':'선택점 주변';
 $('progress').parentElement.firstChild.textContent=active?'선택 구간 시간 ':'모형 시간 · 한 주기 ';
 if(!active){if($('view').value==='approach')$('view').value='local';return;}
 $('frame').querySelector('[value="inertial"]').disabled=false;$('view').querySelector('[value="global"]').disabled=false;$('view').querySelector('[value="local"]').disabled=false;
 const m=missions[key];if(missionOptionsKey!==key){missionOptionsKey=key;$('mission-window').replaceChildren(...m.windows.map(w=>{const o=document.createElement('option');o.value=w.id;o.textContent=w.label;return o;}));
  $('mission-events').replaceChildren(...m.events.map(event=>{const b=document.createElement('button');b.textContent=event.label;b.type='button';b.addEventListener('click',()=>{
   const w=m.windows.find(w=>w.id===(event.time>=m.separation?'capsule':event.label.includes('L1 진입')?'halo':event.label.includes('귀환')||event.label.includes('지구 접근')||event.label.includes('7월')?'return':event.label.includes('L2 진입')?'halo':'outbound'))||m.windows.at(-1);
   $('mission-window').value=w.id;$('view').value=['capsule','entry'].includes(w.id)?'approach':'local';$('progress').value=Math.max(0,Math.min(1,(event.time-w.start)/(w.end-w.start)));zoom=1;pause();schedule();
  });return b;}));
 }
 const w=m.windows.find(w=>w.id===$('mission-window').value),t=M.missionTime(w,Number($('progress').value));
 $('mission-period').textContent=utc(w.start)+' → '+utc(w.end)+'. '+m.quality+'.';
 [...$('mission-events').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(Math.abs(t-m.events[i].time)<Math.max(1,(w.end-w.start)*.0005))));
 if($('player-description'))$('player-description').textContent='실제 경과 시간 · '+((w.end-w.start)<86400?((w.end-w.start)/3600).toFixed(2)+'시간':((w.end-w.start)/86400).toFixed(1)+'일')+' 압축';
}
function missionPhase(key,m,t){if(key==='webb')return t<m.windows.find(w=>w.id==='halo').start?{label:'지구에서 L2로 접근',color:green}:{label:'L2 주변 운동',color:orange};if(t>=m.separation)return{label:'본체 통과 · 분리 캡슐 접근',color:purple};if(t>=m.windows.find(w=>w.id==='return').start)return{label:'L1에서 L2 부근을 거쳐 귀환',color:purple};if(t>=m.windows.find(w=>w.id==='halo').start)return{label:'L1 주변 체류',color:orange};return{label:'발사 뒤 L1로 접근',color:green};}
function missionTrail(rows,m,w,frame){
 const a=rows.filter(row=>row[0]>=w.start&&row[0]<=w.end),lo=Math.max(w.start,rows[0][0]),hi=Math.min(w.end,rows.at(-1)[0]);if(hi<lo)return[];
 const step=Math.max(1,Math.ceil(a.length/900)),times=[lo,...a.filter((_,i)=>i%step===0).map(row=>row[0]),hi];
 return [...new Set(times)].sort((a,b)=>a-b).map(t=>({t,p:M.missionPosition(M.ephemeris(rows,t),M.ephemeris(m.sun,t),frame)}));
}
function missionScene(){
 missionUI();const key=$('trajectory').value,m=missions[key],w=m.windows.find(w=>w.id===$('mission-window').value),frame=$('frame').value,t=M.missionTime(w,Number($('progress').value)),sun=M.ephemeris(m.sun,t),bus=M.ephemeris(m.states,t),cap=m.capsule?M.ephemeris(m.capsule,t):null,phase=missionPhase(key,m,t),Q=q=>M.missionPosition(q,sun,frame),earth=Q([0,0,0]),global=$('view').value==='global',approach=$('view').value==='approach';
 const b=global?1.65e8:approach?(w.id==='entry'?18000:90000):2.35e6,center=global?(frame==='inertial'?[0,0,0]:Q(sun)):earth,s=base(b,center),sunP=Q(sun),current=Q(bus);
 axes(s,frame==='inertial'?['X','Y','Z']:['x · 태양 반대','y','z']);
 const cacheKey=key+':'+w.id+':'+frame;if(!missionCache||missionCache.key!==cacheKey)missionCache={key:cacheKey,bus:missionTrail(m.states,m,w,frame),capsule:m.capsule?missionTrail(m.capsule,m,w,frame):[],earth:missionTrail(m.sun.map(a=>[a[0],0,0,0,0,0,0]),m,w,frame)};
 function trail(a,capsule=false){let previous=null;for(const row of a){if(previous){const col=capsule?pink:missionPhase(key,m,row.t).color;line(s,[previous.p,row.p],col,1.2,.27);if(previous.t<t){const next=row.t<=t?row.p:(capsule?Q(cap):current);if(next)line(s,[previous.p,next],col,2.4,.95);}}previous=row;}}
 if(global&&frame==='inertial')line(s,missionCache.earth.map(a=>a.p),blue,1,.35);
 trail(missionCache.bus);trail(missionCache.capsule,true);
 if(approach){const r=6378;for(let k=0;k<3;k++)line(s,circle(r,90).map(p=>{if(k===1)return[earth[0]+p[0],earth[1],earth[2]+p[1]];if(k===2)return[earth[0],earth[1]+p[0],earth[2]+p[1]];return p.map((v,i)=>v+earth[i]);}),blue,1.7,.9);point(s,earth,blue,2,'지구 · 기준 구 R 6,378 km');}else point(s,earth,blue,6,'지구');
 if(global)point(s,sunP,orange,9,'태양');
 const dist=Math.hypot(...sun.slice(0,3)),basis=M.sunBasis(sun),S=D['sun-earth'];
 for(const i of[0,1]){const rel=S.points[i].map((a,j)=>(a-(j===0?1-S.mass_ratio:0))*dist);const p=frame==='rotating'?rel:rel.map((_,j)=>earth[j]+rel.reduce((sum,v,k)=>sum+v*basis[k][j],0));if(M.distance(p,center)<b*1.8)point(s,p,purple,4,'L'+(i+1)+' · 근사');}
 point(s,current,phase.color,5,key==='webb'?'웹':'본체');if(cap){s.labels.at(-1).dy=-18;point(s,Q(cap),pink,5,'캡슐');s.labels.at(-1).dy=18;}
 const measure=cap||bus,q=cap?Q(cap):current,z=M.missionPosition(measure,sun,'rotating')[2];
 if(!global&&!approach){line(s,missionCache.bus.map(a=>[a.p[0],a.p[1],earth[2]]),blue,1,.15);line(s,[q,[q[0],q[1],earth[2]]],blue,1,.5);}
 s.head=[`${m.name} · ${phase.label}`,utc(t)];
 $('metrics').textContent=`${cap?'캡슐':'우주선'}의 지구 중심 거리 ${num(Math.hypot(...measure.slice(0,3)))} km · 지구 상대 속력 ${Math.hypot(...measure.slice(3,6)).toFixed(3)} km/s · 회전계 공간 z ${num(z)} km. ${cap?'본체의 지구 중심 거리 '+num(Math.hypot(...bus.slice(0,3)))+' km. ':''} 반폭 ${num(b)} km · x·y·z 같은 척도.`;
 const span=(w.end-w.start)/86400;
 $('readout').textContent=`${frame==='rotating'?'날짜별 태양–지구 방향에 맞춘 회전 좌표':'태양 중심, 고정된 J2000 황도 방향'+(global?'':' · 시야 중심은 현재 지구')}. 초록 출발 · 주황 체류 · 보라 귀환/본체 · 분홍 분리 캡슐. 옅은 선은 선택 구간 전체, 진한 선은 현재까지. ${cap?'캡슐은 대기 진입까지의 항법 예측이며 착륙 궤적은 아님. ':''}${w.id==='outbound'?m.coverage_note+' ':''}${approach?'지구 기준 구만 실제 길이 비례.':'점의 표시 크기는 기호 크기.'} L1·L2는 이상 모형의 근사 기준.`;
 missionProjection(s);return s;
}
function missionProjection(s){const{ctx:c,w,h}=setup(map),sc=Math.min(w-30,h-48)/(2*s.bound),P=p=>[w/2+(p[0]-s.center[0])*sc,(h+20)/2-(p[1]-s.center[1])*sc];c.font='10px system-ui';c.fillStyle=dark()?'#c5d6eb':'#3e5874';c.fillText('동일 경로의 x–y 투영 · 공간 z 생략',6,14);c.save();c.beginPath();c.rect(5,22,w-10,h-40);c.clip();for(const a of s.items){if(a.kind==='face')continue;c.globalAlpha=a.alpha;c.strokeStyle=a.color;c.fillStyle=a.color;c.lineWidth=a.width||1;c.beginPath();if(a.kind==='point'){c.arc(...P(a.points[0]),Math.min(a.r,4),0,2*pi);c.fill();}else{a.points.forEach((p,i)=>i?c.lineTo(...P(p)):c.moveTo(...P(p)));c.stroke();}}c.restore();c.globalAlpha=1;c.fillStyle=dark()?'#c5d6eb':'#3e5874';c.fillText('가로·세로 같은 척도 · 반폭 '+num(s.bound)+' km',6,h-8);}

function controls(){const potential=$('mode').value==='potential';if(potential){$('frame').value='rotating';$('view').value='local';}if($('frame').value==='inertial')$('view').value='global';$('frame').querySelector('[value="inertial"]').disabled=potential;$('view').querySelector('[value="global"]').disabled=potential;$('view').querySelector('[value="local"]').disabled=$('frame').value==='inertial';}
function scene(){missionUI();if($('trajectory').value!=='ideal')return missionScene();if($('player-description'))$('player-description').textContent='시간 전개 · 이상 CR3BP 궤도';controls();const key=$('system').value,S=D[key],mu=S.mass_ratio,li=Number($('point').value),L=S.points[li-1],orbit=S.orbits[String(li)],f=Number($('progress').value),T=orbit?orbit.period:2*pi,t=f*T,potential=$('mode').value==='potential',inertial=$('frame').value==='inertial',local=$('view').value==='local',Q=p=>inertial?M.rotate(p,t):p;
 const bounds=key==='sun-earth'?[.007,.007,.18,.2,.2]:[.12,.14,.22,.24,.24],surfaceBounds=key==='sun-earth'?[.006,.006,.16,.2,.2]:[.12,.14,.2,.2,.2];
 const b=local?(potential?surfaceBounds[li-1]:bounds[li-1]):1.4,center=local?L:[0,0,0],s=base(b,center),primary=key==='sun-earth'?'태양':'지구',secondary=key==='sun-earth'?'지구':'달';
 let q=null,current=null,trail=[];if(orbit){q=M.state(orbit,f);current=inertial?M.rotate(q,t):q.slice(0,3);trail=orbit.states.filter((_,i)=>i%3===0).map(a=>inertial?M.rotate(a.slice(1,4),a[0]):a.slice(1,4));}
 if(!potential){axes(s,['x','y','z']);if(!local){line(s,circle(1-mu),blue,1,.25);line(s,[Q([-1.15,0,0]),Q([1.25,0,0])],blue,.8,.4);line(s,[Q([-mu,0,0]),Q(S.points[3]),Q([1-mu,0,0]),Q(S.points[4]),Q([-mu,0,0])],green,.8,.3);}
  const p1=Q([-mu,0,0]),p2=Q([1-mu,0,0]);for(const[p,label,color,r]of[[p1,primary,orange,9],[p2,secondary,blue,6]])if(M.distance(p,center)<b*1.7)point(s,p,color,r,label);
  S.points.forEach((p,i)=>{const v=Q(p);if(M.distance(v,center)<b*1.7)point(s,v,i===li-1?purple:green,i===li-1?5:3,i===li-1||i>=2||key==='earth-moon'?'L'+(i+1):'');});
  if(orbit){line(s,trail,orange,1.5,.55);const reached=orbit.states.filter((a,i)=>i%3===0&&a[0]<=t).map(a=>inertial?M.rotate(a.slice(1,4),a[0]):a.slice(1,4));line(s,[...reached,current],orange,2.6,.95);point(s,current,orange,6,'모형 위치');if(local){const flat=trail.map(p=>[p[0],p[1],0]);line(s,flat,blue,1,.35);line(s,[current,[current[0],current[1],0]],blue,1,.65);}}
  s.head=[`${primary}–${secondary} · ${inertial?'질량중심 관성계':'두 천체와 도는 회전계'}`,orbit?`L${li} 헤일로 · ${(t*S.tunit/86400).toFixed(1)} / ${(T*S.tunit/86400).toFixed(1)}일`:`L${li} 평형점 · 계의 한 공전 주기 비교`];
 }else{
  axes(s,['Δx','Δy','ΔV_eff']);const V0=-M.potential(L,mu),N=30,grid=Array.from({length:N+1},(_,i)=>Array.from({length:N+1},(_,j)=>{const p=[L[0]-b+2*b*i/N,L[1]-b+2*b*j/N,0];if(Math.min(Math.hypot(p[0]+mu,p[1]),Math.hypot(p[0]-1+mu,p[1]))<b*.09)return null;return{p,v:-M.potential(p,mu)-V0};}));
  const max=Math.max(...grid.flat().filter(Boolean).map(a=>Math.abs(a.v))),scale=b*.65/max;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=[grid[i][j],grid[i+1][j],grid[i+1][j+1],grid[i][j+1]];if(a.every(Boolean)){face(s,a.map(q=>[q.p[0],q.p[1],q.v*scale]),a.reduce((sum,q)=>sum+q.v,0)>=0?orange:blue,.38);if(i%5===0)line(s,[a[0],a[3]].map(q=>[q.p[0],q.p[1],q.v*scale]),blue,.6,.6);}}
  point(s,L,purple,6,'L'+li);if(orbit){const onSurface=p=>[p[0],p[1],(-M.potential([p[0],p[1],0],mu)-V0)*scale];line(s,trail.map(onSurface),orange,1.6,.8);point(s,onSurface(q),orange,5,'투영 위치');}s.head=[`L${li} 주변 · 회전계 퍼텐셜`,'높이 = −Ω(x,y,0) − [−Ω(L)] · 공간 z와 다름'];s.surface=`ΔV_eff 표시 범위 ±${max.toExponential(2)}. 높이 척도 ${scale.toExponential(2)} 길이단위/퍼텐셜단위.`;
 }
 const distanceEarth=key==='sun-earth'?M.distance(L,[1-mu,0,0]):M.distance(L,[-mu,0,0]),stability=li<=3?'선형 불안정':'선형 안정 (이상 모형의 작은 교란)';
 $('metrics').textContent=`L${li} · ${stability}. 지구에서 약 ${num(distanceEarth*S.lunit)} km. ${orbit?`예시 궤도 주기 ${(T*S.tunit/86400).toFixed(2)}일. ${potential?`투영 위치의 시간 ${(t*S.tunit/86400).toFixed(1)}일.`:`현재 공간 z ${num(q[2]*S.lunit)} km.`}`:'선택점에는 헤일로 궤도를 표시하지 않습니다.'} ${potential?s.surface:local?'x·y·z에 같은 길이 척도.'+(orbit?' 파랑은 z=0 투영.':''):'전체 계의 공간 척도.'+(key==='sun-earth'?' L1·L2는 지구 가까이 겹쳐 보입니다.':'')}`;
 $('readout').textContent=potential?'높이는 z=0 평면 위 유효 퍼텐셜 차입니다. '+(orbit?'주황은 궤도의 x–y 투영을 이 그래프 위에 올린 표시이며, 실제 공간 z는 아닙니다. ':'선택점의 국소 퍼텐셜은 회전계에서 시간에 따라 바뀌지 않습니다. ')+'색은 기준값보다 높은/낮은 값.':inertial?'질량중심 관성계 · 점과 천체도 함께 이동합니다. 주황 전체 선은 표시한 시간 구간의 궤적이며, 회전계에서 닫힌 헤일로도 관성계에서는 같은 모양으로 닫히지 않습니다.':orbit?'회전계 · 주황은 CR3BP 헤일로 해, 파랑은 궤도의 평면 투영. 재생은 계산된 궤도 시간이며 실제 우주선 관측 자료가 아닙니다.':'회전계에서 L1–L5는 z=0에 있는 고립된 점입니다. 관성계로 바꾸면 ‘고정’이 좌표계에 의존한다는 사실을 확인할 수 있습니다.';
 if(!potential&& !local)$('readout').textContent+=' 천체와 점의 표시 반지름은 가독성을 위한 기호 크기입니다.';
 projection(s,S,li,t,orbit,q,inertial,potential);return s;
}
function projection(scene,S,li,t,orbit,q,inertial,potential){const{ctx:c,w,h}=setup(map),b=scene.bound,center=scene.center,L=20,T=26,W=w-30,H=h-50,sc=Math.min(W,H)/(2*b),P=p=>[w/2+(p[0]-center[0])*sc,(h+T)/2-(p[1]-center[1])*sc];c.font='10px system-ui';c.fillStyle=dark()?'#c5d6eb':'#3e5874';c.fillText(potential?'공간 z=0 · 퍼텐셜 그래프의 정의역':`위에서 본 x–y 투영 · ${inertial?'관성계':'회전계'}`,6,14);c.save();c.beginPath();c.rect(8,22,w-16,h-40);c.clip();
 function dot(p,color,r){c.fillStyle=color;c.beginPath();c.arc(...P(p),r,0,2*pi);c.fill();}function path(a,color){c.strokeStyle=color;c.lineWidth=1.3;c.beginPath();a.forEach((p,i)=>i?c.lineTo(...P(p)):c.moveTo(...P(p)));c.stroke();}
 path([[center[0]-b,center[1],0],[center[0]+b,center[1],0]],dark()?'#53677e':'#a3b3c5');path([[center[0],center[1]-b,0],[center[0],center[1]+b,0]],dark()?'#53677e':'#a3b3c5');
 if(orbit&&!potential){path(orbit.states.filter((_,i)=>i%4===0).map(a=>inertial?M.rotate(a.slice(1,4),a[0]):a.slice(1,4)),orange);dot(inertial?M.rotate(q,t):q,orange,3.5);}
 S.points.forEach((p,i)=>dot(inertial?M.rotate(p,t):p,i===li-1?purple:green,i===li-1?4:2));c.restore();c.fillStyle=dark()?'#c5d6eb':'#3e5874';c.fillText(`가로·세로 같은 척도 · 반폭 ${num(b*S.lunit)} km`,6,h-8);
}
function render(s){const{ctx:c,w,h}=setup(cv),sc=Math.min(w-38,h-102)/(2*s.bound)*zoom,project=p=>{const v=p.map((a,i)=>a-s.center[i]),xx=Math.cos(yaw)*v[0]-Math.sin(yaw)*v[1],yy=Math.sin(yaw)*v[0]+Math.cos(yaw)*v[1],zz=Math.cos(pitch)*v[2]-Math.sin(pitch)*yy,depth=Math.sin(pitch)*v[2]+Math.cos(pitch)*yy;return[w/2+xx*sc,h*.54-zz*sc,depth];};
 const primitives=[];for(const item of s.items){if(item.kind==='line'){for(let i=0;i<item.points.length-1;i++)primitives.push({...item,projected:[project(item.points[i]),project(item.points[i+1])]});}else primitives.push({...item,projected:item.points.map(project)});}for(const p of primitives)p.depth=p.projected.reduce((a,q)=>a+q[2],0)/p.projected.length;primitives.sort((a,b)=>b.depth-a.depth);c.save();c.beginPath();c.rect(0,53,w,h-75);c.clip();
 for(const p of primitives){c.globalAlpha=p.alpha;c.strokeStyle=p.color;c.fillStyle=p.color;c.lineWidth=p.width||.5;c.beginPath();if(p.kind==='point'){c.arc(p.projected[0][0],p.projected[0][1],p.r,0,2*pi);c.fill();}else{p.projected.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));if(p.kind==='face'){c.closePath();c.fill();}else c.stroke();}}
 c.globalAlpha=1;for(const{p,text,color,dx,dy}of s.labels){const q=project(p);if(q[0]<0||q[0]>w||q[1]<55||q[1]>h-20)continue;c.font='bold 11px system-ui';c.fillStyle=color;c.fillText(text,q[0]+(dx??6),q[1]+(dy??-6));}c.restore();c.fillStyle=dark()?'#dfebfb':'#29425f';c.font='bold 11px system-ui';s.head.forEach((text,i)=>c.fillText(text,8,18+17*i));c.font='10px system-ui';c.fillText(`드래그/방향키 회전 · +− 배율 ${zoom.toFixed(2)}×`,8,h-8);$('zoom-info').textContent=zoom.toFixed(2)+'×';$('progress-value').textContent=(Number($('progress').value)*100).toFixed(1)+'%';
}
function schedule(){if(!request)request=requestAnimationFrame(()=>{request=0;render(scene());});}function pause(){$('progress').dispatchEvent(new Event('input',{bubbles:true}));}
for(const el of document.querySelectorAll('.controls input,.controls select'))el.addEventListener('input',()=>{if(['trajectory','mission-window'].includes(el.id)){missionUI();$('progress').value=0;$('view').value=['capsule','entry'].includes($('mission-window').value)?'approach':'local';zoom=1;pause();}if(['system','point'].includes(el.id)){$('progress').value=0;if($('mode').value==='space'&&$('frame').value==='rotating')$('view').value=Number($('point').value)<=2?'local':'global';pause();}schedule();});
$('reset').addEventListener('click',()=>{$('trajectory').value='webb';missionOptionsKey='';missionUI();$('system').value='sun-earth';$('point').value='2';$('view').value='local';$('mode').value='space';$('frame').value='rotating';$('progress').value=0;yaw=.5;pitch=.65;zoom=1;pause();schedule();});
$('front').addEventListener('click',()=>{yaw=0;pitch=-pi/2;pause();schedule();});$('oblique').addEventListener('click',()=>{yaw=.5;pitch=.65;pause();schedule();});
cv.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId);pause();});cv.addEventListener('pointerup',()=>drag=null);cv.addEventListener('pointercancel',()=>drag=null);cv.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.009;pitch=Math.max(-1.57,Math.min(1.57,pitch+(e.clientY-drag[1])*.009));drag=[e.clientX,e.clientY];schedule();});cv.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));pause();schedule();},{passive:false});
cv.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch=Math.min(1.57,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(-1.57,pitch-.1);if(e.key==='+')zoom=Math.min(4,zoom*1.2);if(e.key==='-')zoom=Math.max(.35,zoom/1.2);pause();schedule();});
$('show-controls').addEventListener('click',()=>{document.body.dataset.controlsVisible='true';$('controls').scrollIntoView({block:'start'});$('back-model').focus({preventScroll:true});});$('back-model').addEventListener('click',()=>{document.body.scrollTop=0;document.body.dataset.controlsVisible='false';cv.focus({preventScroll:true});});document.body.addEventListener('scroll',()=>{if(document.body.scrollTop<20)document.body.dataset.controlsVisible='false';});new ResizeObserver(schedule).observe(cv);new ResizeObserver(schedule).observe(map);matchMedia('(prefers-color-scheme:dark)').addEventListener('change',schedule);schedule();
})();

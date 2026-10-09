(function(){
 'use strict';
 const M=window.Inference,spec=window.CaseSpec,$=id=>document.getElementById(id),cv=$('model'),cx=cv.getContext('2d');
 const colors=['#4b9cda','#e49a40','#65b88a','#ba83cf','#dd7687','#849cbb'];
 let yaw=-.55,pitch=.4,zoom=1,pending=false,cache={};
 const value=id=>Number($(id).value), choice=id=>$(id).value, fmt=(x,n=2)=>x===null?'—':Number(x).toFixed(n);
 let scene,plotJobs=[];
 function newScene(bound=2){scene={bound,center:[0,0,0],items:[],labels:[]};plotJobs=[];}
 function line(points,color=colors[0],width=2,dash=false){scene.items.push({points,color,width,dash,type:'line'});}
 function face(points,color,alpha=.15){scene.items.push({points,color,alpha,type:'face'});}
 function point(pos,color=colors[0],radius=3){scene.items.push({points:[pos],color,radius,type:'point'});}
 function label(pos,text,color){scene.labels.push({pos,text,color});}
 function arrow(a,b,color=colors[1]){scene.items.push({points:[a,b],color,width:2.5,type:'arrow'});}
 function ring(center,a,b,color,r=1){line(Array.from({length:65},(_,i)=>M.add(center,M.add(M.scale(a,r*Math.cos(i*Math.PI/32)),M.scale(b,r*Math.sin(i*Math.PI/32))))),color,2);}
 function axes(names,length=1.5){let origin=[-length,-length,-length*.5];for(let i=0;i<3;i++){let end=origin.slice();end[i]+=length*1.5;arrow(origin,end,colors[i]);label(end,names[i],colors[i]);}}
 function info(head,metrics){$('scene-title').textContent=head;$('metrics').textContent=metrics;}
 function plot(id,title,fn){$(id).setAttribute('aria-label',title);plotJobs.push(()=>drawPlot(id,title,fn));}
 function textLines(a,text,x,y,width,lineHeight=16){let line='';for(let ch of text){if(line&&a.ctx.measureText(line+ch).width>width){a.ctx.fillText(line,x,y);line=ch;y+=lineHeight;}else line+=ch;}a.ctx.fillText(line,x,y);return y;}
 function prepare(canvas){const r=canvas.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);let w=Math.max(2,r.width),h=Math.max(2,r.height);if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}let ctx=canvas.getContext('2d');ctx.setTransform(d,0,0,d,0,0);let dark=matchMedia('(prefers-color-scheme: dark)').matches;ctx.clearRect(0,0,w,h);return {ctx,w,h,ink:dark?'#e7edf6':'#263c54',quiet:dark?'#aab7c8':'#60758b',grid:dark?'#384a60':'#d9e3ee',dark};}
 function drawPlot(id,title,fn){let a=prepare($(id));a.ctx.font='12px sans-serif';a.ctx.fillStyle=a.ink;a.ctx.fillText(title,10,17);fn(a);}
 function chart(a,xlim,ylim,xname,yname){let {ctx,w,h,quiet,grid}=a,left=38,top=31,bottom=h-26,right=w-14;let X=x=>left+(x-xlim[0])/(xlim[1]-xlim[0])*(right-left),Y=y=>bottom-(y-ylim[0])/(ylim[1]-ylim[0])*(bottom-top);ctx.strokeStyle=grid;ctx.lineWidth=1;ctx.strokeRect(left,top,right-left,bottom-top);ctx.font='11px sans-serif';ctx.fillStyle=quiet;ctx.textAlign='center';ctx.fillText(xname,(left+right)/2,h-5);ctx.textAlign='left';ctx.fillText(yname,5,30);for(let t of [0,.5,1]){ctx.fillText(fmt(ylim[0]+t*(ylim[1]-ylim[0]),1),2,Y(ylim[0]+t*(ylim[1]-ylim[0]))+4);ctx.textAlign='center';ctx.fillText(fmt(xlim[0]+t*(xlim[1]-xlim[0]),1),X(xlim[0]+t*(xlim[1]-xlim[0])),bottom+13);ctx.textAlign='left';}return {X,Y,left,right,top,bottom};}
 function curve(a,points,X,Y,color,width=2){a.ctx.strokeStyle=color;a.ctx.lineWidth=width;a.ctx.beginPath();points.forEach(([x,y],i)=>i?a.ctx.lineTo(X(x),Y(y)):a.ctx.moveTo(X(x),Y(y)));a.ctx.stroke();}
 function image(a,data,n,x,y,w,h,max=1.2){let c=document.createElement('canvas');c.width=n;c.height=n;let g=c.getContext('2d'),im=g.createImageData(n,n);data.forEach((v,i)=>{let t=Math.max(0,Math.min(1,v/max));im.data[4*i]=Math.round(244*(1-t)+45*t);im.data[4*i+1]=Math.round(248*(1-t)+143*t);im.data[4*i+2]=Math.round(252*(1-t)+185*t);im.data[4*i+3]=255;});g.putImageData(im,0,0);a.ctx.imageSmoothingEnabled=false;a.ctx.drawImage(c,x,y,w,h);}
 function ct(){
  let theta=value('angle')*M.rad,which=choice('phantom'),count=value('count'),coverage=value('coverage'),noise=value('noise');newScene(1.45);
  for(let e of M.phantom(which))for(let k=0;k<3;k++){
   let u=k===0?[e.a,0,0]:k===1?[e.a,0,0]:[0,e.b,0],v=k===0?[0,e.b,0]:[0,0,e.z];
   ring([e.x,e.y,0],u,v,e.density===1?colors[1]:colors[0]);
  }
  let n=[Math.cos(theta),Math.sin(theta),0],beam=[-Math.sin(theta),Math.cos(theta),0];
  for(let i=-5;i<=5;i++){let c=M.scale(n,i*.17);line([M.add(c,M.scale(beam,-1.2)),M.add(c,M.scale(beam,1.2))],colors[2],1);}
  line([M.add(M.scale(beam,1.23),M.scale(n,-1.1)),M.add(M.scale(beam,1.23),M.scale(n,1.1))],colors[3],3);
  face([[-1,-1,0],[1,-1,0],[1,1,0],[-1,1,0]],colors[0],.08);label([.9,.9,0],'재구성 단면 z=0');label(M.scale(beam,1.3),'검출기');
  let key=[which,count,coverage,noise].join(':');if(cache.ctkey!==key){cache.ct=M.reconstruct(which,count,coverage,noise);cache.ctkey=key;}let r=cache.ct;
  let diff=Math.max(...Array.from({length:121},(_,i)=>Math.abs(M.projection(theta,-1.2+i*.02,'A')-M.projection(theta,-1.2+i*.02,'B'))));
  info(`평행 빔 · 내부 ${which} · 관측각 ${fmt(value('angle'),0)}°`,`A/B 투영 최대 차이 ${fmt(diff,3)} · 단면 RMSE ${fmt(r.error,3)}. 선적분은 단면 사진이 아닙니다.`);
  plot('plot-a','선적분 · 파랑 A / 주황 B',a=>{let c=chart(a,[-1.2,1.2],[0,1.1],'검출기 좌표 t','감쇠');for(let [id,col] of [['A',colors[0]],['B',colors[1]]])curve(a,Array.from({length:161},(_,i)=>[-1.2+i*.015,M.projection(theta,-1.2+i*.015,id)]),c.X,c.Y,col);});
  plot('plot-b',`원본 / FBP / sinogram (${count}각)`,a=>{let gap=8,s=Math.min((a.w-36)/3,a.h-44),y=31;image(a,r.truth,r.size,8,y,s,s);image(a,r.image,r.size,16+s,y,s,s);let x=24+2*s;a.ctx.fillStyle=a.grid;a.ctx.fillRect(x,y,s,s);for(let j=0;j<count;j++)for(let i=0;i<r.detector;i++){let t=Math.max(0,Math.min(1,r.sino[j][i]));a.ctx.fillStyle=`rgb(${245-200*t},${250-105*t},${252-50*t})`;a.ctx.fillRect(x+i*s/r.detector,y+j*s/count,s/r.detector+.5,s/count+.5);}a.ctx.fillStyle=a.quiet;a.ctx.font='11px sans-serif';a.ctx.fillText('t → / 각도 ↓',x,y+s+13);});
 }
 function rotation(){
  let order=choice('order'),a=value('yaw'),b=value('pitch'),c=value('roll'),r=M.euler(a,b,c,order),q=M.quaternion(a,b,c,order);newScene(2);
  let vertices=[[-.8,-.45,-.3],[.8,-.45,-.3],[.8,.45,-.3],[-.8,.45,-.3],[-.8,-.45,.3],[.8,-.45,.3],[.8,.45,.3],[-.8,.45,.3]].map(p=>M.mv(r,p));
  for(let f of [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[1,2,6,5],[0,3,7,4]]){face(f.map(i=>vertices[i]),colors[0],.15);line(f.map(i=>vertices[i]).concat([vertices[f[0]]]),colors[0]);}
  let partial=M.eye();for(let i=0;i<3;i++){
   let axis=order[i],idx='XYZ'.indexOf(axis),aidx=(idx+1)%3,bidx=(idx+2)%3,base=M.eye();ring([0,0,0],M.mv(partial,base[aidx]),M.mv(partial,base[bidx]),colors[i],1.15+i*.18);let axisVector=M.mv(partial,base[idx]);arrow([0,0,0],M.scale(axisVector,1.7),colors[i]);label(M.scale(axisVector,1.8),`${i+1} ${axis}`,colors[i]);partial=M.mm(partial,M.rotation(axis,[a,b,c][i]*M.rad));
  }
  for(let i=0;i<3;i++)arrow([0,0,0],M.mv(r,M.scale(M.eye()[i],1)),colors[i]);
  let recovered=order==='ZYX'?M.recoverZYX(r):null;
  info(`${order} · 두 회전축의 정렬을 비교`,`|cos(둘째 각)| = ${fmt(Math.abs(Math.cos(b*M.rad)),3)} · q = [${q.map(v=>fmt(v,3)).join(', ')}] · |q| = ${fmt(M.norm(q),3)}. 물체의 자세는 계속 정의됩니다.`);
  plot('plot-a','회전행렬 R · 열 = 물체 축',a=>{a.ctx.font='13px monospace';a.ctx.fillStyle=a.ink;r.forEach((row,i)=>a.ctx.fillText(row.map(v=>fmt(v,3).padStart(7)).join(' '),12,44+i*25));a.ctx.font='12px sans-serif';a.ctx.fillText(order==='ZYX'?(recovered?'주값 각: '+recovered.map(v=>fmt(v,1)).join(' / ')+'°':'주값 각: 비유일 (±90°)'):'다른 순서도 둘째 각 ±90°에서 특이',12,125);});
  plot('plot-b','부호가 반대인 q와 −q: 같은 자세',a=>{let y=39;for(let [name,sgn,col] of [['q',1,colors[0]],['−q',-1,colors[1]]]){a.ctx.fillStyle=col;a.ctx.fillText(name,12,y);q.forEach((v,i)=>{let x=60+i*(a.w-78)/4,w=(a.w-90)/4;a.ctx.fillRect(x,y-8,w/2*sgn*v,5);a.ctx.fillText(fmt(sgn*v,2),x,y+20);});y+=54;}});
 }
 function selection(){
  let sigma=value('noise'),center=value('center'),width=value('width'),mode=choice('selection'),variable=choice('variable'),s=M.selection(sigma,center,width,mode,variable),set=new Set(s.selected);newScene(5);scene.center=[0,0,0];
  for(let p of s.points)point(p,set.has(p)?colors[1]:colors[0],set.has(p)?2.7:1.3);
  if(variable==='C')for(let z of mode==='band'?[center-width/2,center+width/2]:[center])face([[-3,-3,z],[3,-3,z],[3,3,z],[-3,3,z]],colors[1],.14);
  else for(let x of mode==='band'?[center-width/2,center+width/2]:[center])face([[x,-3,-5],[x,3,-5],[x,3,5],[x,-3,5]],colors[1],.12);
  axes(['X','Y','C = X+Y+σε'],3);
  info(`합성 표본 2400 · 주황 = 선택된 ${s.selected.length}`,`전체 r=${fmt(s.all,3)} / 선택 r=${fmt(s.observed,3)}. C를 정확히 고정한 이론 r=${fmt(s.thinTheory,3)}; 유한 폭·문턱값과 구별합니다.`);
  for(let [id,title,points] of [['plot-a','전체 표본 · X와 Y',s.points],['plot-b','선택 후 표본 · X와 Y',s.selected]])plot(id,title,a=>{let c=chart(a,[-3.5,3.5],[-3.5,3.5],'X','Y');a.ctx.save();a.ctx.beginPath();a.ctx.rect(c.left,c.top,c.right-c.left,c.bottom-c.top);a.ctx.clip();a.ctx.fillStyle=id==='plot-a'?colors[0]+'90':colors[1]+'a0';for(let p of points){a.ctx.beginPath();a.ctx.arc(c.X(p[0]),c.Y(p[1]),1.4,0,2*Math.PI);a.ctx.fill();}a.ctx.restore();});
 }
 const nodePositions={A:[-1.4,-.7],B:[-.45,-.7],C:[.5,-.7],D:[1.45,-.7],E:[1.45,.7],F:[-.45,.7]};
 function temporal(){
  let events=M.contacts[choice('order')],time=value('time'),start=value('start'),source=choice('source'),memory=choice('memory')==='forever'?Infinity:1.5,result=M.reachable(events,source,start,time,memory);newScene(3);scene.center=[0,0,2];
  for(let [n,[x,y]] of Object.entries(nodePositions)){line([[x,y,0],[x,y,4.2]],colors[5],1);label([x,y,4.4],n);for(let t of result.history[n]||[])line([[x,y,t*.7],[x,y,Math.min(time,t+memory)*.7]],colors[2],3);point([x,y,time*.7],result.retaining.includes(n)?colors[2]:colors[5],5);}
  for(let [a,b,t] of events){let u=[...nodePositions[a],t*.7],v=[...nodePositions[b],t*.7],used=result.used.some(e=>e[2]===t&&((e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)));line([u,v],t>time?colors[5]:used?colors[1]:colors[0],used?4:2,t>time);}
  label([-1.6,.9,4.2],'높이 = 모형 시간 (0–6)');
  info(`시간 ${fmt(time,1)} · ${source}에서 시작 (${fmt(start,1)})`,`누적 도달: ${Object.keys(result.arrival).sort().join(', ')}. ${memory===Infinity?'정보를 계속 보유':'1.5시간 뒤 정보 소멸 · 접촉 때 갱신'}. 동시 접촉은 한 묶음에서 한 번만 전달합니다.`);
  plot('plot-a','시간을 합친 그래프 · 같은 연결선',a=>{let X=x=>a.w/2+x*(a.w-60)/3.4,Y=y=>a.h/2-y*(a.h-60)/2;for(let [n,p] of Object.entries(nodePositions)){a.ctx.fillStyle=colors[0];a.ctx.beginPath();a.ctx.arc(X(p[0]),Y(p[1]),5,0,2*Math.PI);a.ctx.fill();a.ctx.fillStyle=a.ink;a.ctx.fillText(n,X(p[0])+8,Y(p[1])+5);}for(let [u,v] of events)curve(a,[nodePositions[u],nodePositions[v]],X,Y,colors[5],1.5);});
  plot('plot-b','접촉 원장 · 순서가 경로를 결정',a=>{a.ctx.fillStyle=a.ink;a.ctx.font='12px sans-serif';let step=Math.min(22,(a.h-46)/5);events.forEach(([u,v,t],i)=>{a.ctx.fillStyle=t<=time?colors[0]:a.quiet;a.ctx.fillText(`t=${t}    ${u} ↔ ${v}`,14,36+i*step);});});
 }
 function stress(){
  let principal=[value('s1'),value('s2'),value('s3')],s=M.stress(principal,value('azimuth'),value('polar'),value('frame'));newScene(1.7);
  for(let z of [-.8,.8]){let ps=[[-.8,-.8,z],[.8,-.8,z],[.8,.8,z],[-.8,.8,z],[-.8,-.8,z]];line(ps,colors[5],1);}for(let x of [-.8,.8])for(let y of [-.8,.8])line([[x,y,-.8],[x,y,.8]],colors[5],1);
  let u=M.unit(M.cross(s.n,Math.abs(s.n[2])<.9?[0,0,1]:[0,1,0])),v=M.cross(s.n,u),plane=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>M.add(M.scale(u,.8*a),M.scale(v,.8*b)));face(plane,colors[0],.25);line([...plane,plane[0]],colors[0]);
  arrow([0,0,0],s.n,colors[2]);label(s.n,'법선 n',colors[2]);arrow([0,0,0],M.scale(s.traction,.09),colors[1]);label(M.scale(s.traction,.09),'면의 힘 t',colors[1]);arrow([0,0,0],M.scale(s.n,s.normalStress*.09),colors[0]);arrow(M.scale(s.n,s.normalStress*.09),M.scale(s.traction,.09),colors[3]);
  info('같은 응력 · 자르는 면의 방향만 변화',`σn=${fmt(s.normalStress)} MPa · |τ|=${fmt(s.shearMagnitude)} MPa. 좌표축을 돌려도 이 두 값과 주응력은 유지됩니다. 화살표는 0.09 화면단위/MPa입니다.`);
  plot('plot-a','모어의 원 · 3D 면의 (σn, |τ|)',a=>{let lo=Math.min(...principal)-1,hi=Math.max(...principal)+1,c=chart(a,[lo,hi],[0,(hi-lo)/2],'σn (MPa)','|τ|');for(let [i,j] of [[0,1],[0,2],[1,2]]){let mid=(principal[i]+principal[j])/2,r=Math.abs(principal[i]-principal[j])/2;curve(a,Array.from({length:81},(_,k)=>[mid+r*Math.cos(k*Math.PI/80),r*Math.sin(k*Math.PI/80)]),c.X,c.Y,colors[5],1);}a.ctx.fillStyle=colors[1];a.ctx.beginPath();a.ctx.arc(c.X(s.normalStress),c.Y(s.shearMagnitude),4,0,2*Math.PI);a.ctx.fill();});
  plot('plot-b',`회전한 좌표의 σ′ · ${fmt(value('frame'),0)}°`,a=>{a.ctx.font='13px monospace';a.ctx.fillStyle=a.ink;s.components.forEach((row,i)=>a.ctx.fillText(row.map(v=>fmt(v,2).padStart(6)).join(' '),12,45+i*23));a.ctx.font='12px sans-serif';a.ctx.fillText(`주응력: ${principal.join(', ')} MPa`,12,125);});
 }
 function phase(){
  let T=value('temperature'),v=value('volume'),raw=$('raw').checked,c=M.coexist(T);newScene(2.7);scene.center=[2.5,0,1];
  const pos=(t,x,p)=>[x,(t-1)*8,p];
  for(let ti=0;ti<=16;ti++){let t=.85+ti*.35/16,ps=[];for(let vi=0;vi<=90;vi++){let x=.5+vi*4.5/90,p=M.pressure(t,x);if(p>-.15&&p<3)ps.push(pos(t,x,p));}line(ps,colors[5],1);}
  for(let vi=0;vi<=18;vi++){let x=.55+vi*4.45/18,ps=[];for(let ti=0;ti<=30;ti++){let t=.85+ti*.35/30,p=M.pressure(t,x);if(p>-.15&&p<3)ps.push(pos(t,x,p));}line(ps,colors[5],.7);}
  point([1,0,1],colors[3],4);label([1,0,1],'임계점',colors[3]);
  let iso=[];for(let i=0;i<=240;i++){let x=.5+i*4.5/240,p=M.pressure(T,x);if(p>-.15&&p<3)iso.push(pos(T,x,p));}if(raw||!c)line(iso,colors[0],2);
  let equi=iso.map(p=>c&&p[0]>c.liquid&&p[0]<c.gas?[p[0],p[1],c.p]:p);line(equi,colors[2],3);
  let p=c&&v>c.liquid&&v<c.gas?c.p:M.pressure(T,v);point(pos(T,v,p),colors[1],6);if(c){point(pos(T,c.liquid,c.p),colors[3],5);point(pos(T,c.gas,c.p),colors[3],5);label(pos(T,c.liquid,c.p),'액체');label(pos(T,c.gas,c.p),'기체');}
  label([4.9,-1.3,0],'v = V/Vc');label([.5,1.7,0],'T/Tc');label([.5,-1.3,2.9],'p/pc');
  let fraction=c&&v>=c.liquid&&v<=c.gas?(v-c.liquid)/(c.gas-c.liquid):null;
  info(`환산 온도 ${fmt(T,3)} · ${T<1?'임계점 아래':T===1?'임계점':'임계점 위'}`,c?`공존 p=${fmt(c.p,3)}, v액=${fmt(c.liquid,3)}, v기=${fmt(c.gas,3)} · ${fraction===null?'단일상 가지':`기체 몰분율 ${fmt(fraction,2)}`}. 녹색 = 평형 등온선; 파랑 = 균질 vdW 가지.`:`공존 구간 없음 · p=${fmt(p,3)}. 반데르발스 근사이며 실제 물의 정량 모형은 아닙니다.`);
  scene.bound=Math.max(2.7,Math.abs(p-1)+.4);
  plot('plot-a','등온선'+' · 균질 / 평형 공존선',a=>{let hi=Math.max(2.3,p*1.08),ch=chart(a,[.5,5],[-.1,hi],'v/Vc','p/pc'),pts=Array.from({length:251},(_,i)=>[.5+i*4.5/250,M.pressure(T,.5+i*4.5/250)]).filter(p=>p[1]<hi);if(raw||!c)curve(a,pts,ch.X,ch.Y,colors[0]);curve(a,pts.map(([x,y])=>[x,c&&x>c.liquid&&x<c.gas?c.p:y]),ch.X,ch.Y,colors[2]);a.ctx.fillStyle=colors[1];a.ctx.beginPath();a.ctx.arc(ch.X(v),ch.Y(p),4,0,2*Math.PI);a.ctx.fill();});
  plot('plot-b','두 상의 몰분율 · 같은 T,p',a=>{let f=fraction===null?(c?(v<c.liquid?0:1):null):fraction;a.ctx.font='12px sans-serif';a.ctx.fillStyle=a.ink;let y=textLines(a,c?`평균 v=${fmt(v,2)} · 면적 오차 ${c.area.toExponential(1)}`:'임계점 이상: 액체–기체 공존 구간 없음',12,40,a.w-24);if(f!==null){y+=13;let w=a.w-32;a.ctx.fillStyle=colors[0];a.ctx.fillRect(16,y,w*(1-f),16);a.ctx.fillStyle=colors[1];a.ctx.fillRect(16+w*(1-f),y,w*f,16);a.ctx.fillStyle=a.ink;textLines(a,`액체 ${fmt(1-f,2)} / 기체 ${fmt(f,2)}`,16,y+32,a.w-32);}a.ctx.fillStyle=a.quiet;a.ctx.font='11px sans-serif';a.ctx.fillText('좌표: 부피 · 온도 · 압력',12,a.h-8);});
 }
 function redshift(){
  let dispersion=value('velocity'),H0=value('hubble'),direction=value('direction'),mode=choice('space'),s=M.redshift(dispersion,H0,direction);newScene(22);scene.center=[0,0,0];
  for(let [i,p] of s.points.entries()){if(mode!=='observed')point(p.real,colors[0],2.3);if(mode!=='real')point(p.observed,colors[1],2.1);if($('connect').checked&&mode==='both'&&i%7===0)line([p.real,p.observed],colors[5],.8);}
  arrow(M.scale(s.n,-19),M.scale(s.n,18),colors[2]);label(M.scale(s.n,-20),'관측자 방향 (150 Mpc 떨어짐)',colors[2]);label([0,0,19],'좌표: Mpc');
  info('파랑: 합성 실제 위치 / 주황: 적색편이 거리',`시선 속도 표준편차 ${fmt(dispersion,0)} km/s · H₀=${fmt(H0,0)} km/s/Mpc · 시선 방향 퍼짐 ${fmt(s.trueSpread)} → ${fmt(s.redshiftSpread)} Mpc. 카메라 회전은 이 관측 방향을 바꾸지 않습니다.`);
  let extent=Math.max(20,...s.points.map(p=>Math.abs(M.dot(p.observed,s.n))))*1.05;scene.bound=Math.max(22,extent*.8);
  let perp=[-s.n[1],s.n[0],0];for(let [id,key,title,col] of [['plot-a','real','모형 실제 위치 · 시선/수직 단면',colors[0]],['plot-b','observed','적색편이 공간 · 같은 단면',colors[1]]])plot(id,title,a=>{let c=chart(a,[-extent,extent],[-10,10],'시선 방향 (Mpc)','수직');a.ctx.save();a.ctx.beginPath();a.ctx.rect(c.left,c.top,c.right-c.left,c.bottom-c.top);a.ctx.clip();a.ctx.fillStyle=col+'b0';for(let p of s.points){let x=M.dot(p[key],s.n),y=M.dot(p[key],perp);a.ctx.beginPath();a.ctx.arc(c.X(x),c.Y(y),1.6,0,2*Math.PI);a.ctx.fill();}a.ctx.restore();});
 }
 function phylo(){
  let gene=choice('gene'),transfer=$('transfer').checked,time=value('history'),mode=choice('network'),m=M.phylogeny(gene,transfer,time);newScene(2.7);scene.center=[0,0,2];
  $('history').disabled=mode==='split';
  for(let id of ['player-toggle','player-start','player-seek','player-speed'])if($(id))$(id).disabled=mode==='split';
  if($('player-description'))$('player-description').textContent=mode==='split'?'분할 비교 · 시간축과 사건 재생 없음':'합성 역사의 단계 전개 · 실제 계통의 발견 기록은 아님';
  if(mode==='split'){
   let p={A:[-1,-1,0],B:[1,-1,0],C:[1,1,0],D:[-1,1,0]};
   if(transfer){line([p.A,p.B,p.C,p.D,p.A],colors[5],3);line([[-1.5,0,0],[1.5,0,0]],colors[0],2,true);line([[0,-1.5,0],[0,1.5,0]],colors[1],2,true);}
   else{line([p.A,[0,-.6,0],p.B],colors[5],3);line([p.C,[0,.6,0],p.D],colors[5],3);line([[0,-.6,0],[0,.6,0]],colors[0],3);}
   for(let [n,q] of Object.entries(p)){point(q,colors[0],5);label(M.scale(q,1.2),n);}label([0,0,1.4],'분할 비교: 시간·전달 사건을 뜻하지 않음');
   info('분할 비교 · AB|CD와 AD|BC',`두 유전자 나무의 사분류군 분할 ${transfer?'2개 (서로 충돌)':'1개'}. 사각형은 충돌하는 분할의 비교 도식이며 전달 사건의 관측 증거가 아닙니다.`);
  }else{
   let pos=n=>{let v=m.nodes[n];return [v.x,v.y,v.time];};
   for(let [a,b] of m.visible){let selected=m.selected.some(e=>e[0]===a&&e[1]===b),donor=a==='c'&&b==='H';line([pos(a),pos(b)],donor?colors[1]:selected?colors[0]:colors[5],selected?3:1.5,!selected);}
   for(let [n,v] of Object.entries(m.nodes))if(v.time<=time){point(pos(n),n==='H'?colors[1]:colors[2],4);label(M.add(pos(n),[.1,0,.08]),n==='H'?'전달 접점':n);}
   label([-2,0,4.5],'높이 = 합성 역사 (0→4)');info(`유전자 ${gene}의 계보 · 시간 ${fmt(time,1)}`,`합성 나무 ${(gene==='B'&&transfer)?'(A,(B,C),D)':'((A,B),(C,D))'} · E는 바깥군. ${transfer?'C 계통→B 계통의 한 유전자 전달':'전달 없음'}. 가지 위치는 실제 생물의 공간 위치가 아닙니다.`);
  }
  for(let [id,g] of [['plot-a','A'],['plot-b','B']])plot(id,`유전자 ${g} · ${g==='B'&&transfer?'다른 계보':'수직 계보'}`,a=>{
   let mt=M.phylogeny(g,transfer,4),x=n=>a.w/2+mt.nodes[n].x*(a.w-45)/4.8,y=n=>33+mt.nodes[n].time*(a.h-65)/4;
   for(let [u,v] of mt.selected)curve(a,[[mt.nodes[u].x,mt.nodes[u].time],[mt.nodes[v].x,mt.nodes[v].time]],q=>a.w/2+q*(a.w-45)/4.8,q=>33+q*(a.h-65)/4,u==='c'&&v==='H'?colors[1]:colors[0],1.7);
   a.ctx.fillStyle=a.ink;for(let n of ['A','B','C','D','E'])a.ctx.fillText(n,x(n)-3,y(n)+15);a.ctx.fillStyle=a.quiet;a.ctx.fillText('공간 x: 가지 배치 / 세로: 모형 시간',10,a.h-6);
  });
 }
 const builders={ct,rotation,selection,temporal,stress,phase,redshift,phylo};
 function render(){pending=false;for(let id of Object.keys(spec.defaults)){let e=$(id),out=$(id+'-value');if(out)out.textContent=e.type==='range'?fmt(Number(e.value),Number(e.step)>=1?0:2):'';}builders[spec.kind]();let a=prepare(cv),{ctx,w,h,ink}=a;
  function rawProject(p){let [x,y,z]=M.sub(p,scene.center),u=x*Math.cos(yaw)-y*Math.sin(yaw),v=x*Math.sin(yaw)+y*Math.cos(yaw);return [u,v*Math.sin(pitch)-z*Math.cos(pitch),v*Math.cos(pitch)+z*Math.sin(pitch)];}
  let vertices=scene.items.flatMap(it=>it.points.map(rawProject)),xs=vertices.map(p=>p[0]),ys=vertices.map(p=>p[1]);
  let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),padding=w<440?16:24;
  let scale=Math.min((w-2*padding)/Math.max(.3,xmax-xmin),(h-2*padding)/Math.max(.3,ymax-ymin))*zoom,midX=(xmin+xmax)/2,midY=(ymin+ymax)/2;
  function project(p){let [u,v,d]=rawProject(p);return [w/2+(u-midX)*scale,h/2+(v-midY)*scale,d];}
  let items=scene.items.map(it=>({...it,p:it.points.map(project)}));items.sort((a,b)=>b.p.reduce((s,v)=>s+v[2],0)/b.p.length-a.p.reduce((s,v)=>s+v[2],0)/a.p.length);
  for(let it of items){ctx.save();ctx.strokeStyle=it.color;ctx.fillStyle=it.color;ctx.lineWidth=it.width||1;if(it.dash)ctx.setLineDash([5,5]);if(it.type==='point'){let p=it.p[0];ctx.beginPath();ctx.arc(p[0],p[1],it.radius,0,2*Math.PI);ctx.fill();}else{ctx.beginPath();it.p.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));if(it.type==='face'){ctx.closePath();ctx.globalAlpha=it.alpha;ctx.fill();}else{ctx.stroke();if(it.type==='arrow'){let [u,v]=it.p,t=Math.atan2(v[1]-u[1],v[0]-u[0]);ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(v[0],v[1]);ctx.lineTo(v[0]-9*Math.cos(t-.4),v[1]-9*Math.sin(t-.4));ctx.lineTo(v[0]-9*Math.cos(t+.4),v[1]-9*Math.sin(t+.4));ctx.closePath();ctx.fill();}}}ctx.restore();}
  ctx.font='12px sans-serif';let occupied=[[w-80,0,80,36]];for(let l of scene.labels){let p=project(l.pos),tw=ctx.measureText(l.text).width;if(p[0]>2&&p[0]<w-8&&p[1]>10&&p[1]<h-8){
   let candidate=null;for(let [dx,dy] of [[5,-5],[5,17],[-tw-5,-5],[-tw-5,17],[5,32],[-tw-5,32],[5,-22]]){let x=Math.max(6,Math.min(p[0]+dx,w-tw-6)),y=Math.max(14,Math.min(p[1]+dy,h-6)),r=[x-2,y-12,tw+4,16];if(!occupied.some(b=>r[0]<b[0]+b[2]&&r[0]+r[2]>b[0]&&r[1]<b[1]+b[3]&&r[1]+r[3]>b[1])){candidate=[x,y,r];break;}}
   if(candidate){let [x,y,r]=candidate;occupied.push(r);ctx.fillStyle=l.color||ink;ctx.fillText(l.text,x,y);if(Math.abs(x-p[0])>12||Math.abs(y-p[1])>12){ctx.strokeStyle=(l.color||a.quiet);ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(x,y-6);ctx.stroke();}}
  }}
  plotJobs.forEach(fn=>fn());$('zoom-info').textContent=fmt(zoom,2)+'×';cv.dataset.zoom=String(zoom);cv.dataset.yaw=String(yaw);cv.dataset.pitch=String(pitch);window.SceneState={kind:spec.kind,zoom,yaw,pitch};
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(render);}}
 function pause(){let event=new Event('input',{bubbles:true});$(spec.target).dispatchEvent(event);}
 for(let el of document.querySelectorAll('input,select')){el.addEventListener('input',schedule);el.addEventListener('change',schedule);}
 for(let button of document.querySelectorAll('[data-preset]'))button.addEventListener('click',()=>{for(let [id,v] of Object.entries(JSON.parse(button.dataset.values))){let e=$(id);if(e.type==='checkbox')e.checked=v;else e.value=v;}pause();schedule();});
 $('reset').addEventListener('click',()=>{for(let [id,v] of Object.entries(spec.defaults)){let e=$(id);if(e.type==='checkbox')e.checked=v;else e.value=v;}yaw=-.55;pitch=.4;zoom=1;pause();schedule();});
 $('front').addEventListener('click',()=>{yaw=0;pitch=0;pause();schedule();});$('oblique').addEventListener('click',()=>{yaw=-.55;pitch=.4;pause();schedule();});
 let dragging=null;cv.addEventListener('pointerdown',e=>{dragging=[e.clientX,e.clientY];cv.setPointerCapture(e.pointerId);pause();});cv.addEventListener('pointermove',e=>{if(!dragging)return;yaw+=(e.clientX-dragging[0])*.01;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-dragging[1])*.01));dragging=[e.clientX,e.clientY];schedule();});for(let event of ['pointerup','pointercancel'])cv.addEventListener(event,()=>dragging=null);
 cv.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(5,zoom*Math.exp(-e.deltaY*.002)));pause();schedule();},{passive:false});
 cv.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch+=.1;if(e.key==='ArrowDown')pitch-=.1;if(e.key==='+'||e.key==='=')zoom=Math.min(5,zoom*1.12);if(e.key==='-')zoom=Math.max(.35,zoom/1.12);pause();schedule();});
 $('show-controls').addEventListener('click',()=>{$('controls').classList.add('open');$('back-model').focus();});$('back-model').addEventListener('click',()=>{$('controls').classList.remove('open');$('show-controls').focus();});
 new ResizeObserver(schedule).observe(document.body);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',schedule);schedule();
})();

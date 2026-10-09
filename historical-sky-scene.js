(function(){
 'use strict';
 const M=window.HistorySky,spec=window.CaseSpec,$=id=>document.getElementById(id),cv=$('model'),cx=cv.getContext('2d');
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
 function drawPlot(id,title,fn){let a=prepare($(id));a.ctx.font='12px sans-serif';a.ctx.fillStyle=a.ink;let t=title;while(t.length&&a.ctx.measureText(t).width>a.w-20)t=t.slice(0,-1);a.ctx.fillText(t===title?t:t+'…',10,17);fn(a);}
 function chart(a,xlim,ylim,xname,yname){let {ctx,w,h,quiet,grid}=a,left=32,top=31,bottom=h-42,right=w-12;let X=x=>left+(x-xlim[0])/(xlim[1]-xlim[0])*(right-left),Y=y=>bottom-(y-ylim[0])/(ylim[1]-ylim[0])*(bottom-top);ctx.strokeStyle=grid;ctx.lineWidth=1;ctx.strokeRect(left,top,right-left,bottom-top);ctx.font='10px sans-serif';ctx.fillStyle=quiet;ctx.textAlign='center';ctx.fillText(xname,(left+right)/2,h-20);ctx.textAlign='left';if(yname)ctx.fillText(yname,left+4,top+12);for(let t of [0,.5,1]){ctx.textAlign='right';ctx.fillText(fmt(ylim[0]+t*(ylim[1]-ylim[0]),1),left-4,Y(ylim[0]+t*(ylim[1]-ylim[0]))+3);ctx.textAlign=t===0?'left':t===1?'right':'center';ctx.fillText(fmt(xlim[0]+t*(xlim[1]-xlim[0]),xlim[1]-xlim[0]>100?0:1),X(xlim[0]+t*(xlim[1]-xlim[0])),bottom+13);}ctx.textAlign='left';return {X,Y,left,right,top,bottom};}
 function curve(a,points,X,Y,color,width=2){a.ctx.strokeStyle=color;a.ctx.lineWidth=width;a.ctx.beginPath();points.forEach(([x,y],i)=>i?a.ctx.lineTo(X(x),Y(y)):a.ctx.moveTo(X(x),Y(y)));a.ctx.stroke();}
 function image(a,data,n,x,y,w,h,max=1.2){let c=document.createElement('canvas');c.width=n;c.height=n;let g=c.getContext('2d'),im=g.createImageData(n,n);data.forEach((v,i)=>{let t=Math.max(0,Math.min(1,v/max));im.data[4*i]=Math.round(244*(1-t)+45*t);im.data[4*i+1]=Math.round(248*(1-t)+143*t);im.data[4*i+2]=Math.round(252*(1-t)+185*t);im.data[4*i+3]=255;});g.putImageData(im,0,0);a.ctx.imageSmoothingEnabled=false;a.ctx.drawImage(c,x,y,w,h);}
 function series(){
  let mode=choice('grouping'),boundary=value('boundary'),time=value('year'),selected=choice('document'),ds=M.groups(mode,boundary),names=mode==='field'?M.fields:mode==='period'?[`${boundary}년 이전`,`${boundary}년 이후`]:M.documents.map(d=>d.short),x=y=>(y-1720)/30,Y=g=>(g-(names.length-1)/2)*.65;newScene(3);
  for(let g=0;g<names.length;g++){let same=ds.filter(d=>d.group===g);line([[-2.1,Y(g),0],[2.1,Y(g),0]],colors[g%6],1);label([-2.1,Y(g),0],names[g],colors[g%6]);if($('links').checked&&mode==='field'&&same.length>1)line(same.map(d=>[x(d.year),Y(g),.25]),colors[g%6],2,true);}
  for(let d of ds){let p=[x(d.year),Y(d.group),d.id==='quesnay'?.7:.25],col=d.year>time?colors[5]:colors[d.group%6];line([[p[0],p[1],0],p],col,1);point(p,col,d.id===selected?7:4);label(p,`${d.year} ${d.short}`,col);}
  line([[x(time),-1.6,-.15],[x(time),1.6,.8]],colors[1],2);if(mode==='period')face([[x(boundary),-1.6,0],[x(boundary),1.6,0],[x(boundary),1.6,.9],[x(boundary),-1.6,.9]],colors[3],.12);
  let d=M.documents.find(d=>d.id===selected);info(`5개 출판 기록`+` · ${new Set(ds.map(d=>d.group)).size}개 묶음 · ${fmt(time,0)}년까지 ${ds.filter(d=>d.year<=time).length}건`,`가로 = 출판 연도 / 줄 = 선택한 분류 / 높이 = 책(.25), 표(.7)의 배치. 간격과 높이는 분석용 좌표입니다. 점선은 출판 순서이며 영향 관계가 아닙니다.`);
  $('detail').textContent=`${d.year} · ${d.author} · ${d.title}. ${d.note}`;
  plot('plot-a','평면 시간선 · 선택한 공통 경계',a=>{let c=chart(a,[1660,1780],[0,1],'출판 연도','');curve(a,[[1660,.5],[1780,.5]],c.X,c.Y,colors[5]);curve(a,[[boundary,.05],[boundary,.95]],c.X,c.Y,colors[3]);for(let d of ds){a.ctx.fillStyle=colors[d.group%6];a.ctx.beginPath();a.ctx.arc(c.X(d.year),c.Y(.5),d.id===selected?6:4,0,2*Math.PI);a.ctx.fill();}a.ctx.fillStyle=a.ink;a.ctx.fillText(`경계 ${boundary}년 (독자가 선택)`,c.left,47);});
  plot('plot-b','같은 기록 · 묶는 기준의 차이',a=>{a.ctx.fillStyle=a.ink;let y=38;names.forEach((n,g)=>{a.ctx.fillStyle=colors[g%6];a.ctx.fillText(`${n}: ${ds.filter(d=>d.group===g).length}건`,12,y);y+=Math.min(22,(a.h-46)/names.length);});a.ctx.fillStyle=a.quiet;a.ctx.fillText('5건 유지 · 대표 표본 아님',10,a.h-7);});
 }
 function temporalities(){
  let time=value('year'),width=value('window'),bin=Number(choice('bin')),lo=time-width/2,hi=time+width/2,x=y=>(y-time)*4/width,visible=M.visibleEvents(time,width);newScene(3);scene.center=[0,0,.5];
  for(let [y,z,name,col] of [[-.9,0,'사건 · 날짜',colors[0]],[0,.3,'국면 · 물가의 방향',colors[1]],[.9,.6,'장기 조건 · 지리',colors[2]]]){line([[-2,y,z],[2,y,z]],col,2,y>.5);label([-2,y,z],name,col);}
  for(let phase of M.phases){let a=Math.max(lo,phase.lo),b=Math.min(hi,phase.hi);if(b>a){line([[x(a),0,.3],[x(b),0,.3]],phase.sign>0?colors[1]:colors[3],7);label([x((a+b)/2),0,.3],phase.sign>0?'상승 국면':'하락 국면');}}
  for(let e of visible){point([x(e.year),-.9,0],colors[0],5);line([[x(e.year),-.9,0],[x(e.year),-.9,.4]],colors[0]);label([x(e.year),-.9,.4],e.date.slice(5));}
  face([[-2,.7,.5],[2,.7,.5],[2,1.1,.5],[-2,1.1,.5]],colors[2],.1);line([[0,-1.1,-.1],[0,1.1,.9]],colors[4],1);
  info(`${fmt(time,3)}년을 중심으로 ${width<1?fmt(width*365,1)+'일':fmt(width,1)+'년'}의 창`,`창 안의 사건 ${visible.length}건. 주황·보라 = Braudel이 구분한 물가 국면, 측정 가격 곡선은 아닙니다. 초록 = 지속하는 지리 조건의 설명용 층; 시작·끝을 확정하지 않습니다.`);
  $('detail').textContent=visible.map(e=>`${e.date} ${e.title}`).join(' / ')||'이 시간 창에는 선택한 1815년 사건 기록이 없습니다.';
  plot('plot-a','짧은 사건 · 시간 창을 넓히면 모인다',a=>{let day=width<1,X=v=>day?(v-lo)*365:v,c=chart(a,[X(lo),X(hi)],[0,1],day?'창 시작부터 약 일수':'달력 연도','');for(let e of visible){curve(a,[[X(e.year),.15],[X(e.year),.7]],c.X,c.Y,colors[0]);a.ctx.fillStyle=a.ink;a.ctx.fillText(e.date.slice(5),Math.min(c.right-31,c.X(X(e.year))+3),c.Y(.7)-4);}if(!visible.length){a.ctx.fillStyle=a.quiet;a.ctx.fillText('선택한 사건이 없는 구간',c.left,50);}});
  plot('plot-b',`한 칸 ${bin>=1?bin+'년':bin>=.08?'약 한 달':'약 하루'} · 사건 수`,a=>{let bs=M.bins(bin),low=Math.min(...bs.map(b=>b.lo)),high=Math.max(...bs.map(b=>b.lo))+bin,c=chart(a,[low,Math.max(low+bin,high)],[0,Math.max(...bs.map(b=>b.count))+1],'집계 구간 시작 연도','건');for(let b of bs){a.ctx.fillStyle=colors[0];a.ctx.fillRect(c.X(b.lo),c.Y(b.count),Math.max(3,(c.right-c.left)*bin/(high-low)*.8),c.Y(0)-c.Y(b.count));}a.ctx.fillStyle=a.quiet;a.ctx.fillText('5건 유지 · 집계 단위만 변화',9,a.h-7);});
 }
 function contexts(){
  let example=choice('example'),context=choice('context'),scaleName=choice('scale'),reveal=value('reveal'),s=M.statement(example,context,scaleName);newScene(2.6);
  $('context').disabled=example!=='keyboard';$('scale').disabled=example!=='evolution';
  point([0,0,0],colors[0],8);label([0,0,.1],s.form,colors[0]);
  let centers=context==='both'||example==='evolution'?[[-1.2,0,.35],[1.2,0,.35]]:[[0,0,.35]],labels=centers.length===2?[s.left,s.right]:[context==='keyboard'?s.left:s.right];
  for(let [j,c] of centers.entries()){ring(c,[.68,0,0],[0,.68,0],colors[j+1]);label(M.add(c,[0,0,.2]),labels[j],colors[j+1]);for(let i=0;i<4;i++){let p=M.add(c,[.68*Math.cos(i*Math.PI/2),.68*Math.sin(i*Math.PI/2),.9]);point(p,reveal>i?colors[i+1]:colors[5],reveal>i?5:2);line([c,p],reveal>i?colors[i+1]:colors[5],1,reveal<=i);if(reveal>i&&j===0)label(p,s.conditions[i],colors[i+1]);}}
  if(example==='evolution'&&scaleName==='broad')line([centers[0],centers[1]],colors[2],4);info(s.verdict,`표시된 조건 ${reveal}/4 · ${example==='evolution'?s.count+'개 진술로 분석':'배열의 모양과 사용 기능을 구별'}. 공간의 거리와 높이는 의미의 양을 측정하지 않는 설명용 배치입니다.`);
  $('detail').textContent=example==='keyboard'?'Foucault, 『지식의 고고학』 영어판 p.86의 자판 / 타자 교본 비교.':'Foucault, 같은 책 p.104의 Darwin / Simpson 비교. 두 저자의 원문 인용이나 영향 관계 측정이 아니다.';
  plot('plot-a','같은 평면 기호',a=>{a.ctx.fillStyle=a.ink;a.ctx.font=example==='keyboard'?'24px monospace':'24px sans-serif';a.ctx.textAlign='center';a.ctx.fillText(s.form,a.w/2,76);a.ctx.font='12px sans-serif';a.ctx.fillText('형태만으로 조건을 정할 수 없다',a.w/2,110);a.ctx.textAlign='left';});
  plot('plot-b','조건을 펼친 기록',a=>{a.ctx.fillStyle=a.ink;let y=37;for(let i=0;i<reveal;i++){a.ctx.fillStyle=colors[i+1];a.ctx.fillText(s.conditions[i],12,y);y+=21;}if(!reveal){a.ctx.fillStyle=a.quiet;a.ctx.fillText('재생하거나 조건 표시 단계를 늘려 보세요',12,y);}a.ctx.fillStyle=a.quiet;a.ctx.fillText(example==='evolution'?`${scaleName==='broad'?'큰':'세밀한'} 규모: ${s.count}개 진술`:'자판 배열 / 배열에 관한 서술',12,a.h-7);});
 }
 let texture=null,textureCanvas=document.createElement('canvas'),stars=M.samples();
 if(spec.texture){let img=new Image();img.onload=()=>{textureCanvas.width=img.width;textureCanvas.height=img.height;let g=textureCanvas.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);texture={w:img.width,h:img.height,data:g.getImageData(0,0,img.width,img.height).data};schedule();};img.src=spec.texture;}
 function skyColor(d){let [l,b]=M.bearing(d),x=Math.min(texture.w-1,Math.max(0,Math.floor((180-l)/360*texture.w))),y=Math.min(texture.h-1,Math.max(0,Math.floor((90-b)/180*texture.h))),i=(y*texture.w+x)*4;return [texture.data[i],texture.data[i+1],texture.data[i+2]];}
 function galaxy(){
  let name=choice('observer'),o=M.observer(name),l=value('longitude'),b=value('latitude'),fov=value('fov'),exag=value('thickness'),alpha=value('dust'),d=M.ray(l,b),r=M.radiance(o,d,alpha),pos=p=>[p[0],p[1],p[2]*exag],effective=name==='solar'?choice('sky'):'model';newScene(1.6);
  $('sky').disabled=name!=='solar';if(name!=='solar')$('sky').value='model';for(let s of stars)point(pos(s.p),s.bulge?colors[1]+'aa':colors[0]+'75',s.bulge?1.6:1);
  for(let z of [-.01,.01])ring([0,0,z*exag],[1,0,0],[0,1,0],colors[5]);ring([0,0,0],[.18,0,0],[0,0,.08*exag],colors[1]);
  point(pos(o),'#f5c84a',7);label(pos(M.add(o,[0,0,.035])),name==='solar'?'태양 부근 관측점':name==='center'?'가상 관측점 · 중심':'가상 관측점 · 원반 위');point([0,0,0],colors[1],4);label([-.1,0,-.08*exag],'은하 중심',colors[1]);
  let end=Math.max(r.disk?r.disk[1]:0,r.bulge?r.bulge[1]:0,.4);arrow(pos(o),pos(M.add(o,M.scale(d,Math.min(1.8,end)))),colors[2]);
  for(let [x,y] of [[-1,-.6],[-1,.6],[1,-.6],[1,.6]]){let q=M.perspective(l,b,fov,x,y,1.7);line([pos(o),pos(M.add(o,M.scale(q,.4)))],colors[2],.7,true);}
  let length=r.disk?(r.disk[1]-r.disk[0])*15.33:0;info(`은하 내부 → 선택한 하늘 · l=${l}°, b=${b}°`,`원반 내 광선 길이 ${fmt(length,2)} kpc · 단순 모형 밝기 ${fmt(r.I,3)}. 세로 ${exag}× 과장 (계산은 원래 두께). 점은 합성 분포, 노란 관측점 크기는 축척과 무관합니다.`);
  $('detail').textContent=effective==='gaia'?'하늘 창: Gaia EDR3 관측 합산 지도를 방향별로 다시 투영. ESA/Gaia/DPAC; A. Moitinho. 실제 태양 부근에서 얻은 방향 자료.':'하늘 창: 균일 원반 + 타원체 중심부의 설명용 방출·감쇠 모형. 실제 관측이나 다른 위치에서 촬영한 은하수가 아니다.';
  plot('plot-a',effective==='gaia'?'관측 지도 · 선택한 시야':'설명 모형 · 선택한 시야',a=>{let w=Math.min(effective==='gaia'?600:320,Math.max(200,Math.round(a.w-16))),h=Math.max(60,Math.round(w*(a.h-35)/(a.w-16))),c=document.createElement('canvas');c.width=w;c.height=h;let g=c.getContext('2d'),im=g.createImageData(w,h),aspect=w/h;for(let y=0;y<h;y++)for(let x=0;x<w;x++){let q=M.perspective(l,b,fov,2*(x+.5)/w-1,1-2*(y+.5)/h,aspect),col;if(effective==='gaia'&&texture)col=skyColor(q);else{let I=M.radiance(o,q,alpha).I,t=1-Math.exp(-I*2);col=[8+235*t,13+199*t,24+125*t];}let j=4*(y*w+x);im.data[j]=col[0];im.data[j+1]=col[1];im.data[j+2]=col[2];im.data[j+3]=255;}g.putImageData(im,0,0);a.ctx.drawImage(c,8,27,a.w-16,a.h-35);a.ctx.strokeStyle='#8ed2a1';a.ctx.beginPath();a.ctx.moveTo(a.w/2-5,(a.h+27)/2);a.ctx.lineTo(a.w/2+5,(a.h+27)/2);a.ctx.stroke();});
  plot('plot-b','선택한 광선'+' · 모형의 깊이와 감쇠',a=>{let limit=Math.max(.5,end),ch=chart(a,[0,limit*15.33],[0,3.1],'관측점에서의 거리 (kpc)','방출 / 투과');curve(a,Array.from({length:141},(_,i)=>{let s=limit*i/140,j=(r.disk&&s>=r.disk[0]&&s<=r.disk[1]?1:0)+(r.bulge&&s>=r.bulge[0]&&s<=r.bulge[1]?2:0);return [s*15.33,j];}),ch.X,ch.Y,colors[1]);curve(a,Array.from({length:141},(_,i)=>{let s=limit*i/140;return[s*15.33,Math.exp(-alpha*M.opticalLength(s,r.disk))];}),ch.X,ch.Y,colors[2]);a.ctx.fillStyle=a.quiet;a.ctx.fillText('주황 방출 / 초록 투과율',9,a.h-7);});
 }
 const builders={series,temporalities,contexts,galaxy};
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

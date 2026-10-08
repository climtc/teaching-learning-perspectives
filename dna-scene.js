(()=>{
  'use strict';
  const M=window.DnaGeometry,G=M.create(window.DnaData),$=id=>document.getElementById(id),canvas=$('model'),map=$('projection-map');
  const colors={A:'#ebad64',T:'#80b9f1',G:'#86cc9f',C:'#d995b9'},chains={A:'#73c6e5',B:'#e8a086'},elements={C:'#b7becb',N:'#8ebfff',O:'#f28586',P:'#e8bf70'};
  let pitch=.08,zoom=1,drag=null,request=0;
  const pairIndex=()=>Number($('pair').value)-1,yaw=()=>Number($('angle').value)*Math.PI/180;
  const dark=()=>matchMedia('(prefers-color-scheme:dark)').matches;
  function setup(cv){const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return {c,w:r.width,h:r.height};}
  function scene(){
    const {c,w,h}=setup(canvas),i=pairIndex(),pair=G.pairs[i],focus=$('focus').checked,mode=$('style').value;
    const selected=new Set([...G.residues[pair.a].atoms,...G.residues[pair.b].atoms]);
    const origin=focus?pair.center:[0,0,0],span=focus?32:52,scale=Math.min(w/span,(h-65)/(focus?26:46))*zoom;
    const cam=p=>M.rotate(M.sub(p,origin),yaw(),pitch);
    const project=p=>{const q=cam(p),f=100/(100+q[2]);return [w/2+q[0]*scale*f,h*.53-q[1]*scale*f,q[2],f];};
    c.fillStyle=dark()?'#171e27':'#f4f8fd';c.fillRect(0,0,w,h);
    const primitives=[];
    const visibleResidue=r=>!focus||Math.abs((r.chain==='A'?r.seq:13-r.seq)-(i+1))<=1;
    const visibleAtom=id=>visibleResidue(G.residues[(G.data.atoms[id].chain==='A'?0:12)+G.data.atoms[id].seq-1]);
    function segment(a,b,color,width=2,alpha=1,dash=[]){const p=project(a),q=project(b);primitives.push({z:(p[2]+q[2])/2,draw:()=>{c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.lineCap='round';c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.stroke();c.setLineDash([]);}});}
    function sphere(id,r,alpha){const q=project(G.positions[id]),color=elements[G.data.atoms[id].element];primitives.push({z:q[2],draw:()=>{c.globalAlpha=alpha;const radius=Math.max(1,r*scale*q[3]),g=c.createRadialGradient(q[0]-radius*.3,q[1]-radius*.4,0,q[0],q[1],radius);g.addColorStop(0,'#fff');g.addColorStop(.3,color);g.addColorStop(1,dark()?'#4a5361':'#6b7281');c.fillStyle=g;c.beginPath();c.arc(q[0],q[1],radius,0,Math.PI*2);c.fill();if(selected.has(id)){c.strokeStyle='#ffe8a1';c.lineWidth=.8;c.stroke();}}});}
    if(mode==='atoms'){
      for(const [a,b]of G.data.bonds)if(visibleAtom(a)&&visibleAtom(b)){const mid=M.mean([G.positions[a],G.positions[b]]),alpha=selected.has(a)||selected.has(b)?1:.58;segment(G.positions[a],mid,elements[G.data.atoms[a].element],2,alpha);segment(mid,G.positions[b],elements[G.data.atoms[b].element],2,alpha);}
      G.positions.forEach((p,id)=>{if(visibleAtom(id))sphere(id,G.data.atoms[id].element==='P'?.45:.33,selected.has(id)?1:.62);});
    }else{
      for(const chain of ['A','B']){const ids=G.backbone(chain);for(let k=1;k<ids.length;k++)if(visibleAtom(ids[k])&&visibleAtom(ids[k-1]))segment(G.positions[ids[k-1]],G.positions[ids[k]],chains[chain],mode==='backbone'?5:4,mode==='bases'?.18:.9);}
      if(mode!=='backbone')for(const r of G.residues){if(!visibleResidue(r))continue;const active=r===G.residues[pair.a]||r===G.residues[pair.b];
        for(const ring of r.rings){const pts=ring.map(id=>project(G.positions[id]));primitives.push({z:M.mean(pts)[2],draw:()=>{c.globalAlpha=active?1:.43;c.fillStyle=colors[r.base];c.strokeStyle=active?'#ffe8a1':colors[r.base];c.lineWidth=active?2:1;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();c.stroke();}});}
        const glyco=r.atoms.find(id=>G.data.atoms[id].name===(r.base==='A'||r.base==='G'?'N9':'N1'));
        segment(G.positions[r.c1],G.positions[glyco],colors[r.base],2,active?1:.5);
        const o4=r.atoms.find(id=>G.data.atoms[id].name==="O4'");
        segment(G.positions[r.c4],G.positions[o4],chains[r.chain],2,active?1:.4);
        segment(G.positions[o4],G.positions[r.c1],chains[r.chain],2,active?1:.4);
      }
    }
    if($('contacts').checked)for(const p of G.pairs){if(focus&&Math.abs(p.index-(i+1))>1)continue;for(const [a,b]of p.contacts)segment(G.positions[a],G.positions[b],'#ffe2a3',p===pair?2:1,p===pair?1:.35,[3,3]);}
    if($('grooves').checked){const guide=G.groove(i);for(const [path,col]of [[guide.minor,'#ffc777'],[guide.major,'#b5a3fa']])for(let k=1;k<path.length;k++)segment(path[k-1],path[k],col,2,.95,[3,3]);
      for(const [path,label,col]of [[guide.minor,'작은 홈 쪽','#ffc777'],[guide.major,'큰 홈 쪽','#b5a3fa']]){const q=project(path[20]);primitives.push({z:-200,draw:()=>{c.globalAlpha=1;c.font='11px system-ui';c.fillStyle=dark()?'#18212bea':'#ffffffed';c.fillRect(q[0]-4,q[1]-13,70,19);c.fillStyle=col;c.fillText(label,q[0],q[1]);}});}
    }
    primitives.sort((a,b)=>b.z-a.z).forEach(p=>p.draw());c.globalAlpha=1;
    if(!focus&&mode!=='atoms')for(const chain of ['A','B']){const list=G.residues.filter(r=>r.chain===chain);for(const [r,end]of [[list[0],'5′'],[list.at(-1),'3′']]){const q=project(G.positions[r.c4]);c.font='bold 12px system-ui';c.fillStyle=chains[chain];c.fillText(chain+' '+end,q[0]+5,q[1]+(end==='5′'?13:-6));}}
    c.fillStyle=dark()?'#dbe6f4':'#34465d';c.font='12px system-ui';c.fillText(`PDB 1BNA · ${mode==='atoms'?'486 원자 좌표 자료':'12 염기쌍의 좌표 모형'}`,10,18);c.font='11px system-ui';c.fillText(`선택 ${pair.index} · ${pair.letters} · ${focus?'선택쌍과 양옆':'전체 구조'}`,10,35);c.fillText('드래그/방향키 회전 · 휠/+− 배율 · 1 Å = 0.1 nm',10,h-10);
    $('angle-value').textContent=Number($('angle').value).toFixed(0)+'°';$('pair-value').textContent=(i+1)+' / 12';
    $('view-info').textContent=`배율 ${zoom.toFixed(2)}× · ${focus?'국소 시야':'전체 시야'} · 색은 표현을 위한 선택입니다.`;
    $('pair-info').textContent=`A:${G.residues[pair.a].residue} ${G.residues[pair.a].base} ↔ B:${G.residues[pair.b].residue} ${G.residues[pair.b].base} · 수소결합 자리 ${pair.contacts.length}곳. 원자 사이 거리 ${pair.distances.map(d=>d.toFixed(2)).join(' / ')} Å.`;
    $('plane-info').textContent=`두 염기 고리면 사이 각도 ≈ ${pair.basePlaneAngle.toFixed(1)}°. 세 고리 원자에서 구한 면의 각도이며 표준 propeller-twist 값과 구별합니다.`;
    $('groove-info').textContent=$('grooves').checked?'점선 호: 당 C1′ 방향으로 구분한 홈 쪽의 기하학적 안내. 홈의 실제 폭이나 분자 표면이 아닙니다.':'홈 안내를 켜면 선택쌍의 두 당 방향 사이 짧은 쪽과 긴 쪽을 비교할 수 있습니다.';
    $('readout').textContent=`${i+1}번 ${pair.letters} · 5′→3′ 순서의 반대 가닥을 짝지었습니다. 복제·열운동을 계산하지 않는 정적 결정 구조입니다.`;
    document.querySelectorAll('[data-pair]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.pair)===i+1)));
    drawMap(cam,selected,focus,i);
  }
  function drawMap(cam,selected,focus,index){const {c,w,h}=setup(map),side=Math.min(w-12,h-30),sc=side/54;c.fillStyle=dark()?'#19212b':'#eef4fa';c.fillRect(0,0,w,h);
    const p=v=>{const q=cam(v);return [w/2+q[0]*sc,h/2-q[1]*sc];};
    for(const chain of ['A','B']){const ids=G.backbone(chain).filter(id=>{const a=G.data.atoms[id],n=a.chain==='A'?a.seq:13-a.seq;return !focus||Math.abs(n-(index+1))<=1;});c.strokeStyle=chains[chain]+'77';c.lineWidth=2;c.beginPath();ids.forEach((id,k)=>{const q=p(G.positions[id]);k?c.lineTo(...q):c.moveTo(...q);});c.stroke();}
    for(let id=0;id<G.positions.length;id++){if(focus){const a=G.data.atoms[id],n=a.chain==='A'?a.seq:13-a.seq;if(Math.abs(n-(index+1))>1)continue;}const q=p(G.positions[id]);c.fillStyle=selected.has(id)?'#edbc66':'#9abbd444';c.beginPath();c.arc(...q,selected.has(id)?1.6:1.2,0,Math.PI*2);c.fill();}
    c.fillStyle=dark()?'#aebdd0':'#506781';c.font='10px system-ui';c.fillText('깊이를 겹쳐 기록한 정투영',6,h-8);
  }
  function schedule(){if(!request)request=requestAnimationFrame(()=>{request=0;scene();});}
  for(const id of ['pair','angle','style','focus','grooves','contacts'])$(id).addEventListener('input',schedule);
  for(const pair of G.pairs){const b=document.createElement('button');b.type='button';b.dataset.pair=pair.index;b.textContent=pair.index+' '+pair.letters;b.setAttribute('aria-label',pair.index+'번 염기쌍 '+pair.letters);b.addEventListener('click',()=>{$('pair').value=pair.index;$('pair').dispatchEvent(new Event('input',{bubbles:true}));});$('sequence').append(b);}
  $('side-view').addEventListener('click',()=>{pitch=0;$('angle').value=0;schedule();});
  $('end-view').addEventListener('click',()=>{pitch=Math.PI/2;$('angle').value=0;schedule();});
  $('reset').addEventListener('click',()=>{pitch=.08;zoom=1;$('angle').value=35;$('pair').value=6;$('style').value='cartoon';$('focus').checked=false;$('grooves').checked=true;$('contacts').checked=true;schedule();});
  canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);$('angle').dispatchEvent(new Event('input',{bubbles:true}));});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;$('angle').value=(Number($('angle').value)+(e.clientX-drag[0])*.6+360)%360;pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch+(e.clientY-drag[1])*.009));drag=[e.clientX,e.clientY];schedule();});
  canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));$('angle').dispatchEvent(new Event('input',{bubbles:true}));schedule();},{passive:false});
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft'||e.key==='ArrowRight')$('angle').value=(Number($('angle').value)+(e.key==='ArrowLeft'?-5:5)+360)%360;if(e.key==='ArrowUp'||e.key==='ArrowDown')pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch+(e.key==='ArrowUp'?.05:-.05)));if(e.key==='+'||e.key==='-')zoom=Math.max(.35,Math.min(4,zoom*(e.key==='+'?1.2:1/1.2)));$('angle').dispatchEvent(new Event('input',{bubbles:true}));schedule();}});
  $('show-controls').addEventListener('click',()=>{document.body.dataset.controlsVisible='true';$('controls').scrollIntoView({block:'start'});$('back-model').focus({preventScroll:true});});
  $('back-model').addEventListener('click',()=>{document.body.scrollTop=0;document.body.dataset.controlsVisible='false';canvas.focus({preventScroll:true});});
  document.body.addEventListener('scroll',()=>{if(document.body.scrollTop<20)document.body.dataset.controlsVisible='false';});
  new ResizeObserver(schedule).observe(canvas);new ResizeObserver(schedule).observe(map);matchMedia('(prefers-color-scheme:dark)').addEventListener('change',schedule);schedule();
})();

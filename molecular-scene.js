(()=>{
 'use strict';
 const M=window.MolecularGeometry,D=window.MolecularData,$=id=>document.getElementById(id),canvas=$('model'),map=$('projection-map');
 const molecules=Object.fromEntries(D.molecules.map(m=>[m.cid,M.create(m)])),colors={C:'#8e9fb6',H:'#eff5ff',O:'#fa888d'},priorityColors=['#72d6bc','#baa3fa','#f7c16e','#f4f5ff'];
 let pitch=.3,zoom=1,drag=null,request=0;
 const dark=()=>matchMedia('(prefers-color-scheme:dark)').matches;
 const family=()=>D.families.find(f=>f.id===$('family').value);
 const yaw=()=>Number($('angle').value)*Math.PI/180;
 function setup(cv){const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return{c,w:r.width,h:r.height};}
 function models(){const f=family(),pair=f.members.map(cid=>molecules[cid]);const mirror=f.id==='chirality'&&$('mirror').checked;
   return pair.map((m,i)=>({m,points:i===1&&mirror?M.reflect(pair[0].positions):m.positions,marks:i===1&&mirror?pair[0].marks:m.marks,mirrored:i===1&&mirror}));}
 function scene(){
   const{c,w,h}=setup(canvas),f=family(),pair=models(),emphasis=$('emphasis').checked,labels=$('labels').checked;
   c.fillStyle=dark()?'#171e27':'#f4f8fd';c.fillRect(0,0,w,h);c.strokeStyle=dark()?'#344150':'#d7e0ec';c.lineWidth=1;c.beginPath();c.moveTo(w/2,48);c.lineTo(w/2,h-32);c.stroke();
   const scale=Math.min((w/2-18)/6.2,(h-118)/5.8)*zoom;
   pair.forEach(({m,points,marks,mirrored},side)=>{
     const centerX=w*(side?.75:.25),extra=side?Number($('right-angle').value)*Math.PI/180:0,tilt=side?Number($('right-tilt').value)*Math.PI/180:0;
     const cam=p=>M.rotate(M.rotate(p,extra,tilt),yaw(),pitch);
     const project=p=>{const q=cam(p),perspective=60/(60+q[2]);return[centerX+q[0]*scale*perspective,h*.52-q[1]*scale*perspective,q[2],perspective];};
     const primitives=[],active=new Map();
     if(emphasis){
       if(f.id==='constitution'){active.set(marks.oxygen,'#ffe0a0');marks.neighbors.forEach(i=>active.set(i,'#ffe0a0'));}
       if(f.id==='cis-trans'){marks.double.forEach(i=>active.set(i,'#ffe0a0'));marks.methyl.forEach(i=>active.set(i,'#a7d8fb'));}
       if(f.id==='chirality'){active.set(marks.center,'#ffe0a0');marks.priority.forEach((i,n)=>active.set(i,priorityColors[n]));}
     }
     for(const[a,b,order]of m.bonds){const p=project(points[a]),q=project(points[b]),dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy)||1;
       const highlighted=emphasis&&(f.id==='constitution'?(a===marks.oxygen||b===marks.oxygen):f.id==='cis-trans'?(order===2):(a===marks.center||b===marks.center));
       let color=highlighted?'#e9bd68':dark()?'#8293a9':'#7b8b9c';
       if(highlighted&&f.id==='chirality')color=priorityColors[marks.priority.indexOf(a===marks.center?b:a)];
       primitives.push({z:(p[2]+q[2])/2,draw:()=>{c.globalAlpha=emphasis&&!highlighted?.48:1;c.strokeStyle=color;c.lineWidth=highlighted?3:2;c.lineCap='round';for(let j=0;j<order;j++){const offset=(j-(order-1)/2)*4;c.beginPath();c.moveTo(p[0]-dy/len*offset,p[1]+dx/len*offset);c.lineTo(q[0]-dy/len*offset,q[1]+dx/len*offset);c.stroke();}}});
     }
     points.forEach((point,i)=>{const p=project(point),r=(m.atoms[i].element==='H'?.2:.31)*scale*p[3];primitives.push({z:p[2],draw:()=>{c.globalAlpha=emphasis&&!active.has(i)?.55:1;const gradient=c.createRadialGradient(p[0]-r*.25,p[1]-r*.3,0,p[0],p[1],r);gradient.addColorStop(0,'#fff');gradient.addColorStop(.4,colors[m.atoms[i].element]);gradient.addColorStop(1,dark()?'#59697d':'#708197');c.fillStyle=gradient;c.beginPath();c.arc(p[0],p[1],Math.max(2,r),0,Math.PI*2);c.fill();if(active.has(i)){c.strokeStyle=active.get(i);c.lineWidth=2;c.stroke();}if(labels&&!(f.id==='chirality'&&emphasis&&marks.priority.includes(i))){c.globalAlpha=1;c.fillStyle=m.atoms[i].element==='H'?'#233348':'#12283a';c.font='bold 10px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(m.atoms[i].element,p[0],p[1]);c.textBaseline='alphabetic';c.textAlign='left';}}});});
     primitives.sort((a,b)=>b.z-a.z).forEach(p=>p.draw());c.globalAlpha=1;
     if(f.id==='chirality'&&emphasis){marks.priority.forEach((id,n)=>{const p=project(points[id]),text=`${n+1} ${['OH','COOH','CH₃','H'][n]}`;c.font='bold 11px system-ui';c.fillStyle=dark()?'#17212ced':'#ffffffed';c.fillRect(p[0]+7,p[1]-12,c.measureText(text).width+7,17);c.fillStyle=priorityColors[n];if(!dark())c.fillStyle=['#127762','#7550b3','#92651d','#34465a'][n];c.fillText(text,p[0]+10,p[1]);});}
     c.fillStyle=dark()?'#e1eaf6':'#2b3f56';c.font='bold 12px system-ui';c.textAlign='center';c.fillText(m.name,centerX,70);c.font='10px system-ui';c.fillStyle=dark()?'#a7b8cc':'#566c84';c.fillText(mirrored?'R 좌표의 거울상 · S 배치':'PubChem CID '+m.cid,centerX,86);
     let metric=f.id==='constitution'?'O의 이웃: '+marks.neighbors.map(i=>m.atoms[i].element).sort().join(' · '):f.id==='cis-trans'?'메틸 방향 '+M.methylAngle(m,points).toFixed(1)+'°':'지향 부호 '+(M.handedness({...m,marks},points)<0?'− (R)':'＋ (S)');
     c.fillText(metric,centerX,h-36);c.textAlign='left';
   });
   c.fillStyle=dark()?'#dbe7f7':'#34475e';c.font='12px system-ui';c.fillText(f.formula+' · 같은 조성',10,18);c.font='11px system-ui';c.fillText('계산 구조 두 개 비교',10,35);c.fillText('드래그/방향키 회전 · 휠/+− 배율',10,h-10);
   $('angle-value').textContent=Number($('angle').value).toFixed(0)+'°';$('right-value').textContent=$('right-angle').value+'°';$('tilt-value').textContent=$('right-tilt').value+'°';$('view-info').textContent=`배율 ${zoom.toFixed(2)}× · 구의 크기와 색은 설명을 위한 표현입니다.`;
   const descriptions={constitution:'C 2 · H 6 · O 1은 같습니다. 에탄올은 O–H가 있고, 에터는 O가 두 C 사이에 있습니다.', 'cis-trans':'같은 C–C=C–C 연결입니다. 메틸 두 방향은 C=C축 둘레에서 같은 쪽과 반대쪽에 놓입니다.',chirality:'1 OH → 2 COOH → 3 CH₃ → 4 H 순서로 비교합니다. 회전은 지향 부호를 보존하고 거울반사는 뒤집습니다.'};
   $('comparison-info').textContent=descriptions[f.id];
   $('mirror-label').hidden=f.id!=='chirality';$('chiral-legend').hidden=f.id!=='chirality';
   $('readout').textContent=f.id==='chirality'&&$('mirror').checked?'오른쪽은 R 좌표를 반사한 S 배치입니다. 화학 반응이나 분자 운동을 계산한 과정이 아닙니다.':'PubChem의 계산 배치 한 개씩. 관찰각 재생은 분자 전체를 보는 방향을 바꾸며 결합을 회전시키지 않습니다.';
   drawMap(pair,w,h);
 }
 function drawMap(pair){const{c,w,h}=setup(map),sc=Math.min((w/2-10)/6.2,(h-30)/5.8);c.fillStyle=dark()?'#19212b':'#eef4fa';c.fillRect(0,0,w,h);pair.forEach(({m,points},side)=>{const project=p=>{const q=M.rotate(M.rotate(p,side?Number($('right-angle').value)*Math.PI/180:0,side?Number($('right-tilt').value)*Math.PI/180:0),yaw(),pitch);return[w*(side?.75:.25)+q[0]*sc,h/2-q[1]*sc];};for(const[a,b]of m.bonds){const p=project(points[a]),q=project(points[b]);c.strokeStyle=dark()?'#779ab888':'#779ab8aa';c.lineWidth=1;c.beginPath();c.moveTo(...p);c.lineTo(...q);c.stroke();}points.forEach((p,i)=>{const q=project(p);c.fillStyle=m.atoms[i].element==='O'?'#f18888aa':'#89a6c377';c.beginPath();c.arc(...q,2,0,Math.PI*2);c.fill();});});c.fillStyle=dark()?'#b3c2d4':'#536b83';c.font='10px system-ui';c.fillText('같은 시점 · 깊이를 겹친 정투영',5,h-7);}
 function schedule(){if(!request)request=requestAnimationFrame(()=>{request=0;scene();});}
 function pause(){ $('angle').dispatchEvent(new Event('input',{bubbles:true})); }
 for(const id of ['family','angle','right-angle','right-tilt','emphasis','labels','mirror'])$(id).addEventListener('input',()=>{if(id==='family'){$('right-angle').value=0;$('right-tilt').value=0;$('mirror').checked=false;zoom=1;pitch=.3;}schedule();});
 $('front').addEventListener('click',()=>{pitch=0;$('angle').value=0;pause();schedule();});
 $('oblique').addEventListener('click',()=>{pitch=.5;$('angle').value=35;pause();schedule();});
 $('reset').addEventListener('click',()=>{pitch=.3;zoom=1;$('family').value='constitution';$('angle').value=25;$('right-angle').value=0;$('right-tilt').value=0;$('emphasis').checked=true;$('labels').checked=true;$('mirror').checked=false;schedule();});
 canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);pause();});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('pointermove',e=>{if(!drag)return;$('angle').value=(Number($('angle').value)+(e.clientX-drag[0])*.6+360)%360;pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch+(e.clientY-drag[1])*.009));drag=[e.clientX,e.clientY];pause();schedule();});
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));pause();schedule();},{passive:false});
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft'||e.key==='ArrowRight')$('angle').value=(Number($('angle').value)+(e.key==='ArrowLeft'?-5:5)+360)%360;if(e.key==='ArrowUp'||e.key==='ArrowDown')pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,pitch+(e.key==='ArrowUp'?.05:-.05)));if(e.key==='+'||e.key==='-')zoom=Math.max(.35,Math.min(4,zoom*(e.key==='+'?1.2:1/1.2)));pause();schedule();}});
 $('show-controls').addEventListener('click',()=>{document.body.dataset.controlsVisible='true';$('controls').scrollIntoView({block:'start'});$('back-model').focus({preventScroll:true});});$('back-model').addEventListener('click',()=>{document.body.scrollTop=0;document.body.dataset.controlsVisible='false';canvas.focus({preventScroll:true});});document.body.addEventListener('scroll',()=>{if(document.body.scrollTop<20)document.body.dataset.controlsVisible='false';});
 new ResizeObserver(schedule).observe(canvas);new ResizeObserver(schedule).observe(map);matchMedia('(prefers-color-scheme:dark)').addEventListener('change',schedule);schedule();
})();

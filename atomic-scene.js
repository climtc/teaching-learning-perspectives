(()=>{
  'use strict';
  const M=window.AtomicProbability,$=id=>document.getElementById(id);
  const model=$('model'),heat=$('heatmap'),radial=$('radial');
  let cloud=[],seed=1931,yaw=.55,pitch=.25,zoom=1,drag=null,request=0,heatKey='',heatImage=null,heatMax=0,hydrogenicMass='finite';
  const value=id=>Number($(id).value),state=()=>$('state').value,extent=()=>value('extent');
  const species=()=>$('species').value,massMode=()=>$('mass-mode').value,parameters=()=>M.parameters(species(),massMode());
  const dark=()=>matchMedia('(prefers-color-scheme:dark)').matches;
  function setup(canvas){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);const c=canvas.getContext('2d');c.setTransform(d,0,0,d,0,0);return {c,w:r.width,h:r.height};}
  function rebuild(){
    const helium=M.species[species()].kind==='variational';
    if(helium){if(!$('mass-mode').disabled)hydrogenicMass=massMode();$('mass-mode').value='infinite';}
    else if($('mass-mode').disabled)$('mass-mode').value=hydrogenicMass;
    else hydrogenicMass=massMode();
    const p=parameters();
    if(helium)$('state').value='1s';
    for(const option of $('state').options)option.disabled=helium&&option.value!=='1s';
    $('state').options[0].textContent=helium?'1s² · 두 전자 바닥상태 근사':'1s · 가장 낮은 에너지';
    $('mass-mode').disabled=helium;
    cloud=M.systemSamples(state(),6000,seed,species(),massMode());heatKey='';schedule();
  }
  function rotate(x,y,z){const x1=x*Math.cos(yaw)+y*Math.sin(yaw),y1=-x*Math.sin(yaw)+y*Math.cos(yaw);return [x1,y1*Math.cos(pitch)-z*Math.sin(pitch),y1*Math.sin(pitch)+z*Math.cos(pitch)];}
  function draw(){
    request=0;const s=state(),p=parameters(),trials=Math.round(value('reveal')),n=trials*p.N,R=value('radius'),ext=extent(),{c,w,h}=setup(model),fg=dark()?'#d9e4f2':'#35475e';
    const sc=Math.min(w,h)*.40/ext*zoom,project=(x,y,z)=>{const p=rotate(x,y,z);return [w/2+p[0]*sc,h*.54-p[2]*sc,p[1]];};
    c.fillStyle=dark()?'#171e27':'#f4f8fd';c.fillRect(0,0,w,h);
    function line(points,color,dash=[]){c.strokeStyle=color;c.lineWidth=1;c.setLineDash(dash);c.beginPath();points.forEach((p,i)=>{const q=project(...p);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);});c.stroke();c.setLineDash([]);}
    const plane=$('plane').value,off=$('representation').value==='slice'?value('offset'):0;
    if($('representation').value==='slice'){
      const pts=[[-ext,-ext],[-ext,ext],[ext,ext],[ext,-ext]].map(p=>project(...M.planePoint(p[0],p[1],off,plane)));
      c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=dark()?'#b89bf018':'#6c48a018';c.fill();c.strokeStyle='#ac8fca99';c.stroke();
    }
    for(const [axis,col,label]of [[0,'#de9a86','x'],[1,'#81bb95','y'],[2,'#89b9ee','z']]){
      const a=[0,0,0],b=[0,0,0];a[axis]=-ext;b[axis]=ext;line([a,b],col+'80');const p=project(...b);c.fillStyle=col;c.font='12px system-ui';c.fillText(label,p[0]+4,p[1]);
    }
    const sphere=(r,color,dash)=>{for(let axis=0;axis<3;axis++){const pts=[];for(let k=0;k<=100;k++){const a=k*Math.PI/50,p=[r*Math.cos(a),r*Math.sin(a),0];if(axis===1)[p[1],p[2]]=[p[2],p[1]];if(axis===2)[p[0],p[2]]=[p[2],p[0]];pts.push(p);}line(pts,color,dash);}};
    sphere(R,'#f7bd7e77',[4,4]);
    if($('nodes').checked){
      if(s==='2s')sphere(2/p.scale,'#e994bd99',[]);
      else if(s.startsWith('2p')){const pts=[[-ext,-ext],[-ext,ext],[ext,ext],[ext,-ext],[-ext,-ext]].map(([a,b])=>s==='2pz'?[a,b,0]:[0,a,b]);line(pts,'#e994bdaa',[5,4]);}
    }
    const pts=cloud.slice(0,n).map(p=>({p,q:project(p.x,p.y,p.z)})).sort((a,b)=>a.q[2]-b.q[2]);let visible=0;
    c.fillStyle=dark()?'#8cc6ff65':'#276caa55';
    for(const {q}of pts){if(q[0]<4||q[0]>w-4||q[1]<36||q[1]>h-24)continue;visible++;c.beginPath();c.arc(q[0],q[1],1.35,0,Math.PI*2);c.fill();}
    const q=project(0,0,0);c.fillStyle='#ffc383';c.beginPath();c.arc(q[0],q[1],3,0,Math.PI*2);c.fill();
    c.fillStyle=fg;c.font='12px system-ui';c.fillText(`${p.short} · ${p.kind==='variational'?'1s² · 변분 근사':M.states[s].label} · N=${p.N}`,10,18);c.font='11px system-ui';c.fillText('반복 준비의 위치 표본 · 전자 궤적이 아닙니다',10,34);c.fillText('같은 a₀ 척도 · 드래그/방향키로 회전',10,h-10);
    const inside=cloud.slice(0,n).filter(p=>p.r<=R).length;
    const energy=M.systemEnergy(s,species(),massMode()),mean=M.states[s].mean/p.scale,baseline=M.states[s].mean/M.parameters('H','finite').scale;
    const node=s==='2s'?`구면 마디 r=${(2/p.scale).toFixed(4)}a₀`:M.states[s].node;
    $('species-info').textContent=`핵 전하 +${p.Z}e · 전자 ${p.N}개 · 핵 질량 ${p.nuclearMassU.toFixed(7)}u. ${p.kind==='variational'?'고정 핵 변분 근사 · 질량 보정 생략':`μ/mₑ=${p.eta.toFixed(9)}`}`;
    $('state-info').textContent=`${p.kind==='variational'?'전체 에너지 기대값 ⟨E⟩':'Eₙ'} ≈ ${energy.toFixed(6)} eV${p.kind==='variational'?' · 고유에너지의 정확한 값이 아님':' · '+node}`;
    $('density-info').textContent=`∫nₑd³r=${p.N} · ⟨r⟩=${mean.toFixed(6)}a₀. ¹H의 같은 ${s} 기준 거리 변화 ${((mean/baseline-1)*100).toFixed(4)}%.`;
    $('radius-value').textContent=`${R.toFixed(1)} a₀`;$('offset-value').textContent=`${value('offset').toFixed(1)} a₀`;$('reveal-value').textContent=String(trials);
    const probability=M.systemCdf(s,R,species(),massMode());
    $('readout').textContent=`한 전자 r≤${R.toFixed(1)}a₀: 이론 ${(100*probability).toFixed(1)}% · 모의 ${n?(100*inside/n).toFixed(1)+'%':'표본 없음'}. 영역의 평균 전자 수 ${(p.N*probability).toFixed(3)}. ${trials}회 준비·${n}개 위치 중 화면 안 ${visible}개. 핵 표지는 실제 크기보다 큽니다.`;
    $('view-info').textContent=`표시 척도 ±${ext}a₀ · 배율 ${zoom.toFixed(2)}×`;
    drawHeat();drawRadial();
  }
  function drawHeat(){
    const s=state(),mode=$('representation').value,plane=$('plane').value,off=value('offset'),ext=extent(),key=[s,species(),massMode(),mode,plane,off,ext].join('|');
    if(key!==heatKey){
      const N=80,a=new Float64Array(N*N);heatMax=0;
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(2*(x+.5)/N-1)*ext,v=(1-2*(y+.5)/N)*ext,d=mode==='slice'?M.systemSlice(s,u,v,off,plane,species(),massMode()):M.systemMarginal(s,u,v,plane,species(),massMode());a[y*N+x]=d;heatMax=Math.max(heatMax,d);}
      heatImage=document.createElement('canvas');heatImage.width=N;heatImage.height=N;const c=heatImage.getContext('2d'),im=c.createImageData(N,N);
      for(let k=0;k<a.length;k++){const t=heatMax>0?Math.sqrt(a[k]/heatMax):0;im.data[k*4]=Math.round(13+71*t);im.data[k*4+1]=Math.round(24+168*t);im.data[k*4+2]=Math.round(41+209*t);im.data[k*4+3]=255;}c.putImageData(im,0,0);heatKey=key;
    }
    const {c,w,h}=setup(heat),side=Math.min(w-38,h-27),x=(w-side)/2,y=3;c.fillStyle=dark()?'#171e27':'#f4f8fd';c.fillRect(0,0,w,h);c.drawImage(heatImage,x,y,side,side);c.fillStyle=dark()?'#bac9dd':'#465870';c.font='10px system-ui';c.fillText(`−${ext}`,x-18,y+side/2);c.fillText(`${ext}`,x+side+2,y+side/2);c.fillText(plane==='xz'?'x / z (a₀)':'x / y (a₀)',x+side/2-22,y+side+13);
    if(heatMax===0){c.fillStyle='#f2dce9';c.fillText('이 단면의 밀도는 0',x+5,y+side/2);}
    $('heat-info').textContent=`${mode==='slice'?'전자 수 밀도 nₑ의 단면':'전자 수 밀도의 누적 투영'} · 0–${heatMax.toExponential(2)} ${mode==='slice'?'전자/a₀³':'전자/a₀²'}. 각 그림에 색을 따로 맞춥니다.`;
    $('offset').disabled=mode!=='slice';$('offset-row').hidden=mode!=='slice';
  }
  function drawRadial(){
    const s=state(),params=parameters(),R=value('radius'),max=16,{c,w,h}=setup(radial),x0=35,y0=h-23,ww=w-48,hh=h-52;
    const f=r=>M.systemRadial(s,r,species(),massMode());
    c.fillStyle=dark()?'#171e27':'#f4f8fd';c.fillRect(0,0,w,h);let peak=0;for(let k=0;k<=320;k++)peak=Math.max(peak,f(k*max/320));
    const p=r=>[x0+ww*r/max,y0-hh*f(r)/peak];
    c.beginPath();c.moveTo(x0,y0);for(let k=0;k<=160;k++){const r=R*k/160,q=p(r);c.lineTo(...q);}c.lineTo(x0+ww*R/max,y0);c.closePath();c.fillStyle='#ffc3832c';c.fill();
    c.strokeStyle=dark()?'#9eafc3':'#63758a';c.lineWidth=1;c.beginPath();c.moveTo(x0,y0-hh);c.lineTo(x0,y0);c.lineTo(x0+ww,y0);c.stroke();
    c.strokeStyle='#80baff';c.lineWidth=2;c.beginPath();for(let k=0;k<=320;k++){const q=p(max*k/320);k?c.lineTo(...q):c.moveTo(...q);}c.stroke();
    const bohrRadius=M.states[s].n**2/params.scale,xx=x0+ww*bohrRadius/max;
    if(params.kind==='hydrogenic'){c.setLineDash([4,3]);c.strokeStyle='#ac9ec3';c.beginPath();c.moveTo(xx,y0);c.lineTo(xx,y0-hh);c.stroke();c.setLineDash([]);}
    c.fillStyle=dark()?'#d9e4f2':'#35475e';c.font='11px system-ui';c.fillText('한 전자의 거리 확률 f(r) · a₀⁻¹',10,15);c.fillText('0',x0-6,y0+15);c.fillText('16 a₀',x0+ww-28,y0+15);c.fillText(`⟨r⟩=${(M.states[s].mean/params.scale).toFixed(4)}a₀ · ${params.kind==='variational'?'1s² 변분 근사':'점선: 보어 반지름'}`,x0+3,29);c.fillText(peak.toFixed(2),2,y0-hh+4);
  }
  function schedule(){if(!request)request=requestAnimationFrame(draw);}
  $('state').addEventListener('change',rebuild);
  $('species').addEventListener('change',rebuild);$('mass-mode').addEventListener('change',rebuild);
  for(const id of ['radius','reveal','offset','extent','nodes','plane','representation'])$(id).addEventListener('input',schedule);
  $('resample').addEventListener('click',()=>{seed++;rebuild();});
  $('show-controls').addEventListener('click',()=>{
    document.body.dataset.controlsVisible='true';
    $('controls').scrollIntoView({block:'start'});
    $('back-model').focus({preventScroll:true});
  });
  $('back-model').addEventListener('click',()=>{
    document.body.scrollTop=0;document.body.dataset.controlsVisible='false';
    model.focus({preventScroll:true});
  });
  document.body.addEventListener('scroll',()=>{
    if(document.body.scrollTop<20)document.body.dataset.controlsVisible='false';
  });
  $('reset').addEventListener('click',()=>{seed=1931;yaw=.55;pitch=.25;zoom=1;hydrogenicMass='finite';$('species').value='H';$('mass-mode').disabled=false;$('mass-mode').value='finite';$('state').value='2pz';$('plane').value='xz';$('representation').value='slice';$('offset').value=0;$('radius').value=3;$('extent').value=8;$('reveal').value=6000;$('nodes').checked=true;rebuild();});
  model.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];model.setPointerCapture(e.pointerId);});
  model.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.009;pitch=Math.max(-1.5,Math.min(1.5,pitch+(e.clientY-drag[1])*.009));drag=[e.clientX,e.clientY];schedule();});
  model.addEventListener('pointerup',()=>drag=null);model.addEventListener('pointercancel',()=>drag=null);
  model.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.35,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));schedule();},{passive:false});
  model.addEventListener('keydown',e=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=Math.min(1.5,pitch+.12);if(e.key==='ArrowDown')pitch=Math.max(-1.5,pitch-.12);schedule();});
  new ResizeObserver(schedule).observe(model);new ResizeObserver(schedule).observe(heat);new ResizeObserver(schedule).observe(radial);matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{heatKey='';schedule();});
  rebuild();
})();

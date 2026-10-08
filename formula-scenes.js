/* Dependency-free Canvas renderer. The third axis is labelled per case. */
(() => {
  const M=FormulaModels, kind=document.body.dataset.case;
  const canvas=document.getElementById('model'),ctx=canvas.getContext('2d');
  const readout=document.getElementById('readout'), controls=document.getElementById('controls');
  const C={blue:'#277ed3',orange:'#dd772e',green:'#27a071',purple:'#9764d3',ink:'#2b3643',quiet:'#8393a3',grid:'#c4cdd733'};
  let yaw=.55,pitch=.55,zoom=1.25,drag=null,playing=false,animation=0,last=0,drawPending=false;
  const defaults={};
  const value=id=>Number(document.getElementById(id).value);
  const select=id=>document.getElementById(id).value;
  const get=id=>document.getElementById(id);
  const sample=(lo,hi,n,fn)=>Array.from({length:n+1},(_,i)=>fn(lo+(hi-lo)*i/n,i));
  const fmt=(v,n=3)=> (Math.abs(v)<.5*10**(-n)?0:v).toFixed(n);
  const angle=v=>fmt(v/Math.PI,2)+'π';
  const deg=v=>v*Math.PI/180;
  function scene() {
    const lines=[],points=[],faces=[],labels=[];
    const line=(ps,color=C.quiet,width=1,dash=[])=>lines.push({ps,color,width,dash});
    const point=(p,color=C.orange,r=5)=>points.push({p,color,r});
    const label=(p,text,color=C.ink)=>labels.push({p,text,color});
    function arrow(a,b,color) { line([a,b],color,2); points.push({p:b,color,r:3}); }
    let extent=2, metrics=[], caption='';
    const axes=(length,names)=>{ [[length,0,0],[0,length,0],[0,0,length]].forEach((p,i)=>{line([[0,0,0],p],C.quiet);label(p,names[i]);}); };
    if(kind==='euler-formula') {
      const t=value('theta')*Math.PI,p=M.euler(t),z=t/Math.PI*.7;
      extent=2.1; axes(1.35,['Re','Im','θ / π · 높이 0.7배']);
      line(sample(-2*Math.PI,2*Math.PI,240,t=>[Math.cos(t),Math.sin(t),.7*t/Math.PI]),C.blue,2.5);
      line(sample(0,M.TAU,120,t=>[Math.cos(t),Math.sin(t),0]),C.quiet,1.5,[4,4]);
      line([[p.re,p.im,z],[p.re,p.im,0]],C.orange,1.5,[4,3]);
      arrow([0,0,0],[p.re,p.im,0],C.orange);point([p.re,p.im,z]);point([p.re,p.im,0],C.orange,4);
      line([[0,0,0],[p.re,0,0],[p.re,p.im,0]],C.green,1.5,[4,3]);
      metrics=['θ = '+angle(t),'Re = '+fmt(p.re),'Im = '+fmt(p.im),'|eⁱᶿ| = '+fmt(Math.hypot(p.re,p.im))];
      caption='파랑: 각도를 펼친 나선 · 주황: 현재 값과 평면 투영. 높이는 복소수의 새 성분이 아닙니다.';
    } else if(kind==='newton-orbits') {
      const a=value('a'),e=value('e'),t=value('phase')*M.TAU,inc=deg(value('inclination'));
      const orb=M.kepler(a,e,t),rot=([x,y,z])=>[x,y*Math.cos(inc),y*Math.sin(inc)];
      extent=3.8; axes(2.5,['x','y','z · 공간']);
      line(sample(0,M.TAU,220,E=>rot([a*(Math.cos(E)-e),a*Math.sqrt(1-e*e)*Math.sin(E),0])),C.blue,2.5);
      point([0,0,0],C.orange,9); label([0,0,.2],'중심체');point(rot(orb.position),C.green,6);
      line([[0,0,0],rot(orb.position)],C.orange,1,[4,3]);
      const speed=Math.hypot(...orb.velocity),r=orb.r;
      arrow(rot(orb.position),rot(orb.position.map((v,i)=>v+.55*orb.velocity[i]/speed)),C.green);
      arrow(rot(orb.position),rot(orb.position.map(v=>v-.5*v/r)),C.orange);
      metrics=['r = '+fmt(r),'ε = '+fmt(orb.energy),'L = '+fmt(orb.angularMomentum),'T = '+fmt(orb.period)];
      caption='μ=1인 중심력의 타원 궤도. 초록은 속도 방향, 주황은 중력 방향이며 화살표 길이는 정규화했습니다.';
    } else if(kind==='electromagnetic-wave') {
      const lambda=value('wavelength'),t=value('phase')*lambda,pol=deg(value('polarization'));
      extent=3.5; axes(2.8,['x · 전파','y · E/E₀, cB/E₀','z · E/E₀, cB/E₀']);
      line([[-3,0,0],[3,0,0]],C.quiet,1.2);
      const vectors=x=>M.wave(x,t,lambda,pol);
      line(sample(-3,3,220,x=>{const q=vectors(x).E;return [x,q[1],q[2]];}),C.blue,2.5);
      line(sample(-3,3,220,x=>{const q=vectors(x).B;return [x,q[1],q[2]];}),C.orange,2.5);
      for(let x=-3;x<=3;x+=.3) {const q=vectors(x);arrow([x,0,0],[x,q.E[1],q.E[2]],C.blue);arrow([x,0,0],[x,q.B[1],q.B[2]],C.orange);}
      const q=vectors(0),flux=M.cross(q.E,q.B)[0];
      metrics=['λ = '+fmt(lambda,2),'E·B = '+fmt(M.dot(q.E,q.B)),'|E| = |cB| = '+fmt(Math.hypot(...q.E)),'전파 방향 +x'];
      caption='파랑 E · 주황 cB. 곡선의 높이는 전기장·자기장의 성분값이며 물질이 흔들리는 경로가 아닙니다.';
    } else if(kind==='lorentz-transform') {
      const beta=value('beta'),events={time:[.5,.4,1.5],light:[1,0,1],space:[1.5,.4,.5]};
      const p=events[select('event')],q=M.lorentz(p,beta);extent=4.8; axes(3.5,['x','y','ct · 시간']);
      for(const z of [-2,-1,1,2]) line(sample(0,M.TAU,64,t=>[Math.abs(z)*Math.cos(t),Math.abs(z)*Math.sin(t),z]),C.quiet,1);
      for(let i=0;i<16;i++) {const t=i*M.TAU/16;line([[-2*Math.cos(t),-2*Math.sin(t),-2],[0,0,0],[2*Math.cos(t),2*Math.sin(t),2]],C.grid,1);}
      arrow([0,0,0],p,C.blue);arrow([0,0,0],q,C.orange);point(p,C.blue,6);point(q,C.orange,6);label(p,'S');label(q,"S′",C.orange);
      metrics=['β = '+fmt(beta,2),"x′ = "+fmt(q[0])+", ct′ = "+fmt(q[2]),'s²(S) = '+fmt(M.interval(p)),"s²(S′) = "+fmt(M.interval(q))];
      caption='같은 사건을 두 기준계의 좌표값으로 겹쳐 표시했습니다. 두 점을 잇는 이동이나 카메라 회전이 로런츠 변환은 아닙니다.';
    } else if(kind==='fourier-series') {
      const n=value('terms'),t=value('phase')*M.TAU;extent=3.6; axes(2.7,['t · 위상','진폭','성분 순서']);
      const X=t=> (t-Math.PI)*.8,depth=j=> .15+(j-1)*2.2/Math.max(1,n-1);
      for(let j=1;j<=n;j++) {
        line(sample(0,M.TAU,240,t=>[X(t),M.harmonic(j,t),depth(j)]),j%2?C.blue:C.green,1.2);
        point([X(t),M.harmonic(j,t),depth(j)],C.orange,3);
        label([X(M.TAU),0,depth(j)],String(2*j-1)+'ω',C.quiet);
      }
      line(sample(0,M.TAU,320,t=>[X(t),M.fourier(n,t),0]),C.orange,2.6);
      line([[X(0),0,0],[X(0),1,0],[X(Math.PI),1,0],[X(Math.PI),-1,0],[X(M.TAU),-1,0],[X(M.TAU),0,0]],C.quiet,1,[4,3]);
      line([[X(t),-1.5,0],[X(t),1.5,0]],C.purple,1,[4,3]);point([X(t),M.fourier(n,t),0],C.orange,5);
      metrics=['홀수 성분 '+n+'개','최고 조화수 '+(2*n-1),'t = '+angle(t),'합 = '+fmt(M.fourier(n,t))];
      caption='뒤쪽: 홀수 사인파 성분 · 앞쪽 주황: 합 · 점선: 목표 사각파. 깊이는 성분의 순서입니다.';
    } else if(kind==='bloch-sphere') {
      const theta=deg(value('theta')),phi=deg(value('phi')),r=M.bloch(theta,phi),axis=select('axis');
      const n={x:[1,0,0],y:[0,1,0],z:[0,0,1]}[axis],p=M.probability(r,n);extent=1.55;axes(1.25,['σₓ','σᵧ','σ_z']);
      for(let j=-2;j<=2;j++) {const z=j/3,radius=Math.sqrt(1-z*z);line(sample(0,M.TAU,80,t=>[radius*Math.cos(t),radius*Math.sin(t),z]),C.grid);}
      for(let j=0;j<6;j++) {const phi=j*Math.PI/6;line(sample(0,M.TAU,100,t=>[Math.sin(t)*Math.cos(phi),Math.sin(t)*Math.sin(phi),Math.cos(t)]),C.quiet,.7);}
      arrow([0,0,0],r,C.blue);point(r,C.blue,7);arrow(n.map(x=>-x),n,C.orange);label([0,0,1.08],'|0⟩');label([0,0,-1.1],'|1⟩');
      metrics=['r = ('+r.map(x=>fmt(x,2)).join(', ')+')','|r| = '+fmt(Math.hypot(...r)),'P(+ '+axis.toUpperCase()+') = '+fmt(p),'P(− '+axis.toUpperCase()+') = '+fmt(1-p)];
      caption='파랑: 한 큐비트의 순수 상태 · 주황: 측정 축. 점은 입자의 공간 위치가 아닙니다.';
    } else if(kind==='gradient-surface') {
      const x=value('x'),y=value('y'),z=M.surface(x,y),g=M.gradient(x,y);extent=3.1;axes(2,['x','y','f(x,y) · 값']);
      const meshN=18,lo=-1.5,step=3/meshN;
      for(let i=0;i<meshN;i++) for(let j=0;j<meshN;j++) {const x=lo+i*step,y=lo+j*step;faces.push({ps:[[x,y,M.surface(x,y)],[x+step,y,M.surface(x+step,y)],[x+step,y+step,M.surface(x+step,y+step)],[x,y+step,M.surface(x,y+step)]],color:'#3786be28',stroke:'#5b9ddf77'});}
      for(const h of [.25,.6,1,1.5]) line(sample(0,M.TAU,120,t=>[Math.sqrt(2*h)*Math.cos(t),Math.sqrt(h/.9)*Math.sin(t),0]),C.quiet,.8,[3,3]);
      if(get('tangent').checked) {const s=.5;faces.push({ps:[[x-s,y-s,M.tangent(x-s,y-s,x,y)],[x+s,y-s,M.tangent(x+s,y-s,x,y)],[x+s,y+s,M.tangent(x+s,y+s,x,y)],[x-s,y+s,M.tangent(x-s,y+s,x,y)]],color:'#dd772e30',stroke:C.orange});}
      point([x,y,z],C.blue,6);point([x,y,0],C.blue,4);line([[x,y,0],[x,y,z]],C.blue,1,[3,3]);
      arrow([x,y,0],[x+.45*g[0],y+.45*g[1],0],C.green);
      const norm=Math.hypot(...g),u=norm>1e-9?g.map(v=>v/norm):[0,0];
      arrow([x,y,z],[x+.35*u[0],y+.35*u[1],z+.35*norm],C.orange);
      metrics=['f = '+fmt(z),'∇f = ('+g.map(v=>fmt(v,2)).join(', ')+')','최대 방향미분 = '+fmt(norm),'접평면 · '+(get('tangent').checked?'표시':'숨김')];
      caption='초록: 밑면의 기울기 벡터（0.45배） · 주황: 상승 방향의 접벡터와 접평면. 높이는 함수값입니다.';
    }
    return {lines,points,faces,labels,extent,metrics,caption};
  }
  function draw() {
    drawPending=false;
    const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
    const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const dark=matchMedia('(prefers-color-scheme: dark)').matches;C.ink=dark?'#e0e7ef':'#2b3643';C.quiet=dark?'#91a1b4':'#8293a3';C.grid=dark?'#a8bbd533':'#63758b33';
    const s=scene(); let py=pitch,ya=yaw;if(get('view')?.value==='plane') {py=-Math.PI/2;ya=0;}
    const scale=Math.min(w*.43,h*.40)/s.extent*zoom;
    const project=([x,y,z])=>{const X=x*Math.cos(ya)-y*Math.sin(ya),Y=x*Math.sin(ya)+y*Math.cos(ya);return [w/2+X*scale,h*.54-(z*Math.cos(py)-Y*Math.sin(py))*scale,Y*Math.cos(py)+z*Math.sin(py)];};
    const path=ps=>{ctx.beginPath();ps.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});};
    s.faces.sort((a,b)=>b.ps.reduce((sum,p)=>sum+project(p)[2],0)/b.ps.length-a.ps.reduce((sum,p)=>sum+project(p)[2],0)/a.ps.length).forEach(f=>{path(f.ps);ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle=f.stroke;ctx.lineWidth=.6;ctx.stroke();});
    for(const l of s.lines) {path(l.ps);ctx.strokeStyle=l.color;ctx.lineWidth=l.width;ctx.setLineDash(l.dash);ctx.stroke();} ctx.setLineDash([]);
    for(const p of s.points) {const q=project(p.p);ctx.beginPath();ctx.arc(q[0],q[1],p.r,0,M.TAU);ctx.fillStyle=p.color;ctx.fill();}
    ctx.font='12px system-ui';for(const l of s.labels) {const q=project(l.p);ctx.fillStyle=l.color;ctx.fillText(l.text,q[0]+5,q[1]-5);}
    readout.replaceChildren(...s.metrics.map(text=>{const el=document.createElement('span');el.textContent=text;return el;}));
    get('caption').textContent=s.caption;
    canvas.dataset.zoom=zoom.toFixed(3);canvas.dataset.camera=yaw.toFixed(3)+','+pitch.toFixed(3);
    canvas.setAttribute('aria-label',get('model-title').textContent+'。'+s.metrics.join('。')+'。'+s.caption);
    for(const input of controls.querySelectorAll('input[type=range]')) {const out=get(input.id+'-value');if(out) out.textContent=input.value;}
  }
  function schedule() {if(!drawPending){drawPending=true;requestAnimationFrame(draw);}}
  for(const el of controls.querySelectorAll('input,select')) {defaults[el.id]=el.type==='checkbox'?el.checked:el.value;el.addEventListener('input',schedule);el.addEventListener('change',schedule);}
  get('reset').addEventListener('click',()=>{stop();for(const [id,v]of Object.entries(defaults)){const el=get(id);if(el.type==='checkbox')el.checked=v;else el.value=v;}yaw=.55;pitch=.55;zoom=1.25;schedule();});
  document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{const vals=JSON.parse(b.dataset.preset);for(const [id,v]of Object.entries(vals))get(id).value=v;schedule();}));
  canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);canvas.focus();});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.008;pitch=Math.max(-1.5,Math.min(1.5,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];schedule();});
  ['pointerup','pointercancel'].forEach(k=>canvas.addEventListener(k,()=>{drag=null;}));
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.55,Math.min(2.8,zoom*Math.exp(-e.deltaY*.001)));schedule();},{passive:false});
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','0'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=Math.min(1.5,pitch+.12);if(e.key==='ArrowDown')pitch=Math.max(-1.5,pitch-.12);if(e.key==='+'||e.key==='=')zoom=Math.min(2.8,zoom*1.15);if(e.key==='-')zoom=Math.max(.55,zoom/1.15);if(e.key==='0'){yaw=.55;pitch=.55;zoom=1.25;}schedule();}});
  function stop(){playing=false;cancelAnimationFrame(animation);if(get('play'))get('play').textContent='재생';}
  function tick(time){if(!playing)return;const delta=Math.min((time-last)/1000,.05);last=time;const input=get(kind==='euler-formula'?'theta':'phase');const lo=Number(input.min),hi=Number(input.max),step=kind==='euler-formula'?.45:.12;let v=Number(input.value)+delta*step;if(v>hi)v=lo;input.value=v.toFixed(3);schedule();animation=requestAnimationFrame(tick);}
  get('play')?.addEventListener('click',()=>{if(playing){stop();return;}playing=true;get('play').textContent='일시정지';last=performance.now();animation=requestAnimationFrame(tick);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  new ResizeObserver(schedule).observe(canvas);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',schedule);schedule();
})();

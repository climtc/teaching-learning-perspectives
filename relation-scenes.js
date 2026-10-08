(() => {
  'use strict';
  const M=RelationModels,get=id=>document.getElementById(id),canvas=get('model'),ctx=canvas.getContext('2d'),kind=document.body.dataset.case;
  const initialYaw=kind==='viewpoint-owner'?1.05:.6,initialZoom=kind==='viewpoint-owner'?1.4:1;
  let yaw=initialYaw,pitch=.55,zoom=initialZoom,drag=null,pending=false;const controls=get('controls'),defaults={};
  let goData,goStates;
  if(kind==='go-futures') {
    goData=JSON.parse(get('go-data').textContent);
    goStates=goData.branches.map(branch=>{const game=new M.GoBoard(goData.boardSize);let initial;for(const [c,m]of goData.initialMoves)initial=game.play(c,m);return [initial,...branch.moves.map(([c,m])=>game.play(c,m))];});
    goData.branches.forEach((b,i)=>{const o=document.createElement('option');o.value=i;o.textContent=b.label;get('branch').append(o);});
  }
  function palette(){return matchMedia('(prefers-color-scheme: dark)').matches?{ink:'#e6edf6',quiet:'#a2afc0',grid:'#8190a555',paper:'#20252b',blue:'#7ec6ff',orange:'#ffb378',green:'#86d7a7'}:{ink:'#253246',quiet:'#65748a',grid:'#7087a555',paper:'#f3f6fa',blue:'#247eba',orange:'#c77528',green:'#198961'};}
  function draw(){
    pending=false;const w=canvas.clientWidth,h=canvas.clientHeight;if(w<2||h<2)return;const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const C=palette();ctx.font='12px system-ui';
    const multi=kind==='go-futures'&&get('multiple').checked,turn=kind==='go-futures'?Number(get('turn').value):0,spacing=kind==='go-futures'?Number(get('spacing').value):1;
    const extent=kind==='go-futures'?Math.max(multi?7:3.4,(turn*.035*spacing+2.7)*.58):3.3;
    const scale=Math.min(w*.46,h*.43)/extent*zoom;
    const P=([x,y,z])=>{const a=x*Math.cos(yaw)-y*Math.sin(yaw),b=x*Math.sin(yaw)+y*Math.cos(yaw);return [w/2+a*scale,h*.56-(z*Math.cos(pitch)-b*Math.sin(pitch))*scale,b*Math.cos(pitch)+z*Math.sin(pitch)];};
    function path(ps){ctx.beginPath();ps.forEach((p,i)=>{const q=P(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});}
    function line(ps,color,width=1,dash=[]){path(ps);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
    function face(ps,color){path(ps);ctx.closePath();ctx.fillStyle=color;ctx.fill();}
    function point(p,color,r=5,label=''){const q=P(p);ctx.beginPath();ctx.arc(q[0],q[1],r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(label){ctx.fillStyle=C.ink;ctx.fillText(label,q[0]+7,q[1]-6);}}
    if(kind==='viewpoint-owner'){
      const {n,u,v}=M.basis(Number(get('direction').value)),mode=get('mode').value,offset=mode==='projection'?-1.7:Number(get('height').value),center=M.mul(n,offset);
      const plane=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>M.add(center,M.add(M.mul(u,a*1.9),M.mul(v,b*1.9))));
      face(plane,mode==='projection'?'#69b9ff18':'#ffc56b24');line([...plane,plane[0]],mode==='projection'?C.blue:C.orange,1.5);
      const names=['교사','학습자','도구','과제'],selected={teacher:[0,2,3],learner:[1,2,3],relation:[0,1,2]}[get('focus').value];
      const ps=M.vertices;for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)line([ps[i],ps[j]],selected.includes(i)&&selected.includes(j)?C.green:C.grid,selected.includes(i)&&selected.includes(j)?2:1);
      ps.forEach((p,i)=>point(p,selected.includes(i)?C.green:C.quiet,6,names[i]));
      let planar;
      if(mode==='projection'){
        planar=selected.map(i=>M.project(ps[i],n,offset));selected.forEach((id,i)=>line([ps[id],planar[i]],C.blue,1,[4,4]));line([...planar,planar[0]],C.blue,2.5);planar.forEach(p=>point(p,C.blue,4));
      }else{
        planar=M.section(ps,n,offset);if(planar.length>2)face(planar,'#ffc56b50');if(planar.length)line([...planar,planar[0]],C.orange,2.5);planar.forEach(p=>point(p,C.orange,4));
      }
      const inset=get('plane'),ic=inset.getContext('2d'),iw=inset.clientWidth,ih=inset.clientHeight;inset.width=iw*dpr;inset.height=ih*dpr;ic.setTransform(dpr,0,0,dpr,0,0);ic.clearRect(0,0,iw,ih);ic.font='11px system-ui';ic.strokeStyle=mode==='projection'?C.blue:C.orange;ic.lineWidth=2;ic.beginPath();planar.forEach((p,i)=>{const q=M.sub(p,center),x=iw/2+M.dot(q,u)*iw*.21,y=ih/2-M.dot(q,v)*ih*.32;i?ic.lineTo(x,y):ic.moveTo(x,y);});ic.closePath();ic.stroke();if(mode==='projection')planar.forEach((p,i)=>{const q=M.sub(p,center);ic.fillStyle=C.ink;ic.fillText(names[selected[i]],iw/2+M.dot(q,u)*iw*.21+3,ih/2-M.dot(q,v)*ih*.32-4);});
      get('readout').textContent=mode==='projection'?'파랑: 같은 점의 평면 투영 · 초록: 선택한 관계 · 점선: 투영 경로':`주황: 가정한 사면체의 단면 · 교차점 ${planar.length}개. 투영과 다른 연산입니다.`;
      get('height').disabled=mode==='projection';
    } else {
      const branch=Number(get('branch').value),states=goStates[branch];get('turn').max=states.length-1;const t=Math.min(turn,states.length-1),count=Number(get('layers').value),stride=Number(get('stride').value),alpha=Number(get('opacity').value);
      const ids=multi?[0,1,2]:[branch];
      ids.forEach((b,index)=>{
        const ox=multi?(index-1)*5.3:0,color=[C.blue,C.orange,C.green][b],start=Math.max(0,t-count+1),end=Math.min(t,goStates[b].length-1),mid=t*.035*spacing/2;
        const layers=[];for(let k=start;k<=end;k+=stride)layers.push(k);if(!layers.includes(end))layers.push(end);
        for(const k of layers){const z=k*.035*spacing-mid,selected=k===t&&b===branch,ps=[[-2,-2,z],[2,-2,z],[2,2,z],[-2,2,z]].map(([x,y,z])=>[x+ox,y,z]);face(ps,selected?'#cf9f5555':`rgba(125,170,200,${alpha})`);line([...ps,ps[0]],selected?color:C.grid,selected?1.7:.5);
          if(selected){for(let j=0;j<19;j++){const q=-1.9+j*3.8/18;line([[ox-1.9,q,z],[ox+1.9,q,z]],C.grid,.55);line([[ox+q,-1.9,z],[ox+q,1.9,z]],C.grid,.55);}}
          const state=goStates[b][k];state.board.forEach((c,i)=>{if(!c)return;const x=i%19,y=Math.floor(i/19),p=[ox-1.9+x*3.8/18,-1.9+y*3.8/18,z+.009];const q=P(p);ctx.globalAlpha=selected?1:Math.min(.7,alpha*2.6);ctx.beginPath();ctx.arc(q[0],q[1],Math.max(1,scale*.08),0,Math.PI*2);ctx.fillStyle=c===1?'#19232f':'#f4f3ed';ctx.fill();ctx.strokeStyle=c===1?'#667588':'#86909b';ctx.lineWidth=.4;ctx.stroke();ctx.globalAlpha=1;});
          if(selected&&state.last>=0){const i=state.last;point([ox-1.9+(i%19)*3.8/18,-1.9+Math.floor(i/19)*3.8/18,z+.018],color,3);}
        }
        line([[ox-2.2,-2,-mid],[ox-2.2,-2,end*.035*spacing-mid]],color,1.5);point([ox-2.2,-2,end*.035*spacing-mid],color,2,`후보 ${b+1} · ${end}수`);
      });
      drawBoard(get('plane'),states[t],C);const info=goData.branches[branch];
      get('readout').textContent=`초기 8수 + 미래 ${t}/${states.length-1}수 · 잡은 돌 흑 ${states[t].captures[0]} / 백 ${states[t].captures[1]} · 초기 후보 방문 ${info.rootVisits}회 · 흑 승률 추정 ${(info.rootBlackWinrate*100).toFixed(1)}%`;
    }
    canvas.dataset.camera=yaw.toFixed(4)+','+pitch.toFixed(4);canvas.dataset.zoom=zoom.toFixed(3);canvas.dataset.rendered='true';
    for(const el of controls.querySelectorAll('input[type=range]')){const o=get(el.id+'-value');if(o)o.textContent=el.value;}
  }
  function drawBoard(boardCanvas,state,C){const c=boardCanvas.getContext('2d'),w=boardCanvas.clientWidth,h=boardCanvas.clientHeight,d=Math.min(2,devicePixelRatio||1);boardCanvas.width=w*d;boardCanvas.height=h*d;c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);const size=Math.min(w,h)-16,step=size/18,ox=(w-size)/2,oy=(h-size)/2;c.fillStyle=matchMedia('(prefers-color-scheme: dark)').matches?'#68533a':'#e9c48a';c.fillRect(ox-7,oy-7,size+14,size+14);c.strokeStyle='#504234';c.lineWidth=.6;for(let i=0;i<19;i++){c.beginPath();c.moveTo(ox+i*step,oy);c.lineTo(ox+i*step,oy+size);c.moveTo(ox,oy+i*step);c.lineTo(ox+size,oy+i*step);c.stroke();}state.board.forEach((v,i)=>{if(!v)return;c.beginPath();c.arc(ox+(i%19)*step,oy+(18-Math.floor(i/19))*step,step*.42,0,Math.PI*2);c.fillStyle=v===1?'#17202b':'#f4f4ee';c.fill();c.strokeStyle='#8090a0';c.lineWidth=.4;c.stroke();if(i===state.last){c.fillStyle=C.blue;c.fillRect(ox+(i%19)*step-1.5,oy+(18-Math.floor(i/19))*step-1.5,3,3);}});}
  function schedule(){if(!pending){pending=true;requestAnimationFrame(draw);}}
  for(const el of controls.querySelectorAll('input,select')){defaults[el.id]=el.type==='checkbox'?el.checked:el.value;el.addEventListener('input',schedule);el.addEventListener('change',schedule);}
  get('reset').addEventListener('click',()=>{for(const [id,v]of Object.entries(defaults)){const el=get(id);if(el.type==='checkbox')el.checked=v;else el.value=v;}yaw=initialYaw;pitch=.55;zoom=initialZoom;schedule();});
  canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);canvas.focus();});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.008;pitch=Math.max(-1.45,Math.min(1.45,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];schedule();});for(const k of ['pointerup','pointercancel'])canvas.addEventListener(k,()=>drag=null);
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.4,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));schedule();},{passive:false});
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','0'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.1;if(e.key==='ArrowRight')yaw+=.1;if(e.key==='ArrowUp')pitch=Math.min(1.45,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(-1.45,pitch-.1);if(e.key==='+'||e.key==='=')zoom=Math.min(4,zoom*1.15);if(e.key==='-')zoom=Math.max(.4,zoom/1.15);if(e.key==='0'){yaw=initialYaw;pitch=.55;zoom=initialZoom;}schedule();}});
  new ResizeObserver(schedule).observe(canvas);matchMedia('(prefers-color-scheme: dark)').addEventListener('change',schedule);schedule();
})();

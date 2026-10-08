(() => {
  'use strict';
  const config = JSON.parse(document.getElementById('model-playback-config').textContent);
  const style = document.createElement('style');
  style.textContent = `html{overflow:hidden!important}body{height:calc(100% - 104px)!important;overflow:auto!important}.model-player{position:fixed;inset:auto 0 0;z-index:90;height:100px;padding:7px 10px;background:light-dark(#f5f8fc,#20242a);border-top:1px solid light-dark(#ccd5e0,#46505b);color:light-dark(#253044,#edf2f7);font:12px/1.4 system-ui;box-sizing:border-box}.player-heading{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px}.player-actions{display:flex;gap:6px;align-items:center}.model-player button,.model-player select{width:auto;min-height:30px;margin:0;font:inherit;padding:4px 8px;border:1px solid light-dark(#bcc9d8,#5a6878);border-radius:5px;background:light-dark(#fff,#303841);color:inherit}.model-player button{cursor:pointer}.model-player button[aria-pressed=true]{background:light-dark(#dbeaff,#314b66)}.model-player label{display:flex;align-items:center;gap:4px;font:inherit}.model-player input{width:100%;height:18px;margin:5px 0 0;accent-color:#72baff}.model-player :focus-visible{outline:2px solid #72baff;outline-offset:2px}#play{display:none!important}@media(max-width:350px){.model-player{padding:6px}.model-player button{padding:4px 6px}.player-heading{font-size:11px}}`;
  document.head.append(style);
  const player = document.createElement('section');
  player.className = 'model-player';player.setAttribute('aria-label','모형 재생');
  player.innerHTML = `<div class="player-heading"><span id="player-description"></span><output id="player-position"></output></div><div class="player-actions"><button id="player-toggle" type="button" aria-pressed="false">▶ 재생</button><button id="player-start" type="button">처음으로</button><label>속도<select id="player-speed" aria-label="재생 속도"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div><input id="player-seek" type="range" min="0" max="1000" step="1" value="0" aria-label="재생 위치">`;
  document.body.append(player);
  const get = id => document.getElementById(id);
  const target = config.target ? get(config.target) : null;
  let progress = target && target.type==='range' ? (Number(target.value)-Number(target.min))/(Number(target.max)-Number(target.min)) : 0;
  let running = false, last=0, request=0, applying=false, previousStage=-1;
  get('player-description').textContent=config.label;
  function notify(el) {el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
  function write(id,value) {const el=get(id);if(!el)return;const before=el.type==='checkbox'?el.checked:el.value;if(el.type==='checkbox')el.checked=Boolean(value);else el.value=String(value);if(before!==(el.type==='checkbox'?el.checked:el.value))notify(el);}
  function display() {
    get('player-seek').value=String(Math.round(progress*1000));
    get('player-position').textContent=Math.round(progress*100)+'%';
    player.dataset.progress=progress.toFixed(4);player.dataset.playing=String(running);
    get('player-toggle').textContent=running?'Ⅱ 일시정지':'▶ 재생';get('player-toggle').setAttribute('aria-pressed',String(running));
  }
  function apply() {
    applying=true;
    if(config.stages) {
      const n=config.stages.length;const stage=Math.min(n-1,Math.floor(progress*n));
      if(stage!==previousStage) {for(const [id,value]of Object.entries(config.stages[stage]))write(id,value);previousStage=stage;}
      if(config.stageTarget) {
        const el=get(config.stageTarget),local=progress>=1?1:(progress*n-stage);
        write(config.stageTarget,Number(el.min)+(Number(el.max)-Number(el.min))*local);
      }
    } else if(target) {
      if(target.type==='range') {
        const low=config.min??Number(target.min),high=config.max??Number(target.max),step=Number(target.step)||.001;
        const value=low+(high-low)*progress;write(target.id,Math.max(low,Math.min(high,Math.round(value/step)*step)));
      } else if(target.tagName==='SELECT') {
        const options=[...target.options].filter(o=>!o.disabled);write(target.id,options[Math.min(options.length-1,Math.floor(progress*options.length))].value);
      }
    }
    applying=false;display();
  }
  function pause() {running=false;cancelAnimationFrame(request);display();}
  function tick(now) {
    if(!running)return;const dt=Math.min((now-last)/1000,.1);last=now;
    progress=Math.min(1,progress+dt*Number(get('player-speed').value)/(config.duration||18));apply();
    if(progress>=1)pause();else request=requestAnimationFrame(tick);
  }
  get('player-toggle').addEventListener('click',()=>{if(running){pause();return;}if(progress>=.999){progress=0;previousStage=-1;}apply();running=true;last=performance.now();display();request=requestAnimationFrame(tick);});
  get('player-start').addEventListener('click',()=>{pause();progress=0;previousStage=-1;apply();});
  get('player-seek').addEventListener('input',()=>{const value=Number(get('player-seek').value)/1000;pause();progress=value;previousStage=-1;apply();});
  for(const kind of ['input','change','click'])document.addEventListener(kind,event=>{
    if(applying||player.contains(event.target))return;
    if(event.target.matches('input,select,button')){
      pause();previousStage=-1;const sync=event.target===target||event.target.id==='reset'||event.target.hasAttribute('data-preset');if(config.stages&&event.target.id!=='model-zoom-in'&&event.target.id!=='model-zoom-out'&&(event.target.matches('input,select')||event.target.id==='reset'))progress=0;
      if(sync && target && target.type==='range')progress=(Number(target.value)-Number(target.min))/(Number(target.max)-Number(target.min));display();
    }
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.addEventListener('pagehide',pause);display();
})();

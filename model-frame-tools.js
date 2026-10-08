/* Added after the original model. Only invokes existing canvas zoom handlers. */
(() => {
  if (document.querySelector('[data-model-zoom-tools]')) return;
  const canvas=document.querySelector('canvas');
  if (!canvas) return;
  const style=document.createElement('style');
  style.textContent='[data-model-zoom-tools]{position:fixed;right:8px;top:8px;z-index:10000;display:flex;gap:4px}[data-model-zoom-tools] button{font:600 13px system-ui;padding:5px 8px;border:1px solid #8b949e;border-radius:6px;background:Canvas;color:CanvasText;cursor:pointer;min-width:30px}[data-model-zoom-tools] button:focus-visible{outline:2px solid #368ce0;outline-offset:2px}';
  document.head.append(style);
  const box=document.createElement('div'); box.dataset.modelZoomTools='v1'; box.setAttribute('role','group'); box.setAttribute('aria-label','모형 배율');
  for(const [text,label,delta] of [['−','모형 축소',180],['+','모형 확대',-180]]) {
    const b=document.createElement('button'); b.type='button'; b.textContent=text; b.setAttribute('aria-label',label);
    b.addEventListener('click',()=>canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:delta,bubbles:true,cancelable:true})));
    box.append(b);
  }
  document.body.append(box);
  const place=()=>{const r=canvas.getBoundingClientRect();box.style.right=Math.max(8,innerWidth-r.right+8)+'px';box.style.top=Math.max(8,r.top+8)+'px';};
  new ResizeObserver(place).observe(canvas);window.addEventListener('resize',place);requestAnimationFrame(place);
  window.addEventListener('keydown',e=> { if(e.key==='Escape') parent.postMessage({type:'geometry-model-close'},'*'); });
})();

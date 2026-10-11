/* Public case contract v1. Works with allow-scripts-only sandboxed frames. */
(() => {
  const frame = document.getElementById('codex-visualization');
  if (!frame || document.querySelector('.model-view-toolbar')) return;
  const panel = frame.closest('.digital-panel') || frame.parentElement;
  const label = panel.querySelector('.panel-label');
  const bar = document.createElement('div');
  bar.className = 'model-view-toolbar';
  const title = document.createElement('span');
  title.id = 'expanded-model-title';
  title.textContent = label?.textContent || '조작 가능한 시각화';
  if (label) label.hidden = true;
  const toggle = document.createElement('button');
  toggle.type = 'button'; toggle.className = 'model-expand-toggle';
  toggle.textContent = '시각화 확대';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', frame.id);
  const modelLink = document.createElement('a');
  modelLink.className = 'model-only-link';
  modelLink.textContent = '모형만 크게 보기 ↗';
  modelLink.href = 'models/' + (location.pathname.split('/').pop() || 'index.html');
  modelLink.target = '_blank'; modelLink.rel = 'noopener noreferrer';
  bar.append(title, modelLink, toggle); panel.insertBefore(bar, frame);
  const guards = [document.createElement('span'), document.createElement('span')];
  guards.forEach(g => { g.className = 'model-focus-guard'; g.tabIndex = 0; });
  panel.insertBefore(guards[0], bar); panel.append(guards[1]);
  let expanded = false, inertRecords = [], savedAttributes = [];
  function close() {
    if (!expanded) return;
    expanded = false;
    panel.classList.remove('is-model-expanded');
    document.body.classList.remove('model-expanded');
    inertRecords.forEach(([el, value]) => { el.inert = value; });
    savedAttributes.forEach(([key, value]) => { if(value===null) panel.removeAttribute(key); else panel.setAttribute(key,value); });
    inertRecords = []; savedAttributes = [];
    toggle.textContent = '시각화 확대'; toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }
  toggle.addEventListener('click', () => {
    if (expanded) { close(); return; }
    expanded = true;
    ['role','aria-modal','aria-labelledby'].forEach(key => savedAttributes.push([key,panel.getAttribute(key)]));
    panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.setAttribute('aria-labelledby',title.id);
    let branch = panel;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) if(sibling!==branch) { inertRecords.push([sibling,sibling.inert]); sibling.inert=true; }
      branch=branch.parentElement;
      if(branch===document.body) break;
    }
    document.body.classList.add('model-expanded'); panel.classList.add('is-model-expanded');
    toggle.textContent='확대 닫기'; toggle.setAttribute('aria-expanded','true'); toggle.focus();
  });
  guards[0].addEventListener('focus',()=> { if(expanded) frame.focus(); });
  guards[1].addEventListener('focus',()=> { if(expanded) toggle.focus(); });
  document.addEventListener('keydown',e=> { if(e.key==='Escape' && expanded) { e.preventDefault(); close(); } });
  window.addEventListener('message',e=> {
    if(e.source===frame.contentWindow && e.data?.type==='geometry-model-close' && Object.keys(e.data).length===1) close();
  });
})();

// THE WORLD EDITOR'S PLACE TAB: new Polyfork things (data/weplace-*.json, a category fetched when first needed) put down outside, then edited like anything else.
import {SHARED, THREE} from './003-shx.js';
import {ROOMS, TEXT, WE} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
{ const LIST=__LAZY__("data/weplace.json"), CAT=[__LAZY__("data/weplace-0.json"),__LAZY__("data/weplace-1.json"),__LAZY__("data/weplace-2.json"),__LAZY__("data/weplace-3.json"),__LAZY__("data/weplace-4.json"),
    __LAZY__("data/weplace-5.json"),__LAZY__("data/weplace-6.json"),__LAZY__("data/weplace-7.json"),__LAZY__("data/weplace-8.json"),__LAZY__("data/weplace-9.json"),__LAZY__("data/weplace-10.json"),
    __LAZY__("data/weplace-11.json"),__LAZY__("data/weplace-12.json")];
  const M=TILE/.84, GEO={}, RAW={}, GOT={}, CI={}; let L=null, armed=null, ghost=null, turn=0;
  const list=()=>L||(L=LIST().then(j=>{ const by={}; for(const [ci,k,n,m] of j.list)by[k]={ci,n,m}; return {...j,by}; }));
  const cat=ci=>GOT[ci]||(GOT[ci]=CAT[ci]().then(D=>{ Object.assign(RAW,D); for(const k in D)CI[k]=ci; return D; }));
  const geo=k=>{ '@later'; const D=RAW[k]; if(!D)return null; const q=new Int16Array(Uint8Array.from(atob(D.p),c=>c.charCodeAt(0)).buffer), col=Uint8Array.from(atob(D.c),c=>c.charCodeAt(0)), b=D.b;
    const P=new Float32Array(q.length), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<q.length;i++){ const a=i%3; P[i]=(b[a]+(q[i]+32768)/65535*(b[a+3]-b[a]))*M; }
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  WE.pfGeo=k=>GEO[k]||(RAW[k]?(GEO[k]=geo(k)):null);
  WE.pfTree=k=>CI[k]===0;   // the TREES category
  WE.pfList=()=>list();   // every thing and its category (the ITEM editor's PLACE list)
  WE.pfFoot=k=>{ const f=RAW[k]&&RAW[k].f; return f?f.map(v=>v*M):null; };
  WE.pfLoad=k=>list().then(j=>{ const e=j.by[k]; if(!e)throw new Error('no '+k); return cat(e.ci); });
  // the tab: a category, a search, the things in it; one armed follows the mouse until you click the ground
  const P=document.getElementById('we'), pane=P.querySelector('.pane');
  const css=document.createElement('style'); css.textContent=`#we .wtabs{display:flex;gap:4px;padding:8px 14px 0} #we .wtabs .btn[aria-pressed=true]{border-color:var(--key);color:var(--key)}
  #wplace select,#wplace input{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:4px;width:100%;box-sizing:border-box;margin:3px 0}
  #wplist{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;max-height:280px;overflow:auto;margin:6px 0} #wplist .btn{text-align:left;font-size:11px;padding:4px 6px} #wplist .btn[aria-pressed=true]{border-color:var(--key);color:var(--key)}`;
  document.head.appendChild(css);
  const tabs=document.createElement('div'); tabs.className='wtabs'; tabs.innerHTML='<button class="btn" data-wt="edit" aria-pressed="true">EDIT</button><button class="btn" data-wt="place" aria-pressed="false">PLACE</button>';
  const box=document.createElement('div'); box.id='wplace'; box.className='pane'; box.hidden=true;
  box.innerHTML='<select id="wpcat"></select><input id="wpq" placeholder="search…" autocomplete="off"><div id="wplist" class="dim">loading…</div><div class="row"><button class="btn" data-pt="-45">⟲ 45°</button><button class="btn" data-pt="45">⟳ 45°</button><button class="btn" id="wpno">CANCEL</button></div><div class="dim" id="wpsay">pick a thing, then click the ground to put it down</div>';
  P.insertBefore(tabs,pane); queueMicrotask(()=>paint('edit')); P.insertBefore(box,pane.nextSibling);
  const $=s=>P.querySelector(s); for(const ev of ['keydown','keyup','keypress'])$('#wpq').addEventListener(ev,e=>e.stopPropagation());
  const say=t=>{ $('#wpsay').textContent=t; };
  const paint=w=>{ for(const b of tabs.children){ const on=b.dataset.wt===w; b.setAttribute('aria-pressed',String(on)); b.setAttribute('aria-selected',String(on)); } };
  const tab=w=>{ paint(w); pane.hidden=w!=='edit'; box.hidden=w!=='place'; if(w!=='place')arm(null); else fill(); };
  tabs.onclick=e=>{ const b=e.target.closest('[data-wt]'); if(b)tab(b.dataset.wt); };
  const fill=async()=>{ '@later'; const j=await list().catch(()=>null), sel=$('#wpcat'); if(!j){ $('#wplist').textContent='the things did not load'; return; }
    if(!sel.options.length)sel.innerHTML=j.cats.map((c,i)=>`<option value="${i}">${c} (${j.list.filter(r=>r[0]===i).length})</option>`).join('');
    const ci=+sel.value, q=$('#wpq').value.trim().toLowerCase(), rows=j.list.filter(r=>q?r[2].toLowerCase().includes(q):r[0]===ci);
    $('#wplist').innerHTML=rows.map(r=>`<button class="btn" data-pk="${r[1]}" aria-pressed="${!!armed&&armed.k===r[1]}" aria-selected="${!!armed&&armed.k===r[1]}">${TEXT.esc(r[2])} <span class="dim">${r[3]}m</span></button>`).join('')||'<div class="dim">nothing</div>'; };
  $('#wpcat').onchange=()=>{ $('#wpq').value=''; fill(); }; $('#wpq').oninput=()=>fill();
  const unghost=()=>{ if(ghost){ scene.remove(ghost); ghost.material.dispose(); ghost=null; } };
  const arm=async k=>{ '@later'; unghost(); armed=null; if(!k){ fill(); return; } const j=await list(); say('loading '+j.by[k].n+'…'); await WE.pfLoad(k); armed={k,n:j.by[k].n};
    ghost=new THREE.Mesh(WE.pfGeo(k),new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.5,depthWrite:false})); ghost.visible=false; scene.add(ghost); say('click the ground to put down the '+armed.n); fill(); };
  $('#wplist').onclick=e=>{ const b=e.target.closest('[data-pk]'); if(b)arm(armed&&armed.k===b.dataset.pk?null:b.dataset.pk); };
  $('#wpno').onclick=()=>{ arm(null); say('pick a thing, then click the ground to put it down'); };
  P.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{ turn=(turn+ +b.dataset.pt+360)%360; if(ghost)ghost.rotation.y=turn*Math.PI/180; });
  const outside=()=>!ROOMS.cur&&SHARED.LVL==='up';
  renderer.domElement.addEventListener('pointermove',e=>{ if(!ghost||!WE.on||!WE.iso())return; const g=WE.ground(e); ghost.visible=!!g&&outside(); if(g){ ghost.position.set(g[0],g[1],g[2]); ghost.rotation.y=turn*Math.PI/180; } });
  WE.placeDown=e=>{ if(!armed||e.button!==0)return false; if(!outside()){ say('things go outside only'); return true; } const g=WE.ground(e); if(!g)return true;
    if(!WE.addPf(armed.k,armed.n,g,turn)){ say('too close to you: put it down a step away'); return true; } say('put down: '+armed.n+' · click again for another, or CANCEL'); return true; };
  SYS.every(()=>{ if(!WE.on&&(armed||!box.hidden))tab('edit'); if(ghost&&!WE.iso())ghost.visible=false; },500,'099a-weplace'); }

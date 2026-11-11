// PICKING UP: PICKUP takes small finds as you walk over them (owner, 11 Nov 2026; a thing marked walk: ()=>its item id or null: mushrooms barefoot, wild flowers, the dungeon's loot); STRANGER and THE STRANGEST still want E or a double click; each thing gained slides into the feed top right in its rarity's colour; a STRANGER or THE STRANGEST find is held up, a cheer and its name over your head for the players near (ONLINE.said); a setting under KEYS turns walking over off.
import {SHARED, THREE} from './003-shx.js';
import {BAG, FORAGE, INV, ITEMS, MOTION, ONLINE, pos, TEXT, UI} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
const PICKUP={on:SAVE.get('walkpick')!=='0'};
{ const T=TILE, esc=TEXT.esc;
  // walking over: within a small reach of your feet, at your height; each thing tried once until you step away from it
  const R=.42*T, V=new THREE.Vector3();
  SYS.every(()=>{ if(!PICKUP.on||UI.fly||UI.menuOpen)return; const L=UI.things; for(let i=L.length-1;i>=0;i--){ const th=L[i]; if(!th||!th.walk||!th.obj)continue; const o=th.obj, p=o.getWorldPosition?o.getWorldPosition(V):o.position, d=Math.hypot(p.x-pos.x,p.z-pos.z);
      if(d>R*1.8){ th._wo=0; continue; } if(th._wo||d>R||Math.abs(p.y-SHARED.py)>1.2*T)continue; let id=null; try{ id=th.walk(); }catch(e){} if(!id)continue; th._wo=1; if(id!=='$'&&RARITY.of(id)>=3)continue; try{ th.act(); }catch(e){ console.warn('PICKUP',e); } } },120,'162ec-pickup walk');
  // the feed: a few lines top right, under the map; a thing gained again while its line shows counts up
  const css=document.createElement('style'); css.textContent=`#pfeed{position:fixed;right:calc((24px + env(safe-area-inset-right,0px)) / var(--uiz,1));z-index:6;width:230px;display:flex;flex-direction:column;gap:4px;pointer-events:none;font:12px 'Share Tech Mono',ui-monospace,monospace;letter-spacing:.6px;zoom:var(--uiz,1)}
    #pfeed div{display:flex;gap:8px;align-items:center;padding:4px 8px;color:#7dffa8;background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),rgba(2,10,6,.86);box-shadow:inset 0 0 0 1px #2d5a40;border-left:4px solid;transition:opacity .5s,transform .3s;transform:translateX(0)} #pfeed div.in{transform:translateX(30px);opacity:0} #pfeed div.out{opacity:0}
    #pfeed img{width:20px;height:20px;flex:none;image-rendering:pixelated} #pfeed b{font-weight:400;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis} #pfeed i{font-style:normal}`; document.head.appendChild(css);
  const F=document.createElement('div'); F.id='pfeed'; document.body.appendChild(F);
  const place=()=>{ const m=document.getElementById('hmap'), z=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uiz'))||1; let b=0; if(m&&!m.hidden)for(const e of [m,...m.querySelectorAll('*')]){ const r=e.getBoundingClientRect(); if(r.height&&r.bottom>b)b=r.bottom; } F.style.top=((b?b+10:96))/z+'px'; };
  const LIVE=new Map();
  PICKUP.feed=(id,n)=>{ if(!id||id==='x'||!(n>0))return; place(); const k=String(id).split('~')[0], col=RARITY.col(k); let L=LIVE.get(k);
    if(L){ L.n+=n; L.el.querySelector('i').textContent='×'+L.n; clearTimeout(L.t); L.el.classList.remove('out'); }
    else { const el=document.createElement('div'); el.className='in'; el.style.borderLeftColor=col; el.innerHTML=`<img alt="" src="${BAG.icon?BAG.icon(k):''}"><b style="color:${col}">${esc(FORAGE.name(k))}</b><i>×${n}</i>`; F.prepend(el); requestAnimationFrame(()=>el.classList.remove('in')); L={el,n}; LIVE.set(k,L); while(F.children.length>5)F.lastChild.remove(); }
    L.t=setTimeout(()=>{ L.el.classList.add('out'); setTimeout(()=>{ L.el.remove(); LIVE.delete(k); },500); },4000);
    if(RARITY.of(k)>=3&&ITEMS.group(k)==='finds')PICKUP.hold(k); };
  INV.gained.push((id,n)=>{ if(SYS.started)PICKUP.feed(id,n); });
  // held up: a cheer the players near see (MOTION is shared) and the find's name over your head (the chat's line, ONLINE.said)
  let lastHeld=0;
  PICKUP.hold=k=>{ const now=performance.now(); if(now-lastHeld<4000)return; lastHeld=now; try{ MOTION.play('cheer'); }catch(e){} const t='★ FOUND '+FORAGE.name(k)+' · '+RARITY.name(k)+' ★'; if(ONLINE.said&&ONLINE.on)ONLINE.said(t); else if(UI.log)UI.log(t,RARITY.col(k)); };
  // its setting, under KEYS
  const row=()=>{ const p=document.querySelector('.pane[data-p="keys"]'); if(!p||p.querySelector('#dwalkp'))return; const d=document.createElement('div'); d.className='row onoff'; d.style.marginBottom='10px'; d.innerHTML='<button class="btn" id="dwalkp">WALK OVER SMALL FINDS TO PICK THEM UP</button>'; p.prepend(d);
    const b=d.firstChild, show=()=>b.setAttribute('aria-pressed',String(PICKUP.on)); show(); b.onclick=()=>{ PICKUP.on=!PICKUP.on; try{ SAVE.set('walkpick',PICKUP.on?'1':'0'); }catch(e){} show(); }; };
  SYS.every(row,1000,'162ec-pickup setting');
  window.PICKUP=PICKUP; }

// THE HUB: ESC opens one wheel in the middle of the screen (owner, 11 Nov 2026, Red Dead's two wheels as one): its top half the menus (SETTINGS, WHAT YOU CAN DO, PETS, MAP, EMOTES; ADMIN and TENANTS for the owners), its bottom half your things by kind (ITEMS.group); a menu opens its window as before, a kind puts its thing in your hands (as its quick slot would), the mouse wheel steps through that kind; the middle is the BAG. The game goes on behind it.
import {ARCHI, BAG, CINEMA, FORAGE, HUD, INV, ITEMS, MOTION, TEXT, UI} from './003b-systems.js';
import {RARITY} from './013a-rarity.js';
import {ITEMCARD} from './162eb-card.js';
const HUB={};
{ const esc=TEXT.esc, NS='http://www.w3.org/2000/svg', SZ=460, C=SZ/2, R1=SZ/2-6, R0=78;
  const MENUS=[['SETTINGS','',()=>UI.menuTab('set')],['WHAT YOU CAN DO','?',()=>UI.menuTab('moves')],['PETS','',()=>UI.menuTab('pets')],['MAP','SHIFT+M',()=>UI.menuTab('map')],['EMOTES','H',()=>MOTION.toggle&&MOTION.toggle()]];
  const OWN=[['TENANTS','',()=>UI.menuTab('tenants')],['ADMIN','',()=>UI.menuTab('admin')]];
  const KN={tools:'TOOLS',food:'FOOD',music:'MUSIC',rides:'RIDES',lights:'LIGHTS',wear:'WEAR',finds:'FINDS',other:'OTHER'};
  let own=false, step={}, el=null, svg=null, mid=null;
  const mine=()=>Object.keys(INV.items).filter(id=>INV.items[id]>0&&id!=='x'&&!ARCHI(id));
  HUB.of=g=>mine().filter(id=>ITEMS.group(id)===g).sort((a,b)=>RARITY.of(b)-RARITY.of(a)||FORAGE.name(a).localeCompare(FORAGE.name(b)));
  const css=document.createElement('style'); css.textContent=`#hub{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.35);display:grid;place-items:center;font-family:'Share Tech Mono',ui-monospace,monospace} #hub[hidden]{display:none}
    #hub .hw{position:relative;width:${SZ}px;height:${SZ}px;max-width:94vw;max-height:94vw;zoom:var(--uiz,1)} #hub svg{width:100%;height:100%;display:block;overflow:visible}
    #hub path{fill:rgba(3,26,13,.92);stroke:#3aa866;stroke-width:2;cursor:pointer;transition:fill .1s} #hub path.hi{fill:#7dffa8} #hub path.own{stroke:#f2c14e} #hub path.own.hi{fill:#f2c14e} #hub path.none{fill:rgba(3,26,13,.6);stroke:#1d4a2f}
    #hub text{fill:#7dffa8;font-size:13px;letter-spacing:1.5px;pointer-events:none;font-family:inherit} #hub text.s{font-size:9px;opacity:.7} #hub text.hi{fill:#020a06} #hub text.none{fill:#2d6a45}
    #hub circle.bag{fill:rgba(3,26,13,.95);stroke:#3aa866;stroke-width:2;cursor:pointer} #hub circle.bag.hi{fill:#7dffa8}
    #hub .hm{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:140px;text-align:center;color:#3aa866;font-size:11px;line-height:1.5;letter-spacing:1px;pointer-events:none} #hub .hm b{display:block;font-weight:400;font-size:14px;color:#7dffa8} #hub .hm.hi b,#hub .hm.hi{color:#020a06}
    #hub .hk{position:absolute;left:50%;bottom:-30px;transform:translateX(-50%);white-space:nowrap;color:#3aa866;font-size:11px;letter-spacing:1px}`; document.head.appendChild(css);
  const P=(a,r)=>`${(C+r*Math.cos(a)).toFixed(1)} ${(C+r*Math.sin(a)).toFixed(1)}`;
  const seg=(a0,a1)=>`M${P(a0,R0)} L${P(a0,R1)} A${R1} ${R1} 0 0 1 ${P(a1,R1)} L${P(a1,R0)} A${R0} ${R0} 0 0 0 ${P(a0,R0)}Z`;
  const words=t=>{ const w=t.split(' '); return t.length>10&&w.length>2?[w.slice(0,2).join(' '),w.slice(2).join(' ')]:t.length>10&&w.length>1?[w[0],w.slice(1).join(' ')]:[t]; };
  let S=[], hi=-1;
  const cur=g=>{ const L=HUB.of(g); if(!L.length)return null; const i=((step[g]||0)%L.length+L.length)%L.length; step[g]=i; return L[i]; };
  const middle=()=>{ if(!mid)return; const s=S[hi]; mid.classList.toggle('hi',hi===-2);
    if(hi===-2){ mid.innerHTML='<b>BAG</b>EVERYTHING · I'; return; } if(!s){ mid.innerHTML='<b>ESC</b>CLOSES'; return; }
    if(s.menu){ mid.innerHTML=`<b>${esc(s.name)}</b>OPENS IT`; return; } const L=HUB.of(s.g), id=cur(s.g);
    mid.innerHTML=id?`<b style="color:${RARITY.col(id)}">${esc(FORAGE.name(id))}</b>${s.name} · ${step[s.g]+1} / ${L.length}<br>CLICK HOLDS · WHEEL STEPS`:`<b>${s.name}</b>NOTHING OF THIS KIND`; };
  const light=i=>{ hi=i; svg.querySelectorAll('[data-i]').forEach(e=>e.classList.toggle('hi',+e.dataset.i===i)); const b=svg.querySelector('circle.bag'); if(b)b.classList.toggle('hi',i===-2); middle(); };
  const draw=()=>{ const M=MENUS.concat(own?OWN:[]), G=ITEMS.GROUPS; S=[]; let h='';
    M.forEach((m,i)=>{ const a0=Math.PI+i/M.length*Math.PI+.012, a1=Math.PI+(i+1)/M.length*Math.PI-.012; S.push({menu:true,name:m[0],key:m[1],go:m[2],a0,a1,own:i>=MENUS.length}); });
    G.forEach((g,i)=>{ const a0=i/G.length*Math.PI+.012, a1=(i+1)/G.length*Math.PI-.012; S.push({g,name:KN[g],a0,a1}); });
    S.forEach((s,i)=>{ const n=s.g?HUB.of(s.g).length:1, am=(s.a0+s.a1)/2, rm=(R0+R1)/2+6, x=C+rm*Math.cos(am), y=C+rm*Math.sin(am), L=words(s.name), cls=s.own?'own':!n?'none':'', id=s.g?cur(s.g):null;
      h+=`<path data-i="${i}" class="${cls}" d="${seg(s.a0,s.a1)}"${id?` data-card="${esc(id)}"`:''}/>`;
      h+=`<text data-i="${i}" class="${!n?'none':''}" x="${x}" y="${y-(L.length-1)*8}" text-anchor="middle">${L.map((l,j)=>`<tspan x="${x}" dy="${j?16:0}">${esc(l)}</tspan>`).join('')}</text>`;
      h+=`<text data-i="${i}" class="s${!n?' none':''}" x="${x}" y="${y+(L.length-1)*8+16}" text-anchor="middle">${esc(s.g?(n?n+(n>1?' THINGS':' THING'):'NONE'):s.key||'')}</text>`; });
    h+=`<circle class="bag" cx="${C}" cy="${C}" r="${R0-8}"/><line x1="${C-R1}" y1="${C}" x2="${C-R0}" y2="${C}" stroke="#7dffa8" stroke-dasharray="4 4"/><line x1="${C+R0}" y1="${C}" x2="${C+R1}" y2="${C}" stroke="#7dffa8" stroke-dasharray="4 4"/>`;
    svg.innerHTML=h; light(hi); };
  const pick=i=>{ const s=S[i]; if(i===-2){ HUB.close(); BAG.toggle&&BAG.toggle(true); return; } if(!s)return; if(s.menu){ HUB.close(); s.go(); return; } const id=cur(s.g); if(!id)return; HUB.close(); if(HUD.useItem)HUD.useItem(id); };
  const make=()=>{ el=document.createElement('div'); el.id='hub'; el.hidden=true; el.innerHTML='<div class="hw"><svg viewBox="0 0 '+SZ+' '+SZ+'"></svg><div class="hm"></div><div class="hk">ESC CLOSES · CLICK CHOOSES · WHEEL STEPS THROUGH A KIND</div></div>'; document.body.appendChild(el);
    svg=el.querySelector('svg'); mid=el.querySelector('.hm');
    svg.addEventListener('pointerover',e=>{ const t=e.target; if(t.dataset&&t.dataset.i!=null)light(+t.dataset.i); else if(t.classList&&t.classList.contains('bag'))light(-2); });
    svg.addEventListener('click',e=>{ const t=e.target; if(t.dataset&&t.dataset.i!=null)pick(+t.dataset.i); else if(t.classList&&t.classList.contains('bag'))pick(-2); });
    el.addEventListener('click',e=>{ if(e.target===el)HUB.close(); });
    el.addEventListener('wheel',e=>{ const s=S[hi]; if(!s||!s.g)return; e.preventDefault(); const n=HUB.of(s.g).length; if(!n)return; step[s.g]=((step[s.g]||0)+(e.deltaY>0?1:-1)+n)%n; const p=svg.querySelector(`path[data-i="${hi}"]`), id=cur(s.g); if(p&&id){ p.dataset.card=id; ITEMCARD.show(id,e.clientX,e.clientY); } middle(); },{passive:false}); };
  HUB.open=()=>{ if(!el)make(); if(CINEMA.isAdmin&&!own)CINEMA.isAdmin().then(o=>{ if(o&&!own){ own=true; if(HUB.on)draw(); } }).catch(()=>{}); HUB.on=UI.hubOpen=true; el.hidden=false; hi=-1; draw(); };
  HUB.close=()=>{ if(!el||el.hidden)return; el.hidden=true; HUB.on=UI.hubOpen=false; ITEMCARD.hide(); };
  HUB.toggle=()=>HUB.on?HUB.close():HUB.open();
  Object.assign(UI,{hub:HUB.toggle});
  window.HUB=HUB; }

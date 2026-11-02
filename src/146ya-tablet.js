// THE TABLET: everyone carries a rugged red tablet (data/tablet.json, the owner's model); TAB raises it in your hands and wakes its screen, a home of apps for what the game already has: CALL (any shop), ORDER and ARCADE (the BBS), MAP, CHAT and PLAYERS (online).
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DRONE, FORAGE, INV, ONLINE, TABLET, UI, WIELD} from './003b-systems.js';
import {PHONE} from './146y-operator.js';
{ const DATA=__LAZY__("data/tablet.json"), ID='tablet';
  FORAGE.add({names:{[ID]:'TABLET'}});
  let geo=null; const want=[];
  const build=d=>{ const B=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer, q=new Uint16Array(B(d.p)), ix=new Uint16Array(B(d.i)), fc=new Uint8Array(B(d.f)), lo=d.lo, hi=d.hi;
    const pal=d.pal.map(h=>new THREE.Color('#'+h).convertSRGBToLinear()), P=new Float32Array(ix.length*3), C=new Float32Array(ix.length*3);
    for(let i=0;i<ix.length;i++){ const v=ix[i]; for(let a=0;a<3;a++)P[i*3+a]=lo[a]+q[v*3+a]/65535*(hi[a]-lo[a]); const c=pal[fc[(i/3)|0]]; C[i*3]=c.r; C[i*3+1]=c.g; C[i*3+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.computeVertexNormals(); return g; };
  const MAT=new THREE.MeshLambertMaterial({vertexColors:true});
  const fill=G=>{ const m=new THREE.Mesh(geo,MAT); m.castShadow=true; m.position.set(0,-.02,-.02); G.inner.add(m); };
  // held: its bottom edge in the palm, tipped up toward your face (the arm points out and down, the hand's frame is the forearm's)
  const make=()=>{ const G=new THREE.Group(), I=new THREE.Group(); I.rotation.x=.95; I.scale.setScalar(2.6); G.add(I); G.inner=I; G.head=new THREE.Vector3(0,.3,0);
    if(geo)fill(G); else{ want.push(G); if(want.length===1)DATA().then(d=>{ geo=build(d); for(const g of want.splice(0))fill(g); }); } return G; };
  const kind={name:'TABLET',hint:'A CLICK WAKES THE SCREEN. TAB PUTS IT AWAY.',make,
    aim:(dt,aim)=>{ const h=SHARED.heading||0; aim.set(Math.sin(h)*.75,-.6,Math.cos(h)*.75).normalize(); return true; },
    use:()=>{ open(); }};
  WIELD.kind?WIELD.kind(ID,kind):(WIELD.pend=WIELD.pend||[]).push([ID,kind]);

  /* ---------- the screen: a window shaped like the tablet, a home of app tiles ---------- */
  const css=document.createElement('style'); css.textContent=`#tablet{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:22;width:min(560px,94vw);zoom:var(--uiz,1);background:#e0553e;border-radius:26px;padding:18px 22px 30px;box-shadow:inset 0 -6px 0 #b8402e,0 10px 40px #000a;font:11px Silkscreen,monospace;letter-spacing:1px}
    #tablet:before,#tablet:after{content:'';position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:34%;height:18px;border:8px solid #e0553e;border-bottom:0;border-radius:14px 14px 0 0}
    #tablet:after{top:-10px;width:16%;height:6px;background:#2a2c30;border:0;border-radius:4px}
    #tablet .scr{background:#1a1c20;border-radius:10px;padding:8px} #tablet .in{background:#c6e6f6;border-radius:6px;min-height:250px;padding:8px;color:#1a2a36}
    #tablet .bar{display:flex;justify-content:space-between;color:#3a5a6e;margin-bottom:8px} #tablet .apps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    #tablet .app{font:inherit;letter-spacing:1px;border:0;border-radius:10px;padding:14px 4px 10px;color:#fff;cursor:pointer;box-shadow:inset 0 -4px 0 #0003;text-shadow:0 1px 0 #0005}
    #tablet .app b{display:block;font-size:22px;line-height:1;margin-bottom:6px} #tablet .app:disabled{filter:grayscale(1) opacity(.5);cursor:default}
    #tablet .grill{display:flex;justify-content:center;gap:5px;margin-top:10px} #tablet .grill i{width:4px;height:10px;background:#2a2c30;border-radius:2px}
    #tablet .row{display:flex;justify-content:space-between;align-items:center;background:#fff8;border-radius:6px;padding:5px 8px;margin:3px 0}
    #tablet .sm{font:inherit;color:#fff;background:#3a8a8e;border:0;border-radius:6px;padding:3px 8px;cursor:pointer}`;
  document.head.appendChild(css);
  const W=document.createElement('div'); W.id='tablet'; W.hidden=true; document.body.appendChild(W);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const APPS=[['call','CALL','☏','#f0b030',()=>!!PHONE.dial,()=>PHONE.dial('tablet')],['order','ORDER','▣','#8ac040',()=>!!DRONE.openAt,()=>DRONE.openAt('menu')],['arcade','ARCADE','◆','#30a0a8',()=>!!DRONE.openAt,()=>DRONE.openAt('games')],
    ['map','MAP','✦','#e0553e',()=>!!UI.mapWindow,()=>UI.mapWindow()],['chat','CHAT','✎','#8a6ad0',()=>!!(ONLINE.on&&ONLINE.open),()=>setTimeout(()=>ONLINE.open(),0)],['players','PLAYERS','☺','#e07a3a',()=>!!ONLINE.others,null]];
  let page='home';
  const time=()=>{ const h=CLOCK.h??12, hh=Math.floor(h), mm=Math.floor((h-hh)*60); return ((hh+11)%12+1)+':'+String(mm).padStart(2,'0')+(hh<12?' AM':' PM'); };
  const draw=()=>{ const t=time();
    let body;
    if(page==='players'){ const all=ONLINE.others?[...ONLINE.others.values()]:[];
      body='<div class="row"><b>PLAYERS ON YOUR BLOCK · '+(all.length+1)+'</b><button class="sm" data-home>HOME</button></div>'+(all.length?all.map(o=>'<div class="row"><span>'+esc(o.name||'TENANT')+' <span style="color:#5a7a8e">'+esc(o.why||'')+'</span></span>'+(ONLINE.visit?'<button class="sm" data-visit="'+esc(o.id)+'">VISIT</button>':'')+'</div>').join(''):'<div class="row">NOBODY ELSE IS ON RIGHT NOW.</div>'); }
    else body='<div class="apps">'+APPS.map(([k,n,ic,c,ok])=>'<button class="app" data-app="'+k+'" style="background:'+c+'"'+(ok()?'':' disabled')+'><b>'+ic+'</b>'+n+'</button>').join('')+'</div>';
    W.innerHTML='<div class="scr"><div class="in"><div class="bar"><span data-t>'+t+'</span><span data-c>$'+(INV.cash|0)+'</span><button class="sm" data-x style="background:#c84a3a">PUT AWAY</button></div>'+body+'</div></div><div class="grill">'+'<i></i>'.repeat(14)+'</div>'; };
  const keyd=e=>{ if(W.hidden)return; const k=(e.key||'').toLowerCase(); if(k==='escape'||k===(UI.keyOf?UI.keyOf('tablet'):'tab')){ e.preventDefault(); e.stopImmediatePropagation(); if(k==='escape'&&page!=='home'){ page='home'; draw(); return; } TABLET.away(); } };
  addEventListener('keydown',keyd,true);
  W.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.disabled)return;
    if(b.dataset.x!==undefined)return TABLET.away(); if(b.dataset.home!==undefined){ page='home'; return draw(); }
    if(b.dataset.visit){ const o=ONLINE.others.get(b.dataset.visit); if(o&&ONLINE.visit){ close(); ONLINE.visit(o.id,o.name); } return; }
    const a=APPS.find(q=>q[0]===b.dataset.app); if(!a)return; if(!a[5]){ page=a[0]; return draw(); } close(); a[5](); });
  let tick=0; const open=()=>{ page='home'; draw(); W.hidden=false; clearInterval(tick); tick=setInterval(()=>{ if(W.hidden)clearInterval(tick); else{ W.querySelector('[data-t]').textContent=time(); W.querySelector('[data-c]').textContent='$'+(INV.cash|0); } },5000); };
  const close=()=>{ W.hidden=true; clearInterval(tick); };
  // pulled up: in your hands (the WIELD, so others see it too) and the screen awake; put away: both gone
  TABLET.up=async()=>{ await LOAD('later'); if(!FORAGE.has(ID))INV.add(ID,1); if(WIELD.on!==ID)WIELD.set(ID); open(); };
  TABLET.away=()=>{ close(); if(WIELD.on===ID)WIELD.set(null); };
  TABLET.toggle=()=>{ if(!W.hidden||WIELD.on===ID)TABLET.away(); else TABLET.up(); };
  TABLET.open=()=>!W.hidden;
  (async()=>{ while(!window.__started)await new Promise(r=>setTimeout(r,250)); if(!FORAGE.has(ID))INV.add(ID,1); })();
  window.TABLETDBG=()=>({open:!W.hidden,page,held:WIELD.on===ID,has:FORAGE.has(ID),model:!!geo,apps:APPS.map(a=>[a[0],a[4]()])}); }

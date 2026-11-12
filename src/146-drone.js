// THE DRONE & BBS: the menu's BBS (or double-click the computer in your apartment): order bodega essentials or apartment furniture, follow the delivery under YOUR ORDERS, and a drone drops the parcel on your front fire escape — you bring it in (furniture goes into your apartment). THE ARCADE's games play from it too.
import {SHARED, THREE} from './003-shx.js';
import {DRONE, FORAGE, INV, ONLINE, pos, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {CAT_INFO} from './014-gamekit.js';
import {COURIER} from './111ee-courier.js';

const ballGeo=(o={})=>{ const R=o.R||.15, P=[], N=[], C=[], c=new THREE.Color(), add=(g,h)=>{ if(g.index)g=g.toNonIndexed(); P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); c.setHex(h); for(let i=0;i<g.attributes.position.count;i++)C.push(c.r,c.g,c.b); };
  add(new THREE.IcosahedronGeometry(R,1),o.body??0xb8bec8); add(new THREE.CylinderGeometry(R*1.02,R*1.02,R*.22,10),o.band??0x3a3e48);
  for(const [w,h,d,k,x,y,z] of o.more||[])add(new THREE.BoxGeometry(w,h,d).translate(x,y,z),k);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); return g; };
let DGEO=null; const VCM=new THREE.MeshLambertMaterial({vertexColors:true});
DRONE.ballGeo=ballGeo;
DRONE.mk=(o={})=>{ const R=.15, D=new THREE.Group(); D.add(new THREE.Mesh(DGEO||(DGEO=ballGeo()),VCM));
  const lens=new THREE.Mesh(new THREE.BoxGeometry(R*.5,R*.3,R*.2),new THREE.MeshBasicMaterial({color:o.lens??0xff3a3a})); lens.position.set(0,-R*.36,R*.86); D.add(lens);
  const parcel=new THREE.Mesh(new THREE.BoxGeometry(.2,.15,.2),new THREE.MeshLambertMaterial({color:0xa77a48})); parcel.position.set(0,-R-.085,0); D.add(parcel); parcel.visible=o.parcel!==false;
  D.scale.setScalar(o.s??TILE/1.13); return {D,parcel,lens}; };

DRONE.init=()=>{ const APTS=MODS.apts; if(!APTS||!APTS.R)return; const T=TILE, X=SHARED.BOD.X, Y=SHARED.BOD.Y, Z=SHARED.BOD.Z, AR=APTS.R, K=SHARED.BOD.K;
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), flat=c=>new THREE.MeshBasicMaterial({color:c}), bx=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);

  const BODEGA=[['CAT FOOD',1,'g_catfood'],['FISH FOOD',3,'g_fishfood'],['SPRAY PAINT, SILVER',6,'spray_silver'],['SPRAY PAINT, GOLD',14,'spray_gold']];
  const FURN=['armchair','floor lamp','bookcase','coffee table','plant pot','fiddle-leaf fig','patterned rug','desk lamp','poster','radio']
    .filter(k=>K.CATALOG[k]).map(k=>{ const i=CAT_INFO[k]||{}; return [k,(i.name||k.replace(/\b\w/g,c=>c.toUpperCase())),(i.price||20)]; });

  const FKEY='apt-furn', ownedFurn=()=>{ try{ return JSON.parse(OWNED.get(FKEY)||'[]'); }catch(e){ return []; } }, saveFurn=l=>{ try{ OWNED.set(FKEY,JSON.stringify(l)); }catch(e){} };
  const SLOTS=[[5.2,4],[6.8,4.3],[8.3,4.3],[5.2,5.4],[6.8,5.6],[8.3,5.6],[9.6,4.3],[4.2,4.6]];
  const placeFurn=(kind,u,v,r)=>APTS.furnish(APTS.my,()=>{ if(MODS.apts.put)MODS.apts.put(kind,AR.x0+u,AR.y0+v,r||0); });
  for(const f of ownedFurn())placeFurn(f.kind,f.u,f.v,f.r);
  const bringFurn=kind=>{ const l=ownedFurn(), [u,v]=SLOTS[l.length%SLOTS.length]; l.push({kind,u,v,r:0}); saveFurn(l); placeFurn(kind,u,v,0); };

  const mkDrone=()=>DRONE.mk();
  const dropPoint=()=>{ const F=MODS.firev; return F&&F.spot&&!MODS.apts.NOESC?F.spot(.5):null; };

  const flights=[], parcels=[]; const V=new THREE.Vector3();
  const landParcel=(label,onIn,dp,here,who)=>{ '@later'; const p=bx(.32*T,.24*T,.32*T,lam(0xc89a5a)); p.position.set(dp.x+(Math.random()-.5)*.5*T,dp.y+.12*T,dp.z); scene.add(p); parcels.push(p);
    const th={name:'A PARCEL: '+label,pick:true,obj:p,reach:1.3*T,near:2.6*T,tall:.7*T,act:()=>{ if(!p.parent)return; scene.remove(p); const i=parcels.indexOf(p); if(i>=0)parcels.splice(i,1); onIn(); toast('YOU BRING IN: '+label); }};
    UI.thing(th); toast((who||'THE DRONE')+' DROPPED '+label+(here?' BY YOU':' ON YOUR FIRE ESCAPE')); };
  // o.follow: a spot read every frame (the phone's orders: the drone comes to you wherever you are)
  const deliver=(label,onIn,o={})=>{ const dp=o.follow?o.follow():dropPoint(); if(!dp){ onIn(); toast('DELIVERED: '+label); return; }
    const {D,parcel}=mkDrone(); scene.add(D); D.position.set(dp.x,dp.y+8*T,dp.z-6*T); DRONE.state='out'; flights.push({D,parcel,label,onIn,dp,follow:o.follow,ph:'in'});
    if(ONLINE.on)ONLINE.send({t:'drone',lb:String(label).slice(0,40),f:o.follow?1:0,x:+dp.x.toFixed(2),y:+dp.y.toFixed(2),z:+dp.z.toFixed(2)}); };   // everyone near sees it fly (owner, 8 Nov 2026: "make the drone shared so everyone sees it")
  // someone else's delivery: the same drone flying to them (or their fire escape) and the parcel left by them a while; theirs to take, not yours
  const seen=[]; ONLINE.hear.drone=m=>{ if(!m||!isFinite(m.x)||!isFinite(m.z)||Math.hypot(m.x-pos.x,m.z-pos.z)>80*T||SHARED.LVL!=='up')return;
    const id=m.id, at=()=>{ const q=m.f&&ONLINE.others.get(id); if(!q||!q.p)return null; const g=SHARED.groundY?SHARED.groundY(q.p.x,q.p.z):m.y; return {x:q.p.x+.9*T,y:g,z:q.p.z}; };
    const dp={x:+m.x,y:+m.y||0,z:+m.z};
    if(m.c){ if(COURIER.bring)COURIER.bring(()=>at()||dp,q=>{ const p=bx(.32*T,.24*T,.32*T,lam(0xc89a5a)); p.position.set(q.x,(SHARED.groundY?SHARED.groundY(q.x,q.z):dp.y)+.12*T,q.z); scene.add(p); seen.push({left:p,lt:45,done:true}); }); return; }   // THE COURIER rides it over on your screen too
    const {D,parcel}=mkDrone(); scene.add(D); D.position.set(dp.x,dp.y+8*T,dp.z-6*T); seen.push({D,parcel,dp,follow:m.f?at:null,ph:'in',theirs:1}); };
  DRONE.go=deliver; DRONE.land=landParcel; DRONE.tell=(label,dp,c)=>{ if(ONLINE.on)ONLINE.send({t:'drone',lb:String(label).slice(0,40),f:1,c:c?1:0,x:+dp.x.toFixed(2),y:+dp.y.toFixed(2),z:+dp.z.toFixed(2)}); };
  SYS.add('life',dt=>{ if(!dt)return;
    for(const f of [...flights,...seen]){ if(f.left&&(f.lt-=dt)<=0){ scene.remove(f.left); f.left=null; }
      if(f.ph==='in'){ if(f.follow){ const q=f.follow(); if(q)f.dp=q; } V.set(f.dp.x,f.dp.y+1.4*T,f.dp.z); f.D.position.lerp(V,Math.min(1,dt*2.2)); if(f.D.position.distanceTo(V)<.18*T)f.ph='drop'; }
      else if(f.ph==='drop'&&f.theirs){ f.parcel.visible=false; const p=bx(.32*T,.24*T,.32*T,lam(0xc89a5a)); p.position.set(f.dp.x,f.dp.y+.12*T,f.dp.z); scene.add(p); f.left=p; f.lt=45; f.away=new THREE.Vector3(f.dp.x,f.dp.y+9*T,f.dp.z-7*T); f.ph='away'; }
      else if(f.ph==='drop'){ f.parcel.visible=false; landParcel(f.label,f.onIn,f.dp,!!f.follow); f.away=new THREE.Vector3(f.dp.x,f.dp.y+9*T,f.dp.z-7*T); f.ph='away'; }
      else if(f.ph==='away'){ f.D.position.lerp(f.away,Math.min(1,dt*2)); if(f.D.position.distanceTo(f.away)<.4*T){ scene.remove(f.D); f.done=true; } } }
    for(let i=flights.length-1;i>=0;i--)if(flights[i].done)flights.splice(i,1); for(let i=seen.length-1;i>=0;i--)if(seen[i].done&&!seen[i].left)seen.splice(i,1); if(!flights.length&&DRONE.state!=='home')DRONE.state='home'; },'146-drone');

  const purse={get:()=>INV.cash,add:v=>{ INV.cash+=v; }}; DRONE.purse=purse;
  const toast=msg=>{ '@later'; let el=document.getElementById('dtoast'); if(!el){ el=document.createElement('div'); el.id='dtoast'; el.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);font:12px var(--pixel,monospace);color:#e8f4dc;background:#14161a;border:2px solid #3a4a3a;padding:6px 10px;z-index:15;pointer-events:none'; document.body.appendChild(el); } el.textContent=msg; el.hidden=false; clearTimeout(el.t); el.t=setTimeout(()=>{ el.hidden=true; },3600); };

  // ============ THE BBS: the menu's BBS (owner, 5 Nov 2026: the C64 terminal gives way to the menu's look); the computer in your apartment opens it too ============
  const COMP={page:'shop',host:null,orders:[],msg:'',arc:false}, E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const aptNum=()=>APTS.num||'--', flightState=()=>{ const f=flights[0]; if(!f)return 'done'; return f.ph; };
  const CABS=()=>[...STORE.cabs.walls.e,...STORE.cabs.walls.w].filter(n=>STORE.cabs.reg[n]);
  const doOrder=()=>{ '@later'; const furn=COMP.list==='furn', it=(furn?FURN:BODEGA)[COMP.sel]; if(!it)return; const label=furn?it[1]:it[0], price=furn?it[2]:it[1], kind=furn?it[0]:null;
    if(DRONE.state!=='home'){ COMP.msg='THE DRONE IS OUT. WAIT FOR IT TO COME BACK.'; return draw(); } if(purse.get()<price){ COMP.msg='NOT ENOUGH MONEY.'; return draw(); }
    purse.add(-price); COMP.orders.push({no:1001+COMP.orders.length,name:label}); deliver(label,furn?()=>bringFurn(kind):()=>{ const b=BODEGA.find(q=>q[0]===label); if(b&&b[2]&&FORAGE.give){ FORAGE.give(b[2],1); if(FORAGE.draw)FORAGE.draw(); } });
    COMP.msg=''; COMP.page='orders'; if(UI.menuOpen&&COMP.host&&COMP.host.isConnected&&!COMP.host.hidden)UI.menuTab('bbs','orders'); else draw(); };
  DRONE.pick=(list,i)=>{ COMP.list=list; COMP.sel=i; doOrder(); };   // the one ordering path
  const draw=()=>{ const h=COMP.host; if(!h||!h.isConnected||h.hidden||!UI.menuOpen)return; const p=COMP.page, msg=COMP.msg?'<div style="color:#ffd27a;margin-bottom:8px">'+E(COMP.msg)+'</div>':'';
    let o='';
    if(p==='shop'||p==='furn'){ const furn=p==='furn', L=furn?FURN:BODEGA;
      o='<h3>'+(furn?'FURNITURE · TO YOUR APARTMENT':'THE BODEGA · DELIVERED BY DRONE')+'</h3>'+msg+'<table>'+L.map((it,i)=>'<tr><td>'+E((furn?it[1]:it[0]).toUpperCase())+'</td><td>$'+(furn?it[2]:it[1])+'</td><td><button class="btn" data-buy="'+p+':'+i+'">BUY</button></td></tr>').join('')+'</table><div class="dim" style="margin-top:10px">a drone drops it on your fire escape, apt '+E(aptNum())+' · you have $'+Math.round(purse.get())+'</div>'; }
    else if(p==='games'){ o='<h3>THE ARCADE · MAIN ST</h3>';
      if(!COMP.arc){ o+='<div class="dim">loading the arcade...</div>'; LOAD('arcade').then(()=>{ COMP.arc=true; draw(); }); }
      else { const K=STORE.cabs.kit(); o+='<table>'+CABS().map(n=>{ const e=STORE.cabs.reg[n], t=K.top(n)[0]; return '<tr><td>'+E(n)+'</td><td class="dim">'+(e.game?(t?'HI '+t.score+' '+E(t.ini):'HI ---'):'COMING SOON')+'</td><td>'+(e.game?'<button class="btn" data-play="'+E(n)+'">PLAY</button>':'')+'</td></tr>'; }).join('')+'</table>'; } }
    else { const o1=COMP.orders[COMP.orders.length-1]; o='<h3>YOUR ORDERS</h3>'+msg;
      if(!o1)o+='<div class="dim">no orders yet</div>';
      else { const ph=flightState(), f=flights[0], alt=f?Math.max(0,Math.round((f.D.position.y-f.dp.y)/T)):0;
        o+='<table>'+COMP.orders.slice().reverse().map((q,i)=>'<tr><td>#'+q.no+' '+E(q.name.toUpperCase())+'</td><td>'+(i===0?(ph==='in'?'ON ITS WAY':ph==='drop'?'AT YOUR FIRE ESCAPE':ph==='away'?'DELIVERED · THE DRONE HEADS BACK':'DELIVERED'):'DELIVERED')+'</td></tr>').join('')+'</table>';
        o+='<h3>DRONE VIEW</h3><div class="dim">'+(f?'DRONE CAM 01 · ALT '+alt+'M · TARGET: FIRE ESCAPE '+E(aptNum()):'SIGNAL LOST · THE DRONE IS HOME')+'</div>'; } }
    h.innerHTML=o; };
  DRONE.menu=(host,page)=>{ '@later'; COMP.host=host; COMP.page=page||'shop'; COMP.msg=''; draw();
    if(!host._bbs){ host._bbs=1; host.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return;
      if(b.dataset.buy){ const [l,i]=b.dataset.buy.split(':'); DRONE.pick(l,+i); }
      else if(b.dataset.play&&STORE.cabs.reg[b.dataset.play]){ if(UI.menuOpen)UI.toggleMenu(); STORE.cabs.play(b.dataset.play); } }); } };
  DRONE.open=()=>UI.menuTab('bbs','shop');
  DRONE.openAt=pg=>UI.menuTab('bbs',pg==='menu'?'shop':pg);
  DRONE.close=()=>{ const n=UI.menuNow&&UI.menuNow(); if(n&&n[0]==='bbs')UI.toggleMenu(); };
  SYS.every(()=>{ if(COMP.page==='orders')draw(); },500,'146-bbs');

  const hit=bx(.9*T,1.4*T,.9*T,new THREE.MeshBasicMaterial({visible:false})); hit.position.set(X(AR.x0+6.8),Y((APTS.RB||0)+25),Z(AR.y0+.9)); scene.add(hit);
  UI.thing({name:'THE COMPUTER',ghost:1,obj:hit,reach:1.4*T,near:2.8*T,tall:1.6*T,act:DRONE.open});
  window.DRONEDBG=()=>{ const n=UI.menuNow&&UI.menuNow(); return {state:DRONE.state,flights:flights.length,parcels:parcels.length,owned:ownedFurn().length,cash:purse.get(),furn:FURN.length,on:!!n&&n[0]==='bbs',page:n&&n[0]==='bbs'?n[1]:null,orders:COMP.orders.length,arc:COMP.arc,games:COMP.arc?CABS():[]}; }; };

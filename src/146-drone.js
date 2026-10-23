// THE DRONE & BBS: order bodega essentials or apartment furniture from the computer in your apartment; a drone drops the parcel on your front fire escape, you bring it in (furniture places itself).
import {SHARED, THREE} from './003-shx.js';
import {DRONE, INV, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {CAT_INFO} from './014-gamekit.js';

DRONE.init=()=>{ const APTS=MODS.apts; if(!APTS||!APTS.R)return; const T=TILE, X=SHARED.BOD.X, Y=SHARED.BOD.Y, Z=SHARED.BOD.Z, AR=APTS.R, K=SHARED.BOD.K;
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), flat=c=>new THREE.MeshBasicMaterial({color:c}), bx=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  const toast=msg=>{ '@later'; let el=document.getElementById('dtoast'); if(!el){ el=document.createElement('div'); el.id='dtoast'; el.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);font:12px var(--pixel,monospace);color:#e8f4dc;background:#14161a;border:2px solid #3a4a3a;padding:6px 10px;z-index:15;pointer-events:none'; document.body.appendChild(el); } el.textContent=msg; el.hidden=false; clearTimeout(el.t); el.t=setTimeout(()=>{ el.hidden=true; },3600); };

  const BODEGA=[['COFFEE',2],['SODA',2],['WATER',1],['MILK',3],['EGGS',4],['BREAD',3],['CHIPS',2],['CANDY BAR',1],['CEREAL',4],['FISH FOOD',3]];
  const FURN=['armchair','floor lamp','bookcase','coffee table','plant pot','fiddle-leaf fig','patterned rug','desk lamp','poster','radio']
    .filter(k=>K.CATALOG[k]).map(k=>{ const i=CAT_INFO[k]||{}; return [k,(i.name||k.replace(/\b\w/g,c=>c.toUpperCase())),(i.price||20)]; });

  const FKEY='apt-furn', ownedFurn=()=>{ try{ return JSON.parse(OWNED.get(FKEY)||'[]'); }catch(e){ return []; } }, saveFurn=l=>{ try{ OWNED.set(FKEY,JSON.stringify(l)); }catch(e){} };
  const SLOTS=[[5.2,4],[6.8,4.3],[8.3,4.3],[5.2,5.4],[6.8,5.6],[8.3,5.6],[9.6,4.3],[4.2,4.6]];
  const placeFurn=(kind,u,v,r)=>APTS.furnish(APTS.my,()=>{ if(MODS.apts.put)MODS.apts.put(kind,AR.x0+u,AR.y0+v,r||0); });
  for(const f of ownedFurn())placeFurn(f.kind,f.u,f.v,f.r);
  const bringFurn=kind=>{ const l=ownedFurn(), [u,v]=SLOTS[l.length%SLOTS.length]; l.push({kind,u,v,r:0}); saveFurn(l); placeFurn(kind,u,v,0); };

  const mkDrone=()=>{ const D=new THREE.Group(), GREY=lam(0x3a3d44), LIGHT=lam(0x9aa0aa); D.add(bx(.3,.08,.3,GREY)); const rot=[];
    for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const arm=bx(.22,.03,.04,GREY); arm.position.set(sx*.13,0,sz*.13); D.add(arm); const r=new THREE.Group(); r.position.set(sx*.22,.06,sz*.22); r.add(bx(.24,.01,.035,LIGHT)); D.add(r); rot.push(r); }
    const dot=bx(.05,.03,.05,flat(0xff3a3a)); dot.position.set(0,.055,.1); D.add(dot); const parcel=bx(.2,.15,.2,lam(0xa77a48)); parcel.position.set(0,-.13,0); D.add(parcel); D.scale.setScalar(T/1.13); return {D,rot,parcel}; };
  const dropPoint=()=>{ const F=window.FIREV; if(!F||!APTS.AL)return null; const A=APTS.AL, du=F.CX-(A.x0+A.x1)/2, DX=A.x0+APTS.DU+du; return {x:X(DX),y:Y(F.HZ),z:Z(F.WY+.5)}; };

  const flights=[], parcels=[]; let spin=0; const V=new THREE.Vector3();
  const landParcel=(label,onIn,dp)=>{ const p=bx(.32*T,.24*T,.32*T,lam(0xc89a5a)); p.position.set(dp.x+(Math.random()-.5)*.5*T,dp.y+.12*T,dp.z); scene.add(p); parcels.push(p);
    const th={name:'A PARCEL: '+label,pick:true,obj:p,reach:1.3*T,near:2.6*T,tall:.7*T,act:()=>{ if(!p.parent)return; scene.remove(p); const i=parcels.indexOf(p); if(i>=0)parcels.splice(i,1); onIn(); toast('YOU BRING IN: '+label); }};
    UI.thing(th); toast('THE DRONE DROPPED '+label+' ON YOUR FIRE ESCAPE'); };
  const deliver=(label,onIn)=>{ '@later'; const dp=dropPoint(); if(!dp){ onIn(); toast('DELIVERED: '+label); return; }
    const {D,rot,parcel}=mkDrone(); scene.add(D); D.position.set(dp.x,dp.y+8*T,dp.z-6*T); DRONE.state='out'; flights.push({D,rot,parcel,label,onIn,dp,ph:'in'}); };
  DRONE.go=deliver;
  SYS.add('life',dt=>{ if(!dt)return; spin+=dt*40;
    for(const f of flights){ for(const r of f.rot)r.rotation.y=spin;
      if(f.ph==='in'){ V.set(f.dp.x,f.dp.y+1.4*T,f.dp.z); f.D.position.lerp(V,Math.min(1,dt*2.2)); if(f.D.position.distanceTo(V)<.18*T)f.ph='drop'; }
      else if(f.ph==='drop'){ f.parcel.visible=false; landParcel(f.label,f.onIn,f.dp); f.away=new THREE.Vector3(f.dp.x,f.dp.y+9*T,f.dp.z-7*T); f.ph='away'; }
      else if(f.ph==='away'){ f.D.position.lerp(f.away,Math.min(1,dt*2)); if(f.D.position.distanceTo(f.away)<.4*T){ scene.remove(f.D); f.done=true; } } }
    for(let i=flights.length-1;i>=0;i--)if(flights[i].done)flights.splice(i,1); if(!flights.length&&DRONE.state!=='home')DRONE.state='home'; },'146-drone');

  const purse={get:()=>INV.cash,add:v=>{ INV.cash+=v; }}; DRONE.purse=purse;
  const css=document.createElement('style'); css.textContent='#pcp{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(460px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;font:12px var(--pixel,monospace);color:#8cf0a8;background:#0e1a12;border:2px solid #3c7a4c;padding:14px 16px 12px;z-index:16;user-select:none}#pcp h3{margin:0 0 6px;font-size:13px}#pcp h4{margin:12px 0 4px;color:#cfe8d0;font-size:12px;border-bottom:1px solid #2a5a38;padding-bottom:3px}#pcp .row{display:flex;gap:8px;align-items:center;margin:3px 0}#pcp .it{flex:1}#pcp .st{margin-top:8px;color:#cfe8d0}';
  document.head.appendChild(css); const P=document.createElement('div'); P.id='pcp'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','BBS'); document.body.appendChild(P);
  const row=(n,label,price)=>`<div class="row"><span class="it">${label}</span><span>$${price}</span><button class="btn" data-n="${n}">ORDER</button></div>`;
  const draw=()=>{ '@later'; P.innerHTML=`<h3>THE MARKET BBS &middot; APT ${APTS.num||'—'}</h3><div>YOU HAVE $${purse.get()} &middot; DRONE ${DRONE.state==='home'?'READY':'OUT'}</div>`
      +`<h4>THE BODEGA — essentials</h4>`+BODEGA.map(([n,c],i)=>row('b'+i,n,c)).join('')
      +`<h4>CATALOG — furniture</h4>`+FURN.map(([k,nm,c],i)=>row('f'+i,nm,c)).join('')
      +`<div class="row" style="margin-top:10px"><button class="btn" id="pcx">CLOSE</button></div><div class="st" id="pcst"></div>`;
    P.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>order(b.dataset.n)); P.querySelector('#pcx').onclick=()=>{ P.hidden=true; }; };
  const order=id=>{ const st=P.querySelector('#pcst'); if(DRONE.state!=='home'){ st.textContent='THE DRONE IS OUT. WAIT FOR IT TO COME BACK.'; return; }
    const furn=id[0]==='f', it=furn?FURN[+id.slice(1)]:BODEGA[+id.slice(1)]; if(!it)return; const label=furn?it[1]:it[0], price=furn?it[2]:it[1];
    if(purse.get()<price){ st.textContent='NOT ENOUGH MONEY.'; return; } purse.add(-price);
    deliver(label,furn?()=>bringFurn(it[0]):()=>{}); draw(); P.querySelector('#pcst').textContent='ORDERED: '+label+'. THE DRONE IS TAKING IT TO YOUR FIRE ESCAPE.'; };
  DRONE.open=()=>{ draw(); P.hidden=false; };

  const hit=bx(.9*T,1.4*T,.9*T,new THREE.MeshBasicMaterial({visible:false})); hit.position.set(X(AR.x0+6.8),Y(25),Z(AR.y0+.9)); scene.add(hit);
  UI.thing({name:'THE COMPUTER',ghost:1,obj:hit,reach:1.4*T,near:2.8*T,tall:1.6*T,act:DRONE.open});
  window.DRONEDBG=()=>({state:DRONE.state,flights:flights.length,parcels:parcels.length,owned:ownedFurn().length,cash:purse.get(),furn:FURN.length}); };

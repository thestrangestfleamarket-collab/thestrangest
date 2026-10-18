// ---- THE COMPUTER AND THE DELIVERY DRONE (owner, 18 Oct 2026: "bring back pc with drone delivery you can view 1st person"; his pick: the
// bodega's goods): on the cottage's writing desk (apts.js) an old beige computer, its screen green; a double click on it opens DRONE LINK: the
// bodega's shelf with prices and your money (the mail's purse when there is one: mail.js), ORDER, and DRONE CAM. The drone (a little
// quadcopter of plain blocks, a status light green at home and red while out) sits parked on the bodega's door frame, its rotors still; an
// order sends it up over the street to the house's front window, where it hovers a moment and the parcel drops inside on the floor under the
// window; then it flies home and parks (at rest, at rest). DRONE CAM looks from just behind it (the room's cut-away and the house's ceiling cut
// lifted while you watch, so the street is there to see); a double click on the parcel opens it, the thing you bought left on the floor. The
// bodega's stock and till take the sale (civic.js). Cost: the computer some 60 triangles, the drone some 150, a parcel 12; no lamp, no program
// of its own (the world's flat-banded Lambert, the screen and the light plain colour); nothing a frame while the drone is parked ----
const DRONE=window.DRONE={cam:false,state:'home'};
DRONE.init=()=>{ const H=MODS.apts; if(!H||!H.A||!H.made)return; const A=H.A, T=TILE, X=BOD.X, Y=BOD.Y, Z=BOD.Z;
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), flat=c=>new THREE.MeshBasicMaterial({color:c});
  const bx=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  // ---- the computer, on the writing desk's free end (the end away from its lamp), its screen toward the room
  const desk=H.made.find(p=>p.kind==='writing desk with a pink lamp'); if(!desk)return;
  const big=desk.boxes.filter(b=>(b.x1-b.x0)*(b.y1-b.y0)>.4), top=Math.max(...big.map(b=>b.z1)), hi=desk.boxes.filter(b=>b.z0>=top-1), lx=hi.length?hi.reduce((a,b)=>a+(b.x0+b.x1)/2,0)/hi.length:desk.x1;
  const px=lx>(desk.x0+desk.x1)/2?desk.x0+.42:desk.x1-.42, py=(desk.y0+desk.y1)/2, fy=Z(desk.y1)>Z(desk.y0)?1:-1;   // (fy: which way is out from the wall, in the world's z)
  const CZ=(H.cotS||0)+(H.RZ||0);   /* (+RZ: the house raised for its stoop) */   // (the cottage's floor: the 2nd in the lobby plan, apts.js)
  const PC=new THREE.Group(), BEIGE=lam(0xcfc6a8), DARK=lam(0x6a665a); PC.position.set(X(px),Y(top+CZ),Z(py));
  const u=v=>v*T, h=v=>Y(v)-Y(0);   // (tiles across, the game's px up, in world units)
  const base=bx(u(.6),h(6),u(.42),BEIGE); base.position.set(0,h(3),0);
  const mon=bx(u(.46),h(17),u(.38),BEIGE); mon.position.set(0,h(6+8.5),-fy*u(.02));
  const scr=bx(u(.34),h(11),u(.01),flat(0x2f8a4e)); scr.position.set(0,h(6+9),fy*u(.175));
  const kb=bx(u(.52),h(1.5),u(.16),DARK); kb.position.set(0,h(.75),fy*u(.33));
  PC.add(base,mon,scr,kb); MAPG.bodega.add(PC);
  // its screen's few lines (a plain picture, no gradient): DRONE LINK and a cursor
  { const cv=document.createElement('canvas'); cv.width=32; cv.height=24; const g=cv.getContext('2d'); g.fillStyle='#1d4a2e'; g.fillRect(0,0,32,24); g.fillStyle='#8cf0a8';
    for(const [x,y,w] of [[3,4,18],[3,8,12],[3,12,22],[3,16,8]])g.fillRect(x,y,w,1); g.fillRect(12,16,2,2);
    const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; scr.material=new THREE.MeshBasicMaterial({map:t}); }
  const hit=bx(u(.9),h(30),u(.8),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(X(px),Y(top+CZ+12),Z(py)); MAPG.bodega.add(hit);
  // ---- the drone: a body, four arms, four rotors (two-bladed bars), its light, the parcel it carries
  const D=new THREE.Group(), GREY=lam(0x3a3d44), LIGHT=lam(0x9aa0aa), body=bx(.3,.08,.3,GREY); D.add(body);
  const rot=[]; for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const arm=bx(.22,.03,.04,GREY); arm.position.set(sx*.13,0,sz*.13); arm.rotation.y=Math.atan2(sz,sx)*-1; D.add(arm);
    const r=new THREE.Group(); r.position.set(sx*.22,.06,sz*.22); const bl=bx(.24,.01,.035,LIGHT); r.add(bl); const hub=bx(.04,.04,.04,GREY); r.add(hub); D.add(r); rot.push(r); }
  const dot=bx(.05,.03,.05,flat(0x3cff6a)); dot.position.set(0,.055,.1); D.add(dot);
  const PAR=lam(0xa77a48), parcel=bx(.2,.15,.2,PAR); parcel.position.set(0,-.13,0); parcel.visible=false; D.add(parcel);
  D.scale.setScalar(T/1.13); MAPG.bodega.add(D);
  // home: on the bodega's door frame, a little out from its front; the window it delivers to: the house's middle front one
  const B=BOD.B0, out=Z(B.y1)>Z(B.y0)?1:-1, HOME=new THREE.Vector3(X((B.x0+B.x1)/2+.9),Y(97),Z(B.y1)+out*.35*T), hout=Z(A.y1)>Z(A.y0)?1:-1;
  const WIN=new THREE.Vector3(X((A.x0+A.x1)/2),Y(CZ+70),Z(A.y1)+hout*1.5*T), DROP=new THREE.Vector3(X((A.x0+A.x1)/2),Y(CZ)+.02,Z(A.y1)-hout*.9*T), CRUISE=9;   // (out past the fire escape's platform)
  D.position.copy(HOME); D.rotation.y=Math.atan2(WIN.x-HOME.x,WIN.z-HOME.z);
  DRONE.mesh=D; DRONE.pc=PC;
  // ---- the flight: a list of legs, each to a point at its own pace (up and down slower than along; a leg may say which way to face: down to
  // the window it turns to look in), a wait at the window
  let legs=[], item=null, wait=0, yaw=D.rotation.y, spin=0; const V=new THREE.Vector3(), dirV=new THREE.Vector3(0,0,1);
  const up=(p,y)=>new THREE.Vector3(p.x,y,p.z);
  DRONE.go=it=>{ if(DRONE.state!=='home')return false; item=it; parcel.visible=true; DRONE.state='out'; dot.material.color.set(0xff3a3a);
    legs=[[up(HOME,CRUISE),1.8],[up(WIN,CRUISE),4.5],[WIN.clone(),1.6,Math.atan2(0,-hout)],['wait',2.4],['drop'],[up(WIN,CRUISE),1.8],[up(HOME,CRUISE),4.5],[HOME.clone(),1.4],['park']]; return true; };
  // the parcel on the floor, and what's in it
  const parcels=[]; const toast=msg=>{ let el=document.getElementById('dtoast'); if(!el){ el=document.createElement('div'); el.id='dtoast'; el.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);font:12px var(--pixel,monospace);color:#e8f4dc;background:#14161a;border:2px solid #3a4a3a;padding:6px 10px;z-index:15;pointer-events:none'; document.body.appendChild(el); } el.textContent=msg; el.hidden=false; clearTimeout(el.t); el.t=setTimeout(()=>{ el.hidden=true; },3200); };
  const COLS={COFFEE:0x5a3a24,SODA:0xc0302c,WATER:0xaaccee,MILK:0xf0eee6,EGGS:0xd8c8a0,BREAD:0xc8924a,CHIPS:0xe8b830,'CANDY BAR':0x8a3a8a,CEREAL:0xd8602a,'FISH FOOD':0x3a8ac0};
  const land=()=>{ const p=bx(.2*T/1.13,.15*T/1.13,.2*T/1.13,PAR); p.position.copy(DROP).add(new THREE.Vector3((Math.random()-.5)*.4*T,.075*T/1.13,0)); MAPG.bodega.add(p); const it=item; parcels.push(p);
    const th={name:'PARCEL',obj:p,reach:1*T,near:2.2*T,tall:.6*T,act:()=>{ if(!p.parent)return; MAPG.bodega.remove(p); const g=bx(.12*T,.16*T,.1*T,lam(COLS[it]||0x888888)); g.position.copy(p.position).setY(DROP.y+.08*T); MAPG.bodega.add(g); toast('YOU OPEN THE PARCEL: '+it); }};
    UI.thing(th); DRONE.last=th; toast('A PARCEL FROM THE BODEGA: '+it); };
  const SPK=+(QS.get('dronek')||1);   // (a test's: ?dronek=8 flies it eight times as fast)
  DRONE.tick=dt=>{ if(DRONE.state==='home'||!dt)return; dt*=SPK; const L=legs[0]; if(!L){ DRONE.state='home'; return; }
    if(L[0]==='wait'){ wait+=dt; if(wait>=L[1]){ wait=0; legs.shift(); } }
    else if(L[0]==='drop'){ parcel.visible=false; land(); legs.shift(); }
    else if(L[0]==='park'){ legs.shift(); DRONE.state='home'; dot.material.color.set(0x3cff6a); for(const r of rot)r.rotation.y=0; D.rotation.set(0,yaw,0); return; }
    else { V.subVectors(L[0],D.position); const d=V.length(), s=L[1]*dt; if(d<=s){ D.position.copy(L[0]); legs.shift(); } else { D.position.addScaledVector(V,s/d); const hz=Math.hypot(V.x,V.z); if(hz>.05||L[2]!=null){ const ty=L[2]!=null?L[2]:Math.atan2(V.x,V.z); yaw+=((((ty-yaw)%(2*Math.PI))+3*Math.PI)%(2*Math.PI)-Math.PI)*Math.min(1,dt*4); } } }
    const moving=L&&L[0]!=='wait'&&legs[0]===L; D.rotation.set(moving&&Math.hypot(V.x,V.z)>.05?.18:0,yaw,0,'YXZ'); spin+=dt*40; for(const r of rot)r.rotation.y=spin; };
  // ---- DRONE CAM: from just behind it, a little above, looking where it heads; the room's cut-away and the house's ceiling lifted while it's on
  const vb=UI.view3b, E=new THREE.Vector3(), F=new THREE.Vector3();
  UI.view3b=a=>{ if(!DRONE.cam)return vb(a); cam=PCAM; if(RPASS)RPASS.camera=cam; if(Math.abs(PCAM.aspect-RW/RH)>1e-3){ PCAM.aspect=RW/RH; PCAM.updateProjectionMatrix(); }
    F.set(Math.sin(D.rotation.y),0,Math.cos(D.rotation.y)); cam.position.copy(D.position).addScaledVector(F,-1.7).add(E.set(0,.65,0)); cam.lookAt(E.copy(D.position).addScaledVector(F,2.2).add(V.set(0,-.7,0)));
    cam.updateMatrixWorld(); W3.group.visible=true; if(H.HP)H.HP.constant=1e6; };
  const hud=document.createElement('div'); hud.id='dhud'; hud.hidden=true; hud.style.cssText='position:fixed;inset:12px;border:2px solid #6cf08a;z-index:14;pointer-events:none;font:12px var(--pixel,monospace);color:#8cf0a8';
  hud.innerHTML='<div style="position:absolute;left:10px;top:8px">DRONE 01 · <span id="dhst"></span></div><div style="position:absolute;right:10px;top:8px">● REC</div><button class="btn" id="dhx" style="position:absolute;right:10px;bottom:8px;pointer-events:auto">LEAVE DRONE CAM</button>';
  document.body.appendChild(hud);
  DRONE.setCam=on=>{ DRONE.cam=!!on; hud.hidden=!on; if(!on){ UI.setView(UI.view); if(H.HP)H.HP.constant=H.in?H.lvY(H.floor())+H.SY*.93:1e6; } };
  hud.querySelector('#dhx').onclick=()=>DRONE.setCam(false);
  // ---- DRONE LINK, the computer's screen as a panel
  const MENU=[['COFFEE',2],['SODA',2],['WATER',1],['MILK',3],['EGGS',4],['BREAD',3],['CHIPS',2],['CANDY BAR',1],['CEREAL',4],['FISH FOOD',3]];
  let cash=40; const purse={get:()=>window.MAIL&&MAIL.you?MAIL.you.cash:cash,add:v=>{ if(window.MAIL&&MAIL.you)MAIL.you.cash+=v; else cash+=v; }}; DRONE.purse=purse;
  const css=document.createElement('style'); css.textContent='#pcp{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;font:12px var(--pixel,monospace);color:#8cf0a8;background:#0e1a12;border:2px solid #3c7a4c;padding:14px 16px 12px;z-index:16;user-select:none}#pcp h3{margin:0 0 8px;font-size:13px}#pcp .row{display:flex;gap:8px;align-items:center;margin:3px 0}#pcp .it{flex:1}#pcp .st{margin-top:8px;color:#cfe8d0}';
  document.head.appendChild(css); const P=document.createElement('div'); P.id='pcp'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Drone link'); document.body.appendChild(P);
  const draw=()=>{ P.innerHTML=`<h3>DRONE LINK · THE BODEGA</h3><div>YOU HAVE $${purse.get()} · THE DRONE IS ${DRONE.state==='home'?'IN':'OUT'}</div>`+MENU.map(([n,c],i)=>`<div class="row"><span class="it">${n}</span><span>$${c}</span><button class="btn" data-i="${i}">ORDER</button></div>`).join('')+
    `<div class="row" style="margin-top:8px"><button class="btn" id="pccam">DRONE CAM</button><button class="btn" id="pcx">CLOSE</button></div><div class="st" id="pcst"></div>`;
    P.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ const [n,c]=MENU[+b.dataset.i], st=P.querySelector('#pcst');
      if(DRONE.state!=='home'){ st.textContent='THE DRONE IS OUT. WAIT FOR IT TO COME BACK.'; return; } if(purse.get()<c){ st.textContent='NOT ENOUGH MONEY.'; return; }
      const S=window.CIVIC&&CIVIC.shops&&CIVIC.shops.bodega; if(S&&S.stock<=0){ st.textContent='THE BODEGA IS OUT OF STOCK.'; return; }
      purse.add(-c); if(S){ S.stock--; S.sold++; S.till+=c; CIVIC.note&&CIVIC.note('you ordered '+n.toLowerCase()+' by drone ($'+c+')','bodega'); }
      DRONE.go(n); draw(); P.querySelector('#pcst').textContent='ORDERED: '+n+'. THE DRONE IS ON ITS WAY.'; });
    P.querySelector('#pccam').onclick=()=>{ P.hidden=true; DRONE.setCam(true); }; P.querySelector('#pcx').onclick=()=>{ P.hidden=true; }; };
  DRONE.open=()=>{ draw(); P.hidden=false; };
  UI.thing({name:'COMPUTER',obj:hit,reach:1.1*T,near:2.4*T,tall:1.3*T,act:DRONE.open});
  // each moment: the flight, the HUD's line
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); DRONE.tick(dt); if(DRONE.cam){ const s=hud.querySelector('#dhst'); s.textContent=(DRONE.state==='home'?'PARKED AT THE BODEGA':legs[0]&&legs[0][0]==='wait'?'AT YOUR WINDOW':'IN FLIGHT')+' · ALT '+Math.max(0,Math.round(D.position.y/1.13*.84))+' M'; } };
  window.DRONEDBG=()=>({state:DRONE.state,pos:D.position.toArray().map(v=>+v.toFixed(2)),legs:legs.length,parcels:parcels.length,cash:purse.get()}); };

const DRONE=window.DRONE={cam:false,state:'home'};
DRONE.init=()=>{ const H=MODS.apts; if(!H||!H.A||!H.made)return; const A=H.A, T=TILE, X=BOD.X, Y=BOD.Y, Z=BOD.Z;
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), flat=c=>new THREE.MeshBasicMaterial({color:c});
  const bx=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  const desk=H.made.find(p=>p.kind==='writing desk with a pink lamp'); if(!desk)return;
  const big=desk.boxes.filter(b=>(b.x1-b.x0)*(b.y1-b.y0)>.4), top=Math.max(...big.map(b=>b.z1)), hi=desk.boxes.filter(b=>b.z0>=top-1), lx=hi.length?hi.reduce((a,b)=>a+(b.x0+b.x1)/2,0)/hi.length:desk.x1;
  const px=lx>(desk.x0+desk.x1)/2?desk.x0+.42:desk.x1-.42, py=(desk.y0+desk.y1)/2, fy=Z(desk.y1)>Z(desk.y0)?1:-1;
  const CZ=(H.cotS||0)+(H.RZ||0);
  const PC=new THREE.Group(), BEIGE=lam(0xcfc6a8), DARK=lam(0x6a665a); PC.position.set(X(px),Y(top+CZ),Z(py));
  const u=v=>v*T, h=v=>Y(v)-Y(0);
  const base=bx(u(.6),h(6),u(.42),BEIGE); base.position.set(0,h(3),0);
  const mon=bx(u(.46),h(17),u(.38),BEIGE); mon.position.set(0,h(6+8.5),-fy*u(.02));
  const scr=bx(u(.34),h(11),u(.01),flat(0x2f8a4e)); scr.position.set(0,h(6+9),fy*u(.175));
  const kb=bx(u(.52),h(1.5),u(.16),DARK); kb.position.set(0,h(.75),fy*u(.33));
  PC.add(base,mon,scr,kb); MAPG.bodega.add(PC);
  { const cv=document.createElement('canvas'); cv.width=32; cv.height=24; const g=cv.getContext('2d'); g.fillStyle='#1d4a2e'; g.fillRect(0,0,32,24); g.fillStyle='#8cf0a8';
    for(const [x,y,w] of [[3,4,18],[3,8,12],[3,12,22],[3,16,8]])g.fillRect(x,y,w,1); g.fillRect(12,16,2,2);
    const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; scr.material=new THREE.MeshBasicMaterial({map:t}); }
  const hit=bx(u(.9),h(30),u(.8),new THREE.MeshBasicMaterial({visible:false})); hit.position.set(X(px),Y(top+CZ+12),Z(py)); MAPG.bodega.add(hit);
  const D=new THREE.Group(), GREY=lam(0x3a3d44), LIGHT=lam(0x9aa0aa), body=bx(.3,.08,.3,GREY); D.add(body);
  const rot=[]; for(const [sx,sz] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const arm=bx(.22,.03,.04,GREY); arm.position.set(sx*.13,0,sz*.13); arm.rotation.y=Math.atan2(sz,sx)*-1; D.add(arm);
    const r=new THREE.Group(); r.position.set(sx*.22,.06,sz*.22); const bl=bx(.24,.01,.035,LIGHT); r.add(bl); const hub=bx(.04,.04,.04,GREY); r.add(hub); D.add(r); rot.push(r); }
  const dot=bx(.05,.03,.05,flat(0x3cff6a)); dot.position.set(0,.055,.1); D.add(dot);
  const PAR=lam(0xa77a48), parcel=bx(.2,.15,.2,PAR); parcel.position.set(0,-.13,0); parcel.visible=false; D.add(parcel);
  D.scale.setScalar(T/1.13); MAPG.bodega.add(D);
  const B=BOD.B0, bx0=X(B.x1-.85), bz0=Z(BOD.BODOFF+.85), RB=Y(B.h), HOME=new THREE.Vector3(bx0,Y(97),bz0), hout=Z(A.y1)>Z(A.y0)?1:-1, RA=H.lvY?H.lvY(5):Y(CZ+150);
  const DROP=new THREE.Vector3(X((A.x0+A.x1)/2),Y(CZ)+.02,Z(A.y1)-hout*.9*T), ax0=X(A.x0+4.4), az0=Z(A.y0+7.4), CRUISE=Math.max(9,RA+2.2);
  const BOXES=[]; DRONE.roofBox=(x,z,y)=>{ const g=new THREE.Group(), W=.62*T, Hb=.42*T, GA=lam(0x8c9092), DK=lam(0x3a3e42); g.position.set(x,y,z);
    const add=(m,px,py,pz)=>{ m.position.set(px,py,pz); m.castShadow=m.receiveShadow=true; g.add(m); return m; };
    add(bx(W+.1*T,.05*T,W+.1*T,DK),0,.025*T,0); add(bx(W,Hb,W,GA),0,Hb/2,0); add(bx(W*.84,.006*T,W*.84,DK),0,Hb+.003*T,0); for(const f of [.35,.7])add(bx(W+.012*T,.02*T,W+.012*T,lam(0x6e7478)),0,Hb*f,0);
    add(bx(.32*T,.14*T,.02*T,DK),0,Hb*.5,W/2+.01*T); add(bx(.02*T,.2*T,.24*T,lam(0x7a5a40)),W/2+.01*T,Hb*.3,0);
    const hinge=new THREE.Group(); hinge.position.set(0,Hb,-W/2); g.add(hinge); const lid=bx(W+.05*T,.05*T,W+.05*T,lam(0x9ea2a4)); lid.position.set(0,.025*T,W/2); lid.castShadow=true; hinge.add(lid);
    const led=bx(.05*T,.03*T,.05*T,flat(0x3cff6a)); led.position.set(W*.36,.06*T,W*.86); hinge.add(led);
    MAPG.bodega.add(g); const R={g,hinge,led,k:0,to:0,top:new THREE.Vector3(x,y+Hb+.55*T,z),in:new THREE.Vector3(x,y+.08*T,z)}; BOXES.push(R); return R; };
  const BB=DRONE.roofBox(bx0,bz0,RB), BA=DRONE.roofBox(ax0,az0,RA), ease=t=>t<.5?2*t*t:1-2*(1-t)*(1-t);
  D.position.copy(HOME); DRONE.mesh=D; DRONE.pc=PC;
  let legs=[], item=null, wait=0, yaw=D.rotation.y, spin=0, mv=null, tt=0; const V=new THREE.Vector3(), P0=new THREE.Vector3();
  const up=(p,y)=>new THREE.Vector3(p.x,y,p.z);
  DRONE.go=it=>{ if(DRONE.state!=='home')return false; item=it; parcel.visible=true; DRONE.state='out'; dot.material.color.set(0xff3a3a);
    legs=[['lid',BB,1],[BB.top.clone(),1.1],['lid',BB,0,1],[up(BB.top,CRUISE),1.8],[up(BA.top,CRUISE),4.5],[BA.top.clone(),1.8],['lid',BA,1],[BA.in.clone(),.9],['drop'],['wait',1.6],[BA.top.clone(),1],['lid',BA,0,1],[up(BA.top,CRUISE),1.8],[up(BB.top,CRUISE),4.5],[BB.top.clone(),1.8],['lid',BB,1],[HOME.clone(),1.1],['lid',BB,0,1],['park']]; return true; };
  const parcels=[]; const toast=msg=>{ let el=document.getElementById('dtoast'); if(!el){ el=document.createElement('div'); el.id='dtoast'; el.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);font:12px var(--pixel,monospace);color:#e8f4dc;background:#14161a;border:2px solid #3a4a3a;padding:6px 10px;z-index:15;pointer-events:none'; document.body.appendChild(el); } el.textContent=msg; el.hidden=false; clearTimeout(el.t); el.t=setTimeout(()=>{ el.hidden=true; },3200); };
  const COLS={COFFEE:0x5a3a24,SODA:0xc0302c,WATER:0xaaccee,MILK:0xf0eee6,EGGS:0xd8c8a0,BREAD:0xc8924a,CHIPS:0xe8b830,'CANDY BAR':0x8a3a8a,CEREAL:0xd8602a,'FISH FOOD':0x3a8ac0};
  const land=()=>{ const p=bx(.2*T/1.13,.15*T/1.13,.2*T/1.13,PAR); p.position.copy(DROP).add(new THREE.Vector3((Math.random()-.5)*.4*T,.075*T/1.13,0)); MAPG.bodega.add(p); const it=item; parcels.push(p);
    const th={name:'PARCEL',obj:p,reach:1*T,near:2.2*T,tall:.6*T,act:()=>{ if(!p.parent)return; MAPG.bodega.remove(p); const g=bx(.12*T,.16*T,.1*T,lam(COLS[it]||0x888888)); g.position.copy(p.position).setY(DROP.y+.08*T); MAPG.bodega.add(g); toast('YOU OPEN THE PARCEL: '+it); }};
    UI.thing(th); DRONE.last=th; toast('A PARCEL FROM THE BODEGA: '+it); };
  const SPK=+(QS.get('dronek')||1);
  DRONE.tick=dt=>{ if(!dt)return; dt*=SPK; tt+=dt; for(const R of BOXES){ R.k+=Math.sign(R.to-R.k)*Math.min(Math.abs(R.to-R.k),dt*1.4); R.hinge.rotation.x=-ease(R.k)*1.95; }
    if(DRONE.state==='home')return; const L=legs[0]; if(!L){ DRONE.state='home'; return; }
    if(L[0]==='wait'){ wait+=dt; if(wait>=L[1]){ wait=0; legs.shift(); } }
    else if(L[0]==='lid'){ L[1].to=L[2]; L[1].led.material.color.set(L[2]?0xffb020:0x3cff6a); if(L[3]||Math.abs(L[1].k-L[2])<.01)legs.shift(); }
    else if(L[0]==='drop'){ parcel.visible=false; land(); legs.shift(); }
    else if(L[0]==='park'){ legs.shift(); DRONE.state='home'; dot.material.color.set(0x3cff6a); for(const r of rot)r.rotation.y=0; D.rotation.set(0,yaw,0); return; }
    else { if(mv!==L){ mv=L; P0.copy(D.position); L.d=Math.max(.35,P0.distanceTo(L[0])/L[1]*1.3); L.t=0; } L.t+=dt; const k=Math.min(1,L.t/L.d); V.copy(D.position); D.position.lerpVectors(P0,L[0],ease(k)); V.subVectors(D.position,V);
      const hz=Math.hypot(V.x,V.z); if(hz>1e-3)yaw+=((((Math.atan2(V.x,V.z)-yaw)%(2*Math.PI))+3*Math.PI)%(2*Math.PI)-Math.PI)*Math.min(1,dt*4); if(k>=1){ legs.shift(); mv=null; } }
    const sp=Math.hypot(V.x,V.z)/Math.max(dt,1e-3); D.rotation.set(Math.min(.28,sp*.05)+Math.sin(tt*5.3)*.025,yaw,Math.sin(tt*6.7)*.035+Math.sin(tt*2.3)*.02,'YXZ'); spin+=dt*40; for(const r of rot)r.rotation.y=spin; };
  const vb=UI.view3b, E=new THREE.Vector3(), F=new THREE.Vector3();
  UI.view3b=a=>{ if(!DRONE.cam)return vb(a); cam=PCAM; if(RPASS)RPASS.camera=cam; if(Math.abs(PCAM.aspect-RW/RH)>1e-3){ PCAM.aspect=RW/RH; PCAM.updateProjectionMatrix(); }
    F.set(Math.sin(D.rotation.y),0,Math.cos(D.rotation.y)); cam.position.copy(D.position).addScaledVector(F,-1.7).add(E.set(0,.65,0)); cam.lookAt(E.copy(D.position).addScaledVector(F,2.2).add(V.set(0,-.7,0)));
    cam.updateMatrixWorld(); W3.group.visible=true; if(H.HP)H.HP.constant=1e6; };
  const hud=document.createElement('div'); hud.id='dhud'; hud.hidden=true; hud.style.cssText='position:fixed;inset:12px;border:2px solid #6cf08a;z-index:14;pointer-events:none;font:12px var(--pixel,monospace);color:#8cf0a8';
  hud.innerHTML='<div style="position:absolute;left:10px;top:8px">DRONE 01 · <span id="dhst"></span></div><div style="position:absolute;right:10px;top:8px">● REC</div><button class="btn" id="dhx" style="position:absolute;right:10px;bottom:8px;pointer-events:auto">LEAVE DRONE CAM</button>';
  document.body.appendChild(hud);
  DRONE.setCam=on=>{ DRONE.cam=!!on; hud.hidden=!on; if(!on){ UI.setView(UI.view); if(H.HP)H.HP.constant=H.in?H.lvY(H.floor())+H.SY*.93:1e6; } };
  hud.querySelector('#dhx').onclick=()=>DRONE.setCam(false);
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
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); DRONE.tick(dt); BODB.tick&&BODB.tick(dt); if(DRONE.cam){ const s=hud.querySelector('#dhst'); s.textContent=(DRONE.state==='home'?'PARKED AT THE BODEGA':legs[0]&&legs[0][0]==='wait'?'AT YOUR ROOF':'IN FLIGHT')+' · ALT '+Math.max(0,Math.round(D.position.y/1.13*.84))+' M'; } };
  window.DRONEDBG=()=>({state:DRONE.state,pos:D.position.toArray().map(v=>+v.toFixed(2)),legs:legs.length,parcels:parcels.length,cash:purse.get()}); };

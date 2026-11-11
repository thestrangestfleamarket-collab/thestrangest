// THE HELIPAD: Polyfork's rooftop helipad deck and windsock on the bank, and the news helicopter (data/heli.json) that flies a round of the city every five minutes from the shared clock and lands again, its rotor still on the pad, a Polyfork pilot at the controls; ride along in a seat, or take the controls yourself (one pilot, kept by the section's server like a car).
import {SHARED, THREE} from './003-shx.js';
import {ARCH, keys, ONLINE, pos, RIDE, SPEED, st, UI, VLOOK} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {PFROW} from './068a-pfrow.js';
import {BODIES} from './111a-bodies.js';
import {VEH} from './150o-physmore.js';
const HELI={list:[],pad:null,skew:0}; window.HELI=HELI;
{ const HD=__LAZY__("data/heli.json"), CAST=__LAZY__("data/cast/v-space.json");
  const T=TILE, M0=T/.84, YS=ZU*24/TILE, MV=M0*YS, say=(t,c)=>SAY(t,c||'#e8e2cc'), X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, sm=u=>u<=0?0:u>=1?1:u*u*(3-2*u), wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  // the round: it leaves the pad every CYC seconds, flies F seconds and rests the rest, the rotor still
  const H2=0, CYC=300, F=130, UP0=5, UP1=11, DN0=F-14, DN1=F-4, LIFT=12, CRUISE=55, DECK={s:.8,v:.6};
  // the helicopter: [id, model, scale over Polyfork's size, the pilot (a Polyfork character), its seats in the model's metres: the pilot's first]
  const DEFS=[{id:'news',model:'utility',name:'THE NEWS HELICOPTER',s:.615,mark:'NEWS',pilot:'aircrew_pilot',label:'THE NEWS PILOT',seats:[[-.38,.62,2.45],[.38,.62,2.45],[-.42,.62,1.0],[.42,.62,1.0]]}];
  // the sky tour's way, in map tiles: out over the Hudson, east along the river, down the park's east side to the big lake, back west over the park and up West St
  const WAY=[[24.7,-101.9],[34,-130],[110,-150],[210,-142],[245,-92],[242,0],[228,118],[165,166],[60,152],[2,92],[-36,22],[-40,-62],[-12,-122],[24.7,-101.9]];
  // the owner's speed (SPEED.of('heli')) shortens or lengthens the round's cruise, Fk its whole flight
  let Fk=F, Ck=DN0-UP1; const setF=()=>{ Ck=Math.min(CYC-60-UP1-(F-DN0),(DN0-UP1)/SPEED.of('heli')); Fk=UP1+Ck+(F-DN0); }; setF(); SPEED.on(setF);
  let D=null, built=false, curve=null, LEN=0, restHd=0, mineH=null, want=null, ui=null;
  const now=()=>(TRAINS.now?TRAINS.now():Date.now()/1000)+HELI.skew;   // (skew: a test's way to move the tour's clock)

  /* ---------- the models: each part flat-coloured, turned on its own pivot ---------- */
  const geo=Q=>{ const q=new Int16Array(Uint8Array.from(atob(Q.p),c=>c.charCodeAt(0)).buffer), col=Uint8Array.from(atob(Q.c),c=>c.charCodeAt(0)), b=Q.b, P=new Float32Array(q.length), C=new Float32Array(col.length), c=new THREE.Color();
    for(let i=0;i<q.length;i++){ const a=i%3; P[i]=b[a]+(q[i]+32768)/65535*(b[a+3]-b[a]); }
    for(let i=0;i<col.length;i+=3){ c.setRGB(col[i]/255,col[i+1]/255,col[i+2]/255,THREE.SRGBColorSpace); C[i]=c.r; C[i+1]=c.g; C[i+2]=c.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const model=(k,sx,sy)=>{ const M=D[k], G=new THREE.Group(), parts={}; G.scale.set(sx,sy,sx);
    for(const n in M.parts){ const Q=M.parts[n], p=new THREE.Group(), me=new THREE.Mesh(geo(Q),MAT); me.castShadow=me.receiveShadow=true; p.name=n.toUpperCase(); p.position.set(...Q.at); p.add(me); G.add(p); parts[n]=p; p.userData.at=p.position.clone(); }
    G.userData.parts=parts; return G; };

  /* ---------- the pad on the bank's roof: the deck, the windsock, where the pilot waits ---------- */
  const padAt=()=>{ const h={obj:STORE.bank&&STORE.bank.out}; if(!h.obj)return null; h.obj.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(h.obj), c=bb.getCenter(new THREE.Vector3());
    const base=bb.max.y-.2*MV, top=base+3*DECK.v*MV; return {x:c.x,z:c.z,base,top,rot:h.obj.rotation.y,front:h.obj.rotation.y,hb:bb}; };
  const deckPt=(P,u,v)=>{ const c=Math.cos(P.rot), s=Math.sin(P.rot); return {x:P.x+(u*c+v*s)*M0,z:P.z+(-u*s+v*c)*M0}; };
  const buildPad=P=>{ const deck=model('deck',DECK.s*M0,DECK.v*MV); deck.position.set(P.x,P.base,P.z); deck.rotation.y=P.rot; deck.userData.anyRoom=false; deck.userData.parkFar=true; scene.add(deck);
    const w=6*DECK.s*M0; FIX.up.push([P.x-w,P.z-w,P.base,P.x+w,P.z+w,P.top]);
    const sk=model('sock',.5*M0,.5*MV), sp=sk.userData.parts.sock, q=deckPt(P,4.1,-4.1); sk.position.set(q.x,P.top,q.z); sk.children.forEach(c=>c.position.z-=D.sock.parts.sock.at[2]); sk.userData.anyRoom=false; sk.userData.parkFar=true; scene.add(sk);
    HELI.pad={...P,deck,sock:sk,sp}; };
  // the street below: where you come down the bank's stairs, by its front door
  const street=()=>{ const P=HELI.pad, d=(P.hb.max.z-P.hb.min.z)/2+1.2*M0, q=deckPt(P,0,0); const fz=P.z+Math.cos(P.rot)*d, fx=P.x+Math.sin(P.rot)*d+3*M0; return {x:fx,z:fz,hd:P.rot}; };

  /* ---------- the tour's way, from the pad and back to it ---------- */
  const makeWay=()=>{ const P=HELI.pad, pts=WAY.map(([x,y],i)=>i===0||i===WAY.length-1?new THREE.Vector3(P.x,0,P.z):new THREE.Vector3(X(x),0,Z(y)));
    curve=new THREE.CatmullRomCurve3(pts,false,'centripetal'); LEN=curve.getLength(); const e=curve.getTangentAt(1); restHd=Math.atan2(e.x,e.z); };
  const TQ=new THREE.Vector3(), PQ=new THREE.Vector3();
  const ease=u=>u-Math.sin(2*Math.PI*u)/(2*Math.PI);
  // where a helicopter on the tour is at time u of its flight: {x,y,z,hd,pitch,bank,rot}
  const tour=(u,o)=>{ const P=HELI.pad, top=P.top, hi=top+LIFT*MV; u=u<UP1?u:u<UP1+Ck?UP1+(u-UP1)*(DN0-UP1)/Ck:u-(Fk-F);
    if(u<UP0){ Object.assign(o,{x:P.x,y:top,z:P.z,hd:restHd,pitch:0,bank:0,rot:u/UP0}); return o; }
    curve.getTangentAt(0,TQ); const h0=Math.atan2(TQ.x,TQ.z);
    if(u<UP1){ const k=sm((u-UP0)/(UP1-UP0)); Object.assign(o,{x:P.x,y:top+(hi-top)*k,z:P.z,hd:restHd+wrap(h0-restHd)*k,pitch:0,bank:0,rot:1}); return o; }
    if(u>=DN0){ const k=sm((u-DN0)/(DN1-DN0)); Object.assign(o,{x:P.x,y:hi+(top-hi)*k,z:P.z,hd:restHd,pitch:0,bank:0,rot:1}); return o; }
    const r=(u-UP1)/(DN0-UP1), s=ease(r), a=Math.max(0,Math.min(1,s)); curve.getPointAt(a,PQ); curve.getTangentAt(a,TQ); const hd=Math.atan2(TQ.x,TQ.z);
    const b=Math.min(1,s/.12,(1-s)/.12), y=hi+(CRUISE*MV-hi)*sm(b), v=(1-Math.cos(2*Math.PI*r));   // v: the speed's share of the most
    curve.getTangentAt(Math.min(1,a+.004),TQ); const turn=wrap(Math.atan2(TQ.x,TQ.z)-hd);
    Object.assign(o,{x:PQ.x,y,z:PQ.z,hd,pitch:.16*v,bank:Math.max(-.45,Math.min(.45,-turn*12*v)),rot:1}); return o; };
  // a helicopter left away from the pad flies itself home at the start of its next rest: up, straight over, down
  const homeway=(H,u,o)=>{ const P=HELI.pad, p=H.park, hi=Math.max(p.y,P.top)+LIFT*MV, d=Math.hypot(P.x-p.x,P.z-p.z), cr=d/(14*M0*SPEED.of('heli')), to=Math.atan2(P.x-p.x,P.z-p.z);
    const t1=UP0, t2=t1+6, t3=t2+cr, t4=t3+10, t5=t4+2;
    if(u<t1){ Object.assign(o,{x:p.x,y:p.y,z:p.z,hd:p.hd,pitch:0,bank:0,rot:u/t1}); return o; }
    if(u<t2){ const k=sm((u-t1)/6); Object.assign(o,{x:p.x,y:p.y+(hi-p.y)*k,z:p.z,hd:p.hd+wrap(to-p.hd)*k,pitch:0,bank:0,rot:1}); return o; }
    if(u<t3){ const k=ease((u-t2)/cr); Object.assign(o,{x:p.x+(P.x-p.x)*k,y:hi,z:p.z+(P.z-p.z)*k,hd:to,pitch:.16*(1-Math.cos(2*Math.PI*(u-t2)/cr)),bank:0,rot:1}); return o; }
    if(u<t4){ const k=sm((u-t3)/10); Object.assign(o,{x:P.x,y:hi+(P.top-hi)*k,z:P.z,hd:to+wrap(restHd-to)*k,pitch:0,bank:0,rot:1}); return o; }
    Object.assign(o,{x:P.x,y:P.top,z:P.z,hd:restHd,pitch:0,bank:0,rot:Math.max(0,1-(u-t4)/10)}); o.done=u>=t5; return o; };
  HELI.homeLen=H=>{ const P=HELI.pad, p=H.park; return UP0+6+Math.hypot(P.x-p.x,P.z-p.z)/(14*M0*SPEED.of('heli'))+12; };

  /* ---------- the ground a helicopter stands on: the ground, or the top of whatever solid is under it (a roof, the deck) ---------- */
  const surf=(x,z,y=1e9,r=1.2*M0)=>{ let g=SHARED.groundY(x,z); for(const f of FIX.up){ if(x+r<f[0]||x-r>f[3]||z+r<f[1]||z-r>f[4])continue; if(f[5]>g&&f[5]<=y+.6*MV)g=f[5]; } return g; };

  /* ---------- each helicopter's state each frame ---------- */
  const mk=(def,i)=>{ const H={...def,i,by:null,park:null,mode:'rest',s0:{},rot:0,spin:0,seatO:[],taken:[],sol:null};
    H.root=new THREE.Group(); H.root.rotation.order='YXZ'; H.root.userData.anyRoom=false; H.body=model(def.model,def.s*M0,def.s*MV); H.root.add(H.body); VLOOK.kind('heli:'+def.id,{name:def.name,grp:'HELICOPTERS',make:()=>{ const b=model(def.model,def.s*M0,def.s*MV); if(def.mark)b.userData.parts.body.add(...markSides(def.mark)); return VLOOK.dress('heli:'+def.id,b); }}); scene.add(H.root);
    H.seatO=def.seats.map(s=>{ const o=new THREE.Object3D(); o.position.set(s[0]*def.s*M0,s[1]*def.s*MV,s[2]*def.s*M0); H.root.add(o); return o; });
    H.parts=H.body.userData.parts; if(def.mark)H.parts.body.add(...markSides(def.mark)); VLOOK.dress('heli:'+def.id,H.body); return H; };
  // its name along both sides of the cabin, over the doors: white letters on a red panel, in the model's metres
  const markSides=t=>{ const c=document.createElement('canvas'); c.width=96; c.height=20; const x=c.getContext('2d'); x.fillStyle='#b8202a'; x.fillRect(0,0,96,20); x.fillStyle='#f4efe4'; x.fillRect(0,1,96,1); x.fillRect(0,18,96,1);
    x.font='bold 17px sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(t.split('').join(String.fromCharCode(8202)),48,11); const tx=new THREE.CanvasTexture(c); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.MeshLambertMaterial({map:tx,polygonOffset:true,polygonOffsetFactor:-2}), g=new THREE.PlaneGeometry(2.6,.54);
    return [1,-1].map(sd=>{ const me=new THREE.Mesh(g,m); me.position.set(sd*.875,.95,.72); me.rotation.y=sd*Math.PI/2; return me; }); };
  const phase=H=>((now()+H.i*H2)%CYC+CYC)%CYC;   // its own clock: 0..F flying, F..CYC resting
  HELI.phase=phase;
  const fetchAt=H=>{ const t0=H.park.t+5, p=((t0+H.i*H2)%CYC+CYC)%CYC; return t0+((Fk-p)%CYC+CYC)%CYC; };
  const S=new THREE.Vector3();
  const update=(H,dt)=>{ const u=phase(H), o=H.s0; o.done=false; let mode;
    if(H.by&&H.by===(ONLINE.me||'me')&&mineH===H){ mode='mine'; Object.assign(o,FLY); }
    else if(H.by){ mode='theirs'; const R=ONLINE.others&&ONLINE.others.get(H.by), p=R&&R.p; if(p){ Object.assign(o,{x:p.x,y:p.y,z:p.z,hd:p.hd||0,pitch:0,bank:0,rot:1}); } else if(o.x==null)Object.assign(o,{x:HELI.pad.x,y:HELI.pad.top,z:HELI.pad.z,hd:restHd,pitch:0,bank:0,rot:0}); }
    else if(H.park){ const t=now(), go=fetchAt(H), k=t-go;   // its pilot fetches it at the start of its first rest after it was left
      if(k>=0&&k<HELI.homeLen(H)){ mode='home'; homeway(H,k,o); } else if(k>=HELI.homeLen(H)){ H.park=null; if(ONLINE.on)ONLINE.put('car:heli-'+H.id,''); mode='rest'; Object.assign(o,{x:HELI.pad.x,y:HELI.pad.top,z:HELI.pad.z,hd:restHd,pitch:0,bank:0,rot:0}); }
      else { mode='parked'; Object.assign(o,{x:H.park.x,y:H.park.y,z:H.park.z,hd:H.park.hd,pitch:0,bank:0,rot:0}); } }
    else if(u<Fk){ mode='tour'; tour(u,o); }
    else { mode='rest'; Object.assign(o,{x:HELI.pad.x,y:HELI.pad.top,z:HELI.pad.z,hd:restHd,pitch:0,bank:0,rot:Math.max(0,1-(u-Fk)/3)}); }
    H.mode=mode; H.rot=o.rot; H.root.position.set(o.x,o.y,o.z); H.root.rotation.set(o.pitch||0,o.hd,o.bank||0); H.root.updateMatrixWorld(true);
    H.spin=(H.spin+dt*o.rot*o.rot*30)%(Math.PI*2); const pr=H.parts; if(pr.rotor)pr.rotor.rotation.y=H.spin; if(pr.tail)pr.tail.rotation.x=H.spin*1.6;
    const open=mode==='rest'&&u>Fk+10&&u<CYC-8?1:0; for(const [n,sd] of [['doorL',1],['doorR',-1]])if(pr[n]){ const d=pr[n]; d.userData.o=(d.userData.o||0)+(open-(d.userData.o||0))*Math.min(1,dt*3); d.position.z=d.userData.at.z-.95*d.userData.o; }
    // solid where it stands on the ground away from the pad
    if(!H.sol){ H.sol=[0,0,0,0]; SOL.up.push(H.sol); } const still=mode==='parked'&&H.park.y<SHARED.groundY(o.x,o.z)+.5*MV, r=2*H.s*M0;
    if(still){ H.sol[0]=o.x-r; H.sol[1]=o.z-r; H.sol[2]=o.x+r; H.sol[3]=o.z+r; } else H.sol[0]=H.sol[1]=H.sol[2]=H.sol[3]=-1e7;
    pilot(H); };

  /* ---------- the pilot: Polyfork's aircrew pilot, at the controls while it flies, waiting on the deck otherwise ---------- */
  let castAsked=false; const PL={};
  const bring=()=>{ if(castAsked)return; castAsked=true; CAST().then(J=>{ for(const H of HELI.list){ const b=!ARCH.has(H.pilot)&&J.bodies[H.pilot]; if(!b)continue; const k='heli_'+H.pilot, P={y:0};
      BODIES.add({...BODIES.rebakedBody(J,H.pilot,{}),key:k,label:H.label,size:b.height/1.8,hd:0,ground:()=>P.y});
      const N=BODIES.by[k]&&BODIES.by[k].npc; if(!N)continue; N.on=true; N.walk.auto=false; N.free=()=>true; N.st.pin=true; N.st.home={x:HELI.pad.x,z:HELI.pad.z,r:0}; PL[H.id]={N,P}; } }).catch(e=>console.warn('HELI pilots',e)); };
  const CAR={k:'car',steer:0,z:0};
  const pilot=H=>{ const L=PL[H.id]; if(!L)return; const N=L.N, s=N.st, at=H.mode==='tour'||H.mode==='home';
    if(at){ H.seatO[0].getWorldPosition(S); s.x=S.x; s.z=S.z; s.hd=H.s0.hd; L.P.y=S.y-RIG.RIDEG.sit*(N.g.scale.y||1); N.SR.ride=CAR; }
    else { const q=deckPt(HELI.pad,H.i?-3.6:3.6,3.9); s.x=q.x; s.z=q.z; s.hd=HELI.pad.rot+Math.PI; L.P.y=HELI.pad.top; N.SR.ride=null; }
    s.to=s.next=null; };

  /* ---------- riding along: a seat a passenger boards while the helicopter rests on the pad; it carries you round the tour ---------- */
  const POSE={k:'car',steer:0,z:0}, SQ=new THREE.Quaternion(), SM=new THREE.Matrix4();
  const landed=H=>H.mode==='rest'||H.mode==='parked'||(H.mode==='mine'&&FLY.down);
  const seatKind=(H,i)=>({name:H.name,world:true,i,seat:(m,o)=>o.set(0,0,0),fit:()=>.92,make:()=>new THREE.Group(),lift:.001,hop:false,knock:1e9,ease:1e3,dry:true,inside:true,
    pose:()=>POSE, on:()=>{ hud(H,i); }, off:()=>hudOff(),
    step:(R,dt)=>{ const o=H.seatO[i]; o.getWorldPosition(S); pos.x=S.x; pos.z=S.z; R.hd=SHARED.heading=H.s0.hd; R.v=H.mode==='rest'||H.mode==='parked'?0:4*T; R.y=S.y; st.move=null; return true; },
    floor:(g,R)=>R.y!=null?R.y:g,
    place:(m,R)=>{ const o=H.seatO[i]; o.updateWorldMatrix(true,false); m.position.setFromMatrixPosition(o.matrixWorld); m.quaternion.setFromRotationMatrix(o.matrixWorld); if(R!==RIDE)H.taken[i]=performance.now(); }});
  const taken=(H,i)=>H.taken[i]!=null&&performance.now()-H.taken[i]<600;
  const rideAlong=H=>{ if(RIDE.on)return say('GET OFF WHAT YOU ARE RIDING FIRST.','#c8a090'); if(H.mode!=='rest'||H.by||H.park)return say('THE '+H.name.replace(/^THE /,'')+' IS NOT ON THE PAD.','#c8a090');
    for(let i=1;i<H.seatO.length;i++)if(!taken(H,i)){ if(RIDE.mount('heliseat:'+H.id+':'+i)){ say('YOU CLIMB IN AND BUCKLE UP. IT LEAVES ON ITS NEXT TOUR.'); return true; } return false; }
    say('EVERY SEAT IS TAKEN.','#c8a090'); return false; };
  const down=(H,why)=>{ const P=HELI.pad; if(H.mode==='rest'||H.mode==='home'){ const s=street(); pos.x=s.x; pos.z=s.z; SHARED.py=SHARED.groundY(s.x,s.z); SHARED.heading=s.hd; say(why||'YOU TAKE THE BANK STAIRS DOWN TO THE STREET.'); }
    else { const o=H.s0, d=(3*H.s+.8)*M0; pos.x=o.x-Math.cos(o.hd)*d; pos.z=o.z+Math.sin(o.hd)*d; SHARED.py=SHARED.groundY(pos.x,pos.z); say(why||'YOU CLIMB DOWN.'); } };
  const leaveSeat=()=>{ const id=RIDE.on||'', m=/^heliseat:(\w+):(\d)$/.exec(id); if(!m)return; const H=HELI.list.find(h=>h.id===m[1]); if(!H)return;
    if(!landed(H))return say('NOT WHILE IT IS IN THE AIR.','#c8a090'); RIDE.off(); down(H); };

  /* ---------- flying it yourself: one pilot a helicopter, as the section's server says (its car lock) ---------- */
  const FLY={x:0,y:0,z:0,hd:0,vf:0,vy:0,turn:0,pitch:0,bank:0,rot:0,down:true};
  const VMAX=30*M0, VBACK=6*M0, VUP=6*MV, TURN=1.1, TOPY=150*MV;
  const B=LEVEL.edge&&LEVEL.edge.lines?(()=>{ const xs=[], ys=[]; for(const l of LEVEL.edge.lines){ xs.push(l[0],l[2]); ys.push(l[1],l[3]); } return {x0:X(Math.min(...xs)),x1:X(Math.max(...xs)),z0:Math.min(Z(Math.min(...ys)),Z(Math.max(...ys))),z1:Math.max(Z(Math.min(...ys)),Z(Math.max(...ys)))}; })():null;
  const pilotKind=H=>({name:H.name,world:true,seat:(m,o)=>o.set(0,0,0),fit:()=>.92,make:()=>new THREE.Group(),lift:.001,hop:false,knock:1e9,ease:1e3,dry:true,
    pose:()=>POSE, on:()=>{ FLY.rot=H.rot; hud(H,0); }, off:()=>hudOff(),
    step:(R,dt)=>{ const f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0), tr=(keys.has('a')||keys.has('arrowleft')?1:0)-(keys.has('d')||keys.has('arrowright')?1:0), v=(keys.has(' ')?1:0)-(keys.has('shift')||keys.has('c')?1:0);
      FLY.rot=Math.min(1,FLY.rot+dt/3); const ready=FLY.rot>=1, k=Math.min(1,dt*1.5);
      VEH.fly(FLY,dt,{f,tr,v,ready,vmax:VMAX*SPEED.of('heli'),vback:VBACK,vup:VUP,turn:TURN,top:TOPY,B,surf,r:1.8*M0,mv:MV,slow:1.5*M0,bankAt:8*M0,tall:3*MV,vref:VMAX});
      pos.x=FLY.x; pos.z=FLY.z; R.hd=SHARED.heading=FLY.hd; R.v=Math.abs(FLY.vf); R.y=FLY.y; st.move=null;
      H.root.position.set(FLY.x,FLY.y,FLY.z); H.root.rotation.set(FLY.pitch,FLY.hd,FLY.bank); H.root.updateMatrixWorld(true); return true; },
    floor:(g,R)=>R.y!=null?R.y:g,
    place:(m,R)=>{ const o=H.seatO[0]; o.updateWorldMatrix(true,false); m.position.setFromMatrixPosition(o.matrixWorld); m.quaternion.setFromRotationMatrix(o.matrixWorld); }});
  const fly=H=>{ if(RIDE.on)return say('GET OFF WHAT YOU ARE RIDING FIRST.','#c8a090'); if(H.by&&H.by!==(ONLINE.me||'me'))return say('SOMEONE IS FLYING IT.','#c8a090');
    if(!(H.mode==='rest'||H.mode==='parked'))return say('WAIT FOR IT TO LAND.','#c8a090');
    if(ONLINE.on&&ONLINE.me){ want=H.id; ONLINE.send({t:'car',k:'heli-'+H.id,on:1}); setTimeout(()=>{ if(want===H.id){ want=null; say('THE PILOT DID NOT ANSWER. TRY AGAIN.','#c8a090'); } },4000); } else take(H); };
  const take=H=>{ const o=H.s0; Object.assign(FLY,{x:o.x,y:o.y,z:o.z,hd:o.hd,vf:0,vy:0,turn:0,pitch:0,bank:0,rot:H.rot,down:true}); H.by=ONLINE.me||'me'; mineH=H;
    pos.x=o.x; pos.z=o.z; SHARED.py=o.y; SHARED.heading=o.hd; if(!RIDE.mount('heli:'+H.id)){ H.by=null; mineH=null; if(ONLINE.on)ONLINE.send({t:'car',k:'heli-'+H.id,on:0}); return; }
    say('YOU TAKE THE CONTROLS OF '+H.name+'. SPACE LIFTS.'); };
  const atPad=()=>{ const P=HELI.pad; return Math.hypot(FLY.x-P.x,FLY.z-P.z)<3*M0&&Math.abs(FLY.y-P.top)<.6*MV; };
  const land=()=>{ const H=mineH; if(!H)return; if(!FLY.down)return say('LAND FIRST: SHIFT TAKES YOU DOWN.','#c8a090');
    const home=atPad(), u=phase(H); if(home&&!(u>=Fk+2&&u<CYC-2))return say('IT IS DUE OUT ON ITS ROUND. LAND ON THE STREET.','#c8a090');
    mineH=null; H.by=null; const o={x:FLY.x,y:FLY.y,z:FLY.z,hd:FLY.hd}; RIDE.off();
    if(home){ H.park=null; if(ONLINE.on){ ONLINE.send({t:'car',k:'heli-'+H.id,on:0}); ONLINE.put('car:heli-'+H.id,''); } H.mode='rest'; down(H,'YOU SET IT DOWN ON THE PAD AND TAKE THE STAIRS DOWN.'); }
    else { o.t=now(); H.park=o; if(ONLINE.on){ ONLINE.send({t:'car',k:'heli-'+H.id,on:0}); ONLINE.put('car:heli-'+H.id,[o.x,o.z,o.hd,o.t].map(v=>+v.toFixed(3)).join(',')); } H.mode='parked'; H.s0={...o,pitch:0,bank:0,rot:0}; down(H,'YOU SHUT IT DOWN AND CLIMB OUT. ITS PILOT WILL FLY IT HOME.'); } };
  const fromWorld=(H,v)=>{ if(typeof v!=='string'||!v){ H.park=null; return; } const a=v.split(',').map(Number); if(a.length<3||!a.every(isFinite))return; const x=a[0], z=a[1]; H.park={x,z,hd:a[2],y:surf(x,z),t:a.length>3?a[3]:now()}; };
  (VEH.hear=VEH.hear||[]).push(m=>{ const id=/^heli-(\w+)$/.exec(m.k||''); const H=id&&HELI.list.find(h=>h.id===id[1]); if(!H)return;
    if(m.no){ if(want===H.id){ want=null; say('SOMEONE IS FLYING IT.','#c8a090'); } H.by=m.by; return; }
    if(typeof m.at==='string')fromWorld(H,m.at); if(m.by&&m.by===ONLINE.me){ if(want===H.id){ want=null; take(H); } return; } if(mineH===H&&!m.by)return; H.by=m.by||null; });
  SYS.add('world',(k,v)=>{ const id=typeof k==='string'&&/^car:heli-(\w+)$/.exec(k); const H=id&&HELI.list.find(h=>h.id===id[1]); if(H&&mineH!==H)fromWorld(H,v); },'150pa-heli');
  SYS.add('hi',m=>{ for(const H of HELI.list){ if(mineH!==H)H.by=m.cars&&m.cars['heli-'+H.id]||null; fromWorld(H,(ONLINE.world||{})['car:heli-'+H.id]); } },'150pa-heli');

  /* ---------- on screen: what you are in, and the choice at the pad ---------- */
  const BTN='font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer';
  const HUD=document.createElement('div'); HUD.id='helihud'; HUD.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:12;display:none;gap:10px;align-items:center;padding:6px 10px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#ece5d3;background:#0e1016e0;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  HUD.innerHTML='<span></span><button style="'+BTN+'">GET OUT (F)</button>'; document.body.appendChild(HUD);
  const out=()=>{ if(mineH)land(); else leaveSeat(); }; HUD.querySelector('button').onclick=out;
  const hud=(H,i)=>{ HUD.querySelector('span').textContent=H.name+(i?' · A PASSENGER SEAT · IT FLIES ITS ROUND FROM THE PAD':' · W FORWARD · S BACK · A D TURN · SPACE UP · SHIFT DOWN'); HUD.style.display='flex'; };
  const hudOff=()=>{ HUD.style.display='none'; };
  addEventListener('keydown',e=>{ if(!/^heli/.test(RIDE.on||'')||e.repeat||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return; if((e.key||'').toLowerCase()==='f'){ e.preventDefault(); out(); } });
  const ASK=document.createElement('div'); ASK.id='heliask'; ASK.style.cssText=HUD.style.cssText.replace('bottom:64px','bottom:120px'); document.body.appendChild(ASK);
  const ask=H=>{ if(!H){ const n=HELI.list.map(h=>Math.ceil((CYC-phase(h))%CYC)).filter(s=>s>0); return say('THE HELICOPTER IS OUT. IT LANDS IN '+Math.min(...n.map(s=>s>CYC-Fk?s-(CYC-Fk):s))+' S.'); }
    ASK.innerHTML='<span>'+H.name+'</span><button data-r style="'+BTN+'">RIDE ALONG</button><button data-f style="'+BTN+'">FLY IT YOURSELF</button><button data-x style="'+BTN+'">NO</button>'; ASK.style.display='flex';
    const shut=()=>{ ASK.style.display='none'; }; ASK.querySelector('[data-r]').style.display=H.mode==='rest'?'':'none';
    ASK.querySelector('[data-r]').onclick=()=>{ shut(); rideAlong(H); }; ASK.querySelector('[data-f]').onclick=()=>{ shut(); fly(H); }; ASK.querySelector('[data-x]').onclick=shut; setTimeout(shut,12000); };
  HELI.ask=ask; HELI.rideAlong=rideAlong; HELI.fly=fly; HELI.land=land; HELI.out=out;

  /* ---------- made after the start: the pad, the helicopters, their things to double-click ---------- */
  const make=()=>{ const P=padAt(); if(!P)return false; buildPad(P); makeWay();
    for(const d of DEFS){ const H=mk(d,HELI.list.length); HELI.list.push(H); RIDE.kind('heli:'+H.id,pilotKind(H)); for(let i=1;i<H.seatO.length;i++)RIDE.kind('heliseat:'+H.id+':'+i,seatKind(H,i)); fromWorld(H,(ONLINE.world||{})['car:heli-'+H.id]); update(H,0);
      const th={name:H.name,obj:H.body,reach:3*M0,near:5*M0,tall:3*MV,act:()=>{ if(H.mode==='rest'||H.mode==='parked')ask(H); else say(H.mode==='tour'||H.mode==='home'?'IT IS OUT ON ITS ROUND.':'SOMEONE IS FLYING IT.','#c8a090'); }}; H.th=th; UI.thing(th); }
    const s=street(), sign=new THREE.Mesh(new THREE.BoxGeometry(.6*M0,2.2*MV,.6*M0),new THREE.MeshBasicMaterial({visible:false})); sign.position.set(s.x,SHARED.groundY(s.x,s.z)+1.1*MV,s.z); scene.add(sign);
    UI.thing({name:'THE HELIPAD (UP THE BANK STAIRS)',obj:sign,reach:1.4*T,near:2.6*T,tall:2.2*T,act:()=>ask(HELI.list.find(h=>h.mode==='rest'&&!h.by&&!h.park))}); built=true; return true; };
  // the models are fetched once; until the bank is there, the pad is only tried again every two seconds
  let asked=0, tries=0, nextTry=0;
  SYS.add('life',()=>{ if(built||!SYS.started||!PFROW.done)return; if(D&&D!==1){ const t=performance.now(); if(t<nextTry)return; nextTry=t+2000; make(); return; }
    if(asked||tries>=3)return; asked=1; tries++; D=1; HD().then(J=>{ D=J; asked=0; make(); }).catch(e=>{ D=null; asked=0; console.warn('HELI: the models did not load',e); }); },'150pa-heli');
  // before you move: every helicopter where its clock (or its pilot) says, so a seat carries you the same frame
  SYS.add('carry',dt=>{ if(!built)return; dt=dt||0; HELI.n=(HELI.n||0)+1; for(const H of HELI.list){ update(H,dt); if(H.th)H.th.reach=(H.mode==='rest'?14:3.5)*M0; }
    if(!castAsked&&HELI.list.some(H=>Math.hypot(H.s0.x-pos.x,H.s0.z-pos.z)<60*T))bring();   // the pilots' bodies (data/cast/v-space.json) only once you are near one
    const P=HELI.pad, t=now(); if(P&&P.sp){ P.sp.rotation.y=.8+Math.sin(t*.13)*.5; P.sp.rotation.x=Math.sin(t*1.7)*.04; } },'150pa-heli');
  // the ride ended some other way (a fall): the helicopter stops where it is
  SYS.add('life',()=>{ if(mineH&&!(RIDE.on==='heli:'+mineH.id)){ const H=mineH; mineH=null; H.by=null; H.park={x:FLY.x,y:surf(FLY.x,FLY.z,FLY.y),z:FLY.z,hd:FLY.hd,t:now()}; if(ONLINE.on){ ONLINE.send({t:'car',k:'heli-'+H.id,on:0}); ONLINE.put('car:heli-'+H.id,[H.park.x,H.park.z,H.park.hd,H.park.t].map(v=>+v.toFixed(3)).join(',')); } hudOff(); } },'150pa-heli');
  HELI.dbg=()=>({built,pad:HELI.pad&&{x:+HELI.pad.x.toFixed(2),z:+HELI.pad.z.toFixed(2),top:+HELI.pad.top.toFixed(2)},len:+(LEN/M0).toFixed(0),pilots:Object.keys(PL),list:HELI.list.map(H=>({id:H.id,mode:H.mode,u:+phase(H).toFixed(1),by:H.by,park:!!H.park,x:+H.s0.x.toFixed(2),y:+H.s0.y.toFixed(2),z:+H.s0.z.toFixed(2),rot:+H.rot.toFixed(2)})),ride:RIDE.on,fly:mineH?{...FLY}:null});
}

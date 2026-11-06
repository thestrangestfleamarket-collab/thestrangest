// THE FAIR'S KART TRACK AND BUMPER CARS: KARTS lays the fenced go-kart course with its rental karts at the pit (each a kart kind on its own vehicle, boarded where it stands; laps timed over the start line, your best kept, the fair's record shared) and the bumper-car pen (small slow vehicles that knock the townsfolk and each other about).
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, PB, pos, RIDE, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {FIX, SOL, SYS, TILE} from './006-map-pre.js';
import {VEH} from './150o-physmore.js';
import {FAIR} from './150q-fair.js';
const KARTS={karts:[],bumps:[],lap:null}; window.KARTS=KARTS;
{ const T=TILE, M=FAIR.M||T/.84, M1=M*1.4, M0=M, PI=Math.PI, say=(t,c)=>SAY(t,c||'#e8e2cc'), V3=THREE.Vector3;
  if(FAIR.B){
  const TRK={x:-104,y:-35,w:34,d:42}, PEN={x:-111,y:-2,w:20,d:18};
  FAIR.post('karts',TRK.x+TRK.w/2+2.5,TRK.y+4,-PI/2,0); FAIR.post('bumpers',PEN.x,PEN.y-PEN.d/2-1.5,0,0);
  const wall=(x0,z0,x1,z1,h)=>{ const q=[Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]; SOL.up.push(q); FIX.up.push([q[0],q[1],0,q[2],q[3],h]); };
  const fmt=ms=>(ms/1000).toFixed(2)+' S';

  /* ---------- a rental: a kart kind on its own vehicle, boarded where it stands at the pit; off, it rolls back to its slot ---------- */
  const rental=(i,x,z,hd)=>{ const spec={...VEH.kart.spec()}, V=VEH.make(spec), id='fair:kart:'+i, R={id,i,x,z,hd,mesh:null,V,by:false,sol:null};
    const K=VEH.kartKind(V,{world:true,name:'RENTAL KART',hint:'',onSay:'YOU SQUEEZE INTO THE KART. W GOES, A AND D STEER, F GETS OUT.',
      on:()=>{ if(!PB.R)PB.load(); R.by=true; if(R.mesh)R.mesh.visible=false; KARTS.lap={start:0,laps:0,best:0,was:false,R}; hud(true); },
      off:()=>{ V.drop(); R.by=false; if(R.mesh){ R.mesh.visible=true; R.mesh.position.set(R.x,SHARED.groundY(R.x,R.z),R.z); R.mesh.rotation.set(0,R.hd,0); } KARTS.lap=null; hud(false); SHARED.py=SHARED.groundY(pos.x,pos.z); }});   // you step out where you stopped; the kart itself goes back to its slot
    RIDE.kind(id,K); KARTS.karts.push(R); return R; };
  const HUD=document.createElement('div'); HUD.id='karthud'; HUD.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:12;display:none;gap:10px;align-items:center;padding:6px 10px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#ece5d3;background:#0e1016e0;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  HUD.innerHTML='<span></span><button data-o style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">GET OUT (F)</button>'; document.body.appendChild(HUD);
  const hud=on=>{ HUD.style.display=on?'flex':'none'; }; HUD.querySelector('[data-o]').onclick=()=>{ if(RIDE.on&&RIDE.on.startsWith('fair:kart:'))RIDE.off('YOU CLIMB OUT.'); };
  addEventListener('keydown',e=>{ if(e.repeat||!RIDE.on||!RIDE.on.startsWith('fair:kart:')||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return; if((e.key||'').toLowerCase()==='f'){ e.preventDefault(); RIDE.off('YOU CLIMB OUT.'); } });
  const board=R=>{ if(RIDE.on)return say('GET OFF WHAT YOU ARE RIDING FIRST.','#c8a090'); if(R.by)return say('SOMEONE HAS THAT ONE.','#c8a090'); if(!FAIR.pay(2,'A KART'))return; pos.x=R.x; pos.z=R.z; SHARED.py=SHARED.groundY(R.x,R.z); SHARED.heading=R.hd; R.V.x=R.x; R.V.z=R.z; R.V.hd=R.hd; if(!RIDE.mount(R.id)){ FAIR.give('fairticket',2); return; } R.V.x=R.V.z=R.V.hd=null; say('THREE LAPS. THE LINE IS AT THE GANTRY.'); };
  // the lap: the start line crossed going north inside the track's east straight
  const BEST='fair-kart', best=()=>+(OWNED.get(BEST)||0), record=()=>{ const r=(ONLINE.world||{})['fair:kartrec']; if(typeof r!=='string')return null; const [n,ms]=r.split('|'); return ms>0?{n,ms:+ms}:null; };
  let LINE=null, gantry=null;
  SYS.add('life',dt=>{ const L=KARTS.lap; if(!L||!LINE)return; const now=performance.now(), inX=pos.x>LINE.x0&&pos.x<LINE.x1, over=pos.z>LINE.z; if(inX&&over&&!L.was){ if(L.start){ const ms=now-L.start; L.laps++; L.best=L.best?Math.min(L.best,ms):ms; say('LAP '+L.laps+': '+fmt(ms)+(ms<(best()||1e9)?' · YOUR BEST!':''),'#ffd36a'); if(ms<(best()||1e9))OWNED.set(BEST,String(Math.round(ms))); const rc=record(); if(!rc||ms<rc.ms){ if(ONLINE.put)ONLINE.put('fair:kartrec',((ONLINE.myName&&ONLINE.myName())||'YOU')+'|'+Math.round(ms)); say('THE FAIR RECORD!','#7fd0ff'); } if(SFX.play)SFX.play('chirp',{vol:.5}); } else say('GO! THE CLOCK RUNS.','#ffd36a'); L.start=now; } L.was=inX&&over;
    HUD.querySelector('span').textContent='KART · LAP '+(L.laps+1)+(L.start?' · '+fmt(now-L.start):'')+(L.best?' · BEST '+fmt(L.best):'')+(best()?' · YOURS '+fmt(best()):''); },'150t-karts');
  const signText=()=>{ const rc=record(); return 'KART TRACK\n'+(rc?'RECORD '+fmt(rc.ms)+' · '+rc.n.toUpperCase().slice(0,12):'SET THE RECORD'); };
  SYS.add('world',k=>{ if(k==='fair:kartrec'&&gantry){ const c=gantry.userData.canv; if(c){ const g=c.g, W=c.cv.width, H=c.cv.height; g.fillStyle='#1a1418'; g.fillRect(0,0,W,H); g.fillStyle='#ffd36a'; g.textAlign='center'; g.textBaseline='middle'; const L=signText().split('\n'); L.forEach((s,i)=>{ FAIR.K.fit(g,s,W*.9,H*.62/L.length); g.fillText(s,W/2,H*(i+.5)/L.length); }); c.tex.needsUpdate=true; } } },'150t-karts');

  const buildTrack=(G,K)=>{ const c=FAIR.at(TRK.x,TRK.y), W=TRK.w*T, D=TRK.d*T, g=new THREE.Group(); g.position.copy(c); G.add(g);
    // the course: an oval of asphalt between two tyre walls, the island in the middle
    const asph=new THREE.MeshLambertMaterial({color:0x3a3a40}); const sh=new THREE.Shape(); sh.absellipse(0,0,W/2-.6*M,D/2-.6*M,0,2*PI,false,0); const hole=new THREE.Path(); hole.absellipse(0,0,W/2-5.5*M,D/2-5.5*M,0,2*PI,true,0); sh.holes.push(hole);
    const road=new THREE.Mesh(new THREE.ShapeGeometry(sh,48),asph); road.rotation.x=-PI/2; road.position.y=.05; road.receiveShadow=true; g.add(road);
    const grass=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshLambertMaterial({color:0x5a8a3a})); grass.scale.set(W/2-5.6*M,D/2-5.6*M,1); grass.rotation.x=-PI/2; grass.position.y=.04; g.add(grass);
    const tyre=new THREE.CylinderGeometry(.3*M,.3*M,.24*M,10), TC=[K.mat(0x202428),K.mat(0xd84a3a),K.mat(0xf0f0e8)], ring=(rx,rz,n,h)=>{ const I=[new THREE.InstancedMesh(tyre,TC[0],n),new THREE.InstancedMesh(tyre,TC[1],n),new THREE.InstancedMesh(tyre,TC[2],n)], m4=new THREE.Matrix4(), cnt=[0,0,0]; for(let i=0;i<n;i++){ const a=i/n*2*PI, k=i%3; m4.makeTranslation(Math.cos(a)*rx,.12*M,Math.sin(a)*rz); I[k].setMatrixAt(cnt[k]++,m4); } I.forEach((im,k)=>{ im.count=cnt[k]; im.castShadow=true; g.add(im); }); };
    ring(W/2-.3*M,D/2-.3*M,Math.round((W+D)*1.6/M),.24*M); ring(W/2-5.8*M,D/2-5.8*M,Math.round((W+D)*1.1/M),.24*M);
    // the outer tyre wall is solid in pieces, the inner island too
    const segs=28; for(let i=0;i<segs;i++){ const a0=i/segs*2*PI, a1=(i+1)/segs*2*PI; for(const [rx,rz] of [[W/2-.3*M,D/2-.3*M],[W/2-5.8*M,D/2-5.8*M]]){ const x0=c.x+Math.cos(a0)*rx, z0=c.z+Math.sin(a0)*rz, x1=c.x+Math.cos(a1)*rx, z1=c.z+Math.sin(a1)*rz; wall(Math.min(x0,x1)-.2*M,Math.min(z0,z1)-.2*M,Math.max(x0,x1)+.2*M,Math.max(z0,z1)+.2*M,.5*M); } }
    // the gantry over the east straight: the start line under it
    const gx=W/2-3*M; for(const s of [-1,1])K.box(.2*M,4*M,.2*M,K.mat(0xd8d8e0),gx+s*2.8*M,2*M,0,g); K.box(6*M,.3*M,.3*M,K.mat(0xd8d8e0),gx,4*M,0,g); gantry=K.sign(signText(),4.5*M,1.1*M,'#1a1418','#ffd36a',{glow:1}); gantry.position.set(gx,3.3*M,.17*M); g.add(gantry);
    const ln=new THREE.Mesh(new THREE.PlaneGeometry(5.2*M,.4*M),K.mat(0xf0f0e8)); ln.rotation.x=-PI/2; ln.position.set(gx,.07,0); g.add(ln); LINE={x0:c.x+gx-2.6*M,x1:c.x+gx+2.6*M,z:c.z};
    // the pit: six karts in a row outside the east wall, the kart stand's sign
    const px=TRK.x+TRK.w/2+2.2; for(let i=0;i<6;i++){ const q=FAIR.at(px,TRK.y+(i-2.5)*1.6), R=rental(i,q.x,q.z,PI/2); R.mesh=VEH.kart.make(); R.mesh.position.set(q.x,SHARED.groundY(q.x,q.z),q.z); R.mesh.rotation.y=PI/2; G.add(R.mesh); UI.thing({name:'RENT A KART (2 TICKETS)',obj:R.mesh,reach:2*M,near:5*M,tall:1*M,act:()=>board(R)}); }
    const sq=FAIR.at(px+1.5,TRK.y+6.5); K.box(.1*M,2.6*M,.1*M,K.mat(0x3a3a44),sq.x,1.3*M,sq.z,G); const sg=K.sign('KARTS\n2 TICKETS · 3 LAPS',2*M,.9*M,'#1a1418','#ffd36a',{glow:1}); sg.position.set(sq.x,2.2*M,sq.z); sg.rotation.y=-PI/2; G.add(sg); K.lamp(c.x+gx,3.8*M,c.z,0xffe0a0,14,8); };

  /* ---------- the bumper cars: a pen with a rubber rail, a grid overhead, six slow cars with a pole to the sparks ---------- */
  const bumper=(i,x,z,hd)=>{ const spec={half:[.55*M,.25*M,.75*M],cy:.3*M,lift:.3*M,mass:260,wheels:[[.4,.0,.5],[-.4,0,.5],[.4,0,-.5],[-.4,0,-.5]].map(q=>[q[0]*M,q[1]*M,q[2]*M]),r:.16*M,rest:.1*M,travel:.06*M,stiff:40,grip:1.6,engine:120*M,reverse:90*M,vmax:3.6*M,vback:2*M,brake:4*M,idle:.8*M,steer:.7,steerFade:3*M,knockR:.9*M,down:.16*M,wy:.16,unit:M};
    const V=VEH.make(spec), id='fair:bump:'+i, R={id,i,x,z,hd,V,by:false,mesh:null};
    const K=VEH.kartKind(V,{world:true,name:'BUMPER CAR',onSay:'YOU DROP INTO THE BUMPER CAR. BUMP THEM ALL.',make:()=>bumpMesh(i),on:()=>{ if(!PB.R)PB.load(); R.by=true; if(R.mesh)R.mesh.visible=false; hudB(true); },
      off:()=>{ V.drop(); R.by=false; if(R.mesh){ R.mesh.visible=true; R.mesh.position.set(pos.x,SHARED.groundY(pos.x,pos.z),pos.z); R.mesh.rotation.set(0,SHARED.heading,0); R.x=pos.x; R.z=pos.z; R.hd=SHARED.heading; } hudB(false); pos.z-=1.2*M; },
      place:(m,R_,t)=>{ const w=m.userData.wh; if(!(R_===RIDE&&V.place(m,w))){ if(R_===RIDE)m.position.y=SHARED.py; } }});
    RIDE.kind(id,K); KARTS.bumps.push(R); return R; };
  const bumpMesh=i=>{ const K=FAIR.K, g=new THREE.Group(), col=K.mat([0xd84a3a,0xe9b53a,0x3a8ad8,0x4ab860,0xd86ab0,0xf0f0e8][i%6]); const body=K.mesh(new THREE.CylinderGeometry(.55*M,.6*M,.35*M,18),col,0,.32*M,0,g); body.scale.z=1.35; K.mesh(new THREE.TorusGeometry(.62*M,.1*M,8,22),K.mat(0x202428),0,.22*M,0,g).scale.set(1,1,1.3); K.mesh(new THREE.TorusGeometry(.62*M,.1*M,8,22),K.mat(0x202428),0,.22*M,0,g).rotation.x=PI/2; g.children[g.children.length-1].scale.set(1,1.3,1);
    K.box(.6*M,.08*M,.5*M,K.mat(0x3a3a44),0,.5*M,-.1*M,g); K.box(.6*M,.5*M,.08*M,K.mat(0x3a3a44),0,.75*M,-.35*M,g); K.mesh(new THREE.TorusGeometry(.14*M,.02*M,6,14),K.mat(0x202428),0,.7*M,.3*M,g).rotation.x=-1; K.cyl(.02*M,.02*M,3.2*M,K.mat(0x202428),0,1.9*M,-.5*M,g,6); K.mesh(new THREE.SphereGeometry(.06*M,6,4),new THREE.MeshBasicMaterial({color:0xa0e0ff}),0,3.5*M,-.5*M,g);
    g.userData.wh=[0,1,2,3].map(()=>{ const w=new THREE.Group(); w.visible=false; g.add(w); return w; }); return g; };
  const HB=document.createElement('div'); HB.id='bumphud'; HB.style.cssText=HUD.style.cssText; HB.innerHTML='<span>BUMPER CAR · W GO · A D STEER</span><button data-o style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">GET OUT (F)</button>'; document.body.appendChild(HB);
  const hudB=on=>{ HB.style.display=on?'flex':'none'; }; HB.querySelector('[data-o]').onclick=()=>{ if(RIDE.on&&RIDE.on.startsWith('fair:bump:'))RIDE.off('YOU CLIMB OUT.'); };
  addEventListener('keydown',e=>{ if(e.repeat||!RIDE.on||!RIDE.on.startsWith('fair:bump:')||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return; if((e.key||'').toLowerCase()==='f'){ e.preventDefault(); RIDE.off('YOU CLIMB OUT.'); } });
  const boardB=R=>{ if(RIDE.on)return say('GET OFF WHAT YOU ARE RIDING FIRST.','#c8a090'); if(R.by)return say('SOMEONE HAS THAT ONE.','#c8a090'); if(!FAIR.pay(1,'A BUMPER CAR'))return; pos.x=R.x; pos.z=R.z; SHARED.py=SHARED.groundY(R.x,R.z); SHARED.heading=R.hd; R.V.x=R.x; R.V.z=R.z; R.V.hd=R.hd; if(!RIDE.mount(R.id)){ FAIR.give('fairticket',1); return; } R.V.x=R.V.z=R.V.hd=null; };
  const buildPen=(G,K)=>{ const c=FAIR.at(PEN.x,PEN.y), W=PEN.w*T, D=PEN.d*T, g=new THREE.Group(); g.position.copy(c); G.add(g);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshLambertMaterial({color:0x26262c})); fl.rotation.x=-PI/2; fl.position.y=.06; fl.receiveShadow=true; g.add(fl);
    const rub=K.mat(0x202428); K.box(W,.5*M,.3*M,rub,0,.25*M,D/2,g); K.box(W*.42,.5*M,.3*M,rub,-W*.29,.25*M,-D/2,g); K.box(W*.42,.5*M,.3*M,rub,W*.29,.25*M,-D/2,g); K.box(.3*M,.5*M,D,rub,-W/2,.25*M,0,g); K.box(.3*M,.5*M,D,rub,W/2,.25*M,0,g);
    wall(c.x-W/2,c.z+D/2-.2*M,c.x+W/2,c.z+D/2+.2*M,.5*M); wall(c.x-W/2,c.z-D/2-.2*M,c.x-W*.08,c.z-D/2+.2*M,.5*M); wall(c.x+W*.08,c.z-D/2-.2*M,c.x+W/2,c.z-D/2+.2*M,.5*M); wall(c.x-W/2-.2*M,c.z-D/2,c.x-W/2+.2*M,c.z+D/2,.5*M); wall(c.x+W/2-.2*M,c.z-D/2,c.x+W/2+.2*M,c.z+D/2,.5*M);
    for(const x of [-1,1])for(const z of [-1,1])K.box(.2*M,4*M,.2*M,K.mat(0xd84a3a),x*W/2,2*M,z*D/2,g); const grid=new THREE.Mesh(new THREE.PlaneGeometry(W,D,8,8),new THREE.MeshBasicMaterial({color:0x8090a0,wireframe:true})); grid.rotation.x=-PI/2; grid.position.y=3.6*M; g.add(grid); K.box(W+.4*M,.2*M,D+.4*M,K.mat(0x3a8ad8),0,3.8*M,0,g);
    const sg=K.sign('BUMPER CARS',6*M,1.1*M,'#1a1418','#ffd36a',{glow:1,border:'#c9a24a'}); sg.position.set(0,4.4*M,-D/2); g.add(sg); K.lamp(c.x,3.4*M,c.z,0xffe0a0,16,9);
    for(let i=0;i<6;i++){ const q=FAIR.at(PEN.x+(i%3-1)*4,PEN.y+(i<3?3:-3)), R=bumper(i,q.x,q.z,i<3?0:PI); R.mesh=bumpMesh(i); R.mesh.position.set(q.x,SHARED.groundY(q.x,q.z),q.z); R.mesh.rotation.y=R.hd; G.add(R.mesh); UI.thing({name:'BUMPER CAR (1 TICKET)',obj:R.mesh,reach:2*M,near:5*M,tall:1*M,act:()=>boardB(R)}); } };

  FAIR.extra.push((G,K)=>{ buildTrack(G,K); buildPen(G,K); });
  window.KARTDBG=()=>({lap:KARTS.lap&&{laps:KARTS.lap.laps,best:KARTS.lap.best},best:best(),record:record(),karts:KARTS.karts.map(k=>k.by),bumps:KARTS.bumps.map(k=>k.by),on:RIDE.on,line:!!LINE});
  } }

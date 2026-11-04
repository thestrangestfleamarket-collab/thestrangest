// THE FAIR: FAIR lays THE STRANGEST FAIR on its concrete lot behind the West St row (data/world.json's fair place): the fence, the gate on West St, the ticket booth, the lamps, and the one ride mechanic every ride runs on (a ride runs from the shared clock, so everyone sees the same wheel turn; its seats are boarded where they stand and carry you; a ticket a ride), and the work posts its staff stand at; the rides and the midway register themselves here (150r, 150s) and are built with it the first time you come near.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FORAGE, INV, LITE, pos, RIDE, ROOMS, SFX, st, UI, VIT, WEEDS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, SOL, SYS, TILE} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {CREW} from './111fb-fleamarket.js';
const FAIR={rides:{},list:[],posts:{},extra:[],ready:false,built:false,G:null,K:{}}; window.FAIR=FAIR;
{ const T=TILE, M=T/.84, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, V3=THREE.Vector3, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const P=(LEVEL.places||[]).find(p=>p.kind==='fair'), GT=(LEVEL.places||[]).find(p=>p.kind==='gate');
  if(P){
  const B=FAIR.B={x0:XS(P.x0),x1:XS(P.x1),z0:ZS(P.y0),z1:ZS(P.y1),cx:XS((P.x0+P.x1)/2),cz:ZS((P.y0+P.y1)/2)}, GATE=P.gate||[GT.y0,GT.y1];
  FAIR.at=(x,y)=>new V3(XS(x),0,ZS(y)); FAIR.tile=(x,z)=>[x/T+SHARED.BOD.OX,z/T+SHARED.BOD.OY]; FAIR.M=M; FAIR.P=P;
  FAIR.inside=(x,z,m=0)=>x>B.x0-m&&x<B.x1+m&&z>B.z0-m&&z<B.z1+m;
  FORAGE.add({names:{fairticket:'FAIR TICKET',ptix:'PRIZE TICKET',plush_bear:'PLUSH BEAR',plush_duck:'PLUSH DUCK',plush_giant:'GIANT PLUSH',kazoo:'KAZOO',fair_pennant:'FAIR PENNANT',fairphoto:'RIDE PHOTO',
    cotton_candy:'COTTON CANDY',popcorn:'POPCORN',corndog:'CORN DOG',lemonade:'LEMONADE',funnelcake:'FUNNEL CAKE'}});

  /* ---------- the kit the fair's makers share: flat-colour meshes, a sign painted on a canvas ---------- */
  const MATS=new Map(), mat=(c,o)=>{ const k=c+'|'+JSON.stringify(o||0); let m=MATS.get(k); if(!m){ m=new THREE.MeshLambertMaterial({color:c,...(o||{})}); MATS.set(k,m); } return m; };
  const mesh=(geo,c,x,y,z,parent,o)=>{ const m=new THREE.Mesh(geo,typeof c==='number'?mat(c,o):c); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; if(parent)parent.add(m); return m; };
  const box=(w,h,d,c,x,y,z,parent,o)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,parent,o);
  const cyl=(rt,rb,h,c,x,y,z,parent,n=16,o)=>mesh(new THREE.CylinderGeometry(rt,rb,h,n),c,x,y,z,parent,o);
  const canv=(w,h)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'), tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.magFilter=THREE.NearestFilter; return {cv,g,tex}; };
  const fit=(g,s,w,h)=>{ let sz=h; do{ g.font='bold '+sz+'px Silkscreen,monospace'; sz-=2; }while(g.measureText(s).width>w&&sz>6); };
  const sign=(text,w,h,bg='#1a1418',fg='#ffd36a',o={})=>{ const c=canv(256,Math.max(32,Math.round(256*h/w))), g=c.g; g.fillStyle=bg; g.fillRect(0,0,c.cv.width,c.cv.height);
    if(o.border){ g.strokeStyle=o.border; g.lineWidth=6; g.strokeRect(4,4,c.cv.width-8,c.cv.height-8); } g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle'; const L=String(text).split('\n');
    L.forEach((s,i)=>{ fit(g,s,c.cv.width*.9,c.cv.height*.62/L.length); g.fillText(s,c.cv.width/2,c.cv.height*(i+.5)/L.length); }); c.tex.needsUpdate=true;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:c.tex,side:THREE.DoubleSide,...(o.glow?{toneMapped:false}:{})})); m.userData.canv=c; return m; };
  const bulbs=(w,h,n,parent,y,c=0xfff0b0)=>{ const g=new THREE.SphereGeometry(.05*M,6,4), m=new THREE.MeshBasicMaterial({color:c}), I=new THREE.InstancedMesh(g,m,n*2+2), m4=new THREE.Matrix4(); let k=0;
    for(let i=0;i<=n;i++)for(const s of [-1,1]){ m4.makeTranslation(-w/2+w*i/n,y+s*h/2,0); I.setMatrixAt(k++,m4); } I.count=k; I.userData.bulbs=1; parent.add(I); return I; };
  const lamp=(x,y,z,c=0xffe0a0,d=14,i=9)=>{ const L=new THREE.PointLight(c,0,d*M,1.4); L.position.set(x,y,z); L.userData.fair=1; L.userData.i0=i; FAIR.lamps.push(L); if(window.LITE&&LITE.recs)LITE.recs.push(L); return L; };
  FAIR.lamps=[]; Object.assign(FAIR.K,{mat,mesh,box,cyl,canv,sign,bulbs,lamp,fit});

  /* ---------- tickets: a ticket a ride, sold at the booth by the gate (and by its clerk) ---------- */
  const have=id=>(window.INV&&INV.items&&INV.items[id])|0, give=(id,n)=>{ if(FORAGE.give)FORAGE.give(id,n); else INV.add(id,n); if(FORAGE.draw)FORAGE.draw(); };
  FAIR.have=have; FAIR.give=give;
  FAIR.pay=(n,what)=>{ if(!(n>0))return true; if(have('fairticket')<n){ say((what?what+' TAKES ':'YOU NEED ')+n+' TICKET'+(n>1?'S':'')+'. THE BOOTH BY THE GATE SELLS THEM.','#c8a090'); return false; } INV.add('fairticket',-n); if(FORAGE.draw)FORAGE.draw(); return true; };
  FAIR.cash=(c,what)=>{ if(INV.cash<c){ say('YOU CANNOT AFFORD '+(what||'IT')+' ($'+c+').','#c8a090'); return false; } INV.cash-=c; if(FORAGE.draw)FORAGE.draw(); return true; };
  const STRIP=5, STRIPC=8;
  FAIR.buyTickets=()=>{ if(!FAIR.cash(STRIPC,'A STRIP OF TICKETS'))return; give('fairticket',STRIP); say('A STRIP OF '+STRIP+' FAIR TICKETS FOR $'+STRIPC+'. YOU HAVE '+have('fairticket')+'.'); if(SFX.play)SFX.play('click',{vol:.4}); };

  /* ---------- the staff's posts: a job at the fair names its post (data/characters.json job.spot); CREW asks here where it is ---------- */
  FAIR.post=(key,x,y,hd=0,r=0)=>{ FAIR.posts[key]={x,y,hd,r}; };
  CREW.spots.fair=J=>{ const p=FAIR.posts[J.job.spot]; return p?{x:XS(p.x),z:ZS(p.y),hd:p.hd,r:p.r*T}:null; };

  /* ---------- the ride mechanic: a ride stands at (x,y) facing hd; make(G) builds it and gives its seats and a tick; the clock runs it (load seconds stopped at the station, then the run) ---------- */
  const POSES={car:{k:'car',steer:0,z:0},zip:{k:'zip',z:0,sway:0},kart:{k:'kart',steer:0,z:0}};
  const NOW=()=>TRAINS.now?TRAINS.now():Date.now()/1000;
  const hsh=s=>{ let h=7; for(const c of s)h=(h*31+c.charCodeAt(0))>>>0; return h; };
  const SV=new V3(), SQ=new THREE.Quaternion(), FWD=new V3();
  const seatHd=s=>{ s.getWorldQuaternion(SQ); FWD.set(0,0,1).applyQuaternion(SQ); return Math.atan2(FWD.x,FWD.z); };
  FAIR.ride=def=>{ const R={def,id:def.id,seats:[],taken:[],tick:null,G:null,me:null,off:(hsh(def.id)%1000)/1000*def.cycle,u:0,stopped:true,run:0,was:true}; FAIR.rides[def.id]=R; FAIR.list.push(R);
    for(let i=0;i<def.seats;i++){ const kid='fair:'+def.id+':'+i, K={name:def.name,world:true,fair:R,i,seat:(m,o)=>o.set(0,0,0),fit:()=>def.fit||1,make:()=>new THREE.Group(),lift:.001,hop:false,knock:1e9,ease:1e3,dry:true,inside:true,
        pose:()=>POSES[def.pose||'car'],
        on:()=>{ R.me=i; if(def.on)def.on(R,i); hud(R); },
        off:()=>{ R.me=null; hudOff(); const s=R.seats[i]; if(s&&!R.leaving){ s.getWorldPosition(SV); const ex=def.exit?FAIR.at(def.x+def.exit[0],def.y+def.exit[1]):SV.clone().sub(R.G.position).setY(0).normalize().multiplyScalar(2.2*T).add(SV);
            const g=ROOMS.cur?SV.y:SHARED.groundY(ex.x,ex.z); pos.x=ex.x; pos.z=ex.z; SHARED.py=g; } if(def.offSeat)def.offSeat(R,i); },
        step:(R_,dt)=>{ const s=R.seats[i]; if(!s)return false; s.getWorldPosition(SV); pos.x=SV.x; pos.z=SV.z; R_.hd=SHARED.heading=seatHd(s); R_.v=R.stopped?0:4*T; R_.y=SV.y; st.move=null; return true; },
        floor:(g,R_)=>R_.y!=null?R_.y:g,
        place:(m,R_,t)=>{ const s=R.seats[i]; if(!s)return; s.updateWorldMatrix(true,false); m.position.setFromMatrixPosition(s.matrixWorld); m.quaternion.setFromRotationMatrix(s.matrixWorld); if(R_!==RIDE)R.taken[i]=performance.now(); }};
      RIDE.kind(kid,K); }
    return R; };
  FAIR.taken=(R,i)=>R.taken[i]!=null&&performance.now()-R.taken[i]<600;
  FAIR.board=(id,i)=>{ const R=FAIR.rides[id]; if(!R||!R.seats[i])return false; const d=R.def;
    if(RIDE.on){ if(RIDE.kind&&RIDE.kind.fair===R)return getOff(),true; say('GET OFF WHAT YOU ARE RIDING FIRST.','#c8a090'); return false; }
    if(VIT.dead||VIT.out>0)return false; if(!R.stopped&&!d.anytime)return say('WAIT FOR THE '+d.name+' TO STOP.','#c8a090'),false; if(d.can&&!d.can(R,i))return say('YOU CANNOT REACH THAT SEAT FROM HERE.','#c8a090'),false; if(FAIR.taken(R,i))return say('THAT SEAT IS TAKEN.','#c8a090'),false;
    if(!FAIR.pay(d.price==null?1:d.price,'THE '+d.name))return false; R.leaving=false; if(!RIDE.mount('fair:'+id+':'+i))return give('fairticket',d.price==null?1:d.price),false;
    say(d.say||'YOU CLIMB IN. HOLD ON.'); if(SFX.play)SFX.play('latch',{vol:.5}); return true; };
  // the station: a seat is a thing to double-click while the ride stands still
  const seatThing=(R,i,s,o)=>UI.thing({name:'RIDE THE '+R.def.name,obj:s,reach:(o&&o.reach)||R.def.reach||3*T,near:(R.def.near||6)*T,tall:1*T,act:()=>FAIR.board(R.id,i)});
  FAIR.seatThing=seatThing;

  /* ---------- the HUD while you ride, and F to get off at the station ---------- */
  const HUD=document.createElement('div'); HUD.id='fairhud'; HUD.style.cssText='position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:12;display:none;gap:10px;align-items:center;padding:6px 10px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#ece5d3;background:#0e1016e0;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  HUD.innerHTML='<span></span><button data-o style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">GET OFF (F)</button>'; document.body.appendChild(HUD);
  let hudR=null; const hud=R=>{ hudR=R; HUD.style.display='flex'; hudText(); }, hudOff=()=>{ hudR=null; HUD.style.display='none'; };
  const hudText=()=>{ if(!hudR)return; const R=hudR, b=HUD.querySelector('[data-o]'); HUD.querySelector('span').textContent=R.def.name+(R.stopped?' · AT THE STATION':' · '+Math.round(R.run*100)+'%'); b.style.display=R.stopped||R.def.anytime?'':'none'; };
  const getOff=()=>{ if(!hudR||!RIDE.on)return; const d=hudR.def; if(!hudR.stopped&&!d.anytime)return say('NOT WHILE IT MOVES.','#c8a090'); if(d.anytime&&d.can&&hudR.me!=null&&!d.can(hudR,hudR.me))return say('NOT UP HERE. WAIT FOR THE STATION.','#c8a090'); RIDE.off('YOU GET OFF.'); };
  HUD.querySelector('[data-o]').onclick=getOff;
  addEventListener('keydown',e=>{ if(!hudR||e.repeat||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return; if((e.key||'').toLowerCase()==='f'){ e.preventDefault(); getOff(); } });

  /* ---------- the lot: concrete, the fence, the gate on West St, the booth, the lamps; built with everything registered the first time you come near ---------- */
  const H=P.y1-P.y0, Wt=P.x1-P.x0, GY=[ZS(GATE[0]),ZS(GATE[1])], GW=ZS(GATE[1])-ZS(GATE[0]);
  const concrete=()=>{ const c=canv(256,256), g=c.g; g.fillStyle='#8e8c86'; g.fillRect(0,0,256,256); for(let i=0;i<9000;i++){ const v=120+Math.random()*40|0; g.fillStyle=`rgb(${v},${v-2},${v-5})`; g.fillRect(Math.random()*256|0,Math.random()*256|0,1,1); }
    g.fillStyle='#6a6862'; g.fillRect(0,0,256,3); g.fillRect(0,0,3,256); for(let i=0;i<12;i++){ g.fillStyle='rgba(60,58,54,.5)'; g.fillRect(Math.random()*256|0,Math.random()*256|0,6+Math.random()*40|0,1); }
    c.tex.wrapS=c.tex.wrapT=THREE.RepeatWrapping; c.tex.magFilter=THREE.LinearFilter; c.tex.needsUpdate=true; return c.tex; };
  const slab=(G,x0,z0,x1,z1,tex)=>{ const w=x1-x0, d=z1-z0, m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:tex})); tex.repeat.set(w/(4*T),d/(4*T)); m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2,.03,(z0+z1)/2); m.receiveShadow=true; G.add(m); return m; };
  const wall=(x0,z0,x1,z1,h)=>{ const q=[Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]; SOL.up.push(q); FIX.up.push([q[0],q[1],0,q[2],q[3],h]); };
  const fence=G=>{ const post=new THREE.BoxGeometry(.08*M,1.9*M,.08*M), rail=new THREE.BoxGeometry(1,.05*M,.05*M), dark=mat(0x2a2c30), PO=[], RL=[], step=3*T, th=.12*M;
    const run=(ax,bx,az,bz)=>{ const L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.round(L/step)), a=Math.atan2(bz-az,bx-ax); for(let i=0;i<=n;i++)PO.push([ax+(bx-ax)*i/n,az+(bz-az)*i/n]); for(const y of [.5*M,1.7*M])RL.push([(ax+bx)/2,y,(az+bz)/2,L,a]); wall(ax-th,az-th,bx+th,bz+th,1.9*M); };
    run(B.x0,B.z0,B.x1,B.z0); run(B.x0,B.z1,B.x1,B.z1); run(B.x0,B.z0,B.x0,B.z1); run(B.x1,B.z0,B.x1,GY[0]); run(B.x1,GY[1],B.x1,B.z1);
    const px=XS(GT.x1), s0=GY[0], s1=GY[1]; run(B.x1,s0,px,s0); run(B.x1,s1,px,s1);   // the way in, fenced both sides between the theatre and the museum
    const I=new THREE.InstancedMesh(post,dark,PO.length), m4=new THREE.Matrix4(); PO.forEach((p,i)=>{ m4.makeTranslation(p[0],.95*M,p[1]); I.setMatrixAt(i,m4); }); I.castShadow=true; G.add(I);
    for(const [x,y,z,L,a] of RL){ const r=new THREE.Mesh(rail,dark); r.scale.x=L; r.position.set(x,y,z); r.rotation.y=-a; r.castShadow=true; G.add(r); } };
  const arch=G=>{ const x=XS(GT.x1)-.6*M, zc=(GY[0]+GY[1])/2, w=GW-1.2*M, brick=mat(0x7a3a30), gold=mat(0xc9a24a);
    for(const s of [-1,1]){ box(.9*M,4.6*M,.9*M,brick,x,2.3*M,zc+s*(w/2)); box(1.1*M,.25*M,1.1*M,gold,x,4.7*M,zc+s*(w/2)); }
    const top=box(.6*M,1.5*M,w+.9*M,mat(0x1a1418),x,5.45*M,zc); const sg=sign('THE STRANGEST FAIR',w+.6*M,1.2*M,'#1a1418','#ffd36a',{glow:1,border:'#c9a24a'}); sg.rotation.y=Math.PI/2; sg.position.set(x+.32*M,5.45*M,zc); G.add(sg);
    const sb=sign('THE STRANGEST FAIR',w+.6*M,1.2*M,'#1a1418','#ffd36a',{glow:1,border:'#c9a24a'}); sb.rotation.y=-Math.PI/2; sb.position.set(x-.32*M,5.45*M,zc); G.add(sb);
    const bl=bulbs(w+.6*M,1.35*M,16,G,0); bl.position.set(x+.34*M,5.45*M,zc); bl.rotation.y=Math.PI/2; FAIR.bulbs.push(bl);
    lamp(x,5.2*M,zc,0xffe6b0,16,10); G.add(top); wall(x-.5*M,zc-w/2-.5*M,x+.5*M,zc-w/2+.5*M,4.6*M); wall(x-.5*M,zc+w/2-.5*M,x+.5*M,zc+w/2+.5*M,4.6*M); };
  const booth=G=>{ const q=FAIR.at(P.x1-3.2,GATE[0]-2.8), x=q.x, z=q.z, body=mat(0xd8d2c0), trim=mat(0xa83a2c); const K=new THREE.Group(); K.position.set(x,0,z); G.add(K);
    box(2.2*M,2.6*M,2.2*M,body,0,1.3*M,0,K); box(2.6*M,.25*M,2.6*M,trim,0,2.72*M,0,K); for(let i=0;i<4;i++){ const s=box(.14*M,2.6*M,.14*M,trim,Math.cos(i*Math.PI/2+Math.PI/4)*1.5*M,1.3*M,Math.sin(i*Math.PI/2+Math.PI/4)*1.5*M,K); }
    const win=box(1.3*M,.9*M,.06*M,new THREE.MeshPhongMaterial({color:0x9fc4d8,transparent:true,opacity:.35,shininess:80}),0,1.45*M,1.12*M,K); box(1.5*M,.1*M,.3*M,trim,0,.98*M,1.2*M,K);
    const sg=sign('TICKETS\n$'+STRIPC+' A STRIP OF '+STRIP,2.2*M,.7*M,'#1a1418','#ffd36a',{glow:1}); sg.position.set(0,2.25*M,1.14*M); K.add(sg);
    FAIR.booth={x,z,K}; wall(x-1.1*M,z-1.1*M,x+1.1*M,z+1.1*M,2.6*M); UI.thing({name:'FAIR TICKETS',obj:win,reach:2.4*M,near:5*M,tall:2*M,act:()=>FAIR.buyTickets()}); FAIR.post('tickets',P.x1-3.2,GATE[0]-2.8,0,0); FAIR.post('gate',P.x1-1.6,GATE[1]-1.2,Math.PI/2,0); FAIR.post('mascot',P.x1-9,GATE[0]+1.5,0,5); lamp(x,2.5*M,z,0xffe0a0,10,6); };
  const posts=G=>{ const dark=mat(0x2a2c30), head=new THREE.MeshBasicMaterial({color:0xfff0c8}); const put=(x,y)=>{ const q=FAIR.at(x,y); cyl(.07*M,.1*M,5*M,dark,q.x,2.5*M,q.z,G,8); box(.5*M,.2*M,.5*M,dark,q.x,5.05*M,q.z,G); const h=box(.36*M,.1*M,.36*M,head,q.x,4.95*M,q.z,G); FAIR.heads.push(h); lamp(q.x,4.8*M,q.z,0xffe0a0,14,9); };
    for(let y=P.y0+10;y<P.y1-6;y+=14){ put(P.x0+1.2,y); if(y<GATE[0]-3||y>GATE[1]+3)put(P.x1-1.2,y); } };
  FAIR.bulbs=[]; FAIR.heads=[];
  const build=()=>{ '@fair'; const G=FAIR.G=new THREE.Group(); G.name='fair'; scene.add(G); const tex=concrete(); slab(G,B.x0,B.z0,B.x1,B.z1,tex); slab(G,B.x1,GY[0],XS(GT.x1)+.4*M,GY[1],tex.clone());
    if(WEEDS.lawnDrop){ WEEDS.lawnDrop([B.x0,B.z0,B.x1,B.z1]); WEEDS.lawnDrop([B.x1,GY[0],XS(GT.x1)+.4*M,GY[1]]); }   // nothing grows through concrete
    fence(G); arch(G); booth(G); posts(G);
    for(const R of FAIR.list){ const d=R.def, g=new THREE.Group(); g.position.copy(FAIR.at(d.x,d.y)); g.rotation.y=d.hd||0; G.add(g); R.G=g; const out=d.make(g,FAIR.K,R)||{}; R.seats=out.seats||[]; R.tick=out.tick||null; R.seats.forEach((s,i)=>seatThing(R,i,s,out)); if(d.solid){ const [w,dd]=d.solid; wall(g.position.x-w/2*T,g.position.z-dd/2*T,g.position.x+w/2*T,g.position.z+dd/2*T,3*M); }
      const o=d.op||[0,-((d.solid?d.solid[1]/2:5)+2.5),0]; FAIR.post('op:'+d.id,d.x+o[0],d.y+o[1],o[2]||0,0); }
    for(const f of FAIR.extra)try{ f(G,FAIR.K); }catch(e){ console.warn('FAIR extra',e); }
    FAIR.built=true; FAIR.ready=true; };
  let asked=false, near=false; const NEAR=170*T, FAR=260*T;
  const dist=()=>Math.hypot(Math.max(B.x0-pos.x,0,pos.x-B.x1),Math.max(B.z0-pos.z,0,pos.z-B.z1));
  SYS.add('life',dt=>{ if(!window.__started)return; const d=dist(); if(!asked&&d<NEAR&&SHARED.LVL==='up'){ asked=true; LOAD('fair').then(build).catch(e=>console.warn('FAIR did not build',e)); }
    if(!FAIR.built)return; const n=d<FAR; if(n!==near){ near=n; FAIR.G.visible=n; }
    const dark=CLOCK.dark?CLOCK.dark():false; if(dark!==FAIR.dark){ FAIR.dark=dark; for(const L of FAIR.lamps)L.intensity=dark?L.userData.i0:0; for(const b of FAIR.bulbs)b.material.color.setHex(dark?0xffe890:0x6a6050); for(const h of FAIR.heads)h.material.color.setHex(dark?0xfff0c8:0xa8a498); } },'150q-fair');
  // the rides run from the clock, before you move, so a seat carries you the same frame
  SYS.add('carry',dt=>{ if(!FAIR.built||!near)return; const now=NOW();
    for(const R of FAIR.list){ const d=R.def, u=((now+R.off)%d.cycle+d.cycle)%d.cycle, stopped=u<d.load; R.u=u; R.stopped=stopped; R.run=stopped?0:(u-d.load)/(d.cycle-d.load); if(R.tick)R.tick(R.run,u,stopped,dt||0);
      if(stopped&&!R.was&&R.me!=null&&RIDE.on&&RIDE.kind&&RIDE.kind.fair===R){ R.leaving=false; RIDE.off('THE RIDE IS OVER.'); if(d.done)d.done(R); } R.was=stopped; }
    if(hudR)hudText(); },'150q-fair');
  window.FAIRDBG=()=>({built:FAIR.built,near,rides:FAIR.list.map(R=>({id:R.id,seats:R.seats.length,u:+R.u.toFixed(1),stopped:R.stopped,run:+R.run.toFixed(2),me:R.me})),tickets:have('fairticket'),ptix:have('ptix'),posts:Object.keys(FAIR.posts).length,lamps:FAIR.lamps.length,on:RIDE.on});
  } }
export {FAIR};

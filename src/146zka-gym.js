// THE GYM, KNUCKLE & IRON (owner, 8 Nov 2026): its inside off the map behind its West St door (059i): treadmills (STAMINA), heavy bags and the speed bag (STRENGTH, MARTIAL ARTS), the bench, the squat rack, the dumbbells and the rope mats (one timing game, GYM.reps), and the ring, where a fight is never to the death (VIT.bouts) and your body goes loose as you get hurt.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, keys, PB, pos, RAG, ROOMS, SFX, st, USE, VIT, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {Reflector, RH} from './004-main.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
const GYM={}; window.GYM=GYM;
{ const say=(t,c)=>SAY(t,c||'#e8d8b0'), T=TILE, NM={str:'STRENGTH',sta:'STAMINA'};
  let K=null;   // the built room: its frame and live parts, null when you are not in
  const inGym=()=>!!(K&&ROOMS.offIn&&ROOMS.offIn()==='gym');
  const uv=(x,z)=>{ const F=K.F, o=F.pw(0,0); return [((x-o[0])*F.eu[0]+(z-o[1])*F.eu[1])/IKIT.MW,((x-o[0])*F.ev[0]+(z-o[1])*F.ev[1])/IKIT.MW]; };
  const inRing=(x=pos.x,z=pos.z)=>{ if(!inGym())return false; const [u,v]=uv(x,z), r=K.ring; return u>r.u0&&u<r.u1&&v>r.v0&&v<r.v1; };
  GYM.inRing=()=>inRing();

  MSHOP.kit.gym=A=>{ '@later'; const R=A.R, F=IKIT.frame(R), MW=IKIT.MW, Km=IKIT.room(F,o=>A.add(o),()=>{}), {box,cyl,ball,glow,pic,words,use,seat,own,meshOf}=Km, W=F.W, D=F.D, tm=D/(R.y1-R.y0), HT=A.WH/24*tm;
    const sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/tm,R.y0+Math.min(v0,v1)/tm,R.x0+Math.max(u0,u1)/tm,R.y0+Math.max(v0,v1)/tm);
    const STEEL=0xb8bcc2, DARK=0x2a2c30, RED=0xc8402c, BLUE=0x2f66c8;
    K={F,tread:[],bags:[],speed:null,ring:null,stools:[]};
    // rubber tiles, brick over a dark band, a steel beam under the roof
    A.floor((x,y)=>{ const u=(x-R.x0)*tm, v=(y-R.y0)*tm, e=(u%1.2)<.04||(v%1.2)<.04?.72:1, s=.9+.1*A.hs(Math.floor(u/1.2),Math.floor(v/1.2),7)+.05*A.hs(Math.floor(u*20),Math.floor(v*20),3); return [44*s*e,46*s*e,50*s*e]; });
    for(const sd of ['b','w','e','f'])A.wall(sd,(a,z)=>{ if(z<5)return [24,24,26]; if(z<26)return [38,40,44]; if(z<28)return [180,176,166]; if(z>A.WH-8)return [40,42,46];
      const r=Math.floor(z/5), m=((a*24)+(r%2)*6)%12; if(z%5<1||m<1)return [84,52,42]; const n=.88+.12*A.hs(Math.floor((a*24+(r%2)*6)/12),r,5); return [128*n,64*n,48*n]; });
    pic(W/2+2,.03,HT-1.1,4.2,.8,0,1,words(168,32,'#16181c',[['KNUCKLE & IRON',84,9,'#ecebe6',14,'center']]),true);
    // the light: pendants over the ring and the floor
    for(const [u,v] of [[11.2,6],[3.5,3],[3.5,10],[16,4],[16,10],[8,12]]){ cyl(u,v,.32,HT-.55,HT-.3,0x30343a,.08); glow(()=>ball(u,v,HT-.6,.12,0xfff2c4)); A.lamp(F.tu(u),F.tv(v),(HT-.8)/tm,0xffe7b8,45,10/tm); }

    /* ---------- THE TREADMILLS: four on the back wall, facing it ---------- */
    for(let i=0;i<4;i++){ const u=1.4+i*1.25, v0=.7, v1=2.7;
      box(u-.42,v0,u+.42,v1,0,.16,0x3a3d43); box(u-.29,v0+.08,u+.29,v1-.08,.16,.18,0x1d1e21); for(const s of [-1,1]){ box(u+s*.38,v0,u+s*.42,v1,.16,.22,STEEL); cyl(u+s*.36,v0+.1,.025,.16,1.2,STEEL); box(u+s*.38,v0+.1,u+s*.4,v0+.6,1.0,1.04,STEEL); }
      box(u-.38,v0+.05,u+.38,v0+.15,1.18,1.24,STEEL); box(u-.22,v0+.08,u+.22,v0+.14,1.24,1.46,0x111316);
      const lcd=pic(u,v0+.155,1.27,.36,.16,0,1,words(48,20,'#0c2014',[['PACE 0',24,6,'#7cf0a4',8,'center']]),true);
      const t={i,u,v:(v0+v1)/2+.15,lcd,pace:0}; K.tread.push(t);
      use('TREADMILL '+(i+1)+' (STEP ON)',u,(v0+v1)/2,.9,1.3,()=>GYM.tread(t),1.4); }

    /* ---------- THE HEAVY BAGS on the west wall, each on its own pivot so it swings ---------- */
    for(let i=0;i<3;i++){ const v=5.2+i*1.6, pu=1.0, top=2.5;
      box(0,v-.06,pu+.1,v+.06,top+.04,top+.14,DARK); box(0,v-.06,.12,v+.06,top-.4,top+.14,DARK);
      const b=own(()=>{ cyl(pu,v,.012,top-.36,top,0x777a80); cyl(pu,v,.21,top-.42,top-.36,0x111214); cyl(pu,v,.2,top-1.5,top-.42,i===1?0xb43a2a:0x2b2d31); cyl(pu,v,.21,top-1.56,top-1.5,0x111214); });
      const me=meshOf(b,Km.matL,true), piv=new THREE.Group(), pw=F.pw(pu,v); piv.position.set(pw[0],top*MW,pw[1]); A.add(piv); piv.attach(me);
      K.bags.push({piv,u:pu,v,top,a:0,av:0,b:0,bv:0,combo:0,last:0,shoved:0}); }
    { const v=10.3; box(0,v-.45,.12,v+.45,1.5,2.4,0x6b4a2b); box(0,v-.4,.75,v+.4,2.3,2.36,0x6b4a2b);
      const b=own(()=>ball(.5,v,2.08,.12,0xb43a2a,1.4)), me=meshOf(b,Km.matL,true); K.speed={me,u:.5,v,y0:me.position.y,t:0,streak:0,last:0}; }

    /* ---------- THE RING: posts, three ropes a side, solid but for stepping through; a stool in the red and the blue corners ---------- */
    { const cu=11.2, cv=6, S=2.6, u0=cu-S, u1=cu+S, v0=cv-S, v1=cv+S; K.ring={u0,u1,v0,v1,cu,cv};
      box(u0-.35,v0-.35,u1+.35,v1+.35,0,.03,0x2b4f8f); box(u0,v0,u1,v1,.03,.05,0xe7dfc8);
      const post=[[u0,v0,RED],[u1,v0,0xeeeeee],[u1,v1,BLUE],[u0,v1,0xeeeeee]];
      for(const [u,v,c] of post){ cyl(u,v,.07,0,1.55,STEEL); box(u-.1,v-.1,u+.1,v+.1,.35,1.45,c); }
      [.5,.9,1.3].forEach((h,k)=>{ const c=[RED,0xeeeeee,BLUE][k]; box(u0,v0-.02,u1,v0+.02,h-.02,h+.02,c); box(u0,v1-.02,u1,v1+.02,h-.02,h+.02,c); box(u0-.02,v0,u0+.02,v1,h-.02,h+.02,c); box(u1-.02,v0,u1+.02,v1,h-.02,h+.02,c); });
      sol(u0-.05,v0-.05,u1+.05,v0+.05); sol(u0-.05,v1-.05,u1+.05,v1+.05); sol(u0-.05,v0,u0+.05,v1); sol(u1-.05,v0,u1+.05,v1);
      const through=(u,v,du,dv)=>()=>{ const inside=inRing(), p=F.pw(u+(inside?du:-du)*.55,v+(inside?dv:-dv)*.55); pos.x=p[0]; pos.z=p[1]; SHARED.target=null; SHARED.heading=F.hd(inside?du:-du,inside?dv:-dv); say(inside?'YOU DUCK OUT THROUGH THE ROPES.':'YOU STEP THROUGH THE ROPES. A FIGHT IN HERE IS NEVER TO THE DEATH.'); };
      use('THE ROPES (STEP THROUGH)',cu,v1,1.6,1.4,through(cu,v1,0,1),1.6); use('THE ROPES (STEP THROUGH)',u0,cv,1.6,1.4,through(u0,cv,-1,0),1.6); use('THE ROPES (STEP THROUGH)',cu,v0,1.6,1.4,through(cu,v0,0,-1),1.6); use('THE ROPES (STEP THROUGH)',u1,cv,1.6,1.4,through(u1,cv,1,0),1.6);
      for(const [u,v,c,du,dv] of [[u0+.45,v0+.45,RED,1,1],[u1-.45,v1-.45,BLUE,-1,-1]]){ seat('THE CORNER STOOL',own(()=>{ cyl(u,v,.2,.42,.48,c); for(const a of [0,2.1,4.2])cyl(u+.13*Math.cos(a),v+.13*Math.sin(a),.02,0,.42,STEEL); }),[[u,v,.48,du,dv]],.9); K.stools.push([u,v,du,dv]); } }

    /* ---------- THE IRON: the bench, the squat rack, the dumbbells, a mirror ---------- */
    { const u=16.2, v=2.2; box(u-.18,v-.65,u+.18,v+.65,0,.42,DARK); box(u-.2,v-.65,u+.2,v+.65,.42,.5,0xb43a2a); sol(u-.2,v-.65,u+.2,v+.65);
      for(const s of [-1,1]){ cyl(u+s*.55,v-.5,.03,0,1.1,STEEL); } cyl(u,v-.45,.022,1.05,1.07,STEEL); box(u-.92,v-.47,u+.92,v-.43,1.04,1.08,STEEL); for(const s of [-1,1])for(const [o,r,c] of [[.72,.22,RED],[.8,.17,BLUE]])box(u+s*o-.03,v-.45-r,u+s*o+.03,v-.45+r,1.06-r,1.06+r,c);
      seat('THE BENCH (PRESS)',own(()=>box(u-.2,v-.1,u+.2,v+.5,.5,.52,0xb43a2a)),[[u,v+.25,.5,0,-1]],1.1);
      use('THE BENCH PRESS (LIFT)',u,v-.45,1.6,1.3,()=>GYM.reps('bench'),1.6); }
    { const u=16.4, v=5.6; for(const [a,b] of [[-.6,-.5],[.6,-.5],[-.6,.5],[.6,.5]])box(u+a-.04,v+b-.04,u+a+.04,v+b+.04,0,2.4,0x3a3d43); box(u-.66,v-.54,u+.66,v-.46,2.36,2.42,0x3a3d43); box(u-.66,v+.46,u+.66,v+.54,2.36,2.42,0x3a3d43);
      box(u-1,v-.47,u+1,v-.43,1.43,1.47,STEEL); for(const s of [-1,1])box(u+s*.82-.03,v-.45-.22,u+s*.82+.03,v-.45+.22,1.23,1.67,RED); box(u-.7,v-.7,u+.7,v+.7,0,.02,0x1e2023);
      use('THE SQUAT RACK (LIFT)',u,v,1.4,2.4,()=>GYM.reps('squat'),1.6); K.rack=[u,v]; }
    { const u=17.95, v0=8, v1=11.6; box(u-.3,v0,u+.3,v1,.5,.55,0x3a3d43); box(u-.2,v0,u+.35,v1,.9,.95,0x3a3d43); box(u-.3,v0,u+.35,v0+.05,0,.95,0x3a3d43); box(u-.3,v1-.05,u+.35,v1,0,.95,0x3a3d43); sol(u-.3,v0,u+.35,v1);
      for(let r=0;r<2;r++)for(let i=0;i<8;i++){ const vv=v0+.25+i*.44, h=r?.99:.6, rr=.045+i*.006; box(u-.1+r*.1,vv-.12,u+r*.1,vv+.12,h,h+.03,STEEL); for(const s of [-1,1])cyl(u-.05+r*.1,vv+s*.12,rr,h,h+rr*2,DARK); }
      use('THE DUMBBELLS (CURL)',u,(v0+v1)/2,.8,1.1,()=>GYM.reps('curl'),1.5);
      box(W-.06,2.9,W,7.6,.3,2.7,DARK);   // the mirror's frame, and the mirror: a real reflection of the room and of you, moving as you move, in the headset too (owner, 8 Nov 2026)
      { const mw=4.5, mh=2.2, p=F.pw(W-.07,5.25), r=new Reflector(new THREE.PlaneGeometry(mw*MW,mh*MW),{textureWidth:Math.ceil(2*RH),textureHeight:Math.ceil(RH),color:0xe8ecef,clipBias:.003});
        r.position.set(p[0],1.5*MW,p[1]); r.rotation.y=Math.atan2(-F.eu[0],-F.eu[1]); r.name='gym mirror'; A.add(r); K.mirror=r;
        const draw=r.onBeforeRender; r.onBeforeRender=function(...a){ const G=W3.group, gv=G&&G.visible, nh=W3.noHead&&W3.dress; if(G)G.visible=true; if(nh){ W3.noHead=false; W3.dress(); } try{ draw.apply(this,a); } finally{ if(G)G.visible=gv; if(nh){ W3.noHead=true; W3.dress(); } } }; } }   // (through your own eyes, and in the headset, your body and head are hidden from you: the mirror shows them)
    // the lockers and a bench on the back wall, a water cooler, the rope mats by the door
    for(let i=0;i<7;i++){ box(9.6+i*.52,0,10.1+i*.52,.48,0,2.0,0x56636e); box(9.75+i*.52,.48,9.95+i*.52,.5,1.4,1.45,DARK); } sol(9.6,0,13.3,.5);
    seat('A BENCH',own(()=>box(9.8,.8,13,1.2,.4,.44,0x6b4a2b)),[[10.4,1,.44,0,1],[11.4,1,.44,0,1],[12.4,1,.44,0,1]],1.2); sol(9.8,.8,13,1.2);
    box(7.0,.1,7.4,.5,0,.95,0xd8dbe0); cyl(7.2,.3,.16,.95,1.4,0x7fb6e8); sol(7,.1,7.4,.5);
    for(let i=0;i<3;i++){ const u=1.4+i*1.7, v=12.3; box(u-.7,v-.9,u+.7,v+.9,0,.025,[0x2f6fd0,0x3a8c5c,0x8e3a8a][i]); cyl(u+.4,v+.5,.16,.025,.05,0xe8b13a,.16);
      use('A ROPE MAT (SKIP ROPE)',u,v,1.4,.6,()=>GYM.reps('rope',[u,v]),1.4); }
    Km.flush(); };
  MSHOP.kit.gym.drop=()=>{ GYM.stop(true); if(K&&K.mirror)K.mirror.dispose(); K=null; };

  /* ---------- THE TREADMILL: you run in place (RUNNER), the belt at its pace; W faster, S slower, A or D steps off; empty and you are thrown off the back ---------- */
  let TM=null, paceT=0;
  const lcd=t=>{ const m=t.lcd; if(!m)return; const tx=IKIT.tex(48,20,(g,w,h)=>{ g.fillStyle='#0c2014'; g.fillRect(0,0,w,h); g.fillStyle='#7cf0a4'; g.font='8px monospace'; g.textAlign='center'; g.textBaseline='top'; g.fillText('PACE '+t.pace,24,6); }); if(m.material.map)m.material.map.dispose(); m.material.map=tx; m.material.needsUpdate=true; };
  const offTread=(fall)=>{ if(!TM)return; const t=TM.t, F=K&&K.F; TM=null; window.RUNNER=MODS.runner=null; t.pace=0; lcd(t); if(!F)return; const p=F.pw(t.u,t.v+(fall?1.9:1.4)); pos.x=p[0]; pos.z=p[1];
    if(fall){ SHARED.trip=true; say('YOU CAN\'T KEEP UP. THE BELT THROWS YOU OFF THE BACK.','#ff9a7a'); } else say('YOU STEP OFF THE TREADMILL.'); };
  GYM.tread=t=>{ '@later'; if(TM&&TM.t===t)return offTread(false); if(TM)offTread(false); if(REPS)GYM.stop(); if(RAG.on||VIT.out>0)return; const F=K.F, p=F.pw(t.u,t.v), hd=F.hd(0,-1);
    t.pace=3; lcd(t); TM={t,x:p[0],z:p[1],hd}; SHARED.heading=hd; window.RUNNER=MODS.runner={on:true,steer:()=>{ pos.x=TM.x; pos.z=TM.z; SHARED.heading=TM.hd; return [Math.sin(TM.hd),Math.cos(TM.hd),TM.t.pace>=7?1:0]; }};
    say('YOU STEP ON. W FASTER, S SLOWER, A OR D TO STEP OFF. PACE 3.'); };
  const treadStep=dt=>{ if(!TM)return; if(!inGym()||RAG.on||VIT.out>0||VIT.dead){ TM=null; window.RUNNER=MODS.runner=null; return; } const t=TM.t;
    if(keys.has('a')||keys.has('d')||keys.has('arrowleft')||keys.has('arrowright'))return offTread(false);
    if((paceT-=dt)<=0){ const up=keys.has('w')||keys.has('arrowup'), dn=keys.has('s')||keys.has('arrowdown'); if(up||dn){ paceT=.3; t.pace=Math.max(0,Math.min(12,t.pace+(up?1:-1))); lcd(t); if(!t.pace)return offTread(false); } }
    const k=t.pace/12; VIT.spend(dt*k*k/45); FORAGE.stats.work('sta',dt*Math.pow(k,1.5)/600);
    if(VIT.sta<=0&&t.pace>=5)offTread(true); };

  /* ---------- THE BAGS: your strikes (STRIKES, one list a frame for every reader) on a bag swing it and train you; a bag swinging back into you shoves you ---------- */
  const bagStep=dt=>{ if(!inGym())return; const S=MODS.strikes, now=performance.now(), F=K.F;
    for(const B of K.bags){ B.av+=(-9.8/1.0*Math.sin(B.a))*dt; B.av*=Math.pow(.6,dt); B.a+=B.av*dt; B.bv+=(-9.8*Math.sin(B.b))*dt; B.bv*=Math.pow(.6,dt); B.b+=B.bv*dt;
      B.piv.rotation.set(0,0,0); const ax=new THREE.Vector3(F.ev[0],0,F.ev[1]), az=new THREE.Vector3(F.eu[0],0,F.eu[1]); B.piv.rotateOnWorldAxis(ax,B.a); B.piv.rotateOnWorldAxis(az,-B.b);
      const p=F.pw(B.u+Math.sin(B.a)*.9,B.v+Math.sin(B.b)*.9), dx=pos.x-p[0], dz=pos.z-p[1], d=Math.hypot(dx,dz);
      if(d<.55*T&&B.av>1.6&&now-B.shoved>800){ B.shoved=now; SYS.run('hurt',0,{x:p[0],z:p[1]}); say('THE BAG SWINGS BACK INTO YOU.','#ff9a7a'); } }
    const sp=K.speed; if(sp){ sp.t=Math.max(0,sp.t-dt); sp.me.position.y=sp.y0+Math.sin(sp.t*40)*sp.t*.05*IKIT.MW; }
    if(!S)return; for(const s of S.strikes()){ if(s.sk)continue;
      for(const B of K.bags){ const p=F.pw(B.u+Math.sin(B.a)*.9,B.v+Math.sin(B.b)*.9); if(!S.inCone(s,p[0],p[1],SHARED.py+T,.25*T))continue;
        const f=s.d*S.strength(s), du=(pos.x-p[0])*F.eu[0]+(pos.z-p[1])*F.eu[1], dv=(pos.x-p[0])*F.ev[0]+(pos.z-p[1])*F.ev[1], l=Math.hypot(du,dv)||1;
        B.av-=du/l*1.4*f; B.bv-=dv/l*1.4*f; B.combo=now-B.last<900?B.combo+1:1; B.last=now; SFX.play('thud',{vol:.6,pitch:.8,vary:.2}); S.landed(s);
        FORAGE.stats.work('str',f*(B.combo>=3?2:1)/150); VIT.inFight(2); break; }
      if(sp){ const p=F.pw(sp.u,sp.v); if(S.inCone(s,p[0],p[1],SHARED.py+T,.2*T)){ const gap=now-sp.last; sp.streak=gap>200&&gap<700?sp.streak+1:1; sp.last=now; sp.t=.5; SFX.play('thud',{vol:.35,pitch:1.8,vary:.2});
        if(sp.streak%5===0){ S.landed(s); if(sp.streak%20===0)say('A STREAK OF '+sp.streak+' ON THE SPEED BAG.','#7fd0ff'); } } } } };

  /* ---------- REPS: the bench, the squat rack, the dumbbells and the rope, one timing game: press SPACE (or click) as the marker crosses the green; the heavier, the narrower and quicker ---------- */
  const KIND={bench:{name:'BENCH PRESS',stat:'str',kg:[20,40,60,80,100,120,140],cap:2,k:1},squat:{name:'SQUAT',stat:'str',kg:[20,40,60,80,100,140,180],cap:2.6,k:1},curl:{name:'DUMBBELL CURLS',stat:'str',kg:[5,10,15,20,25,30],cap:.6,k:.5},rope:{name:'SKIPPING ROPE',stat:'sta'}};
  let REPS=null; const P=document.createElement('div'); P.id='gymreps'; P.hidden=true;
  { const css=document.createElement('style'); css.textContent=`#gymreps{position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:6;width:min(340px,calc(100vw - 32px));background:#0c1a10e8;border:1px solid #2e6a3c;padding:8px 10px;font:10px Silkscreen,monospace;letter-spacing:1px;color:#d8f0d8;display:flex;flex-direction:column;gap:6px}
    #gymreps[hidden]{display:none} #gymreps .hd{display:flex;justify-content:space-between;gap:8px} #gymreps .bar{position:relative;height:16px;background:#000a;border:1px solid #2e6a3c;cursor:pointer} #gymreps .bar i{position:absolute;top:0;bottom:0;background:#3fb35c88} #gymreps .bar b{position:absolute;top:-3px;bottom:-3px;width:3px;background:#f2c14e}
    #gymreps .kg{display:flex;flex-wrap:wrap;gap:4px} #gymreps button{font:inherit;color:inherit;background:#13301c;border:1px solid #2e6a3c;padding:3px 6px;cursor:pointer} #gymreps button[aria-pressed="true"]{background:#2e6a3c;color:#fff}`; document.head.appendChild(css); }
  P.innerHTML='<div class="hd"><b id="grn"></b><button id="grx">STOP</button></div><div class="kg" id="grk"></div><div class="bar" id="grb"><i id="grz"></i><b id="grm"></b></div><div id="grt"></div>'; document.body.appendChild(P);
  const $=id=>P.querySelector('#'+id);
  const zone=()=>{ const R=REPS, Kd=KIND[R.kind]; if(R.kind==='rope')return Math.max(.07,.22-R.n*.004)*(VIT.tired?.6:1); const cap=Math.max(5,FORAGE.ST.str*Kd.cap); return Math.max(.04,Math.min(.4,.22*Math.pow(cap/R.kg,1.1)))*(VIT.tired?.5:1); };
  const draw=()=>{ const R=REPS; if(!R)return; const Kd=KIND[R.kind], st_=Kd.stat, z=zone(); $('grn').textContent=Kd.name+(R.kg?' · '+R.kg+' KG':'');
    $('grz').style.left=((.5-z/2)*100)+'%'; $('grz').style.width=(z*100)+'%';
    $('grt').textContent=(R.pinned?'THE BAR PINS YOU. PRESS SPACE TO WRIGGLE OUT ('+R.pinned+')':(R.kind==='rope'?'SPACE AS THE ROPE PASSES':'SPACE AS THE MARKER CROSSES THE GREEN'))+' · REPS '+R.n+' · '+NM[st_]+' '+FORAGE.ST[st_]+' ('+Math.round(FORAGE.stats.toward(st_)*100)+'% TO THE NEXT)';
    $('grk').innerHTML=Kd.kg?Kd.kg.map(k=>`<button data-kg="${k}" aria-pressed="${k===R.kg}">${k} KG</button>`).join(''):''; };
  P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b&&b.id==='grx')return GYM.stop(); if(b&&b.dataset.kg){ REPS.kg=+b.dataset.kg; REPS.miss=0; draw(); return; } if(e.target.closest('#grb'))press(); });
  const press=()=>{ const R=REPS; if(!R)return; if(R.pinned){ if(--R.pinned<=0){ R.pinned=0; say('YOU WRIGGLE OUT FROM UNDER THE BAR.'); } draw(); return; }
    const z=zone(), hit=Math.abs(R.x-.5)<z/2, Kd=KIND[R.kind];
    if(hit){ R.n++; R.miss=0; if(R.kind==='rope'){ VIT.spend(.012); FORAGE.stats.work('sta',1/110); try{ RIG.act(st,' '); }catch(e){} }
      else{ const cap=Math.max(5,FORAGE.ST.str*Kd.cap); VIT.spend(.025*Math.min(2,R.kg/cap)); FORAGE.stats.work('str',Kd.k*Math.min(1.6,R.kg/cap)/40); if(R.kind==='squat'){ try{ RIG.act(st,'C'); }catch(e){} } }
      SFX.play('clunk',{vol:.35,vary:.2}); }
    else{ R.miss++; SFX.play('thud',{vol:.3,pitch:.7});
      if(R.kind==='rope'){ say('YOU TRIP ON THE ROPE.','#ff9a7a'); GYM.stop(); SHARED.trip=true; return; }
      if(R.miss>=3&&R.kind!=='curl'){ R.pinned=8; R.miss=0; say('YOU FAIL THE REP. THE BAR PINS YOU.','#ff9a7a'); } }
    draw(); };
  addEventListener('keydown',e=>{ if(!REPS||e.key!==' ')return; e.preventDefault(); e.stopImmediatePropagation(); if(!e.repeat)press(); },true);
  GYM.reps=(kind,at)=>{ '@later'; if(TM)offTread(false); if(RAG.on||VIT.out>0||VIT.dead)return; const Kd=KIND[kind]; if(REPS)GYM.stop(true);
    if(kind!=='bench'){ const F=K.F, q=at||(kind==='squat'?[K.rack[0],K.rack[1]+.05]:[17.4,9.8]), p=F.pw(q[0],q[1]), hd=kind==='squat'?F.hd(0,1):kind==='curl'?F.hd(-1,0):F.hd(0,-1); pos.x=p[0]; pos.z=p[1]; SHARED.heading=hd;
      window.RUNNER=MODS.runner={on:true,steer:()=>{ pos.x=p[0]; pos.z=p[1]; SHARED.heading=hd; return [0,0,0]; }}; }
    else if(!st.sit){ const F=K.F, p=F.pw(16.2,2.45); USE.sitAt(p[0],p[1],.5*IKIT.MW,F.hd(0,-1)); }
    REPS={kind,kg:Kd.kg?Kd.kg[Math.max(0,Kd.kg.findIndex(k=>k>=FORAGE.ST.str*(Kd.cap||1)*.6))]:0,x:0,dir:1,n:0,miss:0,pinned:0}; P.hidden=false; draw(); say(Kd.name+': '+(kind==='rope'?'SPACE AS THE ROPE PASSES.':'PICK THE WEIGHT, THEN SPACE IN THE GREEN.')); };
  GYM.stop=quiet=>{ if(TM)offTread(false); if(!REPS)return; const n=REPS.n, nm=KIND[REPS.kind].name; REPS=null; P.hidden=true; window.RUNNER=MODS.runner=null; if(!quiet&&n)say(nm+': '+n+' REPS.'); };
  const repStep=dt=>{ const R=REPS; if(!R)return; if(!inGym()||RAG.on||VIT.out>0||VIT.dead||(R.kind==='bench'&&!st.sit)){ GYM.stop(); return; }
    if(R.kind!=='bench'&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(k=>keys.has(k))&&!R.pinned)return GYM.stop();
    if(R.pinned)return; const sp=R.kind==='rope'?.7+R.n*.02:.55+(KIND[R.kind].kg?R.kg/(Math.max(5,FORAGE.ST.str*KIND[R.kind].cap))*.5:0); R.x+=R.dir*sp*dt; if(R.x>1){ R.x=1; R.dir=-1; } if(R.x<0){ R.x=0; R.dir=1; } $('grm').style.left=(R.x*100)+'%'; };

  /* ---------- THE RING: a blow that would put you out knocks you down instead (VIT.bouts); you come round on your corner's stool. Your body goes loose (the physics body) as you get hurt; a ragdoll that lands past the ropes is out ---------- */
  VIT.bouts.push(()=>inRing());
  let koT=0, pb=null, rag0=false, ringed=false;
  SYS.add('knockout',()=>{ if(!inRing())return; koT=1; RAG.ko=performance.now()+5000; SHARED.trip=true; say('KNOCKED OUT!','#ff9a7a'); },'146zka-gym');
  const ringStep=dt=>{ const on=inRing();
    if(RAG.on!==rag0){ rag0=RAG.on; if(!RAG.on&&ringed&&inGym()&&!on&&!koT)say('RING OUT!','#f2c14e'); if(RAG.on)ringed=on; }
    if(koT&&!RAG.on&&inGym()){ koT=0; const [u,v,du,dv]=K.stools[0], [u2,v2]=uv(pos.x,pos.z), s=(Math.hypot(u-u2,v-v2)<Math.hypot(K.stools[1][0]-u2,K.stools[1][1]-v2))?K.stools[0]:K.stools[1], p=K.F.pw(s[0]+s[2]*.5,s[1]+s[3]*.5); pos.x=p[0]; pos.z=p[1]; SHARED.heading=K.F.hd(s[2],s[3]); VIT.heal(.5-VIT.hp>0?.5-VIT.hp:0); say('YOU COME ROUND IN YOUR CORNER.'); }
    if(on&&!pb){ pb={on:PB.on,loose:PB.loose}; PB.on=true; if(!PB.ready&&PB.load)PB.load(); }
    if(!on&&pb&&!RAG.on){ PB.on=pb.on; PB.loose=pb.loose; pb=null; }
    if(pb)PB.loose=Math.min(1,.25+.7*(1-VIT.hp));
    if(on&&VIT.fight>0)FORAGE.stats.work('sta',dt/900); };

  SYS.add('life',dt=>{ if(!K)return; treadStep(dt); bagStep(dt); repStep(dt); ringStep(dt); },'146zka-gym');
  window.GYMDBG=()=>({built:!!K,inside:inGym(),mirror:!!(K&&K.mirror&&K.mirror.isReflector&&K.mirror.parent),ring:inRing(),tread:TM?{i:TM.t.i,pace:TM.t.pace}:null,reps:REPS?{kind:REPS.kind,kg:REPS.kg,n:REPS.n,pinned:REPS.pinned}:null,bags:K?K.bags.map(b=>+b.a.toFixed(3)):null,st:{...FORAGE.ST},toward:{str:FORAGE.stats.toward('str'),sta:FORAGE.stats.toward('sta')},pb:PB.on,loose:PB.loose,uv:K?uv(pos.x,pos.z).map(v=>+v.toFixed(2)):null});
  GYM.press=press; GYM.zone=()=>REPS?zone():0; GYM.K=()=>K; GYM.R=()=>REPS;   // (for the check)
}

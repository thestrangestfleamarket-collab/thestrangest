// THE BREAKOUT: BREAK — some nights things crawl up the castle stair from the dungeon (slimes, radioactive spiders); the guardians close in and fight them with what they carry (blades and spears strike, bows shoot, staves cast), and your strikes land on them too.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FORAGE, INV, LINES, MAIL, PARK, pos, VIT} from './003b-systems.js';
import {scene} from './004-main.js';
import {CASTLE, MAPG, MODS, SYS, TILE, ZU} from './006-map-pre.js';
import {GUARD} from './146j-guardians.js';
const BREAK={list:[]}; window.BREAK=BREAK;
if(!GUARD.shelved)PARK.later(()=>{ '@park'; const T=TILE, PI=Math.PI, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, MH=T/.84, MV=ZU*24/.84, grp=MAPG.park||scene, S=CASTLE.stair, gnd=(x,z)=>MODS.bodega.ground(x,z);
  const h3=(a,b,c)=>{ const q=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return q-Math.floor(q); }, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc');
  const TOP={x:X((S.x0+S.x1)/2),z:Z(S.y1+.4)};
  // the crawlers: a slime that hops (squashes as it lands, stretches as it leaves) and a spider that walks on eight legs in two sets of four
  const KIND={slime:{hp:3,v:.55,dmg:.03,r:.22,reach:.5},spider:{hp:4,v:.95,dmg:.045,r:.28,reach:.6}};
  const slimeMesh=c=>{ const g=new THREE.Group(), body=new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),new THREE.MeshLambertMaterial({color:c,transparent:true,opacity:.78})), core=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(.5)}));
    body.position.y=.22; core.position.y=.2; g.add(body,core); for(const sx of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:0x101010})); e.position.set(sx*.08,.3,.19); g.add(e); } g.userData.body=body; return g; };
  const spiderMesh=()=>{ const g=new THREE.Group(), dark=new THREE.MeshLambertMaterial({color:0x1c2018}), glow=new THREE.MeshBasicMaterial({color:0x7aff3a});
    const ab=new THREE.Mesh(new THREE.SphereGeometry(.2,14,10),dark); ab.scale.set(1,.8,1.25); ab.position.set(0,.24,-.22); const th=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),dark); th.position.set(0,.2,.05);
    const mk=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),glow); mk.position.set(0,.38,-.24); mk.scale.set(1,.4,1.4); g.add(ab,th,mk); for(const sx of [-1,1])for(const k of [0,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(.022,6,4),glow); e.position.set(sx*(.03+k*.04),.25+k*.02,.16); g.add(e); }
    const legs=[]; for(let i=0;i<8;i++){ const sx=i<4?-1:1, k=i%4, a=new THREE.Group(); a.position.set(sx*.08,.2,.1-k*.07); const up=new THREE.Mesh(new THREE.CylinderGeometry(.014,.018,.24,5),dark); up.position.y=.12; up.rotation.z=0;
      const kn=new THREE.Group(); kn.position.y=.24; const lo=new THREE.Mesh(new THREE.CylinderGeometry(.008,.014,.3,5),dark); lo.position.y=-.15; kn.add(lo); up.add(kn); a.add(up); a.userData={sx,k,up,kn}; g.add(a); legs.push(a); }
    g.userData.legs=legs; return g; };
  const make=(kind,i)=>{ const K=KIND[kind], g=kind==='slime'?slimeMesh([0x5ce04a,0x3fa2ff,0xb058ff][i%3]):spiderMesh(); g.scale.set(MH,MV,MH); grp.add(g);
    const a=(i/6)*PI*2, c={kind,K,g,x:TOP.x+Math.cos(a)*.6*T,z:TOP.z+Math.sin(a)*.6*T,h:0,hp:K.hp,ph:Math.random()*6,dead:false,t:0,cool:0,byYou:false,flash:0}; BREAK.list.push(c); return c; };
  const kill=c=>{ c.dead=true; c.t=0; const p=new THREE.Vector3(c.x,c.g.position.y+.2*MV,c.z); GUARD.chipsAt&&GUARD.chipsAt(p,8,c.kind==='slime'?0x5ce04a:0x2a3020); 
    if(c.byYou){ SYS.run('slain',{kind:c.kind,lvl:1}); const n=2+Math.floor(Math.random()*5); INV.cash+=n; say((c.kind==='slime'?'THE SLIME BURSTS':'THE SPIDER CURLS UP')+'. YOU PICK UP $'+n+'.','#f2c14e'); FORAGE.draw&&FORAGE.draw(); } };
  const hurt=(c,d,you)=>{ if(c.dead)return; c.hp-=d; c.flash=.15; if(you)c.byYou=true; if(c.hp<=0)kill(c); };
  BREAK.hurt=hurt;
  // a wave: on the clock, so every player sees the same nights (about one night in two, sometime between nine and one)
  const waveAt=day=>h3(day,3,7)<.55?21+h3(day,5,9)*4:null; let lastWave=-1;
  BREAK.wave=(n)=>{ n=n||3+Math.floor(Math.random()*4); for(let i=0;i<n;i++)make(Math.random()<.55?'slime':'spider',i); BREAK.on=true; const near=Math.hypot(pos.x-TOP.x,pos.z-TOP.z)<40*T; if(near)say('SOMETHING IS COMING UP THE CASTLE STAIR!','#ff8a6a'); };
  const nearest=(x,z,max)=>{ let b=null, bd=max; for(const c of BREAK.list){ if(c.dead)continue; const d=Math.hypot(c.x-x,c.z-z); if(d<bd){ bd=d; b=c; } } return b&&{c:b,d:bd}; };
  // a guardian in the fight: closes to striking distance and swings in time (melee), or keeps its distance and shoots (bow) or casts (staff)
  const bolts=[], boltG=new THREE.SphereGeometry(.06,10,8);
  const cast=(N,c,col)=>{ const m=new THREE.Mesh(boltG,new THREE.MeshBasicMaterial({color:col})); m.scale.set(MH,MV,MH); m.position.copy(N.g.position); m.position.y+=N.gd.m*.8*MV; grp.add(m); bolts.push({m,c,t:0});  };
  const ctl=(dt,s,A,N)=>{ const R=N.gd, tgt=nearest(s.x,s.z,(N.grip==='bow'?16:R.w&&/staff|wand/.test(R.w)?12:9)*T); if(!tgt){ if(N.inFight){ N.inFight=false; A.mv=null; N.going=true; s.to={x:s.home.x,z:s.home.z}; s.hold=false; } return false; }
    N.inFight=true; const c=tgt.c, d=tgt.d; s.hold=false; A.act='';
    if(N.grip==='bow'){ s.to=null; s.face={x:c.x,z:c.z}; if(!A.mv){ if((N.cd=(N.cd??0)-dt)<=0)A.mv={k:'draw',t:0,hit:false}; return true; }
      const q=GUARD.MOVE.draw; if(!A.mv.hit&&A.mv.t/q.T>=q.hit){ A.mv.hit=true; const lead=d/(18*MH)*.9, to=new THREE.Vector3(c.x+Math.sin(c.h)*c.K.v*T*lead,c.g.position.y+.2*MV,c.z+Math.cos(c.h)*c.K.v*T*lead);
        GUARD.loose(N,to,.05,p=>{ for(const k of BREAK.list)if(!k.dead&&Math.hypot((p.x-k.x)/MH,(p.y-k.g.position.y-.2*MV)/MV,(p.z-k.z)/MH)<k.K.r+.05){ hurt(k,1.5); return true; } return false; }); }
      if(A.mv.t>=q.T){ A.mv=null; N.cd=.4+Math.random(); } return true; }
    if(R.w&&/staff|wand/.test(R.w)&&R.w!=='staff'){ s.to=null; s.face={x:c.x,z:c.z}; if((N.cd=(N.cd??0)-dt)<=0){ N.cd=1.6+Math.random(); A.act='raise'; A.t=0; cast(N,c,new THREE.Color(R.wc||R.gem||'#9ad0ff').getHex()); } return true; }
    const melee=['sword','glowsword','greatsword','spear','axe','mace','staff','lantern','bamboo'].includes(R.w); if(!melee){ s.to=null; s.face={x:c.x,z:c.z}; return true; }
    const reach=(R.w==='spear'?.95:R.w==='greatsword'?.8:.6)*MH*(R.bulk||1)+c.K.r*MH;
    if(!A.mv){ if(d>reach){ s.to={x:c.x,z:c.z}; s.v0=s.v0||s.v; s.v=s.v0*2.2; return true; } s.to=null; s.face={x:c.x,z:c.z}; if((N.cd=(N.cd??0)-dt)>0)return true;
      A.mv={k:R.w==='spear'?'thrust':['slash','back','overhead','thrust'][Math.floor(Math.random()*4)],t:0,hit:false,c}; return true; }
    s.to=null; s.face={x:A.mv.c.x,z:A.mv.c.z}; const q=GUARD.MOVE[A.mv.k];
    if(!A.mv.hit&&A.mv.t/q.T>=q.hit){ A.mv.hit=true; const k=A.mv.c; if(!k.dead&&Math.hypot(k.x-s.x,k.z-s.z)<reach*1.2){ hurt(k,A.mv.k==='overhead'?2:1.2); const l=Math.hypot(k.x-s.x,k.z-s.z)||1; k.kb={x:(k.x-s.x)/l*.8*T,z:(k.z-s.z)/l*.8*T};  } }
    if(A.mv.t>=q.T){ A.mv=null; N.cd=.3+Math.random()*.6; if(s.v0)s.v=s.v0; } return true; };
  SYS.add('life',dt=>{ const day=window.MAIL&&MAIL.ready?MAIL.day():Math.floor(Date.now()/864e5), h=CLOCK.h??12, w=waveAt(day);
    if(w!=null&&lastWave!==day&&((h>=w&&h<w+1)||(w>=24&&h>=w-24&&h<w-23))){ lastWave=day; if(PARK.ready)BREAK.wave(); }
    if(!BREAK.list.length)return; if(!PARK.in&&!BREAK.list.some(c=>!c.dead))return;
    for(const N of GUARD.list){ if(N.mode==='home'||N.gd.inside||N.gd.perch&&N.gd.perch!=='wall')continue; const t=nearest(N.st.x,N.st.z,16*T); if(t&&!N.ctl)N.ctl=ctl; }
    const you={x:pos.x,z:pos.z}, alive=!VIT.dead&&SHARED.LVL==='up', ST=window.STRIKES, SK=alive&&ST?ST.strikes():[];
    for(const b of bolts){ b.t+=dt; const c=b.c, ty=c.g.position.y+.2*MV, dx=c.x-b.m.position.x, dy=ty-b.m.position.y, dz=c.z-b.m.position.z, l=Math.hypot(dx,dy,dz), v=9*MH*dt;
      if(l<v||c.dead){ if(!c.dead)hurt(c,1.6); b.t=9; } else b.m.position.set(b.m.position.x+dx/l*v,b.m.position.y+dy/l*v,b.m.position.z+dz/l*v); }
    for(let i=bolts.length-1;i>=0;i--)if(bolts[i].t>3){ bolts[i].m.removeFromParent(); bolts[i].m.material.dispose(); bolts.splice(i,1); }
    for(const c of BREAK.list){ c.t+=dt; if(c.dead)continue; const K=c.K;
      for(const s of SK)if(ST.inCone(s,c.x,c.z,c.g.position.y,.3*T)){ hurt(c,s.d*ST.strength(s),true); ST.landed(s); const l=Math.hypot(c.x-you.x,c.z-you.z)||1; c.kb={x:(c.x-you.x)/l*T*(s.kb||1),z:(c.z-you.z)/l*T*(s.kb||1)}; }
      if(c.dead)continue;
      // its target: the nearest guardian out on watch, or you
      let tx=null, tz=null, td=1e9, tN=null; for(const N of GUARD.list){ if(N.mode==='home'||!N.g.visible||N.gd.inside||N.gd.perch)continue; const d=Math.hypot(N.st.x-c.x,N.st.z-c.z); if(d<td){ td=d; tx=N.st.x; tz=N.st.z; tN=N; } }
      const dy=Math.hypot(you.x-c.x,you.z-c.z); if(alive&&dy<td&&dy<12*T){ td=dy; tx=you.x; tz=you.z; tN=null; }
      if(c.kb){ const nx=c.x+c.kb.x*dt*4, nz=c.z+c.kb.z*dt*4; c.x=nx; c.z=nz; c.kb.x*=.8; c.kb.z*=.8; if(Math.abs(c.kb.x)+Math.abs(c.kb.z)<.01)c.kb=null; }
      if(tx!=null){ const want=Math.atan2(tx-c.x,tz-c.z); c.h+=((((want-c.h)%(2*PI))+3*PI)%(2*PI)-PI)*Math.min(1,dt*5); const reach=(K.reach+.2)*MH;
        if(td>reach){ const step=K.v*T*dt*(c.kind==='slime'?Math.max(0,Math.sin(c.ph))*1.8:1); c.x+=Math.sin(c.h)*step; c.z+=Math.cos(c.h)*step; }
        else if((c.cool-=dt)<=0){ c.cool=1.4+Math.random(); if(!tN&&alive){ VIT.hurt(K.dmg,{x:c.x,z:c.z}); } else if(tN){ tN.A.act='scan'; }  } }
      // the body: the slime squashes and stretches on its hop, the spider's legs step in two sets
      c.ph+=dt*(c.kind==='slime'?6:11); const g=c.g, y=gnd(c.x,c.z); g.position.set(c.x,y,c.z); g.rotation.y=c.h;
      if(c.kind==='slime'){ const hop=Math.max(0,Math.sin(c.ph)), sq=1-.25*Math.max(0,-Math.sin(c.ph)); g.position.y=y+hop*.18*MV; g.userData.body.scale.set(1/Math.sqrt(sq),sq*(1+.15*hop),1/Math.sqrt(sq)); }
      else for(const L of g.userData.legs){ const {sx,k,up,kn}=L.userData, set=(k+(sx<0?0:1))%2, ph=c.ph+set*PI, lift=Math.max(0,Math.sin(ph))*.5, sw=Math.cos(ph)*.35;
        L.rotation.set(0,sx*(-.3+k*.25)+sw*.0,0); up.rotation.set(0,0,sx*(-1.0+lift*.4)); up.rotation.x=sw*.5; kn.rotation.set(0,0,sx*(1.9-lift*.5)); }
      if(c.flash>0){ c.flash-=dt; g.visible=c.flash%.08>.04; } else g.visible=true; }
    for(let i=BREAK.list.length-1;i>=0;i--){ const c=BREAK.list[i]; if(c.dead){ c.g.scale.multiplyScalar(Math.max(.8,1-dt*6)); if(c.t>.6){ c.g.removeFromParent(); c.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); BREAK.list.splice(i,1); } } }
    if(BREAK.on&&!BREAK.list.length){ BREAK.on=false; if(Math.hypot(pos.x-TOP.x,pos.z-TOP.z)<30*T){ say('THE STAIR IS QUIET AGAIN.','#b8f0a0'); const best=GUARD.list.find(N=>N.key==='gd_captain'); if(best&&!best.far)LINES.say(best,'Well fought. Back to your posts.'); } } },'146k-breakout');
  window.BREAKDBG=()=>BREAK.list.map(c=>({kind:c.kind,hp:+c.hp.toFixed(1),dead:c.dead,x:+c.x.toFixed(1),z:+c.z.toFixed(1)})); });

// THE BREAKOUT: BREAK — some nights creatures of the published dungeon come up the castle stair (one fight for everyone: the shared sim's keep, worker/dunmobs.js); the guardians close in and fight them with what they carry (blades and spears strike, bows shoot, staves cast), and your strikes land on them too.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, GUARD, LINES, MAIL, PARK, pos, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {CASTLE, MAPG, MODS, SYS, TILE, ZU} from './006-map-pre.js';
const BREAK={list:[]}; window.BREAK=BREAK;
if(!GUARD.shelved)PARK.later(()=>{ '@park'; const T=TILE, PI=Math.PI, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, MH=T/.84, MV=ZU*24/.84, grp=MAPG.park||scene, S=CASTLE.stair, gnd=(x,z)=>MODS.bodega.ground(x,z);
  const h3=(a,b,c)=>{ const q=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return q-Math.floor(q); }, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const TOP={x:X((S.x0+S.x1)/2),z:Z(S.y1+.4)};
  const hurt=c=>{ if(c&&!c.dead)c.flash=.15; };   // a guardian's blow as you see it: the sim deals the damage
  BREAK.hurt=hurt;
  // a wave: on the clock, so every player sees the same nights (about one night in two, sometime between nine and one)
  const waveAt=day=>h3(day,3,7)<.55?21+h3(day,5,9)*4:null; let lastWave=-1;
  BREAK.wave=n=>MODS.dunkeep&&MODS.dunkeep.wave(n);
  SYS.add('breakout',n=>{ if(!n)return; BREAK.on=true; if(Math.hypot(pos.x-TOP.x,pos.z-TOP.z)<40*T)say('SOMETHING IS COMING UP THE DUNGEON STAIR!','#ff8a6a'); },'146k-breakout');
  const nearest=(x,z,max)=>{ let b=null, bd=max; for(const c of BREAK.list){ if(c.dead)continue; const d=Math.hypot(c.x-x,c.z-z); if(d<bd){ bd=d; b=c; } } return b&&{c:b,d:bd}; };
  // a guardian in the fight: closes to striking distance and swings in time (melee), or keeps its distance and shoots (bow) or casts (staff)
  const bolts=[], boltG=new THREE.SphereGeometry(.06,10,8);
  const cast=(N,c,col)=>{ const m=new THREE.Mesh(boltG,new THREE.MeshBasicMaterial({color:col})); m.scale.set(MH,MV,MH); m.position.copy(N.g.position); m.position.y+=N.gd.m*.8*MV; grp.add(m); bolts.push({m,c,t:0}); SFX.play&&SFX.play('blip',{vol:.3,pitch:3,at:{x:N.st.x,z:N.st.z},far:12*T}); };
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
    if(!A.mv.hit&&A.mv.t/q.T>=q.hit){ A.mv.hit=true; const k=A.mv.c; if(!k.dead&&Math.hypot(k.x-s.x,k.z-s.z)<reach*1.2){ hurt(k,A.mv.k==='overhead'?2:1.2); const l=Math.hypot(k.x-s.x,k.z-s.z)||1; k.kb={x:(k.x-s.x)/l*.8*T,z:(k.z-s.z)/l*.8*T}; SFX.play&&SFX.play('blade',{vol:.6,vary:.12,at:{x:k.x,z:k.z},far:14*T}); } }
    if(A.mv.t>=q.T){ A.mv=null; N.cd=.3+Math.random()*.6; if(s.v0)s.v=s.v0; } return true; };
  SYS.add('life',dt=>{ const day=window.MAIL&&MAIL.ready?MAIL.day():Math.floor(Date.now()/864e5), h=CLOCK.h??12, w=waveAt(day);
    if(w!=null&&lastWave!==day&&((h>=w&&h<w+1)||(w>=24&&h>=w-24&&h<w-23))){ lastWave=day; if(PARK.ready)BREAK.wave(); }
    BREAK.list=MODS.dunkeep?MODS.dunkeep.list():[]; if(!BREAK.list.length&&!BREAK.on)return; if(!PARK.in&&!BREAK.list.some(c=>!c.dead))return;
    for(const N of GUARD.list){ if(N.mode==='home'||N.gd.inside||N.gd.perch&&N.gd.perch!=='wall'||N.gd.top&&N.grip!=='bow')continue; const t=nearest(N.st.x,N.st.z,16*T); if(t&&!N.ctl)N.ctl=ctl; }
    if(BREAK.list.some(c=>!c.dead))BREAK.seen=true;
    for(const b of bolts){ b.t+=dt; const c=b.c, ty=c.g.position.y+.2*MV, dx=c.x-b.m.position.x, dy=ty-b.m.position.y, dz=c.z-b.m.position.z, l=Math.hypot(dx,dy,dz), v=9*MH*dt;
      if(l<v||c.dead){ if(!c.dead)hurt(c,1.6); b.t=9; } else b.m.position.set(b.m.position.x+dx/l*v,b.m.position.y+dy/l*v,b.m.position.z+dz/l*v); }
    for(let i=bolts.length-1;i>=0;i--)if(bolts[i].t>3){ bolts[i].m.removeFromParent(); bolts[i].m.material.dispose(); bolts.splice(i,1); }
    if(BREAK.on&&BREAK.seen&&!BREAK.list.some(c=>!c.dead)&&PARK.in){ BREAK.on=false; BREAK.seen=false; if(Math.hypot(pos.x-TOP.x,pos.z-TOP.z)<30*T){ say('THE STAIR IS QUIET AGAIN.','#b8f0a0'); const best=GUARD.list.find(N=>N.key==='gd_captain'); if(best&&!best.far)LINES.say(best,'Well fought. Back to your posts.'); } } },'146k-breakout');
  window.BREAKDBG=()=>BREAK.list.map(c=>({kind:c.kind,hp:+c.hp.toFixed(1),dead:c.dead,x:+c.x.toFixed(1),z:+c.z.toFixed(1)})); });
export {BREAK};

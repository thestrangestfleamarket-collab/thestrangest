// THE BRAWL: fights between players (ONLINE): your moving fists, feet and blade against their body parts as drawn, and their blows on you through VIT.hurt.
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, pos, RAG, SFX, st, VIT, W3, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {PPU} from './004-main.js';
import {ASTEP, MODS, SYS, TILE, ZU} from './006-map-pre.js';
import {P, PHYOU, TL} from './073-main-12.js';
import {collide} from './075-main-13.js';
{ const T=TILE, A=new THREE.Vector3(), B=new THREE.Vector3(), C=new THREE.Vector3(), E=new THREE.Vector3(), Q=new THREE.Vector3();
  // the parts a body is hit on: joint to joint, radius in rig units (the figure's own pose, as it is drawn)
  const PARTS=[['headBase','headTop',6.5,'head'],['pelvis','chest',6.2,'body'],['chest','neck',6,'body'],['shoulderL','elbowL',2.6,'arm'],['elbowL','wristL',2.3,'arm'],['shoulderR','elbowR',2.6,'arm'],['elbowR','wristR',2.3,'arm'],
    ['hipL','kneeL',3.6,'leg'],['kneeL','ankleL',3,'leg'],['hipR','kneeR',3.6,'leg'],['kneeR','ankleR',3,'leg'],['ankleL','toeL',2.4,'leg'],['ankleR','toeR',2.4,'leg']];
  const LIMBS={fist:[['wristL',3.2],['wristR',3.2]],foot:[['ballL',3],['ballR',3],['ankleL',3],['ankleR',3]]};
  const sh=(m=W3.SZ)=>m/PPU, sv=(k,m=W3.SZ)=>ZU*m*(k??(W3.BH||1));
  const toW=(j,p,k,out,m)=>{ const lx=j.x*sh(m), lz=j.z*sh(m), c=Math.cos(p.hd), s=Math.sin(p.hd); return out.set(p.x+lx*c+lz*s,p.y+j.y*sv(k,m),p.z-lx*s+lz*c); };
  const segD=(p,a,b)=>{ E.subVectors(b,a); const l2=E.lengthSq(); let t=l2?Q.subVectors(p,a).dot(E)/l2:0; t=Math.max(0,Math.min(1,t)); return Q.copy(a).addScaledVector(E,t).distanceTo(p); };
  const touch=(o,c,r)=>{ const J=o.B&&o.B.J, k=o.fig&&o.fig.body?1:undefined, m=W3.BASE*(o.x&&+o.x.sz||1); if(!J)return null;
    for(const [a,b,rr,part] of PARTS){ if(!J[a]||!J[b])continue; toW(J[a],o.p,k,A,m); toW(J[b],o.p,k,B,m); if(segD(c,A,B)<r+rr*sh(m))return part; } return null; };

  /* ---------- your blows: each strike STRIKES gives is live for a moment; whichever of your fists, feet or blade touches a body part lands once on that player ---------- */
  let live=[];
  const mine=(kind,J)=>{ '@later'; const me={x:pos.x,y:SHARED.py,z:pos.z,hd:SHARED.heading}, out=[];
    if(kind==='blade'){ const h=st.hand==='L'?'L':'R'; if(!J['wrist'+h]||!J['elbow'+h])return out; toW(J['wrist'+h],me,undefined,A); toW(J['elbow'+h],me,undefined,B); C.subVectors(A,B).normalize();
      for(let i=1;i<=5;i++)out.push([A.clone().addScaledVector(C,i*.19*T),.07]); return out; }
    for(const [j,r] of LIMBS[kind])if(J[j])out.push([toW(J[j],me,undefined,new THREE.Vector3()),r*sh()]); return out; };
  const swing=dt=>{ const now=performance.now(), S=MODS.strikes; if(!S||!ONLINE.others.size)return;
    for(const s of S.strikes())live.push({s,kind:s.sk==='sword'?'blade':s.r>1.05*T?'foot':'fist',until:now+(s.sk==='sword'?220:320),n:0,hit:new Set()});
    if(RAG.on||VIT.out>0||VIT.dead){ live=[]; return; } live=live.filter(l=>l.until>now||l.n<3); if(!live.length)return; const J=ASTEP.you.B&&ASTEP.you.B.J; if(!J)return;
    for(const l of live){ l.n++; const pts=mine(l.kind,J);
      for(const o of ONLINE.others.values()){ if(o.why!=='near you'||!o.p||o.dead||l.hit.has(o.id)||carry&&carry.id===o.id||thrown.id===o.id&&now<thrown.until)continue; let part=null;
        for(const [c,r] of pts)if((part=touch(o,c,r)))break;
        if(part){ l.hit.add(o.id); const s=l.s; S.landed(s); o.flashT=now+130; SFX.play('thud',{vol:.55,pitch:1.35,vary:.15}); ONLINE.send({t:'hit',to:o.id,d:+(.05*s.d*S.strength(s)*(part==='head'?1.3:1)).toFixed(3),kb:s.kb||(l.kind==='foot'?1.5:1),heavy:!!s.heavy,k:l.kind}); } } } };

  /* ---------- their blows on you: VIT.hurt (guard, parry, armour, death) as from any foe; a shove and a flinch, or down into the ragdoll ---------- */
  let shove=null, recent=[], wasRag=false, parT=0; const last={};
  const busy=()=>RAG.on||VIT.out>0||VIT.dead||st.climb||st.hang||st.ride||st.sit||(st.water&&st.water.in);
  const flinch=()=>{ if(busy())return; try{ RIG.begin(st,'flinch'); SYS.run('act','flinch'); }catch(e){} };
  const facing=f=>{ const dx=f.x-pos.x, dz=f.z-pos.z, l=Math.hypot(dx,dz)||1; return (dx*Math.sin(SHARED.heading)+dz*Math.cos(SHARED.heading))/l>.2; };
  ONLINE.hear.hit=m=>{ '@later'; const now=performance.now(), o=ONLINE.others.get(m.id), f=Array.isArray(m.from)?{x:+m.from[0],z:+m.from[1]}:o&&o.p; if(!f||now-(last[m.id]||0)<150)return; last[m.id]=now;
    const blocked=!!WIELD.block&&facing(f), r=VIT.hurt(Math.max(0,Math.min(.5,+m.d||0)),f); if(r===2){ ONLINE.send({t:'parried',to:m.id}); return; } if(!r||VIT.dead||VIT.out>0||RAG.on)return;   // down already: it hurts, it doesn't keep you down
    recent=recent.filter(t=>now-t<2000); recent.push(now); const dx=pos.x-f.x, dz=pos.z-f.z, l=Math.hypot(dx,dz)||1, kb=Math.max(0,Math.min(3,+m.kb||1))*(blocked?.4:1);
    if(busy())return;
    if(!blocked&&(m.heavy||recent.length>=3||(m.k==='foot'&&shove&&now-shove.at<700))){ recent=[]; RAG.ko=now+2500; PHYOU.hitN=[-dx/l,dz/l,0]; PHYOU.hit=30*Math.min(3,1.5+kb*.5); return; }
    shove={x:dx/l*kb*.35*T/.2,z:dz/l*kb*.35*T/.2,t:.2,at:now}; if(!blocked)flinch(); };
  SYS.add('hurt',(d,from)=>{ if(!from||busy()||(WIELD.block&&facing(from)))return; const dx=pos.x-from.x, dz=pos.z-from.z, l=Math.hypot(dx,dz)||1;   // any blow from somewhere (a creature, a player) jolts you back a step
    shove={x:dx/l*.25*T/.2,z:dz/l*.25*T/.2,t:.2,at:performance.now()}; flinch(); },'146h-brawl');
  ONLINE.hear.parried=()=>{ const now=performance.now(); if(now-parT<400)return; parT=now; flinch(); SAY('PARRIED!','#ffd27a'); };

  /* ---------- held down or carried: mash any key to break free ---------- */
  let mash=0, told=false;
  const pinned=()=>RAG.on&&!VIT.dead&&!(VIT.out>0)&&(RAG.held||RAG.ko>performance.now());
  addEventListener('keydown',e=>{ if(e.repeat||!pinned())return; if((mash+=1)<6)return; mash=0;
    if(RAG.held){ ONLINE.send({t:'free',to:RAG.held.by}); RAG.held=null; RAG.toss=[(Math.random()-.5)*.6,(Math.random()-.5)*.6]; } RAG.ko=0; SAY('YOU BREAK FREE.','#7dffa4'); });
  const struggle=dt=>{ mash=Math.max(0,mash-dt*1.5); const p=pinned(); if(p&&!told&&RAG.held&&SAY)SAY('MASH ANY KEY TO BREAK FREE.','#ffd27a'); told=p&&!!RAG.held; };

  /* ---------- your ragdoll for everyone: the bodies' joint offsets when you go down, then ten times a second their places and turns ---------- */
  let ragT=0, onT=0; const r2=v=>Math.round(v*100)/100, r3=v=>Math.round(v*1000)/1000;
  const ragSend=dt=>{ if(!RAG.on||!RAG.bodies.length)return; if(!wasRag||(onT-=dt)<=0){ ragT=0; onT=2; ONLINE.send({t:'ragon',n:RAG.bodies.map(b=>b.name),jl:RAG.bodies.map(b=>Object.entries(b.jl).map(([k,l])=>[k,r3(l[0]),r3(l[1]),r3(l[2])]))}); }
    if((ragT-=dt)>0)return; ragT=.1; ONLINE.send({t:'rag',o:[r2(P.x),r2(P.y)],hd:r3(Math.atan2(Math.sin(RAG.hd),Math.cos(RAG.hd))),b:RAG.bodies.map(b=>[r2(b.x[0]),r2(b.x[1]),r2(b.x[2]),r3(b.q[0]),r3(b.q[1]),r3(b.q[2]),r3(b.q[3])])}); };

  /* ---------- grab, carry and throw: double-click a player who is down to pick them up (they hang from your hands, held by their own ragdoll); punch to throw, double-click to put them down ---------- */
  let carry=null, thrown={id:'',until:0};
  const letGo=(toss,quiet)=>{ '@later'; if(!carry)return; const id=carry.id; carry=null; try{ RIG.release(st,'carry'); }catch(e){} SYS.run('act','carry',0); if(quiet)return;
    if(toss){ thrown={id,until:performance.now()+900}; const h=SHARED.heading; ONLINE.send({t:'toss',to:id,v:[r2(Math.sin(h)*1.2),r2(-Math.cos(h)*1.2)]}); } else ONLINE.send({t:'drop',to:id}); };
  ONLINE.use=o=>{ '@later'; if(carry&&carry.id===o.id)return letGo(false); if(VIT.dead||VIT.out>0||RAG.on||o.dead)return; if(!(o.rag&&o.rag.b&&performance.now()-o.rag.t<3000)){ if(ONLINE.useUp)return ONLINE.useUp(o); SAY((o.name||'TENANT')+' IS STANDING. KNOCK THEM DOWN FIRST.'); return; }
    if(carry)letGo(false); carry={id:o.id,t:0}; try{ RIG.act(st,'carry'); }catch(e){} SYS.run('act','carry',1); ONLINE.send({t:'grab',to:o.id}); };
  SYS.add('act',(k,on)=>{ if(carry&&k==='J'&&on)letGo(true); },'146h-brawl');
  const carrying=dt=>{ if(!carry)return; const o=ONLINE.others.get(carry.id);
    if(!o||o.why!=='near you'||!(o.rag&&o.rag.b&&performance.now()-o.rag.t<3000)||RAG.on||VIT.out>0||VIT.dead||Math.hypot(o.rag.o[0]*TL-pos.x,-o.rag.o[1]*TL-pos.z)>6*T)return letGo(false);
    if((carry.t-=dt)<=0){ carry.t=1; ONLINE.send({t:'grab',to:carry.id}); } };
  ONLINE.hear.grab=m=>{ if(RAG.on&&ONLINE.others.has(m.id))RAG.held={by:m.id,at:performance.now()}; };
  ONLINE.hear.drop=m=>{ if(RAG.held&&RAG.held.by===m.id)RAG.held=null; };
  ONLINE.hear.free=m=>{ if(carry&&carry.id===m.id){ const o=ONLINE.others.get(m.id); letGo(false,true); SAY((o&&o.name||'TENANT')+' BREAKS FREE.'); } };
  ONLINE.hear.toss=m=>{ if(!RAG.on||!RAG.held||RAG.held.by!==m.id)return; RAG.held=null; const v=Array.isArray(m.v)?m.v:[0,0]; RAG.toss=[Math.max(-2,Math.min(2,+v[0]||0)),Math.max(-2,Math.min(2,+v[1]||0))]; };

  SYS.add('life',dt=>{ swing(dt); ragSend(dt); carrying(dt); struggle(dt);
    if(shove&&shove.t>0&&!busy()){ const k=Math.min(dt,shove.t); pos.x+=shove.x*k; pos.z+=shove.z*k; shove.t-=k; collide(pos); }
    if(RAG.on!==wasRag){ wasRag=RAG.on; if(RAG.on)SYS.run('act','F',1); else ONLINE.send({t:'ragoff'}); } },'146h-brawl'); }

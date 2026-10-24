// THE BRAWL: fights between players (ONLINE): your moving fists, feet and blade against their body parts as drawn, and their blows on you through VIT.hurt.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, ONLINE, pos, RAG, st, VIT, W3} from './003b-systems.js';
import {PPU} from './004-main.js';
import {ASTEP, SYS, TILE, ZU} from './006-map-pre.js';
import {P, PHYOU} from './073-main-12.js';
import {collide} from './075-main-13.js';
{ const T=TILE, A=new THREE.Vector3(), B=new THREE.Vector3(), C=new THREE.Vector3(), E=new THREE.Vector3(), Q=new THREE.Vector3();
  // the parts a body is hit on: joint to joint, radius in rig units (the figure's own pose, as it is drawn)
  const PARTS=[['headBase','headTop',6.5,'head'],['pelvis','chest',6.2,'body'],['chest','neck',6,'body'],['shoulderL','elbowL',2.6,'arm'],['elbowL','wristL',2.3,'arm'],['shoulderR','elbowR',2.6,'arm'],['elbowR','wristR',2.3,'arm'],
    ['hipL','kneeL',3.6,'leg'],['kneeL','ankleL',3,'leg'],['hipR','kneeR',3.6,'leg'],['kneeR','ankleR',3,'leg'],['ankleL','toeL',2.4,'leg'],['ankleR','toeR',2.4,'leg']];
  const LIMBS={fist:[['wristL',3.2],['wristR',3.2]],foot:[['ballL',3],['ballR',3],['ankleL',3],['ankleR',3]]};
  const sh=()=>W3.SZ/PPU, sv=k=>ZU*W3.SZ*(k??(W3.BH||1));
  const toW=(j,p,k,out)=>{ const lx=j.x*sh(), lz=j.z*sh(), c=Math.cos(p.hd), s=Math.sin(p.hd); return out.set(p.x+lx*c+lz*s,p.y+j.y*sv(k),p.z-lx*s+lz*c); };
  const segD=(p,a,b)=>{ E.subVectors(b,a); const l2=E.lengthSq(); let t=l2?Q.subVectors(p,a).dot(E)/l2:0; t=Math.max(0,Math.min(1,t)); return Q.copy(a).addScaledVector(E,t).distanceTo(p); };
  const touch=(o,c,r)=>{ const J=o.B&&o.B.J, k=o.fig&&o.fig.body?1:undefined; if(!J)return null;
    for(const [a,b,rr,part] of PARTS){ if(!J[a]||!J[b])continue; toW(J[a],o.p,k,A); toW(J[b],o.p,k,B); if(segD(c,A,B)<r+rr*sh())return part; } return null; };

  /* ---------- your blows: each strike STRIKES gives is live for a moment; whichever of your fists, feet or blade touches a body part lands once on that player ---------- */
  let live=[];
  const mine=(kind,J)=>{ const me={x:pos.x,y:SHARED.py,z:pos.z,hd:SHARED.heading}, out=[];
    if(kind==='blade'){ if(!J.wristR||!J.elbowR)return out; toW(J.wristR,me,undefined,A); toW(J.elbowR,me,undefined,B); C.subVectors(A,B).normalize();
      for(let i=1;i<=5;i++)out.push([A.clone().addScaledVector(C,i*.19*T),.07]); return out; }
    for(const [j,r] of LIMBS[kind])if(J[j])out.push([toW(J[j],me,undefined,new THREE.Vector3()),r*sh()]); return out; };
  const swing=dt=>{ const now=performance.now(), S=window.STRIKES; if(!S||!ONLINE.others.size)return;
    for(const s of S.strikes())live.push({s,kind:s.sk==='sword'?'blade':s.r>1.05*T?'foot':'fist',until:now+(s.sk==='sword'?220:320),n:0,hit:new Set()});
    live=live.filter(l=>l.until>now||l.n<3); if(!live.length||RAG.on||VIT.out>0)return; const J=ASTEP.you.B&&ASTEP.you.B.J; if(!J)return;
    for(const l of live){ l.n++; const pts=mine(l.kind,J);
      for(const o of ONLINE.others.values()){ if(o.why!=='near you'||!o.p||l.hit.has(o.id))continue; let part=null;
        for(const [c,r] of pts)if((part=touch(o,c,r)))break;
        if(part){ l.hit.add(o.id); const s=l.s; S.landed(s); ONLINE.send({t:'hit',to:o.id,d:+(.05*s.d*S.strength(s)*(part==='head'?1.3:1)).toFixed(3),kb:s.kb||(l.kind==='foot'?1.5:1),heavy:!!s.heavy,k:l.kind}); } } } };

  /* ---------- their blows on you: VIT.hurt (guard, parry, armour, death) as from any foe; a shove and a flinch, or down into the ragdoll ---------- */
  let shove=null, recent=[], wasRag=false; const last={};
  const flinch=()=>{ if(RAG.on||VIT.out>0)return; try{ RIG.begin(st,'flinch'); SYS.run('act','flinch'); }catch(e){} };
  ONLINE.hear.hit=m=>{ const now=performance.now(), o=ONLINE.others.get(m.id), f=Array.isArray(m.from)?{x:+m.from[0],z:+m.from[1]}:o&&o.p; if(!f||now-(last[m.id]||0)<150)return; last[m.id]=now;
    const r=VIT.hurt(Math.max(0,Math.min(.5,+m.d||0)),f); if(r===2){ ONLINE.send({t:'parried',to:m.id}); return; } if(!r)return;
    recent=recent.filter(t=>now-t<2000); recent.push(now); const dx=pos.x-f.x, dz=pos.z-f.z, l=Math.hypot(dx,dz)||1, kb=Math.max(0,Math.min(3,+m.kb||1));
    if(VIT.dead)return;
    if(m.heavy||recent.length>=3||(m.k==='foot'&&shove&&now-shove.at<700)){ recent=[]; RAG.ko=now+2500; PHYOU.hitN=[-dx/l,dz/l,0]; PHYOU.hit=30*Math.min(3,1.5+kb*.5); return; }
    shove={x:dx/l*kb*.35*T/.2,z:dz/l*kb*.35*T/.2,t:.2,at:now}; flinch(); };
  ONLINE.hear.parried=()=>{ flinch(); if(FORAGE.say)FORAGE.say('PARRIED!','#ffd27a'); };

  /* ---------- your ragdoll for everyone: the bodies' joint offsets when you go down, then ten times a second their places and turns ---------- */
  let ragT=0; const r2=v=>Math.round(v*100)/100, r3=v=>Math.round(v*1000)/1000;
  const ragSend=dt=>{ if(!RAG.on||!RAG.bodies.length)return; if(!wasRag){ ragT=0; ONLINE.send({t:'ragon',n:RAG.bodies.map(b=>b.name),jl:RAG.bodies.map(b=>Object.entries(b.jl).map(([k,l])=>[k,r3(l[0]),r3(l[1]),r3(l[2])]))}); }
    if((ragT-=dt)>0)return; ragT=.1; ONLINE.send({t:'rag',o:[r2(P.x),r2(P.y)],hd:r3(RAG.hd),b:RAG.bodies.map(b=>[r2(b.x[0]),r2(b.x[1]),r2(b.x[2]),r3(b.q[0]),r3(b.q[1]),r3(b.q[2]),r3(b.q[3])])}); };

  /* ---------- grab, carry and throw: double-click a player who is down to pick them up (they hang from your hands, held by their own ragdoll); punch to throw, double-click to put them down ---------- */
  let carry=null;
  const letGo=(toss)=>{ if(!carry)return; const id=carry.id; carry=null; try{ RIG.release(st,'carry'); }catch(e){} SYS.run('act','carry',0);
    if(toss){ const h=SHARED.heading; ONLINE.send({t:'toss',to:id,v:[r2(Math.sin(h)*1.2),r2(-Math.cos(h)*1.2)]}); } else ONLINE.send({t:'drop',to:id}); };
  ONLINE.use=o=>{ if(carry&&carry.id===o.id)return letGo(false); if(!(o.rag&&o.rag.b&&performance.now()-o.rag.t<3000)){ if(FORAGE.say)FORAGE.say((o.name||'TENANT')+' IS STANDING. KNOCK THEM DOWN FIRST.'); return; }
    if(carry)letGo(false); carry={id:o.id,t:0}; try{ RIG.act(st,'carry'); }catch(e){} SYS.run('act','carry',1); ONLINE.send({t:'grab',to:o.id}); };
  SYS.add('act',(k,on)=>{ if(carry&&k==='J'&&on)letGo(true); },'146h-brawl');
  const carrying=dt=>{ if(!carry)return; const o=ONLINE.others.get(carry.id);
    if(!o||!(o.rag&&o.rag.b&&performance.now()-o.rag.t<3000)||RAG.on||VIT.out>0)return letGo(false);
    if((carry.t-=dt)<=0){ carry.t=1; ONLINE.send({t:'grab',to:carry.id}); } };
  ONLINE.hear.grab=m=>{ if(RAG.on&&ONLINE.others.has(m.id))RAG.held={by:m.id,at:performance.now()}; };
  ONLINE.hear.drop=m=>{ if(RAG.held&&RAG.held.by===m.id)RAG.held=null; };
  ONLINE.hear.toss=m=>{ if(!RAG.on)return; if(RAG.held&&RAG.held.by===m.id)RAG.held=null; const v=Array.isArray(m.v)?m.v:[0,0]; RAG.toss=[Math.max(-2,Math.min(2,+v[0]||0)),Math.max(-2,Math.min(2,+v[1]||0))]; };

  SYS.add('life',dt=>{ swing(dt); ragSend(dt); carrying(dt);
    if(shove&&shove.t>0&&!RAG.on){ const k=Math.min(dt,shove.t); pos.x+=shove.x*k; pos.z+=shove.z*k; shove.t-=k; collide(pos); }
    if(RAG.on!==wasRag){ wasRag=RAG.on; if(RAG.on)SYS.run('act','F',1); else ONLINE.send({t:'ragoff'}); } },'146h-brawl'); }

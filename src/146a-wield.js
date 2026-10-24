// THE WIELD: WIELD lets the player hold and swing a sword (any blade on the item model), a butterfly net or a bird net: swings chain into a heavy third, cost stamina, and P held raises the blade to block.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, ITEMS, keys, LEVELS, ONLINE, pos, RAG, SFX, st, VIT, W3, WEEDS, WIELD} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {BF, SYS, TILE} from './006-map-pre.js';
import {BFLY} from './143-bfly.js';
import {BIRDS} from './144b-birds.js';
Object.assign(WIELD,{on:null,block:false,bare:false,blockT:0,swing:null}); window.WIELD=WIELD; Object.defineProperty(WIELD,'sword',{get:()=>!!WIELD.on&&ITEMS.prop(WIELD.on,'grants')==='fight'});
{ const T=TILE, V3=THREE.Vector3, NM={sword:'SWORD',sword_wood:'WOODEN SWORD',sword_steel:'STEEL SWORD',sword_ench:'ENCHANTED BLADE',net:'BUTTERFLY NET',bnet:'BIRD NET'}, say=FORAGE.say;
  const SWC={sword_wood:[0xa88a60,0x6a4a2a,0x4a3020],sword:[0xd8dce2,0x9a8450,0x4a3426],sword_steel:[0xeef2f8,0xb0b8c8,0x24242e],sword_ench:[0x9ad8ff,0xd8b060,0x3a2a5a]};
  const LIST=[...Object.keys(SWC).filter(id=>ITEMS.prop(id,'slot')==='hand'),'net','bnet'];
  FORAGE.add({names:{sword:'SWORD',sword_wood:'WOODEN SWORD',sword_steel:'STEEL SWORD',sword_ench:'ENCHANTED BLADE'},prices:{sword:15,sword_wood:8,sword_steel:40,sword_ench:120}});
  // the sword is bought from the swordsmith now, not given free (owner, 22 Oct 2026).
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), bx=(w,h,d,m,y)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.y=y; return o; };
  const net=(r,col,bag)=>{ '@later'; const g=new THREE.Group(), p=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,1.1,5),lam(0x8a6a44)), h=new THREE.Mesh(new THREE.TorusGeometry(r,.014,4,10),lam(col)),
      b=new THREE.Mesh(new THREE.ConeGeometry(r*.95,r*1.6,8,1,true),new THREE.MeshBasicMaterial({color:bag,transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false}));
    p.position.y=.45; h.position.y=1+r; h.rotation.y=Math.PI/2; b.position.set(-r*.8,1+r,0); b.rotation.z=Math.PI/2; g.add(p,h,b); g.r=r; g.head=new V3(0,1+r,0); return g; };
  const sword=([bl,gd,gr])=>{ const g=new THREE.Group(), gold=lam(gd); g.add(bx(.035,.2,.035,lam(gr),-.02),bx(.22,.03,.05,gold,.09),bx(.075,.72,.014,lam(bl),.46),bx(.05,.05,.05,gold,-.14)); g.head=new V3(0,.8,0); return g; };
  const MK={net:()=>net(.2,0xc8c2b0,0xf4f0e4), bnet:()=>net(.3,0x5a4a3a,0xb8b4a8)}, MESH={}, mk=id=>MK[id]?MK[id]():sword(SWC[id]);
  const N=8, TP=new Float32Array(N*2*3), TG=new THREE.BufferGeometry(), TI=[]; for(let i=0;i<N-1;i++){ const a=i*2; TI.push(a,a+1,a+2,a+1,a+3,a+2); }
  TG.setAttribute('position',new THREE.BufferAttribute(TP,3)); TG.setIndex(TI);
  const trail=new THREE.Mesh(TG,new THREE.MeshBasicMaterial({color:0xf4f0e4,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false})); trail.frustumCulled=false; trail.visible=false; scene.add(LEVELS.own(trail,'*'));
  const pts=[], M=new THREE.Matrix4(), IM=new THREE.Matrix4(), UP=new V3(0,1,0), rc=new THREE.Raycaster(), pl=new THREE.Plane(new V3(0,1,0),0), hit=new V3(), ms={x:-1,y:-1};
  const cur=new V3(0,-.3,1).normalize(), aim=new V3(), aim0=new V3(0,-.3,1).normalize(), sh=new V3(), head=new V3(), tip=new V3(), base=new V3(), ax=new V3(), bx2=new V3(), bz=new V3();
  let sw=null, side=1, spd=0, turning=false, cutT=0, combo=0, lastSw=0;
  renderer.domElement.addEventListener('pointermove',e=>{ ms.x=e.clientX; ms.y=e.clientY; });
  WIELD.set=id=>{ '@later'; if(MESH[WIELD.on])MESH[WIELD.on].visible=false; WIELD.on=null; if(!id||!FORAGE.has(id)){ if(id)say('YOU HAVE NO '+NM[id]+'.','#c8a090'); return; }
    const m=MESH[id]||(MESH[id]=mk(id)); if(!m.parent){ m.matrixAutoUpdate=false; scene.add(m); } WIELD.on=id; SHARED.target=null; say('YOU HOLD THE '+NM[id]+'. THE MOUSE AIMS IT, A CLICK SWINGS.','#e8e2cc'); FORAGE.draw(); };
  WIELD.next=()=>{ const own=LIST.filter(k=>FORAGE.has(k)), i=own.indexOf(WIELD.on); WIELD.set(i+1<own.length?own[i+1]:null); if(!WIELD.on)say('YOUR HANDS ARE FREE.','#e8e2cc'); };
  const WIELD_strike0=()=>{ if(!WIELD.on||WIELD.block||sw&&sw.t<.18||VIT.dead||VIT.out>0||RAG.on)return false; let heavy=false;
    if(WIELD.sword){ const now=performance.now(); combo=now-lastSw<900?combo+1:0; lastSw=now; heavy=combo>=2; if(heavy)combo=-1; const winded=VIT.sta<.08;
      VIT.spend(heavy?.12:.06); VIT.inFight(5); WIELD.swing={heavy,winded,t:now,ax:aim0.x,az:aim0.z}; sw={t:0,T:winded?.55:heavy?.42:.3,s:side,h:heavy}; ONLINE.send({t:'swing',s:side,h:heavy?1:0}); }
    else sw={t:0,T:.3,s:side}; side=-side; SFX.play('step',{vol:.3,pitch:heavy?1.5:2.2}); return true; };
  WIELD.strike=(...a)=>{ const r=WIELD_strike0(...a); if(r)SYS.run('strike'); return r; };
  FORAGE.ROWB.push(id=>LIST.includes(id)?[[WIELD.on===id?'PUT AWAY':'HOLD','wield']]:[]); FORAGE.ACT.wield=id=>WIELD.set(WIELD.on===id?null:id);
  const free=()=>!(RAG.on||st.water&&st.water.in||st.ride||st.climb||st.hang||st.sit||VIT.dead);
  WIELD.pre=dt=>{ const on=!!WIELD.on&&free();
    const bare=!WIELD.on&&free()&&!(VIT.out>0)&&keys.has('p')&&VIT.sta>.03&&!(st.up&&st.up.name!=='block');   // bare hands: the arms come up
    const bk=bare||on&&WIELD.sword&&!sw&&keys.has('p')&&VIT.sta>.03; if(bk!==WIELD.block){ const was=WIELD.bare; WIELD.block=bk; WIELD.bare=bk&&bare; if(bk){ WIELD.blockT=performance.now(); SFX.play('step',{vol:.25,pitch:1.4}); }
      try{ if(WIELD.bare){ RIG.act(st,'B'); SYS.run('act','B',1); } else if(was){ RIG.release(st,'B'); SYS.run('act','B',0); } }catch(e){} }
    if(WIELD.block){ VIT.sta=Math.max(0,VIT.sta-dt*.2); VIT.inFight(3); }
    if(on){ const r=renderer.domElement.getBoundingClientRect(); if(ms.x>=0){ rc.setFromCamera(new THREE.Vector2((ms.x-r.left)/r.width*2-1,-((ms.y-r.top)/r.height*2-1)),SHARED.cam); pl.constant=-(SHARED.py+.9*T); if(rc.ray.intersectPlane(pl,hit)){ aim.subVectors(hit,sh.lengthSq()?sh:new V3(pos.x,SHARED.py+1.3*T,pos.z)); aim.y=Math.min(aim.y,0); if(aim.lengthSq()>1e-6)aim0.copy(aim.normalize()); } } aim.copy(aim0);
      if(WIELD.block){ aim.set(Math.sin(SHARED.heading)*.35,.95,Math.cos(SHARED.heading)*.35).normalize(); aim0.copy(aim); }
      if(sw){ sw.t+=dt; const u=Math.min(1,sw.t/sw.T), e=u*u*(3-2*u); aim.applyAxisAngle(UP,sw.s*(1.5-3*e)*(sw.h?1.4:1)).setY(aim.y-(sw.h?.45:.25)*Math.sin(Math.PI*u)).normalize(); if(sw.t>=sw.T)sw=null; }
      const was=cur.clone(); cur.lerp(aim,1-Math.exp(-dt*(sw?40:20))).normalize(); spd=dt>0?was.angleTo(cur)/dt:0;
      const moving=st.target>0||SHARED.target, d=Math.atan2(Math.sin(Math.atan2(cur.x,cur.z)-SHARED.heading),Math.cos(Math.atan2(cur.x,cur.z)-SHARED.heading)); if(!moving&&Math.abs(d)>1.1)turning=true; if(Math.abs(d)<.3)turning=false;
      if(turning&&!moving&&!st.move)SHARED.heading+=Math.max(-7*dt,Math.min(7*dt,d)); }
    const w0=st.aim?st.aim.w:0, w=w0+((on&&!(st.move&&st.move.name==='pick')?1:0)-w0)*Math.min(1,dt*10);
    if(!on&&w<.02){ st.aim=null; return; } IM.copy(W3.group.matrixWorld).invert(); const v=cur.clone().transformDirection(IM); st.aim={v:RIG.V(v.x,v.y,v.z),w}; };
  WIELD.post=B=>{ const m=MESH[WIELD.on], on=!!(m&&free()&&st.aim&&st.aim.w>.3); for(const k in MESH)MESH[k].visible=on&&MESH[k]===m; if(!on){ trail.visible=false; pts.length=0; return; }
    const G=W3.group.matrixWorld, J=B.J, P=(p,o)=>o.set(p.x,p.y,p.z).applyMatrix4(G);
    P(J.shoulderR,sh); P(J.elbowR,ax); P(J.palmR,base); ax.subVectors(P(J.wristR,tip),ax).normalize();
    bx2.crossVectors(ax,UP); if(bx2.lengthSq()<1e-4)bx2.set(1,0,0); bx2.normalize(); bz.crossVectors(bx2,ax);
    M.makeBasis(bx2,ax,bz).setPosition(base); m.matrix.copy(M); m.matrixWorld.copy(M); head.copy(m.head).applyMatrix4(M); tip.copy(base).addScaledVector(ax,m.head.y+(m.r||0)*2);
    const fast=spd>7||sw, now=performance.now(); if(!WIELD.mv){ WIELD.mv=1; SYS.add('weedsMove',()=>{ if(performance.now()<cutT)WEEDS.movers[7].set(tip.x,tip.z,.6*T,1); },'146a-wield'); } if(fast){ pts.unshift([base.clone().addScaledVector(ax,.25),tip.clone(),now]); if(WIELD.sword&&tip.y<SHARED.py+.6*T)cutT=now+400; }
    while(pts.length&&(pts.length>N||now-pts[pts.length-1][2]>120))pts.pop();
    trail.visible=pts.length>2; if(trail.visible){ for(let i=0;i<N;i++){ const q=pts[Math.min(i,pts.length-1)]; q[0].toArray(TP,i*6); q[1].toArray(TP,i*6+3); } TG.attributes.position.needsUpdate=true; }
    if(!(spd>4||sw)||WIELD.sword)return;
    if(WIELD.on==='net'&&BFLY.out&&st.move&&st.move.def.air)for(const b of [...BF.list]){ if(!b.g.parent||!b.th||(b.nt||0)>now)continue; if(b.g.position.distanceTo(head)<m.r+.25*T){ b.nt=now+1500; BFLY.catch(b); } }
    if(WIELD.on==='bnet'&&BIRDS.net)for(const b of [...BIRDS.list]){ if(b.st==='pet'||b.st==='hid'||(b.nt||0)>now)continue; if(Math.hypot(b.x-head.x,b.y-head.y,b.z-head.z)<m.r+.3*T){ b.nt=now+1500; BIRDS.net(b); } } };

  /* ---------- what you hold, for everyone: your arm's aim (six times a second) and each swing; theirs drawn in their hands ---------- */
  let shT=0, shS=''; const r2=v=>Math.round(v*100)/100, theirs=new Map(), A=new V3();
  const share=dt=>{ if(!ONLINE.on||sw)return; const id=WIELD.on&&free()&&st.aim&&st.aim.w>.3?WIELD.on:''; shT-=dt;
    if(!id){ if(shS){ shS=''; ONLINE.send({t:'aim',w:''}); } return; }
    const v=st.aim.v, a=[r2(v.x),r2(v.y),r2(v.z)], k=id+a.join(); if(shT>-1&&(shT>0||k===shS))return; shT=1/6; shS=k; ONLINE.send({t:'aim',w:id,v:a}); };
  const gone=id=>{ const t=theirs.get(id); if(!t)return; t.m.removeFromParent(); t.m.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material)o.material.dispose(); }); theirs.delete(id); const o=ONLINE.others.get(id); if(o&&o.S)o.S.aim=null; };
  ONLINE.hear.aim=m=>{ const w=typeof m.w==='string'&&(MK[m.w]||SWC[m.w])?m.w:''; let t=theirs.get(m.id); if(!w||!ONLINE.others.has(m.id))return gone(m.id);
    if(!t||t.w!==w){ gone(m.id); t={w,m:mk(w),v:new V3(0,-.3,1).normalize(),cur:new V3(0,-.3,1).normalize(),sw:null}; t.m.matrixAutoUpdate=false; t.m.userData.anyRoom=true; scene.add(LEVELS.own(t.m,'*')); theirs.set(m.id,t); }
    if(Array.isArray(m.v)){ t.v.set(+m.v[0]||0,+m.v[1]||0,+m.v[2]||0); if(t.v.lengthSq()<1e-6)t.v.set(0,-.3,1); t.v.normalize(); } t.at=performance.now(); };
  ONLINE.hear.swing=m=>{ const t=theirs.get(m.id); if(t)t.sw={t:0,T:m.h?.42:.3,s:m.s<0?-1:1,h:!!m.h}; };
  const draw=dt=>{ const now=performance.now();
    for(const [id,t] of theirs){ const o=ONLINE.others.get(id); if(!o||now-t.at>4000){ gone(id); continue; }
      const F=o.fig, ok=!!(F&&F.g.visible&&o.B&&o.B.J&&o.B.J.palmR&&!(o.rag&&o.rag.b)&&!o.dead); t.m.visible=ok; if(!ok){ if(o.S)o.S.aim=null; continue; }
      A.copy(t.v); if(t.sw){ const S=t.sw; S.t+=dt; const u=Math.min(1,S.t/S.T), e=u*u*(3-2*u); A.applyAxisAngle(UP,S.s*(1.5-3*e)*(S.h?1.4:1)).setY(A.y-(S.h?.45:.25)*Math.sin(Math.PI*u)).normalize(); if(S.t>=S.T)t.sw=null; }
      t.cur.lerp(A,1-Math.exp(-dt*(t.sw?40:20))).normalize(); o.S.aim={v:RIG.V(t.cur.x,t.cur.y,t.cur.z),w:1}; o.wantPose=true;
      F.g.updateMatrixWorld(true); const G=F.g.matrixWorld, J=o.B.J, P=(p,q)=>q.set(p.x,p.y,p.z).applyMatrix4(G), b=new V3(), e=new V3(), w=new V3(), x=new V3(), z=new V3();
      P(J.elbowR,e); P(J.palmR,b); w.subVectors(P(J.wristR,w),e).normalize(); x.crossVectors(w,UP); if(x.lengthSq()<1e-4)x.set(1,0,0); x.normalize(); z.crossVectors(x,w);
      t.m.matrix.makeBasis(x,w,z).setPosition(b); t.m.matrixWorld.copy(t.m.matrix); } };
  window.WIELDDBG=()=>[...theirs].map(([id,t])=>({id,w:t.w,shown:t.m.visible,sw:!!t.sw}));
  SYS.add('life',dt=>{ share(dt||0); if(theirs.size)draw(dt||0); },'146a-wield'); }

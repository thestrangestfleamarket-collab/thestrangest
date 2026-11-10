// THE WIELD: WIELD lets the player hold and swing a sword (any blade on the item model), a butterfly net or a bird net, or hold a tool another system registers (the fishing rod) in the passport's hand, the mouse taking the arm round in full circles: swings chain into a heavy third, cost stamina, and P held raises the blade to block.
import {SHARED, THREE} from './003-shx.js';
import {BIRDS, FORAGE, INSPECT, ITEMS, keys, LEVELS, MOTION, ONLINE, RAG, SFX, st, VIT, VR, W3, WEEDS, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {BF, SYS, TILE} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {BFLY} from './143-bfly.js';
Object.assign(WIELD,{on:null,block:false,bare:false,blockT:0,swing:null}); window.WIELD=WIELD; Object.defineProperty(WIELD,'sword',{get:()=>!!WIELD.on&&ITEMS.prop(WIELD.on,'grants')==='fight'}); Object.defineProperty(WIELD,'hand',{get:()=>st.hand==='L'?'L':'R'});
{ const T=TILE, V3=THREE.Vector3, NM={sword:'SWORD',sword_wood:'WOODEN SWORD',sword_steel:'STEEL SWORD',sword_ench:'ENCHANTED BLADE',net:'BUTTERFLY NET',bnet:'BIRD NET'}, say=SAY;
  const SWC={sword_wood:[0xa88a60,0x6a4a2a,0x4a3020],sword:[0xd8dce2,0x9a8450,0x4a3426],sword_steel:[0xeef2f8,0xb0b8c8,0x24242e],sword_ench:[0x9ad8ff,0xd8b060,0x3a2a5a]};
  const LIST=[...Object.keys(SWC).filter(id=>ITEMS.prop(id,'slot')==='hand'),'net','bnet']; WIELD.LIST=LIST;
  // other held tools register here: WIELD.kind(id,{name,make,aim(dt,aim,mouse) -> true when it moves the arm itself,use() -> true when a click is its own}); make() returns a group with .tipL (its tip, local) when something hangs off it
  const KIND={}; WIELD.kinds=KIND; WIELD.useHeld=()=>{ const k=WIELD.on&&KIND[WIELD.on]; if(!k||!k.use)return false; k.use(); return true; }; WIELD.tip=new THREE.Vector3(); WIELD.ray=null; WIELD.kind=(id,k)=>{ KIND[id]=k; NM[id]=k.name; if(!LIST.includes(id))LIST.push(id); }; for(const [id,k] of WIELD.pend||[])WIELD.kind(id,k);
  FORAGE.add({names:{sword:'SWORD',sword_wood:'WOODEN SWORD',sword_steel:'STEEL SWORD',sword_ench:'ENCHANTED BLADE'},prices:{sword:15,sword_wood:8,sword_steel:40,sword_ench:120}});
  // the sword is bought from the swordsmith now, not given free (owner, 22 Oct 2026).
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), bx=(w,h,d,m,y)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.y=y; return o; };
  const net=(r,col,bag)=>{ '@later'; const g=new THREE.Group(), p=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,1.1,5),lam(0x8a6a44)), h=new THREE.Mesh(new THREE.TorusGeometry(r,.014,4,10),lam(col)),
      b=new THREE.Mesh(new THREE.ConeGeometry(r*.95,r*1.6,8,1,true),new THREE.MeshBasicMaterial({color:bag,transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false}));
    p.position.y=.45; h.position.y=1+r; h.rotation.y=Math.PI/2; b.position.set(-r*.8,1+r,0); b.rotation.z=Math.PI/2; g.add(p,h,b); g.r=r; g.head=new V3(0,1+r,0); return g; };
  const sword=([bl,gd,gr])=>{ const g=new THREE.Group(), gold=lam(gd); g.add(bx(.035,.2,.035,lam(gr),-.02),bx(.22,.03,.05,gold,.09),bx(.075,.72,.014,lam(bl),.46),bx(.05,.05,.05,gold,-.14)); g.head=new V3(0,.8,0); return g; };
  const MK={net:()=>net(.2,0xc8c2b0,0xf4f0e4), bnet:()=>net(.3,0x5a4a3a,0xb8b4a8)}, MESH={}, mk=id=>KIND[id]?KIND[id].make():MK[id]?MK[id]():sword(SWC[id]||SWC.sword); WIELD.mk=mk;
  INSPECT.kinds.push({is:id=>!!(KIND[id]||MK[id]||SWC[id]),make:id=>{ const g=mk(id); g.traverse(c=>{ c.userData.ownMat=true; }); return g; }});
  const N=8;
  const pts=[], M=new THREE.Matrix4(), IM=new THREE.Matrix4(), UP=new V3(0,1,0), rc=new THREE.Raycaster(), ms={x:-1,y:-1};
  const ph=new V3(), seg=new V3(), sd=new V3(), sq=new V3(), cur=new V3(0,-.3,1).normalize(), aim=new V3(), aim0=new V3(0,-.3,1).normalize(), sh=new V3(), hip=new V3(), head=new V3(), tip=new V3(), base=new V3(), ax=new V3(), bx2=new V3(), bz=new V3(), cx=new V3(), cy=new V3(), cz=new V3(), sax=new V3();
  const J_=(J,n)=>J[n+WIELD.hand];
  // a slash across: round the world's up, or round the camera's forward when the arm is raised or dropped (so a lifted arm still cuts across the screen)
  const slash=(v,S,dt)=>{ S.t+=dt; const u=Math.min(1,S.t/S.T), e=u*u*(3-2*u); sax.copy(UP).addScaledVector(v,-v.y); if(sax.lengthSq()<.1)sax.copy(cz); sax.normalize(); v.applyAxisAngle(sax,S.s*(1.5-3*e)*(S.h?1.4:1)).setY(v.y-(S.h?.45:.25)*Math.sin(Math.PI*u)).normalize(); return S.t>=S.T; };
  let phOk=false, sw=null, side=1, spd=0, cutT=0, combo=0, lastSw=0, heavy=false;
  // the arm swings only in front of the body (owner, 2 Nov 2026): an aim going behind is held at the body's sides; the keys turn the body, never the swing
  const front=v=>{ const fx=Math.sin(SHARED.heading), fz=Math.cos(SHARED.heading), k=v.x*fx+v.z*fz; if(k<.05)v.x+=fx*(.05-k),v.z+=fz*(.05-k); return v.normalize(); };
  renderer.domElement.addEventListener('pointermove',e=>{ ms.x=e.clientX; ms.y=e.clientY; });
  WIELD.set=id=>{ '@later'; if(MESH[WIELD.on])MESH[WIELD.on].visible=false; WIELD.on=null; if(!id||!FORAGE.has(id)){ if(id)say('YOU HAVE NO '+NM[id]+'.','#c8a090'); return; }
    const m=MESH[id]||(MESH[id]=mk(id)); if(!m.parent){ m.matrixAutoUpdate=false; m.userData.anyRoom=1; scene.add(m); } /* what you hold comes into every room with you: the room cull leaves it be */ WIELD.on=id; SHARED.target=null; if(/^sword/.test(id))MOTION.play('draw'); say('YOU HOLD THE '+NM[id]+'. '+(KIND[id]&&KIND[id].hint||'THE MOUSE SWINGS IT ROUND YOU, A CLICK SLASHES.'),'#e8e2cc'); FORAGE.draw(); };
  WIELD.next=()=>{ const own=LIST.filter(k=>FORAGE.has(k)), i=own.indexOf(WIELD.on); WIELD.set(i+1<own.length?own[i+1]:null); if(!WIELD.on)say('YOUR HANDS ARE FREE.','#e8e2cc'); };
  const WIELD_strike0=()=>{ '@later'; if(!WIELD.on||WIELD.block||sw&&sw.t<.18||VIT.dead||VIT.out>0||RAG.on)return false; if(KIND[WIELD.on]&&KIND[WIELD.on].use){ if(!KIND[WIELD.on].ekey)KIND[WIELD.on].use(); return false; }   // what you ride is used with E, not a click (owner, 8 Nov 2026) let heavy=false;
    heavy=false; if(WIELD.sword){ const now=performance.now(); combo=now-lastSw<900?combo+1:0; lastSw=now; heavy=combo>=2; if(heavy)combo=-1; const winded=VIT.sta<.08;
      VIT.spend(heavy?.12:.06); VIT.inFight(5); WIELD.swing={heavy,winded,t:now,ax:aim0.x,az:aim0.z}; sw={t:0,T:winded?.55:heavy?.42:.3,s:side,h:heavy}; ONLINE.send({t:'swing',s:side,h:heavy?1:0}); }
    else sw={t:0,T:.3,s:side}; MOTION.play(heavy?'swingHeavy':side>0?'swingA':'swingB'); side=-side; SFX.play('step',{vol:.3,pitch:heavy?1.5:2.2}); return true; };
  WIELD.strike=(...a)=>{ const r=WIELD_strike0(...a); if(r)SYS.run('strike'); return r; };
  FORAGE.ROWB.push(id=>LIST.includes(id)?[[WIELD.on===id?'PUT AWAY':'HOLD','wield']]:[]); FORAGE.ACT.wield=id=>WIELD.set(WIELD.on===id?null:id);
  const free=()=>!(RAG.on||st.water&&st.water.in||st.ride||st.climb||st.hang||st.sit||VIT.dead);
  WIELD.pre=dt=>{ const on=!!WIELD.on&&free();
    const bare=!WIELD.on&&free()&&!(VIT.out>0)&&keys.has('p')&&VIT.sta>.03&&!(st.up&&st.up.name!=='block');   // bare hands: the arms come up
    const bk=bare||on&&WIELD.sword&&!sw&&keys.has('p')&&VIT.sta>.03; if(bk!==WIELD.block){ const was=WIELD.bare; WIELD.block=bk; WIELD.bare=bk&&bare; if(bk){ WIELD.blockT=performance.now(); SFX.play('step',{vol:.25,pitch:1.4}); }
      try{ if(WIELD.bare){ RIG.act(st,'B'); SYS.run('act','B',1); } else if(was){ RIG.release(st,'B'); SYS.run('act','B',0); } }catch(e){} }
    if(WIELD.block){ VIT.sta=Math.max(0,VIT.sta-dt*.2); VIT.inFight(3); }
    if(on){ const r=renderer.domElement.getBoundingClientRect(); if(ms.x>=0){ const nx=(ms.x-r.left)/r.width*2-1, ny=-((ms.y-r.top)/r.height*2-1), asp=r.width/Math.max(1,r.height); rc.setFromCamera(new THREE.Vector2(nx,ny),SHARED.cam); WIELD.ray=rc.ray;
        // the arm follows the mouse round the shoulder on the screen, any way round: on the shoulder it points away from the camera, a torso's length out it lies across the screen, further out it leans back toward the camera (120 degrees at most, so the mouse's side always counts)
        const C=SHARED.cam.matrixWorld.elements; cx.set(C[0],C[1],C[2]); cy.set(C[4],C[5],C[6]); cz.set(-C[8],-C[9],-C[10]); let px=0, py=0, R0=.5;
        if(sh.lengthSq()&&hip.lengthSq()){ const a=sh.clone().project(SHARED.cam), b=hip.clone().project(SHARED.cam); if(a.z<1&&Math.abs(a.x)<1.5&&Math.abs(a.y)<1.5){ px=a.x*asp; py=a.y; R0=Math.max(.25,Math.hypot((b.x-a.x)*asp,b.y-a.y)*1.3); } }
        const dx=nx*asp-px, dy=ny-py, f=Math.min(4/3,Math.hypot(dx,dy)/R0)*Math.PI/2, th=Math.atan2(dy,dx);
        aim.copy(cz).multiplyScalar(Math.cos(f)).addScaledVector(cx,Math.cos(th)*Math.sin(f)).addScaledVector(cy,Math.sin(th)*Math.sin(f)); if(aim.lengthSq()>1e-6)aim0.copy(aim.normalize()); } else aim0.set(Math.sin(SHARED.heading),-.3,Math.cos(SHARED.heading)).normalize(); aim.copy(aim0);   /* no mouse aiming it: the tool rests in front of him, a little down, wherever he faces */
      const K=KIND[WIELD.on], own=!!(K&&K.aim&&K.aim(dt,aim,aim0)); if(own)sw=null;
      if(WIELD.block&&!own){ aim.set(Math.sin(SHARED.heading)*.35,.95,Math.cos(SHARED.heading)*.35).normalize(); aim0.copy(aim); }
      if(sw&&slash(aim,sw,dt))sw=null; if(!own)front(aim);
      const was=cur.clone(); cur.lerp(aim,1-Math.exp(-dt*(sw||own?40:20))).normalize(); spd=dt>0?was.angleTo(cur)/dt:0; }
    const w0=st.aim?st.aim.w:0, w=w0+((on&&!(st.move&&st.move.name==='pick')?1:0)-w0)*Math.min(1,dt*10);
    if(!on&&w<.02){ st.aim=null; return; } IM.copy(W3.group.matrixWorld).invert(); const v=cur.clone().transformDirection(IM); st.aim={v:RIG.V(v.x,v.y,v.z),w}; };
  WIELD.post=B=>{ const m=MESH[WIELD.on], on=!!(m&&free()&&st.aim&&st.aim.w>.3); for(const k in MESH)MESH[k].visible=on&&MESH[k]===m; if(!on){ pts.length=0; phOk=false; return; }
    const G=W3.group.matrixWorld, J=B.J, P=(p,o)=>o.set(p.x,p.y,p.z).applyMatrix4(G);
    const AH=BODIES.hand(WIELD.hand);   // (in your avatar's own hand)
    P(AH?AH.shoulder:J_(J,'shoulder'),sh); P(J.pelvis,hip); P(AH?AH.elbow:J_(J,'elbow'),ax); P(AH?AH.palm:J_(J,'palm'),base); ax.subVectors(P(AH?AH.wrist:J_(J,'wrist'),tip),ax).normalize();
    const HV=VR.on&&VR.hand&&VR.hand(WIELD.hand==='L'?'left':'right'); WIELD.vel=HV?HV.v:null;   // in the headset the tool hangs from the controller: its forward is the shaft, its roll the face
    if(HV){ base.copy(HV.wp); ax.set(0,0,-1).applyQuaternion(HV.wq); bx2.set(1,0,0).applyQuaternion(HV.wq); } else { bx2.crossVectors(ax,UP); if(bx2.lengthSq()<1e-4)bx2.set(1,0,0); bx2.normalize(); } bz.crossVectors(bx2,ax);
    M.makeBasis(bx2,ax,bz).setPosition(base); m.matrix.copy(M); m.matrixWorld.copy(M); if(m.tipL){ WIELD.tip.copy(m.tipL).applyMatrix4(M); if(m.bend)m.bend(); } head.copy(m.head).applyMatrix4(M); tip.copy(base).addScaledVector(ax,m.head.y+(m.r||0)*2);
    const fast=(spd>7||sw)&&!KIND[WIELD.on], now=performance.now(); if(!WIELD.mv){ WIELD.mv=1; SYS.add('weedsMove',()=>{ if(performance.now()<cutT)WEEDS.movers[7].set(tip.x,tip.z,.6*T,1); },'146a-wield'); } if(fast){ pts.unshift([base.clone().addScaledVector(ax,.25),tip.clone(),now]); if(WIELD.sword&&tip.y<SHARED.py+.6*T)cutT=now+400; }
    while(pts.length&&(pts.length>N||now-pts[pts.length-1][2]>120))pts.pop();
    const was=phOk; ph.copy(seg); seg.copy(head); phOk=true; if(!(spd>4||sw)||WIELD.sword||KIND[WIELD.on])return;
    // the hoop's sweep since last frame, so a fast swing cannot skip over a butterfly; on the ground or mid-jump
    if(WIELD.on==='net'&&BFLY.out){ const a=was?ph:head, air=!!(st.move&&st.move.def.air); for(const b of [...BF.list]){ if(!b.g.parent||!b.th||(b.nt||0)>now)continue; const q=b.g.position, d=sd.subVectors(head,a), L=d.lengthSq(), u=L>1e-9?Math.max(0,Math.min(1,sq.copy(q).sub(a).dot(d)/L)):0;
      if(sq.copy(a).addScaledVector(d,u).distanceTo(q)<m.r+.25*T){ b.nt=now+1500; BFLY.catch(b,{spd,air}); } } }
    if(WIELD.on==='bnet'&&BIRDS.net)for(const b of [...BIRDS.list]){ if(b.st==='pet'||b.st==='hid'||(b.nt||0)>now)continue; if(Math.hypot(b.x-head.x,b.y-head.y,b.z-head.z)<m.r+.3*T){ b.nt=now+1500; BIRDS.net(b); } } };

  /* ---------- what you hold, for everyone: your arm's aim (six times a second) and each swing; theirs drawn in their hands ---------- */
  let shT=0, shS=''; const r2=v=>Math.round(v*100)/100, theirs=new Map(), A=new V3();
  const share=dt=>{ if(!ONLINE.on||sw)return; const id=WIELD.on&&free()&&st.aim&&st.aim.w>.3?WIELD.on:''; shT-=dt;
    if(!id){ if(shS){ shS=''; ONLINE.send({t:'aim',w:''}); } return; }
    const v=st.aim.v, a=[r2(v.x),r2(v.y),r2(v.z)], h=WIELD.hand, k=id+h+a.join(); if(shT>-1&&(shT>0||k===shS))return; shT=1/6; shS=k; ONLINE.send(h==='L'?{t:'aim',w:id,v:a,h}:{t:'aim',w:id,v:a}); };
  const gone=id=>{ const t=theirs.get(id); if(!t)return; t.m.removeFromParent(); t.m.traverse(o=>{ if(o.geometry)o.geometry.dispose(); if(o.material)o.material.dispose(); }); theirs.delete(id); const o=ONLINE.others.get(id); if(o&&o.S)o.S.aim=null; };
  ONLINE.hear.aim=m=>{ '@later'; const w=typeof m.w==='string'&&(MK[m.w]||SWC[m.w]||KIND[m.w])?m.w:''; let t=theirs.get(m.id); if(!w||!ONLINE.others.has(m.id))return gone(m.id);
    if(!t||t.w!==w){ gone(m.id); t={w,h:'R',m:mk(w),v:new V3(0,-.3,1).normalize(),cur:new V3(0,-.3,1).normalize(),sw:null}; t.m.matrixAutoUpdate=false; t.m.userData.anyRoom=true; scene.add(LEVELS.own(t.m,'*')); theirs.set(m.id,t); }
    t.h=m.h==='L'?'L':'R'; { const o=ONLINE.others.get(m.id); if(o&&o.S)o.S.hand=t.h; }
    if(Array.isArray(m.v)){ t.v.set(+m.v[0]||0,+m.v[1]||0,+m.v[2]||0); if(t.v.lengthSq()<1e-6)t.v.set(0,-.3,1); t.v.normalize(); } t.at=performance.now(); };
  ONLINE.hear.swing=m=>{ const t=theirs.get(m.id); if(t)t.sw={t:0,T:m.h?.42:.3,s:m.s<0?-1:1,h:!!m.h}; };
  const draw=dt=>{ '@later'; const now=performance.now();
    for(const [id,t] of theirs){ const o=ONLINE.others.get(id); if(!o||now-t.at>4000){ gone(id); continue; }
      const F=o.fig, ok=!!(F&&F.g.visible&&o.B&&o.B.J&&o.B.J['palm'+t.h]&&!(o.rag&&o.rag.b)&&!o.dead); t.m.visible=ok; if(!ok){ if(o.S)o.S.aim=null; continue; }
      A.copy(t.v); if(t.sw&&slash(A,t.sw,dt))t.sw=null;
      t.cur.lerp(A,1-Math.exp(-dt*(t.sw?40:20))).normalize(); o.S.aim={v:RIG.V(t.cur.x,t.cur.y,t.cur.z),w:1}; o.wantPose=true;
      F.g.updateMatrixWorld(true); const G=F.g.matrixWorld, J=o.B.J, P=(p,q)=>q.set(p.x,p.y,p.z).applyMatrix4(G), b=new V3(), e=new V3(), w=new V3(), x=new V3(), z=new V3();
      const AH=F.PM&&F.body&&BODIES.hand(t.h,F.PM,F.body,o.B); P(AH?AH.elbow:J['elbow'+t.h],e); P(AH?AH.palm:J['palm'+t.h],b); w.subVectors(P(AH?AH.wrist:J['wrist'+t.h],w),e).normalize(); x.crossVectors(w,UP); if(x.lengthSq()<1e-4)x.set(1,0,0); x.normalize(); z.crossVectors(x,w);
      t.m.matrix.makeBasis(x,w,z).setPosition(b); t.m.matrixWorld.copy(t.m.matrix); if(t.m.tipL)(t.tip||(t.tip=new V3())).copy(t.m.tipL).applyMatrix4(t.m.matrix); } };
  WIELD.held=()=>MESH[WIELD.on]||null; WIELD.theirG=id=>{ const t=theirs.get(id); return t&&t.m.visible?t.m:null; };   // the thing in your hand, and in theirs (its matrix is where it is)
  WIELD.theirTip=id=>{ const t=theirs.get(id); return t&&t.m.visible&&t.tip||null; };   // another player's held rod or kite: where its line starts
  WIELD.head=head; window.WIELDDBG=()=>[...theirs].map(([id,t])=>({id,w:t.w,shown:t.m.visible,sw:!!t.sw}));
  SYS.add('life',dt=>{ share(dt||0); if(theirs.size)draw(dt||0); },'146a-wield'); }

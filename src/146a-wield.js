// THE WIELD: WIELD lets the player hold and swing a sword, a butterfly net or a bird net.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, pos, RAG, SFX, st, VIT, W3, WEEDS, WIELD} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {BF, QS, SYS, TILE} from './006-map-pre.js';
import {BFLY} from './143-bfly.js';
import {BIRDS} from './144b-birds.js';
Object.assign(WIELD,{on:null}); window.WIELD=WIELD;
{ const T=TILE, V3=THREE.Vector3, LIST=['sword','net','bnet'], NM={sword:'SWORD',net:'BUTTERFLY NET',bnet:'BIRD NET'}, say=FORAGE.say;
  FORAGE.add({names:{sword:'SWORD'},prices:{sword:15}});
  if(!FORAGE.has('sword')&&(!SAVE.get('sword0')||QS.get('fresh'))){ FORAGE.give('sword',1); SAVE.set('sword0','1'); }
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), bx=(w,h,d,m,y)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.y=y; return o; };
  const net=(r,col,bag)=>{ '@later'; const g=new THREE.Group(), p=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,1.1,5),lam(0x8a6a44)), h=new THREE.Mesh(new THREE.TorusGeometry(r,.014,4,10),lam(col)),
      b=new THREE.Mesh(new THREE.ConeGeometry(r*.95,r*1.6,8,1,true),new THREE.MeshBasicMaterial({color:bag,transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false}));
    p.position.y=.45; h.position.y=1+r; h.rotation.y=Math.PI/2; b.position.set(-r*.8,1+r,0); b.rotation.z=Math.PI/2; g.add(p,h,b); g.r=r; g.head=new V3(0,1+r,0); return g; };
  const MK={sword:()=>{ const g=new THREE.Group(), gold=lam(0x9a8450); g.add(bx(.035,.2,.035,lam(0x4a3426),-.02),bx(.22,.03,.05,gold,.09),bx(.075,.72,.014,lam(0xd8dce2),.46),bx(.05,.05,.05,gold,-.14)); g.head=new V3(0,.8,0); return g; },
    net:()=>net(.2,0xc8c2b0,0xf4f0e4), bnet:()=>net(.3,0x5a4a3a,0xb8b4a8)}, MESH={};
  const N=8, TP=new Float32Array(N*2*3), TG=new THREE.BufferGeometry(), TI=[]; for(let i=0;i<N-1;i++){ const a=i*2; TI.push(a,a+1,a+2,a+1,a+3,a+2); }
  TG.setAttribute('position',new THREE.BufferAttribute(TP,3)); TG.setIndex(TI);
  const trail=new THREE.Mesh(TG,new THREE.MeshBasicMaterial({color:0xf4f0e4,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false})); trail.frustumCulled=false; trail.visible=false; scene.add(trail);
  const pts=[], M=new THREE.Matrix4(), IM=new THREE.Matrix4(), UP=new V3(0,1,0), rc=new THREE.Raycaster(), pl=new THREE.Plane(new V3(0,1,0),0), hit=new V3(), ms={x:-1,y:-1};
  const cur=new V3(0,-.3,1).normalize(), aim=new V3(), aim0=new V3(0,-.3,1).normalize(), sh=new V3(), head=new V3(), tip=new V3(), base=new V3(), ax=new V3(), bx2=new V3(), bz=new V3();
  let sw=null, side=1, spd=0, turning=false, cutT=0;
  renderer.domElement.addEventListener('pointermove',e=>{ ms.x=e.clientX; ms.y=e.clientY; });
  WIELD.set=id=>{ '@later'; if(MESH[WIELD.on])MESH[WIELD.on].visible=false; WIELD.on=null; if(!id||!FORAGE.has(id)){ if(id)say('YOU HAVE NO '+NM[id]+'.','#c8a090'); return; }
    const m=MESH[id]||(MESH[id]=MK[id]()); if(!m.parent){ m.matrixAutoUpdate=false; scene.add(m); } WIELD.on=id; SHARED.target=null; say('YOU HOLD THE '+NM[id]+'. THE MOUSE AIMS IT, A CLICK SWINGS.','#e8e2cc'); FORAGE.draw(); };
  WIELD.next=()=>{ const own=LIST.filter(k=>FORAGE.has(k)), i=own.indexOf(WIELD.on); WIELD.set(i+1<own.length?own[i+1]:null); if(!WIELD.on)say('YOUR HANDS ARE FREE.','#e8e2cc'); };
  const WIELD_strike0=()=>{ if(!WIELD.on||sw&&sw.t<.18)return; sw={t:0,T:.3,s:side}; side=-side; if(typeof SFX!=='undefined')SFX.play('step',{vol:.3,pitch:2.2}); };
  WIELD.strike=(...a)=>{ const r=WIELD_strike0(...a); SYS.run('strike'); return r; };
  FORAGE.ROWB.push(id=>LIST.includes(id)?[[WIELD.on===id?'PUT AWAY':'HOLD','wield']]:[]); FORAGE.ACT.wield=id=>WIELD.set(WIELD.on===id?null:id);
  const free=()=>!(RAG.on||st.water&&st.water.in||st.ride||st.climb||st.hang||st.sit||VIT.dead);
  WIELD.pre=dt=>{ const on=!!WIELD.on&&free();
    if(on){ const r=renderer.domElement.getBoundingClientRect(); if(ms.x>=0){ rc.setFromCamera(new THREE.Vector2((ms.x-r.left)/r.width*2-1,-((ms.y-r.top)/r.height*2-1)),SHARED.cam); pl.constant=-(SHARED.py+.9*T); if(rc.ray.intersectPlane(pl,hit)){ aim.subVectors(hit,sh.lengthSq()?sh:new V3(pos.x,SHARED.py+1.3*T,pos.z)); aim.y=Math.min(aim.y,0); if(aim.lengthSq()>1e-6)aim0.copy(aim.normalize()); } } aim.copy(aim0);
      if(sw){ sw.t+=dt; const u=Math.min(1,sw.t/sw.T), e=u*u*(3-2*u); aim.applyAxisAngle(UP,sw.s*(1.5-3*e)).setY(aim.y-.25*Math.sin(Math.PI*u)).normalize(); if(sw.t>=sw.T)sw=null; }
      const was=cur.clone(); cur.lerp(aim,1-Math.exp(-dt*(sw?40:20))).normalize(); spd=dt>0?was.angleTo(cur)/dt:0;
      const moving=st.target>0||SHARED.target, d=Math.atan2(Math.sin(Math.atan2(cur.x,cur.z)-SHARED.heading),Math.cos(Math.atan2(cur.x,cur.z)-SHARED.heading)); if(!moving&&Math.abs(d)>1.1)turning=true; if(Math.abs(d)<.3)turning=false;
      if(turning&&!moving&&!st.move)SHARED.heading+=Math.max(-7*dt,Math.min(7*dt,d)); }
    const w0=st.aim?st.aim.w:0, w=w0+((on&&!(st.move&&st.move.name==='pick')?1:0)-w0)*Math.min(1,dt*10);
    if(!on&&w<.02){ st.aim=null; return; } IM.copy(W3.group.matrixWorld).invert(); const v=cur.clone().transformDirection(IM); st.aim={v:RIG.V(v.x,v.y,v.z),w}; };
  WIELD.post=B=>{ const m=MESH[WIELD.on], on=m&&free()&&st.aim&&st.aim.w>.3; for(const k in MESH)MESH[k].visible=on&&MESH[k]===m; if(!on){ trail.visible=false; pts.length=0; return; }
    const G=W3.group.matrixWorld, J=B.J, P=(p,o)=>o.set(p.x,p.y,p.z).applyMatrix4(G);
    P(J.shoulderR,sh); P(J.elbowR,ax); P(J.palmR,base); ax.subVectors(P(J.wristR,tip),ax).normalize();
    bx2.crossVectors(ax,UP); if(bx2.lengthSq()<1e-4)bx2.set(1,0,0); bx2.normalize(); bz.crossVectors(bx2,ax);
    M.makeBasis(bx2,ax,bz).setPosition(base); m.matrix.copy(M); m.matrixWorld.copy(M); head.copy(m.head).applyMatrix4(M); tip.copy(base).addScaledVector(ax,m.head.y+(m.r||0)*2);
    const fast=spd>7||sw, now=performance.now(); if(!WIELD.mv){ WIELD.mv=1; SYS.add('weedsMove',()=>{ if(performance.now()<cutT)WEEDS.movers[7].set(tip.x,tip.z,.6*T,1); },'146a-wield'); } if(fast){ pts.unshift([base.clone().addScaledVector(ax,.25),tip.clone(),now]); if(WIELD.on==='sword'&&tip.y<SHARED.py+.6*T)cutT=now+400; }
    while(pts.length&&(pts.length>N||now-pts[pts.length-1][2]>120))pts.pop();
    trail.visible=pts.length>2; if(trail.visible){ for(let i=0;i<N;i++){ const q=pts[Math.min(i,pts.length-1)]; q[0].toArray(TP,i*6); q[1].toArray(TP,i*6+3); } TG.attributes.position.needsUpdate=true; }
    if(!(spd>4||sw)||WIELD.on==='sword')return;
    if(WIELD.on==='net'&&BFLY.out)for(const b of [...BF.list]){ if(!b.g.parent||!b.th||(b.nt||0)>now)continue; if(b.g.position.distanceTo(head)<m.r+.25*T){ b.nt=now+1500; BFLY.catch(b); } }
    if(WIELD.on==='bnet'&&BIRDS.net)for(const b of [...BIRDS.list]){ if(b.st==='pet'||b.st==='hid'||(b.nt||0)>now)continue; if(Math.hypot(b.x-head.x,b.y-head.y,b.z-head.z)<m.r+.3*T){ b.nt=now+1500; BIRDS.net(b); } } }; }

// THE BLUE HOUR: a pale skull-faced being in a deep cobalt hood, leaning by the theatre on Market St, a cigar in his teeth; he sells cigars — hold one and click to puff (smoke from your mouth; six puffs a cigar). Others see your smoke.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, NPCS, ONLINE, pos, W3, WIELD} from './003b-systems.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SOL, SYS, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const SMOKE={}; window.SMOKE=SMOKE;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc');
  const CIG={cigar:{name:'A CIGAR',puffs:6},cigar_blue:{name:'A BLUE HOUR CIGAR',puffs:10,col:0x9ab8e8}};
  FORAGE.add({names:Object.fromEntries(Object.entries(CIG).map(([k,v])=>[k,v.name]))});

  /* ---------- smoke: soft grey puffs that rise, swell and fade; one pool for everyone's ---------- */
  const PUFF=new THREE.SphereGeometry(1,10,8), P=[], N0=60;
  for(let i=0;i<N0;i++){ const m=new THREE.Mesh(PUFF,new THREE.MeshLambertMaterial({color:0xc8ccd4,transparent:true,opacity:0,depthWrite:false})); m.visible=false; m.userData.anyRoom=true; m.raycast=()=>{}; scene.add(m); P.push({m,t:1,T:1,vx:0,vy:0,vz:0}); }
  let pi=0; SMOKE.puff=(x,y,z,n=6,c=0xc8ccd4,big=1)=>{ for(let k=0;k<n;k++){ const p=P[pi=(pi+1)%N0]; p.t=0; p.T=2.2+Math.random()*1.5; p.vx=(Math.random()-.5)*.25*T; p.vz=(Math.random()-.5)*.25*T; p.vy=(.25+Math.random()*.2)*T; p.big=big*(.06+Math.random()*.05)*T;
    p.m.position.set(x+(Math.random()-.5)*.05*T,y,z+(Math.random()-.5)*.05*T); p.m.material.color.setHex(c); p.m.visible=true; } };
  SYS.add('life',dt=>{ dt=dt||0; for(const p of P){ if(!p.m.visible)continue; p.t+=dt; const u=p.t/p.T; if(u>=1){ p.m.visible=false; continue; } p.m.position.x+=p.vx*dt; p.m.position.y+=p.vy*dt; p.m.position.z+=p.vz*dt; p.vx*=1-dt*.5; p.vz*=1-dt*.5;
    p.m.scale.setScalar(p.big*(1+u*4)); p.m.material.opacity=.45*(1-u)*Math.min(1,p.t*6); } },'146x-smoke');

  /* ---------- your cigar: held, it glows at the tip; a click puffs ---------- */
  let left={}; try{ left=JSON.parse(OWNED.get('cigars')||'{}')||{}; }catch(e){}
  const cigar=c=>{ const G=new THREE.Group(); const b=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.15,12),new THREE.MeshStandardMaterial({color:0x5a3a22,roughness:.85})); b.rotation.x=Math.PI/2; G.add(b);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.02,12),new THREE.MeshStandardMaterial({color:c||0xc8a040,roughness:.4,metalness:.3})); band.rotation.x=Math.PI/2; band.position.z=-.04; G.add(band);
    const tip=new THREE.Mesh(new THREE.SphereGeometry(.013,10,8),new THREE.MeshBasicMaterial({color:0xff6a20})); tip.position.z=.076; G.add(tip); return G; };
  const head=new THREE.Vector3(), mouth=()=>{ const B=W3.lastB, g=W3.group; if(B&&B.J&&g){ const J=B.J.head; head.set(J.x,J.y+1,J.z+6).applyMatrix4(g.matrixWorld); return head; } return head.set(pos.x,SHARED.py+1.9*T,pos.z); };
  const smoke=(x,y,z,id)=>SMOKE.puff(x,y,z,8,CIG[id]&&CIG[id].col||0xc8ccd4);
  ONLINE.hear.puff=m=>{ if(!m||!isFinite(m.x)||!isFinite(m.y)||!isFinite(m.z)||Math.hypot(m.x-pos.x,m.z-pos.z)>40*T)return; smoke(m.x,m.y,m.z,m.k); };
  for(const id in CIG){ const k={name:CIG[id].name,hint:'A CLICK TAKES A PUFF.',make:()=>{ const g=cigar(CIG[id].col); g.scale.multiplyScalar(1.4); g.head=new THREE.Vector3(0,.1,0); return g; },
      use:()=>{ if(!FORAGE.has(id))return; const n=(left[id]??CIG[id].puffs)-1, p=mouth(); smoke(p.x,p.y,p.z,id); if(ONLINE.on&&ONLINE.send)ONLINE.send({t:'puff',x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2),k:id});
        if(n<=0){ FORAGE.take(id,1); delete left[id]; say('THE CIGAR IS DONE. YOU STUB IT OUT.'); if(FORAGE.draw)FORAGE.draw(); } else { left[id]=n; if(n===2)say('NEARLY DOWN TO THE BAND.'); } try{ OWNED.set('cigars',JSON.stringify(left)); }catch(e){} }};
    (WIELD.pend=WIELD.pend||[]).push([id,k]); if(WIELD.kind)WIELD.kind(id,k); }

  /* ---------- him: a pale blue-white skull face, deep eye holes (a little eye in one), a long neck of tendons; a big soft cobalt hood and robe; grey knotted hands; a cigar in his teeth ---------- */
  const HOOD='cloth:#1e3a8a', SKULL='ivory:#d8e2ec', HOLE='plain:#0a0c14', HAND='skin:#8a8c94';
  const model=()=>{ const sk=MERCH.skel({hipY:.95,neck:.55,shX:.2,shY:.44,upper:.3,fore:.28,hipX:.09}), {B}=sk;
    mk(B.torso,drape(LATHE([[.2,-.1],[.24,.1],[.26,.3],[.25,.44],[.2,.52],[.1,.58]],32,.85),.014),HOOD);
    mk(B.hips,drape(LATHE([[.2,.05],[.24,-.2],[.29,-.6],[.32,-.92]],32,.9),.014),HOOD);
    for(let i=0;i<3;i++)mk(B.torso,new THREE.CylinderGeometry(.008,.01,.12,8),SKULL,[-.03+i*.03,.58,.03],[.15,0,0]);
    const H=grp(B.head,[0,.12,.01]); mk(H,SPH(.1,32,24),SKULL,[0,0,0],[0,0,0],[.9,1.05,1]); mk(H,SPH(.06,20,14),SKULL,[0,-.075,.02],[0,0,0],[1,.7,1]);
    for(const s of [1,-1])mk(H,SPH(.028,16,12),HOLE,[.036*s,.01,.078],[0,0,0],[1,1.15,.6]); mk(H,SPH(.008,10,8),'glass:#c8d8f0',[-.036,.008,.09]);
    mk(H,new THREE.ConeGeometry(.012,.03,3),HOLE,[0,-.03,.095],[Math.PI,0,0]); for(let i=0;i<6;i++)mk(H,new THREE.BoxGeometry(.008,.014,.006),SKULL,[-.025+i*.01,-.075,.08]);
    for(let i=0;i<3;i++)mk(H,new THREE.TorusGeometry(.03,.002,4,12,Math.PI),'plain:#a8b4c4',[0,.06+i*.01,.088],[0,0,0]);
    const cg=grp(H,[.03,-.075,.1],[0,.4,0]); mk(cg,new THREE.CylinderGeometry(.009,.01,.11,10),'wood:#5a3a22',[0,0,.05],[Math.PI/2,0,0]); mk(cg,SPH(.0095,8,6),'plain:#ff6a20',[0,0,.106]);
    mk(H,drape(SPH(.15,32,24,Math.PI/2+.75,Math.PI*2-1.5,0,Math.PI*.78),.01),HOOD,[0,.02,-.01],[0,0,0],[1.05,1.1,1.1]);
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],drape(new THREE.CylinderGeometry(.06,.07,.3,18,4,true),.008),HOOD,[0,-.14,0]); mk(B['upperArm'+n],SPH(.07,16,12),HOOD);
      mk(B['forearm'+n],drape(new THREE.CylinderGeometry(.065,.1,.28,18,4,true),.01),HOOD,[0,-.13,0]); const h=grp(B['hand'+n],[0,-.04,0]); mk(h,SPH(.035,14,10),HAND,[0,0,0],[1,1.2,.7]);
      for(let i=0;i<4;i++)mk(h,new THREE.CapsuleGeometry(.007,.05,4,8),HAND,[-.018+i*.012,-.05,0],[0,0,(i-1.5)*.1]);
      mk(B['thigh'+n],new THREE.CylinderGeometry(.05,.045,.42,14),'cloth:#16264a',[0,-.2,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.04,.035,.42,14),'cloth:#16264a',[0,-.2,0]); mk(B['shoe'+n],new THREE.CapsuleGeometry(.04,.1,6,10),'leather:#101018',[0,-.04,.04],[Math.PI/2,0,0]); }
    return sk; };
  const V=new THREE.Vector3(); let pt=0;
  MERCH.add({key:'bluehour',label:'THE BLUE HOUR',height:1.85,model,size:10,hd:0,
    idle:t=>{ const blow=(t%9)<2; return MERCH.pose({nod:blow?-14:4,bend:-6,yaw:Math.sin(t*.25)*10,L:{ua:[28,-16],fa:[80,-40]},R:{ua:[28,-16],fa:[84,-40]}}); },
    after:(B,N,dt)=>{ if(!N.g.visible||Math.hypot(pos.x-N.st.x,pos.z-N.st.z)>25*T)return; const t=performance.now()/1000; if(t-pt<((t%9)<2?.25:1.6))return; pt=t; MERCH.at(N,'head',[.03,-.06,.2],V); SMOKE.puff(V.x,V.y,V.z,(t%9)<2?5:1,0xb8c4d8,.8); }});
  { const go=()=>{ const N=NPCS.extra.find(q=>q.key==='bluehour'); if(!window.__started||!N||!N.g)return setTimeout(go,800); const x=N.st.x, z=N.st.z; SOL.up.push([x-.25*T,z-.25*T,x+.25*T,z+.25*T]); }; go(); }
}
export {SMOKE};

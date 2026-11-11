// THE CIGARS AND THE SMOKE: SMOKE's one pool of soft grey puffs for everyone's (cigars, the bees' smoker, the ship), and your cigar held in your mouth with a click to puff; the Blue Hour himself is archived (owner, 5 Nov 2026).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, ONLINE, pos, W3, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const SMOKE={}; window.SMOKE=SMOKE;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const CIG={cigar:{name:'A CIGAR',puffs:6},cigar_blue:{name:'A BLUE HOUR CIGAR',puffs:10,col:0x9ab8e8}};
  FORAGE.add({names:Object.fromEntries(Object.entries(CIG).map(([k,v])=>[k,v.name]))});

  /* ---------- smoke: soft grey puffs that rise, swell and fade; one pool for everyone's ---------- */
  const PUFF=new THREE.SphereGeometry(1,10,8), P=[], N0=60;
  for(let i=0;i<N0;i++){ const m=new THREE.Mesh(PUFF,new THREE.MeshLambertMaterial({color:0xc8ccd4,transparent:true,opacity:0,depthWrite:false})); m.visible=false; m.userData.anyRoom=true; m.raycast=()=>{}; scene.add(m); P.push({m,t:1,T:1,vx:0,vy:0,vz:0}); }
  let pi=0; SMOKE.puff=(x,y,z,n=6,c=0xc8ccd4,big=1)=>{ '@later'; for(let k=0;k<n;k++){ const p=P[pi=(pi+1)%N0]; p.t=0; p.T=2.2+Math.random()*1.5; p.vx=(Math.random()-.5)*.25*T; p.vz=(Math.random()-.5)*.25*T; p.vy=(.25+Math.random()*.2)*T; p.big=big*(.06+Math.random()*.05)*T;
    p.m.position.set(x+(Math.random()-.5)*.05*T,y,z+(Math.random()-.5)*.05*T); p.m.material.color.setHex(c); p.m.visible=true; } };
  SYS.add('life',dt=>{ dt=dt||0; for(const p of P){ if(!p.m.visible)continue; p.t+=dt; const u=p.t/p.T; if(u>=1){ p.m.visible=false; continue; } p.m.position.x+=p.vx*dt; p.m.position.y+=p.vy*dt; p.m.position.z+=p.vz*dt; p.vx*=1-dt*.5; p.vz*=1-dt*.5;
    p.m.scale.setScalar(p.big*(1+u*4)); p.m.material.opacity=.45*(1-u)*Math.min(1,p.t*6); } },'146x-smoke');

  /* ---------- your cigar: held, it glows at the tip; a click puffs ---------- */
  let left={}; try{ left=JSON.parse(OWNED.get('cigars')||'{}')||{}; }catch(e){}
  const cigar=c=>{ '@later'; const G=new THREE.Group(); const b=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.15,12),new THREE.MeshStandardMaterial({color:0x5a3a22,roughness:.85})); b.rotation.x=Math.PI/2; G.add(b);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.02,12),new THREE.MeshStandardMaterial({color:c||0xc8a040,roughness:.4,metalness:.3})); band.rotation.x=Math.PI/2; band.position.z=-.04; G.add(band);
    const tip=new THREE.Mesh(new THREE.SphereGeometry(.013,10,8),new THREE.MeshBasicMaterial({color:0xff6a20})); tip.position.z=.076; G.add(tip); return G; };
  const head=new THREE.Vector3(), mouth=()=>{ if(WIELD.mouth.lengthSq())return head.copy(WIELD.mouth); const B=W3.lastB, g=W3.group; if(B&&B.J&&g){ const J=B.J.head; head.set(J.x,J.y+1,J.z+6).applyMatrix4(g.matrixWorld); return head; } return head.set(pos.x,SHARED.py+1.9*T,pos.z); };
  const smoke=(x,y,z,id)=>SMOKE.puff(x,y,z,8,CIG[id]&&CIG[id].col||0xc8ccd4);
  ONLINE.hear.puff=m=>{ if(!m||!isFinite(m.x)||!isFinite(m.y)||!isFinite(m.z)||Math.hypot(m.x-pos.x,m.z-pos.z)>40*T)return; smoke(m.x,m.y,m.z,m.k); };
  for(const id in CIG){ const k={name:CIG[id].name,hint:'A CLICK TAKES A PUFF.',mouth:true,make:()=>{ const g=cigar(CIG[id].col); g.scale.multiplyScalar(1.4); g.head=new THREE.Vector3(0,.1,0); return g; },
      use:()=>{ '@later'; if(!FORAGE.has(id))return; const n=(left[id]??CIG[id].puffs)-1, p=mouth(); smoke(p.x,p.y,p.z,id); if(ONLINE.on&&ONLINE.send)ONLINE.send({t:'puff',x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2),k:id});
        if(n<=0){ FORAGE.take(id,1); delete left[id]; say('THE CIGAR IS DONE. YOU STUB IT OUT.'); if(FORAGE.draw)FORAGE.draw(); } else { left[id]=n; if(n===2)say('NEARLY DOWN TO THE BAND.'); } try{ OWNED.set('cigars',JSON.stringify(left)); }catch(e){} }};
    (WIELD.pend=WIELD.pend||[]).push([id,k]); if(WIELD.kind)WIELD.kind(id,k); }

}
export {SMOKE};

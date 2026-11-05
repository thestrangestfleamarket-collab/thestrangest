// THE PLANTS: PLANTS' makers for the watching cactus (its eye follows whoever is near), the little cactus and the bonsai; the plant stall and its sellers are archived (owner, 5 Nov 2026).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, ONLINE, pos} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
const PLANTS={}; window.PLANTS=PLANTS;
{ const T=TILE, std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.7,...o});
  FORAGE.add({names:{cactus_eye:'WATCHING CACTUS',cactus:'LITTLE CACTUS',bonsai:'BONSAI'}});
  // the cactus: blue-green lobes with spines, one big wet eye with a green iris and pink lids; the eye is its own group so it can turn
  PLANTS.cactus=(s=1,eyed=true)=>{ const G=new THREE.Group(), green=std(0x4a8a7a,{roughness:.8}), spine=std(0x8a6a4a);
    const lobe=(r,h,x,y,z,rz)=>{ const l=new THREE.Mesh(new THREE.CapsuleGeometry(r,h,8,16),green); l.position.set(x,y,z); l.rotation.z=rz||0; G.add(l); for(let i=0;i<10;i++){ const a=i*2.4, yy=(i/10-.5)*h; const sp=new THREE.Mesh(new THREE.ConeGeometry(.006,.05,4),spine); sp.position.set(x+Math.cos(a)*r,y+yy,z+Math.sin(a)*r); sp.lookAt(x+Math.cos(a)*r*3,y+yy,z+Math.sin(a)*r*3); sp.rotateX(Math.PI/2); G.add(sp); } };
    lobe(.13,.22,0,.3,0); lobe(.07,.1,.17,.36,0,-.6); lobe(.06,.08,-.16,.3,0,.7);
    const pot=new THREE.Mesh(new THREE.CylinderGeometry(.16,.12,.16,24),std(0xb8683e,{roughness:.85})); pot.position.y=.08; G.add(pot);
    if(eyed){ const E=new THREE.Group(); E.name='cactusEye'; E.position.set(0,.36,.11); G.add(E); const ball=new THREE.Mesh(new THREE.SphereGeometry(.09,24,18),std(0xf6f2ee,{roughness:.15})); E.add(ball);
      const iris=new THREE.Mesh(new THREE.CircleGeometry(.05,24),std(0x2a9a4a,{roughness:.2})); iris.position.z=.088; E.add(iris); const pu=new THREE.Mesh(new THREE.CircleGeometry(.022,20),std(0x060606,{roughness:.1})); pu.position.z=.09; E.add(pu);
      const hl=new THREE.Mesh(new THREE.CircleGeometry(.01,10),new THREE.MeshBasicMaterial({color:0xffffff})); hl.position.set(-.015,.018,.091); E.add(hl);
      const lid=new THREE.Mesh(new THREE.SphereGeometry(.096,24,12,0,Math.PI*2,0,Math.PI*.36),std(0xe08aa0)); lid.name='cactusLid'; E.add(lid); }
    G.scale.setScalar(s); return G; };
  // the bonsai: a twisted trunk in a red-brown glazed pot, pads of leaves; grown bigger with age (0..1). The seller herself has a face and curls in the crown.
  PLANTS.bonsai=(age=0,her=false)=>{ const G=new THREE.Group(), bark=std(0x5a4030,{roughness:.95}), leaf=std(0x5a8a3a,{roughness:.85});
    const pot=new THREE.Mesh(new THREE.CylinderGeometry(.2,.17,.1,28),std(0x8a3a2a,{roughness:.25,metalness:.1})); pot.scale.z=.7; pot.position.y=.05; G.add(pot);
    const soil=new THREE.Mesh(new THREE.CircleGeometry(.19,24),std(0x3a2a20,{roughness:1})); soil.rotation.x=-Math.PI/2; soil.scale.y=.7; soil.position.y=.101; G.add(soil);
    const k=.45+.55*age, pts=[[0,.1,0],[.03,.18,0],[-.02,.26,.01],[.04,.34,0]].map(p=>new THREE.Vector3(p[0],.1+(p[1]-.1)*k*1.6,p[2])); const tr=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.022*k+.008,8),bark); G.add(tr);
    const top=pts[3]; const pads=her?3:2+Math.round(age*4); for(let i=0;i<pads;i++){ const a=i*2.3, d=(.06+.05*(i%2))*k, p=new THREE.Mesh(new THREE.SphereGeometry(.07*k+.03,16,10),leaf); p.scale.set(1.3,.55,1); p.position.set(top.x+Math.cos(a)*d,top.y-.02+(i%3)*.03*k,top.z+Math.sin(a)*d*.7); G.add(p); }
    if(her){ const face=new THREE.Mesh(new THREE.SphereGeometry(.06,20,14),std(0x7aa858,{roughness:.6})); face.position.set(top.x,top.y+.08,top.z+.03); G.add(face);
      for(const s of [1,-1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(.009,8,6),std(0x141414)); e.position.set(top.x+.02*s,top.y+.09,top.z+.085); G.add(e); }
      const m=new THREE.Mesh(new THREE.TorusGeometry(.014,.003,6,12,Math.PI),std(0x3a1a1a)); m.position.set(top.x,top.y+.065,top.z+.088); m.rotation.z=Math.PI; G.add(m);
      for(let i=0;i<9;i++){ const c=new THREE.Mesh(new THREE.TorusGeometry(.016,.007,6,12),std(0xe8c870,{roughness:.6})); const a=i/9*Math.PI*2; c.position.set(top.x+Math.cos(a)*.045,top.y+.13+Math.sin(a*2)*.01,top.z+Math.sin(a)*.04); c.rotation.set(a,a*.5,0); G.add(c); }
      const sc=new THREE.Mesh(new THREE.TorusGeometry(.045,.012,8,20),std(0xe87a28,{roughness:.9})); sc.rotation.x=Math.PI/2; sc.position.set(top.x,top.y+.03,top.z+.01); G.add(sc); }
    G.userData.age=age; return G; };

  // who the cactus looks at: you if you are near, else the nearest other player, else it glances about
  const V=new THREE.Vector3(), W=new THREE.Vector3(), Q=new THREE.Quaternion(), F0=new THREE.Vector3(0,0,1), M4=new THREE.Matrix4();
  PLANTS.look=(eye,dt,t,seed=0)=>{ '@later'; eye.getWorldPosition(W); let tx=null, d=6*T; const me=Math.hypot(pos.x-W.x,pos.z-W.z); if(me<d){ tx=[pos.x,SHARED.py+1.5*T,pos.z]; d=me; }
    if(!tx)for(const [,o] of ONLINE.others||[]){ if(!o.p)continue; const q=Math.hypot(o.p.x-W.x,o.p.z-W.z); if(q<d){ d=q; tx=[o.p.x,(o.p.y||0)+1.5*T,o.p.z]; } }
    if(!tx){ const a=Math.sin(t*.4+seed)*1.2; tx=[W.x+Math.sin(a)*3*T,W.y,W.z+Math.cos(a)*3*T]; }
    V.set(tx[0],tx[1],tx[2]); M4.copy(eye.parent.matrixWorld).invert(); V.applyMatrix4(M4).sub(eye.position).normalize(); Q.setFromUnitVectors(F0,V); eye.quaternion.slerp(Q,Math.min(1,dt*4));
    const lid=eye.getObjectByName('cactusLid'); if(lid){ const bl=(t+seed)%5<.12; lid.scale.y=bl?2.6:1; lid.rotation.x=bl?.3:-.15; } };
}
export {PLANTS};

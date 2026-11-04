// THE EYE: a visitor who never speaks — a great eye in a bubble of its own air (Bible: visitors who carry their own atmosphere), drifting over Market St above the crowd, its rust-red fronds swaying like an anemone's; when you are near it turns to watch you.
import {SHARED, THREE} from './003-shx.js';
import {pos, ROOMS, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {LEVEL, MAPG, SYS, TILE} from './006-map-pre.js';
const EYE={}; window.EYE=EYE;
{ const T=TILE, B=SHARED.BOD, M=LEVEL.streets.market;
  const iris=()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'); g.fillStyle='#f2ece4'; g.fillRect(0,0,128,128);
    for(let i=0;i<40;i++){ g.strokeStyle=`rgba(190,60,50,${.15+Math.random()*.25})`; g.lineWidth=.6; g.beginPath(); const a=Math.random()*6.3; g.moveTo(64+Math.cos(a)*64,64+Math.sin(a)*64); g.quadraticCurveTo(64+Math.cos(a+.3)*50,64+Math.sin(a+.3)*50,64+Math.cos(a)*38,64+Math.sin(a)*38); g.stroke(); }
    const r=g.createRadialGradient(64,64,6,64,64,30); r.addColorStop(0,'#7aa8c0'); r.addColorStop(.7,'#9cc4d8'); r.addColorStop(1,'#3a5a6a'); g.fillStyle=r; g.beginPath(); g.arc(64,64,30,0,7); g.fill();
    g.fillStyle='#050505'; g.beginPath(); g.arc(64,64,14,0,7); g.fill(); g.fillStyle='rgba(255,255,255,.85)'; g.beginPath(); g.arc(56,56,4,0,7); g.fill();
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const make=()=>{ const G=new THREE.Group(), E=new THREE.Group(); G.add(E);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.42,40,30),new THREE.MeshStandardMaterial({map:iris(),roughness:.25})); eye.rotation.y=-Math.PI/2; E.add(eye);
    const fr=new THREE.MeshStandardMaterial({color:0x8a3a2a,roughness:.55,emissive:0x2a0a04}), F=[];
    for(let i=0;i<34;i++){ const a=i/34*Math.PI*2, L=.45+.25*Math.sin(i*2.7), pts=[]; for(let k=0;k<6;k++){ const u=k/5, rr=.4+u*L; pts.push(new THREE.Vector3(Math.cos(a)*rr,Math.sin(a)*rr,-.15-u*.25+Math.sin(u*3+i)*.05)); }
      const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),10,.022*(1.2-.4*Math.sin(i)),6),fr); m.userData.a=a; m.userData.ph=i*.7; E.add(m); F.push(m); }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.43,.07,12,40),fr); ring.position.z=-.08; E.add(ring);
    const bub=new THREE.Mesh(new THREE.SphereGeometry(1.25,40,30),new THREE.MeshStandardMaterial({color:0xe8f4ff,transparent:true,opacity:.16,roughness:.03,metalness:.2,depthWrite:false,side:THREE.DoubleSide})); G.add(bub);
    const hl=new THREE.Mesh(new THREE.SphereGeometry(.18,16,12),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,depthWrite:false})); hl.position.set(-.55,.6,.6); hl.scale.set(1,.5,.3); G.add(hl);
    G.userData.E=E; G.userData.F=F; G.scale.setScalar(T); return G; };
  const S={x:0,z:0,y:3.6*T,to:null,v:1.1*T,g:null,t:0};
  const pick=()=>({x:B.XS(M.x0+20+Math.random()*(M.x1-M.x0-40)),z:B.ZS(-72+Math.random()*28)});
  const Q=new THREE.Quaternion(), F0=new THREE.Vector3(0,0,1), D=new THREE.Vector3();
  SYS.add('life',dt=>{ dt=dt||0; if(!B||!B.XS)return; if(!S.g){ const p=pick(); S.x=p.x; S.z=p.z; S.g=make(); S.g.name='the eye'; MAPG.bodega.add(S.g);
      const hb=new THREE.Mesh(new THREE.SphereGeometry(1.3,8,6),new THREE.MeshBasicMaterial({visible:false})); S.g.add(hb); if(UI.thing)UI.thing({name:'A VISITOR',obj:hb,reach:5*T,near:7*T,tall:5*T,act:()=>{ SAY('IT LOOKS AT YOU. IT SAYS NOTHING.','#c8d8e8'); }}); }
    const far=Math.hypot(pos.x-S.x,pos.z-S.z)>70*T||ROOMS.cur||SHARED.LVL!=='up'; S.g.visible=!far; S.t+=dt;
    if(!S.to||Math.hypot(S.to.x-S.x,S.to.z-S.z)<1*T)S.to=pick(); const dx=S.to.x-S.x, dz=S.to.z-S.z, d=Math.hypot(dx,dz)||1; S.x+=dx/d*S.v*dt; S.z+=dz/d*S.v*dt;
    if(far)return; const gy=SHARED.groundY?SHARED.groundY(S.x,S.z):0; S.g.position.set(S.x,gy+S.y+Math.sin(S.t*.9)*.25*T,S.z);
    const E=S.g.userData.E, me=Math.hypot(pos.x-S.x,pos.z-S.z)<16*T; D.set(me?pos.x-S.x:dx,me?(SHARED.py+1.5*T)-S.g.position.y:-.3*T,me?pos.z-S.z:dz).normalize(); Q.setFromUnitVectors(F0,D); E.quaternion.slerp(Q,Math.min(1,dt*(me?3:1)));
    for(const f of S.g.userData.F){ f.rotation.z=Math.sin(S.t*1.4+f.userData.ph)*.06; f.rotation.x=Math.sin(S.t*1.1+f.userData.ph)*.05; } },'146p-eye');
  EYE.dbg=()=>({x:+S.x.toFixed(1),z:+S.z.toFixed(1),shown:!!S.g&&S.g.visible});
}

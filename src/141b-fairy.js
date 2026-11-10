// THE FAIRY RINGS: FAIRY grows rings of mushrooms in the park.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, PARK, pos, ROOMS, UI, WEEDS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SOL, SYS, TILE} from './006-map-pre.js';
const FAIRY={list:[]}; window.FAIRY=FAIRY;
{ const T=TILE, MAX=3, N=96, g=new THREE.Group(), cap=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,3,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({flatShading:true}),N), stem=new THREE.InstancedMesh(new THREE.CylinderGeometry(.6,.8,1,5),new THREE.MeshLambertMaterial({color:0xe8e0cc,flatShading:true}),N);
  cap.count=stem.count=0; cap.castShadow=stem.castShadow=true; cap.frustumCulled=stem.frustumCulled=false; g.add(cap,stem); scene.add(g);
  const COL=[[0xd8402a,0xf0e6d0],[0xf2ecdc,0xd8c8a8],[0x9a6a3a,0xc89a5a],[0x7ad8e8,0x4ab8d8]], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(); let next=20+Math.random()*40;
  const gy=(x,z)=>(typeof SHARED.groundY==='function'?SHARED.groundY(x,z):0);
  const spawn=()=>{ '@later'; for(let k=0;k<24;k++){ const a=Math.random()*6.283, d=(8+Math.random()*16)*T, x=pos.x+Math.cos(a)*d, z=pos.z+Math.sin(a)*d;
      if(WEEDS&&WEEDS.inPark&&!WEEDS.inPark(x,z))continue; if(SOL.up.some(b=>x>b[0]-2*T&&x<b[2]+2*T&&z>b[1]-2*T&&z<b[3]+2*T))continue; if(FAIRY.list.some(r=>Math.hypot(r.x-x,r.z-z)<5*T))continue;
      const n=9+Math.floor(Math.random()*6), R=(.8+Math.random()*.6)*T, kind=Math.floor(Math.random()*COL.length), M=[];
      for(let i=0;i<n;i++){ const t=i/n*6.283+Math.random()*.3, rr=R*(.9+Math.random()*.2); M.push([x+Math.cos(t)*rr,z+Math.sin(t)*rr,(.09+Math.random()*.07)*T,Math.random()]); }
      const r={x,z,R,M,kind,t:0,life:240+Math.random()*120,th:null}, hb=new THREE.Mesh(new THREE.CylinderGeometry(R,R,.3*T,10),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,gy(x,z)+.15*T,z); g.add(hb);
      r.hb=hb; r.th={name:'A FAIRY RING',obj:hb,reach:1.6*T,near:2.4*T,tall:.4*T,act:()=>FAIRY.pick(r)}; UI.thing(r.th); FAIRY.list.push(r); return r; } return null; };
  const drop=r=>{ g.remove(r.hb); const j=UI.things.indexOf(r.th); if(j>=0)UI.things.splice(j,1); const i=FAIRY.list.indexOf(r); if(i>=0)FAIRY.list.splice(i,1); };
  FAIRY.pick=r=>{ if(r.t<2)return; const id=r.kind===3?'m_moonglow':'m_morel', n=Math.max(2,Math.floor(r.M.length/3)); FORAGE.give(id,n); SAY(`YOU GATHER THE FAIRY RING: ${n} MUSHROOMS.`,'#9fe07f'); drop(r); };
  FAIRY.spawn=spawn;
  const draw=()=>{ '@later'; let k=0; for(const r of FAIRY.list){ const up=Math.min(1,r.t/2.5), fade=Math.min(1,(r.life-r.t)/8), s=up*fade;
      for(const [x,z,h,ph] of r.M){ if(k>=N)break; const y=gy(x,z), w=Math.max(.001,s), bob=1+.05*Math.sin(r.t*1.3+ph*6);
        stem.setMatrixAt(k,m4.compose(new THREE.Vector3(x,y+h*.5*w,z),q,new THREE.Vector3(h*.35*w,h*w,h*.35*w))); cap.setMatrixAt(k,m4.compose(new THREE.Vector3(x,y+h*w,z),q,new THREE.Vector3(h*.75*w*bob,h*.55*w,h*.75*w*bob)));
        cap.setColorAt(k,c.setHex(COL[r.kind][ph<.7?0:1])); k++; } }
    cap.count=stem.count=k; cap.instanceMatrix.needsUpdate=stem.instanceMatrix.needsUpdate=true; if(cap.instanceColor)cap.instanceColor.needsUpdate=true; };
  SYS.add('life',(dt)=>{ const up=SHARED.LVL==='up'&&!ROOMS.cur&&PARK.in; g.visible=up; if(!up)return;
    if((next-=dt)<=0){ next=70+Math.random()*90; if(FAIRY.list.length<MAX)spawn(); }
    for(const r of FAIRY.list.slice()){ r.t+=dt; if(r.t>r.life||Math.hypot(r.x-pos.x,r.z-pos.z)>60*T)drop(r); } if(FAIRY.list.length||cap.count)draw(); },'141b-fairy');
  window.FAIRYAT=()=>spawn(); }

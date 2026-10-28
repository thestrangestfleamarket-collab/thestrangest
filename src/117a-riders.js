// THE RIDERS: a few people on each train, seated in its seats, each in their own colours and height, reading the paper, looking out of the window, asleep, on the phone or just sitting; made the first time you go underground.
import {SHARED, THREE} from './003-shx.js';
import {W3} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {figureMesh, musBody, MUSGEO, musScale} from './110-musician.js';
import {castPose, POSES} from './112-main-14.js';
{ const R=RIG, MAT=R.MATS;
  const hexes={shirt:['#b23a3a','#2f5d9b','#3e7d4a','#d9c24a','#6b4a8c','#e0e0dc','#2b2b2e','#c46a2e','#4d8a8c','#8c5a3c'],pants:['#2a2f3d','#3b3b40','#5b4a36','#1f2a44','#6a6f74','#4a3b2e'],
    skin:['#f1d2bc','#e0b296','#c98f6c','#a26a48','#7a4b30','#5a3622'],hair:['#1a1412','#3b2a1e','#6b4a2c','#a8783e','#d8c08a','#8a8a8a','#c9c9c6'],shoes:['#1c1c1e','#3a2a1e','#e8e6e0','#5a2e22']};
  const shade=(h,k)=>new THREE.Color(h).multiplyScalar(k), RAMP=h=>[1.12,1,.7,.42].map(k=>shade(h,k));
  const IDX={}; for(const k in hexes)IDX[k]=hexes[k].map((h,i)=>{ const n='rd_'+k+i; if(!MAT.includes(n)){ MAT.push(n); W3.ramp.push(RAMP(h)); } return MAT.indexOf(n); });
  const FX=R.FOOTX, AN=R.ANKLE, LEG={L:{ik:[FX+.8,AN,10.6]},R:{ik:[-FX-.6,AN,11]}};
  Object.assign(POSES,{riderSit:{root:[0,14,0],bend:-3,...LEG,hands:{L:[3.8,17.5,7],R:[-3.8,17.5,7]}},
    riderRead:{root:[0,14,0],bend:2,nod:-12,...LEG,hands:{L:[5.2,25,9.5],R:[-5.2,25,9.5]}},
    riderSleep:{root:[0,13.4,-.6],bend:7,nod:-30,side:3,...LEG,hands:{L:[3.2,16.5,6.5],R:[-3.4,16.3,6.8]}},
    riderWindow:{root:[0,14,0],bend:-4,look:48,...LEG,hands:{L:[3.6,17.5,7.2],R:[-3.6,17.5,7.2]}},
    riderPhone:{root:[0,14,0],bend:4,nod:-22,...LEG,hands:{L:[1.6,21.5,8.6],R:[-1.6,21.5,8.6]}}});
  const KINDS=['riderRead','riderWindow','riderSleep','riderPhone','riderSit'];
  const paper=(()=>{ const cv=document.createElement('canvas'); cv.width=128; cv.height=96; const g=cv.getContext('2d'); g.fillStyle='#ece8dc'; g.fillRect(0,0,128,96); g.fillStyle='#1a1a1a'; g.font='900 12px Georgia,serif'; g.fillText('THE STRANGEST TIMES',6,14);
    g.fillRect(6,18,116,1); g.font='700 9px Georgia,serif'; g.fillText('LOOP TRAINS RUN ON TIME',6,30); for(let c=0;c<3;c++)for(let l=0;l<9;l++)g.fillRect(6+c*40,38+l*6,34-(l*7+c*3)%9,2); g.fillStyle='#777'; g.fillRect(84,22,38,14);
    const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; return new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}); })();
  const phoneM=new THREE.MeshBasicMaterial({color:0x9fd4ff});
  const rng=seed=>{ let s=(Math.imul(seed|0,2654435761)^0x9e3779b9)>>>0||7; return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; };
  const make=(car,seat,r)=>{ const body=musBody(), MI=n=>MAT.indexOf(n), pick=a=>a[Math.floor(r()*a.length)], col={shirt:pick(IDX.shirt),pants:pick(IDX.pants),skin:pick(IDX.skin),hair:pick(IDX.hair),shoes:pick(IDX.shoes)};
    const map={[MI('shirt')]:col.shirt,[MI('pants')]:col.pants,[MI('skin')]:col.skin,[MI('hair')]:col.hair,[MI('shoes')]:col.shoes}, bald=r()<.18;
    const PCS=body.PCS.filter(p=>!(bald&&p.n==='hair')).map(p=>({...p,recol:m=>map[m]}));
    for(const P of PCS)if(!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
    const FM=figureMesh(PCS,'rider'), g=new THREE.Group(), kind=pick(KINDS), h=.92+r()*.16; g.add(FM.me); g.position.set(seat.x,seat.floor,seat.z+seat.s*.18*TRAINS.T);   // back against the seat, so the legs clear its front
    seat.taken=true; g.rotation.y=seat.hd; musScale(g,h); g.scale.x*=h; g.scale.z*=h;
    if(kind==='riderRead'){ for(const s of [-1,1]){ const q=new THREE.Mesh(new THREE.PlaneGeometry(9,12),paper); q.position.set(s*4.6,26.5,10.4); q.rotation.set(-.18,-s*.35,0); g.add(q); } }
    if(kind==='riderPhone'){ const q=new THREE.Mesh(new THREE.BoxGeometry(2.2,3.6,.4),phoneM); q.position.set(0,22.5,9.2); q.rotation.x=-.7; g.add(q); }
    car.inner.add(g); const P0=castPose(kind), rd={g,FM,PCS,kind,P0,t:r()*10,seat};
    rd.pose=dt=>{ rd.t+=dt; let P=P0; if(kind==='riderSleep'||kind==='riderRead'){ P=JSON.parse(JSON.stringify(P0)); P.root=R.V(P0.root.x,P0.root.y+Math.sin(rd.t*1.1)*.15,P0.root.z); if(kind==='riderSleep')P.nod=P0.nod+Math.sin(rd.t*.37)*.05; }
      R.farOnly(false); const B=R.settle(R.build(P,null),0); PCS.forEach((pc,i)=>FM.set(i,R.frameOf(pc.on||pc.n,B))); };
    rd.pose(0); return rd; };
  const RIDERS=window.RIDERS={list:[],made:false}; let queue=null, pt=0;
  SYS.add('places',dt=>{ if(SHARED.LVL!=='down')return;
    if(!RIDERS.made){ RIDERS.made=true; queue=[]; const day=Math.floor(Date.now()/864e5);
      for(const tn of TRAINS.list){ const r=rng(day*7+tn.id); tn.cars.forEach((car,c)=>{ const free=car.seats.slice(), n=c?2:3; for(let k=0;k<n&&free.length;k++){ const seat=free.splice(Math.floor(r()*free.length),1)[0]; queue.push(()=>RIDERS.list.push(make(car,seat,rng(day*131+tn.id*17+c*5+k)))); } }); } }
    if(queue&&queue.length){ queue.shift()(); return; }
    if((pt-=dt)>0)return; pt=.25; for(const rd of RIDERS.list)if(rd.g.parent&&rd.g.parent.visible&&(rd.kind==='riderSleep'||rd.kind==='riderRead'))rd.pose(.25); },'117a-riders');
}

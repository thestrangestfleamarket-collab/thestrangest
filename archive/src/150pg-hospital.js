// THE HOSPITAL on West St's park side (owner, 12 Nov 2026: "use polyfork assets to add hospital on west st ... the hover ambulance should be in the garage waiting for emergency"): Polyfork's emergency block, clinic annexe, lift tower, canopy and garage on a concrete lot (data/hospital.json, fetched after the start); the hover ambulance waits in the garage and flies out to a player who faints, patches them up and flies back, the same call for everyone (the section's world: ems = x,z,when).
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, pos, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {LEVEL, MODS, OUT, SOL, SYS, TILE} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {KIT} from './068-kit.js';
const HOSPITAL={made:false,call:null}; window.HOSPITAL=HOSPITAL;
{ const P=LEVEL.parkPlaces&&LEVEL.parkPlaces.hospital, DATA=__LAZY__("data/hospital.json"), T=TILE, M=T/.84;
  if(P){ const {XS,ZS}=SHARED.BOD, G=new THREE.Group(), GY=(x,y)=>SHARED.groundY(XS(x),ZS(y)), F=-Math.PI/2, K=1.2, GK=1.5;
    const put=(n,x,y,h,o={})=>KIT.put(n,XS(x),ZS(y),{m:h,rot:o.rot??F,group:G,ground:()=>GY(x,y)+(o.lift||0)*M,solid:o.solid});
    const wall=(x0,y0,x1,y1)=>SOL.up.push([XS(Math.min(x0,x1)),ZS(Math.min(y0,y1)),XS(Math.max(x0,x1)),ZS(Math.max(y0,y1))]);
    const build=()=>{ if(HOSPITAL.made)return; HOSPITAL.made=true; const [ex,ey]=P.er, [ax,ay]=P.annexe, [cx,cy]=P.core, [gx,gy]=P.garage, S=KIT.data;
      // the lot: one concrete slab under it all
      { const x0=ex-9.5, x1=cx+4, y0=ay-7, y1=gy+8.5, m=new THREE.Mesh(new THREE.BoxGeometry((x1-x0)*T,.08*M,(y1-y0)*T),new THREE.MeshLambertMaterial({color:0x9a9890})); m.position.set(XS((x0+x1)/2),GY((x0+x1)/2,(y0+y1)/2)+.02*M,ZS((y0+y1)/2)); m.receiveShadow=true; G.add(m); }
      put('h_er',ex,ey,S.h_er.size[1]*K,{solid:.96}); put('h_annexe',ax,ay,S.h_annexe.size[1]*K,{solid:.96}); put('h_core',cx,cy,S.h_core.size[1]*K,{solid:.96});
      put('h_canopy',ex-7.6,ey,S.h_canopy.size[1]*.8); put('h_gen',cx,ey-6,S.h_gen.size[1],{solid:.9}); put('h_totem',ex-8.6,ay+7.5,S.h_totem.size[1]*1.3,{solid:.5}); put('h_trolley',ex-7.2,ey+1.2,S.h_trolley.size[1],{rot:0});
      put('h_garage',gx,gy,S.h_garage.size[1]*GK); for(const d of [-2.4,0,2.4])put('h_hatch',gx-10.2,gy+d,S.h_hatch.size[1]*GK,{lift:.03});
      // the garage's walls (its door, on the street side, stays open to walk and fly through)
      { const h=S.h_garage.size[0]*GK/.84/2; wall(gx+h-.5,gy-h,gx+h,gy+h); wall(gx-h,gy+h-.5,gx+h,gy+h); wall(gx-h,gy-h,gx+h,gy-h+.5); }
      scene.add(G); OUT.add(G,'open'); };
    HOSPITAL.G=G; SYS.onStart(()=>DATA().then(J=>{ Object.assign(KIT.data,J); build(); }).catch(e=>console.warn('hospital',e)),'150pg-hospital');

    /* ---------- the call: up out of the garage, over to whoever fainted, down beside them a while, and home; everyone works it out from the same x, z and moment ---------- */
    const now=()=>TRAINS.now?TRAINS.now():Date.now()/1000, UP=11*M, V=13*M, STAY=9, RISE=2.5, home=()=>[XS(P.garage[0]),ZS(P.garage[1])];
    HOSPITAL.home=home; HOSPITAL.site=(LEVEL.parkPlaces.sites||[]).some(q=>q.id==='hospital');
    const amb=()=>{ const C=MODS.cars; if(!C||!C.cars)return null; for(const c of C.cars.values())if(c.model==='ambulance')return c; return null; };
    const read=()=>{ const v=String((ONLINE.world||{}).ems||'').split(',').map(Number); return v.length===3&&v.every(isFinite)?{x:v[0],z:v[1],t:v[2]}:null; };
    const legs=c=>{ const [hx,hz]=home(), d=Math.hypot(c.x-hx,c.z-hz), fly=d/V; return {hx,hz,fly,end:RISE*2+fly*2+STAY+RISE*2}; };
    HOSPITAL.at=(c,t)=>{ const L=legs(c), u=t-c.t; if(u<0||u>L.end)return null; const gy=(x,z)=>SHARED.groundY(x,z); let x=L.hx, z=L.hz, y=0, k=0, there=false, r=Math.atan2(c.x-L.hx,c.z-L.hz);
      if(u<RISE)y=u/RISE; else if(u<RISE+L.fly){ k=(u-RISE)/L.fly; y=1; } else if(u<RISE*2+L.fly){ k=1; y=1-(u-RISE-L.fly)/RISE*.92; } else if(u<RISE*2+L.fly+STAY){ k=1; y=.08; there=true; }
      else if(u<RISE*3+L.fly+STAY){ k=1; y=.08+(u-RISE*2-L.fly-STAY)/RISE*.92; r+=Math.PI; } else if(u<RISE*3+L.fly*2+STAY){ k=1-(u-RISE*3-L.fly-STAY)/L.fly; y=1; r+=Math.PI; } else { y=1-(u-RISE*3-L.fly*2-STAY)/RISE; r=-Math.PI/2; }
      x=L.hx+(c.x-L.hx)*k; z=L.hz+(c.z-L.hz)*k; if(k===1&&there){ x+=2.2*M; } return {x,z,y:gy(x,z)+y*UP,r,there}; };
    let M3=null, out=false, was=0, healed=0;
    SYS.add('life',()=>{ const t=now(), C=amb(), cars=MODS.cars;
      // a faint (or a death) calls it, if it is home, nobody is driving it and no call is running
      const down=(VIT.out>0||VIT.dead)?1:0; if(down&&!was&&C&&!C.by&&HOSPITAL.made){ const c=read(); if(!c||t-c.t>legs(c).end+20)ONLINE.put('ems',[pos.x.toFixed(1),pos.z.toFixed(1),t.toFixed(1)].join(',')); } was=down;
      const c=read(), p=c&&C&&cars.build?HOSPITAL.at(c,t):null; HOSPITAL.call=p?c:null;
      if(!p){ if(out){ out=false; if(M3)M3.visible=false; if(C&&C.by==='ems'){ C.by=null; if(cars.at)cars.at(C); } } return; }
      if(!out){ if(C.by&&C.by!=='ems')return; out=true; C.by='ems'; if(cars.at)cars.at(C); if(!M3){ M3=cars.build('ambulance',0); if(!M3){ out=false; C.by=null; return; } M3.traverse(o=>{ o.userData.anyRoom=false; }); scene.add(M3); } }
      M3.visible=!!OUT.open&&SHARED.LVL==='up'; M3.position.set(p.x,p.y+Math.sin(t*2)*.08*M,p.z); M3.rotation.set(0,p.r,0);
      if(p.there&&down&&Math.hypot(pos.x-c.x,pos.z-c.z)<6*M&&t-healed>30){ healed=t; if(VIT.out>1)VIT.out=1; VIT.heal(.35); SAY('THE PARAMEDICS PATCH YOU UP.','#7fdc8a'); } },'150pg-hospital'); }
}

// THE SCANNER: a drone perched at each platform's end flies to every person stepping off a train, hovers before them and scans them (blue grid lines sweeping down the body, a card: who, section, CLEAR), then returns to its perch.
import {SHARED, THREE} from './003-shx.js';
import {DRONE, LOOKS, ONLINE, pos, SCANNER} from './003b-systems.js';
import {MAPG, SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
import {TRAINS} from './009c-trains.js';
{
  const T=TILE, V3=THREE.Vector3, BLUE=0x4fc3ff, flat=o=>new THREE.MeshBasicMaterial(Object.assign({transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,toneMapped:false},o));
  const grid=()=>{ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'); g.strokeStyle='rgba(90,200,255,.6)'; g.lineWidth=2; for(let x=0;x<=256;x+=32){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,256); g.stroke(); g.beginPath(); g.moveTo(0,x); g.lineTo(256,x); g.stroke(); } const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const GT=grid(), drones=[], ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; SCANNER.list=drones;
  const label=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return [c,t]; };
  const fallback=()=>{ const D=new THREE.Group(), m=new THREE.MeshLambertMaterial({color:0x3a3d44}); D.add(new THREE.Mesh(new THREE.BoxGeometry(.3,.08,.3),m)); return {D,rot:[]}; };
  const mk=st=>{ const {D,rot}=DRONE.mk?DRONE.mk():fallback(); D.scale.setScalar(1.4*T/1.13); const eye=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),flat({color:BLUE,opacity:1})); eye.position.set(0,-.06,.12); D.add(eye);
    const perch=new V3(...st.P(LOOP.LEN-2.5,LOOP.MID,165)); D.position.copy(perch); MAPG.down.add(D);
    const S=new THREE.Group(); S.visible=false; MAPG.down.add(S); const h=1.9*T;
    S.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.9*T,h,.7*T)),new THREE.LineBasicMaterial({color:BLUE,transparent:true,opacity:.9,fog:false})));
    S.add(new THREE.Mesh(new THREE.BoxGeometry(.9*T,h,.7*T),flat({color:0x2f9fff,opacity:.08})));
    for(let i=0;i<6;i++){ const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.1*T,.9*T),flat({map:GT,opacity:.8,blending:THREE.AdditiveBlending})); pl.rotation.x=-Math.PI/2; pl.position.y=-h/2+.1*T+i*(h-.2*T)/5; S.add(pl); }
    const sweep=new THREE.Mesh(new THREE.PlaneGeometry(1.3*T,1.1*T),flat({color:0x9fe8ff,opacity:.5,blending:THREE.AdditiveBlending})); sweep.rotation.x=-Math.PI/2; S.add(sweep);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.01,.12*T,1,10,1,true),flat({color:0x6fd0ff,opacity:.25,blending:THREE.AdditiveBlending})); MAPG.down.add(beam); beam.visible=false;
    const [cv,tex]=label(512,128); const card=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,fog:false})); card.scale.set(1.6*T,.4*T,1); card.visible=false; MAPG.down.add(card);
    const d={st,D,rot,perch,S,sweep,beam,card,cv,tex,ph:'perch',t:0,target:null,queue:[],h,done:0}; drones.push(d); return d; };
  const write=(d,name)=>{ const g=d.cv.getContext('2d'), W=512, H=128; g.clearRect(0,0,W,H); g.fillStyle='rgba(10,20,34,.85)'; g.fillRect(0,0,W,H); g.strokeStyle='#4fc3ff'; g.lineWidth=3; g.strokeRect(2,2,W-4,H-4); g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#7fd8ff'; g.font='30px Silkscreen,monospace'; g.fillText('SCANNING  ·  '+name,W/2,40); g.font='22px Silkscreen,monospace'; g.fillStyle='#ece5d3'; g.fillText('SECTION '+d.st.id+'  ·  CLEAR',W/2,88); d.tex.needsUpdate=true; };
  const at=t=>t.id==='me'?new V3(pos.x,SHARED.py,pos.z):(()=>{ const o=ONLINE.others.get(t.id); return o&&o.p?new V3(o.p.x,o.p.y||SHARED.py,o.p.z):new V3(t.x,t.y,t.z); })();
  const hover=(d,p)=>{ const mid=new V3(...d.st.P(LOOP.LEN/2,LOOP.MID,0)); const dir=mid.sub(p); dir.y=0; if(dir.lengthSq()<1e-4)dir.set(1,0,0); dir.normalize(); return p.clone().addScaledVector(dir,1.1*T).add(new V3(0,2.5*T,0)); };
  const step=(d,dt)=>{ for(const r of d.rot||[])r.rotation.y+=dt*40; d.t+=dt;
    if(d.ph==='perch'){ if(d.queue.length){ d.target=d.queue.shift(); d.from=d.D.position.clone(); d.ph='go'; d.t=0; write(d,d.target.name); } return; }
    const p=at(d.target), H=hover(d,p);
    if(d.ph==='go'){ const k=ease(Math.min(1,d.t/1.1)); d.D.position.lerpVectors(d.from,H,k); d.D.lookAt(p.x,d.D.position.y,p.z); if(k>=1){ d.ph='scan'; d.t=0; d.S.visible=d.beam.visible=d.card.visible=true; } return; }
    if(d.ph==='scan'){ d.D.position.lerp(H,Math.min(1,dt*4)); d.D.lookAt(p.x,d.D.position.y,p.z); d.S.position.set(p.x,p.y+d.h/2,p.z); const u=d.t/2.4, s=1-Math.abs(((u*2)%2)-1); d.sweep.position.y=-d.h/2+.1*T+s*(d.h-.2*T);
      const a=d.D.position.clone().add(new V3(0,-.05,0)), b=d.S.position.clone().add(new V3(0,d.sweep.position.y,0)), v=b.clone().sub(a), l=v.length(); d.beam.position.copy(a).addScaledVector(v,.5); d.beam.scale.set(1,l,1); d.beam.quaternion.setFromUnitVectors(new V3(0,-1,0),v.normalize());
      d.card.position.set(p.x,p.y+d.h+.25*T,p.z); if(d.t>2.4){ d.ph='back'; d.t=0; d.from=d.D.position.clone(); d.S.visible=d.beam.visible=d.card.visible=false; d.done++; } return; }
    if(d.ph==='back'){ const k=ease(Math.min(1,d.t/1.3)); d.D.position.lerpVectors(d.from,d.perch,k); if(k>=1){ d.ph='perch'; d.target=null; } } };
  const myName=()=>((LOOKS.L&&LOOKS.L.name)||'').trim()||'A TENANT';
  const inCar=p=>TRAINS.cars().some(({c})=>c.peek&&c.peek.b&&c.peek.b.containsPoint(p));
  const was=new Map(), tmp=new V3();
  SCANNER.off=(id,name,p)=>{ const h=LOOP.here&&LOOP.here(p.x,p.z); const d=h&&h.d<40*T&&drones.find(q=>q.st===h.st); if(!d)return false; if(!d.queue.some(q=>q.id===id)&&!(d.target&&d.target.id===id))d.queue.push({id,name,x:p.x,y:p.y,z:p.z}); return true; };
  SYS.add('places',dt=>{ if(!LOOP.STA||!MAPG.down)return; for(const st of LOOP.STA)if(st.P&&!drones.some(d=>d.st===st))mk(st); if(SHARED.LVL!=='down')return;
    const me=!!(TRAINS.ride&&TRAINS.ride.c); if(was.get('me')&&!me)SCANNER.off('me',myName(),tmp.set(pos.x,SHARED.py,pos.z)); was.set('me',me);
    for(const o of ONLINE.others.values()){ if(!o.p)continue; const inn=inCar(tmp.set(o.p.x,o.p.y||SHARED.py,o.p.z)); if(was.get(o.id)&&!inn)SCANNER.off(o.id,o.name||'A TENANT',tmp); was.set(o.id,inn); }
    for(const d of drones)step(d,dt); },'159e-scanner');
  SCANNER.state=()=>drones.map(d=>({st:d.st.id,ph:d.ph,done:d.done,queue:d.queue.length,at:d.D.position.toArray().map(v=>+v.toFixed(2)),scan:d.S.visible}));
  window.SCANNER=SCANNER;
}

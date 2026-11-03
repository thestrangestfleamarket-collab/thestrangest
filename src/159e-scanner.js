// THE SCANNER: every platform has two security drones that float about and perch on what they can (the bench backs, the bins, the passport machine, the platform's end); within ten to twenty seconds of anyone showing up on the platform (off a train, down the stairs, at the start) one flies to them, hovers before them and scans them (a retro blue grid drawn on the body itself, a bright band sweeping up and down it, and a card in sharp page text: who, section, CLEAR), then goes back to floating about.
import {SHARED, THREE} from './003-shx.js';
import {DRONE, LOOKS, ONLINE, pos, SCANNER, VR, W3} from './003b-systems.js';
import {MAPG, QS, SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
import {TRAINS} from './009c-trains.js';
import {LABELS} from './104-labels.js';
{
  const T=TILE, V3=THREE.Vector3, BLUE=0x4fc3ff, N=2, rnd=(a,b)=>a+Math.random()*(b-a), flat=o=>new THREE.MeshBasicMaterial(Object.assign({transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,toneMapped:false},o));
  SCANNER.DELAY=QS.get('scanin')?[+QS.get('scanin'),+QS.get('scanin')]:[10,20];   // (?scanin=S holds the wait for the tests)
  const grid=()=>{ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'); g.strokeStyle='rgba(90,200,255,.6)'; g.lineWidth=2; for(let x=0;x<=256;x+=32){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,256); g.stroke(); g.beginPath(); g.moveTo(0,x); g.lineTo(256,x); g.stroke(); } const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const gridMat=()=>{ const U={uY:{value:0},uC:{value:.11*T}}, m=new THREE.MeshBasicMaterial({color:0x4fc3ff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
      sh.vertexShader='varying vec3 vSW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n{ vec4 sw=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nsw=instanceMatrix*sw;\n#endif\nvSW=(modelMatrix*sw).xyz; }');
      sh.fragmentShader='uniform float uY; uniform float uC; varying vec3 vSW;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n{ float ly=step(fract(vSW.y/uC),.16), lx=step(fract((vSW.x+vSW.z)/uC),.12), g=max(lx,ly), b=exp(-pow((vSW.y-uY)/(uC*1.2),2.0)), row=step(.5,fract(vSW.y/(uC*.5)));\n gl_FragColor=vec4(diffuse*(g*.85+b*1.6+row*.08), clamp(g*.75+b*.6+row*.06,0.0,1.0)*opacity); }'); };
    m.userData.U=U; return m; };
  const bodyOf=t=>{ if(!t)return null; if(t.id==='me')return W3.group; const o=ONLINE.others.get(t.id); return o&&o.fig?o.fig.g:null; };
  const dress=d=>{ undress(d); const root=bodyOf(d.target); if(!root)return; const L=[];
    root.traverse(m=>{ if(!m.isMesh||m.userData.scanOv)return; const mm=[].concat(m.material); if(mm.every(x=>!x||x.visible===false))return; let o;
      if(m.isSkinnedMesh){ o=new THREE.SkinnedMesh(m.geometry,d.GM); o.bind(m.skeleton,m.bindMatrix); o.bindMode=m.bindMode; }
      else if(m.isInstancedMesh){ o=new THREE.InstancedMesh(m.geometry,d.GM,m.instanceMatrix.count); o.instanceMatrix=m.instanceMatrix; o.count=m.count; }
      else o=new THREE.Mesh(m.geometry,d.GM);
      o.userData.scanOv=1; o.frustumCulled=false; o.renderOrder=6; o.castShadow=o.receiveShadow=false; L.push([m,o]); });
    for(const [m,o] of L)m.add(o); d.ov=L; };
  const undress=d=>{ for(const [,o] of d.ov||[])o.removeFromParent(); d.ov=null; };
  const GT=grid(), drones=[], Q=new Map(), ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; SCANNER.list=drones;
  const label=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return [c,t]; };
  // where a drone can sit on this platform (u along, a across, h up): the end, the bench backs, and on the first platform the bins and the passport machine
  const perches=st=>{ const SL=SHARED.METRO&&SHARED.METRO.SL, M=LOOP.MID, out=[['end',LOOP.LEN-2.5,M,165]];
    for(const by of (SL&&SL.BENCH)||[])out.push(['bench',by+1.6,M,42]);
    if(st.old&&SL){ for(const y of SL.BINS||[])out.push(['bin',y,M,38]); const K=SHARED.METRO.MACH; if(K)out.push(['machine',K.y,K.x,54]); }
    return out.map(([n,u,a,h])=>({n,at:new V3(...st.P(u,a,h))})); };
  const mid=st=>new V3(...st.P(LOOP.LEN/2,LOOP.MID,0));
  const mk=(st,i)=>{ const {D}=DRONE.mk({lens:BLUE,parcel:false,s:1.4*T/1.13});
    const P=perches(st), sit0=P[i%P.length]; D.position.copy(sit0.at); MAPG.down.add(D);
    const S=new THREE.Group(); S.visible=false; MAPG.down.add(S); const h=1.9*T;
    const sweep=new THREE.Object3D(); S.add(sweep);   // where the sweep is: the beam ends there and the body's grid is brightest there
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.01,.12*T,1,10,1,true),flat({color:0x6fd0ff,opacity:.25,blending:THREE.AdditiveBlending})); MAPG.down.add(beam); beam.visible=false;
    const [cv,tex]=label(512,128); const card=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,fog:false})); card.scale.set(1.6*T,.4*T,1); card.visible=false; MAPG.down.add(card);   // the card in the headset; on the screen it is page text (LABELS)
    const d={st,D,P,on:sit0,S,sweep,beam,card,cv,tex,lab:LABELS.add(),GM:gridMat(),ov:null,ph:'perch',t:0,sit:rnd(6,14),from:null,to:null,next:null,dur:1,target:null,h,done:0}; face(d,mid(st)); drones.push(d); if(!Q.has(st))Q.set(st,[]); return d; };
  const face=(d,p)=>d.D.lookAt(p.x,d.D.position.y,p.z);
  const write=(d,name)=>{ const g=d.cv.getContext('2d'), W=512, H=128; g.clearRect(0,0,W,H); g.fillStyle='rgba(10,20,34,.85)'; g.fillRect(0,0,W,H); g.strokeStyle='#4fc3ff'; g.lineWidth=3; g.strokeRect(2,2,W-4,H-4); g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#7fd8ff'; g.font='30px Silkscreen,monospace'; g.fillText('SCANNING  ·  '+name,W/2,40); g.font='22px Silkscreen,monospace'; g.fillStyle='#ece5d3'; g.fillText('SECTION '+d.st.id+'  ·  CLEAR',W/2,88); d.tex.needsUpdate=true;
    const e=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); d.lab.set('<div style="background:rgba(10,20,34,.88);border:2px solid #4fc3ff;padding:6px 14px 7px;font-family:Silkscreen,monospace;letter-spacing:.5px;box-shadow:0 0 10px rgba(79,195,255,.35)"><div style="font-size:14px;color:#7fd8ff">SCANNING &nbsp;·&nbsp; '+e(name)+'</div><div style="font-size:11px;color:#ece5d3;margin-top:3px">SECTION '+e(d.st.id)+' &nbsp;·&nbsp; CLEAR</div></div>'); };
  const at=t=>t.id==='me'?new V3(pos.x,SHARED.py,pos.z):(()=>{ const o=ONLINE.others.get(t.id); return o&&o.p?new V3(o.p.x,o.p.y||SHARED.py,o.p.z):new V3(t.x,t.y,t.z); })();
  const hover=(d,p)=>{ const dir=mid(d.st).sub(p); dir.y=0; if(dir.lengthSq()<1e-4)dir.set(1,0,0); dir.normalize(); return p.clone().addScaledVector(dir,1.1*T).add(new V3(0,2.5*T,0)); };
  const fly=(d,to,next,dur)=>{ d.from=d.D.position.clone(); d.to=to; d.next=next; d.dur=dur||Math.max(.9,Math.min(2.4,d.from.distanceTo(to)/(6*T))); d.ph='fly'; d.t=0; };
  const free=d=>d.ph==='perch'||d.ph==='float'||(d.ph==='fly'&&d.next!=='scan');
  const elsewhere=d=>{ const taken=drones.filter(q=>q!==d&&q.st===d.st).map(q=>q.on), open=d.P.filter(p=>p!==d.on&&!taken.includes(p)); return open.length?open[Math.floor(Math.random()*open.length)]:d.P[0]; };
  const drift=d=>new V3(...d.st.P(rnd(4,LOOP.LEN-4),LOOP.MID+rnd(-2,2),150));
  const wander=d=>{ if(Math.random()<.4){ d.on=null; fly(d,drift(d),'float'); } else { d.on=elsewhere(d); fly(d,d.on.at,'perch'); } };
  const step=(d,dt)=>{ d.t+=dt;
    if(d.ph==='perch'){ if(d.t>d.sit)wander(d); return; }
    if(d.ph==='float'){ d.D.position.copy(d.to).add(new V3(Math.sin(d.t*.7)*.3*T,Math.sin(d.t*1.3)*.12*T,Math.cos(d.t*.5)*.3*T)); if(d.t>d.sit){ d.on=elsewhere(d); fly(d,d.on.at,'perch'); } return; }
    if(d.ph==='fly'){ const goal=d.next==='scan'?hover(d,at(d.target)):d.to, k=ease(Math.min(1,d.t/d.dur)); d.D.position.lerpVectors(d.from,goal,k); d.D.position.y+=Math.sin(k*Math.PI)*.6*T*(d.next==='perch'?1:0);
      if(d.next==='scan')face(d,at(d.target)); else if(k<1)face(d,goal); else face(d,mid(d.st));
      if(k>=1){ d.ph=d.next; d.t=0; d.sit=d.next==='float'?rnd(4,8):rnd(6,14); if(d.next==='scan'){ d.S.visible=d.beam.visible=true; dress(d); } } return; }
    if(d.ph==='scan'){ const p=at(d.target), H=hover(d,p); d.D.position.lerp(H,Math.min(1,dt*4)); face(d,p); d.S.position.set(p.x,p.y+d.h/2,p.z); const u=d.t/2.4, s=1-Math.abs(((u*2)%2)-1); d.sweep.position.y=-d.h/2+.1*T+s*(d.h-.2*T);
      const a=d.D.position.clone().add(new V3(0,-.05,0)), b=d.S.position.clone().add(new V3(0,d.sweep.position.y,0)), v=b.clone().sub(a), l=v.length(); d.beam.position.copy(a).addScaledVector(v,.5); d.beam.scale.set(1,l,1); d.beam.quaternion.setFromUnitVectors(new V3(0,-1,0),v.normalize());
      d.GM.userData.U.uY.value=b.y; for(const [m,o] of d.ov||[])if(o.isInstancedMesh)o.count=m.count; if(!d.ov||!d.ov.length)dress(d);
      d.card.visible=!!VR.on; d.card.position.set(p.x,p.y+d.h+.25*T,p.z); d.lab.at(p.x,p.y+d.h+.5*T,p.z).show(!VR.on);
      if(d.t>2.4){ d.S.visible=d.beam.visible=d.card.visible=false; d.lab.show(false); undress(d); d.done++; d.target=null; d.on=elsewhere(d); fly(d,d.on.at,'perch'); } } };
  const myName=()=>((LOOKS.L&&LOOKS.L.name)||'').trim()||'A TENANT';
  const inCar=p=>TRAINS.cars().some(({c})=>c.peek&&c.peek.b&&c.peek.b.containsPoint(p));
  const here=(x,z)=>{ const h=LOOP.here&&LOOP.here(x,z); return h&&h.d<40*T&&Q.has(h.st)?h.st:null; };
  const on=new Map(), tmp=new V3();
  const queue=(st,id,name,due)=>{ const q=Q.get(st); if(!q)return false; const t=q.find(t=>t.id===id); if(t)t.due=Math.min(t.due,due); else if(!drones.some(d=>d.st===st&&d.target&&d.target.id===id))q.push({id,name,due}); return true; };
  // someone showing up on a platform (not here last frame) is scanned once, DELAY seconds later; gone and back is a new showing up
  const seen=(id,name,st)=>{ const w=on.get(id); if(!st){ on.delete(id); return; } if(w===st)return; on.set(id,st); const [a,b]=SCANNER.DELAY; queue(st,id,name,Date.now()+rnd(a,b)*1000); };
  SCANNER.off=(id,name,p)=>{ const st=here(p.x,p.z); return !!st&&queue(st,id,name,Date.now()); };
  SYS.add('places',dt=>{ if(!LOOP.STA||!MAPG.down)return; for(const st of LOOP.STA)if(st.P&&!drones.some(d=>d.st===st))for(let i=0;i<N;i++)mk(st,i); if(SHARED.LVL!=='down'){ if(on.size){ on.clear(); for(const q of Q.values())q.length=0; } return; }
    seen('me',myName(),TRAINS.ride&&TRAINS.ride.c?null:here(pos.x,pos.z));
    for(const o of ONLINE.others.values()){ if(!o.p)continue; seen(o.id,o.name||'A TENANT',o.p.lv!=='down'||inCar(tmp.set(o.p.x,o.p.y||SHARED.py,o.p.z))?null:here(o.p.x,o.p.z)); }
    for(const id of on.keys())if(id!=='me'&&!ONLINE.others.has(id))on.delete(id);
    const now=Date.now(); for(const [st,q] of Q){ for(let i=0;i<q.length;i++){ const t=q[i]; if(t.due>now)continue; if(on.get(t.id)!==st){ q.splice(i--,1); continue; }
        const p=at(t), d=drones.filter(x=>x.st===st&&free(x)).sort((a,b)=>a.D.position.distanceTo(p)-b.D.position.distanceTo(p))[0]; if(!d)continue; q.splice(i--,1); d.target=t; d.on=null; write(d,t.name); fly(d,hover(d,p),'scan'); } }
    for(const d of drones)step(d,dt); },'159e-scanner');
  SCANNER.state=()=>drones.map(d=>({st:d.st.id,ph:d.ph,next:d.next,perch:d.on?d.on.n:null,done:d.done,queue:(Q.get(d.st)||[]).length,at:d.D.position.toArray().map(v=>+v.toFixed(2)),scan:d.S.visible}));
  SCANNER.pending=()=>[...Q].flatMap(([st,q])=>q.map(t=>({st:st.id,id:t.id,due:t.due})));
  window.SCANNER=SCANNER;
}

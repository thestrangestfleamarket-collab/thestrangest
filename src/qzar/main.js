// SLOWFIRE DUEL (/qzar): a one-on-one dodge duel of slow shots, against a bot or another player, on a screen or in a headset (VR or passthrough)
import * as THREE from 'three';
import { Peer } from 'peerjs';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { WCOL, makeGun, makeShield, makeShot, makeBeam, glowTex, setEnv } from './guns.js';
import { makeBody } from './body.js';
import { initAudio, sfx } from './audio.js';
import { Materials } from '../shoot/textures.js';
import { ROOM, JET, HOLSTERS, wallHit, fly, bank, leave, makeRoom } from './disc.js';
const $=id=>document.getElementById(id);
const app=$('app'),canvas=$('view'),note=$('note'),statusEl=$('status');
const V3=THREE.Vector3;

/* ---------- tuning ---------- */
const PZ=4, BZ=-4;                       // platform centres on the z axis
const W={
  pip:    {name:'Pip',    hint:'6 quick shots',        ammo:6,dmg:8, speed:5.5,r:.07, cool:.25},
  needle: {name:'Needle', hint:'3 fast, hard hits',    ammo:3,dmg:20,speed:8.5,r:.045,cool:.7},
  scatter:{name:'Scatter',hint:'2 fans of five',       ammo:2,dmg:5, speed:4,  r:.06, cool:.6,pellets:5,spread:.11},
  drifter:{name:'Drifter',hint:'1 slow orb, eats shots',ammo:1,dmg:30,speed:2.2,r:.28, cool:.5,absorb:4},
  twin:   {name:'Twin',   hint:'8 pulls, two shots side by side',  ammo:8,dmg:6, speed:5.5,r:.06, cool:.3, pair:.13,snd:'fire_pip'},
  lobber: {name:'Lobber', hint:'3 bombs that arc over a shield',   ammo:3,dmg:22,speed:6,  r:.12, cool:.8, grav:5,snd:'fire_scatter'},
  ricochet:{name:'Ricochet',hint:'4 discs that skip off the floor',ammo:4,dmg:14,speed:6,  r:.11, cool:.5, bounce:1,snd:'fire_pip'},
  seeker: {name:'Seeker', hint:'2 slow shots that curve at your rival',ammo:2,dmg:16,speed:3,r:.08,cool:.9,home:1.3,ttl:7,snd:'fire_drifter'},
  wall:   {name:'Wall',   hint:'1 wide bar: duck it',              ammo:1,dmg:18,speed:3,  r:.07, cool:1,  half:1.1,axis:'x',snd:'fire_scatter'},
  pillar: {name:'Pillar', hint:'1 tall bar: sidestep it',          ammo:1,dmg:18,speed:3,  r:.07, cool:1,  half:1,axis:'y',snd:'fire_scatter'},
  ring:   {name:'Ring',   hint:'2 growing hoops, safe through the middle',ammo:2,dmg:16,speed:3.2,r:.07,cool:.9,hoop:true,snd:'fire_drifter'},
  burst:  {name:'Burst',  hint:'3 pulls of three quick shots',     ammo:3,dmg:7, speed:6,  r:.055,cool:.7, burst:3,snd:'fire_pip'},
  charger:{name:'Charger',hint:'3 shots: hold to charge, let go to fire',ammo:3,dmg:8,speed:4,r:.06,cool:.4,charge:1.4,snd:'fire_needle'},
  mine:   {name:'Mine',   hint:'2 mines that hang mid-lane and eat shots',ammo:2,dmg:20,speed:3.5,r:.18,cool:.8,absorb:3,stopAt:4.2,ttl:12,snd:'fire_drifter'},
  splitter:{name:'Splitter',hint:'2 shots that split in three halfway',ammo:2,dmg:10,speed:4.5,r:.07,cool:.8,split:3.6,snd:'fire_pip'},
  spiral: {name:'Spiral', hint:'4 shots that corkscrew',           ammo:4,dmg:12,speed:4,  r:.07, cool:.5, spiral:.35,snd:'fire_needle'},
  beam:   {name:'Beam',   hint:'2 one-second lines: sweep them',   ammo:2,dps:18,cool:1.3,beam:1,snd:'fire_needle'},
  breaker:{name:'Breaker',hint:'2 slugs, triple damage to shields',ammo:2,dmg:12,speed:5,  r:.11, cool:.9, shieldMul:3,snd:'fire_scatter'},
  freezer:{name:'Freezer',hint:"2 frost orbs that slow your rival's pickups",ammo:2,dmg:8,speed:3.5,r:.1,cool:.8,chill:8,snd:'fire_drifter'},
  leech:  {name:'Leech',  hint:'3 shots that heal you for half their damage',ammo:3,dmg:10,speed:5,r:.07,cool:.5,leech:.5,snd:'fire_pip'},
  boomerang:{name:'Boomerang',hint:'1 blade that flies out and comes back',ammo:1,dmg:12,speed:7,r:.14,cool:1,boom:2.85,pierce:true,ttl:6,snd:'fire_scatter'},
  curtain:{name:'Curtain',hint:'1 slow sheet of twelve pellets',   ammo:1,dmg:3, speed:2.6,r:.04, cool:1,  grid:true,snd:'fire_scatter'},
  decoy:  {name:'Decoy',  hint:'2 volleys of four: only one shot is real',ammo:2,dmg:20,speed:4.5,r:.07,cool:.9,decoy:4,snd:'fire_pip'},
  buckler:{name:'Buckler',hint:'blocks until its power is spent', shield:true,power:60},
  mirror: {name:'Mirror', hint:'30 power: sends what it stops back', shield:true,power:30,mirror:true},
  thrown: {name:'Thrown',dmg:6,speed:6.5,r:.1,grav:5},
  shard:  {name:'Shard', dmg:10,speed:4.5,r:.06},
  disc:   {name:'Disc',  dmg:25,speed:9,r:.15,walls:2,ttl:10}
};
const KEYS=Object.keys(W).filter(k=>W[k].ammo),SHOTS=[...KEYS,'thrown','shard','disc'],ALL=[...KEYS,'buckler','mirror'];
const POOL=[...ALL,'pip','pip','needle','buckler'];
const DIFF={
  easy:  {speed:1.0,window:.7, err:.50,lead:.3,regrab:3.6,gap:1.3,parry:.1},
  normal:{speed:1.5,window:1.1,err:.28,lead:.7,regrab:2.8,gap:1.0,parry:.25},
  hard:  {speed:2.1,window:1.6,err:.14,lead:1, regrab:2.0,gap:.75,parry:.45}
};
const ROUND_TIME=90, MAX_HP=100, YOU=0x3fd6e0, FOE=0xff7a59, BG=0x0d1326;
const SLOTS_FLAT=[[-.9,.85,0],[.9,.85,0],[-.9,1.75,0],[.9,1.75,0]];
const SLOTS_VR=[[-.45,1.05,-.35],[.45,1.05,-.35],[-.55,1.45,-.25],[.55,1.45,-.25]];
const PH=['menu','count','play','roundEnd','over'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const num=v=>typeof v==='number'&&isFinite(v)?v:0;
const r2=v=>Math.round(v*100)/100;

/* ---------- scene ---------- */
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.xr.enabled=true;
const scene=new THREE.Scene();
const bgColor=new THREE.Color(BG),fog=new THREE.Fog(BG,16,44);
scene.background=bgColor;scene.fog=fog;
const rig=new THREE.Group();rig.position.set(0,0,PZ);scene.add(rig);
const camera=new THREE.PerspectiveCamera(60,1,.05,100);rig.add(camera);
function flatCamera(){camera.position.set(0,2.7,3.8);camera.lookAt(0,1.0,BZ);}
const room=makeRoom();room.visible=false;scene.add(room);
flatCamera();
scene.add(new THREE.HemisphereLight(0xbfd0ff,0x1a1f3a,2.8));
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(3,8,4);scene.add(sun);
const envTex=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture,MAT=new Materials(renderer,256);
for(const k of ['panel','plate'])for(const t of Object.values(MAT.set(k)))t.anisotropy=2;
setEnv(envTex,MAT.set('panel'));
function surface(kind,tint){return new THREE.MeshLambertMaterial({map:MAT.set(kind).map,color:tint});}
function tile(geo,n){const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*n,uv.getY(i)*n);return geo;}

const env=new THREE.Group();scene.add(env);          // hidden in passthrough so the real room shows
const floor=new THREE.Mesh(tile(new THREE.CircleGeometry(40,48),40),surface('plate',0x3d4c8c));
floor.rotation.x=-Math.PI/2;env.add(floor);
const grid=new THREE.GridHelper(40,40,0x2c3a73,0x1c2752);grid.position.y=.01;env.add(grid);
function platform(z,col,parent){
  const g=new THREE.Group();
  const top=new THREE.Mesh(tile(new THREE.CylinderGeometry(1.15,1.15,.12,40),2),surface('panel',0x7c8fe0));
  const mark=new THREE.Mesh(new THREE.RingGeometry(.42,.45,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.55}));mark.rotation.x=-Math.PI/2;mark.position.y=.123;g.add(mark);
  top.position.y=.06;g.add(top);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1.15,.035,8,48),new THREE.MeshBasicMaterial({color:col}));
  rim.rotation.x=Math.PI/2;rim.position.y=.12;g.add(rim);
  g.position.z=z;parent.add(g);
}
platform(PZ,YOU,env);platform(BZ,FOE,scene);
const pylons=new THREE.Group();env.add(pylons);
for(let i=0;i<10;i++){            // distant pylons give the lane some depth
  const h=3+Math.random()*5,side=i%2?1:-1;
  const geo=new THREE.BoxGeometry(.6,h,.6),uv=geo.attributes.uv;for(let k=0;k<uv.count;k++)uv.setY(k,uv.getY(k)*h/.6);
  const p=new THREE.Mesh(geo,surface('panel',0x46558f));
  const strip=new THREE.Mesh(new THREE.BoxGeometry(.03,h*.6,.2),new THREE.MeshBasicMaterial({color:i%2?YOU:FOE,transparent:true,opacity:.5}));strip.position.set(side*(-.29),0,0);p.add(strip);
  p.position.set(side*(5+Math.random()*3),h/2,-12+i*2.4);pylons.add(p);
}

function shieldMesh(col){
  const s=makeShield(col);s.visible=false;return s;
}
function rack(turned){                 // one of each weapon, only the one in use shown
  const g=new THREE.Group(),guns={};
  g.userData.guns=guns;
  g.userData.show=key=>{
    if(key&&!guns[key]){const m=makeGun(key);if(turned)m.rotation.y=Math.PI;g.add(m);guns[key]=m;}
    for(const k in guns)guns[k].visible=k===key;return key?guns[key]:null;
  };
  return g;
}

/* ---------- fighters ---------- */
const pan=x=>clamp((x-you.head.x)/2.5,-1,1);
const youBody=new THREE.Group(),foeBody=new THREE.Group();scene.add(youBody,foeBody);
const youFig=makeBody(YOU,{skin:MAT.set('panel'),env:envTex,opacity:.5,face:-1,floor:.12,onStep:()=>sfx('step',0,.5)});
const foeFig=makeBody(FOE,{skin:MAT.set('panel'),env:envTex,opacity:1,face:1,floor:.12,onStep:x=>sfx('step',pan(x),.22)});
scene.add(youFig.group,foeFig.group);
const you={hp:MAX_HP,head:new V3(0,1.5,PZ),vel:new V3(),wins:0,push:new V3(),chillT:0,lk:0,beam:null};
const foe={hp:MAX_HP,head:new V3(0,1.5,BZ),wins:0,held:null,cool:0,grabT:1,goal:new V3(0,1.5,BZ),wanderT:0,shield:shieldMesh(FOE),shieldP:0,netShield:null,netW:-1,netHands:null,netGh:-1,vel:new V3(),rack:rack(true),discs:[0,0,0,0],lean:0,wantAlt:0,discMesh:makeShot('disc',FOE),netDisc:false,shieldKey:'buckler',chillT:0,lkSeen:0,beamT:0,beamDir:new V3(0,0,1),beam:makeBeam(FOE),netBeam:null};
scene.add(foe.beam);foe.discMesh.visible=false;foeBody.add(foe.discMesh);foe.discMesh.position.set(-.32,-.25,.25);
foe.rack.position.set(-.3,-.2,.15);foe.rack.scale.setScalar(1.5);foeBody.add(foe.rack);
foeBody.add(foe.shield);

function makeHand(parent,visPos,shieldPos){
  const h={parent,held:null,cool:0,want:false,vis:rack(),shield:shieldMesh(YOU),shieldP:0,pad:null,kick:0,base:visPos,was:new V3(),v:new V3(),shieldKey:'buckler',down:false,charging:false,chargeT:0,beamT:0,beamDir:new V3(0,0,-1),beam:makeBeam(YOU),jet:false,disc:false,near:-1,discMesh:makeShot('disc',YOU)};
  scene.add(h.beam);h.discMesh.visible=false;parent.add(h.discMesh);
  h.vis.position.copy(visPos);h.shield.position.copy(shieldPos);
  parent.add(h.vis);parent.add(h.shield);return h;
}
const flatHand=makeHand(youBody,new V3(.3,-.2,-.15),new V3(0,-.15,-.5));flatHand.vis.scale.setScalar(1.5);flatHand.discMesh.position.set(.32,-.25,-.25);
const vrHands=[0,1].map(i=>{
  const c=renderer.xr.getController(i);rig.add(c);
  c.add(new THREE.Mesh(new THREE.SphereGeometry(.035,12,8),new THREE.MeshBasicMaterial({color:YOU})));
  const h=makeHand(c,new V3(0,-.01,0),new V3(0,0,-.14));
  h.sight=new THREE.Mesh(new THREE.CylinderGeometry(.0012,.0012,5,6),new THREE.MeshBasicMaterial({color:YOU,transparent:true,opacity:.35,depthWrite:false}));
  h.sight.rotation.x=Math.PI/2;h.sight.position.set(0,.006,-2.7);h.sight.visible=false;c.add(h.sight);
  c.addEventListener('selectstart',()=>{ if(state==='menu'||state==='over')tryStart(); else{h.want=true;h.down=true;} });
  c.addEventListener('selectend',()=>{h.down=false;});
  c.addEventListener('squeezestart',()=>{h.jet=true;if(game==='duel'){const sp=h.v.length();letGo(h,sp>1.2?h.v.clone().multiplyScalar(1.6).clampLength(3,10):null);}});
  c.addEventListener('squeezeend',()=>{h.jet=false;});
  h.gauge=new THREE.Mesh(new THREE.BoxGeometry(.1,.008,.008),new THREE.MeshBasicMaterial({color:YOU}));h.gauge.position.set(0,.05,.04);h.gauge.visible=false;c.add(h.gauge);
  h.discMesh.position.set(0,0,-.06);
  c.addEventListener('connected',e=>{h.pad=e.data&&e.data.gamepad||null;});
  c.addEventListener('disconnected',()=>{h.pad=null;});
  return h;
});
let mode='flat';
const hands=()=>mode==='vr'?vrHands:[flatHand];

/* ---------- the disc arena: a closed room, discs from your back and hips, a jetpack ---------- */
let game='duel';
const jet={x:0,y:0,vx:0,vy:0,e:JET.energy},foeJet={x:0,y:0,vx:0,vy:0,e:JET.energy},aim={x:0,y:0},aimAt=new V3(0,1.5,BZ),ray=new THREE.Raycaster();
const holst=HOLSTERS.map(()=>{const m=makeShot('disc',YOU);m.scale.setScalar(.8);m.visible=false;scene.add(m);return {m,t:0,at:new V3()};});
const mark=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:YOU,depthTest:false,transparent:true,opacity:.8}));mark.scale.setScalar(.3);mark.visible=false;scene.add(mark);

/* ---------- weapon slots around the player ---------- */
const slots=SLOTS_FLAT.map(()=>{
  const mesh=new THREE.Group(),r=rack(),ring=new THREE.Mesh(new THREE.TorusGeometry(.085,.006,8,32),new THREE.MeshBasicMaterial({color:0xffffff}));
  const lamp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffffff,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.5}));
  ring.rotation.x=Math.PI/2;ring.position.y=-.11;lamp.position.y=-.1;lamp.scale.set(.3,.12,1);
  mesh.add(r,ring,lamp);mesh.visible=false;scene.add(mesh);
  return {mesh,rack:r,ring,lamp,type:null,timer:0,pos:new V3()};
});
function placeSlots(){
  const src=mode==='vr'?SLOTS_VR:SLOTS_FLAT;
  slots.forEach((s,i)=>{s.pos.set(src[i][0],src[i][1],PZ+src[i][2]);s.mesh.position.copy(s.pos);s.rack.scale.setScalar(mode==='vr'?1:1.5);});
}
placeSlots();

/* ---------- projectiles ---------- */
const shots=[],mine=new Map(),remote=new Map(),deadRemote=new Set();
let shotId=1,kills=[];
function spawn(owner,key,pos,vel,gun,pow=1){
  const w=W[key];let mesh;
  if(key==='thrown'){mesh=makeGun(gun);mesh.userData.setAmmo(0);mesh.scale.setScalar(1.3);mesh.userData.tick=dt=>{mesh.rotation.x+=dt*11;};}
  else mesh=makeShot(key,owner===you?YOU:FOE);
  if(w.axis==='y'){pos.y=1.15;vel.y=0;}
  mesh.position.copy(pos);if(!w.half&&!w.hoop&&!w.walls)mesh.lookAt(tmp.copy(pos).add(vel));scene.add(mesh);
  const s={mesh,pos:mesh.position,vel,owner,key,gun,pow,grav:w.grav||0,r:w.r,dmg:w.dmg,absorb:w.absorb||0,life:0,dead:false,id:0,far:false,
    half:w.half||0,axis:w.axis,hoop:!!w.hoop,R:.15,bounce:w.bounce||0,home:w.home||0,ttl:w.ttl||9,stopAt:w.stopAt||0,split:w.split||0,spiral:w.spiral||0,
    boom:w.boom||0,pierce:!!w.pierce,cd:0,walls:w.walls||0,hits:0,trail:0,o0:pos.clone(),dir0:vel.clone().normalize(),mid:pos.clone()};
  if(w.charge){s.dmg=Math.round(8+22*pow);s.r=.06+.12*pow;mesh.scale.setScalar(.7+1.8*pow);}
  if(w.decoy)s.dmg=pow>0?w.dmg:0;
  shots.push(s);return s;
}
const timers=[];
function fire(owner,key,origin,vel,pow=1,again){     // vel is the shot's whole velocity; a weapon's pattern is laid out round it
  const w=W[key],side=new V3(-vel.z,0,vel.x).normalize(),n=w.pellets||1;
  const one=(o,v,pw=pow)=>{const s=spawn(owner,key,o,v,null,pw);if(owner===you){s.id=shotId++;mine.set(s.id,s);}};
  if(w.grid)for(let x=0;x<4;x++)for(let y=0;y<3;y++)one(origin.clone().addScaledVector(side,(x-1.5)*.38).setY(origin.y+(y-1)*.32),vel.clone());
  else if(w.pair){one(origin.clone().addScaledVector(side,w.pair),vel.clone());one(origin.clone().addScaledVector(side,-w.pair),vel.clone());}
  else if(w.decoy){const real=Math.floor(Math.random()*w.decoy);for(let i=0;i<w.decoy;i++)one(origin.clone().addScaledVector(side,(i-(w.decoy-1)/2)*.3),vel.clone(),i===real?1:0);}
  else for(let i=0;i<n;i++){
    const v=vel.clone(),sp=v.length();
    if(n>1){v.addScaledVector(side,(i-(n-1)/2)*w.spread*sp);v.y+=(Math.random()-.5)*w.spread*sp;v.setLength(sp);}
    one(origin.clone(),v);
  }
  if(w.burst&&!again)for(let i=1;i<w.burst;i++)timers.push({t:i*.09,fn:()=>fire(owner,key,origin,vel.clone(),pow,true)});
  puff(origin,owner===you?YOU:FOE,key==='drifter'?.7:.32,.09,null);
  sfx(w.snd||'fire_'+key,pan(origin.x),owner===you?1:.5);fired[key]=(fired[key]||0)+1;
}
const fired={};
function aimVel(key,from,to,err,pow=1){             // the velocity that carries this weapon's shot from one point to another
  const w=W[key];
  if(w.grav)return lob(from,to,err,w);
  const t=new V3().copy(to);if(w.bounce)t.y=.34-t.y;
  const d=t.sub(from).normalize();if(err){d.x+=(Math.random()-.5)*err;d.y+=(Math.random()-.5)*err;d.normalize();}
  return d.multiplyScalar(w.charge?4+4*pow:w.speed);
}
const fx=[];
function puff(pos,col,size,life,vel){
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:col,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));
  s.position.copy(pos);s.scale.setScalar(size);scene.add(s);fx.push({s,life,max:life,vel});
}
function burst(pos,col,big){
  puff(pos,col,big?1.2:.5,.2,null);
  for(let i=0;i<(big?14:7);i++)puff(pos,col,.07,.45,new V3(Math.random()-.5,Math.random()-.3,Math.random()-.5).multiplyScalar(big?3.4:2.4));
}
function updateFx(dt){
  for(let i=fx.length-1;i>=0;i--){
    const f=fx[i];
    if((f.life-=dt)<=0){scene.remove(f.s);f.s.material.dispose();fx.splice(i,1);continue;}
    if(f.vel){f.s.position.addScaledVector(f.vel,dt);f.vel.y-=4*dt;}
    f.s.material.opacity=f.life/f.max;
  }
}
const falling=[];
function dropped(pos,key){const m=makeGun(key);m.userData.setAmmo(0);m.position.copy(pos);scene.add(m);falling.push({m,vy:0});}
function updateFalling(dt){
  for(let i=falling.length-1;i>=0;i--){
    const f=falling[i];f.vy-=9.8*dt;f.m.position.y+=f.vy*dt;f.m.rotation.x+=dt*5;
    if(f.m.position.y<.14){scene.remove(f.m);falling.splice(i,1);sfx('step',pan(f.m.position.x),.5);}
  }
}
function lob(from,to,err,w=W.thrown){   // the throw that lands on a point, however far
  const d=new V3().copy(to).sub(from),t=d.length()/w.speed;
  d.divideScalar(t);d.y+=w.grav*t/2;if(err){d.x+=(Math.random()-.5)*err;d.y+=(Math.random()-.5)*err;}
  return d;
}
function letGo(h,vel){                  // open the hand: the thing drops, or flies if it was thrown
  const key=h.shieldP>0?h.shieldKey:h.held?h.held.key:null;if(!key||state!=='play')return;
  const o=h.vis.getWorldPosition(new V3());h.held=null;h.shieldP=0;h.charging=false;h.beamT=0;buzz(h,30);
  if(vel){const s=spawn(you,'thrown',o,vel,key);s.id=shotId++;mine.set(s.id,s);sfx('whoosh',0,.5);}
  else dropped(o,key);
}
function shieldHit(holder,p,at,col){     // a shield spends its power on what it stops; a mirror sends it back
  const who=holder===foe?foe:you,w=W[p.key];
  if(W[holder.shieldKey].mirror&&p.key!=='thrown'&&!w.absorb){
    const s=spawn(who,p.key,at.clone(),aimVel(p.key,at,(who===you?foe:you).head,0,p.pow),null,p.pow);
    if(who===you){s.id=shotId++;mine.set(s.id,s);}
  }
  holder.shieldP-=p.dmg*(w.shieldMul||1);
  if(holder.shieldP<=0){holder.shieldP=0;sfx('break',pan(at.x));burst(at,col,true);}
  else sfx('block',pan(at.x),holder===foe?.6:1);
}
function killRemote(p){p.dead=true;if(p.far){deadRemote.add(p.id);kills.push(p.id);}}
function clearShots(){shots.forEach(s=>scene.remove(s.mesh));shots.length=0;mine.clear();remote.clear();deadRemote.clear();kills=[];}

/* ---------- sound and feedback ---------- */
const wake=initAudio;
function buzz(h,ms){try{const a=h.pad&&h.pad.hapticActuators&&h.pad.hapticActuators[0];if(a)a.pulse(.7,ms);}catch(e){}}
const flash=$('flash');
function strike(who,p){                  // a shot lands on a body: its damage and whatever else it does
  const w=W[p.key];
  if(p.dmg>0)hurt(who,p.dmg);else sfx('pop',pan(p.pos.x));
  if(w.chill)who.chillT=w.chill;
  if(w.leech){const gain=p.dmg*w.leech;if(who===foe)you.hp=Math.min(MAX_HP,you.hp+gain);else if(net.on)you.lk+=gain;else foe.hp=Math.min(MAX_HP,foe.hp+gain);}
}
function hurt(who,dmg,quiet){
  who.hp=Math.max(0,who.hp-dmg);
  if(quiet){if(who.hp<=0&&state==='play'&&!isGuest())endRound(who===you?foe:you);return;}
  if(who===you){flash.style.opacity=.9;setTimeout(()=>{flash.style.opacity=0;},90);sfx('hurt');vrHands.forEach(h=>buzz(h,80));}
  else sfx('hit',pan(foe.head.x));
  if(who.hp<=0&&state==='play'&&!isGuest())endRound(who===you?foe:you);
}

/* ---------- match flow ---------- */
let tickAt=4,state='menu',timer=0,clock=ROUND_TIME,diff=DIFF.normal,msg='',roundNo=0,result=0,overShown=false;
const banner=$('banner'),menu=$('menu'),startBtn=$('start');
function say(t){msg=t;banner.textContent=t;}
function setStatus(t){statusEl.textContent=t;}
function tryStart(){
  wake();
  if(!net.on)return startMatch();
  if(net.role==='guest')return setStatus('Your rival hosts this duel and starts it.');
  if(!linked())return setStatus('Code '+net.code+' · still waiting for your rival to join.');
  startMatch();
}
function startMatch(){you.wins=0;foe.wins=0;menu.hidden=true;startRound();}
function resetRound(){
  you.hp=foe.hp=MAX_HP;clock=ROUND_TIME;clearShots();overShown=false;say('');
  [flatHand,...vrHands].forEach(h=>{h.held=null;h.shieldP=0;h.cool=0;h.want=false;h.charging=false;h.beamT=0;h.disc=false;});
  for(const m of [jet,foeJet]){m.x=m.y=m.vx=m.vy=0;m.e=JET.energy;}rig.position.set(0,0,PZ);holst.forEach(o=>{o.t=0;});foe.discs.fill(0);foe.cool=1.5;foe.lean=0;foe.wantAlt=0;foe.netDisc=false;foe.netBurn=0;foe.netW=-1;foe.rack.userData.show(null);
  foe.held=null;foe.shieldP=0;foe.netShield=null;foe.netHands=null;foe.vel.set(0,0,0);you.push.set(0,0,0);tickAt=4;timers.length=0;you.chillT=foe.chillT=0;you.lk=0;foe.lkSeen=0;foe.beamT=0;foe.netBeam=null;foe.beam.visible=false;foe.grabT=1.2;foe.head.set(0,1.5,BZ);foe.goal.copy(foe.head);
  slots.forEach((s,i)=>{s.type=null;s.timer=.4+i*.5;});
}
function startRound(){roundNo++;resetRound();state='count';timer=3;}
function announce(winner,over){
  say(!winner?'Draw':winner===you?(over?'You win the match':'Round to you'):(over?'Rival wins the match':'Round to rival'));
  sfx(!winner?'draw':winner===you?'win':'lose');
}
function endRound(winner){
  if(winner)winner.wins++;
  const over=you.wins>=2||foe.wins>=2;
  result=winner===you?1:winner===foe?2:3;
  announce(winner,over);
  state=over?'over':'roundEnd';timer=over?2.5:2.2;
}
function countTick(){const n=Math.ceil(timer);if(n>0&&n<tickAt){tickAt=n;sfx('tick');}}
function toLobby(text){
  state='menu';clearShots();say(mode==='vr'?text:'');
  if(mode!=='vr')menu.hidden=false;
}

/* ---------- two-player link: each side owns its own body, health and shots, and shares them 15 times a second ---------- */
const net={on:false,role:null,code:'',link:null,lastRx:0,lastQ:0,sendT:0};
const isGuest=()=>net.on&&net.role==='guest';
const linked=()=>net.on&&net.lastRx>0;
function closeLink(){
  if(net.link){try{net.link.close();}catch(e){}}
  net.link=null;net.on=false;net.lastRx=0;net.lastQ=0;
}
function openLink(role,code){
  closeLink();
  net.on=true;net.role=role;net.code=code;
  if(state!=='menu')toLobby('');
  setStatus(role==='host'?'Code '+code+' · waiting for your rival to join.':'Looking for duel '+code+'…');
  try{
    if(location.hash==='#local'&&window.BroadcastChannel){        // same-device testing in two tabs
      const bc=new BroadcastChannel('slowfire-'+code);bc.onmessage=e=>rx(e.data);
      net.link={send:p=>bc.postMessage(p),close:()=>bc.close()};return;
    }
    const id='slowfire-duel-'+code;let conn=null;
    const peer=role==='host'?new Peer(id):new Peer();
    const wire=c=>{conn=c;c.on('data',rx);c.on('close',()=>{conn=null;});};
    peer.on('error',e=>setStatus(e&&e.type==='peer-unavailable'?'No duel found with code '+code+'.':'Connection problem: '+(e&&e.type||e)));
    if(role==='host')peer.on('connection',wire);else peer.on('open',()=>wire(peer.connect(id)));
    net.link={send:p=>{if(conn&&conn.open)conn.send(p);},close:()=>peer.destroy()};
  }catch(e){setStatus('Could not connect: '+(e&&(e.code||e.message)||e));net.on=false;}
}
function tx(){
  let sh=0,sp=0,sk=0;
  for(const h of hands())if(h.shieldP>0){h.shield.getWorldPosition(tmp);sh=[r2(tmp.x),r2(tmp.y),r2(tmp.z)];sp=r2(h.shieldP/W[h.shieldKey].power);sk=ALL.indexOf(h.shieldKey);}
  const s=[];
  for(const p of shots)if(p.owner===you&&!p.dead&&s.length<30)
    s.push([p.id,SHOTS.indexOf(p.key),r2(p.pos.x),r2(p.pos.y),r2(p.pos.z),r2(p.vel.x),r2(p.vel.y),r2(p.vel.z),ALL.indexOf(p.gun),r2(p.pow)]);
  const pk={q:Date.now(),r:net.role,rn:roundNo,h:[r2(you.head.x),r2(you.head.y),r2(you.head.z)],hp:Math.round(you.hp),sh,sp,sk,s,k:kills.slice(-30),w:-1,lk:r2(you.lk),bm:0};
  if(you.beam){const b=you.beam;pk.bm=[r2(b.o.x),r2(b.o.y),r2(b.o.z),Math.round(b.d.x*1e3)/1e3,Math.round(b.d.y*1e3)/1e3,Math.round(b.d.z*1e3)/1e3];}
  pk.gh=-1;pk.hd=hands().map((h,i)=>{
    const busy=h.held||h.shieldP>0;if(busy)pk.gh=i;if(h.held)pk.w=KEYS.indexOf(h.held.key);
    if(mode!=='vr'&&!busy&&!h.disc)return 0;
    (mode==='vr'?h.parent:h.disc?h.discMesh:h.vis).getWorldPosition(tmp);return [r2(tmp.x),r2(tmp.y),r2(tmp.z)];
  });
  if(game==='disc'){pk.dk=0;hands().forEach((h,i)=>{if(h.disc){pk.dk=1;pk.gh=i;}});pk.jb=you.burn||0;}
  if(net.role==='host')pk.ph=[PH.indexOf(state),r2(timer),r2(clock),you.wins,foe.wins,roundNo,result,game==='disc'?1:0];
  net.link.send(pk);
}
function rx(pk){                           // everything in here is untrusted input from the other player
  if(!net.on||!pk||typeof pk!=='object'||pk.r===net.role||!(num(pk.q)>net.lastQ))return;
  net.lastQ=pk.q;
  if(!net.lastRx)setStatus(net.role==='host'?'Rival connected. Press Start duel.':'Connected. Your rival starts the duel.');
  net.lastRx=performance.now();
  const h=Array.isArray(pk.h)?pk.h:[];      // the rival's world is ours turned half a turn about the centre
  if(game==='disc')foe.goal.set(clamp(-num(h[0]),-ROOM.x,ROOM.x),clamp(num(h[1]),.3,ROOM.y),clamp(-num(h[2]),BZ-1.5,BZ+1.5));
  else foe.goal.set(clamp(-num(h[0]),-1.6,1.6),clamp(num(h[1]),.3,2.4),clamp(-num(h[2]),BZ-1.3,BZ+1.3));
  foe.netDisc=!!pk.dk;foe.netBurn=clamp(num(pk.jb),0,2);
  if(net.role==='guest'&&Array.isArray(pk.ph))follow(pk.ph);
  if(pk.rn===roundNo)foe.hp=clamp(num(pk.hp),0,MAX_HP);
  foe.netW=typeof pk.w==='number'?pk.w:-1;foe.netGh=pk.gh===0||pk.gh===1?pk.gh:-1;
  foe.netHands=Array.isArray(pk.hd)?[0,1].map(i=>Array.isArray(pk.hd[i])?new V3(clamp(-num(pk.hd[i][0]),-2.5,2.5),clamp(num(pk.hd[i][1]),0,2.6),clamp(-num(pk.hd[i][2]),BZ-2,BZ+2)):null):null;
  foe.netSp=clamp(num(pk.sp),0,1);foe.netSk=W[ALL[pk.sk]]&&W[ALL[pk.sk]].shield?ALL[pk.sk]:'buckler';
  const lk=num(pk.lk);if(pk.rn===roundNo&&lk>foe.lkSeen){you.hp=Math.min(MAX_HP,you.hp+lk-foe.lkSeen);foe.lkSeen=lk;}
  const bm=pk.bm;foe.netBeam=Array.isArray(bm)&&pk.rn===roundNo?{o:new V3(clamp(-num(bm[0]),-3,3),clamp(num(bm[1]),0,3),clamp(-num(bm[2]),BZ-2,BZ+2)),d:new V3(-num(bm[3]),num(bm[4]),-num(bm[5])).normalize()}:null;
  foe.netShield=Array.isArray(pk.sh)?new V3(-num(pk.sh[0]),num(pk.sh[1]),-num(pk.sh[2])):null;
  const seen=new Set();
  (Array.isArray(pk.s)?pk.s.slice(0,40):[]).forEach(a=>{
    if(!Array.isArray(a))return;
    const id=a[0],key=SHOTS[a[1]];if(!key||typeof id!=='number')return;
    seen.add(id);
    const at=new V3(-num(a[2]),num(a[3]),-num(a[4])),vel=new V3(-num(a[5]),num(a[6]),-num(a[7]));if(vel.length()>10)vel.setLength(10);
    const had=remote.get(id);if(had){had.vel.copy(vel);had.pos.lerp(at,.6);return;}     // its owner flies it; we follow
    if(deadRemote.has(id)||state!=='play'||pk.rn!==roundNo)return;
    const s=spawn(foe,key,at,vel,ALL[a[8]]||'pip',typeof a[9]==='number'?clamp(a[9],0,1):1);
    s.id=id;s.far=true;remote.set(id,s);
  });
  remote.forEach((s,id)=>{if(!seen.has(id))s.dead=true;});
  (Array.isArray(pk.k)?pk.k.slice(0,40):[]).forEach(id=>{const s=mine.get(id);if(s)s.dead=true;});
}
function follow(ph){                       // the guest mirrors the host's round state
  const st=PH[ph[0]]||'menu',rn=num(ph[5]),was=state;
  if((ph[7]?'disc':'duel')!==game)setGame(ph[7]?'disc':'duel');
  timer=num(ph[1]);clock=num(ph[2]);foe.wins=num(ph[3]);you.wins=num(ph[4]);
  if(st===state&&rn===roundNo)return;
  roundNo=rn;state=st;
  if(st==='count'||st==='play'){
    if(st==='count'||was!=='count')resetRound();
    if(st==='play')sfx('go');
    menu.hidden=true;
  }else if(st==='roundEnd'||st==='over')announce(ph[6]===2?you:ph[6]===1?foe:null,st==='over');
  else toLobby('Waiting for your rival to start');
}

/* ---------- per-frame update ---------- */
const gripA=new V3(),gripB=new V3(),keys={},tmp=new V3(),tmp2=new V3(),prevHead=new V3().copy(you.head),target={x:0,y:1.5};
const sA=new V3(),sB=new V3(),sC=new V3(),was=new V3(),top=new V3(),low=new V3();
function nearPoint(a,b,c){                 // how near the path a-b comes to the point c
  sA.copy(b).sub(a);const l=sA.lengthSq(),t=l?clamp(sB.copy(c).sub(a).dot(sA)/l,0,1):0;
  return sB.copy(a).addScaledVector(sA,t).distanceTo(c);
}
function nearLine(p1,q1,p2,q2){            // how near the path p1-q1 comes to the line p2-q2
  sA.copy(q1).sub(p1);sB.copy(q2).sub(p2);sC.copy(p1).sub(p2);
  const a=sA.dot(sA),e=sB.dot(sB),f=sB.dot(sC),c=sA.dot(sC),b=sA.dot(sB),den=a*e-b*b;
  let s=a>1e-9&&den>1e-9?clamp((b*f-c*e)/den,0,1):0,t=e>1e-9?(b*s+f)/e:0;
  if(t<0){t=0;s=a>1e-9?clamp(-c/a,0,1):0;}else if(t>1){t=1;s=a>1e-9?clamp((b-c)/a,0,1):0;}
  return sC.addScaledVector(sA,s).addScaledVector(sB,-t).length();
}
const bA=new V3(),bB=new V3(),mid=new V3();
function gap(p,c){                        // how near the shot's shape comes to a point this step
  if(p.half){bA.copy(p.pos);bB.copy(p.pos);if(p.axis==='y'){bA.y-=p.half;bB.y+=p.half;}else{bA.x-=p.half;bB.x+=p.half;}return nearPoint(bA,bB,c);}
  if(p.hoop)return (was.z-c.z)*(p.pos.z-c.z)>0&&Math.abs(p.pos.z-c.z)>.12?9:Math.abs(Math.hypot(c.x-p.pos.x,c.y-p.pos.y)-p.R);
  return nearPoint(was,p.pos,c);
}
function hitsBody(p,f){                   // the head, then the trunk from collar to hips, along the shot's whole step
  if(gap(p,f.head)<p.r+.13)return true;
  if(p.half||p.hoop){for(const k of [.24,.43,.62]){mid.copy(f.head);mid.y-=k;if(gap(p,mid)<p.r+.2)return true;}return false;}
  top.copy(f.head);top.y-=.24;low.copy(f.head);low.y-=.62;
  return nearLine(was,p.pos,top,low)<p.r+.19;
}
function setHeld(h,key){
  const w=W[key];
  h.charging=false;h.beamT=0;
  if(w.shield){h.held=null;h.shieldP=w.power;h.shieldKey=key;}
  else h.held={key,ammo:w.ammo};
  sfx(w.shield?'shield':'pickup');buzz(h,30);
}
const bT=new V3(),bT2=new V3(),UPV=new V3(0,1,0);let searT=0;
function muzzle(h){const gun=h.vis.userData.show(h.held.key);gun.updateWorldMatrix(true,false);return gun.localToWorld(gun.userData.muzzle.clone());}
function shoot(h,pow){
  const key=h.held.key,w=W[key],o=muzzle(h);
  if(w.beam){h.beamT=w.beam;h.beamDir.copy(foe.head).sub(o).normalize();sfx(w.snd);fired[key]=(fired[key]||0)+1;}
  else fire(you,key,o,mode==='vr'?new V3(0,0,-1).applyQuaternion(h.parent.getWorldQuaternion(new THREE.Quaternion())).multiplyScalar(w.charge?4+4*pow:w.speed):aimVel(key,o,foe.head,0,pow),pow);
  h.kick=1;buzz(h,25);h.cool=w.cool;h.held.ammo--;
}
function rayGap(o,d,c){const t=Math.max(0,bT.copy(c).sub(o).dot(d));return bT.copy(o).addScaledVector(d,t).distanceTo(c);}
function drawBeam(mesh,o,d){mesh.visible=true;mesh.position.copy(o);mesh.quaternion.setFromUnitVectors(UPV,d);mesh.scale.set(1,9,1);}
function beamOn(who,holders,o,d,dt,col){   // a beam burns a shield in its way first, then the body behind it
  for(const h of holders)if(h.shieldP>0&&rayGap(o,d,h.shield.getWorldPosition(bT2))<.34){
    h.shieldP-=W.beam.dps*dt;if(h.shieldP<=0){h.shieldP=0;sfx('break',pan(bT2.x));burst(bT2,col,true);}return;
  }
  bT2.copy(who.head);bT2.y-=.42;
  if(rayGap(o,d,who.head)<.15||rayGap(o,d,bT2)<.26){
    hurt(who,W.beam.dps*dt,true);
    if((searT-=dt)<=0){searT=.25;burst(bT2,col,false);if(who===you){flash.style.opacity=.6;setTimeout(()=>{flash.style.opacity=0;},90);sfx('hurt',0,.5);}else sfx('hit',pan(foe.head.x),.6);}
  }
}
function setGame(g){                      // duel: the open lane and its pickups; disc: the closed room, discs and the jetpack
  game=g==='disc'?'disc':'duel';const disc=game==='disc';
  room.visible=disc;pylons.visible=!disc;board.position.set(0,disc?5.4:3.9,disc?-ROOM.z+.1:BZ-1.5);
  jet.x=jet.y=jet.vx=jet.vy=0;rig.position.set(0,0,PZ);
  for(const h of [flatHand,...vrHands]){h.vis.userData.show(null);h.shield.visible=false;h.beam.visible=false;h.discMesh.visible=false;if(h.sight)h.sight.visible=false;if(h.gauge)h.gauge.visible=false;}
  for(const s of slots)s.mesh.visible=false;for(const o of holst)o.m.visible=false;mark.visible=false;foe.discMesh.visible=false;
  document.querySelectorAll('#game .seg').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g===game)));
  $('howDuel').hidden=disc;$('howDisc').hidden=!disc;lastWeapon='?';
}
function throwDisc(owner,from,vel){
  const s=spawn(owner,'disc',from.clone(),vel);if(owner===you){s.id=shotId++;mine.set(s.id,s);}
  sfx('whoosh',pan(from.x),owner===you?.9:.5);fired.disc=(fired.disc||0)+1;return s;
}
function reachDisc(at,r){                 // the rival's nearest disc within reach of a point
  let best=null,bd=r;for(const p of shots)if(!p.dead&&p.owner===foe&&p.walls){const d=p.pos.distanceTo(at);if(d<bd){bd=d;best=p;}}
  return best;
}
function deflect(p,vel,h){                // their disc, knocked away, is yours
  killRemote(p);p.gone=true;throwDisc(you,p.pos,vel);sfx('block',pan(p.pos.x));burst(p.pos,YOU,false);if(h)buzz(h,70);
}
function grab(h,at,catchR,missR){         // an empty hand closing on a disc in flight: caught if the timing is right, a hit on you if not
  const got=reachDisc(at,catchR);
  if(got){killRemote(got);got.gone=true;h.disc=true;h.cool=0;sfx('pickup');buzz(h,90);return;}
  const miss=reachDisc(at,missR);if(miss){killRemote(miss);strike(you,miss);}
}
let jetHum=0;
function updateDiscPlayer(dt){
  you.beam=null;const vr=mode==='vr',play=state==='play';
  const thrust=!play?0:vr?vrHands.filter(h=>h.jet).length:keys.Space?(keys.ShiftLeft||keys.ShiftRight?2:1):0;
  let lean=vr?camera.position.x:(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  if(vr)lean=Math.abs(lean)<.07?0:clamp((lean-Math.sign(lean)*.07)/.22,-1,1);
  const on=fly(jet,thrust,play?lean:0,dt,vr?0:1);
  if(on&&(jetHum-=dt)<=0){jetHum=.22;sfx('step',0,.35*thrust);vrHands.forEach(h=>{if(h.jet)buzz(h,40);});}
  if(vr){rig.position.set(jet.x,jet.y,PZ);you.head.copy(camera.position).add(rig.position);}
  else{you.head.set(jet.x,JET.head+jet.y,PZ);rig.position.set(jet.x*.85,jet.y*.85,PZ);}
  youBody.position.copy(you.head);youBody.visible=!vr;
  tmp.copy(you.head).sub(prevHead).divideScalar(Math.max(dt,.001));you.vel.lerp(tmp,.2);prevHead.copy(you.head);
  holst.forEach((o,i)=>{o.t-=dt;o.at.set(you.head.x+HOLSTERS[i][0],you.head.y+HOLSTERS[i][1],you.head.z+HOLSTERS[i][2]);o.m.position.copy(o.at);o.m.visible=o.t<=0;if(o.m.userData.tick)o.m.userData.tick(dt*.2);});
  if(!vr){ray.setFromCamera(aim,camera);leave(ray.ray.origin,ray.ray.direction,aimAt);mark.position.copy(aimAt);}
  mark.visible=!vr&&play;
  for(const h of hands()){
    h.cool-=dt;
    const at=vr?h.parent.getWorldPosition(tmp2):tmp2.set(you.head.x+.32,you.head.y-.25,you.head.z-.25);
    h.v.lerp(tmp.copy(at).sub(h.was).divideScalar(Math.max(dt,.001)),.35);h.was.copy(at);
    if(play){
      if(vr){
        let near=-1;if(!h.disc)holst.forEach((o,i)=>{if(o.t<=0&&o.at.distanceTo(at)<.24)near=i;});
        if(near>=0&&near!==h.near)buzz(h,20);h.near=near;
        if(h.want&&near>=0){h.disc=true;holst[near].t=3;sfx('pickup');buzz(h,40);}
        else if(h.want&&!h.disc)grab(h,at,.3,.75);
        else if(h.disc&&!h.down){                // let go: a swing throws it, a still hand drops it
          h.disc=false;const sp=h.v.length();
          if(sp>1.5)throwDisc(you,at,h.v.clone().multiplyScalar(1.5).clampLength(5,14));else sfx('pop');
        }
      }else{
        if(!h.disc&&h.cool<=0){const i=holst.findIndex(o=>o.t<=0);if(i>=0){h.disc=true;holst[i].t=3;sfx('pickup',0,.5);}}
        if(h.parry){                          // on a screen one press does it: knock it back with the disc you hold, or catch it bare-handed
          const chest=tmp.copy(you.head);chest.y-=.3;const p=reachDisc(chest,1.3);
          if(p&&h.disc)deflect(p,bank(p.pos,foe.head,Math.max(W.disc.speed,p.vel.length()),0),h);
          else if(!h.disc)grab(h,chest.clone(),1.3,2.6);
          else{const miss=reachDisc(chest,2.6);if(miss){killRemote(miss);strike(you,miss);}}
        }
        if(h.want&&h.disc){h.disc=false;h.cool=.3;throwDisc(you,at,tmp.copy(aimAt).sub(at).setLength(W.disc.speed).clone());}
      }
    }else h.disc=false;
    h.want=false;h.parry=false;h.discMesh.visible=h.disc;if(h.disc&&h.discMesh.userData.tick)h.discMesh.userData.tick(dt*.3);
    if(h.gauge){h.gauge.visible=play;h.gauge.scale.x=Math.max(.02,jet.e/JET.energy);h.gauge.material.color.setHex(jet.e>3?YOU:0xff5a4d);}
  }
  return on?thrust:0;
}
function updateDiscBot(dt){
  let dodge=0,rise=false;                 // step aside from a disc on its way, by its present line
  for(const p of shots){
    if(p.owner!==you||p.vel.z>=0)continue;
    const t=(p.pos.z-BZ)/-p.vel.z;if(t<0||t>diff.window)continue;
    const px=p.pos.x+p.vel.x*t,py=p.pos.y+p.vel.y*t;
    if(Math.abs(px-foe.head.x)<.7&&py>foe.head.y-1.2&&py<foe.head.y+.5){dodge=px>foe.head.x?-1:1;rise=py<foe.head.y-.4;}
  }
  if((foe.wanderT-=dt)<=0){foe.wanderT=1.5+Math.random()*2.5;foe.lean=(Math.random()*2-1)*.7;foe.wantAlt=Math.random()<.5?0:.5+Math.random()*3;}
  if(Math.abs(foeJet.x)>ROOM.x-1.4&&Math.sign(foeJet.x)===Math.sign(foe.lean))foe.lean*=-1;
  const thrust=rise?2:foeJet.y<foe.wantAlt-.2?1:0;
  const on=fly(foeJet,thrust,clamp(dodge||foe.lean,-1,1)*Math.min(1,diff.speed/1.6),dt,1);
  foe.head.set(foeJet.x,JET.head+foeJet.y,BZ);foeBody.position.copy(foe.head);
  for(let i=0;i<4;i++)foe.discs[i]-=dt;
  const ready=foe.discs.findIndex(t=>t<=0);foe.discMesh.visible=ready>=0;
  if((foe.cool-=dt)<=0&&ready>=0){
    foe.discs[ready]=3;foe.cool=diff.gap*(1.3+Math.random());
    const o=new V3(foe.head.x-.32,foe.head.y-.25,BZ+.3),t=o.distanceTo(you.head)/W.disc.speed;
    const to=new V3().copy(you.head).addScaledVector(you.vel,t*diff.lead);to.y-=.3;to.x+=(Math.random()-.5)*2*diff.err;to.y+=(Math.random()-.5)*2*diff.err;
    throwDisc(foe,o,bank(o,to,W.disc.speed,Math.random()<.45?pick(['x+','x-','y+','y-']):0));
  }
  return on?thrust:0;
}
function updatePlayer(dt){
  you.beam=null;
  if(mode==='vr'){you.head.setFromMatrixPosition(camera.matrixWorld);}
  else{
    target.x=clamp(target.x+((keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0))*2.4*dt,-1,1);
    target.y=clamp(target.y+((keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0))*2.4*dt,.75,1.9);
    you.push.x+=((target.x-you.head.x)*150-you.push.x*24)*dt;you.push.y+=((target.y-you.head.y)*150-you.push.y*24)*dt;
    you.head.x+=you.push.x*dt;you.head.y+=you.push.y*dt;
    you.head.z=PZ;
  }
  youBody.position.copy(you.head);youBody.visible=mode!=='vr';
  tmp.copy(you.head).sub(prevHead).divideScalar(Math.max(dt,.001));
  you.vel.lerp(tmp,.2);prevHead.copy(you.head);

  for(const h of hands()){
    h.cool-=dt;
    const hp=mode==='vr'?h.parent.getWorldPosition(tmp2):tmp2.copy(you.head);
    h.v.lerp(tmp.copy(hp).sub(h.was).divideScalar(Math.max(dt,.001)),.35);h.was.copy(hp);
    if(h.toss){h.toss=false;if(mode!=='vr'&&(h.held||h.shieldP>0))letGo(h,lob(h.vis.getWorldPosition(new V3()),foe.head));}
    if(h.drop){h.drop=false;letGo(h,null);}
    if(state==='play'){
      if(!h.held&&h.shieldP<=0){
        const reach=mode==='vr'?.17:.3;
        for(const s of slots){ if(s.type&&s.pos.distanceTo(hp)<reach){setHeld(h,s.type);s.type=null;s.timer=2.4+Math.random()*1.6;break;} }
      }
      const hk=h.held&&W[h.held.key];
      if(h.want&&h.held&&h.cool<=0&&h.held.ammo<=0){sfx('empty');h.cool=.3;}
      else if(hk&&hk.charge&&h.held.ammo>0){
        if(h.want&&h.cool<=0&&!h.charging){h.charging=true;h.chargeT=0;}
        if(h.charging){h.chargeT+=dt;if(!h.down||h.chargeT>2.2){h.charging=false;shoot(h,Math.min(1,h.chargeT/hk.charge));}}
      }
      else if(h.want&&h.held&&h.cool<=0)shoot(h,1);
    }
    h.want=false;
    if(h.beamT>0&&h.held&&state==='play'){
      h.beamT-=dt;const o=muzzle(h);
      if(mode==='vr')h.beamDir.set(0,0,-1).applyQuaternion(h.parent.getWorldQuaternion(new THREE.Quaternion()));
      else h.beamDir.lerp(tmp.copy(foe.head).sub(o).normalize(),Math.min(1,dt*2.2)).normalize();
      drawBeam(h.beam,o,h.beamDir);you.beam={o,d:h.beamDir};
      if(!net.on)beamOn(foe,[foe],o,h.beamDir,dt,FOE);
    }else{h.beam.visible=false;h.beamT=0;}
    h.shield.visible=h.shieldP>0;h.shield.userData.kind(!!W[h.shieldKey].mirror);
    h.shield.userData.life(h.shieldP/W[h.shieldKey].power);
    const gun=h.vis.userData.show(h.shieldP>0?h.shieldKey:h.held?h.held.key:null);
    if(gun&&h.held)gun.scale.setScalar(h.charging?1+.3*Math.min(1,h.chargeT/1.4):1);
    if(gun&&h.held)gun.userData.setAmmo(h.held.ammo);
    if(gun&&gun.userData.tick)gun.userData.tick(performance.now()/1000);
    if(h.sight)h.sight.visible=!!h.held&&state==='play';
    h.kick*=Math.max(0,1-dt*10);h.vis.position.z=h.base.z+h.kick*.035;h.vis.rotation.x=h.kick*.22;
  }
}
function showFoeGun(key,ammo){
  const gun=foe.rack.userData.show(key||null);
  if(gun&&ammo>=0)gun.userData.setAmmo(ammo); else if(gun)gun.userData.setAmmo(9);
  if(gun&&gun.userData.tick)gun.userData.tick(performance.now()/1000);
}
function updateRemote(dt){
  foe.head.lerp(foe.goal,Math.min(1,dt*14));foeBody.position.copy(foe.head);
  const grip=foe.netHands&&foe.netHands[foe.netGh];
  if(grip)foe.rack.position.copy(grip).sub(foe.head);else foe.rack.position.set(-.3,-.2,.15);
  if(game==='disc'){if(grip)foe.discMesh.position.copy(grip).sub(foe.head);else foe.discMesh.position.set(-.32,-.25,.25);}
  foe.shield.visible=!!foe.netShield;foe.shield.userData.life(foe.netSp||0);
  if(foe.netShield)foe.shield.position.copy(foe.netShield).sub(foe.head);
  showFoeGun(foe.netShield?foe.netSk||'buckler':state==='play'?KEYS[foe.netW]:null,-1);foe.shield.userData.kind(!!W[foe.netSk||'buckler'].mirror);
  if(foe.netBeam&&state==='play'){drawBeam(foe.beam,foe.netBeam.o,foe.netBeam.d);beamOn(you,hands(),foe.netBeam.o,foe.netBeam.d,dt,YOU);}else foe.beam.visible=false;
}
function updateBot(dt){
  // dodge the most urgent incoming shot, otherwise drift around the platform
  let urgent=null,best=diff.window;
  for(const p of shots){
    if(p.owner!==you||p.vel.z>=0)continue;
    const t=(p.pos.z-BZ)/-p.vel.z;if(t<0||t>best)continue;
    const px=p.pos.x+p.vel.x*t,py=p.pos.y+p.vel.y*t;
    const dx=foe.head.x-px,dy=(foe.head.y-.2)-py;
    if(Math.hypot(dx,dy)<p.r+.5){best=t;urgent={dx,dy};}
  }
  if(urgent){
    let dx=urgent.dx,dy=urgent.dy*.6;
    if(Math.abs(dx)<.05)dx=foe.head.x>0?-1:1;
    const l=Math.hypot(dx,dy)||1;
    foe.goal.set(clamp(foe.head.x+dx/l*.8,-.9,.9),clamp(foe.head.y+dy/l*.5,.9,1.8),BZ);
    foe.wanderT=.5;
  }else if((foe.wanderT-=dt)<=0){
    foe.goal.set((Math.random()*2-1)*.8,1+Math.random()*.75,BZ);foe.wanderT=1.2+Math.random()*1.6;
  }
  tmp.copy(foe.goal).sub(foe.head);
  const d=tmp.length(),top=diff.speed*(urgent?1.4:.6);
  tmp.multiplyScalar(d>.001?Math.min(top,d*6)/d:0);foe.vel.lerp(tmp,Math.min(1,dt*(urgent?14:6)));
  foe.head.addScaledVector(foe.vel,dt);foe.rack.position.set(-.3,-.2,.15);
  foeBody.position.copy(foe.head);

  foe.shield.position.set(0,-.15,.5);foe.shield.visible=foe.shieldP>0;foe.shield.userData.life(foe.shieldP/W[foe.shieldKey].power);foe.shield.userData.kind(!!W[foe.shieldKey].mirror);
  showFoeGun(foe.shieldP>0?foe.shieldKey:foe.held?foe.held.key:null,foe.held?foe.held.ammo:-1);
  if(foe.beamT>0){
    foe.beamT-=dt;const bo=new V3(foe.head.x-.3,foe.head.y-.2,BZ+.4);
    foe.beamDir.lerp(tmp.copy(you.head).sub(bo).normalize(),Math.min(1,dt*(.6+diff.lead))).normalize();
    drawBeam(foe.beam,bo,foe.beamDir);beamOn(you,hands(),bo,foe.beamDir,dt,YOU);
  }else foe.beam.visible=false;
  if(!foe.held){
    if((foe.grabT-=dt*(foe.chillT>0?.4:1))<=0){
      let key=pick(POOL);while(W[key].shield&&foe.shieldP>0)key=pick(POOL);
      const w=W[key];
      if(w.shield){foe.shieldP=w.power;foe.shieldKey=key;foe.grabT=diff.regrab;}
      else{foe.held={key,ammo:w.ammo};foe.cool=.5+Math.random()*.5;}
    }
  }else if((foe.cool-=dt)<=0){
    const w=W[foe.held.key],pow=w.charge?.3+Math.random()*.7:1;
    const o=new V3(foe.head.x,foe.head.y-.15,BZ+.35);
    const t=o.distanceTo(you.head)/(w.speed||5);
    const aim=new V3().copy(you.head).addScaledVector(you.vel,t*diff.lead);
    aim.y-=.15;aim.x+=(Math.random()-.5)*2*diff.err;aim.y+=(Math.random()-.5)*2*diff.err;
    if(w.beam){foe.beamT=w.beam;foe.beamDir.copy(aim).sub(o).normalize();sfx(w.snd,pan(o.x),.5);}
    else fire(foe,foe.held.key,o,aimVel(foe.held.key,o,aim,0,pow),pow);
    foe.cool=Math.max(w.cool,diff.gap*(.7+Math.random()*.6));
    if(--foe.held.ammo<=0){
      const k=foe.held.key;foe.held=null;foe.grabT=diff.regrab*(.7+Math.random()*.6);
      if(Math.random()<.6)spawn(foe,'thrown',o,lob(o,you.head,diff.err*3),k);else dropped(o,k);
    }
  }
}
function updateShots(dt){
  for(let i=timers.length-1;i>=0;i--)if((timers[i].t-=dt)<=0){const f=timers[i].fn;timers.splice(i,1);if(state==='play')f();}
  for(const p of shots.slice()){
    if(p.dead)continue;
    was.copy(p.pos);if(p.grav)p.vel.y-=p.grav*dt;
    if(!p.far){                          // what a shot does on its way is its owner's to fly
      if(p.home){const sp=p.vel.length();tmp.copy(p.owner===you?foe.head:you.head).sub(p.pos).setLength(sp);p.vel.lerp(tmp,Math.min(1,p.home*dt)).setLength(sp);p.mesh.lookAt(tmp.copy(p.pos).add(p.vel));}
      if(p.boom)p.vel.addScaledVector(p.dir0,-p.boom*dt);
      if(p.stopAt&&p.pos.distanceTo(p.o0)>p.stopAt)p.vel.set(0,0,0);
    }
    if(p.spiral&&!p.far){p.mid.addScaledVector(p.vel,dt);const R=Math.min(p.spiral,p.life*.5),a=p.life*7;p.pos.set(p.mid.x+Math.cos(a)*R,p.mid.y+Math.sin(a)*R,p.mid.z);}
    else p.pos.addScaledVector(p.vel,dt);
    p.life+=dt;p.cd-=dt;
    if(p.hoop){p.R=.15+p.life*.3;p.mesh.scale.setScalar(p.R/.15);}
    if(p.mesh.userData.tick)p.mesh.userData.tick(dt);
    if(!p.far){
      if(p.bounce&&p.pos.y<.17&&p.vel.y<0){p.vel.y*=-1;p.bounce--;sfx('pop',pan(p.pos.x),.5);}
      if(p.split&&p.pos.distanceTo(p.o0)>p.split){
        p.dead=p.gone=true;
        for(const k of [-1,0,1]){const v=p.vel.clone();v.x+=k*.8;const c=spawn(p.owner,'shard',p.pos.clone(),v);if(p.owner===you){c.id=shotId++;mine.set(c.id,c);}}
        continue;
      }
      if(p.boom&&tmp.copy(p.pos).sub(p.o0).dot(p.dir0)<-.2){p.dead=p.gone=true;continue;}
    }
    if(p.walls){
      const n=wallHit(p);
      if(n){
        sfx('block',pan(p.pos.x),.5);puff(p.pos,p.owner===you?YOU:FOE,.6,.18,null);
        if(!p.far&&(p.hits+=n)>p.walls){p.dead=true;continue;}       // two bounces, then it breaks on the next wall
      }
      if((p.trail-=dt)<=0){p.trail=.06;puff(p.pos,p.owner===you?YOU:FOE,.16,.3,null);}
    }
    if(p.life>p.ttl||Math.abs(p.pos.z)>9||p.pos.y<.05){p.dead=p.gone=true;continue;}
    if(p.owner===foe&&p.walls){               // a disc in your hand knocks one out of the air; so does one of yours in flight
      if(mode==='vr')for(const h of hands())if(!p.dead&&h.disc&&nearPoint(was,p.pos,h.discMesh.getWorldPosition(tmp))<.3)
        deflect(p,h.v.length()>1?h.v.clone().multiplyScalar(1.5).clampLength(6,14):bank(p.pos,foe.head,Math.max(W.disc.speed,p.vel.length()),0),h);
      for(const q of shots)if(!p.dead&&!q.dead&&q.owner===you&&q.walls&&q.pos.distanceTo(p.pos)<.32){killRemote(p);q.dead=true;sfx('break',pan(p.pos.x),.7);}
    }
    if(p.owner===foe){
      for(const h of hands()){ if(!p.dead&&h.shieldP>0&&gap(p,h.shield.getWorldPosition(tmp))<.34+p.r){const at=tmp.clone();killRemote(p);shieldHit(h,p,at,YOU);buzz(h,40);} }
      if(!p.dead&&p.cd<=0&&hitsBody(p,you)){if(p.pierce)p.cd=.8;else killRemote(p);strike(you,p);}
      if(!p.dead&&!p.passed&&p.pos.z>=you.head.z){p.passed=true;if(Math.hypot(p.pos.x-you.head.x,p.pos.y-you.head.y+.3)<.75)sfx('whoosh',clamp((p.pos.x-you.head.x)*3,-1,1),.8);}
    }else if(!net.on){                   // against a remote player, they decide what hits them
      if(foe.shieldP>0&&gap(p,foe.shield.getWorldPosition(tmp))<.34+p.r){const at=tmp.clone();p.dead=true;shieldHit(foe,p,at,FOE);}
      else if(p.cd<=0&&hitsBody(p,foe)){
        if(p.walls&&foe.discMesh.visible&&Math.random()<diff.parry){p.dead=p.gone=true;throwDisc(foe,p.pos,bank(p.pos,you.head,Math.max(W.disc.speed,p.vel.length()),0));sfx('block',pan(p.pos.x),.7);burst(p.pos,FOE,false);}
        else{if(p.pierce)p.cd=.8;else p.dead=true;strike(foe,p);}
      }
    }
  }
  for(const a of shots){               // Drifter orbs swallow enemy fire; each side resolves its own orbs
    if(a.dead||!a.absorb||a.far)continue;
    for(const b of shots){
      if(b.dead||b.owner===a.owner||a.pos.distanceTo(b.pos)>a.r+b.r)continue;
      killRemote(b);sfx('pop',pan(b.pos.x),.7);if(--a.absorb<=0||b.absorb){a.dead=true;break;}
    }
  }
  for(let i=shots.length-1;i>=0;i--){
    const s=shots[i];
    if(s.dead){if(!s.gone)burst(s.pos,s.owner===you?YOU:FOE,s.key==='drifter');scene.remove(s.mesh);if(s.far)remote.delete(s.id);else mine.delete(s.id);shots.splice(i,1);}
  }
}
function updateSlots(dt,now){
  for(const s of slots){
    if(!s.type&&(s.timer-=dt*(you.chillT>0?.4:1))<=0&&state==='play'){
      s.type=pick(POOL);const g=s.rack.userData.show(s.type);g.userData.setAmmo(9);
      s.ring.material.color.setHex(WCOL[s.type]);s.lamp.material.color.setHex(WCOL[s.type]);
    }
    s.mesh.visible=!!s.type;s.rack.rotation.y=now*1.2;s.rack.position.y=Math.sin(now*2+s.pos.x*3)*.012;
    const g=s.type&&s.rack.userData.guns[s.type];if(g&&g.userData.tick)g.userData.tick(now);
  }
}

/* ---------- HUD (page) and scoreboard (in the arena, readable in a headset) ---------- */
const hpYou=$('hpYou'),hpFoe=$('hpFoe'),clockEl=$('clock'),scoreEl=$('score'),weaponEl=$('weapon');
const bc=document.createElement('canvas');bc.width=1024;bc.height=256;
const bx=bc.getContext('2d'),btex=new THREE.CanvasTexture(bc);btex.colorSpace=THREE.SRGBColorSpace;
const board=new THREE.Mesh(new THREE.PlaneGeometry(6,1.5),new THREE.MeshBasicMaterial({map:btex,transparent:true,fog:false}));
board.position.set(0,3.9,BZ-1.5);scene.add(board);
let boardT=0,lastWeapon='';
function fmt(t){t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
function idleText(){
  if(mode!=='vr'||(state!=='menu'&&!(state==='over'&&overShown)))return '';
  if(!net.on)return state==='over'?'Pull a trigger for a rematch':'Pull a trigger to start';
  if(net.role==='guest')return linked()?'Waiting for your rival to start':'Looking for duel '+net.code;
  return linked()?'Pull a trigger to start':'Code '+net.code+' · waiting for rival';
}
function drawBoard(){
  bx.clearRect(0,0,1024,256);bx.fillStyle='rgba(13,19,38,.85)';bx.fillRect(0,0,1024,256);
  bx.fillStyle='#18224a';bx.fillRect(40,40,380,36);bx.fillRect(604,40,380,36);
  bx.fillStyle='#3fd6e0';bx.fillRect(40,40,380*you.hp/MAX_HP,36);
  bx.fillStyle='#ff7a59';const fw=380*foe.hp/MAX_HP;bx.fillRect(984-fw,40,fw,36);
  bx.fillStyle='#eef1ff';bx.textAlign='center';bx.font='700 64px system-ui,sans-serif';
  bx.fillText(fmt(clock),512,84);
  bx.font='500 30px system-ui,sans-serif';bx.fillStyle='#a3aedb';
  bx.fillText('YOU  '+you.wins+' – '+foe.wins+'  RIVAL',512,128);
  bx.font='700 50px system-ui,sans-serif';bx.fillStyle='#ffd166';
  bx.fillText(idleText()||msg,512,212);
  btex.needsUpdate=true;
}
function updateHud(dt){
  hpYou.style.width=(you.hp/MAX_HP*100)+'%';hpFoe.style.width=(foe.hp/MAX_HP*100)+'%';
  clockEl.textContent=fmt(clock);scoreEl.textContent=you.wins+' – '+foe.wins;
  if(game==='disc'){
    const n=holst.filter(o=>o.t<=0).length+(flatHand.disc?1:0),label='d'+n+Math.round(jet.e*4);
    if(label!==lastWeapon){lastWeapon=label;weaponEl.innerHTML='Discs '+n+' · Jet '+Math.round(jet.e/JET.energy*100)+'%<small>Click throws at the mark · F or right-click knocks a disc back or catches it · Space lifts, Shift faster · A and D slide</small>';}
    if((boardT-=dt)<=0){boardT=.15;drawBoard();}
    return;
  }
  const h=flatHand,key=h.shieldP>0?h.shieldKey:h.held?h.held.key:'';
  const spent=h.held&&h.held.ammo<=0,label=key+(h.held?h.held.ammo:Math.ceil(h.shieldP));
  if(label!==lastWeapon){
    lastWeapon=label;
    weaponEl.innerHTML=key?W[key].name+(spent?' · empty':h.held?' · '+h.held.ammo+' left':' · '+Math.ceil(h.shieldP)+' power')+'<small>'+(spent?'Q throws it at your rival, E drops it':W[key].hint)+'</small>'
      :'Empty hand<small>Move onto a floating weapon to grab it</small>';
  }
  if((boardT-=dt)<=0){boardT=.15;drawBoard();}
}

function update(dt,now){
  if(net.on&&net.lastRx&&performance.now()-net.lastRx>5000){      // the other player went away
    net.lastRx=0;setStatus('Your rival disconnected. Waiting for them to come back.');
    if(state!=='menu')toLobby('Rival disconnected');
  }
  if(isGuest()){
    if(state==='count'){say(timer>0?String(Math.ceil(timer)):'');countTick();}
  }else if(state==='count'){
    timer-=dt;say(timer>0?String(Math.ceil(timer)):'');countTick();
    if(timer<=0){state='play';say('');sfx('go');}
  }else if(state==='play'){
    clock-=dt;
    if(net.on&&foe.hp<=0)endRound(you);
    else if(clock<=0)endRound(you.hp>foe.hp?you:foe.hp>you.hp?foe:null);
  }else if(state==='roundEnd'){
    if((timer-=dt)<=0)startRound();
  }else if(state==='over'&&timer>0)timer-=dt;
  if(state==='over'&&timer<=0&&!overShown){
    overShown=true;
    if(mode!=='vr'){menu.hidden=false;startBtn.textContent='Rematch';}
  }
  you.chillT-=dt;foe.chillT-=dt;
  const disc=game==='disc';let burn=0,foeBurn=0;
  if(disc)burn=updateDiscPlayer(dt);else updatePlayer(dt);
  if(net.on){updateRemote(dt);foe.discMesh.visible=disc&&foe.netDisc;foeBurn=disc?foe.netBurn||0:0;}
  else if(state==='play'){if(disc)foeBurn=updateDiscBot(dt);else updateBot(dt);}
  else{foeBody.position.copy(foe.head);foe.beam.visible=false;foe.discMesh.visible=false;}
  if(state==='play'||state==='roundEnd'||state==='over')updateShots(dt);
  you.burn=burn;youFig.group.visible=mode!=='vr';
  const holding=disc?flatHand.disc:flatHand.held||flatHand.shieldP>0;
  if(mode!=='vr')youFig.update(dt,you.head,[holding?(disc?flatHand.discMesh:flatHand.vis).getWorldPosition(gripA):null,null],burn);
  const shown=disc?foe.discMesh.visible:foe.rack.children.some(m=>m.visible);
  foeFig.update(dt,foe.head,net.on&&foe.netHands?foe.netHands:[shown?(disc?foe.discMesh:foe.rack).getWorldPosition(gripB):null,null],foeBurn);
  if(!disc)updateSlots(dt,now);
  updateFx(dt);updateFalling(dt);updateHud(dt);
  if(net.on&&net.link&&(net.sendT-=dt)<=0){net.sendT=1/15;tx();}
}
let last=performance.now();
renderer.setAnimationLoop(()=>{
  const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;
  update(dt,now/1000);renderer.render(scene,camera);
});

/* ---------- input ---------- */
function resize(){
  if(renderer.xr.isPresenting)return;
  const w=app.clientWidth||1,h=app.clientHeight||1;
  renderer.setSize(w,h,false);camera.aspect=w/h;
  camera.fov=w<h?78:60;camera.updateProjectionMatrix();
}
if(window.ResizeObserver)new ResizeObserver(resize).observe(app);else window.addEventListener('resize',resize);
resize();
function point(e){
  const r=canvas.getBoundingClientRect();
  const nx=clamp((e.clientX-r.left)/r.width,0,1),ny=clamp((e.clientY-r.top)/r.height,0,1);
  aim.x=nx*2-1;aim.y=1-ny*2;
  target.x=clamp((nx-.5)*2.2,-1,1);
  target.y=clamp(.6+(1-ny)*1.5,.75,1.9);
}
canvas.addEventListener('pointermove',point);
canvas.addEventListener('pointerdown',e=>{wake();point(e);if(e.pointerType==='mouse'){if(e.button===2){if(game==='disc')flatHand.parry=true;else flatHand.toss=true;}else{flatHand.want=true;flatHand.down=true;}}});
window.addEventListener('pointerup',()=>{flatHand.down=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
$('toss').addEventListener('pointerdown',e=>{e.preventDefault();wake();flatHand.toss=true;});
$('fire').addEventListener('pointerdown',e=>{e.preventDefault();wake();flatHand.want=true;flatHand.down=true;});
window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Space')flatHand.down=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
window.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  keys[e.code]=true;if(e.code.startsWith('Arrow'))e.preventDefault();
  if(e.code==='Space'){e.preventDefault();if(game==='duel'&&state==='play'&&!e.repeat){flatHand.want=true;flatHand.down=true;}}
  if(e.code==='KeyF'&&game==='disc'&&!e.repeat)flatHand.parry=true;
  if(e.code==='KeyQ'&&game==='duel')flatHand.toss=true;
  if(e.code==='KeyE'&&game==='duel')flatHand.drop=true;
});
startBtn.addEventListener('click',tryStart);
document.querySelectorAll('#game .seg').forEach(b=>b.addEventListener('click',()=>{if(isGuest())return setStatus('Your rival hosts this duel and picks the game.');if(state==='menu'||state==='over')setGame(b.dataset.g);}));
function press(sel,b){document.querySelectorAll(sel).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
document.querySelectorAll('#diff .seg').forEach(b=>b.addEventListener('click',()=>{diff=DIFF[b.dataset.d];press('#diff .seg',b);}));
document.querySelectorAll('#opp .seg').forEach(b=>b.addEventListener('click',()=>{
  const two=b.dataset.o==='net';press('#opp .seg',b);
  $('diff').hidden=two;$('link').hidden=!two;
  if(!two){closeLink();if(state!=='menu')toLobby('');foe.wins=you.wins=0;foe.hp=MAX_HP;
    setStatus("Host a duel and share the code, or type your rival's code and join.");}
}));
const codeEl=$('code');
$('host').addEventListener('click',()=>{
  wake();const A='ABCDEFGHJKMNPQRSTUVWXYZ';let c='';for(let i=0;i<4;i++)c+=A[Math.floor(Math.random()*A.length)];
  codeEl.value=c;openLink('host',c);
});
$('join').addEventListener('click',()=>{
  wake();const c=codeEl.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(c.length!==4)return setStatus('Type the 4-letter code your rival is showing.');
  openLink('guest',c);
});

/* ---------- headset: full VR, or passthrough with the real room behind the duel ---------- */
const vrBtn=$('vr'),mrBtn=$('mr');
async function enterXR(kind){
  wake();
  try{
    const session=await navigator.xr.requestSession(kind,{optionalFeatures:['local-floor','bounded-floor']});
    const pass=kind==='immersive-ar';
    renderer.xr.setReferenceSpaceType('local-floor');
    await renderer.xr.setSession(session);
    mode='vr';camera.position.set(0,0,0);camera.rotation.set(0,0,0);placeSlots();menu.hidden=true;
    env.visible=!pass;scene.background=pass?null:bgColor;scene.fog=pass?null:fog;room.userData.walls.visible=!pass;
    if(pass)renderer.setClearColor(0x000000,0);
    session.addEventListener('end',()=>{
      mode='flat';env.visible=true;scene.background=bgColor;scene.fog=fog;room.userData.walls.visible=true;
      flatCamera();placeSlots();resize();
      if(state==='menu'||state==='over'){say('');menu.hidden=false;}
    });
  }catch(e){note.textContent='The headset view could not start here: '+(e&&e.message||e);}
}
vrBtn.addEventListener('click',()=>enterXR('immersive-vr'));
mrBtn.addEventListener('click',()=>enterXR('immersive-ar'));
(async()=>{
  const can=async k=>{try{return !!(navigator.xr&&await navigator.xr.isSessionSupported(k));}catch(e){return false;}};
  const vr=await can('immersive-vr'),mr=await can('immersive-ar');
  vrBtn.hidden=!vr;mrBtn.hidden=!mr;
  if(!vr&&!mr)note.textContent='VR and passthrough buttons appear when this page is opened directly in a headset browser over HTTPS.';
})();
window.__qzar={setGame,jet,holst,throwDisc,ROOM,get game(){return game;},W,ALL,fired,flatHand,setHeld,spawn,V3,scene,camera,makeGun,makeShield,makeShot,you,foe,shots,net,get state(){return state;},get round(){return roundNo;},hurt};

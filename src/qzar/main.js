// SLOWFIRE DUEL (/qzar): a one-on-one dodge duel of slow shots, against a bot or another player, on a screen or in a headset (VR or passthrough)
import * as THREE from 'three';
import { Peer } from 'peerjs';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { WCOL, makeGun, makeShield, makeShot, glowTex, setEnv } from './guns.js';
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
  buckler:{name:'Buckler',hint:'blocks for 4 seconds', shield:true,dur:4}
};
const KEYS=['pip','needle','scatter','drifter'];
const POOL=['pip','pip','pip','needle','needle','scatter','scatter','drifter','buckler'];
const DIFF={
  easy:  {speed:1.0,window:.7, err:.50,lead:.3,regrab:3.6,gap:1.3},
  normal:{speed:1.5,window:1.1,err:.28,lead:.7,regrab:2.8,gap:1.0},
  hard:  {speed:2.1,window:1.6,err:.14,lead:1, regrab:2.0,gap:.75}
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
flatCamera();
scene.add(new THREE.HemisphereLight(0xbfd0ff,0x1a1f3a,2.8));
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(3,8,4);scene.add(sun);
setEnv(new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture);

const env=new THREE.Group();scene.add(env);          // hidden in passthrough so the real room shows
const floor=new THREE.Mesh(new THREE.CircleGeometry(40,48),new THREE.MeshStandardMaterial({color:0x121a36,roughness:1}));
floor.rotation.x=-Math.PI/2;env.add(floor);
const grid=new THREE.GridHelper(40,40,0x2c3a73,0x1c2752);grid.position.y=.01;env.add(grid);
function platform(z,col,parent){
  const g=new THREE.Group();
  const top=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,.12,40),new THREE.MeshStandardMaterial({color:0x202c5c,roughness:.7}));
  top.position.y=.06;g.add(top);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1.15,.035,8,48),new THREE.MeshBasicMaterial({color:col}));
  rim.rotation.x=Math.PI/2;rim.position.y=.12;g.add(rim);
  g.position.z=z;parent.add(g);
}
platform(PZ,YOU,env);platform(BZ,FOE,scene);
for(let i=0;i<10;i++){            // distant pylons give the lane some depth
  const h=3+Math.random()*5,side=i%2?1:-1;
  const p=new THREE.Mesh(new THREE.BoxGeometry(.6,h,.6),new THREE.MeshStandardMaterial({color:0x1b2550,roughness:1}));
  p.position.set(side*(5+Math.random()*3),h/2,-12+i*2.4);env.add(p);
}

function body(col,opacity){
  const g=new THREE.Group();
  const m=new THREE.MeshStandardMaterial({color:col,roughness:.5,transparent:opacity<1,opacity});
  const head=new THREE.Mesh(new THREE.SphereGeometry(.16,20,14),m);g.add(head);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.2,.15,.5,16),m);torso.position.y=-.45;g.add(torso);
  scene.add(g);return g;
}
function shieldMesh(col){
  const s=makeShield(col);s.visible=false;return s;
}
function rack(turned){                 // one of each weapon, only the one in use shown
  const g=new THREE.Group(),guns={};
  for(const k of [...KEYS,'buckler']){const m=makeGun(k);m.visible=false;if(turned)m.rotation.y=Math.PI;g.add(m);guns[k]=m;}
  g.userData.guns=guns;
  g.userData.show=key=>{for(const k in guns)guns[k].visible=k===key;return key?guns[key]:null;};
  return g;
}

/* ---------- fighters ---------- */
const youBody=body(YOU,.4), foeBody=body(FOE,1);
const you={hp:MAX_HP,head:new V3(0,1.5,PZ),vel:new V3(),wins:0};
const foe={hp:MAX_HP,head:new V3(0,1.5,BZ),wins:0,held:null,cool:0,grabT:1,goal:new V3(0,1.5,BZ),wanderT:0,shield:shieldMesh(FOE),shieldT:0,netShield:null,netW:-1,rack:rack(true)};
foe.rack.position.set(-.3,-.2,.15);foe.rack.scale.setScalar(1.5);foeBody.add(foe.rack);
foeBody.add(foe.shield);

function makeHand(parent,visPos,shieldPos){
  const h={parent,held:null,cool:0,want:false,vis:rack(),shield:shieldMesh(YOU),shieldT:0,pad:null,kick:0,base:visPos};
  h.vis.position.copy(visPos);h.shield.position.copy(shieldPos);
  parent.add(h.vis);parent.add(h.shield);return h;
}
const flatHand=makeHand(youBody,new V3(.3,-.2,-.15),new V3(0,-.15,-.5));flatHand.vis.scale.setScalar(1.5);
const vrHands=[0,1].map(i=>{
  const c=renderer.xr.getController(i);rig.add(c);
  c.add(new THREE.Mesh(new THREE.SphereGeometry(.035,12,8),new THREE.MeshBasicMaterial({color:YOU})));
  const h=makeHand(c,new V3(0,-.01,0),new V3(0,0,-.14));
  c.addEventListener('selectstart',()=>{ if(state==='menu'||state==='over')tryStart(); else h.want=true; });
  c.addEventListener('connected',e=>{h.pad=e.data&&e.data.gamepad||null;});
  c.addEventListener('disconnected',()=>{h.pad=null;});
  return h;
});
let mode='flat';
const hands=()=>mode==='vr'?vrHands:[flatHand];

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
function spawn(owner,key,pos,vel){
  const w=W[key];
  const mesh=makeShot(key,owner===you?YOU:FOE);
  mesh.position.copy(pos);mesh.lookAt(tmp.copy(pos).add(vel));scene.add(mesh);
  const s={mesh,pos:mesh.position,vel,owner,key,r:w.r,dmg:w.dmg,absorb:w.absorb||0,life:0,dead:false,id:0,far:false};
  shots.push(s);return s;
}
function fire(owner,key,origin,dir){
  const w=W[key],n=w.pellets||1;
  for(let i=0;i<n;i++){
    const d=dir.clone();
    if(n>1){d.x+=(i-(n-1)/2)*w.spread;d.y+=(Math.random()-.5)*w.spread;d.normalize();}
    const s=spawn(owner,key,origin,d.multiplyScalar(w.speed));
    if(owner===you){s.id=shotId++;mine.set(s.id,s);}
  }
  puff(origin,owner===you?YOU:FOE,key==='drifter'?.7:.32,.09,null);
  beep(owner===you?520:300,.06,'square',.05);
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
function killRemote(p){p.dead=true;if(p.far){deadRemote.add(p.id);kills.push(p.id);}}
function clearShots(){shots.forEach(s=>scene.remove(s.mesh));shots.length=0;mine.clear();remote.clear();deadRemote.clear();kills=[];}

/* ---------- sound and feedback ---------- */
let actx=null;
function beep(f,dur,type,vol){
  if(!actx)return;
  try{const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=f;
    g.gain.setValueAtTime(vol,actx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+dur);
    o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+dur);}catch(e){}
}
function wake(){if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}}
function buzz(h,ms){try{const a=h.pad&&h.pad.hapticActuators&&h.pad.hapticActuators[0];if(a)a.pulse(.7,ms);}catch(e){}}
const flash=$('flash');
function hurt(who,dmg){
  who.hp=Math.max(0,who.hp-dmg);
  if(who===you){flash.style.opacity=.9;setTimeout(()=>{flash.style.opacity=0;},90);beep(110,.18,'sawtooth',.12);vrHands.forEach(h=>buzz(h,80));}
  else beep(880,.1,'triangle',.1);
  if(who.hp<=0&&state==='play'&&!isGuest())endRound(who===you?foe:you);
}

/* ---------- match flow ---------- */
let state='menu',timer=0,clock=ROUND_TIME,diff=DIFF.normal,msg='',roundNo=0,result=0,overShown=false;
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
  [flatHand,...vrHands].forEach(h=>{h.held=null;h.shieldT=0;h.cool=0;h.want=false;});foe.netW=-1;foe.rack.userData.show(null);
  foe.held=null;foe.shieldT=0;foe.netShield=null;foe.grabT=1.2;foe.head.set(0,1.5,BZ);foe.goal.copy(foe.head);
  slots.forEach((s,i)=>{s.type=null;s.timer=.4+i*.5;});
}
function startRound(){roundNo++;resetRound();state='count';timer=3;}
function announce(winner,over){
  say(!winner?'Draw':winner===you?(over?'You win the match':'Round to you'):(over?'Rival wins the match':'Round to rival'));
  beep(winner===you?660:180,.4,'triangle',.12);
}
function endRound(winner){
  if(winner)winner.wins++;
  const over=you.wins>=2||foe.wins>=2;
  result=winner===you?1:winner===foe?2:3;
  announce(winner,over);
  state=over?'over':'roundEnd';timer=over?2.5:2.2;
}
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
  let sh=0;
  for(const h of hands())if(h.shieldT>0){h.shield.getWorldPosition(tmp);sh=[r2(tmp.x),r2(tmp.y),r2(tmp.z)];}
  const s=[];
  for(const p of shots)if(p.owner===you&&!p.dead&&s.length<30)
    s.push([p.id,KEYS.indexOf(p.key),r2(p.pos.x),r2(p.pos.y),r2(p.pos.z),r2(p.vel.x),r2(p.vel.y),r2(p.vel.z)]);
  const pk={q:Date.now(),r:net.role,rn:roundNo,h:[r2(you.head.x),r2(you.head.y),r2(you.head.z)],hp:Math.round(you.hp),sh,s,k:kills.slice(-30),w:-1};
  for(const h of hands())if(h.held)pk.w=KEYS.indexOf(h.held.key);
  if(net.role==='host')pk.ph=[PH.indexOf(state),r2(timer),r2(clock),you.wins,foe.wins,roundNo,result];
  net.link.send(pk);
}
function rx(pk){                           // everything in here is untrusted input from the other player
  if(!net.on||!pk||typeof pk!=='object'||pk.r===net.role||!(num(pk.q)>net.lastQ))return;
  net.lastQ=pk.q;
  if(!net.lastRx)setStatus(net.role==='host'?'Rival connected. Press Start duel.':'Connected. Your rival starts the duel.');
  net.lastRx=performance.now();
  const h=Array.isArray(pk.h)?pk.h:[];      // the rival's world is ours turned half a turn about the centre
  foe.goal.set(clamp(-num(h[0]),-1.6,1.6),clamp(num(h[1]),.3,2.4),clamp(-num(h[2]),BZ-1.3,BZ+1.3));
  if(net.role==='guest'&&Array.isArray(pk.ph))follow(pk.ph);
  if(pk.rn===roundNo)foe.hp=clamp(num(pk.hp),0,MAX_HP);
  foe.netW=typeof pk.w==='number'?pk.w:-1;
  foe.netShield=Array.isArray(pk.sh)?new V3(-num(pk.sh[0]),num(pk.sh[1]),-num(pk.sh[2])):null;
  const seen=new Set();
  (Array.isArray(pk.s)?pk.s.slice(0,40):[]).forEach(a=>{
    if(!Array.isArray(a))return;
    const id=a[0],key=KEYS[a[1]];if(!key||typeof id!=='number')return;
    seen.add(id);
    if(remote.has(id)||deadRemote.has(id)||state!=='play'||pk.rn!==roundNo)return;
    const vel=new V3(-num(a[5]),num(a[6]),-num(a[7]));if(vel.length()>10)vel.setLength(10);
    const s=spawn(foe,key,new V3(-num(a[2]),num(a[3]),-num(a[4])),vel);
    s.id=id;s.far=true;remote.set(id,s);
  });
  remote.forEach((s,id)=>{if(!seen.has(id))s.dead=true;});
  (Array.isArray(pk.k)?pk.k.slice(0,40):[]).forEach(id=>{const s=mine.get(id);if(s)s.dead=true;});
}
function follow(ph){                       // the guest mirrors the host's round state
  const st=PH[ph[0]]||'menu',rn=num(ph[5]),was=state;
  timer=num(ph[1]);clock=num(ph[2]);foe.wins=num(ph[3]);you.wins=num(ph[4]);
  if(st===state&&rn===roundNo)return;
  roundNo=rn;state=st;
  if(st==='count'||st==='play'){
    if(st==='count'||was!=='count')resetRound();
    menu.hidden=true;
  }else if(st==='roundEnd'||st==='over')announce(ph[6]===2?you:ph[6]===1?foe:null,st==='over');
  else toLobby('Waiting for your rival to start');
}

/* ---------- per-frame update ---------- */
const tmp=new V3(),tmp2=new V3(),prevHead=new V3().copy(you.head),target={x:0,y:1.5};
function hitsBody(p,f){
  if(p.pos.distanceTo(f.head)<p.r+.16)return true;
  tmp.copy(f.head);tmp.y-=.42;return p.pos.distanceTo(tmp)<p.r+.24;
}
function setHeld(h,key){
  const w=W[key];
  if(w.shield){h.held=null;h.shieldT=w.dur;}
  else h.held={key,ammo:w.ammo};
  beep(700,.05,'sine',.06);buzz(h,30);
}
function updatePlayer(dt){
  if(mode==='vr'){you.head.setFromMatrixPosition(camera.matrixWorld);}
  else{
    you.head.x+= (target.x-you.head.x)*Math.min(1,dt*18);
    you.head.y+= (target.y-you.head.y)*Math.min(1,dt*18);
    you.head.z=PZ;
  }
  youBody.position.copy(you.head);youBody.visible=mode!=='vr';
  tmp.copy(you.head).sub(prevHead).divideScalar(Math.max(dt,.001));
  you.vel.lerp(tmp,.2);prevHead.copy(you.head);

  for(const h of hands()){
    h.cool-=dt;
    const hp=mode==='vr'?h.parent.getWorldPosition(tmp2):tmp2.copy(you.head);
    if(state==='play'){
      if(!h.held&&h.shieldT<=0){
        const reach=mode==='vr'?.17:.3;
        for(const s of slots){ if(s.type&&s.pos.distanceTo(hp)<reach){setHeld(h,s.type);s.type=null;s.timer=2.4+Math.random()*1.6;break;} }
      }
      if(h.want&&h.held&&h.cool<=0){
        const w=W[h.held.key],gun=h.vis.userData.guns[h.held.key];let dir;
        gun.updateWorldMatrix(true,false);const o=gun.localToWorld(gun.userData.muzzle.clone());
        if(mode==='vr'){dir=new V3(0,0,-1).applyQuaternion(h.parent.getWorldQuaternion(new THREE.Quaternion()));}
        else dir=new V3().copy(foe.head).sub(o).normalize();
        fire(you,h.held.key,o,dir);h.kick=1;buzz(h,25);
        h.cool=w.cool;if(--h.held.ammo<=0)h.held=null;
      }
    }
    h.want=false;
    if(h.shieldT>0)h.shieldT-=dt;
    h.shield.visible=h.shieldT>0;
    h.shield.userData.life(Math.min(1,h.shieldT/W.buckler.dur));
    const gun=h.vis.userData.show(h.shieldT>0?'buckler':h.held?h.held.key:null);
    if(gun&&h.held)gun.userData.setAmmo(h.held.ammo);
    if(gun&&gun.userData.tick)gun.userData.tick(performance.now()/1000);
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
  foe.shield.visible=!!foe.netShield;
  if(foe.netShield)foe.shield.position.copy(foe.netShield).sub(foe.head);
  showFoeGun(foe.netShield?'buckler':state==='play'?KEYS[foe.netW]:null,-1);
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
  const d=tmp.length(),step=diff.speed*(urgent?1.4:.6)*dt;
  if(d>.001)foe.head.addScaledVector(tmp,Math.min(1,step/d));
  foeBody.position.copy(foe.head);

  if(foe.shieldT>0)foe.shieldT-=dt;
  foe.shield.position.set(0,-.15,.5);foe.shield.visible=foe.shieldT>0;foe.shield.userData.life(Math.min(1,foe.shieldT/W.buckler.dur));
  showFoeGun(foe.shieldT>0?'buckler':foe.held?foe.held.key:null,foe.held?foe.held.ammo:-1);
  if(!foe.held){
    if((foe.grabT-=dt)<=0){
      const key=pick(POOL),w=W[key];
      if(w.shield){foe.shieldT=w.dur;foe.grabT=diff.regrab+w.dur*.5;}
      else{foe.held={key,ammo:w.ammo};foe.cool=.5+Math.random()*.5;}
    }
  }else if((foe.cool-=dt)<=0){
    const w=W[foe.held.key];
    const o=new V3(foe.head.x,foe.head.y-.15,BZ+.35);
    const t=o.distanceTo(you.head)/w.speed;
    const aim=new V3().copy(you.head).addScaledVector(you.vel,t*diff.lead);
    aim.y-=.15;aim.x+=(Math.random()-.5)*2*diff.err;aim.y+=(Math.random()-.5)*2*diff.err;
    fire(foe,foe.held.key,o,aim.sub(o).normalize());
    foe.cool=Math.max(w.cool,diff.gap*(.7+Math.random()*.6));
    if(--foe.held.ammo<=0){foe.held=null;foe.grabT=diff.regrab*(.7+Math.random()*.6);}
  }
}
function updateShots(dt){
  for(const p of shots){
    if(p.dead)continue;
    p.pos.addScaledVector(p.vel,dt);p.life+=dt;
    if(p.mesh.userData.tick)p.mesh.userData.tick(dt);
    if(p.life>9||Math.abs(p.pos.z)>9){p.dead=p.gone=true;continue;}
    if(p.owner===foe){
      for(const h of hands()){ if(!p.dead&&h.shieldT>0&&h.shield.getWorldPosition(tmp).distanceTo(p.pos)<.34+p.r){killRemote(p);beep(400,.04,'sine',.06);buzz(h,40);} }
      if(!p.dead&&hitsBody(p,you)){killRemote(p);hurt(you,p.dmg);}
    }else if(!net.on){                   // against a remote player, they decide what hits them
      if(foe.shieldT>0&&foe.shield.getWorldPosition(tmp).distanceTo(p.pos)<.34+p.r){p.dead=true;beep(400,.04,'sine',.06);}
      else if(hitsBody(p,foe)){p.dead=true;hurt(foe,p.dmg);}
    }
  }
  for(const a of shots){               // Drifter orbs swallow enemy fire; each side resolves its own orbs
    if(a.dead||!a.absorb||a.far)continue;
    for(const b of shots){
      if(b.dead||b.owner===a.owner||a.pos.distanceTo(b.pos)>a.r+b.r)continue;
      killRemote(b);if(--a.absorb<=0||b.absorb){a.dead=true;break;}
    }
  }
  for(let i=shots.length-1;i>=0;i--){
    const s=shots[i];
    if(s.dead){if(!s.gone)burst(s.pos,s.owner===you?YOU:FOE,s.key==='drifter');scene.remove(s.mesh);if(s.far)remote.delete(s.id);else mine.delete(s.id);shots.splice(i,1);}
  }
}
function updateSlots(dt,now){
  for(const s of slots){
    if(!s.type&&(s.timer-=dt)<=0&&state==='play'){
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
  const h=flatHand,key=h.shieldT>0?'buckler':h.held?h.held.key:'';
  const label=key+(h.held?h.held.ammo:'');
  if(label!==lastWeapon){
    lastWeapon=label;
    weaponEl.innerHTML=key?W[key].name+(h.held?' · '+h.held.ammo+' left':'')+'<small>'+W[key].hint+'</small>'
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
    if(state==='count')say(timer>0?String(Math.ceil(timer)):'');
  }else if(state==='count'){
    timer-=dt;say(timer>0?String(Math.ceil(timer)):'');
    if(timer<=0){state='play';say('');beep(880,.2,'square',.08);}
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
  updatePlayer(dt);
  if(net.on)updateRemote(dt);
  else if(state==='play')updateBot(dt);
  else foeBody.position.copy(foe.head);
  if(state==='play'||state==='roundEnd'||state==='over')updateShots(dt);
  updateSlots(dt,now);updateFx(dt);updateHud(dt);
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
  target.x=clamp((nx-.5)*2.2,-1,1);
  target.y=clamp(.6+(1-ny)*1.5,.75,1.9);
}
canvas.addEventListener('pointermove',point);
canvas.addEventListener('pointerdown',e=>{wake();point(e);if(e.pointerType==='mouse')flatHand.want=true;});
$('fire').addEventListener('pointerdown',e=>{e.preventDefault();wake();flatHand.want=true;});
window.addEventListener('keydown',e=>{
  if(e.code==='Space'&&e.target.tagName!=='INPUT'){e.preventDefault();if(state==='play')flatHand.want=true;}
});
startBtn.addEventListener('click',tryStart);
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
    env.visible=!pass;scene.background=pass?null:bgColor;scene.fog=pass?null:fog;
    if(pass)renderer.setClearColor(0x000000,0);
    session.addEventListener('end',()=>{
      mode='flat';env.visible=true;scene.background=bgColor;scene.fog=fog;
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
window.__qzar={scene,camera,makeGun,makeShield,makeShot,you,foe,shots,net,get state(){return state;},get round(){return roundNo;},hurt};

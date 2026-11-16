// HULL DOWN's games: alone or with others in the one lobby, the other players' tanks and crews, and the missions (battle, defend the town, ambush, escort, one against one); put into main.js by tools/edge.cjs
const G={multi:false,mode:'battle',wait:false};
const MODES={battle:{name:'BATTLE',brief:'Four waves of armour are coming over the ridges. Find a crest and hold the sector.'},
  defend:{name:'DEFEND THE TOWN',brief:'They are coming for the town. Stop them before they shell it flat.'},
  ambush:{name:'AMBUSH',brief:'A column is coming down the road. Hold your fire until they are side on, then let none through.'},
  escort:{name:'ESCORT',brief:'Three supply trucks are going up the road to the works. Stay with them and get them there.'},
  duel:{name:'ONE AGAINST ONE',brief:'The other player is out there. Find them first.'}};
const MODEK=Object.keys(MODES);
const NET={ws:null,on:false,bc:null,id:'me',slot:0,peers:new Map(),score:[0,0],sendT:0,snapT:0,opened:false,full:false};
const SPAWN=[[0,0],[-95,-410],[260,-150],[-300,60]];
const isHost=()=>{for(const r of NET.peers.values())if(r.slot<NET.slot)return false;return true;};
const duel=()=>G.mode==='duel'&&NET.peers.size>0,coop=()=>G.mode!=='duel'&&NET.peers.size>0;
const noRem={on:false,x:0,z:0};
// ---- the other players: a tank each, its hatch lid, and the commander who stands up in it when their hatch is open
const REMTINT=[[.8,.8,.8],[.45,.4,.36],[.5,.6,.42],[.86,.74,.52]];
function addRem(id,slot){
  const g=heroProto.clone(true),r={id,slot,g,x:0,z:0,yaw:0,tyaw:0,elev:0,tx:0,tz:0,tyw:0,tty:0,tel:0,hatch:0,th:0,hy:0,hp:0,v:0,armour:100,alive:true,on:false,smokeT:-99};
  r.t=g.getObjectByName('turret');r.gun=g.getObjectByName('gun');const c=REMTINT[slot%4];g.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.color.setRGB(c[0],c[1],c[2]);m.castShadow=false;}});
  r.lid=new T.Group();r.lid.position.set(HX,ROOF+.02,HZ+.36);{const h=M.hatch.clone();h.position.set(0,0,-.36);r.lid.add(h);}r.t.add(r.lid);
  r.man=T.SkeletonUtils.clone(M.soldier);r.man.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});r.mx=new T.AnimationMixer(r.man);r.mx.clipAction(clip('idle')).play();r.man.visible=false;r.t.add(r.man);
  g.visible=false;scene.add(g);NET.peers.set(id,r);return r;
}
function dropRem(id){const r=NET.peers.get(id);if(!r)return;scene.remove(r.g);NET.peers.delete(id);}
function updateRems(dt){
  for(const r of NET.peers.values()){
    if(!r.on){r.g.visible=false;continue;}const k=Math.min(1,dt*9);r.x=lerp(r.x,r.tx,k);r.z=lerp(r.z,r.tz,k);r.yaw+=wrap(r.tyw-r.yaw)*k;r.tyaw+=wrap(r.tty-r.tyaw)*k;r.elev=lerp(r.elev,r.tel,k);r.hatch=lerp(r.hatch,r.th,k);r.y=WORLD.gAt(r.x,r.z);
    r.g.visible=true;r.g.position.set(r.x,r.y,r.z);r.g.quaternion.setFromUnitVectors(UP,normalAt(r.x,r.z,va)).multiply(qa.setFromAxisAngle(UP,r.yaw));r.t.rotation.y=r.tyaw;r.gun.rotation.x=r.elev;WORLD.rut(r,r.x,r.z,r.yaw);
    r.lid.rotation.x=clamp(r.hatch*2.2,0,1)*1.9;const up=smooth(clamp((r.hatch-.3)/.7,0,1));r.man.visible=up>.02&&r.alive;
    if(r.man.visible){r.man.position.set(HX,ROOF-1.72+up*.82,HZ);r.man.rotation.y=Math.PI+r.hy;r.mx.update(dt);}
    if(!r.alive&&Math.random()<dt*4)puff(r.x,r.y+2,r.z,{c:[.04,.04,.04],s0:2.5,s1:14,life:5,vy:3.5,vx:1.2,op:.8});}
}
// everyone a tank might shoot at: you and the others
const PL=[];
function players(){PL.length=0;PL.push({me:true,id:NET.id,x:P.x,y:P.y,z:P.z,v:P.v,smokeT:P.smokeT,alive:state==='play'});for(const r of NET.peers.values())if(r.on)PL.push({id:r.id,x:r.x,y:r.y||0,z:r.z,v:r.v,smokeT:r.smokeT,alive:r.alive});return PL;}
function nearPl(x,z){let b=null,bd=1e9;for(const p of PL){if(!p.alive)continue;const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;b=p;}}return b;}
// ---- the wire
function netSend(m){if(NET.bc)NET.bc.postMessage({from:NET.id,m});else if(NET.on&&NET.ws&&NET.ws.readyState===1)NET.ws.send(JSON.stringify(m));}
const _eu=new T.Euler();
const SAY=[n=>['Wave '+n[0]+' of '+n[1]+' · '+n[2]+' tanks','They are on the plot. Find a crest and lay the gun.'],n=>['The town is being shelled',n[0]+' buildings down. Stop them.'],()=>['They have seen you','The column is turning on you. Fight it out.'],n=>['One got through',n[0]+' of 2 they can afford to lose you.'],
  n=>['Contact · '+n[0]+' tanks on the convoy','They were waiting off the road. Get between them and the trucks.'],n=>['A truck is hit and burning',n[0]+' still rolling.'],()=>['The convoy is waiting for you','Close up: they will not move without their escort.'],n=>['Target destroyed',n[0]?n[0]+' left':'']];
function say(c,n,secs){const s=SAY[c](n||[]);setHud(s[0],s[1],secs||6);if(coop()&&isHost())netSend({t:'say',c,n:n||[]});}
const netOn={
  welcome(m){NET.on=true;NET.id=m.id||NET.id;NET.slot=m.slot|0;for(const p of m.peers||[])joined(p.id,p.slot|0,false);},
  'peer-join'(m){joined(m.id,m.slot|0,true);},
  'peer-leave'(m){left(m.id);},
  full(){NET.full=true;setHud('The lobby is full','Four are already out there. Try again in a while, or play alone.',0);},
  pose(m){const r=NET.peers.get(m.id),p=m.p;if(!r)return;r.tx=p[0];r.tz=p[1];r.tyw=p[2];r.tty=p[3];r.tel=p[4];r.th=p[5];r.armour=p[6];r.alive=p[6]>0;r.v=p[7];r.hy=p[8]||0;if(!r.on){r.on=true;r.x=p[0];r.z=p[1];r.yaw=p[2];}},
  fire(m){const s=shell(true);s.ghost=true;s.kind=m.k;s.p.fromArray(m.o);s.v.fromArray(m.v);const d=distTo(m.o[0],m.o[2]);puff(m.o[0],m.o[1],m.o[2],{add:true,c:[3.2,2.1,1],s0:3,s1:11,life:.14});puff(m.o[0],m.o[1],m.o[2],{c:[.5,.48,.44],s0:2,s1:9,life:2.2,vy:1,op:.6});play('gun_far',clamp(1.2/(1+d/170),0,1),'out',d/340);if(mis)mis.fired=true;},
  hit(m){if(state==='play'&&duel()&&(!m.to||m.to===NET.id))hurtPlayer((m.d||22)/22);},
  dead(m){const r=NET.peers.get(m.id);if(!r)return;r.alive=false;explode(r.x,hAt(r.x,r.z)+1.5,r.z,true,false);
    if(duel()){NET.score[0]++;P.kills++;setHud('You knocked them out','You '+NET.score[0]+' : '+NET.score[1]+' them. They are coming back.',6);}else setHud('One of yours is knocked out','They will be back in a spare tank.',5);},
  mine(m){layMine(m.o[0],m.o[1],false);},
  nade(m){throwNade(va.fromArray(m.o),vb.fromArray(m.v),true);},
  smoke(m){const r=NET.peers.get(m.id);if(!r)return;r.smokeT=time+22;for(let i=0;i<8;i++){const a=r.yaw+r.tyaw+(i-3.5)*.16,d=40,x=r.x-Math.sin(a)*d,z=r.z-Math.cos(a)*d,y=hAt(x,z);for(let k=0;k<5;k++)puff(x+(Math.random()-.5)*8,y+1+k*1.6,z+(Math.random()-.5)*8,{c:[.78,.78,.76],s0:5,s1:26,life:18,vy:.25,op:.95});}},
  // the first one in runs the mission and says when it starts, where its tanks are, what they fire and how it ends
  start(m){const r=NET.peers.get(m.id);if(!r||r.slot>NET.slot||state==='preview'||m.j&&mis&&!mis.over&&!G.wait)return;startMission(MODEK[m.m]||'battle',true);},
  ready(){if(!isHost()||!G.multi||state==='preview')return;if(state==='over'||G.wait||G.mode==='duel')startMission(G.mode);else netSend({t:'start',m:MODEK.indexOf(G.mode),j:1});},
  foes(m){if(isHost()||!mis)return;const a=m.a||[];for(let i=0;i*6<a.length;i++){const j=i*6;let e=foes[i];if(!e){e=addFoe(a[j],a[j+1],a[j],a[j+1]);e.state='net';}e.tx=a[j];e.tz=a[j+1];e.tyw=a[j+2];e.tty=a[j+3];
      if(a[j+5]===0&&e.state!=='dead')killFoe(e);else if(a[j+5]===2&&!e.gone){e.state='dead';e.gone=true;e.g.visible=false;}else if(e.state!=='dead')e.hp=a[j+4];}
    const o=m.o||[];for(let i=0;i*4<o.length&&i<mis.trucks.length;i++){const k=mis.trucks[i],j=i*4;k.tx=o[j];k.tz=o[j+1];k.tyw=o[j+2];if(o[j+3]<=0&&k.hp>0)truckDown(k);}
    if(m.n){wave=m.n[0]|0;mis.lost=m.n[1]|0;mis.town=m.n[2]|0;}},
  shot(m){if(!isHost())foeShell(m);},
  fhit(m){if(!isHost())return;const e=foes[m.f|0];if(!e||e.state==='dead')return;e.hp-=m.d|0;if(mis)mis.fired=true;if(e.hp<=0){killFoe(e);netSend({t:'kill',f:e.id});}else e.fireT=Math.max(e.fireT,2.5);},
  kill(m){const e=foes[m.f|0];if(e&&e.state!=='dead')killFoe(e);},
  boom(m){if(m.i>=0&&ITEMS[m.i])WORLD.hitItem(ITEMS[m.i],m.b?3:1.2,m.d[0],m.d[1],m.o[0],m.o[1],m.o[2]);else WORLD.scar(m.o[0],m.o[1],m.o[2],!!m.b,true);},
  ram(m){WORLD.ramBy(m.i|0,m.d);},
  say(m){if(SAY[m.c]){const s=SAY[m.c](m.n||[]);setHud(s[0],s[1],6);}},
  end(m){if(isHost()||state==='preview')return;missionOver(!!m.w,m.c|0,true);}
};
function joined(id,slot,late){
  if(NET.peers.has(id))return;addRem(id,slot);
  if(state==='preview')return;
  if(isHost()){if(G.wait||G.mode==='duel'||state==='over')startMission(G.mode);else{netSend({t:'start',m:MODEK.indexOf(G.mode),j:1});setHud('Another player has joined','They are in your fight now.',6);resetFriends();}}
  else if(G.wait)setHud('Another player is here','Their mission starts for you both in a moment.',6);
}
function left(id){
  if(!NET.peers.has(id))return;dropRem(id);if(NET.peers.size||state==='preview')return;
  if(G.mode==='duel'||state==='over'){waitHere('The other player has left');return;}
  for(const e of foes)if(e.state==='net'){e.state='hold';e.dx=e.x;e.dz=e.z;e.fireT=4+Math.random()*4;}
  setHud('The other player has left','The fight is yours alone now.',6);
}
function waitHere(why){resetAll();state='play';G.wait=true;mis=null;placeStart();syncUi();setHud(why||'Waiting for another player','You are in the lobby. The mission starts when someone joins.',0);}
function netOpen(){
  if(NET.opened)return;NET.opened=true;const q=new URLSearchParams(location.search);
  if(q.has('local')){const bc=NET.bc=new BroadcastChannel('tank-local'),id=NET.id='p'+Math.random().toString(36).slice(2,8),slot=+q.get('slot')||0;
    bc.onmessage=e=>{const d=e.data;if(!d||d.from===id)return;if(d.hello){netOn['peer-join']({id:d.from,slot:d.slot});if(d.hello===1)bc.postMessage({from:id,hello:2,slot});return;}if(d.bye)return netOn['peer-leave']({id:d.from});if(d.m&&netOn[d.m.t]){d.m.id=d.from;netOn[d.m.t](d.m);}};
    NET.on=true;NET.slot=slot;bc.postMessage({from:id,hello:1,slot});addEventListener('pagehide',()=>bc.postMessage({from:id,bye:1}));return;}
  if(location.protocol==='file:')return;let retry=1500;
  const open=()=>{let ws;try{ws=new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/parties/tank/public');}catch(e){return;}NET.ws=ws;
    ws.onopen=()=>{retry=1500;ws.send('{"t":"join"}');};ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(err){return;}if(netOn[m.t])netOn[m.t](m);};
    ws.onclose=()=>{NET.on=false;for(const id of[...NET.peers.keys()])left(id);if(!NET.full&&G.multi)setTimeout(open,retry=Math.min(retry*2,20000));};ws.onerror=()=>{};};open();
}
function updateNet(dt){
  updateRems(dt);if(!NET.peers.size)return;const r3=v=>Math.round(v*1000)/1000,r1=v=>Math.round(v*10)/10;
  NET.sendT-=dt;if(NET.sendT<=0&&state!=='preview'){NET.sendT=.1;_eu.setFromQuaternion(camera.quaternion,'YXZ');netSend({t:'pose',p:[r1(P.x),r1(P.z),r3(P.yaw),r3(P.tyaw),r3(P.elev),r3(P.hatch),state==='play'?Math.max(1,Math.round(P.armour)):0,r1(P.v),r3(_eu.y),r3(_eu.x)]});}
  if(coop()&&isHost()&&mis){NET.snapT-=dt;if(NET.snapT<=0){NET.snapT=.25;const a=[],o=[];for(const e of foes)a.push(r1(e.x),r1(e.z),r3(e.yaw),r3(e.tyaw),e.hp,e.gone?2:e.state==='dead'?0:1);for(const k of mis.trucks)o.push(r1(k.x),r1(k.z),r3(k.yaw),k.hp);netSend({t:'foes',a,o,n:[wave,mis.lost|0,mis.town|0]});}}
}
// ---- the missions
let mis=null;
const PATH=ROAD.slice(1),PLEN=(()=>{let L=0;for(let i=0;i<PATH.length-1;i++)L+=Math.hypot(PATH[i+1][0]-PATH[i][0],PATH[i+1][1]-PATH[i][1]);return L;})();
// a point d metres up the road from the town's edge toward the works, and the way the road runs there
function roadAt(d,out){d=clamp(d,0,PLEN-.01);for(let i=0;i<PATH.length-1;i++){const a=PATH[i],b=PATH[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=l){out.x=lerp(a[0],b[0],d/l);out.z=lerp(a[1],b[1],d/l);out.yaw=Math.atan2(-(b[0]-a[0]),-(b[1]-a[1]));return out;}d-=l;}return out;}
const TOWN=[150,300],rp={x:0,z:0,yaw:0};
let ambushSpot=null;
function findAmbush(){if(ambushSpot)return ambushSpot;roadAt(PLEN*.42,rp);let best=null,bh=-1e9;for(let i=0;i<64;i++){const a=i/64*6.28,d=150+(i%4)*26,x=rp.x+Math.cos(a)*d,z=rp.z+Math.sin(a)*d;if(!openAt(x,z,8)||Math.hypot(x,z)>600)continue;const y=hAt(x,z);if(los(x,y+2.3,z,rp.x,hAt(rp.x,rp.z)+1.5,rp.z)>=0)continue;if(y>bh){bh=y;best=[x,z];}}
  best=best||[rp.x+170,rp.z];return ambushSpot=[best[0],best[1],Math.atan2(-(rp.x-best[0]),-(rp.z-best[1]))];}
function startAt(mode){
  if(mode==='duel'){const a=SPAWN[NET.slot%4],b=SPAWN[(NET.slot+1)%4];return[a[0],a[1],Math.atan2(-(b[0]-a[0]),-(b[1]-a[1]))];}
  let s=mode==='defend'?[112,222,Math.atan2(-(60-112),-(120-222))]:mode==='ambush'?findAmbush():mode==='escort'?(roadAt(8,rp),[rp.x,rp.z,rp.yaw]):[0,0,0];
  const k=NET.slot*16+(mode==='escort'?12:0);return[s[0]+Math.cos(s[2])*k,s[1]-Math.sin(s[2])*k,s[2]];}
function placeStart(){const s=startAt(G.wait?'battle':G.mode);P.x=s[0];P.z=s[1];P.y=hAt(P.x,P.z);P.yaw=P.aimYaw=s[2];P.tyaw=0;P.v=0;P.rx=null;}
// the supply trucks of the escort
prep(M.truck);
function addTruck(d){const g=M.truck.clone();g.traverse(m=>{if(m.isMesh){m.material=cheap(m.material).clone();m.castShadow=false;}});scene.add(g);const k={g,d,hp:2,x:0,z:0,yaw:0,n:new T.Vector3(0,1,0),tx:null};roadAt(d,k);placeTruck(k,1);return k;}
function placeTruck(k,q){k.y=WORLD.gAt(k.x,k.z);k.n.lerp(normalAt(k.x,k.z,va),q).normalize();k.g.position.set(k.x,k.y-.1,k.z);k.g.quaternion.setFromUnitVectors(UP,k.n).multiply(qa.setFromAxisAngle(UP,k.yaw+Math.PI));}
function truckDown(k){if(k.hp<=0&&k.burnt)return;k.hp=0;k.burnt=1;k.g.traverse(m=>{if(m.isMesh)m.material.color.setRGB(.06,.06,.06);});explode(k.x,k.y+1.5,k.z,true,false);WORLD.fires.push({x:()=>k.x,y:()=>k.y,z:()=>k.z,t:60});}
function newMission(mode){
  for(const k of mis?mis.trucks:[])scene.remove(k.g);
  const m={mode,t:0,over:false,trucks:[],lost:0,town:0,alert:false,fired:false,seen:0,stage:0,shots0:0,houses:[]};
  if(mode==='defend'){m.houses=ITEMS.filter(t=>t.cls==='b'&&Math.hypot(t[0]-TOWN[0],t[1]-TOWN[1])<150);m.town=m.houses.length;}
  if(mode==='escort')for(let i=0;i<3;i++)m.trucks.push(addTruck(74-i*22));
  return m;
}
function spawnAround(cx,cz,n,base,spread,far,holdMin,holdMax,close){
  for(let i=0;i<n;i++){const a=base+(Math.random()-.5)*2*spread,d=far+Math.random()*90,hold=i===n-1&&close?close+Math.random()*50:holdMin+Math.random()*(holdMax-holdMin),a2=a+(Math.random()-.5)*.3;addFoe(cx-Math.sin(a)*d,cz-Math.cos(a)*d,cx-Math.sin(a2)*hold,cz-Math.cos(a2)*hold);}}
function startMission(mode,asGuest){
  G.mode=mode;G.wait=false;resetAll();mis=newMission(mode);state='play';placeStart();resetFriends();
  if(!asGuest){if(NET.peers.size)netSend({t:'start',m:MODEK.indexOf(mode)});
    if(mode==='ambush'){for(let i=0;i<6;i++){const e=addFoe(0,0,0,0);e.state='column';e.rd=PLEN-70-i*30;roadAt(e.rd,e);e.yaw+=Math.PI;placeFoe(e,1);}}}
  const xv=xrActive;setHud(MODES[mode].name,MODES[mode].brief+(mode==='duel'||mode==='ambush'||mode==='escort'?'':xv?' The screen ahead is your gunsight.':' F is the gunsight, H the hatch.'),10);syncUi();
}
// what a tank that cannot see a player shoots at instead
function altTarget(e){
  if(!mis)return null;
  if(mis.mode==='defend'){if(!e.alt||e.alt.it.gone){const l=mis.houses.filter(t=>!t.gone);if(!l.length)return null;let b=null,bd=1e9;for(let i=0;i<4;i++){const t=l[Math.floor(Math.random()*l.length)],d=Math.hypot(t[0]-e.x,t[1]-e.z);if(d<bd){bd=d;b=t;}}e.alt={it:b,x:b[0],z:b[1],y:b.y+Math.min(6,b.h*.5),p:.6};}return Math.hypot(e.alt.x-e.x,e.alt.z-e.z)<420?e.alt:null;}
  if(mis.mode==='escort'){let b=null,bd=520;for(const k of mis.trucks){if(k.hp<=0)continue;const d=Math.hypot(k.x-e.x,k.z-e.z);if(d<bd&&los(e.x,e.y+2.1,e.z,k.x,k.y+1.6,k.z)<0){bd=d;b=k;}}return b?{k:mis.trucks.indexOf(b),x:b.x,z:b.z,y:b.y+1.5,p:clamp(.7-bd/900,.2,.55)}:null;}
  return null;
}
// a tank's shell at something that is not you: a house, a truck, another player
function foeShell(o){
  const s=shell(false),f=o.f,to=o.to,d=distTo(f[0],f[2]);s.p.fromArray(f);s.from=new T.Vector3().fromArray(f);s.to=new T.Vector3().fromArray(to);s.T=Math.max(.05,s.from.distanceTo(s.to)/(o.w?450:600));
  puff(f[0],f[1],f[2],{add:true,c:[3,2,1],s0:3,s1:9,life:.14});puff(f[0],f[1],f[2],{c:[.5,.48,.44],s0:2,s1:9,life:2.2,vy:1,op:.7});play('gun_far',clamp(1.1/(1+d/170),0,1),'out',d/340,.85+Math.random()*.2);
  if(o.w&&o.w===NET.id){s.hit=!!o.h;return;}
  s.done=()=>{explode(to[0],to[1],to[2],false,!o.h,o.i>=0&&!!o.h);if(!o.h)return;const dx=to[0]-f[0],dz=to[2]-f[2],l=Math.hypot(dx,dz)||1;
    if(o.i>=0&&ITEMS[o.i])WORLD.hitItem(ITEMS[o.i],1,dx/l,dz/l,to[0],to[1],to[2]);
    if(o.k>=0&&mis&&mis.trucks[o.k]&&(!coop()||isHost())){const k=mis.trucks[o.k];if(k.hp>0&&--k.hp<=0){truckDown(k);mis.lost++;say(5,[mis.trucks.filter(q=>q.hp>0).length],5);}}};
}
function foeAt(e,a){e.shots++;const yw=e.yaw+e.tyaw,hit=Math.random()<a.p,o={t:'shot',f:[e.x-Math.sin(yw)*5,e.y+2.2,e.z-Math.cos(yw)*5],to:hit?[a.x,a.y,a.z]:[a.x+(Math.random()-.5)*26,0,a.z+(Math.random()-.5)*26],h:hit?1:0,i:a.it?a.it.id:-1,k:a.k==null?-1:a.k,w:''};
  if(!hit)o.to[1]=hAt(o.to[0],o.to[2]);foeShell(o);if(coop())netSend(o);}
function missionOver(win,c,told){
  if(!mis||mis.over)return;mis.over=true;state='over';endT=0;best=Math.max(best,P.kills);try{localStorage.setItem('hulldown-best',best);}catch(e){}showBest();
  const T_=[['Sector held · '+P.kills+' tanks',P.shots+' rounds fired, '+P.hits+' hits.'],['The town stands · '+P.kills+' tanks',(mis.houses.filter(t=>!t.gone).length)+' of '+mis.houses.length+' buildings still up.'],['The town is lost','Too much of it is rubble.'],['Ambush sprung · '+P.kills+' tanks','None got through to the town.'],['They broke through','Too many of the column reached the town.'],
    ['The convoy is in · '+mis.trucks.filter(k=>k.hp>0).length+' of 3 trucks','The works has its supplies.'],['The convoy is lost','Too many trucks are burning on the road.'],['Every tank is knocked out','The sector is lost.']][c];
  setHud(T_[0],T_[1]+' Fire to go again.',0);if(!told&&coop()&&isHost())netSend({t:'end',w:win?1:0,c});
}
function updateMission(dt){
  const m=mis;if(!m||m.over||state!=='play'&&!(state==='dead'&&coop())||G.wait||G.mode==='duel')return;m.t+=dt;if(coop()&&!isHost()){for(const k of m.trucks)if(k.tx!=null){const q=Math.min(1,dt*5);k.x=lerp(k.x,k.tx,q);k.z=lerp(k.z,k.tz,q);k.yaw+=wrap(k.tyw-k.yaw)*q;placeTruck(k,Math.min(1,dt*3));}return;}
  const extra=NET.peers.size;
  if(m.mode==='battle'||m.mode==='defend'){
    if(!live()){if(wave>=WAVES.length&&foes.length)missionOver(true,m.mode==='battle'?0:1);
      else{waveT-=dt;if(waveT<=0){const n=WAVES[wave]+extra+(m.mode==='defend'?1:0);
        if(m.mode==='battle')spawnAround(P.x,P.z,n,P.yaw+P.tyaw,[.7,1.3,2.1,3.1][wave],540,300,420,110);
        else{roadAt(140,rp);spawnAround(TOWN[0],TOWN[1],n,Math.atan2(-(rp.x-TOWN[0]),-(rp.z-TOWN[1]))+(wave%2?.9:-.5),[.5,.8,1.1,1.4][wave],540,170,250,120);}
        say(0,[wave+1,WAVES.length,n],7);wave++;waveT=7;}}}
    if(m.mode==='defend'){const down=m.houses.filter(t=>t.gone).length;if(down>m.lost){m.lost=down;if(down<6)say(1,[down],5);}m.town=m.houses.length-down;if(down>=6)missionOver(false,2);}
  }else if(m.mode==='ambush'){
    let thru=0;for(const e of foes){if(e.gone)thru++;else if(e.state==='column'&&e.rd<30){e.state='dead';e.gone=true;e.g.visible=false;thru++;}}
    if(thru>m.lost){m.lost=thru;if(thru<2)say(3,[thru],5);}
    if(!m.alert){let near=false;for(const e of foes)if(e.state==='column'){const p=nearPl(e.x,e.z);if(p&&Math.hypot(p.x-e.x,p.z-e.z)<110&&los(e.x,e.y+2.1,e.z,p.x,p.y+2.3,p.z)<0)near=true;}m.seen=near?m.seen+dt:0;
      if(P.shots>0||m.fired||m.seen>2.5||foes.some(e=>e.state==='dead'&&!e.gone)){m.alert=true;say(2,[],5);for(const e of foes)if(e.state==='column'){const p=nearPl(e.x,e.z)||PL[0],d=Math.hypot(p.x-e.x,p.z-e.z),h=Math.max(0,d-(110+Math.random()*90));e.dx=e.x+(p.x-e.x)/d*h+(Math.random()-.5)*40;e.dz=e.z+(p.z-e.z)/d*h+(Math.random()-.5)*40;e.state='advance';e.fireT=3+Math.random()*4;}}}
    if(thru>=2)missionOver(false,4);else if(!live()&&foes.length)missionOver(true,3);
  }else if(m.mode==='escort'){
    const lead=m.trucks.find(k=>k.hp>0);if(!lead){missionOver(false,6);return;}
    const p=nearPl(lead.x,lead.z),go=p&&Math.hypot(p.x-lead.x,p.z-lead.z)<170;if(!go){m.waitT=(m.waitT||0)+dt;if(m.waitT>6){m.waitT=-14;say(6,[],5);}}
    let prev=null;for(const k of m.trucks){if(k.hp<=0)continue;const cap=prev?prev.d-20:PLEN;if(go&&k.d<cap){k.d=Math.min(cap,k.d+6*dt);roadAt(k.d,k);}placeTruck(k,Math.min(1,dt*3));WORLD.rut(k,k.x,k.z,k.yaw);prev=k;}
    const at=[.2,.48,.76];if(m.stage<3&&lead.d>PLEN*at[m.stage]){const n=[2,3,3][m.stage]+extra;roadAt(lead.d+150,rp);const side=m.stage%2?1:-1;spawnAround(rp.x,rp.z,n,rp.yaw+side*1.45,.35,430,150,230,0);m.stage++;say(4,[n],7);}
    if(m.lost>=2)missionOver(false,6);else if(lead.d>=PLEN-75)missionOver(true,5);
  }
  if(coop()&&state==='dead'&&![...NET.peers.values()].some(r=>r.alive))missionOver(false,7);
}

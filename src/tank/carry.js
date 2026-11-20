// HULL DOWN's kit: the pistol, magazines, grenades and mines you carry; in a headset they hang on your body and your hands take, fire, load and throw them (put into main.js by tools/edge.cjs)
function shootPistol(o,d,hand){
  if(INV.reload>0)return;if(INV.pistol<=0){if(!xrActive)reloadPistol();else{play('switch',.5,'dry',0,2);setHud('Empty','Take a magazine from your belt and bring it to the pistol.',2.5);}return;}
  INV.pistol--;INV.kick=1;play('crack',.9,'dry',0,1.35);haptic(.8,60,hand);puff(o.x+d.x*.4,o.y+d.y*.4,o.z+d.z*.4,{add:true,c:[3,2,1],s0:.15,s1:.5,life:.06});
  let best=null,bt=75;for(const c of crews){if(c.state==='dead')continue;vc.set(c.x-o.x,c.y+1.0-o.y,c.z-o.z);const t=vc.dot(d);if(t>0&&t<bt&&vc.addScaledVector(d,-t).length()<.5+t*.012){bt=t;best=c;}}
  if(best){killCrew(best);setHud('Man down','',1.5);}vc.copy(o).addScaledVector(d,best?bt:60);straight(o,vc,()=>{}).T=.06;
}
function throwNade(o,v,ghost){const g=M.grenade.clone();g.scale.setScalar(1.6);scene.add(g);g.position.copy(o);nades.push({g,v:v.clone(),t:3.2,ghost:!!ghost});if(!ghost){play('latch',.5);if(NET.peers.size)netSend({t:'nade',o:o.toArray(),v:v.toArray()});}}
function useItem(){
  const it=P.item;if(!it||xrActive)return;tank.updateMatrixWorld();camera.getWorldPosition(va);camera.getWorldQuaternion(qa);vb.set(0,0,-1).applyQuaternion(qa);
  if(it==='pistol')shootPistol(va,vb);
  else if(it==='grenade'){if(INV.grenade<=0){setHud('No grenades left','',2);return;}INV.grenade--;throwNade(va.clone().addScaledVector(vb,.4),vb.clone().multiplyScalar(15).add(vc.set(0,5,0)));if(!INV.grenade)P.item=null;}
  else if(it==='mine'){if(INV.mine<=0){setHud('No mines left','',2);return;}INV.mine--;layMine(va.x+vb.x*5.5,va.z+vb.z*5.5,true);play('thump',.5);setHud('Mine laid','It arms in three seconds. Mind where you drive.',3);if(!INV.mine)P.item=null;}
  syncUi();
}
function reloadPistol(){if(INV.reload>0||INV.pistol>=8)return;if(INV.mags<=0){setHud('No pistol magazines left','',2);return;}INV.mags--;INV.reload=1.6;play('latch',.6);play('breech',.3,'dry',1.1,1.8);}
function layMine(x,z,mine){const m=M.mine.clone();m.position.set(x,hAt(x,z)-.03,z);scene.add(m);mines.push({m,x,z,t:3,mine});if(mine&&duel())netSend({t:'mine',o:[x,z]});}
// in the headset: where each thing hangs on you (from your eyes, turned with your body), and what each hand has hold of
const SLOT={pistol:[.21,-.64,-.02],mag:[-.03,-.56,-.15],grenade:[-.14,-.31,-.14],mine:[-.25,-.64,.02]};
const kit=new T.Group();rig.add(kit);kit.visible=false;
const kitObj={pistol:M.pistol.clone(),mag:new T.Group(),grenade:M.grenade.clone(),grenade2:M.grenade.clone(),mine:M.mine.clone()};
{const mg=M.pistol.clone();mg.scale.set(.5,.62,.4);mg.position.y=.02;kitObj.mag.add(mg);kitObj.pistol.rotation.x=-1.35;kitObj.mine.scale.setScalar(.55);kitObj.mine.rotation.z=1.57;
 for(const k in kitObj){const s=SLOT[k==='grenade2'?'grenade':k];kitObj[k].position.set(s[0]+(k==='grenade2'?.09:0),s[1],s[2]);kit.add(kitObj[k]);}}
const hold={left:null,right:null},holdObj={left:{},right:{}},hv={left:new T.Vector3(),right:new T.Vector3()},hl={left:null,right:null},gripWas={},trigWas={};
for(const k of['left','right']){holdObj[k]={pistol:M.pistol.clone(),grenade:M.grenade.clone(),mine:M.mine.clone(),mag:kitObj.mag.clone()};holdObj[k].mine.scale.setScalar(.7);}
let bodyYaw=0;
function dropHold(k){const it=hold[k];if(!it)return;hold[k]=null;if(it==='grenade')INV.grenade++;if(it==='mine')INV.mine++;}
function updateKit(dt){
  kit.visible=xrActive&&state==='play';if(!xrActive){hold.left=hold.right=null;return;}
  _eu.setFromQuaternion(camera.quaternion,'YXZ');bodyYaw+=wrap(_eu.y-bodyYaw)*Math.min(1,dt*3);kit.position.copy(camera.position);kit.rotation.y=bodyYaw;
  kitObj.pistol.visible=hold.left!=='pistol'&&hold.right!=='pistol';kitObj.mag.visible=INV.mags>0&&hold.left!=='mag'&&hold.right!=='mag';kitObj.grenade.visible=INV.grenade>0;kitObj.grenade2.visible=INV.grenade>1;kitObj.mine.visible=INV.mine>0;
  for(const k of['left','right']){const c=xr.ctrl[k],o=k==='left'?'right':'left';for(const n in holdObj[k]){const m=holdObj[k][n];m.visible=false;}
    if(!c||state!=='play'){gripWas[k]=false;continue;}
    if(hl[k])hv[k].lerp(vc.copy(c.position).sub(hl[k]).multiplyScalar(1/Math.max(dt,1e-3)),.5);hl[k]=(hl[k]||new T.Vector3()).copy(c.position);
    const g=(xr.grip[k]||0)>.6,tr=(xr.trig[k]||0)>.6;
    if(P.headIn&&hold[k]){dropHold(k);}
    if(g&&!gripWas[k]&&!hold[k]&&!P.headIn){let bn=null,bd=.19;for(const n in SLOT){const s=SLOT[n];vc.set(s[0],s[1],s[2]).applyAxisAngle(UP,bodyYaw).add(camera.position);const d=vc.distanceTo(c.position);if(d<bd){bd=d;bn=n;}}
      if(bn==='pistol'&&hold[o]!=='pistol'||bn==='mag'&&INV.mags>0&&hold[o]!=='mag'){hold[k]=bn;}else if(bn==='grenade'&&INV.grenade>0){INV.grenade--;hold[k]=bn;}else if(bn==='mine'&&INV.mine>0){INV.mine--;hold[k]=bn;}
      if(hold[k]){play('switch',.35);haptic(.4,40,k);}}
    if(!g&&gripWas[k]&&hold[k]){const it=hold[k];hold[k]=null;tank.updateMatrixWorld();c.getWorldPosition(va);rig.getWorldQuaternion(qa);vb.copy(hv[k]).applyQuaternion(qa);vb.x-=Math.sin(P.yaw)*P.v;vb.z-=Math.cos(P.yaw)*P.v;
      if(it==='grenade'){throwNade(va,vb.multiplyScalar(1.5));haptic(.5,50,k);}
      else if(it==='mine'){const t=.5+Math.max(0,vb.y)*.1;layMine(va.x+vb.x*t,va.z+vb.z*t,true);play('thump',.5);setHud('Mine laid','It arms in three seconds. Mind where you drive.',3);}}
    if(hold[k]==='mag'&&hold[o]==='pistol'&&xr.ctrl[o]&&c.position.distanceTo(xr.ctrl[o].position)<.13&&INV.pistol<8){hold[k]=null;INV.mags--;INV.pistol=8;play('latch',.7);play('breech',.3,'dry',.25,1.8);haptic(.5,60);}
    if(hold[k]==='pistol'&&tr&&!trigWas[k]){c.getWorldPosition(va);c.getWorldQuaternion(qa);vb.set(0,-.25,-1).normalize().applyQuaternion(qa);shootPistol(va,vb,k);}
    gripWas[k]=g;trigWas[k]=tr;
    if(hold[k]){const m=holdObj[k][hold[k]];if(m.parent!==c)c.add(m);m.visible=true;m.position.set(0,hold[k]==='pistol'?-.1:-.03,hold[k]==='pistol'?-.04:-.05);m.rotation.x=hold[k]==='pistol'?-.25-INV.kick*.3:0;}}
}
// a tank's hatch, in the world, if it stands open: yours and the other players'
const hatchW=new T.Vector3();
function hatches(fn){tank.updateMatrixWorld();if(P.hatch>.6&&state==='play'){hatchW.set(HX,ROOF,HZ).applyMatrix4(turret.matrixWorld);fn(hatchW,null);}for(const r of NET.peers.values())if(r.on&&r.alive&&r.hatch>.6){r.g.updateMatrixWorld();hatchW.set(HX,ROOF,HZ).applyMatrix4(r.t.matrixWorld);fn(hatchW,r);}}
// a grenade against a tank's hull and turret: it lands on the armour and rolls
function hullBounce(n,x,y,z,yaw){const q=n.g.position,dx=q.x-x,dz=q.z-z,c=Math.cos(yaw),s=Math.sin(yaw),lx=c*dx-s*dz,lz=s*dx+c*dz,ly=q.y-y;
  const top=Math.abs(lx)<1.35&&lz>-1.9&&lz<2.5?2.55:Math.abs(lx)<1.8&&lz>-3.4&&lz<4.4?1.8:0;if(!top||ly>top+.07||ly<top-.9)return false;
  q.y=y+top+.07;n.v.y=Math.abs(n.v.y)*.3;n.v.x*=.55;n.v.z*=.55;if(!n.clank&&distTo(q.x,q.z)<60){n.clank=1;play('clang',.3,'out',0,1.8);}return true;}
function updateCarry(dt){
  INV.kick=Math.max(0,INV.kick-dt*7);if(INV.reload>0){INV.reload-=dt;if(INV.reload<=0){INV.reload=0;INV.pistol=8;}}
  const it=P.item,flat=!xrActive&&it;vm.visible=!!flat;vmArm.visible=!!flat;for(const k in held)held[k].visible=false;
  if(flat){held[it].visible=true;vm.rotation.x=INV.kick*.18-(INV.reload>0?.7*Math.sin(Math.PI*(1-INV.reload/1.6)):0);const h=hands.right;if(h.root.parent!==vm)vm.add(h.root);h.root.visible=true;h.root.position.set(.012,-.075,.07);h.root.rotation.set(0,0,-Math.PI/2);h.curl[0]=.5;h.curl[1]=it==='pistol'?.55:.8;h.curl[2]=h.curl[3]=h.curl[4]=.85;
    va.set(.2,-.26,-.34);vb.set(.34,-.62,.05);span(vmArm,vb,va);}
  else if(hands.right.root.parent===vm){rig.add(hands.right.root);}
  updateKit(dt);
  for(let i=nades.length-1;i>=0;i--){const n=nades[i];n.t-=dt;const q=n.g.position;
    if(n.in){if(n.in.me){hatchW.set(HX,FLOOR+.1,HZ).applyMatrix4(turret.matrixWorld);q.copy(hatchW);}else{n.in.g.updateMatrixWorld();q.set(HX,ROOF-1,HZ).applyMatrix4(n.in.t.matrixWorld);}}
    else{n.v.y-=9.8*dt;q.addScaledVector(n.v,dt);n.g.rotation.x+=dt*9;
      hatches((h,r)=>{if(n.in||n.v.y>0)return;const dx=q.x-h.x,dz=q.z-h.z;if(dx*dx+dz*dz<.36*.36&&q.y<h.y+.12&&q.y>h.y-.7){n.in=r||{me:true};n.t=Math.min(n.t,1.2);play('clang',r?.2:.8,r?'out':'dry',0,2.2);if(!r)setHud('Grenade in the turret!','',1.5);else if(!n.ghost)setHud('It went down their hatch','',2.5);}});
      if(!n.in){let on=hullBounce(n,P.x,P.y,P.z,P.yaw);for(const r of NET.peers.values())if(!on&&r.on)on=hullBounce(n,r.x,r.y||0,r.z,r.yaw);for(const e of foes)if(!on&&Math.abs(e.x-q.x)<5&&Math.abs(e.z-q.z)<5)on=hullBounce(n,e.x,e.y,e.z,e.yaw);
        const gy=WORLD.gAt(q.x,q.z)+.07;if(q.y<gy){q.y=gy;if(WORLD.wetAt(q.x,q.z)&&!n.wet){n.wet=1;WORLD.scar(q.x,gy,q.z,false,true);}n.v.y*=-.3;n.v.x*=.5;n.v.z*=.5;}}}
    if(n.t<=0){scene.remove(n.g);nades.splice(i,1);
      if(n.in){if(n.in.me){explode(q.x,q.y+1,q.z,false,false,true);hurtPlayer(3);setHud('A grenade went off inside','Keep the hatch shut when they are close.',5);}
        else{explode(q.x,q.y+1.2,q.z,false,false,true);if(!n.ghost&&duel()){netSend({t:'hit',d:60,to:n.in.id});P.hits++;}}continue;}
      explode(q.x,q.y,q.z,false,true,n.ghost);if(n.ghost)continue;if(NET.peers.size)netSend({t:'boom',o:[q.x,q.y,q.z],b:0,i:-1,d:[0,0]});blast(q.x,q.y,q.z,9);
      for(const e of foes)if(e.state!=='dead'&&Math.hypot(e.x-q.x,e.z-q.z)<3.5){e.hp-=1;if(coop()&&!isHost())netSend({t:'fhit',f:e.id,d:1});if(e.hp<=0){killFoe(e);P.kills++;if(coop()&&isHost())netSend({t:'kill',f:e.id});}}
      if(distTo(q.x,q.z)<7&&!P.headIn){P.armour=Math.max(1,P.armour-10);P.hurt=.8;}}}
  for(let i=mines.length-1;i>=0;i--){const m=mines[i];m.t-=dt;if(m.t>0)continue;let hit=false;
    for(const e of foes)if(e.state!=='dead'&&Math.hypot(e.x-m.x,e.z-m.z)<3.3){e.hp-=2;hit=true;if(coop()&&!isHost())netSend({t:'fhit',f:e.id,d:2});if(e.hp<=0){killFoe(e);P.kills++;if(coop()&&isHost())netSend({t:'kill',f:e.id});setHud('Your mine got one',live()?live()+' left':'',3);}}
    if(!hit&&distTo(m.x,m.z)<3&&state==='play'&&(!m.mine||m.left)){hit=true;P.dmg.tracks=Math.max(P.dmg.tracks,12);hurtPlayer(1.6);}if(m.mine&&distTo(m.x,m.z)>8)m.left=true;
    if(hit){explode(m.x,hAt(m.x,m.z)+.3,m.z,true,true);blast(m.x,0,m.z,7);scene.remove(m.m);mines.splice(i,1);}}
}

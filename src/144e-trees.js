// THE TREES TO CLIMB: TREES lets you climb the trees marked climbable (PARK.climbable: the big trees, 144d): SPACE next to one, or double-click it; and pick the fruit and blossoms they grow; the tomato buys them.
import {SHARED, THREE} from './003-shx.js';
import {CITY, FORAGE, INSPECT, INV, keys, MAIL, PARK, pos, st, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {MAPG, MODS, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {VEG} from './144-veggies.js';
const TREES={h:null,want:null}; window.TREES=TREES;
{ const T=TILE, hs=(a,b,c=0)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); }, say=(t,c)=>{ SAY(t,c); };
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():CITY?CITY.day||0:0;
  const FR=[['fr_apple','APPLE',3,0xd83a2a],['fr_pear','PEAR',3,0xb8d048],['fr_plum','PLUM',4,0x6a2a7a],['fr_fig','FIG',5,0x5a3a4a]], BL=['fl_blossom','OAK BLOSSOM',2,0xfff0f8];
  INSPECT.kinds.push({is:id=>!![...FR,BL].find(f=>f[0]===id),make:id=>{ '@later'; const f=[...FR,BL].find(f=>f[0]===id), P=INSPECT.part, g=new THREE.Group(); if(f===BL){ for(let i=0;i<5;i++){ const a=i*1.257; g.add(P('ball',f[3],Math.cos(a)*.035,0,Math.sin(a)*.035,.03,.012,.03)); } g.add(P('ball',0xf2c81e,0,.008,0,.012,.01,.012)); return g; }
    g.add(P('ball',f[3],0,0,0,.05,id==='fr_pear'?.065:.048,.05,0,0,0,{flat:1}),P('cyl',0x5a3a1e,0,.06,0,.004,.03,.004),P('ball',0x4a8a3a,.018,.07,0,.022,.004,.01,0,.5)); return g; }});
  FORAGE.add({names:Object.fromEntries([...FR,BL].map(f=>[f[0],f[1]])),prices:Object.fromEntries([...FR,BL].map(f=>[f[0],f[2]]))}); VEG.add({},Object.fromEntries([...FR,BL].map(f=>[f[0],f[2]])));
  // climbing (the CLIMBING skill: how fast, how far up the trunk, how far a jump reaches up to a branch). On the trunk: up and down climb, left and right go round it, SPACE jumps you off the tree;
  // under a branch you hang: left and right go along it, up pulls you onto it to stand, down lets go, SPACE jumps off. The ground is raised only under the climber himself.
  const C={it:null,h:0}, rT=it=>it.tr||(it.sol?(it.sol[2]-it.sol[0])/2:.3*T), rF=it=>Math.max(rT(it),it.rf||0), sg0=STORE.stackGround, MH=T/.84, HANG=45, HOLD=38;   // rT: the bark's radius; HANG, HOLD: the hands' height over the feet, hanging and holding bark
  const SKL=()=>FORAGE.sk?FORAGE.sk('climb'):10, SPD=()=>3.8*ZU*(FORAGE.climbK?FORAGE.climbK():1), HMAX=it=>(it.top-it.y-.8*T)*(.5+.5*SKL()/100), REACH=()=>(3+.9*SKL()/100)*T, roll=()=>FORAGE.climbed?FORAGE.climbed():true;
  const ky=()=>st.world?st.world.ky:1/ZU, kx=()=>st.world?st.world.kx:1/ZU;
  const RH=.03*MH, RS=.06*MH, lr=(l,u)=>l[6]+(l[7]-l[6])*u, at=(l,u)=>({x:l[0]+(l[3]-l[0])*u,y:l[1]+(l[4]-l[1])*u,z:l[2]+(l[5]-l[2])*u,r:lr(l,u)}), llen=l=>Math.hypot(l[3]-l[0],l[5]-l[2]);   // a branch: hang from r>=RH, stand on r>=RS
  const near=(l,x,z)=>{ const dx=l[3]-l[0], dz=l[5]-l[2], L=dx*dx+dz*dz; return L<1e-6?0:Math.max(0,Math.min(1,((x-l[0])*dx+(z-l[2])*dz)/L)); };
  const limbs=it=>it.lbs||(it.lbs=(it.lb||[]).filter(l=>Math.abs(l[4]-l[1])<.7*Math.hypot(l[3]-l[0],l[4]-l[1],l[5]-l[2])&&Math.max(l[6],l[7])>=RH&&llen(l)>.3*T));
  const sols=it=>it.sols||(it.sols=SHARED.solids.filter(s=>s[0]<it.x+it.r+T&&s[2]>it.x-it.r-T&&s[1]<it.z+it.r+T&&s[3]>it.z-it.r-T));
  const outside=(it,p)=>sols(it).every(s=>Math.hypot(Math.max(s[0]-p.x,0,p.x-s[2]),Math.max(s[1]-p.z,0,p.z-s[3]))>=.42);   // clear of every solid (the trunk's, a hut's) by the walker's own radius, or the walk would shove you off
  const limbTop=(it,x,z,py)=>{ let best=null; for(const l of limbs(it)){ const u=near(l,x,z), p=at(l,u); if(p.r<RS||!outside(it,p)||Math.hypot(p.x-x,p.z-z)>p.r+.25*T)continue; const top=p.y+p.r; if(top<=py+.6*T&&(best==null||top>best))best=top; } return best; };
  STORE.stackGround=(x,z)=>{ if(C.it&&TREES.h!=null&&Math.hypot(x-pos.x,z-pos.z)<.6*T)return TREES.h; const it=TREES.stand; if(it){ const y=limbTop(it,x,z,SHARED.py); if(y!=null)return y; } return sg0?sg0(x,z):null; };
  const grabAt=(it,x,z,py,far)=>{ let best=null; for(const l of limbs(it)){ const u=near(l,x,z), p=at(l,u), d=Math.hypot(p.x-x,p.z-z); if(d>far||!outside(it,p))continue; const h=p.y+p.r-py; if(h<1.6*T||h>REACH())continue; if(!best||d<best.d)best={l,u,d}; } return best; };   // the branch a jump from here catches
  // hands and feet hold the tree's own bark: a ray from the body finds each hold; a hold stays put while the body climbs past it, then reaches for the next
  const PER=12, RC=new THREE.Raycaster(), O3=new THREE.Vector3(), D3=new THREE.Vector3(), HTS=Object.values(RIG.CLIMB.at).flatMap(a=>[a.lo,a.hi]);   // PER: a reach's worth of climbing works the skill once; HTS: the heights the limbs hold at
  const bark=it=>{ '@later'; if(it.bark!==undefined)return it.bark; if(!it.P)return it.bark=null; const A=[], F=it.LF||[];
    for(let v=it.v0;v+2<it.v1;v+=3){ if(F[v]||F[v+1]||F[v+2])continue; for(let k=0;k<9;k++)A.push(it.P[v*3+k]); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(A,3)); g.computeBoundingSphere(); return it.bark=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})); };
  const cast=(it,ux,uz,y)=>{ '@later';   // from just outside the trunk, so a branch further out is not taken for bark
    const b=bark(it); if(!b)return null; const r0=2*rT(it)+.5*T; RC.set(O3.set(it.x+ux*r0,y,it.z+uz*r0),D3.set(-ux,0,-uz)); RC.far=r0; const lim=1.3*rT(it)+.05*T, h=RC.intersectObject(b,false).find(q=>Math.hypot(q.point.x-it.x,q.point.z-it.z)<lim); if(!h)return null;   // the trunk's own bark, not a branch beside it
    const n=h.face.normal; let nx=n.x, ny=n.y, nz=n.z; if(nx*ux+nz*uz<0){ nx=-nx; ny=-ny; nz=-nz; } return {x:h.point.x,y:h.point.y,z:h.point.z,nx,ny,nz}; };
  const hold=(it,lx,ly)=>{ const c=Math.cos(SHARED.heading), s=Math.sin(SHARED.heading), x=pos.x+lx*c/kx(), z=pos.z-lx*s/kx(), dx=x-it.x, dz=z-it.z, l=Math.hypot(dx,dz)||1, y=SHARED.py+ly/ky();
    return cast(it,dx/l,dz/l,y)||{x:it.x+dx/l*rT(it),y,z:it.z+dz/l*rT(it),nx:dx/l,ny:0,nz:dz/l}; };
  const grip=(it,dt)=>{ '@later'; RIG.climbHolds(st,dt,(lx,ly)=>hold(it,lx,ly)); };   // when each limb reaches and how high: the recorded climb's (RIG.CLIMB)
  // an elm or the cherry is climbed only to where its trunk forks, into the open middle of its crown; any other tree to just under its top
  const forkCap=it=>Math.min(it.top-it.y-.8*T,/^G[EK]/.test(it.k)&&it.fork?Math.max(2*T,it.fork-.6*T):1e9);
  const tell=()=>{ if(C.told)return; C.told=1; say('YOU CANNOT CLIMB ANY HIGHER YET. YOUR CLIMBING SKILL IS '+SKL().toFixed(1)+'.','#c8a090'); };
  const drop=()=>{ st.fk=null; st.climb=null; st.hang=null; C.leap=null; C.fly=null; TREES.h=null; C.it=null; C.mode=null; };
  // SPACE while climbing jumps you off the tree, away from it (owner, 9 Nov 2026); you fly out and fall to the ground beside it
  const bare=(x,z)=>{ const c=C.it; C.it=null; const g=SHARED.groundY(x,z); C.it=c; return g; };
  const leapOff=(it,ux,uz)=>{ st.climb=null; st.hang=null; st.fk=null; st.move=null; C.leap=null; C.mode='fly'; C.fly={vx:ux*3.5*MH,vz:uz*3.5*MH,vy:3*MH,y:SHARED.py}; SHARED.heading=Math.atan2(ux,uz); TREES.stand=null; RIG.act(st,' '); };
  const fly=dt=>{ const F=C.fly, ox=pos.x, oz=pos.z; F.vy-=9.8*MH*dt; F.y+=F.vy*dt; pos.x+=F.vx*dt; pos.z+=F.vz*dt;
    const inS=(s,x,z)=>x>s[0]-.36&&x<s[2]+.36&&z>s[1]-.36&&z<s[3]+.36; if(SHARED.solids.some(s=>inS(s,pos.x,pos.z)&&!inS(s,ox,oz))){ pos.x=ox; pos.z=oz; F.vx=F.vz=0; }   // stopped by a thing in the way, not by the tree's own foot it leaves
    const g=bare(pos.x,pos.z); if(F.y<=g){ drop(); return false; } TREES.h=F.y; return true; };
  const onTrunk=(it,h)=>{ C.it=it; C.mode='trunk'; C.h=Math.max(0,Math.min(HMAX(it),h)); C.d=null; C.cyc=Math.floor(C.h/(PER*ZU)); C.told=0; st.hang=null; st.move=null; st.fk=null; st.climb={z:0,ph:C.h/ZU}; TREES.stand=null; };
  const onLimb=(it,g)=>{ '@later'; const l=g.l, p=at(l,g.u), bx=(l[3]-l[0])/(llen(l)||1), bz=(l[5]-l[2])/(llen(l)||1); let nx=-bz, nz=bx; if((pos.x-p.x)*nx+(pos.z-p.z)*nz<0){ nx=-nx; nz=-nz; }
    C.it=it; C.mode='hang'; C.l=l; C.u=g.u; C.n=[nx,nz]; C.b=[bx,bz]; C.t=0; st.climb=null; st.move=null; st.fk=null; st.hang={z:0,t:0,side:0}; TREES.stand=null; roll(); };
  const hang=(dt,lf,rt)=>{ '@later'; const it=C.it, l=C.l, [nx,nz]=C.n, [bx,bz]=C.b, L=llen(l)||1, rs=nz*bx-nx*bz>0?1:-1;   // rs: which way along the branch is your right
    if(lf||rt){ const u=Math.max(0,Math.min(1,C.u+(rt?1:-1)*rs*SPD()*.5*dt/L)), p=at(l,u); if(p.r>=RH&&outside(it,p))C.u=u; }
    const p=at(l,C.u); pos.x=p.x+nx*.2*T; pos.z=p.z+nz*.2*T; SHARED.heading=Math.atan2(-nx,-nz); TREES.h=p.y+p.r-HANG/ky(); C.t+=dt;
    const hh=lx=>{ const q=at(l,Math.max(0,Math.min(1,C.u-lx*rs/kx()/L))); return {x:q.x,y:q.y+q.r,z:q.z,nx:0,ny:1,nz:0}; };
    st.hang.t=C.t; st.hang.grip={L:{h:hh(4)},R:{h:hh(-4)}}; return p; };
  MODS.climbs=MODS.climbs||[]; MODS.climbs.push((dt,up,dn,lf,rt,off)=>{ if(SHARED.LVL!=='up'||!PARK.climbable)return false; const IT=PARK.climbable, sp=keys.has(' '), jump=sp&&!C.jp; C.jp=sp;
    if(TREES.stand&&!C.it){ const it=TREES.stand; TREES.stand=null; const g=SHARED.groundY(pos.x,pos.z); if(SHARED.py>g+.3*T&&Math.hypot(pos.x-it.x,pos.z-it.z)<it.r+T)TREES.stand=it; }   // off the branch: on the ground again
    C.fr=(C.fr||0)+1;
    if(!C.it){ if(jump&&!TREES.want)for(const o of IT){ if(Math.hypot(o.x-pos.x,o.z-pos.z)>o.r+T)continue; const g=grabAt(o,pos.x,pos.z,SHARED.py,.7*T); if(g){ onLimb(o,g); return true; } }
      const fx=Math.sin(SHARED.heading), fz=Math.cos(SHARED.heading), it=TREES.want||(jump?IT.find(o=>Math.hypot(o.x-pos.x,o.z-pos.z)<rF(o)+.9*T):null); TREES.want=null;   // only SPACE next to the trunk starts a climb (owner, 7 Nov 2026)
      if(!it)return false; if(jump){ const h0=Math.max(0,SHARED.py-it.y); onTrunk(it,h0+REACH()-HOLD/ky()); C.leap={h0,h1:C.h,t:0,T:.3}; C.h=h0; roll(); } else onTrunk(it,SHARED.py-it.y); }
    const it=C.it;
    if(C.mode==='fly')return fly(dt);
    if(C.mode==='up'){ if(st.move&&st.move.name==='mantle')return true; drop(); return false; }   // the pull-up runs its course before you walk
    if(C.mode==='hang'){ const p=hang(dt,lf,rt);
      if(up){ if(p.r<RS)say('THE BRANCH IS TOO THIN TO STAND ON.','#c8a090'); else { const l=C.l, [bx,bz]=C.b; let ua=C.u, ub=C.u; for(let u=C.u;u>=0;u-=.02){ const q=at(l,u); if(q.r<RS||!outside(it,q))break; ua=u; } for(let u=C.u;u<=1;u+=.02){ const q=at(l,u); if(q.r<RS||!outside(it,q))break; ub=u; }   // pull up facing along the branch, toward its longer footing
        const d=ub-C.u>=C.u-ua?1:-1; TREES.stand=it; pos.x=p.x; pos.z=p.z; SHARED.py=p.y+p.r; SHARED.heading=Math.atan2(bx*d,bz*d); st.hang=null; st.fk=null; TREES.h=null; C.mode='up'; RIG.act(st,'mantle'); roll(); return true; } }
      if(jump){ leapOff(it,C.n[0],C.n[1]); return true; }
      if(dn||off){ TREES.stand=it; drop(); return false; } return true; }
    let dx=pos.x-it.x, dz=pos.z-it.z, l=Math.hypot(dx,dz)||1;
    if(lf||rt){ const s=(rt?1:-1)*SPD()*dt, ox=dx; dx+=dz/l*s; dz+=-ox/l*s; l=Math.hypot(dx,dz)||1; }   // round the trunk, your right is to the right
    const gap=RIG.CLIMB.gap/kx(); let d=0; for(const ly of HTS){ const h=cast(it,dx/l,dz/l,SHARED.py+ly/ky()); d=Math.max(d,h?Math.hypot(h.x-it.x,h.z-it.z):0); } if(!d)d=rT(it); C.d=C.d==null?d:C.d+(d-C.d)*Math.min(1,dt*4); d=C.d;   // the body hangs back an arm's length from the widest bark between its feet and hands, eased so one bulge doesn't jerk it out
    pos.x=it.x+dx/l*(d+gap); pos.z=it.z+dz/l*(d+gap); SHARED.heading=Math.atan2(-dx,-dz);
    const cap=Math.min(HMAX(it),forkCap(it)); let dir=up?1:dn?-1:0;
    if(jump&&!C.leap){ leapOff(it,dx/l,dz/l); return true; }
    if(C.leap){ const L=C.leap; L.t+=dt; const e=Math.min(1,L.t/L.T); C.h=L.h0+(L.h1-L.h0)*e*(2-e); dir=1; if(e>=1)C.leap=null; }
    else { C.h=Math.max(0,Math.min(cap,C.h+dir*dt*SPD())); if(up&&C.h>=cap-1e-6)tell(); }
    const cyc=Math.floor(C.h/(PER*ZU)); if(cyc!==C.cyc){ C.cyc=cyc; roll(); }   // each reach up or down works the skill
    st.climb.ph=C.h/ZU; TREES.h=it.y+C.h; grip(it,dt);
    if(off||(dn&&C.h<=0)){ drop(); pos.x=it.x+dx/l*(rF(it)+.6*T); pos.z=it.z+dz/l*(rF(it)+.6*T); } return true; });
  PARK.later(()=>SYS.onStart(()=>{ '@park'; const IT=PARK.climbable, g=MAPG.park||scene, SP=[]; let n=0;   // (after the start: the big trees are made then, and the park can load before it)
    for(const it of IT){ const i=n++; if(it.top-it.y<=3*T)continue; const f=/^Oak/.test(it.k)?BL:FR[Math.floor(hs(i,1)*FR.length)];   // blossoms on the oaks, fruit on the tall trees
      const tb=new THREE.Mesh(new THREE.BoxGeometry(2*rF(it),1.6*T,2*rF(it)),new THREE.MeshBasicMaterial({visible:false})); tb.position.set(it.x,it.y+.8*T,it.z); g.add(tb); UI.thing({name:'CLIMB',key:'SPACE',obj:tb,r:rF(it),reach:.9*T,near:.9*T,tall:2*T,act:()=>{ TREES.want=it; }});
      const lo=/^G[EK]/.test(it.k);   // in an elm the fruit hangs in its open middle, just over where the climb stops
      if(it.lb&&it.lb.length){ const LL=limbs(it); for(let k=0;k<6&&LL.length;k++){ const l=LL[Math.floor(hs(i,k,5)*LL.length)], p=at(l,.5+.4*hs(i,k,6)); if(p.r<RS)continue; SP.push({x:p.x,y:p.y+p.r+T,z:p.z,f,key:'tree:'+i+':'+k,i:SP.length}); } continue; }   // in a big tree the fruit hangs over its branches, picked standing on them
      for(let k=0;k<3;k++){ const a=hs(i,k,2)*6.28, r=lo?rT(it)+(.8+.8*hs(i,k,3))*T:it.r*(.35+.3*hs(i,k,3)); SP.push({x:it.x+Math.cos(a)*r,y:lo?it.y+forkCap(it)+(1+.6*hs(i,k,4))*T:it.y+(it.top-it.y)*(.62+.2*hs(i,k,4)),z:it.z+Math.sin(a)*r,f,key:'tree:'+i+':'+k,i:SP.length}); } }
    const IM=new THREE.InstancedMesh(new THREE.SphereGeometry(.5,6,5),new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,SP.length)), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(); IM.count=SP.length; g.add(IM);
    const show=(s,on)=>{ IM.setMatrixAt(s.i,m4.compose(new THREE.Vector3(s.x,s.y,s.z),q,new THREE.Vector3(1,1,1).multiplyScalar(on?.22*T:0))); IM.setColorAt(s.i,c.setHex(s.f[3])); IM.instanceMatrix.needsUpdate=true; if(IM.instanceColor)IM.instanceColor.needsUpdate=true; if(s.hb)s.hb.visible=on; };
    for(const s of SP){ s.hb=new THREE.Mesh(new THREE.BoxGeometry(.7*T,.7*T,.7*T),new THREE.MeshBasicMaterial({visible:false})); s.hb.position.set(s.x,s.y,s.z); g.add(s.hb); show(s,INV.ready(s.key));
      UI.thing({name:s.f[1],obj:s.hb,reach:1.4*T,near:2.4*T,tall:.7*T,act:()=>{ if(!INV.ready(s.key))return; if(SHARED.py<s.y-1.6*T)return say('TOO HIGH TO REACH. CLIMB THE TREE.','#c8a090');
        const fl=s.f===BL, ok=FORAGE.use?FORAGE.use(fl?'garden':'forage',0,45):true; INV.picked[s.key]=day(); INV.add('x',0); delete INV.items.x; show(s,false); if(!ok)return say('IT DROPS AND IS LOST IN THE LEAVES.','#c8a090'); FORAGE.give(s.f[0],1); say(fl?'YOU PICK OAK BLOSSOMS.':'YOU PICK A '+s.f[1]+'.'); }}); }
    SYS.add('life',()=>{ const dd=day(); if(dd===TREES.d)return; TREES.d=dd; for(const s of SP)show(s,INV.ready(s.key)); },'144e-trees'); TREES.spots=SP.length; },'144e-trees climb and fruit spots'));
  window.TREESDBG=()=>({climbing:!!C.it,mode:C.mode||null,h:TREES.h,ch:C.h,u:C.u,stand:!!TREES.stand,skill:SKL(),limbs:C.it?limbs(C.it).length:0,spots:TREES.spots||0,climbs:(MODS.climbs||[]).length,fr:C.fr||0,x:pos.x,z:pos.z,py:SHARED.py,hd:SHARED.heading,move:st.move?st.move.name:null,hang:!!st.hang,climb:!!st.climb,gy:SHARED.groundY(pos.x,pos.z)}); TREES.go=(x,z,hd)=>{ pos.x=x; pos.z=z; if(hd!=null)SHARED.heading=hd; SHARED.target=null; TREES.stand=null; }; TREES.T=T; TREES.outside=outside; TREES.limbs=limbs; TREES.at=at; TREES.near=near; TREES.rT=rT; TREES.RS=RS; }
export {TREES};

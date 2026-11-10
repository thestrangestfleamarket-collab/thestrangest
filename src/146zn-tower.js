// THE SQUIRREL'S TOWER, INSIDE: a door at the foot of his tower into a round guardroom (off the map, the owner's call): his bunk, his table with the lookout's chart (where the golems and the other players are now), a ladder up to the roof; on the roof a spyglass on its tripod (look through it: the view narrows to a tenth until you step away), the hatch back down.
import {SHARED, THREE} from './003-shx.js';
import {ONLINE, pos, ROOMS, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {PCAM, scene} from './004-main.js';
import {FADE, MAPG, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {GCAVE} from './060-cave.js';
import {GTOWER} from './063-tower.js';
import {GOLEMS} from './146e-golems.js';
const TOWERK={}; window.TOWERK=TOWERK;
{ const say=(t,c)=>SAY(t,c||'#f2c14e'), T=TILE, MW=TILE/.84, OX=()=>SHARED.BOD.XS(-3200), OZ=()=>SHARED.BOD.ZS(0), RR=3.0;   // the guardroom's radius in metres
  // the room's frame: an 8 m square off the map, its middle the room's
  const frame=()=>{ const o=[OX(),OZ()], h=4*MW; return IKIT.frame({x0:0,y0:0,x1:1,y1:1},(x,y)=>[o[0]-h+x*2*h,o[1]-h+y*2*h]); };
  // the lookout's chart: the park round the tower, the golems and the other players where they are now
  TOWERK.chart=()=>{ '@later'; const s=GTOWER.site&&GTOWER.site(); MINI.look("THE LOOKOUT'S CHART",(g,w,h)=>{ g.fillStyle='#e8dcb8'; g.fillRect(0,0,w,h); g.strokeStyle='#8a6a3a'; g.lineWidth=2; g.strokeRect(10,10,w-20,h-20); if(!s){ g.fillStyle='#2a2420'; g.fillText('THE CHART IS BLANK.',20,30); return; }
    const K=40*T, P=(x,z)=>[w/2+(x-s.x)/K*(w/2-20),h/2+(z-s.z)/K*(h/2-20)], dot=(x,z,c,r,lab)=>{ const [a,b]=P(x,z); if(a<12||a>w-12||b<12||b>h-12)return; g.fillStyle=c; g.beginPath(); g.arc(a,b,r,0,7); g.fill(); if(lab){ g.font='9px monospace'; g.fillText(lab,a+r+2,b-3); } };
    dot(s.x,s.z,'#8a3a2a',6,'THE TOWER');
    for(const r of (GOLEMS&&GOLEMS.list)||[])if(!r.dead)dot(r.N.st.x,r.N.st.z,'#5a5650',3);
    const OT=ONLINE&&ONLINE.others; for(const p of OT&&OT.values?OT.values():[]){ const q=p&&(p.g&&p.g.position||p); if(q&&q.x!=null)dot(q.x,q.z,'#2050c0',3,p.name||p.n||''); }
    dot(pos.x,pos.z,'#c02028',3,'YOU'); g.fillStyle='#2a2420'; g.font='10px monospace'; g.textAlign='center'; g.fillText('GREY: GOLEMS · BLUE: TRAVELLERS · RED: YOU',w/2,h-24); },'Kept by the squirrel, who watches from the roof.'); };
  // the spyglass on the roof: the view narrows while you look through it, back as you step away
  TOWERK.where=()=>({x:pos.x,z:pos.z,y:SHARED.py});
  TOWERK.look=()=>{ if(TOWERK.spy)return; TOWERK.spy={fov:PCAM.fov,x:pos.x,z:pos.z,view:UI.view}; if(UI.view!=='first')UI.setView('first'); PCAM.fov=TOWERK.spy.fov/10; PCAM.updateProjectionMatrix(); say('YOU PUT YOUR EYE TO THE SPYGLASS. (STEP AWAY TO STOP.)'); };
  const unlook=()=>{ const S=TOWERK.spy; if(!S)return; TOWERK.spy=null; PCAM.fov=S.fov; PCAM.updateProjectionMatrix(); if(S.view&&S.view!=='first')UI.setView(S.view); };
  SYS.add('life',()=>{ const S=TOWERK.spy; if(S&&Math.hypot(pos.x-S.x,pos.z-S.z)>.3*T)unlook(); },'146zn-spyglass');
  // the roof: up the ladder you stand by the spyglass; the hatch takes you back down into the guardroom
  TOWERK.roof=()=>{ '@later'; const s=GTOWER.site&&GTOWER.site(); if(!s)return; let n=0; const up=()=>{ const inn=ROOMS.offIn&&ROOMS.offIn()==='sqtower', busy=FADE&&FADE.busy; if((inn||busy)&&n++<480){ if(inn&&!busy)ROOMS.exit('sqtower'); return setTimeout(up,250); } if(inn)return; onRoof(s); UI.goTo(s.x+.3*T,s.z+.2*T,s.top); say('YOU CLIMB OUT ONTO THE ROOF. THE SQUIRREL SALUTES.'); };
    up(); };   // (out of the room first, however long its fade takes, then up)
  // on the roof the tower's own solids are lifted (they know no height) and its top is your ground; both come back once you are off it (down the hatch, or stepping off the edge)
  const onRoof=s=>{ if(TOWERK.lifted)return; const L=TOWERK.lifted=[]; for(let i=SOL.up.length-1;i>=0;i--){ const b=SOL.up[i]; if(b[0]<s.x&&b[2]>s.x&&b[1]<s.z&&b[3]>s.z){ L.push(b); SOL.up.splice(i,1); } } TOWERK.roofAt=s; };
  const offRoof=()=>{ const L=TOWERK.lifted; if(!L)return; TOWERK.lifted=null; TOWERK.roofAt=null; SOL.up.push(...L); };
  { const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ const s=TOWERK.roofAt; if(s&&Math.hypot(x-s.x,z-s.z)<s.r*1.05)return s.top; return sg0?sg0(x,z):null; }; }
  SYS.add('life',()=>{ const s=TOWERK.roofAt; if(s&&(Math.hypot(pos.x-s.x,pos.z-s.z)>s.r*1.1||ROOMS.offIn&&ROOMS.offIn()))offRoof(); },'146zn-roof');
  let roofThings=false; const roofSet=()=>{ const s=GTOWER.site&&GTOWER.site(); if(roofThings||!s)return; roofThings=true; const g=new THREE.Group(); g.position.set(s.x-.5*T,s.top,s.z-.4*T); (MAPG.parkwall||MAPG.park||scene).add(g);
    const brass=new THREE.MeshLambertMaterial({color:0xb08838}), dark=new THREE.MeshLambertMaterial({color:0x2a2420});
    for(let i=0;i<3;i++){ const a=i/3*Math.PI*2, L=new THREE.Mesh(new THREE.CylinderGeometry(.015*MW,.015*MW,1.25*MW,5),dark); L.position.set(Math.cos(a)*.18*MW,.6*MW,Math.sin(a)*.18*MW); L.rotation.set(Math.sin(a)*.15,0,-Math.cos(a)*.15); g.add(L); }
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(.035*MW,.05*MW,.7*MW,10),brass); tube.rotation.z=Math.PI/2-.15; tube.position.y=1.25*MW; g.add(tube);
    const hb=new THREE.Mesh(new THREE.BoxGeometry(.6*MW,1.4*MW,.6*MW),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=.7*MW; g.add(hb); UI.thing({name:'THE SPYGLASS',obj:hb,reach:1.6*T,near:2.6*T,tall:1.4*MW,act:TOWERK.look});
    const hh=new THREE.Mesh(new THREE.BoxGeometry(.8*MW,.4*MW,.8*MW),new THREE.MeshBasicMaterial({visible:false})); hh.position.set(.5*T,.2*MW,.75*T); g.add(hh); UI.thing({name:'THE HATCH (DOWN)',obj:hh,reach:1.4*T,near:2.4*T,tall:.6*MW,act:()=>ROOMS.enter('sqtower')}); TOWERK.roofG=g; };
  // the guardroom off the map, its door at the foot of the tower (on the side facing the cave)
  const reg=()=>{ const s=GTOWER.site&&GTOWER.site(); if(!s||ROOMS.off.sqtower)return !!ROOMS.off.sqtower; const c=GCAVE&&GCAVE.c, a=c?Math.atan2(c.x-s.x,c.z-s.z):0, dx=Math.sin(a), dz=Math.cos(a), rr=s.w/2;
    const F=frame(), C=F.pw(4,4), H=3.2*MW, sp=F.pw(4,4+RR-1.0), ex=F.pw(4,4+RR-.15);
    ROOMS.off.sqtower={name:"THE SQUIRREL'S TOWER",box:{x0:C[0]-4*MW,z0:C[1]-4*MW,x1:C[0]+4*MW,z1:C[1]+4*MW,y0:-1,y1:H+1},noCeil:true,need:()=>Promise.resolve(),
      build:()=>{ const P=ROOMS.part(TOWERK.G=Object.assign(new THREE.Group(),{name:'tower-in'}),furnish); scene.add(TOWERK.G); return P; },unbuild:()=>{ if(TOWERK.G)TOWERK.G.removeFromParent(); TOWERK.G=null; },
      spawn:[sp[0],sp[1],0,Math.PI],out:[s.x+dx*(rr+1.2*T),s.z+dz*(rr+1.2*T),0,a],door:[s.x+dx*(rr+.15*T),0,s.z+dz*(rr+.15*T)],exit:[ex[0],0,ex[1]],exitName:'OUT TO THE PARK'};
    if(ROOMS.reset)ROOMS.reset(); roofSet(); return true; };
  { let done=false; SYS.add('life',()=>{ if(!done)done=reg(); },'146zn-tower'); }
  const furnish=()=>{ '@later'; const F=frame(), first=!TOWERK.sol; TOWERK.sol=true; const K=IKIT.room(F,o=>TOWERK.G.add(o),first?undefined:()=>{}), {box,cyl,ball,glow,use,seat,own,pic,words}=K, H=3.2, c=4;
    const ST={stone:0x8a8478,dark:0x3a3028,wood:0x6a4a2a,red:0x8a2a24,straw:0xc8b070};
    cyl(c,c,RR,0,.02,0x6a6258,RR,24);   // the floor
    for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a))-Math.PI/2)<.25)continue; const u=c+Math.cos(a)*(RR+.1), v=c+Math.sin(a)*(RR+.1); box(u-.25,v-.25,u+.25,v+.25,0,H,ST.stone); K.sol(u-.25,v-.25,u+.25,v+.25); }
    // his bunk, a straw mattress, a red blanket
    seat('THE BUNK',own(()=>{ box(c-2.4,c-1.2,c-1.5,c+.8,0,.4,ST.wood); box(c-2.35,c-1.15,c-1.55,c+.75,.4,.5,ST.straw); box(c-2.35,c-.4,c-1.55,c+.75,.5,.53,ST.red); }),[[c-1.95,c-.3,.5,1,0]],1.0);
    // his table and the chart on it
    box(c+.6,c-1.6,c+1.8,c-.8,.72,.78,ST.wood); for(const [a,b] of [[.65,-1.55],[1.75,-1.55],[.65,-.85],[1.75,-.85]])box(c+a-.03,c+b-.03,c+a+.03,c+b+.03,0,.72,ST.dark); box(c+.8,c-1.45,c+1.6,c-.95,.78,.785,0xe8dcb8);
    use("THE LOOKOUT'S CHART",c+1.2,c-1.2,1.2,1.0,TOWERK.chart,1.6);
    // the ladder up to the roof hatch
    for(const s of [-1,1])box(c+s*.25-.03,c-RR+.15,c+s*.25+.03,c-RR+.25,0,H,ST.wood); for(let i=1;i<10;i++)box(c-.25,c-RR+.17,c+.25,c-RR+.23,i*.3,i*.3+.04,ST.wood); box(c-.45,c-RR+.1,c+.45,c-RR+.9,H-.05,H,ST.dark);
    use('THE LADDER (UP TO THE ROOF)',c,c-RR+.5,.8,H,TOWERK.roof,1.4);
    glow(()=>{ ball(c-2.0,c+2.0,1.9,.08,0xffc860); }); K.flush(); };
}

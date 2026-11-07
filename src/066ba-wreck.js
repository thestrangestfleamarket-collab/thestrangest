// THE WRECK: a sunken pirate ship on the Hudson's bed past the pier, broken-backed, its black flag still on the mast, and sunken chests to dive for (in the wreck and deeper out in the channel): each gives you old coins and a gem once a day.
import {SHARED, THREE} from './003-shx.js';
import {INV, pos, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {RIVER} from './066-river.js';
const WRECK={chests:[]}; window.WRECK=WRECK;
{ const T=TILE, MW=T/.84, say=(t,c)=>SAY(t,c||'#9fd8ff'), hs=(a,b)=>{ let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const bedY=(x,z)=>RIVER.box.lv-RIVER.depthAt(x,z)*MW;
  // where: out from the pier where the bed is about nine metres down; the deep chests where it is twenty to forty
  const spot=()=>{ const B=RIVER.box, px=(RIVER.piers&&RIVER.piers[0])||RIVER.mouth.x, x=Math.min(B.x1-30*T,Math.max(B.x0+30*T,px+38*T)); let best=null, bd=1e9;
    for(let e=8;e<60;e+=.5){ const z=B.z1-e*T, d=Math.abs(RIVER.depthAt(x,z)-9); if(d<bd){ bd=d; best=z; } } return [x,best]; };
  const deeps=()=>{ const B=RIVER.box, out=[]; for(let i=0;i<400&&out.length<3;i++){ const x=B.x0+(.1+.8*hs(i,3))*(B.x1-B.x0), z=B.z1-(10+hs(i,7)*((B.z1-B.z0)/T-14))*T, d=RIVER.depthAt(x,z);
      if(d>20&&d<40&&out.every(p=>Math.hypot(p[0]-x,p[1]-z)>40*T))out.push([x,z]); } return out; };
  // a chest on the bed: its lid propped open on its coins while it is full
  const chest=(x,z,k)=>{ const G=new THREE.Group(), L=m=>new THREE.MeshLambertMaterial({color:m}), wood=L(0x4a2e18), band=L(0x8a7a3a), y=bedY(x,z);
    const add=(g,m,px,py,pz,rx=0)=>{ const o=new THREE.Mesh(g,m); o.position.set(px*MW,py*MW,pz*MW); o.rotation.x=rx; o.castShadow=true; G.add(o); return o; };
    add(new THREE.BoxGeometry(.8,.45,.5),wood,0,.2,0); for(const s of [-.3,.3])add(new THREE.BoxGeometry(.05,.47,.52),band,s,.2,0);
    const lid=new THREE.Group(); lid.position.set(0,.42*MW,-.25*MW); G.add(lid); { const o=new THREE.Mesh(new THREE.CylinderGeometry(.25*MW,.25*MW,.8*MW,10,1,false,0,Math.PI),wood); o.rotation.z=Math.PI/2; o.position.z=.25*MW; lid.add(o); }
    const gold=add(new THREE.CylinderGeometry(.3,.34,.08,10),new THREE.MeshBasicMaterial({color:0xffd24a}),0,.44,0);
    G.position.set(x,y-.05*MW,z); G.rotation.y=hs(k.length,x|0)*6.28; scene.add(G);
    const C={k,G,lid,gold,th:null}; C.th={name:'A SUNKEN CHEST',obj:G,reach:1.4*T,near:2.6*T,tall:.6*T,act:()=>open(C)}; UI.thing(C.th); WRECK.chests.push(C); return C; };
  const open=C=>{ if(!INV.ready(C.k))return say('EMPTY. THE RIVER BRINGS MORE IN BY TOMORROW.','#c8a090'); const c=10+Math.floor(Math.random()*31); INV.cash+=c; INV.pick(C.k); say('THE LID GIVES. $'+c+' IN OLD COINS, AND A STONE AMONG THEM.'); if(SFX.play)SFX.play('chirp',{vol:.5,pitch:.8}); };
  // the ship, in metres along its length (u, bow at 0) and across (v), from its keel on the bed (h)
  const ship=(cx,cz)=>{ const LEN=16, BM=5, B=SHARED.BOD, tx=w=>(w-B.XS(0))/(B.XS(1)-B.XS(0)), tz=w=>(w-B.ZS(0))/(B.ZS(1)-B.ZS(0)), lt=LEN/.84, bt=BM/.84;
    const R={x0:tx(cx)-lt/2,x1:tx(cx)+lt/2,y0:tz(cz)-bt/2,y1:tz(cz)+bt/2}, F=IKIT.frame(R,(x,y)=>[B.XS(x),B.ZS(y)]), G=new THREE.Group(), K=IKIT.room(F,o=>G.add(o),()=>{}), {box,cyl,pic}=K;
    const W1=0x3b2a1c, W2=0x2e2116, half=u=>BM/2*Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,Math.max(0,(u+.6)/(LEN+1.2))))),.6), mid=BM/2;
    for(let u=0;u<LEN;u+=.5){ if(u>7.2&&u<8.7)continue; const w=half(u+.25), top=2.2+(u>11.5?(u-11.5)*.18:0)-(u>6&&u<10?.5:0), c=hs(u*2,1)>.5?W1:W2;   // broken-backed: lower toward the break
      box(u,mid-w,u+.5,mid+w,-.6,-.4,W2); for(const s of [-1,1]){ const v=mid+s*w; for(let h=-.4;h<top;h+=.3)if(hs(u*7+s,h*9)>.12||h<.5)box(u,v-.08,u+.5,v+.08,h,h+.3,c); }
      if(hs(u*3,5)>.4&&!(u>6&&u<10))box(u,mid-w+.08,u+.5,mid+w-.08,top-.12,top-.02,0x4a3624); }
    box(12.6,mid-1.6,15.4,mid+1.6,2.6,3.6,W1); box(12.5,mid-1.7,15.5,mid+1.7,3.6,3.7,W2); for(let i=0;i<3;i++)box(15.4,mid-1.2+i*1.0,15.45,mid-.8+i*1.0,2.9,3.3,0x0c1418);   // the stern cabin, its dark windows
    cyl(4.6,mid,.2,-.4,5.2,0x2e2116,.16); cyl(10.6,mid,.17,-.4,2.6,0x2e2116,.14); box(3.4,mid-.06,5.8,mid+.06,4.5,4.6,W2);   // the masts (the main one standing, the mizzen snapped) and a yard
    const flag=IKIT.tex(32,24,(g,w,h)=>{ g.fillStyle='#141416'; g.fillRect(0,0,w,h); g.clearRect(26,0,6,4); g.clearRect(29,4,3,6); g.clearRect(0,20,4,4); g.clearRect(24,19,8,5);
      g.fillStyle='#d8d2c0'; g.fillRect(12,5,8,7); g.fillStyle='#141416'; g.fillRect(13,7,2,2); g.fillRect(17,7,2,2); g.fillRect(15,10,2,1); g.fillStyle='#d8d2c0'; for(let i=0;i<8;i++){ g.fillRect(8+i,14+(i%2),2,2); g.fillRect(22-i,14+(i%2),2,2); } });
    flag.colorSpace=THREE.SRGBColorSpace; { const m=pic(4.6,mid+.2,2.9,2.0,1.5,0,1,flag); m.material.side=THREE.DoubleSide; m.material.alphaTest=.5; m.material.transparent=false; }
    K.flush(); const y=bedY(cx,cz)+.35*MW; G.position.y=y; scene.add(G);
    // its cannons out of the ports, the mizzen lying on the bed beside it
    const iron=new THREE.MeshLambertMaterial({color:0x202326}); for(const s of [-1,1])for(const u of [3,6.2,11]){ const p=F.pw(u,mid+s*(half(u)+.2)), c=new THREE.Mesh(new THREE.CylinderGeometry(.11*MW,.14*MW,1.1*MW,8),iron);
      c.rotation.x=Math.PI/2; c.rotation.y=F.hd(0,s); c.position.set(p[0],y+(1.0+(u>6&&u<10?-.5:0))*MW,p[1]); scene.add(c); WRECK.parts.push(c); }
    { const p=F.pw(11.5,mid+4.2), m=new THREE.Mesh(new THREE.CylinderGeometry(.14*MW,.16*MW,6*MW,8),new THREE.MeshLambertMaterial({color:0x2e2116})); m.rotation.z=Math.PI/2; m.rotation.y=.4; m.position.set(p[0],bedY(p[0],p[1])+.12*MW,p[1]); scene.add(m); WRECK.parts.push(m); }
    WRECK.parts.push(G); return F; };
  WRECK.parts=[];
  const build=()=>{ const [x,z]=spot(); WRECK.at=[x,z]; const F=ship(x,z), mid=2.5;
    for(const [u,v,i] of [[7.9,mid,0],[-1.6,mid+3.2,1],[14,mid-3.4,2]]){ const p=F.pw(u,v); chest(p[0],p[1],'wreck'+i); }
    deeps().forEach(([dx,dz],i)=>chest(dx,dz,'deep'+i)); WRECK.built=true; };
  // built once the river is, drawn only near it; a full chest shows its gold, an emptied one is shut till tomorrow
  SYS.add('places',()=>{ if(!WRECK.built){ if(RIVER.box&&RIVER.depthAt)build(); return; } const [x,z]=WRECK.at, near=Math.hypot(pos.x-x,pos.z-z)<140*T;
    for(const o of WRECK.parts)o.visible=near; for(const C of WRECK.chests){ const n=Math.hypot(pos.x-C.G.position.x,pos.z-C.G.position.z)<140*T, full=INV.ready(C.k); C.G.visible=n; C.gold.visible=full; C.lid.rotation.x=full?-1.1:0; C.th.name=full?'A SUNKEN CHEST':'A SUNKEN CHEST (EMPTY)'; } },'066ba-wreck');
  window.WRECKDBG=()=>({built:!!WRECK.built,at:WRECK.at&&WRECK.at.map(v=>+(v/T).toFixed(1)),depth:WRECK.at&&+RIVER.depthAt(...WRECK.at).toFixed(1),chests:WRECK.chests.map(C=>({k:C.k,depth:+RIVER.depthAt(C.G.position.x,C.G.position.z).toFixed(1),full:INV.ready(C.k)}))});
}

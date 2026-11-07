// THE WRECK: a sunken pirate ship far down on the Hudson's bed (about 55 m, half a minute's swim down), broken-backed, its black flag still on the mast, and sunken chests to dive for (in the wreck and deeper out in the channel): each gives you old coins and a gem once a day.
import {SHARED, THREE} from './003-shx.js';
import {INV, pos, SFX, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {RIVER} from './066-river.js';
const WRECK={chests:[]}; window.WRECK=WRECK;
{ const T=TILE, MW=T/.84, say=(t,c)=>SAY(t,c||'#9fd8ff'), hs=(a,b)=>{ let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const bedY=(x,z)=>RIVER.box.lv-RIVER.depthAt(x,z)*MW;
  // where: on a flat stretch of the bed about 55 m down, nearest the pier (owner, 7 Nov 2026: "very far down at bottom of hudson, should take like 30 seconds to get to the ship swimming down in scuba gear"; you swim down 1.8 m a second)
  const DEPTH=55, spot=()=>{ const B=RIVER.box, px=(RIVER.piers&&RIVER.piers[0])||RIVER.mouth.x;
    for(const [dd,flat] of [[12,10],[16,16],[20,24],[30,40]]){ let best=null, bc=1e9;   // the flattest stretch near the depth, loosening till one fits
      for(let x=Math.max(B.x0+20*T,SHARED.BOD.XS(-40));x<Math.min(B.x1-20*T,SHARED.BOD.XS(240));x+=2*T)for(let z=B.z1-6*T;z>B.z0+6*T;z-=1.5*T){ const d=RIVER.depthAt(x,z); if(Math.abs(d-DEPTH)>dd)continue;
        let lo=1e9, hi=-1e9; for(let u=-27;u<=27;u+=4.5)for(let v=-8;v<=8;v+=4){ const q=RIVER.depthAt(x+u*MW,z+v*MW); lo=Math.min(lo,q); hi=Math.max(hi,q); } if(hi-lo>flat)continue;   // the hull and a margin round it on one level stretch, never on the rim of a hole
        const c=Math.abs(d-DEPTH)*2+(hi-lo)*3+Math.abs(x-px)/T*.03; if(c<bc){ bc=c; best=[x,z]; } }
      if(best)return best; } return null; };
  const deeps=()=>{ const B=RIVER.box, out=[]; for(let i=0;i<400&&out.length<3;i++){ const x=B.x0+(.1+.8*hs(i,3))*(B.x1-B.x0), z=B.z1-(10+hs(i,7)*((B.z1-B.z0)/T-14))*T, d=RIVER.depthAt(x,z);
      if(d>20&&d<40&&out.every(p=>Math.hypot(p[0]-x,p[1]-z)>40*T))out.push([x,z]); } return out; };
  // a chest on the bed: its lid propped open on its coins while it is full
  const chest=(x,z,k,y0)=>{ const G=new THREE.Group(), L=m=>new THREE.MeshLambertMaterial({color:m}), wood=L(0x4a2e18), band=L(0x8a7a3a), y=y0??bedY(x,z);
    const add=(g,m,px,py,pz,rx=0)=>{ const o=new THREE.Mesh(g,m); o.position.set(px*MW,py*MW,pz*MW); o.rotation.x=rx; o.castShadow=true; G.add(o); return o; };
    add(new THREE.BoxGeometry(.8,.45,.5),wood,0,.2,0); for(const s of [-.3,.3])add(new THREE.BoxGeometry(.05,.47,.52),band,s,.2,0);
    const lid=new THREE.Group(); lid.position.set(0,.42*MW,-.25*MW); G.add(lid); { const o=new THREE.Mesh(new THREE.CylinderGeometry(.25*MW,.25*MW,.8*MW,10,1,false,0,Math.PI),wood); o.rotation.z=Math.PI/2; o.position.z=.25*MW; lid.add(o); }
    const gold=add(new THREE.CylinderGeometry(.3,.34,.08,10),new THREE.MeshBasicMaterial({color:0xffd24a}),0,.44,0);
    G.position.set(x,y-.05*MW,z); G.rotation.y=hs(k.length,x|0)*6.28; scene.add(G);
    const C={k,G,lid,gold,th:null}; C.th={name:'A SUNKEN CHEST',obj:G,reach:1.4*T,near:2.6*T,tall:.6*T,act:()=>open(C)}; UI.thing(C.th); WRECK.chests.push(C); return C; };
  const open=C=>{ if(!INV.ready(C.k))return say('EMPTY. THE RIVER BRINGS MORE IN BY TOMORROW.','#c8a090'); const c=10+Math.floor(Math.random()*31); INV.cash+=c; INV.pick(C.k); say('THE LID GIVES. $'+c+' IN OLD COINS, AND A STONE AMONG THEM.'); if(SFX.play)SFX.play('chirp',{vol:.5,pitch:.8}); };
  // the ship, three times a real sloop's size (owner, 7 Nov 2026: "make the ship 3x bigger ... you can go inside and swim around, plenty of room"): drawn in its old metres (u along, bow at 0; v across; h from the keel) times S; hollow, its back broken open in the middle, a hollow stern cabin, a hold with cargo
  const S=3, LEN=16, BM=5, mid=BM/2, half=u=>BM/2*Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,Math.max(0,(u+.6)/(LEN+1.2))))),.6);
  const ship=(cx,cz)=>{ const B=SHARED.BOD, tx=w=>(w-B.XS(0))/(B.XS(1)-B.XS(0)), tz=w=>(w-B.ZS(0))/(B.ZS(1)-B.ZS(0)), lt=LEN*S/.84, bt=BM*S/.84;
    const R={x0:tx(cx)-lt/2,x1:tx(cx)+lt/2,y0:tz(cz)-bt/2,y1:tz(cz)+bt/2}, F=IKIT.frame(R,(x,y)=>[B.XS(x),B.ZS(y)]), G=new THREE.Group(), K=IKIT.room(F,o=>G.add(o),()=>{});
    const box=(u0,v0,u1,v1,h0,h1,c)=>K.box(u0*S,v0*S,u1*S,v1*S,h0*S,h1*S,c), cyl=(u,v,r,h0,h1,c,rt)=>K.cyl(u*S,v*S,r*S,h0*S,h1*S,c,(rt??r)*S), pic=(u,v,h,w,hh,du,dv,t)=>K.pic(u*S,v*S,h*S,w*S,hh*S,du,dv,t);
    const W1=0x3b2a1c, W2=0x2e2116, BRK=u=>u>7.2&&u<8.7, LOW=u=>u>6&&u<10;
    for(let u=0;u<LEN;u+=.5){ if(BRK(u))continue; const w=half(u+.25), top=2.4+(u>11.5?(u-11.5)*.18:0)-(LOW(u)?.6:0), c=hs(u*2,1)>.5?W1:W2;   // broken-backed: lower toward the break
      box(u,mid-w,u+.5,mid+w,-.6,-.4,W2); for(const s of [-1,1]){ const v=mid+s*w; for(let h=-.4;h<top;h+=.3)if(hs(u*7+s,h*9)>.05||h<.9)box(u,v-.05,u+.5,v+.05,h,h+.3,c); }   // its planks, a few sprung high up
      if(hs(u*3,5)>.5&&!LOW(u))box(u,mid-w+.06,u+.5,mid+w-.06,top-.08,top-.02,0x4a3624);   // what is left of the upper deck
      if(u>1&&u<13&&!LOW(u)&&hs(u*5,9)>.35)box(u,mid-w+.1,u+.5,mid+w-.1,.9,.95,0x3e2c1c); }   // the orlop deck, rotten through in places
    // the stern cabin: hollow, its door into the hold, its dark windows
    const C0=12.5, C1=15.5, CH0=2.6, CH1=3.8; for(const [a0,b0,a1,b1] of [[C0,mid-1.7,C1,mid-1.6],[C0,mid+1.6,C1,mid+1.7],[C1-.1,mid-1.7,C1,mid+1.7]])box(a0,b0,a1,b1,CH0,CH1,W1);
    box(C0,mid-1.7,C0+.1,mid-.5,CH0,CH1,W1); box(C0,mid+.5,C0+.1,mid+1.7,CH0,CH1,W1); box(C0,mid-1.7,C1,mid+1.7,CH1,CH1+.1,W2); box(C0,mid-1.7,C1,mid+1.7,CH0-.05,CH0,0x3e2c1c);
    for(let i=0;i<3;i++)box(C1-.12,mid-1.2+i*1.0,C1-.1,mid-.8+i*1.0,2.9,3.4,0x0c1418);
    box(13.3,mid-.8,14.6,mid+.2,CH0,CH0+.35,0x4a2e18); box(13.2,mid-.9,14.7,mid+.3,CH0+.35,CH0+.4,0x2e1c10);   // the captain's table
    // the hold: barrels and crates on the hull's floor
    for(let i=0;i<14;i++){ const u=1.5+hs(i,1)*11, v=mid+(hs(i,2)-.5)*half(u)*1.3; if(BRK(u))continue; if(i%2)cyl(u,v,.22,-.4,.2,0x5a3a20,.2); else box(u-.25,v-.25,u+.25,v+.25,-.4,.1+.2*hs(i,3),0x6a4a2a); }
    cyl(4.6,mid,.2,-.4,5.4,0x2e2116,.16); cyl(10.6,mid,.17,-.4,2.6,0x2e2116,.14); box(3.4,mid-.06,5.8,mid+.06,4.6,4.7,W2);   // the masts (the main one standing, the mizzen snapped) and a yard
    const flag=IKIT.tex(32,24,(g,w,h)=>{ g.fillStyle='#141416'; g.fillRect(0,0,w,h); g.clearRect(26,0,6,4); g.clearRect(29,4,3,6); g.clearRect(0,20,4,4); g.clearRect(24,19,8,5);
      g.fillStyle='#d8d2c0'; g.fillRect(12,5,8,7); g.fillStyle='#141416'; g.fillRect(13,7,2,2); g.fillRect(17,7,2,2); g.fillRect(15,10,2,1); g.fillStyle='#d8d2c0'; for(let i=0;i<8;i++){ g.fillRect(8+i,14+(i%2),2,2); g.fillRect(22-i,14+(i%2),2,2); } });
    flag.colorSpace=THREE.SRGBColorSpace; { const m=pic(4.6,mid+.2,3.0,2.0,1.5,0,1,flag); m.material.side=THREE.DoubleSide; m.material.alphaTest=.5; m.material.transparent=false; }
    K.flush(); const y=bedY(cx,cz)+(.6*S-.4)*MW; G.position.y=y; scene.add(G);   // the keel a little into the bed
    const iron=new THREE.MeshLambertMaterial({color:0x202326}); for(const sd of [-1,1])for(const u of [3,5.6,11]){ const p=F.pw(u*S,(mid+sd*(half(u)+.2))*S), c=new THREE.Mesh(new THREE.CylinderGeometry(.11*S*MW,.14*S*MW,1.1*S*MW,8),iron);   // its cannons out of the ports
      c.rotation.x=Math.PI/2; c.rotation.y=F.hd(0,sd); c.position.set(p[0],y+(1.2-(LOW(u)?.5:0))*S*MW,p[1]); scene.add(c); WRECK.parts.push(c); }
    { const p=F.pw(11.5*S,(mid+4.6)*S), m=new THREE.Mesh(new THREE.CylinderGeometry(.14*S*MW,.16*S*MW,6*S*MW,8),new THREE.MeshLambertMaterial({color:0x2e2116})); m.rotation.z=Math.PI/2; m.rotation.y=.4; m.position.set(p[0],bedY(p[0],p[1])+.4*MW,p[1]); scene.add(m); WRECK.parts.push(m); }   // the mizzen on the bed beside it
    WRECK.parts.push(G); WRECK.floorY=y-.4*S*MW; WRECK.F=F; return F; };
  WRECK.parts=[];
  // its guards: sharks circling the wreck; one comes for a diver who gets close, bites, and turns away
  const SHK=[], shark=()=>{ const G=new THREE.Group(), grey=new THREE.MeshLambertMaterial({color:0x5a6670}), pale=new THREE.MeshLambertMaterial({color:0xc8ccd0}), M=MW;
    const body=new THREE.Mesh(new THREE.SphereGeometry(.5*M,12,8),grey); body.scale.set(.55,.5,3.2); G.add(body); const belly=new THREE.Mesh(new THREE.SphereGeometry(.48*M,12,8),pale); belly.scale.set(.5,.38,3.0); belly.position.y=-.08*M; G.add(belly);
    const fin=(w,h,x,y,z,rz,ry=0)=>{ const f=new THREE.Mesh(new THREE.ConeGeometry(w*M,h*M,4),grey); f.position.set(x*M,y*M,z*M); f.rotation.set(0,ry,rz); f.scale.z=.25; G.add(f); return f; };
    fin(.3,.8,0,.5,.1,0); fin(.25,.7,.45,-.15,.4,-2.2); fin(.25,.7,-.45,-.15,.4,2.2);
    const tail=new THREE.Group(); tail.position.z=-1.5*M; G.add(tail); { const t1=new THREE.Mesh(new THREE.ConeGeometry(.22*M,.9*M,4),grey); t1.position.set(0,.35*M,-.2*M); t1.rotation.x=-.6; t1.scale.z=.25; const t2=t1.clone(); t2.position.y=-.3*M; t2.rotation.x=.6+Math.PI; tail.add(t1,t2); }
    G.userData.tail=tail; scene.add(G); return G; };
  const SHARK=()=>{ const [cx,cz]=WRECK.at; for(let i=0;i<4;i++){ const g=shark(); SHK.push({g,r:(14+i*4)*MW,a:i*1.7,h:(4+i*2.2)*MW,w:(.18+.04*i)*(i%2?-1:1),chase:0,rest:0,x:cx,y:0,z:cz}); WRECK.parts.push(g); } };
  let bit=0; const guard=dt=>{ const [cx,cz]=WRECK.at, by=WRECK.floorY, py=SHARED.py, diver=RIVER.swim&&Math.hypot(pos.x-cx,pos.z-cz)<30*MW&&py<by+20*MW; let hunter=null;
    if(diver){ let bd=1e9; for(const k of SHK){ const d=Math.hypot(k.x-pos.x,k.z-pos.z); if(k.rest<=0&&d<bd){ bd=d; hunter=k; } } }
    bit-=dt; for(const k of SHK){ k.rest-=dt; let tx, ty, tz, sp;
      if(k===hunter){ tx=pos.x; ty=py+.8*MW; tz=pos.z; sp=3.2*MW; } else { k.a+=k.w*dt; tx=cx+Math.cos(k.a)*k.r; tz=cz+Math.sin(k.a)*k.r; ty=by+k.h; sp=2*MW; }
      const dx=tx-k.x, dy=ty-k.y, dz=tz-k.z, d=Math.hypot(dx,dy,dz)||1, st_=Math.min(d,sp*dt); k.x+=dx/d*st_; k.y+=dy/d*st_; k.z+=dz/d*st_;
      const hd=Math.atan2(dx,dz); k.hd=k.hd==null?hd:k.hd+Math.atan2(Math.sin(hd-k.hd),Math.cos(hd-k.hd))*Math.min(1,dt*2.5); k.g.position.set(k.x,k.y,k.z); k.g.rotation.set(-Math.atan2(dy,Math.hypot(dx,dz))*.5,k.hd,0); k.g.userData.tail.rotation.y=Math.sin(performance.now()/180+k.r)*.5;
      if(k===hunter&&d<2.2*MW&&bit<=0){ bit=3; k.rest=7; if(VIT.hurt)VIT.hurt(.12); say('A SHARK BITES! IT TURNS AWAY, CIRCLING.','#ff9a8a'); } } };
  const build=()=>{ const at=spot(); if(!at){ WRECK.built=true; WRECK.none=true; return; } const [x,z]=at; WRECK.at=[x,z]; const F=ship(x,z);
    for(const [u,v,i,inn] of [[7.9,mid,0],[3,mid+.6,1,1],[13.9,mid-.3,2,2],[-2,mid+3.6,3]]){ const p=F.pw(u*S,v*S); chest(p[0],p[1],'wreck'+i,inn===1?WRECK.floorY:inn===2?WRECK.floorY+(3.0*S*MW):null); }   // in the break, in the hold, on the cabin floor, one tumbled out by the bow
    deeps().forEach(([dx,dz],i)=>chest(dx,dz,'deep'+i)); SHARK(); WRECK.built=true; };
  // built once the river is, drawn only near it; a full chest shows its gold, an emptied one is shut till tomorrow
  SYS.add('places',dt=>{ if(!WRECK.built){ if(RIVER.box&&RIVER.depthAt)build(); return; } if(WRECK.none)return; const [x,z]=WRECK.at, near=Math.hypot(pos.x-x,pos.z-z)<140*T;
    for(const o of WRECK.parts)o.visible=near; if(near)guard(Math.min(.1,dt||0)); for(const C of WRECK.chests){ const n=Math.hypot(pos.x-C.G.position.x,pos.z-C.G.position.z)<140*T, full=INV.ready(C.k); C.G.visible=n; C.gold.visible=full; C.lid.rotation.x=full?-1.1:0; C.th.name=full?'A SUNKEN CHEST':'A SUNKEN CHEST (EMPTY)'; } },'066ba-wreck');
  window.WRECKDBG=()=>({built:!!WRECK.built,at:WRECK.at&&WRECK.at.map(v=>+(v/T).toFixed(1)),depth:WRECK.at&&+RIVER.depthAt(...WRECK.at).toFixed(1),chests:WRECK.chests.map(C=>({k:C.k,depth:+RIVER.depthAt(C.G.position.x,C.G.position.z).toFixed(1),full:INV.ready(C.k)}))});
}
export {WRECK};

// THE PLAYHOUSE, THE WOODEN O (owner, 10 Nov 2026): its inside, off the map and built only when you go in (double-click its gate on Market St): the yard open to the sky, the galleries and their benches to sit in, the stage under the heavens, the tiring house, the gate passage with its pay hatch (151a-c); lanterns on the posts after dark.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, pos, ROOMS, UI, USE} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {AWAY, grab, SOL, STORE, SYS, TILE, TURN, WP, ZU} from './006-map-pre.js';
import {PHT} from './151a-ph-tex.js';
import {PHK, PHX} from './151b-ph-kit.js';
import {PHA} from './151c-ph-house.js';
await grab('playhouse',async()=>{ if(AWAY.has('playhouse'))return; const MS=STORE.main, {X,Z}=SHARED.BOD, MH=TILE/.84, MV=ZU*24/.84, PI=Math.PI;
  const LW=MS.lot('play',190), TP=TURN(LW,WP.play.face), L=TP.L, m=(L.x0+L.x1)/2, at=(u,v)=>{ const p=TP.pt(u,v); return [X(p[0]),Z(p[1])]; };
  const OX=SHARED.BOD.XS(-2400), OZ=SHARED.BOD.ZS(0), W=(x,y,z)=>[OX+x*MH,y*MV,OZ+z*MH], lx=x=>(x-OX)/MH, lz=z=>(z-OZ)/MH;
  const PD=PHA.D, E=PD.A1+1.2, B={x0:-E,x1:E,z0:-E,z1:E}, GZ=PD.A1-.6;
  STORE.playFrame={OX,OZ,MH,MV,B,FY:PD.G1,W};   // the inside in its own metres (x across, z from the yard's middle to the gate) and to the world, for what furnishes it
  let G=null, K=null, P=null, SO=[], LT=[];
  const build=()=>{ '@playhouse';
    G=new THREE.Group(); G.name='playhouse-in'; G.position.set(OX,0,OZ); G.scale.set(MH,MV,MH); scene.add(G);
    const TX=PHT.make(); K=PHK.make(TX); K.you=()=>({x:lx(pos.x),y:SHARED.py/MV,z:lz(pos.z)}); K.MH=MH; K.MV=MV; G.add(K.G); try{ PHA.make(K); for(const p of PHX.parts)if(p.make)p.make(K); }catch(e){ console.error('playhouse build',e); }
    // the lanterns' light after dark: a few real lamps round the yard and one on the stage (the rest of the lanterns glow)
    const lamp=(p,c,i,r)=>{ const l=new THREE.PointLight(c,i,r*MH,1.4); l.userData.pool=true; l.castShadow=false; l.position.set(...p); K.G.add(l); LT.push({l,i}); return l; };
    K.lanterns.filter((_,i)=>i%2===0).forEach(p=>lamp([p[0]*.8,p[1]+.4,p[2]*.8],0xffb870,7,14)); lamp([0,PD.HV-1.2,-4],0xffd8a0,9,12); lamp([0,2.6,GZ-.5],0xffc888,4,6);
    // the benches: each gallery side is one thing to double-click; you sit in its free seat nearest you
    const rows={}; for(const s of K.seats){ const k=s.blk; (rows[k]=rows[k]||[]).push(s); }
    for(const list of Object.values(rows)){ const xs=list.map(s=>s.x), zs=list.map(s=>s.z), s0=list[0];
      K.thing('TAKE A SEAT IN THE GALLERY',(Math.min(...xs)+Math.max(...xs))/2,s0.y+.1,(Math.min(...zs)+Math.max(...zs))/2,Math.max(.8,Math.max(...xs)-Math.min(...xs)+.6),1.1,Math.max(.8,Math.max(...zs)-Math.min(...zs)+.6),()=>{
        const px=lx(pos.x), pz=lz(pos.z); let best=null, bd=1e9; for(const s of list){ const d=Math.hypot(s.x-px,s.z-pz); if(d<bd){ bd=d; best=s; } } if(!best)return;
        const w=W(best.x,best.y,best.z); USE.sitAt(w[0],w[2],w[1],best.hd); },{reach:2.4,near:4}); }
    const P2=ROOMS.part(G,()=>{ for(const t of K.things)UI.thing({...t,reach:t.reach*MH,near:t.near*MH,tall:t.tall*MV}); if(STORE.furnish&&STORE.furnish.playhouse)STORE.furnish.playhouse(STORE.playFrame,K); });
    SO=K.sol.map(([a,b,c,d])=>[OX+a*MH,OZ+b*MH,OX+c*MH,OZ+d*MH]); SOL.up.push(...SO);
    P=P2; return P2; };
  const unbuild=()=>{ '@later'; for(const r of SO){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } SO=[]; for(const p of PHX.parts)if(p.drop&&K)p.drop(K); LT=[];
    if(G){ G.traverse(c=>{ if(c.geometry)c.geometry.dispose(); }); G.removeFromParent(); G=null; } K=null; P=null; };
  const inside=()=>!!K&&ROOMS.offIn&&ROOMS.offIn()==='playhouse';
  // the ground inside: the yard, the galleries (the one you are on), the stair, the stage and its steps
  const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ if(K&&x>OX+B.x0*MH&&x<OX+B.x1*MH&&z>OZ+B.z0*MH&&z<OZ+B.z1*MH){ const y=K.groundAt(lx(x),lz(z)); return (y==null?0:y)*MV; } return sg0?sg0(x,z):null; };
  const door=at(m,L.y1+.25), out=at(m,L.y1+.9);
  ROOMS.off.playhouse={name:'THE PLAYHOUSE',box:{x0:OX+B.x0*MH,z0:OZ+B.z0*MH,x1:OX+B.x1*MH,z1:OZ+B.z1*MH,y0:-3*MV,y1:(PD.TOP+3)*MV},noCeil:true,clearAir:true,sky:true,need:()=>LOAD('playhouse'),build,unbuild,
    spawn:[...(p=>[p[0],p[2]])(W(0,0,GZ)),0,PI],out:[...out,0,TP.hd(0)],door:[door[0],0,door[1]],exit:W(0,PD.G1,PD.A1),exitName:'OUT TO THE STREET',ownDoor:1};
  STORE.places.push(['THE PLAYHOUSE',...(p=>[p[0],p[2]])(W(0,0,GZ)),'up','off',PI]);
  ROOMS.reset&&ROOMS.reset();
  // each frame while you are inside: the parts' own work; the lanterns lit after dark (the yard is open to the sky, so the day comes in as it is)
  SYS.add('places',dt=>{ if(!K)return; const now=performance.now(), inn=inside(); if(G&&G.visible!==inn)G.visible=inn; for(const p of PHX.parts)if(p.tick)p.tick(dt,K,now,inn); if(K.shadowDue){ K.shadowDue=false; renderer.shadowMap.needsUpdate=true; }
    if(!inn)return; const dark=CLOCK.dark?CLOCK.dark():false; for(const e of LT)e.l.intensity=dark?e.i:e.i*.15; },'151z-playhouse');
  window.PHDBG=()=>({built:!!K,inside:inside(),seats:K?K.seats.length:0,things:K?K.things.length:0,solids:SO.length,lamps:LT.length,
    tris:G?(()=>{ let n=0; G.traverse(c=>{ if(c.isMesh&&c.geometry){ const g=c.geometry, k=(g.index?g.index.count:g.attributes.position.count)/3; n+=c.isInstancedMesh?k*c.count:k; } }); return Math.round(n); })():0,
    W:(x,y,z)=>W(x,y,z),run:f=>f(K,PHX),look:(x,z,hd,pt,view)=>{ if(view)UI.setView(view); const w=W(x,0,z); UI.goTo(w[0],w[2],0,hd); SHARED.heading=hd; SHARED.yaw=SHARED.yawTo=hd+PI; SHARED.pitch=SHARED.pitchTo=pt; },L:(x,z)=>[lx(x),lz(z)],ground:(x,z)=>K&&K.groundAt(x,z)});
});

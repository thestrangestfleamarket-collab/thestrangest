// THE PLAYHOUSE: its inside, off the map and built only when you go in (double-click its door on West St): the foyer, the stalls and the stage (151a-d) with their cloths, lighting, sets and play (151e on), its seats to sit in, the foyer's mirrors, its house lights; the bars fly, the ghost light burns when the stage is dark.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, pos, ROOMS, SFX, UI, USE} from './003b-systems.js';
import {Reflector, renderer, scene} from './004-main.js';
import {AWAY, grab, SECTIONS, SOL, STORE, SYS, TILE, TURN, WP, ZU} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';
import {PHT} from './151a-ph-tex.js';
import {PHK, PHX} from './151b-ph-kit.js';
import {PHA} from './151c-ph-house.js';
import {PHS} from './151d-ph-stage.js';
await grab('playhouse',async()=>{ if(AWAY.has('playhouse'))return; const MS=STORE.main, {X,Z}=SHARED.BOD, MH=TILE/.84, MV=ZU*24/.84, PI=Math.PI;
  const LW=MS.lot('play',190), TP=TURN(LW,WP.play.face), L=TP.L, m=(L.x0+L.x1)/2, at=(u,v)=>{ const p=TP.pt(u,v); return [X(p[0]),Z(p[1])]; };
  const OX=SHARED.BOD.XS(-2400), OZ=SHARED.BOD.ZS(0), W=(x,y,z)=>[OX+x*MH,y*MV,OZ+z*MH], lx=x=>(x-OX)/MH, lz=z=>(z-OZ)/MH;
  const PD=PHA.D, B={x0:-PD.W-.6,x1:PD.W+.6,z0:PD.STG-.6,z1:PD.ZF+.6};
  STORE.playFrame={OX,OZ,MH,MV,B,FY:PD.FY,SY:PD.SY,W};   // the inside in its own metres (x across, z from the curtain line to the doors) and to the world, for what furnishes it
  let G=null, K=null, P=null, SO=[], DS=[], ENV=null, MIR=[], LT={}, t0=0;
  const build=()=>{ '@playhouse';
    G=new THREE.Group(); G.name='playhouse-in'; G.position.set(OX,0,OZ); G.scale.set(MH,MV,MH); scene.add(G);
    const TX=PHT.make(); K=PHK.make(TX); K.you=()=>({x:lx(pos.x),y:SHARED.py/MV,z:lz(pos.z)}); K.MH=MH; K.MV=MV; G.add(K.G); try{ PHA.make(K); PHS.make(K); for(const p of PHX.parts)if(p.make)p.make(K); }catch(e){ console.error('playhouse build',e); }
    // the house lights: the great chandelier, the sconces down the walls, the foyer's two (each a lamp of its own, dimmed by the show)
    const lamp=(k,p,c,i,r)=>{ const l=new THREE.PointLight(c,i,r*MH,1.4); l.userData.pool=true; l.position.set(...p); K.G.add(l); (LT[k]=LT[k]||[]).push({l,i}); return l; };
    lamp('house',[K.chandelier[0],K.chandelier[1]-.2,K.chandelier[2]],0xffcf90,50,40); for(const s of [-1,1])lamp('house',[s*8,6,8.3],0xffb070,9,20);
    for(const p of K.fch)lamp('foyer',p,0xffc888,15,16);
    lamp('ghost',K.ghost.at,0xfff0d0,4,16); for(const s of [-1,1])lamp('work',[s*PD.WING*.6,D.SY+5,PD.STG/2],0x8a9ccc,6,16);   // the ghost light soft up close; the wings' blue work lights keep the stage house from going black
    const hemi=new THREE.HemisphereLight(0xe8c8a0,0x24120c,.12); K.G.add(hemi); (LT.hemi=[]).push({l:hemi,i:.12});
    for(const l of Object.values(LT).flat())l.l.castShadow=false;
    // the shiny things take the hall's reflection: a cube taken once from over the stalls (again when the house lights change)
    ENV={rt:new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter}),cam:null,due:2,lvl:-1}; ENV.cam=new THREE.CubeCamera(.1*MH,80*MH,ENV.rt); ENV.cam.position.set(...W(0,6,8)); scene.add(ENV.cam);
    for(const mt of K.envMats){ mt.envMap=ENV.rt.texture; mt.needsUpdate=true; }
    // the mirrors: real reflections, drawn only while you are in the foyer
    MIR=K.mirrors.map(o=>{ const r=new Reflector(new THREE.PlaneGeometry(o.w,o.h),{textureWidth:Math.round(256*o.w/Math.max(o.w,o.h))*2,textureHeight:Math.round(256*o.h/Math.max(o.w,o.h))*2,color:0xb8bcc0,clipBias:.003});
      r.position.set(...o.at); r.rotation.y=o.ry; K.G.add(r); if(o.frame){ const f=K.box(o.w+.3,o.h+.3,.08,K.M.gold,o.at[0],o.at[1],o.at[2]-Math.cos(o.ry)*.05,{ry:o.ry}); }
      r.visible=false; return {r,zone:o.zone}; });
    // the seats: each block of each row is one thing to double-click; you sit in its free seat nearest you
    const rows={}; for(const s of K.seats){ const k=s.blk+':'+s.row; (rows[k]=rows[k]||[]).push(s); }
    for(const [k,list] of Object.entries(rows)){ const xs=list.map(s=>s.x), x0=Math.min(...xs)-.3, x1=Math.max(...xs)+.3, s0=list[0];
      K.thing('TAKE A SEAT IN THE STALLS',(x0+x1)/2,s0.y+.1,s0.z,x1-x0,1.1,.55,()=>{
        const px=lx(pos.x), pz=lz(pos.z); let best=null, bd=1e9; for(const s of list){ const d=Math.hypot(s.x-px,s.z-pz); if(d<bd){ bd=d; best=s; } } if(!best)return;
        const w=W(best.x,best.y,best.z); USE.sitAt(w[0],w[2],w[1],best.hd); },{reach:2.4,near:4}); }
    // pull a line at the lock rail: its bar flies out to the grid, or back in to its trim
    for(const s of K.fly.sets){ if(s.kind==='curtain')continue; const trim=s.y; K.thing('FLY LINE '+(s.i+1)+' · '+s.id.toUpperCase(),K.fly.rail,D.SY+1.05,s.z,.4,.6,.35,()=>{ if(PHX.show&&PHX.show.running&&PHX.show.running())return; K.flyTo(s.id,s.y<15?20.5:trim); if(SFX)SFX.play('creak',{vol:.5,vary:.3}); },{reach:1.6,near:2.6}); }
    // things: world sizes from metres
    const P2=ROOMS.part(G,()=>{ for(const t of K.things)UI.thing({...t,reach:t.reach*MH,near:t.near*MH,tall:t.tall*MV}); if(STORE.furnish&&STORE.furnish.playhouse)STORE.furnish.playhouse(STORE.playFrame); });
    SO=K.sol.map(([a,b,c,d])=>[OX+a*MH,OZ+b*MH,OX+c*MH,OZ+d*MH]); SOL.up.push(...SO);
    t0=performance.now(); P=P2; return P2; };
  const D={SY:1.1};
  const unbuild=()=>{ '@later'; for(const r of SO.concat(DS)){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } SO=[]; DS=[]; for(const p of PHX.parts)if(p.drop&&K)p.drop(K);
    if(ENV){ ENV.rt.dispose(); if(ENV.cam)ENV.cam.removeFromParent(); ENV=null; } for(const o of MIR)o.r.dispose(); MIR=[]; LT={};
    if(G){ G.traverse(c=>{ if(c.geometry)c.geometry.dispose(); }); G.removeFromParent(); G=null; } K=null; P=null; };
  const inside=()=>!!K&&ROOMS.offIn&&ROOMS.offIn()==='playhouse';
  UI.camKeeps.push((c,t)=>{ if(!inside()||!UI.persp)return; const zf=OZ+(PD.ZF-.3)*MH, xw=(PD.W-.3)*MH; if(lz(t.z)>PD.Z1&&c.z>zf)c.z=zf; if(lz(t.z)>PD.Z1)c.x=Math.max(OX-xw,Math.min(OX+xw,c.x)); });   // in the foyer the camera stays off the front wall and its doors
  // the ground inside: each region's height (the stage, the steps, the rake, the foyer)
  const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ if(K&&x>OX+B.x0*MH&&x<OX+B.x1*MH&&z>OZ+B.z0*MH&&z<OZ+B.z1*MH){ const y=K.groundAt(lx(x),lz(z)); return (y==null?PD.FY:y)*MV; } return sg0?sg0(x,z):null; };
  const door=at(m,L.y1+.25), out=at(m,L.y1+.9);
  ROOMS.off.playhouse={name:'THE PLAYHOUSE',box:{x0:OX+B.x0*MH,z0:OZ+B.z0*MH,x1:OX+B.x1*MH,z1:OZ+B.z1*MH,y0:-3*MV,y1:26*MV},noCeil:true,clearAir:true,need:()=>LOAD('playhouse'),build,unbuild,
    spawn:[...(p=>[p[0],p[2]])(W(0,0,PD.ZF-1.4)),0,PI],out:[...out,0,TP.hd(0)],door:[door[0],0,door[1]],exit:W(0,PD.FY,PD.ZF-.1),exitName:'OUT TO '+SECTIONS.streets.west};
  STORE.places.push(['THE PLAYHOUSE',...(p=>[p[0],p[2]])(W(0,0,PD.ZF-1.4)),'up','off',PI]);
  ROOMS.reset&&ROOMS.reset();
  // each frame while you are inside: the bars that are flying, the parts' own work, the mirrors while you are in the foyer, the reflection when it is due
  SYS.add('places',dt=>{ if(!K)return; const now=performance.now(), inn=inside(); if(G&&G.visible!==inn)G.visible=inn; K.flyStep(dt); for(const p of PHX.parts)if(p.tick)p.tick(dt,K,now,inn); if(K.shadowDue){ K.shadowDue=false; renderer.shadowMap.needsUpdate=true; }
    if(K.solDirty&&K.sets){ K.solDirty=false; for(const r of DS){ const i=SOL.up.indexOf(r); if(i>=0)SOL.up.splice(i,1); } DS=K.sets.solids().map(([a,b,c,d])=>[OX+a*MH,OZ+b*MH,OX+c*MH,OZ+d*MH]); SOL.up.push(...DS); }
    if(!inn){ for(const o of MIR)o.r.visible=false; return; }
    HEMI.intensity*=.2; if(CLOCK.sun)CLOCK.sun.intensity*=.1;   // inside, the sky's light and the sun come in dim: the house is lit by its own lamps
    const px=lx(pos.x), pz=lz(pos.z), zone=pz>PD.Z1&&Math.abs(px)<PD.W+.2?'foyer':'';
    for(const o of MIR)o.r.visible=o.zone===zone;
    const hl=PHX.houseLevel!=null?PHX.houseLevel:1; for(const k of ['house','foyer','hemi'])for(const e of LT[k]||[])e.l.intensity=e.i*(k==='house'?hl:k==='hemi'?.12+.88*hl:.4+.6*hl);
    for(const e of LT.ghost||[]){ const on=!(PHX.show&&PHX.show.running&&PHX.show.running()); e.l.intensity=on?e.i:0; if(K.ghost)K.ghost.g.visible=on; }
    if(ENV){ ENV.due-=dt; if(ENV.due<=0&&(ENV.lvl<0||Math.abs(hl-ENV.lvl)>.05)){ ENV.lvl=hl; ENV.due=1; const vis=MIR.map(o=>o.r.visible); for(const o of MIR)o.r.visible=false; ENV.cam.update(renderer,scene); MIR.forEach((o,i)=>o.r.visible=vis[i]); } } },'151z-playhouse');
  window.PHDBG=()=>({built:!!K,inside:inside(),seats:K?K.seats.length:0,things:K?K.things.length:0,solids:SO.length,sets:K?K.fly.sets.map(s=>[s.id,+s.y.toFixed(2)]):[],mirrors:MIR.map(o=>[o.zone,o.r.visible]),
    tris:G?(()=>{ let n=0; G.traverse(c=>{ if(c.isMesh&&c.geometry){ const g=c.geometry, k=(g.index?g.index.count:g.attributes.position.count)/3; n+=c.isInstancedMesh?k*c.count:k; } }); return Math.round(n); })():0,
    W:(x,y,z)=>W(x,y,z),curtain:t=>K&&K.cloth&&K.cloth.curtain&&K.cloth.curtain.set(t),fly:(id,y)=>K&&K.flyTo(id,y),run:f=>f(K,PHX),showAt:()=>null,look:(x,z,hd,pt,view)=>{ if(view)UI.setView(view); const w=W(x,0,z); UI.goTo(w[0],w[2],0,hd); SHARED.heading=hd; SHARED.yaw=SHARED.yawTo=hd+PI; SHARED.pitch=SHARED.pitchTo=pt; },L:(x,z)=>[lx(x),lz(z)],ground:(x,z)=>K&&K.groundAt(x,z)});
});

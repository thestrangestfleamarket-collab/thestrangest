// ---- THE STREET DRESSED (owner, 17 Oct 2026: "start fleshing it out with our available assets to make it come to life"): the city kit's pieces
// (kit.js) set along the street as a New York block has them: dumpsters and trash in the gap by the apartment house, cans and bags at the kerb,
// a bus stop and bollards on the far sidewalk, a street light and a traffic light, cones round the subway stairs, a hoarding and a fence on the
// far side with graffiti, jersey barriers at the street's end; and PIGEONS (code-made, as the game's were: a body, a head, a tail), pecking
// about the sidewalk and the road, walking a few steps, and taking off in a flurry when anyone comes near, to land somewhere else ----
const DRESS={pigeons:[]};
{ const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null, zf=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
  const sw=zc-.5, far=zf+.6, AX=BOD.X(MODS.apts.A.x1), AX0=BOD.X(MODS.apts.A.x0), BX0=BOD.X(BOD.B0.x0);   // the kerb, the far kerb; the house's east wall, the bodega's west wall
  const P=(n,x,z,o)=>KIT.put(n,x,z,{solid:true,...o});
  // the gap between the house and the subway stairs: the dumpsters, a trash pile, bags
  P('dumpster_full_lid_open',AX+1.3,sw-2.6,{rot:Math.PI/2,m:2.2,name:'DUMPSTER'}); P('dumpster_lid_closed',AX+1.3,sw-.4,{rot:Math.PI/2,m:1.7,name:'DUMPSTER'}); P('trashpile_1',AX+2.6,sw-1.6,{m:.3,solid:false}); P('trashbag_3',AX+2.4,sw-.3,{m:.35,solid:false});
  // at the kerb: cans and bags, as the block puts them out
  P('metaltrashcan_overflowing',BX0-1.2,sw,{rot:.4,m:1.1,name:'TRASH CAN'}); P('trashbag_1',BX0-.5,sw+.1,{rot:1.1,m:.8,solid:false}); P('trashbag_2',BX0-1.9,sw+.05,{rot:-.6,m:.9,solid:false});
  P('trash_can_full',AX0-1.5,sw,{rot:-.3,m:1.4,name:'TRASH CAN'}); P('metaltrashcan_closed',BOUND.x1-2.2,sw,{m:1.0,name:'TRASH CAN'}); P('trashbag_1',BOUND.x1-3.0,sw,{rot:2,m:.8,solid:false});
  // the far sidewalk: the bus stop, bollards along its kerb, a street light, the hoarding with graffiti, a fence, jersey barriers at the end
  P('busstop_graffiti',xm-6,far+1.6,{rot:Math.PI,m:3.0,name:'BUS STOP'}); P('busstop_bench',xm-6,far+1.2,{rot:Math.PI,m:.9,name:'BENCH'});
  for(let i=0;i<5;i++)P('retro_bollard',xm-1+i*2.2,far+.3,{m:1.0});
  P('street_light',xm+9,far+.4,{rot:Math.PI,m:6.2,name:'STREET LIGHT'}); P('traffic_light',BOUND.x0+2.2,sw+.2,{rot:0,m:5.4,name:'TRAFFIC LIGHT'});
  P('plackard_closed_full',BOUND.x1-6,far+2.6,{rot:0,m:2.6,name:'HOARDING'}); P('graffiti',BOUND.x1-6,far+2.45,{m:1.3,solid:false}); P('plackard_open',BOUND.x1-9.4,far+2.6,{m:2.6});
  P('wooden_fence_closed',BOUND.x0+4,far+2.8,{m:1.3}); P('wooden_fence_closed',BOUND.x0+6.3,far+2.8,{m:1.3}); P('metalfence_both_sides_topbar',BOUND.x0+9.2,far+2.8,{m:1.7});
  P('Jersey_barrier',BOUND.x0+1.4,zc+1.6,{rot:Math.PI/2,m:1.1}); P('Jersey_barrier',BOUND.x0+1.4,zc+4.2,{rot:Math.PI/2,m:1.1});
  // cones round the subway stairs' opening
  { const S=MAPSTAIR, sx=(S.x0-72)*TILE, sx1=(S.x1-72)*TILE, sz=(S.y0+77)*TILE; P('Traffic_cone_round',sx-.45,sz-.3,{m:.6,solid:false}); P('Traffic_cone_round',sx1+.45,sz-.3,{m:.6,solid:false}); P('Construction_cone',sx-.45,sz+2.2,{m:.75,solid:false}); }
  // the 1980s model from the owner's folder, on the sidewalk by the house for now
  P('eighties',AX0+2.2,sw-2.2,{rot:.3,m:1.4,name:'THE EIGHTIES'});
  // ---- THE PIGEONS: each three boxes coloured (grey or pale, a dark head, a tail), on the sidewalk or the road; peck, step, startle, fly, land
  const col=(g,c)=>{ const n=g.attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){ a[i*3]=c[0]; a[i*3+1]=c[1]; a[i*3+2]=c[2]; } g.setAttribute('color',new THREE.BufferAttribute(a,3)); return g; };
  const pmat=new THREE.MeshLambertMaterial({vertexColors:true}), YS=ZU*24/TILE;
  const mkPigeon=pale=>{ const body=new THREE.Mesh(col(new THREE.BoxGeometry(.13,.1,.2),pale?[.66,.66,.68]:[.42,.42,.48]), pmat), head=new THREE.Mesh(col(new THREE.BoxGeometry(.07,.07,.07),pale?[.5,.5,.55]:[.25,.25,.32]),pmat), beak=new THREE.Mesh(col(new THREE.BoxGeometry(.02,.02,.04),[.9,.6,.3]),pmat), tail=new THREE.Mesh(col(new THREE.BoxGeometry(.1,.03,.09),pale?[.5,.5,.52]:[.3,.3,.34]),pmat), wl=new THREE.Mesh(col(new THREE.BoxGeometry(.14,.02,.12),pale?[.58,.58,.6]:[.36,.36,.42]),pmat), wr=wl.clone();
    body.position.y=.09; head.position.set(0,.16,.1); beak.position.set(0,.15,.145); tail.position.set(0,.1,-.13); wl.position.set(-.1,.12,0); wr.position.set(.1,.12,0); const g=new THREE.Group(); g.add(body,head,beak,tail,wl,wr); g.scale.set(1.3,1.3*YS,1.3); for(const m of [body,head,tail])m.castShadow=true; return {g,head,wl,wr,body}; };
  const lane=()=>{ const u=Math.random(); return u<.6?[BOUND.x0+2+Math.random()*(BOUND.x1-BOUND.x0-4),zc-.3-Math.random()*2.2]:u<.85?[BOUND.x0+2+Math.random()*(BOUND.x1-BOUND.x0-4),zc+.6+Math.random()*(zf-zc-1.2)]:[xm-8+Math.random()*16,far+.5+Math.random()*1.5]; };
  for(let i=0;i<9;i++){ const p=mkPigeon(i%3===0), [x,z]=lane(); p.g.position.set(x,G(x,z),z); p.g.rotation.y=Math.random()*6.28; MAPG.bodega.add(p.g); DRESS.pigeons.push({...p,x,z,h:p.g.rotation.y,t:Math.random()*5,st:'peck',wait:1+Math.random()*3,fly:null,ph:0}); }
  DRESS.tick=(dt,you)=>{ const near=(x,z,r)=>Math.hypot(you.x-x,you.z-z)<r||(typeof NPCS!=='undefined'&&NPCS.some(N=>N.st&&Math.hypot(N.st.x-x,N.st.z-z)<r));
    for(const p of DRESS.pigeons){ p.t+=dt; p.ph+=dt;
      if(p.st!=='fly'&&near(p.x,p.z,2.2)){ const [x,z]=lane(); p.fly={x0:p.x,z0:p.z,x1:x,z1:z,t:0,T:1.6+Math.hypot(x-p.x,z-p.z)*.12}; p.st='fly'; p.h=Math.atan2(x-p.x,z-p.z); }
      if(p.st==='fly'){ const f=p.fly; f.t+=dt; const u=Math.min(1,f.t/f.T), e=u<.5?2*u*u:1-2*(1-u)*(1-u); p.x=f.x0+(f.x1-f.x0)*e; p.z=f.z0+(f.z1-f.z0)*e; const hgt=Math.sin(u*Math.PI)*2.6*(1+.3*Math.sin(p.ph*7));
        p.g.position.set(p.x,G(p.x,p.z)+hgt,p.z); p.g.rotation.y=p.h; const fl=Math.sin(p.ph*22)*.9; p.wl.rotation.z=fl; p.wr.rotation.z=-fl; p.body.rotation.x=-.3; if(u>=1){ p.st='peck'; p.wait=1+Math.random()*3; p.wl.rotation.z=p.wr.rotation.z=0; p.body.rotation.x=0; } continue; }
      if(p.st==='walk'){ p.x+=Math.sin(p.h)*.5*dt; p.z+=Math.cos(p.h)*.5*dt; p.g.position.set(p.x,G(p.x,p.z),p.z); p.head.position.z=.1+.03*Math.sin(p.ph*14); if((p.wait-=dt)<=0){ p.st='peck'; p.wait=1+Math.random()*3; } }
      else{ p.head.position.y=.16-(Math.sin(p.ph*5)>.6?.06:0); if((p.wait-=dt)<=0){ p.st='walk'; p.h+=(Math.random()-.5)*2; p.g.rotation.y=p.h; p.wait=.5+Math.random()*1.5; } } } }; }

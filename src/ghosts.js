// ---- GHOST STREET'S GHOSTS (owner, 18 Oct 2026: "i want to add ghost in the game just floating sheets, realistic phyics, see through, they hang
// aruond the ghost street dojo, inside and outside, never strayig too far"; then "they need to look like ghost shapes, see through a little",
// "smaller cuter"): six little white sheet ghosts (some 0.8 m, a round head, the sheet belling out to a hem that floats half a metre up, two big
// round eyes and a small round mouth, a little see-through), each a real cloth: a 9 x 9 grid of points
// (Verlet: gravity, a little air, its threads held to their length and across the diagonals, eight passes a step) draped over what's under it, an
// unseen head and shoulders that float; the sheet rests on them by contact (pushed out of them, carried by them where it touches: friction; its middle on the crown), so as
// the head drifts, turns and bobs the cloth drags after it, its hem trailing and swinging, folding on itself as it settles; you (or anyone near)
// walking through one push the cloth aside. Two dark eyes on the cloth's front over the head. See-through (the world's lit material, its flat bands,
// at half its opacity, both sides). Each drifts slowly between spots in the dojo's hall and its forecourt (inside a while, out a while), turning to
// look about, never past the forecourt's edge; through the walls if its way runs there (they're ghosts). Only simulated while you're on the street
// within 45 tiles; drawn only in the picture. Cost: some 150 triangles a ghost (900 the six), one program (the world's Lambert), no light;
// 6 x 121 points, some 0.15 ms a frame here ----
const GHOSTS=window.GHOSTS={list:[]};
GHOSTS.init=()=>{ if(typeof BOD==='undefined'||!BOD.GD)return; const X=BOD.X, Z=BOD.Z, MH=TILE/.84, MV=BOD.YS(24)/.84;   // (a metre across and up)
  const [a0,b0,a1,b1]=BOD.GD.r, Y1=BOD.GD.door[1], fy=Z(Y1)>Z((b0+b1)/2)?1:-1;   // (fy: which way the forecourt lies in the world's z)
  // where they may be, in metres on the world's plan: the hall (a little in from its walls) and the forecourt (the dojo's width, 4 tiles out)
  const mx=v=>v/MH, ix0=mx(Math.min(X(a0),X(a1)))+.6, ix1=mx(Math.max(X(a0),X(a1)))-.6, iz0=mx(Math.min(Z(b0),Z(b1)))+.6, iz1=mx(Math.max(Z(b0),Z(b1)))-.6;
  const fz0=mx(Z(Y1))+fy*.5, fz1=mx(Z(Y1+4*fy))-fy*.3, FZ0=Math.min(fz0,fz1), FZ1=Math.max(fz0,fz1);
  const spot=inside=>inside?[ix0+Math.random()*(ix1-ix0),iz0+Math.random()*(iz1-iz0)]:[ix0-1+Math.random()*(ix1-ix0+2),FZ0+Math.random()*(FZ1-FZ0)];
  const N=13, R=.72, G=-3.2, DAMP=.985, REST=[], MID=(N*N>>1)*3;   // (a sheet 1.9 m across; gravity eased a little: cloth in air)
  // the grid's threads: along, across, and both diagonals (shear), each with its rest length from the flat sheet
  // (a round sheet: only the grid's points inside its circle are cloth; the corners left out, so its hem is a round one)
  const IN=(i,j)=>Math.hypot(i/(N-1)*2-1,j/(N-1)*2-1)<=1.02;
  const OUTK=[]; for(let j=0;j<N;j++)for(let i=0;i<N;i++)if(!IN(i,j))OUTK.push((j*N+i)*3);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){ if(!IN(i,j))continue; const k=j*N+i; for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1],[2,0],[0,2]]){ const i2=i+di, j2=j+dj; if(i2<0||i2>=N||j2<0||j2>=N||!IN(i2,j2))continue; REST.push([k,j2*N+i2,Math.hypot(di,dj)*2*R/(N-1),di===2||dj===2?.3:1]); } }
  const idx=[]; for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){ if(!IN(i,j)||!IN(i+1,j)||!IN(i,j+1)||!IN(i+1,j+1))continue; const a=j*N+i, b=a+1, c=a+N, d=c+1; idx.push(a,c,b,b,c,d); }
  const mat=new THREE.MeshLambertMaterial({color:0xf4f2ec,emissive:0x5a6070,transparent:true,opacity:.78,side:THREE.DoubleSide,depthWrite:false});
  const eyeM=new THREE.MeshBasicMaterial({color:0x101014,transparent:true,opacity:.85}), eyeG=new THREE.CircleGeometry(1,10).scale(.055*MH,.08*MV,1), mouthG=new THREE.CircleGeometry(1,8).scale(.035*MH,.03*MV,1);
  const HR=.27, SR=.36, SD=.28;   // (the head's round, the shoulders' round below it)
  for(let g=0;g<6;g++){ const [sx,sz]=spot(g%2===0);
    const P=new Float32Array(N*N*3), O=new Float32Array(N*N*3), hy=.92+Math.random()*.12;
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const u=(i/(N-1))*2-1, v=(j/(N-1))*2-1, k=(j*N+i)*3, r=Math.hypot(u,v)*R, a=Math.atan2(v,u), d=Math.min(r,HR*1.5);   // (laid over the head: its middle on top, the rest falling round)
      P[k]=sx+Math.cos(a)*d; P[k+1]=hy+HR-Math.max(0,r-d)*.9-(d/HR/1.5)*.12; P[k+2]=sz+Math.sin(a)*d; }
    O.set(P);
    const geo=new THREE.BufferGeometry(), pos=new THREE.BufferAttribute(new Float32Array(N*N*3),3); geo.setAttribute('position',pos); geo.setIndex(idx);
    const me=new THREE.Mesh(geo,mat); me.frustumCulled=false; me.renderOrder=3; scene.add(me);
    const eyes=[0,1,2].map(i=>{ const e=new THREE.Mesh(i<2?eyeG:mouthG,eyeM); e.renderOrder=4; scene.add(e); return e; });
    GHOSTS.list.push({P,O,geo,pos,me,eyes,h:{x:sx,y:hy,z:sz},v:{x:0,z:0},yaw:Math.random()*6.28,yawTo:0,to:spot(g%2===0),wait:2+Math.random()*6,in:g%2===0,t:Math.random()*10,hy}); }
  // the cloth's step: gravity and air, the head's and shoulders' contact (carrying the cloth that touches), anyone near pushing it, the threads held
  const others=[]; let acc=0;
  const step=(G1,h)=>{ const {P,O}=G1, H=G1.h, d=G1.dh, Sy=H.y-SD;
    for(let k=0;k<P.length;k+=3){ const x=P[k], y=P[k+1], z=P[k+2]; P[k]=x+(x-O[k])*DAMP; P[k+1]=y+(y-O[k+1])*DAMP+G*h*h; P[k+2]=z+(z-O[k+2])*DAMP; O[k]=x; O[k+1]=y; O[k+2]=z; }
    for(let it=0;it<8;it++){
      for(const [a,b,L,s] of REST){ const ia=a*3, ib=b*3, dx=P[ib]-P[ia], dy=P[ib+1]-P[ia+1], dz=P[ib+2]-P[ia+2], l=Math.hypot(dx,dy,dz)||1e-6; let f=(l-L)/l*.5*s; if(l<L){ if(s<1)continue; f*=.15; }   // (cloth: hard to stretch, easy to bunch, so it hangs in a bell and folds; the long threads only keep it from stretching)
        P[ia]+=dx*f; P[ia+1]+=dy*f; P[ia+2]+=dz*f; P[ib]-=dx*f; P[ib+1]-=dy*f; P[ib+2]-=dz*f; }
      for(let k=0;k<P.length;k+=3){
        for(const [cy,cr] of [[H.y,HR],[Sy,SR]]){ const dx=P[k]-H.x, dy=P[k+1]-cy, dz=P[k+2]-H.z, l=Math.hypot(dx,dy*(cy===H.y?1:1.6),dz); if(l<cr+.025){ const s=(cr+.025)/(l||1e-6);
          P[k]=H.x+dx*s; P[k+1]=cy+dy*s; P[k+2]=H.z+dz*s; O[k]+=(P[k]-d.x-O[k])*.6; O[k+1]+=(P[k+1]-d.y-O[k+1])*.6; O[k+2]+=(P[k+2]-d.z-O[k+2])*.6; } }   // (friction: what touches him goes with him, its slide there mostly stopped)
        for(const o of others){ const dx=P[k]-o.x, dz=P[k+2]-o.z, l=Math.hypot(dx,dz); if(l<.3&&P[k+1]<o.y){ const s=.3/(l||1e-6); P[k]=o.x+dx*s; P[k+2]=o.z+dz*s; } }   // (you walking through: pushed aside)
        if(P[k+1]<.05)P[k+1]=.05; }
      P[MID]=H.x; P[MID+1]=H.y+HR+.025; P[MID+2]=H.z; for(const k of OUTK){ P[k]=P[MID]; P[k+1]=P[MID+1]; P[k+2]=P[MID+2]; }   /* (the corners not cloth: kept out of the way at his crown) */ } };   // (the sheet's middle stays on his crown, as a sheet over a head does)
  const V=new THREE.Vector3();
  GHOSTS.tick=dt=>{ if(!dt||!GHOSTS.list.length)return; const near=LVL!=='down'&&Math.hypot(pos.x/MH-(ix0+ix1)/2,pos.z/MH-(iz0+iz1)/2)<45*.84;
    for(const G1 of GHOSTS.list){ G1.me.visible=near; for(const e of G1.eyes)e.visible=near; }
    if(!near)return;
    others.length=0; others.push({x:pos.x/MH,z:pos.z/MH,y:(py/MV)+1.7}); if(typeof NPCS!=='undefined')for(const N1 of NPCS){ if(N1.lv!=='up'||N1.far||!N1.st)continue; const x=N1.st.x/MH, z=N1.st.z/MH; if(x>ix0-6&&x<ix1+6&&z>Math.min(iz0,FZ0)-6&&z<Math.max(iz1,FZ1)+6)others.push({x,z,y:1.6}); }
    const H=1/90; acc=Math.min(acc+dt,H*4);
    for(const G1 of GHOSTS.list){ const h0={x:G1.h.x,y:G1.h.y,z:G1.h.z}; G1.t+=dt;
      // its mind: drift to a spot, linger and look about, then the next (inside or out, now and then the other)
      const dx=G1.to[0]-G1.h.x, dz=G1.to[1]-G1.h.z, d=Math.hypot(dx,dz);
      if(d>.15){ const sp=.28, k=Math.min(1,dt*.8); G1.v.x+=((dx/d)*Math.min(sp,d*.5)-G1.v.x)*k; G1.v.z+=((dz/d)*Math.min(sp,d*.5)-G1.v.z)*k; G1.yawTo=Math.atan2(dx,dz); }
      else { G1.v.x*=1-Math.min(1,dt*2); G1.v.z*=1-Math.min(1,dt*2); if((G1.wait-=dt)<=0){ if(Math.random()<.3)G1.in=!G1.in; G1.to=spot(G1.in); G1.wait=4+Math.random()*10; } else if(Math.random()<dt*.25)G1.yawTo=Math.random()<.7?Math.atan2(cam.position.x/MH-G1.h.x,cam.position.z/MH-G1.h.z)+(Math.random()-.5)*.6:G1.yawTo+(Math.random()-.5)*2; }   // (lingering, mostly peeking your way)
      G1.h.x+=G1.v.x*dt; G1.h.z+=G1.v.z*dt; G1.h.y=G1.hy+Math.sin(G1.t*1.1)*.07+Math.sin(G1.t*.37)*.05;
      let dy=G1.yawTo-G1.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); G1.yaw+=dy*Math.min(1,dt*1.2);
      // the cloth, in fixed steps (the head's move shared out over them)
      const n=Math.max(1,Math.round(acc/H)); G1.dh={x:(G1.h.x-h0.x)/n,y:(G1.h.y-h0.y)/n,z:(G1.h.z-h0.z)/n}; const hh={...G1.h}; G1.h.x=h0.x; G1.h.y=h0.y; G1.h.z=h0.z;
      for(let s=0;s<n;s++){ G1.h.x+=G1.dh.x; G1.h.y+=G1.dh.y; G1.h.z+=G1.dh.z; step(G1,H); } G1.h.x=hh.x; G1.h.y=hh.y; G1.h.z=hh.z;
      const A=G1.pos.array, P=G1.P; for(let k=0;k<P.length;k+=3){ A[k]=P[k]*MH; A[k+1]=P[k+1]*MV; A[k+2]=P[k+2]*MH; } G1.pos.needsUpdate=true; G1.geo.computeVertexNormals();
      // the eyes: on the cloth's front over the head, where he's looking
      const fx=Math.sin(G1.yaw), fz=Math.cos(G1.yaw);
      G1.eyes.forEach((e,i)=>{ const s=i===2?0:i?1:-1, ey=G1.h.y+(i===2?-.09:.03), ex=G1.h.x+fx*(HR+.04)+fz*s*.1, ez=G1.h.z+fz*(HR+.04)-fx*s*.1; e.position.set(ex*MH,ey*MV,ez*MH); e.lookAt(V.set((ex+fx)*MH,ey*MV,(ez+fz)*MH)); }); }   // (two big round eyes and a little round mouth: cute)
    acc-=Math.max(1,Math.round(acc/H))*H; if(acc<0)acc=0; };
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); GHOSTS.tick(dt); };
  window.GHOSTDBG=()=>GHOSTS.list.map(G1=>({x:+G1.h.x.toFixed(2),z:+G1.h.z.toFixed(2),in:G1.in,hem:+Math.min(...Array.from({length:G1.P.length/3},(_,i)=>G1.P[i*3+1])).toFixed(2),vis:G1.me.visible,world:[+(G1.h.x*MH).toFixed(2),+(G1.h.z*MH).toFixed(2)]})); };

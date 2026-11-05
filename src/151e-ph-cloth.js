// THE PLAYHOUSE'S CLOTHS: the house curtain (two halves of velvet that hang, swing and are drawn up on their lift lines into swags), the festooned valance over it, the black legs and borders that mask the wings and the grid (hung from their bars, flying with them); all cloth (DRAPE), settled by their weight.
import {THREE} from './003-shx.js';
import {DRAPE} from './072a-cloth.js';
import {PHX} from './151b-ph-kit.js';
PHX.parts.push({make:K=>{ '@playhouse';
  const D=K.D, M=K.M, TX=K.TX, PI=Math.PI, SY=D.SY, C={list:[],curtain:null};
  K.cloth=C;
  // a sheet of cloth from its rest points (nx across, ny down, top row first), with its mesh; pins: which points are held
  const sheet=(nx,ny,pt,mat,o={})=>{ const X0=[]; for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)X0.push(...pt(i/(nx-1),j/(ny-1),i,j));
    const pin=new Uint8Array(nx*ny); for(const k of (o.pins||[]))pin[k]=1; const c=DRAPE.make(X0,DRAPE.grid(nx,ny,true),pin);
    const g=new THREE.PlaneGeometry(1,1,nx-1,ny-1); g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(nx*ny*3),3)); if(o.uv){ const uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*o.uv[0],uv.getY(i)*o.uv[1]); }
    const m=new THREE.Mesh(g,mat); m.castShadow=o.cast!==false; m.receiveShadow=true; m.frustumCulled=false; K.G.add(m);
    Object.assign(c,{nx,ny,me:m,o:{g:-9.8,dm:o.dm||.982,ks:o.ks||0,it:o.it||6,col:[]},awake:0,steps:0}); DRAPE.out(c,g); C.list.push(c); return c; };
  const settle=(c,n)=>{ for(let k=0;k<n;k++)DRAPE.step(c,1/60,c.o); DRAPE.out(c,c.me.geometry); };
  // the bottom row's hem: a ribbon of fringe that follows it
  const hem=(c,h,mat)=>{ const n=c.nx, g=new THREE.BufferGeometry(), P=new Float32Array(n*2*3), U=new Float32Array(n*2*2), I=[];
    for(let i=0;i<n;i++){ U.set([i/(n-1)*n/6,1,i/(n-1)*n/6,0],i*4); if(i<n-1)I.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2); }
    g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('uv',new THREE.BufferAttribute(U,2)); g.setIndex(I);
    const m=new THREE.Mesh(g,mat); m.frustumCulled=false; K.G.add(m); c.hem={m,h}; c.hemOut=()=>{ const X=c.X, b=(c.ny-1)*c.nx; for(let i=0;i<n;i++){ const a=(b+i)*3; P.set([X[a],X[a+1],X[a+2],X[a],X[a+1]-h,X[a+2]],i*6); } g.attributes.position.needsUpdate=true; g.computeVertexNormals(); }; c.hemOut(); };
  const fringeM=new THREE.MeshLambertMaterial({map:TX.fringe,alphaTest:.5,side:THREE.DoubleSide}); TX.fringe.wrapT=THREE.ClampToEdgeWrapping;

  /* ---------- the house curtain: two halves of red velvet, pleated full, a gold braid at the hem and the house's lyre worked low on each; drawn up and out on lift lines into swags ---------- */
  { const cv=TX.cv(512,1024), g=cv.getContext('2d'), vel=TX.velvet.map.image; for(let y=0;y<1024;y+=256)for(let x=0;x<512;x+=256)g.drawImage(vel,x,y);
    const band=(y,h,c)=>{ g.fillStyle=c; g.fillRect(0,1024-y-h,512,h); };
    band(30,26,'#c9a24a'); band(34,4,'#7a5a1a'); band(48,4,'#7a5a1a'); band(70,8,'#c9a24a'); for(let x=0;x<512;x+=24){ g.fillStyle='#7a5a1a'; g.fillRect(x,1024-56+6,10,10); }
    g.save(); g.translate(400,1024-190); g.strokeStyle='#d8b050'; g.lineWidth=7; g.beginPath(); g.moveTo(-34,46); g.quadraticCurveTo(-60,-30,-20,-62); g.moveTo(34,46); g.quadraticCurveTo(60,-30,20,-62); g.moveTo(-36,44); g.lineTo(36,44); g.stroke();
    g.lineWidth=3; for(let s=-16;s<=16;s+=8){ g.beginPath(); g.moveTo(s,42); g.lineTo(s*1.2,-46); g.stroke(); } g.beginPath(); g.arc(0,-6,70,0,PI*2); g.stroke(); g.restore();
    const t=TX.tex(cv), m=new THREE.MeshLambertMaterial({map:t,bumpMap:TX.velvet.bump,bumpScale:.8,side:THREE.DoubleSide});
    const top=SY+D.PH+1.3, Z=-.55, H=top-SY-.03, W=6.8, nx=36, ny=32, pleat=.48, depth=.11, halves=[];
    for(const s of [-1,1]){ const x0=s<0?-W:-.15, x1=s<0?.15:W;
      const c=sheet(nx,ny,(u,v)=>{ const x=x0+(x1-x0)*u; return [x,top-H*v,Z+depth*Math.sin((x-x0)/pleat*PI*2)]; },m,{pins:[...Array(nx).keys()],it:7,dm:.985,ks:.0015});
      if(s>0){ const uv=c.me.geometry.attributes.uv; for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i)); }
      hem(c,.22,fringeM);
      // the lift lines' rings: up the diagonal from the hem near the middle to the top at the outer edge; drawn, they gather at the pulley
      const R=[]; for(let k=0;k<9;k++){ const f=k/8, i=Math.round(s<0?(nx-1)*(1-.03-f*.87):(nx-1)*(.03+f*.87)), j=Math.round((ny-1)*(1-.04-f*.85)); R.push({i:j*nx+i,k}); }
      const pul=[s*(W-.4),top-.25,Z-.12];
      halves.push({c,s,R,pul}); }
    for(const h of halves)settle(h.c,240);
    // the lines themselves: from each ring up to the pulley, lit only by what falls on them
    const ropeM=K.col('#c8b48a'), U=new THREE.CylinderGeometry(1,1,1,4,1,true), V=new THREE.Vector3(), UP=new THREE.Vector3(0,1,0);
    for(const h of halves)h.lines=h.R.map(()=>{ const r=new THREE.Mesh(U,ropeM); r.castShadow=false; K.G.add(r); return r; });
    const seg=(m,a,b)=>{ V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]); const L=V.length()||1e-4; m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); m.quaternion.setFromUnitVectors(UP,V.normalize()); m.scale.set(.006,L,.006); };
    for(const h of halves)K.cyl(.09,.09,.08,M.steel,...h.pul,{rx:PI/2,seg:10});
    K.boxA(-W-.2,top-.06,Z-.08,W+.2,top+.06,Z+.08,M.steel);
    const CU=C.curtain={open:0,target:0,halves,top,Z,
      set:t=>{ CU.target=Math.max(0,Math.min(1,t)); },
      step:(dt,pl)=>{ const before=CU.open; if(CU.open!==CU.target){ const d=CU.target-CU.open; CU.open+=Math.sign(d)*Math.min(Math.abs(d),dt/(CU.target>CU.open?5.5:4.5)); }
        const e=CU.open<=0?0:CU.open>=1?1:CU.open*CU.open*(3-2*CU.open);
        for(const h of halves){ const c=h.c, X=c.X;
          for(const r of h.R){ const a=r.i*3;
            if(e<=0){ if(c.pin[r.i]){ c.pin[r.i]=0; r.p0=null; } continue; }
            if(!c.pin[r.i]){ c.pin[r.i]=1; r.p0=[X[a],X[a+1],X[a+2]]; }
            const k=r.k/8, g=[h.pul[0]-h.s*(.1+.06*(8-r.k)),h.pul[1]-.25-.08*(8-r.k),h.pul[2]+.05], q=Math.min(1,e*(1+.6*(1-k)));
            X[a]=r.p0[0]+(g[0]-r.p0[0])*q; X[a+1]=r.p0[1]+(g[1]-r.p0[1])*q; X[a+2]=r.p0[2]+(g[2]-r.p0[2])*q; X.set([X[a],X[a+1],X[a+2]],a); c.Xp.set([X[a],X[a+1],X[a+2]],a); }
          h.lines.forEach((m,k)=>{ const a=h.R[k].i*3; m.visible=e>0; if(e>0)seg(m,[X[a],X[a+1],X[a+2]],h.pul); });
          c.o.col.length=0; if(pl&&Math.abs(pl.z-CU.Z)<1.2&&pl.y<top)c.o.col.push({cy:1,x:pl.x,z:pl.z,r:.32,y0:pl.y-.1,y1:pl.y+1.9});
          if(CU.open!==before||c.o.col.length||c.still<90){ for(let n=Math.max(1,Math.min(3,Math.round(dt*60)));n>0;n--)DRAPE.step(c,1/60,c.o); DRAPE.out(c,c.me.geometry); c.hemOut(); } } } }; }

  if(K.prompt)K.thing('THE HOUSE CURTAIN: UP OR DOWN',K.prompt[0],K.prompt[1],K.prompt[2],1.3,.6,.9,()=>{ if(PHX.show&&PHX.show.running&&PHX.show.running())return; const c=C.curtain; c.set(c.target>.5?0:1); },{reach:1.8,near:3});

  /* ---------- the valance: a pelmet of the same velvet hung in three festoons, fringed, its tassels at the swags' ends ---------- */
  { const top=SY+D.PH+1.9, Z=-.25, W=7.4, nx=72, ny=9, h=1.25, pins=[]; for(let i=0;i<nx;i++)pins.push(i);
    const ends=[0,24,48,71]; for(const i of ends)pins.push((ny-1)*nx+i);
    const c=sheet(nx,ny,(u,v,i,j)=>{ const x=-W+2*W*u, drop=ends.includes(i)?h:h*1.12; return [x,top-drop*v,Z+.06*Math.sin(x*PI*3)]; },M.velvet,{pins,it:8,uv:[10,1.2]});
    for(const i of ends){ const a=((ny-1)*nx+i)*3; c.X[a+1]=top-h*.55; c.X0[a+1]=top-h*.55; c.Xp[a+1]=top-h*.55; }
    settle(c,400); hem(c,.18,fringeM); c.frozen=1;
    const tasM=new THREE.MeshLambertMaterial({map:TX.tassel,alphaTest:.5,side:THREE.DoubleSide});
    for(const i of ends){ const a=((ny-1)*nx+i)*3; for(const ry of [0,PI/2])K.plane(.18,.36,tasM,c.X[a],c.X[a+1]-.22,c.X[a+2]+.02,{ry}); }
    K.boxA(-W-.1,top-.05,Z-.1,W+.1,top+.12,Z+.1,M.orn); }

  /* ---------- the masking: black velvet legs either side of each wing's entrance and borders across the top, each hung from its bar ---------- */
  C.hung=[];
  for(const s of K.fly.sets){ if(s.kind==='legs'){ for(const q of [-1,1]){ const x0=q*6.0, x1=q*8.4, nx=10, ny=26, L=s.y-SY-.02;
        const c=sheet(nx,ny,(u,v)=>{ const x=x0+(x1-x0)*u; return [x,s.y-L*v,s.z+.07*Math.sin(u*PI*6)]; },M.blackVel,{pins:[...Array(nx).keys()],it:5,uv:[2,6]});
        settle(c,150); C.hung.push({c,s,dy:s.y}); } }
    if(s.kind==='border'){ const nx=40, ny=6, L=2.2; const c=sheet(nx,ny,(u,v)=>{ const x=-9.6+19.2*u; return [x,s.y-L*v,s.z+.05*Math.sin(u*PI*24)]; },M.blackVel,{pins:[...Array(nx).keys()],it:4,uv:[12,1.4]});
      settle(c,150); C.hung.push({c,s,dy:s.y}); }
    if(s.kind==='black'){ const nx=30, ny=24, L=s.y-SY+9.2; s.y=SY+9.2+.0; s.put(); const c=sheet(nx,ny,(u,v)=>{ const x=-9.6+19.2*u; return [x,s.y-(s.y-SY-.02)*v,s.z+.08*Math.sin(u*PI*30)]; },M.blackVel,{pins:[...Array(nx).keys()],it:5,uv:[14,6]});
      settle(c,150); C.hung.push({c,s,dy:s.y}); } }

},
tick:(dt,K,now,inn)=>{ '@later'; const C=K.cloth; if(!C)return; const h=Math.min(dt,1/20);
  // the player near the curtain pushes it; the hung cloths follow their bars when they fly
  let pl=null; if(inn&&K.you)pl=K.you();
  if(C.curtain)C.curtain.step(h,pl);
  for(const e of C.hung){ const dy=e.s.y-e.dy, c=e.c; if(Math.abs(dy)>1e-4){ for(let i=0;i<c.nx;i++){ c.X[i*3+1]+=dy; c.Xp[i*3+1]+=dy; } e.dy=e.s.y; c.still=0; }
    if(c.still<60){ DRAPE.step(c,1/60,c.o); DRAPE.out(c,c.me.geometry); } } }});

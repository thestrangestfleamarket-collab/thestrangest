// THE MAGIC CARPET: a woven rug (painted pixel by pixel) that floats and flies you anywhere: a real cloth (a grid of points held by its threads, weighed by gravity, held up by its magic, pushed by the air it flies through and pressed down where you sit), every player given one; others see you on it, its cloth moving the same way.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSPECT, ITEMS, keys, pos, RIDE, SPEED, st} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {TILE} from './006-map-pre.js';
import {collide} from './075-main-13.js';
const CARPET={}; window.CARPET=CARPET;
{ const T=TILE, say=(t,c)=>SAY(t,c||'#e8e2cc'), prop=(id,k)=>ITEMS.prop?ITEMS.prop(id,k):undefined, wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)), cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  FORAGE.add({names:{magic_carpet:'MAGIC CARPET'}});
  // the rug in world units: W across, L long (nose toward +z), NX by NZ points; the middle, where you sit, is held by the magic and your weight
  const W=1.3*T, L=1.9*T, NX=9, NZ=13, N=NX*NZ, dx=W/(NX-1), dz=L/(NZ-1), SIT=(i,j)=>i>=3&&i<=5&&j>=4&&j<=7, G=9*T, H=1/60;
  /* ---------- the weave: a red field, a gold and blue border, a medallion, all hard pixels ---------- */
  let TEX=null; const tex=()=>{ if(TEX)return TEX; const w=36, h=52, c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'), px=(x,y,k)=>{ g.fillStyle=k; g.fillRect(x,y,1,1); };
    const RED='#8a1c1e', RED2='#741618', GOLD='#d8a840', BLUE='#1e3a6a', IVORY='#e8dcb8', INK='#2a1210';
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const e=Math.min(x,y,w-1-x,h-1-y), cx=Math.abs(x-(w-1)/2), cy=Math.abs(y-(h-1)/2), d=cx/9+cy/13, n=((x*7+y*13)%5===0);
      let k=e<1?INK:e<3?BLUE:e<4?GOLD:e<6?((x+y)%4<2?IVORY:BLUE):e<7?GOLD:RED;
      if(e>=7){ if(d<1&&d>.82)k=GOLD; else if(d<.82&&d>.62)k=BLUE; else if(d<.62&&d>.48)k=IVORY; else if(d<.48&&d>.3)k=RED2; else if(d<.3)k=(cx+cy)%3<1?GOLD:BLUE; else if(cx>12-(cy>20?0:2)&&cy>18&&(cx+cy)%3===0)k=GOLD; else if(n)k=RED2; }
      px(x,y,k); }
    TEX=new THREE.CanvasTexture(c); TEX.colorSpace=THREE.SRGBColorSpace; TEX.magFilter=TEX.minFilter=THREE.NearestFilter; TEX.generateMipmaps=false; return TEX; };
  /* ---------- the cloth: points and threads (along, across, diagonal, and every other point for the rug's stiffness) ---------- */
  const LINKS=(()=>{ const A=[], at=(i,j)=>j*NX+i, add=(a,b,k)=>A.push([a,b,k]);
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){ if(i+1<NX)add(at(i,j),at(i+1,j),1); if(j+1<NZ)add(at(i,j),at(i,j+1),1); if(i+1<NX&&j+1<NZ){ add(at(i,j),at(i+1,j+1),.7); add(at(i+1,j),at(i,j+1),.7); } if(i+2<NX)add(at(i,j),at(i+2,j),.35); if(j+2<NZ)add(at(i,j),at(i,j+2),.35); }
    return A; })();
  const REST=new Float32Array(N*3); for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){ const p=(j*NX+i)*3; REST[p]=-W/2+i*dx; REST[p+1]=0; REST[p+2]=-L/2+j*dz; }
  for(const k of LINKS){ const a=k[0]*3, b=k[1]*3; k.push(Math.hypot(REST[a]-REST[b],REST[a+2]-REST[b+2])); }
  // a new rug: its mesh in local units (the group turned to the rider's heading only), its points kept in world space
  const make=()=>{ const geo=new THREE.BufferGeometry(), P=new Float32Array(N*3), UV=new Float32Array(N*2), I=[];
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){ const v=j*NX+i; UV[v*2]=i/(NX-1); UV[v*2+1]=j/(NZ-1); if(i+1<NX&&j+1<NZ){ const a=v, b=v+1, c=v+NX, d=v+NX+1; I.push(a,c,b,b,c,d); } }
    P.set(REST); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('uv',new THREE.BufferAttribute(UV,2)); geo.setIndex(I); geo.computeVertexNormals();
    const rug=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:tex(),side:THREE.DoubleSide})); rug.frustumCulled=false;
    // the tassels at both short ends: a short thread from each edge point, hanging back from the way it moves
    const EDGE=[]; for(let i=0;i<NX;i++){ EDGE.push(i); EDGE.push((NZ-1)*NX+i); } const tp=new Float32Array(EDGE.length*6), tg=new THREE.BufferGeometry(); tg.setAttribute('position',new THREE.BufferAttribute(tp,3));
    const tas=new THREE.LineSegments(tg,new THREE.LineBasicMaterial({color:0xd8b860})); tas.frustumCulled=false;
    const Gp=new THREE.Group(); Gp.add(rug,tas); Gp.userData.C={geo,P,tg,tp,EDGE,x:null,o:null,t:null,acc:0,ox:0,oy:0,oz:0,hd:0,vx:0,vy:0,vz:0,bank:0,pitch:0}; return Gp; };
  // a step of the cloth: the sitting patch follows the rug's frame (tilted with its bank and climb, pressed down by you); the rest falls, is held up and pushed by the air
  const step=(C,h,t)=>{ const x=C.x, o=C.o, c=Math.cos(C.hd), s=Math.sin(C.hd), cb=Math.cos(C.bank), sb=Math.sin(C.bank), cp=Math.cos(C.pitch), sp=Math.sin(C.pitch), sp2=Math.hypot(C.vx,C.vz);
    const frame=(lx,lz,dy,out,k)=>{ const y1=lx*sb+lz*sp+dy, x1=lx*cb, z1=lz*cp; out[k]=C.ox+x1*c+z1*s; out[k+1]=C.oy+y1; out[k+2]=C.oz-x1*s+z1*c; }, F=[0,0,0];
    for(let v=0;v<N;v++){ const p=v*3, i=v%NX, j=(v/NX)|0, lx=REST[p], lz=REST[p+2];
      if(SIT(i,j)){ frame(lx,lz,-.035*T,x,p); o[p]=x[p]-C.vx*h; o[p+1]=x[p+1]-C.vy*h; o[p+2]=x[p+2]-C.vz*h; continue; }
      const edge=Math.min(1,Math.max(Math.abs(i-4)/4,Math.abs(j-5.5)/5.5)), wave=Math.sin(t*2.3-lz/T*3.1+lx/T*.8)*.03*T*edge*(1-Math.min(1,sp2/(4*T))*.5); frame(lx,lz,wave,F,0);
      const vx=(x[p]-o[p])/h, vy=(x[p+1]-o[p+1])/h, vz=(x[p+2]-o[p+2])/h;
      // gravity, all but a tenth of it borne by the magic, and a spring of magic toward the rug's plane; the air drags what moves through it
      let ay=-G*.1+(F[1]-x[p+1])*70-vy*6, ax=(F[0]-x[p])*(edge<.6?1.5:.4)-vx*.8, az=(F[2]-x[p+2])*(edge<.6?1.5:.4)-vz*.8;
      // the air flowing over the rug lifts and flaps its free edges, more the faster it flies
      if(sp2>.3*T){ const f=Math.sin(t*(9+sp2/T*.8)+j*.9+i*.5)*sp2*2.4*edge*edge; ay+=f; }
      const nx=2*x[p]-o[p]+ax*h*h, ny=2*x[p+1]-o[p+1]+ay*h*h, nz=2*x[p+2]-o[p+2]+az*h*h; o[p]=x[p]; o[p+1]=x[p+1]; o[p+2]=x[p+2]; x[p]=nx; x[p+1]=Math.max(C.gy+.02*T,ny); x[p+2]=nz; }
    for(let it=0;it<6;it++)for(const [a,b,k,r] of LINKS){ const A=a*3, B=b*3, ex=x[B]-x[A], ey=x[B+1]-x[A+1], ez=x[B+2]-x[A+2], d=Math.hypot(ex,ey,ez)||1e-6, e=(d-r)/d*.5*k;
      const pa=SIT(a%NX,(a/NX)|0), pb=SIT(b%NX,(b/NX)|0); if(pa&&pb)continue; const wa=pa?0:pb?2:1, wb=pb?0:pa?2:1;
      x[A]+=ex*e*wa; x[A+1]+=ey*e*wa; x[A+2]+=ez*e*wa; x[B]-=ex*e*wb; x[B+1]-=ey*e*wb; x[B+2]-=ez*e*wb; } };
  // each frame, for yours and theirs alike: the frame's motion read from where the group is, the cloth stepped at 60 a second, the mesh written in the group's own units
  const place=(m,R,t)=>{ const C=m.userData.C; if(!C)return; if(m.parent&&R===RIDE)CARPET.last=m; const ox=m.position.x, oy=m.position.y, oz=m.position.z, hd=m.rotation.y, gy=SHARED.groundY?SHARED.groundY(ox,oz):oy-1;
    if(!C.x||C.t==null||t-C.t>3||Math.hypot(ox-C.ox,oz-C.oz)>8*T){ C.ox=ox; C.oy=oy; C.oz=oz; C.hd=hd; C.vx=C.vy=C.vz=0; C.x=new Float32Array(N*3); C.o=new Float32Array(N*3); for(let v=0;v<N;v++){ const p=v*3, c=Math.cos(hd), s=Math.sin(hd); C.x[p]=C.o[p]=ox+REST[p]*c+REST[p+2]*s; C.x[p+1]=C.o[p+1]=oy; C.x[p+2]=C.o[p+2]=oz-REST[p]*s+REST[p+2]*c; } C.t=t; }
    const dt=Math.min(.1,t-C.t); C.t=t; if(dt<=0)return; const k=Math.min(1,dt*6), turn=wrap(hd-C.hd)/dt;
    C.vx+=((ox-C.ox)/dt-C.vx)*k; C.vy+=((oy-C.oy)/dt-C.vy)*k; C.vz+=((oz-C.oz)/dt-C.vz)*k;
    const sp=Math.hypot(C.vx,C.vz); C.bank+=(cl(-turn*sp/T*.05,-.22,.22)-C.bank)*k; C.pitch+=(cl(C.vy/T*.05,-.18,.18)+(R.v?-cl(sp/T*.006,0,.05):0)-C.pitch)*k; C.gy=gy;
    const n=Math.min(6,Math.round((C.acc+=dt)/H)); C.acc-=n*H; for(let q=1;q<=n;q++){ const u=q/n; C.ox+=(ox-C.ox)*(1/(n-q+1)); C.oy+=(oy-C.oy)*(1/(n-q+1)); C.oz+=(oz-C.oz)*(1/(n-q+1)); C.hd=wrap(C.hd+wrap(hd-C.hd)*(1/(n-q+1))); step(C,H,t-dt*(1-u)); }
    C.ox=ox; C.oy=oy; C.oz=oz; C.hd=hd;
    const P=C.P, x=C.x, c=Math.cos(hd), s=Math.sin(hd), S=m.scale.x||1; for(let v=0;v<N;v++){ const p=v*3, wx=x[p]-ox, wy=x[p+1]-oy, wz=x[p+2]-oz; P[p]=(wx*c-wz*s)/S; P[p+1]=wy/S; P[p+2]=(wx*s+wz*c)/S; }
    C.geo.attributes.position.needsUpdate=true; C.geo.computeVertexNormals();
    const tp=C.tp, fl=Math.min(1,sp/(5*T)), back=-.13*T*fl/S, L0=.13*T/S; C.EDGE.forEach((v,e)=>{ const p=v*3, end=v<NX?-1:1, q=e*6, sw=Math.sin(t*2.6+e*1.7)*.025*T/S, sx=Math.sin(t*2.1+e*2.3)*.015*T/S; tp[q]=P[p]; tp[q+1]=P[p+1]; tp[q+2]=P[p+2]; tp[q+3]=P[p]+sx; tp[q+4]=P[p+1]-L0*(1-.55*fl); tp[q+5]=P[p+2]+end*.012*T/S+back+sw; });   // the tassels hang from the ends and sway; flying, they trail back (owner, 9 Nov 2026: "the strings at end of rug should be dangling")
    C.tg.attributes.position.needsUpdate=true; };
  // carried: rolled up, its tassels at both ends
  const rolled=()=>{ const g=new THREE.Group(), t=tex().clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,3);
    const r=new THREE.Mesh(new THREE.CylinderGeometry(.11*T,.11*T,W,14,1),new THREE.MeshLambertMaterial({map:t})); r.rotation.z=Math.PI/2; g.add(r);
    for(const e of [-1,1]){ const f=new THREE.Mesh(new THREE.CylinderGeometry(.1*T,.06*T,.08*T,10,1,true),new THREE.MeshLambertMaterial({color:0xd8b860,side:THREE.DoubleSide})); f.rotation.z=Math.PI/2; f.position.x=e*(W/2+.04*T); g.add(f); } return g; };
  // a test's look at the cloth: whole, how rough, how wide (in tiles), and where you are
  CARPET.dbg=()=>{ const m=CARPET.last, C=m&&m.userData.C; if(!C||!C.x)return {x:pos.x/T,z:pos.z/T}; const x=C.x; let fin=true, lo=1e9, hi=-1e9, span=0; for(let i=0;i<x.length;i++)if(!isFinite(x[i]))fin=false;
    for(let i=1;i<x.length;i+=3){ lo=Math.min(lo,x[i]); hi=Math.max(hi,x[i]); } for(let j=0;j<NZ;j++){ const a=j*NX*3, c=(j*NX+NX-1)*3; span=Math.max(span,Math.hypot(x[a]-x[c],x[a+2]-x[c+2])); }
    return {fin,rough:+((hi-lo)/T).toFixed(3),span:+(span/T).toFixed(2),x:pos.x/T,z:pos.z/T,lift:+((RIDE.lift||0)/T).toFixed(2),v:+((RIDE.v||0)/T).toFixed(2)}; };
  CARPET.make=make; CARPET.place=place; CARPET.rolled=rolled;
  if(window.INSPECT&&INSPECT.kinds)INSPECT.kinds.push({is:id=>id==='magic_carpet',make:()=>{ const g=make(); g.traverse(c=>{ c.userData.ownMat=true; }); g.scale.setScalar(1/T); return g; }});

  /* ---------- flying it as you fly (G): it floats a hand above the ground, W A S D turns and flies it on, SPACE climbs and SHIFT sinks as fast as flying does, up through the clouds to the same 300 m; low down walls stop you, up high it goes over everything ---------- */
  const WM=T/.84, TOP=300*WM, LOW=.35*T, POSE={k:'carpet',z:0,lean:0};
  RIDE.kind('carpet',{name:'MAGIC CARPET',cat:'carpet',hint:'E UNROLLS IT AND YOU SIT. WASD FLIES, SPACE UP, SHIFT DOWN, E STEPS OFF.',onSay:'THE CARPET UNROLLS AND FLOATS. YOU SIT DOWN ON IT.',held:.35,dry:true,hop:false,ease:8,
    make:()=>make(), hand:()=>rolled(),
    on:R=>{ R.h=0; R.vy=0; R.down=false; },
    leave:R=>{ if(R.h>LOW*1.6){ R.down=true; say('THE CARPET SINKS TO THE GROUND.'); } else RIDE.off('YOU STEP OFF THE CARPET.'); },
    step:(R,dt,I)=>{ const id=R.on, vmax=(+prop(id,'speed')||9)*T*SPEED.of('carpet'), k=Math.min(1,dt*2);
      if(I.ml>0){ const want=Math.atan2(I.mx,I.mz), e=wrap(want-R.hd), d=cl(e,-1.7*dt,1.7*dt); R.hd+=d; R.lean+=(d/Math.max(dt,1e-3)*.2-R.lean)*Math.min(1,dt*4); R.v+=((Math.abs(e)<1.3?vmax:0)-R.v)*Math.min(1,dt*(Math.abs(e)<1.3?.8:1.6)); }
      else { R.v=Math.max(0,R.v-1.2*T*dt); R.lean*=1-Math.min(1,dt*3); }
      const w=R.down?-1:(keys.has(' ')?1:0)-(keys.has('shift')?1:0); R.vy+=(w*(w>0?3.5:R.down?Math.max(4,Math.min(30,R.h/WM*1.2)):5.5)*WM-R.vy)*k; R.h=cl(R.h+R.vy*dt,0,TOP);
      if(R.h<LOW&&!R.down)R.h+=(LOW-R.h)*Math.min(1,dt*3);
      if(R.down&&R.h<=.02*T){ RIDE.off('THE CARPET SETTLES. YOU STEP OFF.'); return true; }
      const ox=pos.x, oz=pos.z, go=R.v*dt; pos.x+=Math.sin(R.hd)*go; pos.z+=Math.cos(R.hd)*go;
      if(R.h<2.5*T){ collide(pos,ox,oz); if(go>.001&&Math.hypot(pos.x-ox,pos.z-oz)<go*.5)R.v*=.5; }
      const B=SHARED.BOUND; if(B){ pos.x=cl(pos.x,B.x0,B.x1); pos.z=cl(pos.z,B.z0,B.z1); }
      SHARED.heading=R.hd; const t=performance.now()/1000; R.lift=R.h+Math.sin(t*1.4)*.04*T; POSE.lean=R.lean; POSE.fwd=Math.min(1,R.v/vmax); st.ride=POSE; return true; },
    pose:R=>{ POSE.lean=R.lean||0; return POSE; },
    place:(m,R,t)=>place(m,R,t),
    floor:(g,R)=>g+(R.lift||0), off:()=>{} });
}

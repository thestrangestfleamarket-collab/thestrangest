// THE BIG TREES: data/world.json's bigTrees (owner, 7 Nov 2026; redone 10 Nov 2026), across the middle of the park (s: a tree's size against a 62 m one), one hollow giant (kind G), each with one massive branch (kind A level, B rising, C low and sagging) and 4 to 8 smaller ones, leafy puffs on the outside; a tree with climb:true joins PARK.climbable, the only trees TREES lets you climb.
import {SHARED, THREE} from './003-shx.js';
import {PARK, pos, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, SOL, SYS, TILE} from './006-map-pre.js';
import {PEEK} from './008-batch.js';
PARK.climbable=[];
{ const T=TILE, M=T/.84, hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const KIND={ A:{h:62,r0:3.2,r1:.5,br:[[13,0,1.9],[14,7,1.5],[15,14,1.1],[15.5,20,.8],[16.5,26,.5]]},
    B:{h:58,r0:3,r1:.5,br:[[8,0,2],[11.5,6,1.6],[15.5,12,1.25],[20,18,.9],[24.5,24,.55]]},
    C:{h:55,r0:3.6,r1:.55,br:[[6,0,2.1],[5.2,7,1.7],[4.4,14,1.35],[4.8,20,1],[6.5,25,.7],[9,29,.45]]} };   // trunk height and radii, the big branch as [height, out, radius], metres
  const GREEN=[[.37,.6,.32],[.43,.67,.36],[.5,.72,.4],[.31,.54,.28]];
  // a bent tube through [x,y,z,r] points, its bark a little lumpy; pushed as plain triangles onto P
  const tube=(pts,P)=>{ const c=new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(q[0],q[1],q[2]))), n=Math.max(8,pts.length*8), rad=pts.map(q=>q[3]);
    const geo=new THREE.TubeGeometry(c,n,1,12,false), ps=geo.attributes.position, nr=geo.attributes.normal;
    for(let i=0;i<=n;i++){ const u=i/n, f=u*(pts.length-1), k=Math.min(pts.length-2,Math.floor(f)), r=rad[k]+(rad[k+1]-rad[k])*(f-k), cp=c.getPointAt(u);
      for(let j=0;j<=12;j++){ const a=i*13+j, w=1+.08*Math.sin(j*2.1+i*.7)+.05*Math.sin(j*5.3); ps.setXYZ(a,cp.x+nr.getX(a)*r*w,cp.y+nr.getY(a)*r*w,cp.z+nr.getZ(a)*r*w); } }
    const A=geo.toNonIndexed().attributes.position.array; for(let i=0;i<A.length;i++)P.push(A[i]); geo.dispose(); };
  // THE GIANT (owner, 10 Nov 2026): a bare trunk, a round shell of leaves only on the outside and open underneath round the trunk, hollow inside but for thick limbs climbing round the trunk to the top
  const giant=(o,i,puffs)=>{ const k=(o.s||2.4)/2.4, M=T/.84*k, x=SHARED.BOD.XS(o.x), z=SHARED.BOD.ZS(o.y), y=SHARED.groundY?SHARED.groundY(x,z):0, H=148, TH=H*.92, r0=8.5, P=[], lb=[];
    const rAt=h=>r0+(1.2-r0)*Math.pow(Math.min(1,Math.max(0,h)/TH),.65), CY=H*.68, RX=40, RY=48;
    const trunk=[]; for(let q=0;q<=10;q++){ const u=q/10; trunk.push([x+Math.sin(u*2.4)*2*u*M,y+(u*TH-1)*M,z+Math.cos(u*1.9)*1.6*u*M,rAt(u*TH)*M*(q?1:1.3)]); } tube(trunk,P);
    for(let q=0;q<8;q++){ const a=q/8*6.28+.3; tube([[x,y+6*M,z,4.5*M],[x+Math.cos(a)*10.5*M,y+.8*M,z+Math.sin(a)*10.5*M,2.4*M],[x+Math.cos(a)*14*M,y-.6*M,z+Math.sin(a)*14*M,.7*M]],P); }   // roots, short so they keep off the paths
    const limb=pts=>{ tube(pts,P); for(let q=0;q+1<pts.length;q++){ const A=pts[q], B=pts[q+1]; lb.push([A[0],A[1],A[2],B[0],B[1],B[2],A[3],B[3]]); } };
    const NL=11; for(let q=0;q<NL;q++){ const u=q/(NL-1), h=50+u*(H*.86-50), a=q*2.39+(o.face||0)*Math.PI/180, r=Math.max(.9,2.6-1.6*u), reach=Math.sqrt(Math.max(.05,1-((h+8-CY)/RY)**2))*RX*.86, p0=rAt(h)*.6, pts=[];
      for(let t5=0;t5<=5;t5++){ const t=t5/5, d=p0+reach*t, b=a+t*.35; pts.push([x+Math.cos(b)*d*M,y+(h+t*t*14-Math.sin(t*3.1)*2)*M,z+Math.sin(b)*d*M,r*(1-.6*t)*M]); } limb(pts);
      for(let sd=0;sd<3;sd++){ const sa=a+(sd-1)*.7, st=.35+.2*sd, d0=p0+reach*st, b0=a+st*.35, q0=[x+Math.cos(b0)*d0*M,y+(h+st*st*14)*M,z+Math.sin(b0)*d0*M], L=reach*.45, sp=[];
        for(let t3=0;t3<=3;t3++){ const t=t3/3; sp.push([q0[0]+Math.cos(sa)*L*t*M,q0[1]+t*9*M,q0[2]+Math.sin(sa)*L*t*M,r*.45*(1-.7*t)*M]); } limb(sp); } }
    for(let q=0;q<2600;q++){ const v=-1+2*((q+.5)/2600); if(v<-.8)continue; const th=q*2.39996, rr=Math.sqrt(1-v*v), w=1+.06*Math.sin(th*3+v*7)+.05*Math.sin(th*7-v*4);
      for(let j=0;j<2;j++){ const d=(1-j*.07)*w; puffs.push([x+Math.cos(th)*rr*RX*d*M,y+(CY+v*RY*d)*M,z+Math.sin(th)*rr*RX*d*M,(4.2+2.2*hs(q,j))*(j?1.1:1)*M,Math.floor(hs(q,j+3)*4)]); } }
    const tr=rAt(1.5)*M, rb=r0*1.3*M, sol=[x-tr*.8,z-tr*.8,x+tr*.8,z+tr*.8], fix=[x-tr*.8,z-tr*.8,y,x+tr*.8,z+tr*.8,y+30*M]; FIX.up.push(fix);
    for(let q=1;q<4;q++){ const rr=rAt(q*TH/4)*M*.8; FIX.up.push([x-rr,z-rr,y+q*TH/4*M-15*M,x+rr,z+rr,y+q*TH/4*M+20*M]); }   // the trunk for loose things, narrowing up it
    for(const [a,b] of [[.72,.72],[1,.42],[.42,1]])SOL.up.push([x-rb*a,z-rb*b,x+rb*a,z+rb*b]);
    if(WEEDS.addFeet)WEEDS.addFeet([[x,z,rb,4*M]]);
    return {k:'BIGG',x,y,z,top:y+TH*M,r:(RX+6)*M,nr:(RX+20)*M,tr,rf:rb,fork:0,v0:0,v1:P.length/3,P:new Float32Array(P),LF:[],lb,sol,fix,climb:!!o.climb}; };
  const make=(o,i,puffs)=>{ if(o.kind==='G')return giant(o,i,puffs); const sz=o.s||1, M=T/.84*sz, PK=Math.pow(sz,-.45), S=KIND[o.kind]||KIND.A, x=SHARED.BOD.XS(o.x), z=SHARED.BOD.ZS(o.y), y=SHARED.groundY?SHARED.groundY(x,z):0, face=(o.face||0)*Math.PI/180, dx=Math.cos(face), dz=Math.sin(face), P=[], lb=[];
    const rAt=h=>S.r0+(S.r1-S.r0)*Math.pow(Math.max(0,h)/S.h,.7), at=(h,a,d)=>[x+Math.cos(a)*d,y+h*M,z+Math.sin(a)*d];
    const puff=(px,py,pz,r)=>{ const q=Math.hypot(px-x,pz-z), need=(rAt((py-y)/M)+1.5)*M+r*.5; if(q<need){ const k=need/(q||1); px=x+(px-x)*k; pz=z+(pz-z)*k; } puffs.push([px,py,pz,r,Math.floor(hs(i,puffs.length)*4)]); };   // the middle round the trunk stays open to climb
    const trunk=[]; for(let k=0;k<=8;k++){ const u=k/8; trunk.push([x+Math.sin(u*3+face)*.4*M*u,y+u*S.h*M-.5*M,z+Math.cos(u*2.3+face)*.3*M*u,rAt(u*S.h)*M*(k?1:1.35)]); } tube(trunk,P);
    const branch=(pts,big)=>{ tube(pts,P); for(let k=0;k+1<pts.length;k++){ const A=pts[k], B=pts[k+1]; lb.push([A[0],A[1],A[2],B[0],B[1],B[2],A[3],B[3]]); }
      const c=new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(q[0],q[1],q[2]))), L=c.getLength(), n=Math.max(3,Math.round(L/(1.2*M)*sz));   // (a smaller tree: fewer puffs, each a little bigger, as full for less)   // thick (owner, 8 Nov 2026: "5x as much greenery leaves, like the old school trees, thick"): a dense mass of puffs along each branch, over and round it
      for(let k=0;k<n;k++){ const u=.25+.75*(k+.5)/n, p=c.getPointAt(u), s=i*31+lb.length*7+k; for(let j=0;j<4;j++){ const t=s*5+j, r=(1.6+1.4*hs(t,1))*M*(big?1.3:1)*PK, a=hs(t,2)*6.28, d=(.6+2.6*hs(t,3))*M;
        puff(p.x+Math.cos(a)*d,p.y+(.4+2.4*hs(t,4))*M-(j===3?1.2*M:0),p.z+Math.sin(a)*d,r); } } };
    branch(S.br.map(([h,d,r])=>[x+dx*d*M-dz*Math.sin(d*.25)*1.2*M,y+h*M,z+dz*d*M+dx*Math.sin(d*.25)*1.2*M,r*M]),true);
    const L0=S.br[S.br.length-1][1], R0=S.br[0][2], nb=4+Math.floor(hs(i,9)*5);   // the smaller branches: 25 to 50% of the big one, round the trunk and up it
    for(let k=0;k<nb;k++){ const s=.25+.25*hs(i,20+k), a=face+.9+k/nb*(6.28-1.8)+(hs(i,40+k)-.5)*.5, h=S.h*(.18+.55*(k+hs(i,60+k))/nb), L=L0*s, r=Math.min(R0*s*1.1,rAt(h)*.8), up=.25+.55*hs(i,80+k), pts=[];
      for(let q=0;q<=4;q++){ const u=q/4; pts.push([...at(h+L*up*u*(.6+.4*u),a,L*u*M),Math.max(.12,r*(1-.75*u))*M]); } branch(pts,false); }
    for(let k=0;k<6;k++){ const a=k/6*6.28+.4+face; tube([[x,y+2.5*M,z,1.6*M],[...at(.3,a,4*M),.9*M],[...at(-.3,a,6.5*M),.25*M]],P); }   // roots flaring at the foot
    for(let h=S.h*.55;h<S.h+4;h+=1.4/sz){ const w=1-Math.max(0,(h-S.h*.9)/(S.h*.1+4))*.6, n=9+Math.floor(hs(i,h)*4); for(let k=0;k<n;k++){ const a=hs(i,h+k)*6.28; puff(...at(h,a,(rAt(h)+1.5+6*w*hs(h,k))*M),(2+1.8*hs(k,h))*M*PK); } }   // the crown up the top of the trunk: full and round
    const tr=rAt(1.5)*M, rb=S.r0*1.35*M, sol=[x-tr*.8,z-tr*.8,x+tr*.8,z+tr*.8], fix=[x-tr*.8,z-tr*.8,0,x+tr*.8,z+tr*.8,S.h*M]; FIX.up.push(fix);
    for(const [a,b] of [[.72,.72],[1,.42],[.42,1]])SOL.up.push([x-rb*a,z-rb*b,x+rb*a,z+rb*b]);   // the foot is solid as wide as its bark at the ground (an octagon of three boxes), and each root as far as it shows (owner, 9 Nov 2026: "i can still walk into the base of the tree")
    for(let k=0;k<6;k++){ const a=k/6*6.28+.4+face; for(const [d,w,hh] of [[4.2,.85,1.2],[5,.65,.7],[5.7,.45,.35]]){ if(d+w<=S.r0*1.35)continue; const cx=x+Math.cos(a)*d*M, cz=z+Math.sin(a)*d*M, h=w*M; SOL.up.push([cx-h,cz-h,cx+h,cz+h]); FIX.up.push([cx-h,cz-h,y,cx+h,cz+h,y+hh*M]); } }
    if(WEEDS.addFeet)WEEDS.addFeet([[x,z,rb,2.5*M]]);   // tufts and weeds round its foot and among its roots
    return {k:'BIG'+(o.kind||'A'),x,y,z,top:y+S.h*M,r:30*M,tr,rf:rb,fork:0,v0:0,v1:P.length/3,P:new Float32Array(P),LF:[],lb,sol,fix,climb:!!o.climb}; };
  SYS.onStart(()=>{ const L=(LEVEL.bigTrees||[]).filter(o=>o.kind); if(!L.length)return; const g=new THREE.Group(), puffs=[];   // seen from the whole map, not only once the park is up (owner, 8 Nov 2026: "render entire map")
    scene.add(g); SYS.every(()=>{ g.visible=SHARED.LVL==='up'; },500,'144d-bigtrees shown on the street level'); const bark=new THREE.MeshLambertMaterial({color:0x6a5040,flatShading:true}), leaf=new THREE.MeshLambertMaterial({color:0xffffff});
    const items=L.map((o,i)=>{ const n=puffs.length, it=make(o,i,puffs); it.p0=n; it.p1=puffs.length; return it; }); PARK.big=items;
    const PG=new THREE.IcosahedronGeometry(1,1), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), v=new THREE.Vector3(), s=new THREE.Vector3(), c=new THREE.Color();
    PEEK.mark(PG,new Uint8Array(PG.attributes.position.count).fill(5));   // seen through round you like the park's other big trees (PEEK)
    // the leaves cast no shadow, only the bark (owner, 9 Nov 2026)
    // each tree whole (its bark, every leaf puff) drawn only near the eye (owner, 8 Nov 2026: "i want to simplify trees bigtime, they shouldnt cost much from far off at all")
    for(const it of items){ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(it.P,3)); geo.computeVertexNormals(); const me=new THREE.Mesh(geo,bark); me.castShadow=me.receiveShadow=true; g.add(me); it.mesh=me; if(it.climb)PARK.climbable.push(it);
      const IM=new THREE.InstancedMesh(PG,leaf,it.p1-it.p0); for(let i=it.p0;i<it.p1;i++){ const [x,y,z,r,k]=puffs[i], G=GREEN[k]; IM.setMatrixAt(i-it.p0,m4.compose(v.set(x,y,z),q,s.setScalar(r))); IM.setColorAt(i-it.p0,c.setRGB(G[0],G[1],G[2],THREE.SRGBColorSpace)); }
      IM.castShadow=false; IM.receiveShadow=true; IM.computeBoundingSphere(); g.add(IM); it.leaves=IM;
      PEEK.mark(geo,new Uint8Array(it.P.length/3).fill(5)); const B=new THREE.Box3(); geo.computeBoundingBox(); B.copy(geo.boundingBox);
      for(let i=it.p0;i<it.p1;i++){ const [x,y,z,r]=puffs[i]; B.expandByPoint(v.set(x-r,y-r,z-r)); B.expandByPoint(v.set(x+r,y+r,z+r)); } PEEK.box(IM,B.min.x,B.min.y,B.min.z,B.max.x,B.max.y,B.max.z); }
    // from further off, each tree its plain shape: its leaves gathered into a few big blobs (twenty triangles each), its trunk and big branch six-sided tubes; a few hundred triangles a tree, all of them one draw each
    const FB=[], CELL=9*T/.84;
    for(const it of items){ it.f0=FB.length; const cells=new Map(); for(let i=it.p0;i<it.p1;i++){ const P=puffs[i], kk=Math.floor(P[0]/CELL)+','+Math.floor(P[1]/CELL)+','+Math.floor(P[2]/CELL); (cells.get(kk)||cells.set(kk,[]).get(kk)).push(P); }
      for(const L_ of cells.values()){ let x=0,y=0,z=0,w=0; for(const P of L_){ const a=P[3]**3; x+=P[0]*a; y+=P[1]*a; z+=P[2]*a; w+=a; } x/=w; y/=w; z/=w; let r=0; for(const P of L_)r=Math.max(r,Math.hypot(P[0]-x,P[1]-y,P[2]-z)*.6+P[3]); FB.push([x,y,z,r,L_[0][4]]); }
      it.f1=FB.length; }
    const FL=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),FB.length);
    FB.forEach(([x,y,z,r,k],i)=>{ FL.setMatrixAt(i,m4.compose(v.set(x,y,z),q,s.setScalar(r))); FL.setColorAt(i,c.setRGB(.4,.63,.34,THREE.SRGBColorSpace)); });   // one green from far off (the four greens' patches flickered in the dark)
    const TG=new THREE.CylinderGeometry(.35,1,1,6,1,true).translate(0,.5,0), FT=new THREE.InstancedMesh(TG,bark,items.length*2), UP=new THREE.Vector3(0,1,0), D=new THREE.Vector3();
    const tubeAt=(i,a,b,r)=>{ D.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]); const L_=D.length(); q.setFromUnitVectors(UP,D.normalize()); FT.setMatrixAt(i,m4.compose(v.set(a[0],a[1],a[2]),q,s.set(r,L_,r))); q.identity(); };
    items.forEach((it,i)=>{ it.T0=[[it.x,it.y-.5*T,it.z],[it.x,it.top,it.z],it.tr*1.15]; const lb=it.lb, b0=lb[0]; let e=0; while(e+1<lb.length&&lb[e+1][0]===lb[e][3]&&lb[e+1][2]===lb[e][5])e++; const be=lb[e];   // (the big branch: its segments come first, end to end)
      it.T1=[[b0[0],b0[1],b0[2]],[be[3],be[4],be[5]],b0[6]]; tubeAt(i*2,...it.T0); tubeAt(i*2+1,...it.T1); });
    for(const M_ of [FL,FT]){ M_.castShadow=M_===FT; M_.receiveShadow=true; M_.frustumCulled=false; M_.userData.pieceCull=1; g.add(M_); } PARK.bigFar=FL;
    // which trees are near: whole within NEAR tiles of the eye (along the ground), their plain shapes away; the rest the other way round
    const NEAR=45*T, Z=new THREE.Matrix4().makeScale(0,0,0); let tk=0;
    const swap=(it,i,near)=>{ it.near=near; it.mesh.visible=it.leaves.visible=near;
      for(let j=it.f0;j<it.f1;j++){ if(near)FL.setMatrixAt(j,Z); else { const [x,y,z,r]=FB[j]; FL.setMatrixAt(j,m4.compose(v.set(x,y,z),q,s.setScalar(r))); } } FL.instanceMatrix.needsUpdate=true;
      if(near){ FT.setMatrixAt(i*2,Z); FT.setMatrixAt(i*2+1,Z); } else { tubeAt(i*2,...it.T0); tubeAt(i*2+1,...it.T1); } FT.instanceMatrix.needsUpdate=true; };
    items.forEach((it,i)=>swap(it,i,false));
    SYS.add('cam',dt=>{ if((tk-=dt||0)>0)return; tk=.25; const cam=SHARED.cam; if(!cam)return; const cx=cam.position.x, cz=cam.position.z, persp=!cam.isOrthographicCamera;
      items.forEach((it,i)=>{ const N=Math.max(NEAR,it.nr||0), near=persp?Math.hypot(it.x-cx,it.z-cz)<N:Math.hypot(it.x-pos.x,it.z-pos.z)<N; if(near!==it.near)swap(it,i,near); }); },'144d-bigtrees near or far');
    PARK.bigLeaves={get count(){ return items.reduce((a,it)=>a+(it.near?it.p1-it.p0:0),0); }}; },'144d-bigtrees');
  window.BIGTREESDBG=()=>({trees:(PARK.big||[]).length,climbable:PARK.climbable.length,puffs:PARK.bigLeaves?PARK.bigLeaves.count:0,near:(PARK.big||[]).filter(t=>t.near).length,farBlobs:PARK.bigFar?PARK.bigFar.count:0,branches:(PARK.big||[]).map(t=>t.lb.length),tris:(PARK.big||[]).reduce((a,t)=>a+t.v1/3,0)}); }

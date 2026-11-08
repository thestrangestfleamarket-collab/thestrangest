// THE BIG TREES: data/world.json's bigTrees (owner, 7 Nov 2026), giants of 55 to 62 m in the middle of the park (s: a tree's size against those), each with one massive branch (kind A level, B rising, C low and sagging) and 4 to 8 smaller ones, leafy puffs on the outside; a tree with climb:true joins PARK.climbable, the only trees TREES lets you climb.
import {SHARED, THREE} from './003-shx.js';
import {PARK} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, SOL, SYS, TILE} from './006-map-pre.js';
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
  const make=(o,i,puffs)=>{ const sz=o.s||1, M=T/.84*sz, PK=Math.pow(sz,-.45), S=KIND[o.kind]||KIND.A, x=SHARED.BOD.XS(o.x), z=SHARED.BOD.ZS(o.y), y=SHARED.groundY?SHARED.groundY(x,z):0, face=(o.face||0)*Math.PI/180, dx=Math.cos(face), dz=Math.sin(face), P=[], lb=[];
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
    const tr=rAt(1.5)*M, rb=S.r0*M, sol=[x-tr*.8,z-tr*.8,x+tr*.8,z+tr*.8], fix=[x-tr*.8,z-tr*.8,0,x+tr*.8,z+tr*.8,S.h*M]; FIX.up.push(fix);
    for(const [a,b] of [[.72,.72],[1,.42],[.42,1]])SOL.up.push([x-rb*a,z-rb*b,x+rb*a,z+rb*b]);   // the foot is solid as wide as it flares (an octagon of three boxes), not just the trunk higher up
    return {k:'BIG'+(o.kind||'A'),x,y,z,top:y+S.h*M,r:30*M,tr,fork:0,v0:0,v1:P.length/3,P:new Float32Array(P),LF:[],lb,sol,fix,climb:!!o.climb}; };
  SYS.onStart(()=>{ const L=(LEVEL.bigTrees||[]).filter(o=>o.kind); if(!L.length)return; const g=new THREE.Group(), puffs=[];   // seen from the whole map, not only once the park is up (owner, 8 Nov 2026: "render entire map")
    scene.add(g); SYS.every(()=>{ g.visible=SHARED.LVL==='up'; },500,'144d-bigtrees shown on the street level'); const bark=new THREE.MeshLambertMaterial({color:0x6a5040,flatShading:true});
    const items=L.map((o,i)=>make(o,i,puffs)); PARK.big=items;
    for(const it of items){ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(it.P,3)); geo.computeVertexNormals(); const me=new THREE.Mesh(geo,bark); me.castShadow=me.receiveShadow=true; g.add(me); it.mesh=me; if(it.climb)PARK.climbable.push(it); }
    const IM=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshLambertMaterial({color:0xffffff}),puffs.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), v=new THREE.Vector3(), s=new THREE.Vector3(), c=new THREE.Color();
    puffs.forEach(([x,y,z,r,k],i)=>{ IM.setMatrixAt(i,m4.compose(v.set(x,y,z),q,s.setScalar(r))); const G=GREEN[k]; IM.setColorAt(i,c.setRGB(G[0],G[1],G[2],THREE.SRGBColorSpace)); });
    IM.castShadow=IM.receiveShadow=true; IM.computeBoundingSphere(); g.add(IM); PARK.bigLeaves=IM; },'144d-bigtrees');
  window.BIGTREESDBG=()=>({trees:(PARK.big||[]).length,climbable:PARK.climbable.length,puffs:PARK.bigLeaves?PARK.bigLeaves.count:0,branches:(PARK.big||[]).map(t=>t.lb.length),tris:(PARK.big||[]).reduce((a,t)=>a+t.v1/3,0)}); }

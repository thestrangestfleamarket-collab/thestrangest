// THE WALKER'S BODY: pieces built from shapes (meshOf0: distance fields, tetrahedra, welded by dual contouring), warmed before first use.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS, W3} from './003b-systems.js';
import {PPU, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {QS, SHL, SYS} from './006-map-pre.js';
Object.assign(W3,{group:new THREE.Group(), meshes:[], idMeshes:[], L:new THREE.Vector3(), tint:new THREE.Color(1,1,1), tris:0, lv:{value:2}, look:{value:+(new URLSearchParams(location.search).get('look')||0)}, G:{value:new THREE.Matrix3()}, LP:{value:[new THREE.Vector3(),new THREE.Vector3()]}, LC:{value:[new THREE.Vector3(),new THREE.Vector3()]}, CamW:{value:new THREE.Vector3()}, LVP:{value:new THREE.Matrix4()},
  sm:new THREE.WebGLRenderTarget(512,512), smCam:new THREE.OrthographicCamera(-2.1,2.1,2.1,-2.1,0.1,12), Lw:new THREE.Vector3()});
W3.sm.depthTexture=new THREE.DepthTexture(256,256); W3.sm.depthTexture.type=THREE.FloatType;
{ const R=RIG, {V,add,sub,mul,nrm,dot}=R, rest=(R.farOnly(false),R.build(R.walkPose({ph:0,w:0},null),null)), MATS=R.MATS, STEP=1, CELL=2, OUT=0.2*R.PX;
  const TET=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]], CO=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
  const ramp=MATS.map(m=>(R.RAMP[m]||['#ff00ff','#ff00ff','#ff00ff','#ff00ff']).map(h=>new THREE.Color(h)));
  W3.wholeBox=/wholebox/.test(location.search);
  W3.weld='dc';   // how his pieces are welded: dual contouring (straight hems, no ripples)
  const CLOTH=/^(torso|hips|thigh|shin|shoe|sleeve|upperArm|forearm|neck|body|briefs|foot)/, HANDS=/^(fing|hand)/;   // his clothes and limbs finer (clean hems, crisp shoes), hands and fingers coarser: the same triangles in all
  const RES=QS.has('res')?Math.max(.3,Math.min(1,+QS.get('res'))):.8;   // bake resolution: <1 is finer (smoother, more triangles); the eyes are flat circles, not marched
  W3.ramp=ramp; W3.meshOf=(P,step,fine,RB)=>meshOf(P,step,fine,RB); W3.legs=R.PIECES.map(n=>/^(thigh|shin|shoe)/.test(n)?(n.endsWith('L')?1:2):0);
  const PRE=new WeakMap(); W3.warm=(P,step,fine,RB)=>{ PRE.set(P,{step,fine,RB,g:meshOf0(P,step,fine,RB)}); };
  W3.fine=P=>P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n);
  function meshOf(P,step,fine,RB){ const c=PRE.get(P); if(c&&c.step===step&&c.fine===fine&&c.RB===RB){ PRE.delete(P); return c.g; } return meshOf0(P,step,fine,RB); }
  function meshOf0(P,step,fine,RB){ if(CLOTH.test(P.n))step*=.6; const bb=P.bb||[-13,13,-1,55,-11,13], nx=Math.ceil((bb[1]-bb[0])/step)+2, ny=Math.ceil((bb[3]-bb[2])/step)+2, nz=Math.ceil((bb[5]-bb[4])/step)+2;
    const at=(i,j,k)=>V(bb[0]+i*step,bb[2]+j*step,bb[4]+k*step), val=new Float32Array(nx*ny*nz), I=(i,j,k)=>(i*ny+j)*nz+k;
    let r0=[0,0,0], r1=[nx,ny,nz];
    if(!W3.wholeBox){ const cs=3, cn=[0,2,4].map(a=>Math.ceil((bb[a+1]-bb[a])/cs)+1), lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9], reach=cs*.87+1.5;
      for(let i=0;i<cn[0];i++)for(let j=0;j<cn[1];j++)for(let k=0;k<cn[2];k++){ const q=[bb[0]+i*cs,bb[2]+j*cs,bb[4]+k*cs]; if(Math.abs(P.d(V(q[0],q[1],q[2])))>reach)continue; for(let a=0;a<3;a++){ lo[a]=Math.min(lo[a],q[a]-cs); hi[a]=Math.max(hi[a],q[a]+cs); } }
      if(lo[0]<1e9){ const N=[nx,ny,nz]; for(let a=0;a<3;a++){ r0[a]=Math.max(0,Math.floor((lo[a]-bb[a*2])/step)-1); r1[a]=Math.min(N[a],Math.ceil((hi[a]-bb[a*2])/step)+2); } } }
    const MG=2*step, SQ3=Math.sqrt(3)*step/2, Q=[[r0[0],r0[1],r0[2],Math.max(r1[0]-r0[0],r1[1]-r0[1],r1[2]-r0[2])]];
    while(Q.length){ const [i0,j0,k0,n]=Q.pop(), i1=Math.min(i0+n,r1[0]), j1=Math.min(j0+n,r1[1]), k1=Math.min(k0+n,r1[2]); if(i1<=i0||j1<=j0||k1<=k0)continue;
      if(n>2&&!W3.wholeBox){ const d=P.d(V(bb[0]+(i0+(n-1)/2)*step,bb[2]+(j0+(n-1)/2)*step,bb[4]+(k0+(n-1)/2)*step));
        if(Math.abs(d)>(n-1)*SQ3+MG){ for(let i=i0;i<i1;i++)for(let j=j0;j<j1;j++)for(let k=k0;k<k1;k++)val[I(i,j,k)]=d; continue; }
        const h=Math.ceil(n/2); for(const a of [0,h])for(const b of [0,h])for(const c of [0,h])Q.push([i0+a,j0+b,k0+c,h]); continue; }
      for(let i=i0;i<i1;i++)for(let j=j0;j<j1;j++)for(let k=k0;k<k1;k++)val[I(i,j,k)]=P.d(at(i,j,k)); }
    const F=P.F0||R.frameOf(P.on||P.n,RB||rest), WP=[], tri=[];
    const VC=new Map(), NT=nx*ny*nz, emit=r=>{ tri.push(r); };
    const OF=CO.map(([a,b,c])=>(a*ny+b)*nz+c);
    const cv8=[0,0,0,0,0,0,0,0], cg8=[0,0,0,0,0,0,0,0], ins=[0,0,0,0], out=[0,0,0,0]; let ci=0, cj=0, ck=0;
    const E=(a,b)=>{ const key=cg8[a]*NT+cg8[b]; let r=VC.get(key); if(!r){ const va=cv8[a], f=va/(va-cv8[b]), A=CO[a], B=CO[b], ax=bb[0]+(ci+A[0])*step, ay=bb[2]+(cj+A[1])*step, az=bb[4]+(ck+A[2])*step, bx=bb[0]+(ci+B[0])*step, by=bb[2]+(cj+B[1])*step, bz=bb[4]+(ck+B[2])*step;
      r=WP.length/3; WP.push(ax+(bx-ax)*f,ay+(by-ay)*f,az+(bz-az)*f); VC.set(key,r); } return r; };
    for(let i=r0[0];i<r1[0]-1;i++)for(let j=r0[1];j<r1[1]-1;j++)for(let k=r0[2];k<r1[2]-1;k++){ const o=I(i,j,k); let np=0, nn=0; for(let c=0;c<8;c++){ const x=val[o+OF[c]]; if(x>0)np++; else if(x<=0)nn++; } if(np===8||nn===8)continue; for(let c=0;c<8;c++){ cv8[c]=val[o+OF[c]]; cg8[c]=o+OF[c]; } ci=i; cj=j; ck=k;
      for(const t of TET){ let ni=0, no=0; for(let q=0;q<4;q++){ const c=t[q]; if(cv8[c]<=0)ins[ni++]=c; if(cv8[c]>0)out[no++]=c; } if(!ni||!no)continue;
        if(ni===1){ emit(E(ins[0],out[0])); emit(E(ins[0],out[1])); emit(E(ins[0],out[2])); }
        else if(ni===3){ emit(E(out[0],ins[0])); emit(E(out[0],ins[1])); emit(E(out[0],ins[2])); }
        else { const a=E(ins[0],out[0]),b=E(ins[0],out[1]),c=E(ins[1],out[1]),d=E(ins[1],out[0]); emit(a); emit(b); emit(c); emit(a); emit(c); emit(d); } } }
    const rl=relax(P,WP,tri,(P.cell||CELL*(fine?0.5:1))*(/^(head|hair|eye|nose|ear|mouth)/.test(P.n)?1:1.78)*(/^eyes/.test(P.n)?1:RES)*(CLOTH.test(P.n)?.5:HANDS.test(P.n)?2.2:/^hair/.test(P.n)?.7:1),F), fit=R.fitPts(P.under||P.n,rl.fit), mats=rl.mats, n=fit.length/6, pos=new Float32Array(n*3), nor=new Float32Array(n*3), c0=new Float32Array(n*3), c1=new Float32Array(n*3), c2=new Float32Array(n*3), cd=new Float32Array(n*3), mt=new Float32Array(n);
    for(let i=0;i<n;i++){ pos.set([fit[i*6],fit[i*6+1],fit[i*6+2]],i*3); nor.set([fit[i*6+3],fit[i*6+4],fit[i*6+5]],i*3); const r=ramp[mats[i]]||ramp[0]; c0.set([r[0].r,r[0].g,r[0].b],i*3); c1.set([r[1].r,r[1].g,r[1].b],i*3); c2.set([r[2].r,r[2].g,r[2].b],i*3); cd.set([(r[2].r+r[3].r)/2,(r[2].g+r[3].g)/2,(r[2].b+r[3].b)/2],i*3); mt[i]=mats[i]; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    g.setAttribute('c0',new THREE.BufferAttribute(c0,3)); g.setAttribute('cd',new THREE.BufferAttribute(cd,3)); g.setAttribute('c1',new THREE.BufferAttribute(c1,3)); g.setAttribute('c2',new THREE.BufferAttribute(c2,3)); g.setAttribute('mat',new THREE.BufferAttribute(mt,1)); return g; }
  // the piece's surface, welded on a grid (cell); each weld's point is where the surface's own tangent planes there meet (dual contouring), so
  // a hem, a cuff or a shoe's edge stays a clean line and nothing ripples; colours never weld together
  function relax(P,WP,tri,cell,F){ const n=WP.length/3, key=new Map(), cid=new Int32Array(n), S=[];
    const q=V(0,0,0), D=(x,y,z)=>{ q.x=x; q.y=y; q.z=z; return P.d(q); }, G=[0,0,0], grad=(x,y,z)=>{ const e=.02, gx=D(x+e,y,z)-D(x-e,y,z), gy=D(x,y+e,z)-D(x,y-e,z), gz=D(x,y,z+e)-D(x,y,z-e), l=Math.hypot(gx,gy,gz)||1; G[0]=gx/l; G[1]=gy/l; G[2]=gz/l; return G; };
    const VM=[], pq=V(0,0,0);
    for(let i=0;i<n;i++){ const x=WP[i*3], y=WP[i*3+1], z=WP[i*3+2]; pq.x=x; pq.y=y; pq.z=z; const m=MATS.indexOf(P.paint&&P.paint(pq)||P.m), k=(((Math.floor(x/cell)+5e3)*1e4+Math.floor(y/cell)+5e3)*1e4+Math.floor(z/cell)+5e3)*64+(m+1); let c=key.get(k);
      if(c==null){ c=S.length/16; key.set(k,c); for(let j=0;j<16;j++)S.push(0); VM.push(m); } const o=c*16; grad(x,y,z); const a=G[0], b=G[1], d=G[2], w=a*x+b*y+d*z;
      S[o]+=x; S[o+1]+=y; S[o+2]+=z; S[o+3]++; S[o+4]+=a*a; S[o+5]+=a*b; S[o+6]+=a*d; S[o+7]+=b*b; S[o+8]+=b*d; S[o+9]+=d*d; S[o+10]+=a*w; S[o+11]+=b*w; S[o+12]+=d*w; S[o+13]+=a; S[o+14]+=b; S[o+15]+=d; cid[i]=c; }
    const NC=S.length/16, px=new Float64Array(NC), py=new Float64Array(NC), pz=new Float64Array(NC), lim=cell*1.2;
    for(let c=0;c<NC;c++){ const o=c*16, k=S[o+3]*.03, mx=S[o]/S[o+3], my=S[o+1]/S[o+3], mz=S[o+2]/S[o+3]; px[c]=mx; py[c]=my; pz[c]=mz;
      const A=S[o+4]+k, B=S[o+5], C=S[o+6], Dd=S[o+7]+k, E=S[o+8], Ff=S[o+9]+k, r0=S[o+10]+k*mx, r1=S[o+11]+k*my, r2=S[o+12]+k*mz;   // (the tangent planes' least squares, held to the welded points' middle)
      const det=A*(Dd*Ff-E*E)-B*(B*Ff-E*C)+C*(B*E-Dd*C); if(Math.abs(det)<1e-12)continue;
      const x=(r0*(Dd*Ff-E*E)-B*(r1*Ff-E*r2)+C*(r1*E-Dd*r2))/det, y=(A*(r1*Ff-E*r2)-r0*(B*Ff-E*C)+C*(B*r2-r1*C))/det, z=(A*(Dd*r2-r1*E)-B*(B*r2-r1*C)+r0*(B*E-Dd*C))/det;
      const dx=x-mx, dy=y-my, dz=z-mz, L=Math.hypot(dx,dy,dz), f=L>lim?lim/L:1; px[c]=mx+dx*f; py[c]=my+dy*f; pz[c]=mz+dz*f; }
    const T=[]; for(let t=0;t<tri.length;t+=3){ const a=cid[tri[t]], b=cid[tri[t+1]], c=cid[tri[t+2]]; if(a!==b&&b!==c&&a!==c)T.push(a,b,c); }
    const VX=new Float32Array(NC*6), p=V(0,0,0);   // (each weld's normal the mean of its samples': one way across a crease, so a hem's shading doesn't flicker)
    for(let c=0;c<NC;c++){ const o=c*16, gl=Math.hypot(S[o+13],S[o+14],S[o+15])||1, g=[S[o+13]/gl,S[o+14]/gl,S[o+15]/gl]; p.x=px[c]; p.y=py[c]; p.z=pz[c]; const l=sub(add(p,mul(V(g[0],g[1],g[2]),OUT)),F.o);
      VX.set([dot(l,F.x),dot(l,F.y),dot(l,F.z),g[0]*F.x.x+g[1]*F.x.y+g[2]*F.x.z,g[0]*F.y.x+g[1]*F.y.y+g[2]*F.y.z,g[0]*F.z.x+g[1]*F.z.y+g[2]*F.z.z],c*6); }
    const out=new Float32Array(T.length*6), om=[]; for(let i=0;i<T.length;i++){ out.set(VX.subarray(T[i]*6,T[i]*6+6),i*6); om.push(VM[T[i]]); }
    return {fit:out,mats:om}; }
  // the eyes as flat clean circles (and rects) sitting on the face, not marched: round at any zoom, a few dozen triangles a style instead of thousands
  function flatEyeGeo(P){ const {R2,H,hd}=P.flatEye, F=R.frameOf('head',rest), cross=R.cross, pos=[],nor=[],C0=[],C1=[],C2=[],CD=[],MT=[];
    const grad=(x,y,z)=>{ const e=.05; return nrm(V(hd(V(x+e,y,z))-hd(V(x-e,y,z)),hd(V(x,y+e,z))-hd(V(x,y-e,z)),hd(V(x,y,z+e))-hd(V(x,y,z-e)))); };
    const surf=(x,y)=>{ let z=H.z+9; for(let i=0;i<140&&hd(V(x,y,z))>.22;i++)z-=.1; let a=z,b=z+.1; for(let i=0;i<22;i++){ const m=(a+b)/2; if(hd(V(x,y,m))>.22)a=m; else b=m; } return (a+b)/2; };
    const push=(p,g,mi)=>{ const l=sub(add(p,mul(g,OUT)),F.o); pos.push(dot(l,F.x),dot(l,F.y),dot(l,F.z)); nor.push(dot(g,F.x),dot(g,F.y),dot(g,F.z));
      const rm=ramp[mi]||ramp[0]; C0.push(rm[0].r,rm[0].g,rm[0].b); C1.push(rm[1].r,rm[1].g,rm[1].b); C2.push(rm[2].r,rm[2].g,rm[2].b); CD.push((rm[2].r+rm[3].r)/2,(rm[2].g+rm[3].g)/2,(rm[2].b+rm[3].b)/2); MT.push(mi); };
    R2.forEach((r,ri)=>{ const mi=MATS.indexOf(r.m); if(mi<0)return; const outz=.1+ri*.04, cx=(r.x[0]+r.x[1])/2, cy=(r.y[0]+r.y[1])/2;
      for(const sgn of [1,-1]){ const ex=H.x-sgn*cx, ey=H.y+cy, Nrm=grad(ex,ey,surf(ex,ey)), E=add(V(ex,ey,surf(ex,ey)),mul(Nrm,outz));
        let Uu=cross(Nrm,V(0,1,0)); if(dot(Uu,Uu)<1e-4)Uu=cross(Nrm,V(1,0,0)); Uu=nrm(Uu); const Wv=nrm(cross(Nrm,Uu));
        if(r.o==='brow'){ const r0=2.3, w=.2, a0=1.02, a1=2.2, N=16, E2=add(add(E,mul(Nrm,.18)),mul(Wv,.85)), P_=(a,rr)=>add(E2,add(mul(Uu,-sgn*Math.cos(a)*rr),mul(Wv,-Math.sin(a)*rr)));   // a thin arched brow above the eye, finer at its ends
          for(let i=0;i<N;i++){ const t0=a0+(a1-a0)*i/N, t1=a0+(a1-a0)*(i+1)/N, h0=w*Math.sin(Math.PI*i/N)**.6+.03, h1=w*Math.sin(Math.PI*(i+1)/N)**.6+.03;
            const p0=P_(t0,r0), p1=P_(t1,r0), q0=P_(t0,r0+h0), q1=P_(t1,r0+h1); push(p0,Nrm,mi); push(q0,Nrm,mi); push(q1,Nrm,mi); push(p0,Nrm,mi); push(q1,Nrm,mi); push(p1,Nrm,mi); } }
        else if(r.o==='cap'||r.o==='capd'){ const d=r.o==='capd', rad=(r.x[1]-r.x[0])*.45*(d?1.08:1.05), c=rad*(d?.34:.48), a0=Math.asin(c/rad), N=14, P_=a=>add(E,add(mul(Uu,Math.cos(a)*rad),mul(Wv,-Math.sin(a)*rad))), M=add(E,mul(Wv,-c));   // the upper lid: the top of the eye covered, a dark lash line along its edge
          for(let i=0;i<N;i++){ const t0=a0+(Math.PI-2*a0)*i/N, t1=a0+(Math.PI-2*a0)*(i+1)/N; push(M,Nrm,mi); push(P_(t0),Nrm,mi); push(P_(t1),Nrm,mi); } }
        else if(r.o){ const rad=(r.x[1]-r.x[0])*.45, N=18; for(let i=0;i<N;i++){ const a0=i/N*2*Math.PI, a1=(i+1)/N*2*Math.PI,
            p0=add(E,add(mul(Uu,Math.cos(a0)*rad),mul(Wv,Math.sin(a0)*rad))), p1=add(E,add(mul(Uu,Math.cos(a1)*rad),mul(Wv,Math.sin(a1)*rad)));
            push(E,Nrm,mi); push(p0,Nrm,mi); push(p1,Nrm,mi); } }
        else{ const hw=(r.x[1]-r.x[0])/2, hh=(r.y[1]-r.y[0])/2, q=[[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(d=>add(E,add(mul(Uu,d[0]),mul(Wv,d[1]))));
          push(q[0],Nrm,mi);push(q[1],Nrm,mi);push(q[2],Nrm,mi); push(q[0],Nrm,mi);push(q[2],Nrm,mi);push(q[3],Nrm,mi); } } });
    const g=new THREE.BufferGeometry(), F32=a=>new THREE.BufferAttribute(new Float32Array(a),3);
    g.setAttribute('position',F32(pos)); g.setAttribute('normal',F32(nor)); g.setAttribute('c0',F32(C0)); g.setAttribute('cd',F32(CD)); g.setAttribute('c1',F32(C1)); g.setAttribute('c2',F32(C2)); g.setAttribute('mat',new THREE.BufferAttribute(new Float32Array(MT),1)); return g; }
  const around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
  const PCS=[];
  { R.fine(true); const PCS0=R.shell(rest.J,0).filter(P=>P.on!=='prop'&&P.on!=='world'); R.fine(false);
  for(const P of PCS0){ if(P.n==='beard')continue; const f=/^fing(\d)(\d)([LR])$/.exec(P.n); if(!f){ if(/^hand[LR]$/.test(P.n)){ P.bb=around([rest.J['wrist'+P.n.slice(-1)]],4.5); P.step=.25; P.cell=.2; } PCS.push(P); continue; }
    if(f[2]!=='0')continue; const sib=[1,2].map(j=>PCS0.find(q=>q.n==='fing'+f[1]+j+f[3])), d0=P.d, J=rest.J, k=j=>J['k'+f[1]+j+f[3]];
    PCS.push({...P,d:p=>Math.min(d0(p),...sib.map(q=>q.d(p))),bb:around([k(0),k(1),k(2),k(3)],1.2),step:.18,cell:.14}); }
  { const H=rest.J.head, {rbox,ell,box}=R, Vv=R.V, ad=R.add, HB=[H.x-11,H.x+11,H.y-14,H.y+11,H.z-11,H.z+11];
    const head=PCS.find(P=>P.n==='head'), hair=PCS.find(P=>P.n==='hair'), hd=head.d, hr=hair.d;
    for(const P of PCS)if(/^shoe[LR]$/.test(P.n))P.paint=p=>p.y<1.15?'sole':null;
    head.paint=()=>null;
    const V=(n,on,m,d,paint)=>({n,on,m,d,paint,bb:HB,step:.5});
    // the hairstyles: grown from the skull, not boxes: curved hairlines, soft pointed fringes and ends, strands and curls flowing from the crown, smooth joins
    const CUT=H.y-5.5, sq=x=>x*x, sm=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.min(a,b)-h*h*k/4; }, cl=(x,a,b)=>Math.max(a,Math.min(b,x)),
      skull=p=>rbox(p,H,Vv(6.0,7.8,6.3),4.6), th=p=>Math.atan2(p.x-H.x,H.z-p.z), up=p=>(p.y-H.y)/8,
      grain=(p,N,a)=>a*(.5+.5*Math.cos(th(p)*N+.7*Math.sin((p.y-H.y)*.33)+.4*Math.sin(th(p)*3))),
      line=(p,fh,arch,sc,k,ph=0)=>{ const u=p.x-H.x; return H.y+fh-arch*u*u/25-sc*sq(Math.sin(u*k+ph)); },
      brow=(p,fh,arch,sc,k,ph)=>Math.max(p.y-line(p,fh,arch,sc,k,ph),H.z+1.2+.07*sq(p.y-H.y-1)-p.z),
      ears=p=>Math.min(ell(p,ad(H,Vv(6.9,-2.6,-1.1)),Vv(2.4,3.3,2.9)),ell(p,ad(H,Vv(-6.9,-2.6,-1.1)),Vv(2.4,3.3,2.9))),
      nape=(p,y,a,k)=>H.y+y+a*Math.cos(th(p)*k)-p.y,
      cap=o=>p=>{ '@later'; const fr=p.z>H.z?.4+.6*cl((p.y-line(p,o.fh??3.4,o.arch??.7,0,1))/2.5,0,1):1;
        let d=skull(p)-fr*(o.t+(o.crown||0)*Math.max(0,up(p))+(o.bell||0)*Math.max(0,-up(p)))-fr*grain(p,o.N||24,o.g||.18);
        d=Math.max(d,-brow(p,o.fh??3.4,o.arch??.7,o.sc??.5,o.k??.9,o.ph)); if(!o.ears)d=Math.max(d,-ears(p),-Math.max(4.6-Math.abs(p.x-H.x),H.z-2.0-p.z,p.y-H.y-.3)); return Math.max(d,nape(p,o.ny??-3.4,o.na??.6,o.nk??5)); },
      tube=(pts,rs,p)=>{ let d=1e9; for(let i=0;i+1<pts.length;i++)d=sm(d,R.rcone(p,ad(H,pts[i]),ad(H,pts[i+1]),rs[i],rs[i+1]),1.0); return d; },
      twist=(p,a,k)=>a*Math.sin((p.y-H.y)*k+Math.atan2(p.x-H.x,p.z-H.z)*2),
      tight=cap({t:.45,crown:.25,g:.22,N:20,fh:5.0,arch:1.5,sc:.2,k:1.1,ny:-4.0,na:.4,nk:3}),
      curtain=(o)=>p=>{ const y=p.y-H.y, dn=Math.max(0,-y-2), w=o.w+o.fl*dn+(o.wave?o.wave*Math.sin(y*.9+th(p)*1.5):0), dz=p.z-H.z+.6;
        let d=Math.hypot((p.x-H.x)/(w+.6),dz/(w))*w-w-grain(p,o.N,o.g);
        d=Math.max(d,y-6.5,-(o.len+o.tip*sq(Math.sin(th(p)*o.tk))+.6*Math.sin(th(p)*3))-y);
        const face=Math.max((sq((p.x-H.x)/6.3)+sq((y+1.4)/9.5))-1,H.z+.3-p.z); d=Math.max(d,-face*3,(p.z-H.z-2.4)-40*(1-cl((1-y)/.5,0,1))); return Math.max(d,(p.z-H.z+1.0)-40*(1-cl((-y-7.5)/.5,0,1))); },
      SPK=[], CRL=[];
    for(let i=0;i<17;i++){ const t=(i+.5)/17, ph=i*2.39996, yy=1-t*1.15, rr=Math.sqrt(Math.max(0,1-yy*yy)), x=Math.cos(ph)*rr, z=Math.sin(ph)*rr;
      if(yy<-.05||z>.8&&yy<.45)continue; const b=Vv(x*5.4,1.4+yy*6.3,-1+z*6.0), dir=R.nrm(Vv(x*.8,yy*.6+1.0,z*.5-.65)), l=3.0+(i%3)*.9;
      SPK.push(p=>tube([b,R.add(b,R.mul(dir,l*.55)),R.add(R.add(b,R.mul(dir,l)),Vv(0,-.3,-.6))],[1.7,1.0,.15],p)); }
    for(let i=0;i<40;i++){ const t=(i+.5)/40, ph=i*2.39996, yy=1-t*1.3, rr=Math.sqrt(Math.max(0,1-yy*yy)), x=Math.cos(ph)*rr, z=Math.sin(ph)*rr;
      if(z>.62&&yy<.42||yy<-.3)continue; CRL.push([ad(H,Vv(x*6.9,.8+yy*8.0,-1.1+z*7.3)),1.55+(i%3)*.25]); }
    const curls=p=>{ let d=1e9; for(const [c,r] of CRL){ const q=Math.abs(p.x-c.x)+Math.abs(p.y-c.y)+Math.abs(p.z-c.z); if(q<r*3)d=sm(d,Math.hypot(p.x-c.x,p.y-c.y,p.z-c.z)-r+.18*Math.sin((p.x+p.y)*3.1)*Math.sin((p.z-p.y)*2.7),.7); } return d; };
    const tail=p=>tube([Vv(0,1.4,-8.2),Vv(0,-1.6,-10.0),Vv(0,-5.6,-10.3),Vv(.3,-9.4,-9.6)],[2.1,2.3,1.6,.35],p)+twist(p,.22,2.6);
    const braid=p=>{ const t=cl((H.y-1.0-p.y)/15.5,0,1), c=ad(H,Vv(.55*Math.sin(t*30),-1.0-t*15.5,-8.6-t*1.1)); return sm(Math.hypot((p.x-c.x)/(1.75-t*.75),(p.y-c.y)/1.25,(p.z-c.z)/(1.45-t*.55))-1,Math.hypot(p.x-H.x,p.y-H.y+17.0,p.z-H.z+9.7)-.95,.4); };
    const pig=s=>p=>tube([Vv(s*6.4,0,-3.4),Vv(s*7.9,-3.8,-3.6),Vv(s*8.3,-7.4,-3.0),Vv(s*7.6,-10.6,-2.4)],[1.9,1.8,1.3,.3],p)+twist(p,.2,2.8);
    const tie=(x,y,z,r)=>p=>Math.hypot(p.x-H.x-x,p.y-H.y-y,p.z-H.z-z)-r;
    const LONG={w:7.2,fl:.035,len:14.2,tip:1.3,tk:6,N:26,g:.3}, WAVY={...LONG,w:7.3,fl:.05,wave:.7,len:14.6,tip:1.6,tk:5,g:.34},
      top=cap({t:.75,crown:.5,g:.16,N:22,fh:3.6,arch:.8,sc:.35,k:1.0,ears:1,ny:-14,na:0});
    PCS.push(V('hairPony','hair','hair',p=>sm(tight(p),tie(0,1.4,-8.0,1.7)(p),.6)),
             Object.assign(V('hairPonyA','hair','hair',tail),{bb:[H.x-5,H.x+5,H.y-14,H.y+4,H.z-14,H.z-4],swing:{pivot:[0,1.4,-8.2],rest:[0,-1,-.05],len:9,max:.8,k:30,back:1}}),
             V('hairLong','hair','hair',p=>Math.max(sm(top(p),curtain(LONG)(p),1.2),CUT-.8-p.y)),
             Object.assign(V('hairLongA','hair','hair',p=>Math.max(curtain(LONG)(p),p.y-CUT-.8)),{bb:[H.x-12,H.x+12,H.y-19,H.y+2,H.z-12,H.z+9],swing:{pivot:[0,-5.5,-1.6],rest:[0,-1,0],len:8.1,max:.7,k:45,back:1}}),
             Object.assign(V('hairBun','hair','hair',p=>sm(tight(p),Math.hypot((p.x-H.x)/3.2,(p.y-H.y-4.4)/2.9,(p.z-H.z+8.6)/2.8)*2.8-2.8+.3*Math.sin(Math.atan2(p.y-H.y-4.4,p.x-H.x)*2+Math.hypot(p.x-H.x,p.y-H.y-4.4)*1.6),1.2)),{bb:[H.x-11,H.x+11,H.y-14,H.y+11,H.z-14,H.z+11]}),
             V('hairBuzz','hair','hair',cap({t:.3,g:.07,N:60,fh:3.9,arch:.9,sc:.15,k:1.4,ny:-3.6,na:.5,nk:4})),
             V('hairSlick','hair','hair',p=>sm(cap({t:.55,crown:1.5,g:.3,N:14,fh:4.3,arch:1.1,sc:.1,k:.6,ny:-3.4,na:.4,nk:3})(p)-.25*Math.cos((p.x-H.x)*2.2)*cl(up(p)+.3,0,1),
               Math.max(ell(p,ad(H,Vv(0,6.6,3.0)),Vv(5.2,2.6,3.6)),-brow(p,4.3,1.1,.1,.6)),1.4)),
             V('hairSpiky','hair','hair',p=>{ let d=cap({t:.7,crown:.4,g:.25,N:18,fh:3.6,arch:.6,sc:.6,k:1.5,ny:-3.4,na:.6,nk:6})(p); for(const f of SPK)d=sm(d,f(p),.9); return d; }),
             V('hairMohawk','hair','hair',p=>{ '@later'; const side=cap({t:.14,g:.05,N:70,fh:4.0,arch:.9,sc:0,k:1,ny:-3.4,na:.4,nk:3})(p), z=p.z-H.z, a=cl((z+6.2)/12.8,0,1);
               const crest=Math.max(Math.hypot((p.x-H.x)/(1.25-.25*a),(p.y-H.y-7.0-1.4*Math.sin(a*Math.PI)-.6*sq(Math.sin(z*1.3)))/2.8)-1,Math.abs(z-.2)-6.4,H.y+3-p.y); return sm(side,crest,1.2); }),
             V('hairCurly','hair','hair',p=>Math.max(sm(cap({t:.8,crown:.4,g:.2,N:20,fh:3.6,arch:.7,sc:.7,k:1.3,ny:-3.2,na:.8,nk:7})(p),curls(p),.8),-brow(p,3.0,.7,.6,1.3))),
             V('hairPixie','hair','hair',p=>sm(cap({t:.7,crown:.7,g:.3,N:26,fh:4.2,arch:.6,sc:.4,k:1.2,ny:-4.4,na:1.0,nk:6})(p),Math.max(tube([Vv(-4.0,6.4,3.4),Vv(.5,5.4,5.9),Vv(4.6,3.0,6.2)],[1.9,1.4,.3],p),-skull(p)-.1),.8)),
             V('hairBob','hair','hair',p=>{ const y=p.y-H.y, face=Math.max(sq((p.x-H.x)/6.0)+sq((y+2.4)/7.4)-1,H.z+.3-p.z,y-line(p,3.0,.5,.7,1.2)+H.y);
               let d=skull(p)-(1.0+.5*Math.max(0,up(p))+.55*cl(-y/7,0,1))-grain(p,28,.32); d=Math.max(d,-face); return Math.max(d,(H.y-7.6+.12*(H.z-p.z)+.7*sq(Math.sin(th(p)*4)))-p.y); }),
             V('hairPigtails','hair','hair',p=>{ let d=tight(p)+.35*Math.exp(-sq(p.x-H.x)*3)*cl(up(p)*2,0,1); d=sm(d,pig(1)(p),.8); d=sm(d,pig(-1)(p),.8); return Math.min(d,tie(6.5,-.2,-3.4,1.4)(p),tie(-6.5,-.2,-3.4,1.4)(p)); }),
             V('hairBraid','hair','hair',p=>sm(tight(p),tie(0,-1.0,-8.0,1.6)(p),.5)),
             Object.assign(V('hairBraidA','hair','hair',braid),{bb:[H.x-5,H.x+5,H.y-20,H.y+2,H.z-14,H.z-4],swing:{pivot:[0,-1.0,-8.4],rest:[0,-1,-.07],len:15,max:.6,k:30,back:1}}),
             V('hairWavy','hair','hair',p=>Math.max(sm(top(p),curtain(WAVY)(p),1.2),CUT-.8-p.y)),
             Object.assign(V('hairWavyA','hair','hair',p=>Math.max(curtain(WAVY)(p),p.y-CUT-.8)),{bb:[H.x-13,H.x+13,H.y-20,H.y+2,H.z-13,H.z+9],swing:{pivot:[0,-5.5,-1.6],rest:[0,-1,0],len:8.1,max:.7,k:45,back:1}}));
    const jaw=p=>Math.max(H.z-.6-p.z,p.y-(H.y-4.6+.06*sq(p.x-H.x)),H.y-10.2-p.y-.25*(p.z-H.z)), MO=p=>-ell(p,ad(H,Vv(0,-5.95,6.0)),Vv(2.3,1.0,2.2));
    PCS.push(V('beardStubble','head','hair',p=>Math.max(hd(p)-.24,jaw(p),MO(p),H.y-9.4-p.y)),
             V('beardShort','head','hair',p=>Math.max(hd(p)-.65-grain(p,40,.15)-.25*cl(-(p.y-H.y+6)/3,0,1),jaw(p),MO(p))),
             V('beardFull','head','hair',p=>Math.max(hd(p)-1.1-grain(p,34,.35)-1.6*cl(-(p.y-H.y+5.5)/4,0,1)*(1-cl(Math.abs(p.x-H.x)/7,0,1)),jaw(p),MO(p))),
             V('beardGoatee','head','hair',p=>Math.max(sm(ell(p,ad(H,Vv(0,-7.3,4.9)),Vv(1.7,2.0,1.4)),tube([Vv(-2.6,-5.0,5.6),Vv(0,-4.6,6.6),Vv(2.6,-5.0,5.6)],[.7,.8,.7],p),.6),MO(p),-hd(p)+.05)),
             V('beardMoustache','head','hair',p=>tube([Vv(-3.1,-5.9,5.0),Vv(-1.4,-4.7,6.2),Vv(0,-4.5,6.5),Vv(1.4,-4.7,6.2),Vv(3.1,-5.9,5.0)],[.35,.75,.8,.75,.35],p)));
    { // her face: the jaw drawn in softly toward a smaller, rounder chin, and lashes at the outer top of each eye (both only on the female build)
      const ears=p=>Math.min(ell(p,ad(H,Vv(6.2,-1.8,-0.8)),Vv(0.75,1.35,0.9)),ell(p,ad(H,Vv(-6.2,-1.8,-0.8)),Vv(0.75,1.35,0.9))), nape=p=>1.5*cl((H.y-2.0-p.y)/4.5,0,1)*cl((H.z-0.5-p.z)/4.5,0,1);
      const soft=p=>{ const t=cl((H.y-1.0-p.y)/8,0,1), q=Vv(H.x+(p.x-H.x)*(1+.34*t*t+.05),p.y,H.z+(p.z-H.z)*(1+.06*t+.03));
        return sm(rbox(q,H,Vv(5.9,7.7,6.2),4.8+.4*t)+nape(p),R.rcone(q,ad(H,Vv(0,-6.2,1.6)),ad(H,Vv(0,-9.4,.6)),1.7,1.3),1.4); };
      head.form='M'; PCS.push(Object.assign({},head,{n:'headF',d:soft,form:'F',paint:()=>null}));
      const softN=p=>Math.min(soft(p),sm(R.rcone(p,ad(H,Vv(0,-0.7,5.95)),ad(H,Vv(0,-3.1,6.95)),.36,.6),ell(p,ad(H,Vv(0,-3.4,6.4)),Vv(.88,.42,.65)),.45));
      let zf=H.z; while(softN(Vv(H.x+2.6,H.y+1.25,zf))<0&&zf<H.z+12)zf+=.05;
      const lash=s=>p=>Math.min(tube([Vv(s*2.95,1.05,zf-H.z-.25),Vv(s*3.45,1.4,zf-H.z-.5)],[.09,.03],p),tube([Vv(s*2.6,1.15,zf-H.z-.15),Vv(s*2.95,1.55,zf-H.z-.35)],[.08,.03],p));
      let zm=H.z; while(softN(Vv(H.x,H.y-5.3,zm))<0&&zm<H.z+12)zm+=.05;
      PCS.push({n:'lipsF',on:'head',m:'lips',d:p=>Math.min(ell(p,Vv(H.x,H.y-5.05,zm-.3),Vv(1.2,.3,.42)),ell(p,Vv(H.x,H.y-5.55,zm-.32),Vv(1.05,.34,.42))),bb:[H.x-3,H.x+3,H.y-8,H.y-4,zm-2,zm+2],step:.14,cell:.12,form:'F'});
      PCS.push({n:'lashesF',on:'head',m:'pupil',d:p=>Math.min(lash(1)(p),lash(-1)(p)),bb:[H.x-5,H.x+5,H.y-1,H.y+4,H.z+1,H.z+11],step:.14,cell:.12,form:'F'}); }
    { // the ears and the nose are their own pieces on the head, so each can be shaped in the designer; his head is the skull and jaw alone
      const nape=p=>1.7*Math.max(0,Math.min(1,(H.y-2.0-p.y)/4.5))*Math.max(0,Math.min(1,(H.z-0.5-p.z)/4.5));
      head.d=p=>Math.min(rbox(p,H,Vv(6.0,7.8,6.3),4.6)+nape(p),R.rcone(p,ad(H,Vv(0,-6,1.6)),ad(H,Vv(0,-10.5,0.2)),2.4,2.2));
      for(const [n,sx] of [['earL',1],['earR',-1]])PCS.push({n,on:'head',under:'head',m:'skin',d:p=>ell(p,ad(H,Vv(sx*6.25,-1.8,-.8)),Vv(.8,1.45,.95)),bb:[H.x+sx*6.25-2,H.x+sx*6.25+2,H.y-4,H.y+.5,H.z-2.6,H.z+1],step:.25,cell:.2});
      PCS.push({n:'noseM',on:'head',under:'head',m:'skin',d:p=>sm(R.rcone(p,ad(H,Vv(0,-0.5,6.0)),ad(H,Vv(0,-3.2,7.25)),.42,.72),ell(p,ad(H,Vv(0,-3.55,6.55)),Vv(1.05,.5,.75)),.5),bb:[H.x-2,H.x+2,H.y-5,H.y,H.z+4.5,H.z+8.5],step:.2,cell:.16,form:'M'},
               {n:'noseF',on:'head',under:'head',m:'skin',d:p=>sm(R.rcone(p,ad(H,Vv(0,-0.7,5.95)),ad(H,Vv(0,-3.1,6.95)),.36,.6),ell(p,ad(H,Vv(0,-3.4,6.4)),Vv(.88,.42,.65)),.45),bb:[H.x-2,H.x+2,H.y-5,H.y,H.z+4.5,H.z+8.5],step:.2,cell:.16,form:'F'}); }
    { // brows (his heavier and straighter, hers thinner and arched), in the hair's colour, on each face's front
      const RXb=(a,b)=>[(a-13)*.47,(b+1-13)*.47], RYb=(a,b)=>[.7-(b+1-14)*.47,.7-(a-14)*.47], HF=PCS.find(P=>P.n==='headF'), on=(hdx,x,y,r)=>{ let z=H.z+12; while(hdx(Vv(H.x+x,H.y+y,z))>r*.35&&z>H.z)z-=.05; return Vv(x,y,z-H.z); },
        brow=(hdx,r,ar,tilt)=>{ const pts=s=>[[1.2,2.3+tilt],[2.5,2.5+ar],[3.7,2.25+ar*.3-tilt*.3]].map(([x,y])=>{ const q=on(hdx,s*x,y,r); return q; });
          const L=pts(-1), Rr=pts(1); return p=>Math.min(tube(L,[r,r*.95,r*.55],p),tube(Rr,[r,r*.95,r*.55],p)); };
      PCS.push({n:'browsM',on:'head',m:'hair',d:brow(hd,.4,.1,.12),bb:[H.x-6,H.x+6,H.y,H.y+5,H.z,H.z+11],step:.16,cell:.13,form:'M'},
               {n:'browsF',on:'head',m:'hair',d:brow(HF.d,.12,.3,.1),bb:[H.x-6,H.x+6,H.y,H.y+5,H.z,H.z+11],step:.14,cell:.12,form:'F',flatEye:{R2:[{x:RXb(6,9),y:RYb(12,15),m:'hair',o:'brow'}],H,hd:HF.d}}); }
    { const BODY=['torso','neck','sleeveL','sleeveR','upperArmL','upperArmR'].map(n=>PCS.find(P=>P.n===n)).filter(Boolean), clear=p=>Math.min(...BODY.map(P=>P.d(p)));
      const strand=p=>{ const a=th(p), y=p.y-H.y, v=Math.sin(a*17+y*.3+1.7*Math.sin(a*5+y*.15))*Math.sin(a*7.3-y*.21+2.1); return v>.62&&y>-4?'hairHi':v<-.66?'hairLo':null; };
      for(const P of PCS)if(/^(hair|beard)/.test(P.n)&&!P.paint)P.paint=strand;
      for(const P of PCS)if(/^hair/.test(P.n)){ const d0=P.d; P.d=p=>Math.max(d0(p),.6-clear(p)); }
      for(const P of PCS)if(/^beard/.test(P.n))P.layer='beard'; }
    const EYES=[[[7,13,8,14,'eye','o']], [[6,13,8,14,'eyeW'],[7,13,8,14,'eye']], [[6,12,9,15,'eyeW'],[7,12,8,15,'eye'],[7,13,7,13,'pupil'],[8,12,8,12,'eyeW']],
      [[6,13,9,14,'eyeW'],[7,13,8,14,'eye'],[6,12,9,12,'lid']], [[6,12,9,14,'eyeW'],[7,12,8,14,'eye'],[5,11,9,11,'pupil'],[5,12,5,12,'pupil']], [[6,14,6,14,'pupil'],[7,13,7,13,'pupil'],[8,14,8,14,'pupil']], [[6,12,9,15,'eyeW','o'],[7,13,8,14,'eye','o'],[8,13,8,13,'eyeW','o'],[6,12,9,15,'pupil','capd'],[6,12,9,15,'lid','cap']]];
    const U=.47, RX=r=>[(r[0]-13)*U,(r[2]+1-13)*U], RY=r=>[.7-(r[3]+1-14)*U,.7-(r[1]-14)*U];
    EYES.forEach((E,k)=>{ const R2=E.map(r=>({x:RX(r),y:RY(r),m:r[4],o:r[5]})), sx=p=>-Math.abs(p.x-H.x);
      const r2=(p,r)=>{ const x=sx(p), y=p.y-H.y; if(r.o){ const cx=(r.x[0]+r.x[1])/2, cy=(r.y[0]+r.y[1])/2; return Math.hypot(x-cx,y-cy)-(r.x[1]-r.x[0])*.45; } return Math.max(r.x[0]-x,x-r.x[1],r.y[0]-y,y-r.y[1]); };
      PCS.push({n:'eyes'+k,on:'head',m:E[0][4],bb:[H.x-5.5,H.x+5.5,H.y-1.5,H.y+3.5,H.z+1,H.z+12],step:.18,cell:.14,
        d:p=>Math.max(hd(p)-.22,Math.min(...R2.map(r=>r2(p,r))),H.z+2-p.z), paint:p=>{ let m=null; for(const r of R2)if(r2(p,r)<.03)m=r.m; return m; }, flatEye:{R2,H,hd}}); }); } }
  { const J=rest.J, {V,add,rcone}=R, get=n=>PCS.find(P=>P.n===n), LAY={torso:'shirt',sleeveL:'shirt',sleeveR:'shirt',hips:'pants',thighL:'pants',thighR:'pants',shinL:'pants',shinR:'pants',shoeL:'shoes',shoeR:'shoes'};
    for(const P of PCS){ if(LAY[P.n])P.layer=LAY[P.n]; else if(P.n==='hair'||P.on==='hair')P.layer='hair'; }
    const under=(n,src,m,cover,d)=>{ const S=get(src); if(S)PCS.push({n,on:S.on||S.n,m,d:d||(p=>S.d(p)+.35),bb:S.bb,step:S.step,cell:S.cell,under:src,cover}); }, hips=get('hips');
    { const TOR=get('torso'), cz=J.chest.z, sqz=p=>V(p.x,p.y,cz+(p.z-cz)/.78),   // fill the shirt-collar V so the bare chest reads as smooth skin, not a seam
        neck=p=>rcone(sqz(p),add(J.chest,V(0,2.2,0)),add(J.neck,V(0,0.4,0)),3.1,2.4);
      under('bodyTorso','torso','skin',['shirt'],p=>Math.min(TOR.d(p)+.35,neck(p))); }
    if(hips)under('briefs','hips','under',['pants'],p=>Math.min(hips.d(p)+.15,...['L','R'].map(n=>Math.max(get('thigh'+n).d(p)+.15,J['hip'+n].y-3-p.y))));
    for(const n of 'LR'){ const up=(k,y)=>add(J[k+n],V(0,y,0));
      under('bodyThigh'+n,'thigh'+n,'skin',['pants']); under('bodyShin'+n,'shin'+n,'skin',['pants']);
      under('foot'+n,'shoe'+n,'skin',['shoes'],p=>Math.min(rcone(p,up('heel',1.3),up('toe',1),1.55,1.25),rcone(p,J['ankle'+n],up('heel',1.3),1.9,1.6))); }
    { // her body: the torso drawn in at the waist and narrower under the arms, a fuller bust on it; in the shirt, or skin when it's off
      const TOR=get('torso'), BT=get('bodyTorso'), C=J.chest, P0=J.pelvis, wy=P0.y+.38*(C.y-P0.y), cx=C.x, cz=C.z, sq=x=>x*x;
      const pinch=d=>p=>{ const w=Math.exp(-sq((p.y-wy)/3.6)), u=Math.max(0,Math.min(1,(p.y-wy)/(C.y-wy))); return d(V(cx+(p.x-cx)*(1+.24*w+.12*u),p.y,cz+(p.z-cz)*(1+.1*w+.06*u))); };
      TOR.form='M'; BT.form='M';
      PCS.push(Object.assign({},TOR,{n:'torsoF',on:'torso',under:'torso',d:pinch(TOR.d),layer:'shirt',form:'F'}),Object.assign({},BT,{n:'bodyTorsoF',d:pinch(BT.d),form:'F'}));
      const y=C.y-.9, td=pinch(TOR.d); let zf=cz; while(td(V(cx+2.4,y,zf))<0&&zf<cz+12)zf+=.1;
      const sm=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.min(a,b)-h*h*k/4; };
      const bust=t=>p=>sm(R.ell(p,V(cx+2.4,y,zf-.3),V(2.2+t,2.0+t,1.9+t)),R.ell(p,V(cx-2.4,y,zf-.3),V(2.2+t,2.0+t,1.9+t)),.7);
      PCS.push({n:'bustF',on:'torso',m:'shirt',d:bust(.35),bb:[cx-7,cx+7,y-5,y+5,zf-6,zf+5],step:TOR.step,cell:TOR.cell,layer:'shirt',form:'F'},
               {n:'bodyBustF',on:'torso',m:'skin',d:bust(0),bb:[cx-7,cx+7,y-5,y+5,zf-6,zf+5],step:TOR.step,cell:TOR.cell,cover:['shirt'],form:'F'}); } }
  const NP=PCS.length; W3.HIDE=new Array(NP).fill(false); W3.idx=n=>PCS.findIndex(P=>P.n===n); W3.PM={value:PCS.map(()=>new THREE.Matrix4())}; W3.pcs=PCS;
  const MOVE=`attribute float pidx; uniform mat4 uPM[${NP}];`, AT=`mat4 PM=uPM[int(pidx+0.5)];`;
  const VS=MOVE+`attribute vec3 c0,c1,c2,cd; varying vec3 vC0,vC1,vC2,vCd,vN,vW; void main(){ `+AT+` vN=mat3(PM)*normal; vC0=c0; vC1=c1; vC2=c2; vCd=cd; vec4 w=modelMatrix*(PM*vec4(position,1.)); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  const FS=`uniform vec3 uL,uTint; uniform float uLv; uniform mat4 uLVP; uniform sampler2D uSM; uniform int uLook; uniform mat3 uG; uniform vec3 uLP[2],uLC[2],uCamW; varying vec3 vC0,vC1,vC2,vCd,vN,vW;
  float bay(vec2 p){ return fract(sin(dot(floor(vW*21.24+.001),vec3(12.9898,78.233,37.719)))*43758.5453); }
  vec3 room(vec3 nw,out vec3 rimc){ vec3 a=vec3(0.07,0.08,0.11); rimc=vec3(0.); for(int i=0;i<2;i++){ vec3 d=uLP[i]-vW; float k=min(1.,1./(1.+dot(d,d)*0.08)); a+=uLC[i]*max(dot(nw,normalize(d)),0.)*k*3.2; rimc+=uLC[i]*k; } return a; }
  void main(){ float l=dot(normalize(vN),uL); vec3 c;
    if(uLook==1){ float t=l+(bay(gl_FragCoord.xy)-0.5)*0.3; vec3 hi=mix(vC0,vec3(1.,.93,.8)*max(vC0.r,max(vC0.g,vC0.b)),.22), sh=vC2*vec3(.82,.88,1.18);
      gl_FragColor=vec4((t>0.4?hi:t>-0.2?vC1:sh)*uTint,1.); return; }
    if(uLook>=2){ vec3 nw=normalize(uG*vN), rimc; vec3 a=room(nw,rimc); float rim=pow(1.-max(dot(nw,-uCamW),0.),3.);
      float lum=dot(a,vec3(.3,.5,.2)); float steps=uLook==2?3.:5.; float q=uLook==2?max(1./steps,floor(lum*steps+0.5)/steps):max(0.5/steps,floor(lum*steps+0.5+(bay(gl_FragCoord.xy)-0.5)*0.4)/steps);
      vec3 lit=vC1*1.35*mix(vec3(1.),a/max(lum,0.001),0.75)*q; lit+=rimc*(uLook==2?step(0.6,rim):smoothstep(0.35,0.8,rim))*0.5;
      gl_FragColor=vec4(min(lit,vC0*1.05),1.); return; }
    if(uLv<0.5) c=l>-0.3?vC1:vC2;
    else{ int t=l>0.55?0:l>0.05?1:l>-0.4?2:4;
      if(uLv>1.5&&t<2){ vec4 p=uLVP*vec4(vW,1.); vec3 q=p.xyz/p.w*0.5+0.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-0.006>texture2D(uSM,q.xy).r) t=2; }
      c=t==0?vC0:t==1?vC1:t==2?vC2:vCd; }
    gl_FragColor=vec4(c*uTint,1.); }`;
  const IVS=MOVE+`attribute float mat,pid; varying float vm,vd,vp; void main(){ `+AT+` vm=mat; vp=pid; vec4 mv=modelViewMatrix*(PM*vec4(position,1.)); vd=-mv.z; gl_Position=projectionMatrix*mv; }`;
  const IFS=`varying float vm,vd,vp; void main(){ gl_FragColor=vec4(floor(vp+0.5),floor(vm+0.5),0.,vd); }`;
  W3.worn={shirt:true,pants:true,shoes:true,hair:true,beard:true}; W3.style={form:'M',hair:'hair',beard:''};
  // a piece shown for a look (its build, hair, beard) and what is worn; null: not the look's to say (the eyes)
  W3.shows=(P,st,worn)=>{ if(P.form&&P.form!==st.form)return false; const k=st[P.layer];
    if(P.layer==='hair'||P.layer==='beard')return !!k&&!!worn[P.layer]&&(P.n===k||P.n===k+'A'); if(P.layer)return !!worn[P.layer]; if(P.cover)return !P.cover.some(l=>worn[l]); return P.form?true:null; };
  // the other builds, hairstyles and beards are made the first time someone picks them, not at the start
  const later=P=>(!!P.form||P.layer==='hair'||P.layer==='beard')&&!W3.shows(P,W3.style,W3.worn);
  for(const P of PCS){ if(P.flatEye||later(P))continue; const fine=W3.fine(P); W3.warm(P,(P.step||(fine?STEP/2:STEP))*RES,fine,null); }
  const mk=(P,i)=>{ const fine=P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n), g=P.flatEye?flatEyeGeo(P):meshOf(P,(P.step||(fine?STEP/2:STEP))*RES,fine,null), n=g.attributes.position.count;
    g.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(n).fill(i),1)); g.setAttribute('pid',new THREE.BufferAttribute(new Float32Array(n).fill(R.PIECES.indexOf(P.under||P.n)),1)); g.computeBoundingSphere(); return g; };
  const geos=PCS.map((P,i)=>later(P)?null:mk(P,i)), KEYS=Object.keys(geos.find(Boolean).attributes), all=new THREE.BufferGeometry(), RG=[];
  const build=()=>{ const G=geos.filter(Boolean); for(const k of KEYS){ const sz=G[0].attributes[k].itemSize, arr=new Float32Array(G.reduce((a,g)=>a+g.attributes[k].array.length,0)); let o=0; for(const g of G){ arr.set(g.attributes[k].array,o); o+=g.attributes[k].array.length; } all.setAttribute(k,new THREE.BufferAttribute(arr,sz)); }
    if(all.attributes.color)all.setAttribute('color',all.attributes.c1.clone());
    RG.length=0; let o=0; for(const g of geos){ const n=g?g.attributes.position.count:0; RG.push([o,n]); o+=n; }
    W3.tris=all.attributes.position.count/3; W3.BS=geos.map(g=>g?g.boundingSphere:new THREE.Sphere()); };
  build();
  { W3.reindex=()=>{ let n=0; for(let i=0;i<RG.length;i++)if(!W3.HIDE[i])n+=RG[i][1]; const I=new Uint32Array(n); let k=0; for(let i=0;i<RG.length;i++){ if(W3.HIDE[i])continue; const [a,c]=RG[i]; for(let v=0;v<c;v++)I[k++]=a+v; }
      all.setIndex(new THREE.BufferAttribute(I,1)); W3.trisWorn=n/3; };
    W3.dress=()=>{ let made=false; PCS.forEach((P,i)=>{ const v=W3.shows(P,W3.style,W3.worn); if(v!==null)W3.HIDE[i]=!v; if(W3.noHead&&(P.on==='head'||P.on==='hair'||/^(head|hair|beard|eyes)/.test(P.n)))W3.HIDE[i]=true; if(!W3.HIDE[i]&&!geos[i]){ geos[i]=mk(P,i); made=true; } }); if(made){ build(); if(W3.recolor)W3.recolor(); } W3.reindex(); };
    W3.setHead=on=>{ W3.noHead=!on; W3.dress(); };
    W3.wear=(l,on)=>{ if(l in W3.worn){ W3.worn[l]=!!on; W3.dress(); } }; W3.dress(); }
  const U={uPM:W3.PM,uL:{value:W3.L},uTint:{value:W3.tint},uLv:W3.lv,uLVP:W3.LVP,uSM:{value:W3.sm.depthTexture},uLook:W3.look,uG:W3.G,uLP:W3.LP,uLC:W3.LC,uCamW:W3.CamW};
  const m=new THREE.Mesh(all,new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,side:THREE.DoubleSide,uniforms:U}));
  const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=W3.PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'w3dist'+NP;
  const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=W3.PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'w3depth'+NP;
  m.customDepthMaterial=depth;
  m.customDistanceMaterial=dist; m.matrixAutoUpdate=true; m.castShadow=true; m.frustumCulled=false;
  W3.idMat=new THREE.ShaderMaterial({vertexShader:IVS,fragmentShader:IFS,side:THREE.DoubleSide,uniforms:{uPM:W3.PM}});
  W3.depthMat=new THREE.ShaderMaterial({vertexShader:MOVE+`void main(){ `+AT+` gl_Position=projectionMatrix*modelViewMatrix*(PM*vec4(position,1.)); }`,fragmentShader:`void main(){ gl_FragColor=vec4(0.); }`,side:THREE.DoubleSide,uniforms:{uPM:W3.PM}});
  all.setAttribute('color',all.attributes.c1.clone());
  const G3=new THREE.DataTexture(new Uint8Array([70,70,70,255,160,160,160,255,255,255,255,255]),3,1,THREE.RGBAFormat); G3.magFilter=G3.minFilter=THREE.NearestFilter; G3.needsUpdate=true; W3.G3=G3;
  W3.celHue=+(new URLSearchParams(location.search).get('hue')??1); const GP=new THREE.DataTexture(new Uint8Array(48),12,1,THREE.RGBAFormat); GP.magFilter=GP.minFilter=THREE.NearestFilter; W3.GP=GP; W3.uSelf={value:.7};
  W3.setShade=(n,dp,sm)=>{ sm=false; n=Math.max(2,Math.min(12,Math.round(n))); dp=Math.max(.02,Math.min(.98,dp)); if(sm==null)sm=W3.shade?W3.shade.smooth:W3.smooth0; W3.shade={steps:n,depth:dp,smooth:false,cel:1};
    const w=sm?32:n, f=sm?THREE.LinearFilter:THREE.NearestFilter, d=new Uint8Array(w*4); for(let i=0;i<w;i++){ const v=255*((1-dp)+dp*i/(w-1)), k=W3.celHue*(1-i/(w-1)); d.set([Math.round(v*(1-.18*k)),Math.round(v*(1-.1*k)),Math.min(255,Math.round(v*(1+.2*k))),255],i*4); }
    if((GP.image&&GP.image.width)!==w||GP.magFilter!==f)GP.dispose(); GP.magFilter=GP.minFilter=f; GP.image={data:d,width:w,height:1}; GP.needsUpdate=true; W3.uSelf.value=W3.selfOff?1:1-dp*.55; try{ SAVE.set('shade',JSON.stringify(W3.shade)); }catch(e){} };
  W3.smooth0=false;
  W3.selfOff=true; try{ W3.selfOff=SAVE.get('self')!=='1'; }catch(e){}
  W3.setSelf=on=>{ W3.selfOff=!on; W3.smClr=false; W3.uSelf.value=on?1-W3.shade.depth*.55:1; try{ SAVE.set('self',on?'1':'0'); }catch(e){} };
  { let s0={steps:4,depth:.78}; try{ const v=SAVE.get('shade'); if(v)s0=JSON.parse(v); }catch(e){} const P=new URLSearchParams(location.search); let bd=null; try{ bd=+SAVE.get('bands'); }catch(e){} if(!s0.cel){ s0={steps:Math.max(3,Math.min(5,+(P.get('cel')||bd||4))),depth:.72,cel:1}; } W3.setShade(s0.steps,s0.depth,false); }
  W3.PAT={value:[0,1,2].map(()=>new THREE.Vector4(0,1,-9,0))}; W3.PB={value:[0,1,2].map(()=>new THREE.Vector3(1,1,1))}; W3.uRim={value:0}; W3.uFl={value:0}; W3.moon={value:0}; W3.moonC={value:new THREE.Color(.45,.62,1)};
  // the moon's edge on every body at night (owner, 9 Nov 2026): one snippet each body's shader adds; no body lights itself
  W3.mark={value:0}; W3.YES={value:1};
// pl: a player's body, its pixels marked (alpha .5) so the night look (138) leaves it as lit; W3.mark is on only while the main picture is drawn
W3.rim=(sh,pl)=>{ sh.uniforms.uMoon=W3.moon; sh.uniforms.uMoonC=W3.moonC; if(pl){ sh.uniforms.uPl=pl; sh.uniforms.uMark=W3.mark; sh.fragmentShader='uniform float uPl,uMark;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n if(uPl*uMark>.5)gl_FragColor.a=.5;'); } sh.fragmentShader='uniform float uMoon; uniform vec3 uMoonC;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n if(uMoon>0.){ vec3 vdM=isOrthographic?vec3(0.,0.,1.):normalize(vViewPosition); totalEmissiveRadiance+=uMoonC*uMoon*pow(1.-abs(dot(normalize(normal),vdM)),2.2); }'); }; W3.uHatCut={value:1e9};
  const HMI=['hair','hairHi','hairLo'].map(n=>MATS.indexOf(n)), HAIRF='('+HMI.map(i=>'abs(vMt-'+i+'.)<.5').join('||')+')';
  const PATG=`uniform vec4 uPat[3]; uniform vec3 uPB[3]; uniform float uRim,uHatCut; varying float vMt; varying vec3 vPL;
  float pH(vec3 q){ return fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453); }
  float pN(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(pH(i),pH(i+vec3(1,0,0)),f.x),mix(pH(i+vec3(0,1,0)),pH(i+vec3(1,1,0)),f.x),f.y),mix(mix(pH(i+vec3(0,0,1)),pH(i+vec3(1,0,1)),f.x),mix(pH(i+vec3(0,1,1)),pH(i+vec3(1,1,1)),f.x),f.y),f.z); }
  float patW(float t,vec3 p){ float h=p.x+p.z;
    if(t<1.5)return step(.5,fract(p.y));
    if(t<2.5)return clamp(step(.62,fract(p.y))*.5+step(.62,fract(h))*.5+step(.9,fract(p.y*3.+.15))*.45+step(.9,fract(h*3.+.15))*.45,0.,1.);
    if(t<3.5){ float u=h*.7071+p.y*.5, v=h*.7071-p.y*.5; return step(.5,fract(u*5.))*.5+step(.55,fract(v*7.))*.2+step(.93,pH(floor(vec3(u,v,0.)*9.)))*.3; }
    if(t<4.5){ float c=abs(fract(h*1.4)-.5); return step(.5,fract(p.y*2.+c*2.))*.75; }
    if(t<5.5){ float n=pN(p*.7)+pN(p*1.8+7.)*.5; return n>1.?1.:n>.78?.5:0.; }
    return step(length(fract(p+vec3(0.,.5*step(.5,fract(p.y*.5)),0.))-.5),.27); }`;
  const toon=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:GP,side:THREE.DoubleSide});
  toon.onBeforeCompile=sh=>{ sh.uniforms.uPM=W3.PM; sh.vertexShader='attribute float mat; varying float vMt; varying vec3 vPL;\n'+MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz; vMt=mat; vPL=position;');
    sh.uniforms.uPat=W3.PAT; sh.uniforms.uPB=W3.PB; sh.uniforms.uRim=W3.uRim; sh.uniforms.uHatCut=W3.uHatCut;
    sh.fragmentShader=PATG+'\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n if(vPL.y>uHatCut&&'+HAIRF+')discard;\n for(int i=0;i<3;i++) if(uPat[i].x>.5&&abs(vMt-uPat[i].z)<.5) diffuseColor.rgb=mix(diffuseColor.rgb,uPB[i],patW(uPat[i].x,vPL*uPat[i].y));')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n if(uRim>0.){ vec3 vd=isOrthographic?vec3(0.,0.,1.):normalize(vViewPosition); totalEmissiveRadiance+=mix(diffuseColor.rgb,vec3(1.),.4)*uRim*pow(1.-abs(dot(normalize(vNormal),vd)),3.); }');
    sh.uniforms.uLv=W3.lv; sh.uniforms.uLVP=W3.LVP; sh.uniforms.uSM={value:W3.sm.depthTexture}; sh.uniforms.uSelf=W3.uSelf;
    sh.vertexShader='varying vec3 vWW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWW=(modelMatrix*vec4(transformed,1.)).xyz;').replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.replace(/(directional|point|spot)LightShadows\[ i \]\.shadowNormalBias/g,'($&+.18)'));
    sh.uniforms.uFl=W3.uFl; sh.fragmentShader='uniform float uLv,uSelf,uFl; uniform mat4 uLVP; uniform sampler2D uSM; varying vec3 vWW;\n'+sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;')
      .replace('#include <opaque_fragment>','#include <opaque_fragment>\n if(uLv>1.5){ vec4 sp=uLVP*vec4(vWW,1.); vec3 q=sp.xyz/sp.w*0.5+0.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-0.006>texture2D(uSM,q.xy).r) gl_FragColor.rgb*=uSelf; }\n { float ld=max(dot(diffuseColor.rgb,vec3(.3,.5,.2)),.001), r=dot(gl_FragColor.rgb,vec3(.3,.5,.2))/ld, q=r<1.?max(uFl,floor(r*4.+.35)/4.):r; gl_FragColor.rgb=r<.02?diffuseColor.rgb*q:gl_FragColor.rgb*q/r; }'); W3.rim(sh,W3.YES); };
  toon.customProgramCacheKey=()=>'w3toon'+NP; W3.flat=m.material; W3.toon=toon; m.receiveShadow=true;
  W3.group.add(m); W3.meshes.push(m); W3.mesh=m;
  scene.add(LEVELS.own(W3.group,'*'));
  const LIGHT=nrm(V(-0.55,0.75,0.5)), m4=new THREE.Matrix4();
  W3.SZ=W3.BASE=1.2; W3.rest=rest;   // BASE: every body's size; SZ: yours (a shrink or grow mushroom changes only it)
  { const H0=PCS.findIndex(P=>P.n==='head'), HF=PCS.findIndex(P=>P.n==='headF'), EYEL=new THREE.Vector3(); W3.headIdx=()=>W3.HIDE[H0]&&HF>=0?HF:H0; W3.eyeAt=out=>{ const HI=W3.headIdx(); if(HI<0||!W3.mesh)return null; W3.mesh.updateWorldMatrix(true,false); return out.copy(EYEL.set(0,2,7)).applyMatrix4(W3.PM.value[HI]).applyMatrix4(W3.mesh.matrixWorld); }; }
  W3.hideMe=W3.hideMeQ=!!QS.get('hideme');
  W3.body={place:()=>{}};
  W3.place=(B,x,y,z,hd,yawA,ZY)=>{ W3.lastB=B; if(W3.hideMe)W3.group.traverse(o=>{ if(o.isMesh)o.visible=false; }); W3.group.position.set(x,y,z); W3.group.rotation.set(0,hd,0); W3.group.scale.set(W3.SZ/PPU,ZY*W3.SZ*(W3.BH||1),W3.SZ/PPU);
    const L=R.yaw(LIGHT,-yawA); W3.L.set(L.x,L.y,L.z);
    W3.G.value.set(Math.cos(hd),0,Math.sin(hd),0,1,0,-Math.sin(hd),0,Math.cos(hd)); SHL.forEach((S,i)=>{ W3.LP.value[i].copy(S.position);
      const k=1;
      W3.LC.value[i].set(S.color.r,S.color.g,S.color.b).multiplyScalar(Math.min(1.5,S.intensity/2)*k); });
    if(typeof SHARED.cam!=='undefined')SHARED.cam.getWorldDirection(W3.CamW.value);
    if(!W3.realL||!(W3.Lw.lengthSq()>.5))W3.Lw.set(L.x/PPU,L.y*ZY,L.z/PPU).applyAxisAngle(new THREE.Vector3(0,1,0),hd).normalize();
    const mid=(W3.MID||(W3.MID=new THREE.Vector3())).set(x,y+1.25,z); W3.smCam.position.copy(mid).addScaledVector(W3.Lw,6); W3.smCam.up.set(0,Math.abs(W3.Lw.y)>.6?0:1,Math.abs(W3.Lw.y)>.6?1:0); W3.smCam.lookAt(mid); W3.smCam.updateMatrixWorld();
    W3.LVP.value.multiplyMatrices(W3.smCam.projectionMatrix,W3.smCam.matrixWorldInverse);
    PCS.forEach((P,i)=>{ const F=R.frameOf(P.on||P.n,B); W3.PM.value[i].set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1); if(W3.E&&W3.E[i])W3.applyE(W3.PM.value[i],W3.E[i],F.o); if(W3.HIDE[i])W3.PM.value[i].makeScale(0,0,0); }); };
  { const place0=W3.place; W3.place=(...a)=>{ place0(...a); W3.group.updateMatrixWorld(true); const now=performance.now(), hdt=Math.min(.05,(now-(W3.hairT||now))/1000); W3.hairT=now;
      PCS.forEach((P,i)=>{ if(P.swing&&!W3.HIDE[i])swing(P,i,hdt); }); W3.body.place(a[0]); }; }
  const SW={fw:new THREE.Vector3(),pv:new THREE.Vector3(),ax:new THREE.Vector3(),p:new THREE.Vector3(),M3:new THREE.Matrix4(),pW:new THREE.Vector3(),rest:new THREE.Vector3(),m:new THREE.Vector3(),v:new THREE.Vector3(),d:new THREE.Vector3(),q:new THREE.Quaternion(),M1:new THREE.Matrix4(),M2:new THREE.Matrix4(),inv:new THREE.Matrix3(),G:new THREE.Vector3()};
  function swing(P,i,dt){ '@later'; const S=P.swing, st=P.sw||(P.sw={m:null,pm:new THREE.Vector3()}), PM=W3.PM.value[i], GW=W3.group.matrixWorld;
    SW.inv.setFromMatrix4(GW).invert(); const sy=W3.group.scale.y, L=S.len*sy;
    SW.pW.set(S.pivot[0],S.pivot[1],S.pivot[2]).applyMatrix4(PM).applyMatrix4(GW);
    SW.rest.set(S.rest[0],S.rest[1],S.rest[2]).transformDirection(PM).transformDirection(GW);
    if(!st.m||dt<=0){ st.m=SW.m.copy(SW.pW).addScaledVector(SW.rest,L).clone(); st.pm.copy(st.m); st.pp=SW.pW.clone(); return; }
    const pv=st.pp?SW.pv.subVectors(SW.pW,st.pp):SW.pv.set(0,0,0); (st.pp||(st.pp=new THREE.Vector3())).copy(SW.pW);
    SW.v.subVectors(st.m,st.pm).sub(pv).multiplyScalar(Math.max(0,1-4.5*dt)).add(pv); st.pm.copy(st.m);
    SW.G.copy(SW.pW).addScaledVector(SW.rest,L).sub(st.m).multiplyScalar(S.k*dt*dt); st.m.add(SW.v).add(SW.G); st.m.y-=7*dt*dt;
    SW.d.subVectors(st.m,SW.pW); if(SW.d.lengthSq()<1e-9)SW.d.copy(SW.rest); SW.d.normalize();
    if(S.back){ SW.fw.set(0,0,1).transformDirection(PM).transformDirection(GW); const f=SW.d.dot(SW.fw)-SW.rest.dot(SW.fw); if(f>0)SW.d.addScaledVector(SW.fw,-f).normalize(); }
    const a=SW.d.angleTo(SW.rest); if(a>S.max){ SW.q.setFromUnitVectors(SW.rest,SW.d); const ax=SW.ax.crossVectors(SW.rest,SW.d).normalize(); SW.d.copy(SW.rest).applyAxisAngle(ax,S.max); }
    st.m.copy(SW.pW).addScaledVector(SW.d,L);
    if(a<.004&&SW.v.lengthSq()<1e-8){ st.m.copy(SW.pW).addScaledVector(SW.rest,L); st.pm.copy(st.m); return; }
    const dl=SW.d.clone().applyMatrix3(SW.inv).normalize(), rl=SW.rest.clone().applyMatrix3(SW.inv).normalize(); SW.q.setFromUnitVectors(rl,dl);
    const p=SW.p.set(S.pivot[0],S.pivot[1],S.pivot[2]).applyMatrix4(PM);
    SW.M1.makeTranslation(p.x,p.y,p.z).multiply(SW.M2.makeRotationFromQuaternion(SW.q)).multiply(SW.M3.makeTranslation(-p.x,-p.y,-p.z)); PM.premultiply(SW.M1); }
}
const OUTL={rt:new THREE.WebGLRenderTarget(4,4,{type:THREE.FloatType,format:THREE.RGBAFormat,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter}),
  occ:new THREE.ShaderMaterial({vertexShader:`varying float vd; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vd=-mv.z; gl_Position=projectionMatrix*mv; }`,fragmentShader:`varying float vd; void main(){ gl_FragColor=vec4(-1.,0.,0.,vd); }`,side:THREE.DoubleSide})};
OUTL.pass={uniforms:{tDiffuse:{value:null},tId:{value:OUTL.rt.texture},px:{value:new THREE.Vector2(1,1)},cols:{value:Array.from({length:64},()=>new THREE.Vector3())},
    legs:{value:W3.legs.concat(Array(Math.max(0,64-W3.legs.length)).fill(0)).slice(0,64)},tint:{value:W3.tint},t1:{value:3.5/PPU},t2:{value:1.6/PPU},wid:{value:1},oc:{value:new THREE.Vector3()},ocK:{value:0}},
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`uniform sampler2D tDiffuse,tId; uniform vec2 px; uniform vec3 cols[64]; uniform float legs[64]; uniform vec3 tint; uniform float t1,t2,wid,ocK; uniform vec3 oc; varying vec2 vUv;
  bool edgeTo(vec4 c,vec2 o){ vec4 q=texture2D(tId,vUv+o*px*wid); if(q.x<0.)return q.w>c.w+0.05; if(abs(q.x-c.x)<0.5)return false;
    if(q.w-c.w>(abs(q.y-c.y)<0.5?t1:t2))return true; float a=legs[int(c.x+0.5)], b=legs[int(q.x+0.5)]; return a>0.&&b>0.&&a!=b&&q.w>=c.w; }
  void main(){ vec4 c=texture2D(tId,vUv); vec4 base=texture2D(tDiffuse,vUv); if(c.x<0.){ gl_FragColor=base; return; }
    bool e=edgeTo(c,vec2(1,0))||edgeTo(c,vec2(-1,0))||edgeTo(c,vec2(0,1))||edgeTo(c,vec2(0,-1)); gl_FragColor=e?vec4(mix(cols[int(c.y+0.5)]*tint,oc,ocK),1.):base; }`};
// the Walker's box on screen plus the outline's reach (pixels from the top left): the outline reads nothing outside it; null draws it all
OUTL.rect=(cam,w,h)=>{ '@later'; const me=W3.mesh; if(!cam.isOrthographicCamera||cam.view||!me||!me.visible||!W3.group.visible)return null;
  let only=true; W3.group.traverseVisible(o=>{ if(o!==me&&(o.isMesh||o.isLine||o.isPoints||o.isSprite))only=false; }); if(!only)return null;
  const M=me.matrixWorld, sc=M.getMaxScaleOnAxis(), kx=w*cam.zoom/(cam.right-cam.left), ky=h*cam.zoom/(cam.top-cam.bottom), v=OUTL.v||(OUTL.v=new THREE.Vector3()); let x0=1e9, y0=1e9, x1=-1e9, y1=-1e9;
  for(let i=0;i<W3.BS.length;i++){ if(W3.HIDE[i])continue; const S=W3.BS[i], P=W3.PM.value[i], r=S.radius*P.getMaxScaleOnAxis()*sc; v.copy(S.center).applyMatrix4(P).applyMatrix4(M).project(cam);
    const px=(v.x+1)/2*w, py=(1-v.y)/2*h; x0=Math.min(x0,px-r*kx); x1=Math.max(x1,px+r*kx); y0=Math.min(y0,py-r*ky); y1=Math.max(y1,py+r*ky); }
  const m=OUTL.pass.uniforms.wid.value+3; x0=Math.max(0,Math.floor(x0-m)); y0=Math.max(0,Math.floor(y0-m)); x1=Math.min(w,Math.ceil(x1+m)); y1=Math.min(h,Math.ceil(y1+m));
  return x1>x0&&y1>y0?[x0,y0,x1-x0,y1-y0]:null; };
OUTL.render=(renderer,scene,cam)=>{ '@later'; { const C=OUTL.pass.uniforms.cols.value; for(let i=0;i<C.length&&i<W3.ramp.length;i++){ const r=W3.ramp[i][3]; C[i].set(r.r,r.g,r.b); } } const w=renderer.domElement.width, h=renderer.domElement.height, rt=OUTL.rt; if(rt.width!==w||rt.height!==h)rt.setSize(w,h); OUTL.pass.uniforms.px.value.set(1/w,1/h);
  const ac=renderer.autoClear; rt.viewport.set(0,0,w,h); rt.scissorTest=false; renderer.setRenderTarget(rt); renderer.state.buffers.color.setClear(-2,0,0,1e9); renderer.clear(true,true,false);
  const rc=OUTL.rect(cam,w,h); if(rc){ const sub=OUTL.sub||(OUTL.sub=cam.clone()); sub.copy(cam); sub.setViewOffset(w,h,rc[0],rc[1],rc[2],rc[3]); sub.updateMatrixWorld(); cam=sub;
    rt.viewport.set(rc[0],h-rc[1]-rc[3],rc[2],rc[3]); rt.scissor.copy(rt.viewport); rt.scissorTest=true; renderer.setRenderTarget(rt); }
  const cut=(OUTL.hidden?OUTL.hidden():[]).filter(Boolean); for(const o of cut)o.visible=false; const gv=W3.group.visible; W3.group.visible=false; scene.overrideMaterial=OUTL.occ; const bg=scene.background; scene.background=null; renderer.autoClear=false; renderer.render(scene,cam); scene.overrideMaterial=null; scene.background=bg; W3.group.visible=gv; for(const o of cut)o.visible=true;
  const m0=W3.mesh.material; W3.mesh.material=W3.idMat; renderer.render(W3.group,cam); W3.mesh.material=m0;
  renderer.autoClear=ac; rt.viewport.set(0,0,w,h); rt.scissorTest=false; renderer.setRenderTarget(null); };

W3.shadowPass=renderer=>{ SYS.run('shadowPre',renderer); W3.shadowBase(renderer); SYS.run('shadow',renderer); }; W3.shadowBase=renderer=>{ if(W3.lv.value<1.5)return; if(W3.selfOff){ if(!W3.smClr){ W3.smClr=true; renderer.setRenderTarget(W3.sm); renderer.clear(); renderer.setRenderTarget(null); } return; } const m0=W3.mesh.material; W3.mesh.material=W3.depthMat;
  renderer.setRenderTarget(W3.sm); renderer.clear(); renderer.render(W3.group,W3.smCam); renderer.setRenderTarget(null); W3.mesh.material=m0; };
window.W3=W3;
export {OUTL};

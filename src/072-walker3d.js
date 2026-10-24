// THE WALKER'S BODY: pieces built from shapes (meshOf0: distance fields, tetrahedra, simplify), warmed before first use.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, LEVELS, W3} from './003b-systems.js';
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
  W3.lite=QS.get('walker')==='lite';
  W3.smooth=QS.has('smooth')?+QS.get('smooth'):6;   // Taubin passes that smooth each piece's lines (0 = the raw marched mesh)
  W3.ramp=ramp; W3.meshOf=(P,step,fine,RB)=>meshOf(P,step,fine,RB); W3.legs=R.PIECES.map(n=>/^(thigh|shin|shoe)/.test(n)?(n.endsWith('L')?1:2):0);
  const PRE=new WeakMap(); W3.warm=(P,step,fine,RB)=>{ PRE.set(P,{step,fine,RB,g:meshOf0(P,step,fine,RB)}); };
  W3.fine=P=>P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n);
  function meshOf(P,step,fine,RB){ const c=PRE.get(P); if(c&&c.step===step&&c.fine===fine&&c.RB===RB){ PRE.delete(P); return c.g; } return meshOf0(P,step,fine,RB); }
  function meshOf0(P,step,fine,RB){ const bb=P.bb||[-13,13,-1,55,-11,13], nx=Math.ceil((bb[1]-bb[0])/step)+2, ny=Math.ceil((bb[3]-bb[2])/step)+2, nz=Math.ceil((bb[5]-bb[4])/step)+2;
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
    const F=P.F0||R.frameOf(P.on||P.n,RB||rest), raw=[], mats=[];
    const vert=p=>{ const e=0.02, g=nrm(V(P.d(V(p.x+e,p.y,p.z))-P.d(V(p.x-e,p.y,p.z)),P.d(V(p.x,p.y+e,p.z))-P.d(V(p.x,p.y-e,p.z)),P.d(V(p.x,p.y,p.z+e))-P.d(V(p.x,p.y,p.z-e))));
      const l=sub(add(p,mul(g,OUT)),F.o); return [dot(l,F.x),dot(l,F.y),dot(l,F.z),dot(g,F.x),dot(g,F.y),dot(g,F.z),MATS.indexOf(P.paint&&P.paint(p)||P.m)]; };
    const VC=new Map(), NT=nx*ny*nz, emit=r=>{ raw.push(r[0],r[1],r[2],r[3],r[4],r[5]); mats.push(r[6]); };
    const OF=CO.map(([a,b,c])=>(a*ny+b)*nz+c);
    const cv8=[0,0,0,0,0,0,0,0], cg8=[0,0,0,0,0,0,0,0], ins=[0,0,0,0], out=[0,0,0,0]; let ci=0, cj=0, ck=0;
    const E=(a,b)=>{ const key=cg8[a]*NT+cg8[b]; let r=VC.get(key); if(!r){ const va=cv8[a], f=va/(va-cv8[b]), A=CO[a], B=CO[b], ax=bb[0]+(ci+A[0])*step, ay=bb[2]+(cj+A[1])*step, az=bb[4]+(ck+A[2])*step, bx=bb[0]+(ci+B[0])*step, by=bb[2]+(cj+B[1])*step, bz=bb[4]+(ck+B[2])*step;
      r=vert(V(ax+(bx-ax)*f,ay+(by-ay)*f,az+(bz-az)*f)); VC.set(key,r); } return r; };
    for(let i=r0[0];i<r1[0]-1;i++)for(let j=r0[1];j<r1[1]-1;j++)for(let k=r0[2];k<r1[2]-1;k++){ const o=I(i,j,k); let np=0, nn=0; for(let c=0;c<8;c++){ const x=val[o+OF[c]]; if(x>0)np++; else if(x<=0)nn++; } if(np===8||nn===8)continue; for(let c=0;c<8;c++){ cv8[c]=val[o+OF[c]]; cg8[c]=o+OF[c]; } ci=i; cj=j; ck=k;
      for(const t of TET){ let ni=0, no=0; for(let q=0;q<4;q++){ const c=t[q]; if(cv8[c]<=0)ins[ni++]=c; if(cv8[c]>0)out[no++]=c; } if(!ni||!no)continue;
        if(ni===1){ emit(E(ins[0],out[0])); emit(E(ins[0],out[1])); emit(E(ins[0],out[2])); }
        else if(ni===3){ emit(E(out[0],ins[0])); emit(E(out[0],ins[1])); emit(E(out[0],ins[2])); }
        else { const a=E(ins[0],out[0]),b=E(ins[0],out[1]),c=E(ins[1],out[1]),d=E(ins[1],out[0]); emit(a); emit(b); emit(c); emit(a); emit(c); emit(d); } } }
    const fit0=R.fitPts(P.n,new Float32Array(raw)), {fit,mats:mts}=simplify(fit0,mats,(P.cell||CELL*(fine?0.5:1))*(/^(head|hair|eye|nose|ear|mouth)/.test(P.n)?1:1.42)); mats.length=0; for(const q of mts)mats.push(q); const n=fit.length/6, pos=new Float32Array(n*3), nor=new Float32Array(n*3), c0=new Float32Array(n*3), c1=new Float32Array(n*3), c2=new Float32Array(n*3), cd=new Float32Array(n*3), mt=new Float32Array(n);
    for(let i=0;i<n;i++){ pos.set([fit[i*6],fit[i*6+1],fit[i*6+2]],i*3); nor.set([fit[i*6+3],fit[i*6+4],fit[i*6+5]],i*3); const r=ramp[mats[i]]||ramp[0]; c0.set([r[0].r,r[0].g,r[0].b],i*3); c1.set([r[1].r,r[1].g,r[1].b],i*3); c2.set([r[2].r,r[2].g,r[2].b],i*3); cd.set([(r[2].r+r[3].r)/2,(r[2].g+r[3].g)/2,(r[2].b+r[3].b)/2],i*3); mt[i]=mats[i]; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    g.setAttribute('c0',new THREE.BufferAttribute(c0,3)); g.setAttribute('cd',new THREE.BufferAttribute(cd,3)); g.setAttribute('c1',new THREE.BufferAttribute(c1,3)); g.setAttribute('c2',new THREE.BufferAttribute(c2,3)); g.setAttribute('mat',new THREE.BufferAttribute(mt,1)); return g; }
  function simplify(fit,mats,cell){ const n=fit.length/6, key=new Map(), cid=new Int32Array(n), acc=[];
    for(let i=0;i<n;i++){ const fx=Math.floor(fit[i*6]/cell), fy=Math.floor(fit[i*6+1]/cell), fz=Math.floor(fit[i*6+2]/cell), m=mats[i], k=Math.abs(fx)<5e3&&Math.abs(fy)<5e3&&Math.abs(fz)<5e3&&m>=0&&m<256?(((fx+5e3)*1e4+fy+5e3)*1e4+fz+5e3)*256+m:fx+'|'+fy+'|'+fz+'|'+m; let c=key.get(k); if(c==null){ c=acc.length; key.set(k,c); acc.push({p:[0,0,0],nn:[0,0,0],k:0,m:mats[i]}); }
      const a=acc[c]; for(let q=0;q<3;q++){ a.p[q]+=fit[i*6+q]; a.nn[q]+=fit[i*6+3+q]; } a.k++; cid[i]=c; }
    const NC=acc.length, px=new Float64Array(NC), py=new Float64Array(NC), pz=new Float64Array(NC);
    for(let c=0;c<NC;c++){ const a=acc[c]; px[c]=a.p[0]/a.k; py[c]=a.p[1]/a.k; pz[c]=a.p[2]/a.k; }
    const tri=[]; for(let i=0;i<n;i+=3){ const a=cid[i],b=cid[i+1],c=cid[i+2]; if(a!==b&&b!==c&&a!==c)tri.push(a,b,c); }
    const SM=W3.smooth|0;
    // smooth each piece's lines: Taubin (shrink-free) over the welded mesh; a vertex on an open edge follows only that boundary curve, so an outline (an eye, a collar) cleans up without the shell caving in
    if(SM>0&&tri.length){ const nb=[], bnb=[], bnd=new Uint8Array(NC), ec=new Map();
      for(let c=0;c<NC;c++){ nb.push(new Set()); bnb.push([]); }
      for(let t=0;t<tri.length;t+=3){ const a=tri[t],b=tri[t+1],c=tri[t+2]; nb[a].add(b);nb[a].add(c);nb[b].add(a);nb[b].add(c);nb[c].add(a);nb[c].add(b);
        for(let e=0;e<3;e++){ const u=tri[t+e], v=tri[t+(e+1)%3], k=u<v?u*NC+v:v*NC+u; ec.set(k,(ec.get(k)||0)+1); } }
      for(const [k,ct] of ec)if(ct===1){ const a=Math.floor(k/NC), b=k%NC; bnd[a]=bnd[b]=1; bnb[a].push(b); bnb[b].push(a); }
      const qx=new Float64Array(NC), qy=new Float64Array(NC), qz=new Float64Array(NC);
      const pass=lam=>{ for(let c=0;c<NC;c++){ const src=bnd[c]?bnb[c]:nb[c]; let sx=0,sy=0,sz=0,k=0;
          for(const d of src){ sx+=px[d];sy+=py[d];sz+=pz[d];k++; }
          if(k){ qx[c]=px[c]+lam*(sx/k-px[c]); qy[c]=py[c]+lam*(sy/k-py[c]); qz[c]=pz[c]+lam*(sz/k-pz[c]); } else { qx[c]=px[c];qy[c]=py[c];qz[c]=pz[c]; } }
        px.set(qx); py.set(qy); pz.set(qz); };
      for(let it=0;it<SM;it++){ pass(.5); pass(-.53); } }
    const out=new Float32Array(tri.length*6), om=[];   // smoothed positions; the SDF-gradient normals as before (consistent, no shading specks)
    for(let i=0;i<tri.length;i++){ const c=tri[i], a=acc[c], l=Math.hypot(a.nn[0],a.nn[1],a.nn[2])||1;
      out[i*6]=px[c]; out[i*6+1]=py[c]; out[i*6+2]=pz[c]; out[i*6+3]=a.nn[0]/l; out[i*6+4]=a.nn[1]/l; out[i*6+5]=a.nn[2]/l; om.push(a.m); }
    return {fit:out,mats:om}; }
  const around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
  function liteShell(){ '@later'; const J=rest.J, {V,add,sub,mul,ell,rcone,rbox,box}=R, P=[], put=(n,m,d,ps,mrg,st,cl)=>P.push({n,m,d,bb:around(ps,mrg),step:st,cell:cl});
    const sw=Math.abs(J.shoulderL.x)*0.72+2.2, hc=add(J.head,mul(sub(J.headTop,J.head),0.44)), hr=V(5.3,6.1,5.6), hhc=add(hc,V(0,0.9,-0.5));
    put('head','skin',p=>ell(p,hc,hr),[J.head,J.headTop],7,1.5,1.5);
    put('hair','hair',p=>Math.max(ell(p,hhc,V(hr.x+0.6,hr.y+0.5,hr.z+0.8)),(hc.y-2.0)-p.y,p.z-(hc.z+2.0)),[J.head,J.headTop],8,1.7,1.9);
    put('neck','skin',p=>rcone(p,J.neck,J.headBase,2.6,2.2),[J.neck,J.headBase],4,1.6,2.0);
    const tc=add(mul(add(J.chest,J.pelvis),0.5),V(0,0.3,0)), th=V(sw,(J.chest.y-J.pelvis.y)/2+2.4,4.4);
    put('torso','shirt',p=>rbox(p,tc,th,2.3),[J.chest,J.pelvis,J.shoulderL,J.shoulderR],6,1.6,2.4);
    put('hips','pants',p=>rbox(p,add(J.pelvis,V(0,-0.4,0)),V(sw*0.92,3.0,4.1),2.0),[J.pelvis,J.hipL,J.hipR],5,1.6,2.4);
    for(const n of 'LR'){ const S=J['shoulder'+n],E=J['elbow'+n],W=J['wrist'+n],H=J['hip'+n],K=J['knee'+n],Ak=J['ankle'+n],toe=J['toe'+n],heel=J['heel'+n],tip=J['fingers'+n]||W;
      put('sleeve'+n,'shirt',p=>rcone(p,S,add(S,mul(sub(E,S),0.34)),2.9,2.5),[S,E],4,2,2.4);
      put('upperArm'+n,'skin',p=>rcone(p,S,E,2.4,2.05),[S,E],4,2,2.4);
      put('forearm'+n,'skin',p=>rcone(p,E,W,2.05,1.7),[E,W],4,2,2.4);
      put('hand'+n,'skin',p=>rcone(p,add(W,mul(sub(tip,W),0.15)),tip,1.9,1.2),[W,tip],4,1.7,2.0);
      put('thigh'+n,'pants',p=>rcone(p,H,K,3.3,2.6),[H,K],5,2,2.4);
      put('shin'+n,'pants',p=>rcone(p,K,Ak,2.6,2.0),[K,Ak],5,2,2.4);
      put('shoe'+n,'shoes',p=>box(p,add(mul(add(heel,toe),0.5),V(0,0.9,0.4)),V(2.2,1.7,3.4)),[heel,toe,Ak],4,1.7,2.2); }
    return P; }
  let PCS=[];
  if(W3.lite) PCS=liteShell();
  else{ R.fine(true); const PCS0=R.shell(rest.J,0).filter(P=>P.on!=='prop'&&P.on!=='world'&&P.n!=='beard'); R.fine(false);
  for(const P of PCS0){ const f=/^fing(\d)(\d)([LR])$/.exec(P.n); if(!f){ if(/^hand[LR]$/.test(P.n)){ P.bb=around([rest.J['wrist'+P.n.slice(-1)]],4.5); P.step=.25; P.cell=.2; } PCS.push(P); continue; }
    if(f[2]!=='0')continue; const sib=[1,2].map(j=>PCS0.find(q=>q.n==='fing'+f[1]+j+f[3])), d0=P.d, J=rest.J, k=j=>J['k'+f[1]+j+f[3]];
    PCS.push({...P,d:p=>Math.min(d0(p),...sib.map(q=>q.d(p))),bb:around([k(0),k(1),k(2),k(3)],1.2),step:.18,cell:.14}); }
  { const H=rest.J.head, {rbox,ell,box}=R, Vv=R.V, ad=R.add, HB=[H.x-11,H.x+11,H.y-14,H.y+11,H.z-11,H.z+11];
    const head=PCS.find(P=>P.n==='head'), hair=PCS.find(P=>P.n==='hair'), hd=head.d, hr=hair.d;
    for(const P of PCS)if(/^shoe[LR]$/.test(P.n))P.paint=p=>p.y<1.15?'sole':null;
    head.paint=()=>null;
    const V=(n,on,m,d,paint)=>({n,on,m,d,paint,bb:HB,step:.5});
    const CUT=H.y-5.5, sq=x=>x*x, lock=(p,k=1.7)=>.28*sq(Math.sin(p.x*k+.5*Math.sin(p.y*.6))), lockY=(p,k=2.4)=>.22*sq(Math.sin(p.y*k+.4*Math.sin(p.x*.9)));
    const fall=p=>{ const t=Math.max(0,CUT-p.y), w=7.4-.11*t, d=5.9-.08*t, hem=(H.y-13.6+.5*Math.sin(p.x*2.3)+.35*Math.cos(p.z*2.1))-p.y;
      return Math.max(rbox(p,ad(H,Vv(0,-9.5,-1.8)),Vv(w,4.4,d),3.2)+lock(p),-box(p,ad(H,Vv(0,-3.6,6.1)),Vv(5.6,9.5,4.4)),hem); };
    const mane=p=>Math.min(hr(p),Math.max(rbox(p,ad(H,Vv(0,-1.2,-1.6)),Vv(7.9,6.2,6.6),3.6)+lock(p),-box(p,ad(H,Vv(0,-3.6,6.1)),Vv(5.6,9.5,4.4)),p.y-(H.y+6.2)),
      ell(p,ad(H,Vv(7.6,-1.6,-1.2)),Vv(1.7,4.2,3.6)),ell(p,ad(H,Vv(-7.6,-1.6,-1.2)),Vv(1.7,4.2,3.6)));
    const tail=p=>{ const u=Math.max(0,Math.min(1,(H.y+.9-p.y)/7.7)); return Math.min(R.rcone(p,ad(H,Vv(0,.9,-9.3)),ad(H,Vv(0,-6.6,-10.1)),1.8,1.0)+lockY(p)-.5*Math.sin(u*Math.PI)*(u>.5?.6:.25),ell(p,ad(H,Vv(0,-7.1,-10.2)),Vv(1.5,1.5,1.5))); };
    PCS.push(V('hairPony','hair','hair',p=>Math.min(hr(p),R.rcone(p,ad(H,Vv(0,2.0,-7.0)),ad(H,Vv(0,1.0,-9.4)),2.2,1.7))),
             Object.assign(V('hairPonyA','hair','hair',tail),{swing:{pivot:[0,.9,-9.3],rest:[0,-7.5,-.8],len:7.8,max:.8,k:30}}),
             V('hairLong','hair','hair',p=>Math.max(mane(p),CUT-p.y)),
             Object.assign(V('hairLongA','hair','hair',p=>Math.max(fall(p),p.y-CUT)),{swing:{pivot:[0,-5.5,-1.6],rest:[0,-1,0],len:8.1,max:.7,k:45}}),
             V('hairBun','hair','hair',p=>Math.min(hr(p),ell(p,ad(H,Vv(0,5.3,-9.8)),Vv(3.0,2.7,2.6))+.22*sq(Math.sin(Math.atan2(p.y-H.y-5.3,p.x-H.x)*3)))));
    const EYES=[[[7,13,8,14,'eye','o']], [[6,13,8,14,'eyeW'],[7,13,8,14,'eye']], [[6,12,9,15,'eyeW'],[7,12,8,15,'eye'],[7,13,7,13,'pupil'],[8,12,8,12,'eyeW']],
      [[6,13,9,14,'eyeW'],[7,13,8,14,'eye'],[6,12,9,12,'lid']], [[6,12,9,14,'eyeW'],[7,12,8,14,'eye'],[5,11,9,11,'pupil'],[5,12,5,12,'pupil']], [[6,14,6,14,'pupil'],[7,13,7,13,'pupil'],[8,14,8,14,'pupil']]];
    const U=.47, RX=r=>[(r[0]-13)*U,(r[2]+1-13)*U], RY=r=>[.7-(r[3]+1-14)*U,.7-(r[1]-14)*U];
    EYES.forEach((E,k)=>{ const R2=E.map(r=>({x:RX(r),y:RY(r),m:r[4],o:r[5]})), sx=p=>-Math.abs(p.x-H.x);
      const r2=(p,r)=>{ const x=sx(p), y=p.y-H.y; if(r.o){ const cx=(r.x[0]+r.x[1])/2, cy=(r.y[0]+r.y[1])/2; return Math.hypot(x-cx,y-cy)-(r.x[1]-r.x[0])*.45; } return Math.max(r.x[0]-x,x-r.x[1],r.y[0]-y,y-r.y[1]); };
      PCS.push({n:'eyes'+k,on:'head',m:E[0][4],bb:[H.x-5.5,H.x+5.5,H.y-1.5,H.y+3.5,H.z+1,H.z+12],step:.18,cell:.14,
        d:p=>Math.max(hd(p)-.22,Math.min(...R2.map(r=>r2(p,r))),H.z+2-p.z), paint:p=>{ let m=null; for(const r of R2)if(r2(p,r)<.03)m=r.m; return m; }}); }); } }
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
  for(const P of PCS){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?STEP/2:STEP),fine,null); }
  const geos=PCS.map((P,i)=>{ const fine=P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n), g=meshOf(P,P.step||(fine?STEP/2:STEP),fine,null), n=g.attributes.position.count;
    g.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(n).fill(i),1)); g.setAttribute('pid',new THREE.BufferAttribute(new Float32Array(n).fill(R.PIECES.indexOf(P.n)),1)); return g; });
  const all=new THREE.BufferGeometry(); for(const k of Object.keys(geos[0].attributes)){ const sz=geos[0].attributes[k].itemSize, tot=geos.reduce((a,g)=>a+g.attributes[k].array.length,0), arr=new Float32Array(tot); let o=0; for(const g of geos){ arr.set(g.attributes[k].array,o); o+=g.attributes[k].array.length; } all.setAttribute(k,new THREE.BufferAttribute(arr,sz)); }
  W3.tris=all.attributes.position.count/3;
  { const RG=[]; let o=0; for(const g of geos){ const n=g.attributes.position.count; RG.push([o,n]); o+=n; }
    W3.reindex=()=>{ let n=0; for(let i=0;i<RG.length;i++)if(!W3.HIDE[i])n+=RG[i][1]; const I=new Uint32Array(n); let k=0; for(let i=0;i<RG.length;i++){ if(W3.HIDE[i])continue; const [a,c]=RG[i]; for(let v=0;v<c;v++)I[k++]=a+v; }
      all.setIndex(new THREE.BufferAttribute(I,1)); W3.trisWorn=n/3; }; W3.reindex(); }
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
    if((GP.image&&GP.image.width)!==w||GP.magFilter!==f)GP.dispose(); GP.magFilter=GP.minFilter=f; GP.image={data:d,width:w,height:1}; GP.needsUpdate=true; W3.uSelf.value=W3.selfOff?1:1-dp*.55; try{ localStorage.setItem('market-shade',JSON.stringify(W3.shade)); }catch(e){} };
  W3.smooth0=false;
  W3.selfOff=true; try{ W3.selfOff=localStorage.getItem('market-self')!=='1'; }catch(e){}
  W3.setSelf=on=>{ W3.selfOff=!on; W3.smClr=false; W3.uSelf.value=on?1-W3.shade.depth*.55:1; try{ localStorage.setItem('market-self',on?'1':'0'); }catch(e){} };
  { let s0={steps:4,depth:.78}; try{ const v=localStorage.getItem('market-shade'); if(v)s0=JSON.parse(v); }catch(e){} const P=new URLSearchParams(location.search); let bd=null; try{ bd=+SAVE.get('bands'); }catch(e){} if(!s0.cel){ s0={steps:Math.max(3,Math.min(5,+(P.get('cel')||bd||4))),depth:.72,cel:1}; } W3.setShade(s0.steps,s0.depth,false); }
  W3.PAT={value:[0,1,2].map(()=>new THREE.Vector4(0,1,-9,0))}; W3.PB={value:[0,1,2].map(()=>new THREE.Vector3(1,1,1))}; W3.uRim={value:0}; W3.uFl={value:.5};
  const PATG=`uniform vec4 uPat[3]; uniform vec3 uPB[3]; uniform float uRim; varying float vMt; varying vec3 vPL;
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
    sh.uniforms.uPat=W3.PAT; sh.uniforms.uPB=W3.PB; sh.uniforms.uRim=W3.uRim;
    sh.fragmentShader=PATG+'\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n for(int i=0;i<3;i++) if(uPat[i].x>.5&&abs(vMt-uPat[i].z)<.5) diffuseColor.rgb=mix(diffuseColor.rgb,uPB[i],patW(uPat[i].x,vPL*uPat[i].y));')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n if(uRim>0.){ vec3 vd=isOrthographic?vec3(0.,0.,1.):normalize(vViewPosition); totalEmissiveRadiance+=mix(diffuseColor.rgb,vec3(1.),.4)*uRim*pow(1.-abs(dot(normalize(vNormal),vd)),3.); }');
    sh.uniforms.uLv=W3.lv; sh.uniforms.uLVP=W3.LVP; sh.uniforms.uSM={value:W3.sm.depthTexture}; sh.uniforms.uSelf=W3.uSelf;
    sh.vertexShader='varying vec3 vWW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWW=(modelMatrix*vec4(transformed,1.)).xyz;').replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.replace(/(directional|point|spot)LightShadows\[ i \]\.shadowNormalBias/g,'($&+.18)'));
    sh.uniforms.uFl=W3.uFl; sh.fragmentShader='uniform float uLv,uSelf,uFl; uniform mat4 uLVP; uniform sampler2D uSM; varying vec3 vWW;\n'+sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.025;')
      .replace('#include <opaque_fragment>','#include <opaque_fragment>\n if(uLv>1.5){ vec4 sp=uLVP*vec4(vWW,1.); vec3 q=sp.xyz/sp.w*0.5+0.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-0.006>texture2D(uSM,q.xy).r) gl_FragColor.rgb*=uSelf; }\n { float ld=max(dot(diffuseColor.rgb,vec3(.3,.5,.2)),.001), r=dot(gl_FragColor.rgb,vec3(.3,.5,.2))/ld, q=r<1.?max(uFl,floor(r*4.+.35)/4.):r; gl_FragColor.rgb=r<.02?diffuseColor.rgb*q:gl_FragColor.rgb*q/r; }'); };
  toon.customProgramCacheKey=()=>'w3toon'+NP; W3.flat=m.material; W3.toon=toon; m.receiveShadow=true;
  W3.group.add(m); W3.meshes.push(m); W3.mesh=m;
  scene.add(LEVELS.own(W3.group,'*'));
  const LIGHT=nrm(V(-0.55,0.75,0.5)), m4=new THREE.Matrix4();
  W3.SZ=1.2;
  { const HI=PCS.findIndex(P=>P.n==='head'), EYEL=new THREE.Vector3(); W3.eyeAt=out=>{ if(HI<0||!W3.mesh)return null; W3.mesh.updateWorldMatrix(true,false); return out.copy(EYEL.set(0,2,7)).applyMatrix4(W3.PM.value[HI]).applyMatrix4(W3.mesh.matrixWorld); }; }
  W3.hideMe=W3.hideMeQ=!!QS.get('hideme');
  W3.body={place:()=>{}};
  W3.place=(B,x,y,z,hd,yawA,ZY)=>{ if(W3.hideMe)W3.group.traverse(o=>{ if(o.isMesh)o.visible=false; }); W3.group.position.set(x,y,z); W3.group.rotation.set(0,hd,0); W3.group.scale.set(W3.SZ/PPU,ZY*W3.SZ*(W3.BH||1),W3.SZ/PPU);
    const L=R.yaw(LIGHT,-yawA); W3.L.set(L.x,L.y,L.z);
    W3.G.value.set(Math.cos(hd),0,Math.sin(hd),0,1,0,-Math.sin(hd),0,Math.cos(hd)); SHL.forEach((S,i)=>{ W3.LP.value[i].copy(S.position);
      const k=1;
      W3.LC.value[i].set(S.color.r,S.color.g,S.color.b).multiplyScalar(Math.min(1.5,S.intensity/2)*k); });
    if(typeof SHARED.cam!=='undefined')SHARED.cam.getWorldDirection(W3.CamW.value);
    if(!W3.realL||!(W3.Lw.lengthSq()>.5))W3.Lw.set(L.x/PPU,L.y*ZY,L.z/PPU).applyAxisAngle(new THREE.Vector3(0,1,0),hd).normalize();
    const mid=(W3.MID||(W3.MID=new THREE.Vector3())).set(x,y+1.25,z); W3.smCam.position.copy(mid).addScaledVector(W3.Lw,6); W3.smCam.up.set(0,Math.abs(W3.Lw.y)>.6?0:1,Math.abs(W3.Lw.y)>.6?1:0); W3.smCam.lookAt(mid); W3.smCam.updateMatrixWorld();
    W3.LVP.value.multiplyMatrices(W3.smCam.projectionMatrix,W3.smCam.matrixWorldInverse);
    PCS.forEach((P,i)=>{ const F=R.frameOf(P.on||P.n,B); W3.PM.value[i].set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1); if(W3.E&&W3.E[i])W3.applyE(W3.PM.value[i],W3.E[i],F.o); if(W3.HIDE[i])W3.PM.value[i].makeScale(0,0,0); }); };
  { const place0=W3.place; W3.place=(...a)=>{ place0(...a); W3.uFl.value=CLOCK.dark()?.26:.5; W3.group.updateMatrixWorld(true); const now=performance.now(), hdt=Math.min(.05,(now-(W3.hairT||now))/1000); W3.hairT=now;
      PCS.forEach((P,i)=>{ if(P.swing&&!W3.HIDE[i])swing(P,i,hdt); }); W3.body.place(a[0]); }; }
  const SW={pv:new THREE.Vector3(),ax:new THREE.Vector3(),p:new THREE.Vector3(),M3:new THREE.Matrix4(),pW:new THREE.Vector3(),rest:new THREE.Vector3(),m:new THREE.Vector3(),v:new THREE.Vector3(),d:new THREE.Vector3(),q:new THREE.Quaternion(),M1:new THREE.Matrix4(),M2:new THREE.Matrix4(),inv:new THREE.Matrix3(),G:new THREE.Vector3()};
  function swing(P,i,dt){ '@later'; const S=P.swing, st=P.sw||(P.sw={m:null,pm:new THREE.Vector3()}), PM=W3.PM.value[i], GW=W3.group.matrixWorld;
    SW.inv.setFromMatrix4(GW).invert(); const sy=W3.group.scale.y, L=S.len*sy;
    SW.pW.set(S.pivot[0],S.pivot[1],S.pivot[2]).applyMatrix4(PM).applyMatrix4(GW);
    SW.rest.set(S.rest[0],S.rest[1],S.rest[2]).transformDirection(PM).transformDirection(GW);
    if(!st.m||dt<=0){ st.m=SW.m.copy(SW.pW).addScaledVector(SW.rest,L).clone(); st.pm.copy(st.m); st.pp=SW.pW.clone(); return; }
    const pv=st.pp?SW.pv.subVectors(SW.pW,st.pp):SW.pv.set(0,0,0); (st.pp||(st.pp=new THREE.Vector3())).copy(SW.pW);
    SW.v.subVectors(st.m,st.pm).sub(pv).multiplyScalar(Math.max(0,1-4.5*dt)).add(pv); st.pm.copy(st.m);
    SW.G.copy(SW.pW).addScaledVector(SW.rest,L).sub(st.m).multiplyScalar(S.k*dt*dt); st.m.add(SW.v).add(SW.G); st.m.y-=7*dt*dt;
    SW.d.subVectors(st.m,SW.pW); if(SW.d.lengthSq()<1e-9)SW.d.copy(SW.rest); SW.d.normalize();
    const a=SW.d.angleTo(SW.rest); if(a>S.max){ SW.q.setFromUnitVectors(SW.rest,SW.d); const ax=SW.ax.crossVectors(SW.rest,SW.d).normalize(); SW.d.copy(SW.rest).applyAxisAngle(ax,S.max); }
    st.m.copy(SW.pW).addScaledVector(SW.d,L);
    if(a<.004&&SW.v.lengthSq()<1e-8){ st.m.copy(SW.pW).addScaledVector(SW.rest,L); st.pm.copy(st.m); return; }
    const dl=SW.d.clone().applyMatrix3(SW.inv).normalize(), rl=SW.rest.clone().applyMatrix3(SW.inv).normalize(); SW.q.setFromUnitVectors(rl,dl);
    const p=SW.p.set(S.pivot[0],S.pivot[1],S.pivot[2]).applyMatrix4(PM);
    SW.M1.makeTranslation(p.x,p.y,p.z).multiply(SW.M2.makeRotationFromQuaternion(SW.q)).multiply(SW.M3.makeTranslation(-p.x,-p.y,-p.z)); PM.premultiply(SW.M1); }
}
const OUTL={rt:new THREE.WebGLRenderTarget(4,4,{type:THREE.FloatType,format:THREE.RGBAFormat,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter}),
  occ:new THREE.ShaderMaterial({vertexShader:`varying float vd; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vd=-mv.z; gl_Position=projectionMatrix*mv; }`,fragmentShader:`varying float vd; void main(){ gl_FragColor=vec4(-1.,0.,0.,vd); }`,side:THREE.DoubleSide})};
OUTL.pass={uniforms:{tDiffuse:{value:null},tId:{value:OUTL.rt.texture},px:{value:new THREE.Vector2(1,1)},cols:{value:W3.ramp.map(r=>new THREE.Vector3(r[3].r,r[3].g,r[3].b)).concat(Array(Math.max(0,24-W3.ramp.length)).fill(new THREE.Vector3())).slice(0,24)},
    legs:{value:W3.legs.concat(Array(Math.max(0,64-W3.legs.length)).fill(0)).slice(0,64)},tint:{value:W3.tint},t1:{value:3.5/PPU},t2:{value:1.6/PPU},wid:{value:1},oc:{value:new THREE.Vector3()},ocK:{value:0}},
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`uniform sampler2D tDiffuse,tId; uniform vec2 px; uniform vec3 cols[24]; uniform float legs[64]; uniform vec3 tint; uniform float t1,t2,wid,ocK; uniform vec3 oc; varying vec2 vUv;
  bool edgeTo(vec4 c,vec2 o){ vec4 q=texture2D(tId,vUv+o*px*wid); if(q.x<0.)return q.w>c.w+0.05; if(abs(q.x-c.x)<0.5)return false;
    if(q.w-c.w>(abs(q.y-c.y)<0.5?t1:t2))return true; float a=legs[int(c.x+0.5)], b=legs[int(q.x+0.5)]; return a>0.&&b>0.&&a!=b&&q.w>=c.w; }
  void main(){ vec4 c=texture2D(tId,vUv); vec4 base=texture2D(tDiffuse,vUv); if(c.x<0.){ gl_FragColor=base; return; }
    bool e=edgeTo(c,vec2(1,0))||edgeTo(c,vec2(-1,0))||edgeTo(c,vec2(0,1))||edgeTo(c,vec2(0,-1)); gl_FragColor=e?vec4(mix(cols[int(c.y+0.5)]*tint,oc,ocK),1.):base; }`};
OUTL.render=(renderer,scene,cam)=>{ '@later'; const w=renderer.domElement.width, h=renderer.domElement.height; if(OUTL.rt.width!==w||OUTL.rt.height!==h)OUTL.rt.setSize(w,h); OUTL.pass.uniforms.px.value.set(1/w,1/h);
  const ac=renderer.autoClear; renderer.setRenderTarget(OUTL.rt); renderer.state.buffers.color.setClear(-2,0,0,1e9); renderer.clear(true,true,false);
  const cut=(OUTL.hidden?OUTL.hidden():[]).filter(Boolean); for(const o of cut)o.visible=false; W3.group.visible=false; scene.overrideMaterial=OUTL.occ; const bg=scene.background; scene.background=null; renderer.autoClear=false; renderer.render(scene,cam); scene.overrideMaterial=null; scene.background=bg; W3.group.visible=true; for(const o of cut)o.visible=true;
  const m0=W3.mesh.material; W3.mesh.material=W3.idMat; renderer.render(W3.group,cam); W3.mesh.material=m0;
  renderer.autoClear=ac; renderer.setRenderTarget(null); };

W3.shadowPass=renderer=>{ SYS.run('shadowPre',renderer); W3.shadowBase(renderer); SYS.run('shadow',renderer); }; W3.shadowBase=renderer=>{ if(W3.lv.value<1.5)return; if(W3.selfOff){ if(!W3.smClr){ W3.smClr=true; renderer.setRenderTarget(W3.sm); renderer.clear(); renderer.setRenderTarget(null); } return; } const m0=W3.mesh.material; W3.mesh.material=W3.depthMat;
  renderer.setRenderTarget(W3.sm); renderer.clear(); renderer.render(W3.group,W3.smCam); renderer.setRenderTarget(null); W3.mesh.material=m0; };
window.W3=W3;
export {OUTL};

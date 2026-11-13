// THE CLOTHES: a real shirt, trousers, shoes, hat and jacket worn over the Walker, each its own mesh in plain cel cloth, cut to its own size chart and put on by the rig's joints (the jacket still fitted to the body); their loose parts hang and swing on DRAPE, kept out of his body: the shirt's and the jacket's lower body, the jacket's open front, the trouser cuffs and the sleeve ends.
import {SHARED, THREE} from './003-shx.js';
import {W3} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
import {DRAPE} from './072a-cloth.js';
const GARB={};
{ const R=RIG, REST=R.build(R.walkPose({ph:0,w:0},null),null), TAU=Math.PI*2, FALL=-286, V=(x,y,z)=>({x,y,z});   // the rig is about 29 units a metre, so things fall at 286 units a second squared
  const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t), dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  // the pieces a garment hangs from; each point's skin names them by this order
  const NAMES=GARB.NAMES=['torso','hips','upperArmL','upperArmR','forearmL','forearmR','thighL','thighR','shinL','shinR','shoeL','shoeR','head'], NI={}; NAMES.forEach((n,i)=>{ NI[n]=i; });
  const F0={}, fr0=n=>F0[n]||(F0[n]=R.frameOf(n,REST));
  const toL=(n,p)=>{ const F=fr0(n), dx=p.x-F.o.x, dy=p.y-F.o.y, dz=p.z-F.o.z; return [dx*F.x.x+dy*F.x.y+dz*F.x.z,dx*F.y.x+dy*F.y.y+dz*F.y.z,dx*F.z.x+dy*F.z.y+dz*F.z.z]; };
  // a point round a limb: t along it, r out from it at angle a
  const along=(n,t,r,a)=>{ const F=fr0(n), c=Math.cos(a)*r, s=Math.sin(a)*r; return V(F.o.x+F.y.x*t+F.x.x*c+F.z.x*s,F.o.y+F.y.y*t+F.x.y*c+F.z.y*s,F.o.z+F.y.z*t+F.x.z*c+F.z.z*s); };
  const J0=REST.J, LEN={upperArm:dist(J0.shoulderL,J0.elbowL),forearm:dist(J0.elbowL,J0.wristL),thigh:dist(J0.hipL,J0.kneeL),shin:dist(J0.kneeL,J0.ankleL)};

  // each fabric's tile size in rig units (TS: the garments' uv scale)
  const DEF={jersey:{TS:3.2},denim:{TS:2.4},canvas:{TS:2.6},leather:{TS:2.2},felt:{TS:3.4},rubber:{TS:1.6},band:{TS:1.2},lace:{TS:1},brass:{}};
  const COL=GARB.COL={shirt:'#e2dccd',pants:'#3a5070',jacket:'#6b6844',shoes:'#5b3b25',hat:'#3a3531',sole:'#2b2622',lace:'#2a201a',band:'#1e1b1a',belt:'#3a2517',buckle:'#b8954f'};
  const MAT={};
  // cloth in the game's cel: the Walker's own toon steps in the garment's colour, no woven texture
  const mat=(k,c)=>{ '@later'; const q=k+c; if(MAT[q])return MAT[q];
    const M=new THREE.MeshToonMaterial({color:new THREE.Color(c),gradientMap:W3.GP,side:THREE.DoubleSide});
    // the inside of a garment is in its own shade, as real cloth is: a fold or an open hem shows dark, never lit like the outside
    // in shade it keeps the Walker's own least light (his darkest tone), so it never goes black
    M.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n { vec3 al=max(diffuseColor.rgb,vec3(.02)); vec3 L0=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/al*3.14159; float m0=max(L0.r,max(L0.g,L0.b)); if(m0<.45) reflectedLight.indirectDiffuse+=al/3.14159*(.45-m0); }\n if(!gl_FrontFacing){ reflectedLight.directDiffuse*=.25; reflectedLight.indirectDiffuse*=.4; reflectedLight.directSpecular*=0.; reflectedLight.indirectSpecular*=0.; }'); };
    return MAT[q]=M; };

  /* ---------- a garment's shape, made once and shared by everyone wearing it ---------- */
  // P its points at rest (rig units); each hangs from piece a, or a then b by w; K how loose it is (0: held to the body); C the threads between points; the mesh: gv (mesh vertex -> point), uv, ix, seam pairs, material groups
  const NEW=()=>({P:[],S:[],K:[],C:[],gv:[],uv:[],ix:[],seam:[],grp:[]});
  const pt=(t,p,a,b,w,k)=>{ t.P.push(p.x,p.y,p.z); t.S.push([a,b,w||0,p]); t.K.push(k||0); };
  // a grid of nu round by nv along (closed: it goes all the way round), its points made by at(i,j) in order; across, along, the diagonals, and every other point (it bends, it doesn't crumple)
  const grid=(t,nu,nv,closed,at,uvAt,m)=>{ '@later'; const b=t.P.length/3, g0=t.gv.length, i0=t.ix.length, cols=closed?nu+1:nu, id=(i,j)=>b+j*nu+((i%nu)+nu)%nu;
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++)at(i,j);
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){ const r1=closed||i+1<nu, r2=nu>2&&(closed||i+2<nu);
      if(r1){ t.C.push(id(i,j),id(i+1,j)); if(j<nv-1)t.C.push(id(i,j),id(i+1,j+1),id(i+1,j),id(i,j+1)); } if(r2)t.C.push(id(i,j),id(i+2,j));
      if(j<nv-1)t.C.push(id(i,j),id(i,j+1)); if(j<nv-2)t.C.push(id(i,j),id(i,j+2)); }
    for(let j=0;j<nv;j++)for(let c=0;c<cols;c++){ t.gv.push(id(c,j)); const q=uvAt(c,j); t.uv.push(q[0],q[1]); }
    for(let j=0;j<nv-1;j++)for(let c=0;c<cols-1;c++){ const a=g0+j*cols+c; t.ix.push(a,a+cols,a+1,a+1,a+cols,a+cols+1); }
    if(closed)for(let j=0;j<nv;j++)t.seam.push(g0+j*cols,g0+j*cols+nu);
    t.grp.push([i0,t.ix.length-i0,m]); };
  // each point in its pieces' own coordinates at rest, so it rides them as the body moves (and is shaped as the body is)
  const fin=t=>{ '@later'; const n=t.P.length/3; t.n=n; t.s1=new Int8Array(n); t.s2=new Int8Array(n); t.l1=new Float32Array(n*3); t.l2=new Float32Array(n*3); t.w2=new Float32Array(n); t.Kf=Float32Array.from(t.K);
    t.rv=new Float32Array(n);
    // a point shared with a limb keeps its distance from the joint the limb bends at, so cloth arcs over a bent knee or elbow instead of cutting through it
    t.S.forEach(([a,b,w,p],i)=>{ t.s1[i]=NI[a]; t.l1.set(toL(a,p),i*3); t.s2[i]=b?NI[b]:-1; if(b){ t.l2.set(toL(b,p),i*3); t.w2[i]=w; if(/^(thigh|shin|upperArm|forearm)/.test(b)&&!/^thigh/.test(a)||/^shin/.test(b)){ const o=fr0(b).o; t.rv[i]=Math.hypot(p.x-o.x,p.y-o.y,p.z-o.z); } } });
    // cloth that hangs between two pieces of the body (hips and thigh, thigh and shin) is kept out of both, by their own shapes, at least as far as it is at rest: a leg swinging or a knee bending never comes through it
    if(t.firm)t.firm=Object.entries(t.firm).map(([s,ix])=>{ const ps=s.split(','), P=ps.map(sdfOf), m=ps.length; return {ps,ix:Int32Array.from(ix),d:Float32Array.from({length:ix.length*m},(_,q)=>{ const i=ix[Math.floor(q/m)]*3; return P[q%m](V(t.P[i],t.P[i+1],t.P[i+2])); })}; });
    t.uvF=new Float32Array(t.uv); t.ixU=new Uint32Array(t.ix); delete t.S; return t; };
  // the body on a bone as a distance: every piece of it riding that bone (the briefs on the hips reach over the tops of the thighs)
  const SDFS=new Map(), sdfOf=n=>{ let e=SDFS.get(n); if(!e||e.pcs!==W3.pcs){ const ps=W3.pcs.filter(P=>(P.under||P.n)===n); e={pcs:W3.pcs,d:ps.length?p=>{ let d=1e9; for(const P of ps)d=Math.min(d,P.d(p)); return d; }:null}; SDFS.set(n,e); } return e.d; };
  // the body it is worn over, as a distance (the Walker's own pieces at rest; under the shirt the jeans, as their waist): out of it by cl
  const SDF={}, body=(f,a)=>SDF[f+(a||'')]||(SDF[f+(a||'')]=(()=>{ const ps=(f==='F'?['torsoF','bustF','hips']:f==='P'?['hips']:['torso','hips']).concat(a?['upperArmL','upperArmR']:[]).map(n=>W3.pcs[W3.idx(n)]).filter(Boolean);
    return p=>{ let d=1e9; for(const P of ps)d=Math.min(d,P.d(p)-(P.n==='hips'&&f!=='P'&&p.y>14.8&&p.y<20.9?.75:0)); return d; }; })());
  // a point pushed out from c (through where it was put) till it is cl clear of the body, looking no further than smax; never pulled in
  const onto=(d,c,p,cl,smax)=>{ '@later'; const dx=p.x-c.x, dy=p.y-c.y, dz=p.z-c.z, s0=Math.hypot(dx,dy,dz)||1e-6, at=s=>d(V(c.x+dx/s0*s,c.y+dy/s0*s,c.z+dz/s0*s))<cl; let last=-1; for(let s=0;s<smax;s+=.2)if(at(s))last=s;
    if(last>=0)for(let s=last+.025;s<last+.2;s+=.025)if(at(s))last=s; const s=Math.max(s0,last+.025); return V(c.x+dx/s0*s,c.y+dy/s0*s,c.z+dz/s0*s); };
  const NECK=V(0,27,0);
  // a torso garment: rows [y, half width, half depth, lean(th), cl, c] from its top, round from th0 to th1 (closed: all round); sk(y) what a point hangs from at that height;
  // each point fitted onto the body f wears, and riding the piece it lies on (chest, an arm over the shoulder, the hips) (c: from the chest's middle, over the shoulders; else straight out), and below the chest it falls from the fullest row above it
  const torso=(t,rows,nu,closed,th0,th1,K,m,TS,sk,f)=>{ '@later'; const span=closed?TAU:th1-th0, d=body(f||'M'), da=body(f||'M',1), P=[], col=[], pc=n=>W3.pcs[W3.idx(n)], TP=[pc(f==='F'?'torsoF':'torso'),f==='F'&&pc('bustF')].filter(Boolean), HP=pc('hips'), AP={L:pc('upperArmL'),R:pc('upperArmR')};
    for(let j=0;j<rows.length;j++)for(let i=0;i<nu;i++){ const r=rows[j], th=closed?i/nu*TAU:th0+span*i/(nu-1); let p=V(r[1]*Math.sin(th),r[0]+(r[3]?r[3](th):0),r[2]*Math.cos(th));
      if(r[4]!=null){ p=r[5]?onto(da,NECK,p,r[4]+(f==='F'&&j>=2?.25:0),12):onto(d,V(0,p.y,0),p,r[4],13);
        if(!r[5]&&p.y<28.8&&Math.abs(Math.sin(th))<.75){ const h=Math.hypot(p.x,p.z), k=Math.max(h,(col[i]||0)*.97); if(k>h){ p.x*=k/h; p.z*=k/h; } col[i]=k; } }
      P.push(p); }
    const vl=[0]; for(let j=1;j<rows.length;j++){ let a=0; for(let i=0;i<nu;i++)a+=dist(P[j*nu+i],P[(j-1)*nu+i]); vl.push(vl[j-1]+a/nu); }
    let per=0; for(let i=0;i<nu-1;i++)per+=dist(P[i+nu*(rows.length>>1)],P[i+1+nu*(rows.length>>1)]); const reps=Math.max(1,Math.round(per*(closed?nu/(nu-1):1)/TS));
    const near=p=>{ let dt=1e9; for(const q of TP)dt=Math.min(dt,q.d(p)); const s=p.x>0?'L':'R', up=p.y>27, o=up?'upperArm'+s:'hips', w=sm((dt-(up?AP[s]:HP).d(p))/2+.5); return w>=1?[o,null,0]:w<=0?['torso',null,0]:['torso',o,w]; };
    grid(t,nu,rows.length,closed,(i,j)=>{ const p=P[j*nu+i], s=sk===chest&&rows[j][4]!=null?near(p):sk(p.y), th=closed?i/nu*TAU:th0+span*i/(nu-1); pt(t,p,s[0],s[1],s[2],K(i,j,th)); },
      (c,j)=>[c/(closed?nu:nu-1)*reps,vl[j]/TS],m); return P; };
  // the chest takes the top of a torso garment, the pelvis the bottom
  // round the waist every garment takes the chest by the same amount at the same height, so the tee, the jeans' waist and the belt lean and turn together
  const tw=y=>Math.max(0,Math.min(1,(y-17.5)/5.5));
  const chest=y=>{ const w=sm((28-y)/10); return w>=1?['hips',null,0]:w<=0?['torso',null,0]:['torso','hips',w]; };
  // a sleeve or a trouser leg: rings [piece, t along it, radius, (piece b, w)] down the limb
  const limb=(t,rings,nu,K,m,TS)=>{ '@later'; const vl=[0]; for(let j=1;j<rings.length;j++)vl.push(vl[j-1]+Math.abs(rings[j][1]-rings[j-1][1]+(rings[j][0]!==rings[j-1][0]?LEN[rings[j-1][0].replace(/[LR]$/,'')]:0)));
    const reps=Math.max(1,Math.round(TAU*rings[0][2]/TS));
    grid(t,nu,rings.length,true,(i,j)=>{ const g=rings[j], p=along(g[0],g[1],g[2],i/nu*TAU); pt(t,p,g[3]||g[0],g[3]?g[0]:null,g[3]?g[4]:0,K(j)); },(c,j)=>[c/nu*reps,vl[j]/TS],m); };
  // ...where g[3] is the other piece a ring by a joint also hangs from, and g[4] how much of its own piece it takes

  // the shirt and the jacket are fitted to his body or to hers (her bust, her waist)
  const BUST={shirt:.3,jacket:.85}, tpl=(k,f)=>{ const q=BUST[k]&&f==='F'?k+'F':k; if(!TPL[q]){ const t0=performance.now(); TPL[q]=fin(MAKE[k](f==='F'?'F':'M')); GARB.made[q]=+(performance.now()-t0).toFixed(1); } return TPL[q]; }, TPL={}; GARB.made={}; GARB.tpl=tpl;
  // the rows over the shoulders, put on the body from the chest's middle (lower in front)
  const neck=th=>-.9*Math.cos(th)+.3*Math.sin(th)**2, yoke=th=>-.9*Math.cos(th)-.3*Math.sin(th)**2, shoulder=th=>-.6*Math.cos(th)+.4*Math.sin(th)**2;
  // her arms are slimmer than her shoulders: the sleeve is roomier on her just under its top (its top ring stays tucked in under the shoulder)
  const roomy=(f,R)=>f==='F'?R.map((g,j)=>{ const q=g.slice(); q[2]*=[1,1.12,1.06,1.02][j]||1; return q; }):R;
  const TOP=e=>[[34.4,2,1.8,neck,.22+e,1],[33.6,4.6,3,yoke,.3+e,1],[31.8,8,3.8,shoulder,.42+e,1],[29.3,9,4.6,null,.5+e,1],[28.4,8.6,4.5,null,.55+e,1]];
  /* ---------- the clothes cut first, to their own sizes, then put on by the skeleton's joints (owner, 2 Nov 2026: "make the clothes first, then put them on avatar, dont base them on avatar body"); tests/clothes.cjs checks them against the body ---------- */
  // the size chart in rig units (about 29 a metre): the tee's rows [height, half width, half depth] from the hem up, its crew neck and sleeves; the jeans' seat rows from the waist down and legs; the shoe's stations along the foot [z, half width, top]
  const SZ=GARB.SIZE={tee:{n:3,bust:1.15,rows:[[18.8,8.5,5.9],[20.2,8.35,5.8],[21.8,7.6,5.7],[23.6,7,5.6],[25.6,6.7,5.5],[27.4,6.5,5.25],[29.2,7.4,5.05],[31,8.4,4.7],[33.7,8.25,4.4],[34.6,7,4],[35.4,5.4,3.55]],
      neck:{y:35.85,dip:.75,W:3.45,D:3.15},slv:{R:3.3,L:3.6,Rh:3.25}},
    jeans:{n:2.6,rows:[[21,6.9,4.95],[19.6,7.9,4.95],[17.6,8.05,4.6],[16,7.6,4.35],[14.6,6.6,4.05],[13.6,4.6,3.8],[12.8,3,3.5]],leg:{top:-2.8,R0:4.3,Rk:3.75,Rh:3.65,ext:1.55,topIn:.3}},
    shoe:{bot:.32,st:[[-3.02,.05,1.2],[-2.95,.9,1.6],[-2.6,1.75,3.1],[-2,2.12,3.75],[-1,2.25,3.95],[0,2.3,3.85],[.9,2.38,3.45],[1.9,2.48,3.05],[2.9,2.42,2.75],[3.8,2.12,2.45],[4.4,1.5,2],[4.78,.55,1.3],[4.85,.05,.9]]}};
  const se=(th,W,D,n)=>{ const a=Math.sin(th), b=Math.cos(th); return [W*Math.sign(a)*Math.abs(a)**(2/n),D*Math.sign(b)*Math.abs(b)**(2/n)]; };
  const sub3=(a,b)=>V(a.x-b.x,a.y-b.y,a.z-b.z), add3=(a,b)=>V(a.x+b.x,a.y+b.y,a.z+b.z), mul3=(a,k)=>V(a.x*k,a.y*k,a.z*k), nrm3=a=>mul3(a,1/(Math.hypot(a.x,a.y,a.z)||1)), crs3=(a,b)=>V(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
  const MAKE={
    // a cotton crew-neck tee cut to its own size: a boxy body to a level hem a little below the belt, a crew neck with a ribbed band, set-in short sleeves capping the shoulders
    shirt:f=>{ '@later'; const t=NEW(), TS=DEF.jersey.TS, Z=SZ.tee, nu=28, nr=Z.rows.length+1, F=f==='F';
      // round the other way from the sleeves, as its rows rise: its outside faces out
      const at=(i,j)=>{ const th=-i/nu*TAU; if(j===Z.rows.length){ const N=Z.neck, [x,z]=se(th,N.W,N.D,2); return V(x,N.y-N.dip*Math.cos(th),z); }
        const [y,W,D]=Z.rows[j], [x,z]=se(th,W,D,Z.n), b=F&&z>0?Z.bust*Math.max(0,1-((y-27.4)/3.6)**2):0; return V(x,y,z*(1+b/D)); };   // her front fuller at the bust
      const P=[]; for(let j=0;j<nr;j++)for(let i=0;i<nu;i++)P.push(at(i,j));
      const skin=p=>Math.abs(p.x)>6.6&&p.y>27?['torso','upperArm'+(p.x>0?'L':'R'),Math.min(1,(Math.abs(p.x)-6.6)/2)*.45]:p.y<24?['hips','torso',tw(p.y)]:chest(p.y);   // below the waist it moves with the hips, as the jeans do   // by the arms the shoulders give a little with them
      const vl=[0]; for(let j=1;j<nr;j++){ let a=0; for(let i=0;i<nu;i++)a+=dist(P[j*nu+i],P[(j-1)*nu+i]); vl.push(vl[j-1]+a/nu); } let per=0; for(let i=0;i<nu;i++)per+=dist(P[nu*3+i],P[nu*3+(i+1)%nu]); const reps=Math.max(1,Math.round(per/TS));
      grid(t,nu,nr,true,(i,j)=>{ const p=P[j*nu+i], k=skin(p); pt(t,p,k[0],k[1],k[2]); },(c,j)=>[c/nu*reps,vl[j]/TS],0);   // held: the hem keeps a straight line (owner, 2 Nov 2026)
      grid(t,nu,2,true,(i,j)=>{ const th=-i/nu*TAU, N=Z.neck, [x,z]=se(th,N.W+.12-j*.3,N.D+.12-j*.3,2); pt(t,V(x,N.y-N.dip*Math.cos(th)+j*.6,z),'torso'); },(c,j)=>[c/nu*reps*2,j*.3],0);   // the ribbed neckband
      for(const s of 'LR'){ const S=J0['shoulder'+s], E=J0['elbow'+s], a=nrm3(sub3(E,S)), u=nrm3(crs3(a,V(0,0,1))), w=crs3(u,a), {R:Rs,L,Rh}=Z.slv, RG=[[-Rs,.05],[-Rs*.87,Rs*.5],[-Rs*.7,Rs*.71],[-Rs*.4,Rs*.92],[0,Rs],[L*.5,(Rs+Rh)/2],[L,Rh]];
        grid(t,16,RG.length,true,(i,j)=>{ const [tt,r]=RG[j], q=i/16*TAU; pt(t,V(S.x+a.x*tt+(u.x*Math.cos(q)+w.x*Math.sin(q))*r,S.y+a.y*tt+(u.y*Math.cos(q)+w.y*Math.sin(q))*r,S.z+a.z*tt+(u.z*Math.cos(q)+w.z*Math.sin(q))*r),'upperArm'+s,null,0,j===RG.length-1?.01:0); },
          (c,j)=>[c/16*Math.max(1,Math.round(TAU*Rs/TS)),(RG[j][0]+Rs)/TS],0); }
      return t; },
    // straight-leg jeans cut to their own size on a leather belt with a brass buckle: a seat to the crotch, two straight legs tapering a little to the knee, hems breaking over the shoes
    pants:()=>{ '@later'; const t=NEW(), TS=DEF.denim.TS, Z=SZ.jeans, nu=28, nl=24, G=Z.leg, firm={};
      const ring=(y,W,D,i)=>{ const [x,z]=se(i/nu*TAU,W,D,Z.n); return V(x,y,z); };
      const seat=y=>{ const r=Z.rows; if(y>=r[0][0])return [r[0][1],r[0][2]]; for(let j=1;j<r.length;j++)if(r[j][0]<=y){ const a=r[j-1], b=r[j], f=(a[0]-y)/(a[0]-b[0]); return [a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]; } const l=r[r.length-1]; return [l[1],l[2]]; };
      const B=Z.rows[0], reps=Math.max(1,Math.round(2*(B[1]+B[2])*1.5/TS));
      grid(t,nu,2,true,(i,j)=>{ pt(t,ring(B[0]+.1-j*1.15,B[1]+.12,B[2]+.12,i),'hips','torso',tw(B[0]+.1-j*1.15)); },(c,j)=>[c/nu*reps*2,j],1);   // the belt
      const zb=B[2]+.2; grid(t,2,2,false,(i,j)=>{ const y=j?20:21.05; pt(t,V(i?1:-1,y,zb),'hips','torso',tw(y)); },(c,j)=>[c,j],2);   // the buckle
      // one piece of cloth: each leg begins at the waist as its half of the seat, closed by the centre seam, and turns round into the leg below it; the outside of the hip turns first, the inside keeps the crotch lower, then the legs part
      for(const s of 'LR'){ const sg=s==='L'?1:-1, H=J0['hip'+s], K=J0['knee'+s], A=J0['ankle'+s], a1=nrm3(sub3(K,H)), a2=nrm3(sub3(A,K)), L1=dist(H,K), L2=dist(K,A), T=[], q0=-(B[0]-H.y)/Math.abs(a1.y);
        for(let q=q0;q<L1-1.8;q+=.55)T.push(q); for(let q=-1.5;q<=1.51;q+=.5)T.push(L1+q); for(let q=L1+2.2;q<L1+L2+G.ext-.4;q+=1)T.push(q); T.push(L1+L2+G.ext-.35,L1+L2+G.ext);
        const R=q=>q<0?G.R0+q*G.topIn:q<L1?G.R0+(G.Rk-G.R0)*q/L1:G.Rk+(G.Rh-G.Rk)*Math.min(1,(q-L1)/L2), fo=q=>sm((q+1.4)/3.4), fi=q=>sm((q-3.4)/1.8);
        grid(t,nl,T.length,true,(i,j)=>{ const q=T[j], top=q<=L1, o=top?add3(H,mul3(a1,q)):add3(K,mul3(a2,q-L1)), a=top?a1:a2, u=nrm3(crs3(a,V(0,0,1))), w=crs3(u,a), r=R(q), th=i/nl*TAU, c=Math.cos(th), sn=Math.sin(th);
          const C=add3(o,add3(mul3(u,c*r),mul3(w,sn*r))), dx=-c, out=sg*dx, f=fi(q)+(fo(q)-fi(q))*Math.max(0,out);
          let p=C; if(f<1){ const [W,D]=seat(o.y), Hp=out>=0?V(W*Math.sign(dx)*Math.abs(dx)**(2/Z.n),o.y,D*Math.sign(sn)*Math.abs(sn)**(2/Z.n)):V(0,o.y,D*sn); p=add3(mul3(Hp,1-f),mul3(C,f)); }
          if(sg*p.x<0)p=V(0,p.y,p.z);   // where the legs meet they press flat against each other at the middle, never one through the other
          // the crotch's middle sits halfway between both thighs, a gusset that keeps the legs joined as they part; elsewhere the leg goes with its own thigh as soon as it leaves the seat
          // the centre seam above the gusset is the same point on both legs, so it goes with the hips alone (each leg pulling it with its own thigh opened a slit mid-stride)
          const mid=f<1&&Math.abs(p.x)<.05, ks=mid?0:Math.max(f,fo(q)*(1-.75*Math.max(0,-sn))), gus=p.y>12&&p.y<15.8&&Math.abs(p.x)<.6;   // the seat's back stays with the hips longer, over the buttocks
          // the hem rests on the shoe: below the shin it goes over to the shoe, so a leg swung back never lifts it off the heel to show the ankle
          const k=q>=L1-1.55?(q<=L1+1.55?['thigh'+s,'shin'+s,sm((q-L1+1.5)/3)]:q>L1+L2-2.5?['shin'+s,'shoe'+s,sm((q-L1-L2+2.5)/2.5)]:['shin'+s,null,0]):gus?['thighL','thighR',.5]:ks>=1?['thigh'+s,null,0]:mid&&p.y<18.6?['hips',null,0]:ks>0||p.y<18.6?['hips','thigh'+s,ks]:['hips','torso',tw(p.y)*sm(p.y-18.6)];
          const fp=mid&&p.y<18.6||k[0]==='thighL'&&k[1]==='thighR'?'hips,thighL,thighR':k[1]&&/^(hips|thigh)/.test(k[0])&&/^(thigh|shin)/.test(k[1])?k[0]+','+k[1]:!k[1]&&k[0]==='thigh'+s&&q<L1/2?'hips':null; if(fp)(firm[fp]||(firm[fp]=[])).push(t.P.length/3);   // the middle and the gusset are kept off both thighs (halfway between two thighs swinging apart pulls them in), the top of the leg off the hips (crouching)
          pt(t,p,k[0],k[1],k[2],j===T.length-1?.015:0); },(c,j)=>[c/nl*reps,(T[j]-q0)/TS],0); }
      t.firm=firm; return t; },
    // an olive waxed-canvas chore jacket worn open: held over the shoulders and chest, the body hangs and its two fronts swing; a folded collar, chest pockets, long sleeves with loose cuffs
    jacket:f=>{ '@later'; const t=NEW(), TS=DEF.canvas.TS, th0=.36, th1=TAU-.36, KR=[0,0,0,0,0,0,.2,.14,.1,.075,.06,.05,.045], CL=[1,1.05,1.1,1.15,1.2,1.25,1.3,1.35], d=body(f);
      const rows=TOP(.55).concat([27.6,25.4,23.2,21,18.8,16.8,14.9,13.3].map((y,j)=>[y,4,3,null,CL[j]]));
      // the fronts by the opening hang looser than the back
      torso(t,rows,26,false,th0,th1,(i,j)=>{ const e=Math.min(i,25-i); return KR[j]*(e<3?.55+.15*e:1); },0,TS,chest,f);
      torso(t,[[34.4,2,1.8,neck,.77,1],[36,2,1.8,neck,1.05,1],[33.4,4.6,3,yoke,1.4,1]],26,false,th0,th1,()=>0,0,TS*.6,chest,f);   // the collar, folded down
      for(const sg of [1,-1]){ const tc=sg*.85; grid(t,3,2,false,(i,j)=>{ const th=tc+(i-1)*.22, y=j?27.6:29; pt(t,onto(d,V(0,y,0),V(Math.sin(th),y,Math.cos(th)),1.1,13),'torso'); },(c,j)=>[c*.5,j*.6],0); }
      const fm=f; for(const s of 'LR'){ const u='upperArm'+s, f='forearm'+s;
        limb(t,roomy(fm,[[u,-.6,3.62,'torso',.6],[u,.7,3.55,'torso',.9],[u,2.4,3.45],[u,4.2,3.38],[u,5.8,3.32,f,.8],[u,7,3.28,f,.45],[f,.6,3.24,u,.85],[f,2,3.16],[f,3.4,3.08],[f,4.8,3],[f,5.9,2.96],[f,6.5,3.02]]),
          16,j=>j===11?.3:0,0,TS); }
      return t; },
    // leather boots on rubber soles, laced: the upper lofted along the foot, the sole a slab, the laces across the vamp
    shoeL:()=>shoe('L'), shoeR:()=>shoe('R'),
    // a charcoal felt fedora: a pinched crown, a grosgrain band, a snap brim down at the front and up at the sides
    hat:()=>{ '@later'; const t=NEW(), yb=th=>50.75-.35*Math.cos(th), cz=.2, hd=()=>'head';
      const crown=[[0,5.78,6.32,1],[1,5.72,6.26,1],[2.2,5.52,6.06,1],[3.4,5.26,5.8,1],[4.4,5,5.5,1],[5,4.66,5.12,1],[5.18,3.4,3.75,.72],[4.85,2,2.2,.42],[4.45,.7,.75,.14]];
      const pinch=(th,j)=>j>=4?1-.16*Math.max(0,Math.cos(th))**2:1;
      grid(t,32,crown.length,true,(i,j)=>{ const th=i/32*TAU, r=crown[j], k=pinch(th,j); pt(t,V(r[1]*k*Math.sin(th),yb(th)+r[0],cz+r[2]*k*Math.cos(th)),hd()); },(c,j)=>[c/32*12,j*.55],0);
      grid(t,32,4,true,(i,j)=>{ const th=i/32*TAU, f=j/3, a=5.82+3.13*f, b=6.36+3.29*f; pt(t,V(a*Math.sin(th),yb(th)+.05+(.6*Math.sin(th)**2-.2*Math.cos(th))*f*f,cz+b*Math.cos(th)),hd()); },(c,j)=>[c/32*16,j*.9],0);
      grid(t,32,2,true,(i,j)=>{ const th=i/32*TAU, a=5.85, b=6.39; pt(t,V(a*Math.sin(th),yb(th)+(j?1.15:.06),cz+b*Math.cos(th)),hd()); },(c,j)=>[c/32*24,j],1);
      return t; } };
  // a shoe cut to its own last, bigger than the foot it holds: a closed leather upper from heel to toe, a rubber sole, laces across the vamp, a padded collar round the ankle
  const shoe=s=>{ '@later'; const t=NEW(), n='shoe'+s, A=J0['ankle'+s], Z=SZ.shoe, ST=Z.st, nu=20, vz=ST.map(q=>(q[0]-ST[0][0])/DEF.leather.TS);
    grid(t,nu,ST.length,true,(i,j)=>{ const [z,w,top]=ST[j], q=i/nu*TAU, cx=Math.sin(q), cy=Math.cos(q), y=top/2+top/2*Math.sign(cy)*Math.abs(cy)**(cy<0?1/3:2/2.4); pt(t,V(A.x+w*Math.sign(cx)*Math.abs(cx)**(2/3),Math.max(Z.bot,y),A.z+z),n); },(c,j)=>[c/nu*3,vz[j]],0);
    grid(t,4,ST.length,true,(i,j)=>{ const [z,w0]=ST[j], w=w0<.1?0:w0+.16; pt(t,V(A.x+[-w,w,w,-w][i],[-.55,-.55,.62,.62][i],A.z+z),n); },(c,j)=>[c*.6,vz[j]],1);   // the sole, its tread a little under the ground (the foot inside reaches below it, and shows when the heel lifts)
    grid(t,16,2,true,(i,j)=>{ const q=i/16*TAU, r=j?2.05:2.3; pt(t,V(A.x+Math.sin(q)*r,j?4.2:3.7,A.z-.45+Math.cos(q)*r*1.05),n); },(c,j)=>[c/16*4,j*.4],0);   // the collar
    const top=z=>{ for(let j=1;j<ST.length;j++)if(ST[j][0]>=z){ const a=ST[j-1], b=ST[j], f=(z-a[0])/(b[0]-a[0]); return [a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]; } return [0,Z.bot]; };
    for(const z of [1.1,1.5,1.9,2.3]){ const [w,y]=top(z); grid(t,4,2,true,(i,j)=>{ const hx=w*.5, X=A.x+(j?hx:-hx), Y=y+[.03,.03,.16,.16][i], Zz=A.z+z+[-.08,.08,.08,-.08][i]; pt(t,V(X,Y,Zz),n); },(c,j)=>[c*.3,j],2); }   // the laces
    return t; };

  /* ---------- worn, on one figure ---------- */
  const scratch=NAMES.map(()=>new THREE.Matrix4()), G=new THREE.Matrix4(), Gi=new THREE.Matrix4(), Md=new THREE.Matrix4();
  // a piece's matrix as the body's own: the rig's frame, shaped by the body's E (its build, its design)
  const PM=(n,B,E,M)=>{ const F=R.frameOf(n,B); M.set(F.x.x,F.y.x,F.z.x,F.o.x,F.x.y,F.y.y,F.z.y,F.o.y,F.x.z,F.y.z,F.z.z,F.o.z,0,0,0,1); if(E&&W3.applyE)W3.applyE(M,E,F.o); return M; };
  // the bodies the loose cloth keeps out of: [piece, from, to (at rest), radius]
  const CAP={chestL:['torso',V(1.9,24,0),V(1.9,28,0),4.45],chestR:['torso',V(-1.9,24,0),V(-1.9,28,0),4.45],waistL:['torso',V(1.4,18.5,0),V(1.4,24,0),4],waistR:['torso',V(-1.4,18.5,0),V(-1.4,24,0),4],hips:['hips',V(3.5,17,0),V(-3.5,17,0),3.85]};
  const bustCap=()=>{ if(!CAP.bust){ const B=W3.pcs[W3.idx('bustF')], by=B.bb[2]+5, zc=B.bb[4]+5.7; CAP.bust=['torso',V(2.4,by,zc),V(-2.4,by,zc),2.6]; } return 'bust'; };
  for(const s of 'LR'){ CAP['thigh'+s]=['thigh'+s,along('thigh'+s,.5,0,0),along('thigh'+s,6.6,0,0),3.55]; CAP['shin'+s]=['shin'+s,along('shin'+s,.3,0,0),along('shin'+s,6.3,0,0),2.85];
    CAP['hand'+s]=['forearm'+s,along('forearm'+s,.5,0,0),along('forearm'+s,LEN.forearm+2.4,0,0),1.6];
    const A=J0['ankle'+s]; CAP['shoe'+s]=['shoe'+s,V(A.x,1.5,A.z-.9),V(A.x,1.3,A.z+2.5),1.85]; }
  // what each garment's loose cloth is kept out of, and how much further (the jacket stays outside the shirt)
  const KEEP={shirt:[['chestL',.45],['chestR',.45],['waistL',.55],['waistR',.55],['hips',.6],['thighL',.1],['thighR',.1]],jacket:[['chestL',1],['chestR',1],['waistL',1.1],['waistR',1.1],['hips',1.9],['thighL',.4],['thighR',.4],['handL',.3],['handR',.3]],pants:[['shinL',.25],['shinR',.25]]};   // the cuff already clears the shoe, which never moves against it
  const MATS={shirt:c=>[mat('jersey',c.shirt)],pants:c=>[mat('denim',c.pants),mat('leather',COL.belt),mat('brass',COL.buckle)],jacket:c=>[mat('canvas',c.jacket)],
    shoeL:c=>[mat('leather',c.shoes),mat('rubber',COL.sole),mat('lace',COL.lace)],shoeR:c=>MATS.shoeL(c),hat:c=>[mat('felt',c.hat),mat('band',COL.band)]};
  const RIGID={shoeL:1,shoeR:1,hat:1}, SG={};
  // a held garment's mesh is fixed in its piece's coordinates (posed by one matrix); shared by everyone
  const still=k=>{ '@later'; if(SG[k])return SG[k]; const t=tpl(k), g=new THREE.BufferGeometry(), P=new Float32Array(t.gv.length*3);
    t.gv.forEach((p,v)=>{ P[v*3]=t.l1[p*3]; P[v*3+1]=t.l1[p*3+1]; P[v*3+2]=t.l1[p*3+2]; });
    g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('uv',new THREE.BufferAttribute(t.uvF,2)); g.setIndex(new THREE.BufferAttribute(t.ixU,1)); for(const [s,c,m] of t.grp)g.addGroup(s,c,m);
    g.computeVertexNormals(); g.computeBoundingSphere(); return SG[k]=g; };
  // a hanging garment on one figure: its own cloth and mesh
  const hang=(k,c,held,f)=>{ '@later'; const t=tpl(k,f), n=t.n, pin=new Uint8Array(n), C=[]; for(let i=0;i<n;i++)pin[i]=held||t.Kf[i]===0?1:0;
    for(let q=0;q<t.C.length;q+=2){ const a=t.C[q], b=t.C[q+1]; if(!(pin[a]&&pin[b]))C.push(a,b); }
    const d=DRAPE.make(Float32Array.from(t.P),C,pin), g=new THREE.BufferGeometry(), nv=t.gv.length;
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nv*3),3)); g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(nv*3),3));
    g.setAttribute('uv',new THREE.BufferAttribute(t.uvF,2)); g.setIndex(new THREE.BufferAttribute(t.ixU,1)); for(const [s,cn,m] of t.grp)g.addGroup(s,cn,m);
    const me=new THREE.Mesh(g,MATS[k](c)); me.castShadow=me.receiveShadow=true; me.frustumCulled=false;
    const col=(KEEP[k]||[]).concat(f==='F'&&BUST[k]?[[bustCap(),BUST[k]]]:[]).map(([q,inf])=>({q:CAP[q],inf,c:{a:[0,0,0],b:[0,0,0],r:1}})), K=t.Kf;
    const o={g:FALL,dm:.975,ks:0,it:4,post:1,col:col.map(x=>x.c),push:(i,a,F)=>{ const X=d.X, T=d.X0, s=K[i]; F[0]=(T[a]-X[a])*s; F[1]=(T[a+1]-X[a+1])*s; F[2]=(T[a+2]-X[a+2])*s; }};
    return {k,t,d,g,me,col,o,free:C.length>0}; };
  // where every point should be: on its pieces as they are now (blended between two at a joint)
  const aim=(w,Ms)=>{ '@later'; const t=w.t, T=w.d.X0, s1=t.s1, s2=t.s2, l1=t.l1, l2=t.l2, w2=t.w2;
    for(let i=0;i<t.n;i++){ const a=i*3, e=Ms[s1[i]].elements, x=l1[a], y=l1[a+1], z=l1[a+2];
      let px=e[0]*x+e[4]*y+e[8]*z+e[12], py=e[1]*x+e[5]*y+e[9]*z+e[13], pz=e[2]*x+e[6]*y+e[10]*z+e[14]; const k=s2[i];
      if(k>=0){ const f=Ms[k].elements, X=l2[a], Y=l2[a+1], Z=l2[a+2], q=w2[i]; px+=(f[0]*X+f[4]*Y+f[8]*Z+f[12]-px)*q; py+=(f[1]*X+f[5]*Y+f[9]*Z+f[13]-py)*q; pz+=(f[2]*X+f[6]*Y+f[10]*Z+f[14]-pz)*q;
        const r=t.rv[i]; if(r>0){ const dx=px-f[12], dy=py-f[13], dz=pz-f[14], d=Math.hypot(dx,dy,dz); if(d>1e-4){ const s=r*Math.hypot(f[0],f[1],f[2])/d; px=f[12]+dx*s; py=f[13]+dy*s; pz=f[14]+dz*s; } } }
      T[a]=px; T[a+1]=py; T[a+2]=pz; } };
  const keepOut=(w,Ms)=>{ '@later'; for(const x of w.col){ const [k,A,B,r]=x.q, e=Ms[NI[k]].elements, a=toLA(k,A), b=toLA(k,B), c=x.c;
      c.a[0]=e[0]*a[0]+e[4]*a[1]+e[8]*a[2]+e[12]; c.a[1]=e[1]*a[0]+e[5]*a[1]+e[9]*a[2]+e[13]; c.a[2]=e[2]*a[0]+e[6]*a[1]+e[10]*a[2]+e[14];
      c.b[0]=e[0]*b[0]+e[4]*b[1]+e[8]*b[2]+e[12]; c.b[1]=e[1]*b[0]+e[5]*b[1]+e[9]*b[2]+e[13]; c.b[2]=e[2]*b[0]+e[6]*b[1]+e[10]*b[2]+e[14];
      c.r=r*Math.sqrt(Math.hypot(e[0],e[1],e[2])*Math.hypot(e[8],e[9],e[10]))+x.inf; } };
  const CALM=20, CALMV=3e-4, FIRM=.45, RW={}, WR={}, FM=new THREE.Matrix4(), FQ=V(0,0,0);
  const firm=(w,Ms)=>{ '@later'; const T=w.d.X0; for(const F of w.t.firm)for(let k=0,m=F.ps.length;k<m;k++){ const n=F.ps[k], D=sdfOf(n); if(!D)continue; const f=fr0(n), rw=RW[n]||(RW[n]=new THREE.Matrix4()), wr=WR[n]||(WR[n]=new THREE.Matrix4());
      FM.set(f.x.x,f.y.x,f.z.x,f.o.x,f.x.y,f.y.y,f.z.y,f.o.y,f.x.z,f.y.z,f.z.z,f.o.z,0,0,0,1); wr.copy(FM).invert().premultiply(Ms[NI[n]]); rw.copy(wr).invert(); const a=rw.elements, b=wr.elements;
      for(let q=0;q<F.ix.length;q++){ const i=F.ix[q]*3, x=T[i], y=T[i+1], z=T[i+2]; FQ.x=a[0]*x+a[4]*y+a[8]*z+a[12]; FQ.y=a[1]*x+a[5]*y+a[9]*z+a[13]; FQ.z=a[2]*x+a[6]*y+a[10]*z+a[14];
        const need=Math.min(F.d[q*m+k],FIRM), d=D(FQ); if(d>=need)continue; const h=.05, gx=D(V(FQ.x+h,FQ.y,FQ.z))-D(V(FQ.x-h,FQ.y,FQ.z)), gy=D(V(FQ.x,FQ.y+h,FQ.z))-D(V(FQ.x,FQ.y-h,FQ.z)), gz=D(V(FQ.x,FQ.y,FQ.z+h))-D(V(FQ.x,FQ.y,FQ.z-h)), gl=Math.hypot(gx,gy,gz);
        if(gl<1e-6)continue; const u=(need-d)/gl, qx=FQ.x+gx*u, qy=FQ.y+gy*u, qz=FQ.z+gz*u; T[i]=b[0]*qx+b[4]*qy+b[8]*qz+b[12]; T[i+1]=b[1]*qx+b[5]*qy+b[9]*qz+b[13]; T[i+2]=b[2]*qx+b[6]*qy+b[10]*qz+b[14]; } } };
  const LA=new Map(), toLA=(k,p)=>{ let m=LA.get(p); if(!m){ m=toL(k,p); LA.set(p,m); } return m; };
  // the cloth into its mesh (the seam's two copies of a point share one normal)
  const draw=w=>{ '@later'; const pa=w.g.attributes.position.array, X=w.d.X, gv=w.t.gv;
    for(let v=0;v<gv.length;v++){ const p=gv[v]*3, o=v*3; pa[o]=X[p]; pa[o+1]=X[p+1]; pa[o+2]=X[p+2]; }
    w.g.attributes.position.needsUpdate=true; w.g.computeVertexNormals(); const na=w.g.attributes.normal.array, se=w.t.seam;
    for(let q=0;q<se.length;q+=2){ const a=se[q]*3, b=se[q+1]*3, x=na[a]+na[b], y=na[a+1]+na[b+1], z=na[a+2]+na[b+2], l=Math.hypot(x,y,z)||1; na[a]=na[b]=x/l; na[a+1]=na[b+1]=y/l; na[a+2]=na[b+2]=z/l; } };
  // what is worn, built (again) when it changes
  const dress=(spec,H)=>{ '@later'; const o=H.garb; if(o){ o.root.removeFromParent(); for(const w of o.ws)w.g.dispose(); }
    const root=new THREE.Group(), ws=[], rg=[], c=spec.col; root.name='garb';
    for(const k of ['pants','shirt','jacket'])if(spec[k]){ const w=hang(k,c,k==='shirt'&&spec.jacket,spec.form); ws.push(w); root.add(w.me); }
    for(const k of ['shoeL','shoeR','hat'])if(spec[k==='hat'?'hat':'shoes']){ const me=new THREE.Mesh(still(k),MATS[k](c)); me.matrixAutoUpdate=false; me.castShadow=me.receiveShadow=true; me.frustumCulled=false; rg.push({me,k:NI[k==='hat'?'head':k],head:k==='hat'}); root.add(me); }
    return H.garb={k:spec.k,root,ws,rg,Gp:null,t:0,away:true,ms:0}; };
  const HATCUT=6.9;   // head-local height of the hat's band: hair above it is inside the crown, so not drawn
  const FR=new THREE.Frustum(), PV=new THREE.Matrix4(), SPH=new THREE.Sphere();
  const seen=g=>{ const cam=SHARED.cam; if(!cam)return true; PV.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); FR.setFromProjectionMatrix(PV); SPH.center.set(g.position.x,g.position.y+TILE,g.position.z); SPH.radius=2*TILE; return FR.intersectsSphere(SPH); };
  // each frame: g the figure's group, B its pose, spec what it wears (null: nothing shown), H what it keeps, me its body (hidden: so are its clothes), E its body's shape by piece name
  GARB.draw=(g,B,spec,H,me,E)=>{ if(!g||!B||!B.J)return; const t0=performance.now(); let W=H.garb;
    if(!spec||me&&!me.visible){ if(W)W.root.visible=false; return; }
    if(!W||W.k!==spec.k)W=dress(spec,H);
    if(W.root.parent!==g)g.add(W.root); W.root.visible=true;
    const mine=g===W3.group, dt=W.t?Math.min(.1,(t0-W.t)/1000):1/60; W.t=t0; if(mine){ GARB.mine=H; W3.uHatCut.value=spec.hat?HATCUT:1e9; }
    // off screen nothing moves (it settles where it should be when it comes back); far, the cloth rides the body
    let sim=true; if(!mine&&SHARED.cam){ if(!seen(g)){ W.away=true; return; } if(SHARED.cam.position.distanceTo(g.position)>45*TILE)sim=false; }
    for(let i=0;i<NAMES.length;i++)PM(NAMES[i],B,E&&E[NAMES[i]],scratch[i]);
    for(const r of W.rg){ r.me.matrix.copy(scratch[r.k]); r.me.matrixWorldNeedsUpdate=true; r.me.visible=!(r.head&&mine&&W3.noHead); }
    // how the figure moved since the last frame, in its own space: the loose cloth keeps its momentum through it (so it trails a walk or a turn)
    g.updateMatrix(); G.copy(g.matrix); if(g.parent&&g.parent.matrixWorld)G.premultiply(g.parent.matrixWorld);
    let jump=W.away||!W.Gp; W.away=false;
    if(!jump){ Gi.copy(G).invert(); Md.multiplyMatrices(Gi,W.Gp); const e=Md.elements; if(Math.hypot(e[12],e[13],e[14])>30)jump=true; }
    W.Gp=(W.Gp||new THREE.Matrix4()).copy(G);
    const h=Math.max(1/120,Math.min(1/40,dt||1/60));
    // at rest (the body and its pose still, the cloth settled) nothing is aimed, stepped or drawn until something moves
    const e0=Md.elements, Bp=W.Bp||(W.Bp=new Float32Array(NAMES.length*16).fill(NaN)); let held=!jump&&Math.abs(e0[12])+Math.abs(e0[13])+Math.abs(e0[14])+Math.abs(e0[0]-1)+Math.abs(e0[5]-1)+Math.abs(e0[10]-1)<1e-5;
    for(let i=0;i<NAMES.length;i++){ const e=scratch[i].elements; for(let j=0;j<16;j++){ if(!(Math.abs(e[j]-Bp[i*16+j])<1e-5))held=false; Bp[i*16+j]=e[j]; } }
    for(const w of W.ws){ const d=w.d, X=d.X, Xp=d.Xp, T=d.X0, pin=d.pin;
      if(held&&w.aimed===(sim?2:1)&&(!sim||!w.free||w.calm>=CALM)){ w.rest=1; continue; } w.rest=0; w.aimed=sim?2:1;
      aim(w,scratch); if(w.t.firm&&sim)firm(w,scratch);
      if(jump||!sim||!w.free){ DRAPE.settle(d,T); w.calm=0; }
      else{ const e=Md.elements;
        for(let i=0;i<d.n;i++){ const a=i*3; if(pin[i]){ X[a]=T[a]; X[a+1]=T[a+1]; X[a+2]=T[a+2]; continue; }
          let x=X[a], y=X[a+1], z=X[a+2]; X[a]=e[0]*x+e[4]*y+e[8]*z+e[12]; X[a+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; X[a+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
          x=Xp[a]; y=Xp[a+1]; z=Xp[a+2]; Xp[a]=e[0]*x+e[4]*y+e[8]*z+e[12]; Xp[a+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; Xp[a+2]=e[2]*x+e[6]*y+e[10]*z+e[14]; }
        keepOut(w,scratch); w.calm=DRAPE.step(d,h,w.o)<CALMV?(w.calm||0)+1:0; }
      draw(w); }
    W.ms=performance.now()-t0; };
  // what a figure wears: everyone's shirt, trousers and shoes (bare feet take the shoes off) and the dyes ({shirt, pants} colours from what it wears); the hat and jacket pieces are kept for gear to wear
  const SPEC=new Map();
  GARB.spec=(bare,dye,form)=>{ const ds=dye&&dye.shirt, dp=dye&&dye.pants, f=form==='F'?'F':'M', q=(bare?1:0)+'|'+(ds||'')+'|'+(dp||'')+'|'+f; let s=SPEC.get(q); if(s)return s;
    s={k:q,form:f,shirt:true,pants:true,shoes:!bare,hat:false,jacket:false,col:{shirt:ds||COL.shirt,jacket:COL.jacket,pants:dp||COL.pants,shoes:COL.shoes,hat:COL.hat}};
    SPEC.set(q,s); return s; };
  // the body's own clothing layers are all under real clothes; his feet are bare inside the shoes
  GARB.worn=()=>({shirt:false,pants:false,shoes:false,hair:true,beard:true});
  // your body's shape by piece name (her chest and head are their own pieces)
  const myE={}, IDX={};
  GARB.myE=()=>{ const f=W3.style&&W3.style.form==='F'; for(const n of NAMES){ const p=f&&n==='torso'?'torsoF':f&&n==='head'?'headF':n; const i=IDX[p]??(IDX[p]=W3.idx(p)); myE[n]=i>=0&&W3.E?W3.E[i]:null; } return myE; };
  GARB.of=(form,i2E)=>{ const o={}; for(const n of NAMES){ const p=form==='F'&&n==='torso'?'torsoF':form==='F'&&n==='head'?'headF':n, i=W3.idx(p); o[n]=i>=0?i2E(i):null; } return o; };
  window.GARBDBG=()=>{ const H=GARB.mine, W=H&&H.garb; return W?{k:W.k,parts:W.ws.map(w=>({k:w.k,points:w.t.n,free:w.d.pin.reduce((a,p)=>a+(p?0:1),0),still:w.calm||0,rest:!!w.rest})),held:W.rg.length,made:GARB.made,ms:+W.ms.toFixed(3),shown:W.root.visible}:null; }; window.GARBDBG.spec=GARB.spec; window.GARBDBG.G=GARB; }
export {GARB};

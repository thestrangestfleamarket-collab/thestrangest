// THE CLOTHES: a real shirt, trousers, shoes, hat and jacket worn over the Walker, each its own mesh in photoreal fabric on the rig's frames (shaped as his body is); their loose parts hang and swing on DRAPE, kept out of his body: the shirt's and the jacket's lower body, the jacket's open front, the trouser cuffs and the sleeve ends.
import {SHARED, THREE} from './003-shx.js';
import {W3} from './003b-systems.js';
import {renderer} from './004-main.js';
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

  /* ---------- fabrics: painted the first time they are worn (a grey weave multiplied by the garment's colour, so dyes still work, and its bumps) ---------- */
  const hsh=(x,y,s)=>{ let h=(x*374761393+y*668265263+s*982451653)|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,y,Px,Py,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), fx=x-xi, fy=y-yi, u=fx*fx*(3-2*fx), w=fy*fy*(3-2*fy), mx=k=>((k%Px)+Px)%Px, my=k=>((k%Py)+Py)%Py;
    const a=hsh(mx(xi),my(yi),s), b=hsh(mx(xi+1),my(yi),s), c=hsh(mx(xi),my(yi+1),s), d=hsh(mx(xi+1),my(yi+1),s); return a+(b-a)*u+(c-a)*w+(a-b-c+d)*u*w; };
  const fbm=(u,v,Px,Py,s,o)=>{ let t=0, a=.5, f=1, n=0; for(let i=0;i<o;i++){ t+=a*vn(u*Px*f,v*Py*f,Px*f,Py*f,s+i*7); n+=a; a*=.5; f*=2; } return t/n; };
  const wave=x=>.5+.5*Math.cos((((x%1)+1)%1)*TAU);
  // each: [height, lightness] at u,v in one tile (it repeats)
  const PAINT={
    jersey:(u,v)=>{ const cx=(u*40)%1, cy=(v*48)%1, r=1-Math.min(1,Math.abs(Math.abs(cx-.5)*2-cy)*2.4), n=fbm(u,v,64,64,1,2); return [r*.7+n*.3,.9+r*.07+(n-.5)*.08]; },
    denim:(u,v)=>{ const r=wave(u*56+v*56), sl=fbm(u,v,40,6,5,3), n=fbm(u,v,128,128,9,2); return [r*.65+n*.35,.78+r*.1+(sl-.5)*.22+(n-.5)*.06]; },
    canvas:(u,v)=>{ const r=wave(u*44-v*44), sl=fbm(u,v,24,24,11,3), wx=fbm(u,v,4,4,13,3), n=fbm(u,v,96,96,17,2); return [r*.6+n*.4,.86+r*.06+(sl-.5)*.12+(wx-.5)*.16]; },
    leather:(u,v)=>{ const c=fbm(u,v,28,28,21,3), cr=1-Math.abs(c-.5)*2, b=fbm(u,v,5,5,23,3); return [cr*.8+fbm(u,v,64,64,25,2)*.2,.82+(1-cr)*.1+(b-.5)*.18]; },
    felt:(u,v)=>{ const n=fbm(u,v,48,48,31,4), m=fbm(u,v,6,6,33,3); return [n,.88+(n-.5)*.1+(m-.5)*.1]; },
    rubber:(u,v)=>{ const n=fbm(u,v,64,64,41,3), g=(v*20)%1<.5?1:0; return [n*.5+g*.5,.9+(n-.5)*.08]; },
    band:(u,v)=>{ const r=wave(v*36), n=fbm(u,v,64,64,51,2); return [r*.8+n*.2,.86+r*.1]; },
    lace:(u,v)=>{ const r=wave(u*12+v*12); return [r,.85+r*.12]; } };
  // r roughness, m metal, sh/shr cloth sheen, cc/ccr a waxed or polished coat, ns bump strength, TS the size of one tile in rig units, N its pixels
  const DEF={jersey:{r:.84,sh:.55,shr:.55,ns:.5,TS:3.2,N:256},denim:{r:.86,sh:.28,shr:.5,ns:.75,TS:2.4,N:256},canvas:{r:.74,sh:.32,shr:.55,cc:.14,ccr:.55,ns:.6,TS:2.6,N:256},
    leather:{r:.46,cc:.4,ccr:.3,ns:.5,TS:2.2,N:128},felt:{r:.96,sh:.75,shr:.8,ns:.35,TS:3.4,N:128},rubber:{r:.9,ns:.4,TS:1.6,N:128},band:{r:.55,sh:.45,shr:.4,ns:.55,TS:1.2,N:128},
    lace:{r:.8,sh:.3,ns:.4,TS:1,N:64},brass:{r:.32,m:.85}};
  const COL=GARB.COL={shirt:'#e2dccd',pants:'#3a5070',jacket:'#6b6844',shoes:'#5b3b25',hat:'#3a3531',sole:'#2b2622',lace:'#2a201a',band:'#1e1b1a',belt:'#3a2517',buckle:'#b8954f'};
  const FAB={}, MAT={};
  const paint=k=>{ const N=DEF[k].N, f=PAINT[k], H=new Float32Array(N*N), cv=document.createElement('canvas'), nv=document.createElement('canvas'); cv.width=cv.height=nv.width=nv.height=N;
    const g=cv.getContext('2d'), im=g.createImageData(N,N), ng=nv.getContext('2d'), ni=ng.createImageData(N,N);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const r=f(x/N,y/N), i=y*N+x, c=Math.max(0,Math.min(1,r[1]))*255, o=i*4; H[i]=r[0]; im.data[o]=im.data[o+1]=im.data[o+2]=c; im.data[o+3]=255; }
    const h=(x,y)=>H[((y+N)%N)*N+(x+N)%N], kb=3;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const dx=(h(x+1,y)-h(x-1,y))*kb, dy=(h(x,y+1)-h(x,y-1))*kb, l=Math.hypot(dx,dy,1), o=(y*N+x)*4;
      ni.data[o]=(-dx/l*.5+.5)*255; ni.data[o+1]=(dy/l*.5+.5)*255; ni.data[o+2]=(1/l*.5+.5)*255; ni.data[o+3]=255; }
    g.putImageData(im,0,0); ng.putImageData(ni,0,0);
    const map=new THREE.CanvasTexture(cv), nm=new THREE.CanvasTexture(nv); map.colorSpace=THREE.SRGBColorSpace;
    const an=renderer.capabilities?renderer.capabilities.getMaxAnisotropy():1; for(const t of [map,nm]){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=Math.min(8,an); }
    return {map,nm}; };
  const mat=(k,c)=>{ const q=k+c; if(MAT[q])return MAT[q]; const D=DEF[k], o={color:new THREE.Color(c),roughness:D.r,metalness:D.m||0,side:THREE.DoubleSide};
    if(PAINT[k]){ const f=FAB[k]||(FAB[k]=paint(k)); o.map=f.map; o.normalMap=f.nm; o.normalScale=new THREE.Vector2(D.ns,D.ns); }
    if(D.sh){ o.sheen=D.sh; o.sheenRoughness=D.shr; o.sheenColor=new THREE.Color(0xffffff); } if(D.cc){ o.clearcoat=D.cc; o.clearcoatRoughness=D.ccr; }
    return MAT[q]=new THREE.MeshPhysicalMaterial(o); };

  /* ---------- a garment's shape, made once and shared by everyone wearing it ---------- */
  // P its points at rest (rig units); each hangs from piece a, or a then b by w; K how loose it is (0: held to the body); C the threads between points; the mesh: gv (mesh vertex -> point), uv, ix, seam pairs, material groups
  const NEW=()=>({P:[],S:[],K:[],C:[],gv:[],uv:[],ix:[],seam:[],grp:[]});
  const pt=(t,p,a,b,w,k)=>{ t.P.push(p.x,p.y,p.z); t.S.push([a,b,w||0,p]); t.K.push(k||0); };
  // a grid of nu round by nv along (closed: it goes all the way round), its points made by at(i,j) in order; across, along, the diagonals, and every other point (it bends, it doesn't crumple)
  const grid=(t,nu,nv,closed,at,uvAt,m)=>{ const b=t.P.length/3, g0=t.gv.length, i0=t.ix.length, cols=closed?nu+1:nu, id=(i,j)=>b+j*nu+((i%nu)+nu)%nu;
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++)at(i,j);
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){ const r1=closed||i+1<nu, r2=nu>2&&(closed||i+2<nu);
      if(r1){ t.C.push(id(i,j),id(i+1,j)); if(j<nv-1)t.C.push(id(i,j),id(i+1,j+1),id(i+1,j),id(i,j+1)); } if(r2)t.C.push(id(i,j),id(i+2,j));
      if(j<nv-1)t.C.push(id(i,j),id(i,j+1)); if(j<nv-2)t.C.push(id(i,j),id(i,j+2)); }
    for(let j=0;j<nv;j++)for(let c=0;c<cols;c++){ t.gv.push(id(c,j)); const q=uvAt(c,j); t.uv.push(q[0],q[1]); }
    for(let j=0;j<nv-1;j++)for(let c=0;c<cols-1;c++){ const a=g0+j*cols+c; t.ix.push(a,a+cols,a+1,a+1,a+cols,a+cols+1); }
    if(closed)for(let j=0;j<nv;j++)t.seam.push(g0+j*cols,g0+j*cols+nu);
    t.grp.push([i0,t.ix.length-i0,m]); };
  // each point in its pieces' own coordinates at rest, so it rides them as the body moves (and is shaped as the body is)
  const fin=t=>{ const n=t.P.length/3; t.n=n; t.s1=new Int8Array(n); t.s2=new Int8Array(n); t.l1=new Float32Array(n*3); t.l2=new Float32Array(n*3); t.w2=new Float32Array(n); t.Kf=Float32Array.from(t.K);
    t.S.forEach(([a,b,w,p],i)=>{ t.s1[i]=NI[a]; t.l1.set(toL(a,p),i*3); t.s2[i]=b?NI[b]:-1; if(b){ t.l2.set(toL(b,p),i*3); t.w2[i]=w; } });
    t.uvF=new Float32Array(t.uv); t.ixU=new Uint32Array(t.ix); delete t.S; return t; };
  // a torso garment: rows [y, half width, half depth, lean(th)] from its top, round from th0 to th1 (closed: all round); sk(y) what a point hangs from at that height
  const torso=(t,rows,nu,closed,th0,th1,K,m,TS,sk)=>{ const vl=[0]; for(let j=1;j<rows.length;j++)vl.push(vl[j-1]+Math.hypot(rows[j][0]-rows[j-1][0],(rows[j][1]-rows[j-1][1])*.7));
    const span=closed?TAU:th1-th0, reps=Math.max(1,Math.round(rows.reduce((a,r)=>a+Math.PI*(r[1]+r[2]),0)/rows.length*span/TAU/TS));
    grid(t,nu,rows.length,closed,(i,j)=>{ const r=rows[j], th=closed?i/nu*TAU:th0+span*i/(nu-1), p=V(r[1]*Math.sin(th),r[0]+(r[3]?r[3](th):0),r[2]*Math.cos(th)), s=sk(p.y); pt(t,p,s[0],s[1],s[2],K(i,j,th)); },
      (c,j)=>[c/(closed?nu:nu-1)*reps,vl[j]/TS],m); };
  // the chest takes the top of a torso garment, the pelvis the bottom
  const chest=y=>{ const w=sm((28-y)/10); return w>=1?['hips',null,0]:w<=0?['torso',null,0]:['torso','hips',w]; };
  // a sleeve or a trouser leg: rings [piece, t along it, radius, (piece b, w)] down the limb
  const limb=(t,rings,nu,K,m,TS)=>{ const vl=[0]; for(let j=1;j<rings.length;j++)vl.push(vl[j-1]+Math.abs(rings[j][1]-rings[j-1][1]+(rings[j][0]!==rings[j-1][0]?LEN[rings[j-1][0].replace(/[LR]$/,'')]:0)));
    const reps=Math.max(1,Math.round(TAU*rings[0][2]/TS));
    grid(t,nu,rings.length,true,(i,j)=>{ const g=rings[j], p=along(g[0],g[1],g[2],i/nu*TAU); pt(t,p,g[3]||g[0],g[3]?g[0]:null,g[3]?g[4]:0,K(j)); },(c,j)=>[c/nu*reps,vl[j]/TS],m); };
  // ...where g[3] is the other piece a ring by a joint also hangs from, and g[4] how much of its own piece it takes

  // her shape: the shirt and jacket go out over her bust (her own bust shape, kept cl clear) and fall from it
  const BUST={shirt:.3,jacket:1.15}, bustP=()=>W3.pcs&&W3.pcs[W3.idx('bustF')];
  const bustFit=(t,cl)=>{ const B=bustP(); if(!B)return t; const d=B.d, by=B.bb[2]+5, zc=B.bb[4]+5.7, P=t.P, S=t.S; CAP.bust=['torso',V(2.4,by,zc),V(-2.4,by,zc),2.6];
    const need=(x,y,z)=>{ let dz=0; while(dz<4&&d(V(x,y,z+dz))<cl)dz+=.05; return dz; };
    S.forEach((s,i)=>{ const p=s[3]; if(p.z<=0||p.y>by+5||p.y<by-10)return; let dz=p.y>by-5?need(p.x,p.y,p.z):0;
      if(p.y<by)dz=Math.max(dz,need(p.x,by,p.z)*sm(1-(by-p.y)/9)); if(dz>0){ p.z+=dz; P[i*3+2]=p.z; } });
    return t; };
  const TPL={}, tpl=(k,f)=>{ const q=f==='F'&&BUST[k]?k+'F':k; return TPL[q]||(TPL[q]=fin(q===k?MAKE[k]():bustFit(MAKE[k](),BUST[k]))); };
  const neck=th=>-.55*Math.cos(th), yoke=th=>-.3*Math.cos(th)-.3*Math.sin(th)**2, shoulder=th=>-.2*Math.cos(th)-.65*Math.sin(th)**2;
  const MAKE={
    // a cotton crew-neck tee, worn loose: held from the shoulders to the chest, the rest hangs; short sleeves with loose hems
    shirt:()=>{ const t=NEW(), TS=DEF.jersey.TS;
      const rows=[[31.45,3.75,3.5,neck],[31.65,6.1,4.55,yoke],[31.15,8.55,5,shoulder],[29.4,8.8,5.2],[27.6,8.8,5.22],[25.6,8.72,5.12],[23.6,8.6,5.02],[21.6,8.55,4.98],[19.6,8.62,5.05],[17.7,8.78,5.2],[16,8.92,5.32],[14.6,9,5.4]];
      const KR=[0,0,0,0,0,.22,.16,.11,.08,.065,.055,.05];
      torso(t,rows,28,true,0,0,(i,j)=>KR[j],0,TS,chest);
      torso(t,[[31.45,3.78,3.52,neck],[32,3.95,3.7,neck]],28,true,0,0,()=>0,0,TS*.5,chest);   // the ribbed neckband
      for(const s of 'LR'){ const u='upperArm'+s; limb(t,[[u,-.5,3.35,'torso',.2],[u,.4,3.3,'torso',.7],[u,1.4,3.22],[u,2.4,3.18],[u,3.1,3.28]],16,j=>j===4?.3:0,0,TS); }
      return t; },
    // straight-leg jeans on a leather belt with a brass buckle: held from the waist down, the cuffs swing and break over the shoes
    pants:()=>{ const t=NEW(), TS=DEF.denim.TS, hip=()=>['hips',null,0];
      torso(t,[[20.4,8.15,5],[19.6,8.2,5.05],[18.2,8.35,5.2],[16.6,8.45,5.3],[15.2,8.32,5.25]],28,true,0,0,()=>0,0,TS,hip);
      torso(t,[[20.55,8.32,5.18],[19.45,8.36,5.2]],28,true,0,0,()=>0,1,DEF.leather.TS,hip);
      grid(t,2,2,false,(i,j)=>pt(t,V(i?1:-1,j?19.35:20.65,5.36),'hips'),(c,j)=>[c,j],2);   // the buckle
      for(const s of 'LR'){ const th='thigh'+s, sh='shin'+s;
        limb(t,[[th,-1.4,4.42,'hips',.35],[th,.4,4.35,'hips',.8],[th,2.2,4.15],[th,4,3.98],[th,5.6,3.82,sh,.75],[th,6.6,3.74,sh,.4],[sh,.6,3.7,th,.85],[sh,2.2,3.6],[sh,3.8,3.52],[sh,5.4,3.46],[sh,6.4,3.45],[sh,7.1,3.5],[sh,7.6,3.56]],
          16,j=>j===10?.3:j===11?.2:j===12?.14:0,0,TS); }
      return t; },
    // an olive waxed-canvas chore jacket worn open: held over the shoulders and chest, the body hangs and its two fronts swing; a folded collar, chest pockets, long sleeves with loose cuffs
    jacket:()=>{ const t=NEW(), TS=DEF.canvas.TS, th0=.36, th1=TAU-.36, KR=[0,0,0,0,0,.2,.14,.1,.075,.06,.05,.045];
      const rows=[[31.6,4.45,4.15,neck],[31.75,6.6,5.1,yoke],[31.05,9.3,5.7,th=>-.7*Math.sin(th)**2],[29.3,9.72,6],[27.4,9.78,6.05],[25.3,9.7,5.95],[23.2,9.6,5.85],[21.1,9.55,5.8],[19,9.62,5.86],[16.9,9.76,5.98],[14.9,9.9,6.1],[13.3,10,6.2]];
      // the fronts by the opening hang looser than the back
      torso(t,rows,26,false,th0,th1,(i,j)=>{ const e=Math.min(i,25-i); return KR[j]*(e<3?.55+.15*e:1); },0,TS,chest);
      torso(t,[[31.6,4.5,4.2,neck],[33.4,4.75,4.5,neck],[31.5,6.3,5.7,yoke]],26,false,th0,th1,()=>0,0,TS*.6,chest);   // the collar, folded down
      for(const sg of [1,-1]){ const tc=sg*.85; grid(t,3,2,false,(i,j)=>{ const th=tc+(i-1)*.22, y=j?27.6:29, a=(j?9.78:9.72)+.2, b=(j?6.05:6)+.2; pt(t,V(a*Math.sin(th),y,b*Math.cos(th)),'torso'); },(c,j)=>[c*.5,j*.6],0); }
      for(const s of 'LR'){ const u='upperArm'+s, f='forearm'+s;
        limb(t,[[u,-.6,3.62,'torso',.2],[u,.7,3.55,'torso',.75],[u,2.4,3.45],[u,4.2,3.38],[u,5.8,3.32,f,.8],[u,7,3.28,f,.45],[f,.6,3.24,u,.85],[f,2,3.16],[f,3.4,3.08],[f,4.8,3],[f,5.9,2.96],[f,6.5,3.02]],
          16,j=>j===11?.3:0,0,TS); }
      return t; },
    // leather boots on rubber soles, laced: the upper lofted along the foot, the sole a slab, the laces across the vamp
    shoeL:()=>shoe('L'), shoeR:()=>shoe('R'),
    // a charcoal felt fedora: a pinched crown, a grosgrain band, a snap brim down at the front and up at the sides
    hat:()=>{ const t=NEW(), yb=th=>50.75-.35*Math.cos(th), cz=.2, hd=()=>'head';
      const crown=[[0,5.78,6.32,1],[1,5.72,6.26,1],[2.2,5.52,6.06,1],[3.4,5.26,5.8,1],[4.4,5,5.5,1],[5,4.66,5.12,1],[5.18,3.4,3.75,.72],[4.85,2,2.2,.42],[4.45,.7,.75,.14]];
      const pinch=(th,j)=>j>=4?1-.16*Math.max(0,Math.cos(th))**2:1;
      grid(t,32,crown.length,true,(i,j)=>{ const th=i/32*TAU, r=crown[j], k=pinch(th,j); pt(t,V(r[1]*k*Math.sin(th),yb(th)+r[0],cz+r[2]*k*Math.cos(th)),hd()); },(c,j)=>[c/32*12,j*.55],0);
      grid(t,32,4,true,(i,j)=>{ const th=i/32*TAU, f=j/3, a=5.82+3.13*f, b=6.36+3.29*f; pt(t,V(a*Math.sin(th),yb(th)+.05+(.6*Math.sin(th)**2-.2*Math.cos(th))*f*f,cz+b*Math.cos(th)),hd()); },(c,j)=>[c/32*16,j*.9],0);
      grid(t,32,2,true,(i,j)=>{ const th=i/32*TAU, a=5.85, b=6.39; pt(t,V(a*Math.sin(th),yb(th)+(j?1.15:.06),cz+b*Math.cos(th)),hd()); },(c,j)=>[c/32*24,j],1);
      return t; } };
  // a boot: stations along the foot [z, half width, top]; the upper an arch over them, the sole a slab under them, both closed at the heel and the toe
  const shoe=s=>{ const t=NEW(), n='shoe'+s, A=J0['ankle'+s], x0=A.x, z0=A.z, BOT=.58, e=2/2.6, sp=(c,q)=>Math.sign(c)*Math.abs(c)**q;
    const ST=[[-1.85,0,BOT],[-1.75,.5,2.2],[-1.4,1.42,4.85],[-.7,1.68,4.95],[.3,1.74,4.65],[1.3,1.94,3.05],[2.1,2,2.35],[2.8,1.8,2],[3.3,1.32,1.75],[3.62,.42,1.35],[3.72,0,BOT]];
    const vz=ST.map(q=>(q[0]+1.85)/DEF.leather.TS);
    grid(t,13,ST.length,false,(i,j)=>{ const [z,w,top]=ST[j], a=i/12*Math.PI; pt(t,V(x0+w*sp(Math.cos(a),e),BOT+(top-BOT)*Math.abs(Math.sin(a))**e,z0+z),n); },(c,j)=>[c/12*3,vz[j]],0);
    grid(t,4,ST.length,true,(i,j)=>{ const [z,w0]=ST[j], w=w0?w0+.16:0, X=[x0-w,x0+w,x0+w,x0-w][i], Y=[0,0,.62,.62][i]; pt(t,V(X,Y,z0+z),n); },(c,j)=>[c*.6,vz[j]],1);
    const top=z=>{ for(let j=1;j<ST.length;j++)if(ST[j][0]>=z){ const a=ST[j-1], b=ST[j], f=(z-a[0])/(b[0]-a[0]); return [a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]; } return [0,BOT]; };
    for(const z of [.45,.85,1.25,1.65,2]){ const [w,y]=top(z); grid(t,4,2,true,(i,j)=>{ const hx=w*.55, X=x0+(j?hx:-hx), Y=y+[.02,.02,.14,.14][i], Z=z0+z+[-.07,.07,.07,-.07][i]; pt(t,V(X,Y,Z),n); },(c,j)=>[c*.3,j],2); }
    return t; };

  /* ---------- worn, on one figure ---------- */
  const scratch=NAMES.map(()=>new THREE.Matrix4()), G=new THREE.Matrix4(), Gi=new THREE.Matrix4(), Md=new THREE.Matrix4();
  // a piece's matrix as the body's own: the rig's frame, shaped by the body's E (its build, its design)
  const PM=(n,B,E,M)=>{ const F=R.frameOf(n,B); M.set(F.x.x,F.y.x,F.z.x,F.o.x,F.x.y,F.y.y,F.z.y,F.o.y,F.x.z,F.y.z,F.z.z,F.o.z,0,0,0,1); if(E&&W3.applyE)W3.applyE(M,E,F.o); return M; };
  // the bodies the loose cloth keeps out of: [piece, from, to (at rest), radius]
  const CAP={torsoL:['torso',V(3.5,18.5,0),V(3.5,28.5,0),4.5],torsoR:['torso',V(-3.5,18.5,0),V(-3.5,28.5,0),4.5],hips:['hips',V(3.4,16.8,0),V(-3.4,16.8,0),4.4]};
  for(const s of 'LR'){ CAP['thigh'+s]=['thigh'+s,along('thigh'+s,.5,0,0),along('thigh'+s,6.6,0,0),3.55]; CAP['shin'+s]=['shin'+s,along('shin'+s,.3,0,0),along('shin'+s,6.3,0,0),2.85];
    const A=J0['ankle'+s]; CAP['shoe'+s]=['shoe'+s,V(A.x,1.5,A.z-.9),V(A.x,1.3,A.z+2.5),1.85]; }
  // what each garment's loose cloth is kept out of, and how much further (the jacket stays outside the shirt)
  const KEEP={shirt:[['torsoL',.2],['torsoR',.2],['hips',.2],['thighL',.1],['thighR',.1]],jacket:[['torsoL',1],['torsoR',1],['hips',.9],['thighL',.4],['thighR',.4]],pants:[['shinL',.25],['shinR',.25],['shoeL',.1],['shoeR',.1]]};
  const MATS={shirt:c=>[mat('jersey',c.shirt)],pants:c=>[mat('denim',c.pants),mat('leather',COL.belt),mat('brass',COL.buckle)],jacket:c=>[mat('canvas',c.jacket)],
    shoeL:c=>[mat('leather',c.shoes),mat('rubber',COL.sole),mat('lace',COL.lace)],shoeR:c=>MATS.shoeL(c),hat:c=>[mat('felt',c.hat),mat('band',COL.band)]};
  const RIGID={shoeL:1,shoeR:1,hat:1}, SG={};
  // a held garment's mesh is fixed in its piece's coordinates (posed by one matrix); shared by everyone
  const still=k=>{ if(SG[k])return SG[k]; const t=tpl(k), g=new THREE.BufferGeometry(), P=new Float32Array(t.gv.length*3);
    t.gv.forEach((p,v)=>{ P[v*3]=t.l1[p*3]; P[v*3+1]=t.l1[p*3+1]; P[v*3+2]=t.l1[p*3+2]; });
    g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('uv',new THREE.BufferAttribute(t.uvF,2)); g.setIndex(new THREE.BufferAttribute(t.ixU,1)); for(const [s,c,m] of t.grp)g.addGroup(s,c,m);
    g.computeVertexNormals(); g.computeBoundingSphere(); return SG[k]=g; };
  // a hanging garment on one figure: its own cloth and mesh
  const hang=(k,c,held,f)=>{ const t=tpl(k,f), n=t.n, pin=new Uint8Array(n), C=[]; for(let i=0;i<n;i++)pin[i]=held||t.Kf[i]===0?1:0;
    for(let q=0;q<t.C.length;q+=2){ const a=t.C[q], b=t.C[q+1]; if(!(pin[a]&&pin[b]))C.push(a,b); }
    const d=DRAPE.make(Float32Array.from(t.P),C,pin), g=new THREE.BufferGeometry(), nv=t.gv.length;
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(nv*3),3)); g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(nv*3),3));
    g.setAttribute('uv',new THREE.BufferAttribute(t.uvF,2)); g.setIndex(new THREE.BufferAttribute(t.ixU,1)); for(const [s,cn,m] of t.grp)g.addGroup(s,cn,m);
    const me=new THREE.Mesh(g,MATS[k](c)); me.castShadow=me.receiveShadow=true; me.frustumCulled=false;
    const col=(KEEP[k]||[]).concat(f==='F'&&BUST[k]?[['bust',BUST[k]-.1]]:[]).map(([q,inf])=>({q:CAP[q],inf,c:{a:[0,0,0],b:[0,0,0],r:1}})), K=t.Kf;
    const o={g:FALL,dm:.975,ks:0,it:4,post:1,col:col.map(x=>x.c),push:(i,a,F)=>{ const X=d.X, T=d.X0, s=K[i]; F[0]=(T[a]-X[a])*s; F[1]=(T[a+1]-X[a+1])*s; F[2]=(T[a+2]-X[a+2])*s; }};
    return {k,t,d,g,me,col,o,free:C.length>0}; };
  // where every point should be: on its pieces as they are now (blended between two at a joint)
  const aim=(w,Ms)=>{ const t=w.t, T=w.d.X0, s1=t.s1, s2=t.s2, l1=t.l1, l2=t.l2, w2=t.w2;
    for(let i=0;i<t.n;i++){ const a=i*3, e=Ms[s1[i]].elements, x=l1[a], y=l1[a+1], z=l1[a+2];
      let px=e[0]*x+e[4]*y+e[8]*z+e[12], py=e[1]*x+e[5]*y+e[9]*z+e[13], pz=e[2]*x+e[6]*y+e[10]*z+e[14]; const k=s2[i];
      if(k>=0){ const f=Ms[k].elements, X=l2[a], Y=l2[a+1], Z=l2[a+2], q=w2[i]; px+=(f[0]*X+f[4]*Y+f[8]*Z+f[12]-px)*q; py+=(f[1]*X+f[5]*Y+f[9]*Z+f[13]-py)*q; pz+=(f[2]*X+f[6]*Y+f[10]*Z+f[14]-pz)*q; }
      T[a]=px; T[a+1]=py; T[a+2]=pz; } };
  const keepOut=(w,Ms)=>{ for(const x of w.col){ const [k,A,B,r]=x.q, e=Ms[NI[k]].elements, a=toLA(k,A), b=toLA(k,B), c=x.c;
      c.a[0]=e[0]*a[0]+e[4]*a[1]+e[8]*a[2]+e[12]; c.a[1]=e[1]*a[0]+e[5]*a[1]+e[9]*a[2]+e[13]; c.a[2]=e[2]*a[0]+e[6]*a[1]+e[10]*a[2]+e[14];
      c.b[0]=e[0]*b[0]+e[4]*b[1]+e[8]*b[2]+e[12]; c.b[1]=e[1]*b[0]+e[5]*b[1]+e[9]*b[2]+e[13]; c.b[2]=e[2]*b[0]+e[6]*b[1]+e[10]*b[2]+e[14];
      c.r=r*Math.sqrt(Math.hypot(e[0],e[1],e[2])*Math.hypot(e[8],e[9],e[10]))+x.inf; } };
  const LA=new Map(), toLA=(k,p)=>{ let m=LA.get(p); if(!m){ m=toL(k,p); LA.set(p,m); } return m; };
  // the cloth into its mesh (the seam's two copies of a point share one normal)
  const draw=w=>{ const pa=w.g.attributes.position.array, X=w.d.X, gv=w.t.gv;
    for(let v=0;v<gv.length;v++){ const p=gv[v]*3, o=v*3; pa[o]=X[p]; pa[o+1]=X[p+1]; pa[o+2]=X[p+2]; }
    w.g.attributes.position.needsUpdate=true; w.g.computeVertexNormals(); const na=w.g.attributes.normal.array, se=w.t.seam;
    for(let q=0;q<se.length;q+=2){ const a=se[q]*3, b=se[q+1]*3, x=na[a]+na[b], y=na[a+1]+na[b+1], z=na[a+2]+na[b+2], l=Math.hypot(x,y,z)||1; na[a]=na[b]=x/l; na[a+1]=na[b+1]=y/l; na[a+2]=na[b+2]=z/l; } };
  // what is worn, built (again) when it changes
  const dress=(spec,H)=>{ const o=H.garb; if(o){ o.root.removeFromParent(); for(const w of o.ws)w.g.dispose(); }
    const root=new THREE.Group(), ws=[], rg=[], c=spec.col; root.name='garb';
    for(const k of ['pants','shirt','jacket'])if(spec[k]){ const w=hang(k,c,k==='shirt'&&spec.jacket,spec.form); ws.push(w); root.add(w.me); }
    for(const k of ['shoeL','shoeR','hat'])if(spec[k==='hat'?'hat':'shoes']){ const me=new THREE.Mesh(still(k),MATS[k](c)); me.matrixAutoUpdate=false; me.castShadow=me.receiveShadow=true; me.frustumCulled=false; rg.push({me,k:NI[k==='hat'?'head':k],head:k==='hat'}); root.add(me); }
    return H.garb={k:spec.k,root,ws,rg,Gp:null,t:0,away:true,ms:0}; };
  const FR=new THREE.Frustum(), PV=new THREE.Matrix4(), SPH=new THREE.Sphere();
  const seen=g=>{ const cam=SHARED.cam; if(!cam)return true; PV.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); FR.setFromProjectionMatrix(PV); SPH.center.set(g.position.x,g.position.y+TILE,g.position.z); SPH.radius=2*TILE; return FR.intersectsSphere(SPH); };
  // each frame: g the figure's group, B its pose, spec what it wears (null: nothing shown), H what it keeps, me its body (hidden: so are its clothes), E its body's shape by piece name
  GARB.draw=(g,B,spec,H,me,E)=>{ if(!g||!B||!B.J)return; const t0=performance.now(); let W=H.garb;
    if(!spec||me&&!me.visible){ if(W)W.root.visible=false; return; }
    if(!W||W.k!==spec.k)W=dress(spec,H);
    if(W.root.parent!==g)g.add(W.root); W.root.visible=true;
    const mine=g===W3.group, dt=W.t?Math.min(.1,(t0-W.t)/1000):1/60; W.t=t0; if(mine)GARB.mine=H;
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
    for(const w of W.ws){ aim(w,scratch); const d=w.d, X=d.X, Xp=d.Xp, T=d.X0, pin=d.pin;
      if(jump||!sim||!w.free)DRAPE.settle(d,T);
      else{ const e=Md.elements;
        for(let i=0;i<d.n;i++){ const a=i*3; if(pin[i]){ X[a]=T[a]; X[a+1]=T[a+1]; X[a+2]=T[a+2]; continue; }
          let x=X[a], y=X[a+1], z=X[a+2]; X[a]=e[0]*x+e[4]*y+e[8]*z+e[12]; X[a+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; X[a+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
          x=Xp[a]; y=Xp[a+1]; z=Xp[a+2]; Xp[a]=e[0]*x+e[4]*y+e[8]*z+e[12]; Xp[a+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; Xp[a+2]=e[2]*x+e[6]*y+e[10]*z+e[14]; }
        keepOut(w,scratch); DRAPE.step(d,h,w.o); }
      draw(w); }
    W.ms=performance.now()-t0; };
  // what a figure wears, from its outfit (bits: shirt 1, trousers 2, shoes 4, hat 8, jacket 16), its bathrobe, bare feet and dyes ({shirt, pants} colours from what it wears)
  const SPEC=new Map();
  GARB.spec=(bits,robe,bare,dye,form)=>{ bits=bits??31; const ds=dye&&dye.shirt, dp=dye&&dye.pants, f=form==='F'?'F':'M', q=bits+'|'+(robe?1:0)+(bare?1:0)+'|'+(ds||'')+'|'+(dp||'')+'|'+f; let s=SPEC.get(q); if(s)return s;
    const on=b=>!!(bits&b), jk=on(16)&&!robe;
    s={k:q,form:f,shirt:on(1)&&!robe,pants:on(2)&&!robe,shoes:on(4)&&!bare,hat:on(8),jacket:jk,col:{shirt:!jk&&ds||COL.shirt,jacket:jk&&ds||COL.jacket,pants:dp||COL.pants,shoes:COL.shoes,hat:COL.hat}};
    SPEC.set(q,s); return s; };
  // the body's own clothing layers under real clothes: only a bathrobe keeps its shirt and trousers (it is drawn on them); his feet are bare inside the shoes
  GARB.worn=robe=>({shirt:!!robe,pants:!!robe,shoes:false,hair:true,beard:true});
  // your body's shape by piece name (her chest and head are their own pieces)
  const myE={}, IDX={};
  GARB.myE=()=>{ const f=W3.style&&W3.style.form==='F'; for(const n of NAMES){ const p=f&&n==='torso'?'torsoF':f&&n==='head'?'headF':n; const i=IDX[p]??(IDX[p]=W3.idx(p)); myE[n]=i>=0&&W3.E?W3.E[i]:null; } return myE; };
  GARB.of=(form,i2E)=>{ const o={}; for(const n of NAMES){ const p=form==='F'&&n==='torso'?'torsoF':form==='F'&&n==='head'?'headF':n, i=W3.idx(p); o[n]=i>=0?i2E(i):null; } return o; };
  window.GARBDBG=()=>{ const H=GARB.mine, W=H&&H.garb; return W?{k:W.k,parts:W.ws.map(w=>({k:w.k,points:w.t.n,free:w.d.pin.reduce((a,p)=>a+(p?0:1),0),still:w.d.still})),held:W.rg.length,ms:+W.ms.toFixed(3),shown:W.root.visible}:null; }; window.GARBDBG.spec=GARB.spec; }
export {GARB};

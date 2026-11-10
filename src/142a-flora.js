// THE FLORA: FLORA plants the bushes and flower beds on the street (none in the park).
import {SHARED, THREE} from './003-shx.js';
import {DRESS, FLORA, PARK, WEEDS} from './003b-systems.js';
import {CASTLE, FIX, MAPG, SOL, STORE, TILE} from './006-map-pre.js';
import {GCAVE} from './060-cave.js';
import {FOUNT} from './060a-fount.js';
import {STALL} from './081-stalls.js';
 window.FLORA=FLORA;
{ const T=TILE, WU=T/.84, V3=THREE.Vector3, VB=1.25, VF=1.4;
  const hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), col=new THREE.Color();
  const cone=n=>{ const v=[]; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2, b=(i+1)/n*Math.PI*2, A=[Math.cos(a),0,Math.sin(a)], B=[Math.cos(b),0,Math.sin(b)]; v.push(...A,0,1,0,...B,...B,0,0,0,...A); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); return g; };
  const ICO=new THREE.IcosahedronGeometry(1,0), OCT=new THREE.OctahedronGeometry(1,0), TET=new THREE.TetrahedronGeometry(1,0), C3=cone(3), C4=cone(4), C6=cone(6), C7=cone(7);
  const CY3=new THREE.CylinderGeometry(1,1,1,3,1,true), BELL=new THREE.CylinderGeometry(.6,1,1,4,1,true);
  const mkG=parts=>{ const Pp=[], C=[]; for(const [g0,c,s,p,r] of parts){ const g=(g0.index?g0.toNonIndexed():g0.clone()).applyMatrix4(m4.compose(new V3(...p),q.setFromEuler(e.set(...(r||[0,0,0]),'YXZ')),new V3(...s))), A=g.attributes.position.array; col.setHex(c);
      for(let i=0;i<A.length;i++)Pp.push(A[i]); for(let i=0;i<A.length;i+=3)C.push(col.r,col.g,col.b); g.dispose(); }
    const G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); G.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); G.computeVertexNormals(); return G; };
  const ring=(n,R,y,f)=>[...Array(n)].map((_,i)=>{ const a=i/n*Math.PI*2+.4; return f(Math.cos(a)*R,y+(i%2)*.06,Math.sin(a)*R,i,a); });
  const st=(h,x=0,z=0,r)=>[CY3,0x4a8a3a,[.009,h,.009],[x,h/2,z],r];
  const BUSH=[
    ['BOXWOOD',.45,1,()=>[[ICO,0x3a6e30,[.48,.4,.48],[0,.4,0]],[ICO,0x34642c,[.36,.3,.36],[.12,.6,-.06],[.5,.7,0]]]],
    ['HYDRANGEA',.6,1,()=>[[ICO,0x467f38,[.6,.45,.6],[0,.45,0]],...ring(5,.38,.62,(x,y,z,i)=>[OCT,i%2?0x7a9ae8:0x98b4f2,[.17,.15,.17],[x,y,z]]),[OCT,0x8aa6ee,[.18,.15,.18],[0,.88,0]]]],
    ['RHODODENDRON',.7,1,()=>[[ICO,0x2e5a2c,[.6,.6,.55],[-.15,.65,0]],[ICO,0x356634,[.55,.55,.6],[.2,.75,.12],[.4,.3,0]],...ring(5,.42,.95,(x,y,z,i)=>[OCT,i%2?0xc04a8a:0xd86aa8,[.14,.12,.14],[x,y,z]])]],
    ['HOLLY',.45,1,()=>[[C6,0x24502a,[.5,1.35,.5],[0,0,0]],[C6,0x2c5c30,[.38,.9,.38],[.18,0,.1],[0,.5,0]],...ring(5,.3,.45,(x,y,z,i)=>[TET,0xd02020,[.05,.05,.05],[x,y+i*.08,z]])]],
    ['JUNIPER',.5,1,()=>[[C7,0x3a6a52,[.42,1.9,.42],[0,0,0]],[C6,0x467a5c,[.55,1.1,.55],[0,0,0],[0,.4,0]]]],
    ['BERRY BUSH',.5,1,()=>[[ICO,0x4a7a3a,[.55,.42,.55],[0,.42,0]],...ring(8,.42,.4,(x,y,z,i)=>[TET,i%2?0x2a3a8a:0x3a4aa0,[.05,.05,.05],[x,y+(i%3)*.08,z]])]],
    ['LILAC',.6,1,()=>[[ICO,0x4a7a3c,[.6,.55,.6],[0,.6,0]],...ring(5,.35,.95,(x,y,z,i,a)=>[C4,i%2?0xa080d0:0xb898e0,[.11,.34,.11],[x,y,z],[Math.sin(a)*.3,0,-Math.cos(a)*.3]])]],
    ['FORSYTHIA',.5,1,()=>[[ICO,0x8aa040,[.35,.3,.35],[0,.3,0]],...ring(7,.08,.05,(x,y,z,i,a)=>[C3,i%2?0xf0d030:0xe0b820,[.07,1.1+(i%3)*.12,.07],[x,y,z],[0,Math.PI-a,.5+(i%2)*.2]])]],
    ['FERN',0,0,()=>ring(7,.36,.16,(x,y,z,i,a)=>[OCT,i%2?0x4f8a3a:0x5c9a44,[.09,.025,.42],[x,y,z],[-.35-(i%2)*.15,Math.atan2(x,z),0]])],
    ['ROSE BUSH',.5,1,()=>[[ICO,0x3a6a30,[.5,.48,.5],[0,.48,0]],...ring(6,.4,.62,(x,y,z,i)=>[OCT,[0xc8202a,0xe03040,0xf06080][i%3],[.08,.07,.08],[x,y,z]])]]];
  const FLOW=[
    ['TULIP',.47,()=>[st(.4),[OCT,0x3e7a32,[.025,.13,.008],[.02,.1,0],[0,0,-.25]],[OCT,0xe0302a,[.033,.055,.033],[0,.44,0]]]],
    ['DAISY',.34,()=>[st(.32),[OCT,0xf4f2ea,[.055,.008,.055],[0,.33,0]],[OCT,0xf2c81e,[.018,.014,.018],[0,.338,0]]]],
    ['SUNFLOWER',1.42,()=>[[CY3,0x4a8a3a,[.014,1.35,.014],[0,.675,0]],[OCT,0x3e7a32,[.1,.008,.05],[.06,.6,0]],[OCT,0x3e7a32,[.1,.008,.05],[-.06,.85,0],[0,1.2,0]],[OCT,0xf2c81e,[.15,.025,.15],[0,1.36,.04],[1.1,0,0]],[OCT,0x5a3a1a,[.075,.03,.075],[0,1.37,.06],[1.1,0,0]]]],
    ['LAVENDER',.47,()=>[[.03,0,.42],[-.02,.03,.38],[-.01,-.03,.45]].flatMap(([x,z,h])=>[st(h,x,z,[z*2,0,-x*2]),[OCT,0x8a6ad0,[.016,.065,.016],[x*1.4,h-.02,z*1.4],[z*2,0,-x*2]]])],
    ['POPPY',.45,()=>[st(.42,0,0,[.08,0,.05]),[OCT,0xe02a1a,[.05,.025,.05],[.02,.43,.03]],[OCT,0x1a1414,[.014,.016,.014],[.02,.445,.03]]]],
    ['IRIS',.56,()=>[st(.5),[OCT,0x3e7a32,[.012,.22,.004],[.03,.2,0],[0,0,-.15]],[OCT,0x3e7a32,[.012,.2,.004],[-.025,.18,.01],[0,.6,.15]],[OCT,0x5a4ad0,[.055,.018,.03],[0,.5,0],[0,.5,0]],[OCT,0x7a6ae8,[.022,.045,.022],[0,.54,0]]]],
    ['MARIGOLD',.26,()=>[[OCT,0x3e7a32,[.07,.05,.07],[0,.05,0]],st(.2),[OCT,0xf08a1a,[.045,.03,.045],[0,.22,0]],[OCT,0xf0a020,[.03,.04,.03],[0,.23,0],[0,.78,0]]]],
    ['BLUEBELL',.31,()=>[st(.3,.02,0,[0,0,-.25]),...[[.05,.27],[.075,.22],[.09,.16]].map(([x,y])=>[BELL,0x6a7ae0,[.018,.04,.018],[x,y,0]])]],
    ['FOXGLOVE',.98,()=>[[OCT,0x3e7a32,[.11,.02,.11],[0,.02,0]],st(.95),...[.6,.72,.84].map((y,i)=>[BELL,i%2?0xd060a0:0xe080b8,[.022,.05,.022],[(i%2?.02:-.02),y,0]]),[OCT,0x4a8a3a,[.012,.04,.012],[0,.97,0]]]],
    ['COSMOS',.64,()=>[st(.62,0,0,[0,0,.06]),[OCT,0xe070b0,[.055,.006,.055],[-.02,.63,0]],[OCT,0xf2c81e,[.014,.01,.014],[-.02,.636,0]]]]];
  const BG=BUSH.map(b=>mkG(b[3]())), FG=FLOW.map(f=>mkG(f[2]())), tri=g=>g.attributes.position.count/3;
  FLORA.K={bush:BUSH.map(b=>b[0]),flower:FLOW.map(f=>f[0]),bushTris:BG.map(tri),flowerTris:FG.map(tri)};
  let BU=[], FL=[], BEDS=[], cur=null; FLORA.meshes=[]; FLORA.flowers=0;
  const bedOpen=()=>{ cur=[]; }, bedClose=()=>{ if(cur&&cur.length>=3)BEDS.push(cur); cur=null; };
  const grow=park=>{ BU=[]; FL=[]; BEDS=[]; const b0=FLORA.beds.length;
  if(park&&typeof PARK!=='undefined'&&PARK.ox!=null&&PARK.brook&&PARK.hill){ const P=PARK, X=x=>SHARED.BOD.XS(x+P.ox), Z=y=>SHARED.BOD.ZS(y+P.oy), [cx,cy,cr]=P.round, BK=P.brook, F=FOUNT;
    const pd=P.pd, RX=x=>x-96+cx, RY=y=>y+47+cy;
    const KEEP=[[cx+12.5-6.5,cy+11.5-6.5,cx+12.5+6.5,cy+11.5+6.5],[CASTLE.lot[0]-P.ox-1,CASTLE.lot[2]-P.oy-1,CASTLE.lot[1]-P.ox+1,CASTLE.lot[3]-P.oy+1],...(P.campAt?[(c=>[c.x-4,c.y-4,c.x+4,c.y+4])(P.campAt())]:[]),...(typeof GCAVE!=='undefined'?GCAVE.keep(P):[])];
    const GT=[[(P.gate[0]+P.gate[1])/2,P.y0],...(P.egate?[[P.x1,(P.egate[0]+P.egate[1])/2]]:[]),...(P.wgate?[[P.x0,(P.wgate[0]+P.wgate[1])/2]]:[]),...(P.ngate?[[(P.ngate[0]+P.ngate[1])/2,P.y1]]:[])];
    const xa=Math.min(X(P.x0),X(P.x1))-T, xb=Math.max(X(P.x0),X(P.x1))+T, za=Math.min(Z(P.y0),Z(P.y1))-T, zb=Math.max(Z(P.y0),Z(P.y1))+T;
    const SB=SOL.up.filter(b=>b[2]>xa&&b[0]<xb&&b[3]>za&&b[1]<zb), RB=(STORE.rooms||[]).filter(R=>R.walls&&R.x0!=null&&!(R.y0>=1)), SZ=STALL.zones||[];
    const ok=(x,y,r,bush)=>{ '@later'; if(x<P.x0+2.2+r||x>P.x1-2.2-r||y<P.y0+2.8+r||y>P.y1-2.4-r||pd(x,y)<r+(bush?1.4:.45)||BK.wet(x,y,r+.7)||F.lake(x,y)<r+1.2||F.ter(x,y)<r+.5)return false;
      if(KEEP.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r)||GT.some(([gx,gy])=>Math.hypot(x-gx,y-gy)<(bush?6:3.5)))return false;
      const wx=X(x), wz=Z(y), m=(r+(bush?.5:.15))*T; if(SB.some(b=>wx>b[0]-m&&wx<b[2]+m&&wz>b[1]-m&&wz<b[3]+m)||RB.some(b=>wx>b.x0-m&&wx<b.x1+m&&wz>b.z0-m&&wz<b.z1+m)||SZ.some(b=>wx>b[0]-m&&wx<b[2]+m&&wz>b[1]-m&&wz<b[3]+m))return false;
      return !BU.some(b=>Math.hypot(b.px-x,b.py-y)<r+b.r+(bush?.3:0)); };
    const br=(k,s)=>Math.max(.25,BUSH[k][1]*VB*s/.84);
    const bu=(k,x,y,s)=>{ s=s||.85+.3*hsh(x,y,31); const r=br(k,s); if(!ok(x,y,r,true))return false; BU.push({k,px:x,py:y,s,r,a:hsh(y,x,33)*6.28}); return true; };
    const fl=(k,x,y)=>{ x+=(hsh(x,y,41)-.5)*.12; y+=(hsh(y,x,43)-.5)*.12; if(!ok(x,y,.16,false))return; FL.push({k,px:x,py:y,s:.85+.3*hsh(x,y,45),a:hsh(y,x,47)*6.28}); if(cur)cur.push(FL.length-1); };
    const strip=(x,y,ux,uy,len,rows,K)=>{ const l=Math.hypot(ux,uy); ux/=l; uy/=l; bedOpen(); for(let t=-len/2;t<=len/2+.01;t+=.48)for(let j=0;j<rows;j++){ const o=(j-(rows-1)/2)*.46; fl(K[(j+Math.floor((t+len/2)/.96))%K.length],x+ux*t-uy*o,y+uy*t+ux*o); } bedClose(); };
    const clump=(x,y,R,n,K,sd)=>{ bedOpen(); for(let i=0;i<n;i++){ const a=hsh(i,sd,51)*6.28, d=R*Math.sqrt(hsh(sd,i,53)); fl(K[Math.floor(hsh(i,sd,55)*K.length)],x+Math.cos(a)*d,y+Math.sin(a)*d); } bedClose(); };
    const FORMAL=[[0,6],[3,1],[5,6],[0,1],[6,3],[9,1],[0,5,0]], HEDGE=[0,3,9,6];
    for(let y=P.y0+6;y<P.y1-5;y+=10.5){ if(Math.abs(y-cy)<cr+4)continue; const i=Math.round(y), s=hsh(i,1,11)<.5?-1:1; if(hsh(i,2,13)<.2)continue; const w=P.wobX(y), tx=P.wobX(y+.5)-P.wobX(y-.5);
      strip(cx+w+s*5.1,y,tx,1,2.9,2,FORMAL[((i%7)+7)%7]); if(hsh(i,3,15)<.55){ const k=HEDGE[Math.floor(hsh(i,4,17)*4)]; for(const d of [-1.7,0,1.7])bu(k,cx+P.wobX(y+d)+s*7.1,y+d); } }
    for(let x=P.x0+6;x<P.x1-5;x+=10.5){ if(Math.abs(x-cx)<cr+4)continue; const i=Math.round(x), s=hsh(i,5,11)<.5?-1:1; if(hsh(i,6,13)<.2)continue; const w=P.wobY(x), ty=P.wobY(x+.5)-P.wobY(x-.5);
      strip(x,cy+w+s*5.1,1,ty,2.9,2,FORMAL[(((i+3)%7)+7)%7]); if(hsh(i,7,15)<.55){ const k=HEDGE[Math.floor(hsh(i,8,17)*4)]; for(const d of [-1.7,0,1.7])bu(k,x+d,cy+P.wobY(x+d)+s*7.1); } }
    { const PQ=[[[0,6],[6,0]],[[9,1],[1,9]],[[0,3],[3,0]],[[6,9],[9,6]]];
      for(let q4=0;q4<4;q4++){ bedOpen(); for(const [j,R] of [[0,cr+1.25],[1,cr+1.8]])for(let a=q4*Math.PI/2;a<(q4+1)*Math.PI/2;a+=.5/R)fl(PQ[q4][j][Math.floor(a*R/.96)%2],cx+Math.cos(a)*R,cy+Math.sin(a)*R); bedClose();
        const a=(q4+.5)*Math.PI/2, R=cr+3.4; bu(9,cx+Math.cos(a)*R,cy+Math.sin(a)*R,1); for(const o of [-.24,.24])bu(0,cx+Math.cos(a+o)*R,cy+Math.sin(a+o)*R,.9); } }
    if(F.S){ const {C,R}=F.S, FK=[[0,3],[5,6],[3,9],[0,1],[6,5]], BKF=[0,9,1];
      for(let i=0;i<28;i++){ const a=i/28*Math.PI*2; bedOpen(); for(let t=-2;t<=2;t++){ const b=a+t*.5/(R+1.2); fl(FK[i%5][(t+2)%2],C.x+Math.cos(b)*(R+1.1),C.y+Math.sin(b)*(R+1.1)); fl(FK[i%5][(t+3)%2],C.x+Math.cos(b+.01)*(R+1.6),C.y+Math.sin(b+.01)*(R+1.6)); } bedClose();
        if(i%2===0)bu(BKF[(i/2|0)%3],C.x+Math.cos(a+.08)*(R+3.4),C.y+Math.sin(a+.08)*(R+3.4)); } }
    const OK=(P.oaks||[]).map(([wx,wz,m])=>[wx/T+SHARED.BOD.OX-P.ox,wz/T+SHARED.BOD.OY-P.oy,m]).filter(([x,y])=>x>P.x0&&x<P.x1&&y>P.y0&&y<P.y1), TK=[2,1,3,8,8,2];
    OK.forEach(([x,y,m],i)=>{ '@later'; const cR=m*.42; for(let j=0;j<3;j++){ if(hsh(i,j,61)<.3)continue; const a=hsh(j,i,63)*6.28, d=2.2+hsh(i+j,7,65)*Math.min(2.6,cR*.5); bu(TK[Math.floor(hsh(i,j,67)*TK.length)],x+Math.cos(a)*d,y+Math.sin(a)*d); }
      const a=hsh(i,9,69)*6.28, d=1.5+hsh(9,i,71); clump(x+Math.cos(a)*d,y+Math.sin(a)*d,.9,4+Math.floor(hsh(i,11,73)*3),hsh(i,13,75)<.5?[7,7,8]:[7,8,8],i); });
    { const WK=[4,7,6,5,4,6], L=[[P.x0+5,P.y0+4.6,1,0,P.x1-P.x0-10],[P.x0+5,P.y1-4.2,1,0,P.x1-P.x0-10],[P.x0+4.3,P.y0+6,0,1,P.y1-P.y0-11],[P.x1-4.3,P.y0+6,0,1,P.y1-P.y0-11]];
      L.forEach(([x0,y0,ux,uy,len],w)=>{ '@later'; for(let t=0;t<len;t+=8){ const x=x0+ux*t, y=y0+uy*t, r=hsh(x,y,81); if(r<.45){ const k=WK[Math.floor(hsh(y,x,83)*WK.length)]; bu(k,x,y); if(r<.2)bu(k,x+ux*1.9,y+uy*1.9); }
        else if(r<.62){ bedOpen(); for(let j=0;j<3;j++)fl(2,x+ux*j*.55+uy*(j%2)*.4,y+uy*j*.55+ux*(j%2)*.4); bedClose(); } } }); }
    for(let i=0,n=0;i<120&&n<18;i++){ const x=P.x0+6+hsh(i,91,1)*(P.x1-P.x0-12), y=P.y0+8+hsh(i,93,3)*(P.y1-P.y0-14); if(!ok(x,y,1.6,false)||pd(x,y)<3||BU.some(b=>Math.hypot(b.px-x,b.py-y)<2.5))continue;
      const sh=OK.some(([ox,oy,m])=>Math.hypot(ox-x,oy-y)<m*.42), MK=sh?[7,7,1,8]:[[1,4],[4,9],[1,9],[9,3],[1,4,9],[4,4,1]][i%6]; n++; clump(x,y,1.5,6+Math.floor(hsh(i,95,5)*5),MK,i+300); }
    for(let i=0,n=0;i<80&&n<12;i++){ const x=P.x0+6+hsh(i,97,7)*(P.x1-P.x0-12), y=P.y0+8+hsh(i,99,9)*(P.y1-P.y0-14), k=[5,7,4,0,6][i%5]; if(pd(x,y)<4)continue; if(bu(k,x,y)){ n++; bu(k,x+1.6,y+.4); } }
    for(const px of [90,102]){ const x=RX(px), y=RY(-41.5); bedOpen(); for(let j=0;j<10;j++){ const a=j/10*Math.PI*2; fl(j%2?3:5,x+Math.cos(a)*1.55,y+Math.sin(a)*1.55); } bedClose(); }
    for(const b of BU){ b.x=X(b.px); b.z=Z(b.py); b.y=P.hill(b.px,b.py); }
    for(const f of FL){ f.x=X(f.px); f.z=Z(f.py); f.y=P.hill(f.px,f.py); } }
  if(!park&&typeof DRESS!=='undefined'&&DRESS.pits){ const pm=DRESS.pits, M=new THREE.Matrix4(), PK=[[6,0,1],[1,6,6],[0,9,0]]; for(let i=0;i<pm.count;i++){ pm.getMatrixAt(i,M); const E=M.elements, x=E[12], y=E[13], z=E[14], w=Math.hypot(E[0],E[2]); bedOpen();
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([u,v],j)=>{ if(j===i%4)return; for(let n=0;n<2;n++){ FL.push({k:PK[i%3][(j+n)%3],x:x+u*w*.33+n*.08*w*v,z:z+v*w*.33-n*.08*w*u,y,s:.8+.2*hsh(i,j+n,49),a:hsh(j,i+n,47)*6.28,street:1}); cur.push(FL.length-1); } }); bedClose(); } }
  const top=f=>f.y+FLOW[f.k][1]*VF*f.s*WU;
  for(const b of BU){ const D=BUSH[b.k], hb=b.s*VB*WU, h=hb*[.8,1.05,1.3,1.35,1.9,.85,1.25,1.2,.55,.95][b.k], r=Math.max(.2,D[1])*hb;
    const o={k:b.k,name:D[0],x:b.x,y:b.y,z:b.z,h,r,solid:!!D[2],bloom:[1,2,6,7,9].includes(b.k)}; FLORA.bushes.push(o);
    if(o.solid){ const s=r*.8; SOL.up.push([b.x-s,b.z-s,b.x+s,b.z+s]); FIX.up.push([b.x-s,b.z-s,b.y,b.x+s,b.z+s,b.y+h]); } }
  for(const L of BEDS){ let x=0, z=0; for(const i of L){ x+=FL[i].x; z+=FL[i].z; } x/=L.length; z/=L.length; const p=L.filter((_,j)=>j%Math.max(1,Math.floor(L.length/8))===0).slice(0,8).map(i=>[FL[i].x,top(FL[i])+.02*T,FL[i].z]);
    FLORA.beds.push({id:FLORA.beds.length,x,z,y:FL[L[0]].y,n:L.length,street:!!FL[L[0]].street,p,k:[...new Set(L.map(i=>FL[i].k))]}); }
  for(const d of FLORA.beds.slice(b0))d.p=d.p.concat(FLORA.bushes.filter(b=>b.bloom&&Math.hypot(b.x-d.x,b.z-d.z)<5*T).slice(0,3).map(b=>[b.x,b.y+b.h*.97,b.z]));
  const grp=park?MAPG.park:MAPG.bodega, MV0={value:[...Array(8)].map(()=>new THREE.Vector4())}, sway=sh=>{ sh.uniforms.uMv=MV0; sh.uniforms.uSw=PARK.sway; sh.uniforms.uWk=PARK.windK; sh.uniforms.uSwAt=PARK.swayAt;
    sh.vertexShader='uniform vec4 uMv[8]; uniform vec4 uSwAt; uniform float uSw,uWk;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n { float ph=instanceMatrix[3].x*.37+instanceMatrix[3].z*.23, g=(.7+.3*sin(uSw*.23+ph))*uWk*max(position.y,0.)*.06*(1.-smoothstep(uSwAt.w*.85,uSwAt.w,distance((modelMatrix*vec4(instanceMatrix[3].xyz,1.)).xz,uSwAt.xz))); transformed.x+=sin(uSw*2.3+ph)*g; transformed.z+=sin(uSw*1.9+ph*1.7)*g*.7; }\n '+WEEDS.PART(T,'min(max(position.y,0.)*2.,1.)')); };
  const MB=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}), MF=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide});
  MF.onBeforeCompile=sway; MF.customProgramCacheKey=()=>'florasway';
  const inst=(G,mat,L,sc,cast,nm)=>{ if(!L.length)return null; const me=new THREE.InstancedMesh(G,mat,L.length);
    L.forEach((o,i)=>{ const v=.88+.2*hsh(o.x,o.z,57), s=o.s*sc; me.setMatrixAt(i,m4.compose(new V3(o.x,o.y,o.z),q.setFromAxisAngle(new V3(0,1,0),o.a),new V3(s,s,s))); me.setColorAt(i,col.setRGB(v,v*(.97+.06*hsh(o.z,o.x,59)),v)); });
    me.computeBoundingSphere(); me.castShadow=cast; me.receiveShadow=true; me.name=nm; me.raycast=()=>{}; grp.add(me); FLORA.tris+=tri(G)*L.length; FLORA.n[nm]=L.length; return me; };
  FLORA.meshes.push(...[...BG.map((G,k)=>inst(G,MB,BU.filter(b=>b.k===k),VB*WU,true,BUSH[k][0])),...FG.map((G,k)=>inst(G,MF,FL.filter(f=>f.k===k),VF*WU,false,FLOW[k][0]))].filter(Boolean)); FLORA.flowers+=FL.length; };
  grow(false);
  FLORA.near=(x,z,R,what)=>(what==='bed'?FLORA.beds:FLORA.bushes).filter(o=>Math.hypot(o.x-x,o.z-z)<R);
  FLORA.cover=(bx,bz,px,pz,R=8*T)=>{ let best=null, bd=1e9; for(const b of FLORA.bushes){ const d=Math.hypot(b.x-bx,b.z-bz); if(d>R)continue; const dp=Math.hypot(b.x-px,b.z-pz); if(dp<2.2*T||dp<Math.hypot(bx-px,bz-pz)*.7)continue; const s=d-dp*.3; if(s<bd){ bd=s; best=b; } } return best; };
  window.FLORADBG=()=>({bushes:FLORA.bushes.length,flowers:FLORA.flowers,beds:FLORA.beds.length,tris:FLORA.tris,n:FLORA.n,K:FLORA.K}); }

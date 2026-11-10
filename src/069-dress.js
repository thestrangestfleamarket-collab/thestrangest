// THE STREET DRESSING: DRESS sets the kerbs, trees, hydrants, cans, planters and poles along the main street.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, DRESS, PARK} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, CEL, FIX, LEVEL, MAINROW, MAPSTAIR, MODS, OUT, RING, SMOOTH, SOL, STORE, TILE} from './006-map-pre.js';
import {KIT} from './068-kit.js';
const TLX={tick:()=>{}}; window.DRESS=Object.assign(DRESS,{gaps:()=>{ const G=[]; let e=MAINROW.length?MAINROW[0][1]:0; for(let i=1;i<MAINROW.length;i++){ const b=MAINROW[i][0]; if(b-e>1.5)G.push([e,b]); e=Math.max(e,MAINROW[i][1]); } return G; }});
{ const G=MODS.bodega.ground, xm=(SHARED.BOUND.x0+SHARED.BOUND.x1)/2; let zc=null, zf=null; for(let z=SHARED.BOUND.z0;z<SHARED.BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
  const sw=zc-.5, far=zf+.6, AX=SHARED.BOD.X(MODS.apts.A.x1), AX0=SHARED.BOD.X(MODS.apts.A.x0), BX0=SHARED.BOD.X(SHARED.BOD.B0.x0);
  DRESS.kerb={sw,far}; DRESS.cans=[];
  const CY=[], cyl=(x,y,z,r,h,c)=>CY.push([x,y,z,r*2,h,r*2,c]);
  const BL=[], blk=(x,y,z,sx,sy,sz,c)=>BL.push([x,y,z,sx,sy,sz,c]), solid=(x,z,r,h)=>{ const s=[x-r,z-r,x+r,z+r], f=[x-r,z-r,G(x,z),x+r,z+r,G(x,z)+h]; SOL.up.push(s); FIX.up.push(f); return {sol:s,fix:f}; };
  { const M=1/.84*TILE, CN=[]; for(const x of []){   // no trash cans (owner, 5 Nov 2026)
    const z=sw-.25*M, y=G(x,z); DRESS.cans.push({x,z}); CN.push([x,y,z]); solid(x,z,.28*M,.9*M); }
    const g0=KIT.geo('trashcan'), bb=g0.boundingBox, k=.9*M/(bb.max.y-bb.min.y), g=g0.clone().translate(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2).scale(k,k,k), m4=new THREE.Matrix4(), q=new THREE.Quaternion();
    if(CN.length){ const me=new THREE.InstancedMesh(g,KIT.mat,CN.length); CN.forEach(([x,y,z],i)=>me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(new THREE.Vector3(0,1,0),i*2.1),new THREE.Vector3(1,1,1)))); me.castShadow=me.receiveShadow=true; scene.add(me); } }
  { const M=1/.84*TILE, SP=46*M, SX0=SHARED.BOD.XS(SHARED.BOD.MAP.x0), SX1=SHARED.BOD.XS(SHARED.BOD.MAP.x1), n=Math.floor((SX1-SX0-8)/SP)+1, x0=(SX0+SX1)/2-(n-1)*SP/2, warm=new THREE.Color(1,.88,.68);
    const sl=(x,z,d,ax='z',ring)=>{ const y=G(x,z);
      const P={x,z,d,ax,ring:ring||(d>0?'outer':'inner'),y:y+5.45*M,h:heads.length,...solid(x,z,.18*M,6*M)}; POLES.push(P); return P; };
    const heads=[], pools=[], POLES=[], POSTS=[], hsh=n=>{ const v=Math.sin(n*12.9898+78.233)*43758.5453; return v-Math.floor(v); },
      light=(x,y,z,i,r)=>{ const L=new THREE.PointLight(warm,i,r,1.6); L.position.set(x,y,z); L.userData.i0=i; scene.add(L); const P=[L,x,z,r*.2]; P.on=1.5-hsh(pools.length)*4; pools.push(P); return L; };
    const poolTex=(()=>{ const N=48, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'), im=g.createImageData(N,N), h=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); };
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const d0=Math.hypot((i+.5)/N*2-1,(j+.5)/N*2-1), d=d0+(SMOOTH||CEL?0:(h(i,j)-.5)*.1), a=SMOOTH?Math.max(0,1-d0)**1.6*.24:d<.38?.2:d<.68?.11:d<.96?.05:0, q=(j*N+i)*4; im.data[q]=255; im.data[q+1]=214; im.data[q+2]=150; im.data[q+3]=Math.round(a*255); }
      g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=SMOOTH?THREE.LinearFilter:THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; })();
    const poolMat=new THREE.MeshBasicMaterial({map:poolTex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2}), poolGeo=new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2);
    const RC=SHARED.BOD.road.CORN.find(c=>c.x===RING.wr1&&c.y===SHARED.BOD.FAR), CK=(SHARED.BOD.road.KR-.45)/Math.SQRT2, CP=RC?{x:SHARED.BOD.XS(RC.cx-RC.sx*CK),z:SHARED.BOD.ZS(RC.cy-RC.sy*CK)}:{x:1e9,z:1e9}, ok=(x,z)=>G(x,z)>-.01&&Math.hypot(x-CP.x,z-CP.z)>4*M;
    if(DRESS.tall)for(let i=0;i<n;i++){ const x=x0+i*SP;
      sl(x,sw-.25*M,1).L=light(x,5.8*M,sw+1.4*M,40,13*TILE); heads.push([x,5.8*M,sw+1.4*M]);
      const xf=x+SP/2; if(xf<SX1-3&&ok(xf,far+.25*M)&&!(xf>SHARED.BOD.XS(RING.wr0)-1&&xf<SHARED.BOD.XS(RING.wr1)+1)){ sl(xf,far+.25*M,-1).L=light(xf,5.8*M,far-1.4*M,40,13*TILE); heads.push([xf,5.8*M,far-1.4*M]); } }
    if(DRESS.tall){ const XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, R=RING, put=(x,z,d,ax,ring)=>{ if(!ok(x,z))return; const P=sl(x,z,d,ax,ring), hx=ax==='x'?x+d*1.3*M:x, hz=ax==='x'?z:z+d*1.3*M; P.L=light(hx,5.8*M,hz,40,13*TILE); heads.push([hx,5.8*M,hz]); };
      { const xo=XS(R.wr0)-.25*M, xi=XS(R.wr1)+.25*M, z0=ZS(SHARED.BOD.FAR)+2*M, z1=ZS(R.wy1)-1*M; for(let z=z0,k=0;z<z1;z+=26*M,k++){ if(k&1)put(xi,z,-1,'x','inner'); else put(xo,z,1,'x','outer'); } } }
    if(DRESS.tall){ const x=CP.x, z=CP.z, y=G(x,z), T8=8.2*M, AL=2.7*M, L2=[];
      for(const [dx,dz] of [[0,-1],[1,0]]){ const ex=x+dx*AL, ez=z+dz*AL, ay=y+T8-.15*M, h=heads.length, L=light(ex,ay-.25*M,ez,55,16*TILE); heads.push([ex,ay-.06*M,ez]); L2.push([L,h]); }
      POLES.push({x,z,d:-1,ax:'z',ring:'inner',y:y+T8-.6*M,h:L2[0][1],h2:L2[1][1],L:L2[0][0],L2:L2[1][0],corner:1,...solid(x,z,.3*M,T8)}); DRESS.corner={x,z,y,lamps:L2.map(q=>q[0])}; }
    const pz=far+.95*M, pts=[];
    if(Array.isArray(LEVEL.lamps)){ pts.length=0; for(const l of LEVEL.lamps)pts.push([SHARED.BOD.XS(l.x),SHARED.BOD.ZS(l.y)]); }   // the map editor's lamp posts (world.json lamps, map tiles), in place of the spaced ones
    DRESS.own=pts.length;
    pts.push(...(DRESS.extra||[]));   // the other sections' posts (066c)
    const xs=pts.map(p=>p[0]);
    const H=4.2*M, pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.055*M,.07*M,H,8).translate(0,H/2,0),new THREE.MeshLambertMaterial({color:0x22262b,flatShading:true}),xs.length*2),
      lant=new THREE.InstancedMesh(new THREE.BoxGeometry(.34*M,.5*M,.34*M),new THREE.MeshBasicMaterial({color:0xffe4b0}),xs.length), m4=new THREE.Matrix4(), y0=G(xs[0],pz);
    pts.forEach(([x,pz],i)=>{ const y=G(x,pz); pole.setMatrixAt(i*2,m4.makeTranslation(x,y,pz)); pole.setMatrixAt(i*2+1,m4.makeScale(2.4,.06,2.4).setPosition(x,y,pz));
      lant.setMatrixAt(i,m4.makeTranslation(x,y+H+.25*M,pz)); const sol=[x-.12*M,pz-.12*M,x+.12*M,pz+.12*M], fix=[x-.12*M,pz-.12*M,y,x+.12*M,pz+.12*M,y+H]; POSTS.push({x,z:pz,y:y+H+.5*M,i,L:light(x,y+H+.25*M,pz,50,12*TILE),sol,fix});
      SOL.up.push(sol); FIX.up.push(fix); });
    const hd=new THREE.InstancedMesh(new THREE.BoxGeometry(.5*M,.08*M,.26*M),lant.material,heads.length); heads.forEach(([x,y,z],i)=>hd.setMatrixAt(i,m4.makeTranslation(x,y-.08*M,z))); scene.add(hd);
    for(const P of pools){ const [L,x,z,r]=P, me=new THREE.Mesh(poolGeo,poolMat); me.scale.set(r,1,r); me.position.set(x,G(x,z)+.03,z); me.renderOrder=1; me.visible=false; scene.add(me); P.push(me); }
    DRESS.pools=pools;
    DRESS.lampAt=(x,y,z,set)=>{ const L=light(x,y,z,60,15*TILE), P=pools[pools.length-1], me=new THREE.Mesh(poolGeo,poolMat); me.scale.set(P[3],1,P[3]); me.position.set(x,G(x,z)+.03,z); me.renderOrder=1; me.visible=false; scene.add(me); P.push(me); P.set=set; return L; };   // a lamp on something else (the power poles, 069b), lit with the rest
    const LIT=new THREE.Color(0xffe4b0), DIM=new THREE.Color(0x4a4238);
    DRESS.tick=()=>{ TLX.tick(); const e=CLOCK.dayElev(), k=Math.max(0,Math.min(1,(3-e)/8)), up=OUT.world; poolMat.opacity=k;
      pools.forEach((P,j)=>{ const [L,,,,me]=P, on=e<P.on; if(on!==P.lit){ P.lit=on; L.intensity=on?L.userData.i0:0; const c=on?LIT:DIM; if(P.set)P.set(on); else if(j<heads.length){ hd.setColorAt(j,c); hd.instanceColor.needsUpdate=true; } else { lant.setColorAt(j-heads.length,c); lant.instanceColor.needsUpdate=true; } } if(on)L.intensity=L.userData.i0*(DN?DN.lk:1);
        me.visible=up&&k>0&&on&&!L.userData.off; }); };
    { const RD=SHARED.BOD.road, CK=(RD.KR-.45)/Math.SQRT2, HS=0x2b3036, GR=0x5d6266, TL=[], SIG=[], sq=(f,cx,cy,cz,w,h,d)=>f[0]?[cx,cy,cz,d,h,w]:[cx,cy,cz,w,h,d];
      const lampAt=(x,y,z,f,w,h,grp,k)=>{ SIG.push({p:sq(f,x+f[0]*.02*M,y,z+f[1]*.02*M,w,h,.05*M),grp,k}); };
      const head=(x,y,z,f,grp)=>{ blk(...sq(f,x,y,z,.36*M,1*M,.26*M),HS); blk(...sq(f,x-f[0]*.2*M,y,z-f[1]*.2*M,.5*M,1.16*M,.04*M),HS);
        ['r','y','g'].forEach((k,i)=>{ const ly=y+(1-i)*.3*M, fx=x+f[0]*.13*M, fz=z+f[1]*.13*M; lampAt(fx,ly,fz,f,.2*M,.2*M,grp,k); blk(...sq(f,fx+f[0]*.06*M,ly+.12*M,fz+f[1]*.06*M,.24*M,.03*M,.14*M),HS); }); };
      const HAND=['#.#.#','#.#.#','#####','#####','#####','.###.','.###.'], MAN=['..#..','.###.','#.#.#','..#..','.#.#.','.#..#','#...#'];
      const ped=(x,y,z,f,grp)=>{ blk(...sq(f,x,y,z,.62*M,.42*M,.24*M),HS); const r=[f[1],-f[0]], px=.04*M, fx=x+f[0]*.12*M, fz=z+f[1]*.12*M;
        for(const [G,k,o] of [[HAND,'h',-.15*M],[MAN,'w',.15*M]])G.forEach((row,j)=>{ for(let i=0;i<5;){ if(row[i]!=='#'){ i++; continue; } let n=0; while(row[i+n]==='#')n++;
          const u=o+(i+n/2-2.5)*px, ly=y+(3-j)*px; lampAt(fx+r[0]*u,ly,fz+r[1]*u,f,n*px,px,grp,k); i+=n; } }); };
      for(const c of [RD.CORN.find(c=>c.x===RING.wr0&&c.y===SHARED.BOD.FAR)]){ if(!c)continue;
        const x=SHARED.BOD.XS(c.cx-c.sx*CK), z=SHARED.BOD.ZS(c.cy-c.sy*CK), y=G(x,z), T=5.6*M, AL=3.4*M, sx=c.sx;
        cyl(x,y+.25*M,z,.2*M,.5*M,0x3f4448); cyl(x,y+T/2,z,.09*M,T,GR); cyl(x,y+T+.06*M,z,.11*M,.12*M,0x3f4448);
        blk(x,y+T-.3*M,z-AL/2,.12*M,.14*M,AL,GR); blk(x,y+T-.75*M,z-AL*.22,.06*M,.06*M,AL*.44,GR); blk(x,y+T-.5*M,z-.08*M,.08*M,.5*M,.08*M,GR);
        head(x+.2*M,y+T-.95*M,z-AL+.3*M,[1,0],'m'); head(x-.2*M,y+T-.95*M,z-AL+.3*M,[-1,0],'m');
        head(x,y+3.2*M,z+.22*M,[0,1],'s');
        ped(x,y+2.3*M,z-.2*M,[0,-1],'xm'); ped(x-sx*.2*M,y+2.3*M,z,[-sx,0],'xs');
        solid(x,z,.22*M,T); TL.push({x,z}); }
      // the park gate's crossing: a light over each way's lane before the crosswalk, its stop line, a walk light across and a button at each end, and up the same pole the flying traffic's light at their height (150pb-traffic runs it)
      { const gx0=SHARED.BOD.XS(PARK.gate[0]+PARK.ox), gx1=SHARED.BOD.XS(PARK.gate[1]+PARK.ox), zs=SHARED.BOD.ZS(SHARED.BOD.CURB), zp=SHARED.BOD.ZS(SHARED.BOD.FAR), zm=(zs+zp)/2, T=5.6*M; DRESS.sig=[];
        for(const [x,z,sd,zl] of [[gx1+1.1*M,zs-.6*M,1,(zs+zm)/2],[gx0-1.1*M,zp+.6*M,-1,(zp+zm)/2]]){ const y=G(x,z), AL=Math.abs(zl-z)+.4*M, f=[sd,0];
          const TF=10.4*M; cyl(x,y+.25*M,z,.2*M,.5*M,0x3f4448); cyl(x,y+TF/2,z,.09*M,TF,GR); cyl(x,y+TF+.06*M,z,.11*M,.12*M,0x3f4448);
          blk(x,y+T-.3*M,z+sd*AL/2,.12*M,.14*M,AL,GR); blk(x,y+T-.75*M,z+sd*AL*.22,.06*M,.06*M,AL*.44,GR);
          head(x,y+T-.95*M,zl,f,'gm'); blk(x+sd*.14*M,y+9.1*M,z,.2*M,.12*M,.12*M,GR); head(x+sd*.3*M,y+9.1*M,z,f,'gf'); head(x+sd*.22*M,y+3.2*M,z,f,'gm'); ped(x,y+2.3*M,z+sd*.2*M,[0,sd],'gx');
          const sx=x+sd*.5*M, sy=G(sx,zl); blk(sx,sy+.012,zl,.32*M,.024,Math.abs(zl-zm)*2-.5*M,0xe9e6dc);
          solid(x,z,.22*M,TF); TL.push({x,z}); DRESS.sig.push({x,z,y,sd,stop:sx,lane:zl,btn:[x,y+1.15*M,z-sd*.16*M]}); } }
      const ON={r:0xff3b2a,y:0xffb020,g:0x44f2a0,h:0xff7a1a,w:0xf2f2ea}, OFF={r:0x3a1410,y:0x3a2a10,g:0x0f3324,h:0x2e1a0c,w:0x202224};
      const sm=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xffffff}),Math.max(1,SIG.length)), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), cc=new THREE.Color();
      SIG.forEach((s,i)=>{ const [x,y,z,a,b,d]=s.p; sm.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(a,b,d))); sm.setColorAt(i,cc.setHex(OFF[s.k])); }); scene.add(sm);
      const CY=44, phase=t=>{ const m=t<18?'g':t<21?'y':'r', sd=t>=23&&t<39?'g':t>=39&&t<42?'y':'r', fl=Math.floor(t*2)&1, p=(a,b)=>t>=a&&t<a+(b-a)*2/3?'w':t>=a&&t<b&&fl?'h':t>=a&&t<b?'-':'h';
        return {m,s:sd,xs:p(0,18),xm:p(23,39)}; };
      let last=''; TLX.tick=()=>{ const t=(performance.now()/1000)%CY, P=phase(t), Q=TLX.gate&&TLX.gate(); P.gm=Q?Q.m:'g'; P.gf=Q?Q.f||Q.m:'g'; P.gx=Q?Q.x:'h'; const key=P.m+P.s+P.xs+P.xm+P.gm+P.gf+P.gx; if(key===last)return; last=key;
        SIG.forEach((s,i)=>{ sm.setColorAt(i,cc.setHex(P[s.grp]===s.k?ON[s.k]:OFF[s.k])); }); sm.instanceColor.needsUpdate=true; };
      TLX.phase=phase; TLX.at=TL; TLX.mesh=sm; window.TLX=TLX; }
    pole.castShadow=true; scene.add(pole,lant);
    if(!AWAY.has('garden')){ const z=-.35*TILE, x0=AX+.15, x1=BX0-.15, gx0=-5.6*TILE, gx1=-3.6*TILE, sx0=SHARED.BOD.XS(MAPSTAIR.x0)-.3, sx1=SHARED.BOD.XS(MAPSTAIR.x1)+.3, WD=0x4a3b2a, RL=0x6b573f, H=1.05*M;
      const post=(x,h)=>{ const y=G(x,z); blk(x,y+h/2,z,.09*M,h,.09*M,WD); };
      const runs=[[x0,sx0],[sx1,gx0],[gx1,x1]];
      for(const [a,b] of runs){ for(let x=a;x<b-.5;x+=2*TILE)post(x,H); post(b,H); } post(gx0,H*1.2); post(gx1,H*1.2);
      const rail=(a,b)=>{ const y=G((a+b)/2,z); for(const h of [.42*M,.9*M])blk((a+b)/2,y+h,z,b-a,.06*M,.05*M,RL); SOL.up.push([a,z-.06*M,b,z+.06*M]); FIX.up.push([a,z-.06*M,y,b,z+.06*M,y+H]); };
      for(const [a,b] of runs)rail(a,b); }
    { const M=1/.84*TILE, A=MODS.apts&&MODS.apts.A, zk=SHARED.BOD.ZS(SHARED.BOD.CURB), sd=Math.sign(zk)||1, hsh=(a,b)=>{ const v=Math.sin(a*12.9898+b*78.233)*43758.5453; return v-Math.floor(v); };
      const clear=(x,z)=>!(window.MAPSTAIR&&MAPSTAIR.has&&MAPSTAIR.has(x,z,'up'))&&(DRESS.pools||[]).every(P=>Math.hypot(P[1]-x,P[2]-z)>2.4*M)&&!SOL.up.some(b=>x>b[0]-.9*M&&x<b[2]+.9*M&&z>b[1]-.9*M&&z<b[3]+.9*M)&&[SHARED.BOD.X((SHARED.BOD.B0.x0+SHARED.BOD.B0.x1)/2),A?SHARED.BOD.X(MODS.apts.DX!=null?MODS.apts.DX:A.x1-1):1e9,SHARED.BOD.XS((MAPSTAIR.x0+MAPSTAIR.x1)/2),...(STORE.main?STORE.main.doors.map(d=>d[1]):[])].every(d=>Math.abs(d-x)>5*M);
      const OAK=[], PL=[], PITS=[], tp=(x,z)=>[x/TILE+SHARED.BOD.OX-PARK.ox,z/TILE+SHARED.BOD.OY-PARK.oy];
      const tree=(x0,i,big,fix)=>{ const z=zk-sd*1.05*M; let x=x0; if(!fix)for(let k=0;k<30&&!clear(x,z);k++)x+=(k&1?-1:1)*(k+1)*.6*M; if(!clear(x,z))return; const y=G(x,z), P=(big?1.6:1.35)*M, SET=0xa8a49c, IRN=0x1e2824, g=P/2-.05*M, gh=.42*M;
        [[0,-P/2,P+.16*M,.16*M],[0,P/2,P+.16*M,.16*M],[-P/2,0,.16*M,P],[P/2,0,.16*M,P]].forEach(([dx,dz,w,d],j)=>blk(x+dx,y+.035*M+.01*M*hsh(i,j),z+dz,w,.07*M,d,[SET,0x9c9890,0xb0aca2,0xa4a096][j]));
        PITS.push([x,y+.025*M,z,P,i]);
        const zb=z-sd*g; for(const [cx,cz,lx,lz] of [[x,zb,2*g,0],[x-g,z,0,2*g],[x+g,z,0,2*g]]){ const L=lx||lz, n=Math.round(L/(.14*M));
          for(const h of [.07*M,gh])blk(cx,y+h,cz,lx||.03*M,.03*M,lz||.03*M,IRN);
          for(let t=1;t<n;t++){ const u=-L/2+t*L/n, hh=gh*(hsh(i*7+t,L)<.12?.82:1); blk(cx+(lx?u:0),y+hh/2,cz+(lz?u:0),.025*M,hh,.025*M,hsh(t,i+L)<.2?0x4a3426:IRN); } }
        for(const [cx,cz] of [[x-g,zb],[x+g,zb],[x-g,z+sd*g],[x+g,z+sd*g]])blk(cx,y+(gh+.06*M)/2,cz,.05*M,gh+.06*M,.05*M,IRN);
        OAK.push(['OakTree2',...tp(x,z),big?9.5:7+hsh(i,5),hsh(i,9)*6.28]);
        for(let j=0;j<4;j++){ const a=j*1.7+i, r=(.22+.2*hsh(i,j+40))*P; PL.push([['grass1','grass2','grass1','grass2'][j],...tp(x+Math.cos(a)*r,z+Math.sin(a)*r),.25+.12*hsh(j,i),a]); } };
      if(A){ let ti=0; for(const [a,b] of DRESS.gaps()){ if(b-a<4)continue; const n=b-a>14?2:1; for(let j=0;j<n;j++)tree(SHARED.BOD.XS(a+(b-a)*(j+1)/(n+1)+(b-a>6&&n===1?1:0)),ti,(ti++)%3===0,1); }
        { const F=LEVEL.places.filter(p=>p.y1==null&&p.kind==='front').sort((a,b)=>a.x0-b.x0), W=LEVEL.places.find(p=>p.kind==='passage');   // the new map's row has no gaps (6 Nov 2026): a street tree at every join between two shops, none in the way through
          for(let i=1;i<F.length;i++){ const x=F[i].x0; if(Math.abs(x-F[i-1].x1)>.05||W&&x>W.x0-3&&x<W.x1+3)continue; tree(SHARED.BOD.XS(x),ti,(ti++)%3===0,1); } }
        const zf=SHARED.BOD.Z(A.y1), sdf=Math.sign(zk-zf)||1, BR=0x7a4c3e, BRD=0x5e3a30, IR=0x1c1e22, dx=SHARED.BOD.X(A.x1-1)-SHARED.BOD.X(A.x1-1-2.2), DX=SHARED.BOD.X(MODS.apts.DX);
        for(const [k,cx] of [[0,DX-dx*1.05],[1,DX-dx*1.9],[2,DX+dx*1.05],[3,DX+dx*1.9]]){ const L=1.7*M, D=.8*M, h=.62*M, cz=zf+sdf*(D/2+.05*M), y=G(cx,cz);
          blk(cx,y+h/2,cz,L-.02*M,h-.01*M,D-.02*M,0x2e221c); for(let r=0;r<3;r++)for(let c=0;c<5;c++){ const w=L/5, hh=h/3, n=hsh(k*31+r,c), col=new THREE.Color(BR).multiplyScalar(.82+.3*n).offsetHSL((hsh(c,r+k)-.5)*.03,0,0).getHex(); blk(cx-L/2+w*(c+.5)+(r&1?w*.15:0)*(c<4?1:0),y+hh*(r+.5),cz,w-.012*M,hh-.012*M,D,col); } blk(cx,y+h+.03*M,cz,L+.08*M,.06*M,D+.08*M,BRD); blk(cx,y+.04*M,cz,L+.04*M,.08*M,D+.04*M,BRD);
          for(const o of [-1,1])blk(cx,y+h+.42*M,cz+o*(D/2),L,.04*M,.04*M,IR); blk(cx-L/2,y+h+.42*M,cz,.04*M,.04*M,D,IR); blk(cx+L/2,y+h+.42*M,cz,.04*M,.04*M,D,IR);
          for(let t=0;t<=12;t++){ const u=-L/2+t*L/12; for(const o of [-1,1])blk(cx+u,y+h+.22*M,cz+o*(D/2),.025*M,.4*M,.025*M,IR); }
          blk(cx,y+h+.005*M,cz,L-.1*M,.02*M,D-.1*M,0x3a2c22);
          for(let j=0;j<7;j++){ const u=(hsh(k,j)-.5)*L*.8, v=(hsh(j,k+3)-.5)*D*.5; PL.push([['bush2','bush1','flower2','bush3','flower4','grass2','flower6'][j],...tp(cx+u,cz+v),[.55,.6,.45,.5,.5,.4,.45][j]*(.85+.3*hsh(k,j+9)),hsh(j,k)*6.28,h/M]); }
          SOL.up.push([cx-L/2,cz-D/2,cx+L/2,cz+D/2]); FIX.up.push([cx-L/2,cz-D/2,y,cx+L/2,cz+D/2,y+h]); } }
      { const HY=[], hyd=(tx,ty,side)=>{ let x=SHARED.BOD.XS(tx), z=SHARED.BOD.ZS(ty); for(let k=0;k<10&&!clear(x,z);k++)x+=(k&1?-1:1)*(k+1)*.5*M; if(!clear(x,z))return; HY.push([x,G(x,z),z,side]); solid(x,z,.16*M,.8*M); };
        hyd(92,SHARED.BOD.CURB-.55,1); hyd(64.5,SHARED.BOD.CURB-.55,1); hyd(118,SHARED.BOD.FAR+.55,-1); hyd(78,SHARED.BOD.FAR+.55,-1);
        if(HY.length){ const N=24, H=20, cv=document.createElement('canvas'); cv.width=N; cv.height=H; const gx=cv.getContext('2d'), im=gx.createImageData(N,H);
          for(let j=0;j<H;j++)for(let i=0;i<N;i++){ const r=hsh(i,j+50); let c=j<5?[34,36,38]:j>16?[150,154,152]:[178,182,180]; if(j>=5&&r<.08)c=[120,84,56]; else if(j>=5&&r>.93)c=[214,218,214]; if(j>14&&hsh(i>>1,7)<.4)c=[96,72,52]; if(j>=8&&j<11&&i>=3&&i<7)c=[226,190,40];
            const q=(j*N+i)*4; im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=255; } gx.putImageData(im,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace;
          const pr=[[0,0],[.15,0],[.15,.05],[.12,.06],[.1,.1],[.1,.48],[.13,.5],[.13,.54],[.11,.56],[.1,.64],[.07,.7],[.04,.72],[.04,.76],[0,.77]].map(([r,h])=>new THREE.Vector2(r*M,h*M));
          const parts=[[new THREE.LatheGeometry(pr,10),new THREE.MeshLambertMaterial({map:tx})],[new THREE.CylinderGeometry(.055*M,.06*M,.32*M,8).rotateZ(Math.PI/2).translate(0,.4*M,0),new THREE.MeshLambertMaterial({color:0xa8acaa})],[new THREE.CylinderGeometry(.075*M,.075*M,.1*M,6).rotateX(Math.PI/2).translate(0,.38*M,.13*M),new THREE.MeshLambertMaterial({color:0x2a2c2e})],[new THREE.BoxGeometry(.012*M,.12*M,.012*M).translate(.17*M,.33*M,.03*M),new THREE.MeshLambertMaterial({color:0x4a4846})]], m4=new THREE.Matrix4(), q=new THREE.Quaternion();
          for(const [g,mt] of parts){ const me=new THREE.InstancedMesh(g,mt,HY.length); HY.forEach(([x,y,z,sd],i)=>me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(new THREE.Vector3(0,1,0),(sd>0?0:Math.PI)+i*.4),new THREE.Vector3(1,1,1)))); me.castShadow=me.receiveShadow=true; scene.add(me); } } }
      if(PARK.mesh){ if(OAK.length&&!PARK.noTrees)DRESS.trees=PARK.mesh(OAK,true,true,true,{cards:1}); if(PL.length)DRESS.plants=PARK.mesh(PL,false,false,2); }
      if(PITS.length){ const N=40, cv=document.createElement('canvas'); cv.width=cv.height=N; const gx=cv.getContext('2d'), im=gx.createImageData(N,N), SO=[[58,44,34],[70,54,40],[48,36,28],[96,72,48]], LF=[[44,74,36],[60,98,46],[84,124,58],[36,58,30]];
        for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const n=hsh(Math.floor(i/5),Math.floor(j/5))*.6+hsh(Math.floor(i/3)+40,Math.floor(j/3))*.4, d=hsh(i,j), e=Math.min(i,j,N-1-i,N-1-j);
          let c=n>.52-.04*Math.max(0,4-e)?LF[d<.18?3:d<.55?0:d<.88?1:2]:SO[d<.5?0:d<.8?1:d<.96?2:3]; if(hsh(i+3,j*7)<.012)c=[150,112,52]; if(hsh(i*5,j+1)<.004)c=[226,220,206];
          const q=(j*N+i)*4; im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=255; }
        for(const [i,j,c] of [[9,30,[236,232,220]],[10,30,[214,120,60]],[31,8,[196,40,36]],[22,17,[150,112,52]],[23,17,[130,96,44]]]){ const q=(j*N+i)*4; im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; }
        gx.putImageData(im,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace;
        const pm=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:tx}),PITS.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion();
        PITS.forEach(([x,y,z,P,i],k)=>pm.setMatrixAt(k,m4.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(new THREE.Vector3(0,1,0),(i%4)*Math.PI/2),new THREE.Vector3(P-.1*M,1,P-.1*M)))); pm.receiveShadow=true; scene.add(pm); DRESS.pits=pm; } }
    { const me=new THREE.InstancedMesh(new THREE.CylinderGeometry(.5,.5,1,8),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),CY.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
      CY.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; scene.add(me); DRESS.rounds=me; }
    { const me=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),BL.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
      BL.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; scene.add(me); DRESS.blocks=me; } DRESS.posts=xs.length; DRESS.lights=n*2+xs.length+2; DRESS.poles=POLES; DRESS.lampposts=POSTS; DRESS.heads=hd; DRESS.lant=lant; DRESS.pole=pole; }
}
export {TLX};

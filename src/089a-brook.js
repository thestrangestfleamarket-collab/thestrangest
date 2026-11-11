// THE BROOK: BROOK builds the park's brook, its banks, riffles, pools and flowing water.
import {SHARED, THREE} from './003-shx.js';
import {BROOK, CLOCK, FLOW, PARK, SFX, SKY, WED} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, MAPG, MODS, SOL, TILE, ZU} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
 window.BROOK=BROOK;
{ const go=()=>{ '@park'; if(typeof PARK==='undefined'||!PARK.fire||!PARK.brook||!MODS.land)return setTimeout(go,500);
    const P=PARK, BK=P.brook, {C,N,SL,B,W,L,D,RF}=BK, T=TILE, WU=T/.84, G0=-.5*ZU, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), grp=(MAPG.park)||scene;
    const hs=(i,s)=>{ const v=Math.sin(i*12.9898+s*78.233)*43758.5453; return v-Math.floor(v); }, ss=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); };
    const bed=(x,y)=>{ const v=BK.h(x,y); return v==null?0:v; }, bedL=(x,y)=>{ const v=bed(x,y), d=-FOUNT.lake(x,y); return d>0?Math.min(v,-FOUNT.bedM(d)-(.04+G0)/WU):v; }, E=Math.ceil((W(SL)+B+1)/.5), row=k=>{ const kc=Math.max(0,Math.min(N,k)), c=C[kc], [nx,ny]=BK.nrm(kc), tx=ny, ty=-nx, o=(k-kc)*SL/N; return [c[0]+tx*o,c[1]+ty*o,c[2],nx,ny]; };
    const pool=s=>ss(SL-18,SL-6,s), rif=s=>[BK.sW,...RF].reduce((a,r)=>a+Math.exp(-(((s-r)/1.3)**2)),0), spd=s=>Math.max(.12,1+1.6*rif(s)-.9*pool(s));
    const tau=new Float32Array(N+1); for(let k=1;k<=N;k++)tau[k]=tau[k-1]+(SL/N)/spd(C[k][2]);
    const CH=Math.ceil(N/40), banks=[], waters=[], U={uT:{value:0},uDay:{value:1},uSky:{value:new THREE.Color(.5,.62,.75)},uSun:{value:new THREE.Color(1,1,1)},uSunD:{value:new THREE.Vector3(0,1,0)},uMe:{value:new THREE.Vector4()}};
    const bankMat=new THREE.MeshLambertMaterial({map:MODS.land.material.map,vertexColors:true,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
    bankMat.onBeforeCompile=sh=>{ sh.vertexShader='attribute float aWet; varying float vWet;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vWet=aWet;');
      sh.fragmentShader='varying float vWet;\n'+sh.fragmentShader.replace('#include <map_fragment>','float wq=step(.5+.35*(fract(sin(dot(floor(vWP.xz*6.),vec2(127.1,311.7)))*43758.5453)-.5),vWet);\n vec4 sampledDiffuseColor=texture2D(map,vMapUv); diffuseColor*=mix(sampledDiffuseColor,vec4(1.),wq);')
        .replace('#include <color_fragment>','#include <color_fragment>\n if(wq>.5){ float pb=fract(sin(dot(floor(vWP.xz*9.),vec2(12.9898,78.233)))*43758.5453); diffuseColor.rgb*=pb>.8?1.18:pb<.2?.82:1.; } else diffuseColor.rgb=sampledDiffuseColor.rgb;'); };
    bankMat.customProgramCacheKey=()=>'brookbank';
    const LT=[0,.1,.2,.29,.37,.45,.53,.61,.69,.77,.85,.93,1];
    for(let ci=0;ci<CH;ci++){ const k0=ci*40-(ci===0?E:0), k1=Math.min(N,ci*40+40)+(ci===CH-1?E:0), V=[], UV=[], CO=[], WT=[], I=[], RS=2, rows=[];
      for(let k=k0;k<=k1;k+=RS)rows.push(k); if(rows[rows.length-1]!==k1)rows.push(k1);
      const nl=LT.length*2-1; rows.forEach((k,ri)=>{ const [cx,cy,s,nx,ny]=row(k), R=W(s)+B+.5, lv=L(s);
        for(let li=0;li<nl;li++){ const f=li<LT.length-1?-LT[LT.length-1-li]:LT[li-LT.length+1], x=cx+nx*f*R, y=cy+ny*f*R, h=bedL(x,y), wx=X(x), wz=Z(y);
          V.push(wx,h*WU+G0,wz); UV.push(wx/T,-wz/T); const wet=1-ss(lv+.05,lv+.15,h); WT.push(wet); CO.push(...(h<lv-.02?[.5,.47,.41]:[.6,.52,.4]));
          if(ri&&li){ const a=(ri-1)*nl+li-1, b=a+1, c=ri*nl+li-1, d=c+1; I.push(a,b,c,b,d,c); } } });
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(V,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2)); g.setAttribute('color',new THREE.Float32BufferAttribute(CO,3)); g.setAttribute('aWet',new THREE.Float32BufferAttribute(WT,1)); g.setIndex(I); g.computeVertexNormals();
      const me=new THREE.Mesh(g,bankMat); me.receiveShadow=true; grp.add(me); banks.push(me);
      const WV=[], WF=[], WI=[], WL=[-1,-.66,-.33,0,.33,.66,1];   // where the stream's sheet lies inside the big lake it is not drawn (the lake's own clear water is over it)
      for(let k=ci?k0:Math.max(k0,BK.kM),ri=0;k<=k1;k++,ri++){ const [cx,cy,s,nx,ny]=row(k), R=W(s)+.75*B, lv=L(s), kc=Math.max(0,Math.min(N,k));
        WL.forEach((f,li)=>{ const x=cx+nx*f*R, y=cy+ny*f*R; WV.push(X(x),lv*WU+G0+.004,Z(y)); WF.push(tau[kc]+(k-kc)*.5,f*R,lv-bed(x,y),FOUNT.lake(x,y)<.05?-1:spd(s)); if(ri&&li){ const a=(ri-1)*7+li-1, b=a+1, c=ri*7+li-1, d=c+1; WI.push(a,b,c,b,d,c); } }); }
      const wg=new THREE.BufferGeometry(); wg.setAttribute('position',new THREE.Float32BufferAttribute(WV,3)); wg.setAttribute('aF',new THREE.Float32BufferAttribute(WF,4)); wg.setIndex(WI);
      waters.push({g:wg,k0:ci?k0:BK.kM,k1,rk:[]}); }
    const RK=[], STP=[], PB=[], col=[], add=(x,y,r,sy,top,kind)=>RK.push({x,y,r,sy,top,kind,sd:RK.length});
    const sideAt=(k,f,d)=>{ const c=C[k], [nx,ny]=BK.nrm(k); return [c[0]+nx*f*d,c[1]+ny*f*d]; }, kAt=s=>Math.max(0,Math.min(N,Math.round(s/SL*N))), nearBr=s=>Math.abs(s-C[BK.br.k][2])<BK.br.S+3;
    { const s=BK.sW+.35, k=kAt(s), w=W(s)*.98, n=Math.max(4,Math.round(2*w/.62)); for(let j=0;j<n;j++){ const [x,y]=sideAt(k,-1+2*(j+.5)/n,w); add(x,y,.32+hs(j,81)*.06,.32,L(BK.m)-L(s)+.02,'s'); } }
    for(let i=0;i<6;i++){ const s=BK.m+.6+i*1.3, [x,y]=sideAt(kAt(s),i%2?1:-1,W(s)+.5+hs(i,2)*.7); add(x,y,.55+hs(i,3)*.6,.7,null,'b'); }
    for(let s=BK.m+9,i=0;s<SL-16;s+=4+hs(i,4)*5,i++){ if(nearBr(s))continue; const k=kAt(s), f=hs(i,5)<.5?1:-1, m=.4+hs(i,6)*.75, [x,y]=sideAt(k,f,W(s)+.2+hs(i,7)*.9); add(x,y,m,.65,null,'b');
      if(hs(i,8)<.45){ const [x2,y2]=sideAt(kAt(s+1.2),f,W(s)+.9+hs(i,9)*.8); add(x2,y2,m*.6,.6,null,'b'); } }
    for(const r of RF){ const k=kAt(r); if(nearBr(r))continue; for(let j=0,n=3+Math.floor(hs(r,1)*3);j<n;j++){ const f=-1+2*(j+.5)/n+(hs(r,j+2)-.5)*.3, m=.18+hs(r,j+9)*.22, [x,y]=sideAt(k,f,W(r)*.85); add(x,y,m,.6,.06+hs(r,j+5)*.14,'m'); } }
    for(let i=0;i<16;i++){ const s=BK.m+5+hs(i,21)*(SL-26-BK.m); if(nearBr(s))continue; const k=kAt(s), [x,y]=sideAt(k,hs(i,22)*1.6-.8,W(s)); add(x,y,.2+hs(i,23)*.35,.6,.05+hs(i,24)*.2,'m'); }
    for(const s0 of [36,88,140]){ let s=s0+BK.sK; while(nearBr(s)||RF.some(r=>Math.abs(r-s)<4))s+=3; const k=kAt(s), w=W(s)+.6, n=Math.max(3,Math.round(2*w/1.15));
      for(let j=0;j<n;j++){ const f=-1+2*(j+.5)/n, [x,y]=sideAt(k,f,w), dd=hs(s,j)*.25-.12, m=.36+hs(s,j+3)*.08; add(x+dd,y-dd,m,.32,.1,'s'); } }
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2+hs(i,31)*.4, c=C[N], r=W(SL)+.6+hs(i,32)*1.3; if(a>Math.PI*.35&&a<Math.PI*.65)continue; add(c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r,.45+hs(i,33)*.8,.6,null,'b'); }
    for(let i=0;i<260;i++){ const s=BK.m+hs(i,41)*(SL-BK.m), k=kAt(s); if(nearBr(s))continue; const lv=L(s), f=hs(i,42)<.5?1:-1, d0=W(s)*(.7+hs(i,43)*.7), [x,y]=sideAt(k,f,d0), h=bed(x,y); if(h>lv+.25||h<lv-.15)continue; PB.push([x,y,h,.06+hs(i,44)*.1]); }
    const rgeo=(det,sd)=>{ const g=new THREE.IcosahedronGeometry(1,det), p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i), n=1+.12*Math.sin(x*3.1+sd)*Math.cos(z*2.7+y*1.9+sd*2)+.06*Math.sin(y*5.3+x*4.1); p.setXYZ(i,x*n,y*n,z*n); } return g; };
    const rmat=new THREE.MeshLambertMaterial({color:0xffffff}), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), cc=new THREE.Color(), V3=THREE.Vector3;
    const NB=5, bin=(x,y)=>{ const r=BK.q(x,y); return Math.min(NB-1,Math.floor((r?r[1]:0)/SL*NB)); }, RG=rgeo(1,3), PG=new THREE.IcosahedronGeometry(1,0); BROOK.rocks=[]; BROOK.pebbles=[]; const REG=[];
    for(let bi=0;bi<NB;bi++){ const list=RK.filter(o=>bin(o.x,o.y)===bi), pl=PB.filter(p=>bin(p[0],p[1])===bi);
      if(list.length){ const me=new THREE.InstancedMesh(RG,rmat,list.length);
        list.forEach((o,i)=>{ const s=BK.q(o.x,o.y), lv=L(s?s[1]:0), wx=X(o.x), wz=Z(o.y), rx=o.r*WU, ry=o.r*o.sy*WU, g=o.top!=null?(lv+o.top)*WU-ry:bed(o.x,o.y)*WU-ry*.35, a=hs(o.sd,51)*6.28;
          o.wx=wx; o.wz=wz; o.wr=rx; o.top3=g+ry+G0; me.setMatrixAt(i,m4.compose(new V3(wx,g+G0,wz),q.setFromEuler(e.set((hs(o.sd,52)-.5)*.25,a,(hs(o.sd,53)-.5)*.25)),new V3(rx*(.85+hs(o.sd,54)*.35),ry,rx*(.8+hs(o.sd,55)*.3))));
          const v=.5+hs(o.sd,56)*.16, mo=o.kind==='b'&&hs(o.sd,57)<.35; me.setColorAt(i,cc.setRGB(v*(mo?.86:1),v*(mo?1:.99),v*(mo?.8:.96))); });
        me.castShadow=true; me.computeBoundingSphere(); grp.add(me); BROOK.rocks.push(me); REG.push([me,list]); }
      if(pl.length){ const me=new THREE.InstancedMesh(PG,rmat,pl.length); pl.forEach(([x,y,h,r],i)=>{ const R=r*WU; me.setMatrixAt(i,m4.compose(new V3(X(x),h*WU+G0,Z(y)),q.setFromEuler(e.set(hs(i,61)*3,hs(i,62)*3,0)),new V3(R,R*.55,R*.8))); const v=.42+hs(i,63)*.3; me.setColorAt(i,cc.setRGB(v,v*.97,v*.92)); });
        me.computeBoundingSphere(); grp.add(me); BROOK.pebbles.push(me); REG.push([me,null]); } }
    for(const o of RK){ if(o.kind==='s'){ BK.st.push([o.x,o.y,o.r*.95/.84,(o.top3-G0)/WU]); continue; } if(o.r<.3)continue; const b=o.wr*.7; o.sol=[o.wx-b,o.wz-b,o.wx+b,o.wz+b]; o.fix=[o.wx-b,o.wz-b,G0-T,o.wx+b,o.wz+b,o.top3]; SOL.up.push(o.sol); FIX.up.push(o.fix); }
    for(const [me,list] of REG)WED.meshes.push({place:'park',me,items:Array.from({length:me.count},(_,i)=>{ me.getMatrixAt(i,m4); const E=m4.elements, o=list&&list[i]; return {k:!o?'pebble':o.kind==='s'?'stepping stone':'river rock',x:E[12],y:E[13],z:E[14],sol:o&&o.sol,fix:o&&o.fix}; })});
    // the water, clear: FLOW's surface (its rise and slope) over the bed you see through it, the sky in it, foam where it runs fast or round a rock
    const VS=FLOW.GLSL+'attribute vec4 aF; varying vec4 vF; varying vec3 vW; void main(){ vF=aF; vec4 w=modelMatrix*vec4(position,1.); w.y+=flowAt(w.xz).r; vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }';
    const FS=FLOW.GLSL+`uniform float uT,uDay; uniform vec3 uSky,uSun,uSunD; uniform vec4 uMe, uRk[24]; varying vec4 vF; varying vec3 vW;
      float h1(vec2 p){ p=fract(p*vec2(.1031,.1030)); p+=dot(p,p.yx+33.33); return fract((p.x+p.y)*p.x); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y); }
      void main(){ if(vF.z<-.5||vF.w<-.2)discard; if(!gl_FrontFacing){ vec3 u=uSky*(.35+.65*uDay)*.55+vec3(.02,.06,.05); gl_FragColor=vec4(floor(u*24.+.5)/24.*.8,.8); return; }   // seen from under the water: the bright surface overhead
        float sp=vF.w, ta=vF.x-uT*.8, u=vF.y, pl=step(sp,.3); vec2 wp=vW.xz/${T.toFixed(4)};
        vec4 fw=flowAt(vW.xz); vec2 sl=flowSlope(vW.xz), fv=fw.gb; float fs=length(fv);
        vec2 fp=mix(vec2(ta*.8,u*2.4),wp*.7+vec2(uT*.05,0.),pl); float n=vn(fp)*.65+vn(fp*2.3+7.)*.35, n2=vn(vec2(ta*2.2,u*5.)+3.);
        vec3 N=normalize(vec3(-sl.x*.6+(vn(fp*3.1+uT*.4)-.5)*.16*(.3+.7*(1.-pl)),1.,-sl.y*.6+(vn(fp*2.7-uT*.3+9.)-.5)*.16));
        vec3 V=isOrthographic?vec3(0.,.8,.6):normalize(cameraPosition-vW); float c=clamp(dot(N,V),0.,1.), F=.02+.98*pow(1.-c,5.);
        vec3 R=reflect(-V,N); vec3 sky=uSky*(.35+.65*uDay)*mix(1.,1.25,clamp(R.y,0.,1.))+vec3(.02,.03,.05);
        float dm=max(vF.z,0.), path=dm/max(V.y,.25); vec3 Tr=exp(-vec3(.45,.15,.19)*path);   // the shallows clear, the deep green
        vec3 inC=vec3(.05,.15,.11)*(.3+.7*uDay)+uSun*.03, col=inC*(1.-Tr)+sky*F; float al=max(F,1.-dot(Tr,vec3(.333)))*.92+.06;
        float sp2=pow(max(dot(R,normalize(uSunD)),0.),900.)*uDay; if(sp2>.6){ col+=uSun*.5; al=max(al,.8); }
        float fo=0.; if(vF.z<.015+.03*n*n2)fo=1.; if(sp>1.5&&vn(vec2(ta*5.,u*7.))*.6+n2*.4>.62-.1*(sp-1.5))fo=1.; if(fs>1.3&&vn(vW.xz/${T.toFixed(4)}*3.+fv*uT*.3)>1.15-fs*.25)fo=1.;
        for(int i=0;i<24;i++){ vec4 r=uRk[i]; if(r.z<=0.)continue; vec2 d=vW.xz-r.xy; float dl=length(d); if(dl>r.z*4.5)continue; vec2 fd=vec2(cos(r.w),sin(r.w)); float al2=dot(d,fd), cr=d.x*fd.y-d.y*fd.x;
          if(dl<r.z*(.98+.16*n))fo=1.; if(al2>0.&&al2<r.z*2.6&&abs(cr)<r.z*(.75-.6*al2/(r.z*2.6))&&vn(vec2(al2*4./r.z-uT*5.,cr*6./r.z))>.6)fo=1.; }
        if(fo>.5){ col=vec3(.74,.82,.86)*(.3+.65*uDay)+uSun*.12; al=1.; }
        col=floor(col*24.+.5)/24.; gl_FragColor=vec4(col,al); }`;
    const wmat=rk=>{ const m=new THREE.ShaderMaterial({uniforms:{...U,...FLOW.U,uRk:{value:rk}},vertexShader:VS,fragmentShader:FS,fog:false,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor}); m.customProgramCacheKey=()=>'brookwater'; return m; };
    for(const w of waters){ const s0=C[Math.max(0,w.k0)][2]-6, s1=C[Math.min(N,w.k1)][2]+6, mine=RK.filter(o=>{ const r=BK.q(o.x,o.y); return r&&r[1]>s0&&r[1]<s1&&o.top3>L(r[1])*WU+G0; }).slice(0,24);
      const arr=[]; for(let i=0;i<24;i++){ const o=mine[i]; if(!o){ arr.push(new THREE.Vector4()); continue; } const k=kAt(BK.q(o.x,o.y)[1]), [nx,ny]=BK.nrm(k); arr.push(new THREE.Vector4(o.wx,o.wz,o.wr*(o.kind==='s'?.95:.8),Math.atan2(nx,-ny))); }
      const me=new THREE.Mesh(w.g,wmat(arr)); me.renderOrder=1; grp.add(me); w.me=me; }
    const still=wmat(Array.from({length:24},()=>new THREE.Vector4()));
    BROOK.still=ms=>{ for(const me of ms){ const g=me.geometry, d=g.attributes.aD, n=g.attributes.position.count, f=new Float32Array(n*4); const ps=g.attributes.position; for(let i=0;i<n;i++){ const mx=ps.getX(i)/T+SHARED.BOD.OX-(P.ox||0), my=ps.getZ(i)/T+SHARED.BOD.OY-(P.oy||0); const r=BK.q(mx,my), out=FOUNT.lake(mx,my)>0; f[i*4+2]=g.userData.still&&d?d.getX(i)*2.4+.22:r&&r[1]>BK.m+.5&&r[0]<W(r[1])?-1:out?.5:d?d.getX(i)*2.4+.22:1; } g.setAttribute('aF',new THREE.BufferAttribute(f,4)); me.material=still; } };
    if(FOUNT.waters)BROOK.still(FOUNT.waters);
    BROOK.flowMat=()=>wmat(Array.from({length:24},()=>new THREE.Vector4()));   // running water for another place's stream (aF: along, across, depth, speed)
    { const br=BK.br, yc=br.yc, xc=br.xc, S=br.S, nx=-br.ay, ny=br.ax, wp=(u,w)=>[xc+u*br.ax+w*nx,yc+u*br.ay+w*ny], kc=C[br.k], lv=L(kc[2]), a=W(kc[2])+.4, U0=S+2, hump=BK.hump;
      const cv=document.createElement('canvas'); cv.width=cv.height=48; const g2=cv.getContext('2d'), id=g2.createImageData(48,48);
      for(let y=0;y<48;y++)for(let x=0;x<48;x++){ const ro=Math.floor(y/12), xo=x+(ro%2)*12, bi=Math.floor(xo/24), j=y%12===0||xo%24===0, t=hs(bi*7+ro,71), v=j?70:(118+40*t)*(y%12===1?1.1:y%12===11?.86:1), k=(y*48+x)*4; id.data[k]=v; id.data[k+1]=v*.97; id.data[k+2]=v*.9; id.data[k+3]=255; }
      g2.putImageData(id,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.repeat.set(1/1.4,1/1.4);
      const smat=new THREE.MeshLambertMaterial({map:tx,side:THREE.DoubleSide}), vb=(-D(kc[2])-.3)*WU, par=.5*WU;
      for(const f of [-1,1]){ const sh=new THREE.Shape(); sh.moveTo(-U0,vb); sh.lineTo(U0,vb); for(let i=16;i>=0;i--){ const u=-U0+2*U0*i/16; sh.lineTo(u,hump(...wp(u,f*3.5))*WU+par); }
        const ho=new THREE.Path(), sp=(lv-.1)*WU, cr=(br.H-.14)*WU; ho.moveTo(-a,sp); for(let i=1;i<16;i++){ const t=Math.PI*(1-i/16); ho.lineTo(Math.cos(t)*a,sp+Math.sin(t)*(cr-sp)); } ho.lineTo(a,sp); sh.holes.push(ho);
        const geo=new THREE.ExtrudeGeometry(sh,{depth:.45,bevelEnabled:false,curveSegments:4}), p=geo.attributes.position;
        for(let i=0;i<p.count;i++){ const u=p.getX(i), v=p.getY(i), w=p.getZ(i), q=wp(u,f*(3.6+w)); p.setXYZ(i,X(q[0]),v+G0,Z(q[1])); } geo.computeVertexNormals();
        const me=new THREE.Mesh(geo,smat); me.castShadow=me.receiveShadow=true; grp.add(me);
        for(let i=0;i<16;i++){ const u0=-U0+2*U0*i/16, u1=u0+2*U0/16, Q=[wp(u0,f*3.6),wp(u1,f*3.6),wp(u0,f*4.05),wp(u1,f*4.05)].map(q=>[X(q[0]),Z(q[1])]), xa=Math.min(...Q.map(q=>q[0])), xb=Math.max(...Q.map(q=>q[0])), za=Math.min(...Q.map(q=>q[1])), zb=Math.max(...Q.map(q=>q[1]));
          SOL.up.push([xa,za,xb,zb]); FIX.up.push([xa,za,vb+G0,xb,zb,Math.max(hump(...wp(u0,f*3.5)),hump(...wp(u1,f*3.5)))*WU+par+G0]); } }
      const dv=[], di=[], n=24; for(let i=0;i<=n;i++){ const u=-U0+2*U0*i/n, hc=hump(...wp(u,0))*WU+.003; for(const f of [-1,1]){ const q=wp(u,f*3.58); dv.push(X(q[0]),hc,Z(q[1])); } if(i)di.push(2*i-2,2*i,2*i-1,2*i-1,2*i,2*i+1); }
      const dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.Float32BufferAttribute(dv,3)); dg.setIndex(di); dg.computeVertexNormals(); const uv=[]; for(let i=0;i<dv.length;i+=3)uv.push(dv[i]/T*1.2,dv[i+2]/T*1.2); dg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
      const dk=new THREE.Mesh(dg,new THREE.MeshLambertMaterial({map:tx,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,side:THREE.DoubleSide})); dk.receiveShadow=true; grp.add(dk); BROOK.bridge=dk; }
    let snd=null, splash=0, wasIn=false;
    const sound=(c,near,rf)=>{ if(!snd||snd.ctx!==c){ const n=c.sampleRate*2, b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); let l=0; for(let i=0;i<n;i++){ l=l*.9+(Math.random()*2-1)*.1; d[i]=l*3*(.7+.3*Math.sin(i/n*Math.PI*14+Math.sin(i/n*Math.PI*6)*3)); }
        const s=c.createBufferSource(), F=c.createBiquadFilter(), G=c.createGain(); s.buffer=b; s.loop=true; F.type='bandpass'; F.frequency.value=1400; F.Q.value=.8; G.gain.value=0; s.connect(F).connect(G).connect(SFX.out(c)); s.start(); snd={ctx:c,F,G}; }
      const v=SFX.on?Math.max(0,1-near/14)**2*(.12+.12*rf):0; snd.G.gain.setTargetAtTime(v,c.currentTime,.3); snd.F.frequency.setTargetAtTime(1200+700*rf+300*Math.sin(c.currentTime*.7),c.currentTime,.4); };
    const plash=c=>{ const n=Math.floor(c.sampleRate*.25), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/n*7); const s=c.createBufferSource(), F=c.createBiquadFilter(), G=c.createGain(); s.buffer=b; F.type='bandpass'; F.frequency.value=900+Math.random()*600; G.gain.value=.18; s.connect(F).connect(G).connect(SFX.out(c)); s.start(); };
    BROOK.tick=(dt,pos)=>{ const px=SHARED.BOD.MX(pos.x)-(P.ox||0), py=SHARED.BOD.MY(pos.z)-(P.oy||0), r=SHARED.LVL==='up'?BK.q(px,py):null, s=r?r[1]:0, h=r?BK.h(px,py):null, wade=r&&s>=BK.m&&h!=null&&h<L(s)-.04&&!BK.st.some(o=>Math.hypot(px-o[0],py-o[1])<o[2]);
      const mv=wade||FOUNT.swim||BROOK.swim?Math.min(1,Math.hypot(pos.x-(BROOK.lx||pos.x),pos.z-(BROOK.lz||pos.z))/Math.max(dt,1e-3)/T):0; BROOK.lx=pos.x; BROOK.lz=pos.z; U.uMe.value.set(pos.x,pos.z,0,wade||FOUNT.swim||BROOK.swim?.35+.65*mv:0); BROOK.wade=!!wade; BROOK.over=!!r;
      if(CLOCK.sun){ if(CLOCK.sunV)U.uSunD.value.copy(CLOCK.sunV); U.uSun.value.copy(CLOCK.sun.color).multiplyScalar(Math.min(1.2,CLOCK.sun.intensity)); U.uDay.value=Math.max(.15,Math.min(1,(CLOCK.elev()+4)/14)); } if(SKY&&SKY.U)U.uSky.value.copy(SKY.U.uH.value);
      try{ const c=SFX.live&&SFX.live(); if(c){ sound(c,r?Math.max(0,r[0]-W(s)):99,r?Math.min(1,rif(s)):0); if(wade&&mv>.3&&(splash-=dt)<0){ splash=.42; plash(c); } if(wade&&!wasIn)plash(c); } }catch(_){ } wasIn=!!wade; };
    BROOK.tris=()=>[...banks,...waters.map(w=>w.me)].reduce((a,m)=>a+m.geometry.index.count/3,0)+BROOK.rocks.reduce((t,m)=>t+m.count*80,0)+BROOK.pebbles.reduce((t,m)=>t+m.count*20,0);
    { const mx=x=>SHARED.BOD.MX(x)-(P.ox||0), my=z=>SHARED.BOD.MY(z)-(P.oy||0), xs=C.map(c=>X(c[0])), zs=C.map(c=>Z(c[1])), m=(W(SL)+B+4)*T;   // the stream and THE LAKE in the one water: the bed under the stream, its surface stepping down the riffles
      FLOW.add({name:'brook',kind:'lake',shown:()=>grp.visible,box:[Math.min(...xs)-m,Math.min(...zs)-m,Math.max(...xs)+m,Math.max(...zs)+m],has:(x,z)=>{ const r=BK.q(mx(x),my(z)); return !!r&&r[1]>=BK.kM*SL/N-1&&r[0]<W(r[1])+B*.5&&!BK.st.some(o=>Math.hypot(mx(x)-o[0],my(z)-o[1])<o[2]*.8); },
        bed:(x,z)=>bedL(mx(x),my(z))*WU+G0,rest:(x,z)=>{ const r=BK.q(mx(x),my(z)); return L(r?r[1]:0)*WU+G0; }}); }
    { const UF=new THREE.Fog(0,0,1), bg0=new THREE.Color(); UF.uw=true; let fog0=null, uw=false, dome=true;   // under the stream and THE LAKE: the water's murk, as under the big lake
      (MODS.waters=MODS.waters||[]).unshift({pre:(scene,cam)=>{ const c=cam.position, r=SHARED.LVL==='up'&&!cam.isOrthographicCamera&&grp.visible&&!(scene.fog&&scene.fog.uw)?BK.q(SHARED.BOD.MX(c.x)-(P.ox||0),SHARED.BOD.MY(c.z)-(P.oy||0)):null;
          uw=!!r&&r[0]<W(r[1])&&c.y<L(r[1])*WU+G0&&!!(scene.background&&scene.background.isColor); if(!uw)return; const lv=L(r[1])*WU+G0, see=FLOW.see(Math.max(0,(lv-c.y)*.84/T),9);
          UF.color.setRGB(.2,.38,.3,THREE.SRGBColorSpace).multiplyScalar(U.uDay.value*see.k); UF.near=0; UF.far=see.far/.84*T; fog0=scene.fog; bg0.copy(scene.background); scene.fog=UF; scene.background.copy(UF.color);
          if(SKY&&SKY.dome){ dome=SKY.dome.visible; SKY.dome.visible=false; } },
        post:scene=>{ if(!uw)return; scene.fog=fog0; scene.background.copy(bg0); if(SKY&&SKY.dome)SKY.dome.visible=dome; uw=false; }}); }
    BROOK.feed=(st,pos,dt,go,keys)=>{ const px=SHARED.BOD.MX(pos.x)-(P.ox||0), py=SHARED.BOD.MY(pos.z)-(P.oy||0), r=SHARED.LVL==='up'?BK.q(px,py):null;
      if(!r||r[0]>=W(r[1])){ if(BROOK.swim&&st.water)st.water.in=false; BROOK.swim=false; return false; }
      const W1=RIG.water(st,{level:(L(r[1])*WU+G0+(BROOK.swim?FLOW.carry(pos,dt):0)-SHARED.py)/ZU,floor:(SHARED.groundY(pos.x,pos.z)-SHARED.py)/ZU}); W1.go=!!go; W1.fast=W1.in&&(keys.has('k')||keys.has('shift'))?1:0;
      if(W1.in&&W1.floor>=W1.level-30&&!st.move&&!W1.dive){ W1.in=false; if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:.4}; }
      W1.events.length=0; BROOK.swim=W1.in; return true; };
    BROOK.ready=true; };
  PARK.later(go); }

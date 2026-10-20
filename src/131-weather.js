const WX={hold:null,now:null};
{ const hsh=(i,s)=>{ let h=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const noise=(t,s,oct=2)=>{ let v=0,a=1,n=0; for(let o=0;o<oct;o++){ const i=Math.floor(t), f=t-i, u=f*f*(3-2*f); v+=a*(hsh(i,s+o*7)*(1-u)+hsh(i+1,s+o*7)*u); n+=a; a*=.5; t=t*2.1+11.7; } return v/n; };
  const cl=v=>Math.max(0,Math.min(1,v)), st=(n,k)=>cl((n-.5)*k+.5);
  const T=()=>Math.floor(Date.now()/86400000)*1440+CLOCK.h*60;
  WX.at=T=>{ const h=(T%1440+1440)%1440/60, dew=t=>{ const hh=(t%1440+1440)%1440/60; return hh<7||hh>21?.12:hh<10?.12*(10-hh)/3:hh>18?.12*(hh-18)/3:0; };
    const pres=t=>st(noise(t/2600,11,3),1.6), moist=t=>cl(st(noise(t/1900,23,3),1.6)*.85+dew(t)), p=pres(T), dp=(pres(T+60)-pres(T-60))*8;
    const cloudAt=t=>cl(moist(t)*1.4-pres(t)*1.0+st(noise(t/400,37,2),1.2)*.45-.12), cloud=(cloudAt(T-30)+cloudAt(T-60)+cloudAt(T-90))/3;
    const rainAt=t=>cl((cloudAt(t)-.7)*3.5)*cl((moist(t)-.5)*3), fall=rainAt(T-15), storm=fall>.5&&p<.22?cl((.22-p)*6*fall):0;
    const cold=st(noise(T/4300,71,2),1.6)<.12;
    const wind=cl(Math.abs(dp)*.9+st(noise(T/700,47,2),1.3)*.5-.2+noise(T/9,53,3)*.25*Math.abs(dp)+storm*.3), dir=noise(T/3000,41,2)*Math.PI*2;
    const night=h<6||h>20?1:h<8?(8-h)/2:h>18?(h-18)/2:0, fog=cl((moist(T)-.6)*3.5)*cl(1-wind*1.6)*(.3+.7*night)*(1-fall);
    return {cloud,rain:cold?0:fall,snow:cold?fall:0,storm,wind,dir,fog,flash:storm>0&&hsh(Math.floor(T*10/7),61)<storm*.15}; };
  const HOLDS={CLEAR:{cloud:.08,rain:0,snow:0,storm:0,wind:.15,dir:1,fog:0},CLOUDY:{cloud:.85,rain:0,snow:0,storm:0,wind:.35,dir:1,fog:0},RAIN:{cloud:.95,rain:.7,snow:0,storm:0,wind:.4,dir:1,fog:0},
    STORM:{cloud:1,rain:1,snow:0,storm:.8,wind:.9,dir:1,fog:0},SNOW:{cloud:.9,rain:0,snow:.7,storm:0,wind:.2,dir:1,fog:0},FOG:{cloud:.6,rain:0,snow:0,storm:0,wind:0,dir:1,fog:.7}};
  { const q=(QS.get('wx')||'').toUpperCase(); if(q==='NATURAL')WX.nat=1; else if(HOLDS[q])WX.hold=q; }
  const ph=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); }, CLD=WX.cld=[], NC=240, PF=[], CCA=[], ends=[], CSPH=[], CC={x:0,z:0};
  const SHP=[[[0,2,3.2],[-1,3.5,3],[1.2,.5,2.2],[1.4,-1.5,1.6],[1.8,-3.2,2],[.8,-4.6,.8,.5,-6.4,.25],[2.7,-4.6,.8,3,-6.4,.25],[2,3.5,1,2.2,5.6,.9],[-3.6,4.8,1,-6,3.8,.9],[-6,3.8,.9,-6.8,1.6,.8],[-6.8,1.6,.8,-6.2,-.4,.7]],
    [[-2,0,3.2],[1,0,3.4],[3.5,.3,2.8],[-3.6,2.5,1,-3.6,6,.9],[-1.2,2.5,1,-1.2,6,.9],[1.8,2.5,1,1.8,6,.9],[4.1,2.5,.9,4.1,6,.8],[5,-1,1.6,7,-4,1.1],[7,-4,1.1,8,-7,.9],[8.9,-7.6,1.1],[9.9,-7.3,.7],[-5,.5,2,-8,1.5,1.2],[-8,1.5,1.2,-11,1.5,.6],[-11,1.5,.6,-13,.8,.3]],
    [[0,1,3],[-1.2,2,2.8],[1.6,-.8,1.6],[2.5,-2.2,1.8],[2,-3.8,.9,1.2,-7.5,.7],[3,-3.8,.9,3.6,-7.3,.7],[-3.8,1.2,1.2],[2.3,3.2,.8,2.9,3.9,.7],[-1,4.2,1,1.5,4.4,.8]],
    [[-2,0,3],[1,-.2,3.4],[4,0,3],[6,.3,2.4],[-4,.2,2.4,-8,-.6,1],[-8.5,-.8,.8,-10.5,-3,.6],[-8.5,-.6,.8,-10.8,1.4,.6],[2,2.5,1,1,4.3,.6],[4.5,-3.6,.5,4.5,-5,.5],[4.5,-5.4,.6,3.2,-6.5,.5],[4.5,-5.4,.6,5.8,-6.5,.5]],
    [[0,0,2.8],[-2,.5,2.4],[-3.5,.8,2,-9,2.5,.4],[2,-2,1.6],[3.5,-3.8,1.8],[5.2,-3.6,1.3],[5,-2.6,.9],[2.8,0,.45,3.8,.6,.35],[0,2,1.8,.6,4.6,1],[.6,4.6,1,1.8,6,.8],[-1.8,2,1.6,-1.6,5,.9],[-1.6,5,.9,-.4,6.2,.7]],
    [[-.5,-1,3.2],[-4,2.3,1,5,2.3,1.1],[5,.7,1.1],[5,0,.4,5.6,-2.5,.3],[5.7,-2.8,.55],[4.4,0,.4,4.1,-2.3,.3],[4,-2.6,.5]]];
  const SPOT=[[-13,-15],[13,-15],[-14,3],[14,3],[-12,21],[13,21]], sunAt=h=>{ const e=Math.max(12,50*Math.cos(2*Math.PI*(h-12.7)/24)-8)*Math.PI/180, a=2*Math.PI*(h-12.7)/24; return [Math.sin(a)/Math.tan(e),Math.cos(a)/Math.tan(e)]; };
  const build=()=>{ const P=window.PARK, B=typeof BOD!=='undefined'?BOD:null; if(P&&B&&B.XS){ CC.x=B.XS(P.round[0]+(P.ox||0)); CC.z=B.ZS(P.round[1]+(P.oy||0)); }
    const T=TILE, hy=2*(WX.cy||0), [sx,sz]=sunAt(window.DN&&DN.S?DN.S.day.h:15.5), tg=WX.spot=[], O=P&&P.oaks||[], WD=window.WEEDS;
    if(WD&&WD.inPark){ const C=[]; for(let i=-45;i<=45;i+=3)for(let j=-45;j<=45;j+=3){ const x=CC.x+i*T, z=CC.z+j*T; if(WD.inPark(x,z)&&!O.some(o=>Math.hypot(o[0]-x,o[1]-z)<8*T))C.push([i*T,j*T]); } C.sort((a,b)=>Math.hypot(a[0],a[1])-Math.hypot(b[0],b[1])); for(const c of C)if(tg.length<6&&tg.every(g=>Math.hypot(g[0]-c[0],g[1]-c[1])>20*T))tg.push(c); }
    for(const g of SPOT)if(tg.length<6)tg.push([g[0]*T,g[1]*T]);
    for(let n=0;n<NC;n++){ const a0=PF.length;
      if(n<SHP.length){ const h=(70+ph(n,5,6)*8)*T, cx=tg[n][0]+(h+hy)*sx, cz=tg[n][1]+(h+hy)*sz, j=(ph(n,3,4)-.5)*.5, co=Math.cos(j), si=Math.sin(j), s=1.15*T, C=[];
        for(const q of SHP[n]){ if(q.length<4){ C.push(q); continue; } const [x0,z0,r0,x1,z1,r1]=q, m=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/(Math.min(r0,r1)*.7))); for(let i=0;i<=m;i++){ const t=i/m; C.push([x0+(x1-x0)*t,z0+(z1-z0)*t,r0+(r1-r0)*t]); } }
        C.forEach(([x,z,r],k)=>{ const X=x*co-z*si, Z=x*si+z*co; PF.push(cx+s*.707*(X-Z),h+r*s*(.2+.5*ph(n,k,15)),cz+s*.707*(X+Z),r*s); });
        CLD.push([cx,h,cz,16*T]); }
      else { let ring=n%3!==2, ang, dist, cx, cz, cy, w;
        for(let a=0;a<9;a++){ ang=ph(n,1,2+a*17)*Math.PI*2; dist=(ring?150+ph(n,3,4+a*17)*170:10+ph(n,3,4+a*17)*190)*T; cx=Math.sin(ang)*dist; cz=Math.cos(ang)*dist; cy=(ring?28+ph(n,5,6)*76:60+ph(n,5,6)*32)*T; w=(ring?28+ph(n,7,8)*34:20+ph(n,7,8)*22)*T;
          const gx=cx-(cy+hy)*sx, gz=cz-(cy+hy)*sz; if(!tg.some(g=>Math.hypot(g[0]-gx,g[1]-gz)<w*.8+12*T))break; }
        const ro=ph(n,12,13)*Math.PI*2, co=Math.cos(ro), si=Math.sin(ro);
        for(let k=0;k<26;k++){ const u=ph(n,k,9)-.5, v=ph(n,k,10)-.5, e=1-Math.abs(u)*2, r=w*(.07+.07*e+.05*ph(n,k,11)), a=u*w*1.3, b=v*w*.55*(.4+.6*e); PF.push(cx+a*co-b*si,cy+r*.5+e*w*.1*ph(n,k,14),cz+a*si+b*co,r); }
        CLD.push([cx,cy,cz,w]); }
      const Bx=new THREE.Box3(), V=new THREE.Vector3(); for(let i=a0;i<PF.length;i+=4){ V.set(PF[i],PF[i+1],PF[i+2]); Bx.expandByPoint(V.clone().addScalar(PF[i+3])); Bx.expandByPoint(V.addScalar(-PF[i+3])); }
      const S=Bx.getBoundingSphere(new THREE.Sphere()); CSPH.push(S); for(let i=a0;i<PF.length;i+=4)CCA.push(S.center.x,S.center.y,S.center.z,S.radius); ends.push(PF.length/4); }
    cg.setAttribute('pf',new THREE.InstancedBufferAttribute(new Float32Array(PF),4)); cg.setAttribute('cc',new THREE.InstancedBufferAttribute(new Float32Array(CCA),4)); };
  const cg=new THREE.InstancedBufferGeometry(); cg.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3)); cg.setIndex([0,1,2,0,2,3]); cg.instanceCount=0;
  const CU={uCF:{value:new THREE.Vector3(0,0,1)},uCO:{value:new THREE.Vector3()},uUnder:{value:new THREE.Color(0,0,0)},uCM:{value:new THREE.Vector4(0,0,0,0)},uCol:{value:new THREE.Color(1,1,1)},uEm:{value:new THREE.Color()},uSunC:{value:new THREE.Color()},uSunD:{value:new THREE.Vector3(0,1,0)},uSky:{value:new THREE.Color()},uGnd:{value:new THREE.Color()}};
  WX.cloudMist=c=>{ CU.uCM.value.set(c.r,c.g,c.b,.5); mistT=2; }; let mistT=0; WX.under=CU.uUnder;
  const cmat=new THREE.ShaderMaterial({uniforms:CU,
    vertexShader:'attribute vec4 pf,cc; varying vec2 vQ; varying vec3 vCW,vG; varying float vR; void main(){ vQ=position.xy; vG=(pf.xyz-cc.xyz)/cc.w; vR=pf.w/cc.w; vec4 c=modelMatrix*vec4(pf.xyz,1.); vCW=c.xyz; vec4 m=viewMatrix*c; m.xy+=position.xy*pf.w; gl_Position=projectionMatrix*m; }',
    fragmentShader:`uniform vec3 uCF,uCO,uUnder,uCol,uEm,uSunC,uSunD,uSky,uGnd; uniform vec4 uCM; varying vec2 vQ; varying vec3 vCW,vG; varying float vR;
      void main(){ float q=dot(vQ,vQ); if(q>1.||dot(vCW.xz-uCO.xz,uCF.xz)<12.)discard; vec3 n=normalize(vec3(vQ,sqrt(1.-q))*mat3(viewMatrix)), g=vG+n*vR; g.y*=3.; n=normalize(n*.45+normalize(g));
        float d=dot(n,normalize(uSunD)), b=d>.45?1.:d>.05?.78:d>-.35?.58:.42; vec3 h=n.y>.3?uSky:n.y>-.3?(uSky+uGnd)*.5:uGnd;
        vec3 c=uCol*(uSunC*b+h)*.3183+uEm+uUnder*step(.4,-n.y); gl_FragColor=vec4(mix(c,uCM.rgb,uCM.a),1.);
        #include <colorspace_fragment>
      }`});
  cmat.color=CU.uCol.value; cmat.emissive=CU.uEm.value;
  WX.cloudCut=()=>{ if(mistT>0&&--mistT<=0)CU.uCM.value.w=0; const f=new THREE.Vector3(); cam.getWorldDirection(f); f.y=0; if(f.lengthSq()<1e-6)f.set(0,0,1); f.normalize(); CU.uCF.value.copy(f); CU.uCO.value.set(pos.x,0,pos.z); };
  const CL=new THREE.Mesh(cg,cmat); CL.frustumCulled=false; CL.visible=false; scene.add(CL); WX.clouds=CL;
  CL.onBeforeRender=()=>{ const S=CLOCK.sun; CU.uSunD.value.copy(CLOCK.dir||CLOCK.sunV); CU.uSunC.value.copy(S.color).multiplyScalar(S.intensity); CU.uSky.value.copy(HEMI.color).multiplyScalar(HEMI.intensity); CU.uGnd.value.copy(HEMI.groundColor).multiplyScalar(HEMI.intensity); };
  const CSEE=n=>{ const f=CU.uCF.value, o=CL.position; return CULL.seen(CSPH.slice(0,n),o,S=>(S.center.x+o.x-pos.x)*f.x+(S.center.z+o.z-pos.z)*f.z+S.radius<12); };
  const CSM=LFX.cs, NT=CSM.n, FB=new Float32Array(NT*NT); let bk='';
  const bake=(show,L)=>{ const M=CSM.tex.image.data, W=CSM.w, k=NT/W, hy=CL.position.y, lx=L[0], lz=L[1]; FB.fill(0);
    for(let i=0,e=ends[show-1]*4;i<e;i+=4){ const y=PF[i+1]+hy, R=PF[i+3]*1.3*k, gx=(PF[i]-y*lx)*k+NT/2, gz=(PF[i+2]-y*lz)*k+NT/2;
      if(gx+R<0||gz+R<0||gx-R>=NT||gz-R>=NT)continue; const R2=R*R;
      for(let jz=Math.max(0,Math.floor(gz-R)),jz1=Math.min(NT-1,Math.ceil(gz+R));jz<=jz1;jz++){ const dz=jz+.5-gz; for(let jx=Math.max(0,Math.floor(gx-R)),jx1=Math.min(NT-1,Math.ceil(gx+R));jx<=jx1;jx++){ const dx=jx+.5-gx, t=1-(dx*dx+dz*dz)/R2; if(t>0)FB[jz*NT+jx]+=t*t; } } }
    for(let i=0;i<NT*NT;i++){ const v=FB[i]*3; M[i]=v>1?255:v*255; }
    for(let i=0;i<NT;i++)M[i]=M[NT*NT-1-i]=M[i*NT]=M[i*NT+NT-1]=0;
    Object.assign(CSM.V,{x:lx,y:lz,z:CC.x,w:CC.z}); CSM.tex.needsUpdate=true; };
  const NR=1800, RB=16*TILE, RH=14*TILE, rp=new Float32Array(NR*6), rs=new Float32Array(NR*3); for(let i=0;i<NR;i++){ rs[i*3]=(Math.random()-.5)*2*RB; rs[i*3+1]=Math.random()*RH; rs[i*3+2]=(Math.random()-.5)*2*RB; }
  const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.BufferAttribute(rp,3).setUsage(THREE.DynamicDrawUsage));
  const RAIN=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xaec4e0,transparent:true,opacity:.55,depthWrite:false})); RAIN.frustumCulled=false; scene.add(RAIN);
  const NS=1400, sp=new Float32Array(NS*3), ss=new Float32Array(NS*4); for(let i=0;i<NS;i++){ ss[i*4]=(Math.random()-.5)*2*RB; ss[i*4+1]=Math.random()*RH; ss[i*4+2]=(Math.random()-.5)*2*RB; ss[i*4+3]=Math.random()*6.28; }
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3).setUsage(THREE.DynamicDrawUsage));
  const SNOW=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false})); SNOW.frustumCulled=false; scene.add(SNOW);
  const FOG=new THREE.Fog(0x9aa3ad,2,200), cA=new THREE.Color(), cB=new THREE.Color(); let flashT=0, ft=0;
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt);
    if((ft-=dt)<=0){ ft=.5; WX.now=WX.hold?Object.assign({flash:(WX.hold==='STORM'||WX.flashK>0)&&Math.random()<(WX.flashK||.04)},HOLDS[WX.hold]):WX.fix&&!WX.nat?{...WX.fix,flash:false}:WX.at(T()); }
    const W=WX.now, up=LVL!=='down', inside=!OUT.open, day=cl((CLOCK.elev()+4)/14), t=performance.now()/1000;
    if(!ends.length)build(); WX.cloudCut(); const show=Math.min(NC,Math.round(90+W.cloud*150)); WX.show=show; cg.instanceCount=ends[show-1];
    cmat.color.setRGB(1,1,1).multiplyScalar(1-.35*W.rain-.35*W.storm); cmat.emissive.setRGB(.16,.2,.27).multiplyScalar(.4+.6*day);
    CL.position.set(CC.x,2*(WX.cy||0),CC.z); CL.visible=up&&CSEE(show); { const D=CLOCK.dir||CLOCK.sunV, y=Math.max(.2079,D.y), L=[D.x/y,D.z/y], key=show+'|'+CL.position.y.toFixed(1)+'|'+Math.round(L[0]*40)+'|'+Math.round(L[1]*40); if(key!==bk){ bk=key; bake(show,L); } }
    if(up){ scene.background.lerp(cA.setRGB(.55,.58,.62).multiplyScalar(.25+.75*day),cl(W.cloud*W.cloud*.85)); if(W.storm)scene.background.multiplyScalar(1-.45*W.storm);
      CLOCK.sun.intensity*=1-.72*cl((W.cloud-.2)/.8); }
    if(W.flash&&flashT<=0)flashT=.14; if(flashT>0){ flashT-=dt; if(up){ const f=WX.hold==='RAIN'?.3:1; scene.background.lerp(cA.setRGB(.85,.88,.95),f); HEMI.intensity+=2.5*f; } }
    if(typeof PARK!=='undefined'&&PARK.windK)PARK.windK.value=.35+1.6*W.wind;
    if(up&&!inside&&W.fog>.02){ scene.fog=FOG; FOG.color.setRGB(.7,.72,.74).multiplyScalar(.15+.85*day).lerp(scene.background,.25); FOG.near=2*TILE; FOG.far=(11+70*Math.pow(1-W.fog,2))*TILE; scene.background.lerp(FOG.color,cl(W.fog*1.3)); } else if(scene.fog===FOG)scene.fog=null;
    const wx=Math.cos(W.dir)*W.wind*5*TILE, wz=Math.sin(W.dir)*W.wind*5*TILE;
    const nr=inside?0:Math.round(NR*W.rain); RAIN.visible=nr>0; if(nr){ const v=14*TILE, L=.45*TILE, sx=wx/v*L, sz=wz/v*L; for(let i=0;i<nr;i++){ let y=rs[i*3+1]-v*dt; if(y<0)y+=RH; rs[i*3+1]=y;
        const x=((rs[i*3]+wx*t/4)%(2*RB)+3*RB)%(2*RB)-RB+pos.x, z=((rs[i*3+2]+wz*t/4)%(2*RB)+3*RB)%(2*RB)-RB+pos.z, gy=py+y; rp.set([x,gy,z,x-sx,gy+L,z-sz],i*6); }
      rg.setDrawRange(0,nr*2); rg.attributes.position.needsUpdate=true; RAIN.material.opacity=.4+.25*day; }
    const ns=inside?0:Math.round(NS*W.snow); SNOW.visible=ns>0; if(ns){ for(let i=0;i<ns;i++){ let y=ss[i*4+1]-1.1*TILE*dt; if(y<0)y+=RH; ss[i*4+1]=y; const a=ss[i*4+3]+t*.8;
        const x=((ss[i*4]+wx*t/3+Math.sin(a)*.4*TILE)%(2*RB)+3*RB)%(2*RB)-RB+pos.x, z=((ss[i*4+2]+wz*t/3+Math.cos(a*.7)*.4*TILE)%(2*RB)+3*RB)%(2*RB)-RB+pos.z; sp.set([x,py+y,z],i*3); }
      sg.setDrawRange(0,ns); sg.attributes.position.needsUpdate=true; } };
  window.WX=WX; window.WXDBG=()=>WX.now; }

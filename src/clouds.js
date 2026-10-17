// ---- THE FULL CLOUDS, MOCKUPS (owner, 17 Oct 2026: "the clouds seem flat, i want them to be really full and thick, cast real shadows, sun beams
// etc, fully realistic atmosphere"; "more pixel art vibes": hard whole pixels, a few stepped tones, grainy edges between them, no blur). Two
// ways, by ?clouds=, off by default (the game as it was):
//  vol:   the clouds raymarched through a field of cloud (the sky's cover map, the same one their shadows come from, eaten at its edges by a 3D
//         noise), each pixel's light marched toward the sun (lit tops, dark bellies, a silver edge against the sun), cut to four tones with a
//         grain at each step and a hard edge; in the picture's own coarse pixels, so the march is affordable.
//  thick: the cumulus heaped from many puffs (some 4,400, two triangles each), each a sphere drawn on a card (its own depth, so the puffs
//         meet as lumps), shaded by the sun on the puff and on the whole cloud (the side toward the sun lit, the far side and the belly dark),
//         cut to five tones with a grain; their shadows drawn once into the same kind of cover map.
// Both: the shadows on the ground (map-pre.js's CLD), the sun's beams (the air under the clouds marched a few steps: lit where the sun gets
// through, dark under a cloud, in stepped tones), the haze toward the horizon (stepped), and the sky's gradient with the sun's disc (stepped).
// One screen pass after the scene (needs the scene's depth); in the isometric view the clouds show only against the sky, never over the street ----
CLD.amt=QS.get('cloudamt')!=null?+QS.get('cloudamt'):null;   // (?cloudamt=.4: the clouds' amount held, for a look at a part-cloudy sky)
if(CLD.on){ const cl=v=>Math.max(0,Math.min(1,v)), VOL=CLD.mode==='vol', U=CLD.U;
  const hsh=(i,j,k)=>{ let h=(Math.imul(i|0,374761393)+Math.imul(j|0,668265263)+Math.imul(k|0,1440662683))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const BASE=18, TOP=42; U.uCSE.value.z=BASE; U.uCSE.value.w=TOP; U.uCSD.value.x=VOL?24:BASE+5;
  // ---- the sky's cover map. vol: a tiling noise (blobs about 25 units across), 256 texels for 200 units; thick: the puffs drawn into it below
  let SCOV=200, covSorted=null;
  if(VOL){ const N=256, D=new Uint8Array(N*N), F=new Float32Array(N*N);
    const vn=(x,y,P)=>{ const i=Math.floor(x), j=Math.floor(y), u=x-i, v=y-j, a=u*u*(3-2*u), b=v*v*(3-2*v), m=k=>((k%P)+P)%P, h=(p,q)=>hsh(m(p),m(q),7);
      return (h(i,j)*(1-a)+h(i+1,j)*a)*(1-b)+(h(i,j+1)*(1-a)+h(i+1,j+1)*a)*b; };
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){ let s=0,amp=1,n=0; for(let o=0;o<3;o++){ const P=6<<o; s+=amp*vn(x/N*P,y/N*P,P); n+=amp; amp*=.5; } F[y*N+x]=s/n; }
    let lo=1,hi=0; for(const v of F){ lo=Math.min(lo,v); hi=Math.max(hi,v); } for(let i=0;i<N*N;i++)D[i]=Math.round((F[i]-lo)/(hi-lo)*255);
    covSorted=Float32Array.from(D).sort();
    U.tCS.value=new THREE.DataTexture(D,N,N,THREE.RedFormat); U.uCSD.value.y=1/SCOV; }
  // ---- vol: the 3D noise that eats the clouds' edges into heaps (64 a side, tiling): Worley's cells turned inside out, with a value noise
  let TN=null;
  if(VOL){ const N=64, C=6, D=new Uint8Array(N*N*N), pts=[]; for(let k=0;k<C;k++)for(let j=0;j<C;j++)for(let i=0;i<C;i++)pts.push([i+hsh(i,j,k*3+1),j+hsh(i,j,k*3+2),k+hsh(i,j,k*3+3)]);
    const P=(i,j,k)=>pts[(((k%C)+C)%C)*C*C+(((j%C)+C)%C)*C+(((i%C)+C)%C)];
    for(let z=0;z<N;z++)for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const fx=x/N*C, fy=y/N*C, fz=z/N*C, ci=Math.floor(fx), cj=Math.floor(fy), ck=Math.floor(fz); let d=9;
      for(let c=-1;c<=1;c++)for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){ const p=P(ci+a,cj+b,ck+c), dx=ci+a+(p[0]-Math.floor(p[0]))-fx, dy=cj+b+(p[1]-Math.floor(p[1]))-fy, dz=ck+c+(p[2]-Math.floor(p[2]))-fz; d=Math.min(d,dx*dx+dy*dy+dz*dz); }
      const w=1-Math.min(1,Math.sqrt(d)*1.1), v=hsh(x>>2,y>>2,z>>2)*.25; D[(z*N+y)*N+x]=Math.round(cl(w*.8+v)*255); }
    TN=new THREE.Data3DTexture(D,N,N,N); TN.format=THREE.RedFormat; TN.wrapS=TN.wrapT=TN.wrapR=THREE.RepeatWrapping; TN.magFilter=TN.minFilter=THREE.LinearFilter; TN.unpackAlignment=1; TN.needsUpdate=true; }
  // ---- thick: the cumulus field, a tile of 480 units round you (repeating, so it never ends), 110 clouds, each a heap of 30-50 puffs: a flat
  // foot at the base, piled into a dome, the big puffs low and in the middle, smaller ones climbing (the cauliflower top)
  const S=480, NC=110; let TH=null, ends=[];
  if(!VOL){ const C=[], K=[];
    for(let n=0;n<NC;n++){ const cx=hsh(n,1,9)*S, cz=hsh(n,2,9)*S, w=11+hsh(n,3,9)*16, h=w*(.55+hsh(n,4,9)*.45), np=30+Math.floor(hsh(n,5,9)*21);
      for(let k=0;k<np;k++){ const a=hsh(n,k,11)*6.283, rr=Math.pow(hsh(n,k,12),.7), u=Math.cos(a)*rr*w*.5, v=Math.sin(a)*rr*w*.38, dome=Math.pow(Math.max(0,1-rr*rr),.6);
        const r=w*(.13+.11*hsh(n,k,13))*(1-.35*rr)*(1-.3*hsh(n,k,14)*dome), y=BASE+r*.55+hsh(n,k,15)*dome*h*.8;
        C.push(cx+u,y,cz+v,r); K.push(cx,BASE+h*.35,cz,n); }
      ends.push(C.length/4); }
    const g=new THREE.InstancedBufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0, 1,-1,0, 1,1,0, -1,1,0]),3)); g.setIndex([0,1,2,0,2,3]);
    g.setAttribute('aC',new THREE.InstancedBufferAttribute(new Float32Array(C),4)); g.setAttribute('aK',new THREE.InstancedBufferAttribute(new Float32Array(K),4)); g.instanceCount=0;
    // their shadows: each puff's disc drawn into the cover map (512 texels for the 480 units), as 1 - (its cloud's number)/110, the lowest
    // number kept, so "as many clouds as show" is one cut: the map over 1 - shown/110
    const N=512, D=new Uint8Array(N*N);
    for(let i=0;i<C.length/4;i++){ const x=C[i*4]/S*N, z=C[i*4+2]/S*N, r=C[i*4+3]*.92/S*N, v=Math.round(255*(1-(K[i*4+3]+.5)/NC));
      for(let j=Math.floor(z-r);j<=Math.ceil(z+r);j++)for(let k=Math.floor(x-r);k<=Math.ceil(x+r);k++){ if((k-x)*(k-x)+(j-z)*(j-z)>r*r)continue; const o=((j%N+N)%N)*N+((k%N+N)%N); if(v>D[o])D[o]=v; } }
    U.tCS.value=new THREE.DataTexture(D,N,N,THREE.RedFormat); U.uCSD.value.y=1/S; SCOV=S;
    TH={g,U:{uP:{value:new THREE.Vector3()},uS:{value:S},uDrift:{value:new THREE.Vector2()},uCutF:{value:new THREE.Vector3(0,0,1)},uOrtho:{value:0},uCW:{value:new THREE.Matrix4()},
      uSun:{value:new THREE.Vector3(0,1,0)},uSunV:{value:new THREE.Vector3()},uPal:{value:[0,1,2,3,4].map(()=>new THREE.Vector3())},uSkyH:{value:new THREE.Vector3()},uBase:{value:BASE},uHaze:{value:.004}}}; }
  { const T=U.tCS.value; T.wrapS=T.wrapT=THREE.RepeatWrapping; T.magFilter=T.minFilter=VOL?THREE.LinearFilter:THREE.NearestFilter; T.needsUpdate=true; }
  // the cut for an amount of cloud (vol: the cover map's level that leaves that share of the sky clear)
  const covCut=f=>covSorted[Math.min(covSorted.length-1,Math.floor((1-f)*covSorted.length))]/255;
  // ---- thick: the puffs' material (a sphere on a card facing you; the card's corners pushed out in the view's plane)
  if(TH){ const m=new THREE.ShaderMaterial({uniforms:TH.U,
    vertexShader:`uniform vec3 uP,uCutF; uniform float uS,uOrtho,uBase; uniform vec2 uDrift; attribute vec4 aC,aK; varying vec2 vQ; varying vec3 vVP,vN0; varying float vR,vH,vSeed;
      void main(){ vec2 cc=aK.xz+uDrift, w=mod(cc-uP.xz+uS*.5,uS)-uS*.5+uP.xz, off=w-aK.xz; vec3 c=aC.xyz+vec3(off.x,0.,off.y);
        if(uOrtho>.5&&dot(w-uP.xz,uCutF.xz)<12.){ gl_Position=vec4(2.,2.,2.,1.); return; }   // (the isometric view: none on the camera's side, as the old clouds)
        vec4 vp=viewMatrix*vec4(c,1.); vQ=position.xy*1.2; vp.xy+=vQ*aC.w; vVP=vp.xyz-vec3(vQ*aC.w,0.); vR=aC.w; vSeed=aK.w*13.1+aC.w*7.3;
        vN0=normalize((aC.xyz-aK.xyz)*vec3(1.,1.6,1.)+vec3(0.,.01,0.)); vH=(aC.y-uBase)/max(aK.y-uBase,1.)*.5; gl_Position=projectionMatrix*vp; }`,
    fragmentShader:`uniform mat4 projectionMatrix; uniform vec3 uSun,uSunV,uSkyH; uniform vec3 uPal[5]; uniform mat4 uCW; uniform float uOrtho,uBase,uHaze; varying vec2 vQ; varying vec3 vVP,vN0; varying float vR,vH,vSeed;
      float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main(){ float r2=dot(vQ,vQ), an=atan(vQ.y,vQ.x), lump=1.+.07*sin(an*5.+vSeed)+.05*sin(an*9.+vSeed*1.7); if(r2>lump*lump*.8)discard;
        float r2n=min(r2/(lump*lump*.8),1.); vec3 nv=vec3(vQ/(lump*.894),sqrt(1.-r2n)); vec3 sp=vVP+nv*vR; vec3 wp=(uCW*vec4(sp,1.)).xyz;
        if(wp.y<uBase-.3)discard;   // (the flat foot)
        vec3 nw=normalize((vec4(nv,0.)*viewMatrix).xyz), n=normalize(nw*.6+vN0*.8);
        float g=hs(floor(vQ*vR*4.)+vSeed);   // (the grain, fixed to the puff)
        float l=max(dot(n,uSun),0.)*.75+.25, b=l*(.45+.55*smoothstep(-.1,.7,vH+nw.y*.25));
        float back=max(0.,-uSunV.z); b+=smoothstep(.8,.98,r2n)*back*(1.-max(dot(vN0,uSun),0.))*.35;   // (the silver edge with the sun behind)
        float t=floor(clamp(b*4.4+(g-.5)*.3,0.,4.99)); vec3 col=t<1.?uPal[0]:t<2.?uPal[1]:t<3.?uPal[2]:t<4.?uPal[3]:uPal[4];
        float hz=uOrtho>.5?0.:1.-exp(-length(sp)*uHaze*.25); col=mix(col,uSkyH,floor(hz*5.+.5+(g-.5)*.6)/5.);
        vec4 cp=projectionMatrix*vec4(sp,1.); float z=cp.z/cp.w*.5+.5; gl_FragDepth=uOrtho>.5?.9994+.0005*z:z;   // (isometric: behind everything, so only against the sky)
        gl_FragColor=vec4(col,1.); }`});
    TH.mesh=new THREE.Mesh(TH.g,m); TH.mesh.frustumCulled=false; TH.mesh.renderOrder=-1; scene.add(TH.mesh); }
  // ---- the screen pass: the sky, (vol) the clouds, the haze, the beams
  const PU={tDiffuse:{value:null},tDepth:{value:null},tN:{value:TN},uPI:{value:new THREE.Matrix4()},uCW:{value:new THREE.Matrix4()},uSunC:{value:new THREE.Vector3()},uSkyZ:{value:new THREE.Vector3()},uSkyH:{value:new THREE.Vector3()},
    uP:{value:new THREE.Vector3()},uDay:{value:1},uOrtho:{value:0},uWind:{value:new THREE.Vector3()},uBeam:{value:.35},uHaze:{value:.006},uPal:{value:[0,1,2,3,4].map(()=>new THREE.Vector3())},uSunV:{value:new THREE.Vector3()}};
  const shader={uniforms:PU, vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:(VOL?'#define VOL\n':'')+`precision highp sampler3D; uniform sampler2D tDiffuse,tDepth,tCS; uniform highp sampler3D tN; uniform mat4 uPI,uCW; uniform vec4 uCS,uCSD,uCSE;
      uniform vec3 uSunC,uSkyZ,uSkyH,uP,uWind,uSunV; uniform vec3 uPal[5]; uniform float uDay,uOrtho,uBeam,uHaze; varying vec2 vUv;
      ${CLD.SHGLSL}
      float hs(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
      float qz(float v,float n,float g){ return floor(v*n+.5+(g-.5)*.35)/n; }   // (a level cut to n steps, the grain only near each step's edge)
      #ifdef VOL
      float dens(vec3 p){ float h=(p.y-uCSE.z)/(uCSE.w-uCSE.z); if(h<0.||h>1.)return 0.;
        float cv=cldCov(p.xz)-uCSE.x, c=clamp(cv/.035+.3,0.,1.), dome=clamp(cv/.2,0.,1.), top=.12+.88*pow(dome,.8), hp=smoothstep(0.,.03,h)*(1.-smoothstep(top*.65,top,h));   // (the edge sharp, the height a dome: tallest where the cover is thickest)
        float n=texture(tN,p*.03+uWind).r, n2=texture(tN,p*.09+uWind*1.6).r;
        return clamp((c*hp-(1.-n)*.32-(1.-n2)*.12)*6.,0.,1.); }
      #endif
      void main(){ vec3 col=texture2D(tDiffuse,vUv).rgb; float d=texture2D(tDepth,vUv).r; bool sky=d>.99999;
        vec4 a=uPI*vec4(vUv*2.-1.,-1.,1.); a/=a.w; vec4 b=uPI*vec4(vUv*2.-1.,d*2.-1.,1.); b/=b.w;
        vec3 ro=(uCW*vec4(a.xyz,1.)).xyz, pe=(uCW*vec4(b.xyz,1.)).xyz, rd=normalize(pe-ro); float tEnd=sky?600.:length(pe-ro);
        float g=sky?hs(floor(rd*420.)):hs(floor(pe*21.24+.001));   // (the grain: the world's art pixels, or the sky's way)
        // the sky: pale at the horizon, deep overhead, in bands broken by the grain; the sun's disc and a stepped ring round it
        if(sky&&uOrtho<.5){ float e=max(rd.y,0.), eb=qz(clamp(pow(e,.6),0.,1.),7.,g); col=mix(uSkyH,uSkyZ,eb);
          float sd=dot(rd,uCS.xyz); col+=uSunC*.25*qz(clamp((sd-.94)/.06,0.,1.),3.,g)*uDay; if(sd>.9993)col=mix(col,vec3(1.,.98,.9),uDay); }
        // the haze toward the horizon: by the distance out from where you stand, in steps
        if(!sky){ float hz=1.-exp(-max(length(pe.xz-uP.xz)-22.,0.)*uHaze); col=mix(col,uSkyH,qz(hz,6.,g)*.9); }
        #ifdef VOL
        // the clouds: marched through their layer (in the isometric view only where the sky shows)
        if(uDay>.01&&(sky||uOrtho<.5)&&abs(rd.y)>.002){ float t0=(uCSE.z-ro.y)/rd.y, t1=(uCSE.w-ro.y)/rd.y, tA=max(min(t0,t1),0.), tB=min(max(t0,t1),min(tEnd,520.));
          if(tB>tA){ const int NS=40; float dt=max((tB-tA)/float(NS),.6), t=tA+dt*g, T=1., B=0., tHit=-1.;
            for(int i=0;i<NS;i++){ if(t>tB||T<.04)break; vec3 p=ro+rd*t; float de=dens(p);
              if(de>.01){ if(tHit<0.)tHit=t; float od=0.; for(int j=0;j<4;j++)od+=dens(p+uCS.xyz*(1.2+float(j)*2.6)); float h=(p.y-uCSE.z)/(uCSE.w-uCSE.z);
                float lit=exp(-od*1.)*(1.-exp(-de*4.)), amb=.04+.28*h, mu=dot(rd,uCS.xyz), ph=.7+.9*pow(max(mu,0.),6.);   // (lit through, the powder at the edge, the silver toward the sun)
                float e=exp(-de*dt*1.6); B+=T*(1.-e)*(lit*ph*1.1+amb); T*=e; }
              t+=dt; }
            float al=1.-T; if(al>.5+(g-.5)*.5){ float bb=B/max(al,.001), k=floor(clamp(bb*4.4+(g-.5)*.3,0.,4.99)); vec3 cc=k<1.?uPal[0]:k<2.?uPal[1]:k<3.?uPal[2]:k<4.?uPal[3]:uPal[4];
              float hz=uOrtho>.5?0.:1.-exp(-tHit*uHaze*.25); col=mix(cc,uSkyH,qz(hz,5.,g)); } } }
        #endif
        // the sun's beams: the air under the clouds marched a few steps, lit where the sun gets through, dark under a cloud; added as light, stepped
        if(uBeam>.001&&abs(rd.y)>.001){ float t0=(0.-ro.y)/rd.y, t1=(uCSE.z-ro.y)/rd.y, tA=max(min(t0,t1),0.), tB=min(max(t0,t1),min(tEnd,tA+140.));
          if(tB>tA){ ${VOL?'const int NB=12;':'const int NB=7;'} float dt=(tB-tA)/float(NB), s=0.;
            for(int i=0;i<NB;i++){ vec3 p=ro+rd*(tA+dt*(float(i)+fract(g*7.13))); s+=1.-cldShadow(p,vec2(0.)); }
            float mu=dot(rd,uCS.xyz), ph=.35+1.4*pow(max(mu,0.),5.), v=s/float(NB)*(1.-exp(-(tB-tA)*.012))*ph*uBeam;
            col+=uSunC*floor(clamp(v,0.,1.)*4.+.5+(g-.5)*.25)/4.; } }
        gl_FragColor=vec4(col,1.); }`};
  for(const k of ['tCS','uCS','uCSD','uCSE'])shader.uniforms[k]=U[k];
  const AP=new ShaderPass(shader); for(const k of ['tCS','uCS','uCSD','uCSE'])AP.uniforms[k]=U[k]; AP.uniforms.tN.value=TN;   // (the pass copies its uniforms: the shared ones given back)
  { const r0=AP.render.bind(AP); AP.render=(ren,wb,rb,dt,mk)=>{ AP.uniforms.tDepth.value=rb.depthTexture; r0(ren,wb,rb,dt,mk); }; }
  for(const rt of [composer.renderTarget1,composer.renderTarget2]){ rt.depthTexture=new THREE.DepthTexture(rt.width,rt.height); rt.dispose(); }   // (the scene's depth kept for the pass)
  composer.insertPass(AP,composer.passes.indexOf(RPASS)+1); CLD.pass=AP; CLD.TH=TH;
  // ---- each frame, after the weather
  const sd=new THREE.Vector3(), c1=new THREE.Color(), t0=performance.now(), drift=new THREE.Vector2();
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt); const W=Object.assign({},WX.now||{cloud:.5,wind:.3,rain:0,storm:0}); if(CLD.amt!=null)W.cloud=CLD.amt; const up=LVL!=='down', inside=!!ROOMS.cur||!up, P=AP.uniforms, t=(performance.now()-t0)/1000;
    if(CLD.off){ AP.enabled=false; if(TH)TH.mesh.visible=false; U.uCS.value.w=0; return; }   // (CLD.off: all of it left out, the old clouds back: a test's A/B in one page)
    WX.clouds.visible=false; AP.enabled=!inside; if(TH)TH.mesh.visible=!inside; if(inside){ U.uCS.value.w=0; return; }
    const sun=CLOCK.sun, day=cl((CLOCK.elev()+4)/14); sd.copy(sun.position).sub(sun.target.position).normalize();
    U.uCS.value.set(sd.x,sd.y,sd.z,(VOL?.72:.7)*cl((CLOCK.elev()-1)/6));
    // the wind carries the clouds and their shadows together
    const sp=(.3+W.wind*1.5)*TILE; drift.set(Math.cos(W.dir||1)*sp*t,Math.sin(W.dir||1)*sp*t);
    U.uCSD.value.z=-drift.x/SCOV; U.uCSD.value.w=-drift.y/SCOV;
    if(VOL){ U.uCSE.value.x=covCut(cl(.08+W.cloud*.62)); U.uCSE.value.y=.45; P.uWind.value.set(-drift.x*.03,0,-drift.y*.03).multiplyScalar(1).add(new THREE.Vector3(0,t*.002,0)); }
    else{ const shown=Math.round(8+W.cloud*(NC-8)); TH.g.instanceCount=ends[shown-1]; U.uCSE.value.x=(1-shown/NC)+.5/255; U.uCSE.value.y=.45; }
    // the palette: the sun's colour on the lit tops, the sky's in the shade, darker in rain and storm; five tones
    const dim=(1-.35*(W.rain||0)-.3*(W.storm||0))*(.25+.75*day), sc=sun.color, sk=scene.background;
    const pal=[[.3,.34,.44],[.47,.52,.62],[.67,.71,.8],[.88,.89,.91],[1.04,1.02,1]];
    pal.forEach((p,i)=>{ const k=i/4, v=P.uPal.value[i]; v.set(p[0]*(1-k*.3+k*.3*sc.r)+sk.r*.12*(1-k),p[1]*(1-k*.3+k*.3*sc.g)+sk.g*.12*(1-k),p[2]*(1-k*.3+k*.3*sc.b)+sk.b*.12*(1-k)).multiplyScalar(dim); });
    P.uSkyZ.value.set(sk.r,sk.g,sk.b); c1.setRGB(.82,.86,.9).multiplyScalar(.2+.8*day).lerp(sk,.35); P.uSkyH.value.set(c1.r,c1.g,c1.b);
    P.uSunC.value.set(sc.r,sc.g,sc.b).multiplyScalar(Math.min(1,sun.intensity/3)*.6);
    P.uP.value.set(pos.x,py,pos.z); P.uDay.value=day; P.uOrtho.value=cam.isOrthographicCamera?1:0; P.uBeam.value=CLD.beam??.6*day*(CLOCK.elev()>0?1:0); P.uHaze.value=CLD.haze??.006*(.4+.6*day);
    cam.updateMatrixWorld(); P.uPI.value.copy(cam.projectionMatrixInverse); P.uCW.value.copy(cam.matrixWorld);
    if(TH){ const u=TH.U; u.uP.value.set(pos.x,py,pos.z); u.uDrift.value.copy(drift); u.uOrtho.value=P.uOrtho.value; u.uCW.value.copy(cam.matrixWorld); u.uSun.value.copy(sd);
      u.uSunV.value.copy(sd).transformDirection(cam.matrixWorldInverse); for(let i=0;i<5;i++)u.uPal.value[i].copy(P.uPal.value[i]); u.uSkyH.value.copy(P.uSkyH.value);
      const f=new THREE.Vector3(); cam.getWorldDirection(f); f.y=0; if(f.lengthSq()<1e-6)f.set(0,0,1); u.uCutF.value.copy(f.normalize()); } }; }
CLD.ren=renderer; window.CLD=CLD;

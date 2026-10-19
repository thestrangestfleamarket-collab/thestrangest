const RAYS={};
{ const cl=v=>Math.max(0,Math.min(1,v)), hs=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); }, N=8, T=TILE;
  const BU={uT:{value:0},uO:{value:.045},uA:{value:.9*T},uC:{value:new THREE.Color(0xfff2cc)}}, bm=new THREE.ShaderMaterial({uniforms:BU,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'uniform float uT,uA; varying vec2 vU; varying float vE; void main(){ vU=uv; vec4 p=vec4(position,1.); vec3 n=normal; \n#ifdef USE_INSTANCING\n p=instanceMatrix*p; n=mat3(instanceMatrix)*n; float ph=instanceMatrix[3].x*.013+instanceMatrix[3].z*.017; p.xz+=vec2(sin(uT*.55+ph)+.4*sin(uT*1.3+ph*3.),cos(uT*.47+ph)+.4*sin(uT*1.1+ph*2.))*uA*uv.y*uv.y; \n#endif\n vec4 m=modelViewMatrix*p; vec3 v=projectionMatrix[3][3]>.5?vec3(0.,0.,1.):normalize(-m.xyz); vE=abs(dot(normalize(mat3(modelViewMatrix)*n),v)); gl_Position=projectionMatrix*m; }',
    fragmentShader:'uniform float uT,uO; uniform vec3 uC; varying vec2 vU; varying float vE; void main(){ float a=vU.x*6.2832, n=sin(a*3.+vU.y*2.-uT*.11)+sin(a*7.-vU.y*5.+uT*.07)*.6+sin(a*13.+uT*.05)*.3, st=n*.2+.8, e=smoothstep(.05,.9,vE), f=smoothstep(0.,.3,vU.y)*(1.-smoothstep(.75,1.,vU.y)); gl_FragColor=vec4(uC*uO*st*f*e*e*2.4,1.); }'});
  { const DN=90, DG=new THREE.BufferGeometry(), dp=new Float32Array(DN*3), ds=new Float32Array(DN); for(let i=0;i<DN;i++){ dp[i*3]=hs(i,1,2)-.5; dp[i*3+1]=hs(i,3,4); dp[i*3+2]=hs(i,5,6)-.5; ds[i]=hs(i,7,8); }
    DG.setAttribute('position',new THREE.BufferAttribute(dp,3)); DG.setAttribute('seed',new THREE.BufferAttribute(ds,1));
    const DU={uT:{value:0},uK:{value:0},uP:{value:new THREE.Vector3()},uBox:{value:12*T},uH:{value:4*T},uPx:{value:2},uB:{value:LFX.sunB},uS:{value:new THREE.Vector3(0,1,0)}};
    const DM=new THREE.ShaderMaterial({uniforms:DU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:'uniform float uT,uK,uBox,uH,uPx; uniform vec3 uP,uS; uniform vec4 uB[8]; attribute float seed; varying float vA; void main(){ vec3 q=position; q.x=fract(q.x+.5+uT*.004*(seed-.3)+sin(uT*.13+seed*40.)*.01)-.5; q.z=fract(q.z+.5+uT*.003*(seed-.6)+cos(uT*.11+seed*30.)*.01)-.5; q.y=fract(q.y+uT*.006*(seed-.5));\n vec3 w=vec3(uP.x+q.x*uBox,uP.y+q.y*uH,uP.z+q.z*uBox); float lit=0.; for(int i=0;i<8;i++){ vec3 v=w-uB[i].xyz; float t=dot(v,uS); if(t>0.&&length(v-uS*t)<uB[i].w*1.4)lit=1.; } vA=uK*lit*(.45+.35*step(.5,fract(seed*7.+uT*.3))); vec4 m=modelViewMatrix*vec4(w,1.); gl_Position=projectionMatrix*m; gl_PointSize=uPx; }',
      fragmentShader:'varying float vA; void main(){ if(vA<.02)discard; gl_FragColor=vec4(vec3(1.,.93,.75)*vA*.7,1.); }'});
    const DP=new THREE.Points(DG,DM); DP.frustumCulled=false; DP.visible=false; scene.add(DP); RAYS.dust=DP; RAYS.DU=DU; }
  const BM=new THREE.InstancedMesh(new THREE.CylinderGeometry(.5,.5,1,6,1,true).translate(0,.5,0),bm,N*2); BM.frustumCulled=false; BM.visible=false; scene.add(BM); RAYS.beams=BM;
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), sv=new THREE.Vector3(), sp=new THREE.Vector3(), sc=new THREE.Vector3(), G=[];
  const bd=new THREE.Vector3(0,1,0), SPOT=[0,1,2,3].map(i=>({x:0,z:0,tx:0,tz:0,t:0,r:(1.5+.7*hs(i,2,3))*T,on:0,o:null})), LEN=26*T;
  const rare=()=>{ const P=[], add=(x,z,o,w)=>{ if(Math.hypot(x-pos.x,z-pos.z)<28*T)P.push({x,z,o,w}); };
    for(const b of (window.BIRDS&&BIRDS.list)||[])if(b.st!=='fly'&&b.st!=='pet')add(b.x,b.z,b,1);
    for(const b of (window.BFLY&&BFLY.list&&BFLY.list())||[])if(b.g)add(b.g.position.x,b.g.position.z,b,1);
    for(const r of (window.FAIRY&&FAIRY.list)||[])add(r.x,r.z,r,3);
    for(const th of UI.things||[])if(/MUSHROOM|MOREL|MOONGLOW|CAP|PUFF|CHANTERELLE|BOLETE/.test(th.name||'')&&th.obj&&th.obj.visible){ th.obj.getWorldPosition(sp); add(sp.x,sp.z,th,2); }
    return P; };
  const roofed=(x,y,z)=>ROOMS.boxes().some(b=>x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&y<b.y1)||FIX.up.some(B=>B[5]>.6*T&&y<B[5]&&x>B[0]&&x<B[3]&&z>B[1]&&z<B[4]), shaded=(x,y,z)=>{ for(let t=0;t<=14*T;t+=1.2*T)if(roofed(x+bd.x*t,y+bd.y*t,z+bd.z*t))return true; return false; };
  const lawn=()=>{ for(let k=0;k<20;k++){ const a=Math.random()*6.283, d=(6+Math.random()*16)*T, x=pos.x+Math.cos(a)*d, z=pos.z+Math.sin(a)*d; if((!window.WEEDS||!WEEDS.inPark||WEEDS.inPark(x,z))&&!shaded(x,(typeof groundY==='function'?groundY(x,z):0)+.1*T,z))return {x,z}; } return null; };
  const spots=dt=>{ G.length=0; if(sv.y<.06)return; let R=null;
    for(const S of SPOT){ S.t-=dt; if(S.t<=0||!S.on){ R=R||rare(); const free=R.filter(c=>!SPOT.some(o=>o!==S&&o.o===c.o)), pick=free.length&&Math.random()<.8?free.sort((a,b)=>b.w-a.w+Math.random()*2-1)[0]:lawn(); S.t=35+Math.random()*30; if(pick){ S.tx=pick.x; S.tz=pick.z; S.o=pick.o||null; if(!S.on){ S.x=S.tx; S.z=S.tz; S.on=1; } } }
      if(S.o){ const o=S.o, ox=o.g?o.g.position.x:o.x, oz=o.g?o.g.position.z:o.z; if(ox!=null&&isFinite(ox)){ S.tx=ox; S.tz=oz; } }
      const k=Math.min(1,dt*.05); S.x+=(S.tx-S.x)*k; S.z+=(S.tz-S.z)*k; if(!S.on)continue;
      const y=typeof groundY==='function'?groundY(S.x,S.z):0; if(shaded(S.x,y+.1*T,S.z))continue; const v=sc.copy(cam.position).sub(sp.set(S.x,y,S.z)), t=v.dot(bd); if(v.lengthSq()-t*t>(S.r*2+4*T)**2)G.push([S.x,y,S.z,S.r,LEN]); } };
  RAYS.spots=SPOT;
  const RT=[composer.renderTarget1,composer.renderTarget2], depthFit=()=>{ for(const t of RT)if(!t.depthTexture||t.depthTexture.image.width!==t.width||t.depthTexture.image.height!==t.height){ if(t.depthTexture)t.depthTexture.dispose(); t.depthTexture=new THREE.DepthTexture(t.width,t.height); t.dispose(); } };
  const U={tDiffuse:{value:null},tDepth:{value:null},uSun:{value:new THREE.Vector2()},uK:{value:0},uAsp:{value:1},uCol:{value:new THREE.Color(1,.86,.62)},uT:{value:0}};
  const P=new ShaderPass({uniforms:U,vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:`uniform sampler2D tDiffuse,tDepth; uniform vec2 uSun; uniform float uK,uAsp,uT; uniform vec3 uCol; varying vec2 vUv;
 float sky(vec2 p){ return step(.9999,texture2D(tDepth,p).x); }
 void main(){ vec4 c=texture2D(tDiffuse,vUv); if(uK<=0.){ gl_FragColor=c; return; }
  vec2 d=(uSun-vUv)/32., p=vUv; float s=0.;
  for(int i=0;i<32;i++){ p+=d; if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)break; s+=sky(p); }
  float r=length((vUv-uSun)*vec2(uAsp,1.)), a=s/32.*uK*clamp(1.-r*.8,0.,1.)*mix(1.,.3,sky(vUv)); vec2 dv=(vUv-uSun)*vec2(uAsp,1.); float an=atan(dv.y,dv.x), tx=.62+.38*step(.45,fract(an*5.7+sin(an*13.+uT*.06)*.35+uT*.012))+.12*sin(an*31.-uT*.09); a*=tx; a=floor(a*5.)/5.;
  gl_FragColor=vec4(c.rgb+uCol*a*.45,c.a); }`});
  composer.insertPass(P,2); RAYS.pass=P; RAYS.s=LFX.sunS;
  const r0=RPASS.render.bind(RPASS); RPASS.render=(r,w,rb,...x)=>{ U.tDepth.value=rb.depthTexture; return r0(r,w,rb,...x); };
  let TT=0; const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt); TT+=dt; BU.uT.value=TT; U.uT.value=TT; RAYS.DU.uT.value=TT;
    const W=typeof WX!=='undefined'&&WX.now||{cloud:.2}, out=LVL==='up'&&SKY.dome.visible, e=CLOCK.elev(), k=out?cl((e-1)/6)*(1-cl((W.cloud-.8)/.15)):0;
    sv.copy(CLOCK.sunV).normalize(); bd.set(sv.x*.3,1,sv.z*.3).normalize(); LFX.sunS.x=bd.x; LFX.sunS.y=bd.y; LFX.sunS.z=bd.z; LFX.sunS.w=k;
    if(k>0)spots(dt);
    BM.visible=k>0&&!ROOMS.cur; { const D=RAYS.DU, dk=W.cloud<.6?k:0; RAYS.dust.visible=dk>0&&!ROOMS.cur; D.uK.value=dk; D.uS.value.copy(bd); D.uP.value.set(pos.x,py,pos.z); D.uPx.value=Math.max(1,Math.round((typeof pxS==='function'?pxS():1))); } if(k>0){ q.setFromUnitVectors(up,bd); for(let i=0;i<N;i++){ const g=G[i], b=LFX.sunB[i];
      if(!g){ b.set(0,-1e5,0,0); m4.makeScale(0,0,0); BM.setMatrixAt(i,m4); BM.setMatrixAt(i+N,m4); continue; }
      b.set(g[0],g[1],g[2],g[3]); sp.set(g[0],g[1],g[2]);
      BM.setMatrixAt(i,m4.compose(sp,q,sc.set(g[3]*2,g[4],g[3]*2))); BM.setMatrixAt(i+N,m4.compose(sp,q,sc.set(g[3]*1.1,g[4],g[3]*1.1))); }
      BM.instanceMatrix.needsUpdate=true; BU.uO.value=.06*k; }
    else for(const b of LFX.sunB)b.set(0,-1e5,0,0);
    U.uK.value=0; if(out&&!ROOMS.cur&&cam.isPerspectiveCamera&&e>-1){ depthFit(); sp.copy(cam.position).addScaledVector(sv,400).project(cam);
      cam.getWorldDirection(sc); if(sc.dot(sv)>0&&sp.z<1){ U.uSun.value.set(sp.x*.5+.5,sp.y*.5+.5); const off=Math.max(Math.abs(sp.x),Math.abs(sp.y)); U.uK.value=cl((e+1)/5)*(1-cl((W.cloud-.85)/.15))*cl((2.2-off)/1.2); U.uAsp.value=cam.aspect||1; } } P.enabled=U.uK.value>0; };
  window.RAYS=RAYS; }

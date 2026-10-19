const RAYS={};
{ const cl=v=>Math.max(0,Math.min(1,v)), hs=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); }, N=8, T=TILE;
  const BU={uT:{value:0},uO:{value:.03},uC:{value:new THREE.Color(0xfff2cc)}}, bm=new THREE.ShaderMaterial({uniforms:BU,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vU; void main(){ vU=uv; vec4 p=vec4(position,1.); \n#ifdef USE_INSTANCING\n p=instanceMatrix*p; \n#endif\n gl_Position=projectionMatrix*modelViewMatrix*p; }',
    fragmentShader:'uniform float uT,uO; uniform vec3 uC; varying vec2 vU; void main(){ float a=vU.x*6.2832, n=sin(a*3.+vU.y*2.-uT*.11)+sin(a*7.-vU.y*5.+uT*.07)*.6+sin(a*13.+uT*.05)*.3, st=floor((n*.25+.75)*3.)/3., f=smoothstep(0.,.25,vU.y)*(1.-smoothstep(.85,1.,vU.y)); gl_FragColor=vec4(uC*uO*st*f*1.8,1.); }'});
  { const DN=90, DG=new THREE.BufferGeometry(), dp=new Float32Array(DN*3), ds=new Float32Array(DN); for(let i=0;i<DN;i++){ dp[i*3]=hs(i,1,2)-.5; dp[i*3+1]=hs(i,3,4); dp[i*3+2]=hs(i,5,6)-.5; ds[i]=hs(i,7,8); }
    DG.setAttribute('position',new THREE.BufferAttribute(dp,3)); DG.setAttribute('seed',new THREE.BufferAttribute(ds,1));
    const DU={uT:{value:0},uK:{value:0},uP:{value:new THREE.Vector3()},uBox:{value:12*T},uH:{value:4*T},uPx:{value:2},uB:{value:LFX.sunB},uS:{value:new THREE.Vector3(0,1,0)}};
    const DM=new THREE.ShaderMaterial({uniforms:DU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:'uniform float uT,uK,uBox,uH,uPx; uniform vec3 uP,uS; uniform vec4 uB[8]; attribute float seed; varying float vA; void main(){ vec3 q=position; q.x=fract(q.x+.5+uT*.004*(seed-.3)+sin(uT*.13+seed*40.)*.01)-.5; q.z=fract(q.z+.5+uT*.003*(seed-.6)+cos(uT*.11+seed*30.)*.01)-.5; q.y=fract(q.y+uT*.006*(seed-.5));\n vec3 w=vec3(uP.x+q.x*uBox,uP.y+q.y*uH,uP.z+q.z*uBox); float lit=0.; for(int i=0;i<8;i++){ vec3 v=w-uB[i].xyz; float t=dot(v,uS); if(t>0.&&length(v-uS*t)<uB[i].w*1.4)lit=1.; } vA=uK*lit*(.45+.35*step(.5,fract(seed*7.+uT*.3))); vec4 m=modelViewMatrix*vec4(w,1.); gl_Position=projectionMatrix*m; gl_PointSize=uPx; }',
      fragmentShader:'varying float vA; void main(){ if(vA<.02)discard; gl_FragColor=vec4(vec3(1.,.93,.75)*vA*.7,1.); }'});
    const DP=new THREE.Points(DG,DM); DP.frustumCulled=false; DP.visible=false; scene.add(DP); RAYS.dust=DP; RAYS.DU=DU; }
  const BM=new THREE.InstancedMesh(new THREE.CylinderGeometry(.5,.5,1,6,1,true).translate(0,.5,0),bm,N*2); BM.frustumCulled=false; BM.visible=false; scene.add(BM); RAYS.beams=BM;
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), sv=new THREE.Vector3(), sp=new THREE.Vector3(), sc=new THREE.Vector3(), G=[];
  let pick=0;
  const spots=()=>{ const L=[], C=WX.cld||[], n=Math.min(C.length,WX.show||C.length), h=Math.hypot(sv.x,sv.z)||1, ox=-sv.z/h, oz=sv.x/h; G.length=0; if(sv.y<.06)return;
    for(let i=0;i<n;i++){ const [cx,cy0,cz,w]=C[i], cy=cy0+(WX.cy||0); for(const s of [-1,1]){ const px=cx+s*ox*w*.62, pz=cz+s*oz*w*.62, k=cy/sv.y, gx=px-sv.x*k, gz=pz-sv.z*k, d=Math.hypot(gx-pos.x,gz-pos.z); if(d<90*T)L.push([d,gx,gz,px,cy,pz,(1.2+hs(i,s,4)*1.6)*T]); } }
    L.sort((u,v)=>u[0]-v[0]); const RB=ROOMS.boxes(), FX=FIX.up, roofed=(x,y,z)=>RB.some(b=>x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&y<b.y1)||FX.some(B=>B[5]>.6*T&&y<B[5]&&x>B[0]&&x<B[3]&&z>B[1]&&z<B[4]), shaded=(x,y,z)=>{ for(let t=0;t<=14*T;t+=1.2*T)if(roofed(x+sv.x*t,y+sv.y*t,z+sv.z*t))return true; return false; };
    for(const [,x,z,px,py,pz,r] of L){ if(G.length>=N)break; const y=typeof groundY==='function'?groundY(x,z):0; if(shaded(x,y+.1*T,z))continue; const v=sc.copy(cam.position).sub(sp.set(x,y,z)), t=v.dot(sv); if(v.lengthSq()-t*t>(r*1.5+3*T)**2)G.push([x,y,z,r,Math.hypot(px-x,py-y,pz-z)]); } };
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
    sv.copy(CLOCK.sunV).normalize(); LFX.sunS.x=sv.x; LFX.sunS.y=sv.y; LFX.sunS.z=sv.z; LFX.sunS.w=k;
    if(k>0&&(pick-=dt)<=0){ pick=.5; spots(); }
    BM.visible=k>0&&!ROOMS.cur; { const D=RAYS.DU, dk=W.cloud<.6?k:0; RAYS.dust.visible=dk>0&&!ROOMS.cur; D.uK.value=dk; D.uS.value.copy(sv); D.uP.value.set(pos.x,py,pos.z); D.uPx.value=Math.max(1,Math.round((typeof pxS==='function'?pxS():1))); } if(k>0){ q.setFromUnitVectors(up,sv); for(let i=0;i<N;i++){ const g=G[i], b=LFX.sunB[i];
      if(!g){ b.set(0,-1e5,0,0); m4.makeScale(0,0,0); BM.setMatrixAt(i,m4); BM.setMatrixAt(i+N,m4); continue; }
      b.set(g[0],g[1],g[2],g[3]); sp.set(g[0],g[1],g[2]);
      BM.setMatrixAt(i,m4.compose(sp,q,sc.set(g[3]*2,g[4],g[3]*2))); BM.setMatrixAt(i+N,m4.compose(sp,q,sc.set(g[3]*1.1,g[4],g[3]*1.1))); }
      BM.instanceMatrix.needsUpdate=true; BU.uO.value=.03*k; }
    else for(const b of LFX.sunB)b.set(0,-1e5,0,0);
    U.uK.value=0; if(out&&!ROOMS.cur&&cam.isPerspectiveCamera&&e>-1){ depthFit(); sp.copy(cam.position).addScaledVector(sv,400).project(cam);
      cam.getWorldDirection(sc); if(sc.dot(sv)>0&&sp.z<1){ U.uSun.value.set(sp.x*.5+.5,sp.y*.5+.5); const off=Math.max(Math.abs(sp.x),Math.abs(sp.y)); U.uK.value=cl((e+1)/5)*(1-cl((W.cloud-.85)/.15))*cl((2.2-off)/1.2); U.uAsp.value=cam.aspect||1; } } P.enabled=U.uK.value>0; };
  window.RAYS=RAYS; }

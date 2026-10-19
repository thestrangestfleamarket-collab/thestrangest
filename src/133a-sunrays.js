const RAYS={};
{ const cl=v=>Math.max(0,Math.min(1,v)), hs=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); }, N=8, T=TILE;
  const bm=new THREE.MeshBasicMaterial({color:0xfff2cc,transparent:true,opacity:.03,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false,toneMapped:false});
  const BM=new THREE.InstancedMesh(new THREE.CylinderGeometry(.5,.5,1,6,1,true).translate(0,.5,0),bm,N*2); BM.frustumCulled=false; BM.visible=false; scene.add(BM); RAYS.beams=BM;
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), sv=new THREE.Vector3(), sp=new THREE.Vector3(), sc=new THREE.Vector3(), G=[];
  let pick=0;
  const spots=()=>{ const L=[], C=WX.cld||[], n=Math.min(C.length,WX.show||C.length), h=Math.hypot(sv.x,sv.z)||1, ox=-sv.z/h, oz=sv.x/h; G.length=0; if(sv.y<.06)return;
    for(let i=0;i<n;i++){ const [cx,cy,cz,w]=C[i]; for(const s of [-1,1]){ const px=cx+s*ox*w*.62, pz=cz+s*oz*w*.62, k=cy/sv.y, gx=px-sv.x*k, gz=pz-sv.z*k, d=Math.hypot(gx-pos.x,gz-pos.z); if(d<90*T)L.push([d,gx,gz,px,cy,pz,(1.2+hs(i,s,4)*1.6)*T]); } }
    L.sort((u,v)=>u[0]-v[0]); for(const [,x,z,px,py,pz,r] of L){ if(G.length>=N)break; const y=typeof groundY==='function'?groundY(x,z):0, v=sc.copy(cam.position).sub(sp.set(x,y,z)), t=v.dot(sv); if(v.lengthSq()-t*t>(r*1.5+3*T)**2)G.push([x,y,z,r,Math.hypot(px-x,py-y,pz-z)]); } };
  const RT=[composer.renderTarget1,composer.renderTarget2], depthFit=()=>{ for(const t of RT)if(!t.depthTexture||t.depthTexture.image.width!==t.width||t.depthTexture.image.height!==t.height){ if(t.depthTexture)t.depthTexture.dispose(); t.depthTexture=new THREE.DepthTexture(t.width,t.height); t.dispose(); } };
  const U={tDiffuse:{value:null},tDepth:{value:null},uSun:{value:new THREE.Vector2()},uK:{value:0},uAsp:{value:1},uCol:{value:new THREE.Color(1,.86,.62)}};
  const P=new ShaderPass({uniforms:U,vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:`uniform sampler2D tDiffuse,tDepth; uniform vec2 uSun; uniform float uK,uAsp; uniform vec3 uCol; varying vec2 vUv;
 float sky(vec2 p){ return step(.9999,texture2D(tDepth,p).x); }
 void main(){ vec4 c=texture2D(tDiffuse,vUv); if(uK<=0.){ gl_FragColor=c; return; }
  vec2 d=(uSun-vUv)/32., p=vUv; float s=0.;
  for(int i=0;i<32;i++){ p+=d; if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)break; s+=sky(p); }
  float r=length((vUv-uSun)*vec2(uAsp,1.)), a=s/32.*uK*clamp(1.-r*.8,0.,1.)*mix(1.,.3,sky(vUv)); a=floor(a*5.)/5.;
  gl_FragColor=vec4(c.rgb+uCol*a*.45,c.a); }`});
  composer.insertPass(P,2); RAYS.pass=P; RAYS.s=LFX.sunS;
  const r0=RPASS.render.bind(RPASS); RPASS.render=(r,w,rb,...x)=>{ U.tDepth.value=rb.depthTexture; return r0(r,w,rb,...x); };
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt);
    const W=typeof WX!=='undefined'&&WX.now||{cloud:.2}, out=LVL==='up'&&SKY.dome.visible, e=CLOCK.elev(), k=out?cl((e-1)/6)*(1-cl((W.cloud-.8)/.15)):0;
    sv.copy(CLOCK.sunV).normalize(); LFX.sunS.x=sv.x; LFX.sunS.y=sv.y; LFX.sunS.z=sv.z; LFX.sunS.w=k;
    if(k>0&&(pick-=dt)<=0){ pick=.5; spots(); }
    BM.visible=k>0; if(k>0){ q.setFromUnitVectors(up,sv); for(let i=0;i<N;i++){ const g=G[i], b=LFX.sunB[i];
      if(!g){ b.set(0,-1e5,0,0); m4.makeScale(0,0,0); BM.setMatrixAt(i,m4); BM.setMatrixAt(i+N,m4); continue; }
      b.set(g[0],g[1],g[2],g[3]); sp.set(g[0],g[1],g[2]);
      BM.setMatrixAt(i,m4.compose(sp,q,sc.set(g[3]*2,g[4],g[3]*2))); BM.setMatrixAt(i+N,m4.compose(sp,q,sc.set(g[3]*1.1,g[4],g[3]*1.1))); }
      BM.instanceMatrix.needsUpdate=true; bm.opacity=.03*k; }
    else for(const b of LFX.sunB)b.set(0,-1e5,0,0);
    U.uK.value=0; if(out&&cam.isPerspectiveCamera&&e>-1){ depthFit(); sp.copy(cam.position).addScaledVector(sv,400).project(cam);
      cam.getWorldDirection(sc); if(sc.dot(sv)>0&&sp.z<1){ U.uSun.value.set(sp.x*.5+.5,sp.y*.5+.5); const off=Math.max(Math.abs(sp.x),Math.abs(sp.y)); U.uK.value=cl((e+1)/5)*(1-cl((W.cloud-.85)/.15))*cl((2.2-off)/1.2); U.uAsp.value=cam.aspect||1; } } };
  window.RAYS=RAYS; }

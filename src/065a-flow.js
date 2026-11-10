// ONE WATER: FLOW is the one simulation every water shares (the shallow-water equations on the graphics card, in metres) in a window round you.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FLOW, FORAGE} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
{ const T=TILE, MPU=.84/T, WU=1/MPU, G=192, SW=48*T, CELL=SW/G, L=CELL*MPU, SNAP=16*CELL, EDGE=10, CAP=1.6, NW=8, DMAX=20;   // the waves feel no more than 20 m of water: deeper (the Hudson's holes) they would outrun a step and blow up
  const waters=[], bed=new Float32Array(G*G*4), bedTex=new THREE.DataTexture(bed,G,G,THREE.RGBAFormat,THREE.FloatType); bedTex.magFilter=bedTex.minFilter=THREE.NearestFilter;
  let RT=null, ty=THREE.HalfFloatType, pend=0, x0=1e9, z0=1e9, live=false, acc=0, quiet=0, rows=0;
  const uRect={value:new THREE.Vector4(0,0,SW,SW)}, uOn={value:0}, uTex={value:null}, uWA={value:Array.from({length:NW},()=>new THREE.Vector4())}, uWB={value:Array.from({length:NW},()=>new THREE.Vector4())}, uNW={value:0};
  window.FLOW=FLOW; Object.assign(FLOW,{waters,rect:uRect,on:uOn,tex:uTex,wa:uWA,wb:uWB,nw:uNW,G,SW,CELL,MPU,WU,drops:[],cur:{x:0,z:0,h:0,u:0,w:0,ok:false},stats:{steps:0,rows:0}});
  // a water: {name, box:[x0,z0,x1,z1], has(x,z), bed(x,z) and rest(x,z) its bed and still surface (world heights), swell (the sea's waves come in at the window's edge), solid(x,z) (posts)}
  FLOW.add=w=>{ waters.push(w); x0=1e9; return w; };
  // how deep the still water is at x,z (world units; 0 on land): the deepest shown water there
  FLOW.depth=(x,z)=>{ let d=0; for(const w of waters)if((!w.shown||w.shown())&&w.has(x,z))d=Math.max(d,w.rest(x,z)-w.bed(x,z)); return d; };
  FLOW.drop=(x,z,r,s)=>{ if(FLOW.drops.length<8)FLOW.drops.push([x,z,r,s*MPU]); };
  const V='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy*2.,0.,1.); }';
  const U={uH:{value:null},uF:{value:null},uBed:{value:bedTex},uTx:{value:1/G},uDt:{value:1/60},uL:{value:L},uCap:{value:CAP},uShift:{value:new THREE.Vector2()},uE:{value:EDGE/G},
    uDrop:{value:Array.from({length:8},()=>new THREE.Vector4())},uN:{value:0},uRect:uRect,uWA:uWA,uWB:uWB,uNW:uNW,uTime:{value:0},uMPU:{value:MPU},uWU:{value:WU}};
  const HEAD=`uniform sampler2D uH,uF,uBed; uniform float uTx,uDt,uL,uCap,uE,uTime,uMPU,uWU; uniform vec2 uShift; uniform vec4 uRect,uDrop[8],uWA[${NW}],uWB[${NW}]; uniform int uN,uNW; varying vec2 vUv;
    bool inG(vec2 u){ return u.x>0.&&u.y>0.&&u.x<1.&&u.y<1.; }
    float sea(vec2 w){ float h=0.; for(int i=0;i<${NW};i++){ if(i>=uNW)break; vec4 a=uWA[i], b=uWB[i]; h+=b.x*sin(a.z*dot(a.xy,w)-a.w*uTime+b.z); } return h*uMPU; }
    float edgeK(vec2 u){ float e=min(min(u.x,1.-u.x),min(u.y,1.-u.y)); return e<uE?pow((uE-e)/uE,2.)*.18:0.; }`;
  const pass=fs=>{ const m=new THREE.ShaderMaterial({uniforms:U,vertexShader:V,fragmentShader:HEAD+fs,depthTest:false,depthWrite:false}); const s=new THREE.Scene(); s.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),m)); return s; };
  // moved: the old state read across by the shift; a new cell starts still (its rest surface), with no flow
  const SHIFTH=pass(`void main(){ vec2 u=vUv+uShift; vec4 B=texture2D(uBed,vUv); gl_FragColor=vec4(inG(u)&&B.a>.5?texture2D(uH,u).r:max(0.,B.g-B.r),0.,0.,1.); }`);
  const SHIFTF=pass(`void main(){ vec2 u=vUv+uShift; gl_FragColor=inG(u)?texture2D(uF,u):vec4(0.); }`);
  // the outflows to -x,+x,-z,+z (m3/s): pushed by the difference in surface height, through the depth that joins two cells (at most CAP, so deep
  // water moves as waves of a few metres do), slowed by the bed's friction; never more than the cell holds
  const FLUX=pass(`float o(vec4 B,float e,float h,vec2 d,float f0){ vec2 n=vUv+d*uTx; if(!inG(n))return 0.; vec4 C=texture2D(uBed,n); if(C.a<.5)return 0.; float en=C.r+texture2D(uH,n).r, df=e-en, hf=clamp(max(e,en)-max(B.r,C.r),0.,uCap);
      if(hf<=1e-4)return 0.; float f=max(0.,f0*.9995+uDt*9.81*hf*df), u=f/(max(hf,.01)*uL); return f/(1.+uDt*.04*abs(u)/max(hf,.05)); }
    void main(){ vec4 B=texture2D(uBed,vUv); float h=texture2D(uH,vUv).r; if(B.a<.5){ gl_FragColor=vec4(0.); return; } vec4 F=texture2D(uF,vUv); float e=B.r+h;
      vec4 f=vec4(o(B,e,h,vec2(-1.,0.),F.x),o(B,e,h,vec2(1.,0.),F.y),o(B,e,h,vec2(0.,-1.),F.z),o(B,e,h,vec2(0.,1.),F.w));
      float s=(f.x+f.y+f.z+f.w)*uDt, v=h*uL*uL; if(s>v)f*=v/s; f*=1.-edgeK(vUv)*.5; gl_FragColor=f; }`);
  // the depth: what flows in less what flows out; the window's rim held to the rest surface (and the sea's swell where a water says so); splashes
  const HGT=pass(`void main(){ vec4 B=texture2D(uBed,vUv); if(B.a<.5){ gl_FragColor=vec4(0.,0.,0.,1.); return; } float h=texture2D(uH,vUv).r; vec4 F=texture2D(uF,vUv);
      float fin=texture2D(uF,vUv-vec2(uTx,0.)).y+texture2D(uF,vUv+vec2(uTx,0.)).x+texture2D(uF,vUv-vec2(0.,uTx)).w+texture2D(uF,vUv+vec2(0.,uTx)).z;
      h+=uDt*(fin-(F.x+F.y+F.z+F.w))/(uL*uL); vec2 w=uRect.xy+vUv*uRect.zw;
      float k=edgeK(vUv); if(k>0.)h=mix(h,max(0.,B.g+(B.b>.5?sea(w):0.)-B.r),k);
      for(int i=0;i<8;i++){ if(i>=uN)break; vec4 d=uDrop[i]; float r=length(w-d.xy); if(r<d.z)h-=d.w*(.5+.5*cos(3.14159*r/d.z)); }
      h=clamp(h,0.,60.); if(!(h==h))h=max(0.,B.g-B.r); gl_FragColor=vec4(h,0.,0.,1.); }`);
  // what the surfaces read: R the surface's rise over the water's rest (world units), G B the flow (m/s), A the depth (m)
  const OUT=pass(`void main(){ vec4 B=texture2D(uBed,vUv); float h=texture2D(uH,vUv).r; if(B.a<.5||h<1e-3){ gl_FragColor=vec4(0.,0.,0.,h); return; } vec4 F=texture2D(uF,vUv);
      float qx=(texture2D(uF,vUv-vec2(uTx,0.)).y-F.x+F.y-texture2D(uF,vUv+vec2(uTx,0.)).x)*.5, qz=(texture2D(uF,vUv-vec2(0.,uTx)).w-F.z+F.w-texture2D(uF,vUv+vec2(0.,uTx)).z)*.5, a=max(h,.05)*uL;
      gl_FragColor=vec4((B.r+h-B.g)*uWU,clamp(qx/a,-6.,6.),clamp(qz/a,-6.,6.),h); }`);
  const CAM=new THREE.Camera(), mk=()=>{ const r=new THREE.WebGLRenderTarget(G,G,{type:ty,format:THREE.RGBAFormat,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false}); r.texture.generateMipmaps=false; return r; };
  const init=renderer=>{ '@later'; if(RT)return; ty=renderer.capabilities.isWebGL2&&renderer.extensions.has('EXT_color_buffer_float')?THREE.FloatType:THREE.HalfFloatType; RT={H:[mk(),mk()],F:[mk(),mk()],O:mk()}; RT.O.texture.magFilter=RT.O.texture.minFilter=THREE.LinearFilter; RT.O.texture.needsUpdate=true; uTex.value=RT.O.texture; };
  const draw=(renderer,s,t)=>{ renderer.setRenderTarget(t); renderer.render(s,CAM); };
  const near=(px,pz)=>waters.filter(w=>!w.off&&w.box[0]<px+SW&&w.box[2]>px-SW&&w.box[1]<pz+SW&&w.box[3]>pz-SW);
  // the bed and rest surface under every cell, from the waters' own shapes; a cell no water claims is a wall
  const fill=(ws,j0,j1,i0,i1)=>{ '@later'; for(let j=j0;j<j1;j++){ const z=z0+(j+.5)*CELL; for(let i=i0;i<i1;i++){ const x=x0+(i+.5)*CELL, o=(j*G+i)*4; let w=null; for(const q of ws)if(q.has(x,z)){ w=q; break; }
        if(!w||w.solid&&w.solid(x,z)){ bed[o]=1e3; bed[o+1]=0; bed[o+2]=0; bed[o+3]=0; continue; } bed[o]=Math.max(w.bed(x,z),w.rest(x,z)-DMAX*WU)*MPU; bed[o+1]=w.rest(x,z)*MPU; bed[o+2]=w.swell?1:0; bed[o+3]=1; } } };
  let reading=false;
  FLOW.step=(renderer,dt,pos)=>{ FLOW.under=false; if(SHARED.LVL!=='up'||!waters.length){ uOn.value=0; live=false; return; }
    const ws=near(pos.x,pos.z); if(!ws.length){ uOn.value=0; live=false; return; } init(renderer);
    const nx=Math.round((pos.x-SW/2)/SNAP)*SNAP, nz=Math.round((pos.z-SW/2)/SNAP)*SNAP;
    if(!live||Math.abs(nx-x0)>SW/2||Math.abs(nz-z0)>SW/2){ x0=nx; z0=nz; rows=0; live=true; uOn.value=0; pend=1; uRect.value.set(x0,z0,SW,SW); }
    if(pend){ const n=Math.min(G-rows,24); fill(ws,rows,rows+n,0,G); rows+=n; FLOW.stats.rows=rows; if(rows<G)return; pend=0; bedTex.needsUpdate=true;   // a new window: its bed laid a few rows a frame, then the water starts still
      U.uShift.value.set(2,2); U.uH.value=RT.H[0].texture; draw(renderer,SHIFTH,RT.H[1]); U.uF.value=RT.F[0].texture; draw(renderer,SHIFTF,RT.F[1]); RT.H.reverse(); RT.F.reverse(); }
    else if(nx!==x0||nz!==z0){ const di=Math.round((nx-x0)/CELL), dj=Math.round((nz-z0)/CELL), old=bed.slice();   // the window follows you: the state moved across, only the new strips' beds worked out
      x0=nx; z0=nz; uRect.value.set(x0,z0,SW,SW);
      for(let j=0;j<G;j++)for(let i=0;i<G;i++){ const si=i+di, sj=j+dj, o=(j*G+i)*4; if(si>=0&&sj>=0&&si<G&&sj<G){ const p=(sj*G+si)*4; bed[o]=old[p]; bed[o+1]=old[p+1]; bed[o+2]=old[p+2]; bed[o+3]=old[p+3]; } else bed[o+3]=-1; }
      for(let j=0;j<G;j++){ let i=0; while(i<G){ if(bed[(j*G+i)*4+3]!==-1){ i++; continue; } let e=i; while(e<G&&bed[(j*G+e)*4+3]===-1)e++; fill(ws,j,j+1,i,e); i=e; } }
      bedTex.needsUpdate=true; U.uShift.value.set(di/G,dj/G); U.uH.value=RT.H[0].texture; draw(renderer,SHIFTH,RT.H[1]); U.uF.value=RT.F[0].texture; draw(renderer,SHIFTF,RT.F[1]); RT.H.reverse(); RT.F.reverse(); }
    const H=1/60; acc=Math.min(acc+dt,3*H); U.uDt.value=H; U.uTime.value=FLOW.time||0;
    while(acc>=H){ acc-=H; U.uN.value=FLOW.drops.length; FLOW.drops.forEach((d,i)=>U.uDrop.value[i].set(...d)); FLOW.drops.length=0;
      U.uH.value=RT.H[0].texture; U.uF.value=RT.F[0].texture; draw(renderer,FLUX,RT.F[1]); RT.F.reverse();
      U.uF.value=RT.F[0].texture; draw(renderer,HGT,RT.H[1]); RT.H.reverse(); FLOW.stats.steps++; }
    U.uH.value=RT.H[0].texture; U.uF.value=RT.F[0].texture; draw(renderer,OUT,RT.O); renderer.setRenderTarget(null); uOn.value=1;
    // the water where you are, for swimming: its rise and its flow (one pixel read back, only while you are in water)
    // asked without waiting for the graphics card (a wait here stalled the whole frame): swimming uses the latest answer, a frame or two old, for up to half a second
    const c=FLOW.cur, now=performance.now(); if(c.ok&&now-c.t>500)c.ok=false;
    if(FLOW.need&&!reading){ const i=Math.floor((pos.x-x0)/CELL), j=Math.floor((pos.z-z0)/CELL); if(i>=0&&j>=0&&i<G&&j<G){ const b=ty===THREE.FloatType?new Float32Array(4):new Uint16Array(4); reading=true;
        const got=()=>{ const v=ty===THREE.FloatType?b:Array.from(b,THREE.DataUtils.fromHalfFloat); c.h=v[0]; c.u=v[1]*WU; c.w=v[2]*WU; c.d=v[3]; c.ok=true; c.t=performance.now(); };
        if(renderer.readRenderTargetPixelsAsync)renderer.readRenderTargetPixelsAsync(RT.O,i,j,1,1,b).then(got,()=>{}).finally(()=>{ reading=false; });
        else { renderer.readRenderTargetPixels(RT.O,i,j,1,1,b); got(); reading=false; } } } FLOW.need=false; };
  // for the checks: the whole window read back once (the largest rise and flow, the wet cells)
  FLOW.peek=renderer=>{ '@later'; if(!RT)return null; const n=G*G*4, b=ty===THREE.FloatType?new Float32Array(n):new Uint16Array(n); renderer.readRenderTargetPixels(RT.O,0,0,G,G,b); const v=ty===THREE.FloatType?b:Float32Array.from(b,THREE.DataUtils.fromHalfFloat);
    let rise=0, sp=0, wet=0, at=null; for(let k=0;k<G*G;k++){ if(v[k*4+3]<1e-3)continue; wet++; rise=Math.max(rise,Math.abs(v[k*4])*MPU); const s=Math.hypot(v[k*4+1],v[k*4+2]); if(s>sp){ sp=s; at=[x0+(k%G+.5)*CELL,z0+((k/G|0)+.5)*CELL]; } }
    return {rise:+rise.toFixed(3),speed:+sp.toFixed(3),wet,at}; };
  // how far you see under water dm metres down (owner, 28 Oct 2026: "gets darker the further down you go, need headlight or ability to see in dark (mushrooms)"): daylight dies
  // with depth; a headlight (EQUIP's light) lights a few metres round you, a glowcap mushroom (FORAGE's dark) lets you see as if near the surface; goggles make the water clear
  FLOW.see=(dm,far)=>{ const day=Math.max(.012,Math.exp(-dm*.09)), glow=!!(FORAGE.S&&FORAGE.S.fx&&FORAGE.S.fx.dark>0), lamp=!!EQUIP.light||!!FLOW.craft, sight=EQUIP.sight||!!FLOW.craft, k=glow?Math.max(day,.6):lamp?Math.max(day,.32):day;   // (FLOW.craft: riding a submersible with its lamps lit, its port your goggles)
    FLOW.under=true; let f=far*(sight?6:1)*(glow?1:lamp?Math.max(day,.4):Math.max(day,.05)); if(sight&&(lamp||glow))f=Math.max(f,18); return {k,far:f}; };   // goggles and a light: some eighteen metres clear even deep down   // murky without goggles, clear through them (owner, 7 Nov 2026)
  FLOW.rest=()=>{ x0=1e9; live=false; uOn.value=0; };
  // a swimmer is carried by the flow where they are
  FLOW.carry=(pos,dt)=>{ FLOW.need=true; const c=FLOW.cur; if(!c.ok)return 0; pos.x+=c.u*dt; pos.z+=c.w*dt; return c.h; };
  // the shared surface sampling for a water's shader: its rise (world units) and slope at p, from FLOW's picture where the window covers it
  FLOW.GLSL=`uniform sampler2D uFlow; uniform vec4 uFlowR; uniform float uFlowOn;
    vec4 flowAt(vec2 p){ vec2 u=(p-uFlowR.xy)/uFlowR.zw; if(uFlowOn<.5||u.x<=0.||u.y<=0.||u.x>=1.||u.y>=1.)return vec4(0.); float e=min(min(u.x,1.-u.x),min(u.y,1.-u.y)); return texture2D(uFlow,u)*clamp(e*40.,0.,1.); }
    vec2 flowSlope(vec2 p){ float e=uFlowR.z/${G}.; return vec2(flowAt(p+vec2(e,0.)).r-flowAt(p-vec2(e,0.)).r,flowAt(p+vec2(0.,e)).r-flowAt(p-vec2(0.,e)).r)/(2.*e); }`;
  FLOW.U={uFlow:uTex,uFlowR:uRect,uFlowOn:uOn};
  SYS.add('water',(renderer,dt,pos)=>FLOW.step(renderer,dt,pos),'flow'); }

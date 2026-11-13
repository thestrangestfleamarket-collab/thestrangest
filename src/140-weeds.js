// THE LAWNS: WEEDS knows where the lawns are, chunk by chunk round you (for the tufts, foragers, birds, butterflies, gardens and fire), and who walks near (the tufts and flower beds part round them).
import {SHARED, THREE} from './003-shx.js';
import {BATCH, NPCS, ONLINE, PARK, POND, pos, ROOMS, W3, WED, WEEDS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, STORE, SYS, TILE} from './006-map-pre.js';
import {GRASS} from './014a-grass.js';
import {CREATS} from './087-npc-creatures.js';

WEEDS.movers=[...Array(8)].map(()=>new THREE.Vector4(0,0,0,0)); WEEDS.UMV={value:WEEDS.movers};
WEEDS.PART=(T,k)=>'{ vec4 w0=modelMatrix*instanceMatrix*vec4(transformed,1.); vec3 dw=vec3(0.); for(int i=0;i<8;i++){ vec4 m=uMv[i]; if(m.w<.5)continue; vec2 d=w0.xz-m.xy; float l=length(d), f=1.-l/m.z; if(f<=0.)continue; f=f*f*(3.-2.*f); dw.xz+=d/max(l,.001)*f*'+(.22*T).toFixed(4)+'; dw.y-=f*'+(.05*T).toFixed(4)+'; } transformed+=inverse(mat3(instanceMatrix))*dw*'+k+'; }';
// things on the ground the lawn must not grow over (rocks, logs, a campfire), each a circle [x, z, r], kept in a grid of 4-tile cells
{ const G=new Map(), C=4*TILE, key=(i,j)=>i+','+j; WEEDS.isOff=(x,z)=>{ const L=G.get(key(Math.floor(x/C),Math.floor(z/C))); if(!L)return false; for(const c of L)if((x-c[0])**2+(z-c[1])**2<c[2]*c[2])return true; return false; };
  WEEDS.keepOff=items=>{ '@later'; for(const it of items){ const r=it[2]; for(let i=Math.floor((it[0]-r)/C);i<=Math.floor((it[0]+r)/C);i++)for(let j=Math.floor((it[1]-r)/C);j<=Math.floor((it[1]+r)/C);j++){ const k=key(i,j); (G.get(k)||G.set(k,[]).get(k)).push(it); }
      if(WEEDS.lawnDrop)WEEDS.lawnDrop([it[0]-r,it[1]-r,it[0]+r,it[1]+r]); } }; }   // only the chunks under each thing look again, not all between them
WEEDS.clear=r=>{ (WEEDS.clr=WEEDS.clr||[]).push(r); if(WEEDS.lawnDrop)WEEDS.lawnDrop(r); };
WEEDS.lawnInit=()=>{ const T=TILE, CS=8*T, N=16, CELL=CS/N, MG=4, W=N+2*MG, MV=WEEDS.movers, hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  // who walks near: you and the nearest walkers, for the things that part round them
  const near=[]; WEEDS.moveTick=()=>{ near.length=0; near.push([pos.x,pos.z,0]); for(const N of NPCS){ if(N.lv!=='up'||N.far||!N.st||!N.g.visible)continue; const small=!!(CREATS&&CREATS.includes(N)), gy=N.ground?N.ground(N.st.x,N.st.z):0; if(N.g.position.y-gy>.35*T)continue; const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z); if(d<14*T)near.push([N.st.x,N.st.z,d,small]); }
    if(ONLINE.others)for(const o of ONLINE.others.values()){ const g=o.fig&&o.fig.g; if(!g||!g.visible||!g.parent)continue; const d=Math.hypot(g.position.x-pos.x,g.position.z-pos.z); if(d<14*T)near.push([g.position.x,g.position.z,d,false]); }
    near.sort((a,b)=>a[2]-b[2]); for(let i=0;i<8;i++){ const n=near[i]; if(n)MV[i].set(n[0],n[1],n[3]?.3*T:.55*T,n[3]?.6:1); else MV[i].w=0; }
    SYS.run('weedsMove'); };
  const skip=o=>!o.userData.landPatch&&(o.isInstancedMesh||o.isSkinnedMesh||o.isPoints||o.isSprite||o.isLine||(o.material&&(o.material.visible===false||o.material.isMeshToonMaterial||o.material.transparent||o.material.depthWrite===false||o.material.side===THREE.BackSide)));
  const CH=new Map(); WEEDS.chunks=CH; const clr=WEEDS.clr||(WEEDS.clr=[]);
  const SS=4, RT=new THREE.WebGLRenderTarget(W*SS,W*SS,{depthBuffer:true}), CAM=new THREE.OrthographicCamera(-CS/2-MG*CELL,CS/2+MG*CELL,CS/2+MG*CELL,-CS/2-MG*CELL,.1,80*T), PIX=new Uint8Array(W*W*SS*SS*4);   // each cell looked at 4x4 times: lawn unless the path covers half of it, so loose edge stones keep their grass
  const VS='varying float vY; void main(){ vec4 w=modelMatrix*vec4(position,1.);'+'\n#ifdef USE_INSTANCING\n w=modelMatrix*instanceMatrix*vec4(position,1.);\n#endif\n vY=w.y; gl_Position=projectionMatrix*viewMatrix*w; }';
  const M0=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ if(vY>'+(1.6*T).toFixed(3)+')discard; gl_FragColor=vec4(0.); }',side:THREE.DoubleSide});   // only low things keep the lawn off: tree crowns and awnings overhead don't
  const M1=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ gl_FragColor=vec4(1.,clamp((vY+.5)/4.,0.,1.),0.,1.); }',side:THREE.DoubleSide});
  const vn=(x,z,s)=>{ const ix=Math.floor(x), iz=Math.floor(z), fx=x-ix, fz=z-iz, u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz), h=(a,b)=>hsh(a/97,b/89,s);
    return (h(ix,iz)*(1-u)+h(ix+1,iz)*u)*(1-v)+(h(ix,iz+1)*(1-u)+h(ix+1,iz+1)*u)*v; };
  const inPark=(x,z,m=0)=>{ if(typeof PARK==='undefined'||PARK.ox==null)return false; const xa=SHARED.BOD.XS(PARK.x0+PARK.ox+m), xb=SHARED.BOD.XS(PARK.x1+PARK.ox-m), za=SHARED.BOD.ZS(PARK.y0+PARK.oy+m), zb=SHARED.BOD.ZS(PARK.y1+PARK.oy-m);
    return x>Math.min(xa,xb)&&x<Math.max(xa,xb)&&z>Math.min(za,zb)&&z<Math.max(za,zb); };
  WEEDS.inPark=inPark;
  const deep=(x,z)=>{ '@later'; if(typeof PARK==='undefined'||PARK.ox==null)return 0; const tx=x/T, tz=z/T, xa=SHARED.BOD.XS(PARK.x0+PARK.ox)/T, xb=SHARED.BOD.XS(PARK.x1+PARK.ox)/T, za=SHARED.BOD.ZS(PARK.y0+PARK.oy)/T, zb=SHARED.BOD.ZS(PARK.y1+PARK.oy)/T;
    return Math.min(tx-Math.min(xa,xb),Math.max(xa,xb)-tx,tz-Math.min(za,zb),Math.max(za,zb)-tz)+10*(vn(tx/11,tz/11,97)-.5); };
  WEEDS.deep=deep;
  WEEDS.mushAt=(x,z)=>vn(x/T/13,z/T/13,311)>.7;
  WEEDS.kindAt=(x,z)=>GRASS.at(x/T,z/T).id;   // the grass kind growing here (GRASS)
  // where the lawn is in one chunk: drawn from above, the land showing through what stands low on it
  // what the shots leave out and the lawns they look for: found once for a batch of chunks (one walk of the scene), set aside, and put back after
  const prep=()=>{ const LW=[MODS.land,typeof POND!=='undefined'?POND.hills:null].filter(Boolean), hid=[];
    scene.traverseVisible(o=>{ if((o.isMesh||o.isPoints||o.isLine||o.isSprite)&&(skip(o)||o.userData.tall))hid.push(o); }); for(const g of [W3.group,...NPCS.map(N=>N.g),...WED.meshes.map(en=>en.me)])if(g&&g.visible)hid.push(g); scene.traverse(o=>{ if(o.visible&&o.userData.landProp)hid.push(o); if(o.visible&&/^grass/.test(o.userData.landPatch))LW.push(o); }); hid.forEach(o=>o.visible=false);
    const lm=LW.map(o=>o.layers.mask); LW.forEach(o=>o.layers.set(5)); const SMp=renderer.shadowMap, sa=SMp.autoUpdate, sn=SMp.needsUpdate; SMp.autoUpdate=false; SMp.needsUpdate=false;   // the shots read no shadows: the sun's maps are not drawn again for them
    return ()=>{ SMp.autoUpdate=sa; SMp.needsUpdate=sn; LW.forEach((o,i)=>o.layers.mask=lm[i]); hid.forEach(o=>o.visible=true); }; };
  const PBO=[], mask=(cx,cz,later)=>{ const x0=cx*CS, z0=cz*CS, back=prep();
    const rt0=renderer.getRenderTarget(), ac=renderer.autoClear, ov=scene.overrideMaterial, cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(), bg=scene.background, fg=scene.fog;
    CAM.position.set(x0+CS/2,40*T,z0+CS/2); CAM.up.set(0,0,-1); CAM.lookAt(x0+CS/2,0,z0+CS/2); CAM.updateMatrixWorld();
    renderer.setRenderTarget(RT); renderer.setClearColor(0,0); scene.background=null; scene.fog=null; renderer.autoClear=false; renderer.clear();
    CAM.layers.set(0); scene.overrideMaterial=M0; renderer.render(scene,CAM); CAM.layers.set(5); scene.overrideMaterial=M1; renderer.render(scene,CAM);
    let job=null; if(later){ const gl=renderer.getContext(), pb=PBO.pop()||gl.createBuffer(); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,pb); gl.bufferData(gl.PIXEL_PACK_BUFFER,PIX.byteLength,gl.STREAM_READ); gl.readPixels(0,0,W*SS,W*SS,gl.RGBA,gl.UNSIGNED_BYTE,0); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null); job={cx,cz,pb,sync:gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0)}; gl.flush(); }
    else renderer.readRenderTargetPixels(RT,0,0,W*SS,W*SS,PIX);
    scene.overrideMaterial=ov; renderer.setRenderTarget(rt0); renderer.autoClear=ac; renderer.setClearColor(cc,ca); scene.background=bg; scene.fog=fg;
    back();
    return job||read(cx,cz,PIX); };
  // several chunks at once (those round you not yet known): one shot of the ground they cover, on the same grid of pixels, cut into each chunk's picture
  let RTM=null, PXM=null; const CAMM=new THREE.OrthographicCamera(-1,1,1,-1,.1,80*T);
  const many=L=>{ let a0=1e9, a1=-1e9, b0=1e9, b1=-1e9; for(const [a,b] of L){ a0=Math.min(a0,a); a1=Math.max(a1,a); b0=Math.min(b0,b); b1=Math.max(b1,b); }
    const na=a1-a0+1, nb=b1-b0+1, PW=(na*N+2*MG)*SS, PH=(nb*N+2*MG)*SS, hx=na*CS/2+MG*CELL, hz=nb*CS/2+MG*CELL, mx=(a0+na/2)*CS, mz=(b0+nb/2)*CS, back=prep();
    if(!RTM)RTM=new THREE.WebGLRenderTarget(PW,PH,{depthBuffer:true}); else if(RTM.width!==PW||RTM.height!==PH)RTM.setSize(PW,PH); if(!PXM||PXM.length<PW*PH*4)PXM=new Uint8Array(PW*PH*4);
    CAMM.left=-hx; CAMM.right=hx; CAMM.top=hz; CAMM.bottom=-hz; CAMM.updateProjectionMatrix(); CAMM.position.set(mx,40*T,mz); CAMM.up.set(0,0,-1); CAMM.lookAt(mx,0,mz); CAMM.updateMatrixWorld();
    const rt0=renderer.getRenderTarget(), ac=renderer.autoClear, ov=scene.overrideMaterial, cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(), bg=scene.background, fg=scene.fog;
    renderer.setRenderTarget(RTM); renderer.setClearColor(0,0); scene.background=null; scene.fog=null; renderer.autoClear=false; renderer.clear();
    CAMM.layers.set(0); scene.overrideMaterial=M0; renderer.render(scene,CAMM); CAMM.layers.set(5); scene.overrideMaterial=M1; renderer.render(scene,CAMM); renderer.readRenderTargetPixels(RTM,0,0,PW,PH,PXM);
    scene.overrideMaterial=ov; renderer.setRenderTarget(rt0); renderer.autoClear=ac; renderer.setClearColor(cc,ca); scene.background=bg; scene.fog=fg; back();
    const out=new Map(), S=W*SS; for(const [a,b,k] of L){ const ox=(a-a0)*N*SS, oy=(b1-b)*N*SS; for(let r=0;r<S;r++)PIX.set(PXM.subarray(((oy+r)*PW+ox)*4,((oy+r)*PW+ox+S)*4),r*S*4); out.set(k,read(a,b,PIX)); }   // rows from the bottom: the far side (larger z) first
    return out; };
  // the picture read into one chunk's lawn
  const read=(cx,cz,PIX)=>{ const x0=cx*CS, z0=cz*CS, G=new Float32Array(W*W), I=new Uint8Array(W*W), F=new Uint16Array(W*W), SQ=[], ci=(i,j)=>(j+MG)*W+i+MG;   // F: each cell's 4x4 looks, a bit each (the lawn to a quarter of a cell, for the tufts)
    for(let r=0;r<W;r++)for(let u=0;u<W;u++){ const i=u-MG, j=N+MG-1-r, x=x0+(i+.5)*CELL, z=z0+(j+.5)*CELL; let n=0, g=0, f=0; for(let b=0;b<SS;b++)for(let a=0;a<SS;a++){ const k=((r*SS+b)*W*SS+u*SS+a)*4; if(PIX[k]>=128){ n++; g+=PIX[k+1]; f|=1<<((SS-1-b)*SS+a); } }
      if(!n||clr.some(q=>x>q[0]&&x<q[2]&&z>q[1]&&z<q[3])||WEEDS.isOff(x,z))continue; F[ci(i,j)]=f; if(n*2<SS*SS)continue; I[ci(i,j)]=1; G[ci(i,j)]=g/n/255*4-.5; }
    for(let j=0;j<N;j+=2)for(let i=0;i<N;i+=2){ const c=ci(i,j); if(I[c])SQ.push(x0+(i+1)*CELL,G[c],z0+(j+1)*CELL); }
    return {I,G,F,SQ,x0,z0,N,CELL,MG}; };
  WEEDS.CS=CS;
  // each chunk's lawn is drawn from above once and kept (BAKED), not drawn again each time you come back; a lawn edit or a chunk still being painted clears it
  const BAKED=new Map(); WEEDS.baked=BAKED;
  const painting=(x0,z0)=>BATCH.queues.some(q=>q.jobs.some(j=>j.x1>x0-CS&&j.x0<x0+2*CS&&j.z1>z0-CS&&j.z0<z0+2*CS));
  const keep=(cx,cz,m0)=>{ const k=cx+','+cz, m=m0.I.some(Boolean)?m0:null; if(m){ m.sq=m.SQ; m.top=(x,y,z)=>SHARED.groundY(x,z); } if(!painting(cx*CS,cz*CS)){ BAKED.set(k,m); if(BAKED.size>600)BAKED.delete(BAKED.keys().next().value); } return m; };
  const build=(cx,cz)=>{ const k=cx+','+cz; return BAKED.has(k)?BAKED.get(k):keep(cx,cz,mask(cx,cz)); };
  // a chunk ahead of you is drawn from above and its picture fetched without waiting for the graphics card: it is taken up a frame or two later (WAIT), the page never stalls on it
  const WAIT=new Map(); let epoch=0; const PX2=new Uint8Array(W*W*SS*SS*4);
  const ask=(cx,cz,k)=>{ const j=mask(cx,cz,true); j.k=k; j.ep=epoch; WAIT.set(k,j); };
  const collect=()=>{ if(!WAIT.size)return; const gl=renderer.getContext();
    for(const [k,j] of [...WAIT]){ const st=gl.clientWaitSync(j.sync,0,0); if(st===gl.TIMEOUT_EXPIRED)continue; WAIT.delete(k); gl.deleteSync(j.sync);
      if(st!==gl.WAIT_FAILED&&j.ep===epoch&&!CH.has(k)){ gl.bindBuffer(gl.PIXEL_PACK_BUFFER,j.pb); gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,PX2); gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null); const gb=keep(j.cx,j.cz,read(j.cx,j.cz,PX2)); CH.set(k,gb); if(gb)SYS.run('weedsAdd',k,gb); }
      PBO.push(j.pb); } };
  const drop=k=>{ CH.delete(k); SYS.run('weedsDrop',k); };
  WEEDS.top=(x,z)=>{ const k=Math.floor(x/CS)+','+Math.floor(z/CS); if(!CH.has(k))return undefined; const me=CH.get(k); if(!me)return null; const i=Math.floor((x-me.x0)/CELL), j=Math.floor((z-me.z0)/CELL); if(i<0||j<0||i>=N||j>=N)return null; const c=(j+MG)*W+i+MG; return me.I[c]?SHARED.groundY(x,z):null; };
  WEEDS.fine=(x,z)=>{ const me=CH.get(Math.floor(x/CS)+','+Math.floor(z/CS)); if(!me)return me===null?null:undefined; const u=(x-me.x0)/CELL, v=(z-me.z0)/CELL, i=Math.floor(u), j=Math.floor(v); if(i<0||j<0||i>=N||j>=N)return null;
    return me.F[(j+MG)*W+i+MG]>>(Math.floor((v-j)*SS)*SS+Math.floor((u-i)*SS))&1?SHARED.groundY(x,z):null; };
  WEEDS.lawnDrop=r=>{ const hit=k=>{ const [a,b]=k.split(',').map(Number); return r[2]>a*CS-MG*CELL&&r[0]<(a+1)*CS+MG*CELL&&r[3]>b*CS-MG*CELL&&r[1]<(b+1)*CS+MG*CELL; }; for(const k of [...BAKED.keys()])if(hit(k))BAKED.delete(k); for(const k of [...CH.keys()])if(hit(k))drop(k); epoch++; };
  let busy=0, next=0; WEEDS.lawnTick=()=>{ if(SHARED.LVL!=='up'||(ROOMS&&ROOMS.cur)||STORE.rooms&&STORE.rooms.some(R=>R.inside(pos.x,pos.z)))return; const pcx=Math.floor(pos.x/CS), pcz=Math.floor(pos.z/CS); collect();
    for(const k of [...CH.keys()]){ const [a,b]=k.split(',').map(Number); if(Math.max(Math.abs(a-pcx),Math.abs(b-pcz))>4)drop(k); }
    const add=(a,b,k)=>{ const gb=build(a,b); CH.set(k,gb); if(gb)SYS.run('weedsAdd',k,gb); };
    { const L=[], need=[]; for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){ const k=(pcx+a)+','+(pcz+b); if(CH.has(k))continue; L.push([pcx+a,pcz+b,k]); if(!BAKED.has(k))need.push([pcx+a,pcz+b,k]); }
      const shot=need.length?many(need):null; for(const [a,b,k] of L){ const gb=BAKED.has(k)?BAKED.get(k):keep(a,b,shot.get(k)); CH.set(k,gb); if(gb)SYS.run('weedsAdd',k,gb); } }   // all that can be on screen, at once, so no lawn shows half built
    let best=null, bd=1e9; for(let b=-3;b<=3;b++)for(let a=-3;a<=3;a++){ const k=(pcx+a)+','+(pcz+b); if(CH.has(k)||WAIT.has(k))continue; const d=a*a+b*b; if(d<bd){ bd=d; best=[pcx+a,pcz+b,k]; } }
    if(best&&WAIT.size<2&&performance.now()>=next){ const t0=performance.now(); if(BAKED.has(best[2]))add(...best); else ask(...best); busy=performance.now()-t0; WEEDS.busy=busy; next=performance.now()+Math.max(120,busy*3); } };
  SYS.add('life',(dt)=>{ WEEDS.lawnTick(); WEEDS.moveTick(); },'140-weeds'); };

// THE LAWNS: WEEDS knows where the lawns are, chunk by chunk round you (for the tufts, foragers, birds, butterflies, gardens and fire), and who walks near (the tufts and flower beds part round them).
import {SHARED, THREE} from './003-shx.js';
import {NPCS, ONLINE, PARK, POND, pos, ROOMS, W3, WED, WEEDS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, STORE, SYS, TILE} from './006-map-pre.js';

WEEDS.movers=[...Array(8)].map(()=>new THREE.Vector4(0,0,0,0)); WEEDS.UMV={value:WEEDS.movers};
WEEDS.PART=(T,k)=>'{ vec4 w0=modelMatrix*instanceMatrix*vec4(transformed,1.); vec3 dw=vec3(0.); for(int i=0;i<8;i++){ vec4 m=uMv[i]; if(m.w<.5)continue; vec2 d=w0.xz-m.xy; float l=length(d), f=1.-l/m.z; if(f<=0.)continue; f=f*f*(3.-2.*f); dw.xz+=d/max(l,.001)*f*'+(.22*T).toFixed(4)+'; dw.y-=f*'+(.05*T).toFixed(4)+'; } transformed+=inverse(mat3(instanceMatrix))*dw*'+k+'; }';
WEEDS.clear=r=>{ (WEEDS.clr=WEEDS.clr||[]).push(r); if(WEEDS.lawnDrop)WEEDS.lawnDrop(r); };
WEEDS.lawnInit=()=>{ const T=TILE, CS=8*T, N=16, CELL=CS/N, MG=4, W=N+2*MG, MV=WEEDS.movers, hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  // who walks near: you and the nearest walkers, for the things that part round them
  const near=[]; WEEDS.moveTick=()=>{ near.length=0; near.push([pos.x,pos.z,0]); for(const N of NPCS){ if(N.lv!=='up'||N.far||!N.st||!N.g.visible)continue; const small=!!(window.CREATS&&CREATS.includes(N)), gy=N.ground?N.ground(N.st.x,N.st.z):0; if(N.g.position.y-gy>.35*T)continue; const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z); if(d<14*T)near.push([N.st.x,N.st.z,d,small]); }
    if(ONLINE.others)for(const o of ONLINE.others.values()){ const g=o.fig&&o.fig.g; if(!g||!g.visible||!g.parent)continue; const d=Math.hypot(g.position.x-pos.x,g.position.z-pos.z); if(d<14*T)near.push([g.position.x,g.position.z,d,false]); }
    near.sort((a,b)=>a[2]-b[2]); for(let i=0;i<8;i++){ const n=near[i]; if(n)MV[i].set(n[0],n[1],n[3]?.3*T:.55*T,n[3]?.6:1); else MV[i].w=0; }
    SYS.run('weedsMove'); };
  const skip=o=>!o.userData.landPatch&&(o.isInstancedMesh||o.isSkinnedMesh||o.isPoints||o.isSprite||o.isLine||(o.material&&(o.material.visible===false||o.material.isMeshToonMaterial||o.material.transparent||o.material.depthWrite===false||o.material.side===THREE.BackSide)));
  const CH=new Map(); WEEDS.chunks=CH; const clr=WEEDS.clr||(WEEDS.clr=[]);
  const SS=4, RT=new THREE.WebGLRenderTarget(W*SS,W*SS,{depthBuffer:true}), CAM=new THREE.OrthographicCamera(-CS/2-MG*CELL,CS/2+MG*CELL,CS/2+MG*CELL,-CS/2-MG*CELL,.1,80*T), PIX=new Uint8Array(W*W*SS*SS*4);   // each cell looked at 4x4 times: lawn unless the path covers half of it, so loose edge stones keep their grass
  const VS='varying float vY; void main(){ vec4 w=modelMatrix*vec4(position,1.);'+'\n#ifdef USE_INSTANCING\n w=modelMatrix*instanceMatrix*vec4(position,1.);\n#endif\n vY=w.y; gl_Position=projectionMatrix*viewMatrix*w; }';
  const M0=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ if(vY>'+(1.6*T).toFixed(3)+')discard; gl_FragColor=vec4(0.); }',side:THREE.DoubleSide});   // only low things keep the lawn off: tree crowns and awnings overhead don't
  const M1=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ gl_FragColor=vec4(1.,clamp((vY+.5)/4.,0.,1.),0.,1.); }',side:THREE.DoubleSide});
  const PS=24*T, KINDS=['flat','roll','little','big','giant','bigflat','tuft'];
  const vn=(x,z,s)=>{ const ix=Math.floor(x), iz=Math.floor(z), fx=x-ix, fz=z-iz, u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz), h=(a,b)=>hsh(a/97,b/89,s);
    return (h(ix,iz)*(1-u)+h(ix+1,iz)*u)*(1-v)+(h(ix,iz+1)*(1-u)+h(ix+1,iz+1)*u)*v; };
  const WK=[3,2,2,1.5,1,1.5,3], WS=WK.reduce((a,b)=>a+b,0), pickK=r=>{ r*=WS; for(let i=0;i<WK.length;i++)if((r-=WK[i])<0)return KINDS[i]; return 'flat'; };
  const inPark=(x,z,m=0)=>{ if(typeof PARK==='undefined'||PARK.ox==null)return false; const xa=SHARED.BOD.XS(PARK.x0+PARK.ox+m), xb=SHARED.BOD.XS(PARK.x1+PARK.ox-m), za=SHARED.BOD.ZS(PARK.y0+PARK.oy+m), zb=SHARED.BOD.ZS(PARK.y1+PARK.oy-m);
    return x>Math.min(xa,xb)&&x<Math.max(xa,xb)&&z>Math.min(za,zb)&&z<Math.max(za,zb); };
  WEEDS.inPark=inPark;
  const deep=(x,z)=>{ '@later'; if(typeof PARK==='undefined'||PARK.ox==null)return 0; const tx=x/T, tz=z/T, xa=SHARED.BOD.XS(PARK.x0+PARK.ox)/T, xb=SHARED.BOD.XS(PARK.x1+PARK.ox)/T, za=SHARED.BOD.ZS(PARK.y0+PARK.oy)/T, zb=SHARED.BOD.ZS(PARK.y1+PARK.oy)/T;
    return Math.min(tx-Math.min(xa,xb),Math.max(xa,xb)-tx,tz-Math.min(za,zb),Math.max(za,zb)-tz)+10*(vn(tx/11,tz/11,97)-.5); };
  WEEDS.deep=deep;
  const patch=(x,z)=>{ const k=patch0(x,z); if(k==='flat'||k==='tuft')return k; const d=inPark(x,z)?deep(x,z):0;
    if(d<14)return k==='roll'||k==='bigflat'?'flat':'tuft'; if(d<28&&(k==='big'||k==='giant'))return k==='big'?'little':'roll'; return k; };
  WEEDS.mushAt=(x,z)=>vn(x/T/13,z/T/13,311)>.7;
  const patch0=(x,z)=>{ const tx=x/T, tz=z/T, wx=tx+16*(vn(tx/18,tz/18,91)-.5)+5*(vn(tx/6,tz/6,93)-.5), wz=tz+16*(vn(tx/18,tz/18,92)-.5)+5*(vn(tx/6,tz/6,94)-.5), PSt=PS/T, gx=Math.floor(wx/PSt), gz=Math.floor(wz/PSt);
    let d1=1e18, d2=1e18, k1='flat', k2='flat'; for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){ const a=gx+i, b=gz+j, px=(a+hsh(a,b,71))*PSt, pz=(b+hsh(b,a,72))*PSt, d=(wx-px)**2+(wz-pz)**2, k=pickK(hsh(a,b,73));
      if(d<d1){ d2=d1; k2=k1; d1=d; k1=k; } else if(d<d2){ d2=d; k2=k; } }
    let kind=Math.sqrt(d2)-Math.sqrt(d1)<3.5*hsh(tx*2,tz*2,95)?k2:k1;
    const isl=vn(tx/2.6,tz/2.6,96); if(isl>.8)kind=kind==='tuft'?'flat':'tuft';
    return kind; };
  WEEDS.kindAt=patch;
  // where the lawn is in one chunk: drawn from above, the land showing through what stands low on it
  const mask=(cx,cz)=>{ const x0=cx*CS, z0=cz*CS, LW=[MODS.land,typeof POND!=='undefined'?POND.hills:null].filter(Boolean), hid=[];
    scene.traverseVisible(o=>{ if((o.isMesh||o.isPoints||o.isLine||o.isSprite)&&skip(o))hid.push(o); }); for(const g of [W3.group,...NPCS.map(N=>N.g),...WED.meshes.map(en=>en.me)])if(g&&g.visible)hid.push(g); scene.traverse(o=>{ if(o.visible&&o.userData.landProp)hid.push(o); if(o.visible&&/^grass/.test(o.userData.landPatch))LW.push(o); }); hid.forEach(o=>o.visible=false);
    const lm=LW.map(o=>o.layers.mask); LW.forEach(o=>o.layers.set(5));
    const rt0=renderer.getRenderTarget(), ac=renderer.autoClear, ov=scene.overrideMaterial, cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(), bg=scene.background, fg=scene.fog;
    CAM.position.set(x0+CS/2,40*T,z0+CS/2); CAM.up.set(0,0,-1); CAM.lookAt(x0+CS/2,0,z0+CS/2); CAM.updateMatrixWorld();
    renderer.setRenderTarget(RT); renderer.setClearColor(0,0); scene.background=null; scene.fog=null; renderer.autoClear=false; renderer.clear();
    CAM.layers.set(0); scene.overrideMaterial=M0; renderer.render(scene,CAM); CAM.layers.set(5); scene.overrideMaterial=M1; renderer.render(scene,CAM);
    renderer.readRenderTargetPixels(RT,0,0,W*SS,W*SS,PIX);
    scene.overrideMaterial=ov; renderer.setRenderTarget(rt0); renderer.autoClear=ac; renderer.setClearColor(cc,ca); scene.background=bg; scene.fog=fg;
    LW.forEach((o,i)=>o.layers.mask=lm[i]); hid.forEach(o=>o.visible=true);
    const G=new Float32Array(W*W), I=new Uint8Array(W*W), F=new Uint16Array(W*W), SQ=[], ci=(i,j)=>(j+MG)*W+i+MG;   // F: each cell's 4x4 looks, a bit each (the lawn to a quarter of a cell, for the tufts)
    for(let r=0;r<W;r++)for(let u=0;u<W;u++){ const i=u-MG, j=N+MG-1-r, x=x0+(i+.5)*CELL, z=z0+(j+.5)*CELL; let n=0, g=0, f=0; for(let b=0;b<SS;b++)for(let a=0;a<SS;a++){ const k=((r*SS+b)*W*SS+u*SS+a)*4; if(PIX[k]>=128){ n++; g+=PIX[k+1]; f|=1<<((SS-1-b)*SS+a); } }
      if(!n||clr.some(q=>x>q[0]&&x<q[2]&&z>q[1]&&z<q[3]))continue; F[ci(i,j)]=f; if(n*2<SS*SS)continue; I[ci(i,j)]=1; G[ci(i,j)]=g/n/255*4-.5; }
    for(let j=0;j<N;j+=2)for(let i=0;i<N;i+=2){ const c=ci(i,j); if(I[c])SQ.push(x0+(i+1)*CELL,G[c],z0+(j+1)*CELL); }
    return {I,G,F,SQ,x0,z0,N,CELL,MG}; };
  WEEDS.CS=CS;
  const build=(cx,cz)=>{ const m=mask(cx,cz); if(!m.I.some(Boolean))return null; m.sq=m.SQ; m.top=(x,y,z)=>SHARED.groundY(x,z); return m; };
  const drop=k=>{ CH.delete(k); SYS.run('weedsDrop',k); };
  WEEDS.top=(x,z)=>{ const k=Math.floor(x/CS)+','+Math.floor(z/CS); if(!CH.has(k))return undefined; const me=CH.get(k); if(!me)return null; const i=Math.floor((x-me.x0)/CELL), j=Math.floor((z-me.z0)/CELL); if(i<0||j<0||i>=N||j>=N)return null; const c=(j+MG)*W+i+MG; return me.I[c]?SHARED.groundY(x,z):null; };
  WEEDS.fine=(x,z)=>{ const me=CH.get(Math.floor(x/CS)+','+Math.floor(z/CS)); if(!me)return me===null?null:undefined; const u=(x-me.x0)/CELL, v=(z-me.z0)/CELL, i=Math.floor(u), j=Math.floor(v); if(i<0||j<0||i>=N||j>=N)return null;
    return me.F[(j+MG)*W+i+MG]>>(Math.floor((v-j)*SS)*SS+Math.floor((u-i)*SS))&1?SHARED.groundY(x,z):null; };
  WEEDS.lawnDrop=r=>{ SYS.run('lawnEdit',r); for(const k of [...CH.keys()]){ const [a,b]=k.split(',').map(Number); if(r[2]>a*CS-MG*CELL&&r[0]<(a+1)*CS+MG*CELL&&r[3]>b*CS-MG*CELL&&r[1]<(b+1)*CS+MG*CELL)drop(k); } };
  let busy=0, next=0; WEEDS.lawnTick=()=>{ if(SHARED.LVL!=='up'||(ROOMS&&ROOMS.cur)||STORE.rooms&&STORE.rooms.some(R=>R.inside(pos.x,pos.z)))return; const pcx=Math.floor(pos.x/CS), pcz=Math.floor(pos.z/CS);
    for(const k of [...CH.keys()]){ const [a,b]=k.split(',').map(Number); if(Math.max(Math.abs(a-pcx),Math.abs(b-pcz))>4)drop(k); }
    const add=(a,b,k)=>{ const gb=build(a,b); CH.set(k,gb); if(gb)SYS.run('weedsAdd',k,gb); };
    for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){ const k=(pcx+a)+','+(pcz+b); if(!CH.has(k))add(pcx+a,pcz+b,k); }   // all that can be on screen, at once, so no lawn shows half built
    let best=null, bd=1e9; for(let b=-3;b<=3;b++)for(let a=-3;a<=3;a++){ const k=(pcx+a)+','+(pcz+b); if(CH.has(k))continue; const d=a*a+b*b; if(d<bd){ bd=d; best=[pcx+a,pcz+b,k]; } }
    if(best&&performance.now()>=next){ const t0=performance.now(); add(...best); busy=performance.now()-t0; WEEDS.busy=busy; next=performance.now()+Math.max(120,busy*3); } };
  SYS.add('life',(dt)=>{ WEEDS.lawnTick(); WEEDS.moveTick(); },'140-weeds'); };

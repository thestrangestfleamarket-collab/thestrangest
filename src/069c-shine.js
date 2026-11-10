// THE SHINE: SHINE adds street lamps, porch lights, neon flicker and wet reflections to the street.
import {SHARED, THREE} from './003-shx.js';
import {BLK, CLOCK, DRESS, LITE, pos, WED, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, lamps, LFX, MODS, NEONS, OUT, STORE, SYS, TILE, TURN, WP, WROW} from './006-map-pre.js';
import {TLX} from './069-dress.js';
const SHINE=window.SHINE={src:[],porch:[]};
{ const MS=[], M=1/.84*TILE, G=(x,z)=>SHARED.groundY(x,z), V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), Y1=V(0,1,0), cc=new THREE.Color();
  const lat=(pr,n=8)=>new THREE.LatheGeometry(pr.map(([r,y])=>new THREE.Vector2(r*M,y*M)),n);
  const flu=g=>{ const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i), f=Math.cos(Math.atan2(z,x)*8)>0?1:.8; p.setX(i,x*f); p.setZ(i,z*f); } return g; };
  const tube=(P,r)=>new THREE.TubeGeometry(new THREE.CubicBezierCurve3(...P.map(p=>V(p[0]*M,p[1]*M,(p[2]||0)*M))),6,r*M,4);
  const box=(x,y,z,a,b,c)=>new THREE.BoxGeometry(a*M,b*M,c*M).translate(x*M,y*M,z*M);
  const mrg=gs=>{ const A=gs.map(g=>(g.index?g.toNonIndexed():g).attributes.position.array), P=new Float32Array(A.reduce((n,a)=>n+a.length,0)); let o=0; for(const a of A){ P.set(a,o); o+=a.length; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.computeVertexNormals(); return g; };
  const inst=(geo,n,col,basic)=>{ const me=new THREE.InstancedMesh(geo,basic||new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),Math.max(1,n)); me.count=0; me.col=new THREE.Color(col); me.castShadow=!basic; me.receiveShadow=!basic; scene.add(me); MS.push(me); return me; };
  const put=(me,x,y,z,a,o=0,k=1)=>{ q.setFromAxisAngle(Y1,a); me.setMatrixAt(me.count,m4.compose(V(x+Math.cos(a)*o,y,z-Math.sin(a)*o),q,V(k,k,k))); me.setColorAt(me.count,me.col); return me.count++; };
  // CH(geo,col,name): put(x,y,z,a,o,k,{the world editor's pivot, sol, fix, follow}) — each put one thing in the world editor
  const CH=(geo,col,name)=>{ const L=[]; return {put:(...p)=>L.push(p),done(){ const by=new Map(), out=[]; for(const p of L){ const k=Math.floor(p[0]/36)+','+Math.floor(p[2]/36); if(!by.has(k))by.set(k,[]); by.get(k).push(p); }
    for(const ps of by.values()){ const me=inst(geo,ps.length,col); for(const p of ps)put(me,...p); me.computeBoundingSphere(); out.push(me); if(name)WED.meshes.push({place:'street',me,items:ps.map(p=>Object.assign({k:name,x:p[0],y:p[1],z:p[2]},p[6]))}); } return out; }}; };
  const arm=(L,y)=>[tube([[.05,y-.76],[.1,y+.04],[L*.35,y+.26],[L-.3,y+.12]],.055),tube([[.08,y-1.26],[.12,y-.46],[L*.27,y-.11],[L*.58,y+.12]],.025)];
  const HOUS=mrg([lat([[0,.2],[.14,.18],[.25,.12],[.3,.04],[.31,0]],8),lat([[.31,0],[.335,-.03],[.335,-.055],[.25,-.055]],8),box(0,.2,0,.5,.04,.05),...[-.14,.14].map(d=>box(d/1.45,.16,0,.035,.06,.28))].map(g=>g.scale(1.45,1,1)));
  const LENS=lat([[0,-.17],[.14,-.15],[.22,-.08],[.25,-.02],[.25,0],[0,0]],8).scale(1.4,1,1);
  const SLB=mrg([lat([[0,0],[.3,0],[.3,.05],[.26,.08],[.26,.13],[.21,.17],[.2,.48],[.23,.53],[.23,.58],[.16,.64],[.15,.9],[.18,.94],[.18,.98],[0,1.02]],8),
    flu(lat([[.105,1],[.07,5.3]],16)),lat([[.09,2.4],[.13,2.45],[.13,2.52],[.09,2.56]],8),lat([[.06,5.3],[.095,5.33],[.095,5.42],[0,5.47]],8),...arm(1.3,5.86)]);
  const D=DRESS, PO=D.poles||[], hd=D.heads, LAMP=new THREE.Color(1,.86,.62), PORCH=new THREE.Color(1,.78,.5);
  hd.material.color.setRGB(1,1,1); hd.geometry=LENS; D.lant.geometry=lat([[0,-.2],[.16,-.2],[.16,-.18],[0,-.17]],10);
  const body=CH(SLB,0x2c3631,'street lamp'), hous=CH(HOUS,0x8a9296,'street lamp'), HI=[], pl=L=>{ const e=L&&D.pools&&D.pools.find(e=>e[0]===L); return e&&e[4]?[L,e[4]]:L?[L]:[]; };
  const halo=(c,s,col,L,o={})=>SHINE.src.push(Object.assign({c,s,col,L,gy:G(c.x,c.z),k:-1},o));
  for(const P of PO){ if(P.corner)continue; const y0=P.y-5.45*M, a=P.ax==='x'?(P.d>0?0:Math.PI):-P.d*Math.PI/2, hx=P.x+Math.cos(a)*1.3*M, hz=P.z-Math.sin(a)*1.3*M;
    body.put(P.x,y0,P.z,a,0,1,{sol:P.sol,fix:P.fix,follow:pl(P.L)}); hous.put(P.x,y0+5.86*M,P.z,a,1.3*M,1,{y:y0}); HI[P.h]={k:'street lamp',x:P.x,y:y0,z:P.z}; q.setFromAxisAngle(Y1,a); hd.setMatrixAt(P.h,m4.compose(V(hx,y0+5.82*M,hz),q,V(1,1,1)));
    if(P.L){ P.L.position.set(hx,y0+5.76*M,hz); const e=D.pools.find(e=>e[0]===P.L); if(e){ e[1]=hx; e[2]=hz; e[4].position.x=hx; e[4].position.z=hz; } }
    }
  if(D.corner){ const {x,z,y}=D.corner, ay=8.05, P=PO.find(p=>p.corner), cor=CH(mrg([lat([[0,0],[.4,0],[.4,.07],[.34,.1],[.34,.17],[.28,.22],[.26,.6],[.3,.65],[.3,.72],[.21,.8],[.19,1.1],[.23,1.15],[.23,1.2],[0,1.25]],8),
      flu(lat([[.13,1.2],[.085,8.1]],16)),lat([[.11,3],[.16,3.06],[.16,3.14],[.11,3.2]],8),lat([[.08,8.1],[.13,8.14],[.13,8.26],[.06,8.3],[0,8.5]],8),
      ...[0,1].flatMap(k=>arm(2.7,ay).map(g=>g.rotateY(k?0:Math.PI/2)))]),0x2c3631,'street lamp');
    cor.put(x,y,z,0,0,1,{sol:P.sol,fix:P.fix,follow:[...pl(P.L),...pl(P.L2)]}); cor.done(); [[Math.PI/2,P.h,P.L],[0,P.h2,P.L2]].forEach(([a,h,L])=>{ const hx=x+Math.cos(a)*2.7*M, hz=z-Math.sin(a)*2.7*M; hous.put(x,y+ay*M,z,a,2.7*M,1,{y}); HI[h]={k:'street lamp',x,y,z};
      hd.setMatrixAt(h,m4.compose(V(hx,y+(ay-.04)*M,hz),q.setFromAxisAngle(Y1,a),V(1,1,1))); if(L)L.position.set(hx,y+(ay-.1)*M,hz); }); }
  body.done(); hous.done(); hd.instanceMatrix.needsUpdate=true;
  if(hd.count)WED.meshes.push({place:'street',me:hd,items:Array.from({length:hd.count},(_,i)=>{ if(HI[i])return HI[i]; hd.getMatrixAt(i,m4); const E=m4.elements; return {k:'lamp head',x:E[12],y:E[13],z:E[14]}; })});
  if(D.pole){ D.pole.visible=false; const pm=CH(mrg([lat([[0,0],[.2,0],[.2,.04],[.17,.07],[.17,.12],[.14,.15],[.12,.45],[.15,.5],[.15,.55],[.09,.62],[.09,.85],[.11,.88],[.11,.92],[0,.95]],8),
      flu(lat([[.07,.95],[.05,3.85]],16)),lat([[.05,3.85],[.09,3.88],[.09,3.95],[.06,3.98],[.12,4.02],[.12,4.06],[.05,4.1],[.15,4.2],[.16,4.24],[.13,4.24]],8),
      lat([[0,4.25],[.33,4.25],[.36,4.28],[.3,4.42],[.12,4.6],[0,4.62]],12),lat([[0,4.6],[.06,4.61],[.04,4.66],[.02,4.74],[0,4.78]],8)]),0x23292a,'lamp post'), LI=[];
    for(const P of D.lampposts){ const y=P.y-4.2*M-.5*M; pm.put(P.x,y,P.z,.4,0,1,{sol:P.sol,fix:P.fix,follow:pl(P.L)}); LI[P.i]={k:'lamp post',x:P.x,y,z:P.z}; } for(const me of pm.done())me.castShadow=false;
    if(D.lant&&D.lant.count)WED.meshes.push({place:'street',me:D.lant,items:Array.from({length:D.lant.count},(_,i)=>{ if(LI[i])return LI[i]; D.lant.getMatrixAt(i,m4); const E=m4.elements; return {k:'lantern',x:E[12],y:E[13],z:E[14]}; })}); }
  const SC=mrg([new THREE.CylinderGeometry(.07*M,.08*M,.025*M,8).rotateX(Math.PI/2).translate(0,0,.012*M),box(0,0,.08,.03,.03,.14),lat([[0,.07],[.065,.07],[.08,.05],[.07,.03],[.06,.03]],8).translate(0,0,.17*M),
      ...[0,1,2,3].map(k=>box(.075*Math.cos(k*Math.PI/2+.785),-.06,.17+.075*Math.sin(k*Math.PI/2+.785),.012,.18,.012)),lat([[.078,-.155],[.078,-.14]],8).translate(0,0,.17*M),lat([[.078,-.07],[.078,-.06]],8).translate(0,0,.17*M),
      box(0,-.155,.17,.15,.012,.012),box(0,-.155,.17,.012,.012,.15)]), JAR=lat([[0,-.15],[.05,-.15],[.065,-.12],[.065,0],[.06,.03],[0,.03]],8).translate(0,0,.17*M);
  const sconce=inst(SC,24,0x2e2a24), jar=inst(JAR,24,0x4a4238,new THREE.MeshBasicMaterial({color:0xffffff})), PJ=new THREE.Color(1,.9,.7), PD=new THREE.Color(0x4a4238);
  const pool=D.pools&&D.pools[0]&&D.pools[0][4];
  const porch=(x,z,a,side=1,k=1)=>{ const ox=Math.cos(a), oz=-Math.sin(a), nx=Math.sin(a), nz=Math.cos(a), px=x+ox*1.2*side, pz=z+oz*1.2*side, y=G(px+nx*.6,pz+nz*.6), my=y+2.05*M*k;
    const i=put(sconce,px,my,pz,a,0,k); put(jar,px,my,pz,a,0,k); PI[i]={k:'porch light',x:px,y:my,z:pz};
    const L=new THREE.PointLight(PORCH,0,5.5*TILE,1.6), lx=px+nx*.25*M*k, lz=pz+nz*.25*M*k; L.position.set(lx,my-.06*M*k,lz); L.userData.i0=7; scene.add(L);
    const v=Math.sin(x*12.9898+z*78.233)*43758.5453, P={i,L,on:.8-(v-Math.floor(v))*3,lit:null,me:null};
    if(pool){ const me=new THREE.Mesh(pool.geometry,pool.material), r=.5*L.distance; me.scale.set(r,1,r); me.position.set(lx+nx*r*.45,y+.03,lz+nz*r*.45); me.renderOrder=1; me.visible=false; scene.add(me); P.me=me; }
    PI[i].follow=P.me?[L,P.me]:[L]; SHINE.porch.push(P); halo(L.position.clone(),.42*M*k,PORCH,L,{beam:[.06*M,.8*M]}); }, PI=[];
  { const B=SHARED.BOD, B0=B.B0; porch(B.X((B0.x0+B0.x1)/2),B.Z(B0.y1),0); if(MODS.apts&&MODS.apts.A){ const A=MODS.apts.A; porch(MODS.apts.doorAt[0],MODS.apts.doorAt[1],MODS.apts.doorHd,-1); }
    if(B.GD)porch(B.X(B.GD.door[0]),B.Z(B.GD.door[1]),B.GDK&&B.GDK.flip?Math.PI:0,1.6);
    for(const d of STORE.main?STORE.main.doors:[])if(!/THEATRE/.test(d[0]))porch(d[3],d[4],d[5]);
    { const TB=TURN(WROW.bar,WP.bar.face), bp=TB.pt((TB.L.x0+TB.L.x1)/2,TB.L.y1); porch(B.X(bp[0]),B.Z(bp[1]),TB.hd(0)); if(WROW.mus){ const TM=TURN(WROW.mus,WP.museum.face), mp=TM.pt((TM.L.x0+TM.L.x1)/2,TM.L.y1), mx=B.X(mp[0]), mz=B.Z(mp[1]); porch(mx,mz,TM.hd(0),1.6,1.5); porch(mx,mz,TM.hd(0),-1.6,1.5); }
      if(WP.art&&!AWAY.has('art')&&STORE.main){ const TA=TURN(STORE.main.lot('art',1),WP.art.face), ap=TA.pt((TA.L.x0+TA.L.x1)/2,TA.L.y1), ax=B.X(ap[0]), az=B.Z(ap[1]); porch(ax,az,TA.hd(0),1.6,1.5); porch(ax,az,TA.hd(0),-1.6,1.5); } }
    sconce.computeBoundingSphere(); jar.computeBoundingSphere(); WED.meshes.push({place:'street',me:sconce,items:PI.slice(0,sconce.count)},{place:'street',me:jar,items:PI.slice(0,jar.count).map(o=>({k:o.k,x:o.x,y:o.y,z:o.z}))}); }
  if(TLX.mesh){ const sm=TLX.mesh, p=V(), s=V(); for(let i=0;i<sm.count;i++){ sm.getMatrixAt(i,m4); m4.decompose(p,q,s); if(Math.max(s.x,s.z)>.15*M&&s.y>.15*M)halo(p.clone(),.36*M,new THREE.Color(),null,{sig:i}); } }
  if(pool){ const N=160, cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'), im=g.createImageData(N,N), f=r=>{ const d=Math.hypot(.5,r); return .5/d*d**-1.6*Math.max(0,1-d**4)**2; }, f0=f(0);
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const r=Math.hypot((i+.5)/N*2-1,(j+.5)/N*2-1), e=r>1?0:f(r*.5)/f0, a=e>.72?.2:e>.45?.13:e>.22?.075:e>.09?.035:0, k=(j*N+i)*4; im.data[k]=255; im.data[k+1]=214; im.data[k+2]=150; im.data[k+3]=Math.round(a*255); }
    g.putImageData(im,0,0); const t=pool.material.map; t.image=cv; t.needsUpdate=true; for(const P of D.pools){ const r=.5*P[0].distance; P[4].scale.set(r,1,r); } }
  const U={uT:{value:0},uWet:{value:0},uHaze:{value:1}};
  const BV=`attribute vec3 iC; attribute vec4 iS; attribute vec3 iK; uniform float uWet; varying vec2 vU; varying vec3 vK; varying float vT;
void main(){ vU=position.xy; vK=iK; vT=iS.z; vec3 c=iC, fw=-vec3(viewMatrix[0][2],viewMatrix[1][2],viewMatrix[2][2]);
 if(iS.z>2.5){ c.y=2.*iS.w-c.y; c+=fw*((iS.w-c.y)/fw.y); vK*=uWet; }
 if(vK.r+vK.g+vK.b<.003){ gl_Position=vec4(2.,2.,2.,1.); return; }
 vec4 mv=viewMatrix*vec4(c,1.);
 if(iS.z>.5&&iS.z<1.5){ vec4 b=viewMatrix*vec4(iC.x,iS.w,iC.z,1.); float t=position.y*.5+.5; mv=mix(b,mv,t); mv.x+=position.x*mix(iS.y,iS.x,t); }
 else { mv.xy+=position.xy*iS.xy; mv.z+=iS.y; }
 gl_Position=projectionMatrix*mv; }`;
  const BF=`uniform float uT,uHaze; varying vec2 vU; varying vec3 vK; varying float vT; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
void main(){ float a=0.; vec3 col=vK; vec2 u=vU;
 if(vT<.5){ float r=length(u); a=r<.14?.9:r<.3?.32:r<.56?.12:r<1.?.045:0.; if(r<.16)col=mix(vK,vec3(1.),.7); }
 else if(vT<1.5){ float t=u.y*.5+.5, e=abs(u.x); a=(t>.72?.075:t>.4?.05:.03)*(e<.5?1.:.5)*uHaze; }
 else if(vT<2.5){ a=length(u)<1.?1.:0.; }
 else { float e=abs(u.x), v=abs(u.y); a=(v<.3?.5:v<.62?.26:v<1.?.1:0.)*(e<.4?1.:e<1.?.45:0.); if(h(floor(vec2(u.x*2.,u.y*8.-uT*3.)))<.3)a*=.2; }
 if(a<=0.)discard; gl_FragColor=vec4(col*a,1.); }`;
  const NM=12, S=SHINE.src, NI=S.length*2+S.filter(s=>s.beam).length+NM, gq=new THREE.InstancedBufferGeometry(); gq.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,1,-1,0,1,1,0,-1,1,0],3)); gq.setIndex([0,1,2,0,2,3]);
  const aC=new THREE.InstancedBufferAttribute(new Float32Array(NI*3),3).setUsage(THREE.DynamicDrawUsage), aS=new THREE.InstancedBufferAttribute(new Float32Array(NI*4),4), aK=new THREE.InstancedBufferAttribute(new Float32Array(NI*3),3).setUsage(THREE.DynamicDrawUsage);
  gq.setAttribute('iC',aC); gq.setAttribute('iS',aS); gq.setAttribute('iK',aK);
  const BM=new THREE.Mesh(gq,new THREE.ShaderMaterial({uniforms:U,vertexShader:BV,fragmentShader:BF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  BM.frustumCulled=false; BM.renderOrder=5; scene.add(BM);
  let n=0, m0=0; const slot=(c,sx,sy,k,gy)=>{ aC.setXYZ(n,c.x,c.y,c.z); aS.setXYZW(n,sx,sy,k,gy); return n++; };
  { for(const s of S){ s.n=[slot(s.c,s.s,s.s,0,s.gy),slot(s.c,s.s*.32,s.s*1.5,3,s.gy)]; if(s.beam)s.n.push(slot(s.c,s.beam[0],s.beam[1],1,s.gy)); }
    m0=n; for(let i=0;i<NM;i++)slot(V(),.025*M,.025*M,2,0); gq.instanceCount=n; aS.needsUpdate=aC.needsUpdate=aK.needsUpdate=true; }
  const NL=[]; for(const N of typeof NEONS!=='undefined'?NEONS:[]){ if(!N.me)continue; const me=N.me, P=[]; for(let i=0;i<me.count;i++){ me.getMatrixAt(i,m4); P.push(V().setFromMatrixPosition(m4)); }
    const xs=[...new Set(P.map(p=>+p.x.toFixed(3)))].sort((a,b)=>a-b), st=Math.min(...xs.slice(1).map((x,i)=>x-xs[i])), ys=[...new Set(P.map(p=>+p.y.toFixed(3)))].sort((a,b)=>a-b), sy=Math.min(...ys.slice(1).map((y,i)=>y-ys[i]));
    let li=0; const lx=xs.map((x,i)=>i&&x-xs[i-1]>st*1.6?++li:li), let_=P.map(p=>lx[xs.indexOf(+p.x.toFixed(3))]);
    const w=Math.round((xs[xs.length-1]-xs[0])/st)+1, h=Math.round((ys[ys.length-1]-ys[0])/sy)+1, cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'); g.fillStyle='#fff';
    for(const p of P)g.fillRect(Math.round((p.x-xs[0])/st),Math.round((ys[ys.length-1]-p.y)/sy),1,1);
    const c=P.reduce((a,p)=>a.add(p),V()).multiplyScalar(1/P.length), L=lamps.filter(l=>l.userData.both).sort((a,b)=>a.position.distanceTo(c)-b.position.distanceTo(c))[0];
    const base=me.material.color.clone(), col=new THREE.Color(N.c[0]/255,N.c[1]/255,N.c[2]/255);
    for(let i=0;i<me.count;i++)me.setColorAt(i,cc.setRGB(1,1,1));
    NL.push({me,halo:N.halo,base,let_,nl:li+1,L,i0:L&&L.intensity,col,refl:{map:cv,w:w*st,h:h*sy,c,gz:c.z+1.2*TILE}}); }
  const RV=`uniform float uG; varying vec2 vUv; varying vec2 vW; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vec3 fw=-vec3(viewMatrix[0][2],viewMatrix[1][2],viewMatrix[2][2]); w.y=2.*uG-w.y; w.xyz+=fw*((uG-w.y)/fw.y); vW=w.xz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  const RF=`uniform sampler2D map; uniform vec3 uC; uniform float uWet,uT,uF; varying vec2 vUv; varying vec2 vW; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
void main(){ vec4 c=texture2D(map,vUv); if(c.a<.5)discard; vec2 g=vW*.9, id=floor(g); float ph=fract(uT*.6+h(id)), d=length(fract(g)-.5-(vec2(h(id+3.1),h(id+7.7))-.5)*.4);
 float a=.34*uWet*uF*(abs(d-ph*.62)<.08?.1:1.)*(fract(vUv.y*18.+h(vec2(floor(vW.x*5.),floor(uT*2.)))*.6)<.4?.35:1.)*(vUv.y<.35?.55:1.); if(a<.01)discard; gl_FragColor=vec4(c.rgb*uC*a,1.); }`;
  const tx=c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const mk=N=>{ const mat=new THREE.ShaderMaterial({uniforms:{map:{value:N.refl?tx(N.refl.map):N.fm.map},uC:{value:N.refl?N.col:N.fm.color},uG:{value:0},uF:{value:1},uWet:U.uWet,uT:U.uT},vertexShader:RV,fragmentShader:RF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4});
    let me; if(N.refl){ me=new THREE.Mesh(new THREE.PlaneGeometry(N.refl.w,N.refl.h),mat); me.position.copy(N.refl.c); scene.add(me); mat.uniforms.uG.value=G(N.refl.c.x,N.refl.gz); }
    else { me=new THREE.Mesh(new THREE.PlaneGeometry(N.o.w*TILE,N.o.h*TILE),mat); me.position.z=.04*TILE; N.grp.add(me); mat.uniforms.uG.value=G(N.c.x,N.c.z); }
    me.frustumCulled=false; me.renderOrder=3; me.visible=false; N.rm=me;
    if(N.refl&&pool){ const p=new THREE.Mesh(pool.geometry,new THREE.MeshBasicMaterial({map:pool.material.map,color:N.col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2})), r=2.6*TILE;
      p.scale.set(r,1,r); p.position.set(N.refl.c.x,G(N.refl.c.x,N.refl.gz)+.03,N.refl.c.z+r*.55); p.renderOrder=1; scene.add(p); N.pool=p; } };
  for(const N of NL)mk(N);
  BLK.shine=sg=>{ if(!sg.fm)return; const b=new THREE.Box3().setFromObject(sg.grp), c=b.getCenter(V()), N={fm:sg.fm,base:sg.fm.color.clone(),halo:sg.grp.children.find(m=>m.material&&m.material.blending===THREE.AdditiveBlending),nl:1,grp:sg.grp,o:sg.o,c}; mk(N); NL.push(N); };
  for(const sg of BLK.signs)BLK.shine(sg);
  const hs=(a,b)=>{ const v=Math.sin(a*12.9898+b*78.233)*43758.5453; return v-Math.floor(v); };
  let sigT=0, mo=0; const near=[];
  SHINE.tick=dt=>{ const t=performance.now()/1000, e=CLOCK.elev(), up=OUT.world, W=(WX.now)||{}, wet=up&&typeof LFX!=='undefined'&&LFX.ws?LFX.ws.wet||0:0, night=Math.max(0,Math.min(1,(3-e)/8));
    U.uT.value=t; U.uWet.value=wet; U.uHaze.value=.7+1.6*(W.fog||0)+.9*(W.rain||0)+.6*(W.snow||0); BM.visible=up;
    for(const P of SHINE.porch){ const on=e<P.on&&!P.L.userData.off; if(on!==P.lit){ P.lit=on; P.L.intensity=on?P.L.userData.i0:0; jar.setColorAt(P.i,on?PJ:PD); jar.instanceColor.needsUpdate=true; } if(P.me)P.me.visible=up&&on&&night>0; if(P.me)P.me.material.opacity=night; }
    let ck=0; if((sigT-=dt)<=0&&TLX.mesh){ sigT=.15; ck=1; }
    for(const s of S){ let k; if(s.sig!=null){ if(!ck)continue; const a=TLX.mesh.instanceColor.array, i=s.sig*3, m=Math.max(a[i],a[i+1],a[i+2]); k=m>.5?a[i]*9+a[i+1]*3+a[i+2]:0; if(k!==s.k){ s.col.setRGB(a[i],a[i+1],a[i+2]); s.on=m>.5; } }
      else { s.on=s.L.intensity>0&&!s.L.userData.off; k=s.on?1:0; }
      if(k===s.k)continue; s.k=k; const f=s.on?1:0; for(const j of s.n)aK.setXYZ(j,s.col.r*f,s.col.g*f,s.col.b*f); aK.needsUpdate=true; }
    if(night>0&&up){ near.length=0; for(const s of S)if(s.on&&s.sig==null){ const d=(s.c.x-pos.x)**2+(s.c.z-pos.z)**2; if(d<900)near.push([d,s]); } near.sort((a,b)=>a[0]-b[0]);
      for(let i=0;i<NM;i++){ const s=near[i>>2]&&near[i>>2][1], j=m0+i; if(!s){ aK.setXYZ(j,0,0,0); continue; } const r=(.22+.12*Math.sin(t*2.7+i*1.3))*M*(s.s/M>.6?1:.6), a=t*(1.9+(i&3)*.6)*(i&1?1:-1)+i*2.1;
        aC.setXYZ(j,s.c.x+Math.cos(a)*r,s.c.y-.12*M+Math.sin(t*3.3+i)*.16*M,s.c.z+Math.sin(a)*r); aK.setXYZ(j,.75,.66,.5); } aC.needsUpdate=aK.needsUpdate=true; }
    else if(mo){ for(let i=0;i<NM;i++)aK.setXYZ(m0+i,0,0,0); aK.needsUpdate=true; } mo=night>0&&up;
    for(const N of NL){ const hum=.93+.07*Math.sin(t*120)*Math.sin(t*7.3)+(hs(Math.floor(t*14),3)<.05?-.18:0), st=Math.floor(t/5.5), bad=hs(st,N.nl)<.6?Math.floor(hs(st,9)*N.nl):-1, ph=t%5.5, off=bad>=0&&ph<.9&&hs(Math.floor(t*11),st)<.55;
      if(N.me){ N.me.material.color.copy(N.base).multiplyScalar(hum); if(off!==N.off){ N.off=off; for(let i=0;i<N.me.count;i++)N.me.setColorAt(i,cc.setScalar(off&&N.let_[i]===bad?.1:1)); N.me.instanceColor.needsUpdate=true; }
        if(N.L)N.L.intensity=N.i0*hum*(off?1-.6/N.nl:1); if(N.pool){ N.pool.visible=up; N.pool.material.opacity=hum*(.35+.65*night)*(off?1-.6/N.nl:1); } }
      else N.fm.color.copy(N.base).multiplyScalar(off?.25:hum);
      if(N.halo)N.halo.material.opacity=off&&!N.me?.3:hum;
      N.rm.visible=wet>.02; N.rm.material.uniforms.uF.value=off?.4:hum; } };
  SYS.add('dress',(d,p)=>{ for(const P of D.pools)if(P[4].visible&&LITE.sel.some(s=>s[1]===P[0]||s===P[0]))P[4].visible=false; SHINE.tick(d||0); },'069c-shine');
  window.SHINEDBG=()=>({lights:S.length,porch:SHINE.porch.map(P=>[+P.L.position.x.toFixed(1),+P.L.position.z.toFixed(1),P.lit]),neon:NL.length,inst:gq.instanceCount,meshes:MS.length,tris:MS.reduce((n,m)=>n+m.geometry.attributes.position.count/3*m.count,0),per:{street:SLB.attributes.position.count/3,head:HOUS.attributes.position.count/3,lens:LENS.index.count/3,sconce:SC.attributes.position.count/3}}); }

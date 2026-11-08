// HUDSHOP: the Hudson row's shop building, open at the front (owner, 8 Nov 2026, of Polyfork's florist: "make all the storefronts on hudson this type of building ... realistic textures, bricks, glass, real interior ... 25% taller inside. the top part is where the merchants who own the shops live"): brick walls, the shop open to the street between timber posts with its shelves and counter, the merchant's flat upstairs behind a long window, lit at night.
import {SHARED, THREE} from './003-shx.js';
import {scene} from './004-main.js';
import {hash} from './014-gamekit.js';
import {FACADES} from './038zc-facades.js';
const HUDSHOP={tris:0,made:0};
{ const lin=c=>{ const t=new THREE.Color(); t.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); return [t.r,t.g,t.b]; }, hs=(a,b,c)=>hash(a,b,c);
  let MB=null, MP=null, MG=null, BT=null;
  // the brick (owner, 8 Nov 2026: "make all the brickes and textures on the polyfork buildings in game way more realistic"): running bond at the old size, 512 px; each brick its own tone, grain and speckle,
  // rounded edges lit from above, a few dark clinkers and chips, the mortar sunk back with the brick's shadow along its top, grime that gathers low; and a relief map from the same heights (the mortar in, the bricks out)
  let BN=null, BMk=null; const bake=()=>{ const N=512, RH=32, BL=96, MO=4, L=new Float32Array(N*N), Hh=new Float32Array(N*N), C=new Uint8ClampedArray(N*N*4), fr=x=>x-Math.floor(x);
    const n2=(x,y,s)=>{ const X=Math.floor(x/s), Y=Math.floor(y/s), u=fr(x/s), v=fr(y/s), a=hs(X,Y,11), b=hs(X+1,Y,11), c=hs(X,Y+1,11), d=hs(X+1,Y+1,11), su=u*u*(3-2*u), sv=v*v*(3-2*v); return a+(b-a)*su+(c-a)*sv+(a-b-c+d)*su*sv; };
    for(let y=0;y<N;y++){ const r=Math.floor(y/RH), yy=y-r*RH, off=r%2?BL/2:0;
      for(let x=0;x<N;x++){ const xx0=(x+off)%N, k=Math.floor(xx0/BL), xx=xx0-k*BL, i=y*N+x, kk=k%(N/BL);
        const grime=.92+.08*n2(x,y,64), spk=(hs(x,y,3)-.5)*.07;
        if(yy<MO||xx<MO){ const sh=yy<MO?.78+.06*yy:.9; L[i]=(.66+.08*n2(x,y,5)+spk)*sh*grime; Hh[i]=0; C[i*4]=C[i*4+1]=C[i*4+2]=0; continue; }
        const t=hs(r,kk,7), dark=hs(r,kk,9)<.08, base=dark?.4+.08*t:.6+.28*t, d=Math.min(xx-MO,BL-1-xx,yy-MO,RH-1-yy), edge=Math.min(1,d/2.5);
        let l=base*(.86+.14*edge)+(n2(x,y,7)-.5)*.1+(n2(x,y,2)-.5)*.06+spk;
        if(yy-MO<2)l+=.06; if(RH-1-yy<2)l-=.08; if(hs(Math.floor(x/3),Math.floor(y/3),13)<.012)l*=.62;   // (lit along the top, shadow below; a chip here and there)
        L[i]=l*grime; Hh[i]=.55+.45*edge-(hs(Math.floor(x/3),Math.floor(y/3),13)<.012?.4:0); const tw=(hs(r,kk,5)-.5)*.22; C[i*4]=128+tw*255; C[i*4+1]=128; C[i*4+2]=128-tw*255; } }
    const cv=document.createElement('canvas'); cv.width=cv.height=N; const g=cv.getContext('2d'), im=g.createImageData(N,N);
    for(let i=0;i<N*N;i++){ const v=Math.max(0,Math.min(1,L[i]))*255, tw=C[i*4]?(C[i*4]-128)/255:0; im.data[i*4]=v*(1+tw); im.data[i*4+1]=v; im.data[i*4+2]=v*(1-tw); im.data[i*4+3]=255; } g.putImageData(im,0,0);
    const cn=document.createElement('canvas'); cn.width=cn.height=N; const gn=cn.getContext('2d'), nm=gn.createImageData(N,N), at=(x,y)=>Hh[((y+N)%N)*N+(x+N)%N];
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){ const dx=(at(x-1,y)-at(x+1,y))*2.2, dy=(at(x,y-1)-at(x,y+1))*2.2, l=Math.hypot(dx,dy,1), o=(y*N+x)*4; nm.data[o]=(dx/l*.5+.5)*255; nm.data[o+1]=(-dy/l*.5+.5)*255; nm.data[o+2]=(1/l*.5+.5)*255; nm.data[o+3]=255; }
    gn.putImageData(nm,0,0);
    const tex=(c,srgb)=>{ const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter; t.generateMipmaps=true; t.anisotropy=4; if(srgb)t.colorSpace=THREE.SRGBColorSpace; return t; };
    const cm=document.createElement('canvas'); cm.width=cm.height=N; const gm=cm.getContext('2d'), mm=gm.createImageData(N,N); for(let i=0;i<N*N;i++){ const v=Hh[i]===0?255:0; mm.data[i*4]=mm.data[i*4+1]=mm.data[i*4+2]=v; mm.data[i*4+3]=255; } gm.putImageData(mm,0,0);
    BT=tex(cv,true); BN=tex(cn,false); BMk=tex(cm,false); };
  HUDSHOP.brick=()=>{ if(!BT)bake(); return BT; }; HUDSHOP.brickN=()=>{ if(!BN)bake(); return BN; }; HUDSHOP.brickM=()=>{ if(!BMk)bake(); return BMk; };   // (the mortar's mask: grey, not the brick's colour)
  const mats=()=>{ if(MB)return; const t=HUDSHOP.brick();
    const glow=m=>{ m.onBeforeCompile=sh=>{ sh.uniforms.uNight=FACADES.night; sh.vertexShader='attribute float aGlow; varying float vGlow;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGlow=aGlow;');
      sh.fragmentShader='uniform float uNight; varying float vGlow;\n'+sh.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*vGlow*(.2+uNight*1.8);\n#include <opaque_fragment>'); }; return m; };
    MB=glow(new THREE.MeshLambertMaterial({map:t,normalMap:HUDSHOP.brickN(),normalScale:new THREE.Vector2(.9,.9),vertexColors:true})); MB.customProgramCacheKey=()=>'hudshopB';
    { const g0=MB.onBeforeCompile; MB.onBeforeCompile=sh=>{ g0(sh); sh.uniforms.uM={value:HUDSHOP.brickM()}; sh.fragmentShader='uniform sampler2D uM;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n { float mk=texture2D(uM,vMapUv).r; diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.6,.58,.54)*texture2D(map,vMapUv).g*1.3,mk); }'); }; }
    MP=glow(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); MP.customProgramCacheKey=()=>'hudshopP';
    MG=new THREE.MeshPhongMaterial({color:0x9fb4c4,specular:0xffffff,shininess:90,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide}); };
  // o: L the lot in its own frame (front along L.y1), pt (u,v)->lot tiles, brick (the shop's brick colour), du the door's middle (tiles), seed
  HUDSHOP.make=o=>{ mats(); const {X,Y,Z}=SHARED.BOD, L=o.L, pt=o.pt||((u,v)=>[u,v]), m=1/.84, zm=28.6, seed=o.seed||7;
    const BR={P:[],U:[],C:[],G:[]}, PL={P:[],U:[],C:[],G:[]}, GL=[];
    const W=(u,v,z)=>{ const q=pt(u,v); return [X(q[0]),Y(z),Z(q[1])]; };
    // a box in the lot's frame: u across the front, v from the back to the front (tiles), z up (z-pixels); brick faces carry their size in metres as their texture's place
    const box=(u0,u1,v0,v1,z0,z1,col,o2={})=>{ const T=o2.brick?BR:PL, k=lin(col), gl=o2.glow||0;
      const c=[[u0,v0,z0],[u1,v0,z0],[u1,v1,z0],[u0,v1,z0],[u0,v0,z1],[u1,v0,z1],[u1,v1,z1],[u0,v1,z1]].map(p=>W(...p));
      const F=[[0,1,5,4,u1-u0],[1,2,6,5,v1-v0],[2,3,7,6,u1-u0],[3,0,4,7,v1-v0],[4,5,6,7,u1-u0],[3,2,1,0,u1-u0]];
      F.forEach(([a,b,cc,d,len],fi)=>{ if(o2.skip&&o2.skip.includes(fi))return; const wu=len/m/1.6, wv=fi>=4?(v1-v0)/m/1.6:(z1-z0)/zm/.6;
        for(const [i,uu,vv] of [[a,0,0],[b,wu,0],[cc,wu,wv],[a,0,0],[cc,wu,wv],[d,0,wv]]){ T.P.push(...c[i]); T.U.push(uu,vv); T.C.push(...k); T.G.push(gl); } }); };
    const W0=L.x0, W1=L.x1, V0=L.y0, V1=L.y1, w=W1-W0, gf=4.4*zm, H=gf+4.35*1.5*zm, th=.3*m, du=o.du??(W0+W1)/2, bc=o.brick||[140,72,56];
    const trim=[214,206,190], post=[150,98,52], frame=[42,38,36];
    // walls: the sides and back in brick, the upper front round its long window
    box(W0,W0+th,V0,V1-th,0,H,bc,{brick:1}); box(W1-th,W1,V0,V1-th,0,H,bc,{brick:1}); box(W0+th,W1-th,V0,V0+th,0,H,bc,{brick:1});
    // the flat's front: tall sash windows set back in the brick, stone lintels with a keystone, stone sills on corbels (owner, 8 Nov 2026: "more realistic windows, frames")
    const nW=Math.max(2,Math.round(w/(3.4*m))), ww=1.35*m, wh=2.3*zm, wy=gf+(H-gf)*.48, fv0=V1-.4*m, wz0=wy-wh/2, wz1=wy+wh/2, US=[...Array(nW)].map((_,k)=>W0+w*(k+.5)/nW-ww/2);
    box(W0,W1,fv0,V1,wz1,H,bc,{brick:1}); box(W0,W1,fv0,V1,gf,wz0,bc,{brick:1}); [W0,...US.map(u=>u+ww)].forEach((u,k)=>box(u,k<nW?US[k]:W1,fv0,V1,wz0,wz1,bc,{brick:1}));
    const stone=[198,190,174], sash=[228,224,212], SILL=[];
    for(const u of US){ const fz=V1-.26*m;
      box(u-.12*m,u+ww+.12*m,V1-.3*m,V1+.14*m,wz0-.16*zm,wz0,stone); for(const c of [u+.05*m,u+ww-.2*m])box(c,c+.15*m,V1-.05*m,V1+.1*m,wz0-.4*zm,wz0-.16*zm,stone);   // the sill on its corbels
      box(u-.18*m,u+ww+.18*m,V1-.05*m,V1+.06*m,wz1,wz1+.32*zm,stone); box(u+ww/2-.13*m,u+ww/2+.13*m,V1-.05*m,V1+.1*m,wz1-.05*zm,wz1+.4*zm,stone);   // the lintel and its keystone
      box(u,u+.1*m,fz-.06*m,fz+.06*m,wz0,wz1,sash); box(u+ww-.1*m,u+ww,fz-.06*m,fz+.06*m,wz0,wz1,sash); box(u,u+ww,fz-.06*m,fz+.06*m,wz0,wz0+.14*zm,sash); box(u,u+ww,fz-.06*m,fz+.06*m,wz1-.1*zm,wz1,sash);   // the frame
      box(u+.1*m,u+ww-.1*m,fz-.04*m,fz+.05*m,wy-.05*zm,wy+.05*zm,sash);   // the meeting rail of the two sashes
      for(const zz of [(wz0+wy)/2,(wy+wz1)/2])box(u+.1*m,u+ww-.1*m,fz-.02*m,fz+.02*m,zz-.02*zm,zz+.02*zm,sash); box(u+ww/2-.02*m,u+ww/2+.02*m,fz-.02*m,fz+.02*m,wz0+.14*zm,wz1-.1*zm,sash);   // the glazing bars
      GL.push([u+.1*m,u+ww-.1*m,fz-.03*m,wz0+.14*zm,wz1-.1*zm]);
      for(const [c,d] of [[u+.05*m,u+.4*m],[u+ww-.4*m,u+ww-.05*m]])box(c,d,V1-.62*m,V1-.56*m,wz0+.1*zm,wz1-.05*zm,o.curtain||[138,63,58],{glow:.25});   // curtains drawn back
      SILL.push(W(u+ww/2,V1-.08*m,wz0)); }
    box(W0+th,W1-th,V0+th+1*m,V0+th+1.05*m,gf,H,[110,84,64],{glow:.55});   // the flat's back wall, lit
    // the front lights: a lantern on a bracket either side of the opening, lit at night
    const LAMP=[];
    for(const u of [W0+.27*m,W1-.27*m]){ box(u-.03*m,u+.03*m,V1,V1+.35*m,gf-.7*zm,gf-.64*zm,frame); box(u-.12*m,u+.12*m,V1+.25*m,V1+.49*m,gf-1.05*zm,gf-.62*zm,frame); box(u-.09*m,u+.09*m,V1+.28*m,V1+.46*m,gf-1*zm,gf-.68*zm,[255,214,150],{glow:2.2}); LAMP.push(W(u,V1+.37*m,gf-.85*zm)); }
    box(W0-.2*m,W1+.2*m,V0-.2*m,V1+.2*m,H,H+.35*zm,trim); box(W0,W1,V1-.1*m,V1+.3*m,gf-.05*zm,gf+.3*zm,trim);   // the coping and the band over the shop
    for(const [a,b] of [[W0,W0+.55*m],[W1-.55*m,W1]])box(a,b,V1-.6*m,V1,0,gf,post);   // the timber posts either side of the shopfront
    box(W0+th,W1-th,V0+th,V1,0,.1*zm,[120,90,62]); box(W0+th,W1-th,V0+th,fv0,gf,gf+.12*zm,[150,120,90]);   // the shop's floor and the flat's
    if(o.closed){ const sv=V1-.8*m, n=Math.max(3,Math.round(w/(1.4*m)));   // a shop with an inside of its own off the map keeps a glass front and its door
      box(W0+.55*m,W1-.55*m,sv-.08*m,sv+.08*m,0,.25*zm,frame); for(let i=1;i<n;i++){ const u=W0+.55*m+(w-1.1*m)*i/n; if(Math.abs(u-du)>.6*m)box(u-.05*m,u+.05*m,sv-.06*m,sv+.06*m,.25*zm,gf-.35*zm,frame); }
      GL.push([W0+.55*m,W1-.55*m,sv,.25*zm,gf-.35*zm]); box(du-.55*m,du+.55*m,sv-.05*m,sv+.03*m,.1*zm,2.4*zm,[96,64,42]); box(du+.3*m,du+.38*m,sv+.03*m,sv+.07*m,1.1*zm,1.2*zm,[200,170,90]); }
    // inside the shop: shelves of goods down both walls, a counter, the back wall lit warm
    const GOODS=[[216,87,58],[232,184,74],[106,168,79],[60,120,216],[166,77,121],[241,194,50],[142,124,195],[69,129,142]];
    for(const s of [0,1]){ const u0=s?W1-th-.5*m:W0+th, u1=u0+.5*m; box(u0,u1,V0+1.2*m,V1-2*m,0,2.6*zm,[110,80,56]);
      for(let r=0;r<4;r++)for(let k=0;k*.7*m<V1-V0-3.6*m;k++)box(u0+.08*m,u1-.08*m,V0+1.4*m+k*.7*m,V0+1.4*m+k*.7*m+.4*m,(.45+r*.6)*zm,(.8+r*.6)*zm,GOODS[(k+r*3+s*4+seed)%8],{glow:.35}); }
    box((W0+W1)/2-1.5*m,(W0+W1)/2+1.5*m,V0+2*m,V0+2.8*m,0,1*zm,[130,92,60],{glow:.3}); box((W0+W1)/2-1.55*m,(W0+W1)/2+1.55*m,V0+1.95*m,V0+2.85*m,1*zm,1.08*zm,[200,180,150]);
    box(W0+th,W1-th,V0+th,V0+th+.05*m,.1*zm,gf,[150,118,84],{glow:.5});
    box(W0+.55*m,W1-.55*m,V1-.75*m,V1-.55*m,gf-.35*zm,gf,[150,98,52]);   // the beam over the open front
    // the meshes: brick, the plain parts, and the glass
    const G=new THREE.Group(), mk=(T,mat)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(T.P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(T.U,2)); g.setAttribute('color',new THREE.Float32BufferAttribute(T.C,3)); g.setAttribute('aGlow',new THREE.Float32BufferAttribute(T.G,1)); g.computeVertexNormals(); const me=new THREE.Mesh(g,mat); me.castShadow=me.receiveShadow=true; G.add(me); HUDSHOP.tris+=T.P.length/9; return me; };
    mk(BR,MB); mk(PL,MP);
    { const P=[]; for(const [u0,u1,v,z0,z1] of GL){ const a=W(u0,v,z0), b=W(u1,v,z0), c=W(u1,v,z1), d=W(u0,v,z1); P.push(...a,...b,...c,...a,...c,...d); } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.computeVertexNormals(); const me=new THREE.Mesh(g,MG); me.renderOrder=2; G.add(me); }
    G.userData.counter=W((W0+W1)/2,V0+2.4*m,0); G.userData.sills=SILL; G.userData.hang=[W(W0+.9*m,V1-.4*m,gf-.4*zm),W(W1-.9*m,V1-.4*m,gf-.4*zm)]; G.userData.post=W(W0+.27*m,V1+.1*m,0);
    // the light the lanterns and the open shop throw on the pavement after dark (no lamp of its own: a warm pool that grows with the night)
    { const pm=new THREE.MeshBasicMaterial({color:0xffc880,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}), P=[], c=(W0+W1)/2, pool=(u,v,r)=>{ const N=14; for(let k=0;k<N;k++){ const a0=k/N*6.283, a1=(k+1)/N*6.283; P.push(...W(u,v,1.5),...W(u+Math.cos(a0)*r,v+Math.sin(a0)*r*.7,1.5),...W(u+Math.cos(a1)*r,v+Math.sin(a1)*r*.7,1.5)); } };
      pool(c,V1+1.2*m,w*.42); for(const u of [W0+.27*m,W1-.27*m])pool(u,V1+.6*m,1.6*m); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); const me=new THREE.Mesh(g,pm); me.renderOrder=3; me.raycast=()=>{}; me.onBeforeRender=()=>{ pm.opacity=.16*FACADES.night.value; }; G.add(me); } (o.parent||scene).add(G); HUDSHOP.made++; return G; };
}
window.HUDSHOP=HUDSHOP;
export {HUDSHOP};

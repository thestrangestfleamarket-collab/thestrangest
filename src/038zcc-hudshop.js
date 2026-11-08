// HUDSHOP: the Hudson row's shop building, open at the front (owner, 8 Nov 2026, of Polyfork's florist: "make all the storefronts on hudson this type of building ... realistic textures, bricks, glass, real interior ... 25% taller inside. the top part is where the merchants who own the shops live"): brick walls, the shop open to the street between timber posts with its shelves and counter, the merchant's flat upstairs behind a long window, lit at night.
import {SHARED, THREE} from './003-shx.js';
import {scene} from './004-main.js';
import {hash} from './014-gamekit.js';
import {FACADES} from './038zc-facades.js';
const HUDSHOP={tris:0,made:0};
{ const lin=c=>{ const t=new THREE.Color(); t.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); return [t.r,t.g,t.b]; }, hs=(a,b,c)=>hash(a,b,c);
  let MB=null, MP=null, MG=null, BT=null;
  HUDSHOP.brick=()=>{ if(BT)return BT;
    // the brick: running bond, each brick its own tone (grey, tinted per shop by the vertex colour), mortar between, soot at the top
    const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'); g.fillStyle='#b8b4ac'; g.fillRect(0,0,128,128);
    for(let r=0;r<16;r++)for(let k=-1;k<6;k++){ const x=k*24+(r%2?12:0), v=150+hs(r,k,7)*70|0; g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(x+1,r*8+1,22,7); }
    const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return BT=t; };
  const mats=()=>{ if(MB)return; const t=HUDSHOP.brick();
    const glow=m=>{ m.onBeforeCompile=sh=>{ sh.uniforms.uNight=FACADES.night; sh.vertexShader='attribute float aGlow; varying float vGlow;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGlow=aGlow;');
      sh.fragmentShader='uniform float uNight; varying float vGlow;\n'+sh.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*vGlow*uNight*1.8;\n#include <opaque_fragment>'); }; return m; };
    MB=glow(new THREE.MeshLambertMaterial({map:t,vertexColors:true})); MB.customProgramCacheKey=()=>'hudshopB';
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
    const W0=L.x0, W1=L.x1, V0=L.y0, V1=L.y1, w=W1-W0, H=8.75*zm, gf=4.4*zm, th=.3*m, du=o.du??(W0+W1)/2, bc=o.brick||[140,72,56];
    const trim=[214,206,190], post=[150,98,52], frame=[42,38,36], dark=[46,40,36];
    // walls: the sides and back in brick, the upper front round its long window
    box(W0,W0+th,V0,V1-th,0,H,bc,{brick:1}); box(W1-th,W1,V0,V1-th,0,H,bc,{brick:1}); box(W0+th,W1-th,V0,V0+th,0,H,bc,{brick:1});
    const ww=Math.max(2,w-1.7*m*2), wh=1.5*zm, wy=gf+(H-gf)/2+.2*zm, wu0=(W0+W1)/2-ww/2, wu1=wu0+ww, fv0=V1-.4*m;
    box(W0,W1,fv0,V1,wy+wh/2,H,bc,{brick:1}); box(W0,W1,fv0,V1,gf,wy-wh/2,bc,{brick:1}); box(W0,wu0,fv0,V1,wy-wh/2,wy+wh/2,bc,{brick:1}); box(wu1,W1,fv0,V1,wy-wh/2,wy+wh/2,bc,{brick:1});
    box(W0-.2*m,W1+.2*m,V0-.2*m,V1+.2*m,H,H+.35*zm,trim); box(W0,W1,V1-.1*m,V1+.3*m,gf-.05*zm,gf+.3*zm,trim);   // the coping and the band over the shop
    for(const [a,b] of [[W0,W0+.55*m],[W1-.55*m,W1]])box(a,b,V1-.6*m,V1,0,gf,post);   // the timber posts either side of the shopfront
    box(W0+th,W1-th,V0+th,V1,0,.1*zm,[120,90,62]); box(W0+th,W1-th,V0+th,fv0,gf,gf+.12*zm,[150,120,90]);   // the shop's floor and the flat's
    if(o.closed){ const sv=V1-.8*m, n=Math.max(3,Math.round(w/(1.4*m)));   // a shop with an inside of its own off the map keeps a glass front and its door
      box(W0+.55*m,W1-.55*m,sv-.08*m,sv+.08*m,0,.25*zm,frame); for(let i=1;i<n;i++){ const u=W0+.55*m+(w-1.1*m)*i/n; if(Math.abs(u-du)>.6*m)box(u-.05*m,u+.05*m,sv-.06*m,sv+.06*m,.25*zm,gf-.35*zm,frame); }
      GL.push([W0+.55*m,W1-.55*m,sv,.25*zm,gf-.35*zm]); box(du-.55*m,du+.55*m,sv-.05*m,sv+.03*m,.1*zm,2.4*zm,[96,64,42]); box(du+.3*m,du+.38*m,sv+.03*m,sv+.07*m,1.1*zm,1.2*zm,[200,170,90]); }
    // inside the shop: shelves of goods down both walls, a counter, the back wall lit warm
    const GOODS=[[216,87,58],[232,184,74],[106,168,79],[60,120,216],[166,77,121],[241,194,50],[142,124,195],[69,129,142]];
    for(const s of [0,1]){ const u0=s?W1-th-.5*m:W0+th, u1=u0+.5*m; box(u0,u1,V0+1.2*m,V1-2*m,0,2.6*zm,[110,80,56]);
      for(let r=0;r<4;r++)for(let k=0;k*.7*m<V1-V0-3.6*m;k++)box(u0+.08*m,u1-.08*m,V0+1.4*m+k*.7*m,V0+1.4*m+k*.7*m+.4*m,(.45+r*.6)*zm,(.8+r*.6)*zm,GOODS[(k+r*3+s*4+seed)%8]); }
    box((W0+W1)/2-1.5*m,(W0+W1)/2+1.5*m,V0+2*m,V0+2.8*m,0,1*zm,[130,92,60]); box((W0+W1)/2-1.55*m,(W0+W1)/2+1.55*m,V0+1.95*m,V0+2.85*m,1*zm,1.08*zm,[200,180,150]);
    box(W0+th,W1-th,V0+th,V0+th+.05*m,.1*zm,gf,[150,118,84],{glow:.5});
    // the flat upstairs: the window's frame and mullions, curtains drawn back, its back wall lit, window boxes on the sill
    box(wu0-.1*m,wu1+.1*m,V1-.45*m,V1+.05*m,wy+wh/2,wy+wh/2+.12*zm,trim); box(wu0-.15*m,wu1+.15*m,V1-.45*m,V1+.12*m,wy-wh/2-.14*zm,wy-wh/2,trim);
    for(let k=1;k<6;k++){ const u=wu0+ww*k/6; box(u-.04*m,u+.04*m,V1-.2*m,V1-.1*m,wy-wh/2,wy+wh/2,frame); }
    GL.push([wu0,wu1,V1-.15*m,wy-wh/2,wy+wh/2]);
    for(const [a,b] of [[wu0,wu0+1.1*m],[wu1-1.1*m,wu1]])box(a,b,V1-.75*m,V1-.7*m,wy-wh/2+.05*zm,wy+wh/2-.05*zm,[138,63,58]);
    box(W0+th,W1-th,V0+th+1*m,V0+th+1.05*m,gf,H,[110,84,64],{glow:.55});
    for(let k=0;k<3;k++){ const u=wu0+ww*(k+.5)/3; box(u-.65*m,u+.65*m,V1,V1+.32*m,wy-wh/2,wy-wh/2+.28*zm,[138,90,58]); box(u-.5*m,u+.5*m,V1+.04*m,V1+.28*m,wy-wh/2+.28*zm,wy-wh/2+.55*zm,[79,125,56]); }
    box(W0+.55*m,W1-.55*m,V1-.75*m,V1-.55*m,gf-.35*zm,gf,[150,98,52]);   // the beam over the open front
    // the meshes: brick, the plain parts, and the glass
    const G=new THREE.Group(), mk=(T,mat)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(T.P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(T.U,2)); g.setAttribute('color',new THREE.Float32BufferAttribute(T.C,3)); g.setAttribute('aGlow',new THREE.Float32BufferAttribute(T.G,1)); g.computeVertexNormals(); const me=new THREE.Mesh(g,mat); me.castShadow=me.receiveShadow=true; G.add(me); HUDSHOP.tris+=T.P.length/9; return me; };
    mk(BR,MB); mk(PL,MP);
    { const P=[]; for(const [u0,u1,v,z0,z1] of GL){ const a=W(u0,v,z0), b=W(u1,v,z0), c=W(u1,v,z1), d=W(u0,v,z1); P.push(...a,...b,...c,...a,...c,...d); } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.computeVertexNormals(); const me=new THREE.Mesh(g,MG); me.renderOrder=2; G.add(me); }
    G.userData.counter=W((W0+W1)/2,V0+2.4*m,0); (o.parent||scene).add(G); HUDSHOP.made++; return G; };
}
window.HUDSHOP=HUDSHOP;
export {HUDSHOP};

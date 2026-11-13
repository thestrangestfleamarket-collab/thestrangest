// THE FISH, REAL (owner, 28 Oct 2026: "make all the fish look as complex as the packs fish, look online for sources ... realistic textures"): every
// catchable species and the pack's shoal, from CC0 scans and models, cut to ~1,500 triangles and a small JPEG each, turned to swim along +X with +Y up
// and scaled to unit length, packed into data/fishes.json for src/066c-fishes.js. The sturgeon and the blue crab have no free model: they are built here. Afterwards: python3 tools/fishes-share.py (bodies stored once).
// Sources (all CC0 1.0): ffish.asia / floraZia.com scans (sketchfab.com/ffishAsia-and-floraZia), Polyy.AI "3D Fish Pack" (polyyai.itch.io/3d-fish-pack),
// both as mirrored in github.com/lisa-1002/fishing3d/vendor/fish/real. Run: npm i --no-save @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1
// @gltf-transform/extensions@4.1.1 meshoptimizer@0.25.0 sharp@0.33.5 && node tools/fishes-bake.cjs <dir of the .glb files> [data/fishes.json]
const fs=require('fs'), path=require('path');
const DIR=process.argv[2], OUT=process.argv[3]||'data/fishes.json';
// species: source, triangles, texture size, tint [r,g,b] multiplied into the texture (1 = as scanned), turn fixes, flat (a flatfish lies on its side)
const SP={
  x_perch:{src:'scan_croaker',tint:[.95,1,1.02]}, x_tomcod:{src:'scan_pacificcod',tint:[.95,.9,.78]}, x_eel:{src:'scan_eel',tris:1200},
  x_catfish:{src:'p_channel_catfish'}, x_flounder:{src:'scan_halibut',flat:1}, x_shad:{src:'scan_shad'}, x_bluefish:{src:'scan_greateramber',tint:[.78,.95,1.12]},
  x_bass:{src:'scan_seabass',stripes:1}, x_sunfish:{src:'scan_bluegill',tint:[1.18,1.08,.7],belly:[235,130,40]}, x_bluegill:{src:'scan_bluegill'}, x_yperch:{src:'scan_yamame',tint:[1.22,1.12,.55],belly:[230,215,170]},
  x_trout:{src:'p_rainbow_trout'}, x_carp:{src:'scan_carp'}, x_lbass:{src:'p_largemouth_bass'}, x_pike:{src:'scan_snakehead',tint:[.86,1.02,.6],spots:1},
  x_sturgeon:{make:'sturgeon'}, x_crab:{make:'crab'},
  koi:{src:'p_koi'}, puffer:{src:'scan_puffer'}, lionfish:{src:'scan_lionfish'},
  // the colourful ones (owner, 28 Oct 2026: "lots of differtny colorful fish, and diff types of things like koi fish"): koi in their classic colourings, painted from the one koi,
  // a goldfish, and the brightest of the scans
  koi_gold:{src:'p_koi',koi:'gold'}, koi_showa:{src:'p_koi',koi:'showa'}, koi_sanke:{src:'p_koi',koi:'sanke'}, koi_platinum:{src:'p_koi',koi:'platinum'}, koi_asagi:{src:'p_koi',koi:'asagi'},
  koi_orange:{src:'p_koi',koi:'orange'}, koi_black:{src:'p_koi',koi:'black'}, goldfish:{src:'p_koi',koi:'goldfish'},
  sockeye:{src:'p_sockeye_salmon'}, goatfish:{src:'scan_goatfish'}, seabream:{src:'scan_redseabream'}, wrasse:{src:'scan_wrasse_bamboo'}, stripedpuffer:{src:'scan_stripedpuffer'},
  trevally:{src:'scan_trevally'}, dace:{src:'scan_dace'}, knifejaw:{src:'scan_knifejaw_barred'}};
const TRIS=1500, TEX=256;
(async()=>{
  const {NodeIO}=await import('@gltf-transform/core'), {ALL_EXTENSIONS}=await import('@gltf-transform/extensions'), {dequantize}=await import('@gltf-transform/functions');
  const {MeshoptSimplifier}=await import('meshoptimizer'), sharp=(await import('sharp')).default; await MeshoptSimplifier.ready;
  const io=new NodeIO().registerExtensions(ALL_EXTENSIONS), out={};
  const b64=a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength).toString('base64');
  const lum=(r,g,b)=>.3*r+.59*g+.11*b;
  for(const [id,cfg] of Object.entries(SP)){
    let P,U,I,img;
    if(cfg.make){ ({P,U,I,img}=await MAKE[cfg.make](sharp)); }
    else {
      const doc=await io.read(path.join(DIR,cfg.src+'.glb')); await doc.transform(dequantize());
      const prims=[]; for(const n of doc.getRoot().listNodes()){ const m=n.getMesh(); if(!m)continue; const W=n.getWorldMatrix();
        for(const p of m.listPrimitives()){ const pa=p.getAttribute('POSITION'), ua=p.getAttribute('TEXCOORD_0'), tx=p.getMaterial()&&p.getMaterial().getBaseColorTexture(); if(!pa||!ua||!tx||pa.getCount()<=24)continue;
          const n_=pa.getCount(), pos=new Float32Array(n_*3), uv=new Float32Array(n_*2), e=[0,0,0], f=[0,0];
          for(let i=0;i<n_;i++){ pa.getElement(i,e); const x=e[0],y=e[1],z=e[2]; pos[i*3]=W[0]*x+W[4]*y+W[8]*z+W[12]; pos[i*3+1]=W[1]*x+W[5]*y+W[9]*z+W[13]; pos[i*3+2]=W[2]*x+W[6]*y+W[10]*z+W[14]; ua.getElement(i,f); uv[i*2]=f[0]; uv[i*2+1]=f[1]; }
          const ix=p.getIndices()?Uint32Array.from(p.getIndices().getArray()):Uint32Array.from({length:n_},(_,i)=>i);
          prims.push({pos,uv,ix,png:Buffer.from(tx.getImage())}); } }
      // one atlas: the parts' textures stacked top to bottom, each part's v moved into its band (full size here: it is only read)
      const k=prims.length, FT=1024, tiles=[];
      for(let j=0;j<k;j++)tiles.push({input:await sharp(prims[j].png).resize(FT,FT,{fit:'fill'}).removeAlpha().toBuffer(),top:j*FT,left:0});
      const atlas=await sharp(await sharp({create:{width:FT,height:FT*k,channels:3,background:{r:0,g:0,b:0}}}).composite(tiles).png().toBuffer()).removeAlpha().raw().toBuffer({resolveWithObject:true});
      const nv=prims.reduce((a,p)=>a+p.pos.length/3,0), ni=prims.reduce((a,p)=>a+p.ix.length,0); P=new Float32Array(nv*3); U=new Float32Array(nv*2); I=new Uint32Array(ni); let vo=0, io_=0;
      prims.forEach((p,j)=>{ P.set(p.pos,vo*3); for(let i=0;i<p.uv.length/2;i++){ let u=p.uv[i*2]%1, v=p.uv[i*2+1]%1; if(u<0)u+=1; if(v<0)v+=1; U[(vo+i)*2]=u; U[(vo+i)*2+1]=(j+v)/k; } for(let i=0;i<p.ix.length;i++)I[io_+i]=p.ix[i]+vo; vo+=p.pos.length/3; io_+=p.ix.length; });
      { const sz=Math.max(...[0,1,2].map(a=>{ let l=1e9,h=-1e9; for(let i=a;i<P.length;i+=3){ l=Math.min(l,P[i]); h=Math.max(h,P[i]); } return h-l; }))*2e-5, key=new Map(), re=new Uint32Array(nv);   // the scans ship every corner apart: weld the ones that share a place and a texture point
        for(let v=0;v<nv;v++){ const k=Math.round(P[v*3]/sz)+','+Math.round(P[v*3+1]/sz)+','+Math.round(P[v*3+2]/sz)+','+Math.round(U[v*2]*4096)+','+Math.round(U[v*2+1]*4096); let r=key.get(k); if(r==null){ r=v; key.set(k,v); } re[v]=r; }
        for(let i=0;i<I.length;i++)I[i]=re[I[i]]; }
      orient(P,U,atlas,cfg); unit(P);
      // cut down to TRIS (meshoptimizer keeps the texture seams). A scan's holes lock that: then the sloppy cut, and its look is painted back on
      // from the full scan, seen from each side (a fish's own side view: the left in the top half of the picture, the right in the bottom half)
      let [J]=MeshoptSimplifier.simplify(I,P,3,(cfg.tris||TRIS)*3,1,[]); const sloppy=J.length>(cfg.tris||TRIS)*4.5; if(sloppy)[J]=MeshoptSimplifier.simplifySloppy(J,P,3,null,(cfg.tris||TRIS)*3,1);
      if(!sloppy){ const map=new Int32Array(nv).fill(-1); let c=0; for(const v of J)if(map[v]<0)map[v]=c++;
        const P2=new Float32Array(c*3), U2=new Float32Array(c*2); for(let v=0;v<nv;v++)if(map[v]>=0){ P2.set(P.subarray(v*3,v*3+3),map[v]*3); U2.set(U.subarray(v*2,v*2+2),map[v]*2); }
        img=await sharp(atlas.data,{raw:{width:FT,height:FT*k,channels:3}}).resize(TEX,TEX*k,{fit:'fill'}).raw().toBuffer({resolveWithObject:true}); P=P2; U=U2; I=Uint32Array.from(J,v=>map[v]); }
      else ({P,U,I,img}=await sideBake(P,U,I,J,atlas,cfg)); }
    unit(P); const lo=[0,1,2].map(a=>Math.min(...P.filter((_,i)=>i%3===a))), hi=[0,1,2].map(a=>Math.max(...P.filter((_,i)=>i%3===a))), L=hi[0]-lo[0];
    paint(img,cfg);
    const jpg=await sharp(img.data,{raw:{width:img.info.width,height:img.info.height,channels:3}}).jpeg({quality:72,mozjpeg:true}).toBuffer();
    const U16=Uint16Array.from(U,v=>Math.round(Math.max(0,Math.min(1,v))*65535));
    out[id]={p:b64(P),u:b64(U16),i:b64(Uint16Array.from(I)),t:'data:image/jpeg;base64,'+jpg.toString('base64'),tris:I.length/3,len:1,tall:+((hi[1]-lo[1])/L).toFixed(3),wide:+((hi[2]-lo[2])/L).toFixed(3),src:cfg.src||cfg.make};
    console.log(id.padEnd(12),(cfg.src||cfg.make).padEnd(18),'tris',I.length/3,'verts',P.length/3,'jpg',jpg.length,'tall',out[id].tall,'wide',out[id].wide); }
  fs.writeFileSync(OUT,JSON.stringify(out)); console.log('wrote',OUT,fs.statSync(OUT).size);
})();

// centre it, unit length along X
function unit(P){ const lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9]; for(let i=0;i<P.length;i+=3)for(let a=0;a<3;a++){ lo[a]=Math.min(lo[a],P[i+a]); hi[a]=Math.max(hi[a],P[i+a]); }
  const L=hi[0]-lo[0]; for(let i=0;i<P.length;i+=3)for(let a=0;a<3;a++)P[i+a]=(P[i+a]-(lo[a]+hi[a])/2)/L; }

// the low fish's look from the full scan: each low triangle faces left or right (up or down for a flatfish); its corners take the picture spot
// of their place seen from that side, and the picture is the full scan seen from that side, ray by ray (three-mesh-bvh), its colour read off the scan's own texture
async function sideBake(P,U,I,J,atlas,cfg){ const THREE=await import('three'), {MeshBVH}=await import('three-mesh-bvh');
  const ax=cfg.flat?1:2, bx=cfg.flat?2:1, W=TEX, H=TEX, HH=H/2;
  let bl=1e9,bh=-1e9; for(let i=0;i<P.length;i+=3){ bl=Math.min(bl,P[i+bx]); bh=Math.max(bh,P[i+bx]); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setIndex(new THREE.BufferAttribute(I,1)); const bvh=new MeshBVH(g);
  const Aw=atlas.info.width, Ah=atlas.info.height, A=atlas.data, d=Buffer.alloc(W*H*3), hit=new Uint8Array(W*H), ray=new THREE.Ray(), tri=new THREE.Triangle(), bc=new THREE.Vector3(), va=new THREE.Vector3(), vb=new THREE.Vector3(), vc=new THREE.Vector3();
  for(let h=0;h<2;h++)for(let j=0;j<HH;j++)for(let i=0;i<W;i++){ const x=-.5+(i+.5)/W, b=bl+(j+.5)/HH*(bh-bl), s=h?-1:1, o=[x,0,0]; o[bx]=b; o[ax]=2*s; const dv=[0,0,0]; dv[ax]=-s;
    ray.origin.set(...o); ray.direction.set(...dv); const r=bvh.raycastFirst(ray,THREE.DoubleSide); if(!r)continue; const f=r.face; va.fromArray(P,f.a*3); vb.fromArray(P,f.b*3); vc.fromArray(P,f.c*3); tri.set(va,vb,vc); tri.getBarycoord(r.point,bc);
    const u=U[f.a*2]*bc.x+U[f.b*2]*bc.y+U[f.c*2]*bc.z, v=U[f.a*2+1]*bc.x+U[f.b*2+1]*bc.y+U[f.c*2+1]*bc.z, px=Math.min(Aw-1,Math.max(0,Math.floor(u*Aw))), py=Math.min(Ah-1,Math.max(0,Math.floor(v*Ah))), q=(py*Aw+px)*3, t=((h*HH+j)*W+i);
    d[t*3]=A[q]; d[t*3+1]=A[q+1]; d[t*3+2]=A[q+2]; hit[t]=1; }
  for(let pass=0;pass<12;pass++){ const nh=hit.slice(); for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const t=y*W+x; if(hit[t])continue; let r=0,gg=0,b=0,c=0; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+dx, Y=y+dy; if(X<0||Y<0||X>=W||Y>=H||(Y<HH)!==(y<HH))continue; const q=Y*W+X; if(!hit[q])continue; r+=d[q*3]; gg+=d[q*3+1]; b+=d[q*3+2]; c++; } if(c){ d[t*3]=r/c; d[t*3+1]=gg/c; d[t*3+2]=b/c; nh[t]=1; } } hit.set(nh); }   // grow the picture past the fish's edge so its rim never shows the background
  const NP=[], NU=[], NI=[], key=new Map(), e1=new THREE.Vector3(), e2=new THREE.Vector3();
  for(let t=0;t<J.length;t+=3){ const ids=[J[t],J[t+1],J[t+2]]; va.fromArray(P,ids[0]*3); vb.fromArray(P,ids[1]*3); vc.fromArray(P,ids[2]*3); const n=e1.subVectors(vb,va).cross(e2.subVectors(vc,va)); const side=n.getComponent(ax)>=0?0:1;
    for(const v of ids){ const k=v*2+side; let r=key.get(k); if(r==null){ r=NP.length/3; key.set(k,r); NP.push(P[v*3],P[v*3+1],P[v*3+2]); NU.push(Math.max(0,Math.min(1,P[v*3]+.5)),(side*HH+Math.max(.5,Math.min(HH-.5,(P[v*3+bx]-bl)/(bh-bl)*HH)))/H); } NI.push(r); } }
  return {P:Float32Array.from(NP),U:Float32Array.from(NU),I:Uint32Array.from(NI),img:{data:d,info:{width:W,height:H}}}; }

// turn the fish: its length (first principal axis) onto X, the head (the bulkier end) to +X; its height onto Y, the belly (the paler side) down.
// A flatfish lies on its side: its thin axis is up, the dark (eyed) side up.
function orient(P,U,img,cfg){
  const n=P.length/3, m=[0,0,0]; for(let i=0;i<n;i++)for(let a=0;a<3;a++)m[a]+=P[i*3+a]/n;
  const C=[[0,0,0],[0,0,0],[0,0,0]]; for(let i=0;i<n;i++)for(let a=0;a<3;a++)for(let b=0;b<3;b++)C[a][b]+=(P[i*3+a]-m[a])*(P[i*3+b]-m[b])/n;
  const ax=[]; let M=C.map(r=>r.slice()); for(let k=0;k<3;k++){ let v=[1,.7,.3]; if(k)v=[v[2],v[0],v[1]]; for(let it=0;it<200;it++){ let w=M.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]); for(const q of ax){ const d=w[0]*q[0]+w[1]*q[1]+w[2]*q[2]; w=w.map((x,i)=>x-d*q[i]); } const l=Math.hypot(...w)||1; v=w.map(x=>x/l); } ax.push(v); }
  let [X,Y,Z]=ax; if(cfg.flat)[Y,Z]=[Z,Y];
  const pr=(i,v)=>(P[i*3]-m[0])*v[0]+(P[i*3+1]-m[1])*v[1]+(P[i*3+2]-m[2])*v[2];
  let xl=1e9,xh=-1e9; for(let i=0;i<n;i++){ const x=pr(i,X); xl=Math.min(xl,x); xh=Math.max(xh,x); }
  const end=s=>{ let a=0,c=0; for(let i=0;i<n;i++){ const t=(pr(i,X)-xl)/(xh-xl); if(s?t>.82:t<.18){ a+=Math.abs(pr(i,Z))+.5*Math.abs(pr(i,Y)); c++; } } return a/Math.max(1,c); };
  if(end(0)>end(1))X=X.map(v=>-v);   // the head is the end with more body round it (the tail end is a thin fin)
  const W=img.info.width, H=img.info.height, px=i=>{ const x=Math.min(W-1,Math.floor(U[i*2]*W)), y=Math.min(H-1,Math.floor(U[i*2+1]*H)), o=(y*W+x)*3, d=img.data; return lum(d[o],d[o+1],d[o+2]); };
  let up=0,dn=0,cu=0,cd=0; for(let i=0;i<n;i++){ const y=pr(i,Y); if(y>0){ up+=px(i); cu++; } else { dn+=px(i); cd++; } }
  const upPale=up/Math.max(1,cu)>dn/Math.max(1,cd); if(cfg.flat?upPale:upPale)Y=Y.map(v=>-v);
  if(cfg.flipX)X=X.map(v=>-v); if(cfg.flipY)Y=Y.map(v=>-v);
  Z=[X[1]*Y[2]-X[2]*Y[1],X[2]*Y[0]-X[0]*Y[2],X[0]*Y[1]-X[1]*Y[0]];
  for(let i=0;i<n;i++){ const a=pr(i,X), b=pr(i,Y), c=pr(i,Z); P[i*3]=a; P[i*3+1]=b; P[i*3+2]=c; }
  function lum(r,g,b){ return .3*r+.59*g+.11*b; } }

// the tints and the marks a stand-in scan lacks (the striped bass's lines, the pike's pale spots, a pumpkinseed's orange belly), painted into the texture
function paint(img,cfg){ const d=img.data, W=img.info.width, H=img.info.height, t=cfg.tint;
  if(cfg.koi){ const K={gold:[[236,178,48],[250,214,110]],orange:[[240,120,30],[250,170,80]],platinum:[[214,218,222],[238,240,242]],black:[[30,30,34],[56,50,46]],goldfish:[[250,118,18],[252,132,30]],
      asagi:[[226,110,50],[120,150,180]],showa:[[214,40,30],[244,240,232]],sanke:[[214,40,30],[244,240,232]]}[cfg.koi];
    let sd=11; const rn=()=>((sd=sd*16807%2147483647)/2147483647), blots=[]; if(cfg.koi==='showa'||cfg.koi==='sanke')for(let k=0;k<(cfg.koi==='showa'?26:12);k++)blots.push([rn()*W,rn()*H,(cfg.koi==='showa'?8:4)+rn()*(cfg.koi==='showa'?16:7)]);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const o=(y*W+x)*3, r=d[o], g=d[o+1], b=d[o+2], l=(.3*r+.59*g+.11*b)/255, red=r>g*1.35&&r>90; if(l<.12)continue;   // the eyes and the darkest lines kept
      let c=red?K[0]:K[1]; if(cfg.koi==='asagi'&&!red&&((x>>3)+(y>>3))%2)c=c.map(v=>v*.85); const sh=Math.min(1.25,l/(red?.45:.85)); for(let a=0;a<3;a++)d[o+a]=Math.min(255,c[a]*sh);
      for(const [bx,by,br] of blots)if((x-bx)**2+(y-by)**2<br*br){ for(let a=0;a<3;a++)d[o+a]=24+8*a; break; } } }
  if(cfg.belly){ const HH=H/2; for(let y=0;y<H;y++){ const f=Math.max(0,1-(y%HH)/HH/.45)**1.2*.85; if(f<=0)continue; for(let x=0;x<W;x++){ const o=(y*W+x)*3, l=Math.min(1.3,(.3*d[o]+.59*d[o+1]+.11*d[o+2])/95); for(let a=0;a<3;a++)d[o+a]=d[o+a]*(1-f)+Math.min(255,cfg.belly[a]*l)*f; } } }
  if(t)for(let o=0;o<d.length;o+=3){ const l=.3*d[o]+.59*d[o+1]+.11*d[o+2]; for(let a=0;a<3;a++)d[o+a]=Math.max(0,Math.min(255,(d[o+a]*.45+l*.55)*t[a])); }
  if(cfg.stripes)for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const o=(y*W+x)*3, l=.3*d[o]+.59*d[o+1]+.11*d[o+2]; if(l>60&&l<215&&Math.sin(y/H*Math.PI*2*26)>.72)for(let a=0;a<3;a++)d[o+a]*=.55; }
  if(cfg.spots){ let s=7; const r=()=>((s=s*16807%2147483647)/2147483647); for(let k=0;k<W*H/220;k++){ const cx=r()*W, cy=r()*H, rx=1.2+r()*1.6; for(let y=Math.floor(cy-rx);y<=cy+rx;y++)for(let x=Math.floor(cx-rx*1.7);x<=cx+rx*1.7;x++){ if(x<0||y<0||x>=W||y>=H)continue; if(((x-cx)/1.7)**2+(y-cy)**2>rx*rx)continue; const o=(y*W+x)*3; d[o]=Math.min(255,d[o]*.5+120); d[o+1]=Math.min(255,d[o+1]*.5+128); d[o+2]=Math.min(255,d[o+2]*.5+92); } } } }

// built here: the Atlantic sturgeon (a long shark-like body, a flat shovel snout with four barbels, five rows of bony scutes, the upper tail lobe long)
// and the blue crab (a wide carapace with a spine each side, blue claws, four walking legs and two paddles), each with a painted texture
const MAKE={
  sturgeon:async()=>{ const P=[],U=[],I=[], R=14, N=40, prof=t=>{ const snout=Math.min(1,t/.16), body=Math.sin(Math.PI*Math.min(1,(t-.0)/.86))**.6; return [.012+.07*body*(.35+.65*snout),.045+.04*body]; };
    for(let i=0;i<=N;i++){ const t=i/N, x=.5-t, [h,w]=prof(t), yc=-.01+.012*Math.sin(t*3)-(t<.14?.02*(1-t/.14):0);
      for(let k=0;k<=R;k++){ const a=k/R*Math.PI*2, c=Math.cos(a), s=Math.sin(a), sc=1+.18*Math.max(0,Math.cos(a*5))**8; P.push(x,yc+c*h*(c<0?.75:1)*sc,s*w*sc); U.push(k/R,t*.5); } }
    for(let i=0;i<N;i++)for(let k=0;k<R;k++){ const a=i*(R+1)+k, b=a+R+1; I.push(a,b,a+1,a+1,b,b+1); }
    const fin=(pts,v0)=>{ const o=P.length/3; for(const [x,y,z] of pts){ P.push(x,y,z); U.push(.75+(x+.5)*.2,.55+v0+y*.4); } for(let k=1;k<pts.length-1;k++){ I.push(o,o+k,o+k+1,o,o+k+1,o+k); } };
    fin([[-.37,.0,0],[-.5,.13,0],[-.56,.15,0],[-.47,.03,0],[-.5,-.06,0],[-.42,-.02,0]],0);   // the tail: a long upper lobe
    fin([[-.18,.06,0],[-.27,.12,0],[-.31,.1,0],[-.27,.05,0]],.1); fin([[-.2,-.05,0],[-.28,-.1,0],[-.31,-.08,0],[-.26,-.04,0]],.1);
    for(const s of [-1,1]){ fin([[.28,-.05,s*.035],[.18,-.08,s*.12],[.13,-.07,s*.12],[.2,-.045,s*.04]],.2); fin([[.43,-.035,s*.006],[.43,-.075,s*.012],[.432,-.074,s*.016],[.432,-.034,s*.01]],.3); }
    const W=256,H=256,d=Buffer.alloc(W*H*3); for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const o=(y*W+x)*3, u=x/W, belly=Math.max(0,Math.cos((u-.5)*Math.PI*2)), n=(Math.sin(x*1.7+y*.9)*Math.sin(y*2.3-x*.4)+1)*.06;
      let r=72+90*belly, g=68+82*belly, b=58+70*belly; const sc=[0,.2,.4,.6,.8].some(c=>Math.abs(u-c)<.018)&&((y>>2)&1); if(sc){ r=r*.6+90; g=g*.6+84; b=b*.6+70; } if(u>.75&&y>H*.55){ r=64; g=58; b=50; }
      d[o]=Math.min(255,r*(1+n)); d[o+1]=Math.min(255,g*(1+n)); d[o+2]=Math.min(255,b*(1+n)); }
    return {P:Float32Array.from(P),U:Float32Array.from(U),I:Uint32Array.from(I),img:{data:d,info:{width:W,height:H}}}; },
  crab:async()=>{ const P=[],U=[],I=[];
    const tube=(pts,r0,r1,uv,flat=1)=>{ const S=6, o=P.length/3; pts.forEach((c,i)=>{ const t=i/(pts.length-1), r=r0+(r1-r0)*t, n=pts[Math.min(i+1,pts.length-1)], p=pts[Math.max(i-1,0)], dx=n[0]-p[0], dy=n[1]-p[1], dz=n[2]-p[2], l=Math.hypot(dx,dy,dz)||1, D=[dx/l,dy/l,dz/l];
        const A=Math.abs(D[1])<.9?[0,1,0]:[1,0,0], X=[D[1]*A[2]-D[2]*A[1],D[2]*A[0]-D[0]*A[2],D[0]*A[1]-D[1]*A[0]], xl=Math.hypot(...X); X[0]/=xl; X[1]/=xl; X[2]/=xl; const Y=[D[1]*X[2]-D[2]*X[1],D[2]*X[0]-D[0]*X[2],D[0]*X[1]-D[1]*X[0]];
        for(let k=0;k<=S;k++){ const a=k/S*Math.PI*2, ca=Math.cos(a)*r, sa=Math.sin(a)*r*flat; P.push(c[0]+X[0]*ca+Y[0]*sa,c[1]+X[1]*ca+Y[1]*sa,c[2]+X[2]*ca+Y[2]*sa); U.push(uv[0]+k/S*.2,uv[1]+t*.2); } });
      for(let i=0;i<pts.length-1;i++)for(let k=0;k<S;k++){ const a=o+i*(S+1)+k, b=a+S+1; I.push(a,a+1,b,a+1,b+1,b); } };
    // the carapace: twice as wide as long, a long spine each side, a toothed front edge, domed on top and flat below
    { const NX=14, NZ=28, o=P.length/3, out=(z)=>{ const az=Math.abs(z); return .23*Math.sqrt(Math.max(0,1-Math.pow(az/.5,2.4)))+(az>.42?.0:0); };
      for(const top of [1,0])for(let i=0;i<=NX;i++)for(let j=0;j<=NZ;j++){ const z=-.5+j/NZ, sp=Math.exp(-Math.pow((Math.abs(z)-.5)/.035,2)), zz=z*(1+.42*sp*0), w=out(z), fx=-w+(2*w)*i/NX, tooth=i===NX?.015*Math.abs(Math.sin(z*60)):0, rr=Math.min(1,(fx/(w||1))**2+(z/.5)**2);
        const zs=z+(Math.abs(z)>.38?Math.sign(z)*.16*Math.exp(-Math.pow((fx-.02)/.05,2))*Math.max(0,(Math.abs(z)-.38)/.12):0);
        P.push(fx+tooth,top?.02+.1*Math.max(0,1-rr)**.6:0,zs); U.push(.02+.46*(i/NX),top?.02+.46*(j/NZ):.52+.46*(j/NZ)); }
      const R=NZ+1, B=(NX+1)*R; for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){ const a=o+i*R+j, b=a+R; I.push(a,b,a+1,a+1,b,b+1); I.push(a+B,a+1+B,b+B,a+1+B,b+1+B,b+B); }
      for(let i=0;i<NX;i++)for(const j of [0,NZ]){ const a=o+i*R+j, b=a+R; I.push(a,a+B,b,b,a+B,b+B); } }
    for(const s of [-1,1]){
      for(let l=0;l<4;l++){ const x0=.08-l*.075, a=s*(.15+.28*l), z0=s*.36, kx=Math.sin(a)*.5, kz=Math.cos(a)*.5*s;   // four walking legs, then the paddle
        const p1=[x0,.02,z0], p2=[x0-.06*l-.02,.1,z0+s*.2], p3=[x0-.09*l-.05,.02,z0+s*.38], p4=[x0-.11*l-.08,-.08,z0+s*.48]; tube([p1,p2,p3,p4],.022,.008,[.52,.52+.12*(l&1)]); }
      { const p1=[-.14,.02,s*.3], p2=[-.22,.06,s*.48], p3=[-.3,.04,s*.6]; tube([p1,p2,p3],.022,.016,[.52,.52]); tube([p3,[-.36,.03,s*.66]],.05,.035,[.52,.52],.25); }
      { const p1=[.12,.02,s*.3], p2=[.22,.07,s*.42], p3=[.34,.05,s*.4], p4=[.42,.04,s*.33]; tube([p1,p2,p3],.025,.032,[.76,.52]); tube([p3,p4,[.5,.035,s*.27]],.045,.012,[.76,.76]); tube([[.38,.03,s*.36],[.45,.02,s*.31],[.5,.0,s*.26]],.02,.006,[.76,.76]); }
      tube([[.2,.06,s*.07],[.24,.1,s*.08]],.008,.012,[.52,.76]); }
    const W=256,H=256,d=Buffer.alloc(W*H*3); let sd=3; const rn=()=>((sd=sd*16807%2147483647)/2147483647);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const o=(y*W+x)*3, u=x/W, v=y/H, n=(Math.sin(x*.9+Math.sin(y*.3)*3)*Math.cos(y*1.1)+1)*.07; let c;
      if(u<.5&&v<.5){ const r=Math.hypot(u-.25,(v-.25)*.7)/.25; c=[92-20*r,104-14*r,72-6*r]; if(Math.hypot(u-.25,v-.25)>.21)c=[60,96,120]; }
      else if(u<.5)c=[226,220,198];
      else if(u>.74&&v>.74)c=v>.9?[210,74,52]:[66,112,186];
      else if(u>.74)c=[70,118,176]; else c=[88,122,150];
      for(let a=0;a<3;a++)d[o+a]=Math.min(255,c[a]*(1+n)); }
    for(let k=0;k<500;k++){ const x=Math.floor(rn()*W*.48), y=Math.floor(rn()*H*.48), o=(y*W+x)*3; for(let a=0;a<3;a++)d[o+a]*=.7; }
    return {P:Float32Array.from(P),U:Float32Array.from(U),I:Uint32Array.from(I),img:{data:d,info:{width:W,height:H}}}; }};

// THE BLOCK: BLK builds what stands between the real buildings across Market St, on the Hudson row and on West St: empty parking lots and empty dirt lots (no fences).
import {SHARED, THREE} from './003-shx.js';
import {BLK, PARK, pos, ROOMS, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLOCK, cutWalls, FIX, LEVEL, MAINROW, MAPG, MODS, RING, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {PEEK} from './008-batch.js';
import {BRICKS} from './014-gamekit.js';
import {FOUNT} from './060a-fount.js';
Object.assign(BLK,{blds:[],lots:[],signs:[],band:()=>null}); window.BLK=BLK;
{ const T=TILE, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, B=BLOCK, s=T/24, YP=px=>px*ZU;
  let seed=11; const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
  const cv=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
  const tex=c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const G=new THREE.Group(); G.name='block'; scene.add(G); MAPG.block=G;   // (one of the map's groups: hidden and let go in a room off the map like the rest of the street)
  const solid=(x0,y0,x1,y1,hpx)=>{ const a=XS(x0), b=XS(x1), c=ZS(y0), d=ZS(y1); SOL.up.push([Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]); FIX.up.push([Math.min(a,b),Math.min(c,d),0,Math.max(a,b),Math.max(c,d),YP(hpx)]); };
  const ST=120;
  const SW=300, SH=240, SWA=[1,2].map(k=>{ const a=new Uint8ClampedArray(SW*SH*3); for(let j=0;j<SH;j++)for(let i=0;i<SW;i++){ const v=BRICKS.face(i,j,k*97,1e9), o=(j*SW+i)*3; a[o]=v[0]; a[o+1]=v[1]; a[o+2]=v[2]; } return a; });
  function face(Wt,Hpx,o){ const Q=o.q||1, w=Wt*24, h=Math.round(YP(Hpx)/s), c=cv(w*Q,h*Q), g=c.getContext('2d'), im=g.createImageData(c.width,c.height), e=cv(w*Q,h*Q), q=e.getContext('2d');
    const A=SWA[o.k%2], ox=(o.k*37)%SW, oy=(o.k*13)%6*6;
    for(let j=0;j<c.height;j++){ const sj=((j/Q|0)+oy)%SH, gr=j>c.height*.8?1-.16*(j-c.height*.8)/(c.height*.2):1; for(let i=0;i<c.width;i++){ const a=(sj*SW+((i/Q|0)+ox)%SW)*3, k=(j*c.width+i)*4; im.data[k]=A[a]*o.tint[0]*gr; im.data[k+1]=A[a+1]*o.tint[1]*gr; im.data[k+2]=A[a+2]*o.tint[2]*gr; im.data[k+3]=255; } }
    g.putImageData(im,0,0); g.scale(Q,Q); q.scale(Q,Q); q.fillStyle='#000'; q.fillRect(0,0,w,h);
    const py=px=>h-Math.round(YP(px)/s);
    g.fillStyle='rgba(30,26,24,.9)'; g.fillRect(0,0,w,3); g.fillStyle='rgba(255,255,255,.12)'; g.fillRect(0,3,w,1);
    for(let f=1;f*ST<Hpx-30;f++){ const y=py(f*ST); g.fillStyle='rgba(40,34,30,.55)'; g.fillRect(0,y,w,3); g.fillStyle='rgba(255,240,220,.14)'; g.fillRect(0,y-1,w,1);
      if(!o.blank)for(let x=20;x+30<w-10;x+=58){ const wy=py(f*ST+86), wh=py(f*ST+28)-wy, lit=rnd()<(o.lit||.18), col=lit?['#f2c27a','#ffd79a','#cfe3ff','#ffb2c8'][(rnd()*4)|0]:'#1d1b26';
        g.fillStyle='#3a3640'; g.fillRect(x-2,wy-2,34,wh+4); g.fillStyle=col; g.fillRect(x,wy,30,wh); g.fillStyle='#3a3640'; g.fillRect(x+14,wy,2,wh);
        if(lit){ q.fillStyle=col; q.fillRect(x,wy,30,wh); const cw=6+((rnd()*12)|0); q.fillStyle='#000'; q.fillRect(x,wy,cw,wh); g.fillStyle='rgba(20,16,20,.55)'; g.fillRect(x,wy,cw,wh); }
        g.fillStyle='#8a8478'; g.fillRect(x-3,wy+wh+2,36,2); } }
    const top=py(o.shop==='glass'?100:96), bot=h;
    if(o.shop==='shut'){ g.fillStyle='#7c7e86'; g.fillRect(8,top,w-16,bot-top); for(let y=top+2;y<bot;y+=3){ g.fillStyle='#5e6068'; g.fillRect(8,y,w-16,1); } g.fillStyle='#4a4c54'; g.fillRect(8,top,w-16,4);
      for(let k=0;k<3;k++){ const x=12+rnd()*(w-40); g.fillStyle=['#2a2a30','#7a3a4a','#2a4a6a'][k]; for(let t=0;t<14;t++)g.fillRect(x+t*1.5+((rnd()*2)|0),top+10+rnd()*20,2,2); } }
    else if(o.shop==='glass'){
      const L0=o.door==='l'?62:10, L1=o.door==='l'?w-10:w-58; for(let x0=L0;x0<L1-30;x0+=96){ const x1=Math.min(x0+84,L1), gw=x1-x0, gt=top+4, gb=bot-12;
        g.fillStyle='#2c2a30'; g.fillRect(x0-2,gt-2,gw+4,bot-gt+2); g.fillStyle='#16151e'; g.fillRect(x0,gt,gw,gb-gt);
        const sh=gt+Math.round((gb-gt)*.45); g.fillStyle='#5a4028'; g.fillRect(x0+3,sh,gw-6,gb-sh); q.fillStyle='#4a3014'; q.fillRect(x0+3,sh,gw-6,gb-sh);
        for(let k=0;k<gw-10;k+=7){ const c=['#c86a3a','#e8c070','#8ab060','#d84a4a'][(rnd()*4)|0]; g.fillStyle=c; g.fillRect(x0+5+k,sh+3,4,4); q.fillStyle='#3a2410'; q.fillRect(x0+5+k,sh+3,4,4); }
        g.fillStyle='#e8d8b0'; q.fillStyle='#6a5430'; const mx=x0+6+rnd()*(gw-24); g.fillRect(mx,gt+6,10,13); q.fillRect(mx,gt+6,10,13);
        g.fillStyle='rgba(255,255,255,.1)'; for(let k=0;k<6;k++)g.fillRect(x0+4+k,gt+4+k*2,1,6);
        g.fillStyle='#2c2a30'; g.fillRect(x0+Math.round(gw/2)-1,gt,2,gb-gt); g.fillStyle='#3a3842'; g.fillRect(x0,gb,gw,bot-gb); } }
    if(o.shop){ g.fillStyle=o.band||'#24222c'; g.fillRect(4,py(124),w-8,py(100)-py(124)); g.fillStyle='rgba(255,255,255,.08)'; g.fillRect(4,py(124),w-8,1); }
    if(o.garage){ const gw=Math.min(72,w-16), gx=Math.round((w-gw)/2); g.fillStyle='#56534d'; g.fillRect(gx,py(96),gw,h-py(96)); g.fillStyle='#3b3934'; for(let k=1;k<7;k++)g.fillRect(gx,py(96)+Math.round(k*(h-py(96))/7),gw,2); g.fillStyle='#2e2c28'; g.fillRect(gx-2,py(98),2,h-py(98)); g.fillRect(gx+gw,py(98),2,h-py(98)); }
    else if(!o.nodoor)for(const dx of o.doors?Array.from({length:o.doors},(_,k)=>Math.round((k+.5)*w/o.doors)-19):[o.door==='l'?14:w-14-38]){ g.fillStyle='#2e2a26'; g.fillRect(dx,py(94),38,h-py(94)); g.fillStyle='#4a443c'; g.fillRect(dx+2,py(92),34,h-py(92)-1); g.fillStyle='#c8b070'; g.fillRect(dx+30,py(46),3,3); }
    g.fillStyle='rgba(20,18,16,.35)'; g.fillRect(0,h-4,w,4);
    return {map:tex(c),em:tex(e)}; }
  const roofM=new THREE.MeshLambertMaterial({color:0x3a3840});
  function building(o){ const W=o.x1-o.x0, D=o.y1-o.y0, H=YP(o.h);
    const FW=o.e?D:W, SD=o.e?W:D, f=(k,shop,door)=>face(FW,o.h,{k,tint:o.tint,lit:o.lit,shop,door,garage:o.garage,blank:1});
    const L=fc=>new THREE.MeshLambertMaterial({map:fc.map,emissive:0xffffff,emissiveMap:fc.em}), F=L(f(o.k,null,'r')), Bk=L(f(o.k+50,null,'l')), S=L(face(SD,o.h,{k:o.k+90,tint:o.tint,lit:0,blank:1,nodoor:1}));
    const m=new THREE.Mesh(new THREE.BoxGeometry(W*T,H,D*T),o.e?[F,Bk,roofM,roofM,S,S]:[S,S,roofM,roofM,Bk,F]); m.position.set((XS(o.x0)+XS(o.x1))/2,H/2,(ZS(o.y0)+ZS(o.y1))/2); m.castShadow=false; m.receiveShadow=true; G.add(m);
    const cope=new THREE.Mesh(new THREE.BoxGeometry(W*T+.1*T,YP(8),D*T+.1*T),new THREE.MeshLambertMaterial({color:0x4a464e})); cope.position.set(m.position.x,H+YP(4),m.position.z); G.add(cope); PEEK.whole(m); PEEK.whole(cope);
    solid(o.x0,o.y0,o.x1,o.y1,o.h); BLK.blds.push({...o,mesh:m}); return m; }
  const gy=(x,y)=>MODS.bodega&&MODS.bodega.ground?MODS.bodega.ground(XS(x),ZS(y)):0;
  const quad=(P,U,I,a,b,c,d,ua,ub,uc,ud)=>{ const o=P.length/3; P.push(...a,...b,...c,...d); U.push(...ua,...ub,...uc,...ud); I.push(o,o+1,o+2,o,o+2,o+3); };
  const mesh=(P,U,I,mat)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); g.setIndex(I); g.computeVertexNormals(); const me=new THREE.Mesh(g,mat); me.receiveShadow=true; G.add(me); PEEK.whole(me); return me; };
  const lotPaint=(q,g,w,h)=>{ const R=(a,b)=>a+rnd()*(b-a), toC=(x,y)=>[(x-q.x0)*24,(q.y1-y)*24];
    if(q.kind==='park'){ g.fillStyle='#3e4044'; g.fillRect(0,0,w,h); for(let k=0;k<w*h/40;k++){ const v=50+rnd()*30|0; g.fillStyle=`rgb(${v},${v+1},${v+4})`; g.fillRect(R(0,w)|0,R(0,h)|0,1,1); }
      for(let k=0;k<4;k++){ g.fillStyle='rgba(20,20,24,.35)'; g.beginPath(); g.ellipse(R(0,w),R(0,h),R(8,26),R(5,14),0,0,7); g.fill(); }
      g.fillStyle='#d9d6c8'; const sp=2.6*24, len=5*24;
      if(q.side==='e'){ for(let y=sp*.5;y<h-4;y+=sp){ g.fillRect(0,y|0,len,2); g.fillStyle='#8a8478'; g.fillRect(10,(y+sp*.35)|0,8,3); g.fillStyle='#d9d6c8'; } }
      else { const top=q.side==='s'?h-len:0; for(let x=sp*.5;x<w-4;x+=sp){ g.fillRect(x|0,top,2,len); g.fillStyle='#8a8478'; g.fillRect((x+sp*.35)|0,q.side==='s'?h-14:10,10,3); g.fillStyle='#d9d6c8'; } } }
    else { g.fillStyle='#5e5040'; g.fillRect(0,0,w,h); for(let k=0;k<w*h/30;k++){ const v=rnd(); g.fillStyle=v<.5?'#6e5e4a':v<.8?'#4e4234':'#7a6a54'; g.fillRect(R(0,w)|0,R(0,h)|0,2,2); }
      for(let k=0;k<w*h/260;k++){ const x=R(2,w-2), y=R(2,h-2), c=['#5a7a32','#6e8e3a','#48682a','#7e9a44'][rnd()*4|0]; g.fillStyle=c; for(let t=0;t<5;t++)g.fillRect(x+R(-3,3),y+R(-4,1),1,R(3,6)); }
      for(let k=0;k<3;k++){ g.fillStyle=['#b8b4a8','#8a3a2a','#3a5a7a'][k]; g.fillRect(R(6,w-12)|0,R(6,h-12)|0,R(3,7)|0,R(2,4)|0); } } };
  function lot(q){ const W=q.x1-q.x0, D=q.y1-q.y0, c=cv(W*24,D*24); lotPaint(q,c.getContext('2d'),c.width,c.height);
    const P=[], U=[], I=[], y=.02*T, v=(x,yy)=>[XS(x),gy(x,yy)+y,ZS(yy)];
    quad(P,U,I,v(q.x0,q.y0),v(q.x1,q.y0),v(q.x1,q.y1),v(q.x0,q.y1),[0,0],[1,0],[1,1],[0,1]);
    mesh(P,U,I,new THREE.MeshLambertMaterial({map:tex(c),side:THREE.DoubleSide}));
    BLK.lots.push(q); }
  const TINTS=[[1.3,.82,.66],[1.12,1,.84],[.92,.95,1.02],[1.2,.95,.8],[1.05,.9,.92],[.98,1.02,.92],[1.25,.88,.72],[1.1,1.04,.95],[.9,.9,.96]], KINDS=['empty','park','empty'];   // no garages for now (owner, 9 Nov 2026): an empty lot where one stood
  const fill=(a,b,mk)=>{ let x=a, i=0; while(b-x>1.5){ const r=((Math.sin(x*12.9898+i*78.233)*43758.5453)%1+1)%1, w=6+r*4, e=b-x-w<3?b:x+w; mk(x,e,i++); x=e; } };
  const holes=(on,a0,a1)=>{ const g=[]; let y=a0; for(const [a,b] of on.slice().sort((p,q)=>p[0]-q[0])){ if(a>=a1)break; if(a-.1>y)g.push([y,a-.1]); y=Math.max(y,b+.1); } if(a1>y)g.push([y,a1]); return g; };   // (only the stretch a0..a1: a span past its end leaves no gap)
  let n=0; const spot=(row,off,i,box)=>{ n++; const kind=row===1||row===2?'empty':KINDS[(i+off)%3], side=row===1?'s':row===2?'n':'e';   // Market St's row and the Hudson row: empty lots in every gap
    if(kind==='garage')building({...box,h:112,e:row===5,k:400+n*11,tint:TINTS[n%TINTS.length],lit:0,garage:true,row});
    else lot({...box,kind,row,side}); };
  // (the Drive's buildings on the rows, data/world.json block.pf, keep their spans)
  const PASS=LEVEL.places.filter(p=>p.kind==='passage').map(p=>[p.x0,p.x1]), ON1=LEVEL.places.filter(p=>p.y1!=null&&p.y0===B.back&&p.y1===B.front&&p.row!==2).map(p=>[p.x0,p.x1]), ON2=LEVEL.places.filter(p=>p.row===2).map(p=>[p.x0,p.x1]);   // garages fill every gap along both rows, flush to the buildings (owner, 8 Nov 2026: "no gaps in between buildings, garages")
  for(const [a,b] of holes(MAINROW.concat(B.pf[1]||[],ON1,PASS),B.x0,B.x1))fill(a,b,(x0,x1,i)=>spot(1,0,i,{x0,x1,y0:B.back,y1:SHARED.BOD.OY}));
  for(const p of LEVEL.places)if(p.kind==='lot'&&p.y1==null)lot({x0:p.x0,x1:p.x1,y0:B.back,y1:SHARED.BOD.OY,kind:'empty',row:1,side:'s'});   // a lot the level file keeps open (the flea market's)
  for(const p of LEVEL.places)if(p.kind==='lot'&&p.row===2)lot({x0:p.x0,x1:p.x1,y0:B.row2[0],y1:B.row2[1],kind:'empty',row:2,side:'s'});   // the Hudson row's open lots (the fish market's tables, the flea market's), 6 Nov 2026
  // a tall barbed-wire fence on an open lot's alley side (the fish market's, owner 6 Nov 2026: "a tall barbed wire gate to the alley"): posts, mesh, and a coil along the top; solid
  for(const p of LEVEL.places)if(p.fence==='barbed'&&p.y1!=null){ const y=p.y1-.15, z=ZS(y), xa=XS(p.x0), xb=XS(p.x1), Hf=YP(70), FG=new THREE.Group(); FG.name='barbed';
    const iron=new THREE.MeshLambertMaterial({color:0x3a3c40}), mesh=new THREE.MeshLambertMaterial({color:0x8a8c90,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}), wire=new THREE.MeshLambertMaterial({color:0xa8aab0});
    const n=Math.max(2,Math.round(Math.abs(xb-xa)/(2.4*T)));
    for(let i=0;i<=n;i++){ const x=xa+(xb-xa)*i/n, m=new THREE.Mesh(new THREE.BoxGeometry(.08*T,Hf,.08*T),iron); m.position.set(x,Hf/2,z); FG.add(m); }
    { const m=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(xb-xa),Hf*.92),mesh); m.position.set((xa+xb)/2,Hf*.46,z); FG.add(m); }
    for(const h of [.05,.5,.97]){ const m=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(xb-xa),.05*T,.05*T),iron); m.position.set((xa+xb)/2,Hf*h,z); FG.add(m); }
    { const c=new THREE.Mesh(new THREE.TorusGeometry(.22*T,.018*T,4,10),wire), L=Math.abs(xb-xa), k=Math.round(L/(.3*T)), C=new THREE.InstancedMesh(c.geometry,wire,k), M4=new THREE.Matrix4(), q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);
      for(let i=0;i<k;i++)C.setMatrixAt(i,M4.compose(new THREE.Vector3(Math.min(xa,xb)+(i+.5)*L/k,Hf+.2*T,z),q,new THREE.Vector3(1,1,1))); FG.add(C); }
    G.add(FG); solid(p.x0,y-.1,p.x1,y+.1,70); }
  for(const [a0,b0] of [[B.x0,B.x1]])for(const [a,b] of holes((B.pf[2]||[]).concat(ON2,PASS),a0,b0))fill(a,b,(x0,x1,i)=>spot(2,1,i,{x0,x1,y0:B.row2[0],y1:B.row2[1]}));
  { const F=RING.wx0, WH=LEVEL.places.filter(p=>p.y1!=null&&Math.abs(p.x1-F)<.6); for(const [a,b] of holes(WH.map(p=>[p.y0,p.y1]),Math.min(...WH.map(p=>p.y0)),Math.max(...WH.map(p=>p.y1))))fill(a,b,(y0,y1,i)=>spot(5,2,i,{x0:F-13,x1:F,y0,y1})); }   // (only between the apartment houses: none before the first or past the last)
  { const zr=a=>[Math.min(ZS(a[0]),ZS(a[1])),Math.max(ZS(a[0]),ZS(a[1]))], AL=zr(B.alley), PR=zr(B.prom), mx0=XS(SHARED.BOD.MAP.x0), mx1=XS(SHARED.BOD.MAP.x1);
    BLK.band=(x,z)=>x<mx0||x>mx1?null:z>AL[0]&&z<AL[1]?{z0:AL[0],z1:AL[1]}:z>PR[0]&&z<PR[1]?{z0:PR[0],z1:PR[1]}:null; }
  { const lane=()=>!UI.persp&&(UI.view==='iso'||UI.view==='map')&&SHARED.LVL!=='down'&&!ROOMS.cur&&BLK.band(pos.x,pos.z)&&SHARED.cam.position.z>pos.z, z0=ZS(B.back)-.6*T, z1=ZS(-77)+.6*T, bb=new THREE.Box3(); BLK.lane=lane;
    let n=0; for(const w of cutWalls){ if(!w.me||!w.me.geometry)continue; bb.setFromObject(w.me); if(bb.isEmpty()||bb.max.y<.1||bb.min.z<z0||bb.max.z>z1)continue;
      const wh=w.when, al=Object.getOwnPropertyDescriptor(w,'always'), was=al?(al.get?()=>al.get.call(w):()=>al.value):()=>false;
      w.when=()=>lane()||(wh?wh():true); Object.defineProperty(w,'always',{get:()=>lane()||was(),configurable:true}); const f0=w.foot; Object.defineProperty(w,'foot',{get:()=>lane()?Math.max(f0,YP(32)):f0,configurable:true}); n++; } BLK.walls=n; }   // from the alley or the promenade the row is cut at waist height, not hidden (owner, 6 Nov 2026)
  // the new map's backdrop near its edges (owner, 6 Nov 2026: "they see more apt buildings until it fades out"): the first blocks past each edge built as the street's are, brick with windows lit at night; further on the far city's hazed blocks carry on (134-skyline)
  BLK.back=[]; { const E=LEVEL.edge||{}, NEAR=E.near||60;
    const back=o=>{ const W=o.x1-o.x0, D=o.y1-o.y0, H=YP(o.h), L=fc=>new THREE.MeshLambertMaterial({map:fc.map,emissive:0xffffff,emissiveMap:fc.em});
      const FZ=L(face(W,o.h,{k:o.k,tint:o.tint,lit:.24,nodoor:1})), FX=L(face(D,o.h,{k:o.k+7,tint:o.tint,lit:.24,nodoor:1}));
      const m=new THREE.Mesh(new THREE.BoxGeometry(W*T,H,D*T),[FX,FX,roofM,roofM,FZ,FZ]); m.position.set((XS(o.x0)+XS(o.x1))/2,H/2,(ZS(o.y0)+ZS(o.y1))/2); m.receiveShadow=true; m.raycast=()=>{}; m.userData.haze=1; G.add(m); PEEK.whole(m); BLK.back.push({...o,mesh:m}); };
    // a row starts past the last real building on it (owner, 8 Nov 2026: "make sure the buildings dont over lap")
    const clear=(ax,p,dir,b0,b1)=>{ for(const q of LEVEL.places||[]){ const [u0,u1,v0,v1]=ax==='x'?[q.x0,q.x1,q.y0,q.y1]:[q.y0,q.y1,q.x0,q.x1]; if(u0==null||v0==null||v1<=b0||v0>=b1)continue; if(u0<p&&u1>p)p=dir<0?u0-1.2:u1+1.2; } return p; };
    let k=0; for(const [ax,a0,a1,b0,b1] of E.runs||[]){ const dir=Math.sign(a1-a0); let p=clear(ax,a0,dir,b0,b1); const end=p+dir*Math.min(Math.abs(a1-p),NEAR);
      while((end-p)*dir>2){ const w=Math.min(14+rnd()*8,Math.abs(end-p)), h=360+Math.floor(rnd()*3)*120, q1=p+dir*w, lo=Math.min(p,q1), hi=Math.max(p,q1);
        back(ax==='x'?{x0:lo,x1:hi,y0:b0,y1:b1,h,k:900+k*13,tint:TINTS[k%TINTS.length]}:{x0:b0,x1:b1,y0:lo,y1:hi,h,k:900+k*13,tint:TINTS[k%TINTS.length]}); k++; p=q1+dir*1.2; } } }
  // the streets and the park carried on past the edges (owner, 7 Nov 2026: "the map to look like it keeps going (past map) lower res ... like real nyc"): low-res ground strips, the park's wall and a band of plain trees (data/world.json edge.strips, edge.park)
  { const E=LEVEL.edge||{}, PX=4, PAL={road:[46,47,52],walk:[128,124,114],alley:[70,70,74],prom:[150,144,128]}, mats={};
    const groundM=(kind,along,across)=>{ const k=kind+along; if(mats[k])return mats[k]; const W=8, H=Math.max(2,Math.round(across*PX/4)), c=cv(W,H), g=c.getContext('2d'), base=PAL[kind]||PAL.walk;
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const n=.9+rnd()*.14; g.fillStyle=`rgb(${base.map(v=>Math.round(v*n)).join(',')})`; g.fillRect(x,y,1,1); }
      if(kind==='road'){ g.fillStyle='#c9a227'; const m=Math.floor(H/2); g.fillRect(0,m-1,W,1); g.fillRect(0,m+1,W,1); g.fillStyle='#bdbab0'; for(let x=0;x<W;x+=4){ g.fillRect(x,1,2,1); g.fillRect(x,H-2,2,1); } }
      if(kind==='walk'||kind==='prom'){ g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(0,0,1,H); g.fillRect(W/2,0,1,H); }
      const t=tex(c); t.wrapS=THREE.RepeatWrapping; return mats[k]=new THREE.MeshLambertMaterial({map:t}); };
    const M0=E.mirror, MRin=(x0,x1,y0,y1)=>M0&&y0>=M0.band[0]&&y1<=M0.band[1]&&(x0>=M0.x[1]-3&&x1<=M0.x[1]+M0.reach||x1<=M0.x[0]+3&&x0>=M0.x[0]-M0.reach);
    for(const [x0,y0,x1,y1,kind] of (E.strips&&E.strips.list)||[]){ const wx=x1-x0, wy=y1-y0, alongX=wx>=wy, along=alongX?wx:wy, across=alongX?wy:wx, m=groundM(kind,alongX?'x':'y',across).clone();
      m.map=m.map.clone(); m.map.needsUpdate=true; m.map.repeat.set(along/2,1);
      const me=new THREE.Mesh(new THREE.PlaneGeometry(alongX?wx*T:wy*T,alongX?wy*T:wx*T),m); me.rotation.x=-Math.PI/2; if(!alongX)me.rotation.z=Math.PI/2; me.position.set((XS(x0)+XS(x1))/2,MRin(x0,x1,y0,y1)?(kind==='road'?YP(SHARED.BOD.RD):0)-.004:.012,(ZS(y0)+ZS(y1))/2);   // (under the street's mirror, 161d: its painted ground drawn over them)
      me.receiveShadow=true; me.raycast=()=>{}; me.userData.cullOf=1; me.userData.haze=1; G.add(me); BLK.back.push({x0,x1,y0,y1,kind,mesh:me}); }   // (past the draw distance too: the fog fades it)
    // the land past the edges (owner, 7 Nov 2026: "set a base color for far off distance things like grass"; "needs to be entire lake visible"): one low-res grass picture outside the section, the big lake whole in it, under the strips
    { const GD=E.ground, Ls=E.lines||[]; if(GD&&Ls.length){ const [bx0,by0,bx1,by1]=GD.box, k=GD.px||2, W=Math.ceil((bx1-bx0)/k), H=Math.ceil((by1-by0)/k), c=cv(W,H), g=c.getContext('2d'), im=g.createImageData(W,H), d=im.data, gc=GD.grass, wc=GD.water;
      const SUNK=((LEVEL.sections&&LEVEL.sections.places)||[]).filter(q=>q.sunk), MR=E.mirror, WM=new Uint8Array(W*H), S=window.FOUNT&&FOUNT.S, L=S&&S.L, ox=(window.PARK&&PARK.ox)||0, oy=(window.PARK&&PARK.oy)||0;
      // what the ground is at a spot: the park's grass, lawns and waters inside the ring, its streets round it, the city's blocks past them (data/world.json sections.ring, edge.ground)
      const RG=LEVEL.sections&&LEVEL.sections.ring, PKB=RG&&RG.park, OUB=RG&&RG.outer, inR=(x,y,r)=>r&&x>r.x0&&x<r.x1&&y>r.y0&&y<r.y1, ell=(x,y,[ex,ey,rx,ry,a])=>{ const c=Math.cos((a||0)*Math.PI/180), s=Math.sin((a||0)*Math.PI/180), u=(x-ex)*c+(y-ey)*s, v=-(x-ex)*s+(y-ey)*c; return (u/rx)**2+(v/ry)**2<1; };
      const PM=new Uint8Array(W*H); { const pc=cv(W,H), pg=pc.getContext('2d'); pg.strokeStyle='#fff'; pg.lineWidth=1.6; for(const pl of GD.paths||[]){ pg.beginPath(); pl.forEach(([x,y],q)=>pg[q?'lineTo':'moveTo']((x-bx0)/k,(y-by0)/k)); pg.stroke(); } const pd=pg.getImageData(0,0,W,H).data; for(let q=0;q<W*H;q++)PM[q]=pd[q*4+3]>90?1:0; }
      const [BKX,BKY]=GD.block||[64,28], isPark=(x,y)=>!PKB||inR(x,y,PKB), kindAt=(x,y,q)=>{ if(!isPark(x,y))return inR(x,y,OUB)||!GD.city?GD.street||gc:((x-OUB.x1)%BKX+BKX)%BKX<4||((y-OUB.y1)%BKY+BKY)%BKY<4?GD.street:GD.city;
        if((GD.waters||[]).some(e=>ell(x,y,e)))return wc; if(PM[q])return GD.path||gc; if((GD.lawns||[]).some(e=>ell(x,y,e)))return GD.lawn||gc; return gc; };
      for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const x=bx0+(i+.5)*k, y=by0+(j+.5)*k, wet=L&&Math.abs(x-ox-L.x)<L.rx+12&&Math.abs(y-oy-L.y)<L.ry+12&&FOUNT.lake(x-ox,y-oy)<0, b=wet?wc:kindAt(x,y,j*W+i), n=wet?.97+rnd()*.06:.86+rnd()*.2, q=(j*W+i)*4;
        d[q]=b[0]*n; d[q+1]=b[1]*n; d[q+2]=b[2]*n; WM[q>>2]=wet?1:0; d[q+3]=wet||SUNK.some(r=>x>r.x-r.w/2&&x<r.x+r.w/2&&y>r.y-r.d/2&&y<r.y+r.d/2)?0:MR&&y>MR.ground[0]&&y<MR.ground[1]&&(x>MR.x[1]&&x<MR.x[1]+MR.reach||x<MR.x[0]&&x>MR.x[0]-MR.reach)?0:255; }
      g.putImageData(im,0,0); const t=tex(c), m=new THREE.MeshLambertMaterial({map:t,alphaTest:.5});
      const c2=cv(W,H), g2=c2.getContext('2d'), i2=g2.createImageData(W,H); for(let q=0;q<W*H;q++){ i2.data.set([d[q*4],d[q*4+1],d[q*4+2],WM[q]?255:0],q*4); } g2.putImageData(i2,0,0); const m2=new THREE.MeshLambertMaterial({map:tex(c2),alphaTest:.5}), SUB=[];   // the lake's stand-in until the park's own water is built (then it shows through the hole)
      const xs=Ls.flatMap(l=>[l[0],l[2]]), ys=Ls.flatMap(l=>[l[1],l[3]]), X0=Math.min(...xs), X1=Math.max(...xs), Y1=Math.max(...ys), step=Ls.find(l=>l[1]===l[3]&&l[1]<Y1), XB=step?Math.min(step[0],step[2]):X1, YS=step?step[1]:by0;
      const rects=[[bx0,by0,X0,by1],[X0,Y1,bx1,by1],[X1,YS,bx1,Y1],[XB,by0,bx1,YS]];
      for(const [x0,y0,x1,y1] of rects){ if(x1-x0<=0||y1-y0<=0)continue; const ge=new THREE.PlaneGeometry((x1-x0)*T,(y1-y0)*T), uv=ge.attributes.uv, u0=(x0-bx0)/(bx1-bx0), u1=(x1-bx0)/(bx1-bx0), v0=1-(y0-by0)/(by1-by0), v1=1-(y1-by0)/(by1-by0);
        for(let q=0;q<uv.count;q++)uv.setXY(q,uv.getX(q)?u1:u0,uv.getY(q)?v0:v1);
        const me=new THREE.Mesh(ge,m); me.rotation.x=-Math.PI/2; me.position.set((XS(x0)+XS(x1))/2,.004,(ZS(y0)+ZS(y1))/2); me.receiveShadow=true; me.raycast=()=>{}; me.userData.cullOf=1; G.add(me); const w2=new THREE.Mesh(ge,m2); w2.rotation.x=-Math.PI/2; w2.position.copy(me.position); w2.raycast=()=>{}; G.add(w2); SUB.push(w2); }
      SYS.add('places',()=>{ const on=!(window.FOUNT&&FOUNT.waters&&FOUNT.waters.length); for(const o of SUB)o.visible=on; },'069a-lakesub'); } }
    const P=E.park; if(P){ const [a0,b0,a1,b1]=P.wall, wl=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(XS(a1)-XS(a0)),YP(90),Math.abs(ZS(b1)-ZS(b0))),new THREE.MeshLambertMaterial({color:0x5c5a55}));
      wl.position.set((XS(a0)+XS(a1))/2,YP(45),(ZS(b0)+ZS(b1))/2); wl.raycast=()=>{}; wl.userData.cullOf=1; wl.userData.haze=1; G.add(wl);
      // Market St's park wall past the mirror's reach (161d): plain stone and a railing of bars, to the end of the strips
      if(PARK.wallOn){ const [,w0,w1]=PARK.wallOn, wa=E.mirror?E.mirror.x[1]+E.mirror.reach:PARK.wallOn[0], we=Math.max(...((E.strips&&E.strips.list)||[]).map(q=>q[2]),wa), L=XS(we)-XS(wa); if(L>0){ const cx=(XS(wa)+XS(we))/2, cz=(ZS(w0)+ZS(w1))/2, d=Math.abs(ZS(w1)-ZS(w0));
        // (in pieces, each sunk away before the end of the view, so the far plane never leaves a dark line of railing on the horizon: owner, 9 Nov 2026, "im seeing that dark line")
        const SEG=40*T, NS=Math.ceil(Math.abs(L)/SEG), x0w=Math.min(XS(wa),XS(we)), sink=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\n#ifdef USE_INSTANCING\n transformed.y*=1.-smoothstep(${(380*T).toFixed(1)},${(470*T).toFixed(1)},distance((modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz,cameraPosition));\n#endif`); };
        const rc=cv(4,16), rg=rc.getContext('2d'); rg.fillStyle='#24282b'; rg.fillRect(0,0,1,16); rg.fillRect(0,0,4,1); rg.fillRect(0,10,4,1); const rt=tex(rc); rt.wrapS=THREE.RepeatWrapping; rt.repeat.set(SEG/(.19*T*2),1);
        const wm=new THREE.MeshLambertMaterial({color:0x6a6862}), rm=new THREE.MeshLambertMaterial({map:rt,transparent:true,alphaTest:.5,side:THREE.DoubleSide}); for(const m of [wm,rm]){ m.onBeforeCompile=sink; m.customProgramCacheKey=()=>'wallsink'+(m.map?1:0); m.userData.hz=1; }
        const sw=new THREE.InstancedMesh(new THREE.BoxGeometry(SEG,YP(96),d).translate(0,YP(48),0),wm,NS), rl=new THREE.InstancedMesh(new THREE.PlaneGeometry(SEG,YP(43)).translate(0,YP(96+21.5),0),rm,NS), M4=new THREE.Matrix4();
        for(let i=0;i<NS;i++){ M4.makeTranslation(x0w+(i+.5)*SEG,0,cz); sw.setMatrixAt(i,M4); rl.setMatrixAt(i,M4); }
        for(const m of [sw,rl]){ m.raycast=()=>{}; m.userData.cullOf=1; m.frustumCulled=false; G.add(m); } BLK.back.push({parkwall:true,x0:wa,x1:we}); } }
      const BANDS=P.bands||[P.trees], N=P.n||400, crown=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0x3f6d2e,flatShading:true}),N), trunk=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0x4a3a2c}),N), M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S=new THREE.Vector3();
      const FS=window.FOUNT&&FOUNT.S, FL=FS&&FS.L, pox=(window.PARK&&PARK.ox)||0, poy=(window.PARK&&PARK.oy)||0, WET=(x,y)=>!!FL&&Math.abs(x-pox-FL.x)<FL.rx+16&&Math.abs(y-poy-FL.y)<FL.ry+16&&FOUNT.lake(x-pox,y-poy)<6;   // none in the big lake (owner, 8 Nov 2026: "the lake has a chunk of green in it")
      // none in the park's clearings, on its paths or on a section's places (edge.park.clear, edge.ground.paths, sections.places)
      const CL=P.clear||[], PS=((E.ground&&E.ground.paths)||[]).flatMap(pl=>pl.slice(1).map((b,q)=>[pl[q],b])), dSeg=(x,y,[[ax,ay],[bx,by]])=>{ const dx=bx-ax, dy=by-ay, t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1))); return Math.hypot(x-ax-t*dx,y-ay-t*dy); };
      const SP=(LEVEL.sections&&LEVEL.sections.places)||[], OFF=(x,y)=>CL.some(([cx,cy,rx,ry])=>((x-cx)/rx)**2+((y-cy)/ry)**2<1)||PS.some(sg=>dSeg(x,y,sg)<5)||SP.some(q=>Math.abs(x-q.x)<q.w/2+6&&Math.abs(y-q.y)<q.d/2+6);
      const AR=BANDS.map(q=>(q[2]-q[0])*(q[3]-q[1])), AT=AR.reduce((a,b)=>a+b,0);
      for(let i=0;i<N;i++){ let r0=rnd()*AT, bi=0; while(bi<BANDS.length-1&&r0>AR[bi]){ r0-=AR[bi]; bi++; } const [t0,u0,t1,u1]=BANDS[bi]; let x=t0+rnd()*(t1-t0), y=u0+rnd()*(u1-u0); for(let k=0;k<8&&(WET(x,y)||OFF(x,y));k++){ x=t0+rnd()*(t1-t0); y=u0+rnd()*(u1-u0); } const r=(2.2+rnd()*2.4)*T, h=(2+rnd()*2)*T, wx=XS(x), wz=ZS(y);
        Q.setFromAxisAngle(V.set(0,1,0),rnd()*6.28); crown.setMatrixAt(i,M4.compose(V.set(wx,h+r*.7,wz),Q,S.set(r,r*(.8+rnd()*.3),r))); trunk.setMatrixAt(i,M4.compose(V.set(wx,h/2,wz),Q,S.set(.35*T,h,.35*T))); }
      // (shrunk away before the end of the view, so the drawing's edge never shows as a dark line of trees: owner, 8 Nov 2026, "there is a dark sliver")
      for(const im of [crown,trunk]){ im.material.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\n#ifdef USE_INSTANCING\n transformed*=1.-smoothstep(${(380*T).toFixed(1)},${(470*T).toFixed(1)},distance((modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz,cameraPosition));\n#endif`); }; im.material.customProgramCacheKey=()=>'farparktrees'; }
      for(const im of [crown,trunk]){ im.raycast=()=>{}; im.castShadow=false; im.receiveShadow=true; G.add(im); } BLK.back.push({park:true,n:N});
      // bunches of bigger trees on to the park's far end (owner, 9 Nov 2026: "add more trees and large trees going further back, too many small trees, do differetn bunches of large ones like are in central park now (but not as big and way lower render since not real)"): edge.park.clumps bunches of 4 to 10 trees, each a crown of twenty triangles on a box trunk, one draw each, sunk away before the view's end
      const NC=P.clumps||0, inB=(x,y)=>BANDS.some(([a,b,c,d])=>x>a&&x<c&&y>b&&y<d), BP=[]; for(let c=0;c<NC;c++){ let r0=rnd()*AT, bi=0; while(bi<BANDS.length-1&&r0>AR[bi]){ r0-=AR[bi]; bi++; } const [t0,u0,t1,u1]=BANDS[bi], cx=t0+rnd()*(t1-t0), cy=u0+rnd()*(u1-u0), n=4+Math.floor(rnd()*7), sp=7+rnd()*9;
        for(let j=0;j<n;j++){ const x=cx+(rnd()*2-1)*sp, y=cy+(rnd()*2-1)*sp, r=(4.5+rnd()*3.5)*T, h=(5+rnd()*4)*T, g=rnd(); if(inB(x,y)&&!WET(x,y)&&!OFF(x,y))BP.push([XS(x),ZS(y),r,h,g]); } }
      if(BP.length){ const bc=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),BP.length), bt=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0x4a3a2c}),BP.length), C=new THREE.Color();
        BP.forEach(([wx,wz,r,h,g],i)=>{ Q.setFromAxisAngle(V.set(0,1,0),g*6.28); bc.setMatrixAt(i,M4.compose(V.set(wx,h+r*.6,wz),Q,S.set(r,r*(.75+g*.3),r))); bt.setMatrixAt(i,M4.compose(V.set(wx,h/2,wz),Q,S.set(.5*T,h,.5*T))); bc.setColorAt(i,C.set(0x3f6d2e).offsetHSL((g-.5)*.05,0,(g-.5)*.08)); });
        for(const im of [bc,bt]){ im.material.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\n#ifdef USE_INSTANCING\n transformed*=1.-smoothstep(${(1000*T).toFixed(1)},${(1180*T).toFixed(1)},distance((modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz,cameraPosition));\n#endif`); }; im.material.customProgramCacheKey=()=>'farparkbig'; im.raycast=()=>{}; im.castShadow=false; im.receiveShadow=true; G.add(im); }
        BLK.back.push({parkBig:true,n:BP.length}); } } }
  window.BLOCKDBG=()=>({blds:BLK.blds.map(q=>[q.row,q.x0,q.x1,q.h]),lots:BLK.lots.map(q=>[q.row,q.kind,q.x0,q.x1,q.y0,q.y1]),band:BLK.band(pos.x,pos.z)});
}

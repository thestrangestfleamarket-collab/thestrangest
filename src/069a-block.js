// THE BLOCK: BLK builds what stands between the real buildings across Market St, on the Hudson row and on West St: closed garages, empty parking lots and fenced-off lots.
import {SHARED, THREE} from './003-shx.js';
import {BLK, pos, ROOMS, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLOCK, cutWalls, FIX, LEVEL, MAINROW, MODS, RING, SOL, TILE, ZU} from './006-map-pre.js';
import {PEEK} from './008-batch.js';
import {BRICKS} from './014-gamekit.js';
Object.assign(BLK,{blds:[],lots:[],signs:[],band:()=>null}); window.BLK=BLK;
{ const T=TILE, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, B=BLOCK, s=T/24, YP=px=>px*ZU;
  let seed=11; const rnd=()=>((seed=(seed*16807)%2147483647)/2147483647);
  const cv=(w,h)=>{ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; };
  const tex=c=>{ const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const G=new THREE.Group(); G.name='block'; scene.add(G);
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
  const M=T/.84, FH=2*M, gy=(x,y)=>MODS.bodega&&MODS.bodega.ground?MODS.bodega.ground(XS(x),ZS(y)):0;
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
  const LINK=(()=>{ const c=cv(24,24), g=c.getContext('2d'); g.strokeStyle='#a8acb0'; g.lineWidth=1.4; for(const o of [-24,0,24]){ g.beginPath(); g.moveTo(o,0); g.lineTo(o+24,24); g.stroke(); g.beginPath(); g.moveTo(o+24,0); g.lineTo(o,24); g.stroke(); }
    const t=tex(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return new THREE.MeshLambertMaterial({map:t,alphaTest:.4,side:THREE.DoubleSide}); })();
  const FP=[], FU=[], FI=[], POST=[];
  function lot(q){ const W=q.x1-q.x0, D=q.y1-q.y0, c=cv(W*24,D*24); lotPaint(q,c.getContext('2d'),c.width,c.height);
    const P=[], U=[], I=[], y=.02*T, v=(x,yy)=>[XS(x),gy(x,yy)+y,ZS(yy)];
    quad(P,U,I,v(q.x0,q.y0),v(q.x1,q.y0),v(q.x1,q.y1),v(q.x0,q.y1),[0,0],[1,0],[1,1],[0,1]);
    mesh(P,U,I,new THREE.MeshLambertMaterial({map:tex(c),side:THREE.DoubleSide}));
    if(q.kind==='fence'){ const g0=a=>gy(a[0],a[1]), sides=[[[q.x0,q.y0],[q.x1,q.y0]],[[q.x1,q.y0],[q.x1,q.y1]],[[q.x1,q.y1],[q.x0,q.y1]],[[q.x0,q.y1],[q.x0,q.y0]]];
      for(const [a,b] of sides){ const len=Math.hypot(b[0]-a[0],b[1]-a[1]), ya=g0(a), yb=g0(b);
        quad(FP,FU,FI,[XS(a[0]),ya,ZS(a[1])],[XS(b[0]),yb,ZS(b[1])],[XS(b[0]),yb+FH,ZS(b[1])],[XS(a[0]),ya+FH,ZS(a[1])],[0,0],[len*1.2,0],[len*1.2,FH/T*1.2],[0,FH/T*1.2]);
        for(let k=0,n=Math.max(1,Math.round(len/3));k<=n;k++){ const t=k/n, x=a[0]+(b[0]-a[0])*t, yy=a[1]+(b[1]-a[1])*t; POST.push([XS(x),g0([x,yy]),ZS(yy)]); } }
      solid(q.x0,q.y0,q.x1,q.y1,FH/ZU); }
    BLK.lots.push(q); }
  const TINTS=[[1.3,.82,.66],[1.12,1,.84],[.92,.95,1.02],[1.2,.95,.8],[1.05,.9,.92],[.98,1.02,.92],[1.25,.88,.72],[1.1,1.04,.95],[.9,.9,.96]], KINDS=['garage','park','fence'];
  const fill=(a,b,mk)=>{ let x=a, i=0; while(b-x>1.5){ const r=((Math.sin(x*12.9898+i*78.233)*43758.5453)%1+1)%1, w=6+r*4, e=b-x-w<3?b:x+w; mk(x,e,i++); x=e; } };
  const holes=(on,a0,a1)=>{ const g=[]; let y=a0; for(const [a,b] of on.slice().sort((p,q)=>p[0]-q[0])){ if(a-.1>y)g.push([y,a-.1]); y=Math.max(y,b+.1); } if(a1>y)g.push([y,a1]); return g; };
  let n=0; const spot=(row,off,i,box)=>{ n++; const kind=KINDS[(i+off)%3], side=row===1?'s':row===2?'n':'e';
    if(kind==='garage')building({...box,h:112,e:row===5,k:400+n*11,tint:TINTS[n%TINTS.length],lit:0,garage:true,row});
    else lot({...box,kind,row,side}); };
  for(const [a,b] of holes(MAINROW,B.x0,B.x1))fill(a,b,(x0,x1,i)=>spot(1,0,i,{x0,x1,y0:B.back,y1:SHARED.BOD.OY}));
  for(const [a,b] of [[B.x0,-62.4],[-33.6,B.hudson[0]],[B.hudson[1],B.x1]])fill(a,b,(x0,x1,i)=>spot(2,1,i,{x0,x1,y0:B.row2[0],y1:B.row2[1]}));
  { const F=RING.wx0; for(const [a,b] of holes(LEVEL.places.filter(p=>p.y1!=null&&Math.abs(p.x1-F)<.6).map(p=>[p.y0,p.y1]),LEVEL.park.y0+.5,RING.top-1))fill(a,b,(y0,y1,i)=>spot(5,2,i,{x0:F-13,x1:F,y0,y1})); }
  if(FP.length){ mesh(FP,FU,FI,LINK);
    const PM=new THREE.InstancedMesh(new THREE.BoxGeometry(.07*M,FH+.05*M,.07*M).translate(0,(FH+.05*M)/2,0),new THREE.MeshLambertMaterial({color:0x5a5e62}),POST.length), m4=new THREE.Matrix4();
    POST.forEach(([x,y,z],i)=>PM.setMatrixAt(i,m4.makeTranslation(x,y,z))); G.add(PM); }
  { const zr=a=>[Math.min(ZS(a[0]),ZS(a[1])),Math.max(ZS(a[0]),ZS(a[1]))], AL=zr(B.alley), PR=zr(B.prom), mx0=XS(SHARED.BOD.MAP.x0), mx1=XS(SHARED.BOD.MAP.x1);
    BLK.band=(x,z)=>x<mx0||x>mx1?null:z>AL[0]&&z<AL[1]?{z0:AL[0],z1:AL[1]}:z>PR[0]&&z<PR[1]?{z0:PR[0],z1:PR[1]}:null; }
  { const lane=()=>!UI.persp&&(UI.view==='iso'||UI.view==='map')&&SHARED.LVL!=='down'&&!ROOMS.cur&&BLK.band(pos.x,pos.z)&&SHARED.cam.position.z>pos.z, z0=ZS(B.back)-.6*T, z1=ZS(-77)+.6*T, bb=new THREE.Box3(); BLK.lane=lane;
    let n=0; for(const w of cutWalls){ if(!w.me||!w.me.geometry)continue; bb.setFromObject(w.me); if(bb.isEmpty()||bb.max.y<.1||bb.min.z<z0||bb.max.z>z1)continue;
      const wh=w.when, al=Object.getOwnPropertyDescriptor(w,'always'), was=al?(al.get?()=>al.get.call(w):()=>al.value):()=>false;
      w.when=()=>lane()||(wh?wh():true); Object.defineProperty(w,'always',{get:()=>lane()||was(),configurable:true}); n++; } BLK.walls=n; }
  window.BLOCKDBG=()=>({blds:BLK.blds.map(q=>[q.row,q.x0,q.x1,q.h]),lots:BLK.lots.map(q=>[q.row,q.kind,q.x0,q.x1,q.y0,q.y1]),band:BLK.band(pos.x,pos.z)});
}

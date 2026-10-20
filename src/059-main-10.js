
MODS.bodega={BOUND,ground:groundY};
 for(const w of cutWalls.slice(c0))if(!w.when)w.when=()=>BODB.inside(); for(const L of SHL)L.removeFromParent(); });
await grab('pool',async()=>{ const solids=SOL.up, fixed=FIX.up, SHL=[]; let BOUND, groundY; const c0=cutWalls.length;
if(!AWAY.has('apartments')){
{ const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const sh=(c,f)=>[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)];
  const P=POOLR, OX=(P.x0+P.x1)/2, OY=(P.y0+P.y1)/2;
  const X=x=>(x-OX)*BLDK*TILE+PDX, Z=y=>((y-OY)*BLDK+(P.y1-OY)*(1-BLDK))*TILE+PDZ, Y=z=>z*ZU*BLDK; POOLR.X=X; POOLR.Z=Z; POOLR.Y=Y;
  const faceTex=(w,h,fn)=>{ '@later'; w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const im=new ImageData(w,h), d=im.data;
    for(let j=0,k=0;j<h;j++)for(let i=0;i<w;i++,k+=4){ const v=fn(i,j); if(!v)continue; d[k]=Math.round(v[0]); d[k+1]=Math.round(v[1]); d[k+2]=Math.round(v[2]); d[k+3]=255; }
    const t=new THREE.CanvasTexture(im); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.colorSpace=THREE.SRGBColorSpace; return {map:t}; };
  const mat=(tx,basin)=>{ const m=new THREE.MeshLambertMaterial({map:tx.map,alphaTest:.5,side:THREE.DoubleSide}); if(basin)WATER.caustic(m); return m; };
  const quad=(a,b,c,d,tx,basin)=>{ '@later'; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2)); g.computeVertexNormals(); const me=new THREE.Mesh(g,mat(tx,basin)); me.receiveShadow=true; scene.add(me); return me; };
  const C=v=>v;
  const floor=(x0,y0,x1,y1,z,col)=>quad([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y0+(j+.5)/24))));
  const bq=(a,b,c,d,tx,basin)=>BATCH.add([...a,...b,...c,...a,...c,...d],[0,0,1,0,1,1,0,0,1,1,0,1],tx.map.image,null,basin?'K':'L');
  const wallY=(x,y0,y1,z0,z1,paint,basin)=>(basin?bq:quad)([X(x),Y(z0),Z(y0)],[X(x),Y(z0),Z(y1)],[X(x),Y(z1),Z(y1)],[X(x),Y(z1),Z(y0)],faceTex((y1-y0)*24,z1-z0,(i,j)=>C(paint(y0+(i+.5)/24,z1-j-.5))),basin);
  const wallX=(y,x0,x1,z0,z1,paint,basin)=>(basin?bq:quad)([X(x0),Y(z0),Z(y)],[X(x1),Y(z0),Z(y)],[X(x1),Y(z1),Z(y)],[X(x0),Y(z1),Z(y)],faceTex((x1-x0)*24,z1-z0,(i,j)=>C(paint(x0+(i+.5)/24,z1-j-.5))),basin);
  const cutaway=(me,nx,nz,foot)=>{ const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); me.material.clippingPlanes=[pl]; cutWalls.push({pl,nx,nz,foot:Y(foot),me}); return me; };
  const solid=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  const deckCol=(x,y)=>{ const e=Math.max(P.bx0-x,x-P.bx1,P.by0-y,y-P.by1); if(e<0)return null; if(e<.32)return e<.05?[120,124,122]:[214,210,198];
    const i=Math.floor(x*2), j=Math.floor(y*2), g=x*2-i<.05||y*2-j<.05; return g?[104,112,116]:[150,160,164]; };
  const PTW=[232,238,238], PTB=[62,112,164];
  const poolTile=(a,z,f=1)=>{ const k=Math.floor(a*8), c=z<14?PTB:PTW; if(z%6<1||a*8-k<.12)return sh(z<14?[40,70,104]:[150,158,160],f); return sh(c,f); };
  const LX=P.LX, LY=P.LY, HT=P.HT, zs=HT-1.16, sx0=LX*0.36, sx1=LX*0.6, st0=LX+9;
  const bedP=a=>0.04;
  POOLR.bedAt=a=>-(HT-bedP(Math.max(0,Math.min(LX,a))))*24;
  const L1=LY/4, L2=LY/2, L3=LY*3/4, near=(b,r)=>Math.abs(b-L1)<r||Math.abs(b-L2)<r||Math.abs(b-L3)<r;
  const TILEC=[204,230,237], LANE=[26,46,87], NOSE=[51,77,128], BAND=[31,69,140];
  const bedTile=(a,b)=>{ const lane=a>0.6&&a<st0-0.3&&near(b,0.1), tee=(Math.abs(a-0.75)<0.07||Math.abs(a-st0+0.45)<0.07)&&near(b,0.35);
    return lane||tee?LANE:a>=st0&&Math.abs(((a-st0)%0.5)-0.04)<0.05?NOSE:TILEC; };
  const basinWall=(u,z)=>{ const k=Math.floor(u*5), g=u*5-k<.06||((z/24)*5)%1<.06; return z>-14?BAND:g?[172,196,204]:TILEC; };
  const RX=P.x1*2/3, HY0=6.24, HY1=8.28, CX=4.08, CY=3.6, LY0=6.0, D_=[[21.97,23.53]];
  POOLR.ROOMS=[[CX-.05,P.y0,RX,HY0],[P.x0,CY,CX,HY1],[P.x0,P.y0,CX,CY],[CX,HY0,RX,HY1],[P.x0,HY1,RX,P.y1],[RX,LY0,P.x1,P.y1],[RX,P.y0,P.x1,LY0]];
  const plaster=(a,z)=>{ const k=hash(Math.floor(a*24),Math.floor(z),7); return z<8?[86,80,74]:k<.03?[214,208,196]:[226,220,208]; };
  const gymWall=(a,z)=>z<8?[40,42,46]:z>60&&z<66?[180,60,52]:[118,122,128];
  const rubber=(x,y)=>{ const n=hash(Math.floor(x*24),Math.floor(y*24),3); return n<.06?[70,74,78]:[50,53,57]; };
  const boards=(x,y)=>{ const r=Math.floor(y*4), o=(r*.37)%1, b=Math.floor(x+o), g=y*4-r<.06||x+o-b<.02; return g?[96,70,48]:hash(b,r,9)<.5?[150,112,76]:[140,104,70]; };
  const stone=(x,y)=>{ const i=Math.floor(x), j=Math.floor(y), g=x-i<.03||y-j<.03; return g?[150,146,138]:(i+j)%2?[204,198,186]:[192,186,174]; };
  const carpet=(x,y)=>{ const n=hash(Math.floor(x*24),Math.floor(y*24),5); return n<.1?[84,66,56]:[98,78,66]; };
  const conc=(x,y)=>hash(Math.floor(x*24),Math.floor(y*24),11)<.05?[118,116,112]:[132,130,126];
  floor(P.x0,HY1,RX,P.y1,0,deckCol); floor(P.x0,P.y0,RX,HY0,0,rubber); floor(CX,HY0,RX,HY1,0,boards); floor(P.x0,CY,CX,HY1,0,conc);
  floor(RX,LY0,P.x1,P.y1,0,stone); floor(RX,P.y0,P.x1,LY0,0,carpet);
  const room=(x,y)=>x>RX?plaster:y>HY1?poolTile:y<HY0&&!(x<CX&&y>CY)?gymWall:plaster;
  const door=(a,z,ds)=>ds.some(d=>a>=d[0]&&a<d[1])&&z<94;
  cutaway(wallY(P.x0,P.y0,P.y1,0,P.H,(u,z)=>room(P.x0+.1,u)(u,z)),1,0,10); cutaway(wallY(P.x1,P.y0,P.y1,0,P.H,(u,z)=>plaster(u,z)),-1,0,10);
  cutaway(wallX(P.y0,P.x0,P.x1,0,P.H,(u,z)=>room(u,P.y0+.1)(u,z)),0,1,10); cutaway(wallX(P.y1,P.x0,P.x1,0,P.H,(u,z)=>door(u,z,D_)?null:room(u,P.y1-.1)(u,z)),0,-1,10);
  const inner=(me)=>{ const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); me.material.clippingPlanes=[pl]; cutWalls.push({pl,nx:0,nz:0,always:true,foot:Y(10),me}); };
  const IW=(ax,at,a0,a1,ds,paint)=>{ '@later'; inner(ax==='x'?wallX(at,a0,a1,0,P.H,(u,z)=>door(u,z,ds)?null:paint(u,z)):wallY(at,a0,a1,0,P.H,(u,z)=>door(u,z,ds)?null:paint(u,z)));
    let a=a0; for(const d of [...ds].sort((p,q)=>p[0]-q[0])){ if(d[0]>a)ax==='x'?solid(a,at-.1,d[0],at+.1,P.H):solid(at-.1,a,at+.1,d[0],P.H); a=d[1]; } if(a<a1)ax==='x'?solid(a,at-.1,a1,at+.1,P.H):solid(at-.1,a,at+.1,a1,P.H); };
  IW('y',RX,P.y0,P.y1,[[HY0+.12,HY1-.12]],plaster);
  IW('x',LY0,RX,P.x1,[[21.97,23.53]],plaster);
  IW('x',HY0,CX,RX,[[9.6,11.16]],gymWall);
  IW('x',HY1,CX,RX,[[12.6,14.16]],plaster);
  IW('x',CY,P.x0,CX,[],plaster); IW('y',CX,CY,HY0-.05,[],plaster); IW('x',HY1,P.x0,CX,[],plaster);
  { const g=new THREE.PlaneGeometry(1,1,1,1), p=g.attributes.position, uv=g.attributes.uv;
    for(let i=0;i<p.count;i++){ const u=uv.getX(i), v=uv.getY(i), a=u*LX, b=(1-v)*LY; p.setXYZ(i,X(P.bx0+a),Y(POOLR.bedAt(a)),Z(P.by0+b)); }
    g.computeVertexNormals(); const tx=faceTex(LX*24,LY*24,(i,j)=>C(bedTile((i+.5)/24,(j+.5)/24))); tx.map.flipY=true;
    const m=new THREE.Mesh(g,mat(tx,true)); m.receiveShadow=true; scene.add(m); }
  wallX(P.by0,P.bx0,P.bx1,POOLR.bedAt(0),0,(u,z)=>basinWall(u,z),true); wallX(P.by1,P.bx0,P.bx1,POOLR.bedAt(0),0,(u,z)=>basinWall(u,z),true);
  wallY(P.bx0,P.by0,P.by1,POOLR.bedAt(0),0,(u,z)=>basinWall(u,z),true); wallY(P.bx1,P.by0,P.by1,POOLR.bedAt(0),0,(u,z)=>basinWall(u,z),true);
  const FB=[], col=new THREE.Color(), box=(x0,y0,z0,x1,y1,z1,c,hard)=>{ '@later'; const g=new THREE.BoxGeometry(Math.abs(X(x1)-X(x0)),Math.abs(Y(z1)-Y(z0)),Math.abs(Z(y1)-Z(y0))).toNonIndexed(); g.translate((X(x0)+X(x1))/2,(Y(z0)+Y(z1))/2,(Z(y0)+Z(y1))/2);
    col.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); const n=g.attributes.position.count, cc=new Float32Array(n*3); for(let i=0;i<n;i++){ const f=g.attributes.normal.getY(i)>.5?1:g.attributes.normal.getY(i)<-.5?.6:.82; cc[i*3]=col.r*f; cc[i*3+1]=col.g*f; cc[i*3+2]=col.b*f; }
    g.setAttribute('color',new THREE.BufferAttribute(cc,3)); FB.push(g); if(hard)solid(x0,y0,x1,y1,z1); };
  box(P.bx0-2.2,12.35,0,P.bx0-1.4,12.95,22,[92,96,104],true); box(P.bx0-2.3,12.4,22,P.bx0+1.1,12.9,26,[232,226,200]); box(P.bx0-2.3,12.4,26,P.bx0+1.1,12.9,26.6,[70,150,190]);
  for(let k=0;k<3;k++){ const x=1+k*2.6; box(x,.5,0,x+1.9,1.5,8,[40,42,46],true); box(x+.1,.62,8,x+1.6,1.38,9,[24,24,26]); box(x+1.7,.6,0,x+1.85,.72,46,[90,94,100]); box(x+1.7,1.28,0,x+1.85,1.4,46,[90,94,100]); box(x+1.6,.55,40,x+1.95,1.45,52,[60,64,70]); box(x+1.62,.75,46,x+1.66,1.25,51,[90,200,140]); }
  box(9.6,.3,0,16.4,.95,30,[70,60,52],true); for(let k=0;k<9;k++){ box(9.9+k*.7,.42,30,10.3+k*.7,.85,36,[24,24,26]); box(9.9+k*.7,.42,14,10.3+k*.7,.85,20,[24,24,26]); }
  box(10.4,2.7,0,13.4,3.4,16,[70,34,30],true); box(10.8,2.5,0,11.0,2.7,52,[100,104,110]); box(12.8,2.5,0,13.0,2.7,52,[100,104,110]); box(10.2,2.55,46,13.6,2.65,48,[170,170,180]); box(10.1,2.45,40,10.3,2.75,54,[24,24,26]); box(13.5,2.45,40,13.7,2.75,54,[24,24,26]);
  box(4.8,3.2,0,8.4,5.4,1.2,[70,110,90]); box(14.6,2.4,0,16.4,4.4,8,[46,48,52],true); box(14.7,2.5,8,14.9,2.7,96,[46,48,52]); box(16.1,2.5,8,16.3,2.7,96,[46,48,52]); box(14.7,2.5,96,16.3,2.7,100,[46,48,52]); box(15.3,2.55,30,15.7,2.65,60,[150,150,160]);
  box(23.4,9.4,0,26.2,10.4,40,[120,86,56],true); box(23.4,9.4,40,26.2,10.4,42,[160,120,80]);
  box(19,11.2,0,20.2,15.2,18,[130,60,50],true); box(19,11.2,18,19.4,15.2,34,[120,54,44]); box(20.8,12.4,0,22,14.2,12,[96,70,48],true);
  box(26.6,11,0,27.15,15.6,70,[150,150,140],true); for(let r=0;r<6;r++)for(let c=0;c<8;c++)box(26.55,11.2+c*.55,8+r*10,26.6,11.6+c*.55,16+r*10,[120,120,112]);
  box(24.5,15.8,0,25.2,16.5,10,[90,70,50],true); box(24.4,15.7,10,25.3,16.6,40,[60,110,60]);
  box(19.2,1.2,0,23,2.6,30,[120,86,56],true); box(20.6,2.8,0,21.6,3.6,20,[30,30,34]); box(25.8,.3,0,27.1,3.6,52,[90,94,100],true); box(19.2,4.4,0,20.4,5.6,40,[60,90,60],true); box(21.2,1.5,30,22.2,2.1,44,[40,40,44]);
  for(let k=0;k<14;k++)box(.15,CY+.15+k*.18,0,1.9,CY+.15+(k+1)*.18,(k+1)*9,[150,146,138]); solid(.1,CY,2,HY0-.2,P.H);
  box(2.3,CY+.05,0,3.9,CY+.3,100,[160,166,174],true); box(3.08,CY+.25,0,3.12,CY+.32,92,[60,62,66]); box(2.2,CY+.25,0,2.3,CY+.35,104,[110,114,120]); box(3.9,CY+.25,0,4.0,CY+.35,104,[110,114,120]); box(2.2,CY+.25,96,4.0,CY+.35,104,[110,114,120]);
  box(4.0,CY+.3,44,4.05,CY+.42,52,[255,210,120]);
  { const n=FB.reduce((a,g)=>a+g.attributes.position.count,0), Pp=new Float32Array(n*3), Nn=new Float32Array(n*3), Cc=new Float32Array(n*3); let o=0;
    for(const g of FB){ Pp.set(g.attributes.position.array,o*3); Nn.set(g.attributes.normal.array,o*3); Cc.set(g.attributes.color.array,o*3); o+=g.attributes.position.count; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(Pp,3)); g.setAttribute('normal',new THREE.BufferAttribute(Nn,3)); g.setAttribute('color',new THREE.BufferAttribute(Cc,3));
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})); m.castShadow=true; m.receiveShadow=true; scene.add(m); }
  const steel=new THREE.MeshLambertMaterial({color:0xc8d2d8}); const bars=[], bar=(x0,y0,z0,x1,y1,z1)=>{ const g=new THREE.BoxGeometry(Math.abs(X(x1)-X(x0))||0.04,Math.abs(Y(z1)-Y(z0))||0.04,Math.abs(Z(y1)-Z(y0))||0.04).toNonIndexed(); g.translate((X(x0)+X(x1))/2,(Y(z0)+Y(z1))/2,(Z(y0)+Z(y1))/2); bars.push(g); };
  for(const x of [P.bx1-1.5])for(const [y,s] of [[P.by0,1],[P.by1,-1]]){ for(const dx of [-0.3,0.3]){ bar(x+dx,y-s*0.35,0,x+dx,y-s*0.35,30); bar(x+dx,y-s*0.35,30,x+dx,y+s*0.12,30); bar(x+dx,y+s*0.12,-40,x+dx,y+s*0.12,30); }
    for(const z of [-36,-24,-12])bar(x-0.3,y+s*0.12,z,x+0.3,y+s*0.12,z); solid(x-0.35,y-s*0.4-0.05,x+0.35,y-s*0.3+0.05,30); }
  { const P2=new Float32Array(bars.reduce((a,g)=>a+g.attributes.position.array.length,0)), N2=new Float32Array(P2.length); let o=0; for(const g of bars){ P2.set(g.attributes.position.array,o); N2.set(g.attributes.normal.array,o); o+=g.attributes.position.array.length; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P2,3)); g.setAttribute('normal',new THREE.BufferAttribute(N2,3)); const m=new THREE.Mesh(g,steel); m.castShadow=true; scene.add(m); }
  const lampDisc=(x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.12,0.18),new THREE.MeshBasicMaterial({color:0xcfe8ff})); m.position.set(X(x),Y(z),Z(y)); scene.add(m); };
  const lz=-(HT-0.04-1.7)*24;
  for(const a of [2.5,6.75,11])for(const b of [0,LY]){ const L=new THREE.PointLight(new THREE.Color(.32,.68,1),+(QS.get('wl')||3.2),8*TILE,1.4); L.position.set(X(P.bx0+a),Y(lz),Z(P.by0+b+(b?-0.15:0.15))); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); lampDisc(P.bx0+a,P.by0+b+(b?-0.02:0.02),lz); }
  { const L=new THREE.PointLight(new THREE.Color(.32,.68,1),+(QS.get('wl')||3.2),8*TILE,1.4); L.position.set(X(P.bx0+0.15),Y(-(HT-0.04-1.4)*24),Z(P.by0+LY/2)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); }
  const ceil=(x,y,c,k)=>{ '@later'; const m=new THREE.Mesh(new THREE.BoxGeometry(.9*TILE,.03,.5*TILE),new THREE.MeshBasicMaterial({color:new THREE.Color(...c).multiplyScalar(1.3)})); m.position.set(X(x),Y(P.H-2),Z(y)); scene.add(m); OVERHEAD.push({o:m,y:Y(P.H-4)});
    const L=new THREE.PointLight(new THREE.Color(...c),k,7*TILE,1.6); L.position.set(X(x),Y(P.H-12),Z(y)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); };
  ceil(22.7,12.4,[1,.88,.7],6); ceil(22.7,3,[1,.92,.8],5); ceil(10.5,7.26,[1,.88,.7],3.5); ceil(8.5,3,[.9,.95,1],6); ceil(2.1,5.2,[1,.9,.75],3);
  solid(P.x0-1,P.y0,P.x0,P.y1,P.H); solid(P.x1,P.y0,P.x1+1,P.y1,P.H); solid(P.x0,P.y0-1,P.x1,P.y0,P.H); solid(P.x0,P.y1,21.97,P.y1+1,P.H); solid(23.53,P.y1,P.x1,P.y1+1,P.H);
  BOUND={x0:X(P.x0)+0.3,x1:X(P.x1)-0.3,z0:Z(P.y0)+0.3,z1:Z(P.y1)-0.3};
  groundY=()=>0;
  BATCH.build((k,map)=>{ const m=new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide}); if(k==='K')WATER.caustic(m); return m; });
  POOLR.inBasin=(x,z)=>{ const gx=(x-PDX)/TILE/BLDK+OX-P.bx0, gy=((z-PDZ)/TILE-(P.y1-OY)*(1-BLDK))/BLDK+OY-P.by0; return gx>0&&gx<LX&&gy>0&&gy<LY?[gx,gy]:null; };
}
WATER.build();
} else { const P=POOLR, OX=(P.x0+P.x1)/2, OY=(P.y0+P.y1)/2; P.X=x=>(x-OX)*BLDK*TILE+PDX; P.Z=y=>((y-OY)*BLDK+(P.y1-OY)*(1-BLDK))*TILE+PDZ; P.Y=z=>z*ZU*BLDK; P.ROOMS=[]; P.inBasin=()=>null; P.bedAt=()=>0; BOUND={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9}; }
MODS.pool={BOUND,cut:cutWalls.slice(c0),inside:(x,z)=>x>POOLR.X(POOLR.x0)&&x<POOLR.X(POOLR.x1)&&z>POOLR.Z(POOLR.y0)&&z<POOLR.Z(POOLR.y1)};
 for(const w of cutWalls.slice(c0))if(!w.when)w.when=()=>MODS.pool.inside(pos.x,pos.z); for(const L of SHL)L.removeFromParent(); });
const FOREST=__DATA__("data/forest.json");
const PROPS=__DATA__("data/props.json");

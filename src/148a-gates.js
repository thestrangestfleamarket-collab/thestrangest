const GATES=window.GATES={list:[]};
GATES.init=()=>{ if(typeof BOD==='undefined'||typeof BLOCK==='undefined')return;
  const T=TILE, M=T/.84, XS=BOD.XS, ZS=BOD.ZS, G=(x,z)=>MODS.bodega.ground(x,z), yF=BOD.K.LSEED.walk-.12, yB=BLOCK.back+.15, za=Math.min(ZS(yF),ZS(yB)), zb=Math.max(ZS(yF),ZS(yB));
  const hs=(a,b)=>{ const v=Math.sin(a*12.9898+b*78.233)*43758.5453; return v-Math.floor(v); };
  const T0=x=>x/T+BOD.OX, F=[]; for(const b of BLK.blds)if(b.y1>yF-3&&b.y0<yB+3)F.push([b.x0,b.x1]);
  for(const k of ['house','bodega','ghost','bar','museum','theatre','arcade','playhouse','holodeck']){ const b=typeof MAPED!=='undefined'&&MAPED.box&&MAPED.box(k); if(b&&b[3]/T+BOD.OY>yF-3&&b[1]/T+BOD.OY<yB+3)F.push([T0(b[0]),T0(b[2])]); }
  const bl=m=>BOD.OX+(m-BOD.OX)/BLDK;
  if(typeof WROW!=='undefined')for(const k in WROW){ const w=WROW[k], s=u=>BOD.OX+(u-BOD.OX)*BLDK; F.push([s(w.x0),s(w.x1)]); }
  for(const k in BLOCK.lots||{}){ const [a,b]=BLOCK.lots[k], x0=BOD.X(bl(a)+.1), x1=BOD.X(bl(b)-.1); F.push([T0(Math.min(x0,x1)),T0(Math.max(x0,x1))]); }
  F.sort((p,q)=>p[0]-q[0]); const R=[]; for(const f of F){ const l=R[R.length-1]; if(l&&f[0]<=l[1]+.05)l[1]=Math.max(l[1],f[1]); else R.push([...f]); }
  const gaps=[]; for(let i=1;i<R.length;i++){ const a=R[i-1][1], b=R[i][0]; if(b-a>=.3&&b-a<=30)gaps.push([a,b]); }
  const BX=[], CN=[], IRON=[0x1e2226,0x24282c,0x2a2622], RUST=0x5a3a2a, box=(x,y,z,sx,sy,sz,c)=>BX.push([x,y,z,sx,sy,sz,c]);
  for(const [x0,x1] of gaps){ const st=typeof MAPSTAIR!=='undefined'&&x1>MAPSTAIR.x0&&x0<MAPSTAIR.x1, yy=st?yB:yF, z=ZS(yy), X0=XS(x0), X1=XS(x1), y=G((X0+X1)/2,z), Hg=2.05*M, W=X1-X0;
    GATES.list.push({x0,x1,y:yy});
    for(const px of [X0+.05*M,X1-.05*M]){ box(px,y+(Hg+.12*M)/2,z,.1*M,Hg+.12*M,.1*M,IRON[0]); CN.push([px,y+Hg+.12*M,z,.07*M,.12*M]); }
    for(const h of [.12,.55,1.7,1.95])box((X0+X1)/2,y+h*M,z,W-.1*M,.045*M,.035*M,IRON[1]);
    const n=Math.max(2,Math.round(W/(.13*M))); for(let i=1;i<n;i++){ const px=X0+W*i/n, k=hs(px,x0), ph=Hg*(k<.06?.9:1), c=k<.12?RUST:IRON[Math.floor(k*3)%3]; box(px,y+ph/2,z,.025*M,ph,.025*M,c); if(k>.04)CN.push([px,y+ph,z,.035*M,.09*M]); }
    for(let i=0;i<n;i++){ const px=X0+W*(i+.5)/n; box(px,y+1.82*M,z,.05*M,.05*M,.03*M,IRON[2]); }
    if(W>1.2*M){ const cx=(X0+X1)/2; box(cx,y+Hg/2,z,.06*M,Hg,.05*M,IRON[0]); box(cx+.05*M,y+1.05*M,z+.03*M,.05*M,.12*M,.03*M,0x8a7a4a); box(cx,y+1.02*M,z+.04*M,.16*M,.025*M,.025*M,0x6a6e70); }
    const r=[Math.min(X0,X1),z-.08*M,Math.max(X0,X1),z+.08*M]; SOL.up.push(r); FIX.up.push([r[0],r[1],y,r[2],r[3],y+Hg]); }
  if(!BX.length)return; const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(), V=THREE.Vector3, mat=new THREE.MeshLambertMaterial();
  const BM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,BX.length); BX.forEach(([x,y,z,sx,sy,sz,col],i)=>{ BM.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(sx,sy,sz))); BM.setColorAt(i,c.setHex(col)); });
  const CM=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,4).translate(0,.5,0),mat,Math.max(1,CN.length)); CN.forEach(([x,y,z,r,h],i)=>{ CM.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(r,h,r))); CM.setColorAt(i,c.setHex(IRON[i%3])); }); CM.count=CN.length;
  for(const me of [BM,CM]){ me.castShadow=me.receiveShadow=true; scene.add(me); }
  GATES.tris=BX.length*12+CN.length*6; window.GATESDBG=()=>({gaps:GATES.list,boxes:BX.length,tips:CN.length,tris:GATES.tris}); };

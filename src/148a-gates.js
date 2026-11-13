// THE GATES: GATES puts gates and fences in the gaps between the block's buildings.
import {SHARED, THREE} from './003-shx.js';
import {BLK, MAPED, PARK} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLDK, BLOCK, CASTLE, FIX, MAPSTAIR, MODS, SOL, STORE, TILE, WROW} from './006-map-pre.js';
// where the places stand (the map editor's, kept when it was archived)
{ const BOX={bodega:()=>{ const B=SHARED.BOD.PFB?SHARED.BOD.PFB.lot:SHARED.BOD.B0; return [SHARED.BOD.X(B.x0),SHARED.BOD.Z(B.y0),SHARED.BOD.X(B.x1),SHARED.BOD.Z(B.y1)]; },
    house:()=>{ const A=MODS.apts&&MODS.apts.A; return A?[SHARED.BOD.X(A.x0),SHARED.BOD.Z(A.y0),SHARED.BOD.X(A.x1),SHARED.BOD.Z(A.y1)]:null; },
    ghost:()=>{ const g=SHARED.BOD.grounds.find(g=>g.id==='ghostst'); return g?[SHARED.BOD.X(g.x0),SHARED.BOD.Z(g.y0),SHARED.BOD.X(g.x1),SHARED.BOD.Z(g.y1)]:null; },
    bar:()=>{ const R=STORE.rooms.find(r=>r.id==='bar'); return R?[R.x0,R.z0,R.x1,R.z1]:null; },
    park:()=>[SHARED.BOD.XS(PARK.x0+PARK.ox),SHARED.BOD.ZS(PARK.y0+PARK.oy),SHARED.BOD.XS(PARK.x1+PARK.ox),SHARED.BOD.ZS(PARK.y1+PARK.oy)],
    castle:()=>{ const b=CASTLE.b; return [SHARED.BOD.XS(b[0]),SHARED.BOD.ZS(b[2]),SHARED.BOD.XS(b[1]),SHARED.BOD.ZS(b[3])]; },
    subway:()=>{ const S=MAPSTAIR; return [SHARED.BOD.XS(S.x0),SHARED.BOD.ZS(S.y0),SHARED.BOD.XS(S.x1),SHARED.BOD.ZS(S.y1)]; }};
  MAPED.box=k=>BOX[k]?BOX[k]():null; }
const GATES=window.GATES={list:[]};
GATES.init=()=>{ if(typeof SHARED.BOD==='undefined'||typeof BLOCK==='undefined')return;
  const T=TILE, M=T/.84, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, G=(x,z)=>MODS.bodega.ground(x,z), yF=SHARED.BOD.K.LSEED.walk-.12, yB=BLOCK.back+.15, za=Math.min(ZS(yF),ZS(yB)), zb=Math.max(ZS(yF),ZS(yB));
  const hs=(a,b)=>{ const v=Math.sin(a*12.9898+b*78.233)*43758.5453; return v-Math.floor(v); };
  const T0=x=>x/T+SHARED.BOD.OX, F=[]; for(const b of [...BLK.blds,...BLK.lots])if(b.y1>yF-3&&b.y0<yB+3)F.push([b.x0,b.x1]);
  for(const k of ['house','bodega','ghost','bar','museum','theatre','arcade','playhouse']){ const b=MAPED.box&&MAPED.box(k); if(b&&b[3]/T+SHARED.BOD.OY>yF-3&&b[1]/T+SHARED.BOD.OY<yB+3)F.push([T0(b[0]),T0(b[2])]); }
  const bl=m=>SHARED.BOD.OX+(m-SHARED.BOD.OX)/BLDK;
  for(const k in WROW){ const w=WROW[k], s=u=>SHARED.BOD.OX+(u-SHARED.BOD.OX)*BLDK; F.push([s(w.x0),s(w.x1)]); }
  for(const k in BLOCK.lots||{}){ const [a,b]=BLOCK.lots[k], x0=SHARED.BOD.X(bl(a)+.1), x1=SHARED.BOD.X(bl(b)-.1); F.push([T0(Math.min(x0,x1)),T0(Math.max(x0,x1))]); }
  F.sort((p,q)=>p[0]-q[0]); const R=[]; for(const f of F){ const l=R[R.length-1]; if(l&&f[0]<=l[1]+.05)l[1]=Math.max(l[1],f[1]); else R.push([...f]); }
  const gaps=[]; for(let i=1;i<R.length;i++){ const a=R[i-1][1], b=R[i][0]; if(b-a>=.3&&b-a<=30&&!(BLOCK.hudson&&b>BLOCK.hudson[0]&&a<BLOCK.hudson[1]))gaps.push([a,b]); }
  const BX=[], CN=[], IRON=[0x1e2226,0x24282c,0x2a2622], RUST=0x5a3a2a, box=(x,y,z,sx,sy,sz,c)=>BX.push([x,y,z,sx,sy,sz,c]);
  const gate=(A0,A1,z,zx,seed)=>{ const P=(a,c)=>zx?[c,a]:[a,c], bx=(a,y,c,sa,sy,sc,col)=>{ const [px,pz]=P(a,c), [sx,sz]=zx?[sc,sa]:[sa,sc]; box(px,y,pz,sx,sy,sz,col); }, cn=(a,y,c,r,h)=>{ const [px,pz]=P(a,c); CN.push([px,y,pz,r,h]); };
    const [gx,gz]=P((A0+A1)/2,z), y=G(gx,gz), Hg=2.05*M, W=A1-A0;
    for(const pa of [A0+.05*M,A1-.05*M]){ bx(pa,y+(Hg+.12*M)/2,z,.1*M,Hg+.12*M,.1*M,IRON[0]); cn(pa,y+Hg+.12*M,z,.07*M,.12*M); }
    for(const h of [.12,.55,1.7,1.95])bx((A0+A1)/2,y+h*M,z,W-.1*M,.045*M,.035*M,IRON[1]);
    const n=Math.max(2,Math.round(W/(.13*M))); for(let i=1;i<n;i++){ const pa=A0+W*i/n, k=hs(pa,seed), ph=Hg*(k<.06?.9:1), c=k<.12?RUST:IRON[Math.floor(k*3)%3]; bx(pa,y+ph/2,z,.025*M,ph,.025*M,c); if(k>.04)cn(pa,y+ph,z,.035*M,.09*M); }
    for(let i=0;i<n;i++){ const pa=A0+W*(i+.5)/n; bx(pa,y+1.82*M,z,.05*M,.05*M,.03*M,IRON[2]); }
    if(W>1.2*M){ const ca=(A0+A1)/2; bx(ca,y+Hg/2,z,.06*M,Hg,.05*M,IRON[0]); bx(ca+.05*M,y+1.05*M,z+.03*M,.05*M,.12*M,.03*M,0x8a7a4a); bx(ca,y+1.02*M,z+.04*M,.16*M,.025*M,.025*M,0x6a6e70); }
    const [p0x,p0z]=P(A0,z-.08*M), [p1x,p1z]=P(A1,z+.08*M), r=[Math.min(p0x,p1x),Math.min(p0z,p1z),Math.max(p0x,p1x),Math.max(p0z,p1z)]; SOL.up.push(r); FIX.up.push([r[0],r[1],y,r[2],r[3],y+Hg]); };
  for(const [x0,x1] of gaps){ const st=x1>MAPSTAIR.x0&&x0<MAPSTAIR.x1, yy=st?yB:yF; GATES.list.push({x0,x1,y:yy}); gate(XS(x0),XS(x1),ZS(yy),false,x0); }
  if(BLOCK.hudson){ const [h0,h1]=BLOCK.hudson, yR=BLOCK.row2[0], zR=ZS(yR), L=Math.min((h1-h0)/2,BLOCK.row2[1]-yR)-.2, zL=ZS(yR+L), y=G(XS((h0+h1)/2),zR), Hp=2.7*M;
    for(const x of [h0+.2,h1-.2])gate(Math.min(zR,zL),Math.max(zR,zL),XS(x),true,x+7);
    for(const x of [h0+.1,h1-.1]){ box(XS(x),y+Hp/2,zR,.18*M,Hp,.18*M,IRON[0]); CN.push([XS(x),y+Hp,zR,.1*M,.18*M]); }
    for(const h of [Hp-.1*M,Hp-.4*M])box(XS((h0+h1)/2),y+h,zR,Math.abs(XS(h1)-XS(h0)),.07*M,.06*M,IRON[1]);
    for(let x=h0+.5;x<h1-.3;x+=.5)box(XS(x),y+Hp-.25*M,zR,.03*M,.3*M,.03*M,IRON[2]);
    GATES.list.push({hudson:true,y:yR}); }
  if(!BX.length)return; const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(), V=THREE.Vector3, mat=new THREE.MeshLambertMaterial();
  const BM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,BX.length); BX.forEach(([x,y,z,sx,sy,sz,col],i)=>{ BM.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(sx,sy,sz))); BM.setColorAt(i,c.setHex(col)); });
  const CM=new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,4).translate(0,.5,0),mat,Math.max(1,CN.length)); CN.forEach(([x,y,z,r,h],i)=>{ CM.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(r,h,r))); CM.setColorAt(i,c.setHex(IRON[i%3])); }); CM.count=CN.length;
  for(const me of [BM,CM]){ me.castShadow=me.receiveShadow=true; scene.add(me); }
  GATES.tris=BX.length*12+CN.length*6; window.GATESDBG=()=>({gaps:GATES.list,boxes:BX.length,tips:CN.length,tris:GATES.tris}); };
export {GATES};

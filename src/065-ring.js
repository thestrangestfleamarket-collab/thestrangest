const RINGX={};
{ const R=RING, XS=BOD.XS, ZS=BOD.ZS, F=R.ff, T=TILE, C=R.cf={x0:F.x0,x1:PARK.x1+(PARK.ox||0)-8,y0:F.y0,y1:PARK.y1+(PARK.oy||0)-8};
  const box=f=>({x0:XS(f.x0),x1:XS(f.x1),z0:Math.min(ZS(f.y0),ZS(f.y1)),z1:Math.max(ZS(f.y0),ZS(f.y1))}), W=box(F), {x0,x1,z0,z1}=box(C), H=26*T;
  RINGX.town={x:W.x0,y:W.z0,z:W.x1,w:W.z1};
  const S=MODS.station.BOUND; BOUND.x0=Math.min(x0,S.x0); BOUND.x1=Math.max(x1,S.x1); BOUND.z0=Math.min(z0,S.z0); BOUND.z1=Math.max(z1,S.z1); RINGX.bound={x0,x1,z0,z1}; Object.assign(MISTB,{x:x0,y:z0,z:x1,w:z1}); MISTE.w=T; Object.assign(PFAR,{x:XS(PARK.x0+(PARK.ox||0)),y:ZS(PARK.y0+(PARK.oy||0)),z:(MODS.landR.x1+18)*T,w:(MODS.landR.z1+18)*T});
  const th=.2*T, wall=(a,b,c,d)=>{ SOL.up.push([a,b,c,d]); FIX.up.push([a,b,0,c,d,H]); };
  wall(x0-th,z0,x0,z1); wall(x1,z0,x1+th,z1); wall(x0,z0-th,x1,z0); wall(x0,z1,x1,z1+th);
  RINGX.inside=(x,z,R=0)=>x>x0+R&&x<x1-R&&z>z0+R&&z<z1-R;
  RINGX.tick=()=>{ if(LVL==='down')scene.background.setRGB(0,0,0); };
  window.RINGX=RINGX; }

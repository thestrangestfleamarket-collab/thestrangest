// THE TOWN WALL: RINGX sets the town's outer bounds and the invisible walls around them.
import {SHARED} from './003-shx.js';
import {PARK} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, MISTB, MISTE, MODS, PFAR, RING, SECTIONS, SOL, TILE} from './006-map-pre.js';
const RINGX={};
{ const R=RING, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, F=SECTIONS.live, T=TILE, C=R.cf={...F};
  const box=f=>({x0:XS(f.x0),x1:XS(f.x1),z0:Math.min(ZS(f.y0),ZS(f.y1)),z1:Math.max(ZS(f.y0),ZS(f.y1))}), W=box(F), {x0,x1,z0,z1}=box(C), H=26*T;
  RINGX.town={x:W.x0,y:W.z0,z:W.x1,w:W.z1};
  const S=MODS.station.BOUND; SHARED.BOUND.x0=Math.min(x0,S.x0); SHARED.BOUND.x1=Math.max(x1,S.x1); SHARED.BOUND.z0=Math.min(z0,S.z0); SHARED.BOUND.z1=Math.max(z1,S.z1); RINGX.bound={x0,x1,z0,z1}; RINGX.pocket=null; RINGX.inPocket=()=>false; Object.assign(MISTB,{x:x0,y:z0,z:x1,w:z1}); MISTE.w=T; Object.assign(PFAR,{x:XS(PARK.x0+(PARK.ox||0)),y:ZS(PARK.y0+(PARK.oy||0)),z:(MODS.landR.x1+18)*T,w:(MODS.landR.z1+18)*T});
  const th=.2*T, wall=(a,b,c,d)=>{ const fb=[a,b,0,c,d,H]; SOL.up.push([a,b,c,d]); FIX.up.push(fb); (RINGX.walls=RINGX.walls||[]).push(fb); };
  wall(x0-th,z0,x0,z1); wall(x1,z0,x1+th,z1); wall(x0,z0-th,x1,z0); wall(x0,z1,x1,z1+th);
  RINGX.inside=(x,z,R=0)=>x>x0+R&&x<x1-R&&z>z0+R&&z<z1-R;
  RINGX.tick=()=>{ if(SHARED.LVL==='down')scene.background.setRGB(0,0,0); };
  window.RINGX=RINGX; }
export {RINGX};

// ---- THE STREET DRESSED (owner, 17 Oct 2026: "start fleshing it out with our available assets to make it come to life"; then: "delete
// everything you added except for the new building, street lights, and trash can and bus stop"): the city kit's pieces (kit.js) that stay:
// trash cans at the kerb, the bus stop with its bench on the far sidewalk, a street light ----
const DRESS={};
{ const G=MODS.bodega.ground, xm=(BOUND.x0+BOUND.x1)/2; let zc=null, zf=null; for(let z=BOUND.z0;z<BOUND.z1;z+=0.02){ const g=G(xm,z); if(zc==null&&g<-.01)zc=z; if(zc!=null&&zf==null&&g>-.01&&z>zc)zf=z; }
  const sw=zc-.5, far=zf+.6, AX=BOD.X(MODS.apts.A.x1), AX0=BOD.X(MODS.apts.A.x0), BX0=BOD.X(BOD.B0.x0);   // the kerb, the far kerb; the house's east wall, the bodega's west wall
  const P=(n,x,z,o)=>KIT.put(n,x,z,{solid:true,...o});
  // (owner, 17 Oct 2026, after the first dressing: "delete everything you added except for the new building, street lights, and trash can and
  // bus stop", "dont remove the dragon either"): the cans at the kerb, the bus stop with its bench, the street light; nothing else of the kit
  P('metaltrashcan_overflowing',BX0-1.2,sw,{rot:.4,m:1.1,name:'TRASH CAN'}); P('trash_can_full',AX0-1.5,sw,{rot:-.3,m:1.4,name:'TRASH CAN'}); P('metaltrashcan_closed',BOUND.x1-2.2,sw,{m:1.0,name:'TRASH CAN'});
  P('busstop_graffiti',xm-6,far+1.6,{rot:Math.PI,m:3.0,name:'BUS STOP'}); P('busstop_bench',xm-6,far+1.2,{rot:Math.PI,m:.9,name:'BENCH'});
  P('street_light',xm+9,far+.4,{rot:Math.PI,m:6.2,name:'STREET LIGHT'});
  DRESS.tick=()=>{};
}

// THE TOWN WALL: RINGX sets the town's outer bounds and the invisible walls around them.
import {SHARED, THREE} from './003-shx.js';
import {PARK, pos, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MISTB, MISTE, MODS, PFAR, RING, SECTIONS, SOL, SYS, TILE} from './006-map-pre.js';
const RINGX={};
{ const R=RING, XS=SHARED.BOD.XS, ZS=SHARED.BOD.ZS, F=SECTIONS.live, T=TILE, C=R.cf={...F};
  const box=f=>({x0:XS(f.x0),x1:XS(f.x1),z0:Math.min(ZS(f.y0),ZS(f.y1)),z1:Math.max(ZS(f.y0),ZS(f.y1))}), W=box(F), {x0,x1,z0,z1}=box(C), H=26*T;
  RINGX.town={x:W.x0,y:W.z0,z:W.x1,w:W.z1};
  const S=MODS.station.BOUND; SHARED.BOUND.x0=Math.min(x0,S.x0); SHARED.BOUND.x1=Math.max(x1,S.x1); SHARED.BOUND.z0=Math.min(z0,S.z0); SHARED.BOUND.z1=Math.max(z1,S.z1); RINGX.bound={x0,x1,z0,z1}; RINGX.pocket=null; RINGX.inPocket=()=>false; Object.assign(MISTB,{x:x0,y:z0,z:x1,w:z1}); MISTE.w=T; Object.assign(PFAR,{x:XS(PARK.x0+(PARK.ox||0)),y:ZS(PARK.y0+(PARK.oy||0)),z:(MODS.landR.x1+18)*T,w:(MODS.landR.z1+18)*T});
  const th=.2*T, wall=(a,b,c,d)=>{ const fb=[a,b,0,c,d,H]; SOL.up.push([a,b,c,d]); FIX.up.push(fb); (RINGX.walls=RINGX.walls||[]).push(fb); };
  wall(x0-th,z0,x0,z1); wall(x1,z0,x1+th,z1); wall(x0,z0-th,x1,z0); wall(x0,z1,x1,z1+th);
  RINGX.inside=(x,z,R=0)=>x>x0+R&&x<x1-R&&z>z0+R&&z<z1-R;
  // the force field: where your section meets the next one you can't walk on, only go there from the map
  { const A=SECTIONS.all, U={uT:{value:0},uP:{value:new THREE.Vector2()},uR:{value:3*T}}, M=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
      vertexShader:'varying vec2 vU; varying vec3 vW; void main(){ vU=uv; vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }',
      fragmentShader:'uniform float uT,uR; uniform vec2 uP; varying vec2 vU; varying vec3 vW; void main(){ float s=vW.x+vW.z; vec2 h=fract(vec2(s*.9,vW.y*1.04)); float edge=step(.92,max(h.x,h.y)); float band=.5+.5*sin(vW.y*3.-uT*2.5+s*.3); float a=(1.-vU.y)*(.05+.16*edge+.07*band)*(.75+.25*sin(uT*1.7+s*.5))*smoothstep(uR,uR*.2,distance(vW.xz,uP)); gl_FragColor=vec4(vec3(.35,.8,1.)*a,1.); }'});
    const FH=7*T, G=new THREE.Group(); G.name='forcefield';
    const SEG=[], side=(ax,az,bx,bz)=>{ SEG.push([ax,az,bx,bz]); const L=Math.hypot(bx-ax,bz-az), m=new THREE.Mesh(new THREE.PlaneGeometry(L,FH),M); m.position.set((ax+bx)/2,FH/2,(az+bz)/2); m.rotation.y=Math.atan2(bz-az,ax-bx); m.frustumCulled=true; m.raycast=()=>{}; G.add(m); };
    const EL=(LEVEL.edge&&LEVEL.edge.lines)||[];   // the level's own edges stand inside the section's box: its sides get a field only where there are none
    if(!EL.length){ if(F.x0>A.x0+.01)side(x0,z0,x0,z1); if(F.x1<A.x1-.01)side(x1,z0,x1,z1); if(Math.min(F.y0,F.y1)>Math.min(A.y0,A.y1)+.01)side(XS(F.x0),ZS(F.y0),XS(F.x1),ZS(F.y0)); if(Math.max(F.y0,F.y1)<Math.max(A.y0,A.y1)-.01)side(XS(F.x0),ZS(F.y1),XS(F.x1),ZS(F.y1)); }
    // the new map's edges (owner, 6 Nov 2026: "forcefield blocks it"): the level file's edge lines (map tiles), each a wall you can't pass and the field where you press against it; past them the backdrop (134f)
    for(const [a,b,c,d] of EL){ const ax=XS(a), az=ZS(b), bx=XS(c), bz=ZS(d); wall(Math.min(ax,bx)-th/2,Math.min(az,bz)-th/2,Math.max(ax,bx)+th/2,Math.max(az,bz)+th/2); side(ax,az,bx,bz); }
    if(G.children.length){ scene.add(G); G.visible=false; for(const c of G.children)c.onBeforeRender=()=>{ U.uT.value=performance.now()/1e3; }; RINGX.field=G; }
    // seen only where you press against it (owner, 4 Nov 2026: "should only pop up to stop players from leaving")
    RINGX.near=(x,z)=>{ let d=1e9; for(const [ax,az,bx,bz] of SEG){ const vx=bx-ax, vz=bz-az, t=Math.max(0,Math.min(1,((x-ax)*vx+(z-az)*vz)/(vx*vx+vz*vz))); d=Math.min(d,Math.hypot(x-ax-t*vx,z-az-t*vz)); } return d; };
    RINGX.fieldTick=(x,z)=>{ if(!RINGX.field)return; const on=SHARED.LVL==='up'&&RINGX.near(x,z)<U.uR.value*1.3; if(on!==G.visible)G.visible=on; if(on)U.uP.value.set(x,z); }; }
  // inside the edges? (a saved spot from before the edges moved is brought in to the way through, 6 Nov 2026)
  { const E=LEVEL.edge&&LEVEL.edge.lines; if(E&&E.length){ const tx=x=>(x-XS(0))/(XS(1)-XS(0)), ty=z=>(z-ZS(0))/(ZS(1)-ZS(0)), xs=E.map(l=>[l[0],l[2]]).flat(), ys=E.map(l=>[l[1],l[3]]).flat(), X0=Math.min(...xs), Y1=Math.max(...ys), Y0=Math.min(...ys);
    const step=E.find(l=>l[1]===l[3]&&l[0]!==l[2]&&l[1]>Y0&&l[1]<Y1), XA=Math.max(...xs), XB=step?Math.min(step[0],step[2]):XA, YS=step?step[1]:Y0;
    RINGX.inEdge=(x,z)=>{ const a=tx(x), b=ty(z); return a>X0&&b<Y1&&b>Y0&&a<(b>YS?XA:XB); };
    const W=LEVEL.places.find(p=>p.kind==='passage');
    SYS.onStart(()=>{ if(SHARED.LVL==='up'&&SHARED.floor==='up'&&!ROOMS.cur&&!(MODS.apts&&MODS.apts.inReal)&&!RINGX.inEdge(pos.x,pos.z)&&W){ pos.x=XS((W.x0+W.x1)/2); pos.z=ZS(LEVEL.block.front+3); } },'065-ring'); } }
  RINGX.tick=()=>{ if(SHARED.LVL==='down')scene.background.setRGB(0,0,0); if(RINGX.fieldTick)RINGX.fieldTick(pos.x,pos.z); };
  window.RINGX=RINGX; }
export {RINGX};

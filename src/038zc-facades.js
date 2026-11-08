// FACADES: a street building's outside modelled, not painted (owner, 8 Nov 2026): solid walls in plain colours, real window openings with frames, sills, lintels, glass and a drawn shade behind it, the room's dark beyond, lit warm at night; string courses, a cornice and a parapet; a shop window left open for its real glass (WINDOWS.pane) and a door.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS} from './006-map-pre.js';
const FACADES={night:{value:0},made:0,tris:0};
{ const hs=(a,b,c)=>SHARED.BOD.g.hash(a,b,c), lin=c=>{ const t=new THREE.Color(); t.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); return [t.r,t.g,t.b]; };
  const SHADES=[[226,214,186],[196,176,140],[168,62,52],[62,82,110],[214,206,196],[120,132,96],[236,226,206],[150,110,80]];
  let MS=null, MG=null; const mats=()=>{ if(MS)return; MS=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
    MS.onBeforeCompile=sh=>{ sh.uniforms.uNight=FACADES.night; sh.vertexShader='attribute float aGlow; varying float vGlow;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGlow=aGlow;');
      sh.fragmentShader='uniform float uNight; varying float vGlow;\n'+sh.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*vGlow*uNight*1.6;\n#include <opaque_fragment>'); };
    MS.customProgramCacheKey=()=>'facade1';
    MG=new THREE.MeshPhongMaterial({color:0x9fb4c4,specular:0xffffff,shininess:90,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}); };
  SYS.add('life',()=>{ const h=CLOCK.h??12, c=x=>Math.max(0,Math.min(1,x)); FACADES.night.value=1-c((h-6.5)/1.5)*c((19.5-h)/1.5); },'038zc-facades');
  // o: L the lot in its own frame (front along L.y1), pt (u,v)->lot tiles (TURN's pt), z1 the height in z-pixels (24 a tile), wall/trim colours,
  // door {u,w} (tiles, its middle and half width), shop [{u0,u1,z0,z1}] openings kept for real glass, glass:true glazes the ground floor's windows itself, seed
  FACADES.make=o=>{ mats(); const {X,Y,Z}=SHARED.BOD, L=o.L, pt=o.pt||((u,v)=>[u,v]), P=[], C=[], G=[], GP=[], seed=o.seed||7;
    const W=(u,v,z)=>{ const q=pt(u,v); return [X(q[0]),Y(z),Z(q[1])]; };
    const quad=(a,b,c,d,col,glow=0)=>{ const k=lin(col); for(const p of [a,b,c,a,c,d]){ P.push(p[0],p[1],p[2]); C.push(k[0],k[1],k[2]); G.push(glow); } };
    const glass=(a,b,c,d)=>{ for(const p of [a,b,c,a,c,d])GP.push(p[0],p[1],p[2]); };
    // a box in the lot's own frame: u across, v depth (front at larger v), z up
    const box=(u0,u1,v0,v1,z0,z1,col,f=1)=>{ const s=k=>col.map(x=>Math.min(255,x*k*f));
      quad(W(u0,v1,z0),W(u1,v1,z0),W(u1,v1,z1),W(u0,v1,z1),s(1)); quad(W(u1,v0,z0),W(u0,v0,z0),W(u0,v0,z1),W(u1,v0,z1),s(.8));
      quad(W(u0,v0,z0),W(u0,v1,z0),W(u0,v1,z1),W(u0,v0,z1),s(.86)); quad(W(u1,v1,z0),W(u1,v0,z0),W(u1,v0,z1),W(u1,v1,z1),s(.86));
      quad(W(u0,v0,z1),W(u0,v1,z1),W(u1,v1,z1),W(u1,v0,z1),s(1.08)); quad(W(u0,v1,z0),W(u0,v0,z0),W(u1,v0,z0),W(u1,v1,z0),s(.6)); };
    const {x0,x1,y0,y1}=L, H=o.z1, wall=o.wall||[138,60,44], trim=o.trim||[200,192,178], fr=o.frame||[40,40,44], D=.28, TOP=H-34;
    // the openings on the front: the shop's, the door, then the upper floors' windows (and the ground floor's when it has no shop glass)
    const holes=[], GF=o.ground??110; for(const s of o.shop||[])holes.push({...s,kind:'shop'});
    if(o.door)holes.push({u0:o.door.u-o.door.w,u1:o.door.u+o.door.w,z0:0,z1:o.door.h||88,kind:'door'});
    const bay=o.bay||2.6, ww=o.ww||1.15, nb=Math.max(1,Math.floor((x1-x0-.8)/bay)), b0=x0+(x1-x0-nb*bay)/2, FH=o.floor||92;
    if(o.glass)for(let i=0;i<nb;i++){ const c=b0+(i+.5)*bay; if(o.door&&Math.abs(c-o.door.u)<o.door.w+ww/2+.3)continue; holes.push({u0:c-ww*.6,u1:c+ww*.6,z0:18,z1:84,kind:'win',sill:1}); }
    let fl=0; for(let z=GF+30;z+66<TOP-6;z+=FH,fl++)for(let i=0;i<nb;i++){ const c=b0+(i+.5)*bay; holes.push({u0:c-ww/2,u1:c+ww/2,z0:z,z1:z+64,kind:'win',sill:1,fl}); }
    // the front wall with real holes: cut into cells at every opening's edges, a cell inside an opening left out
    const us=[...new Set([x0,x1,...holes.flatMap(h=>[h.u0,h.u1])])].sort((a,b)=>a-b), zs=[...new Set([0,H,...holes.flatMap(h=>[h.z0,h.z1])])].sort((a,b)=>a-b);
    for(let i=0;i+1<us.length;i++)for(let j=0;j+1<zs.length;j++){ const um=(us[i]+us[i+1])/2, zm=(zs[j]+zs[j+1])/2; if(holes.some(h=>um>h.u0&&um<h.u1&&zm>h.z0&&zm<h.z1))continue;
      quad(W(us[i],y1,zs[j]),W(us[i+1],y1,zs[j]),W(us[i+1],y1,zs[j+1]),W(us[i],y1,zs[j+1]),wall.map(c=>c*(1-.03*hs(i,j,seed)))); }
    // the other walls and the roof, plain; a parapet round the roof
    quad(W(x1,y0,0),W(x0,y0,0),W(x0,y0,H),W(x1,y0,H),wall.map(c=>c*.8)); quad(W(x0,y0,0),W(x0,y1,0),W(x0,y1,H),W(x0,y0,H),wall.map(c=>c*.88)); quad(W(x1,y1,0),W(x1,y0,0),W(x1,y0,H),W(x1,y1,H),wall.map(c=>c*.88));
    const RC=o.roof||[72,70,72]; quad(W(x0,y0,H-8),W(x0,y1,H-8),W(x1,y1,H-8),W(x1,y0,H-8),RC);
    for(const [a,b,c,d] of [[x0,x1,y1-.3,y1],[x0,x1,y0,y0+.3],[x0,x0+.3,y0,y1],[x1-.3,x1,y0,y1]])box(a,b,c,d,H-8,H+4,trim,.9);
    // each opening: its reveal, and for a window the glass, a shade drawn part way, the dark of the room past it, a sill and a lintel
    for(const [k,h] of holes.entries()){ const {u0,u1,z0,z1}=h, d=h.kind==='shop'?.12:D, R=trim.map(c=>c*.7);
      quad(W(u0,y1,z0),W(u0,y1-d,z0),W(u0,y1-d,z1),W(u0,y1,z1),R); quad(W(u1,y1-d,z0),W(u1,y1,z0),W(u1,y1,z1),W(u1,y1-d,z1),R); quad(W(u0,y1-d,z1),W(u1,y1-d,z1),W(u1,y1,z1),W(u0,y1,z1),R.map(c=>c*.8));
      if(z0>0)quad(W(u0,y1,z0),W(u1,y1,z0),W(u1,y1-d,z0),W(u0,y1-d,z0),R.map(c=>c*1.1));
      if(h.kind==='shop')continue;
      if(h.kind==='door'){ const v=y1-d; quad(W(u0,v,0),W(u1,v,0),W(u1,v,z1),W(u0,v,z1),fr.map(c=>c*1.2)); const m=(u0+u1)/2;
        for(const [a,b] of [[u0+.12,m-.06],[m+.06,u1-.12]]){ box(a,b,v,v+.05,10,40,fr,1.35); box(a,b,v,v+.05,48,z1-10,fr,1.35); } box(m-.04,m+.04,v,v+.06,0,z1,fr,.8); box(m+.12,m+.18,v+.05,v+.12,40,46,[196,160,80]); continue; }
      const v=y1-d, lit=hs(k,seed,3)<.55?1:0, sd=SHADES[Math.floor(hs(k,seed,5)*SHADES.length)], drop=.25+.7*hs(k,seed,9), zs1=z1-(z1-z0)*drop;
      quad(W(u0,v-.05,zs1),W(u1,v-.05,zs1),W(u1,v-.05,z1),W(u0,v-.05,z1),sd,lit*.9); box(u0,u1,v-.07,v-.03,zs1-3,zs1,sd,.8);   // the shade
      const r=v-.75, dk=[22,22,26]; quad(W(u0,r,z0),W(u1,r,z0),W(u1,r,zs1),W(u0,r,zs1),lit?[90,70,48]:dk,lit*.5);   // the room past it
      quad(W(u0,r,z0),W(u0,v,z0),W(u0,v,zs1),W(u0,r,zs1),dk); quad(W(u1,v,z0),W(u1,r,z0),W(u1,r,zs1),W(u1,v,zs1),dk); quad(W(u0,v,z0),W(u0,r,z0),W(u1,r,z0),W(u1,v,z0),dk.map(c=>c*1.3));
      glass(W(u0,v+.02,z0),W(u1,v+.02,z0),W(u1,v+.02,z1),W(u0,v+.02,z1));
      const mu=(u0+u1)/2; box(mu-.03,mu+.03,v,v+.05,z0,z1,fr); box(u0,u1,v,v+.05,(z0+z1)/2-1.5,(z0+z1)/2+1.5,fr);   // the frame's cross
      if(h.sill)box(u0-.12,u1+.12,y1-.02,y1+.12,z0-5,z0,trim,1.05); box(u0-.08,u1+.08,y1-.02,y1+.06,z1,z1+8,trim,.95); }
    // string courses between the floors, a cornice and frieze at the top, a plinth, pilasters at the corners
    for(let z=GF+16;z<TOP-40;z+=FH)box(x0,x1,y1-.02,y1+.07,z,z+5,trim,.92);
    box(x0-.05,x1+.05,y1-.02,y1+.12,TOP,TOP+14,trim,.85); box(x0-.15,x1+.15,y1-.02,y1+.32,TOP+14,TOP+24,trim,1.05); box(x0,x1,y1-.02,y1+.05,0,8,trim,.7);
    for(const a of [x0,x1-.35])box(a,a+.35,y1-.02,y1+.1,0,TOP,wall,.94);
    const g=new THREE.Group(), geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); geo.setAttribute('aGlow',new THREE.Float32BufferAttribute(G,1)); geo.computeVertexNormals();
    const me=new THREE.Mesh(geo,MS); me.castShadow=me.receiveShadow=true; g.add(me);
    if(GP.length){ const gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.Float32BufferAttribute(GP,3)); gg.computeVertexNormals(); const gm=new THREE.Mesh(gg,MG); gm.renderOrder=2; gm.raycast=()=>{}; g.add(gm); }
    g.userData.facade=o.id||1; (o.parent||scene).add(g); FACADES.made++; FACADES.tris+=P.length/9+GP.length/9; return g; };
}
window.FACADES=FACADES;
export {FACADES};

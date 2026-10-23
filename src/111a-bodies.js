// THE BODIES YOU CAN BE: the Walker, or a body moved by his rig (each of its 15 bones takes the turn of the rig piece it stands for); YOU's BODY row; one of each walks main street.
import {SHARED, THREE} from './003-shx.js';
import {CHARS, NPCS, pos, W3} from './003b-systems.js';
import {PPU} from './004-main.js';
import {SAVE} from './005-save.js';
import {ASTEP, MAPG, MODS, SYS, TILE} from './006-map-pre.js';
import {HOMES, ROAM, stfree} from './076-npc-map.js';
import {musScale, sheetView, spreadPose} from './110-musician.js';
const BODIES={list:[],by:{}}; window.BODIES=BODIES;
{ const R=RIG, QS=new URLSearchParams(location.search), V3=THREE.Vector3;
  const BONES=BODIES.BONES=['hips','torso','head','upperArmL','forearmL','handL','upperArmR','forearmR','handR','thighL','shinL','shoeL','thighR','shinR','shoeR'];
  const LIMB=/^(upperArm|forearm|hand|thigh|shin)/, NB=BONES.length, WALKER_H=52;

  /* ---------- one mesh a body: every face flat (its normal from the screen), coloured, held by up to two bones ---------- */
  function mesh(body){ const PM={value:Array.from({length:NB},()=>new THREE.Matrix4())};
    const MOVE=`attribute vec2 bi; attribute float bw; uniform mat4 uPM[${NB}];`, AT_=`mat4 PM=uPM[int(bi.x+.5)]*bw+uPM[int(bi.y+.5)]*(1.-bw);`;
    const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
    mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(cross(dFdx(vViewPosition),dFdy(vViewPosition))); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;'); };
    mat.customProgramCacheKey=()=>'body'+NB;
    const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'bodydist'+NB;
    const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'bodydepth'+NB;
    const me=new THREE.Mesh(body.GEO||(body.GEO=body.geo()),mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=me.receiveShadow=true; me.frustumCulled=false;
    return {me,PM}; }

  /* ---------- posing: the rig's turns, the body's own bone lengths ---------- */
  const X=new V3(),Y=new V3(),Z=new V3(), ROT={}, POS={}, OFV=new V3(), M3=new THREE.Matrix3();
  for(const n of BONES){ ROT[n]=new THREE.Matrix4(); POS[n]=new V3(); }
  function pose(B,PM,body){ '@later'; const S=body.S, KL=body.KL;
    for(let i=0;i<NB;i++){ const n=BONES[i], F=R.frameOf(n,B);
      X.set(F.x.x,F.x.y,F.x.z); Y.set(F.y.x,F.y.y,F.y.z); Z.set(F.z.x,F.z.y,F.z.z); if(LIMB.test(n)){ Y.negate(); Z.negate(); }
      ROT[n].makeBasis(X,Y,Z);
      if(n==='hips')POS[n].set(B.J.pelvis.x*KL,B.J.pelvis.y*KL,B.J.pelvis.z*KL);
      else{ const o=body.off[n]; M3.setFromMatrix4(ROT[o[0]]); OFV.set(o[1]*S,o[2]*S,o[3]*S).applyMatrix3(M3); POS[n].copy(POS[o[0]]).add(OFV); }
      PM.value[i].copy(ROT[n]).scale(OFV.set(S,S,S)).setPosition(POS[n]); if(body.binv)PM.value[i].multiply(body.binv[i]); } }
  BODIES.pose=pose; BODIES.mesh=mesh;

  /* ---------- you (YOU's BODY: WALKER or a body, kept in the browser; ?avatar=key) ---------- */
  let pick='walker'; try{ pick=SAVE.get('body')||'walker'; }catch(e){} if(QS.get('avatar'))pick=QS.get('avatar');
  let ME=null, MEK=null, hid=false;
  W3.body={place:B=>{ const body=BODIES.by[pick];
    if(!body){ if(ME)ME.me.visible=false; if(hid){ hid=false; for(const m of W3.meshes)m.visible=!W3.hideMe; } return; }
    if(MEK!==pick){ if(ME){ W3.group.remove(ME.me); ME.me.material.dispose(); } ME=mesh(body); MEK=pick; W3.group.add(ME.me); }
    hid=true; for(const m of W3.meshes)m.visible=false; ME.me.visible=!W3.hideMe; pose(B,ME.PM,body); }};
  BODIES.pick=()=>pick;
  BODIES.set=key=>{ pick=BODIES.by[key]?key:'walker'; try{ SAVE.set('body',pick); }catch(e){} drawRow(); };
  const LP=document.getElementById('looks'); let ROW=null;
  if(LP){ const at=LP.querySelector('h3'), h=document.createElement('h3'); h.textContent='BODY'; ROW=document.createElement('div'); ROW.className='row';
    LP.insertBefore(h,at); LP.insertBefore(ROW,at); addButton('walker','WALKER'); }
  function addButton(key,label){ if(!ROW)return; const b=document.createElement('button'); b.id='lbody-'+key; b.textContent=label; b.onclick=()=>BODIES.set(key); ROW.appendChild(b); drawRow(); }
  BODIES.credit=t=>{ if(!ROW)return; const c=document.createElement('div'); c.textContent=t; c.style.cssText='color:var(--dim,#8a8f9c);font-size:9px;margin-top:3px'; ROW.after(c); };
  function drawRow(){ if(ROW)for(const b of ROW.children)b.setAttribute('aria-pressed',String(b.id==='lbody-'+pick)); }

  /* ---------- a body that walks main street (?<key>=0 keeps it off, ?sheet=<key> shows its sheet) ---------- */
  const seen=o=>{ for(let q=o;q;q=q.parent)if(!q.visible)return false; return true; };
  BODIES.place=(key,x,z,hd,group)=>{ const N=BODIES.by[key]&&BODIES.by[key].npc; if(!N)return null; const s=N.st; if(!N.prev)N.prev={parent:N.g.parent,x:s.x,z:s.z,hd:s.hd,home:{...s.home},free:N.free,on:N.on}; s.x=x; s.z=z; s.hd=hd; s.to=s.next=null; Object.assign(s.home,{x,z,r:0}); N.free=()=>true; if(group)group.add(N.g); N.on=true; return N; };
  BODIES.hide=key=>{ const N=BODIES.by[key]&&BODIES.by[key].npc; if(N){ N.on=false; N.g.visible=false; } };
  // a borrowed body (the holodeck's knight) goes back where it was: its group, spot, home and roaming
  BODIES.restore=key=>{ const N=BODIES.by[key]&&BODIES.by[key].npc, P=N&&N.prev; if(!P){ BODIES.hide(key); return; } const s=N.st; if(P.parent)P.parent.add(N.g); s.x=P.x; s.z=P.z; s.hd=P.hd; s.to=s.next=null; Object.assign(s.home,P.home); N.free=P.free; N.on=P.on; N.g.visible=!!P.on; delete N.prev; };
  function walker(body){ const SHEET=QS.get('sheet')===body.key, NPC=body.npc={}, g=new THREE.Group(), FIG=mesh(body); g.add(FIG.me); MAPG.bodega.add(g); NPC.g=g;
    const st={x:SHARED.BOD.XS(body.at??100),z:SHARED.BOD.ZS(-74),R:.3*TILE,to:null,next:null,wait:3+Math.random()*4,hd:-Math.PI/2,y:0}, SR=R.create(); NPC.st=st; NPC.at=st;
    const free=(x,z)=>NPC.free?NPC.free(x,z):stfree(x,z,st.R), turn=a=>{ const e=a-st.hd; return Math.atan2(Math.sin(e),Math.cos(e)); };
    if(SHEET){ st.x=SHARED.BOD.XS(100); st.z=SHARED.BOD.ZS((SHARED.BOD.MAP.y0+SHARED.BOD.MAP.y1)/2); st.hd=Math.PI/4; }
    if(NPCS.extra)NPCS.extra.push(NPC);
    NPC.on=QS.get(body.key)!=='0'&&body.at!=null; if(body.at!=null)HOMES.assign(st,body.key,{lv:'up'},(x,z)=>stfree(x,z,st.R)); else HOMES.assign(st,body.key,{home:{x:st.x,z:st.z,r:0}}); NPC.key=body.key; NPC.name=body.label; if(CHARS.apply)CHARS.apply(NPC);
    NPC.tick=dt=>{ if(!NPC.on&&!SHEET){ g.visible=false; return; } g.visible=true;
      if(SHEET){ R.farOnly(false); const B=R.settle(R.build(spreadPose(),null),0); st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1); pose(B,FIG.PM,body);
        if(!NPC.sheetOn){ NPC.sheetOn=true; sheetView(g,st.y+g.scale.y*27); } return; }
      const near=Math.hypot(pos.x-st.x,pos.z-st.z)<40;
      if(!free(st.x,st.z)){ for(let k=0;k<80;k++){ const a=k*2.4, r=(k>>2)*.25*TILE; if(free(st.x+Math.sin(a)*r,st.z+Math.cos(a)*r)){ st.x+=Math.sin(a)*r; st.z+=Math.cos(a)*r; break; } } }
      if(!st.to){ SR.target=0; st.wait-=dt; if(st.wait<=0&&!ROAM.pick(st,(x,z)=>free(x,z)))st.wait=1; }
      if(st.to){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez);
        if(d<.15*TILE){ st.to=st.next||null; st.next=null; if(!st.to)st.wait=3+Math.random()*7; }
        else{ const e=turn(Math.atan2(ex,ez)); st.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*3); SR.target=Math.abs(e)<.6?1:0; } }
      const d0=SR.dist; R.step(SR,dt); const go=(SR.dist-d0)*W3.SZ/PPU*.85;
      if(go>0){ const nx=st.x+Math.sin(st.hd)*go, nz=st.z+Math.cos(st.hd)*go; if(free(nx,nz)){ st.x=nx; st.z=nz; } else { st.to=null; st.next=null; st.wait=.5+Math.random(); } }
      st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; musScale(g,1);
      if(!near||!seen(g)||NPC.hid)return; if(NPC.B&&!ASTEP.gate(NPC,dt))return;
      R.farOnly(false); const B=R.pose(SR,true); NPC.B=B; pose(B,FIG.PM,body); };
    SYS.add('dress',dt=>NPC.tick(dt||0),'111a-bodies '+body.key); }

  /* ---------- a body: key, label, geo() (position, normal, color, bi, bw), height and hip height (its units), off {bone:[parent,x,y,z]}, binv (or null), at (main street spot) ---------- */
  BODIES.add=body=>{ body.S=WALKER_H/body.height; body.KL=body.hipY*body.S/R.STAND; BODIES.list.push(body); BODIES.by[body.key]=body;
    body.tris=()=>(body.GEO||(body.GEO=body.geo())).attributes.position.count/3; addButton(body.key,body.label); walker(body); };
}
export {BODIES};

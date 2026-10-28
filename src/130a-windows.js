// THE WINDOWS: a glass pane shows a picture of the real view through it, taken while you are inside (the room lit, the street there): from inside, the street where the building really stands; from the street, the real inside. Retaken each visit and when the hour turns.
import {THREE} from './003-shx.js';
import {CLOCK, ROOMS, WINDOWS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {FADE, SYS, TILE} from './006-map-pre.js';
{ const cam=new THREE.PerspectiveCamera(62,1,.05,400*TILE), V=new THREE.Vector3(), N=new THREE.Vector3(), C=new THREE.Vector3(), Q=new THREE.Quaternion(), done={};
  // the glass: the picture a little cool and dim, two soft streaks of sheen across it
  const glass=map=>{ const m=new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,toneMapped:false}); m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n { vec2 q=vMapUv; float t=q.x*.8+q.y*.55; diffuseColor.rgb=diffuseColor.rgb*vec3(.84,.88,.93)+vec3(.045,.05,.055)*smoothstep(.04,0.,abs(t-.55))+vec3(.022)*smoothstep(.1,0.,abs(t-.82)); }'); }; return m; };
  // a pane (WINDOWS.pane: its mesh, the inside it belongs to: ROOMS.off[id] with shift, inside to street; and which way it looks: 'out' from inside at the street, 'in' from the street at the inside)
  const bake=p=>{ const o=ROOMS.off[p.off], b=o&&o.box, sh=o&&o.shift; if(!b||!sh||!p.me.parent)return; const me=p.me, g=me.geometry.parameters; me.updateWorldMatrix(true,false);
    me.getWorldPosition(V); N.set(0,0,1).applyQuaternion(me.getWorldQuaternion(Q)); N.y=0; N.normalize();
    if(p.look==='out'){ C.set((b.x0+b.x1)/2,0,(b.z0+b.z1)/2); if(N.dot(C.sub(V).setY(0))>0)N.negate(); V.x+=sh[0]; V.z+=sh[1]; V.addScaledVector(N,.25*TILE); }
    else{ V.x-=sh[0]; V.z-=sh[1]; C.set((b.x0+b.x1)/2,0,(b.z0+b.z1)/2); if(N.dot(C.clone().sub(V).setY(0))<0)N.negate(); V.addScaledVector(N,.45*TILE); }
    const a=Math.max(.3,Math.min(4,(g.width||1)/(g.height||1))), w=a>=1?256:Math.round(256*a), h=a>=1?Math.round(256/a):256;
    if(!p.rt){ p.rt=new THREE.WebGLRenderTarget(w,h); p.rt.texture.colorSpace=THREE.SRGBColorSpace; me.material=glass(p.rt.texture); }
    cam.aspect=a; cam.fov=60; cam.updateProjectionMatrix(); cam.position.copy(V); cam.lookAt(V.x+N.x,V.y,V.z+N.z); cam.updateMatrixWorld();
    renderer.setRenderTarget(p.rt); renderer.render(scene,cam); renderer.setRenderTarget(null); me.visible=true; };
  WINDOWS.bake=id=>{ const L=WINDOWS.panes.filter(p=>p.off===id); if(!L.length)return; const vis=L.map(p=>p.me.visible), clip=renderer.clippingPlanes, sb=renderer.shadowMap.autoUpdate;
    for(const p of L)p.me.visible=false; renderer.shadowMap.autoUpdate=false;
    try{ for(const p of L.filter(p=>p.look==='in'))bake(p);
      renderer.clippingPlanes=[]; ROOMS.offHide(false); for(const p of L.filter(p=>p.look==='out'))bake(p); }
    finally{ ROOMS.offHide(true); renderer.clippingPlanes=clip; renderer.shadowMap.autoUpdate=sb; L.forEach((p,i)=>{ p.me.visible=p.rt?true:vis[i]; }); } done[id]=Math.floor(CLOCK.h??12); };
  // once you have been in a moment (lights picked, the fade gone), and again when the hour turns while you are in
  let t0=0, at=null; SYS.add('places',()=>{ const id=ROOMS.offIn&&ROOMS.offIn(), now=performance.now(); if(id!==at||FADE.busy){ at=id; t0=now; } if(!id||FADE.busy)return; const hr=Math.floor(CLOCK.h??12);
    if(now-t0>1200&&done[id]!==hr&&!WINDOWS.busy){ WINDOWS.busy=true; try{ WINDOWS.bake(id); }catch(e){ console.warn('WINDOWS',e); done[id]=hr; } WINDOWS.busy=false; } },'130a-windows');
  window.WINDOWS=WINDOWS; }

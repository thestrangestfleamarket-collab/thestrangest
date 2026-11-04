// THE WINDOWS: a glass pane shows the real view through it: from inside, the real street where the building stands, drawn live in 3D through the glass; from the street, a picture of the real inside, taken while you are in and retaken each visit and when the hour turns.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, ROOMS, VR, WINDOWS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {FADE, STORE, SYS, TILE} from './006-map-pre.js';
{ const cam=new THREE.PerspectiveCamera(62,1,.05,400*TILE), V=new THREE.Vector3(), N=new THREE.Vector3(), C=new THREE.Vector3(), Q=new THREE.Quaternion(), done={};
  // the glass: the picture a little cool and dim, two soft streaks of sheen across it
  const glass=(map,boost=1)=>{ const m=new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,toneMapped:false}); m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n { vec2 q=vMapUv; float t=q.x*.8+q.y*.55; diffuseColor.rgb=diffuseColor.rgb*vec3(.84,.88,.93)*'+boost.toFixed(2)+'+vec3(.045,.05,.055)*smoothstep(.04,0.,abs(t-.55))+vec3(.022)*smoothstep(.1,0.,abs(t-.82)); }'); }; return m; };   // a shop window seen from the street is brighter than its picture: the inside's lamps are few
  // a pane (WINDOWS.pane: its mesh, the inside it belongs to: ROOMS.off[id] with shift, inside to street; and which way it looks: 'out' from inside at the street, 'in' from the street at the inside)
  // the place a pane belongs to: an inside off the map (its box, shift: inside to street) or a street shop built in place (its own box, no shift)
  const place=k=>{ const o=ROOMS.off[k]; if(o)return o.shift?{b:o.box,sh:o.shift,in:()=>ROOMS.offIn()===k}:null; const R=STORE.inside&&STORE.inside[k]&&ROOMS.boxes().find(b=>b.id===k); return R?{b:R,sh:[0,0],in:()=>!!ROOMS.cur&&ROOMS.cur.id===k}:null; };
  // until its first picture a pane is plain dark glass under the same sheen
  const DARK=new THREE.DataTexture(new Uint8Array([22,26,32,255]),1,1); DARK.needsUpdate=true; DARK.colorSpace=THREE.SRGBColorSpace; const darkM=glass(DARK);
  WINDOWS.dark=me=>{ me.material=darkM; me.visible=true; }; for(const p of WINDOWS.panes)if(p.dark&&!p.rt)WINDOWS.dark(p.me);
  const bake=p=>{ const P=place(p.off), b=P&&P.b, sh=P&&P.sh; if(!b||!sh||!p.me.parent)return; const me=p.me, g=me.geometry.parameters; let fov=60; me.updateWorldMatrix(true,false);
    me.getWorldPosition(V); N.set(0,0,1).applyQuaternion(me.getWorldQuaternion(Q)); N.y=0; N.normalize();
    if(p.look==='out'){ C.set((b.x0+b.x1)/2,0,(b.z0+b.z1)/2); if(N.dot(C.sub(V).setY(0))>0)N.negate(); V.x+=sh[0]; V.z+=sh[1]; V.addScaledVector(N,.25*TILE); }
    else{ V.x-=sh[0]; V.z-=sh[1]; C.set((b.x0+b.x1)/2,0,(b.z0+b.z1)/2); if(N.dot(C.clone().sub(V).setY(0))<0)N.negate(); const nr=me.userData.near!=null?me.userData.near:.45; V.addScaledVector(N,nr*TILE); if(nr<0)fov=2*Math.atan((g.height||1)/2/(-nr*TILE))*180/Math.PI; }   // a pane with a negative near is pictured from the street side, the whole pane in frame, as a passer-by sees it
    const a=Math.max(.3,Math.min(4,(g.width||1)/(g.height||1))), w=a>=1?256:Math.round(256*a), h=a>=1?Math.round(256/a):256;
    if(!p.rt){ p.rt=new THREE.WebGLRenderTarget(w,h); p.rt.texture.colorSpace=THREE.SRGBColorSpace; me.material=glass(p.rt.texture,p.look==='in'?1.7:1); }
    cam.aspect=a; cam.fov=fov; cam.updateProjectionMatrix(); cam.position.copy(V); cam.lookAt(V.x+N.x,V.y,V.z+N.z); cam.updateMatrixWorld();
    renderer.setRenderTarget(p.rt); renderer.render(scene,cam); renderer.setRenderTarget(null); me.visible=true; };
  WINDOWS.bake=id=>{ const L=WINDOWS.panes.filter(p=>p.off===id); if(!L.length)return; const vis=L.map(p=>p.me.visible), sb=renderer.shadowMap.autoUpdate;
    for(const p of L)p.me.visible=false; renderer.shadowMap.autoUpdate=false;
    try{ for(const p of L.filter(p=>p.look==='in'))bake(p); }
    finally{ renderer.shadowMap.autoUpdate=sb; L.forEach((p,i)=>{ p.me.visible=p.rt?true:vis[i]; }); } done[id]=Math.floor(CLOCK.h??12); };
  // once you have been in a moment (lights picked, the fade gone), and again when the hour turns while you are in
  let t0=0, at=null; SYS.add('places',()=>{ const id=(ROOMS.offIn&&ROOMS.offIn())||(ROOMS.cur&&ROOMS.cur.id&&STORE.inside&&STORE.inside[ROOMS.cur.id]?ROOMS.cur.id:null), now=performance.now(); if(id!==at||FADE.busy){ at=id; t0=now; } if(!id||FADE.busy)return; const hr=Math.floor(CLOCK.h??12);
    if(now-t0>1200&&done[id]!==hr&&!WINDOWS.busy){ WINDOWS.busy=true; try{ WINDOWS.bake(id); }catch(e){ console.warn('WINDOWS',e); done[id]=hr; } WINDOWS.busy=false; } },'130a-windows');
  // live: from inside, the street-side glass shows the real street in 3D, drawn each frame from your own camera moved to where the building really stands (only what lies beyond the glass), and seen through the glass's own pixels; the walkers near it keep walking (NPCS reads WINDOWS.near)
  const LV={rt:new Map(),res:new THREE.Vector2(1,1)}, FR=new THREE.Frustum(), M4=new THREE.Matrix4(), SP=new THREE.Sphere(), LC=new Map(); WINDOWS.eyes=[]; WINDOWS.live=LV;
  const liveM=t=>{ const m=new THREE.ShaderMaterial({uniforms:{tLive:{value:t},uRes:{value:LV.res}},vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader:'uniform sampler2D tLive; uniform vec2 uRes; varying vec2 vU; void main(){ vec3 c=texture2D(tLive,gl_FragCoord.xy/uRes).rgb; float t=vU.x*.8+vU.y*.55; gl_FragColor=vec4(c*vec3(.93,.95,.97)+vec3(.035,.04,.045)*smoothstep(.04,0.,abs(t-.55))+vec3(.018)*smoothstep(.1,0.,abs(t-.82)),1.); }',side:THREE.DoubleSide,toneMapped:false}); m.clipping=false; return m; };
  WINDOWS.near=(x,z,r=20*TILE)=>{ for(const e of WINDOWS.eyes)if(Math.abs(x-e.x)<r&&Math.abs(z-e.z)<r)return true; return false; };
  SYS.add('rooms',()=>{ const id=(ROOMS.offIn&&ROOMS.offIn())||(ROOMS.cur&&ROOMS.cur.id&&STORE.inside&&STORE.inside[ROOMS.cur.id]?ROOMS.cur.id:null); WINDOWS.eyes.length=0; if(!id||WINDOWS.busy||VR.on)return;
    const P=place(id); if(!P)return; const L=WINDOWS.panes.filter(p=>p.off===id&&p.look==='out'&&p.me.parent); if(!L.length)return; const b=P.b, sh=P.sh, cam=SHARED.cam;
    M4.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); FR.setFromProjectionMatrix(M4); const G=new Map();
    for(const p of L){ const me=p.me; me.updateWorldMatrix(true,false); me.getWorldPosition(V); N.set(0,0,1).applyQuaternion(me.getWorldQuaternion(Q)); N.y=0; N.normalize(); C.set((b.x0+b.x1)/2,0,(b.z0+b.z1)/2); if(N.dot(C.sub(V).setY(0))>0)N.negate();
      WINDOWS.eyes.push({x:V.x+sh[0],z:V.z+sh[1]}); const c=-(N.x*(V.x+sh[0])+N.z*(V.z+sh[1])), k=Math.round(N.x*8)+','+Math.round(N.z*8)+','+Math.round(c/(.5*TILE)); let g=G.get(k); if(!g)G.set(k,g={n:N.clone(),c,L:[],seen:false}); g.L.push(p);
      me.geometry.boundingSphere||me.geometry.computeBoundingSphere(); SP.copy(me.geometry.boundingSphere).applyMatrix4(me.matrixWorld); if(me.visible&&FR.intersectsSphere(SP))g.seen=true; }
    const w=renderer.getRenderTarget()?renderer.getRenderTarget().width:0, sz=renderer.getDrawingBufferSize(new THREE.Vector2()), W=Math.max(1,(SHARED.composer&&SHARED.composer.renderTarget1&&SHARED.composer.renderTarget1.width)||w||sz.x), H=Math.max(1,(SHARED.composer&&SHARED.composer.renderTarget1&&SHARED.composer.renderTarget1.height)||sz.y); LV.res.set(W,H);
    const todo=[...G.entries()].filter(([,g])=>g.seen); if(!todo.length)return; const sb=renderer.shadowMap.autoUpdate, hid=WINDOWS.panes.filter(p=>p.off===id&&p.me.visible); WINDOWS.busy=true;
    try{ renderer.shadowMap.autoUpdate=false; for(const p of hid)p.me.visible=false;
      let lc=LC.get(cam); if(!lc)LC.set(cam,lc=cam.clone()); lc.copy(cam); lc.position.x+=sh[0]; lc.position.z+=sh[1]; lc.updateMatrixWorld();
      ROOMS.peek(()=>{ for(const [k,g] of todo){ let rt=LV.rt.get(k); if(!rt){ rt=new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType}); rt.m=liveM(rt.texture); LV.rt.set(k,rt); } if(rt.width!==W||rt.height!==H)rt.setSize(W,H);
          renderer.clippingPlanes=[new THREE.Plane(g.n,g.c-.02*TILE)]; renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene,lc); for(const p of g.L)if(p.me.material!==rt.m){ p.me.material=rt.m; p.live=1; } } }); }
    catch(e){ console.warn('WINDOWS live',e); } finally{ renderer.setRenderTarget(null); for(const p of hid)p.me.visible=true; renderer.shadowMap.autoUpdate=sb; WINDOWS.busy=false; } },'130a-windows-live');
  // the first picture without a visit: an inside off the map with panes looking in (the bodega) is built a moment after the start, pictured from the street and dropped again; the pictures are kept in the browser for this build, so the next start needs no build
  const KEY=id=>'winpic:'+id+':'+(((document.querySelector('meta[name=market-build]')||{}).content)||'local'), buf=new Uint8Array(256*256*4);
  const shot=p=>{ const w=p.rt.width, h=p.rt.height, cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'), im=g.createImageData(w,h); renderer.readRenderTargetPixels(p.rt,0,0,w,h,buf);
    for(let y=0;y<h;y++)im.data.set(buf.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4); g.putImageData(im,0,0); return cv.toDataURL('image/png'); };
  WINDOWS.first=async id=>{ const L=WINDOWS.panes.filter(p=>p.off===id&&p.look==='in'); if(!L.length||done[id]!=null||WINDOWS.busy)return; let S=null; try{ S=JSON.parse(localStorage.getItem(KEY(id))||'null'); }catch(e){}
    if(S&&S.length===L.length){ await Promise.all(L.map((p,i)=>new Promise(res=>{ const im=new Image(); im.onload=()=>{ const t=new THREE.Texture(im); t.colorSpace=THREE.SRGBColorSpace; t.needsUpdate=true; p.me.material=glass(t,1.7); p.me.visible=true; p.kept=t; res(); }; im.onerror=()=>res(); im.src=S[i]; }))); if(L.every(p=>p.kept))return; }
    const o=ROOMS.off[id]; if(!o||!ROOMS.offBuild)return; WINDOWS.busy=true; try{ const was=ROOMS.lazy[id]&&ROOMS.lazy[id].done; await ROOMS.offBuild(id); WINDOWS.bake(id); done[id]=null; try{ localStorage.setItem(KEY(id),JSON.stringify(L.map(shot))); }catch(e){} if(!was)ROOMS.offDrop(id); } catch(e){ console.warn('WINDOWS first',e); } WINDOWS.busy=false; };
  let firstAt=0; SYS.add('places',()=>{ if(!window.__started||FADE.busy||WINDOWS.firstDone)return; if(!firstAt)firstAt=performance.now(); if(performance.now()-firstAt<4000)return; WINDOWS.firstDone=true; for(const id in ROOMS.off)if(!ROOMS.offIn()&&WINDOWS.panes.some(p=>p.off===id&&p.look==='in'))WINDOWS.first(id); },'130a-windows-first');
  window.WINDOWS=WINDOWS; }

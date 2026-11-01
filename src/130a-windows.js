// THE WINDOWS: a glass pane shows a picture of the real view through it, taken while you are inside (the room lit, the street there): from inside, the street where the building really stands; from the street, the real inside. Retaken each visit and when the hour turns.
import {THREE} from './003-shx.js';
import {CLOCK, ROOMS, WINDOWS} from './003b-systems.js';
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
    try{ for(const p of L.filter(p=>p.look==='in'))bake(p); ROOMS.peek(()=>{ for(const p of L.filter(p=>p.look==='out'))bake(p); }); }
    finally{ renderer.shadowMap.autoUpdate=sb; L.forEach((p,i)=>{ p.me.visible=p.rt?true:vis[i]; }); } done[id]=Math.floor(CLOCK.h??12); };
  // once you have been in a moment (lights picked, the fade gone), and again when the hour turns while you are in
  let t0=0, at=null; SYS.add('places',()=>{ const id=(ROOMS.offIn&&ROOMS.offIn())||(ROOMS.cur&&ROOMS.cur.id&&STORE.inside&&STORE.inside[ROOMS.cur.id]?ROOMS.cur.id:null), now=performance.now(); if(id!==at||FADE.busy){ at=id; t0=now; } if(!id||FADE.busy)return; const hr=Math.floor(CLOCK.h??12);
    if(now-t0>1200&&done[id]!==hr&&!WINDOWS.busy){ WINDOWS.busy=true; try{ WINDOWS.bake(id); }catch(e){ console.warn('WINDOWS',e); done[id]=hr; } WINDOWS.busy=false; } },'130a-windows');
  // the first picture without a visit: an inside off the map with panes looking in (the bodega) is built a moment after the start, pictured from the street and dropped again; the pictures are kept in the browser for this build, so the next start needs no build
  const KEY=id=>'winpic:'+id+':'+(((document.querySelector('meta[name=market-build]')||{}).content)||'local'), buf=new Uint8Array(256*256*4);
  const shot=p=>{ const w=p.rt.width, h=p.rt.height, cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'), im=g.createImageData(w,h); renderer.readRenderTargetPixels(p.rt,0,0,w,h,buf);
    for(let y=0;y<h;y++)im.data.set(buf.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4); g.putImageData(im,0,0); return cv.toDataURL('image/png'); };
  WINDOWS.first=async id=>{ const L=WINDOWS.panes.filter(p=>p.off===id&&p.look==='in'); if(!L.length||done[id]!=null||WINDOWS.busy)return; let S=null; try{ S=JSON.parse(localStorage.getItem(KEY(id))||'null'); }catch(e){}
    if(S&&S.length===L.length){ await Promise.all(L.map((p,i)=>new Promise(res=>{ const im=new Image(); im.onload=()=>{ const t=new THREE.Texture(im); t.colorSpace=THREE.SRGBColorSpace; t.needsUpdate=true; p.me.material=glass(t,1.7); p.me.visible=true; p.kept=t; res(); }; im.onerror=()=>res(); im.src=S[i]; }))); if(L.every(p=>p.kept))return; }
    const o=ROOMS.off[id]; if(!o||!ROOMS.offBuild)return; WINDOWS.busy=true; try{ const was=ROOMS.lazy[id]&&ROOMS.lazy[id].done; await ROOMS.offBuild(id); WINDOWS.bake(id); done[id]=null; try{ localStorage.setItem(KEY(id),JSON.stringify(L.map(shot))); }catch(e){} if(!was)ROOMS.offDrop(id); } catch(e){ console.warn('WINDOWS first',e); } WINDOWS.busy=false; };
  let firstAt=0; SYS.add('places',()=>{ if(!window.__started||FADE.busy||WINDOWS.firstDone)return; if(!firstAt)firstAt=performance.now(); if(performance.now()-firstAt<4000)return; WINDOWS.firstDone=true; for(const id in ROOMS.off)if(!ROOMS.offIn()&&WINDOWS.panes.some(p=>p.off===id&&p.look==='in'))WINDOWS.first(id); },'130a-windows-first');
  window.WINDOWS=WINDOWS; }

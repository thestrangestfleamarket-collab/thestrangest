// THE LABELS: words that hang in the world (a name over a head, what someone said, a drone's card) drawn as page text over the game, so they are always at the screen's own sharpness, never at the game's resolution or under its PS2 filter; a label follows a point in the world. In the headset nothing here shows (the callers keep their own pictures there).
import {SHARED, THREE} from './003-shx.js';
import {VR} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
const LABELS={list:new Set()};
{ const box=document.createElement('div'); box.id='wlabels'; box.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:3;overflow:hidden'; document.body.appendChild(box);
  const V=new THREE.Vector3();
  LABELS.add=()=>{ const el=document.createElement('div'); el.style.cssText='position:absolute;left:0;top:0;display:none;white-space:nowrap;text-align:center;will-change:transform'; box.appendChild(el);
    const L={el,p:new THREE.Vector3(),on:false,html:null,
      set(h){ if(h!==L.html){ L.html=h; el.innerHTML=h; L.w=0; } return L; },
      at(x,y,z){ L.p.set(x,y,z); return L; },
      show(v){ L.on=!!v; if(!L.on&&el.style.display!=='none')el.style.display='none'; return L; },
      remove(){ el.remove(); LABELS.list.delete(L); }};
    LABELS.list.add(L); return L; };
  // each frame, after the camera is placed: the bottom middle of a label sits on its point, pushed in to stay on the screen
  LABELS.place=()=>{ const cam=SHARED.cam; if(!LABELS.list.size||!cam)return; cam.updateMatrixWorld(); const r=renderer.domElement.getBoundingClientRect(), off=!!VR.on;
    for(const L of LABELS.list){ if(!L.on)continue; V.copy(L.p).project(cam);
      if(off||!(V.z>-1&&V.z<1)||Math.abs(V.x)>1.3||Math.abs(V.y)>1.3){ if(L.el.style.display!=='none')L.el.style.display='none'; continue; }
      let x=r.left+(V.x+1)/2*r.width, y=r.top+(1-V.y)/2*r.height; if(L.el.style.display==='none')L.el.style.display='block';
      if(!L.w){ L.w=L.el.offsetWidth; L.h=L.el.offsetHeight; } x=Math.min(Math.max(x,r.left+4+L.w/2),r.right-4-L.w/2); y=Math.max(y,r.top+4+L.h);   // kept on the screen
      L.el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-100%)'; } };
  SYS.add('cam',()=>LABELS.place(),'labels');
  window.LABELS=LABELS; }
export {LABELS};

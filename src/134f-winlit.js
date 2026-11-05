// THE WINDOWS AT DUSK: WINLIT finds every painted window material (an emissive picture) and lights it as the sun goes, each in one of eight groups at its own moment over a few degrees of dusk, so a street never switches on at once (4 Nov 2026, from Nevaland); off again by day.
import {CLOCK} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS} from './006-map-pre.js';
const WINLIT={};
{ const W=[], cl=v=>Math.max(0,Math.min(1,v));
  WINLIT.scan=()=>{ scene.traverse(o=>{ for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){ if(!m.emissiveMap||!m.emissive||m.emissive.getHex()!==0xffffff||m.userData.win)continue; m.userData.win={base:m.emissiveIntensity,on:1.5-(W.length%8)/7*4.5}; W.push(m); } }); for(let i=W.length-1;i>=0;i--)if(W[i].userData.win.gone)W.splice(i,1); };
  WINLIT.tick=()=>{ const e=CLOCK.dayElev(); for(const m of W){ const w=m.userData.win, k=cl((w.on-e)/1.5); m.emissiveIntensity=w.base*(.08+.92*k); } };
  SYS.onStart(()=>{ WINLIT.scan(); WINLIT.tick(); }); SYS.add('perfBounds',()=>WINLIT.scan(),'134f-winlit'); SYS.every(()=>WINLIT.tick(),500,'134f-winlit');
  WINLIT.count=()=>W.length; WINLIT.lit=()=>W.filter(m=>m.emissiveIntensity>m.userData.win.base*.5).length; window.WINLIT=WINLIT; }

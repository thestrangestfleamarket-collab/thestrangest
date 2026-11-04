// THE MESSAGES: SAY(text, colour, o) puts a line over the game for five seconds (three at most), writes it in the HUD's log and, in the headset, in its notes.
import {UI, VR} from './003b-systems.js';
let J=null;
const SAY=(t,c='#e8e2cc',o)=>{ if(!J){ J=document.createElement('div'); J.id='fjour'; J.style.cssText='position:fixed;left:50%;top:40%;transform:translateX(-50%);max-width:70vw;text-align:center;z-index:6;pointer-events:none;font:11px Silkscreen,monospace;letter-spacing:.3px;display:grid;gap:2px;zoom:var(--uiz,1)'; document.body.appendChild(J); }
  const d=document.createElement('div'); d.textContent=t; d.style.cssText=`color:${c};text-shadow:1px 1px 0 #000,-1px 0 0 #000`; J.appendChild(d); while(J.children.length>3)J.firstChild.remove(); setTimeout(()=>d.remove(),5000); if(UI.log)UI.log(t,c); if(VR.note)VR.note(t,c,o); };
window.SAY=SAY;
export {SAY};

// THE SPOT CODE (owner, 7 Nov 2026: "add a # to screen that will give you the precise spot in game with the right angle im looking from"): a # under the map copies a code of where you are (place, height, level, inside, facing), the view (kind, turn, tilt, zoom, pan), the hour and the weather; ?spot=<code> starts the game there (071 puts you there, this sets the view).
import {SHARED} from './003-shx.js';
import {DN, pos, ROOMS, UI, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {FADE, SECTION, SYS} from './006-map-pre.js';
import {SPOT0} from './071-main-11.js';
const SPOT={};
{ const f2=v=>Math.round(v*100)/100, f4=v=>Math.round(v*1e4)/1e4;
  SPOT.make=()=>{ const o={x:f2(pos.x),z:f2(pos.z),y:f2(SHARED.py),h:f4(SHARED.heading),lv:SHARED.floor,v:UI.view,yw:f4(SHARED.yaw),pt:f4(SHARED.pitch),pp:f4(SHARED.ppu||0),d:f2(UI.dist||0),fz:f2(UI.fz||1),
      of:[f2(UI.off.x),f2(UI.off.y),f2(UI.off.z)],sec:SECTION.id,hr:f2(DN.clockH?DN.clockH():0),wx:WX.now&&WX.kind?WX.kind(WX.now):''};
    try{ o.in=ROOMS.offIn()||''; }catch(e){} try{ o.lvl=SHARED.LVL||''; }catch(e){}
    return 'S1'+btoa(JSON.stringify(o)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
  const put=o=>{ if(!o)return; if(o.v&&UI.view!==o.v)UI.setView(o.v); if(Number.isFinite(o.yw))SHARED.yaw=SHARED.yawTo=o.yw; if(Number.isFinite(o.pt))SHARED.pitch=SHARED.pitchTo=o.pt;
    if(o.pp>0)SHARED.ppu=SHARED.ppuTo=o.pp; if(o.d>0)UI.dist=UI.distTo=o.d; if(o.fz>0)UI.fz=o.fz; if(Array.isArray(o.of))UI.off.set(o.of[0]||0,o.of[1]||0,o.of[2]||0); UI.hold=o.v==='iso'; };
  SPOT.put=put;
  if(SPOT0)SYS.onStart(()=>{ let n=0; const go=()=>{ if(FADE&&FADE.busy&&n++<40)return setTimeout(go,250); put(SPOT0); setTimeout(()=>put(SPOT0),600); }; setTimeout(go,800); },'162fb-spot');
  const b=document.createElement('button'); b.id='hspot'; b.textContent='#'; b.title='copy this exact spot and view (paste it to Claude)';
  const css=document.createElement('style'); css.textContent='#hspot{font:11px Silkscreen,monospace;color:#7de0a4;background:#00000066;border:1px solid #2d5a40;padding:1px 6px;margin-left:6px;cursor:pointer;pointer-events:auto} #hspot:hover{color:#f2c14e;border-color:#f2c14e}';
  document.head.appendChild(css);
  b.onclick=async e=>{ e.stopPropagation(); const c=SPOT.make(); let ok=false; try{ await navigator.clipboard.writeText(c); ok=true; }catch(er){}
    if(!ok)try{ prompt('YOUR SPOT', c); }catch(er){} SAY(ok?'SPOT COPIED. PASTE IT TO CLAUDE.':'SPOT: '+c,'#7de0a4'); };
  const place=()=>{ const xy=document.getElementById('hmxy'); if(!xy){ setTimeout(place,500); return; } xy.parentNode.insertBefore(b,xy.nextSibling); };
  place();
  window.SPOT=SPOT; }

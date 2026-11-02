// CHARACTER OVERRIDES: characters.json (keyed by a character's home id) changes its name, size, stats and scale. Committed records come in through LEVEL.chars and are applied in makeNPC; the character editor's draft (SAVE 'chared', same shape) is applied live once the start is up. Home ranges fold into LEVEL.homes (006) and ship through the existing home path.
import {SHARED} from './003-shx.js';
import {CHARS, NPCS} from './003b-systems.js';
import {SAVE} from './005-save.js';
import {LEVEL, SYS, TILE} from './006-map-pre.js';
Object.assign(CHARS,{
  rec:id=>(LEVEL.chars&&LEVEL.chars[id])||null,
  id:N=>(N&&N.st&&N.st.home&&N.st.home.id)||(N&&N.key)||null,
  // from a committed record (makeNPC): the ship fields that change the running character
  apply(N){ const r=CHARS.rec(CHARS.id(N)); if(r)CHARS.put(N,r); },
  put(N,r){ const st=N.st; if(!r)return;
    if(r.name)N.name=r.name;
    if(r.hp!=null)N.hp=+r.hp; if(r.stamina!=null)N.sta=+r.stamina;
    if(r.speed!=null&&st)st.v=+r.speed*TILE; if(r.size!=null&&st)st.R=+r.size*TILE;
    if(+r.scale>0&&N.g){ if('size' in N)N.size=+r.scale; else N.g.scale.setScalar(+r.scale); }
    if(r.tint&&N.ct&&/^#[0-9a-f]{6}$/i.test(r.tint))N.ct.set(r.tint); },
  // one field, live, from the editor; value is already in the record's units (tiles a second, map tiles, ...)
  live(N,f,v){ const st=N&&N.st; if(!N)return; switch(f){
    case 'name': N.name=String(v); break;
    case 'hp': N.hp=+v; break; case 'stamina': N.sta=+v; break;
    case 'speed': if(st)st.v=+v*TILE; break; case 'size': if(st)st.R=+v*TILE; break;
    case 'scale': if('size' in N)N.size=+v>0?+v:1; else if(N.g)N.g.scale.setScalar(+v>0?+v:1); break;
    case 'tint': if(N.ct)N.ct.set(/^#[0-9a-f]{6}$/i.test(v)?v:'#ffffff'); break; } },
  // tiles <-> world for home positions (same mapping the behaviour editor used)
  tx:w=>{ const b=SHARED.BOD; return b&&b.XS?+((w-b.XS(0))/(b.XS(1)-b.XS(0))).toFixed(2):w; },
  tz:w=>{ const b=SHARED.BOD; return b&&b.ZS?+((w-b.ZS(0))/(b.ZS(1)-b.ZS(0))).toFixed(2):w; },
  wx:t=>{ const b=SHARED.BOD; return b&&b.XS?b.XS(t):t; },
  wz:t=>{ const b=SHARED.BOD; return b&&b.ZS?b.ZS(t):t; },
  // the editor's draft, same shape as characters.json
  store:(()=>{ try{ return JSON.parse(SAVE.get('chared')||'null')||{...(LEVEL.chars||{})}; }catch(e){ return {...(LEVEL.chars||{})}; } })(),
  save(){ try{ SAVE.set('chared',JSON.stringify(CHARS.store)); }catch(e){} },
  byId:id=>NPCS.find(N=>CHARS.id(N)===id)||null,
  // a character's effective shop config (draft over committed), or null if it sells nothing
  trade:N=>{ const id=CHARS.id(N), r=(CHARS.store&&CHARS.store[id])||CHARS.rec(id); return r&&r.trade&&Array.isArray(r.trade.sells)&&r.trade.sells.length?r.trade:null; },
  // apply the whole draft to the live characters (ship fields and home)
  applyAll(){ for(const id in CHARS.store){ const N=CHARS.byId(id); if(!N)continue; const r=CHARS.store[id]; CHARS.put(N,r);
    if(r.home&&N.st)N.home={id,x:CHARS.wx(r.home[0]),z:CHARS.wz(r.home[1]),r:(+r.home[2]||0)*TILE}; } },
});
if(Object.keys(CHARS.store).length)SYS.onStart(()=>CHARS.applyAll(),'076a-chars');
window.CHARS=CHARS;

// THE TEXT: every text box in the game reads its words here (TEXT.t(id, the game's own words, {parts})); the owner's words over them come from the worker (/texts; set in the TENANTS tab, kept in the Post Durable Object) and what they change repaints itself (TEXT.on).
import {SIGNS, TEXT} from './003b-systems.js';
Object.assign(TEXT,{
  bare:s=>String(s??'').replace(/^(THE|AN?) +/i,''),   // a name without its THE / A / AN, as lists show and sort it (owner, 11 Nov 2026)
  esc:s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]),   // text for HTML, everywhere
  t:(id,d,v)=>{ if(d!=null&&!(id in TEXT.def))TEXT.def[id]=d; let s=TEXT.cur[id]??TEXT.def[id]??''; if(v)for(const k in v)s=s.split('{'+k+'}').join(v[k]??''); return s; },
  set:(id,s)=>{ if(s==null||s===''||s===TEXT.def[id])delete TEXT.cur[id]; else TEXT.cur[id]=s; for(const f of TEXT.on)f(id); },
  load:m=>{ for(const k in m)if(m[k]!=null&&m[k]!=='')TEXT.cur[k]=m[k]; for(const f of TEXT.on)f(null); },
  list:()=>[...new Set([...Object.keys(TEXT.def),...Object.keys(TEXT.cur)])].sort().map(id=>({id,def:TEXT.def[id]??'',cur:TEXT.cur[id]??null}))});
TEXT.on.push(id=>{ for(const sg of SIGNS.list){ const k='sign.'+sg.name; if((id==null||id===k)&&sg.set&&TEXT.cur[k]!=null)sg.set({...(sg.get?sg.get():{}),text:TEXT.cur[k]}); } });
window.TEXT=TEXT;
(async()=>{ if(!/^https?:/.test(location.protocol))return; while(!window.__started)await new Promise(r=>setTimeout(r,500)); try{ const r=await fetch('/texts'); if(r.ok)TEXT.load(await r.json()); }catch(e){} })();

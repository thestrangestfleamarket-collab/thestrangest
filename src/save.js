// ---- ONE SAVE (17 Oct 2026, from the owner's physician game's save_game: a versioned snapshot of named fields under one key, a migrate hook,
// written whole each time): everything the page keeps in this browser (your looks, his shape and moves, the keys, the view, the graphics'
// choices, the map's layout, the sharpen bar) lives under one key, `market-save`, as {v, name: value...}. SAVE.get(name) gives a value or
// null, SAVE.set(name, value) writes the whole save at once (localStorage's set is one atomic write, as the game wrote a temp file and renamed
// it), SAVE.del(name) drops one. Every value is the string the code kept before, so a reader is unchanged. The old scattered keys
// (market-looks, market-keys, market-moves...) are read once into the save the first time a browser without one opens the page, and left as
// they were (an older page in the same browser still finds them). A save from a newer page (v above ours) is left alone and not used. ----
const SAVE=(()=>{ const KEY='market-save', V=1, OLD=['looks','walker','body','moves','keys','view','grain','look','outline','avlight','loose','physbody2','layout','gtsharp','sfx','amb','vol','recent'];
  const migrate=o=>{ /* v1: as it is; a later version changes what it must here, by o.v */ o.v=V; return o; };
  const read=()=>{ try{ const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&typeof o==='object'&&!Array.isArray(o)&&+o.v<=V)return migrate(o); }catch(e){} return null; };
  const write=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(S)); return true; }catch(e){ return false; } };
  let S=read();
  if(!S){ S={v:V}; let any=false; for(const k of OLD){ let v=null; try{ v=localStorage.getItem('market-'+k); }catch(e){} if(v==null)continue; S[k]=v; any=true; } if(any)write(); }   // (the old keys gathered once)
  const A={V,KEY,
    get:k=>{ const v=S[k]; return v==null?null:typeof v==='string'?v:String(v); },
    set:(k,v)=>{ S[k]=v==null?null:String(v); return write(); },
    del:k=>{ delete S[k]; return write(); },
    all:()=>Object.assign({},S),   // (a look at it: the data check, tests/datacheck.cjs)
    clear:()=>{ S={v:V}; try{ localStorage.removeItem(KEY); }catch(e){} }};
  return A; })();

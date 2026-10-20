const SAVE=(()=>{ const KEY='market-save', V=4;
  const migrate=o=>{
    if(+o.v<2){ for(const k of ['looks','walker','body','face'])delete o[k]; try{ for(const k of ['market-avatar','market-toe','market-wear','market-bodytype','market-avatarpick','market-speed'])localStorage.removeItem(k); }catch(e){} }
    if(+o.v<3){ for(const k of ['walker','body','face'])delete o[k]; try{ const m=JSON.parse(o.moves||'null'); if(m&&m.ov&&m.ov.stand){ delete m.ov.stand; o.moves=JSON.stringify(m); } }catch(e){}
      try{ for(const k of ['market-bodytype','market-avatar','market-toe'])localStorage.removeItem(k); }catch(e){} }
    if(+o.v<4){ o={}; try{ for(const k of Object.keys(localStorage))if(/^(market-|isowalk-)/.test(k)&&k!==KEY)localStorage.removeItem(k); }catch(e){} }
    o.v=V; return o; };
  const read=()=>{ try{ const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&typeof o==='object'&&!Array.isArray(o)&&+o.v<=V)return migrate(o); }catch(e){} return null; };
  const write=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(S)); return true; }catch(e){ return false; } };
  let S=read(); if(S)write();
  if(!S){ try{ for(const k of Object.keys(localStorage))if(/^(market-|isowalk-)/.test(k))localStorage.removeItem(k); }catch(e){} S={v:V}; write(); }
  const A={V,KEY,
    get:k=>{ const v=S[k]; return v==null?null:typeof v==='string'?v:String(v); },
    set:(k,v)=>{ S[k]=v==null?null:String(v); return write(); },
    del:k=>{ delete S[k]; return write(); },
    all:()=>Object.assign({},S),
    clear:()=>{ S={v:V}; try{ localStorage.removeItem(KEY); }catch(e){} }};
  return A; })();

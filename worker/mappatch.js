// THE MAP'S LIVE EDITS: what the map editor publishes (/shared/map-<section>.json) laid over data/world.json; one path for the game and the editor page (put in by the build, __CODE__). Changes are keyed by id, so the baked file still wins wherever the editor never touched; anything malformed is skipped.
const MAPPATCH={v:1,
  file:W=>'/shared/map-'+String((W&&W.section&&W.section.id)||'a').toLowerCase().replace(/[^a-z0-9]/g,'')+'.json', NAME:/^map-[a-z0-9]{1,8}\.json$/,
  gkey:o=>o.k+'@'+(+o.x).toFixed(1)+','+(+o.z).toFixed(1), MODEL:/^[A-Za-z0-9_]{1,60}$/, MAXADD:2000, MAXLAMPS:150, NAMEOK:/^[A-Z0-9][A-Z0-9 .'&-]{0,23}$/,
  GROUND:['grass','grass2','grass3','grass4','sidewalk','cobble','dirt','gravel','slab','sand','road','alley'], MAXGROUND:4000,
  apply(W,P){ const out=JSON.parse(JSON.stringify(W)), used=[], ground=[];
    if(!P||typeof P!=='object'||P.v!==1||!P.set||typeof P.set!=='object')return {W:out,used,ground};
    const S=P.set, n=v=>typeof v==='number'&&isFinite(v)&&Math.abs(v)<1e5, obj=o=>!!o&&typeof o==='object'&&!Array.isArray(o), pt=a=>Array.isArray(a)&&a.length===2&&n(a[0])&&n(a[1]);
    const take=(dst,src,keys)=>{ let k=0; for(const f of keys)if(n(src[f])&&n(dst[f])){ dst[f]=src[f]; k++; } return k; };
    if(obj(S.places))for(const p of out.places||[]){ const e=S.places[p.id]; if(!obj(e))continue; const q={...p};
      take(q,e,['x0','x1','y0','y1']); if(q.y1!=null&&/^[nesw]$/.test(e.face))q.face=e.face;
      if(q.x1>q.x0&&(q.y1==null||q.y1>q.y0)){ Object.assign(p,q); used.push('place:'+p.id); } }
    if(obj(S.parkPlaces)&&obj(out.parkPlaces))for(const k in out.parkPlaces){ const e=S.parkPlaces[k], p=out.parkPlaces[k]; if(!obj(e)||!obj(p))continue;
      const q={...p}; if(take(q,e,['x','y','r','x0','y0'])&&!(q.r<=0)){ out.parkPlaces[k]=q; used.push('park:'+k); } }
    if(obj(S.parkPlaces)&&obj(S.parkPlaces.brook)&&Array.isArray(S.parkPlaces.brook.pts)&&out.parkPlaces&&out.parkPlaces.brook){ const P=S.parkPlaces.brook.pts; if(P.length>=3&&P.length<=60&&P.every(pt)){ out.parkPlaces.brook={...out.parkPlaces.brook,pts:P.map(q=>[q[0],q[1]])}; used.push('brook'); } }
    if(Array.isArray(S.lamps)&&S.lamps.length<=MAPPATCH.MAXLAMPS){ const L=S.lamps.filter(l=>obj(l)&&n(l.x)&&n(l.y)).map(l=>({x:l.x,y:l.y})); if(L.length===S.lamps.length){ out.lamps=L; used.push('lamps:'+L.length); } }
    if(obj(S.names)){ const ok=v=>typeof v==='string'&&MAPPATCH.NAMEOK.test(v), N=S.names; if(obj(N.streets)&&out.sections&&out.sections.streets)for(const k of ['south','west','north','east'])if(ok(N.streets[k])){ out.sections.streets[k]=N.streets[k]; used.push('street:'+k); }
      const st=ok(N.station)&&out.loop&&out.section&&(out.loop.stations||[]).find(q=>q.id===out.section.id); if(st){ st.name=N.station; used.push('station'); } }
    if(obj(S.paths))for(const p of out.paths||[]){ const e=S.paths[p.id]; if(obj(e)&&pt(e.a)&&pt(e.b)){ p.a=[e.a[0],e.a[1]]; p.b=[e.b[0],e.b[1]]; used.push('path:'+p.id); } }
    if(obj(S.cars))for(const c of out.cars||[]){ const e=S.cars[c.id]; if(obj(e)&&take(c,e,['x','y','hd']))used.push('car:'+c.id); }
    if(obj(S.things))(out.things||[]).forEach((t,i)=>{ const e=S.things[i]; if(obj(e)&&e.k===t.k){ const q={...t}; if(n(e.rot))q.rot=e.rot; if(take(q,e,['x','y'])){ out.things[i]=q; used.push('thing:'+i); } } });
    if(obj(S.homes)&&obj(out.homes))for(const id in out.homes){ const e=S.homes[id], h=out.homes[id]; if(Array.isArray(h)&&Array.isArray(e)&&e.length>=3&&n(e[0])&&n(e[1])&&n(e[2])&&e[2]>=0){ out.homes[id]=[e[0],e[1],e[2],...h.slice(3)]; used.push('home:'+id); } }
    if(Array.isArray(S.ground))for(const g of S.ground.slice(0,MAPPATCH.MAXGROUND))if(obj(g)&&MAPPATCH.GROUND.includes(g.t)&&n(g.x0)&&n(g.x1)&&n(g.y0)&&n(g.y1)&&g.x1>g.x0&&g.y1>g.y0)ground.push({x0:g.x0,x1:g.x1,y0:g.y0,y1:g.y1,t:g.t});
    if(ground.length)used.push('ground:'+ground.length);
    if(Array.isArray(S.del)&&out.cars){ const n=out.cars.length; out.cars=out.cars.filter(c=>!S.del.includes('car:'+c.id)); if(out.cars.length<n)used.push('cars-gone:'+(n-out.cars.length)); }
    if(Array.isArray(S.newcars)&&out.cars){ const ids=new Set(out.cars.map(c=>c.id)); for(const c of S.newcars.slice(0,200))if(obj(c)&&/^m\d{1,6}$/.test(c.id)&&!ids.has(c.id)&&/^[a-z0-9-]{1,40}$/.test(c.model)&&n(c.x)&&n(c.y)){ ids.add(c.id); out.cars.push({id:c.id,model:c.model,x:c.x,y:c.y,hd:n(c.hd)?c.hd:0}); used.push('car-new:'+c.id); } }
    if(obj(S.garden)||Array.isArray(S.add))used.push('placed');
    return {W:out,used,ground}; },
  // the placed models (the landscape editor's list, data/garden.json; world units): moved, turned, sized or taken away by what they are and where they stood; new ones added once
  gardenOf(list,P){ if(!Array.isArray(list))return []; if(!P||typeof P!=='object'||P.v!==1||!P.set||typeof P.set!=='object')return list;
    const S=P.set, n=v=>typeof v==='number'&&isFinite(v)&&Math.abs(v)<1e5, obj=o=>!!o&&typeof o==='object'&&!Array.isArray(o), G=obj(S.garden)?S.garden:{}, out=[];
    for(const o of list){ const e=G[MAPPATCH.gkey(o)]; if(e===null)continue; if(!obj(e)){ out.push(o); continue; } const q={...o}; for(const f of ['x','z','rot'])if(n(e[f]))q[f]=e[f]; if(n(e.s)&&e.s>0&&e.s<50)q.s=e.s; out.push(q); }
    const have=new Set(out.map(MAPPATCH.gkey));
    if(Array.isArray(S.add))for(const a of S.add.slice(0,MAPPATCH.MAXADD))if(obj(a)&&MAPPATCH.MODEL.test(a.k)&&n(a.x)&&n(a.z)){ const q={k:a.k,x:a.x,z:a.z,s:n(a.s)&&a.s>0&&a.s<50?a.s:1,rot:n(a.rot)?a.rot:0}, k=MAPPATCH.gkey(q); if(have.has(k))continue; have.add(k); out.push(q); }
    return out; }};
export {MAPPATCH};

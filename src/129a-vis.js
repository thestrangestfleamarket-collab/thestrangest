// VIS, LEVELS and ZONES: the one place that hides things (each system gives its reason; a thing shows when no reason is left), which level is drawn, and the one answer to "which zone am I in".
import {SHARED} from './003-shx.js';
import {LEVELS, PARK, pos, ROOMS, VIS, ZONES} from './003b-systems.js';
import {scene} from './004-main.js';
import {LEVEL, SECTION, SECTIONS, SYS, TILE} from './006-map-pre.js';
{ const M=new Map();
  const apply=(o,r)=>{ const h=r.why.size>0&&!VIS.all; if(r.self)o.layers.mask=h?0:r.mask; else o.visible=!h; };
  VIS.hide=(o,why,on=true,self=false)=>{ if(!o)return; let r=M.get(o); if(!r){ if(!on)return; r={why:new Set(),self,mask:self?(o.layers.mask||1):0}; M.set(o,r); }
    if(on)r.why.add(why); else r.why.delete(why); apply(o,r); if(!r.why.size)M.delete(o); };
  VIS.hidden=(o,why)=>{ const r=M.get(o); return !!r&&(why?r.why.has(why):r.why.size>0); };
  VIS.why=o=>{ const r=M.get(o); return r?[...r.why]:[]; };
  VIS.showAll=on=>{ VIS.all=!!on; for(const [o,r] of M)apply(o,r); };
  VIS.count=()=>M.size;
  window.VIS=VIS; }
Object.assign(LEVELS,{cur:'street',way:null});
LEVELS.of.street={name:SECTIONS.streets.south,floor:'up',base:true};
{ let map=null, n=-1;
  const groups=()=>{ const k=Object.keys(LEVELS.of).length*1000+LEVELS.ways.length; if(map&&k===n)return map; n=k; map=new Map();
    for(const id in LEVELS.of)for(const g of LEVELS.of[id].groups||[])map.set(g,id); for(const w of LEVELS.ways)for(const g of w.groups||[])map.set(g,w); return map; };
  const owner=o=>o.userData.level||(o.userData.cullOf||o.isLight||o.isCamera?'*':groups().get(o.name)||'street');
  const on=(id,cur)=>id==='*'||id===cur||typeof id==='object'&&(id===LEVELS.way||(id.at||[id.a,id.b]).includes(cur));
  const top=o=>{ while(o.parent&&o.parent!==scene)o=o.parent; return o.parent===scene?o:null; };
  LEVELS.at=(x,z,floor)=>{ let b=null; for(const id in LEVELS.of){ const L=LEVELS.of[id]; if(L.floor!==floor)continue; if(L.has){ if(L.has(x,z))return id; } else if(L.base&&!b)b=id; } return b; };
  LEVELS.floor=(cur,y,si)=>si?LEVELS.below(y):cur;
  LEVELS.set=(lv,x,z,si)=>{ const w=si&&LEVELS.ways.find(w=>w.stair===si.S)||null; LEVELS.way=w; return LEVELS.cur=w?(lv==='down'?w.b:w.a):LEVELS.at(x,z,lv); };
  LEVELS.drawn=(o,cur=LEVELS.cur)=>{ const t=top(o); return !t||on(owner(t),cur); };
  LEVELS.hide=(cur=LEVELS.cur)=>{ const H=[]; for(const o of scene.children)if(o.visible&&!on(owner(o),cur)){ o.visible=false; H.push(o); } return H; };
  LEVELS.show=H=>{ if(H)for(const o of H)o.visible=true; };
  window.LEVELS=LEVELS; }
Object.assign(ZONES,{cur:null,list:[['market',SECTIONS.streets.south],['fair','THE STRANGEST FAIR'],['cp','CENTRAL PARK'],['secp','SOUTH EAST CENTRAL PARK'],['station','THE SUBWAY STATION'],['dungeon','THE DUNGEON'],['inside','INSIDE']],fns:[]});
{ const mid=()=>{ const P=PARK; return (P.y0+P.y1)/2+(P.oy||0); }, FAIRP=(LEVEL.places||[]).find(p=>p.kind==='fair');
  ZONES.at=(x,z,lv,room)=>{ if(lv==='down'){ const id=LEVELS.at(x,z,'down'), L=LEVELS.of[id]; return {id,name:L.label?L.label():L.name}; }
    if(room)return {id:'inside',name:String(room.name||room.lz||room.id||'INSIDE').toUpperCase()};
    { const mx=SHARED.BOD.MX(x), my=SHARED.BOD.MY(z), id=SECTIONS.at(mx,my), H=SECTION.id;
      if(id&&id!==H){ const P=SECTIONS.ring.park, N=SECTIONS.streets, st=mx<P.x0?N.west:mx>P.x1?N.east:my<P.y0?N.south:my>P.y1?N.north:'CENTRAL PARK'; return {id:'sec-'+id,name:st+' \u00b7 '+id}; } }
    if(PARK.within&&PARK.within(x,z)){ const y=z/TILE+SHARED.BOD.OY; return y>mid()?{id:'cp',name:'CENTRAL PARK'}:{id:'secp',name:'SOUTH EAST CENTRAL PARK'}; }
    { const F=FAIRP, mx=SHARED.BOD.MX(x), my=SHARED.BOD.MY(z); if(F&&mx>=F.x0&&mx<F.x1&&my>=F.y0&&my<F.y1)return {id:'fair',name:F.name}; }
    return {id:'market',name:SECTIONS.streets.south}; };
  ZONES.on=f=>ZONES.fns.push(f);
  ZONES.tick=()=>{ if(!SYS.started)return; const r=typeof ROOMS!=='undefined'?ROOMS.cur:null, z=ZONES.at(pos.x,pos.z,SHARED.LVL,r), k=z.id+'|'+z.name;
    if(!ZONES.cur||ZONES.cur.k!==k){ const was=ZONES.cur; ZONES.cur={...z,k}; for(const f of ZONES.fns)try{ f(ZONES.cur,was); }catch(e){ console.warn('ZONES',e); } } };
  window.ZONES=ZONES; }

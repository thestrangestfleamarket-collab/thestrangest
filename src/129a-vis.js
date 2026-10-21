// VIS and ZONES: the one place that hides things (each system gives its reason; a thing shows when no reason is left), and the one answer to "which zone am I in".
import {SHARED} from './003-shx.js';
import {PARK, pos, ROOMS, ZONES} from './003b-systems.js';
import {MODS, TILE} from './006-map-pre.js';
const VIS={all:false};
{ const M=new Map();
  const apply=(o,r)=>{ const h=r.why.size>0&&!VIS.all; if(r.self)o.layers.mask=h?0:r.mask; else o.visible=!h; };
  VIS.hide=(o,why,on=true,self=false)=>{ if(!o)return; let r=M.get(o); if(!r){ if(!on)return; r={why:new Set(),self,mask:self?(o.layers.mask||1):0}; M.set(o,r); }
    if(on)r.why.add(why); else r.why.delete(why); apply(o,r); if(!r.why.size)M.delete(o); };
  VIS.hidden=(o,why)=>{ const r=M.get(o); return !!r&&(why?r.why.has(why):r.why.size>0); };
  VIS.why=o=>{ const r=M.get(o); return r?[...r.why]:[]; };
  VIS.showAll=on=>{ VIS.all=!!on; for(const [o,r] of M)apply(o,r); };
  VIS.count=()=>M.size;
  window.VIS=VIS; }
Object.assign(ZONES,{cur:null,list:[['market','MARKET ST'],['cp','CENTRAL PARK'],['secp','SOUTH EAST CENTRAL PARK'],['station','THE SUBWAY STATION'],['dungeon','THE DUNGEON'],['inside','INSIDE']],fns:[]});
{ const mid=()=>{ const P=PARK; return (P.y0+P.y1)/2+(P.oy||0); };
  ZONES.at=(x,z,lv,room)=>{ if(lv==='down')return MODS.dungeon&&MODS.dungeon.inside&&MODS.dungeon.inside(x,z)?{id:'dungeon',name:'THE DUNGEON'+(window.DUNGEON&&DUNGEON.level?' — LEVEL '+DUNGEON.level:'')}:{id:'station',name:'THE SUBWAY STATION'};
    if(room)return {id:'inside',name:String(room.name||room.lz||room.id||'INSIDE').toUpperCase()};
    if(typeof PARK!=='undefined'&&PARK.within&&PARK.within(x,z)){ const y=z/TILE+SHARED.BOD.OY; return y>mid()?{id:'cp',name:'CENTRAL PARK'}:{id:'secp',name:'SOUTH EAST CENTRAL PARK'}; }
    return {id:'market',name:'MARKET ST'}; };
  ZONES.on=f=>ZONES.fns.push(f);
  ZONES.tick=()=>{ if(!window.__started)return; const r=typeof ROOMS!=='undefined'?ROOMS.cur:null, z=ZONES.at(pos.x,pos.z,SHARED.LVL,r), k=z.id+'|'+z.name;
    if(!ZONES.cur||ZONES.cur.k!==k){ const was=ZONES.cur; ZONES.cur={...z,k}; for(const f of ZONES.fns)try{ f(ZONES.cur,was); }catch(e){ console.warn('ZONES',e); } } };
  window.ZONES=ZONES; }
export {VIS};

// THE ITEM MODEL: ITEMS holds each item type's shared properties (burnable, edible, sellable, value, ...): data/items.json, the owner's edits over it, and what the families register in code (FORAGE.add) under both; ITEMED.props is the ITEM editor's settings pane (the editor itself: 140ba).
import {FORAGE, ITEMED, ITEMS} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {TPANE} from './087dz-tpane.js';
{ const BOOL=[['burnable','BURNS'],['edible','EDIBLE'],['stackable','STACKS'],['pickup','PICK UP'],['sellable','SELLABLE'],['offworld','OFF-WORLD'],['rental','RENTAL'],['reuse','NOT USED UP'],['potted','IN CRAB POTS'],['container','HOLDS THINGS']];
  const NUM=[['weight','WEIGHT',0,50,0.1,1],['value','VALUE',0,500,1,0],['breath','BREATH s',0,180,5,0],['darksight','DARKSIGHT s',0,900,30,0],['heals','HEALS',0,1,.05,0],['boostS','BOOST s',0,600,10,0],['tank','TANK s',0,900,30,0],['damage','DAMAGE',0,10,.5,0],['depth','DEPTH m',0,12,.5,0],['fight','FIGHT',0,10,.5,0],['common','COMMON',0,10,.1,0],['holds','HOLDS',0,200,5,0],['speed','SPEED m/s',0,20,.5,0],['len','LENGTH m',0,3,.05,0],['cast','CAST m',0,40,1,0],['line','LINE STRENGTH',0,3,.1,0],['reel','REEL SPEED',0,3,.05,0],['size','SIZE m',0,20,.01,0]];   // size: its longest side in metres as it lies on the ground (0: its model's own)
  const SEL=[['slot','WORN / HELD',['none','hand','body','legs','head','eyes','back']],['grants','GRANTS (ABILITY)',['none','catch','fight','guard','float','light','sight','fish','breathe','fly','ride','scan','night','lift','prospect','extract','horse']],['water','LIVES IN',['none','river','lake']],['bites','BITES',['any','day','dusk','night']],['bait','BAIT',['none','worm','cut']],['keeps','HOLDS WHAT',['butterflies','fish']],['boost','BOOST',['none','swift','str','regen','keen','invis','fly']],['icon','PICTURE',['auto','mush','potion','dish','fish','fruit','bfly','bird','book','jar','seed','sword','net','rod','goggles','lamp','armour','coat','jeans','tank','board','cage','cigar','gadget','cube','kite','card','gem','mortar','sack','tool','crate']]];
  const CLR=[['color','WORN COLOUR']]; SEL.push(['tier','RARITY',['common','rare','super']]);
  const DEF=()=>{ const d={}; for(const [k] of BOOL)d[k]=false; for(const [k,,,,,v] of NUM)d[k]=v; for(const [k,,opts] of SEL)d[k]=opts[0]; return d; };
  let BAKED={}; try{ BAKED=__DATA__("data/items.json")||{}; }catch(e){}
  try{ for(const id in BAKED)ITEMS.defs[id]=Object.assign(DEF(),BAKED[id]); }catch(e){}
  let OVER={}; try{ OVER=JSON.parse(OWNED.get('items')||'{}')||{}; for(const id in OVER)ITEMS.defs[id]=Object.assign(ITEMS.defs[id]||DEF(),OVER[id]); }catch(e){ OVER={}; }
  ITEMS.reg=(id,props)=>{ const d=ITEMS.defs[id]||(ITEMS.defs[id]=DEF()), b=BAKED[id]||{}, o=OVER[id]||{}; for(const k in props)if(!(k in b)&&!(k in o))d[k]=props[k]; return d; };
  ITEMS.def=id=>ITEMS.defs[id];
  ITEMS.cls=[];   // item classes: ids made in play (a painting) take their class's properties ({is:id=>bool, as:classId, calc:{prop:(id,def)=>value}})
  ITEMS.prop=(id,k)=>{ let d=ITEMS.defs[id]; const c=ITEMS.cls.length&&ITEMS.cls.find(c=>c.is(id)); if(c){ d=ITEMS.defs[c.as]; if(c.calc&&c.calc[k])return c.calc[k](id,d); } return d?d[k]:undefined; };
  ITEMS.ids=()=>Object.keys(ITEMS.defs).sort();
  const save=()=>{ try{ OWNED.set('items',JSON.stringify(ITEMS.defs)); }catch(e){} };
  const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'_');
  // item types the game has made that have no settings yet (a forage find, a loose thing)
  const discovered=()=>{ '@later'; const s=new Set();
    try{ if(window.FORAGE&&FORAGE.ids)for(const id of FORAGE.ids())s.add(norm(id)); }catch(e){}
    try{ const G=window.GPH; if(G&&G.loose)for(const it of G.loose())if(it&&it.name)s.add(norm(it.name)); }catch(e){}
    for(const id in ITEMS.defs)s.delete(id); return [...s].sort(); };
  const nameOf=id=>{ try{ return (window.FORAGE&&FORAGE.NM&&FORAGE.NM[id])||id; }catch(e){ return id; } };
  const HEX=v=>/^#[0-9a-f]{6}$/i.test(v||'');
  // an item's settings in el (Tweakpane): one with none yet is made on its first change, from init (a Polyfork piece's slot)
  const props=async(el,id,init)=>{ '@later'; if(el.__tp){ el.__tp.dispose(); el.__tp=null; } if(!id)return;
    let d=ITEMS.defs[id]; const fresh=!d; if(!d)d=Object.assign(DEF(),init||{});
    const w=(get,put)=>[get,v=>{ if(v===get())return; put(v); if(!ITEMS.defs[id])ITEMS.defs[id]=d; save(); }];
    const V=TPANE.live(Object.fromEntries([...BOOL.map(([k])=>[k,w(()=>!!d[k],v=>{ d[k]=v; })]),
      ...NUM.map(([k])=>[k,w(()=>+d[k]||0,v=>{ d[k]=+(+v).toFixed(4); })]),
      ...SEL.map(([k,,o])=>[k,w(()=>d[k]==null?o[0]:d[k],v=>{ d[k]=v; })]),
      ...CLR.map(([k])=>[k,w(()=>HEX(d[k])?d[k]:'#000000',v=>{ d[k]=v; cx.forEach(([k2,b])=>{ if(k2===k)b.title='CLEAR'; }); })])]));
    const pane=await TPANE.make(el,{title:fresh?id+' (new)':id}), cx=[]; el.__tp=pane;
    const f1=pane.addFolder({title:'FLAGS'}); for(const [k,n] of BOOL)f1.addBinding(V,k,{label:n});
    const f2=pane.addFolder({title:'NUMBERS',expanded:false}); for(const [k,n,a,b,st] of NUM)f2.addBinding(V,k,{label:n,min:a,max:b,step:st});
    const f3=pane.addFolder({title:'CHOICES'}); for(const [k,n,o] of SEL)f3.addBinding(V,k,{label:n,options:Object.fromEntries(o.map(x=>[x,x]))});
    const f4=pane.addFolder({title:'COLOUR',expanded:false}); for(const [k,n] of CLR){ f4.addBinding(V,k,{label:n});
      const b=f4.addButton({title:d[k]?'CLEAR':'NONE'}); cx.push([k,b]);
      b.on('click',()=>{ delete d[k]; save(); b.title='NONE'; pane.refresh(); }); }
    if(!fresh)pane.addButton({title:'REMOVE '+id}).on('click',()=>{ delete ITEMS.defs[id]; save(); if(ITEMED.removed)ITEMED.removed(id); });
    return pane; };
  const add=id=>{ id=norm(id); if(!id||ITEMS.defs[id])return null; ITEMS.defs[id]=DEF(); save(); return id; };
  const exp=()=>{ const blob=new Blob([JSON.stringify(ITEMS.defs,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='items.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2e3); };
  Object.assign(ITEMED,{props,discovered,nameOf,add,export:exp,norm});
}

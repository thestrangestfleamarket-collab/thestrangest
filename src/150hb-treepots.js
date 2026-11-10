// YOUR TREE POTS (owner, 10 Nov 2026): each big tree pot bought from the Tomato is a thing for your apartment (DECORATE shows it as YOURS); a click fills it with dirt, plants a sapling or pip, waters it, picks its crop. A tree in a pot is a dwarf (half the crop), lives indoors through winter and grows only while its dirt is wet; FTREES' rules (144j).
import {THREE} from './003-shx.js';
import {FORAGE, MOTION, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {FTREES} from './144j-fruittrees.js';
import {ROOMK} from './150a-bedroom.js';
{ const C=FTREES.CAT, say=(t,c)=>SAY(t,c||'#e8e2cc'), DAY=864e5, WET=1.5*DAY, has=id=>FORAGE.has(id);
  let S={}; try{ S=JSON.parse(OWNED.get('treepots')||'{}')||{}; }catch(e){ S={}; } const save=()=>{ try{ OWNED.set('treepots',JSON.stringify(S)); }catch(e){} };
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,...o});
  const pot=()=>{ '@later'; const G=new THREE.Group(), clay=std(0xa85a36);
    const body=new THREE.Mesh(new THREE.LatheGeometry([[.2,0],[.24,.03],[.28,.36],[.31,.38],[.31,.44],[.28,.44]].map(p=>new THREE.Vector2(p[0],p[1])),28),clay); body.material.side=THREE.DoubleSide; body.castShadow=true; G.add(body);
    const base=new THREE.Mesh(new THREE.CircleGeometry(.2,20),clay); base.rotation.x=-Math.PI/2; base.position.y=.005; G.add(base);
    const dirt=new THREE.Mesh(new THREE.CircleGeometry(.28,24),std(0x5a4030,{roughness:1})); dirt.rotation.x=-Math.PI/2; dirt.position.y=.4; dirt.visible=false; dirt.name='tpdirt'; G.add(dirt);
    const t=new THREE.Group(); t.name='tptree'; t.position.y=.4; G.add(t); return G; };
  ROOMK.parts.push(ctx=>{ '@later'; const {R}=ctx, k='rd:treepot'; if(R.kinds[k])return; const D={kind:k,name:'BIG TREE POT',own:'treepot',loose:false,m:0,wire:'treepot',sol:[[-.31,-.31,.31,.31,.44]],shf:[],dept:'garden',deptName:'GARDEN'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=pot(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[k]=D; });
  // the trees in your pots know each other: a second apple for the first, a male for a female
  const LIVE=new Set(), list=()=>[...LIVE].map(L=>S[L.id]&&S[L.id].t).filter(Boolean), ctxOf=s=>FTREES.ctx(s,list(),{pot:true});
  const show=L=>{ const P=S[L.id]||{}, d=L.G.getObjectByName('tpdirt'), s=P.t; d.visible=!!P.dirt; if(d.visible)d.material.color.setHex(s&&s.wet>FTREES.now()||P.wet>FTREES.now()?0x2e2018:0x6a5038);
    if(!s){ if(L.tree){ L.tree.parent.remove(L.tree); L.tree=null; } return; } if(!L.tree||L.tid!==s.id){ if(L.tree)L.tree.parent.remove(L.tree); L.tree=FTREES.make(); L.tid=s.id; L.G.getObjectByName('tptree').add(L.tree); L.key=''; }
    const V=FTREES.view(s,ctxOf(s)), k=[V.stage,V.avail,V.bare,V.bloom,V.autumn,V.dead,Math.round(V.f*20)].join(); if(k!==L.key){ L.key=k; L.tree.userData.set(V,s,{pot:true}); } return V; };
  const name=id=>{ const P=S[id]||{}; if(!P.dirt)return 'BIG TREE POT: EMPTY'; if(!P.t)return 'BIG TREE POT: DIRT, NOTHING PLANTED'; return FTREES.label(P.t,FTREES.view(P.t,ctxOf(P.t)),'YOUR')+' (IN A POT)'; };
  const plantable=()=>FTREES.ids.flatMap(k=>[C[k].sapling,C[k].pipItem]).filter(id=>id&&FORAGE.NM[id]&&has(id)>0);
  const plant=(id,item)=>{ const k=FTREES.ids.find(q=>C[q].sapling===item||C[q].pipItem===item), K=C[k]; if(!k||!has(item))return; FORAGE.take(item,1); MOTION.play('plant');
    const s=FTREES.plant(k,{pip:item===K.pipItem,pot:true}); S[id].t=s; say('YOU PLANT THE '+FORAGE.NM[item]+' IN THE BIG POT. A TREE IN A POT STAYS SMALL AND GIVES HALF A CROP, BUT NO FROST REACHES IT.','#9fe07f');
    if(K.p==='two')say('IT NEEDS A SECOND '+(K.pg==='apple'?'APPLE OR CRABAPPLE':K.pg.toUpperCase())+' IN ANOTHER POT HERE TO SET FRUIT.','#c8c2b0'); if(K.p==='mf')say('THIS ONE IS '+(s.sx==='m'?'A MALE: IT NEVER FRUITS.':'A FEMALE: IT NEEDS A MALE '+K.name+' IN A POT BESIDE IT.'),'#c8c2b0'); };
  const acts=(id)=>{ const P=S[id]||(S[id]={}), s=P.t, L=[];
    if(!P.dirt){ L.push({name:'FILL IT WITH DIRT',act:()=>{ if(!has('dirt'))return say('IT NEEDS DIRT. THE TOMATO SELLS IT BY THE BAG.','#c8a090'); FORAGE.take('dirt',1); P.dirt=1; MOTION.play('plant'); say('YOU FILL THE BIG POT WITH DIRT.'); }}); return L; }
    if(!s){ const I=plantable(); if(!I.length)L.push({name:'PLANT A SAPLING',act:()=>say('PLANT A SAPLING OR A PIP: THE TOMATO SELLS SAPLINGS.','#c8a090')}); for(const it of I)L.push({name:'PLANT '+FORAGE.NM[it],act:()=>plant(id,it)}); return L; }
    const K=C[s.k], V=FTREES.view(s,ctxOf(s));
    if(V.dead)L.push({name:'CLEAR OUT THE DEAD TREE',act:()=>{ P.t=null; say('YOU PULL OUT THE DEAD TREE. THE DIRT IS READY FOR ANOTHER.'); }});
    if(V.avail>0&&!V.dry)L.push({name:(K.sap?'TAP IT: ':'PICK: ')+V.avail+' '+K.pn,act:()=>{ if(K.sap&&!has('spile'))return say('YOU NEED A SPILE AND BUCKET TO TAP IT (THE TOMATO SELLS THEM).','#c8a090');
      const n=V.avail; FTREES.pick(s,V,n); FORAGE.give(K.item,n); MOTION.play('harvest'); const pip=K.pip&&Math.random()<.25; if(pip)FORAGE.give(K.pipItem,1); say('YOU '+(K.sap?'DRAW ':'PICK ')+n+' '+K.pn+(pip?', AND KEEP ONE '+(K.nut?'TO PLANT':'PIP'):'')+'.','#b8f0a0'); }});
    if(!V.dead&&s.wet<=FTREES.now())L.push({name:'WATER IT',act:()=>{ if(!has('water'))return say('THE DIRT IS DRY. IT NEEDS WATER (A JUG OF RAIN).','#c8a090'); FTREES.tick(s,ctxOf(s)); FORAGE.take('water',1); s.wet=FTREES.now()+WET; MOTION.play('water'); if(SFX.play)SFX.play('splash',{vol:.3}); say('THE DIRT DRINKS IT IN. WET FOR A DAY AND A HALF.','#9fd8ff'); }});
    if(!V.dead&&FTREES.canPrune(s,V))L.push({name:'PRUNE IT (A BIGGER CROP NEXT YEAR)',act:()=>{ s.pr=FTREES.now(); MOTION.play('harvest'); say('YOU PRUNE IT TO SHAPE WHILE IT RESTS.','#9fe07f'); }});
    const tf=!V.dead&&FTREES.thinFor(s,V); if(tf)L.push({name:'THIN THE YOUNG FRUIT',act:()=>{ s.th=tf; say('YOU THIN THE FRUIT. THE LITTLE BRANCHES WILL HOLD.','#9fe07f'); }});
    L.push({name:'ABOUT IT',act:()=>say(FTREES.label(s,V,'YOUR')+'. '+(V.why.join(' ')||(V.dry?'ITS DIRT IS DRY: IT STOPS GROWING AND ITS FRUIT WAITS.':V.blk?'IN SEASON.':'IT FRUITS IN '+K.m.map(m=>['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m-1]).join(' ')+'.')))});
    L.push({name:'DIG IT UP',act:()=>{ if(s.dig&&Date.now()-s.dig<6000){ P.t=null; return say('YOU DIG IT UP. THE DIRT IS READY FOR ANOTHER.'); } s.dig=Date.now(); say('CLICK DIG IT UP AGAIN TO DIG UP THE TREE FOR GOOD.','#e0a080'); }});
    return L; };
  ROOMK.wires.treepot=(un,c)=>{ '@later'; const G=un.obj, d=G.getObjectByName('tpdirt'); if(!d)return; d.material=d.material.clone(); const id=String(un.id), L={G,id,un,th:null,tree:null}; LIVE.add(L); S[id]=S[id]||{}; show(L);
    const after=()=>{ FORAGE.draw(); save(); for(const q of LIVE)show(q); L.th.acts=acts(id).slice(1).map(wrap); }, wrap=a=>({name:a.name,act:()=>{ a.act(); after(); L.th.name=name(id); }}); L.wrap=wrap;
    L.th=c.hit(un,()=>name(id),()=>{ const A=acts(id); if(A.length)A[0].act(); after(); },[.7,1.7,.7,0,.85,0]); L.th.acts=acts(id).slice(1).map(wrap); };
  // every few seconds the trees in the room catch up with the clock
  let tk=0; SYS.add('life',dt=>{ if((tk-=dt||0)>0||!LIVE.size)return; tk=4; for(const L of LIVE){ if(!L.G.parent||L.un.gone){ LIVE.delete(L); continue; } const P=S[L.id]; if(P&&P.t&&!P.t.dead){ const y=Math.floor(P.t.g); FTREES.tick(P.t,ctxOf(P.t)); if(Math.floor(P.t.g)!==y)save(); }
    show(L); if(L.th){ L.th.name=name(L.id); L.th.acts=acts(L.id).slice(1).map(L.wrap); } } },'150hb-treepots');
  window.TREEPOTDBG=()=>({S,live:LIVE.size}); TREEPOTDBG.wire=(un,c)=>ROOMK.wires.treepot(un,c); TREEPOTDBG.THREE=THREE;
}

// YOUR POTS: each clay pot bought from the Radish (146s) is a thing for your apartment (DECORATE shows it as YOURS); a click fills it with dirt, plants a seed, waters it, picks its fruit. It grows only while its dirt is wet (a jug of rain keeps it wet 12 game hours).
import {THREE} from './003-shx.js';
import {CITY, CLOCK, FORAGE, ITEMS, MAIL, MOTION, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {VEG} from './144-veggies.js';
import {RADISH} from './146s-radish.js';
import {ROOMK} from './150a-bedroom.js';
{ const P=RADISH.PLANTS, say=(t,c)=>SAY(t,c||'#e8e2cc'), WET=12, MAXF=3;
  const hour=()=>((window.MAIL&&MAIL.ready?MAIL.day():CITY&&CITY.day||0)*24+(CLOCK.h||0));
  let S={}; try{ S=JSON.parse(OWNED.get('pots')||'{}')||{}; }catch(e){ S={}; } const save=()=>{ try{ OWNED.set('pots',JSON.stringify(S)); }catch(e){} };
  // growth is the wet hours since planting, counted up to now (or to when the dirt dried)
  const grow=s=>{ const h=hour(); if(s.k&&s.wet>s.at){ const end=Math.min(h,s.wet); if(end>s.at)s.g+=end-s.at; } s.at=h; const p=P[s.k]; if(p&&s.g>=p.first){ const n=1+Math.floor((s.g-p.first)/p.next); s.fr=Math.min(MAXF,Math.max(s.fr||0,n-(s.picked||0))); } return s; };
  RADISH.pot=id=>grow(S[id]||(S[id]={dirt:0,k:null,g:0,at:hour(),wet:0,fr:0,picked:0}));

  /* ---------- the pot: terracotta with a rolled rim; the dirt (darker when wet); the plant — a stem, leaves, and its fruit ---------- */
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.75,...o});
  const pot=()=>{ '@later'; const G=new THREE.Group(), clay=std(0xb8683e,{roughness:.85});
    const body=new THREE.Mesh(new THREE.LatheGeometry([[.1,0],[.13,.02],[.15,.2],[.17,.22],[.17,.26],[.15,.26]].map(p=>new THREE.Vector2(p[0],p[1])),28),clay); body.material.side=THREE.DoubleSide; G.add(body);
    const base=new THREE.Mesh(new THREE.CircleGeometry(.1,20),clay); base.rotation.x=-Math.PI/2; base.position.y=.005; G.add(base);
    const dirt=new THREE.Mesh(new THREE.CircleGeometry(.148,24),std(0x5a4030,{roughness:1})); dirt.rotation.x=-Math.PI/2; dirt.position.y=.22; dirt.visible=false; dirt.name='potdirt'; G.add(dirt);
    const plant=new THREE.Group(); plant.name='potplant'; plant.position.y=.22; G.add(plant); return G; };
  const fruit=(p,m)=>{ '@later'; let g; if(p.shape==='star'){ g=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.11,5),m); }
    else if(p.shape==='pepper'){ g=new THREE.Mesh(new THREE.LatheGeometry([[0,-.06],[.025,-.04],[.035,0],[.03,.03],[0,.04]].map(q=>new THREE.Vector2(q[0],q[1])),14),m); }
    else { g=new THREE.Mesh(new THREE.CapsuleGeometry(.014,.08,4,8),m); g.rotation.z=.4; } return g; };
  const draw=(G,s)=>{ '@later'; const dirt=G.getObjectByName('potdirt'), plant=G.getObjectByName('potplant'), p=P[s.k], wet=s.wet>hour(); dirt.visible=!!s.dirt; dirt.material.color.setHex(wet?0x2e2018:0x6a5038); plant.clear(); if(!p)return;
    const u=Math.min(1,s.g/p.first), h=.04+u*.3, leaf=std(p.leaf,{side:THREE.DoubleSide});
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.006,.009,h,6),leaf); stem.position.y=h/2; plant.add(stem);
    const nl=1+Math.floor(u*6); for(let i=0;i<nl;i++){ const l=new THREE.Mesh(new THREE.SphereGeometry(.035+u*.025,10,6),leaf); l.scale.set(1,.2,.55); const a=i*2.4; l.position.set(Math.cos(a)*.04,h*(.25+i/nl*.7),Math.sin(a)*.04); l.rotation.y=-a; l.rotation.z=.4; plant.add(l); }
    const fm=std(p.fr,{roughness:.4,emissive:p.glow?0x603000:0}); for(let i=0;i<(s.fr||0);i++){ const f=fruit(p,fm), a=i*2.1+.5; f.position.set(Math.cos(a)*.06,h*.55+i*.04,Math.sin(a)*.06); plant.add(f); } };

  ROOMK.parts.push(ctx=>{ '@later'; const {R}=ctx, k='rd:pot'; if(R.kinds[k])return; const D={kind:k,name:'CLAY POT',own:'pot',loose:false,m:0,wire:'pot',sol:[[-.17,-.17,.17,.17,.26]],shf:[],dept:'garden',deptName:'GARDEN'};
    Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=pot(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }}); R.kinds[k]=D; });
  const LIVE=new Set();
  ROOMK.wires.pot=(un,c)=>{ '@later'; const G=un.obj, d=G.getObjectByName('potdirt'); if(!d)return; d.material=d.material.clone();
    const id=String(un.id), L={G,id,un,th:null}; LIVE.add(L); draw(G,RADISH.pot(id));
    const name=()=>{ const s=RADISH.pot(id), p=P[s.k]; if(!s.dirt)return 'CLAY POT: EMPTY'; if(!p)return 'CLAY POT: DIRT, NO SEED'; const wet=s.wet>hour();
      return p.name+': '+(s.fr?s.fr+' RIPE':s.g>=p.first?'FLOWERING':s.g>p.first*.4?'GROWING':'A SPROUT')+(wet?' · WET':' · DRY'); };
    L.name=name; L.th=c.hit(un,name,()=>{ const s=RADISH.pot(id), has=FORAGE.has;
      if(!s.dirt){ if(!has('dirt'))return say('IT NEEDS DIRT. THE FLORIST SELLS IT BY THE BAG.','#c8a090'); FORAGE.take('dirt',1); s.dirt=1; MOTION.play('plant'); say('YOU FILL THE POT WITH DIRT.'); }
      else if(!s.k){ const k=Object.keys(P).find(q=>has(P[q].seed)); if(!k)return say('PLANT A SEED: THE FLORIST SELLS THEM.','#c8a090'); FORAGE.take(P[k].seed,1); MOTION.play('plant'); Object.assign(s,{k,g:0,at:hour(),fr:0,picked:0}); say('YOU PRESS A '+P[k].name+' SEED INTO THE DIRT.'); }
      else if(s.fr>0){ const p=P[s.k], n=s.fr; FORAGE.give(p.fruit,n); MOTION.play('harvest'); s.picked=(s.picked||0)+n; s.fr=0; say('YOU PICK '+n+' '+p.name+(n>1?'S':'')+'.','#b8f0a0'); }
      else if(s.wet<=hour()){ if(!has('water'))return say('THE DIRT IS DRY. IT NEEDS WATER (A JUG OF RAIN).','#c8a090'); grow(s); FORAGE.take('water',1); MOTION.play('water'); s.wet=hour()+WET; s.at=hour(); say('THE DIRT DRINKS IT IN.','#9fd8ff'); if(SFX.play)SFX.play('splash',{vol:.3}); }
      else return say('IT IS GROWING. COME BACK LATER.');
      if(FORAGE.draw)FORAGE.draw(); save(); draw(G,s); }); };
  // every few seconds the pots in the room catch up with the clock (the fruit ripens while you are out)
  let tk=0; SYS.add('life',dt=>{ if((tk-=dt||0)>0||!LIVE.size)return; tk=3; for(const L of LIVE){ if(!L.G.parent||L.un.gone){ LIVE.delete(L); continue; } const s=S[L.id]; if(!s)continue; const f=s.fr, g=Math.floor(s.g); grow(s); if(s.fr!==f||Math.floor(s.g)!==g){ draw(L.G,s); save(); } if(L.th)L.th.name=L.name(); } },'150h-pots');
  window.POTDBG=()=>({S,live:LIVE.size,hour:hour()});
}
// the Tomato's own shop (144) sells what a pot at home needs and buys its fruit, as the florist's counter does
{ const v=id=>Math.max(1,Math.round(+ITEMS.prop(id,'value')||1)), w=()=>{ if(!VEG.add)return setTimeout(w,500); VEG.add(Object.fromEntries(['seed_star','seed_sun','seed_hum','pot','dirt','water','cactus','cactus_eye','bonsai'].map(k=>[k,v(k)])),Object.fromEntries(['fr_star','fr_sun','fr_hum'].map(k=>[k,v(k)]))); }; w(); }

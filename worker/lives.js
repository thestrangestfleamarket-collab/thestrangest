// THE LIVES: what each townsperson does each game hour and what it does to them (one path for the page, put in by the build, __CODE__, and the worker, imported): work, eat, sleep at home, their own habits off the clock; needs, mood, money, a log of their days, the players they know.
import {CLK} from "./clock.js";
const LV_HOUR=3600000, LV_KEEP=40;
// the game's hour count: whole hours on the game's clock (worker/clock.js: Central time, or as the owner set it), the same for everyone
const lvH=(t,c)=>CLK.count(t,c);
const lvHash=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
const lvIn=(h,a,b)=>{ a=((a%24)+24)%24; b=((b%24)+24)%24; return a<=b?h>=a&&h<b:h>=a||h<b; };
// what each free-time habit is: what it is called, where it is done (a place's inside, or out of doors), what it costs or pays
const LV_DO={   // (hrs: the hours it can be done: butterflies by daylight, the bar of an evening)
  fish:{verb:'fishing at the pier',out:'pier',fun:1.5,hrs:[5,21]},
  bfly:{verb:'catching butterflies',out:'meadow',fun:2,hrs:[8,19]},
  jog:{verb:'jogging the park',out:'path',fun:1,tire:1,hunger:1,fast:1,hrs:[5,21]},
  gamble:{verb:'gambling at the arcade',at:'arcade',fun:2,hrs:[10,3]},
  drink:{verb:'drinking at the bar',at:'bar',fun:2,cost:6,hrs:[16,3]},
  read:{verb:'reading in the park',out:'bench',still:1,fun:1,hrs:[8,21]},
  walk:{verb:'walking the river',out:'river',fun:1,hrs:[6,23]},
  shop:{verb:'browsing the flea market',out:'flea',fun:1,cost:4,hrs:[9,20]},
  pray:{verb:'at the shrine',out:'shrine',still:1,fun:1.5,hrs:[6,20]},
  eat:{verb:'eating at the diner',at:'diner',meal:1,cost:9,hrs:[6,23]},
  bodega:{verb:'grabbing lunch at the bodega',at:'bodega',meal:1,cost:5,hrs:[6,23]},
  cart:{verb:'eating from a cart at the flea market',out:'flea',meal:1,cost:4,hrs:[10,22]},
  museum:{verb:'at the Museum of Earth',at:'museum',fun:1.5,cost:3,hrs:[10,17]},
  art:{verb:'looking at paintings at the art museum',at:'art',fun:1.5,hrs:[10,17]},
  movies:{verb:'at the movies',at:'theatre',fun:2,cost:5,hrs:[13,23]},
  show:{verb:'at a show at the playhouse',at:'playhouse',fun:2.5,cost:8,hrs:[18,23]},
  bathe:{verb:'soaking at the bath house',at:'bath',fun:1,cost:4,hrs:[9,21]},
  breakfast:{verb:'having breakfast at home',home:1,meal:1,cost:2,hrs:[0,24]},
  supper:{verb:'cooking supper at home',home:1,meal:1,cost:3,hrs:[0,24]},
  work:{verb:'at work'}, sleep:{verb:'asleep at home'}, home:{verb:'at home'}};
const LV_POOL=['walk','read','shop','fish','bfly','jog','drink','gamble','pray'];
// a character's own hours (a little their own) and habits
const lvSelf=(key,c)=>{ const j=c.job||{}, h=lvHash(key), jit=((h%9)-4)*.25, hrs=j.hours||[9,17], open=Math.round(hrs[0]+jit), close=Math.round(hrs[1]+jit);
  const habits=(j.habits&&j.habits.length?j.habits:[LV_POOL[h%9],LV_POOL[(h>>>5)%9],LV_POOL[(h>>>11)%9]]).filter(k=>LV_DO[k]&&k!=='eat');
  const free=(open-close+48)%24||24, wake=(open-1-((h>>>7)%2)+24)%24, sleep=Math.max(4,Math.min(7+((h>>>3)%3),free-3));   // up an hour or two before work; asleep 7 to 9 hours, less after a long shift
  return {open,close,bed:(wake-sleep+24)%24,wake,habits:habits.length?habits:['walk'],wage:j.wage||12+((h>>>9)%9)}; };
// what they do at game hour H (rec, the server's record, may push hunger or tiredness ahead of habit)
const lvPlan=(key,c,H,rec)=>{ const S=lvSelf(key,c), h=((H%24)+24)%24, day=Math.floor(H/24), open=k=>lvIn(h,LV_DO[k].hrs[0],LV_DO[k].hrs[1]), dice=lvHash(key+'/'+day);
  // where a meal out is had: the diner, the bodega or a cart, by who and which day; supper at home or at the diner
  const out=()=>{ const o=['eat','bodega','cart'].filter(open); return o.length?o[dice%o.length]:'supper'; };
  if(lvIn(h,S.bed,S.wake))return 'sleep';
  if(h===S.wake)return (S.wake+1)%24===S.open?'breakfast':'home';
  const working=lvIn(h,S.open,S.close), span=(S.close-S.open+24)%24, mid=(S.open+Math.max(1,Math.floor(span/2)))%24;
  if(working)return h===mid&&span>=6?out():'work';
  if(h===(S.wake+1)%24)return 'breakfast';
  if(h===S.close)return (dice>>>4)%2?'supper':out();
  if(rec&&rec.hunger>=7)return out();
  if(rec&&rec.tired>=12)return 'home';
  const pick=lvHash(key+':'+day+':'+Math.floor(h/3));
  for(let i=0;i<S.habits.length;i++){ const k=S.habits[(pick+i)%S.habits.length]; if(open(k))return k; }
  return 'home'; };
const lvNew=()=>({H:0,money:40,hunger:2,tired:2,fun:5,mood:'okay',log:[],n:{shifts:0,fish:0,bfly:0,won:0,lost:0,meals:0},knows:{}});
const lvMood=r=>r.hunger>=6?'hungry':r.tired>=12?'tired':r.fun<=1?'bored':r.money<5?'broke':r.fun>=8?'happy':'okay';
const lvClock=h=>String(((h%24)+24)%24).padStart(2,'0')+':00';
// one game hour of a life: what they did changes their needs, money and counts; a change of doing is written in their log
const lvStep=(key,c,r,H,where)=>{ const did=lvPlan(key,c,H,r), D=LV_DO[did]||LV_DO.walk, S=lvSelf(key,c), h=((H%24)+24)%24, x=lvHash(key+'#'+H), say=t=>{ r.log.push([H,lvClock(h)+' '+t]); if(r.log.length>LV_KEEP)r.log.shift(); };
  const prev=r.did; r.did=did; r.H=H;
  if(did==='sleep'){ r.tired=Math.max(0,r.tired-2.2); r.hunger+=.3; }
  else { r.tired+=did==='work'?.8:.35+(D.tire||0)*.5; r.hunger+=.55+(D.hunger||0)*.5; r.fun+=D.fun||0; if(did==='work')r.fun-=.25; }
  if(did==='work'){ r.money+=S.wage; if(prev!=='work'){ r.n.shifts++; say('went to work'+(where?' at '+where:'')); } }
  else if(D.meal){ r.money-=D.cost; r.hunger=0; r.n.meals++; if(prev!==did)say(D.verb.replace(/^(having|grabbing|eating|cooking)/,m=>({having:'had',grabbing:'grabbed',eating:'ate',cooking:'cooked'})[m])+' ($'+D.cost+')'); }
  else if(did==='gamble'){ const w=(x%61)-30; r.money+=w; if(w>=0)r.n.won+=w; else r.n.lost-=w; say((w>=0?'won $'+w:'lost $'+(-w))+' at the arcade'); }
  else if(did==='fish'){ if(x%3===0){ r.n.fish++; say('caught a fish at the pier'); } else if(prev!==did)say('went fishing at the pier'); }
  else if(did==='bfly'){ if(x%2===0){ r.n.bfly++; say('caught a butterfly'); } else if(prev!==did)say('went to catch butterflies'); }
  else { if(D.cost)r.money-=D.cost; if(prev!==did)say(did==='sleep'?'went to bed':did==='home'?(prev==='sleep'?'got up':'went home'):D.verb); }
  r.fun=Math.max(0,Math.min(10,r.fun-.15)); r.hunger=Math.min(10,r.hunger); r.tired=Math.min(16,r.tired); r.money=Math.round(r.money); r.mood=lvMood(r); return r; };
// bring a record up to hour H (a new one starts a day back; at most two game days at once)
const lvRun=(key,c,r,H,where)=>{ r=r||lvNew(); if(!r.H)r.H=H-24; else if(H-r.H>48)r.H=H-48; else if(r.H>H)r.H=H;   // (the clock set back: they carry on from there)
  for(let k=r.H+1;k<=H;k++)lvStep(key,c,r,k,where); return r; };
// a player met them: they know the player by name from now on
const lvMeet=(r,name)=>{ if(!name)return r; const k=String(name).slice(0,24); r.knows[k]=(r.knows[k]||0)+1; const ks=Object.keys(r.knows); if(ks.length>30)delete r.knows[ks.sort((a,b)=>r.knows[a]-r.knows[b])[0]]; return r; };
// what players are sent: the needs, money and counts, the last few lines of the log, the players they know best
const lvBrief=r=>({...r,log:r.log.slice(-4),knows:Object.fromEntries(Object.entries(r.knows||{}).sort((a,b)=>b[1]-a[1]).slice(0,10))});
// where a habit is done, in the world's units: a place's inside (its door, then in), or out of doors in a hangout (HG: {band:[x0,z0,x1,z1], hd, areas:[[x,z,r]]}; doors: {place:{x,z}}; T the tile): a band to wander, an area, or a spot of their own to stay at, picked by who and when
const lvSpot=(k,key,H,HG,doors,T)=>{ const D=LV_DO[k]; if(!D)return null; if(D.at)return {at:D.at,door:doors&&doors[D.at]||null};
  const g=HG&&HG[D.out]; if(!g)return null; const pick=lvHash(key+'@'+Math.floor(H/3));
  if(g.band){ const [x0,z0,x1,z1]=g.band, u=(pick%1000)/1000, c={x:x0+u*(x1-x0),z:(z0+z1)/2}; return g.hd!=null?{...c,r:0,hd:g.hd}:{...c,r:30*T,band:[g.band],fast:D.fast}; }
  if(!g.areas||!g.areas.length)return null; const a=g.areas[pick%g.areas.length], c={x:a[0],z:a[1]};
  if(D.still){ const u=(pick>>>8)%360*Math.PI/180, v=a[2]*(((pick>>>17)%100)/100); return {x:c.x+Math.cos(u)*v,z:c.z+Math.sin(u)*v,r:0,hd:g.hd!=null?g.hd:Math.atan2(-Math.cos(u),-Math.sin(u))}; }
  return {...c,r:a[2],hd:g.hd}; };
// what the hour asks of a cast member and where that is: c {job, life, hours:[open,close,bed,wake] (not a life: the job's hours, a little their own), work:{x,z,in} a door or {x,z,r} or {x,z,band:[rects]} out of doors, home:{x,z}}, X {hg, doors}, cur where they stand
// -> {w: the goal's name (work, home, off, off:habit), at: where to go (null: stay), in: hidden inside on arriving, b: the range to wander there, hold: stand still, fast: at a jog}
const lvGoal=(key,c,H,rec,X,T,cur)=>{ const h=((H%24)+24)%24; let w;
  if(c.life){ const k=lvPlan(key,c,H,rec); w=k==='work'?'work':k==='sleep'||k==='home'||LV_DO[k]&&LV_DO[k].home?'home':'off:'+k; }
  else { const [o,cl,bed,wake]=c.hours||[9,17,18,8]; w=lvIn(h,o,cl)?'work':lvIn(h,bed,wake)?'home':'off'; }
  const W=c.work, off=()=>{ const d=W&&W.in?W:cur; return {w,at:null,in:0,b:{x:d.x,z:d.z,r:10*T},hold:0}; };
  if(w==='work'){ if(!W||W.in)return {w,at:W?{x:W.x,z:W.z}:null,in:1,b:null,hold:1}; const b=W.band?{band:W.band}:W.r>0?{x:W.x,z:W.z,r:W.r}:null; return {w,at:{x:W.x,z:W.z},in:0,b,hold:b?0:1}; }
  if(w==='home'){ const hm=c.home; return {w,at:hm?{x:hm.x,z:hm.z}:null,in:1,b:null,hold:1}; }
  if(w==='off')return off();
  const sp=lvSpot(w.slice(4),key,H,X&&X.hg,X&&X.doors,T); if(!sp)return off();
  if(sp.at)return {w,at:sp.door?{x:sp.door.x,z:sp.door.z}:null,in:1,b:null,hold:1};
  const b=sp.band?{band:sp.band}:sp.r>0?{x:sp.x,z:sp.z,r:sp.r}:null; return {w,at:{x:sp.x,z:sp.z},in:0,b,hold:b?0:1,hd:sp.hd,fast:sp.fast?1:0}; };
export {LV_DO, LV_HOUR, lvBrief, lvGoal, lvH, lvHash, lvMeet, lvNew, lvPlan, lvRun, lvSelf, lvSpot, lvStep};

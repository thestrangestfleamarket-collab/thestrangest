// THE BOT TESTS: what a player can do, listed by the game from its own data (every place, the things in each, every shop's goods, what each buyer buys and each teacher teaches, the skills, the pets, the arcade's games, the people to talk to), each a test a bot (?bot=1, job TESTS) plays like a player: PASS, FAIL and why, or SKIP and why.
import {SHARED} from './003-shx.js';
import {ARCH, ARCHI, BUGS, CHARS, FORAGE, INV, ITEMS, keys, NPCS, PARK, PETS, pos, RIDE, ROOMS, SHOPS, st, TALK, TESTS, UI, VIT} from './003b-systems.js';
import {FADE, LEVEL, MODS, QS, STORE, TILE} from './006-map-pre.js';
import {MINI} from './038zd-mini.js';
import {FISHING} from './142-fishing.js';
import {TREES} from './144e-trees.js';
import {SPOT} from './162fb-spot.js';
import {BOT} from './162g-bots.js';
window.TESTS=TESTS;
{ const T=TILE;
  TESTS.cats=[['flow','PLAY IT THROUGH (40 THINGS, STEP BY STEP, WITH SCREENSHOTS)'],['go','GO TO EVERY PLACE'],['use','USE THE THINGS IN EVERY PLACE'],['talk','TALK TO EVERYONE'],['buy','BUY EVERYTHING'],['sell','SELL TO EVERY BUYER'],['learn','PAY TO LEARN EVERY SKILL'],['skill','RAISE EVERY SKILL BY DOING IT'],['pet','ADOPT EVERY PET'],['arcade','PLAY EVERY ARCADE GAME'],['job','SIT, DECORATE']];
  const NM=id=>(FORAGE.name?FORAGE.name(id):id).toUpperCase(), SKN=k=>((FORAGE.SK||[]).find(s=>s[0]===k)||[0,k.toUpperCase()])[1];
  const people=()=>NPCS.concat(NPCS.extra||[]).filter(N=>N&&CHARS.id(N)&&!ARCH.has(CHARS.id(N)));
  const placeN=()=>{ try{ return [...new Set(['YOUR APARTMENT',...UI.places().map(p=>p[0])])]; }catch(e){ return []; } };
  // a skill by doing it: where, what to buy first, what to use there (the mushrooms and the fishing are the bot's own jobs)
  const HOW={forage:{job:'mushrooms'},myco:{job:'mushrooms'},fish:{job:'fish'},ento:{at:'CENTRAL PARK',need:['net'],re:/BUTTERFL|MOTH/},bird:{at:'CENTRAL PARK',need:['binoc'],re:/BIRD|PIGEON|SPARROW|ROBIN|CROW|JAY|DUCK|GOOSE|FINCH|OWL/},
    climb:{at:'CENTRAL PARK',re:/TREE|LADDER|ROPE|CLIMB/},garden:{at:'CENTRAL PARK',re:/FLOWER|ROSE|TULIP|DAISY|LILY|BED$/},bee:{at:'CENTRAL PARK',need:['bee_smoker','jar_honey'],re:/HIVE/},sword:{need:['sword_wood'],re:/DUMMY|TRAINING|SPAR/},fight:{re:/DUMMY|PUNCH|BAG|SPAR/},gem:{at:'THE GEM SHOP',need:['gem_wheel'],re:/WHEEL|GRIND|CUT/}};
  // PLAY IT THROUGH (owner, 9 Nov 2026: "i should be able to generate new bot -> test fishing (which means they would need to train fishing, buy rod, buy bait, fish, catch fish, sell it, etc) and take screenshots of each action ... list the top 40 things in game we need to test"): each a list of steps a player takes; a step: [what, ...] (go place | learn shop skill | buy shop item | sell shop group | use /name/ | job name until | pack item /button/ | sit | ride item | pet kind | arcade game | talk n | skill k | hurt hp)
  const BF='/WHITE|SULPHUR|CRESCENT|SWALLOWTAIL|QUESTION MARK|MONARCH|ADMIRAL|SKIPPER|TAILED-BLUE|FRITILLARY|COPPER|HAIRSTREAK|MOTH|BUTTERFL/', FLW='/MARIGOLD|CLOVER|DANDELION|GOLDENROD|DAISY|ROSE|TULIP|LILY|ASTER|VIOLET|POPPY|BLUEBELL|SUNFLOWER/', BRD='/\\bBIRD\\b|OWL|PIGEON|SPARROW|ROBIN|CROW|JAY|DUCK|GOOSE|HERON|FINCH|STARLING|CARDINAL/';
  TESTS.FLOWS=[
    ['fishing','FISHING: learn it, buy a rod and bait, catch a fish, sell it',[['learn','FISHING & SCUBA','fish'],['buy','FISHING & SCUBA','rod'],['buy','FISHING & SCUBA','bait'],['go','TO THE HUDSON (THE PIER)'],['job','fish','caught','catch a fish',900],['sell','FISHING & SCUBA','fish']]],
    ['mushrooms','MUSHROOMS: pick some in the park, get better at it, sell them',[['go','CENTRAL PARK'],['job','mushrooms','picked','pick a mushroom',300],['sell','THE MUSHROOM SHOP','mushrooms']]],
    ['forage','FORAGING AND MYCOLOGY LESSONS at the mushroom shop',[['learn','THE MUSHROOM SHOP','forage'],['learn','THE MUSHROOM SHOP','myco']]],
    ['bfly','BUTTERFLIES: buy a net, catch one in the park, sell it',[['buy','THE BUTTERFLY SHOP','net'],['go','CENTRAL PARK'],['use',BF,'catch a butterfly','gotBfly'],['sell','THE BUTTERFLY SHOP','butterflies']]],
    ['birds','BIRDS: buy binoculars, watch a bird in the park',[['buy','THE BIRD SHOP','binoc'],['go','CENTRAL PARK'],['use',BRD,'watch a bird']]],
    ['birdlesson','BIRDING AND CLIMBING LESSONS at the bird shop',[['learn','THE BIRD SHOP','bird'],['learn','THE BIRD SHOP','climb']]],
    ['bees','BEES: buy a smoker and jars, find a hive, take honey',[['buy','THE BEEKEEPER','bee_smoker'],['buy','THE BEEKEEPER','jar_honey'],['go','CENTRAL PARK'],['use','/HIVE/','take honey from a hive']]],
    ['beelesson','BEEKEEPING LESSON at the beekeeper',[['learn','THE BEEKEEPER','bee']]],
    ['flowers','FLOWERS: pick one in the park, sell it at the florist',[['go','CENTRAL PARK'],['use',FLW,'pick a flower','gotFlower'],['sell','THE FLORIST','flowers']]],
    ['garden','GARDENING: buy seeds, a pot and dirt at the florist',[['buy','THE FLORIST','seed_sun'],['buy','THE FLORIST','pot'],['buy','THE FLORIST','dirt'],['learn','THE FLORIST','garden']]],
    ['climb','CLIMBING: climb one of the park\'s big trees',[['go','CENTRAL PARK'],['climb']]],
    ['pet','A PET: adopt a cat, pet it, buy it food',[['pet','cat'],['use','/^PET YOUR/','pet it'],['buy','THE PET STORE','g_catfood']]],
    ['clothes','CLOTHES: buy a denim jacket and wear it',[['buy','THE CLOTHES SHOP','jacket_denim'],['pack','jacket_denim','/WEAR|PUT ON/','wear it']]],
    ['tailor','THE TAILOR: change what you wear',[['go','THE TAILOR'],['use','/TAILOR\'S COUNTER/','open the tailor\'s counter']]],
    ['barber','THE BARBER: change your hair',[['go','THE BARBER'],['use','/BARBER\'S COUNTER/','open the barber\'s counter']]],
    ['hotel','THE HOTEL: rest to full health',[['hurt',.5],['go','THE HOTEL'],['use','/FRONT DESK/','rest at the front desk','healed']]],
    ['bodega','THE BODEGA: buy something at the register',[['go','THE BODEGA'],['use','/THE REGISTER/','buy at the register']]],
    ['diner','THE DINER: buy an apple and eat it',[['buy','THE DINER','fr_apple'],['pack','fr_apple','/EAT/','eat it']]],
    ['skate','THE SKATE SHOP: buy a skateboard, ride it, get off',[['buy','THE SKATE SHOP','skateboard'],['ride','skateboard']]],
    ['bmx','A BMX: buy one and ride it',[['buy','THE SKATE SHOP','bmx'],['ride','bmx']]],
    ['sword','THE ARMOURY: buy a wooden sword and learn to use it',[['buy','THE ARMOURY','sword_wood'],['learn','THE ARMOURY','sword']]],
    ['gems','THE GEM SHOP: the gems lesson',[['learn','THE GEM SHOP','gem']]],
    ['arcade','THE ARCADE: play a game',[['arcade','MAZE']]],
    ['arcade2','THE ARCADE: play another game',[['arcade','RAINBOW RUN']]],
    ['theatre','THE MOVIE THEATRE: go in',[['go','THE MOVIE THEATRE'],['use','/SEAT|TICKET|SCREEN/','take a seat']]],
    ['museum','THE ART MUSEUM: go in, look at a painting',[['go','THE ART MUSEUM'],['use','/NIGHT WATCH|MILKMAID|STILL LIFE|LANDSCAPE|HARVESTERS|YOUNG WOMAN/','look at a painting']]],
    ['bank','THE BANK: go in',[['go','THE BANK'],['use','/CAGE ONE|CAGE TWO/','open your account at a cage']]],
    ['books','THE BOOKSTORE: go in, borrow a book',[['go','THE BOOKSTORE'],['use','/BOOKCASE|THE CASE|SHELF|LEND/','open a bookcase']]],
    ['bath','THE BATH HOUSE: pay for a soak',[['go','THE BATH HOUSE'],['use','/FRONT DESK/','pay for a soak']]],
    ['subway','THE SUBWAY: down to the platform, a seat on the train',[['go','THE PLATFORM'],['use','/^SEAT$|HOLD THE POLE|HOLD A STRAP/','get on']]],
    ['castle','THE CASTLE: go there and look round',[['go','THE CASTLE'],['wander',20]]],
    ['dungeon','THE DUNGEON: go down',[['go','THE DUNGEON'],['wander',20]]],
    ['hudson','THE HUDSON: the pier, then a swim',[['go','TO THE HUDSON (THE PIER)'],['wander',20]]],
    ['apartment','YOUR APARTMENT: go home, sit in the recliner, use the computer',[['go','YOUR APARTMENT'],['use','/RECLINER/','sit in the recliner'],['use','/THE COMPUTER/','use the computer']]],
    ['decorate','YOUR APARTMENT: buy a thing for it',[['job','decorate','spent','buy a thing',180]]],
    ['bench','A BENCH: sit on one',[['go','CENTRAL PARK'],['sit']]],
    ['talk','PEOPLE: talk to three',[['go','CENTRAL PARK'],['talk',3]]],
    ['tour','A TOUR: six places in a row by the map',[['go','THE STREET'],['go','CENTRAL PARK'],['go','THE ARCADE'],['go','THE BODEGA'],['go','THE PLATFORM'],['go','THE CASTLE']]],
    ['lessons','LESSONS: fishing lessons twice (the price goes up)',[['learn','FISHING & SCUBA','fish'],['learn','FISHING & SCUBA','fish']]],
    ['money','MONEY: earn $20 picking and selling mushrooms',[['job','mushrooms','earned20','earn $20',600]]]];
  // every test, made fresh from the game's data: [{id, cat, name, ...what it needs}]
  TESTS.all=async()=>{ const L=[], add=(cat,id,name,o)=>L.push({id:cat+':'+id,cat,name,...o});
    const shopOf={}; for(const p of LEVEL.places||[])if(p.merchant&&p.name)shopOf[p.merchant]=p.name;
    for(const [id,n,steps] of TESTS.FLOWS)add('flow',id,n,{steps});
    for(const n of placeN()){ add('go',n,'GO TO '+n,{at:n}); if(n!=='YOUR APARTMENT')add('use',n,'USE THE THINGS AT '+n,{at:n}); }
    const here=new Set(people().map(N=>CHARS.id(N)));
    for(const k of here){ const N=people().find(q=>CHARS.id(q)===k); add('talk',k,'TALK TO '+String(N.name||k).toUpperCase(),{who:k}); }
    for(const k in LEVEL.chars||{}){ if(ARCH.has(k))continue; const t=CHARS.trade({key:k}); if(!t)continue; const shop=shopOf[k]||null; if(!shop&&!here.has(k))continue;
      const by=shop||String((people().find(q=>CHARS.id(q)===k)||{}).name||k).toUpperCase();
      for(const id of (t.sells||[]).filter(id=>!ARCHI(id)))add('buy',k+':'+id,'BUY '+NM(id)+' FROM '+by,{who:k,shop,item:id});
      for(const g of t.buys||[])add('sell',k+':'+g,'SELL '+g.toUpperCase()+' TO '+by,{who:k,shop,group:g});
      for(const s of t.teaches||[])add('learn',k+':'+s,'LEARN '+SKN(s)+' FROM '+by,{who:k,shop,skill:s}); }
    for(const [k,n] of FORAGE.SK||[])add('skill',k,'RAISE '+n+' BY DOING IT',{skill:k});
    try{ const I=await PETS.idx(); for(const K of I.kinds)add('pet',K.key,'ADOPT A '+String(K.name||K.key).toUpperCase(),{kind:K.key,group:K.group}); }catch(e){}
    for(const sd of ['e','w','b'])for(const n of (STORE.cabs&&STORE.cabs.walls[sd])||[])add('arcade',n,'PLAY '+n,{game:n});
    add('job','sit','SIT ON A SEAT',{job:'sit'}); add('job','decorate','BUY A THING FOR ITS APARTMENT',{job:'decorate'});
    return L; };
  TESTS.pick=(L,want)=>{ const W=(want||[]).map(String); return W.includes('*')?L:L.filter(t=>W.some(w=>w.endsWith(':')?t.id.startsWith(w)||t.cat+':'===w:t.id===w)); };

  if(QS.get('bot')==='1'){ const K=BOT.kit, errs=[], K0='bottests:';
    addEventListener('error',e=>errs.push(String(e.message||e).slice(0,140))); addEventListener('unhandledrejection',e=>errs.push(String(e.reason&&e.reason.message||e.reason).slice(0,140)));
    let ALLT=null, Q=null, cur=null, gap=0, run=null, out=[], tally={pass:0,fail:0,skip:0}, done={};
    const keep=()=>{ try{ localStorage.setItem(K0+run,JSON.stringify(done)); }catch(e){} };
    const start=c=>{ run=String(c.run||0); Q=null; cur=null; out=[]; tally={pass:0,fail:0,skip:0}; try{ done=JSON.parse(localStorage.getItem(K0+run)||'{}'); }catch(e){ done={}; }
      TESTS.all().then(L=>{ ALLT=L; Q=TESTS.pick(L,c.tests).filter(t=>!done[t.id]); }); };
    const have=id=>FORAGE.has(id)||0, N_=k=>people().find(q=>CHARS.id(q)===k), thOf=N=>N&&UI.things.find(t=>t.npc===N);
    const tidy=()=>{ if(MINI.on&&MINI.close)MINI.close(); if(FISHING.mode&&FISHING.leave)FISHING.leave(); FISHING.auto=false; K.close(); if(SHOPS.close)SHOPS.close(); if(TALK.on&&TALK.close)TALK.close(); if(STORE.cabs&&STORE.cabs.on&&STORE.cabs.close)STORE.cabs.close(); K.stop(); K.reset(); };
    const panelUp=()=>{ const p=document.getElementById('shopg'); return !!(p&&!p.hidden)||[...document.querySelectorAll('[data-buy],[data-sell],[data-sold],[data-train]')].some(e=>e.offsetParent); };
    /* ---------- the steps the tests share: each returns undefined while going, true once done, or [result, why] ---------- */
    // GO TO a place as the map does; there once the fade is over and it is near the place's spot (or inside)
    const goTo=(c,s,n)=>{ if(!s.gone){ s.gone=c.t; s.x=pos.x; s.z=pos.z; s.r=ROOMS.cur; UI.goName(n); return; } if(c.t-s.gone<3||FADE.busy)return;
      const P=UI.places().find(p=>p[0]===n), near=P&&isFinite(P[1])?Math.hypot(pos.x-P[1],pos.z-P[2])<8*T:false, inn=n==='YOUR APARTMENT'?!!(MODS.apts&&MODS.apts.inReal):ROOMS.cur!==s.r&&ROOMS.cur!=null;
      if(near||inn||Math.hypot(pos.x-s.x,pos.z-s.z)>4*T)return true; if(c.t-s.gone>25)return ['fail','GO TO '+n+' did not take it there']; };
    // up to a seller (their shop's counter, or them on the street) with their window open; fn presses the buttons
    const q_t=c=>c.t;
    const seller=(c,dt,fn)=>{ const e=c.e, s=c.s;
      if(e.shop){ const r=K.counter(e.shop,dt,()=>{ s.btn=fn(); },s); if(r===null)return ['fail','could not get to the counter in '+e.shop]; if(r)s.sold=1; return r?true:undefined; }
      const N=N_(e.who), th=thOf(N); if(!th)return ['skip',e.who+' is not in the world now'];
      if(!s.used){ if(K.use(th,dt))s.used=c.t; return; } if(c.t-s.used<1.2)return;
      if(!panelUp()){ const o=[...document.querySelectorAll('#talkp [data-i]')].find(d=>/BUY|SELL|TRADE|WARES|SHOP|WHAT.*HAVE|LOOK/i.test(d.textContent)); if(o&&!s.opt){ s.opt=1; o.click(); return; } if(TALK.close)TALK.close(); SHOPS.open(N); }
      if(!s.pw){ s.btn=fn(); s.pw=q_t(c)+1.8; return; } K.answer(); if(q_t(c)<s.pw)return; K.close(); SHOPS.close(); return true; };
    const buyIt=(c,dt,id)=>{ const s=c.s; if(s.n0==null){ s.n0=have(id); s.c0=K.cash(); const p=+ITEMS.prop(id,'value')||1; if(K.cash()<p)return ['skip','$'+K.cash()+' is not enough for '+NM(id)+' ($'+Math.round(p)+')']; }
      const r=seller(c,dt,()=>K.buy(id)); if(r!==true)return r;
      if(have(id)>s.n0)return ['pass','bought '+NM(id)+' for $'+(s.c0-K.cash())]; return ['fail',s.btn?'pressed BUY, nothing came ($'+s.c0+' then $'+K.cash()+')':'no BUY button for '+NM(id)]; };
    const sub=(c,k)=>{ const s=c.s[k]||(c.s[k]={}); return {e:c.e,t:c.t,s}; };
    const RUN={
      go:(c)=>{ if(c.e.at==='YOUR APARTMENT'&&!K.cfg().apt)return ['skip','has no apartment (OWN APARTMENT is off)']; const r=goTo(c,c.s,c.e.at); return r===true?['pass','got there ('+pos.x.toFixed(0)+', '+pos.z.toFixed(0)+')']:r; },
      use:(c,dt)=>{ const s=c.s; if(!s.there){ const r=goTo(c,s,c.e.at); if(r!==true)return r; s.there=c.t; s.x=pos.x; s.z=pos.z; s.list=null; s.ok=[]; s.bad=[]; }
        if(!s.list){ s.list=UI.things.filter(t=>t&&t.obj&&t.act&&!t.npc&&!/DOOR|EXIT|LEAVE|OUT TO|STAIRS|SUBWAY|TRAIN|ELEVATOR|GO (UP|DOWN|IN|OUT)|TO THE /i.test(t.name||'')).map(t=>[t,K.thAt(t)]).filter(([t,p])=>Math.hypot(p.x-s.x,p.z-s.z)<20*T).sort((a,b)=>Math.hypot(a[1].x-s.x,a[1].z-s.z)-Math.hypot(b[1].x-s.x,b[1].z-s.z)).slice(0,8).map(a=>a[0]); s.i=0; if(!s.list.length)return ['skip','nothing to use near '+c.e.at]; }
        const th=s.list[s.i]; if(!th){ return s.bad.length?['fail','used '+s.ok.length+'; could not: '+s.bad.join(', ')]:['pass','used '+s.ok.length+': '+s.ok.join(', ')]; }
        if(s.at==null){ s.at=c.t; s.u=0; } if(!s.u){ try{ if(K.use(th,dt))s.u=c.t; }catch(e){ s.bad.push((th.name||'?')+' ('+String(e.message||e).slice(0,50)+')'); s.at=null; s.i++; tidy(); return; } if(c.t-s.at>25){ s.bad.push((th.name||'?')+' (could not reach it)'); s.at=null; s.i++; tidy(); } return; }
        if(c.t-s.u<1.5)return; s.ok.push(String(th.name||'?').toLowerCase()); s.at=null; s.i++; tidy();
        if(Math.hypot(pos.x-s.x,pos.z-s.z)>40*T||FADE.busy){ s.x=pos.x; s.z=pos.z; s.there=0; s.gone=0; } },
      talk:(c,dt)=>{ const s=c.s, N=N_(c.e.who), th=thOf(N); if(!th)return ['skip',c.e.who+' is not in the world now'];
        if(!s.used){ if(K.use(th,dt))s.used=c.t; else if(c.t>90)return ['fail','could not get to '+(N.name||c.e.who)]; return; } if(c.t-s.used<1.2)return;
        const p=document.getElementById('talkp'); return TALK.on&&p&&!p.hidden?['pass',String(N.name||'').toLowerCase()+' talked']:panelUp()?['pass','opened their shop']:['fail','double-clicked, nothing opened']; },
      buy:(c,dt)=>buyIt(c,dt,c.e.item),
      sell:(c,dt)=>{ const s=c.s, P=(FORAGE.BUYK&&FORAGE.BUYK[c.e.group])||[]; if(!s.id){ s.id=Object.keys(INV.items).find(id=>INV.items[id]>0&&P.some(p=>id.startsWith(p))); if(!s.id)return ['skip','has no '+c.e.group+' to sell (the skill tests find some)']; s.n0=have(s.id); s.c0=K.cash(); }
        const r=seller(c,dt,()=>K.press(`.shr[data-sold="${s.id}"]`)||K.click(`[data-sold="${s.id}"]`)||K.click(`[data-sell="${s.id}"]`)); if(r!==true)return r;
        return have(s.id)<s.n0&&K.cash()>s.c0?['pass','sold '+NM(s.id)+' for $'+(K.cash()-s.c0)]:['fail',s.btn?'pressed SELL, nothing happened':'no SELL button for '+NM(s.id)]; },
      learn:(c,dt)=>{ const s=c.s, k=c.e.skill; if(s.v0==null){ s.v0=FORAGE.sk(k); s.c0=K.cash(); }
        const r=seller(c,dt,()=>K.click(`[data-train="${k}"]`)); if(r!==true)return r;
        return FORAGE.sk(k)>s.v0?['pass',SKN(k)+' '+s.v0.toFixed(1)+' to '+FORAGE.sk(k).toFixed(1)+' for $'+(s.c0-K.cash())]:K.cash()<s.c0?['pass','paid $'+(s.c0-K.cash())+' (no rise this time)']:['fail',s.btn?'pressed TRAIN, nothing happened':'no TRAIN button']; },
      skill:(c,dt)=>{ const s=c.s, k=c.e.skill, H=HOW[k]||{}; if(s.v0==null)s.v0=FORAGE.sk(k);
        if(FORAGE.sk(k)>s.v0)return ['pass',SKN(k)+' '+s.v0.toFixed(1)+' to '+FORAGE.sk(k).toFixed(1)+(s.by?' ('+s.by+')':'')];
        if(H.job){ K.JOB[H.job](dt); s.by=H.job==='fish'?'fishing':'picking'; return; }
        for(const id of H.need||[])if(!have(id)){ if(!s.L)s.L=TESTS.all().then(A=>{ s.A=A; }); if(!s.A)return; const b=s.A.find(t=>t.cat==='buy'&&t.item===id&&(t.shop||N_(t.who))); if(!b)return ['fail','nobody sells '+NM(id)+', needed first'];
          const q=sub(c,'b'+id); q.e=b; const r=buyIt(q,dt,id); if(r===undefined)return; if(r[0]!=='pass')return ['fail','needed '+NM(id)+' first: '+r[1]]; return; }
        if(H.at&&!s.there){ const r=goTo(c,sub(c,'g').s,H.at); if(r!==true)return r; s.there=1; }
        if(!H.re)return ['skip','the tests do not know how to do '+SKN(k)+' yet'];
        if(!s.th||s.th.tries>4){ const L=UI.things.filter(t=>t&&t.obj&&t.act&&H.re.test(t.name||'')&&(!s.th||t!==s.th)&&!(s.no||[]).includes(t)); if(s.th)(s.no=s.no||[]).push(s.th); s.th=K.nearest(L); if(!s.th)return ['fail','found nothing to do '+SKN(k)+' with'+(H.at?' at '+H.at:'')]; s.th.tries=0; s.by=String(s.th.name).toLowerCase(); }
        if(s.w>0){ s.w-=dt; return; } if(K.use(s.th,dt)){ s.th.tries++; s.w=3; tidy(); } },
      pet:(c,dt)=>{ const s=c.s, e=c.e; if(s.c0==null){ s.c0=K.cash(); if(K.cash()<30)return ['skip','$'+K.cash()+' is too little for a pet']; }
        if(!s.open){ const r=K.counter(((LEVEL.places||[]).find(p=>p.id==='pets')||{}).name||'THE PET STORE',dt,()=>{},s,/^THE ADOPTION BOOK/,true); if(r===null)return ['fail','could not get to the adoption book']; if(r)s.open=c.t; return; }
        if(!PETS.inShop()){ if(c.t-s.open>8)return ['fail','the adoption book did not open']; return; }
        if(!s.chose){ const g=document.getElementById('lptg'), k=document.getElementById('lptk'); if(!g||!k)return; g.value=e.group; g.dispatchEvent(new Event('change')); k.value=e.kind; k.dispatchEvent(new Event('change')); s.chose=c.t; return; }
        if(c.t-s.chose<1)return; if(!s.paid){ const b=document.getElementById('lpta'); if(b)b.click(); s.paid=c.t; return; } if(c.t-s.paid<1)return;
        const M=PETS.my(); return M&&M.k===e.kind?['pass','adopted for $'+(s.c0-K.cash())]:['fail','pressed ADOPT; its pet is '+(M?M.k:'none')+' ($'+s.c0+' then $'+K.cash()+')']; },
      arcade:(c,dt)=>{ const s=c.s, n=c.e.game, C=STORE.cabs; if(K.cash()<2)return ['skip','has under $2'];
        if(!s.there){ const r=goTo(c,s,'THE ARCADE'); if(r!==true)return r; s.there=c.t; (window.LOAD?LOAD('arcade'):Promise.resolve()).then(()=>{ s.ld=1; }).catch(e=>{ s.ld=String(e.message||e); }); }
        if(!s.ld)return; if(s.ld!==1)return ['fail','the arcade games did not load: '+s.ld]; if(!C.reg[n])return ['skip',n+' is COMING SOON'];
        if(!s.on){ const th=UI.things.find(t=>(t.name||'').startsWith(n)); if(th&&!s.walked){ if(!K.use(th,dt)){ if(c.t-s.there>30)s.walked=1; return; } } else C.play(n); s.on=c.t; s.c0=K.cash(); return; }
        const D=C.dbg?C.dbg():{}; if(!C.on)return ['fail','the cabinet did not open'];
        if(!D.loaded){ if(c.t-s.on>20)return ['fail',n+' did not load']; return; }
        if(!s.coin){ s.coin=c.t; for(const t of ['keydown','keyup'])setTimeout(()=>dispatchEvent(new KeyboardEvent(t,{key:' ',code:'Space',bubbles:true})),t==='keyup'?120:0); return; }
        if(D.mode!=='play'&&c.t-s.coin<6)return; if(D.mode!=='play'&&!s.played)return ['fail','pressed SPACE, it did not start ('+D.mode+')']; s.played=s.played||c.t; if(c.t-s.played<4)return;
        return ['pass','played '+n+' ($'+(s.c0-K.cash())+', score '+(D.score||0)+')']; },
      job:(c,dt)=>{ const s=c.s, j=c.e.job; if(j==='decorate'&&!K.cfg().apt)return ['skip','has no apartment (OWN APARTMENT is off)']; if(s.c0==null)s.c0=K.cash(); K.JOB[j](dt);
        if(j==='sit'&&st.sit)return ['pass','sat down'];
        if(j==='decorate'&&MODS.apts&&MODS.apts.inReal&&K.cash()<s.c0)return ['pass','bought a thing for $'+(s.c0-K.cash())]; } };
    /* ---------- PLAY IT THROUGH: the steps, a shot of each from four angles, its spot code and what the game said ---------- */
    const SAID=[]; { const tap=()=>{ const J=document.getElementById('hlines'); if(!J)return setTimeout(tap,2000); new MutationObserver(()=>{ const L=J.lastElementChild, t=L&&L.textContent; if(t&&t!==SAID[SAID.length-1]){ SAID.push(t.slice(0,120)); if(SAID.length>12)SAID.shift(); } }).observe(J,{childList:true,subtree:true,characterData:true}); }; tap(); }   // the HUD's log: what the game said
    const frames=n=>new Promise(r=>{ const f=()=>--n>0?requestAnimationFrame(f):r(); requestAnimationFrame(f); });
    const ANG=[['behind',0],['side',Math.PI/2],['front',Math.PI],['first',null]];
    const shoot=async(keep)=>{ const o=[]; if(!BUGS.grab)return o; BOT.draw=true; const v0=UI.view, y0=SHARED.yaw, d0=UI.dist; if(d0>0)UI.dist=UI.distTo=d0*.6;   // nearer, so walls inside a shop stand behind the camera less
      try{ for(const [a,off] of ANG){ if(off==null)UI.setView('first'); else { if(UI.view!=='third')UI.setView('third'); SHARED.yaw=SHARED.yawTo=y0+off; } await frames(4); const jpg=await BUGS.grab(); if(!jpg)continue;
          if(keep&&!keep.jpg)keep.jpg=jpg; LAST.push({a,jpg}); if(LAST.length>8)LAST.shift();
          let k=null; try{ const r=await fetch('/botshot',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jpg})}); const j=await r.json(); k=j.k||null; }catch(e){} o.push({a,k}); } }
      finally{ UI.setView(v0==='first'?'first':'third'); SHARED.yaw=SHARED.yawTo=y0; if(d0>0)UI.dist=UI.distTo=d0; BOT.draw=false; } return o; };
    const LAST=[]; BOT.lastShots=()=>LAST;
    const shopWho=n=>{ for(const p of LEVEL.places||[])if(p.name===n&&p.merchant)return p.merchant; return null; };
    const nearRe=(re,far=40)=>K.nearest(UI.things.filter(t=>t&&t.obj&&t.act&&re.test(t.name||'')&&K.d2(K.thAt(t).x,K.thAt(t).z)<far*T));
    const bag=()=>Object.values(INV.items).reduce((a,n)=>a+(n>0?n:0),0);
    const UNTIL={caught:s=>FISHING.held()>(s.f0??(s.f0=FISHING.held())),picked:s=>{ const n=Object.keys(INV.items).filter(id=>/^[mu]_/.test(id)).reduce((a,id)=>a+INV.items[id],0); return n>(s.m0??(s.m0=n)); },
      spent:s=>K.cash()<(s.c0??(s.c0=K.cash())),earned20:s=>K.cash()>=(s.c0??(s.c0=K.cash()))+20,gotBfly:s=>Object.keys(INV.items).some(id=>/^bu?_\d/.test(id)&&INV.items[id]>(s['b'+id]??0)),gotFlower:s=>Object.keys(INV.items).some(id=>/^fl_/.test(id)&&INV.items[id]>0),healed:()=>VIT.hp>=.99};
    // who sells, teaches or buys it now, from the game's own list (a shop first, the one named if it still does): the shops move and change hands
    const find=(cat,ok,named)=>{ const L=(ALLT||[]).filter(t=>t.cat===cat&&ok(t)); return L.find(t=>t.shop===named)||L.find(t=>t.shop)||L[0]||null; };
    const STEP={
      go:(q,dt,[n])=>{ const r=goTo(q,q.s,n); return r===true?['pass','got to '+n]:r; },
      learn:(q,dt,[shop,skill])=>{ const t=find('learn',x=>x.skill===skill,shop); if(!t)return ['fail','nobody teaches '+SKN(skill)+' now']; q.e=t; return RUN.learn(q,dt); },
      buy:(q,dt,[shop,item])=>{ const t=find('buy',x=>x.item===item,shop); if(!t)return ['fail','nobody sells '+NM(item)+' now']; q.e=t; return RUN.buy(q,dt); },
      sell:(q,dt,[shop,group])=>{ const t=find('sell',x=>x.group===group,shop); if(!t)return ['fail','nobody buys '+group+' now']; q.e=t; return RUN.sell(q,dt); },
      skill:(q,dt,[k])=>{ q.e={skill:k}; return RUN.skill(q,dt); },
      pet:(q,dt,[kind])=>{ const t=(ALLT||[]).find(x=>x.id==='pet:'+kind); if(!t)return ['fail','no pet called '+kind]; q.e=t; return RUN.pet(q,dt); },
      arcade:(q,dt,[game])=>{ q.e={game}; return RUN.arcade(q,dt); },
      use:(q,dt,[re,what,until])=>{ const s=q.s, R=new RegExp(re.slice(1,-1)); if(until&&UNTIL[until]&&s.u0==null){ UNTIL[until](s); s.u0=1; }
        if(!s.th){ s.th=nearRe(R); if(!s.th){ if(q.t>20)return ['fail','found nothing like '+re+' to '+what+' here']; return; } s.bag=bag(); s.cash=K.cash(); s.said=SAID.length; }
        if(!s.used){ if(K.use(s.th,dt))s.used=q.t; else if(q.t>90)return ['fail','could not reach '+String(s.th.name).toLowerCase()]; return; }
        if(q.t-s.used<2)return; const ok=until&&UNTIL[until]?UNTIL[until](s):(bag()!==s.bag||K.cash()!==s.cash||SAID.length>s.said||panelUp()||!!st.sit||!!MINI.on||document.querySelector('.menu:not([hidden]),#looks:not([hidden]),#talkp:not([hidden])'));
        if(!ok&&until&&q.t<60&&(!s.again||q.t-s.again>8)){ s.again=q.t; s.used=0; return; }   // try again a few times (a catch can miss)
        return ok?['pass','used '+String(s.th.name).toLowerCase()+(SAID.length>s.said?': "'+SAID[SAID.length-1]+'"':'')]:['fail','used '+String(s.th.name).toLowerCase()+', nothing happened']; },
      job:(q,dt,[name,until,what])=>{ const s=q.s; if(!s.on){ s.on=1; UNTIL[until](s); } K.JOB[name](dt); if(UNTIL[until](s))return ['pass',what+' done']; },
      pack:(q,dt,[id,btn,what])=>{ if(!FORAGE.has(id))return ['fail','has no '+NM(id)+' to '+what]; const R=new RegExp(btn.slice(1,-1)), A=(FORAGE.ROWB||[]).flatMap(f=>{ try{ return f(id)||[]; }catch(e){ return []; } }).find(a=>R.test(a[0]));
        if(!A||!FORAGE.ACT[A[1]])return ['fail','the pack has no '+btn+' button for '+NM(id)]; const n0=FORAGE.has(id), s0=SAID.length; FORAGE.ACT[A[1]](id); return ['pass',A[0].toLowerCase()+' '+NM(id)+(FORAGE.has(id)<n0?' (used up)':'')+(SAID.length>s0?': "'+SAID[SAID.length-1]+'"':'')]; },
      sit:(q,dt)=>{ K.JOB.sit(dt); if(st.sit)return ['pass','sat down']; },
      ride:(q,dt,[id])=>{ const s=q.s; if(!FORAGE.has(id))return ['fail','has no '+NM(id)];
        if(!s.on){ s.on=q.t; RIDE.mount(id); return; } if(q.t-s.on<2)return; if(!RIDE.on)return ['fail','E (get on) did nothing'];
        if(!s.off){ s.off=q.t; s.x=pos.x; SHARED.target=new pos.constructor(pos.x+3*T,0,pos.z); return; } if(q.t-s.off<3)return; RIDE.off(); return RIDE.on?['fail','could not get off']:['pass','got on, rode, got off']; },
      climb:(q,dt)=>{ const s=q.s, IT=window.PARK&&PARK.climbable||[]; const it=s.it||(s.it=K.nearest(IT.map(o=>({obj:{getWorldPosition:v=>v.set(o.x,0,o.z)},o})))); if(!it)return ['fail','no tree to climb near'];
        const o=it.o, r=Math.max(o.tr,o.rf||0), d=K.d2(o.x,o.z); if(!s.at){ if(d>r+.8*T){ if(!s.w){ s.w=1; K.walk(o.x+(pos.x-o.x)/(d||1)*(r+.5*T),o.z+(pos.z-o.z)/(d||1)*(r+.5*T)); } K.walking(dt); if(q.t>60)return ['fail','could not reach the tree']; return; } s.at=q.t; TREES.want=o; return; }
        if(q.t-s.at<2)return; if(!(st.climb||st.hang))return ['fail','SPACE at the trunk did not start a climb'];
        keys.add('w'); if(q.t-s.at<8)return; keys.delete('w'); const h=TREES.h; return h>0?['pass','climbed '+h.toFixed(1)+' up']:['fail','on the trunk but did not go up']; },
      talk:(q,dt,[n])=>{ const s=q.s; s.done=s.done||[]; if(s.done.length>=n)return ['pass','talked to '+s.done.join(', ')];
        if(!s.th){ s.th=K.nearest(UI.things.filter(t=>t&&t.obj&&t.npc&&!s.done.includes(t.name))); if(!s.th)return ['fail','nobody to talk to']; s.t0=q.t; }
        if(!s.used){ if(K.use(s.th,dt))s.used=q.t; else if(q.t-s.t0>40){ s.th=null; } return; } if(q.t-s.used<1.5)return;
        const ok=TALK.on||panelUp(); s.done.push(String(s.th.name).toLowerCase()+(ok?'':' (nothing opened)')); tidy(); s.th=null; s.used=0; },
      hurt:(q,dt,[hp])=>{ VIT.hp=Math.min(VIT.hp,hp); return ['pass','health set to '+Math.round(hp*100)+'% to test healing']; },
      wander:(q,dt,[t])=>{ K.roam(dt,null,true); if(q.t>t)return ['pass','walked round for '+t+' s, nothing broke']; } };
    RUN.flow=(c,dt)=>{ const s=c.s, L=c.e.steps; s.log=s.log||[]; s.i=s.i||0;
      if(s.shoot)return; if(s.end)return s.end;
      const step=L[s.i]; if(!step)return ['pass','all '+L.length+' steps worked',{steps:s.log}];
      const q=s.q||(s.q={t:0,s:{},e:{},r0:performance.now()}); q.t+=dt; const [kind,...a]=step, lim=kind==='job'?a[3]||300:180;
      let r; if(q.t>lim||(performance.now()-q.r0)/1000>lim*1.5)r=['fail','took longer than '+Math.round(Math.max(q.t,(performance.now()-q.r0)/1000))+' s'+(q.doing?' (it was: '+q.doing.slice(0,70)+')':'')]; else { try{ r=STEP[kind](q,dt,a); }catch(e){ r=['fail','the game threw: '+String(e.message||e).slice(0,90)]; } }
      if(BOT.status){ const d=BOT.status().doing; if(d&&!/^test \d/.test(d))q.doing=d; } if(r===true)r=['pass','done']; if(!Array.isArray(r))return;
      const name=kind==='go'?'go to '+a[0]:kind==='buy'?'buy '+NM(a[1]):kind==='learn'?'learn '+SKN(a[1]):kind==='sell'?'sell '+a[1]:kind==='use'||kind==='pack'?(kind==='use'?a[1]:a[2]):kind==='job'?a[2]:kind+' '+(a[0]??'');
      const rec={n:name,r:r[0],why:String(r[1]||'').slice(0,140),spot:window.SPOT?SPOT.make():'',said:SAID.slice(-2),at:Date.now()}; s.log.push(rec); tidy();
      const C=K.cfg(), keep={}; s.shoot=(C.shots===0||C.shots===false)?Promise.resolve([]):shoot(keep);
      s.shoot.then(sh=>{ rec.shots=sh; s.shoot=null;
        if(r[0]!=='pass'){ s.end=[r[0],'step '+(s.i+1)+' of '+L.length+' ('+name+'): '+r[1],{steps:s.log}];
          if(r[0]==='fail'&&C.report!==0&&C.report!==false&&BUGS.file&&!s.filed){ s.filed=1; BUGS.file('BOT TEST · '+c.e.name+' · failed at step '+(s.i+1)+' ('+name+'): '+r[1],{bot:C.name,test:c.e.id,step:name,spot:rec.spot,shots:sh.map(x=>x.k).filter(Boolean)},keep.jpg).catch(()=>{}); } }
        else { s.i++; s.q=null; } }); };
    const LIM={flow:1800,go:45,use:260,talk:120,buy:150,sell:150,learn:150,skill:420,pet:150,arcade:120,job:180};
    const finish=(r,why,x)=>{ const c=cur; cur=null; gap=1.5; tidy(); if(r==='fail'&&errs.length>c.err)why+=' · page error: '+errs[c.err];
      tally[r]=(tally[r]||0)+1; done[c.e.id]=r; keep(); out.push([c.e.id,r,String(why||'').slice(0,160),Date.now(),...(x?[x]:[])]); if(out.length>400)out.shift(); };
    K.JOB.tests=dt=>{ const C=BOT.kit.cfg(); if(run!==String(C.run||0))start(C); if(!Q){ K.doing('making the test list'); return; }
      if(!cur){ if((gap-=dt)>0)return; const e=Q.shift(); if(!e){ K.doing('tests done: '+tally.pass+' passed, '+tally.fail+' failed, '+tally.skip+' skipped'); return; } cur={e,t:0,s:{},err:errs.length}; K.reset(); }
      const c=cur; c.t+=dt; K.doing('test '+(tally.pass+tally.fail+tally.skip+1)+' of '+(tally.pass+tally.fail+tally.skip+Q.length+1)+': '+c.e.name+(c.e.cat==='flow'&&c.s.log?' · step '+((c.s.i||0)+1)+' of '+c.e.steps.length:''));
      if(!isFinite(pos.x)||pos.y<-40)return finish('fail','fell out of the world');
      if(c.t>(LIM[c.e.cat]||120))return finish('fail','ran out of time ('+(LIM[c.e.cat]||120)+' s)');
      let r; try{ r=RUN[c.e.cat](c,dt); }catch(e){ r=['fail','the game threw: '+String(e.message||e).slice(0,100)]; }
      if(Array.isArray(r))finish(r[0],r[1],r[2]); };
    BOT.results=()=>{ const o=out; out=[]; return o; };
    BOT.tally=()=>Q?{...tally,left:Q.length+(cur?1:0)}:null; }
}

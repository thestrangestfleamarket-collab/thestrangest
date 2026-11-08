// THE BOT TESTS: what a player can do, listed by the game from its own data (every place, the things in each, every shop's goods, what each buyer buys and each teacher teaches, the skills, the pets, the arcade's games, the people to talk to), each a test a bot (?bot=1, job TESTS) plays like a player: PASS, FAIL and why, or SKIP and why.
import {ARCH, ARCHI, CHARS, FORAGE, INV, ITEMS, NPCS, PETS, pos, ROOMS, SHOPS, st, TALK, TESTS, UI} from './003b-systems.js';
import {FADE, LEVEL, MODS, QS, STORE, TILE} from './006-map-pre.js';
import {BOT} from './162g-bots.js';
window.TESTS=TESTS;
{ const T=TILE;
  TESTS.cats=[['go','GO TO EVERY PLACE'],['use','USE THE THINGS IN EVERY PLACE'],['talk','TALK TO EVERYONE'],['buy','BUY EVERYTHING'],['sell','SELL TO EVERY BUYER'],['learn','PAY TO LEARN EVERY SKILL'],['skill','RAISE EVERY SKILL BY DOING IT'],['pet','ADOPT EVERY PET'],['arcade','PLAY EVERY ARCADE GAME'],['job','SIT, DECORATE']];
  const NM=id=>(FORAGE.name?FORAGE.name(id):id).toUpperCase(), SKN=k=>((FORAGE.SK||[]).find(s=>s[0]===k)||[0,k.toUpperCase()])[1];
  const people=()=>NPCS.concat(NPCS.extra||[]).filter(N=>N&&CHARS.id(N)&&!ARCH.has(CHARS.id(N)));
  const placeN=()=>{ try{ return [...new Set(['YOUR APARTMENT',...UI.places().map(p=>p[0])])]; }catch(e){ return []; } };
  // a skill by doing it: where, what to buy first, what to use there (the mushrooms and the fishing are the bot's own jobs)
  const HOW={forage:{job:'mushrooms'},myco:{job:'mushrooms'},fish:{job:'fish'},ento:{at:'CENTRAL PARK',need:['net'],re:/BUTTERFL|MOTH/},bird:{at:'CENTRAL PARK',need:['binoc'],re:/BIRD|PIGEON|SPARROW|ROBIN|CROW|JAY|DUCK|GOOSE|FINCH|OWL/},
    climb:{at:'CENTRAL PARK',re:/TREE|LADDER|ROPE|CLIMB/},garden:{at:'CENTRAL PARK',re:/FLOWER|ROSE|TULIP|DAISY|LILY|BED$/},bee:{at:'CENTRAL PARK',need:['bee_smoker','jar_honey'],re:/HIVE/},sword:{need:['sword_wood'],re:/DUMMY|TRAINING|SPAR/},fight:{re:/DUMMY|PUNCH|BAG|SPAR/},gem:{at:'THE GEM SHOP',need:['gem_wheel'],re:/WHEEL|GRIND|CUT/}};
  // every test, made fresh from the game's data: [{id, cat, name, ...what it needs}]
  TESTS.all=async()=>{ const L=[], add=(cat,id,name,o)=>L.push({id:cat+':'+id,cat,name,...o});
    const shopOf={}; for(const p of LEVEL.places||[])if(p.merchant&&p.name)shopOf[p.merchant]=p.name;
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
    let Q=null, cur=null, gap=0, run=null, out=[], tally={pass:0,fail:0,skip:0}, done={};
    const keep=()=>{ try{ localStorage.setItem(K0+run,JSON.stringify(done)); }catch(e){} };
    const start=c=>{ run=String(c.run||0); Q=null; cur=null; out=[]; tally={pass:0,fail:0,skip:0}; try{ done=JSON.parse(localStorage.getItem(K0+run)||'{}'); }catch(e){ done={}; }
      TESTS.all().then(L=>{ Q=TESTS.pick(L,c.tests).filter(t=>!done[t.id]); }); };
    const have=id=>FORAGE.has(id)||0, N_=k=>people().find(q=>CHARS.id(q)===k), thOf=N=>N&&UI.things.find(t=>t.npc===N);
    const tidy=()=>{ K.close(); if(SHOPS.close)SHOPS.close(); if(TALK.on&&TALK.close)TALK.close(); if(STORE.cabs&&STORE.cabs.on&&STORE.cabs.close)STORE.cabs.close(); K.stop(); K.reset(); };
    const panelUp=()=>{ const p=document.getElementById('shopg'); return !!(p&&!p.hidden)||[...document.querySelectorAll('[data-buy],[data-sell],[data-sold],[data-train]')].some(e=>e.offsetParent); };
    /* ---------- the steps the tests share: each returns undefined while going, true once done, or [result, why] ---------- */
    // GO TO a place as the map does; there once the fade is over and it is near the place's spot (or inside)
    const goTo=(c,s,n)=>{ if(!s.gone){ s.gone=c.t; s.x=pos.x; s.z=pos.z; s.r=ROOMS.cur; UI.goName(n); return; } if(c.t-s.gone<3||FADE.busy)return;
      const P=UI.places().find(p=>p[0]===n), near=P&&isFinite(P[1])?Math.hypot(pos.x-P[1],pos.z-P[2])<8*T:false, inn=n==='YOUR APARTMENT'?!!(MODS.apts&&MODS.apts.inReal):ROOMS.cur!==s.r&&ROOMS.cur!=null;
      if(near||inn||Math.hypot(pos.x-s.x,pos.z-s.z)>4*T)return true; if(c.t-s.gone>25)return ['fail','GO TO '+n+' did not take it there']; };
    // up to a seller (their shop's counter, or them on the street) with their window open; fn presses the buttons
    const seller=(c,dt,fn)=>{ const e=c.e, s=c.s;
      if(e.shop){ const r=K.counter(e.shop,dt,()=>{ s.btn=fn(); },s); if(r===null)return ['fail','could not get to the counter in '+e.shop]; if(r)s.sold=1; return r?true:undefined; }
      const N=N_(e.who), th=thOf(N); if(!th)return ['skip',e.who+' is not in the world now'];
      if(!s.used){ if(K.use(th,dt))s.used=c.t; return; } if(c.t-s.used<1.2)return;
      if(!panelUp()){ const o=[...document.querySelectorAll('#talkp [data-i]')].find(d=>/BUY|SELL|TRADE|WARES|SHOP|WHAT.*HAVE|LOOK/i.test(d.textContent)); if(o&&!s.opt){ s.opt=1; o.click(); return; } if(TALK.close)TALK.close(); SHOPS.open(N); }
      s.btn=fn(); K.close(); SHOPS.close(); return true; };
    const buyIt=(c,dt,id)=>{ const s=c.s; if(s.n0==null){ s.n0=have(id); s.c0=K.cash(); const p=+ITEMS.prop(id,'value')||1; if(K.cash()<p)return ['skip','$'+K.cash()+' is not enough for '+NM(id)+' ($'+Math.round(p)+')']; }
      const r=seller(c,dt,()=>K.click(`[data-buy="${id}"]`)); if(r!==true)return r;
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
        const r=seller(c,dt,()=>K.click(`[data-sold="${s.id}"]`)||K.click(`[data-sell="${s.id}"]`)); if(r!==true)return r;
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
        if(!s.open){ const r=K.counter('THE PET STORE',dt,()=>{},s,/^THE ADOPTION BOOK/); if(r===null)return ['fail','could not get to the adoption book']; if(r)s.open=c.t; return; }
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
    const LIM={go:45,use:260,talk:120,buy:150,sell:150,learn:150,skill:420,pet:150,arcade:120,job:180};
    const finish=(r,why)=>{ const c=cur; cur=null; gap=1.5; tidy(); if(r==='fail'&&errs.length>c.err)why+=' · page error: '+errs[c.err];
      tally[r]=(tally[r]||0)+1; done[c.e.id]=r; keep(); out.push([c.e.id,r,String(why||'').slice(0,160),Date.now()]); if(out.length>400)out.shift(); };
    K.JOB.tests=dt=>{ const C=BOT.kit.cfg(); if(run!==String(C.run||0))start(C); if(!Q){ K.doing('making the test list'); return; }
      if(!cur){ if((gap-=dt)>0)return; const e=Q.shift(); if(!e){ K.doing('tests done: '+tally.pass+' passed, '+tally.fail+' failed, '+tally.skip+' skipped'); return; } cur={e,t:0,s:{},err:errs.length}; K.reset(); }
      const c=cur; c.t+=dt; K.doing('test '+(tally.pass+tally.fail+tally.skip+1)+' of '+(tally.pass+tally.fail+tally.skip+Q.length+1)+': '+c.e.name);
      if(!isFinite(pos.x)||pos.y<-40)return finish('fail','fell out of the world');
      if(c.t>(LIM[c.e.cat]||120))return finish('fail','ran out of time ('+(LIM[c.e.cat]||120)+' s)');
      let r; try{ r=RUN[c.e.cat](c,dt); }catch(e){ r=['fail','the game threw: '+String(e.message||e).slice(0,100)]; }
      if(Array.isArray(r))finish(r[0],r[1]); };
    BOT.results=()=>{ const o=out; out=[]; return o; };
    BOT.tally=()=>Q?{...tally,left:Q.length+(cur?1:0)}:null; }
}

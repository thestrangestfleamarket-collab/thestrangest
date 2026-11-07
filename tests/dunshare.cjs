// THE SHARED DUNGEON (owner, 7 Nov 2026: "this is an mmorpg and all things should be shared"): the dungeon's monsters are one sim (worker/dunmobs.js) run by the section's server on the website and by the page off it; the page draws them, sends its blows, is hurt and paid by message. No network: ONLINE is fed and its sends kept. node tests/dunshare.cjs [dist/market.html]
const {chromium}=require('playwright'), path=require('path');
const fails=[], ok=(c,m)=>{ if(!c){ fails.push(m); console.log((process.env.GITHUB_ACTIONS?'::error title=dunshare::':'FAIL ')+m); } else console.log('ok   '+m); };
(async()=>{ const M=await import(path.resolve(__dirname,'../worker/dunmobs.js')), S0=M.MOBSIM;
  { // the sim alone: a map of two rooms, a player in one; monsters fill the rooms, hunt the player, are struck and die, and come back later out of sight
    let sd=7; const rnd=()=>{ sd=sd*16807%2147483647; return (sd-1)/2147483646; }, S=S0.make();
    const g={v:'t',T:1,rooms:[{k:2,n:3,lane:[0,0,10,10],block:[]},{k:3,n:5,lane:[20,0,30,10],block:[]},{k:1,n:1,safe:true,lane:[40,0,50,10],block:[]}],cat:{tiers:{green:{hp:2,dmg:0,v:.9},red:{hp:7,dmg:.07,v:1.5}},mix:{3:{red:1},5:{red:1}},guards:{3:['Warrior'],5:['Warrior']},stats:{Warrior:[5,.08]},styles:{Warrior:{reach:.8}},kk:['Warrior']}};
    S0.grid(S,g);
    const by=r=>S.m.filter(m=>m.r===r).length; ok(by(2)>=3&&by(3)>=3&&by(1)===0,'every room but the safe one gets its monsters ('+by(2)+', '+by(3)+', '+by(1)+')');
    const P=[{id:'a',x:5,z:5,ok:true}]; let hurt=0; for(let i=0;i<300;i++)for(const e of S0.step(S,.1,P,rnd))if(e.to==='a')hurt+=e.d;
    ok(hurt>0,'they hunt the player in their room and their blows reach them ('+hurt.toFixed(2)+')');
    const m=S.m.find(q=>q.r===2); let r; for(let k=0;k<30&&(!r||r.res!=='dead');k++)r=S0.hit(S,m.i,{d:5,heavy:true,x:5,z:5},rnd);
    ok(r&&r.res==='dead'&&m.dead>0,'struck enough, a monster dies and says what it was ('+(r&&r.res)+')');
    const snap=S0.snap(S,new Set([2])); ok(snap.m.every(e=>e[1]===2)&&snap.m.some(e=>e[0]===m.i&&e[9]>=0),'the picture holds only the rooms asked for');
    for(let i=0;i<1300;i++)S0.step(S,.1,[{id:'a',x:25,z:5,ok:true}],rnd); ok(!S.m.some(q=>q.i===m.i)&&by(2)>=3,'out of sight, the dead come back after a while');
    const S2=S0.load(JSON.parse(JSON.stringify(S0.save(S)))); ok(S2.m.length===S.m.length&&S2.g.v==='t','kept and loaded whole'); }
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:960,height:600}}), errs=[];
  pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>DUNGEON.go(2)); await pg.waitForFunction(()=>DUNDBG().objs>0&&!DUNDBG().busy&&window.DUNMOBS&&DUNMOBS.MS.g,null,{timeout:240000}); await pg.waitForTimeout(3000);
  const A=await pg.evaluate(()=>{ const MS=DUNMOBS.MS, D=DUNMOBDBG(); return {rooms:new Set(MS.m.map(m=>m.r)).size,room:__dbg.MAPK.MODS.dungeon.room,lvl:DUNGEON.level,plan:D.plan,sl:D.slimes.length,remote:DUNMOBS.remote}; });
  ok(A.rooms>10&&A.lvl===2&&A.plan&&A.sl===A.plan.sl&&!A.remote,'off the website the page runs the dungeon\'s monsters: every room filled, yours drawn '+JSON.stringify(A));
  const K=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)), t0=DUNMOBDBG().things.length, S=DUNMOBS.slimes[0]; if(!S)return {none:true}; DUNMOBS.hit(0,99); await w(1500); return {dead:!!(DUNMOBS.MS.m.find(m=>m.i===S.i)||{}).dead,goo:DUNMOBDBG().things.length>t0}; });
  ok(K.dead&&K.goo,'your blow kills it in the sim, and the kill pays you '+JSON.stringify(K));
  // on the website: the server's word is drawn, your blows go to it, its blows and your kills come from it
  const W=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); window.__sent=[]; ONLINE.send=m=>__sent.push(m); ONLINE.on=true;
    ONLINE.feed({t:'hi',you:'m',all:[],mv:''}); await w(500); const grid=__sent.find(m=>m.t==='mobgrid'); const p=__dbg.pos(), k=__dbg.MAPK.MODS.dungeon.room;
    ONLINE.feed({t:'mobs',at:1,m:[[900,k,'s','red',p[0]+.3,p[2],0,7,7,0,0,0,0,'m']]}); await w(1200); const sl=DUNMOBDBG().slimes;
    __sent.length=0; DUNMOBS.hit(0,1); const hit=__sent.find(m=>m.t==='mobhit');
    const V=__dbg.VIT; V.hp=1; ONLINE.feed({t:'mobhurt',to:'m',d:.1,x:p[0],z:p[2],i:900}); const hurt=+(1-V.hp).toFixed(2);
    const t0=DUNMOBDBG().things.length; ONLINE.feed({t:'mobkill',i:900,w:'s',key:'red',x:p[0],z:p[2],n:2}); await w(300);
    return {grid:!!grid&&grid.g.rooms.length>10,remote:DUNMOBS.remote,sl:sl.map(s=>s.k).join(),hit:hit&&hit.i,hurt,paid:DUNMOBDBG().things.length>t0}; });
  ok(W.grid&&W.remote,'on the website the page sends the map and the monsters\' book, then draws the server\'s word '+JSON.stringify(W));
  ok(W.sl==='red'&&W.hit===900,'it draws the server\'s monsters and sends your blow on them to it');
  ok(W.hurt>0&&W.paid,'the server\'s blow hurts you; your kill pays you');
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | '));
  await b.close(); console.log(fails.length?fails.length+' FAILED':'all dunshare checks passed'); process.exit(fails.length?1:0); })();

// THE SHARED DUNGEON (owner, 7 Nov 2026): with another player in your room, the one first by id runs the monsters and sends them out; the other draws them, sends its blows back, is hurt and paid by message. No network: ONLINE is fed and its sends kept. node tests/dunshare.cjs [dist/market.html]
const {chromium}=require('playwright'), path=require('path');
const fails=[], ok=(c,m)=>{ if(!c){ fails.push(m); console.log((process.env.GITHUB_ACTIONS?'::error title=dunshare::':'FAIL ')+m); } else console.log('ok   '+m); };
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:960,height:600}}), errs=[];
  pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>DUNGEON.go(2)); await pg.waitForFunction(()=>DUNDBG().objs>0&&!DUNDBG().busy&&DUNMOBDBG().level>0,null,{timeout:240000}); await pg.waitForTimeout(3000);
  const one=await pg.evaluate(()=>({room:DUNDBG().room,rooms:__dbg.MAPK.MODS.dungeon.rooms.length,lvl:DUNGEON.level}));
  ok(one.room>1&&one.rooms>20&&one.lvl===2,'the dungeon is one map of rooms; DUNGEON.go(2) puts you in a room of danger 2 '+JSON.stringify(one));
  // another player, first by id, in your room: they host; you draw what they send
  const P=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); window.__sent=[]; ONLINE.send=m=>__sent.push(m); ONLINE.on=true; const p=__dbg.pos();
    ONLINE.feed({t:'hi',you:'m',all:[{id:'a',name:'ROSA',look:'w00',at:[p[0]+1,p[2],SHARED.py,0,'down','']}]}); await w(1500);
    ONLINE.feed({t:'mob',id:'a',k:'s',r:__dbg.MAPK.MODS.dungeon.room,a:[[p[0]/DUNMOBS.T+2,p[2]/DUNMOBS.T,0,3,0,'green',0],[p[0]/DUNMOBS.T-2,p[2]/DUNMOBS.T,0,5,0,'blue',0]],b:[]}); await w(600);
    const sl=DUNMOBDBG().slimes; __sent.length=0; DUNMOBS.hit(0,0); await w(300);
    return {n:sl.length,ks:sl.map(s=>s.k),res:DUNMOBDBG().res.length}; });
  ok(P.n===2&&P.ks.join()==='green,blue'&&P.res===0,'a player first by id runs the room: its monsters replace yours '+JSON.stringify(P));
  const H=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)), V=__dbg.VIT; V.hp=1; ONLINE.feed({t:'mob',id:'a',k:'hurt',to:'m',r:__dbg.MAPK.MODS.dungeon.room,d:.1,x:0,z:0}); const hurt=+(1-V.hp).toFixed(2);
    const c0=INV.cash, t0=DUNMOBDBG().things.length; ONLINE.feed({t:'mob',id:'a',k:'kill',to:'m',r:__dbg.MAPK.MODS.dungeon.room,w:'s',tk:'green',x:__dbg.pos()[0]/DUNMOBS.T,z:__dbg.pos()[2]/DUNMOBS.T}); await w(300);
    return {hurt,goo:DUNMOBDBG().things.length>t0}; });
  ok(H.hurt>0&&H.goo,'their monster hurts you by message; your kill pays you (the slime to scoop) '+JSON.stringify(H));
  // the other player last by id: you host and send the room out
  const S=await pg.evaluate(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); ONLINE.feed({t:'out',id:'a'}); const p=__dbg.pos(); __sent.length=0;
    ONLINE.feed({t:'in',p:{id:'z',name:'ZED',look:'w00',at:[p[0]+1,p[2],SHARED.py,0,'down','']}}); for(let i=0;i<20&&!__sent.some(m=>m.t==='mob'&&m.k==='s');i++){ ONLINE.feed({t:'mv',id:'z',at:[p[0]+1,p[2],SHARED.py,0,'down','']}); await w(1000); }
    const snaps=__sent.filter(m=>m.t==='mob'&&m.k==='s'); return {snaps:snaps.length,room:snaps.length?snaps[0].r:null,me:__dbg.MAPK.MODS.dungeon.room}; });
  ok(S.snaps>0&&S.room===S.me,'first by id, you run the room and send it out '+JSON.stringify(S));
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | '));
  await b.close(); console.log(fails.length?fails.length+' FAILED':'all dunshare checks passed'); process.exit(fails.length?1:0); })();

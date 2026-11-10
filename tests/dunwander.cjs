// A bot on WANDER in the dungeon explores it (8 Nov 2026): it walks on to other rooms instead of standing about.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  const pg=await b.newPage({viewport:{width:960,height:600}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&bot=1&hour=11&place=THE%20DUNGEON',{timeout:300000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.waitForFunction(()=>SHARED.LVL==='down'&&window.DUNROOMS&&DUNROOMS()[1].torches>0,null,{timeout:300000,polling:1000}); await pg.waitForTimeout(2000);
  await pg.evaluate(()=>BOT.set({job:'wander',name:'W'})); const p0=await pg.evaluate(()=>__dbg.pos()), seen=new Set(); let far=0;
  for(let i=0;i<30;i++){ await pg.waitForTimeout(3000); const s=await pg.evaluate(()=>({p:__dbg.pos(),d:BOT.status().doing,room:(SHARED.LVL==='down'&&LEVELS.of.dungeon.label())})); seen.add(s.room); far=Math.max(far,Math.hypot(s.p[0]-p0[0],s.p[2]-p0[2])); if(seen.size>=3&&far>15)break; }
  ok(seen.size>=3,'it went through three rooms or more: '+[...seen].join(' / ')); ok(far>15,'and far from where it started ('+far.toFixed(1)+')');
  ok(!Object.keys(errs).length,'no page errors '+Object.keys(errs).join(' | ')); await b.close(); process.exit(bad?1:0); })();

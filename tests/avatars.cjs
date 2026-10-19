const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'.', b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  for(const k of (process.argv[3]||'walker,mannequin,vroid').split(',')){ const pg=await b.newPage({viewport:{width:900,height:620}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; });
    await pg.goto('file://'+process.cwd()+'/dist/market.html?at=0,3&hour=13&fresh=1&npcwait=99&avatar='+k,{timeout:180000});
    await pg.waitForFunction(()=>window.AVSDBG&&AVSDBG().ready,null,{timeout:300000}).catch(()=>{});
    await pg.waitForTimeout(4000); await pg.evaluate(()=>{ hud.hidden=true; stat.hidden=true; });
    await pg.screenshot({path:out+'/av-'+k+'-stand.png'}); const a=await pg.evaluate(()=>AVSDBG());
    await pg.keyboard.down('w'); await pg.waitForTimeout(2500); await pg.screenshot({path:out+'/av-'+k+'-walk.png'}); const w=await pg.evaluate(()=>AVSDBG()); await pg.keyboard.up('w');
    console.log(k,JSON.stringify(a),JSON.stringify(w),'errors',JSON.stringify(errs)); await pg.close(); }
  await b.close(); })();

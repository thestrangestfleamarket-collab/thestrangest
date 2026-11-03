// THE MERCHANT, PLAYABLE: node tests/merchant.cjs [out.png]: YOU's BODY row has WALKER and MERCHANT; picking MERCHANT wears it (your rig moves it), it is kept, and WALKER puts you back; no page error.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:700}}); let bad=0; const errs=[];
  pg.on('pageerror',e=>errs.push(e.message)); const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13',{timeout:240000}); await pg.waitForFunction(()=>window.__started&&window.BODIES&&BODIES.by.merchant,null,{timeout:300000});
  ok(await pg.evaluate(()=>!!document.getElementById('lbody-walker')&&!!document.getElementById('lbody-merchant')),'YOU\'s BODY row has WALKER and MERCHANT');
  await pg.evaluate(()=>document.getElementById('lbody-merchant').click()); await pg.waitForTimeout(1500);
  ok(await pg.evaluate(()=>BODIES.pick()==='merchant'&&W3.body.on),'picking MERCHANT wears it');
  ok(await pg.evaluate(()=>document.getElementById('lbody-merchant').getAttribute('aria-pressed')==='true'),'the row shows it picked');
  if(process.argv[2])await pg.screenshot({path:process.argv[2]});
  await pg.evaluate(()=>BODIES.set('walker')); await pg.waitForTimeout(500); ok(await pg.evaluate(()=>BODIES.pick()==='walker'),'WALKER puts you back');
  ok(!errs.length,'no page errors '+errs.slice(0,2).join(' | '));
  await b.close(); process.exit(bad?1:0); })();

// the skeletons on the far sidewalk: close looks at each (?at= beside him, zoomed in), the WebGL errors if any, their state
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const out=process.argv[2]||'.';
  const at={warrior:'-14.6,15.4',mage:'-3.5,15.4',minion:'12.5,15.4',rogue:'26.5,15.4'}, seen=new Set();
  for(const [k,a] of Object.entries(at)){ const pg=await b.newPage({viewport:{width:900,height:620}}); pg.on('pageerror',e=>console.log(k,'pageerror:',e.message)); pg.on('console',m=>{ const t=m.text(); if((m.type()==='error'||m.type()==='warning')&&!seen.has(t.slice(0,60))){ seen.add(t.slice(0,60)); console.log(m.type(),t.slice(0,200)); } });
    await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+a+'&npcwait=0.5'); await pg.waitForTimeout(22000); await pg.keyboard.press('h');
    for(let i=0;i<3;i++){ await pg.mouse.move(450,310); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(200); } await pg.waitForTimeout(5000); await pg.screenshot({path:out+'/skel-'+k+'.png'});
    if(k==='warrior'){ await pg.keyboard.down('q'); await pg.waitForTimeout(1500); await pg.keyboard.up('q'); await pg.waitForTimeout(3000); await pg.screenshot({path:out+'/skel-'+k+'-turned.png'}); }
    console.log(k,await pg.textContent('#stat'),JSON.stringify(await pg.evaluate(()=>window.SKELDBG&&window.SKELDBG().find(s=>s.key===location.search.match(/at=([-\d.]+)/)&&null)||window.SKELDBG()))); await pg.close(); }
  await b.close(); })();

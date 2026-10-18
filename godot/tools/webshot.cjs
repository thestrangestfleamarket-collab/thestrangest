// The Godot test's web build in a browser, as a player gets it: node godot/tools/webshot.cjs <url> <out.png> [w] [h] [keys held, as "a" or "d,Shift"] [ms held]
// (pictures of the loading line and of the first frame; the page's errors printed)
const {chromium}=require('playwright');
(async()=>{ const [url,out,w='800',h='600',hold='',ms='1500']=process.argv.slice(2);
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:+w,height:+h}});
  pg.on('pageerror',e=>console.log('page error:',e.message)); pg.on('console',m=>{ if(m.type()==='error'||/ERROR|SCRIPT|SHADER/.test(m.text()))console.log('console:',m.text().slice(0,300)); });
  const t0=Date.now(); await pg.goto(url); await pg.waitForTimeout(300); await pg.screenshot({path:out.replace(/\.png$/,'-loading.png')});
  await pg.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:240000}); console.log('first picture after',((Date.now()-t0)/1000).toFixed(1),'s');
  await pg.waitForTimeout(2500);
  if(hold){ const ks=hold.split(','); await pg.click('canvas'); for(const k of ks)await pg.keyboard.down(k); await pg.waitForTimeout(+ms); for(const k of ks)await pg.keyboard.up(k); await pg.waitForTimeout(300); }
  await pg.screenshot({path:out}); await b.close(); })();

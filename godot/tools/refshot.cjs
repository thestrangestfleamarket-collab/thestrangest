// A picture of THE MARKET (three.js) to set beside the Godot test's: node godot/tools/refshot.cjs <x,z> <out.png> [hour] [w] [h]
// (the characters out of the picture: the Godot test has only the Walker and the bodega)
const {chromium}=require('playwright'), path=require('path');
(async()=>{ let [at,out,hour='15.5',w='800',h='600']=process.argv.slice(2), ROOT=path.resolve(__dirname,'../..');
  const zoom=process.env.ZOOM;
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:+w,height:+h}});
  pg.on('pageerror',e=>console.log('page error:',e.message));
  await pg.goto('file://'+ROOT+'/dist/'+(process.env.PAGE||'market.html')+'?hour='+hour+'&fresh=1&at='+at+'&walkers=0&trees=0',{timeout:180000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:240000});
  await pg.evaluate(()=>{ const hide=()=>{ for(const N of __dbg.NPCS)if(N.g)N.g.visible=false; requestAnimationFrame(hide); }; hide(); });
  await pg.evaluate(()=>new Promise(r=>{ let n=0; const f=()=>{ if(++n>=40)r(); else requestAnimationFrame(f); }; f(); }));   // (forty frames: the lamps are picked four times a second of the game's own clock)
  await pg.screenshot({path:out}); console.log('pos',await pg.evaluate(()=>__dbg.pos())); await b.close(); })();

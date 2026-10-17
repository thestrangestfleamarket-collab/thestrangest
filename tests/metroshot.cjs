// THE METRO (owner, 17 Oct 2026): the subway from the Metro_PSX kit, looked at: the opening in the sidewalk from the street, the platform from
// above (the isometric view), the corridor down, the platform from his eyes (V twice), the train leaving (?set=... no: its own clock, ?train=leave)
// Run: node tests/metroshot.cjs [out-dir]   (slow in a cloud container: software rendering)
const {chromium}=require('playwright'), fs=require('fs'); const out=process.argv[2]||'.';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const X0=(62-72)*(33.9/30)+1.15*76.25, Z0=(-72+77)*(33.9/30)-1.15*28.4, K=(kx,kz)=>[X0-1.15*kz,Z0+1.15*kx], Y=ky=>1.15*(ky-11.55)-.03;
  const shots=[['opening',K(29.6,76.25).join(',')+',0',[]],['platform',K(15,30).join(',')+','+Y(1.4),[]],['corridor',K(13.7,68).join(',')+','+Y(5.59),[]],['eyes',K(15,30).join(',')+','+Y(1.4),['v','v']],['gates',K(14,47).join(',')+','+Y(1.4),['v','v']]];
  for(const [n,at,keys] of shots){ const pg=await b.newPage({viewport:{width:1000,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
    await pg.goto('file://'+process.cwd()+'/dist/market.html?at='+at+'&hour=14'); await pg.waitForTimeout(26000); for(const k of keys){ await pg.keyboard.press(k); await pg.waitForTimeout(400); }
    await pg.waitForTimeout(1500); await pg.screenshot({path:out+'/metro-'+n+'.png'}); const dbg=await pg.evaluate(()=>{ const dbg=window.MAPDBG?MAPDBG():null; const st=document.querySelector('#stat'); return {dbg,stat:st&&st.textContent,tr:window.METRO&&METRO.train&&METRO.train.state,lamps:window.LITE&&LITE.sel.length}; });
    console.log(n,JSON.stringify(dbg),errs.length?'ERRORS: '+errs.join(' | '):''); await pg.close(); }
  await b.close(); })();

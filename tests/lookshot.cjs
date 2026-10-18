// A LOOK ANYWHERE: node tests/lookshot.cjs <out-prefix> "<query>" '<js to run, then a shot>' ['<js>' ...]: the page opened with the query, each
// step's script run in the page (UI.goTo, CAMAT, yaw ...), a moment, then a shot <out-prefix>-<n>.png; the page's errors listed at the end
const {chromium}=require('playwright');
(async()=>{ const [out,q='',...steps]=process.argv.slice(2), W=+(process.env.W||1095), H=+(process.env.H||765); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:W,height:H}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message+' | '+(e.stack||'').split('\n').slice(1,4).join(' ').slice(0,400)]=1; }); pg.on('console',m=>{ if(m.type()==='error'||/LOOK/.test(m.text()))errs['console: '+m.text().slice(0,300)]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&'+q,{timeout:240000}); await pg.waitForTimeout(+(process.env.WAIT||26000));
  if(process.env.CLICK){ await pg.mouse.click(W/2,H/2); await pg.waitForTimeout(500); }
  let i=0; for(const s of steps){ if(s.startsWith('KEY:')){ for(const k of s.slice(4))await pg.keyboard.press(k); await pg.waitForTimeout(+(process.env.STEP||6000)); await pg.screenshot({path:out+'-'+(i++)+'.png'}); continue; }
    const r=await pg.evaluate(s).catch(e=>'ERR '+e.message); if(r!==undefined)console.log('step',i,JSON.stringify(r).slice(0,600)); await pg.waitForTimeout(+(process.env.STEP||6000)); await pg.screenshot({path:out+'-'+(i++)+'.png'}); }
  console.log('errors',Object.keys(errs)); await b.close(); })();

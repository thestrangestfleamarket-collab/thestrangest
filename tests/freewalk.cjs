// RUNNING FREELY IN AND OUT OF ROOMS (owner, 18 Oct 2026: "lets take off any preloading rules or hiding rules ... let me freely run around n and
// out of rooms"): node tests/freewalk.cjs <out> [query]: from the street into the bodega's shop and out again, the longest freeze (long tasks) of
// each step and the frame time over it; a picture inside (<out>-in.png). `?free=0` as the query for the old rules
const {chromium}=require('playwright');
(async()=>{ const [out,q='']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1000,height:700}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=14&'+q,{timeout:180000}); await pg.waitForTimeout(26000);
  await pg.evaluate(()=>{ window.__LT=[]; new PerformanceObserver(l=>{ for(const e of l.getEntries())__LT.push(e.duration); }).observe({entryTypes:['longtask']}); });
  const step=async(name,fn)=>{ await pg.evaluate(()=>{ __LT.length=0; window.__F=0; window.__T0=performance.now(); const f=()=>{ __F++; if(performance.now()-__T0<6000)requestAnimationFrame(f); }; requestAnimationFrame(f); }); await pg.evaluate(fn); await pg.waitForTimeout(6500);
    const r=await pg.evaluate(()=>({longest:Math.round(Math.max(0,...__LT)),tasks:__LT.length,fps:+(__F/6).toFixed(1),room:!!ROOMS.cur})); console.log(name,JSON.stringify(r)); };
  const P=await pg.evaluate(()=>{ const p=__UI.places(); return {shop:p.find(x=>x[0]==='THE BODEGA'),bod:p.find(x=>x[0]==='THE BODEGA')}; });
  await step('street',()=>{});
  await step('into the shop',new Function(`STORE.pos.set(${P.shop[1]},0,${P.shop[2]});`));
  await pg.screenshot({path:out+'-in.png'});
  await step('out again',new Function(`STORE.pos.set(${P.bod[1]},0,${P.bod[2]});`));
  await step('in again',new Function(`STORE.pos.set(${P.shop[1]},0,${P.shop[2]});`));
  console.log('errors',Object.keys(errs)); await b.close(); })();

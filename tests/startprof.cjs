// THE START AND THE PARK, WHAT THEY COST (19 Oct 2026): node tests/startprof.cjs <out.json> [page]
// The page's long tasks from the first byte to the game starting (and after), the time to start, then 12 s of frames at the start and
// 12 s in the park's south-west, once the park is built (PARK.ready: its code comes in a chunk, and sampling before it arrived read a half-built park) (frame times from the frames that rendered, by the renderer's frame counter: a frame that returned early is not a frame) (between the castle, the cave and the moon shrine); with the profiling copy (tools/perfprof.py) each
// system's share of a frame there, and the renderer's draws and triangles on screen (counted after the sample with shadow redraws paused for five frames, the median of the
// last three: the lamp's cube shadow redraws every other frame and the town's still shadow map now and then, so a frame swings by 2x).
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'startprof.json', PAGE=path.resolve(process.argv[3]||path.resolve(__dirname,'../dist/market-prof.html'));
(async()=>{ fs.mkdirSync(path.dirname(path.resolve(OUT)),{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1280,height:720}}); pg.setDefaultTimeout(900000); const errs=[];
  pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  await pg.addInitScript(()=>{ window.FLATLOG={}; window.__LT=[]; try{ new PerformanceObserver(l=>{ for(const e of l.getEntries())window.__LT.push([Math.round(e.startTime),Math.round(e.duration)]); }).observe({type:'longtask',buffered:true}); }catch(e){} });
  const t0=Date.now(); await pg.goto('file://'+PAGE+'?fresh=1&hour=13',{waitUntil:'commit'});
  let started=null; for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__started)){ started=Date.now()-t0; break; } }
  const rep={page:path.basename(PAGE),startMs:started,errs};
  const sample=async(name,go)=>{ await pg.evaluate(()=>{ if(window.BATCH&&BATCH.queues)for(const q of BATCH.queues)q.near(0,0,Infinity); else if(window.BODB&&BODB.gnear)BODB.gnear(0,0,Infinity); }); if(go)await pg.evaluate(go); await pg.waitForTimeout(go?15000:4000);
    if(go)await pg.waitForFunction(()=>!window.PARK||PARK.ready,null,{polling:500,timeout:600000}).catch(()=>{});
    const r=await pg.evaluate(()=>new Promise(res=>{ const d=[], s0=performance.now(); let l=performance.now(); const h0=window.__PF?__PF.hist.length:0;
      const IN=[]; const f=()=>{ const n=performance.now(); d.push(n-l); l=n; if(window.__R){ const I=__R.renderer.info.render; IN.push([I.calls,I.triangles,I.frame]); } if(n-s0<12000)requestAnimationFrame(f); else {
        const st={}; if(window.__PF){ const H=__PF.hist.slice(-Math.min(__PF.hist.length,d.length)); for(const fr of H)for(const k in fr)(st[k]=st[k]||[]).push(fr[k]); }
        const med=a=>{ const s=[...a].sort((x,y)=>x-y); return +s[Math.floor(s.length/2)].toFixed(2); }, p95=a=>{ const s=[...a].sort((x,y)=>x-y); return +s[Math.floor(s.length*.95)].toFixed(2); };
        const sys=Object.fromEntries(Object.entries(st).map(([k,v])=>[k,{med:med(v),p95:p95(v),max:+Math.max(...v).toFixed(1)}]).sort((a,b)=>b[1].med-a[1].med));
        const R=window.__R, avg=k=>{ if(!IN.length)return null; const F=IN.filter(x=>x[1]>0); if(!F.length)return null; let lo=0; for(let i=1;i<F.length;i++)if(F[i][1]<F[lo][1])lo=i; return F[lo][k]; }, info=R?{calls:avg(0),tris:avg(1),programs:R.renderer.info.programs.length,geos:R.renderer.info.memory.geometries,tex:R.renderer.info.memory.textures}:null;
        let dd=IN.length===d.length?d.filter((x,i)=>i>0&&IN[i][2]!==IN[i-1][2]):d; if(!dd.length)dd=d;
        const fin=onScreen=>{ if(info&&onScreen){ info.calls=onScreen[0]; info.tris=onScreen[1]; } res({frames:d.length,drawn:dd.length,dtMed:med(dd),dtP95:p95(dd),dtMax:+Math.max(...dd).toFixed(1),over100:dd.filter(x=>x>100).length,sys,info}); };
        if(!R)return fin(null); const SM=R.renderer.shadowMap, au=SM.autoUpdate; SM.autoUpdate=false; Object.defineProperty(SM,'needsUpdate',{get:()=>false,set(){},configurable:true}); const S=[];
        const g=()=>{ const I=R.renderer.info.render; S.push([I.calls,I.triangles]); if(S.length<5)return requestAnimationFrame(g); delete SM.needsUpdate; SM.needsUpdate=true; SM.autoUpdate=au;
          const L=S.slice(2).sort((a,b)=>a[1]-b[1]); fin(L[1]); }; requestAnimationFrame(g); } };
      requestAnimationFrame(f); }));
    rep[name]=r; };
  rep.batch=await pg.evaluate(()=>(window.BATCH&&BATCH.log||[]).map(b=>({faces:b.faces,pages:b.pages,atlas:b.atlas})));
  rep.flats=await pg.evaluate(()=>Object.entries(window.FLATLOG||{}).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>[Math.round(v/1e6*10)/10+'Mpx',k]));
  rep.sun=await pg.evaluate(()=>window.SUNDBG?SUNDBG():null);
  await sample('start');
  await sample('parkSW',()=>{ const P=__dbg.MAPK.PARK, B=__dbg.MAPK.BOD; __dbg.UI.goTo(B.XS(P.x0+(P.round[0]-P.x0)*.45+(P.ox||0)),B.ZS(P.round[1]+(P.round[1]-P.y0)*-.35+(P.oy||0)),'up'); });
  rep.sun2=await pg.evaluate(()=>window.SUNDBG?SUNDBG():null);
  rep.longTasks=await pg.evaluate(()=>window.__LT.sort((a,b)=>b[1]-a[1]).slice(0,40));
  rep.longTotal=await pg.evaluate(()=>window.__LT.reduce((a,x)=>a+x[1],0));
  await pg.screenshot({path:OUT.replace(/\.json$/,'')+'-park.png'});
  fs.writeFileSync(OUT,JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep,null,1)); await b.close(); })();

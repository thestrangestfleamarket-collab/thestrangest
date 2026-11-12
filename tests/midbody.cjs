// THE MIDDLE BODIES (owner, 11 Nov 2026: "do 3"): at the owner's Market St spot, every townsperson past NPCS.MID and short of the far boxes is drawn with its simplified body, every one nearer with its whole one; prints the triangles that saves. node tests/midbody.cjs
const {chromium}=require('playwright');
const SPOT='S1eyJ4Ijo1OS4wNiwieiI6MzIuODgsInkiOjAsImgiOjAsImx2IjoidXAiLCJ2IjoidGhpcmQiLCJ5dyI6MS42NzI4LCJwdCI6MC4wMDgsInBwIjoyMi41LCJkIjo0Ljk3LCJmeiI6MSwib2YiOlswLDAsMF0sInNlYyI6IkEiLCJociI6MTIuNTksInd4IjoiQ0xFQVIiLCJpbiI6IiIsImx2bCI6InVwIn0';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:800,height:500}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?spot='+SPOT,{waitUntil:'commit',timeout:180000});
  for(let i=0;i<200&&!(await pg.evaluate(()=>!!window.__started&&!!window.MIDB).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(20000);
  // (the simplifier comes from the CDN on first need; in software rendering that can take most of a minute)
  console.log('simplifier',await pg.evaluate(async()=>{ const t=performance.now(); try{ const m=await import('https://cdn.jsdelivr.net/npm/meshoptimizer@1.2.0/meshopt_simplifier.js'); await m.MeshoptSimplifier.ready; return 'ok '+Math.round(performance.now()-t); }catch(e){ return 'err '+e.message; } })); await pg.waitForTimeout(3000);
  const r=await pg.evaluate(()=>{ const D=__dbg, L=D.NPCS.concat(D.NPCS.extra), Y=D.you(), R=D.NPCS.MID*(SHARED.lodK||1); let near=0, mid=0, bad=[], whole=0, now=0;
    for(const N of L){ if(!N||!N.g||N.lod||N.sheet)continue; const a=N.st||N.at||N.g.position, d=Math.hypot(a.x-Y.x,a.z-Y.z); N.g.traverse(o=>{ if(!o.isMesh||!o.userData.PM||!o.geometry.index)return; const g=o.geometry, n=g.index.count/3; if(n<1500)return;
        const isMid=!!g.userData.mid; if(d>R+2){ mid++; if(!isMid)bad.push(N.key+' far but whole'); } else if(d<R-2){ near++; if(isMid)bad.push(N.key+' near but simplified'); } }); }
    return {on:MIDB.on,lib:!!MIDB.lib(),near,mid,bad,made:MIDB.made,saved:Math.round(MIDB.saved),R:R/(33.9/22.5)}; });
  console.log(JSON.stringify(r)); const ok=!errs.length&&r.made>0&&r.mid>0&&!r.bad.length; console.log(ok?'ok   middle bodies past '+Math.round(r.R)+' tiles, whole ones nearer':'FAIL '+JSON.stringify({errs:errs.slice(0,3),bad:r.bad}));
  await b.close(); process.exit(ok?0:1); })();

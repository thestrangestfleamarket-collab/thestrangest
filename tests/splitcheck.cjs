const {chromium}=require('playwright'), {spawn}=require('child_process'), fs=require('fs'), path=require('path'), zlib=require('zlib');
const [mode, root, outf, tourArg]=process.argv.slice(2), ROOT=path.resolve(root), OUT=path.dirname(outf);
const PORT=8790+Math.floor(Math.random()*9), BASE='http://127.0.0.1:'+PORT, rep={mode,root,errors:[],tour:[]};
const fin=c=>{ fs.writeFileSync(outf,JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,6000)); process.exit(c); };
const TOUR={
  dungeon:{go:async()=>{ await DUNGEON.go(1); await new Promise(r=>setTimeout(r,4000)); return DUNDBG(); },back:async()=>{ await DUNGEON.go(0); }},
  dungeon3:{go:async()=>{ await DUNGEON.go(3); await new Promise(r=>setTimeout(r,6000)); return {d:DUNDBG(),m:window.DUNMOBDBG&&DUNMOBDBG()}; },back:async()=>{ await DUNGEON.go(0); }},
  park:{go:async()=>{ const B=__dbg.MAPK.BOD, P=PARK; STORE.goTo(B.XS(P.round[0]+(P.ox||0)+3),B.ZS(P.round[1]+(P.oy||0)+3),'up'); for(let i=0;i<120&&!PARK.ready;i++)await new Promise(r=>setTimeout(r,500)); await new Promise(r=>setTimeout(r,4000)); return {p:PARKPLACE(),f:!!FOUNT.drops}; },back:async()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); await new Promise(r=>setTimeout(r,3000)); }},
  dojo:{go:async()=>{ DOJO.enter(); for(let i=0;i<60&&!DOJO.built;i++)await new Promise(r=>setTimeout(r,500)); await new Promise(r=>setTimeout(r,3000)); return {built:DOJO.built,ninja:window.DOJONINJA&&DOJONINJA()}; },back:async()=>{ DOJO.leave(); await new Promise(r=>setTimeout(r,3000)); }},
  fire:{go:async()=>{ FIREV.out(); for(let i=0;i<60&&!FIREV.built;i++)await new Promise(r=>setTimeout(r,500)); await new Promise(r=>setTimeout(r,3000)); return FIREDBG(); },back:async()=>{ FIREV.back(); await new Promise(r=>setTimeout(r,3000)); }},
  club:{go:async()=>{ await UI.goPlace('CLUB STATIC'); await new Promise(r=>setTimeout(r,6000)); return CLUBDBG(); },back:async()=>{}},
  arcade:{go:async()=>{ await UI.goPlace('THE ARCADE'); await new Promise(r=>setTimeout(r,3000)); await STORE.enter('arcade',true); await new Promise(r=>setTimeout(r,4000)); return INTDBG(); },back:async()=>{}},
  vcr:{go:async()=>{ await UI.goPlace('VCR REPAIR'); await new Promise(r=>setTimeout(r,5000)); return Object.keys(STORE.off).filter(k=>STORE.off[k].done); },back:async()=>{}},
  bath:{go:async()=>{ const M=__dbg.MAPK, G=M.BOD.GD, r=G.r; STORE.goTo(M.BOD.X((r[0]+r[2])/2),M.BOD.Z((r[1]+r[3])/2),'up'); await new Promise(r=>setTimeout(r,7000)); return {inside:G.inside(),int:INTDBG()}; },back:async()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); await new Promise(r=>setTimeout(r,3000)); }},
};
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  let w=null, url;
  if(mode==='site'){
    w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{cwd:ROOT,stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
    let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
    let up=false; for(let i=0;i<120&&!up;i++){ await new Promise(r=>setTimeout(r,1000)); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
    if(!up){ rep.errors.push('worker never started '+log.slice(-2000)); fin(1); }
    url=BASE+'/?fresh=1&hour=13&wx=CLEAR';
  } else url='file://'+path.join(ROOT,'dist/market.html')+'?fresh=1&hour=13&wx=CLEAR';
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const ctx=await b.newContext({viewport:{width:960,height:540}});
  if(mode==='site')await ctx.addCookies([{name:'tsfm-pass',value:'dev:site-check',url:BASE}]);
  const pg=await ctx.newPage(); pg.setDefaultTimeout(900000);
  pg.on('pageerror',e=>rep.errors.push(e.message.slice(0,400))); pg.on('console',m=>{ if((m.type()==='error'&&!/URL scheme "file"/.test(m.text()))||/not loaded before use/.test(m.text()))rep.errors.push('console: '+m.text().slice(0,300)); });
  const req=[]; let phase='start'; pg.on('request',r=>req.push({u:r.url(),phase}));
  let cdp=null; const SRC={}; if(process.env.COV){ cdp=await ctx.newCDPSession(pg); await cdp.send('Debugger.enable'); cdp.on('Debugger.scriptParsed',e=>{ if(e.length>500000)SRC[e.scriptId]=1; }); await cdp.send('Profiler.enable'); await cdp.send('Profiler.startPreciseCoverage',{callCount:true,detailed:false}); }
  const snap=async()=>{ const r=await cdp.send('Profiler.takePreciseCoverage'); const o={}; for(const s of r.result)if(SRC[s.scriptId])for(const f of s.functions){ const g=f.ranges[0]; o[s.scriptId+':'+g.startOffset+':'+g.endOffset]=(o[s.scriptId+':'+g.startOffset+':'+g.endOffset]||0)+g.count; } return o; };
  const t0=Date.now(); await pg.goto(url,{waitUntil:'commit',timeout:600000});
  let ok=false; for(let i=0;i<3000&&!(ok=await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(200);
  rep.started=ok; rep.startMs=Date.now()-t0; rep.pageStart=await pg.evaluate(()=>({now:Math.round(performance.now()),warm:window.WARMMS})).catch(()=>null);
  if(process.env.COV){ const A=await snap(); await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); }); await pg.waitForTimeout(15000); const Bs=await snap(), L=[];
    for(const id in SRC){ const src=(await cdp.send('Debugger.getScriptSource',{scriptId:id})).scriptSource; const F=[];
      for(const k of new Set([...Object.keys(A),...Object.keys(Bs)])){ const [sid,a,b]=k.split(':'); if(sid!==id)continue; F.push({a:+a,b:+b,c:(A[k]||0)+(Bs[k]||0)}); }
      F.sort((x,y)=>x.a-y.a||y.b-x.b); let end=-1;
      for(const f of F){ if(f.c||f.b-f.a<300||f.a<end)continue; end=f.b; L.push({n:f.b-f.a,s:src.slice(f.a,f.a+200),pre:src.slice(Math.max(0,f.a-80),f.a)}); } }
    fs.writeFileSync(path.join(OUT,'cov.json'),JSON.stringify(L)); rep.cov={n:L.length,bytes:L.reduce((a,x)=>a+x.n,0)}; }
  phase='after'; await pg.waitForTimeout(8000);
  const files=f=>{ const u=new URL(f.u); if(!u.pathname.startsWith('/g/'))return null; const p=path.join(ROOT,'dist',u.pathname); if(!fs.existsSync(p))return null; const d=fs.readFileSync(p); return {f:u.pathname.slice(3),raw:d.length,gz:p.endsWith('.bin')?d.length:zlib.gzipSync(d,{level:9}).length}; };
  const sum=ph=>{ const L=[...new Set(req.filter(r=>r.phase===ph).map(r=>r.u))].map(u=>files({u})).filter(Boolean); return {files:L,raw:L.reduce((a,x)=>a+x.raw,0),gz:L.reduce((a,x)=>a+x.gz,0)}; };
  if(mode==='site'){ rep.start=sum('start'); rep.after=sum('after'); }
  for(const k of (tourArg||'').split(',').filter(Boolean)){
    phase=k; const e0=rep.errors.length;
    const r=await pg.evaluate(`(${TOUR[k].go})()`).catch(e=>'ERR '+e.message);
    await pg.screenshot({path:path.join(OUT,mode+'-'+k+'.png')});
    await pg.evaluate(`(${TOUR[k].back})()`).catch(e=>rep.errors.push(k+' back: '+e.message));
    await pg.waitForTimeout(1500);
    rep.tour.push({k,r,errors:rep.errors.slice(e0),fetched:mode==='site'?sum(k).files.map(f=>f.f):null});
  }
  await b.close(); if(w)w.kill(); fin(rep.started&&!rep.errors.length?0:1);
})().catch(e=>{ rep.errors.push('TEST '+e.message); fin(1); });

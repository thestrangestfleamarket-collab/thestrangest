// THE PLACES' CODE (20 Oct 2026, the code split): runs the website's own worker (wrangler dev) on dist/, logs in, and checks that THE
// MARKET starts with only its start code, then goes into every place whose code is its own file (dungeon, park, dojo, fire escape, club,
// arcade, VCR repair, bath house), and back. Each must fetch its file, build, and never fall back to a slow fetch ("was not loaded before
// use"); then a saved spot inside the dungeon must load the dungeon's code at the start. Prints the start's download (gzipped).
// node tests/places.cjs [out dir]. Exits 1 if anything fails.
const {chromium}=require('playwright'), {spawn}=require('child_process'), fs=require('fs'), path=require('path'), zlib=require('zlib');
const OUT=process.argv[2]||'out', PORT=8797, BASE='http://127.0.0.1:'+PORT;
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const TOUR=[
  ['dungeon','x-dungeon',async()=>{ await DUNGEON.go(3); await new Promise(r=>setTimeout(r,6000)); const d=DUNDBG(), m=DUNMOBDBG(); return d.level===3&&d.objs>0&&m.slimes.length>0; },async()=>{ await DUNGEON.go(0); }],
  ['park','x-park',async()=>{ const B=__dbg.MAPK.BOD, P=PARK; STORE.goTo(B.XS(P.round[0]+(P.ox||0)+3),B.ZS(P.round[1]+(P.oy||0)+3),'up'); for(let i=0;i<120&&!PARK.ready;i++)await new Promise(r=>setTimeout(r,500)); await new Promise(r=>setTimeout(r,3000)); return PARK.ready&&PARK.in&&!!FOUNT.drops; },async()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); await new Promise(r=>setTimeout(r,3000)); }],
  ['dojo','x-dojo',async()=>{ DOJO.enter(); for(let i=0;i<60&&!DOJO.built;i++)await new Promise(r=>setTimeout(r,500)); await new Promise(r=>setTimeout(r,3000)); return DOJO.built&&!!DOJONINJA(); },async()=>{ DOJO.leave(); await new Promise(r=>setTimeout(r,3000)); }],
  ['fire escape','x-fire',async()=>{ FIREV.out(); for(let i=0;i<60&&!FIREV.built;i++)await new Promise(r=>setTimeout(r,500)); await new Promise(r=>setTimeout(r,3000)); return FIREDBG().built; },async()=>{ FIREV.back(); await new Promise(r=>setTimeout(r,3000)); }],
  ['club','x-club',async()=>{ await __dbg.ui().goPlace('CLUB STATIC'); await new Promise(r=>setTimeout(r,6000)); return CLUBDBG().ready; },async()=>{}],
  ['arcade','x-arcade',async()=>{ await __dbg.ui().goPlace('THE ARCADE'); await new Promise(r=>setTimeout(r,3000)); await STORE.enter('arcade',true); await new Promise(r=>setTimeout(r,4000)); return INTDBG().built.includes('arcade'); },async()=>{}],
  ['vcr repair','x-vcr',async()=>{ await __dbg.ui().goPlace('VCR REPAIR'); await new Promise(r=>setTimeout(r,5000)); return STORE.off['VCR REPAIR'].done===1; },async()=>{}],
  ['bath house','x-bath',async()=>{ const M=__dbg.MAPK, G=M.BOD.GD, r=G.r; STORE.goTo(M.BOD.X((r[0]+r[2])/2),M.BOD.Z((r[1]+r[3])/2),'up'); await new Promise(r=>setTimeout(r,7000)); return INTDBG().built.includes('bath'); },async()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); await new Promise(r=>setTimeout(r,3000)); }],
];
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const ctx=await b.newContext({viewport:{width:960,height:540}}); await ctx.addCookies([{name:'tsfm-pass',value:'dev:site-check',url:BASE}]);
  await ctx.addInitScript(()=>{ let s; Object.defineProperty(window,'__started',{configurable:true,get(){ return s; },set(v){ s=v; if(v&&!window.__t0)window.__t0=performance.now(); }}); });
  const pg=await ctx.newPage(); pg.setDefaultTimeout(900000); const errs=[], late=[], req=[]; let phase='start';
  pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ const t=m.text(); if(/not loaded before use/.test(t))late.push(t); else if(m.type()==='error')errs.push(t.slice(0,300)); });
  pg.on('request',r=>{ const u=new URL(r.url()); if(u.pathname.startsWith('/g/'))req.push({f:u.pathname.slice(3),phase}); });
  const start=async q=>{ const t0=Date.now(); await pg.goto(BASE+'/'+q,{waitUntil:'commit',timeout:600000}); let s=false; for(let i=0;i<1500&&!(s=await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await wait(200); return s&&Date.now()-t0; };
  const ms=await start('?fresh=1&hour=13&wx=CLEAR'); ok(!!ms,'THE MARKET starts ('+ms+' ms)');
  const gz=f=>{ const p=path.join('dist/g',f), d=fs.readFileSync(p); return p.endsWith('.bin')?d.length:zlib.gzipSync(d,{level:9}).length; };
  const st=await pg.evaluate(()=>performance.getEntriesByType('resource').filter(e=>e.startTime<window.__t0).map(e=>new URL(e.name).pathname).filter(p=>p.startsWith('/g/')).map(p=>p.slice(3)));
  ok(st.every(f=>fs.existsSync(path.join('dist/g',f))),'the start\'s files are all in dist/g');
  console.log('     first frame after '+Math.round(await pg.evaluate(()=>window.__t0))+' ms of the page; the start fetched '+st.length+' files, '+Math.round(st.reduce((a,f)=>a+gz(f),0)/1024)+' KB gzipped; code: '+st.filter(f=>/\.js$/.test(f)).map(f=>f+' '+Math.round(gz(f)/1024)+' KB').join(', '));
  ok(!st.some(f=>/^x-(?!later)/.test(f)),'no place\'s code at the start');
  phase='after'; await wait(8000);
  for(const [name,file,go,back] of TOUR){ phase=name; const e0=errs.length, l0=late.length;
    const r=await pg.evaluate(`(${go})()`).catch(e=>'ERR '+e.message);
    await pg.screenshot({path:path.join(OUT,'place-'+name.replace(/ /g,'-')+'.png')});
    ok(r===true,name+': built and shown'+(r===true?'':' ('+String(r).slice(0,200)+')'));
    ok(req.some(q=>q.f.startsWith(file+'.')),name+': its code fetched ('+file+')');
    ok(errs.length===e0&&late.length===l0,name+': no page errors, no slow fetch '+errs.slice(e0).concat(late.slice(l0)).join(' | '));
    await pg.evaluate(`(${back})()`).catch(e=>errs.push(name+' back: '+e.message)); await wait(1500); }
  await pg.evaluate(async()=>{ await DUNGEON.go(2); await new Promise(r=>setTimeout(r,6000)); }); await wait(3000);
  phase='saved'; const l1=late.length, e1=errs.length; await start('?hour=13&wx=CLEAR'); await wait(10000);
  const lv=await pg.evaluate(()=>Object.assign(DUNDBG(),{you:__dbg.you(),saved:(JSON.parse(localStorage.getItem('market-save')||'{}')||{}).where})).catch(e=>'ERR '+e.message);
  ok(lv&&lv.level===2&&lv.objs>0,'a saved spot in the dungeon loads its code at the start ('+JSON.stringify(lv).slice(0,400)+')');
  ok(errs.length===e1&&late.length===l1,'the saved start: no page errors, no slow fetch '+errs.slice(e1).concat(late.slice(l1)).join(' | '));
  ok(!late.length,'no slow fetch anywhere '+late.join(' | '));
  await b.close(); w.kill(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0);
})().catch(e=>{ console.log('FAIL '+e.message); process.exit(1); });

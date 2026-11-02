// THE PLACES' CODE (20 Oct 2026, the code split): runs the website's own worker (wrangler dev) on dist/, logs in, and checks that THE
// MARKET starts with only its start code, then goes into every place whose code is its own file (dungeon, park, fire escape,
// arcade, bath house), and back. Each must fetch its file, build, and never fall back to a slow fetch ("was not loaded before
// use"); a cabinet in the arcade must fetch its game's own file when played; then a login after the dungeon must start on the subway platform. Prints the start's download (gzipped).
// node tests/places.cjs [out dir]. Exits 1 if anything fails.
const {chromium}=require('playwright'), {spawn}=require('child_process'), fs=require('fs'), path=require('path'), zlib=require('zlib');
const OUT=process.argv[2]||'out', PORT=8797, BASE='http://127.0.0.1:'+PORT;
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c){ bad++; if(process.env.GITHUB_ACTIONS)console.log('::error title=places::'+String(m).replace(/\n/g,' ').slice(0,900)); } };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const TOUR=[
  ['dungeon','x-dungeon',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    await DUNGEON.go(3); return await U(()=>{ const d=DUNDBG(), m=DUNMOBDBG(); return d.level===3&&d.objs>0&&!!m.plan&&m.slimes.length===m.plan.sl; }); },async()=>{ await DUNGEON.go(0); }],
  ['park','x-park',async()=>{ const U=async(f,ms=300000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    const B=__dbg.MAPK.BOD, P=PARK; STORE.goTo(B.XS(P.round[0]+(P.ox||0)+3),B.ZS(P.round[1]+(P.oy||0)+3),'up'); return await U(()=>PARK.ready&&PARK.in&&(!FOUNT.on||!!FOUNT.drops)&&!(window.FADE&&FADE.busy)); },
    async()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); for(const t=Date.now();Date.now()-t<30000&&(PARK.in||(window.FADE&&FADE.busy));)await new Promise(r=>setTimeout(r,250)); }],
  ['fire escape','x-fire',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    FIREV.out(); return await U(()=>FIREDBG().built&&!(window.FADE&&FADE.busy)); },async()=>{ FIREV.back(); for(const t=Date.now();Date.now()-t<30000&&(window.FADE&&FADE.busy);)await new Promise(r=>setTimeout(r,250)); }],
  ['arcade','x-arcade',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    ROOMS.enter('arcade'); return await U(()=>ARCDBG().built&&!(window.FADE&&FADE.busy)); },async()=>{ ROOMS.exit('arcade'); for(const t=Date.now();Date.now()-t<30000&&(window.FADE&&FADE.busy);)await new Promise(r=>setTimeout(r,250)); }],
  ['arcade game','x-blocks',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    ROOMS.enter('arcade'); if(!await U(()=>ARCDBG().built&&!(window.FADE&&FADE.busy)))return 'the arcade did not build'; STORE.cabs.play('RAINBOW RUN'); return await U(()=>STORE.cabs.on&&STORE.cabs.dbg().loaded); },
    async()=>{ STORE.cabs.close(); ROOMS.exit('arcade'); for(const t=Date.now();Date.now()-t<30000&&(window.FADE&&FADE.busy);)await new Promise(r=>setTimeout(r,250)); }],
  ['petri','x-petri',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    ROOMS.enter('arcade'); if(!await U(()=>ARCDBG().built&&!(window.FADE&&FADE.busy)))return 'the arcade did not build'; STORE.cabs.play('PETRI'); return await U(()=>STORE.cabs.on&&STORE.cabs.dbg().loaded); },
    async()=>{ STORE.cabs.close(); ROOMS.exit('arcade'); for(const t=Date.now();Date.now()-t<30000&&(window.FADE&&FADE.busy);)await new Promise(r=>setTimeout(r,250)); }],
  ['torchbearer','x-torch',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    ROOMS.enter('arcade'); if(!await U(()=>ARCDBG().built&&!(window.FADE&&FADE.busy)))return 'the arcade did not build'; STORE.cabs.play('TORCHBEARER'); return await U(()=>STORE.cabs.on&&STORE.cabs.dbg().loaded); },
    async()=>{ STORE.cabs.close(); ROOMS.exit('arcade'); for(const t=Date.now();Date.now()-t<30000&&(window.FADE&&FADE.busy);)await new Promise(r=>setTimeout(r,250)); }],
  ['bath house','x-bath',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    const M=__dbg.MAPK, G=M.BOD.GD, r=G.r; STORE.goTo(M.BOD.X((r[0]+r[2])/2),M.BOD.Z((r[1]+r[3])/2),'up'); return await U(()=>INTDBG().built.includes('bath')); },
    async()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); for(const t=Date.now();Date.now()-t<30000&&(window.FADE&&FADE.busy);)await new Promise(r=>setTimeout(r,250)); }],
  ['gem cave','x-caverns',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    await GEMCAVE.go(1); return await U(()=>GEMCAVEDBG().built&&GEMCAVEDBG().inside&&!(window.FADE&&FADE.busy)); },async()=>{ await GEMCAVE.go(0); }],
  ['hudson cavern','x-caverns',async()=>{ const U=async(f,ms=90000)=>{ for(const t=Date.now();Date.now()-t<ms;await new Promise(r=>setTimeout(r,250)))if(f())return true; return false; };
    await HUDSON.go(1); return await U(()=>{ const d=HUDSONDBG(); return d.built&&d.inside&&d.swim&&!(window.FADE&&FADE.busy); }); },async()=>{ await HUDSON.go(0); }],
];
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const ctx=await b.newContext({viewport:{width:640,height:360}}); await ctx.addCookies([{name:'tsfm-pass',value:'dev:site-check',url:BASE}]);
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
  ok(!st.some(f=>/^x-/.test(f)),'no chunk at the start');
  console.log('     chunks: '+fs.readdirSync('dist/g').filter(f=>/^x-/.test(f)).map(f=>f.split('.')[0].slice(2)+' '+Math.round(gz(f)/1024)+' KB').join(', '));
  phase='after'; await wait(8000);
  for(const [name,file,go,back] of TOUR){ phase=name; await pg.evaluate(async()=>{ for(const t=Date.now();Date.now()-t<300000&&window.FADE&&FADE.busy;)await new Promise(r=>setTimeout(r,250)); }).catch(()=>{}); const e0=errs.length, l0=late.length;   // a slow place's fade must end before the next place starts
    const r=await pg.evaluate(`(${go})()`).catch(e=>'ERR '+e.message);
    await pg.screenshot({path:path.join(OUT,'place-'+name.replace(/ /g,'-')+'.png')});
    ok(r===true,name+': built and shown'+(r===true?'':' ('+String(r).slice(0,200)+')'));
    ok(req.some(q=>q.f.startsWith(file+'.')),name+': its code fetched ('+file+')');
    ok(errs.length===e0&&late.length===l0,name+': no page errors, no slow fetch '+errs.slice(e0).concat(late.slice(l0)).join(' | '));
    await pg.evaluate(`(${back})()`).catch(e=>errs.push(name+' back: '+e.message)); await wait(1500); }
  await pg.evaluate(async()=>{ await DUNGEON.go(2); for(const t=Date.now();Date.now()-t<60000&&!(DUNDBG().level===2&&DUNDBG().objs>0);)await new Promise(r=>setTimeout(r,250)); await new Promise(r=>setTimeout(r,2500)); }); await wait(1000);
  phase='login'; const l1=late.length, e1=errs.length; await start('?hour=13&wx=CLEAR'); await wait(3000);
  const lv=await pg.evaluate(()=>{ const p=__dbg.MAPK.MODS.station.plat, y=__dbg.you(); return {lvl:__dbg.lvl(),dist:Math.hypot(y.x-p.x,y.z-p.z),you:y}; }).catch(e=>'ERR '+e.message);
  ok(lv&&lv.lvl==='down'&&lv.dist<2,'a login after the dungeon starts on the subway platform, not the saved spot ('+JSON.stringify(lv).slice(0,400)+')');
  ok(errs.length===e1&&late.length===l1,'the login start: no page errors, no slow fetch '+errs.slice(e1).concat(late.slice(l1)).join(' | '));
  ok(!late.length,'no slow fetch anywhere '+late.join(' | '));
  await b.close(); w.kill(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0);
})().catch(e=>{ console.log('FAIL '+e.message); process.exit(1); });

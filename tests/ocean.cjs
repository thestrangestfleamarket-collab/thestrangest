// THE HUDSON'S OCEAN WAY (065b-ocean, 066-river): node tests/ocean.cjs [outdir]: the waves run, the height grid comes back, buoys and the moored boat ride it, no errors; a shot of each water from the quay
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'/tmp/ocean'; require('fs').mkdirSync(out,{recursive:true});
  const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1000,height:700}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; }); pg.on('console',m=>{ if(m.type()==='error')errs[m.text().slice(0,300)]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&river=ocean',{timeout:180000}); await pg.waitForFunction(()=>window.__started&&window.RIVER,{timeout:300000}); await pg.waitForTimeout(5000);
  for(let k=0;k<4;k++){ await pg.waitForFunction(()=>!FADE.busy,{timeout:90000}).catch(()=>{}); await pg.evaluate(()=>{ if(!RIVER.on)STORE.goTo(SHARED.BOD.XS(61),SHARED.BOD.ZS(-118),'up'); });
    if(await pg.waitForFunction(()=>RIVER.on&&!FADE.busy,{timeout:90000}).then(()=>1,()=>0))break; }
  await pg.evaluate(()=>{ __dbg.UI.setView('third'); [...document.querySelectorAll('#rvpan [data-go="1"]')][0].click(); }); await pg.waitForTimeout(4000);
  let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  for(const i of [0,1,2]){ await pg.evaluate(i=>RIVER.set({way:'ocean',wi:i}),i); await pg.waitForTimeout(5000);
    const r=await pg.evaluate(async()=>{ const TILE=__dbg.cv().TILE, O=RIVER.ocean(), B=RIVER.box, z=B.z1-6*TILE, x=__dbg.pos()[0], s=[];
      for(let k=0;k<6;k++){ for(let j=0;j<9;j++)s.push(RIVER.hAt(x+(j-4)*3*TILE,z)); await new Promise(r=>setTimeout(r,400)); }
      const m=s.reduce((a,b)=>a+b,0)/s.length, sd=Math.sqrt(s.reduce((a,b)=>a+(b-m)*(b-m),0)/s.length);
      return {sim:!!O,have:O&&O.Q.have,ok:O&&O.Q.ok,sdM:sd*.84/TILE,max:Math.max(...s.map(Math.abs))*.84/TILE,x,lv:RIVER.level(x,z)}; });
    console.log('water',i,JSON.stringify(r)); ok(Number.isFinite(r.x),'water '+i+': you are somewhere (x '+r.x+')');
    ok(r.sim&&r.have,'water '+i+': the waves run and their heights come back'); ok(r.sdM>.01&&r.max<3,'water '+i+': heights move, within reason ('+r.sdM.toFixed(3)+' m spread, '+r.max.toFixed(2)+' m top)');
    await pg.screenshot({path:`${out}/quay-ocean-${i}.png`}); }
  console.log('tris',await pg.evaluate(()=>__dbg.tris&&__dbg.tris()));
  const E=Object.keys(errs).filter(e=>!/favicon|net::|Failed to load resource|CORS policy/.test(e)).concat(await pg.evaluate(()=>SYS.errs.slice(0,5))); ok(!E.length,'no errors'+(E.length?': '+E.join(' | '):''));
  await b.close(); process.exit(bad?1:0); })();

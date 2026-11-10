// THE HEADLESS SIMULATION (owner, 17 Oct 2026, after his physician game's full_playthrough and verify_* scripts: the game played through by a
// script, its rules checked as it runs): node tests/simrun.cjs [minutes=3] [out.json] loads THE MARKET and plays it for that long with the clock
// at a day a minute: it goes to every place in the menu in turn (the street, the shop, the pool, the platform, the park, the castle, the
// dungeon, the stored rooms...), walks and runs from each (a double click ahead, Shift+W), opens the menu and the sound editor once, and holds
// each weather in turn. Every two seconds it checks the budget and the rules: the whole picture under 100,000 triangles; at most 8 lamps lit;
// no number gone NaN (his place, the camera, every character, the vitals, the clock, the weather); every character's health and stamina 0..1;
// the clock 0..24; the level matches the place (down on the platform and in the dungeon); at most three speaking; the save still readable;
// no page error; the longest freeze (a long-task observer) under 300 ms once running. Every twenty seconds the hitboxes' audit counts
// characters standing in a solid or in each other. Then forty seconds at the clock's fastest (a day in 2 s): the day wraps and the weather
// simulation runs over days without a NaN. Prints a table at the end and exits 1 on any failure (a pre-existing note is printed, not failed).
const {chromium}=require('playwright');
const MIN=+(process.argv[2]||3), OUT=process.argv[3], TRIS=+(process.env.SIM_TRIS||100000);   // (SIM_TRIS=n: a bar other than the budget's 100,000 while the count is being brought down)
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']}); const pg=await b.newPage({viewport:{width:960,height:640}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; });
  await pg.addInitScript(()=>{ window.__long=[]; try{ new PerformanceObserver(l=>{ for(const e of l.getEntries())window.__long.push([Math.round(e.startTime),Math.round(e.duration)]); }).observe({entryTypes:['longtask']}); }catch(e){} });
  const t0=Date.now(); await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=11&fresh=1',{waitUntil:'commit',timeout:180000});
  let up=false; for(let i=0;i<300&&!(up=await pg.evaluate(()=>!!window.__started&&!!window.__dbg).catch(()=>false));i++)await pg.waitForTimeout(1000);
  if(!up){ console.log('FAIL: the page never started',JSON.stringify(errs)); await b.close(); process.exit(1); }
  const loadS=((Date.now()-t0)/1000).toFixed(0); console.log('started in '+loadS+' s');
  const startedAt=await pg.evaluate(()=>performance.now()), GL=await pg.evaluate(()=>__dbg.gl()), SOFT=/swiftshader|llvmpipe|software/i.test(GL); console.log('renderer: '+GL+(SOFT?' (software: freezes reported, not failed)':''));
  await pg.evaluate(async()=>{ const c=__dbg.SFX.wake(); if(c&&c.state!=='running')await c.resume().catch(()=>{}); __dbg.CLOCK.run=true; __dbg.CLOCK.speed=1440/60; if(window.STORE&&STORE.ensure)STORE.ensure(); window.__long.length=0; });   /* (the stacked rooms built at once here: not the game's freeze) */
  const places=await pg.evaluate(()=>__dbg.UI.places().map(p=>p[0])); console.log('places: '+places.length);
  const WX=['CLEAR','CLOUDY','RAIN','STORM','SNOW','FOG',null];
  const fails=[], notes=[], S={longs:[],samples:0,maxTris:0,maxLights:0,minFps:1e9,maxLong:0,clipChars:0,audits:0,lines:0,sounds:0}, seen={};
  const sample=async(where)=>{ const r=await pg.evaluate(()=>{ const D=__dbg, fin=v=>Number.isFinite(v); const I=D.info(); const P=D.pos(); const out={tris:D.tris(),frameTris:I.triangles,calls:I.calls,lights:(window.LITE&&LITE.sel||[]).length,pos:P,finite:true,bad:[]};
      if(!P.every(fin)){ out.finite=false; out.bad.push('his place '+P); }
      const N=D.NPCS; out.npcs=N.length; let shown=0; for(const n of N){ if(!fin(n.st.x)||!fin(n.st.z)){ out.finite=false; out.bad.push('npc '+n.key); } if(!(n.hp>=0&&n.hp<=1&&n.sta>=0&&n.sta<=1))out.bad.push('vitals '+n.key+' '+n.hp+' '+n.sta); if(n.g.visible&&!n.far)shown++; } out.shown=shown;
      const V=D.VIT; if(!(V.hp>=0&&V.hp<=1&&V.sta>=0&&V.sta<=1))out.bad.push('your vitals '+V.hp+' '+V.sta);
      const h=D.CLOCK.h; if(!(h>=0&&h<24))out.bad.push('clock '+h); out.hour=+h.toFixed(2);
      const W=window.WX&&WX.now; if(W){ for(const k of ['cloud','rain','snow','storm','wind','fog'])if(!(W[k]>=0&&W[k]<=1.0001))out.bad.push('weather '+k+' '+W[k]); out.wx=[W.cloud,W.rain,W.wind].map(v=>+v.toFixed(2)); }
      out.lvl=D.lvl(); out.speaking=D.LINES.speaking(); out.lineLog=D.LINES.log.length; if(out.speaking>3)out.bad.push('speaking '+out.speaking);
      try{ const sv=JSON.parse(localStorage.getItem('market-save')); if(!sv||sv.v!==1)out.bad.push('save unreadable'); }catch(e){ out.bad.push('save '+e.message); }
      const fps=+((document.getElementById('stat').textContent.match(/^(\d+) fps/)||[])[1]||0); out.fps=fps; out.long=window.__long.splice(0); return out; });
    S.samples++; if(r.tris>S.maxTris){ S.maxTris=r.tris; S.trisAt=where; } S.maxFrame=Math.max(S.maxFrame||0,r.frameTris); S.maxLights=Math.max(S.maxLights,r.lights); if(r.fps)S.minFps=Math.min(S.minFps,r.fps); S.lines=r.lineLog;
    for(const [t,d] of r.long){ if(t>startedAt+3000){ S.longs.push([d,where]); if(d>S.maxLong){ S.maxLong=d; S.longAt=where; } } }
    if(r.tris>TRIS)fails.push(where+': '+r.tris+' triangles on screen (the bar is '+TRIS+(TRIS===100000?', the budget':'')+')'); if(r.lights>8)fails.push(where+': '+r.lights+' lamps lit (at most 8)');
    for(const m of r.bad)fails.push(where+': '+m); return r; };
  const audit=async(where)=>{ const a=await pg.evaluate(()=>{ const r=CLIP.audit(); window.__long.length=0;   /* (the audit's own time isn't the game's) */ return {chars:r.chars.map(c=>c.key+(c.solid?' in a solid':'')+(c.other?' in '+c.other:'')),things:r.things.length}; }); S.audits++; S.clipChars+=a.chars.length;
    for(const c of a.chars)fails.push(where+': character clipping: '+c); if(a.things)notes.push(a.things+' things without a solid in the audit (the Moon Shrine opened on purpose: pre-existing)'); };
  // ---- THE TOUR: each place, a walk and a run from it, the weather held in turn; the menu and the sound editor once
  const end=Date.now()+MIN*60000; let i=0, lastAudit=0;
  while(Date.now()<end){ const name=places[i%places.length], wx=WX[i%WX.length]; i++;
    await pg.evaluate(([n,w])=>{ __dbg.UI.goPlace(n); if(window.WX)WX.hold=w; },[name,wx]); await pg.waitForTimeout(900);
    const r0=await sample(name+' (arrived)'); const down=/PLATFORM|DUNGEON|SUBWAY/.test(name)&&!/SUBWAY STAIRS/.test(name);   /* (the stairs' menu spot is their top, on the street) */ if(down&&r0.lvl!=='down')fails.push(name+': level '+r0.lvl+', should be down'); if(!down&&r0.lvl!=='up'&&!/STAIRS/.test(name))notes.push(name+': level '+r0.lvl);
    seen[name]=(seen[name]||0)+1;
    await pg.mouse.dblclick(480+(i%3-1)*120,420); await pg.waitForTimeout(1500); await sample(name+' (walking)');
    await pg.keyboard.down('Shift'); await pg.keyboard.down('w'); await pg.waitForTimeout(1500); await sample(name+' (running)'); await pg.keyboard.up('w'); await pg.keyboard.up('Shift'); await pg.waitForTimeout(400);
    if(i===2){ await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); await pg.click('[data-t="display"]'); await pg.waitForTimeout(300); await sample(name+' (menu)'); await pg.keyboard.press('Escape'); await pg.evaluate(()=>{ __dbg.SNDED.open(); }); await pg.waitForTimeout(300); await sample(name+' (sound editor)'); await pg.evaluate(()=>__dbg.SNDED.close()); }
    if(i===3){ const th=await pg.evaluate(()=>{ const t=__dbg.UI.things.find(t=>t.npc&&t.obj.visible); if(!t)return null; t.act(); return __dbg.LINES.say(t.npc,'greet'); }); if(th)S.sounds++; }
    if(Date.now()-lastAudit>20000){ lastAudit=Date.now(); await audit(name); } }
  // ---- DAYS AT THE FASTEST: the clock wraps, the weather runs over days
  await pg.evaluate(()=>{ __dbg.UI.goPlace('THE STREET'); if(window.WX)WX.hold=null; __dbg.CLOCK.speed=1440/2; }); let hours=[]; for(let k=0;k<20;k++){ await pg.waitForTimeout(2000); const r=await sample('fast day '+k); hours.push(r.hour); }
  const wrapped=hours.some((h,k)=>k&&h<hours[k-1]); if(!wrapped)notes.push('the clock did not wrap in 40 s at a day in 2 s (hours '+hours.slice(0,6).join(' ')+')');
  const E=Object.keys(errs); for(const e of E)fails.push('page error x'+errs[e]+': '+e);
  if(S.maxLong>300)(SOFT?notes:fails).push('longest freeze while running '+S.maxLong+' ms at '+S.longAt+' (under 300 wanted); the worst: '+S.longs.sort((a,b)=>b[0]-a[0]).slice(0,5).map(l=>l[0]+' ms '+l[1]).join('; '));
  const rep={minutes:MIN,renderer:GL,loadS:+loadS,samples:S.samples,places:Object.keys(seen).length,maxTriangles:S.maxTris,maxLampsLit:S.maxLights,minFps:S.minFps===1e9?null:S.minFps,longestFreezeMs:S.maxLong,audits:S.audits,charactersClipping:S.clipChars,linesSaid:S.lines,fails,notes};
  console.log('\n'+[['minutes played',MIN],['places visited',rep.places+' of '+places.length],['samples',S.samples],['most triangles on screen',S.maxTris+(S.trisAt?' at '+S.trisAt:'')],['most drawn a frame (all passes)',S.maxFrame],['most lamps lit',S.maxLights],['lowest fps (software here)',rep.minFps],['longest freeze ms',S.maxLong+(S.longAt?' at '+S.longAt:'')],['hitbox audits',S.audits],['characters clipping',S.clipChars],['lines said',S.lines]].map(r=>r[0].padEnd(28)+r[1]).join('\n'));
  for(const n of [...new Set(notes)])console.log('note: '+n); for(const f of fails)console.log('FAIL: '+f);
  if(OUT)require('fs').writeFileSync(OUT,JSON.stringify(rep,null,1));
  await b.close(); console.log(fails.length?'FAILED '+fails.length:'ALL OK'); process.exit(fails.length?1:0); })();

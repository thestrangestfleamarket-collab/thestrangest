const {chromium}=require('playwright'); const fs=require('fs'), path=require('path'), zlib=require('zlib'), http=require('http');
const [MODE,OUT]=[process.argv[2],process.argv[3]||'out']; fs.mkdirSync(OUT,{recursive:true});
const D=process.env.DIST?path.resolve(process.env.DIST):path.resolve(__dirname,'../dist'), ARGS=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'];
const gz=b=>zlib.gzipSync(b,{level:9}).length, br=b=>zlib.brotliCompressSync(b).length;
const save=(n,o)=>{ fs.writeFileSync(path.join(OUT,n),JSON.stringify(o,null,1)); console.log(n,JSON.stringify(o).slice(0,3000)); };
const stats=pg=>pg.evaluate(()=>new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>{ const R=__dbg.renderer, I=R.info; let meshes=0, sceneTris=0;
  __dbg.scene.traverse(o=>{ if(o.isMesh&&o.geometry){ meshes++; const g=o.geometry, c=g.index?g.index.count:g.attributes.position?g.attributes.position.count:0; sceneTris+=c/3*(o.isInstancedMesh?o.count:1); } });
  let rl=null; try{ const r=RENDERLIST(); rl={keys:Object.keys(r),top:(r.rows||r.drawn||[]).slice(0,15).map(w=>[w.name,w.tris,w.calls,w.dist])}; }catch(e){ rl='ERR '+e.message; }
  res({frameTris:I.render.triangles,frameCalls:I.render.calls,programs:I.programs.length,geometries:I.memory.geometries,textures:I.memory.textures,meshes,sceneTris:Math.round(sceneTris),viewTris:__dbg.tris(),npcs:__dbg.NPCS.length,heapMB:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,rl}); }))));
(async()=>{
  if(MODE==='sizes'){ const rows=[]; const add=(f,n)=>{ const b=fs.readFileSync(f); rows.push({file:n,raw:b.length,gzip:gz(b),br:br(b)}); };
    add(path.join(D,'market.html'),'market.html'); for(const f of fs.readdirSync(path.join(D,'g')).sort())add(path.join(D,'g',f),'g/'+f);
    const SRC=path.resolve(D,'../src'); const src=fs.readdirSync(SRC).filter(f=>/^\d/.test(f)).map(f=>{ const b=fs.readFileSync(path.join(SRC,f)); return {file:f,raw:b.length,gzip:gz(b)}; }).sort((a,b)=>b.gzip-a.gzip);
    return save('sizes.json',{dist:rows,srcTop:src.slice(0,30),srcTotal:src.reduce((s,r)=>s+r.raw,0)}); }
  if(MODE==='web'){ const srv=http.createServer((q,r)=>{ const u=decodeURIComponent(q.url.split('?')[0]); const f=path.join(D,u); if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ r.writeHead(404); return r.end(); }
      const ty=f.endsWith('.js')?'text/javascript':f.endsWith('.json')?'application/json':f.endsWith('.html')?'text/html':f.endsWith('.wasm')?'application/wasm':'application/octet-stream'; r.writeHead(200,{'content-type':ty}); r.end(fs.readFileSync(f)); }).listen(8123);
    const out=[];
    for(let run=0;run<2;run++){ const b=await chromium.launch({args:ARGS}); const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); const errs=[], reqs=[]; let phase='start';
      pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
      pg.on('response',async r=>{ try{ const u=r.url(); if(!u.includes('/g/'))return; const body=await r.body(); reqs.push({u:u.replace(/.*\/g\//,''),raw:body.length,gzip:gz(body),phase}); }catch(e){} });
      await pg.goto('http://localhost:8123/g/market.html?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
      await pg.waitForFunction(()=>window.__started,null,{polling:100,timeout:900000});
      const t=await pg.evaluate(()=>new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>res({firstFrame:Math.round(performance.now()),warm:window.WARMMS})))));
      phase='after'; await pg.waitForTimeout(12000); const s=await stats(pg);
      if(!run)await pg.screenshot({path:path.join(OUT,'web-start.png')});
      out.push({...t,reqs,startBytes:reqs.filter(r=>r.phase==='start').reduce((a,r)=>a+r.raw,0),startGzip:reqs.filter(r=>r.phase==='start').reduce((a,r)=>a+r.gzip,0),stats:s,errs:errs.slice(0,20)}); await b.close(); }
    srv.close(); return save('web.json',out); }
  if(MODE==='prof'){ const off=JSON.parse(fs.readFileSync(path.join(D,'prof-offsets.json'))); const b=await chromium.launch({args:ARGS}); const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000);
    await pg.goto('file://'+D+'/market-prof.html?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'}); await pg.waitForFunction(()=>window.__started,null,{polling:100,timeout:900000});
    const M=await pg.evaluate(()=>window.__YPM), first=await pg.evaluate(()=>window.__YP0), fileOf=p=>{ let f=off[0][1]; for(const [o,n] of off){ if(o<=p)f=n; else break; } return f; }, per={}, pos=[];
    for(const k in M){ const f=+k<0?'(before)':fileOf(+k); per[f]=(per[f]||0)+M[k]; pos.push([+k,M[k]]); }
    const top=Object.entries(per).sort((a,b)=>b[1]-a[1]).slice(0,50).map(([f,ms])=>[f,Math.round(ms)]), hot=pos.sort((a,b)=>b[1]-a[1]).slice(0,40).map(([p,ms])=>[fileOf(p),p,Math.round(ms)]);
    await b.close(); return save('prof.json',{first:Math.round(first),total:Math.round(Object.values(per).reduce((a,b)=>a+b,0)),top,hot}); }
  if(MODE==='tour'){ const b=await chromium.launch({args:ARGS}); const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); const errs=[], rep={};
    pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
    await pg.goto('file://'+D+'/market.html?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
    await pg.waitForFunction(()=>window.__started,null,{polling:100,timeout:900000});
    rep.firstFrame=await pg.evaluate(()=>new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>res(Math.round(performance.now()))))));
    await pg.waitForTimeout(12000); rep.start=await stats(pg); rep.you=await pg.evaluate(()=>__dbg.you()); await pg.screenshot({path:path.join(OUT,'start.png')});
    await pg.keyboard.press('q'); await pg.waitForTimeout(3000); await pg.screenshot({path:path.join(OUT,'start-q.png')}); await pg.keyboard.press('e');
    await pg.keyboard.press('v'); await pg.waitForTimeout(3000); await pg.screenshot({path:path.join(OUT,'start-behind.png')}); await pg.keyboard.press('v'); await pg.keyboard.press('v'); await pg.waitForTimeout(1500);
    rep.gq=[]; for(let k=0;k<10;k++){ rep.gq.push(await pg.evaluate(()=>window.BODB&&BODB.GQ?BODB.GQ.length:null)); await pg.waitForTimeout(1500); } rep.dragons=await pg.evaluate(()=>window.DRAGONDBG?DRAGONDBG().length:null);
    const WANT=['THE STREET','THE BODEGA','THE CASTLE','THE BANK',"THE SQUIRREL'S TOWER",'CLUB STATIC','THE MOVIE THEATRE','THE PLAYHOUSE','THE BATH HOUSE','THE SUBWAY STAIRS','DUNGEON L1','CENTRAL PARK'], names=(await pg.evaluate(()=>__UI.places().map(p=>p[0]))).filter(n=>WANT.includes(n)); rep.places={};
    let i=0; for(const n of names){ const e0=errs.length; try{ const to=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]); await to(pg.evaluate(n=>__UI.goPlace(n),n),20000); await pg.waitForTimeout(6000); const s=await to(pg.evaluate(()=>({tris:__dbg.info().triangles,calls:__dbg.info().calls,you:__dbg.you()})),20000); rep.places[n]={...s,errs:errs.slice(e0)}; fs.writeFileSync(path.join(OUT,'tour.json'),JSON.stringify(rep,null,1)); await to(pg.screenshot({path:path.join(OUT,'p'+String(i++).padStart(2,'0')+'-'+n.replace(/[^A-Z0-9]+/gi,'_')+'.png')}),30000); }catch(e){ rep.places[n]='ERR '+e.message.slice(0,200); } }
    
    rep.errors=errs.slice(0,40); return save('tour.json',rep); }
})().catch(e=>{ console.error(e); process.exit(1); });

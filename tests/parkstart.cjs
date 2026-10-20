const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const [OUT,...PAGES]=process.argv.slice(2), rep=[];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  for(let r=0;r<2;r++)for(const P of PAGES){ const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
    await pg.addInitScript(()=>{ window.__t0=performance.now(); const t=setInterval(()=>{ if(window.__started){ window.__startedAt=performance.now(); clearInterval(t); } },10); });
    await pg.goto('file://'+path.resolve(P)+'?fresh=1&hour=13&wx=CLEAR&at=0,0',{waitUntil:'commit'}); for(let i=0;i<3600;i++){ await pg.waitForTimeout(100); if(await pg.evaluate(()=>!!window.__startedAt))break; }
    await pg.waitForTimeout(3000);
    const s=await pg.evaluate(()=>{ const D=__dbg, R=D.renderer; let tris=0, meshes=0; D.scene.traverse(o=>{ if(o.isMesh){ meshes++; const g=o.geometry; if(g&&g.attributes.position)tris+=Math.round((g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1)); } });
      return {ms:Math.round(window.__startedAt),tris,meshes,geos:R.info.memory.geometries,texs:R.info.memory.textures,progs:R.info.programs.length,lights:D.LITE.recs.length,heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null}; });
    rep.push({page:P,run:r,...s,errs}); console.log(JSON.stringify(rep[rep.length-1])); await pg.close(); }
  fs.writeFileSync(path.join(OUT,'start.json'),JSON.stringify(rep,null,1)); await b.close(); })();

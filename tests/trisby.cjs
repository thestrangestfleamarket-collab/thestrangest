// node tests/trisby.cjs <out> "PLACE|PLACE": what draws the triangles: at each menu place given, every visible mesh in the picture grouped by what it is
const {chromium}=require('playwright'); const S=process.argv[2], PL=(process.argv[3]||'THE STREET').split('|');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}});
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=11'); for(let i=0;i<200&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000); await pg.waitForTimeout(6000);
  for(const name of PL){ await pg.evaluate(n=>{ __dbg.UI.goPlace(n); },name); await pg.waitForTimeout(8000);
    const r=await pg.evaluate(()=>{ const sc=__scene, cam=__dbg.camera||null; const D=__dbg; const F=new D.THREE.Frustum(); let C=null; sc.traverse(o=>{ if(o.isCamera&&!C)C=o; });
      const out={}; let tot=0; const camO=D.camera||C; const M=new D.THREE.Matrix4().multiplyMatrices(camO.projectionMatrix,camO.matrixWorldInverse); F.setFromProjectionMatrix(M);
      const lab=o=>{ const P=[]; for(let q=o;q&&q!==sc;q=q.parent)P.push(q.name||q.userData&&q.userData.key||''); const key=(o.userData&&(o.userData.key||o.userData.kind))||o.name||P.find(x=>x)||'?'; const ck=o.material&&o.material.customProgramCacheKey?String(o.material.customProgramCacheKey()):''; return key+' ['+(ck.length<30?ck:'batch')+']'+(o.isSkinnedMesh?' skinned':'')+(o.isInstancedMesh?' inst':''); };
      sc.traverseVisible(o=>{ if(!o.isMesh&&!o.isPoints&&!o.isLine)return; if(o.frustumCulled&&!F.intersectsObject(o))return; const g=o.geometry; if(!g)return; const c=g.index?g.index.count:g.attributes.position?g.attributes.position.count:0, d=g.drawRange, k=Math.min(c,d.count===Infinity?c:d.count); const n=(o.isMesh?k/3:o.isPoints?k:k/2)*(o.isInstancedMesh?o.count:1); tot+=n; const L=lab(o); out[L]=(out[L]||0)+n; });
      return {tot:Math.round(tot),dbg:D.tris(),top:Object.entries(out).sort((a,b)=>b[1]-a[1]).slice(0,22).map(([k,v])=>[k,Math.round(v)])}; });
    console.log('== '+name+': '+r.tot+' (dbg '+r.dbg+')'); for(const [k,v] of r.top)console.log('   '+String(v).padStart(7)+'  '+k); }
  await b.close(); })();

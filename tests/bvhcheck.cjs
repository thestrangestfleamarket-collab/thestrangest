// THE RAYS CHECKED (18 Oct 2026, src/bvh.js): opens THE MARKET at a spot, waits for three-mesh-bvh and its trees, then casts a grid of rays from the
// camera through the screen both ways (the trees, three's own) and compares the first hit of each (the mesh, the face, the distance) and the time.
// Also a double click's pick (USE.test.pick) both ways. node tests/bvhcheck.cjs ["place=the bodega&hour=19"]
const {chromium}=require('playwright');
(async()=>{ const q=process.argv[2]||'hour=13';
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1280,height:720}}); pg.setDefaultTimeout(600000);
  pg.on('pageerror',e=>console.log('ERR',e.message.slice(0,200)));
  pg.on('console',m=>{ const t=m.text(); if(/BVH/.test(t))console.log('console:',t.slice(0,200)); });
  await pg.goto('file:///home/user/thestrangest/dist/market.html?npcwait=99&fresh=1&'+q,{waitUntil:'commit'});
  for(let i=0;i<300;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
  for(let i=0;i<120;i++){ await pg.waitForTimeout(2000); const s=await pg.evaluate(()=>window.__dbg.BVH.stats()); if(s.ready&&i>3){ const s2=await pg.evaluate(()=>window.__dbg.BVH.stats()); if(s2.built===s.built&&i>8)break; } }
  console.log(q,'| gaps:',JSON.stringify(await pg.evaluate(()=>{ const out=[], seen=new Set(); window.__dbg.scene.traverse(o=>{ const g=o.geometry; if(!g||!g.boundsTree||seen.has(g))return; seen.add(g); const n=g.index?g.index.count:g.attributes.position.count, d=g.drawRange, gr=g.groups.reduce((s,x)=>s+x.count,0); if(d.start>0||d.count<n||(g.groups.length&&gr<n))out.push([o.name||o.type,n,d.start,d.count===Infinity?'inf':d.count,g.groups.length,gr]); }); return out; })));
  console.log(q,'| stats:',JSON.stringify(await pg.evaluate(()=>window.__dbg.BVH.stats())));
  const r=await pg.evaluate(()=>{ const D=window.__dbg, T=D.THREE, B=D.BVH, cam=D.camO(), sc=D.scene, rc=new T.Raycaster();
    const shown=o=>{ for(let p=o;p;p=p.parent)if(!p.visible)return false; return true; };
    const cast=()=>{ const out=[]; for(let y=-0.9;y<=0.91;y+=0.15)for(let x=-0.9;x<=0.91;x+=0.15){ rc.setFromCamera(new T.Vector2(x,y),cam); const h=rc.intersectObjects(sc.children,true).find(h=>shown(h.object)); out.push(h?[h.object.uuid,h.faceIndex,+h.distance.toFixed(4)]:null); } return out; };
    const time=f=>{ const t=performance.now(); const v=f(); return [v,performance.now()-t]; };
    const [a,ta]=time(cast); B.ready=false; const [o,to]=time(cast); B.ready=true;
    let same=0, diff=[]; a.forEach((h,i)=>{ const g=o[i]; if(JSON.stringify(h)===JSON.stringify(g))same++; else if(h&&g&&h[0]===g[0]&&Math.abs(h[2]-g[2])<1e-3)same++; else diff.push([i,h,g]); });
    const kinds={}; sc.traverse(o=>{ if(!o.isMesh&&!o.isPoints&&!o.isLine&&!o.isSprite)return; if(!shown(o))return; const k=o.isSkinnedMesh?'skinned':o.isInstancedMesh?'instanced':o.isMesh?(o.geometry.boundsTree?'tree':'mesh'):'other'; const t=performance.now(); for(let y=-0.9;y<=0.91;y+=0.15)for(let x=-0.9;x<=0.91;x+=0.15){ rc.setFromCamera(new T.Vector2(x,y),cam); o.raycast(rc,[]); } const K=kinds[k]||(kinds[k]={n:0,ms:0}); K.n++; K.ms+=performance.now()-t; }); for(const k in kinds)kinds[k].ms=+kinds[k].ms.toFixed(1);
    const top=[]; for(const c of sc.children){ const t=performance.now(); for(let y=-0.9;y<=0.91;y+=0.15)for(let x=-0.9;x<=0.91;x+=0.15){ rc.setFromCamera(new T.Vector2(x,y),cam); rc.intersectObject(c,true); } let n=0,ty={}; c.traverse(o=>{ n++; ty[o.type]=(ty[o.type]||0)+1; }); top.push([c.name||c.type,n,JSON.stringify(ty).slice(0,80),+(performance.now()-t).toFixed(1)]); } top.sort((a,b)=>b[3]-a[3]); window.__top=top.slice(0,8);
    const slow=[]; sc.traverse(o=>{ if(!o.isMesh||!shown(o))return; const t=performance.now(); for(let y=-0.9;y<=0.91;y+=0.3)for(let x=-0.9;x<=0.91;x+=0.3){ rc.setFromCamera(new T.Vector2(x,y),cam); o.raycast(rc,[]); } slow.push([o.name||o.type,o.isInstancedMesh?o.count:0,o.geometry.attributes.position.count,+(performance.now()-t).toFixed(1)]); }); slow.sort((a,b)=>b[3]-a[3]);
    return {rays:a.length,same,diff:diff.slice(0,5),msBVH:+ta.toFixed(1),msOwn:+to.toFixed(1),kinds,slow:slow.slice(0,3),top:window.__top}; });
  console.log(q,'| rays:',JSON.stringify(r));
  await b.close(); })();

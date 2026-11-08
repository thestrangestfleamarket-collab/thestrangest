// WHAT FAR THINGS COST (owner, 8 Nov 2026: "i want to make sure arent rendering things are levels we dont need to from things far away"): node tests/fardetail.cjs [dist/market.html] [out folder].
// At a few spots (Market St, the park, the Hudson's pier, up high), every mesh in the view: its triangles drawn, how far it is and how big it looks on the screen; listed worst first by triangles
// per screen pixel for things more than 40 tiles off. With a limit (LIMIT=n triangles a pixel), fails when a far thing costs more than that.
const {chromium}=require('playwright'), path=require('path'), fs=require('fs');
const PAGE=path.resolve(process.argv[2]||'dist/market.html'), OUT=process.argv[3], LIMIT=+process.env.LIMIT||0;
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1280,height:720}}); let bad=0;
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(8000);
  const SPOTS0=[['MARKET ST','53,10',0,0],['THE PARK','120,72',0,0],['THE PIER','100,-150',Math.PI,0],['UP HIGH','110,-40',0,45]];
  const SPOTS=process.env.SPOTS?SPOTS0.filter(s=>process.env.SPOTS.split('|').includes(s[0])):SPOTS0; for(const [name,at,yaw,up] of SPOTS){
    await pg.evaluate(([at,yaw,up])=>{ const [x,y]=at.split(',').map(Number), B=__dbg.MAPK.BOD; __dbg.UI.setView('third'); if(__dbg.UI.goTo)__dbg.UI.goTo(x,y); window.__farT={x:(x-B.MX(0))/(B.MX(1)-B.MX(0)),z:(y-B.MY(0))/(B.MY(1)-B.MY(0)),up}; __dbg.cam(yaw,.18,null,null); },[at,yaw,up]);
    await pg.waitForTimeout(9000);
    const r=await pg.evaluate(DEEP=>{ const T=__dbg.THREE, cam=__dbg.camO(), R=__dbg.renderer, S=__dbg.scene, F=new T.Frustum(), M=new T.Matrix4(), TILE=1.13, focal=720/2/Math.tan((cam.fov||60)*Math.PI/360), out=[], sp=new T.Sphere();
      // (what the game hides only while it draws, hidden here too: the other levels, the characters it does not draw)
      const LH=window.LEVELS&&LEVELS.hide?LEVELS.hide():null; if(__dbg.NPCS.cull)__dbg.NPCS.cull(true);
      cam.updateMatrixWorld(); M.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); F.setFromProjectionMatrix(M);
      const name=o=>{ const n=[]; for(let q=o;q&&q!==S;q=q.parent)if(q.name)n.push(q.name); return (n.reverse().join('/')||o.type)+(o.material&&!Array.isArray(o.material)&&o.material.name?' ['+o.material.name+']':''); }, full=o=>{ const n=[]; for(let q=o;q&&q!==S;q=q.parent)n.push(q.name||q.type); return n.reverse().slice(0,4).join('/')+' <'+o.type+(o.material&&o.material.type?' '+o.material.type:'')+(o.userData&&Object.keys(o.userData).length?' ud:'+Object.keys(o.userData).slice(0,4).join(','):'')+'>'; };
      const visAll=o=>{ for(let q=o;q;q=q.parent)if(!q.visible)return false; return true; };
      S.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isLine)||!visAll(o)||!o.geometry)return; const g=o.geometry, ix=g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0), d=g.drawRange, per=Math.min(ix,d.count===Infinity?ix:d.count)/3;
        if(o.isInstancedMesh){ // each instance on its own: its place, its size
          const m=new T.Matrix4(), c=new T.Vector3(), s=new T.Vector3(), q=new T.Quaternion(); if(!g.boundingSphere)g.computeBoundingSphere(); const r0=g.boundingSphere.radius;
          for(let i=0;i<o.count;i++){ o.getMatrixAt(i,m); m.premultiply(o.matrixWorld); m.decompose(c,q,s); const r=r0*Math.max(s.x,s.y,s.z); if(r<1e-6)continue; sp.set(c,r); if(!F.intersectsSphere(sp))continue; const dist=Math.max(.01,c.distanceTo(cam.position)), px=Math.PI*(r*focal/dist)**2; out.push({n:name(o)+' (instanced)',full:full(o),t:per,d:dist/TILE,px}); } return; }
        if(o.isBatchedMesh){ if(!o.boundingSphere)o.computeBoundingSphere(); sp.copy(o.boundingSphere).applyMatrix4(o.matrixWorld); if(!F.intersectsSphere(sp))return; const dist=Math.max(.01,sp.center.distanceTo(cam.position)); out.push({n:name(o)+' (batched)',full:full(o),t:per,d:dist/TILE,px:Math.PI*(sp.radius*focal/dist)**2}); return; }
        if(!g.boundingSphere)g.computeBoundingSphere(); sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld); if(o.frustumCulled!==false&&!F.intersectsSphere(sp))return; const dist=Math.max(.01,sp.center.distanceTo(cam.position)-sp.radius*.5);
        out.push({n:name(o),full:full(o),t:per,d:dist/TILE,px:Math.PI*(sp.radius*focal/Math.max(dist,sp.radius))**2}); });
      if(__dbg.NPCS.cull)__dbg.NPCS.cull(false); if(LH)LEVELS.show(LH);
      // grouped by what it is, far (past 40 tiles) only
      const G={}; for(const e of out){ if(e.d<40)continue; const k=DEEP&&new RegExp(DEEP).test(e.n)?e.full:e.n.replace(/\d+/g,'#'); const q=G[k]||(G[k]={n:k,t:0,px:0,c:0,d:0}); q.t+=e.t; q.px+=Math.min(e.px,1280*720); q.c++; q.d+=e.d; }
      const L=Object.values(G).map(q=>({...q,d:q.d/q.c,k:q.t/Math.max(1,q.px)})).filter(q=>q.t>(DEEP?1500:2000)).sort((a,b)=>b.t-a.t);
      R.info.autoReset=false; R.info.reset(); return new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(()=>{ const tris=R.info.render.triangles; R.info.autoReset=true; res({tris,far:L.slice(0,DEEP?30:14),farTris:L.reduce((a,q)=>a+q.t,0)}); }))); },process.env.DEEP||'');
    console.log(`== ${name}: ${r.tris} triangles drawn; far (past 40 tiles) ${Math.round(r.farTris)}`);
    for(const q of r.far)console.log(`   ${String(Math.round(q.t)).padStart(8)} tris  ${String(q.c).padStart(4)}×  ~${Math.round(q.d)} tiles  ${q.k.toFixed(2)} tris/px  ${q.n}`);
    if(LIMIT)for(const q of r.far)if(q.k>LIMIT){ bad++; console.log('FAIL far thing costs '+q.k.toFixed(2)+' tris a pixel: '+q.n); }
    if(OUT)await pg.screenshot({path:OUT+'/far-'+name.replace(/\W+/g,'-').toLowerCase()+'.png'}); }
  console.log(bad?bad+' FAILED':'done'); await b.close(); process.exit(bad?1:0); })();
